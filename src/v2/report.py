"""Assemblage du payload de rapport V2.0 pour le frontend.

Le frontend Next.js V2 (T4) consomme ce payload pour rendre la page
résultats : radar grand format, signal croisé, cartes axes avec titres
diagnostic, opportunités ordonnées, benchmarks combinatoires, bandeau
remplaçant.

L'assemblage narratif (`src/v2/templates.py`) reste différé — pour V2.0 on
expose les payloads bruts. Le frontend assemble visuellement, ce qui
donne plus de souplesse pour itérer sur la mise en page sans toucher au
backend.

V2.0-T4a — Sébastien.
"""

from __future__ import annotations

from typing import Any, Optional

from . import modules as v2_modules
from . import personalize as v2_personalize
from . import questions as v2_questions
from . import scoring as v2_scoring
from . import signals as v2_signals


def compute_opportunities_order(
    profile: dict[str, Any],
    scores: dict[str, Any],
    apply_rules_output: dict[str, Any],
) -> list[str]:
    """Calcule l'ordre des 7 modules à afficher en opportunités.

    Cascade de priorisation (cf spec V2 §10.2) :
    1. R-motivation-prio (filière 1)
    2. R-horizon-prio (filière 2)
    3. R-energy-prio (contrainte max_effort)
    4. Filtre R-replacement (modules exclus pour remplaçant)
    5. Tri secondaire : score d'axe associé (le plus bas remonte)

    Retourne la liste ordonnée des `module_id` (7 entrées normalement, ou
    moins si filtrage remplaçant a vidé certains modules).
    """
    all_modules = v2_modules.load_modules()["modules"]

    # 1. Filtrage R-replacement
    replacement = apply_rules_output.get("replacement")
    if replacement and replacement.get("active"):
        excluded = set(replacement.get("excluded_modules", set()))
        modules = [m for m in all_modules if m["id"] not in excluded]
    else:
        modules = list(all_modules)

    # 2. Filtre R-energy-prio max_effort
    max_effort = apply_rules_output["prioritization"]["energy"].get("max_effort", 3)
    if max_effort is not None and max_effort < 3:
        # On retire les modules dont l'effort dépasse — mais on les remet en
        # fin de liste, plutôt que de les supprimer (pour que le médecin
        # voie quand même qu'ils existent).
        within = [m for m in modules if m.get("effort", 3) <= max_effort]
        above = [m for m in modules if m.get("effort", 3) > max_effort]
        modules = within + above

    # 3. R-motivation-prio : favor_modules / favor_efforts
    motivation = apply_rules_output["prioritization"]["motivation"]
    favor_modules = motivation.get("favor_modules") or []
    favor_efforts = motivation.get("favor_efforts") or []

    def motivation_priority(m: dict) -> int:
        score = 0
        if favor_modules and m["id"] in favor_modules:
            score -= 100
        if favor_efforts and m.get("effort") in favor_efforts:
            score -= 50
        return score

    # 4. R-horizon-prio : favor_modules
    horizon = apply_rules_output["prioritization"]["horizon"]
    horizon_favor = horizon.get("favor_modules") or []

    def horizon_priority(m: dict) -> int:
        return -50 if m["id"] in horizon_favor else 0

    # 5. Score d'axe associé (le module urgences/chroniques touche A,
    # delegation/comm touchent B, logiciel/admin/pilotage touchent C —
    # le plus bas remonte).
    axis_for_module = {
        "urgences": "A",
        "chroniques": "A",
        "delegation": "B",
        "comm": "B",
        "logiciel": "C",
        "admin": "C",
        "pilotage": "C",
    }

    def axis_score(m: dict) -> int:
        axis = axis_for_module.get(m["id"])
        if axis and isinstance(scores.get(axis), dict):
            return scores[axis]["pct"]
        return 100  # défaut neutre

    modules.sort(
        key=lambda m: (
            motivation_priority(m) + horizon_priority(m),
            axis_score(m),
            m.get("effort", 3),
        )
    )
    return [m["id"] for m in modules]


def build_report(
    interview: dict[str, Any],
    answers: list[dict[str, Any]],
    profile: Optional[dict[str, Any]],
) -> dict[str, Any]:
    """Assemble le payload V2.0 complet d'un rapport.

    Pas de génération narrative ici — c'est le frontend qui assemble en
    fonction du payload structuré. On expose :
    - `interview` : métadonnées (id, status, doctor_firstname, etc.)
    - `profile` : profil utilisateur courant (firstname + 10 champs V2)
    - `scores` : sortie de `compute_all_scores` (3 axes + niveaux + global + completeness)
    - `signal` : signal croisé matché (un seul) ou None
    - `tonality` : 3 sorties de règles (status_junior, status_senior, motivation_intro)
    - `prioritization` : payloads des règles R-energy-prio, R-motivation-prio, R-horizon-prio
    - `benchmarks_combinatoire` : liste des R-bench-* déclenchés
    - `routing_messages` : message R-routing-rdv si applicable
    - `territoire_context` : message R-territoire-context si zone sous-dotée
    - `replacement` : payload composite R-replacement si remplaçant
    - `modules` : les 7 modules complets (pour le frontend qui rendra le détail)
    - `opportunities_order` : ordre suggéré des modules en opportunités
    - `protocol_version` : "v2.0"
    """
    profile = profile or {}

    scores = v2_scoring.compute_all_scores(answers, profile)
    signal = v2_signals.evaluate_signals(scores)
    rules_output = v2_personalize.apply_rules(
        profile, scores, answers, interview_id=int(interview.get("id") or 0)
    )

    opportunities = compute_opportunities_order(profile, scores, rules_output)
    modules_full = v2_modules.load_modules()["modules"]

    return {
        "protocol_version": "v2.0",
        "interview": {
            "id": interview.get("id"),
            "status": interview.get("status"),
            "created_at": interview.get("created_at"),
            "updated_at": interview.get("updated_at"),
            "global_score": scores.get("global_score"),
            "doctor_firstname": profile.get("firstname"),
        },
        "profile": {
            "firstname": profile.get("firstname"),
            **{f: profile.get(f) for f in [
                "cabinet_type", "volume", "paramedical_team",
                "logiciel_metier", "logiciel_metier_other", "rdv_canal",
                "status", "territoire", "horizon", "motivation",
            ]},
        },
        "scores": scores,
        "signal": signal,
        "tonality": rules_output["tonality"],
        "prioritization": rules_output["prioritization"],
        "benchmarks_combinatoire": rules_output["benchmarks_combinatoire"],
        "routing_messages": rules_output["routing"],
        "territoire_context": rules_output["territoire_context"],
        "replacement": rules_output["replacement"],
        "modules": modules_full,
        "opportunities_order": opportunities,
        "is_complete": v2_scoring.has_three_complete_blocks(scores),
    }
