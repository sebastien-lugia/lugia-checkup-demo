"""Génération des textes du rapport de check-up.

Implémente les templates documentés dans `resources/output_templates.md`.
Substitue les placeholders à partir des réponses stockées dans la base.

V0 : templates simples avec composition conditionnelle basée sur les
options sélectionnées et les compléments textuels. Aucun appel LLM.

V1.1 lite : vulgarisation du jargon WSF, suppression des citations
nominatives d'outils (généralisation par catégorie), formulations
factuelles non-dramatiques.

V1.1 Vague 2.2 : chaque pattern (phrase choc, recommandation italique,
chaîne causale, analyse chantier) expose désormais plusieurs variantes
en liste. La sélection est déterministe par `_pick_variant(interview_id,
variants, section_key)` — deux médecins du même profil voient un wording
différent, un même médecin qui rouvre son rapport voit le même rendu.
Sel par section pour que les sections ne shiftent pas en bloc entre deux
profils similaires. Voir DECISIONS.md D-022 et TODO.md Vague 2.2.

V1.2+ : génération contextuelle par SLM/LLM (voir DECISIONS.md D-020).
"""

from __future__ import annotations

import hashlib
import re
from typing import Any, Optional, Sequence

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


# ---- Sélection déterministe des variantes (V1.1 Vague 2.2) ----

def _pick_variant(
    interview_id: Optional[int],
    variants: Sequence[Any],
    section_key: str,
) -> Any:
    """Sélectionne une variante de manière déterministe.

    Le hash combine `interview_id` et `section_key` (sel par section) pour que
    deux sections du même rapport piochent indépendamment : deux médecins du
    même profil reçoivent un mélange varié de wordings, pas une translation
    en bloc d'un même rapport.

    Stable cross-runs : `hashlib.md5` est utilisé sur la concaténation
    string, contrairement à `hash()` Python dont la salaison change entre
    processus pour les strings.

    Si `interview_id` est `None` (chemin V0 Streamlit figé, ou contexte de
    test sans interview), retourne la première variante. Le comportement est
    alors strictement identique à V1.1 single-variant.

    Args:
        interview_id: identifiant de l'interview, ou `None` pour fallback.
        variants: séquence non vide de variantes (typiquement des `str`).
        section_key: clé courte de la section (ex: "phrase_choc:porteur_solo").
            Doit être stable d'une exécution à l'autre.

    Returns:
        L'élément sélectionné dans `variants`.

    Raises:
        ValueError: si `variants` est vide.
    """
    if not variants:
        raise ValueError("variants ne peut pas être vide")
    if interview_id is None:
        return variants[0]
    key = f"{interview_id}:{section_key}".encode("utf-8")
    digest = hashlib.md5(key).hexdigest()
    idx = int(digest, 16) % len(variants)
    return variants[idx]


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


def derive_entity_name(answers: list[Any], question_id: str) -> Optional[str]:
    """Retourne le prénom de l'entité associée à l'option choisie pour une
    question donnée, ou None si non saisi.

    V1.1.5-i : ce mécanisme s'appuie sur la colonne `entity_name` de la table
    `answer`. Seules les options portant `has_entity_field: true` dans
    interview_protocol.json déclenchent la saisie côté frontend (Q02 et Q07
    pour l'instant).

    Le fallback est systématique : si entity_name est None, vide ou
    composé d'espaces, on retourne None et l'appelant utilise sa
    formulation générique. Aucune invention de prénom, jamais — cf
    MASTER_PROMPT §8 (garde-fous).

    Args:
        answers: liste des réponses de l'interview.
        question_id: id de la question (ex. "q02", "q07").

    Returns:
        Le prénom (str non vide) ou None.
    """
    a = _get_answer(answers, question_id)
    if a is None:
        return None
    name = a.get("entity_name") if hasattr(a, "get") else None
    if not name:
        return None
    name = name.strip()
    return name if name else None


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

