"""Scoring V2.0 — % par bloc + niveau qualitatif Lugia.

Spec V2 §8 :
- `score_bloc = (Σ s_choisi) / (N_visible × 4) × 100`
- N_visible = nombre de questions effectivement servies au profil (routing
  solo : b1b XOR b3, jamais les deux).
- Mapping `score_to_level` selon seuils 35 / 55 / 78.
- Aucun score numérique exposé au médecin (D-013, D-023). Le % reste un
  objet interne ; seul le niveau qualitatif (Maîtrisé / Opérationnel / À
  surveiller / À risque) apparaît dans le rendu.

V2.0-T2 — Sébastien.
"""

from __future__ import annotations

import json
from functools import lru_cache
from pathlib import Path
from typing import Any, Optional

from . import questions as v2_questions

_DIAGNOSTICS_PATH = Path(__file__).resolve().parent.parent.parent / "resources" / "diagnostics_v2.json"


@lru_cache(maxsize=1)
def load_diagnostics() -> dict[str, Any]:
    """Charge diagnostics_v2.json (cache singleton)."""
    with open(_DIAGNOSTICS_PATH, encoding="utf-8") as f:
        return json.load(f)


# Niveaux qualitatifs Lugia, dans l'ordre croissant de maturité.
LEVELS = ("a_risque", "a_surveiller", "operationnel", "maitrise")
LEVEL_LABELS = {
    "a_risque": "À risque",
    "a_surveiller": "À surveiller",
    "operationnel": "Opérationnel",
    "maitrise": "Maîtrisé",
}


def score_to_level(score_pct: int) -> str:
    """Mappe un score 0-100 vers un niveau qualitatif Lugia.

    Seuils stricts (spec V2 §8.2) :
    - ≥ 78 → maitrise
    - 55-77 → operationnel
    - 35-54 → a_surveiller
    - 0-34 → a_risque
    """
    if score_pct >= 78:
        return "maitrise"
    if score_pct >= 55:
        return "operationnel"
    if score_pct >= 35:
        return "a_surveiller"
    return "a_risque"


def score_block(
    block_id: str,
    answers: list[dict[str, Any]],
    profile: Optional[dict[str, Any]] = None,
) -> Optional[int]:
    """Calcule le score d'un bloc en %.

    `answers` : liste de réponses sauvegardées (cf `db.get_answers`). Pour
    chaque réponse on lit `selected_option` et on retrouve `s` dans le
    protocole V2.

    Retourne None si aucune réponse n'a encore été enregistrée pour le
    bloc (utile en cours de parcours).

    Score arrondi à l'entier (cf D-013 : on n'expose pas le chiffré au
    médecin mais on garde la précision entière en interne).
    """
    visible = v2_questions.get_visible_questions(block_id, profile)
    if not visible:
        return None
    visible_ids = {q["id"] for q in visible}
    n_visible = len(visible)

    # Map id_option → s_value depuis le protocole
    option_score: dict[str, int] = {}
    for q in visible:
        for opt in q.get("options", []):
            option_score[opt["id"]] = int(opt["s"])

    s_sum = 0
    n_answered = 0
    for ans in answers:
        if ans.get("question_id") not in visible_ids:
            continue
        sel = ans.get("selected_option")
        if sel is None or sel not in option_score:
            continue
        s_sum += option_score[sel]
        n_answered += 1

    if n_answered == 0:
        return None

    # Formule officielle : N_visible (pas N_answered) au dénominateur.
    # En cours de parcours, les questions non répondues comptent comme 0
    # — c'est ce qui permet au radar dynamique de monter au fil des
    # clics plutôt que de partir d'une moyenne trompeuse.
    score = (s_sum / (n_visible * 4)) * 100
    return round(score)


def compute_all_scores(
    answers: list[dict[str, Any]],
    profile: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """Calcule les 3 scores d'axe + niveaux qualitatifs + global_score.

    Retourne un dict :
    ```
    {
        "A": {"pct": 62, "level": "operationnel", "label": "Opérationnel",
              "title": "Le parcours est maîtrisé sur les situations courantes."},
        "B": {...},
        "C": {...},
        "global_score": 50,   # round((A + B + C) / 3) — pas affiché au médecin
        "completeness": {     # 0..1 par axe — utile au front pour le radar live
            "A": 1.0, "B": 0.5, "C": 0.0
        }
    }
    ```

    `null` sur un axe = aucune réponse pour ce bloc. Le dispatcher final
    refuse de générer un rapport tant que les 3 axes ne sont pas complets.
    """
    diag = load_diagnostics()
    titles = diag["titres_diagnostic"]

    out: dict[str, Any] = {}
    completeness: dict[str, float] = {}
    block_scores: list[int] = []

    for block_id in ("A", "B", "C"):
        visible = v2_questions.get_visible_questions(block_id, profile)
        visible_ids = {q["id"] for q in visible}
        answered = sum(
            1 for a in answers
            if a.get("question_id") in visible_ids
            and a.get("selected_option") is not None
        )
        completeness[block_id] = (answered / len(visible)) if visible else 0.0

        pct = score_block(block_id, answers, profile)
        if pct is None:
            out[block_id] = None
            continue

        level = score_to_level(pct)
        out[block_id] = {
            "pct": pct,
            "level": level,
            "label": LEVEL_LABELS[level],
            "title": titles[block_id][level],
            "axe_label": titles[block_id]["axe"],
        }
        block_scores.append(pct)

    out["completeness"] = completeness
    out["global_score"] = (
        round(sum(block_scores) / len(block_scores))
        if len(block_scores) == 3
        else None
    )
    return out


def has_three_complete_blocks(scores: dict[str, Any]) -> bool:
    """Vérifie que les 3 axes sont au moins partiellement scorés.

    Utile au dispatcher final qui refuse de produire un rapport tant que
    les 3 blocs ne contiennent pas d'évaluation.
    """
    return all(scores.get(b) is not None for b in ("A", "B", "C"))


def get_energy_level(answers: list[dict[str, Any]]) -> Optional[str]:
    """Récupère le niveau d'énergie déclaré (option_id de la question energy).

    Retourne `energy_a..energy_d` ou None si pas encore répondue.
    """
    for ans in answers:
        if ans.get("question_id") == "energy":
            return ans.get("selected_option")
    return None
