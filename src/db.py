"""Helpers de base de données pour le démonstrateur Lugia Check-up.

V1-3 : abstraction via SQLAlchemy. Le backend (SQLite ou Postgres) est
déterminé par la variable d'environnement `DATABASE_URL`.

- Pas de DATABASE_URL → fallback sur SQLite local (`data/lugia_demo.sqlite`).
- DATABASE_URL commençant par `postgres://` ou `postgresql://` → Postgres.

V0 Streamlit local et V1 API backend partagent le même module. En dev local
les deux pointent vers le même SQLite. En production, l'API pointe vers
Postgres (variable injectée par Render).

Tables V0 :
- interview (email ajouté en V1-5a, nullable pour backward compat)
- answer
- facet_score
- workstream

Tables V1-5a (auth) :
- auth_token : tokens de lien magique (one-time, expiration courte)
- session    : sessions actives après auth (expiration longue)
"""

from __future__ import annotations

import os
import secrets
from datetime import datetime, timedelta, timezone
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
    inspect,
    select,
    text,
    update,
)
from sqlalchemy.engine import Engine

ROOT = Path(__file__).resolve().parent.parent
SQLITE_PATH = ROOT / "data" / "lugia_demo.sqlite"

# Durées d'expiration
MAGIC_LINK_TTL_MINUTES = 30
SESSION_TTL_DAYS = 30

# ---- Déclaration du schéma (SQLAlchemy Core) ----

metadata = MetaData()

interview_table = Table(
    "interview",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("email", String, nullable=True),  # ajouté en V1-5a
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

# ---- Tables auth (V1-5a) ----

auth_token_table = Table(
    "auth_token",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("email", String, nullable=False),
    Column("token", String, nullable=False, unique=True),
    Column("expires_at", String, nullable=False),
    Column("used", Integer, nullable=False, server_default="0"),
    Column("created_at", String, nullable=False),
)

session_table = Table(
    "session",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("email", String, nullable=False),
    Column("session_token", String, nullable=False, unique=True),
    Column("expires_at", String, nullable=False),
    Column("created_at", String, nullable=False),
)


# ---- Utilitaires de configuration ----

def _now() -> str:
    """Horodatage ISO 8601 en UTC, à la seconde."""
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def _iso_in(minutes: int = 0, days: int = 0) -> str:
    """Retourne un horodatage UTC futur."""
    dt = datetime.now(timezone.utc) + timedelta(minutes=minutes, days=days)
    return dt.isoformat(timespec="seconds")


def _resolve_database_url() -> str:
    """Détermine l'URL de connexion à partir de l'environnement."""
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


def _ensure_email_column_on_interview() -> None:
    """Migration V1-5a : ajoute la colonne `email` à `interview` si absente."""
    engine = get_engine()
    inspector = inspect(engine)
    if "interview" not in inspector.get_table_names():
        return
    columns = [c["name"] for c in inspector.get_columns("interview")]
    if "email" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE interview ADD COLUMN email TEXT"))


def init_db() -> None:
    """Crée les tables manquantes et applique les migrations. Idempotent."""
    engine = get_engine()
    metadata.create_all(engine)
    _ensure_email_column_on_interview()


# ---- Helpers Interview ----

def create_interview(email: Optional[str] = None) -> int:
    """Crée une nouvelle interview et retourne son id.

    L'email est facultatif pour préserver la compatibilité V0 (scripts,
    Streamlit local sans auth). Les endpoints V1 authentifiés passeront
    toujours l'email du user connecté.
    """
    now = _now()
    with get_engine().begin() as conn:
        result = conn.execute(
            insert(interview_table).values(
                email=email, created_at=now, updated_at=now
            )
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


def get_latest_in_progress_interview(
    email: Optional[str] = None,
) -> Optional[dict[str, Any]]:
    """Retourne l'interview in_progress la plus récente, optionnellement
    filtrée par email du propriétaire."""
    with get_engine().connect() as conn:
        stmt = (
            select(interview_table)
            .where(interview_table.c.status == "in_progress")
            .order_by(desc(interview_table.c.updated_at))
            .limit(1)
        )
        if email is not None:
            stmt = (
                select(interview_table)
                .where(
                    and_(
                        interview_table.c.status == "in_progress",
                        interview_table.c.email == email,
                    )
                )
                .order_by(desc(interview_table.c.updated_at))
                .limit(1)
            )
        result = conn.execute(stmt)
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


# ---- Helpers Auth (V1-5a) ----

def create_auth_token(email: str) -> str:
    """Crée un token de lien magique pour `email`, le sauvegarde, et le retourne."""
    token = secrets.token_urlsafe(32)
    with get_engine().begin() as conn:
        conn.execute(
            insert(auth_token_table).values(
                email=email.strip().lower(),
                token=token,
                expires_at=_iso_in(minutes=MAGIC_LINK_TTL_MINUTES),
                used=0,
                created_at=_now(),
            )
        )
    return token


def verify_auth_token(token: str) -> Optional[str]:
    """Vérifie un token de lien magique. Si valide et non utilisé, le marque
    utilisé et retourne l'email associé. Sinon retourne None."""
    now = _now()
    with get_engine().begin() as conn:
        result = conn.execute(
            select(auth_token_table).where(
                and_(
                    auth_token_table.c.token == token,
                    auth_token_table.c.used == 0,
                    auth_token_table.c.expires_at > now,
                )
            )
        )
        row = result.mappings().fetchone()
        if row is None:
            return None
        conn.execute(
            update(auth_token_table)
            .where(auth_token_table.c.id == row["id"])
            .values(used=1)
        )
        return row["email"]


def create_session(email: str) -> str:
    """Crée une session pour `email`, retourne le session_token."""
    token = secrets.token_urlsafe(32)
    with get_engine().begin() as conn:
        conn.execute(
            insert(session_table).values(
                email=email.strip().lower(),
                session_token=token,
                expires_at=_iso_in(days=SESSION_TTL_DAYS),
                created_at=_now(),
            )
        )
    return token


def get_session_email(session_token: str) -> Optional[str]:
    """Retourne l'email associé à un session_token valide, ou None."""
    now = _now()
    with get_engine().connect() as conn:
        result = conn.execute(
            select(session_table).where(
                and_(
                    session_table.c.session_token == session_token,
                    session_table.c.expires_at > now,
                )
            )
        )
        row = result.mappings().fetchone()
    return row["email"] if row else None


def revoke_session(session_token: str) -> None:
    """Supprime une session (logout)."""
    with get_engine().begin() as conn:
        conn.execute(
            delete(session_table).where(
                session_table.c.session_token == session_token
            )
        )
