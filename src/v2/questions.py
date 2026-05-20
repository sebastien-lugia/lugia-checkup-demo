"""Chargement du protocole V2.0 et résolution du routing solo.

Le protocole V2.0 (`resources/interview_protocol_v2.json`) déclare **7
positions** dans le bloc B (b1, b1b, b3, b4, b5, b6, b7) — mais seules **6**
sont visibles pour un profil donné : `b1b` est servi aux solos, `b3` aux
non-solos. Le calcul de score doit s'aligner sur la liste effectivement
servie au médecin (`N_visible=6`).

V2.0-T2 — Sébastien (cf spec V2 §6.2, §8.1).
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Optional

_PROTOCOL_PATH = Path(__file__).resolve().parent.parent.parent / "resources" / "interview_protocol_v2.json"


@lru_cache(maxsize=1)
def load_protocol() -> dict[str, Any]:
    """Charge le protocole V2.0 (cache singleton par processus)."""
    with open(_PROTOCOL_PATH, encoding="utf-8") as f:
        return json.load(f)


def _cabinet_is_solo(profile: Optional[dict[str, Any]]) -> bool:
    """Retourne True si le profil indique un cabinet solo.

    Tolérant à un profil absent ou partiel : par défaut considéré non-solo
    (servira la branche `b3` qui est la majorité des cabinets en France).
    """
    if not profile:
        return False
    return (profile.get("cabinet_type") or "").lower() == "solo"


def get_visible_questions(
    block_id: str,
    profile: Optional[dict[str, Any]] = None,
) -> list[dict[str, Any]]:
    """Retourne la liste des questions visibles d'un bloc pour un profil.

    Applique le routing R-routing-solo sur le bloc B (position 2 = b1b
    XOR b3). Pour A et C, retourne toutes les questions.

    Toujours 6 questions par bloc, dans l'ordre d'affichage attendu côté
    frontend.
    """
    proto = load_protocol()
    block = next((b for b in proto["blocks"] if b["id"] == block_id), None)
    if block is None:
        raise ValueError(f"Bloc inconnu : {block_id}")

    if block_id != "B":
        return list(block["questions"])

    # Bloc B : appliquer le routing solo
    solo = _cabinet_is_solo(profile)
    visible: list[dict[str, Any]] = []
    for q in block["questions"]:
        routing = q.get("routing")
        if routing is None:
            visible.append(q)
            continue
        if routing == "cabinet_type==solo" and solo:
            visible.append(q)
        elif routing == "cabinet_type!=solo" and not solo:
            visible.append(q)
        # Sinon : question masquée pour ce profil
    return visible


def get_all_visible_question_ids(
    profile: Optional[dict[str, Any]] = None,
) -> list[str]:
    """Retourne la liste plate des IDs de toutes les questions visibles
    pour un profil — utile pour vérifier la complétude d'une interview."""
    out: list[str] = []
    for block_id in ("A", "B", "C"):
        out.extend(q["id"] for q in get_visible_questions(block_id, profile))
    return out


def get_option(question: dict[str, Any], option_id: str) -> Optional[dict[str, Any]]:
    """Retourne l'option choisie dans une question donnée, ou None."""
    return next(
        (o for o in question.get("options", []) if o["id"] == option_id),
        None,
    )


def find_question(question_id: str) -> Optional[dict[str, Any]]:
    """Cherche une question par id dans tous les blocs (et bloc énergie).

    Retourne None si l'ID n'existe pas dans le protocole V2.
    """
    proto = load_protocol()
    if question_id == "energy":
        return proto["energy"]
    for block in proto["blocks"]:
        for q in block["questions"]:
            if q["id"] == question_id:
                return q
    return None
