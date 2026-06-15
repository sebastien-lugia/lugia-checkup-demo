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
    LEAD_NOTIFY_EMAIL     # destinataire des leads conseil (C.D), defaut [email protected]
"""

from __future__ import annotations

import json
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
from src import swot  # noqa: E402
from src import workstreams  # noqa: E402

# V2.0 — modules de scoring/personnalisation déterministes (cf D-029, D-030).
# Importés inconditionnellement : le dispatcher backend les active uniquement
# pour les interviews `protocol_version='v2.0'`. Aucun impact V1.1.9.
from src.v2 import modules as v2_modules  # noqa: E402
from src.v2 import report as v2_report  # noqa: E402
from src.v2 import scoring as v2_scoring  # noqa: E402

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


def _send_conseil_lead_email(
    medecin_email: str, message: str, context: dict[str, Any]
) -> None:
    """Notifie Sebastien d'une demande de conseil (C.D). Fallback : console.

    `reply_to` = email du medecin, pour que Sebastien reponde directement.
    """
    notify_to = os.environ.get("LEAD_NOTIFY_EMAIL", "[email protected]").strip()
    api_key = os.environ.get("RESEND_API_KEY", "").strip()
    from_email = os.environ.get("RESEND_FROM_EMAIL", "Lugia <[email protected]>")

    profile = context.get("profile") or {}
    module_label = context.get("module_label") or "—"
    prof_html = "".join(
        f"<li><strong>{k}</strong> : {v}</li>" for k, v in profile.items()
    ) or "<li>—</li>"

    if not api_key or not RESEND_AVAILABLE:
        print(
            f"\n[Lugia conseil-lead — mode dev console]\n"
            f"Medecin    : {medecin_email}\n"
            f"Chantier   : {module_label}\n"
            f"Profil     : {profile}\n"
            f"Message    :\n{message}\n"
            f"(Definir RESEND_API_KEY pour activer l'envoi reel vers {notify_to}.)\n"
        )
        return

    resend.api_key = api_key
    html_body = f"""
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
      <p style="font-size: 12px; color: #888780; text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 16px 0;">
        Lugia — Demande de conseil
      </p>
      <p style="font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
        <strong>{medecin_email}</strong> souhaite être recontacté.
      </p>
      <p style="font-size: 13px; color: #555; margin: 0 0 6px 0;">Chantier d'origine : <strong>{module_label}</strong></p>
      <ul style="font-size: 13px; color: #555; margin: 0 0 16px 0; padding-left: 18px;">{prof_html}</ul>
      <div style="background: #f6f4ef; border-left: 3px solid #1a1a1a; padding: 14px 16px; border-radius: 4px; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">{message}</div>
    </div>
    """
    resend.Emails.send(
        {
            "from": from_email,
            "to": notify_to,
            "reply_to": medecin_email,
            "subject": f"Demande de conseil — {medecin_email}",
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


# ---- Profil utilisateur (V1.1.7-a + V2.0-T3) ----

class UserProfileUpdate(BaseModel):
    """Patch partiel du profil utilisateur.

    V1.1.7-a : firstname.
    V2.0-T3 (cf spec V2 §3) : 10 champs additionnels du mini-onboarding V2
    (5 chips factuels étape 1 + 4 chips réflexifs étape 2 + free text
    logiciel_metier_other). Tous optionnels — un PATCH n'écrase que les
    champs explicitement fournis (cf db.upsert_user_profile_v2).
    """

    firstname: Optional[str] = None
    # Étape 1 — chips factuels (cabinet_type, volume, paramedical_team,
    # logiciel_metier, logiciel_metier_other, rdv_canal)
    cabinet_type: Optional[str] = None
    volume: Optional[str] = None
    paramedical_team: Optional[str] = None
    # V3-charte (2026-05-22) — gestion du secrétariat (page 1 profil)
    secretariat: Optional[str] = None
    logiciel_metier: Optional[str] = None
    logiciel_metier_other: Optional[str] = None
    rdv_canal: Optional[str] = None
    # Étape 2 — chips réflexifs (status, territoire, horizon, motivation)
    status: Optional[str] = None
    territoire: Optional[str] = None
    horizon: Optional[str] = None
    motivation: Optional[str] = None


@app.get("/me/profile", tags=["auth"])
async def get_my_profile(
    email: str = Depends(get_current_user_email),
) -> dict[str, Optional[str]]:
    """Retourne le profil du user authentifié (email + prénom + champs V2).

    V2.0-T3 : étendu aux 10 champs du mini-onboarding V2.0 (cf spec V2 §3).
    Les champs non saisis sont retournés à `null`. Les médecins qui n'ont
    jamais ouvert le parcours V2 ont tous les champs V2 à null — le rendu
    V1.1.9 ignore silencieusement ces champs.
    """
    profile = db.get_user_profile(email) or {}
    out: dict[str, Optional[str]] = {
        "email": email,
        "firstname": profile.get("firstname"),
    }
    for field in db.USER_PROFILE_V2_FIELDS:
        out[field] = profile.get(field)
    return out


def _normalize_text(v: Optional[str]) -> Optional[str]:
    """Trim + chaîne vide → None. Helper partagé par tous les patchs profil."""
    if v is None:
        return None
    cleaned = v.strip()
    return cleaned if cleaned else None


@app.patch("/me/profile", tags=["auth"])
async def patch_my_profile(
    body: UserProfileUpdate,
    email: str = Depends(get_current_user_email),
) -> dict[str, Optional[str]]:
    """Met à jour le profil du user authentifié — patch partiel.

    V1.1.7-a : champ `firstname` (sous-titre 'Dr Prénom — résultats du …').
    V2.0-T3 (cf spec V2 §3) : 10 champs additionnels du mini-onboarding
    V2.0. Sémantique patch — seuls les champs explicitement passés dans le
    body sont mis à jour ; les autres restent inchangés. Permet la saisie
    en 2 étapes (5 chips factuels puis 4 chips réflexifs) sans devoir
    renvoyer l'ensemble du profil à chaque étape.
    """
    body_dict = body.model_dump(exclude_unset=True)

    # V1.1.7-a : firstname séparé pour préserver la signature existante.
    if "firstname" in body_dict:
        firstname = _normalize_text(body_dict.pop("firstname"))
        db.upsert_user_profile(email, firstname)

    # V2.0-T3 : champs V2 — patch partiel via upsert_user_profile_v2.
    v2_patch = {
        k: _normalize_text(v)
        for k, v in body_dict.items()
        if k in db.USER_PROFILE_V2_FIELDS
    }
    if v2_patch:
        db.upsert_user_profile_v2(email, v2_patch)

    # Réponse : profil complet relu après écriture, pour que le frontend
    # voie l'état consolidé (utile pour la transition étape 1 → étape 2).
    refreshed = db.get_user_profile(email) or {}
    out: dict[str, Optional[str]] = {
        "email": email,
        "firstname": refreshed.get("firstname"),
    }
    for field in db.USER_PROFILE_V2_FIELDS:
        out[field] = refreshed.get(field)
    return out


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

# V2.0-T3 — chemin du protocole V2.0 (chargé à la demande, mis en cache
# par processus pour éviter de relire le fichier à chaque requête).
_V2_PROTOCOL_PATH = ROOT / "resources" / "interview_protocol_v2.json"
_V2_PROTOCOL_CACHE: Optional[dict[str, Any]] = None


def _load_v2_protocol() -> dict[str, Any]:
    """Charge le protocole V2.0 depuis le JSON (singleton par processus)."""
    global _V2_PROTOCOL_CACHE
    if _V2_PROTOCOL_CACHE is None:
        with open(_V2_PROTOCOL_PATH, encoding="utf-8") as f:
            _V2_PROTOCOL_CACHE = json.load(f)
    return _V2_PROTOCOL_CACHE


@app.get("/protocol", tags=["protocol"])
async def get_protocol(version: Optional[str] = None) -> dict[str, Any]:
    """Retourne le protocole du questionnaire selon la version demandée.

    - `version=v2.0` (ou `v2`) → protocole V2.0 (cf
      `resources/interview_protocol_v2.json`).
    - `version=v1.1.9` ou non précisé → protocole V1.x existant (legacy,
      `resources/interview_protocol.json`).

    Public — pas d'auth requise.
    """
    if version is not None and version in ("v2.0", "v2", "2.0", "2"):
        return _load_v2_protocol()
    return question_module.load_protocol()


# ---- Modules d'approfondissement V2.0 ----

@app.get("/modules", tags=["modules"])
async def list_modules_v2() -> dict[str, Any]:
    """Retourne la liste complète des 7 modules d'approfondissement V2.0
    (cf `resources/modules_v2.json` + D-029). Public — pas d'auth requise.

    V2.0-T4g.
    """
    return v2_modules.load_modules()


@app.get("/modules/{module_id}", tags=["modules"])
async def get_module_v2(module_id: str) -> dict[str, Any]:
    """Retourne le détail d'un module V2.0 par id. Public — pas d'auth
    requise. 404 si l'id n'existe pas.

    IDs valides : urgences, chroniques, delegation, comm, logiciel, admin,
    pilotage.

    V2.0-T4g.
    """
    mod = v2_modules.get_module(module_id)
    if mod is None:
        raise HTTPException(status_code=404, detail=f"Module '{module_id}' inconnu")
    return mod


# ---- Gestion des interviews ----

class CreateInterviewRequest(BaseModel):
    """Body optionnel de POST /interviews.

    V2.0-T3 : `protocol_version` permet de créer une interview V2.0 (cf
    spec V2 §11.4 et D-029). Valeurs supportées : `v1.1.9` (défaut) et
    `v2.0`. Toute autre valeur est rejetée en 400 — on ne crée pas
    silencieusement de version inconnue.
    """

    protocol_version: Optional[str] = None


class CreateInterviewResponse(BaseModel):
    interview_id: int
    protocol_version: str


_SUPPORTED_PROTOCOL_VERSIONS = ("v1.1.9", "v2.0", "v3-brand-0")


@app.post(
    "/interviews", response_model=CreateInterviewResponse, tags=["interview"]
)
async def create_interview(
    body: Optional[CreateInterviewRequest] = None,
    email: str = Depends(get_current_user_email),
) -> CreateInterviewResponse:
    """Crée une nouvelle interview rattachée au user authentifié.

    V2.0-T3 : le body peut spécifier `protocol_version` pour démarrer un
    parcours V2.0. Sans body ou `protocol_version=null`, on conserve le
    comportement V1.x (création en v1.1.9).
    """
    requested = (body.protocol_version if body else None) or "v1.1.9"
    if requested not in _SUPPORTED_PROTOCOL_VERSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported protocol_version '{requested}'. "
                f"Supported: {list(_SUPPORTED_PROTOCOL_VERSIONS)}."
            ),
        )
    iid = db.create_interview(email=email, protocol_version=requested)
    return CreateInterviewResponse(
        interview_id=iid, protocol_version=requested
    )


@app.get("/interviews/actives", tags=["interview"])
async def list_active_interviews(
    email: str = Depends(get_current_user_email),
) -> dict[str, Any]:
    """Retourne les interviews in_progress du user indexées par
    `protocol_version`.

    V2.0-T5-fix : permet à la page d'accueil d'afficher séparément la
    session V1.1.9 et la session V2.0 en cours. Si une version n'a pas
    de session active, sa clé est absente du dict.

    Exemple de réponse :
    ```
    {
        "v1.1.9": { "id": 42, "created_at": "...", "current_question_index": 5, ... },
        "v2.0":   { "id": 47, "created_at": "...", ... }
    }
    ```
    """
    return db.get_in_progress_interviews_by_version(email=email)


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

def _latest_mermaid_graph(interview_id: int, module_id: str, email: str):
    """Dernier graphe WSF enrichi persiste pour ce chantier (C.B), ou None.

    Le graphe enrichi produit par le chat (synthese) est stocke dans le suffixe
    __LUGIA_META__ des messages assistant. On renvoie le plus recent qui
    contient un graphe valide (nodes + edges non vides) ; sinon None, et le PDF
    retombe sur le graphe statique du chantier.
    """
    import json as _json2
    try:
        msgs = db.list_chat_messages(interview_id, module_id, email)
    except Exception:
        return None
    for m in reversed(msgs):
        if m.get("role") != "assistant":
            continue
        content = m.get("content") or ""
        idx = content.rfind("\n\n__LUGIA_META__:")
        if idx < 0:
            continue
        try:
            meta = _json2.loads(content[idx + len("\n\n__LUGIA_META__:"):])
        except Exception:
            continue
        g = meta.get("mermaid_graph")
        if (
            isinstance(g, dict)
            and isinstance(g.get("nodes"), list)
            and isinstance(g.get("edges"), list)
            and g.get("nodes")
        ):
            return g
    return None


@app.get("/interviews/{interview_id}/modules/{module_id}/pdf", tags=["interview"])
async def export_module_pdf(
    interview_id: int,
    module_id: str,
    email: str = Depends(get_current_user_email),
):
    """Génère et renvoie le PDF d'un chantier (H.4, 2026-05-22).

    Le PDF reprend la structure de la page chantier frontend :
    titre, mécanique, comparatif Autonomie vs Lugia, 4 étapes,
    encart Avec Lugia, données terrain. Les gains € sont
    personnalisés selon le volume cabinet du profil utilisateur.
    """
    from fastapi.responses import Response
    from src.pdf_exporter import build_chantier_pdf

    _assert_user_owns_interview(email, interview_id)
    user_profile = db.get_user_profile(email) or {}
    # C.B : schema enrichi du chat si dispo, sinon graphe statique (dans le build).
    enriched_graphe = _latest_mermaid_graph(interview_id, module_id, email)
    try:
        pdf_bytes = build_chantier_pdf(
            module_id, profile=user_profile, graphe=enriched_graphe
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    filename = f"chantier-{module_id}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@app.get("/interviews/{interview_id}/modules/{module_id}/parcours-pdf", tags=["interview"])
async def export_parcours_pdf(
    interview_id: int,
    module_id: str,
    email: str = Depends(get_current_user_email),
):
    """PDF d'un parcours modélisé : les 3 représentations (pivot D-056, C.E).

    Le graphe vient du substrat persisté à la fin du dialogue de modélisation
    (hook de fin de conversation, upsert_substrat).
    """
    from fastapi.responses import Response
    from src.pdf_exporter import build_parcours_pdf, _MODULES_FALLBACK
    import json as _json

    _assert_user_owns_interview(email, interview_id)
    sub = db.get_substrat(interview_id, module_id, email)
    if not sub or not sub.get("graphe_json"):
        raise HTTPException(status_code=404, detail="Aucun parcours modélisé pour ce module.")
    try:
        graphe = _json.loads(sub["graphe_json"])
    except Exception:
        raise HTTPException(status_code=422, detail="Parcours illisible.")
    mod = _MODULES_FALLBACK.get(module_id) or {}
    titre = mod.get("label") or graphe.get("titre")
    pdf_bytes = build_parcours_pdf(graphe, titre)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="parcours-{module_id}.pdf"'},
    )

# ---- Réponses ----

class SaveAnswerBody(BaseModel):
    mode: str
    selected_option: Optional[str] = None
    selected_option_label: Optional[str] = None
    free_text: Optional[str] = None
    complement_text: Optional[str] = None
    # V1.1.5-i : prénom de l'entité associée (secrétaire, assistant, associé...)
    # Optionnel. Déclenché côté frontend par les options portant
    # has_entity_field=true dans interview_protocol.json.
    entity_name: Optional[str] = None
    # V2.0-T4a : marque les réponses non scorées (typiquement l'ancrage
    # énergie). Par défaut True pour préserver le comportement V1.x.
    scored: bool = True




class ConseilLeadBody(BaseModel):
    """C.D — demande de mise en relation conseil depuis la demo."""

    message: str
    module_id: Optional[str] = None


@app.post("/interviews/{interview_id}/conseil-lead", tags=["interview"])
async def submit_conseil_lead(
    interview_id: int,
    body: ConseilLeadBody,
    email: str = Depends(get_current_user_email),
):
    """Le medecin repond a une offre de conseil sans passer par Calendly (C.D).

    On stocke le lead en base AVANT d'envoyer l'email (aucune demande perdue si
    Resend echoue), puis on notifie Sebastien. Le contexte (profil + chantier)
    qualifie la demande.
    """
    _assert_user_owns_interview(email, interview_id)
    msg = (body.message or "").strip()
    if not msg:
        raise HTTPException(status_code=400, detail="Message vide")
    if len(msg) > 2000:
        raise HTTPException(status_code=400, detail="Message trop long (max 2000 caractères)")

    profile = db.get_user_profile(email) or {}
    module_label: Optional[str] = None
    if body.module_id:
        from src.pdf_exporter import _MODULES_FALLBACK

        _m = _MODULES_FALLBACK.get(body.module_id)
        module_label = _m["label"] if _m else body.module_id

    import json as _json

    context: dict[str, Any] = {
        "profile": profile,
        "module_id": body.module_id,
        "module_label": module_label,
    }
    lead_id = db.add_lead(
        email=email,
        message=msg,
        interview_id=interview_id,
        module_id=body.module_id,
        context_json=_json.dumps(context, ensure_ascii=False),
    )
    try:
        _send_conseil_lead_email(email, msg, context)
    except Exception as e:  # le lead est deja stocke : on ne casse pas la requete
        print(f"[conseil-lead] envoi email KO (lead {lead_id} stocke) : {e}")
    return {"ok": True, "lead_id": lead_id}


# ─── A.2 — Chat assistant Lugia sur chantier ──────────────────────────────


class ChatHistoryItem(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatMessageBody(BaseModel):
    """Requête : message user + historique reconstruit côté frontend.

    `provider` (optionnel) permet au frontend de basculer entre Claude Haiku
    (cloud) et un SLM local (Ollama, qwen2.5:3b par défaut). Si omis ou
    invalide, on retombe sur "anthropic" comme aujourd'hui.
    """
    message: str
    provider: Optional[str] = None  # "anthropic" | "ollama"


class ChatMessageResponse(BaseModel):
    """Réponse parsée du chat assistant (V2 — 4 phases avec suggestions/plan/end + Mermaid WSF tour 4)."""
    text: str                                     # message principal nettoyé
    suggestions: Optional[list[str]] = None       # 3 réponses rapides cliquables
    plan: Optional[list[dict[str, Any]]] = None   # étapes du plan d'action
    ended: bool = False                           # True si END_CONVERSATION détecté
    user_message_count: int
    max_user_messages: int
    remaining: int
    provider: Optional[str] = None                # "anthropic" | "ollama" | "webllm" (D-040)
    mermaid_graph: Optional[dict[str, Any]] = None  # graphe WSF du chantier (tour 4, C.A)


@app.get("/interviews/{interview_id}/modules/{module_id}/chat", tags=["chat"])
async def get_chat_history(
    interview_id: int,
    module_id: str,
    email: str = Depends(get_current_user_email),
) -> dict[str, Any]:
    """Retourne l'historique parsé pour ce chantier (avec suggestions/plan/ended)."""
    _assert_user_owns_interview(email, interview_id)
    messages_raw = db.list_chat_messages(interview_id, module_id, email)
    user_count = sum(1 for m in messages_raw if m["role"] == "user")
    from src.chat_assistant import MAX_USER_MESSAGES
    import json as _json

    enriched: list[dict[str, Any]] = []
    for m in messages_raw:
        if m["role"] == "user":
            enriched.append({
                "role": "user",
                "text": m["content"],
                "created_at": m.get("created_at"),
                "provider": None,
            })
        else:
            # Re-parse the persisted content : "text\n\n__LUGIA_META__:{json}"
            content = m["content"]
            meta_idx = content.rfind("\n\n__LUGIA_META__:")
            if meta_idx > 0:
                text = content[:meta_idx]
                try:
                    meta = _json.loads(content[meta_idx + len("\n\n__LUGIA_META__:"):])
                except Exception:
                    meta = {"suggestions": None, "plan": None, "ended": False}
            else:
                text = content
                meta = {"suggestions": None, "plan": None, "ended": False}
            enriched.append({
                "role": "assistant",
                "text": text,
                "suggestions": meta.get("suggestions"),
                "plan": meta.get("plan"),
                "ended": meta.get("ended", False),
                "created_at": m.get("created_at"),
                "provider": m.get("provider"),
                "mermaid_graph": meta.get("mermaid_graph"),
            })
    return {
        "messages": enriched,
        "user_message_count": user_count,
        "max_user_messages": MAX_USER_MESSAGES,
        "remaining": max(0, MAX_USER_MESSAGES - user_count),
    }


