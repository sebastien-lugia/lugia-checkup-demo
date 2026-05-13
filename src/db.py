"""Helpers de base de données pour le démonstrateur Lugia Check-up.

V1-3 : abstraction via SQLAlchemy. Le backend (SQLite ou Postgres) est
déterminé par la variable d'environnement `DATABASE_URL`.

- Pas de DATABASE_URL → fallback sur SQLite local (`data/lugia_demo.sqlite`).
- DATABASE_URL commençant par `postgres://` ou `postgresql://` → Postgres.

V0 Streamlit local et V1 API backend partagent le même module. En dev local
les deux pointent vers le même SQLite. En production, l'API pointe vers
Postgres (variable injectée par Render).

Tables V0 (inchangées en V1-3) :
- interview
- answer
- facet_score
- workstream
"""

from __future__ import annotations

import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from sqlalchemy import (
    Column,
    ForeignKey,
    Integer,
    MetaData,
    String,
    Table,
    Text,
    and_,
    create_engine,
    delete,
    desc,
    insert,
    select,
    update,
)
from sqlalchemy.engine import Engine

ROOT = Path(__file__).resolve().parent.parent
SQLITE_PATH = ROOT / "data" / "lugia_demo.sqlite"

# ---- Déclaration du schéma (SQLAlchemy Core) ----

metadata = MetaData()

interview_table = Table(
    "interview",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("created_at", String, nullable=False),
    Column("updated_at", String, nullable=False),
    Column("status", String, nullable=False, server_default="in_progress"),
    Column("current_question_index", Integer, nullable=False, server_default="0"),
)

answer_table = Table(
    "answer",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column(
        "interview_id",
        Integer,
        ForeignKey("interview.id", ondelete="CASCADE"),
        nullable=False,
    ),
    Column("question_id", String, nullable=False),
    Column("mode", String, nullable=False),
    Column("selected_option", String, nullable=True),
    Column("selected_option_label", String, nullable=True),
    Column("free_text", Text, nullable=True),
    Column("complement_text", Text, nullable=True),
    Column("created_at", String, nullable=False),
)

facet_score_table = Table(
    "facet_score",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column(
        "interview_id",
        Integer,
        ForeignKey("interview.id", ondelete="CASCADE"),
        nullable=False,
    ),
    Column("facet", String, nullable=False),
    Column("score", Integer, nullable=False),
    Column("summary", Text, nullable=True),
    Column("computed_at", String, nullable=False),
)

workstream_table = Table(
    "workstream",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column(
        "interview_id",
        Integer,
        ForeignKey("interview.id", ondelete="CASCADE"),
        nullable=False,
    ),
    Column("workstream_key", String, nullable=False),
    Column("title", String, nullable=False),
    Column("priority", Integer, nullable=False),
    Column("ce_que_check_up_a_vu", Text, nullable=True),
    Column("ce_que_pas_confirmer", Text, nullable=True),
    Column("ce_que_lugia_propose", Text, nullable=True),
    Column("ce_que_vous_obtenez", Text, nullable=True),
    Column("generated_at", String, nullable=False),
)


# ---- Utilitaires de configuration ----

def _now() -> str:
    """Horodatage ISO 8601 en UTC, à la seconde."""
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _resolve_database_url() -> str:
    """Détermine l'URL de connexion à partir de l'environnement.

    Priorité à DATABASE_URL si défini (production). Sinon fallback sur
    SQLite local (dev). Render fournit historiquement `postgres://` mais
    SQLAlchemy 1.4+ veut `postgresql://`, on convertit.
    """
    url = os.environ.get("DATABASE_URL", "").strip()
    if url:
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql://", 1)
        return url
    SQLITE_PATH.parent.mkdir(parents=True, exist_ok=True)
    return f"sqlite:///{SQLITE_PATH}"


_engine: Optional[Engine] = None


