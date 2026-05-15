"""Génération des textes du rapport de check-up.

Implémente les templates documentés dans `resources/output_templates.md`.
Substitue les placeholders à partir des réponses stockées dans la base.

V0 : templates simples avec composition conditionnelle basée sur les
options sélectionnées et les compléments textuels. Aucun appel LLM.

V1.1 lite : vulgarisation du jargon WSF, suppression des citations
nominatives d'outils (généralisation par catégorie), formulations
factuelles non-dramatiques.

V1.2+ : génération contextuelle par SLM/LLM (voir DECISIONS.md D-020).
"""

from __future__ import annotations

import re
from typing import Any, Optional

from src import db


# Outils nommés → catégorie générique (V1.1 lite : on ne cite plus les marques)
TOOL_CATEGORIES: dict[str, str] = {
    "Maiia": "logiciel métier",
    "Weda": "logiciel métier",
    "Hellodoc": "logiciel métier",
    "Doctolib": "plateforme de rendez-vous",
    "Keldoc": "plateforme de rendez-vous",
    "Lifen": "outil d'envoi de courriers",
    "Mailiz": "messagerie sécurisée",
    "MSSanté": "messagerie sécurisée",
    "Apicrypt": "messagerie sécurisée",
    "Mon Sisra": "messagerie régionale",
    "Mediadict": "logiciel de dictée",
    "Dragon": "logiciel de dictée",
    "Whispr": "logiciel de dictée",
    "Nabla": "outil d'IA spécialisé",
}

# Conserve la liste pour la détection (extraction depuis les compléments libres)
KNOWN_TOOLS = list(TOOL_CATEGORIES.keys())


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


# ---- Dérivation des placeholders (généralisée, sans citations nominatives) ----

def derive_outils_principaux(answers: list[Any], max_tools: int = 2) -> Optional[str]:
    """Retourne une description générique des outils mentionnés en Q09 complement_text.

    Exemple : si "Maiia" et "Doctolib" sont détectés, retourne "votre logiciel
    métier et votre plateforme de rendez-vous" — pas les marques.
    """
    text = _complement(answers, "q09")
    if not text:
        return None
    found_categories: list[str] = []
    for tool, category in TOOL_CATEGORIES.items():
        if tool in text and category not in found_categories:
            found_categories.append(category)
        if len(found_categories) >= max_tools:
            break
    if not found_categories:
        return None
    if len(found_categories) == 1:
        return f"votre {found_categories[0]}"
    return f"votre {found_categories[0]} et votre {found_categories[1]}"


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
        return f"votre télésecrétariat depuis {duree}" if duree else "votre télésecrétariat"
    if selected == "q02_a":
        return "votre secrétariat interne"
    if selected == "q02_c":
        return "votre secrétariat mixte"
    return None




# ---- Phrases descriptives pour la synthèse ----

def description_demandes_directes(answers: list[Any]) -> Optional[str]:
    """Décrit la situation de réception directe de demandes (Q04 = q04_d)."""
    if _selected_option(answers, "q04") != "q04_d":
        return None
    sec = derive_secretariat_label(answers)
    return f"des appels et messages directs de patients que vous traitez en plus de {sec}"


def description_usage_ia(answers: list[Any]) -> Optional[str]:
    """Décrit la situation d'usage d'une IA grand public selon Q13."""
    selected = _selected_option(answers, "q13")
    if selected == "q13_d":
        return (
            "l'usage que vous faites d'un outil d'IA grand public pour vos courriers, "
            "en sachant que ce n'est pas une vraie garantie de secret médical"
        )
    if selected == "q13_c":
        return (
            "l'usage que vous faites d'un outil d'IA grand public pour vos courriers, "
            "avec une anonymisation à la main dont vous connaissez les limites"
        )
    return None


# ---- Synthèse complète ----