@app.post("/interviews/{interview_id}/modules/{module_id}/chat", tags=["chat"])
async def post_chat_message(
    interview_id: int,
    module_id: str,
    body: ChatMessageBody,
    email: str = Depends(get_current_user_email),
) -> ChatMessageResponse:
    """Envoie un message user, appelle Claude Haiku, persiste + renvoie la réponse.

    Limites produit V1 :
     - 1 conversation par chantier (groupée par (interview, module, email))
     - 10 messages user max par conversation
     - modèle Claude Haiku, max_tokens=800
    """
    from src.chat_assistant import (
        send_message,
        MAX_USER_MESSAGES,
        LLMProviderUnavailable,
        ALLOWED_PROVIDERS,
        PROVIDER_ANTHROPIC,
    )
    from src.pdf_exporter import _MODULES_FALLBACK

    _assert_user_owns_interview(email, interview_id)

    # Validation : module existe
    module = _MODULES_FALLBACK.get(module_id)
    if module is None:
        raise HTTPException(status_code=404, detail=f"Module inconnu : {module_id}")

    # Validation : message non vide
    user_message = (body.message or "").strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="Message vide")
    if len(user_message) > 2000:
        raise HTTPException(status_code=400, detail="Message trop long (max 2000 caractères)")

    # Limite produit : 20 messages user max
    current_count = db.count_user_messages(interview_id, module_id, email)
    if current_count >= MAX_USER_MESSAGES:
        raise HTTPException(
            status_code=429,
            detail=f"Limite de {MAX_USER_MESSAGES} questions par conversation atteinte. Pour aller plus loin, contactez Sébastien via Calendly.",
        )

    # Récupère l'historique pour le prompt
    history_raw = db.list_chat_messages(interview_id, module_id, email)

    # Bug fix 2026-05-23 : le content BDD des messages assistant contient
    # un suffixe interne `\n\n__LUGIA_META__:{...}` qui sert au re-parsing
    # à l'affichage (suggestions / plan / ended). Si on le repasse tel quel
    # au LLM dans l'historique, les petits modèles (qwen2.5:3b notamment)
    # miment ce pattern et l'incluent dans leurs propres réponses → le
    # marqueur apparaît brut côté UI. On le strippe avant de construire
    # `history` — le LLM ne voit que le texte propre du précédent tour.
    def _strip_meta(content: str) -> str:
        idx = content.rfind("\n\n__LUGIA_META__:")
        return content[:idx] if idx > 0 else content

    history = [
        {"role": m["role"], "content": _strip_meta(m["content"])}
        for m in history_raw
    ]

    # Profil + scores (best effort)
    user_profile = db.get_user_profile(email) or {}
    scores = None
    try:
        answers = db.get_answers(interview_id)
        from src.v2 import scoring as v2_scoring
        scores = v2_scoring.compute_all_scores(answers, user_profile, "v3-brand-0")
    except Exception:
        # eslint-disable-next-line — scoring KO ne doit pas bloquer le chat
        scores = None

    # Persiste le message user AVANT l'appel Claude (auditabilité)
    db.add_chat_message(interview_id, module_id, email, "user", user_message)

    # Résolution du provider — si frontend envoie une valeur inconnue,
    # on retombe silencieusement sur Anthropic plutôt que d'échouer.
    provider = (body.provider or PROVIDER_ANTHROPIC).lower()
    if provider not in ALLOWED_PROVIDERS:
        provider = PROVIDER_ANTHROPIC

    # turn_number = numero du tour assistant courant.
    # current_count = nb de messages user deja persistes AVANT celui-ci.
    # On vient d'ajouter le user message en BDD (ligne au-dessus), donc le
    # prochain assistant message est le tour (current_count + 1).
    turn_number = current_count + 1

    # Appel du LLM (renvoie un dict parsé : text/suggestions/plan/ended)
    try:
        parsed = send_message(
            user_message=user_message,
            history=history,
            module=module,
            profile=user_profile,
            scores=scores,
            provider=provider,
            turn_number=turn_number,
        )
    except LLMProviderUnavailable as exc:
        # Provider down (Ollama non démarré, clé API manquante…) → 503
        # explicite pour que le frontend puisse proposer de basculer
        # sur l'autre provider.
        import logging
        logging.warning("LLM provider %s indisponible : %s", provider, exc)
        raise HTTPException(
            status_code=503,
            detail=str(exc),
        )
    except Exception:
        import logging
        logging.exception("Erreur lors de l'appel LLM (provider=%s)", provider)
        raise HTTPException(
            status_code=502,
            detail="L'assistant Lugia est indisponible pour le moment. Réessayez dans un instant.",
        )

    # ── Garde-fou structure de conversation (2026-06-09) ──
    # Les petits modèles (SLM) clôturent souvent (END + plan + schéma) bien avant
    # le 10e tour. On impose un déroulé en 10 échanges max : on n'honore une
    # clôture que (a) au 10e tour, ou (b) si le médecin l'a explicitement demandée.
    _conclure_kw = ("synthèse", "synthese", "conclu", "le plan", "fais-moi le plan",
                    "termine", "récap", "recap", "bilan", "resume", "résume")
    _asked_conclure = any(k in (user_message or "").lower() for k in _conclure_kw)
    _is_final_turn = turn_number >= MAX_USER_MESSAGES
    if parsed.get("ended") and not _is_final_turn and not _asked_conclure:
        # clôture prématurée → on poursuit l'exploration, on jette les artefacts de synthèse
        parsed["ended"] = False
        parsed["plan"] = None
        parsed["mermaid_graph"] = None
    elif _is_final_turn and not parsed.get("ended"):
        # au 10e tour on ferme quoi qu'il arrive (le SLM oublie parfois END_CONVERSATION)
        parsed["ended"] = True

    # Persiste la réponse assistant — on stocke le TEXTE NETTOYÉ + un suffixe
    # JSON pour préserver suggestions/plan/ended dans l'historique. Le frontend
    # re-parsera à l'affichage.
    text_clean = parsed.get("text") or ""
    meta_payload = {
        "suggestions": parsed.get("suggestions"),
        "plan": parsed.get("plan"),
        "ended": parsed.get("ended", False),
        "mermaid_graph": parsed.get("mermaid_graph"),
    }
    import json as _json
    persisted_content = text_clean + "\n\n__LUGIA_META__:" + _json.dumps(meta_payload, ensure_ascii=False)
    db.add_chat_message(
        interview_id, module_id, email, "assistant", persisted_content,
        provider=provider,
    )

    # Hook fin de conversation : dérive le substrat (capability map + carte vivante)
    # depuis le graphe WSF émis par l'agent, et le persiste. Non bloquant.
    if meta_payload.get("ended") and meta_payload.get("mermaid_graph"):
        try:
            from src import placement
            _graphe = meta_payload["mermaid_graph"]
            db.upsert_substrat(
                interview_id, module_id, email,
                graphe_json=_json.dumps(_graphe, ensure_ascii=False),
                derive_json=_json.dumps(placement.derive(_graphe), ensure_ascii=False),
                source="chat-mermaid",
            )
        except Exception:
            import logging
            logging.exception("Substrat non dérivé (interview=%s module=%s)", interview_id, module_id)

    new_count = current_count + 1
    return ChatMessageResponse(
        text=text_clean,
        suggestions=parsed.get("suggestions"),
        plan=parsed.get("plan"),
        ended=parsed.get("ended", False),
        user_message_count=new_count,
        max_user_messages=MAX_USER_MESSAGES,
        provider=provider,
        mermaid_graph=parsed.get("mermaid_graph"),
        remaining=max(0, MAX_USER_MESSAGES - new_count),
    )


