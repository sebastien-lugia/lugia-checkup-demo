"""Génération des textes du rapport de check-up.

Implémente les templates documentés dans `resources/output_templates.md`.
Substitue les placeholders à partir des réponses stockées dans la base.

V0 : templates simples avec composition conditionnelle basée sur les
options sélectionnées et les compléments textuels. Aucun appel LLM.

V1+ : génération contextuelle par LLM contraint par schéma JSON et
exemples few-shot. Voir `ROADMAP.md`.
"""

from __future__ import annotations

import re
from datetime import date
from typing import Any, Optional

from src import db


# Liste blanche des outils reconnus dans les compléments de réponses
KNOWN_TOOLS = [
    "Maiia", "Doctolib", "Lifen", "Mailiz", "MSSanté", "Mon Sisra",
    "Mediadict", "Hellodoc", "Weda", "Keldoc", "Apicrypt", "Dragon",
    "Whispr", "Nabla",
]


# ---- Helpers de lecture des réponses ----

def _get_answer(answers: list[Any], question_id: str) -> Optional[Any]:
    """Retourne la réponse à une question par son id, ou None."""
    for a in answers:
        if a["question_id"] == question_id:
            return a
    return None


def _selected_option(answers: list[Any], question_id: str) -> Optional[str]:
    """Retourne l'id de l'option sélectionnée pour une question, ou None."""
    a = _get_answer(answers, question_id)
    return a["selected_option"] if a else None


def _complement(answers: list[Any], question_id: str) -> Optional[str]:
    """Retourne le texte de complément pour une question, ou None."""
    a = _get_answer(answers, question_id)
    return a["complement_text"] if a else None


# ---- Dérivation des placeholders ----

def derive_outils_principaux(answers: list[Any], max_tools: int = 2) -> Optional[str]:
    """Extrait les noms d'outils mentionnés dans Q09 complement_text.

    Retourne une chaîne formatée comme "Maiia et Doctolib" ou None.
    """
    text = _complement(answers, "q09")
    if not text:
        return None
    found: list[str] = []
    for tool in KNOWN_TOOLS:
        if tool in text and tool not in found:
            found.append(tool)
        if len(found) >= max_tools:
            break
    if not found:
        return None
    if len(found) == 1:
        return found[0]
    return f"{found[0]} et {found[1]}"


def derive_duree_secretariat(answers: list[Any]) -> Optional[str]:
    """Extrait la durée depuis Q02 complement_text via regex."""
    text = _complement(answers, "q02")
    if not text:
        return None
    m = re.search(r"(\d+\s+(?:mois|ans?))", text, re.IGNORECASE)
    return m.group(1) if m else None


def derive_predecessor_name(answers: list[Any]) -> Optional[str]:
    """Extrait le nom d'un éventuel prédécesseur depuis Q02 complement_text."""
    text = _complement(answers, "q02")
    if not text:
        return None
    m = re.search(r"d[ée]part\s+de\s+([A-ZÀ-ÿ][a-zà-ÿ]+)", text)
    return m.group(1) if m else None


def derive_secretariat_label(answers: list[Any]) -> str:
    """Retourne le libellé court du secrétariat pour usage en sujet/possessif."""
    selected = _selected_option(answers, "q02")
    if selected == "q02_a":
        return "votre secrétariat interne"
    if selected == "q02_b":
        return "votre télésecrétariat"
    if selected == "q02_c":
        return "votre secrétariat"
    if selected == "q02_d":
        return "vos canaux internes"
    return "votre secrétariat"


def derive_secretariat_with_du(answers: list[Any]) -> str:
    """Variante précédée de 'du/de' pour usage après préposition 'de'."""
    selected = _selected_option(answers, "q02")
    if selected == "q02_a":
        return "du secrétariat interne"
    if selected == "q02_b":
        return "du télésecrétariat"
    if selected == "q02_c":
        return "du secrétariat"
    if selected == "q02_d":
        return "de vos canaux internes"
    return "du secrétariat"


def derive_externalisations(answers: list[Any]) -> Optional[str]:
    """Construit la phrase d'externalisations à partir de Q02."""
    selected = _selected_option(answers, "q02")
    duree = derive_duree_secretariat(answers)
    if selected == "q02_b":
        return f"votre télésecrétariat depuis {duree}" if duree else "votre télésecrétariat externalisé"
    if selected == "q02_a":
        return "votre secrétariat interne"
    if selected == "q02_c":
        return "votre dispositif de secrétariat mixte"
    return None