def build_phrase_choc(answers: list[Any]) -> str:
    """Première phrase analytique de la synthèse — pose une lecture du cabinet,
    pas une description.

    Logique : on identifie le profil saillant (effort personnel concentré,
    organisation informelle, accumulation d'outils, IA non conforme) et on
    sélectionne la phrase la plus juste. Le ton reste factuel et accompagnant,
    jamais accusateur.
    """
    porte_seul = _selected_option(answers, "q07") == "q07_a"
    canaux_directs = _selected_option(answers, "q04") == "q04_d"
    debordement_admin = _selected_option(answers, "q05") == "q05_d"
    ferme_conges = _selected_option(answers, "q08") == "q08_d"
    ia_non_conf = _selected_option(answers, "q13") in ("q13_c", "q13_d")
    outils_empiles = _selected_option(answers, "q09") == "q09_d"
    cadre_absent = _selected_option(answers, "q03") in ("q03_c", "q03_d")

    # Profil 1 : effort personnel concentré (le médecin porte le système)
    signals_effort = sum([porte_seul, canaux_directs, debordement_admin, ferme_conges])
    if signals_effort >= 3:
        return (
            "Votre cabinet tient — mais il tient surtout par votre effort personnel, "
            "plus que par les dispositifs qui l'entourent."
        )

    # Profil 2 : organisation informelle + outils nombreux
    if cadre_absent and outils_empiles:
        return (
            "Votre cabinet fonctionne au quotidien, mais sur une organisation principalement "
            "informelle, répartie entre plusieurs outils qui ne sont pas vraiment connectés."
        )

    # Profil 3 : IA grand public au cœur du fonctionnement
    if ia_non_conf and (outils_empiles or debordement_admin):
        return (
            "Votre cabinet a déjà intégré l'IA pour gagner du temps utile — c'est une avancée, "
            "qu'il reste à sécuriser pour qu'elle dure."
        )

    # Profil 4 : effort personnel modéré
    if signals_effort >= 2:
        return (
            "Votre cabinet tourne. Quelques points portent un poids plus lourd que d'autres "
            "et méritent d'être regardés ensemble."
        )

    # Profil par défaut
    return (
        "Votre cabinet présente un équilibre tenu sur plusieurs points sensibles "
        "qui méritent une attention coordonnée."
    )


def build_synthesis(answers: list[Any]) -> str:
    """Compose la synthèse de la page de résultats.

    Retourne un fragment HTML. Le dernier passage est entouré de
    `<em>...</em>` pour rendre l'italique coloré côté CSS.

    V1.1 Vague 3.1 : ajout d'une phrase choc analytique en tête (build_phrase_choc),
    suppression de la mention facturation électronique de septembre,
    recommandation italique reformulée plus directe.
    """
    phrase_choc = build_phrase_choc(answers)

    outils = derive_outils_principaux(answers)
    externalisations = derive_externalisations(answers)
    description_1 = description_demandes_directes(answers)
    description_2 = description_usage_ia(answers)

    # Ce qui tient au quotidien (factuel, sans jugement positif/négatif)
    org_items: list[str] = []
    if outils:
        org_items.append(outils)
    if externalisations:
        org_items.append(externalisations)
    if org_items:
        organisation = " Au quotidien, vous vous appuyez sur " + ", ".join(org_items) + "."
    else:
        organisation = ""

    # Ce qui demande encore de l'attention
    descriptions = [d for d in (description_1, description_2) if d]
    if len(descriptions) >= 2:
        zone = (
            " Deux points méritent d'être regardés en priorité : "
            f"{descriptions[0]}, et {descriptions[1]}."
        )
    elif len(descriptions) == 1:
        zone = f" Un point mérite d'être regardé en priorité : {descriptions[0]}."
    else:
        zone = ""

    # Recommandation Lugia (italique) — sans mention facturation électronique
    if description_2:
        recommandation = (
            " <em>Le geste qui pèse le plus aujourd'hui est de remplacer votre usage actuel "
            "de l'IA par un environnement conforme au secret médical. Une fois ce socle posé, "
            "le reste s'organise plus naturellement.</em>"
        )
    elif descriptions:
        recommandation = (
            " <em>Une heure avec Lugia suffit à reprendre ces points avec vous et décider "
            "ensemble par lequel commencer, sans engagement ni jugement.</em>"
        )
    else:
        recommandation = (
            " <em>Une heure avec Lugia peut vous aider à confirmer cette lecture et identifier "
            "le premier geste qui simplifiera votre semaine.</em>"
        )

    return phrase_choc + organisation + zone + recommandation



