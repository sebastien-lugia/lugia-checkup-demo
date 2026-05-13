"""Génération des chantiers personnalisés selon les réponses.

Implémente les templates documentés dans `resources/workstream_templates.md`.
Trois chantiers prédéfinis en V0, déclenchés par des triggers sur les réponses,
instanciés avec substitution de placeholders à partir des données de session.

V0 : les trois chantiers sont systématiquement affichés. Si les triggers sont
satisfaits, version standard (correctrice). Sinon, version préventive
(formulation atténuée).
"""

from __future__ import annotations

from typing import Any

from src import db
from src import templates


# ---- Helpers spécifiques aux chantiers ----

def _selected(answers: list[Any], qid: str):
    return templates._selected_option(answers, qid)


def _free_text(answers: list[Any], qid: str):
    a = templates._get_answer(answers, qid)
    return a["free_text"] if a else None


def _has_classical_dictation(answers: list[Any]) -> bool:
    """Vrai si l'utilisateur a mentionné une dictée vocale classique dans Q09."""
    text = templates._complement(answers, "q09")
    if not text:
        return False
    for keyword in ("Mediadict", "Dragon", "dictée vocale", "dictée"):
        if keyword in text:
            return True
    return False


def _canaux_paralleles_phrase() -> str:
    """Formulation fixe des canaux parallèles quand Q04=q04_d."""
    return "appels sur votre mobile, des SMS de patients réguliers et des mails directs"


def _flux_principal(answers: list[Any]) -> str:
    """Outil principal de prise de rendez-vous, extrait de Q04 free_text."""
    text = _free_text(answers, "q04")
    if text:
        for tool in templates.KNOWN_TOOLS:
            if tool in text:
                return tool
    return "votre plateforme de rendez-vous"


def _usage_ia_decrit(answers: list[Any]) -> str:
    """Décrit l'usage IA mentionné dans Q13 free_text."""
    text = _free_text(answers, "q13")
    if not text:
        return "vos courriers complexes"
    lower = text.lower()
    if "courrier" in lower and "compte" in lower:
        return "vos courriers complexes et vos comptes-rendus"
    if "courrier" in lower:
        return "vos courriers complexes"
    if "compte" in lower:
        return "vos comptes-rendus"
    return "vos tâches de rédaction"


# ---- Chantier 1 : Reprendre la main sur les demandes directes ----

def chantier_demandes_directes(answers: list[Any]) -> dict[str, Any]:
    q04 = _selected(answers, "q04")
    q05 = _selected(answers, "q05")

    triggered = (q04 == "q04_d") or (q05 == "q05_d")

    sec_label = templates.derive_secretariat_label(answers)
    sec_du = templates.derive_secretariat_with_du(answers)

    if triggered:
        title = "Reprendre la main sur les demandes directes"
        if q04 == "q04_d":
            canaux = _canaux_paralleles_phrase()
            flux = _flux_principal(answers)
            vu = (
                f"Vous recevez des {canaux}, en plus de {flux} et {sec_du}. "
                f"Ces demandes ne sont tracées nulle part et représentent une charge invisible."
            )
            pas_confirmer = (
                f"Le volume exact, l'impact réel sur votre journée, et les raisons pour lesquelles "
                f"certains patients passent par vous plutôt que par {sec_label}."
            )
            propose = (
                f"Cartographier ces demandes directes sur deux semaines pour en mesurer la volumétrie, "
                f"puis définir avec vous une règle simple à communiquer aux patients et à {sec_label}."
            )
            obtient = (
                f"Une vue claire de ces flux parallèles, une règle simple à communiquer à vos patients, "
                f"et un brief précis pour {sec_label}."
            )
        else:  # q05 == "q05_d" sans q04 == "q04_d"
            vu = (
                "Votre charge administrative déborde le soir et le week-end. "
                "Vous compensez ce qui ne se voit pas la journée."
            )
            pas_confirmer = (
                "La répartition exacte de votre charge sur la semaine et les sources principales "
                "de cette charge invisible."
            )
            propose = (
                "Observer deux semaines de fonctionnement pour identifier les leviers de "
                "réduction de la charge administrative quotidienne."
            )
            obtient = (
                "Une cartographie de votre temps administratif et trois à cinq leviers concrets "
                "de réduction priorisés."
            )
    else:
        title = "Cartographier les sources de votre charge"
        vu = (
            "Le check-up n'a pas identifié de flux parallèle critique. Une cartographie "
            "préventive de vos sources de charge permettrait de l'anticiper si elle "
            "augmentait."
        )
        pas_confirmer = (
            "La distribution exacte de vos tâches administratives sur la semaine."
        )
        propose = (
            "Une observation rapide pour identifier les leviers d'optimisation, "
            "sans changer votre organisation actuelle."
        )
        obtient = (
            "Une vue d'ensemble préventive et un plan de suivi léger."
        )

    return {
        "key": "demandes_directes",
        "title": title,
        "priority": 1,
        "vu": vu,
        "pas_confirmer": pas_confirmer,
        "propose": propose,
        "obtient": obtient,
    }


# ---- Chantier 2 : Sécuriser votre usage actuel de l'IA ----