def derive_enjeu_temporel() -> str:
    """Retourne la mention de l'enjeu facturation électronique si pertinent."""
    today = date.today()
    target = date(2026, 9, 1)
    if today < target and (target - today).days < 200:
        return " — y compris la facturation électronique de septembre"
    return ""


# ---- Phrases de fragilité (utilisées par la synthèse) ----

def fragilite_flux_entrant(answers: list[Any]) -> Optional[str]:
    """Décrit la fragilité de flux entrant si Q04 = q04_d."""
    if _selected_option(answers, "q04") != "q04_d":
        return None
    sec = derive_secretariat_label(answers)
    return f"des appels et messages directs de patients que vous traitez en plus de {sec}"


def fragilite_ia(answers: list[Any]) -> Optional[str]:
    """Décrit la fragilité IA selon Q13."""
    selected = _selected_option(answers, "q13")
    if selected == "q13_d":
        return (
            "l'usage que vous faites de ChatGPT pour vos courriers en sachant "
            "que ce n'est pas tout à fait conforme"
        )
    if selected == "q13_c":
        return (
            "l'usage que vous faites de ChatGPT pour vos courriers, avec une "
            "anonymisation manuelle dont vous savez les limites"
        )
    return None


# ---- Synthèse complète ----

def build_synthesis(answers: list[Any]) -> str:
    """Compose la synthèse de la page de résultats.

    Retourne un fragment HTML/Markdown. Le dernier passage est entouré de
    `<em>...</em>` pour rendre l'italique coloré côté CSS.
    """
    outils = derive_outils_principaux(answers)
    externalisations = derive_externalisations(answers)
    fragilite_1 = fragilite_flux_entrant(answers)
    fragilite_2 = fragilite_ia(answers)
    enjeu = derive_enjeu_temporel()

    # Ouverture
    porte_seul = _selected_option(answers, "q08") in ("q08_c", "q08_d") or \
                 _selected_option(answers, "q07") == "q07_a"
    if porte_seul:
        opening = "Votre cabinet tourne, mais entièrement grâce à vous."
    else:
        opening = "Votre cabinet tourne, avec quelques zones à clarifier."

    # Organisation reconnue
    org_items: list[str] = []
    if outils:
        org_items.append(outils)
    if externalisations:
        org_items.append(externalisations)
    if org_items:
        organisation = " Vous avez bâti une organisation efficace : " + ", ".join(org_items) + "."
    else:
        organisation = ""

    # Fragilités principales
    fragilites = [f for f in (fragilite_1, fragilite_2) if f]
    if len(fragilites) >= 2:
        zone = (
            " Pourtant deux zones vous fatiguent sans que vous puissiez bien les nommer : "
            f"{fragilites[0]}, et {fragilites[1]}."
        )
    elif len(fragilites) == 1:
        zone = f" Une zone vous fatigue sans que vous puissiez bien la nommer : {fragilites[0]}."
    else:
        zone = ""

    # Recommandation Lugia (italique)
    if fragilite_2:
        recommandation = (
            " <em>Avant tout autre chantier, et avant d'ajouter un agent ou un nouvel outil, "
            "ce qui vous aiderait le plus est de remplacer votre usage actuel de l'IA par un "
            f"environnement adapté au secret médical, qui pourra ensuite vous aider à "
            f"structurer le reste{enjeu}.</em>"
        )
    else:
        recommandation = (
            " <em>La première chose qui vous aiderait est de prendre une vue d'ensemble de "
            f"votre fonctionnement, pour décider à votre rythme par où commencer{enjeu}.</em>"
        )

    return opening + organisation + zone + recommandation


# ---- Résumés par facette ----

