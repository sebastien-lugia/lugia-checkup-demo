"""Helpers SQLite pour le démonstrateur Lugia Check-up.

Une seule base au chemin `data/lugia_demo.sqlite`. Le schéma est volontairement
minimal en V0 et sera étendu en V1 (nodes, edges, vital signs, reports).

Tables V0 :
- interview        : une session de check-up.
- answer           : une réponse à une question (mode A/B/C, option et libellé,
                     texte libre, complément optionnel).
- facet_score      : un score par facette WSF V0 (processes, participants, information).
- workstream       : un chantier instancié pour une session.
"""

from __future__ import annotations

import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "data" / "lugia_demo.sqlite"


SCHEMA = """
CREATE TABLE IF NOT EXISTS interview (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress',
    current_question_index INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS answer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    interview_id INTEGER NOT NULL,
    question_id TEXT NOT NULL,
    mode TEXT NOT NULL,
    selected_option TEXT,
    selected_option_label TEXT,
    free_text TEXT,
    complement_text TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (interview_id) REFERENCES interview(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS facet_score (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    interview_id INTEGER NOT NULL,
    facet TEXT NOT NULL,
    score INTEGER NOT NULL,
    summary TEXT,
    computed_at TEXT NOT NULL,
    FOREIGN KEY (interview_id) REFERENCES interview(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workstream (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    interview_id INTEGER NOT NULL,
    workstream_key TEXT NOT NULL,
    title TEXT NOT NULL,
    priority INTEGER NOT NULL,
    ce_que_check_up_a_vu TEXT,
    ce_que_pas_confirmer TEXT,
    ce_que_lugia_propose TEXT,
    ce_que_vous_obtenez TEXT,
    generated_at TEXT NOT NULL,
    FOREIGN KEY (interview_id) REFERENCES interview(id) ON DELETE CASCADE
);
"""


def _now() -> str:
    """Horodatage ISO 8601 en UTC, à la seconde."""
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def get_connection() -> sqlite3.Connection:
    """Ouvre une connexion SQLite avec foreign_keys activées."""
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def _migrate_answer_columns(conn: sqlite3.Connection) -> None:
    """Migrations idempotentes sur la table `answer`.

    - V0-3b iter1 : ajoute `complement_text` si absente.
    - V0-3b iter2 : ajoute `selected_option_label` si absente.
    """
    cols = [row[1] for row in conn.execute("PRAGMA table_info(answer)")]
    if "complement_text" not in cols:
        conn.execute("ALTER TABLE answer ADD COLUMN complement_text TEXT")
    cols = [row[1] for row in conn.execute("PRAGMA table_info(answer)")]
    if "selected_option_label" not in cols:
        conn.execute("ALTER TABLE answer ADD COLUMN selected_option_label TEXT")


def init_db() -> None:
    """Crée les tables si elles n'existent pas et applique les migrations."""
    with get_connection() as conn:
        conn.executescript(SCHEMA)
        _migrate_answer_columns(conn)


# ---- Helpers Interview ----

def create_interview() -> int:
    """Crée une nouvelle session d'interview et retourne son id."""
    with get_connection() as conn:
        now = _now()
        cursor = conn.execute(
            "INSERT INTO interview (created_at, updated_at) VALUES (?, ?)",
            (now, now),
        )
        return int(cursor.lastrowid)


def get_interview(interview_id: int) -> Optional[sqlite3.Row]:
    """Retourne la ligne d'interview pour un id donné, ou None."""
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM interview WHERE id = ?", (interview_id,)
        ).fetchone()


def get_latest_in_progress_interview() -> Optional[sqlite3.Row]:
    """Retourne l'interview in_progress la plus récemment touchée, ou None."""
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM interview WHERE status = 'in_progress' "
            "ORDER BY updated_at DESC LIMIT 1"
        ).fetchone()


def touch_interview(interview_id: int) -> None:
    """Met à jour le timestamp updated_at d'une interview."""
    with get_connection() as conn:
        conn.execute(
            "UPDATE interview SET updated_at = ? WHERE id = ?",
            (_now(), interview_id),
        )


def mark_interview_completed(interview_id: int) -> None:
    """Marque une interview comme terminée."""
    with get_connection() as conn:
        conn.execute(
            "UPDATE interview SET status = 'completed', updated_at = ? WHERE id = ?",
            (_now(), interview_id),
        )


def set_current_question_index(interview_id: int, index: int) -> None:
    """Met à jour l'index de la question courante (pour reprise)."""
    with get_connection() as conn:
        conn.execute(
            "UPDATE interview SET current_question_index = ?, updated_at = ? WHERE id = ?",
            (index, _now(), interview_id),
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
    """Enregistre une réponse à une question.

    Si une réponse existe déjà pour (interview_id, question_id), elle est
    remplacée. Le libellé de l'option (`selected_option_label`) est stocké
    en clair pour permettre l'inspection de la base sans cross-référence
    avec le JSON.
    """
    with get_connection() as conn:
        conn.execute(
            "DELETE FROM answer WHERE interview_id = ? AND question_id = ?",
            (interview_id, question_id),
        )
        conn.execute(
            """
            INSERT INTO answer
              (interview_id, question_id, mode,
               selected_option, selected_option_label,
               free_text, complement_text, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                interview_id,
                question_id,
                mode,
                selected_option,
                selected_option_label,
                free_text,
                complement_text,
                _now(),
            ),
        )


def get_answer(interview_id: int, question_id: str) -> Optional[sqlite3.Row]:
    """Retourne la réponse à une question donnée pour une interview, ou None."""
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM answer WHERE interview_id = ? AND question_id = ?",
            (interview_id, question_id),
        ).fetchone()


def get_answers(interview_id: int) -> list[sqlite3.Row]:
    """Retourne toutes les réponses d'une interview, triées par created_at."""
    with get_connection() as conn:
        return list(
            conn.execute(
                "SELECT * FROM answer WHERE interview_id = ? ORDER BY created_at ASC",
                (interview_id,),
            ).fetchall()
        )