@app.delete("/interviews/{interview_id}/modules/{module_id}/chat", tags=["chat"])
async def delete_chat_conversation(
    interview_id: int,
    module_id: str,
    email: str = Depends(get_current_user_email),
) -> dict[str, int]:
    """Supprime tous les messages d'une conversation chantier.

    Utilisé par le bouton « Recommencer » de la modale chat (frontend).
    Renvoie le nombre de lignes supprimées.
    """
    _assert_user_owns_interview(email, interview_id)
    n = db.delete_chat_messages(interview_id, module_id, email)
    return {"deleted": n}


# ─── Mode WebLLM : le LLM tourne dans le navigateur du médecin ───────────


@app.get(
    "/interviews/{interview_id}/modules/{module_id}/chat/system-prompt",
    tags=["chat"],
)
async def get_chat_system_prompt(
    interview_id: int,
    module_id: str,
    turn: int = 1,
    email: str = Depends(get_current_user_email),
) -> dict[str, Any]:
    """Renvoie le system prompt complet (avec profil + scores) pour que le
    frontend puisse alimenter un runtime WebLLM tournant dans le browser.

    L'historique de la conversation est récupéré séparément via le GET /chat
    standard ; le frontend les compose puis appelle le LLM local.

    Ce endpoint n'expose RIEN de plus que ce qui finit dans le contexte du LLM
    de toute façon — c'est le même prompt qu'on enverrait à Claude / Ollama
    via le POST /chat traditionnel.
    """
    from src.chat_assistant import _build_system_prompt
    from src.pdf_exporter import _MODULES_FALLBACK

    _assert_user_owns_interview(email, interview_id)

    module = _MODULES_FALLBACK.get(module_id)
    if module is None:
        raise HTTPException(status_code=404, detail=f"Module inconnu : {module_id}")

    user_profile = db.get_user_profile(email) or {}
    scores = None
    try:
        answers = db.get_answers(interview_id)
        from src.v2 import scoring as v2_scoring
        scores = v2_scoring.compute_all_scores(answers, user_profile, "v3-brand-0")
    except Exception:
        scores = None

    return {
        "system_prompt": _build_system_prompt(module, user_profile, scores, turn_number=turn),
    }