def build_phrase_choc(answers: list[Any], interview_id: Optional[int] = None) -> str:
    """Première phrase de la synthèse — interroge une zone aveugle systémique.

    Six patterns selon profil. Chaque pattern expose 4 variantes :
    sélection déterministe par hash (`_pick_variant`). Sel par section pour
    que deux médecins du même profil reçoivent un wording distinct.

    Principe éditorial (refonte 2026-05-16) : la phrase choc ne conforte
    pas le médecin dans sa pratique et ne la critique pas non plus. Elle
    nomme une zone aveugle systémique — absence de mesure, absence de
    trace, dépendance silencieuse, frictions absorbées sans signal — que
    le check-up est précisément censé rendre visible.

    Args:
        answers: liste des réponses de l'interview.
        interview_id: identifiant pour la sélection déterministe. Si `None`,
            la première variante de chaque pattern est retournée.
    """
    porte_seul = _selected_option(answers, "q07") == "q07_a"
    canaux_directs = _selected_option(answers, "q04") == "q04_d"
    debordement_admin = _selected_option(answers, "q05") == "q05_d"
    ferme_conges = _selected_option(answers, "q08") == "q08_d"
    ia_non_conf = _selected_option(answers, "q13") in ("q13_c", "q13_d")
    outils_empiles = _selected_option(answers, "q09") == "q09_d"
    cadre_absent = _selected_option(answers, "q03") in ("q03_c", "q03_d")

    signals_effort = sum([porte_seul, canaux_directs, debordement_admin, ferme_conges])

    # Profil 1 — IA grand public + outils empilés (régulatoire prioritaire)
    if ia_non_conf and outils_empiles:
        variants = [
            (
                "Vous avez intégré l'IA dans votre quotidien — un courrier au spécialiste "
                "reformulé en deux minutes, un compte-rendu structuré rapidement. L'outil que "
                "vous utilisez <strong>n'a pourtant pas de lien contractuel avec votre cabinet</strong> : il "
                "fonctionne sous des conditions générales pensées pour un usage grand public, "
                "pas pour une activité médicale."
            ),
            (
                "Chaque fois que vous demandez à votre outil d'IA de reformuler ou de résumer, "
                "vous lui transmettez du contenu médical — souvent anonymisé partiellement, "
                "parfois pas. Ce transfert <strong>ne déclenche aucune alerte, ne laisse aucune trace</strong> "
                "dans votre cabinet, et ne pourrait pas être restitué si un patient ou un "
                "confrère vous le demandait."
            ),
            (
                "Le bénéfice que vous tirez de l'IA est immédiat. Le risque, lui, est <strong>différé et personnel</strong>"
                " : en cas d'incident sur des données transmises, la responsabilité "
                "revient au médecin qui en fait usage, pas à l'outil grand public."
            ),
            (
                "Pour l'instant, ce qui empêche un problème dans votre usage de l'IA, c'est "
                "<strong>votre attention au moment de la saisie</strong> — anonymiser un nom, retirer une date "
                "de naissance, vérifier qu'aucun identifiant ne reste. C'est un dispositif "
                "solide tant qu'il tient — mais c'est aussi le seul dispositif en place."
            ),
        ]
        return _pick_variant(interview_id, variants, "phrase_choc:ia_stack")

    # Profil 2 — débordement perso (cabinet structuré mais charge déborde le soir)
    if debordement_admin and not outils_empiles:
        variants = [
            (
                "L'unique indicateur qui détecte une surcharge de votre cabinet aujourd'hui, "
                "c'est <strong>votre fatigue</strong>. Tant que vous arrivez à finir vos courriers et vos "
                "comptes-rendus le soir ou pendant un weekend, le système considère que tout "
                "va bien — et continue à fonctionner à ce niveau."
            ),
            (
                "Travailler le soir et le weekend pour finir vos courriers, vos comptes-rendus "
                "ou votre tri de résultats est devenu une partie attendue de votre semaine. "
                "Cette habitude rend votre cabinet équilibré sur le papier — mais elle déplace "
                "la frontière entre votre temps professionnel et votre temps personnel sans "
                "qu'aucun signal ne la rappelle."
            ),
            (
                "Votre temps personnel sert aujourd'hui de marge de manœuvre pour votre "
                "cabinet. À la différence des autres ressources de votre cabinet — secrétariat, "
                "logiciel métier, plage horaire, remplaçant ponctuel — celle-ci <strong>n'est ni "
                "achetable, ni délégable, ni illimitée</strong>."
            ),
            (
                "Le débordement administratif que vous décrivez — courriers à finir, "
                "comptes-rendus à reformuler, mails à trier — ne déclenche aujourd'hui ni "
                "alerte d'outil, ni signal de planning, ni discussion en équipe. Il est "
                "entièrement absorbé par vous, invisible pour le système."
            ),
        ]
        return _pick_variant(interview_id, variants, "phrase_choc:debordement_perso")

    # Profil 3 — cadre largement informel (formulation neutre solo/groupe)
    if cadre_absent:
        variants = [
            (
                "Votre cabinet fonctionne sur des règles non écrites — qui décide quoi, qui "
                "prévient qui, comment réagir à un cas urgent. Cette informalité le rend très "
                "adaptable au quotidien, et fait qu'<strong>aucune de ces règles n'existerait pour un "
                "remplaçant</strong> ou un nouveau secrétaire qui arriverait demain."
            ),
            (
                "Vos règles d'organisation existent dans la pratique et la conversation. <strong>Un "
                "remplaçant qui débarquerait demain n'aurait pas de document à consulter</strong> sur ce "
                "qu'il faut faire d'un appel pour un renouvellement, d'un résultat anormal "
                "arrivé en urgence, ou d'une demande de certificat. Il devrait reconstituer "
                "ces règles à mesure que les situations se présentent."
            ),
            (
                "Le fonctionnement de votre cabinet se transmet par usage et par conversation, "
                "pas par écrit. Cette transmission orale tient parce que c'est toujours la même "
                "personne qui décide d'un renouvellement, d'une priorisation ou d'une "
                "orientation — le jour où ces décisions doivent être prises par quelqu'un "
                "d'autre, <strong>le cadre disparaît avec elle</strong>."
            ),
            (
                "L'arrivée d'un nouveau collaborateur dans votre cabinet — secrétaire, "
                "remplaçant, associé — <strong>passerait par plusieurs semaines d'alignement informel</strong> : "
                "comprendre vos préférences de tri, vos seuils d'urgence, vos contacts "
                "privilégiés chez les spécialistes. Ce temps n'apparaît dans aucun budget "
                "parce que le besoin ne s'est pas encore présenté."
            ),
        ]
        return _pick_variant(interview_id, variants, "phrase_choc:cadre_absent")

    # Profil 4 — porteur solo (déplacé en V1.1.7-s : laisser thématiques d'abord)
    # Active dès que ≥ 3 signaux d'effort cumulés (porte_seul, canaux_directs,
    # débordement_admin, ferme_congés) sans qu'aucun pattern thématique n'ait
    # déjà déclenché plus haut. Évite que la majorité des solo (qui matchent
    # naturellement plusieurs signaux) reçoivent systématiquement ce profil.
    if signals_effort >= 3:
        variants = [
            (
                "Ce qui fait tourner votre cabinet est mémorisé, pas documenté : les "
                "particularités d'un patient chronique, le bon contact pour orienter un cas, "
                "le rythme de relance d'un courrier non revenu. Cette mémoire fait la rapidité "
                "du quotidien, et <strong>porte aussi la totalité du risque le jour où vous n'y êtes pas</strong>."
            ),
            (
                "Votre cabinet est devenu très efficace dans sa configuration actuelle. Cette "
                "efficacité tient parce que vous êtes le point de passage de toutes les "
                "décisions — depuis l'arbitrage d'une consultation à intercaler jusqu'au tri "
                "d'un courrier d'hôpital. Cette configuration <strong>repose sur votre présence "
                "continue</strong> ; toute absence, même brève, ralentit l'ensemble."
            ),
            (
                "Une partie de la conduite quotidienne de votre cabinet <strong>ne repose pas sur un "
                "outil consultable</strong> : qui attend un retour de résultat, quels renouvellements "
                "arrivent à échéance, quelles informations sont en suspens. Ce suivi vit dans "
                "votre attention au fil des dossiers."
            ),
            (
                "Vos décisions d'organisation se prennent au moment où elles se présentent — "
                "quel rendez-vous décaler, quelle demande prioriser, quel renouvellement "
                "traiter en premier. Cette réactivité vous rend rapide, et elle pourrait "
                "<strong>empêcher qu'aucune de ces décisions soit déléguée</strong> le jour où ce serait utile."
            ),
        ]
        return _pick_variant(interview_id, variants, "phrase_choc:porteur_solo")

    # Profil 5 — effort modéré, signaux dispersés
    if signals_effort >= 2:
        variants = [
            (
                "Deux ou trois zones précises de votre cabinet consomment une part "
                "disproportionnée de votre attention : une demande qui revient sous trois "
                "canaux différents, un outil qui ne fait pas exactement ce que vous attendez, "
                "un protocole que vous expliquez à nouveau chaque trimestre. Aucune ne pèse "
                "assez, isolément, pour déclencher une remise en cause — <strong>et leur cumul ne se "
                "voit pas davantage</strong>."
            ),
            (
                "Quelques irritations récurrentes ont fini par devenir invisibles à force "
                "d'être quotidiennes : le délai d'attente d'un compte-rendu de spécialiste, "
                "le tiers payant qui se bloque sur certains dossiers, le SMS d'un patient "
                "qu'on rappelle entre deux consultations. C'est précisément <strong>cette familiarité "
                "qui les rend difficiles à voir</strong> — et donc difficiles à traiter."
            ),
            (
                "Quelques points de friction se sont installés par habitude dans votre "
                "quotidien — un canal qui reçoit des demandes hors de son périmètre, une "
                "étape manuelle qu'on refait à chaque fois, un patient qui passe entre les "
                "cases d'une liste. Aucun n'empêche le cabinet de tourner ; chacun, pris "
                "isolément, <strong>ne pèse pas assez pour qu'on prenne le temps de le regarder</strong>."
            ),
            (
                "Votre cabinet tourne bien. Quelques zones précises pèsent plus que leur "
                "poids — leur coût n'est pas dans le temps qu'elles vous prennent, mais <strong>dans "
                "ce qu'elles vous empêchent d'engager ailleurs</strong> : reprendre un suivi de patient "
                "chronique en retard, structurer un courrier difficile, dégager un créneau "
                "d'urgence."
            ),
        ]
        return _pick_variant(interview_id, variants, "phrase_choc:signaux_disperses")

    # Profil 6 — équilibre tenu mais lecture à froid pertinente (default)
    variants = [
        (
            "Votre cabinet ne présente pas de point de tension visible. Cette absence de "
            "signal peut indiquer un cabinet effectivement bien réglé — ou un cabinet dont "
            "<strong>les frictions sont absorbées en silence</strong> par vous-même ou par votre secrétariat : "
            "un pic de demandes pendant la saison épidémique, l'absence d'un confrère, une "
            "journée plus dense que prévu."
        ),
        (
            "Pas d'alerte dans votre cabinet aujourd'hui. La question qu'un check-up "
            "préventif pose à ce moment-là n'est pas \"qu'est-ce qui va mal\", mais "
            "<strong>\"qu'est-ce qui pourrait basculer sans signal\"</strong> — un suivi de patient qui "
            "s'effrite, un courrier en retard qui finit par bloquer un parcours, un protocole "
            "qu'on n'a plus l'occasion de mettre à jour."
        ),
        (
            "Aucun signe de tension dans votre cabinet aujourd'hui. Deux lectures restent "
            "possibles : soit il fonctionne réellement bien, soit il absorbe ses frictions "
            "sans les nommer — un délai qui s'allonge, un dossier qui dort, une tâche "
            "reportée chaque semaine. <strong>La différence ne se voit pas de l'intérieur, "
            "c'est précisément ce qu'un regard extérieur peut faire apparaître.</strong>"
        ),
        (
            "Aucun point de votre cabinet ne demande d'intervention immédiate. C'est "
            "précisément <strong>le moment où des repères posés à froid peuvent être utiles</strong> : saison "
            "épidémique en fin d'année, départ imprévu du secrétariat, dossier complexe qui "
            "s'enlise."
        ),
    ]
    return _pick_variant(interview_id, variants, "phrase_choc:default")



