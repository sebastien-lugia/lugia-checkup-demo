"""Génération des chantiers personnalisés selon les réponses.

Implémente les templates documentés dans `resources/workstream_templates.md`.
Trois chantiers prédéfinis, déclenchés par des triggers sur les réponses,
instanciés avec substitution de placeholders.

V0 : structure à 4 sections (vu, pas_confirmer, propose, obtient).

V1.1 lite : restructuration en 4 sections avec ajout d'une étape "analyse"
explicite, et fusion de "propose" + "obtient" en une seule section finale
(la proposition se termine par le bénéfice). Vulgarisation du jargon WSF
et suppression des citations nominatives d'outils.

Schéma de sortie V1.1 :
    {
        "key": str,
        "title": str,
        "priority": int,
        "vu": str,            # Ce que nous avons compris
        "analyse": str,       # Ce que ça révèle
        "pas_confirmer": str, # Ce qui nous échappe encore
        "propose": str,       # Ce que nous vous proposons (proposition + bénéfice fusionnés)
    }
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
    """Vrai si l'utilisateur a mentionné une dictée vocale classique en Q09."""
    text = templates._complement(answers, "q09")
    if not text:
        return False
    for keyword in ("Mediadict", "Dragon", "Whispr", "dictée vocale", "dictée"):
        if keyword in text:
            return True
    return False


def _canaux_paralleles_phrase() -> str:
    """Formulation factuelle des canaux directs (Q04=q04_d)."""
    return "appels sur votre mobile, SMS de patients réguliers et mails directs"


def _flux_principal_categorie(answers: list[Any]) -> str:
    """Catégorie générique de l'outil principal de prise de rendez-vous."""
    text = _free_text(answers, "q04")
    if text:
        for tool, category in templates.TOOL_CATEGORIES.items():
            if tool in text:
                return f"votre {category}"
    return "votre plateforme de rendez-vous"


