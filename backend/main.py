"""Lugia Check-up — API backend.

V1-2 : exposition des modules `src/*` de V0 via une API REST FastAPI.
V1-3 : abstraction SQLAlchemy SQLite/Postgres.
V1-5a : auth par lien magique. Endpoints `/auth/*` et middleware sur les
        endpoints `/interviews/*`. Mode dev (RESEND_API_KEY non défini) :
        le lien magique est imprimé dans la console au lieu d'être envoyé.

Lancement local :
    cd lugia-checkup-demo
    source .venv/bin/activate
    pip install -r backend/requirements.txt
    uvicorn backend.main:app --reload --port 8000

Variables d'environnement utiles :
    DATABASE_URL          # postgres:// ... ou non défini = SQLite local
    RESEND_API_KEY        # clé API Resend (non défini = mode console)
    RESEND_FROM_EMAIL     # ex: "Lugia <[email protected]>"
    FRONTEND_URL          # ex: "https://diagnostic.lugia.fr" ou "http://localhost:3000"
"""

from __future__ import annotations

import os
import sys
from pathlib import Path
from typing import Any, Optional

# Permet à backend/main.py de trouver `src/` qui est à la racine du projet
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from fastapi import Depends, FastAPI, HTTPException, Request  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.security import (  # noqa: E402
    HTTPAuthorizationCredentials,
    HTTPBearer,
)
from pydantic import BaseModel  # noqa: E402

from src import db  # noqa: E402
from src import questions as question_module  # noqa: E402
from src import scoring  # noqa: E402
from src import templates  # noqa: E402
from src import workstreams  # noqa: E402

try:
    import resend  # type: ignore
    RESEND_AVAILABLE = True
except ImportError:
    resend = None  # type: ignore
    RESEND_AVAILABLE = False


