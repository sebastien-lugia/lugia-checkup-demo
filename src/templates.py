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
    """Première phrase de la synthèse — style MBTI : ouverture forte qui claque.

    Six patterns selon profil. Chaque pattern commence par un superlatif ou une
    affirmation tranchée, suivi d'une nuance qui ouvre sur la suite. Le ton reste
    respectueux du professionnel.
    """
    porte_seul = _selected_option(answers, "q07") == "q07_a"
    canaux_directs = _selected_option(answers, "q04") == "q04_d"
    debordement_admin = _selected_option(answers, "q05") == "q05_d"
    ferme_conges = _selected_option(answers, "q08") == "q08_d"
    ia_non_conf = _selected_option(answers, "q13") in ("q13_c", "q13_d")
    outils_empiles = _selected_option(answers, "q09") == "q09_d"
    cadre_absent = _selected_option(answers, "q03") in ("q03_c", "q03_d")

    signals_effort = sum([porte_seul, canaux_directs, debordement_admin, ferme_conges])

    # Profil 1 — cabinet tenu par une seule personne (Chateau-type)
    if signals_effort >= 3:
        return (
            "Rares sont les cabinets qui tiennent autant sur une seule personne que le vôtre. "
            "Ce qui le fait tourner aujourd'hui est exactement ce qui le fragilise au moindre "
            "imprévu."
        )

    # Profil 2 — IA grand public + outils empilés
    if ia_non_conf and outils_empiles:
        return (
            "Votre cabinet est en avance sur beaucoup d'autres : vous avez déjà adopté l'IA "
            "pour gagner du temps utile. Reste à transformer ce gain en habitude conforme, "
            "sans en porter seul le risque."
        )

    # Profil 3 — organisation structurée mais débordement administratif
    if debordement_admin and not outils_empiles:
        return (
            "Votre cabinet est plus structuré que la moyenne — sauf sur un point qui se voit "
            "moins : votre temps personnel. C'est la dernière variable que vous arbitrez "
            "encore vous-même."
        )

    # Profil 4 — cadre largement informel (formulation neutre solo/groupe)
    if cadre_absent:
        return (
            "Votre cabinet repose sur des règles qui ne sont pas écrites. "
            "Tenable au quotidien, moins évident dès qu'il faut transmettre, déléguer ou s'absenter."
        )

    # Profil 5 — effort modéré, signaux dispersés
    if signals_effort >= 2:
        return (
            "Votre cabinet tourne, avec deux ou trois points qui pèsent disproportionnellement "
            "plus que les autres. C'est sur eux que se joue votre temps disponible."
        )

    # Profil par défaut — équilibre tenu mais perfectible
    return (
        "Votre cabinet ne présente pas de point de rupture marqué. Quelques fragilités "
        "précises méritent quand même un coup d'œil, et toutes sont à portée."
    )



def build_chaine_causale(answers: list[Any]) -> Optional[str]:
    """Détecte une chaîne causale saillante et la nomme.

    Retourne None si aucune chaîne ne s'applique. Sinon retourne une phrase qui
    relie deux ou trois constats par un lien de cause à conséquence. Pile l'axe 1
    Lugia ("comprendre les causes racines et les interdépendances").
    """
    q01 = _selected_option(answers, "q01")
    q03 = _selected_option(answers, "q03")
    q04 = _selected_option(answers, "q04")
    q05 = _selected_option(answers, "q05")
    q07 = _selected_option(answers, "q07")
    q08 = _selected_option(answers, "q08")
    q09 = _selected_option(answers, "q09")
    q10 = _selected_option(answers, "q10")
    q11 = _selected_option(answers, "q11")
    q13 = _selected_option(answers, "q13")

    # Chaîne 1 — Débordement admin causé par canaux directs + cadre flou
    if q05 == "q05_d" and q04 == "q04_d" and q03 in ("q03_c", "q03_d"):
        return (
            "Votre débordement administratif tient à un double facteur : des canaux directs "
            "qui multiplient les sollicitations, et un cadre flou qui empêche votre secrétariat "
            "de les absorber."
        )

    # Chaîne 2 — Fragilité continuité causée par solo + isolement + pas de dispositif
    if q08 in ("q08_c", "q08_d") and q07 == "q07_a" and q01 == "q01_a":
        return (
            "La fragilité de continuité que vous décrivez n'est pas isolée : elle découle de "
            "votre fonctionnement en solo, sans renfort régulier ni dispositif partagé pour "
            "vos absences."
        )

    # Chaîne 3 — Usage IA grand public causé par besoin réel + stack peu intégré
    if q13 in ("q13_c", "q13_d") and q09 == "q09_d":
        return (
            "Votre usage de l'IA grand public n'est pas un défaut isolé : c'est un besoin de "
            "rédaction structurée auquel vos outils actuels, nombreux et peu intégrés, ne "
            "savent pas répondre. Le canal grand public comble ce manque, faute d'alternative."
        )

    # Chaîne 4 — Perte de vue des chroniques causée par solo + pas d'alerte
    if q10 == "q10_d" and q07 == "q07_a":
        return (
            "Le suivi de vos patients chroniques repose entièrement sur leur initiative — "
            "parce que vous portez seul l'organisation, et que vos outils n'envoient pas d'alerte."
        )

    # Chaîne 5 — Tri opportuniste des résultats causé par isolement + pas d'alerte
    if q11 == "q11_d" and q07 == "q07_a":
        return (
            "Le tri opportuniste des résultats que vous décrivez est moins un choix qu'une "
            "conséquence : seul à porter la vigilance, sans système d'alerte ni délégation."
        )

    return None