def _usage_ia_decrit(answers: list[Any]) -> str:
    """Décrit l'usage IA mentionné en Q13 free_text, sans citer la marque."""
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
            flux = _flux_principal_categorie(answers)
            vu = (
                f"Vous recevez des {canaux}, en plus de {flux} et {sec_du}. "
                f"Ces demandes ne sont pas tracées et représentent une charge invisible."
            )
            analyse = (
                f"Ces demandes directes restent invisibles à {sec_label} : vous portez seul "
                f"le suivi mental, et le coût s'accumule à mesure que les canaux se multiplient."
            )
            pas_confirmer = (
                f"Le volume exact, l'impact réel sur votre journée, et les raisons pour lesquelles "
                f"certains patients passent par vous plutôt que par {sec_label}."
            )
            propose = (
                f"Recenser ces demandes sur deux semaines pour mesurer combien elles représentent, "
                f"puis définir avec vous une règle simple à communiquer aux patients et à {sec_label}. "
                f"À la clé : une vision claire de ces demandes, une règle simple à communiquer "
                f"à vos patients, et des consignes claires pour {sec_label}."
            )
        else:  # q05 == "q05_d" sans q04 == "q04_d"
            vu = (
                "Votre charge administrative déborde le soir et le week-end. "
                "Vous compensez ce qui ne se voit pas la journée."
            )
            analyse = (
                "Cette compensation tient parce que vous l'assumez, mais elle masque la vraie "
                "volumétrie de votre charge. Sans repère mesuré, il est difficile de savoir "
                "ce qu'il faudrait alléger en priorité."
            )
            pas_confirmer = (
                "La répartition exacte de votre charge sur la semaine et les sources principales "
                "de cette charge invisible."
            )
            propose = (
                "Observer deux semaines de fonctionnement pour identifier les pistes d'allègement "
                "de la charge administrative quotidienne. Vous repartez avec un relevé de votre "
                "temps administratif et trois à cinq pistes concrètes priorisées."
            )
    else:
        title = "Garder un œil sur ce qui prend votre temps"
        vu = (
            "Le check-up n'a pas détecté de surcharge particulière. "
            "Un état des lieux régulier de ce qui vous prend du temps "
            "permettrait de l'anticiper si elle s'aggravait."
        )
        analyse = (
            "Aujourd'hui vous tenez la charge sans repère mesuré. Si elle augmente lentement, "
            "vous risquez de vous en rendre compte une fois fatigué plutôt qu'en amont."
        )
        pas_confirmer = (
            "La répartition exacte de vos tâches administratives sur la semaine."
        )
        propose = (
            "Une observation rapide pour identifier des pistes d'allègement, sans changer votre "
            "organisation actuelle. Vous repartez avec une vue d'ensemble et un plan de suivi léger."
        )

    return {
        "key": "demandes_directes",
        "title": title,
        "priority": 1,
        "vu": vu,
        "analyse": analyse,
        "pas_confirmer": pas_confirmer,
        "propose": propose,
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
                f"Vous utilisez un outil d'IA grand public pour {usage}, en retirant à la main "
                f"les informations identifiantes. Vous savez que ce n'est pas une vraie garantie "
                f"de secret médical."
            )
        else:  # q13_c
            vu = (
                f"Vous utilisez un outil d'IA grand public pour {usage}, en faisant attention à "
                f"l'anonymisation. Vous restez conscient des limites de cette pratique."
            )

        analyse = (
            "Le besoin est légitime, le canal ne l'est pas. Tant que vous passez par un outil "
            "grand public, l'anonymisation manuelle reste à votre seule charge."
        )
        pas_confirmer = (
            "La fréquence, le type de courriers concernés, et les autres usages éventuels "
            "(résumés de consultations, recherches médicales)."
        )

        propose_parts = [
            "Vous donner accès à un environnement IA conforme au secret médical qui couvre "
            "les mêmes usages, sans avoir à anonymiser à la main. La transition se fait sans "
            "changer votre façon de travailler. "
            "Un usage compatible avec le secret médical dès le premier jour, puis à votre rythme "
            "l'ouverture à d'autres tâches utiles (préparation de réponse à un spécialiste, "
            "suivi de patients chroniques, préparation des comptes-rendus structurés)."
        ]
        if _has_classical_dictation(answers):
            propose_parts.append(
                "Votre logiciel de dictée actuel reste — ce chantier porte uniquement sur "
                "l'aide à la rédaction structurée."
            )
        propose = " ".join(propose_parts)
    else:
        title = "Préparer un usage maîtrisé de l'IA"
        vu = (
            "Vous n'utilisez pas d'IA générative aujourd'hui. C'est un bon point de départ pour "
            "découvrir un environnement maîtrisé avant que l'usage ne se diffuse de manière informelle."
        )
        analyse = (
            "L'IA générative se diffuse rapidement dans les cabinets. Découvrir un environnement "
            "conforme dès maintenant évite d'avoir à recadrer des usages déjà installés."
        )
        pas_confirmer = (
            "Vos besoins réels en matière de rédaction assistée, qui n'ont pas encore été explorés."
        )
        propose = (
            "Vous présenter un environnement IA conforme au secret médical, et identifier ensemble "
            "deux ou trois tâches concrètes où il pourrait vous faire gagner du temps. "
            "Vous repartez avec un cadre clair pour adopter l'IA progressivement, sans risque pour "
            "le secret médical."
        )

    return {
        "key": "ia",
        "title": title,
        "priority": 2,
        "vu": vu,
        "analyse": analyse,
        "pas_confirmer": pas_confirmer,
        "propose": propose,
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
                f"Tout le fonctionnement de votre cabinet repose sur votre mémoire. "
                f"{depuis}, rien n'est écrit. En cas d'arrêt de plusieurs jours, "
                f"{sec_label} et vos patients auraient du mal à savoir quoi faire."
            )
        else:  # q08_c
            vu = (
                f"En cas d'arrêt de plusieurs jours, {sec_label} pourrait gérer les rendez-vous, "
                f"mais le reste serait compliqué. {depuis}, peu de procédures sont écrites."
            )

        analyse = (
            "Le fonctionnement actuel tient tant que vous êtes présent. Quelques règles écrites "
            "sur les cas courants (renouvellements, urgences, contacts critiques) permettent "
            "d'absorber une absence courte sans rupture."
        )
        pas_confirmer = (
            "Ce qui se passerait concrètement, qui pourrait prendre le relais sur quoi, "
            "et quels patients chroniques nécessitent une vigilance particulière."
        )
        propose = (
            "Mettre par écrit les règles essentielles de fonctionnement de votre cabinet : "
            "à qui adresser quels types de demandes, comment gérer les renouvellements, "
            "qui contacter en cas de problème technique. "
            f"Vous repartez avec un document simple, à jour, partageable avec {sec_label} "
            f"et un remplaçant éventuel. L'assurance qu'en cas d'imprévu, votre cabinet "
            f"ne s'arrête pas net."
        )
    else:
        title = "Compléter ce qui est déjà prévu pour vos absences"
        vu = (
            "Vous avez déjà quelques règles écrites pour le fonctionnement du cabinet sans vous. "
            "Le chantier consiste à les compléter pour mieux tenir un imprévu."
        )
        analyse = (
            "Plus solide que la moyenne, mais probablement perfectible sur les cas extrêmes "
            "(absence longue, arrêt imprévu). Un examen rapide permettrait de combler les "
            "angles morts encore présents."
        )
        pas_confirmer = (
            "Ce qui est déjà couvert et ce qui ne l'est pas encore."
        )
        propose = (
            "Faire un point rapide sur ce qui est en place et compléter ce qui manque. "
            "Vous repartez avec l'assurance que votre cabinet tient même si vous devez vous absenter."
        )

    return {
        "key": "absence",
        "title": title,
        "priority": 3,
        "vu": vu,
        "analyse": analyse,
        "pas_confirmer": pas_confirmer,
        "propose": propose,
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