def build_chaine_causale(
    answers: list[Any],
    interview_id: Optional[int] = None,
) -> Optional[str]:
    """Détecte une chaîne causale saillante et la nomme.

    Retourne None si aucune chaîne ne s'applique. Sinon retourne une phrase qui
    relie deux ou trois constats par un lien de cause à conséquence. Pile l'axe 1
    Lugia ("comprendre les causes racines et les interdépendances").

    V1.1 Vague 2.2.0 : chaque chaîne expose une liste de variantes,
    sélection déterministe par `_pick_variant`. Variantes supplémentaires
    écrites en Vague 2.2c.
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
        variants = [
            (
                "Votre débordement administratif tient à un double facteur : des canaux directs "
                "qui multiplient les sollicitations, et un cadre flou qui empêche votre secrétariat "
                "de les absorber."
            ),
            (
                "Le débordement administratif que vous décrivez est le bout visible d'une cascade : "
                "des canaux directs qui injectent des demandes en continu, un cadre encore flou qui "
                "empêche votre secrétariat d'en absorber le flot, et vous qui rattrapez le reste en "
                "fin de journée."
            ),
            (
                "Ce qui déborde le soir, ce sont les demandes qui n'ont pas pu être triées dans la "
                "journée — appels sur votre mobile, SMS, mails directs qui ne passent pas par votre "
                "secrétariat. Sans règle claire sur ce qu'il peut traiter seul, ce qui reste finit "
                "chaque jour sur votre soirée."
            ),
        ]
        return _pick_variant(interview_id, variants, "chaine:debordement_admin")

    # Chaîne 2 — Fragilité continuité causée par solo + isolement + pas de dispositif
    if q08 in ("q08_c", "q08_d") and q07 == "q07_a" and q01 == "q01_a":
        variants = [
            (
                "La fragilité de continuité que vous décrivez n'est pas isolée : elle découle de "
                "votre fonctionnement en solo, sans renfort régulier ni dispositif partagé pour "
                "vos absences."
            ),
            (
                "L'absence imprévue est difficile à absorber chez vous parce que rien n'est partagé "
                "en amont : votre fonctionnement solo n'est doublé d'aucun confrère qui connaisse "
                "vos patients, et aucun dispositif n'est prêt à prendre le relais."
            ),
            (
                "Cette fragilité de continuité a une racine simple : vous exercez seul, sans renfort "
                "régulier ni dispositif partagé. Au-delà d'une journée d'absence, rien ne prend "
                "le relais."
            ),
        ]
        return _pick_variant(interview_id, variants, "chaine:fragilite_continuite")

    # Chaîne 3 — Usage IA grand public causé par besoin réel + stack peu intégré
    if q13 in ("q13_c", "q13_d") and q09 == "q09_d":
        variants = [
            (
                "Votre usage de l'IA grand public n'est pas un défaut isolé : c'est un besoin de "
                "rédaction structurée auquel vos outils actuels, nombreux et peu intégrés, ne "
                "savent pas répondre. Le canal grand public comble ce manque, faute d'alternative."
            ),
            (
                "Votre recours à une IA grand public n'arrive pas par hasard : c'est la réponse "
                "pragmatique à un besoin de rédaction structurée que vos outils actuels, nombreux "
                "mais peu intégrés, n'arrivent pas à couvrir. À défaut d'alternative interne, le "
                "canal externe s'est installé."
            ),
            (
                "Votre stack actuel fait beaucoup de choses, mais pas la rédaction assistée — et "
                "c'est précisément là que vous gagnez du temps avec l'IA grand public. Le "
                "contournement est donc rationnel, mais il vous fait porter seul un risque que "
                "le cabinet pourrait mieux répartir."
            ),
        ]
        return _pick_variant(interview_id, variants, "chaine:ia_stack")

    # Chaîne 4 — Perte de vue des chroniques causée par solo + pas d'alerte
    if q10 == "q10_d" and q07 == "q07_a":
        variants = [
            (
                "Le suivi de vos patients chroniques repose entièrement sur leur initiative — "
                "parce que vous portez seul l'organisation, et que vos outils n'envoient pas d'alerte."
            ),
            (
                "Le suivi des patients chroniques est devenu votre angle mort : porté seul, sans "
                "relais d'équipe pour relancer, et sans signal côté outil quand un dossier se met "
                "en sommeil. La trace se perd silencieusement, sans rien pour vous l'indiquer."
            ),
            (
                "Vos patients chroniques reviennent quand ils veulent ou y pensent, et pas selon "
                "une cadence que le cabinet contrôle. Sans alerte côté outil et sans regard "
                "d'équipe, ce n'est plus le système qui suit le patient mais le patient qui suit "
                "ce qu'il peut."
            ),
        ]
        return _pick_variant(interview_id, variants, "chaine:perte_vue_chroniques")

    # Chaîne 5 — Tri opportuniste des résultats causé par isolement + pas d'alerte
    if q11 == "q11_d" and q07 == "q07_a":
        variants = [
            (
                "Le tri opportuniste des résultats que vous décrivez est moins un choix qu'une "
                "conséquence : seul à porter la vigilance, sans système d'alerte ni délégation."
            ),
            (
                "Trier les résultats au fil de l'eau, comme vous le décrivez, n'est pas une "
                "méthode mais une contrainte : seul à porter la vigilance, sans signal de tri "
                "prioritaire ni relais d'équipe, le seul rythme possible est celui des fenêtres "
                "disponibles dans votre journée."
            ),
            (
                "Vous traitez les résultats quand vous tombez dessus parce que rien ne les classe "
                "pour vous en amont. La conséquence pratique : un résultat important côtoie un "
                "résultat banal dans votre flux, et c'est votre attention qui doit faire le tri "
                "à chaque fois."
            ),
        ]
        return _pick_variant(interview_id, variants, "chaine:tri_opportuniste")

    return None



def build_synthesis(
    answers: list[Any],
    interview_id: Optional[int] = None,
) -> str:
    """Compose la synthèse de la page de résultats.

    Retourne un fragment HTML. Le dernier passage est entouré de
    `<em>...</em>` pour rendre l'italique coloré côté CSS.

    V1.1 Vague 3.1d : phrase choc style MBTI en tête, recommandation italique
    réintroduit la thèse Lugia "vue d'ensemble avant chantier".

    V1.1 Vague 2.2.0 : `interview_id` propagé jusqu'aux fonctions enfant
    (`build_phrase_choc`, `build_chaine_causale`) pour permettre la
    sélection déterministe de variantes. La recommandation italique
    bascule également sur `_pick_variant`. Sortie strictement identique
    à V1.1 tant que chaque pattern n'a qu'une variante (cas Vague 2.2.0) ;
    diversifiée dès que les variantes supplémentaires sont écrites
    (Vagues 2.2a-d).
    """
    phrase_choc = build_phrase_choc(answers, interview_id)

    outils = derive_outils_principaux(answers)
    externalisations = derive_externalisations(answers)
    description_1 = description_demandes_directes(answers)
    description_2 = description_usage_ia(answers)

    # V1.1.7-r : bloc "Au quotidien, vous vous appuyez sur..." supprimé.
    # Il interrompait le flux entre la phrase choc et la chaîne causale
    # sans apporter d'information utile au médecin (qui sait sur quoi
    # il s'appuie). Conservé en variables locales si besoin de revert.
    _ = outils, externalisations  # éviter unused warning
    organisation = ""

    # Ce qui demande attention
    # V1.1 Vague 3.1j : si une chaîne causale s'applique, on la nomme à la place
    # d'une simple énumération. Pile l'axe 1 Lugia "causes racines et interdépendances".
    chaine = build_chaine_causale(answers, interview_id)
    descriptions = [d for d in (description_1, description_2) if d]
    if chaine:
        zone = " " + chaine
    else:
        if len(descriptions) >= 2:
            zone = (
                "<br /><br /><strong>Deux points méritent d'être regardés en priorité :</strong> "
                f"{descriptions[0]}, et {descriptions[1]}."
            )
        elif len(descriptions) == 1:
            zone = (
                "<br /><br /><strong>Un point mérite d'être regardé en priorité :</strong> "
                f"{descriptions[0]}."
            )
        else:
            zone = ""

    # V1.1.6-f : la recommandation italique a migré vers `build_recommandation`,
    # exposée séparément dans le payload `/report` et affichée entre les
    # facettes et les opportunités d'action côté frontend.

    return phrase_choc + organisation + zone


def build_recommandation(
    answers: list[Any],
    interview_id: Optional[int] = None,
) -> str:
    """Retourne toujours une chaîne vide depuis V1.1.7-k.

    Historique : ce bloc "recommandation italique" était intercalé entre la
    grille des facettes et les opportunités d'action depuis V1.1.6-f, avec
    3 variants selon le profil. À l'usage il s'est révélé redondant : tous
    les variants soit dupliquaient le chantier IA qui apparaît juste en
    dessous dans les opportunités, soit étaient des invitations vagues à
    appeler Lugia. V1.1.7-k a supprimé le contenu sans toucher à la
    signature pour ne pas casser l'API `/report` ni le frontend.

    Le frontend cache déjà le bloc quand `recommendation` est vide
    (cf. `{report.recommendation && (...)}` dans resultats/page.tsx).

    Si un futur besoin justifie un bloc à cet emplacement (synthèse
    transversale des 3 facettes, par exemple), il faudra réintroduire un
    contenu vraiment additif, pas une reformulation des chantiers à venir.
    """
    _ = answers, interview_id  # paramètres conservés pour la signature
    return ""



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
            "C'est votre temps personnel qui absorbe ce qui ne se voit pas la journée."
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