def get_engine() -> Engine:
    """Retourne le moteur SQLAlchemy (singleton par processus)."""
    global _engine
    if _engine is None:
        _engine = create_engine(_resolve_database_url(), future=True)
    return _engine


def init_db() -> None:
    """Crée les tables manquantes. Idempotent."""
    metadata.create_all(get_engine())


# ---- Helpers Interview ----

def create_interview() -> int:
    """Crée une nouvelle interview et retourne son id."""
    now = _now()
    with get_engine().begin() as conn:
        result = conn.execute(
            insert(interview_table).values(created_at=now, updated_at=now)
        )
        return int(result.inserted_primary_key[0])


def get_interview(interview_id: int) -> Optional[dict[str, Any]]:
    """Retourne l'interview demandée, sous forme de dict, ou None."""
    with get_engine().connect() as conn:
        result = conn.execute(
            select(interview_table).where(interview_table.c.id == interview_id)
        )
        row = result.mappings().fetchone()
    return dict(row) if row else None


def get_latest_in_progress_interview() -> Optional[dict[str, Any]]:
    """Retourne l'interview in_progress la plus récente, ou None."""
    with get_engine().connect() as conn:
        result = conn.execute(
            select(interview_table)
            .where(interview_table.c.status == "in_progress")
            .order_by(desc(interview_table.c.updated_at))
            .limit(1)
        )
        row = result.mappings().fetchone()
    return dict(row) if row else None


def touch_interview(interview_id: int) -> None:
    """Met à jour le timestamp updated_at."""
    with get_engine().begin() as conn:
        conn.execute(
            update(interview_table)
            .where(interview_table.c.id == interview_id)
            .values(updated_at=_now())
        )


def mark_interview_completed(interview_id: int) -> None:
    """Marque l'interview comme terminée."""
    with get_engine().begin() as conn:
        conn.execute(
            update(interview_table)
            .where(interview_table.c.id == interview_id)
            .values(status="completed", updated_at=_now())
        )


def set_current_question_index(interview_id: int, index: int) -> None:
    """Met à jour l'index de question courante."""
    with get_engine().begin() as conn:
        conn.execute(
            update(interview_table)
            .where(interview_table.c.id == interview_id)
            .values(current_question_index=index, updated_at=_now())
        )


# ---- Helpers Answer ----

def save_answer(
    interview_id: int,
    question_id: str,
    mode: str,
    selected_option: Optional[str],
    selected_option_label: Optional[str],
    free_text: Optional[str],
    complement_text: Optional[str] = None,
) -> None:
    """Enregistre une réponse, en remplaçant l'éventuelle réponse existante
    pour la même (interview_id, question_id)."""
    with get_engine().begin() as conn:
        conn.execute(
            delete(answer_table).where(
                and_(
                    answer_table.c.interview_id == interview_id,
                    answer_table.c.question_id == question_id,
                )
            )
        )
        conn.execute(
            insert(answer_table).values(
                interview_id=interview_id,
                question_id=question_id,
                mode=mode,
                selected_option=selected_option,
                selected_option_label=selected_option_label,
                free_text=free_text,
                complement_text=complement_text,
                created_at=_now(),
            )
        )


def get_answer(interview_id: int, question_id: str) -> Optional[dict[str, Any]]:
    """Retourne la réponse pour (interview_id, question_id), ou None."""
    with get_engine().connect() as conn:
        result = conn.execute(
            select(answer_table).where(
                and_(
                    answer_table.c.interview_id == interview_id,
                    answer_table.c.question_id == question_id,
                )
            )
        )
        row = result.mappings().fetchone()
    return dict(row) if row else None


def get_answers(interview_id: int) -> list[dict[str, Any]]:
    """Retourne toutes les réponses d'une interview, triées par date."""
    with get_engine().connect() as conn:
        result = conn.execute(
            select(answer_table)
            .where(answer_table.c.interview_id == interview_id)
            .order_by(answer_table.c.created_at)
        )
        return [dict(row) for row in result.mappings().all()]
