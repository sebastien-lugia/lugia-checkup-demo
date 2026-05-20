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
    # V2.0-T3 : cohabitation des protocoles V1.1.9 / V2.0 (cf D-029, D-030).
    # `protocol_version` route le dispatcher backend vers les modules
    # `src/*` (V1.1.x) ou `src/v2/*` (V2.0). `global_score` stocke la
    # moyenne des 3 scores d'axe pour analyses cohortes (non exposé au
    # médecin — cf D-013, D-023).
    Column(
        "protocol_version",
        String,
        nullable=False,
        server_default="v1.1.9",
    ),
    Column("global_score", Integer, nullable=True),
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
    # V1.1.5-i : nom de l'entité associée à l'option choisie (prénom du
    # secrétariat, de l'assistant, de l'associé...). Optionnel, déclenché
    # côté frontend par les options portant `has_entity_field: true` dans
    # interview_protocol.json. Voir V1.1.5-i pour le détail.
    Column("entity_name", String, nullable=True),
    Column("created_at", String, nullable=False),
    # V2.0-T3 : marque les réponses non scorées (typiquement l'ancrage
    # énergie V2). Par défaut TRUE pour préserver le comportement V1.x.
    Column("scored", Integer, nullable=False, server_default="1"),
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

user_profile_table = Table(
    "user_profile",
    metadata,
    # V1.1.7-a : profil utilisateur persistant par email (prénom du médecin
    # pour personnaliser le rapport). Email = clé primaire — un seul profil
    # par email, partagé entre toutes ses interviews.
    Column("email", String, primary_key=True),
    Column("firstname", String, nullable=True),
    Column("updated_at", String, nullable=False),
    # V2.0-T3 : extension du profil pour le mini-onboarding V2 (cf spec V2
    # §3). Toutes nullables — un médecin qui n'a pas démarré V2.0 n'a aucun
    # de ces champs renseignés et le rapport V1.1.9 reste produit comme
    # avant. Documenté ici plutôt que dans une table séparée pour permettre
    # le partage du profil entre V1.1.9 et V2.0 (cf spec V2 §3 + D-029).
    Column("cabinet_type", String, nullable=True),
    Column("volume", String, nullable=True),
    Column("paramedical_team", String, nullable=True),
    Column("logiciel_metier", String, nullable=True),
    Column("logiciel_metier_other", String, nullable=True),
    Column("rdv_canal", String, nullable=True),
    Column("status", String, nullable=True),
    Column("territoire", String, nullable=True),
    Column("horizon", String, nullable=True),
    Column("motivation", String, nullable=True),
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


def _ensure_entity_name_column_on_answer() -> None:
    """Migration V1.1.5-i.1 : ajoute la colonne `entity_name` à `answer` si absente."""
    engine = get_engine()
    inspector = inspect(engine)
    if "answer" not in inspector.get_table_names():
        return
    columns = [c["name"] for c in inspector.get_columns("answer")]
    if "entity_name" not in columns:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE answer ADD COLUMN entity_name TEXT"))


def _ensure_interview_v2_columns() -> None:
    """Migration V2.0-T3 : ajoute `protocol_version` et `global_score` à
    `interview` si absents. Idempotent."""
    engine = get_engine()
    inspector = inspect(engine)
    if "interview" not in inspector.get_table_names():
        return
    columns = {c["name"] for c in inspector.get_columns("interview")}
    with engine.begin() as conn:
        if "protocol_version" not in columns:
            # NOT NULL DEFAULT 'v1.1.9' : les interviews existantes prennent
            # automatiquement la valeur 'v1.1.9', le dispatcher route donc
            # vers les modules V1.x. Aucune régression possible.
            conn.execute(
                text(
                    "ALTER TABLE interview ADD COLUMN protocol_version TEXT "
                    "NOT NULL DEFAULT 'v1.1.9'"
                )
            )
        if "global_score" not in columns:
            conn.execute(
                text("ALTER TABLE interview ADD COLUMN global_score INTEGER")
            )


def _ensure_answer_scored_column() -> None:
    """Migration V2.0-T3 : ajoute `scored` (boolean) à `answer` si absent.
    Par défaut TRUE pour préserver le comportement V1.x. Idempotent."""
    engine = get_engine()
    inspector = inspect(engine)
    if "answer" not in inspector.get_table_names():
        return
    columns = {c["name"] for c in inspector.get_columns("answer")}
    if "scored" not in columns:
        with engine.begin() as conn:
            # SQLite ne supporte pas BOOLEAN typé — on stocke INTEGER 0/1.
            conn.execute(
                text(
                    "ALTER TABLE answer ADD COLUMN scored INTEGER "
                    "NOT NULL DEFAULT 1"
                )
            )


def _ensure_profile_v2_columns() -> None:
    """Migration V2.0-T3 : ajoute les 10 champs du profil V2 à
    `user_profile` si absents. Toutes nullables. Idempotent."""
    engine = get_engine()
    inspector = inspect(engine)
    if "user_profile" not in inspector.get_table_names():
        return
    columns = {c["name"] for c in inspector.get_columns("user_profile")}
    v2_fields = [
        "cabinet_type",
        "volume",
        "paramedical_team",
        "logiciel_metier",
        "logiciel_metier_other",
        "rdv_canal",
        "status",
        "territoire",
        "horizon",
        "motivation",
    ]
    with engine.begin() as conn:
        for field in v2_fields:
            if field not in columns:
                conn.execute(
                    text(f"ALTER TABLE user_profile ADD COLUMN {field} TEXT")
                )


def init_db() -> None:
    """Crée les tables manquantes et applique les migrations. Idempotent."""
    engine = get_engine()
    metadata.create_all(engine)
    _ensure_email_column_on_interview()
    _ensure_entity_name_column_on_answer()
    # V2.0-T3 — cohabitation des protocoles V1.1.9 / V2.0
    _ensure_interview_v2_columns()
    _ensure_answer_scored_column()
    _ensure_profile_v2_columns()


# ---- Helpers Interview ----

def create_interview(
    email: Optional[str] = None,
    protocol_version: str = "v1.1.9",
) -> int:
    """Crée une nouvelle interview et retourne son id.

    L'email est facultatif pour préserver la compatibilité V0 (scripts,
    Streamlit local sans auth). Les endpoints V1 authentifiés passeront
    toujours l'email du user connecté.

    V2.0-T3 : `protocol_version` détermine vers quel jeu de modules
    (`src/*` ou `src/v2/*`) le dispatcher backend route les calculs.
    Valeurs supportées : `"v1.1.9"` (par défaut, préserve la compat) et
    `"v2.0"`. Voir D-029 et D-030.
    """
    now = _now()
    with get_engine().begin() as conn:
        result = conn.execute(
            insert(interview_table).values(
                email=email,
                created_at=now,
                updated_at=now,
                protocol_version=protocol_version,
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


def get_in_progress_interviews_by_version(
    email: Optional[str] = None,
) -> dict[str, dict[str, Any]]:
    """Retourne les interviews `in_progress` du user, indexées par
    `protocol_version`.

    V2.0-T5-fix : permet à la page d'accueil d'afficher séparément la
    session V1.1.9 en cours et la session V2.0 en cours, plutôt que de
    n'exposer que la plus récente.

    Pour chaque version on retourne la plus récente (si le même médecin
    a ouvert plusieurs interviews V1.1.9, on prend la dernière updatée).
    Si l'email est None, on filtre sans contrainte d'appartenance.
    """
    with get_engine().connect() as conn:
        stmt = (
            select(interview_table)
            .where(interview_table.c.status == "in_progress")
            .order_by(desc(interview_table.c.updated_at))
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
            )
        result = conn.execute(stmt).mappings().all()

    by_version: dict[str, dict[str, Any]] = {}
    for row in result:
        version = row.get("protocol_version") or "v1.1.9"
        # Ordre desc — la première occurrence pour chaque version est la
        # plus récente.
        if version not in by_version:
            by_version[version] = dict(row)
    return by_version


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
    entity_name: Optional[str] = None,
    scored: bool = True,
) -> None:
    """Enregistre une réponse, en remplaçant l'éventuelle réponse existante
    pour la même (interview_id, question_id).

    V2.0-T3 : `scored=False` pour les questions non scorées (typiquement
    l'ancrage énergie V2). Stocké en INTEGER 0/1 côté SQLite.
    """
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
                entity_name=entity_name,
                scored=1 if scored else 0,
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


# ---- Helpers User Profile (V1.1.7-a) ----

def get_user_profile(email: str) -> Optional[dict[str, Any]]:
    """Retourne le profil utilisateur (email, firstname) pour un email, ou None."""
    with get_engine().connect() as conn:
        result = conn.execute(
            select(user_profile_table).where(user_profile_table.c.email == email)
        ).mappings().first()
        return dict(result) if result else None


def upsert_user_profile(email: str, firstname: Optional[str]) -> None:
    """Crée ou met à jour le profil utilisateur. Idempotent."""
    now = _now()
    with get_engine().begin() as conn:
        existing = conn.execute(
            select(user_profile_table).where(user_profile_table.c.email == email)
        ).first()
        if existing:
            conn.execute(
                user_profile_table.update()
                .where(user_profile_table.c.email == email)
                .values(firstname=firstname, updated_at=now)
            )
        else:
            conn.execute(
                insert(user_profile_table).values(
                    email=email, firstname=firstname, updated_at=now
                )
            )


# Champs V2.0 du profil utilisateur — référence canonique réutilisée par
# `upsert_user_profile_v2` et exposée à `backend/main.py` (validation
# Pydantic). Toutes les valeurs sont des slugs définis dans
# `resources/interview_protocol_v2.json::profile.{step1,step2}.fields`.
USER_PROFILE_V2_FIELDS: tuple[str, ...] = (
    "cabinet_type",
    "volume",
    "paramedical_team",
    "logiciel_metier",
    "logiciel_metier_other",
    "rdv_canal",
    "status",
    "territoire",
    "horizon",
    "motivation",
)


def upsert_user_profile_v2(
    email: str,
    fields: dict[str, Optional[str]],
) -> None:
    """Met à jour les champs V2 du profil utilisateur (cf spec V2 §3.4).

    Seuls les champs présents dans `fields` sont écrits — les autres
    restent inchangés. Cette sémantique en patch partiel permet au
    frontend de saisir le profil en 2 étapes (5 chips factuels puis 4
    chips réflexifs) sans devoir renvoyer l'ensemble.

    Les champs inconnus sont ignorés silencieusement (garde-fou contre
    une injection accidentelle). La normalisation (trim, chaîne vide →
    None) est à la charge de l'appelant.

    V2.0-T3 — Sébastien.
    """
    safe_fields = {
        k: v for k, v in fields.items() if k in USER_PROFILE_V2_FIELDS
    }
    if not safe_fields:
        return
    now = _now()
    with get_engine().begin() as conn:
        existing = conn.execute(
            select(user_profile_table).where(user_profile_table.c.email == email)
        ).first()
        if existing:
            conn.execute(
                user_profile_table.update()
                .where(user_profile_table.c.email == email)
                .values(updated_at=now, **safe_fields)
            )
        else:
            conn.execute(
                insert(user_profile_table).values(
                    email=email, updated_at=now, **safe_fields
                )
            )


def set_global_score(interview_id: int, score: int) -> None:
    """Stocke le score global V2.0 (moyenne des 3 axes) sur l'interview.

    Non exposé au médecin (cf D-013, D-023). Sert aux analyses cohortes
    en backend admin.
    """
    with get_engine().begin() as conn:
        conn.execute(
            update(interview_table)
            .where(interview_table.c.id == interview_id)
            .values(global_score=int(score), updated_at=_now())
        )


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


# ---- Effacement (V1-8 — droit à l'effacement RGPD article 17) ----

def delete_user_data(email: str) -> dict[str, int]:
    """Supprime toutes les données associées à un email.

    Couvre interviews, answers, facet_scores, workstreams, auth_tokens et
    sessions. Réalisé en une transaction unique. Les FK CASCADE existent
    sur Postgres mais SQLite ne les applique pas par défaut, donc on
    supprime explicitement les tables filles avant les tables parentes.

    Retourne un dict de compteurs par table.
    """
    normalized = email.strip().lower()
    with get_engine().begin() as conn:
        # 1. Trouver les interviews appartenant à cet email
        result = conn.execute(
            select(interview_table.c.id).where(
                interview_table.c.email == normalized
            )
        )
        interview_ids = [row[0] for row in result]

        answers_deleted = 0
        facet_scores_deleted = 0
        workstreams_deleted = 0

        if interview_ids:
            # 2. Supprimer les enfants des interviews
            r = conn.execute(
                delete(answer_table).where(
                    answer_table.c.interview_id.in_(interview_ids)
                )
            )
            answers_deleted = r.rowcount or 0

            r = conn.execute(
                delete(facet_score_table).where(
                    facet_score_table.c.interview_id.in_(interview_ids)
                )
            )
            facet_scores_deleted = r.rowcount or 0

            r = conn.execute(
                delete(workstream_table).where(
                    workstream_table.c.interview_id.in_(interview_ids)
                )
            )
            workstreams_deleted = r.rowcount or 0

        # 3. Supprimer les interviews elles-mêmes
        r = conn.execute(
            delete(interview_table).where(
                interview_table.c.email == normalized
            )
        )
        interviews_deleted = r.rowcount or 0

        # 4. Supprimer les tokens de lien magique encore en base
        r = conn.execute(
            delete(auth_token_table).where(
                auth_token_table.c.email == normalized
            )
        )
        auth_tokens_deleted = r.rowcount or 0

        # 5. Supprimer toutes les sessions actives
        r = conn.execute(
            delete(session_table).where(
                session_table.c.email == normalized
            )
        )
        sessions_deleted = r.rowcount or 0

    return {
        "interviews": interviews_deleted,
        "answers": answers_deleted,
        "facet_scores": facet_scores_deleted,
        "workstreams": workstreams_deleted,
        "auth_tokens": auth_tokens_deleted,
        "sessions": sessions_deleted,
    }
