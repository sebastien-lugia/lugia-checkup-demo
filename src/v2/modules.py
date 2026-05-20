"""Chargement des 7 modules d'approfondissement V2.0.

Lecture pure du JSON `resources/modules_v2.json` — pas de logique métier.
La sélection et l'ordre des modules à afficher sur la page résultats est
portée par `personalize.py` (R-energy-prio, R-motivation-prio, etc.).

V2.0-T2 — Sébastien.
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Optional

_MODULES_PATH = Path(__file__).resolve().parent.parent.parent / "resources" / "modules_v2.json"


@lru_cache(maxsize=1)
def load_modules() -> dict[str, Any]:
    """Charge modules_v2.json (cache singleton)."""
    with open(_MODULES_PATH, encoding="utf-8") as f:
        return json.load(f)


def get_module(module_id: str) -> Optional[dict[str, Any]]:
    """Retourne un module par id, ou None s'il n'existe pas.

    IDs valides : urgences, chroniques, delegation, comm, logiciel, admin,
    pilotage (cf modules_v2.json).
    """
    data = load_modules()
    return next(
        (m for m in data["modules"] if m["id"] == module_id),
        None,
    )


def list_module_ids() -> list[str]:
    """Retourne la liste des 7 IDs de modules dans leur ordre de déclaration."""
    return [m["id"] for m in load_modules()["modules"]]
