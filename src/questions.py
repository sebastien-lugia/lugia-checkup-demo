"""Chargement et validation des questions du protocole V0.

Source de vérité technique : `resources/interview_protocol.json`.
Documentation humaine : `resources/interview_protocol.md`.

Toute évolution structurelle des questions doit être faite dans le JSON,
puis répercutée dans le `.md`. Le test de cohérence
`check_md_json_consistency()` vérifie au minimum que les IDs de question
sont les mêmes dans les deux fichiers et que le compte tombe juste.
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
JSON_PATH = ROOT / "resources" / "interview_protocol.json"
MD_PATH = ROOT / "resources" / "interview_protocol.md"


def load_protocol() -> dict[str, Any]:
    """Charge le protocole complet depuis le JSON."""
    with open(JSON_PATH, encoding="utf-8") as f:
        return json.load(f)


def load_questions() -> list[dict[str, Any]]:
    """Retourne la liste des questions, triée par position."""
    protocol = load_protocol()
    return sorted(protocol["questions"], key=lambda q: q["position"])


def get_facet_labels() -> dict[str, str]:
    """Retourne le mapping facet → libellé affiché."""
    return load_protocol()["facet_labels"]


def get_scored_facets() -> list[str]:
    """Retourne la liste des facettes qui contribuent au score V0."""
    return load_protocol()["scored_facets"]


def get_question_by_id(question_id: str) -> dict[str, Any] | None:
    """Retourne une question par son id (insensible à la casse), ou None."""
    qid = question_id.lower()
    for q in load_protocol()["questions"]:
        if q["id"].lower() == qid:
            return q
    return None


def check_md_json_consistency() -> tuple[bool, list[str]]:
    """Vérifie la cohérence entre le JSON et le `.md`.

    Contrôles V0 :
      - Le champ `total_questions` du JSON correspond bien au nombre
        d'éléments dans `questions`.
      - Les IDs Qxx en H3 du `.md` correspondent exactement aux IDs
        des questions du JSON.
      - Les positions sont contiguës de 1 à N.

    Retourne (is_consistent, list_of_errors).
    """
    errors: list[str] = []

    protocol = load_protocol()
    questions = protocol["questions"]
    declared = int(protocol.get("total_questions", 0))

    if len(questions) != declared:
        errors.append(
            f"Nombre de questions {len(questions)} != total_questions déclaré ({declared})."
        )

    # Cohérence des positions
    positions = sorted(q["position"] for q in questions)
    expected = list(range(1, len(questions) + 1))
    if positions != expected:
        errors.append(
            f"Positions non contiguës ou dupliquées : {positions} (attendu : {expected})."
        )

    # Cohérence des IDs JSON vs .md
    json_ids = sorted(q["id"].lower() for q in questions)

    md_text = MD_PATH.read_text(encoding="utf-8")
    md_matches = re.findall(r"^###\s+(Q\d+)\s+—", md_text, re.MULTILINE)
    md_ids = sorted(m.lower() for m in md_matches)

    if json_ids != md_ids:
        only_json = sorted(set(json_ids) - set(md_ids))
        only_md = sorted(set(md_ids) - set(json_ids))
        if only_json:
            errors.append(f"IDs présents dans le JSON mais absents du .md : {only_json}")
        if only_md:
            errors.append(f"IDs présents dans le .md mais absents du JSON : {only_md}")

    return (not errors, errors)


if __name__ == "__main__":
    ok, errors = check_md_json_consistency()
    if ok:
        n = len(load_questions())
        print(f"OK — JSON et .md cohérents ({n} questions).")
    else:
        print("Incohérence détectée :")
        for e in errors:
            print(f"  - {e}")
        raise SystemExit(1)
