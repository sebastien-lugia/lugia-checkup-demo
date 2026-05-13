"""Lugia Check-up — API backend (V1-2).

Expose les modules `src/*` de V0 via une API REST FastAPI.
Réutilise intégralement scoring, templates, workstreams, questions, db.

V1-2 : SQLite locale (réutilisée depuis V0).
V1-3 : migration vers Postgres.
V1-5 : auth lien magique.
V2 : CORS restreint à `diagnostic.lugia.fr`.

Lancement local :
    cd lugia-checkup-demo
    source .venv/bin/activate
    pip install -r backend/requirements.txt
    uvicorn backend.main:app --reload --port 8000

Documentation interactive :
    http://localhost:8000/docs       # Swagger UI
    http://localhost:8000/redoc      # ReDoc
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Any, Optional

# Permet à backend/main.py de trouver `src/` qui est à la racine du projet
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from fastapi import FastAPI, HTTPException  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from pydantic import BaseModel  # noqa: E402

from src import db  # noqa: E402
from src import questions as question_module  # noqa: E402
from src import scoring  # noqa: E402
from src import templates  # noqa: E402
from src import workstreams  # noqa: E402


app = FastAPI(
    title="Lugia Check-up API",
    description=(
        "API backend du démonstrateur Lugia Check-up. "
        "Réutilise les modules métier de V0 (`src/scoring`, `src/templates`, "
        "`src/workstreams`, `src/questions`, `src/db`)."
    ),
    version="0.1.0",
)

# CORS — V1-2 permissif (dev). V2 restreindra à `diagnostic.lugia.fr`.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---- Lifecycle ----

@app.on_event("startup")
async def startup() -> None:
    """Initialise la base SQLite au démarrage (idempotent)."""
    db.init_db()


# ---- Health checks ----

@app.get("/", tags=["health"])
async def root() -> dict[str, Any]:
    """Racine de l'API. Utile pour vérifier le déploiement."""
    return {
        "service": "Lugia Check-up API",
        "version": app.version,
        "status": "ok",
    }


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    """Health check minimal."""
    return {"status": "healthy"}


# ---- Protocole d'interview ----

@app.get("/protocol", tags=["protocol"])
async def get_protocol() -> dict[str, Any]:
    """Retourne le protocole complet du questionnaire : facet_labels, modes,
    scored_facets, et la liste des 14 questions avec leurs options."""
    return question_module.load_protocol()


# ---- Gestion des interviews ----

class CreateInterviewResponse(BaseModel):
    interview_id: int


@app.post("/interviews", response_model=CreateInterviewResponse, tags=["interview"])
async def create_interview() -> CreateInterviewResponse:
    """Crée une nouvelle interview et retourne son id."""
    iid = db.create_interview()
    return CreateInterviewResponse(interview_id=iid)


@app.get("/interviews/active", tags=["interview"])
async def get_active_interview() -> Optional[dict[str, Any]]:
    """Retourne l'interview in_progress la plus récente, ou null."""
    row = db.get_latest_in_progress_interview()
    return dict(row) if row else None


@app.get("/interviews/{interview_id}", tags=["interview"])
async def get_interview(interview_id: int) -> dict[str, Any]:
    """Retourne l'état d'une interview donnée."""
    row = db.get_interview(interview_id)
    if row is None:
        raise HTTPException(status_code=404, detail="Interview not found")
    return dict(row)


class UpdateCursorBody(BaseModel):
    current_question_index: int


@app.patch("/interviews/{interview_id}/cursor", tags=["interview"])
async def update_cursor(interview_id: int, body: UpdateCursorBody) -> dict[str, bool]:
    """Met à jour l'index de question courante (pour reprise)."""
    if db.get_interview(interview_id) is None:
        raise HTTPException(status_code=404, detail="Interview not found")
    db.set_current_question_index(interview_id, body.current_question_index)
    return {"ok": True}


@app.post("/interviews/{interview_id}/complete", tags=["interview"])
async def complete_interview(interview_id: int) -> dict[str, bool]:
    """Marque une interview comme terminée (statut `completed`)."""
    if db.get_interview(interview_id) is None:
        raise HTTPException(status_code=404, detail="Interview not found")
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
) -> dict[str, bool]:
    """Sauvegarde ou remplace une réponse pour une question donnée."""
    if db.get_interview(interview_id) is None:
        raise HTTPException(status_code=404, detail="Interview not found")
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
async def list_answers(interview_id: int) -> list[dict[str, Any]]:
    """Liste les réponses d'une interview, triées par date de création."""
    if db.get_interview(interview_id) is None:
        raise HTTPException(status_code=404, detail="Interview not found")
    return [dict(a) for a in db.get_answers(interview_id)]


# ---- Scores et rapport ----

@app.get("/interviews/{interview_id}/scores", tags=["report"])
async def get_scores(interview_id: int) -> dict[str, Any]:
    """Calcule les scores par facette pour une interview.

    Retourne un mapping facet → {score, raw_mean, contributions} ou null
    si la facette n'a pas assez de contributions.
    """
    if db.get_interview(interview_id) is None:
        raise HTTPException(status_code=404, detail="Interview not found")
    return scoring.compute_all_facet_scores(interview_id)


@app.get("/interviews/{interview_id}/report", tags=["report"])
async def get_report(interview_id: int) -> dict[str, Any]:
    """Génère le rapport complet pour une interview.

    Contient : interview, synthèse, résumés par facette avec scores et
    contributions, chantiers paramétrés, prochaine étape recommandée.
    """
    interview = db.get_interview(interview_id)
    if interview is None:
        raise HTTPException(status_code=404, detail="Interview not found")

    answers = db.get_answers(interview_id)
    facet_scores = scoring.compute_all_facet_scores(interview_id)
    facet_labels = question_module.get_facet_labels()

    synthesis = templates.build_synthesis(answers)

    facets_payload: dict[str, Any] = {}
    for facet in question_module.get_scored_facets():
        score_data = facet_scores.get(facet)
        facets_payload[facet] = {
            "label": facet_labels.get(facet, facet),
            "score": score_data["score"] if score_data else None,
            "raw_mean": score_data["raw_mean"] if score_data else None,
            "summary": templates.build_facet_summary(facet, answers),
            "contributions": score_data["contributions"] if score_data else [],
        }

    chantiers = workstreams.build_workstreams(interview_id)
    next_step = templates.build_next_step_recommendation(facet_scores, answers)

    return {
        "interview": dict(interview),
        "synthesis": synthesis,
        "facets": facets_payload,
        "workstreams": chantiers,
        "recommended_next_step": next_step,
    }