app = FastAPI(
    title="Lugia Check-up API",
    description=(
        "API backend du démonstrateur Lugia Check-up. Réutilise les modules "
        "métier de V0 (`src/scoring`, `src/templates`, `src/workstreams`, "
        "`src/questions`, `src/db`). Auth par lien magique depuis V1-5a."
    ),
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer(auto_error=False)


# ---- Lifecycle ----

@app.on_event("startup")
async def startup() -> None:
    """Initialise la base + migrations au démarrage (idempotent)."""
    db.init_db()


# ---- Auth helpers ----

async def get_current_user_email(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> str:
    """Récupère l'email du user authentifié, ou lève 401."""
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    email = db.get_session_email(credentials.credentials)
    if not email:
        raise HTTPException(
            status_code=401, detail="Invalid or expired session"
        )
    return email


def _assert_user_owns_interview(email: str, interview_id: int) -> dict[str, Any]:
    """Vérifie qu'une interview existe et appartient à l'utilisateur (ou est
    anonyme legacy)."""
    interview = db.get_interview(interview_id)
    if interview is None:
        raise HTTPException(status_code=404, detail="Interview not found")
    if interview.get("email") and interview["email"] != email:
        raise HTTPException(status_code=403, detail="Access denied")
    return interview


ALLOWED_FRONTEND_ORIGINS = {
    "http://localhost:3000",
    "https://diagnostic.lugia.fr",
}


def _resolve_frontend_url(request: Optional[Request]) -> str:
    """Détermine l'URL frontend pour construire le lien magique.

    - Si l'Origin de la requête correspond à un domaine autorisé (localhost,
      prod, ou preview Vercel), utilise cette origine.
    - Sinon, fallback sur la variable d'environnement FRONTEND_URL
      (généralement la prod).

    Permet de tester depuis n'importe quelle origine sans modifier la
    configuration Render manuellement.
    """
    if request is not None:
        origin = (request.headers.get("origin") or "").rstrip("/")
        if origin:
            if origin in ALLOWED_FRONTEND_ORIGINS:
                return origin
            # Vercel preview deployments : <hash>-<user>.vercel.app
            if origin.endswith(".vercel.app") and origin.startswith("https://"):
                return origin
    return os.environ.get(
        "FRONTEND_URL", "http://localhost:3000"
    ).rstrip("/")


def _send_magic_link_email(
    to_email: str, token: str, frontend_url: str
) -> None:
    """Envoie un lien magique par email via Resend. Fallback : print console."""
    link = f"{frontend_url}/auth?token={token}"

    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    from_email = os.environ.get(
        "RESEND_FROM_EMAIL", "Lugia <[email protected]>"
    )

    if not api_key or not RESEND_AVAILABLE:
        print(
            f"\n[Lugia auth — mode dev console]\n"
            f"Email destinataire : {to_email}\n"
            f"Lien magique       : {link}\n"
            f"(Définir RESEND_API_KEY pour activer l'envoi réel.)\n"
        )
        return

    resend.api_key = api_key
    html_body = f"""
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
      <p style="font-size: 14px; font-weight: 500; margin: 0 0 4px 0;">Lugia</p>
      <p style="font-size: 12px; color: #888780; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 24px 0;">
        Le check-up préventif de votre cabinet
      </p>
      <p style="font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
        Voici votre lien d'accès au check-up Lugia. Il est valable {db.MAGIC_LINK_TTL_MINUTES} minutes.
      </p>
      <p style="margin: 24px 0;">
        <a href="{link}" style="display: inline-block; background: #1a1a1a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 500;">
          Accéder à mon check-up
        </a>
      </p>
      <p style="font-size: 13px; color: #888780;">
        Si vous n'avez pas demandé ce lien, vous pouvez ignorer cet email.
      </p>
    </div>
    """
    resend.Emails.send(
        {
            "from": from_email,
            "to": to_email,
            "subject": "Votre lien d'accès au check-up Lugia",
            "html": html_body,
        }
    )


# ---- Health checks ----

@app.get("/", tags=["health"])
async def root() -> dict[str, Any]:
    return {
        "service": "Lugia Check-up API",
        "version": app.version,
        "status": "ok",
    }


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "healthy"}


# ---- Auth ----

class RequestLinkBody(BaseModel):
    email: str


class VerifyTokenBody(BaseModel):
    token: str


class VerifyTokenResponse(BaseModel):
    session_token: str
    email: str


@app.post("/auth/request-link", tags=["auth"])
async def request_magic_link(
    body: RequestLinkBody, request: Request
) -> dict[str, bool]:
    """Génère un token, l'enregistre, envoie l'email (ou print console).

    L'URL du lien magique est dérivée de l'Origin de la requête si celle-ci
    figure dans la liste d'origines autorisées (localhost dev, prod, Vercel
    preview). Sinon fallback sur la variable d'env FRONTEND_URL.

    Retourne toujours `{"ok": true}` (par sécurité, on ne révèle pas si
    l'email existe ou non).
    """
    email = body.email.strip().lower()
    if "@" not in email or len(email) < 5:
        raise HTTPException(status_code=400, detail="Invalid email")
    token = db.create_auth_token(email)
    frontend_url = _resolve_frontend_url(request)
    _send_magic_link_email(email, token, frontend_url)
    return {"ok": True}


@app.post(
    "/auth/verify-token",
    response_model=VerifyTokenResponse,
    tags=["auth"],
)
async def verify_token(body: VerifyTokenBody) -> VerifyTokenResponse:
    """Vérifie un token de lien magique et crée une session."""
    email = db.verify_auth_token(body.token)
    if not email:
        raise HTTPException(
            status_code=400, detail="Invalid or expired token"
        )
    session_token = db.create_session(email)
    return VerifyTokenResponse(session_token=session_token, email=email)


@app.get("/auth/me", tags=["auth"])
async def auth_me(email: str = Depends(get_current_user_email)) -> dict[str, str]:
    """Retourne l'email du user authentifié."""
    return {"email": email}


@app.post("/auth/logout", tags=["auth"])
async def auth_logout(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> dict[str, bool]:
    """Révoque la session courante."""
    if credentials and credentials.credentials:
        db.revoke_session(credentials.credentials)
    return {"ok": True}


# ---- Effacement (V1-8 — RGPD article 17) ----

@app.delete("/me", tags=["auth"])
async def delete_me(
    email: str = Depends(get_current_user_email),
) -> dict[str, Any]:
    """Supprime toutes les données de l'utilisateur authentifié.

    Couvre interviews, answers, facet_scores, workstreams, auth_tokens et
    sessions (y compris la session courante). Réponse : `{ "ok": true,
    "deleted": { <table>: <count>, ... } }`.
    """
    counts = db.delete_user_data(email)
    return {"ok": True, "deleted": counts}


# ---- Protocole ----

@app.get("/protocol", tags=["protocol"])
async def get_protocol() -> dict[str, Any]:
    """Retourne le protocole complet du questionnaire. Public (pas d'auth)."""
    return question_module.load_protocol()


# ---- Gestion des interviews ----

class CreateInterviewResponse(BaseModel):
    interview_id: int


@app.post(
    "/interviews", response_model=CreateInterviewResponse, tags=["interview"]
)
async def create_interview(
    email: str = Depends(get_current_user_email),
) -> CreateInterviewResponse:
    """Crée une nouvelle interview rattachée au user authentifié."""
    iid = db.create_interview(email=email)
    return CreateInterviewResponse(interview_id=iid)


@app.get("/interviews/active", tags=["interview"])
async def get_active_interview(
    email: str = Depends(get_current_user_email),
) -> Optional[dict[str, Any]]:
    """Retourne l'interview in_progress la plus récente du user, ou null."""
    row = db.get_latest_in_progress_interview(email=email)
    return row


@app.get("/interviews/{interview_id}", tags=["interview"])
async def get_interview(
    interview_id: int,
    email: str = Depends(get_current_user_email),
) -> dict[str, Any]:
    """Retourne l'état d'une interview (si elle appartient au user)."""
    return _assert_user_owns_interview(email, interview_id)


class UpdateCursorBody(BaseModel):
    current_question_index: int


@app.patch("/interviews/{interview_id}/cursor", tags=["interview"])
async def update_cursor(
    interview_id: int,
    body: UpdateCursorBody,
    email: str = Depends(get_current_user_email),
) -> dict[str, bool]:
    _assert_user_owns_interview(email, interview_id)
    db.set_current_question_index(interview_id, body.current_question_index)
    return {"ok": True}


@app.post("/interviews/{interview_id}/complete", tags=["interview"])
async def complete_interview(
    interview_id: int,
    email: str = Depends(get_current_user_email),
) -> dict[str, bool]:
    _assert_user_owns_interview(email, interview_id)
    db.mark_interview_completed(interview_id)
    return {"ok": True}


# ---- Réponses ----

class SaveAnswerBody(BaseModel):
    mode: str
    selected_option: Optional[str] = None
    selected_option_label: Optional[str] = None
    free_text: Optional[str] = None
    complement_text: Optional[str] = None


@app.put("/interviews/{interview_id}/answers/{question_id}", tags=["answer"])
async def save_answer(
    interview_id: int,
    question_id: str,
    body: SaveAnswerBody,
    email: str = Depends(get_current_user_email),
) -> dict[str, bool]:
    _assert_user_owns_interview(email, interview_id)
    db.save_answer(
        interview_id=interview_id,
        question_id=question_id,
        mode=body.mode,
        selected_option=body.selected_option,
        selected_option_label=body.selected_option_label,
        free_text=body.free_text,
        complement_text=body.complement_text,
    )
    return {"ok": True}


@app.get("/interviews/{interview_id}/answers", tags=["answer"])
async def list_answers(
    interview_id: int,
    email: str = Depends(get_current_user_email),
) -> list[dict[str, Any]]:
    _assert_user_owns_interview(email, interview_id)
    return [dict(a) for a in db.get_answers(interview_id)]


# ---- Scores et rapport ----

@app.get("/interviews/{interview_id}/scores", tags=["report"])
async def get_scores(
    interview_id: int,
    email: str = Depends(get_current_user_email),
) -> dict[str, Any]:
    _assert_user_owns_interview(email, interview_id)
    return scoring.compute_all_facet_scores(interview_id)


@app.get("/interviews/{interview_id}/report", tags=["report"])
async def get_report(
    interview_id: int,
    email: str = Depends(get_current_user_email),
) -> dict[str, Any]:
    interview = _assert_user_owns_interview(email, interview_id)
    answers = db.get_answers(interview_id)
    facet_scores = scoring.compute_all_facet_scores(interview_id)
    facet_labels = question_module.get_facet_labels()

    synthesis = templates.build_synthesis(answers, interview_id)

    facets_payload: dict[str, Any] = {}
    for facet in question_module.get_scored_facets():
        score_data = facet_scores.get(facet)
        facets_payload[facet] = {
            "label": facet_labels.get(facet, facet),
            "score": score_data["score"] if score_data else None,
            "raw_mean": score_data["raw_mean"] if score_data else None,
            "summary": templates.build_facet_summary(facet, answers),
            "contributions": (
                score_data["contributions"] if score_data else []
            ),
        }

    chantiers = workstreams.build_workstreams(interview_id)
    next_step = templates.build_next_step_recommendation(facet_scores, answers)

    return {
        "interview": interview,
        "synthesis": synthesis,
        "facets": facets_payload,
        "workstreams": chantiers,
        "recommended_next_step": next_step,
    }
