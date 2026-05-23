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

_RESOURCES = Path(__file__).resolve().parent.parent.parent / "resources"
_PROTOCOL_PATHS = {
    "v2.0": _RESOURCES / "interview_protocol_v2.json",
    "v3-brand-0": _RESOURCES / "interview_protocol_v3.json",
}


@lru_cache(maxsize=4)
def load_protocol(protocol_version: str = "v2.0") -> dict[str, Any]:
    """Charge un protocole pour une version donnée (cache singleton par version).

    V3-charte (2026-05-22) : ajout du routing par `secretariat` et `has_team`.
    Le JSON V3 (`interview_protocol_v3.json`) est structurel uniquement —
    les labels/reformulations restent dans le frontend (`lib/v3/protocol_data.ts`).
    """
    path = _PROTOCOL_PATHS.get(protocol_version, _PROTOCOL_PATHS["v2.0"])
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _cabinet_is_solo(profile: Optional[dict[str, Any]]) -> bool:
    """True si le profil indique un cabinet solo. Défaut : non-solo."""
    if not profile:
        return False
    return (profile.get("cabinet_type") or "").lower() == "solo"


def _secretariat_is_seul(profile: Optional[dict[str, Any]]) -> bool:
    """True si le médecin gère son secrétariat seul. Défaut : non-seul (V3-charte)."""
    if not profile:
        return False
    return (profile.get("secretariat") or "").lower() == "seul"


def _paramedical_is_none(profile: Optional[dict[str, Any]]) -> bool:
    """True si pas de paramédical sur place. Défaut : None (V3-charte)."""
    if not profile:
        return False
    return (profile.get("paramedical_team") or "").lower() == "non"


def _has_team(profile: Optional[dict[str, Any]]) -> bool:
    """Au moins un signal d'équipe : cabinet non-solo, paramédical présent,
    ou secrétariat non géré seul.

    Miroir de la logique frontend `filterQuestionsByRouting` dans
    `lib/v3/protocol_data.ts`.
    """
    if not profile:
        return True  # défaut large : on suppose une équipe
    return (
        not _cabinet_is_solo(profile)
        or not _paramedical_is_none(profile)
        or not _secretariat_is_seul(profile)
    )


def _check_routing(routing: str, profile: Optional[dict[str, Any]]) -> bool:
    """Évalue une chaîne de routing contre un profil. Routings supportés :
       - cabinet_type==solo / cabinet_type!=solo
       - secretariat==seul / secretariat!=seul   (V3-charte)
       - has_team==true   / has_team==false      (V3-charte)
    """
    if routing == "cabinet_type==solo":
        return _cabinet_is_solo(profile)
    if routing == "cabinet_type!=solo":
        return not _cabinet_is_solo(profile)
    if routing == "secretariat==seul":
        return _secretariat_is_seul(profile)
    if routing == "secretariat!=seul":
        return not _secretariat_is_seul(profile)
    if routing == "has_team==true":
        return _has_team(profile)
    if routing == "has_team==false":
        return not _has_team(profile)
    return True  # routing inconnu : on n'exclut pas (fail-open)


def get_visible_questions(
    block_id: str,
    profile: Optional[dict[str, Any]] = None,
    protocol_version: str = "v2.0",
) -> list[dict[str, Any]]:
    """Retourne la liste des questions visibles d'un bloc pour un profil.

    V2.0 : bloc B applique le routing R-routing-solo (b1b XOR b3 selon
    cabinet_type), A et C servent toutes les questions.

    V3-charte (`v3-brand-0`) : bloc B applique les 3 axes de routing
    (cabinet_type, secretariat, has_team). 6 questions visibles par défaut,
    parfois 5 sur des edge-cases mixtes (solo+paraméd, groupe+seul) — cf
    `filterQuestionsByRouting` côté frontend.
    """
    proto = load_protocol(protocol_version)
    block = next((b for b in proto["blocks"] if b["id"] == block_id), None)
    if block is None:
        raise ValueError(f"Bloc inconnu : {block_id} (protocole {protocol_version})")

    visible: list[dict[str, Any]] = []
    for q in block["questions"]:
        routing = q.get("routing")
        if routing is None:
            visible.append(q)
        elif _check_routing(routing, profile):
            visible.append(q)
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