def build_processes_summary(answers: list[Any]) -> str:
    """Compose le résumé qualitatif de la facette Processus & activités."""
    parts: list[str] = []

    # Reconnaissance de l'outillage si Q09 a une réponse
    if _selected_option(answers, "q09") is not None:
        parts.append("Votre prise de rendez-vous et le tunnel patient fonctionnent grâce à vos outils.")

    # Fragilité flux entrant (Q04)
    if _selected_option(answers, "q04") == "q04_d":
        sec = derive_secretariat_label(answers)
        parts.append(
            f"Mais une part des demandes vous arrive en direct (appels mobile, SMS, mails), "
            f"en plus de {sec}. Ce flux parallèle n'est tracé nulle part."
        )
    elif _selected_option(answers, "q05") == "q05_d":
        parts.append(
            "Mais votre charge administrative déborde le soir et le week-end, et vous compensez "
            "ce qui ne se voit pas la journée."
        )

    return " ".join(parts) if parts else "Pas assez de données pour résumer cette facette."


def build_participants_summary(answers: list[Any]) -> str:
    """Compose le résumé qualitatif de la facette Participants."""
    parts: list[str] = []

    # Référence au passé : si Q02 mentionne un départ et une durée
    duree = derive_duree_secretariat(answers)
    pred = derive_predecessor_name(answers)
    if pred and duree:
        parts.append(f"Depuis le départ de {pred} il y a {duree}, rien n'est écrit.")
    elif duree and _selected_option(answers, "q02") in ("q02_b", "q02_c"):
        parts.append(f"Depuis le passage à votre secrétariat actuel il y a {duree}, rien n'est écrit.")
    else:
        parts.append("Le fonctionnement du cabinet n'est pas formalisé par écrit.")

    # Cadre flou du secrétariat (Q03)
    q03 = _selected_option(answers, "q03")
    if q03 in ("q03_c", "q03_d"):
        sec = derive_secretariat_label(answers).capitalize()
        parts.append(f"{sec} travaille avec des règles que vous n'avez jamais cadrées avec eux.")

    # Continuité fragile (Q08)
    q08 = _selected_option(answers, "q08")
    if q08 == "q08_d":
        parts.append("Si vous deviez vous arrêter une semaine, personne ne saurait précisément que faire.")
    elif q08 == "q08_c":
        parts.append(
            "Si vous deviez vous arrêter une semaine, votre secrétariat pourrait gérer les rendez-vous "
            "mais le reste serait compliqué."
        )

    return " ".join(parts) if parts else "Pas assez de données pour résumer cette facette."


def build_information_summary(answers: list[Any]) -> str:
    """Compose le résumé qualitatif de la facette Information."""
    parts: list[str] = []

    # Reconnaissance de l'arrivée des informations
    if _selected_option(answers, "q09") is not None:
        parts.append("Vos résultats, courriers et ordonnances arrivent bien dans vos outils.")

    # Fragilités
    fragilites: list[str] = []
    if _selected_option(answers, "q10") == "q10_d":
        fragilites.append("aucun patient chronique qui ne revient pas ne vous remonte d'alerte")
    elif _selected_option(answers, "q10") == "q10_c":
        fragilites.append("le suivi des patients chroniques se fait au cas par cas, quand vous y pensez")

    if _selected_option(answers, "q11") == "q11_d":
        fragilites.append(
            "un résultat vu en retard reste possible — comme cela s'est produit il y a quelques mois"
        )

    if fragilites:
        parts.append("Mais " + ", et ".join(fragilites) + ".")

    return " ".join(parts) if parts else "Pas assez de données pour résumer cette facette."


def build_facet_summary(facet: str, answers: list[Any]) -> str:
    """Dispatcher : compose le résumé de la facette demandée."""
    if facet == "processes":
        return build_processes_summary(answers)
    if facet == "participants":
        return build_participants_summary(answers)
    if facet == "information":
        return build_information_summary(answers)
    return "Pas de résumé disponible pour cette facette."


# ---- Recommandation de prochaine étape ----

def build_next_step_recommendation(
    facet_scores: dict[str, Optional[dict[str, Any]]],
    answers: list[Any],
) -> str:
    """Retourne l'identifiant de l'option recommandée (autonomie / lugia / terrain)."""
    valid_scores = [
        s["score"] for s in facet_scores.values()
        if s is not None and s.get("score") is not None
    ]
    if not valid_scores:
        return "lugia"
    if all(s >= 7 for s in valid_scores):
        return "autonomie"
    # En V0 par défaut : recommander l'échange Lugia (entrée de gamme la moins engageante)
    return "lugia"