def build_processes_summary(answers: list[Any]) -> str:
    """Compose le résumé qualitatif de la facette Parcours patient."""
    parts: list[str] = []

    # Reconnaissance de l'outillage si Q09 a une réponse
    if _selected_option(answers, "q09") is not None:
        parts.append(
            "Votre prise de rendez-vous et le parcours de vos patients sont bien outillés."
        )

    # Demandes en direct (Q04)
    if _selected_option(answers, "q04") == "q04_d":
        sec = derive_secretariat_label(answers)
        parts.append(
            f"Mais une part des demandes vous arrive en direct (appels mobile, SMS, mails), "
            f"en plus de {sec}. Ces demandes ne sont pas tracées."
        )
    elif _selected_option(answers, "q05") == "q05_d":
        parts.append(
            "Mais votre charge administrative déborde le soir et le week-end. "
            "Vous compensez ce qui ne se voit pas la journée."
        )

    return " ".join(parts) if parts else "Pas assez de données pour résumer cette facette."


def build_participants_summary(answers: list[Any]) -> str:
    """Compose le résumé qualitatif de la facette Équipe et secrétariat."""
    parts: list[str] = []

    # Référence au passé : si Q02 mentionne un départ et une durée
    duree = derive_duree_secretariat(answers)
    pred = derive_predecessor_name(answers)
    if pred and duree:
        parts.append(f"Depuis le départ de {pred} il y a {duree}, rien n'est écrit.")
    elif duree and _selected_option(answers, "q02") in ("q02_b", "q02_c"):
        parts.append(
            f"Depuis le passage à votre secrétariat actuel il y a {duree}, rien n'est écrit."
        )
    else:
        parts.append("Le fonctionnement du cabinet n'est pas formalisé par écrit.")

    # Niveau de cadrage du secrétariat (Q03 — axe homogène V1.1 Vague 3.1)
    q03 = _selected_option(answers, "q03")
    if q03 == "q03_d":
        sec = derive_secretariat_label(answers).capitalize()
        parts.append(
            f"{sec} fonctionne sans cadre formel — chaque cas est tranché au moment où il se présente."
        )
    elif q03 == "q03_c":
        sec = derive_secretariat_label(answers).capitalize()
        parts.append(
            f"{sec} dispose de règles écrites qui ne sont pas appliquées au quotidien."
        )
    elif q03 == "q03_b":
        sec = derive_secretariat_label(answers).capitalize()
        parts.append(
            f"{sec} travaille avec un cadre oral défini au démarrage, jamais formalisé depuis."
        )

    # Que se passe-t-il en cas d'absence prolongée (Q08)
    q08 = _selected_option(answers, "q08")
    if q08 == "q08_d":
        parts.append(
            "Pendant vos congés, le cabinet ferme — c'est la solution que vous avez retenue, "
            "faute d'un dispositif préparé en amont."
        )
    elif q08 == "q08_c":
        parts.append(
            "Pendant vos absences, votre secrétariat tient les rendez-vous et l'accueil ; "
            "le reste attend votre retour."
        )

    return " ".join(parts) if parts else "Pas assez de données pour résumer cette facette."


def build_information_summary(answers: list[Any]) -> str:
    """Compose le résumé qualitatif de la facette Outils et dossiers."""
    parts: list[str] = []

    # Reconnaissance de l'arrivée des informations
    if _selected_option(answers, "q09") is not None:
        parts.append("Vos résultats, courriers et ordonnances arrivent bien dans vos outils.")

    # Points qui demandent attention
    points: list[str] = []
    if _selected_option(answers, "q10") == "q10_d":
        points.append(
            "aucun signal ne vous remonte quand un patient chronique cesse de revenir"
        )
    elif _selected_option(answers, "q10") == "q10_c":
        points.append(
            "le suivi des patients chroniques se fait au cas par cas, quand vous y pensez"
        )

    if _selected_option(answers, "q11") == "q11_d":
        points.append(
            "le tri des résultats se fait sans rythme défini, ce qui peut laisser passer un signal"
        )

    if points:
        parts.append("Mais " + ", et ".join(points) + ".")

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
    """Retourne l'identifiant de l'option recommandée (autonomie / lugia / terrain).

    V1.1 : 'autonomie' n'est plus une recommandation valable car interprétée
    comme "tirez-vous une balle dans le pied" par les premiers prospects.
    Les 3 options sont 3 niveaux d'engagement chez Lugia, donc on ne
    recommande jamais l'auto-promotion en autonomie pure.
    """
    valid_scores = [
        s["score"] for s in facet_scores.values()
        if s is not None and s.get("score") is not None
    ]
    if not valid_scores:
        return "lugia"
    # Si tout va très bien, on recommande quand même l'échange (entrée
    # de gamme la moins engageante) plutôt que l'autonomie pure.
    return "lugia"
