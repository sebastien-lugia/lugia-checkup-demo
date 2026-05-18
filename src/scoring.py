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


# ---- V1.1.5 : mapping score → niveau qualitatif ----
#
# Décision D-023 (à inscrire en Vague 1.1.5-g) : remplacer la note chiffrée /10
# par une lecture qualitative en 5 niveaux. Seuils stricts choisis pour limiter
# la fréquence du niveau "Maîtrisé" (signal fort) et garder une échelle
# significative entre les 5 niveaux. Cf MASTER_PROMPT §8 (scoring déclaratif)
# et resources/modeling_scoring.md.

LEVEL_DEFINITIONS: tuple[tuple[int, int, int, str, str], ...] = (
    # (score_min, score_max, level, label, color_key)
    # V1.1.5-k : fusion des anciens niveaux 4 (En tension, score 3-4) et
    # 5 (À risque, score 0-2) en un seul niveau 4 (À risque, score 0-4).
    # Motivation : la calibration des health_scores rendait mathématiquement
    # impossible certaines facettes (Parcours, Équipe) d'atteindre l'ancien
    # niveau 5. Fusionner garde une échelle cohérente avec ce que le scoring
    # peut produire.
    (9, 10, 1, "Maîtrisé",     "green"),
    (7, 8,  2, "Opérationnel", "yellow"),
    (5, 6,  3, "À surveiller", "orange"),
    (0, 4,  4, "À risque",     "red"),
)


def score_to_level(score: int) -> dict[str, Any]:
    """Convertit un score entier (0-10) en niveau qualitatif V1.1.5.

    Seuils stricts : 9-10 → 1 Maîtrisé, 7-8 → 2 Opérationnel,
    5-6 → 3 À surveiller, 3-4 → 4 En tension, 0-2 → 5 À risque.

    Plus le niveau est élevé, plus la situation appelle de la vigilance.
    L'échelle est volontairement inverse au score chiffré : un score haut
    correspond à un niveau bas (1 = situation maîtrisée), pour que la
    progression du niveau (de 1 à 5) reflète une intensification du signal
    d'attention.

    Args:
        score: score entier compris dans [0, 10] (typiquement retourné par
            `compute_facet_score(...)['score']`).

    Returns:
        Dict ``{"level": int, "label": str, "color": str}``. La clé ``color``
        est un identifiant sémantique (``green``, ``yellow``, ``orange``,
        ``red``, ``dark``) que le frontend mappe sur sa palette. Ne pas
        utiliser ces noms comme couleurs CSS directement.

    Raises:
        ValueError: si le score est hors [0, 10].
    """
    if not 0 <= score <= 10:
        raise ValueError(f"score doit être entre 0 et 10, reçu {score}")
    for score_min, score_max, level, label, color in LEVEL_DEFINITIONS:
        if score_min <= score <= score_max:
            return {"level": level, "label": label, "color": color}
    # Bornes vérifiées au-dessus, ce chemin est théoriquement inatteignable
    raise ValueError(f"score hors plage de niveaux : {score}")