class ChatPersistBody(BaseModel):
    """Échange complet (user + assistant) généré côté client à persister.

    Utilisé quand le frontend a généré la réponse via WebLLM dans le
    navigateur — le backend ne fait plus que stocker.
    """
    user_message: str
    assistant_text: str
    suggestions: Optional[list[str]] = None
    plan: Optional[list[dict[str, Any]]] = None
    ended: bool = False
    mermaid_graph: Optional[dict[str, Any]] = None  # C.A — graphe WSF du tour 4
    provider: str = "webllm"  # "webllm" attendu, mais on accepte "anthropic"/"ollama" pour debug


@app.post(
    "/interviews/{interview_id}/modules/{module_id}/chat/persist",
    tags=["chat"],
)
async def persist_chat_exchange(
    interview_id: int,
    module_id: str,
    body: ChatPersistBody,
    email: str = Depends(get_current_user_email),
) -> dict[str, Any]:
    """Persiste un échange (user + assistant) déjà généré côté frontend.

    Utilisé par le mode WebLLM : le navigateur du médecin a fait l'inférence
    localement, on lui demande juste d'enregistrer la trace en BDD pour qu'il
    puisse reprendre la conversation plus tard.

    Limites identiques au POST /chat normal : 20 messages user max par
    conversation, message non vide et < 2000 caractères.
    """
    from src.chat_assistant import MAX_USER_MESSAGES
    from src.pdf_exporter import _MODULES_FALLBACK
    import json as _json

    _assert_user_owns_interview(email, interview_id)

    if _MODULES_FALLBACK.get(module_id) is None:
        raise HTTPException(status_code=404, detail=f"Module inconnu : {module_id}")

    user_message = (body.user_message or "").strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="Message vide")
    if len(user_message) > 2000:
        raise HTTPException(status_code=400, detail="Message trop long (max 2000 caractères)")

    current_count = db.count_user_messages(interview_id, module_id, email)
    if current_count >= MAX_USER_MESSAGES:
        raise HTTPException(
            status_code=429,
            detail=f"Limite de {MAX_USER_MESSAGES} questions par conversation atteinte.",
        )

    provider = (body.provider or "webllm").lower()

    # 1. Persiste le message user (provider=None — un user n'a pas de provider)
    db.add_chat_message(interview_id, module_id, email, "user", user_message)

    # 2. Persiste la réponse assistant au même format que POST /chat —
    #    texte propre + suffixe __LUGIA_META__ avec suggestions/plan/ended.
    meta_payload = {
        "suggestions": body.suggestions,
        "plan": body.plan,
        "ended": body.ended,
        "mermaid_graph": body.mermaid_graph,
    }
    persisted_content = (
        (body.assistant_text or "")
        + "\n\n__LUGIA_META__:"
        + _json.dumps(meta_payload, ensure_ascii=False)
    )
    db.add_chat_message(
        interview_id, module_id, email, "assistant", persisted_content,
        provider=provider,
    )

    new_count = current_count + 1
    return {
        "user_message_count": new_count,
        "max_user_messages": MAX_USER_MESSAGES,
        "remaining": max(0, MAX_USER_MESSAGES - new_count),
        "provider": provider,
    }


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
        entity_name=body.entity_name,
        scored=body.scored,
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
    """Retourne les scores d'axe selon `interview.protocol_version`.

    V2.0-T4a : pour V2.0 retourne un payload léger (3 axes + niveaux +
    completeness) suffisant pour mettre à jour le radar aside dynamique
    après chaque réponse. Pour V1.x : comportement legacy.
    """
    interview = _assert_user_owns_interview(email, interview_id)
    pv = interview.get("protocol_version")
    # V3-brand-T-V3-14 : V3-brand utilise le même scoring que V2.0 (D-031 #9
    # scoring partagé — mêmes 18 questions, mêmes options scorées 1-4).
    if pv == "v2.0" or pv == "v3-brand-0":
        answers = db.get_answers(interview_id)
        user_profile = db.get_user_profile(email) or {}
        return v2_scoring.compute_all_scores(answers, user_profile, pv)
    return scoring.compute_all_facet_scores(interview_id)


