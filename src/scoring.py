"""Calcul des scores par facette pour une interview donnée.

Algorithme V0 : moyenne brute des scores santé des options sélectionnées
dans les questions scorées de chaque facette. Voir
`resources/modeling_scoring.md` section 2 pour le détail formel.

Conformément à `DECISIONS.md` D-013, les scores sont recalculés à la volée
depuis la table `answer` (pas de stockage redondant). Conformément à D-016,
les limites structurelles de cet algorithme sont documentées et la
trajectoire V1+ (pondération, planchers, Flags) est dans `ROADMAP.md`.
"""

from __future__ import annotations

from typing import Any, Optional

from src import db
from src import questions as question_module


def _get_option_by_id(question: dict[str, Any], option_id: str) -> Optional[dict[str, Any]]:
    """Retourne l'option d'une question par son id, ou None."""
    for opt in question["options"]:
        if opt["id"] == option_id:
            return opt
    return None


def compute_facet_score(
    interview_id: int,
    facet: str,
    *,
    all_questions: Optional[list[dict[str, Any]]] = None,
    answers: Optional[list[Any]] = None,
) -> Optional[dict[str, Any]]:
    """Calcule le score d'une facette pour une interview.

    Args :
        interview_id : id de l'interview.
        facet : identifiant de la facette (par exemple "processes").
        all_questions : optionnel, liste pré-chargée des questions.
        answers : optionnel, liste pré-chargée des réponses (`sqlite3.Row` ou dict).

    Retourne un dict :
        {
            "facet": str,
            "score": int,            # arrondi à l'unité
            "raw_mean": float,       # moyenne non arrondie
            "contributions": list,   # détail question par question
        }
    Ou None si pas de contribution valide pour cette facette.
    """
    if all_questions is None:
        all_questions = question_module.load_questions()
    if answers is None:
        answers = db.get_answers(interview_id)

    questions_by_id = {q["id"]: q for q in all_questions}

    contributions: list[dict[str, Any]] = []
    for answer in answers:
        question_id = answer["question_id"]
        question = questions_by_id.get(question_id)
        if question is None:
            continue
        if question["facet"] != facet:
            continue
        if not question["scored"]:
            continue
        selected_option_id = answer["selected_option"]
        if selected_option_id is None:
            continue
        option = _get_option_by_id(question, selected_option_id)
        if option is None:
            continue
        if option["health_score"] is None:
            continue
        contributions.append({
            "question_id": question["id"],
            "question_topic": question["topic"],
            "option_id": option["id"],
            "option_label": option["label"],
            "health_score": option["health_score"],
        })

    if not contributions:
        return None

    raw_mean = sum(c["health_score"] for c in contributions) / len(contributions)
    score = round(raw_mean)
    return {
        "facet": facet,
        "score": score,
        "raw_mean": raw_mean,
        "contributions": contributions,
    }


def compute_all_facet_scores(interview_id: int) -> dict[str, Optional[dict[str, Any]]]:
    """Calcule les scores pour toutes les facettes scorées (V0 : 3 facettes)."""
    all_questions = question_module.load_questions()
    answers = db.get_answers(interview_id)
    protocol = question_module.load_protocol()
    scored_facets = protocol["scored_facets"]

    results: dict[str, Optional[dict[str, Any]]] = {}
    for facet in scored_facets:
        results[facet] = compute_facet_score(
            interview_id, facet,
            all_questions=all_questions,
            answers=answers,
        )
    return results