def chantier_ia(answers: list[Any]) -> dict[str, Any]:
    q13 = _selected(answers, "q13")
    triggered = q13 in ("q13_c", "q13_d")

    if triggered:
        title = "Sécuriser votre usage actuel de l'IA"
        usage = _usage_ia_decrit(answers)

        if q13 == "q13_d":
            vu = (
                f"Vous utilisez ChatGPT pour {usage}, avec une anonymisation manuelle "
                f"des extraits de dossier. Vous savez que cela ne garantit pas la "
                f"conformité au secret médical."
            )
        else:  # q13_c
            vu = (
                f"Vous utilisez ChatGPT pour {usage}, en faisant attention à l'anonymisation. "
                f"Vous restez conscient des limites de cette pratique."
            )

        pas_confirmer = (
            "La fréquence, le type de courriers concernés, et les autres usages éventuels "
            "(résumés de consultations, recherches médicales)."
        )
        propose = (
            "Mettre à votre disposition un environnement IA conforme HDS qui couvre les mêmes "
            "usages, sans anonymisation manuelle. Transition sans changer votre façon de travailler."
        )
        obtient = (
            "Un usage conforme dès le premier jour, puis à votre rythme l'ouverture à d'autres "
            "tâches utiles (préparation de réponse à un spécialiste, suivi de patients chroniques, "
            "préparation à la facturation électronique de septembre)."
        )
        if _has_classical_dictation(answers):
            obtient += (
                " La dictée vocale classique que vous utilisez déjà reste — ce chantier porte "
                "sur l'aide à la rédaction structurée."
            )
    else:
        title = "Préparer un usage maîtrisé de l'IA"
        vu = (
            "Vous n'utilisez pas d'IA générative aujourd'hui. C'est un bon point de départ pour "
            "découvrir un environnement maîtrisé avant que l'usage ne se diffuse de manière "
            "informelle."
        )
        pas_confirmer = (
            "Vos besoins réels en matière de rédaction assistée, qui n'ont pas encore été "
            "explorés."
        )
        propose = (
            "Vous présenter un environnement IA conforme HDS, et identifier ensemble deux ou "
            "trois tâches concrètes où il pourrait vous faire gagner du temps."
        )
        obtient = (
            "Un cadre clair pour adopter l'IA progressivement, sans risque de conformité."
        )

    return {
        "key": "ia",
        "title": title,
        "priority": 2,
        "vu": vu,
        "pas_confirmer": pas_confirmer,
        "propose": propose,
        "obtient": obtient,
    }


# ---- Chantier 3 : Anticiper une absence prolongée ----

def chantier_absence(answers: list[Any]) -> dict[str, Any]:
    q08 = _selected(answers, "q08")
    triggered = q08 in ("q08_c", "q08_d")

    sec_label = templates.derive_secretariat_label(answers)
    pred = templates.derive_predecessor_name(answers)
    duree = templates.derive_duree_secretariat(answers)

    if triggered:
        title = "Anticiper une absence prolongée"

        if pred:
            depuis = f"Depuis le départ de {pred}"
        elif duree:
            depuis = f"Depuis votre installation actuelle il y a {duree}"
        else:
            depuis = "Depuis votre installation"

        if q08 == "q08_d":
            vu = (
                f"Tout le fonctionnement de votre cabinet est dans votre tête. "
                f"{depuis}, rien n'est documenté. En cas d'arrêt de plusieurs jours, "
                f"{sec_label} et vos patients ne sauraient pas quoi faire."
            )
        else:  # q08_c
            vu = (
                f"En cas d'arrêt de plusieurs jours, {sec_label} pourrait gérer les rendez-vous, "
                f"mais le reste serait compliqué. {depuis}, peu de procédures sont documentées."
            )

        pas_confirmer = (
            "Ce qui se passerait concrètement, qui pourrait prendre le relais sur quoi, "
            "et quels patients chroniques nécessitent une vigilance particulière."
        )
        propose = (
            "Mettre par écrit les règles essentielles de fonctionnement de votre cabinet : "
            "à qui adresser quels types de demandes, comment gérer les renouvellements, "
            "qui contacter en cas de problème technique."
        )
        obtient = (
            f"Un document simple, à jour, partageable avec {sec_label} et un remplaçant éventuel. "
            "La conviction qu'en cas d'imprévu, votre cabinet ne s'arrête pas net."
        )
    else:
        title = "Formaliser la continuité déjà construite"
        vu = (
            "Vous avez déjà des éléments de continuité organisationnelle. Le chantier consiste "
            "à les formaliser pour qu'ils soient encore plus solides en cas d'imprévu."
        )
        pas_confirmer = (
            "Le niveau exact de complétude de votre dispositif actuel."
        )
        propose = (
            "Auditer rapidement votre dispositif de continuité existant et compléter les zones "
            "non encore couvertes."
        )
        obtient = (
            "Une assurance renforcée que votre cabinet survit à un imprévu."
        )

    return {
        "key": "absence",
        "title": title,
        "priority": 3,
        "vu": vu,
        "pas_confirmer": pas_confirmer,
        "propose": propose,
        "obtient": obtient,
    }


# ---- Assemblage ----

def build_workstreams(interview_id: int) -> list[dict[str, Any]]:
    """Génère les trois chantiers pour une interview, dans l'ordre de priorité."""
    answers = db.get_answers(interview_id)
    return [
        chantier_demandes_directes(answers),
        chantier_ia(answers),
        chantier_absence(answers),
    ]