@app.get("/interviews/{interview_id}/substrat", tags=["report"])
async def get_substrat_endpoint(
    interview_id: int,
    email: str = Depends(get_current_user_email),
) -> dict[str, Any]:
    """Substrat (capability map + carte vivante) dérivé des chantiers explorés.

    Agrège les substrats de tous les modules d'une interview : un graphe WSF par
    chantier (+ dérivation footprint / chaîne de valeur / signaux) et une
    empreinte globale (capability map du cabinet) fusionnant les footprints.
    """
    interview = _assert_user_owns_interview(email, interview_id)
    import json as _json
    from src import placement
    rows = db.list_substrats(interview_id, email)
    chantiers = []
    objets_all: list[Any] = []
    liaisons_all: list[Any] = []
    for r in rows:
        graphe = _json.loads(r["graphe_json"]) if r["graphe_json"] else {}
        chantiers.append({
            "module_id": r["module_id"],
            "graphe": graphe,
            "derive": _json.loads(r["derive_json"]) if r.get("derive_json") else None,
            "generated_at": r["generated_at"],
        })
        objets_all += graphe.get("objets") or graphe.get("nodes") or []
        liaisons_all += graphe.get("liaisons") or graphe.get("edges") or []
    footprint_global = (
        placement.footprint({"objets": objets_all, "liaisons": liaisons_all})
        if objets_all else {}
    )

    # Empreinte du QUESTIONNAIRE V3 : OBJETS par axe (socle extract_questionnaire_v3),
    # état dérivé du score s. Fusionnée dans footprint_global ; état/santé recalculés
    # par axe sur les objets fusionnés (questionnaire + chantiers).
    try:
        from src import extract_questionnaire_v3 as _eqv3
        from src.placement import ETAT_SCORE as _ES
        foot_q = _eqv3.footprint(db.get_answers(interview_id))
        for axe, d in foot_q.items():
            tgt = footprint_global.setdefault(axe, {"objets": [], "references_in": []})
            tgt.setdefault("objets", []).extend(d.get("objets", []))
            tgt.setdefault("references_in", []).extend(d.get("references_in", []))
        _ORDER = ["OPTIMAL", "FONCTIONNEL", "EN_TRANSFORMATION", "INACTIF",
                  "DEGRADE", "NON_DOCUMENTE", "A_RISQUE", "BLOQUE"]
        for axe, d in footprint_global.items():
            ets = [o.get("etat") for o in d.get("objets", []) if o.get("etat")]
            if ets:
                d["etat"] = max(ets, key=lambda e: _ORDER.index(e) if e in _ORDER else 0)
                d["sante"] = round(100 * sum(_ES.get(e, 0.4) for e in ets) / len(ets))
    except Exception:
        import logging
        logging.exception("footprint questionnaire V3 non calculé (interview=%s)", interview_id)

    return {
        "interview_id": interview_id,
        "chantiers": chantiers,
        "footprint_global": footprint_global,
    }