def build_synthesis(answers: list[Any]) -> str:
    """Compose la synthèse de la page de résultats.

    Retourne un fragment HTML. Le dernier passage est entouré de
    `<em>...</em>` pour rendre l'italique coloré côté CSS.

    V1.1 Vague 3.1d : phrase choc style MBTI en tête, recommandation italique
    réintroduit la thèse Lugia "vue d'ensemble avant chantier".
    """
    phrase_choc = build_phrase_choc(answers)

    outils = derive_outils_principaux(answers)
    externalisations = derive_externalisations(answers)
    description_1 = description_demandes_directes(answers)
    description_2 = description_usage_ia(answers)

    # Ce qui tient au quotidien
    org_items: list[str] = []
    if outils:
        org_items.append(outils)
    if externalisations:
        org_items.append(externalisations)
    if org_items:
        organisation = " Au quotidien, vous vous appuyez sur " + ", ".join(org_items) + "."
    else:
        organisation = ""

    # Ce qui demande attention
    # V1.1 Vague 3.1j : si une chaîne causale s'applique, on la nomme à la place
    # d'une simple énumération. Pile l'axe 1 Lugia "causes racines et interdépendances".
    chaine = build_chaine_causale(answers)
    if chaine:
        zone = " " + chaine
    else:
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

    # Recommandation Lugia (italique) — thèse "vision claire avant chantier"
    if description_2:
        recommandation = (
            " <em>Avant d'engager un chantier précis, Lugia commence par poser une vue "
            "d'ensemble de votre organisation — c'est là que les vrais leviers apparaissent. "
            "Pour vous, le geste qui pèse ensuite le plus est de remplacer votre usage actuel "
            "de l'IA par un environnement conforme au secret médical.</em>"
        )
    elif descriptions:
        recommandation = (
            " <em>Avant d'engager un chantier précis, Lugia commence par poser une vue "
            "d'ensemble de votre organisation. Une heure suffit à confirmer cette lecture "
            "et décider ensemble par lequel commencer.</em>"
        )
    else:
        recommandation = (
            " <em>Lugia commence toujours par poser une vue d'ensemble de votre organisation. "
            "Une heure suffit à confirmer cette lecture et identifier le premier geste qui "
            "simplifiera votre semaine.</em>"
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

    # Q08 — résilience aux absences (sémantique Vague 3.1j : planifié + imprévu)
    q08 = _selected_option(answers, "q08")
    if q08 == "q08_d":
        parts.append(
            "Aucun dispositif n'est prévu pour vos absences, planifiées ou non — le cabinet ferme dans les deux cas."
        )
    elif q08 == "q08_c":
        parts.append(
            "Vos congés se passent bien, mais une absence imprévue de plusieurs jours serait difficile à absorber."
        )
    elif q08 == "q08_b":
        parts.append(
            "Un confrère ou un remplaçant prend le relais en cas d'absence, planifiée comme imprévue."
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