@app.get("/interviews/{interview_id}/report", tags=["report"])
async def get_report(
    interview_id: int,
    email: str = Depends(get_current_user_email),
) -> dict[str, Any]:
    """Retourne le rapport complet selon `interview.protocol_version`.

    V2.0-T4a : dispatcher.
    - `protocol_version == 'v2.0'` → payload V2 (cf `src/v2/report.build_report`).
    - sinon → comportement V1.1.x existant (préservé bit-à-bit).
    """
    interview = _assert_user_owns_interview(email, interview_id)
    answers = db.get_answers(interview_id)
    user_profile = db.get_user_profile(email) or {}

    # V2.0-T4a — dispatcher protocole
    pv = interview.get("protocol_version")
    if pv == "v2.0":
        payload = v2_report.build_report(interview, answers, user_profile)
        # Persiste le global_score V2 sur l'interview (analyses cohortes,
        # cf D-013/D-023 — non exposé au médecin malgré le retour ici).
        gs = payload["scores"].get("global_score")
        if gs is not None and interview.get("global_score") != gs:
            db.set_global_score(interview_id, gs)
        return payload

    # V3-brand-T-V3-14 — dispatcher V3 : payload minimal.
    # Contrairement à V2 (qui retourne TOUT le rapport monté côté backend), pour
    # V3-brand on retourne juste les scores + answers + profil. Le frontend
    # assemble la phrase choc, le bilan global, les annotations radar, les
    # axis details, et les opportunités via `lib/v3/signals_data.ts`,
    # `lib/v3/axis_details_data.ts` et `lib/v3/opps_catalog.ts`.
    # Justification : éviter de dupliquer le référentiel éditorial en Python.
    if pv == "v3-brand-0":
        scores_payload = v2_scoring.compute_all_scores(answers, user_profile, pv)
        # Persiste le global_score si présent (cohorte / analytics)
        gs = scores_payload.get("global_score")
        if gs is not None and interview.get("global_score") != gs:
            db.set_global_score(interview_id, gs)
        return {
            "interview": {
                "id": interview["id"],
                "protocol_version": pv,
                "created_at": interview.get("created_at"),
                "completed_at": interview.get("completed_at"),
                "doctor_firstname": user_profile.get("firstname"),
            },
            "profile": user_profile,
            "scores": scores_payload,
            "answers": answers,
        }

    # ---- Comportement V1.1.x existant (inchangé) ----
    doctor_firstname = user_profile.get("firstname")
    facet_scores = scoring.compute_all_facet_scores(interview_id)
    facet_labels = question_module.get_facet_labels()

    synthesis = templates.build_synthesis(answers, interview_id)
    recommendation = templates.build_recommandation(answers, interview_id)

    facets_payload: dict[str, Any] = {}
    for facet in question_module.get_scored_facets():
        score_data = facet_scores.get(facet)
        score_value = score_data["score"] if score_data else None
        # V1.1.5-b : exposition du niveau qualitatif à côté du score chiffré.
        # Rétrocompatibilité préservée : `score` reste exposé pour V0 Streamlit.
        if score_value is not None:
            level_data = scoring.score_to_level(score_value)
        else:
            level_data = {"level": None, "label": None, "color": None}
        # V1.1.5-d : extraction Forces / Risques par option choisie, triés par priorité
        # et tronqués selon le niveau qualitatif de la facette. Cf src/swot.py.
        forces_list = swot.build_facet_forces(facet, answers, level_data["level"])
        risques_list = swot.build_facet_risques(facet, answers, level_data["level"])
        facets_payload[facet] = {
            "label": facet_labels.get(facet, facet),
            "score": score_value,
            "raw_mean": score_data["raw_mean"] if score_data else None,
            "level": level_data["level"],
            "level_label": level_data["label"],
            "level_color": level_data["color"],
            "forces": forces_list,
            "risques": risques_list,
            "summary": templates.build_facet_summary(facet, answers),
            "contributions": (
                score_data["contributions"] if score_data else []
            ),
        }

    chantiers = workstreams.build_workstreams(interview_id)
    next_step = templates.build_next_step_recommendation(facet_scores, answers)

    return {
        "interview": {**dict(interview), "doctor_firstname": doctor_firstname},
        "synthesis": synthesis,
        "recommendation": recommendation,
        "facets": facets_payload,
        "workstreams": chantiers,
        "recommended_next_step": next_step,
    }
