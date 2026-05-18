"""Génération des chantiers personnalisés selon les réponses.

Implémente les templates documentés dans `resources/workstream_templates.md`.
Trois chantiers prédéfinis, déclenchés par des triggers sur les réponses,
instanciés avec substitution de placeholders.

V0 : structure à 4 sections (vu, pas_confirmer, propose, obtient).

V1.1 lite : restructuration en 4 sections avec ajout d'une étape "analyse"
explicite, et fusion de "propose" + "obtient" en une seule section finale
(la proposition se termine par le bénéfice). Vulgarisation du jargon WSF
et suppression des citations nominatives d'outils.

V1.1 Vague 2.2 : chaque chantier propage `interview_id` jusqu'à la
fabrique de l'analyse, qui expose désormais une liste de variantes
choisie par `_pick_variant` (sel par section). Permet d'avoir des
analyses différentes pour deux médecins du même profil. Variantes
supplémentaires écrites en Vague 2.2d.

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

from typing import Any, Optional

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

def chantier_demandes_directes(
    answers: list[Any],
    interview_id: Optional[int] = None,
) -> dict[str, Any]:
    q04 = _selected(answers, "q04")
    q05 = _selected(answers, "q05")

    triggered = (q04 == "q04_d") or (q05 == "q05_d")

    sec_label = templates.derive_secretariat_label(answers)
    sec_du = templates.derive_secretariat_with_du(answers)

    if triggered:
        # V1.1.8 : titre adapté selon la motivation Q06 (charge / evenement / risque)
        motivation = templates.derive_q06_motivation(answers)
        title_map = {
            "charge": "Réduire la charge des demandes directes",
            "evenement": "Cadrer les demandes directes en amont de l'événement",
            "risque": "Sécuriser les demandes directes non tracées",
        }
        title = title_map.get(motivation or "", "Reprendre la main sur les demandes directes")
        if q04 == "q04_d":
            canaux = _canaux_paralleles_phrase()
            flux = _flux_principal_categorie(answers)
            vu = (
                f"Vous recevez des {canaux}, en plus de {flux} et {sec_du}. "
                f"Ces demandes ne sont tracées nulle part."
            )
            analyse_variants = [
                (
                    f"Ces demandes — appels sur votre mobile, SMS de patients, mails directs — "
                    f"restent invisibles à {sec_label} : vous portez seul le suivi mental, et le "
                    f"coût s'accumule à mesure que les canaux se multiplient."
                ),
                (
                    f"Ces demandes — appels sur votre mobile, SMS, mails directs — échappent au "
                    f"tableau de bord de {sec_label} et reposent uniquement sur votre mémoire. "
                    f"Pas de comptabilité, pas de suivi partagé : le coût réel n'est mesurable "
                    f"nulle part."
                ),
                (
                    "Plus vous restez joignable directement, plus la pratique s'installe : un "
                    "patient qui obtient un retour rapide via votre mobile recommence. Le système "
                    "se renforce de lui-même, sans que personne — pas même vous — décide qu'il en "
                    "soit ainsi."
                ),
            ]
            analyse = templates._pick_variant(
                interview_id, analyse_variants, "analyse:demandes_directes:q04"
            )
            pas_confirmer = (
                "Ces demandes représentent probablement plusieurs heures par semaine et concernent "
                "surtout des patients réguliers qui ont gardé votre ligne directe. À mesurer ensemble "
                "sur deux semaines pour le confirmer."
            )
            propose = (
                f"À partir de votre check-up, on mesure ensemble — à distance ou au cabinet selon "
                f"ce qui vous convient — le volume réel de demandes qui passent par vos canaux "
                f"directs (mobile, SMS, mails), et on pose une consigne claire avec {sec_label} "
                f"à communiquer à vos patients réguliers."
            )
        else:  # q05 == "q05_d" sans q04 == "q04_d"
            vu = (
                "Votre charge administrative déborde le soir et le week-end. "
                "C'est votre temps personnel qui absorbe ce qui ne se voit pas la journée."
            )
            analyse_variants = [
                (
                    "Cette compensation — par exemple des courriers à finir le soir ou des "
                    "comptes-rendus à reformuler le week-end — tient parce que vous l'assumez, "
                    "mais elle masque la vraie volumétrie de votre charge. Sans repère mesuré, "
                    "il est difficile de savoir ce qui pourrait être allégé en priorité."
                ),
                (
                    "Le débordement administratif sur votre temps personnel est une ressource "
                    "d'amortissement invisible. Tant qu'elle tient, le cabinet semble équilibré ; "
                    "le jour où elle ne tient plus, c'est tout l'édifice qui se met à grincer."
                ),
                (
                    "Le débordement sur votre temps personnel ne déclenche aucune alerte côté "
                    "outil ni côté équipe. La fatigue reste le seul indicateur — et c'est un "
                    "indicateur qui arrive en retard."
                ),
            ]
            analyse = templates._pick_variant(
                interview_id, analyse_variants, "analyse:demandes_directes:q05"
            )
            pas_confirmer = (
                "Votre charge du soir porte vraisemblablement sur les courriers complexes et les "
                "comptes-rendus de spécialistes. À vérifier en regardant ensemble une à deux "
                "semaines de soirées."
            )
            propose = (
                "À partir de votre check-up, on regarde ensemble — à distance ou au cabinet — où "
                "votre charge administrative déborde aujourd'hui sur vos soirées et week-ends, "
                "puis on identifie les pistes concrètes que vous pourriez expérimenter sur deux "
                "semaines."
            )
    else:
        # V1.1.8 : titre fallback modulé selon Q06
        motivation = templates.derive_q06_motivation(answers)
        title_map_fallback = {
            "charge": "Mesurer où passe votre temps avant d'agir",
            "evenement": "Poser un état des lieux avant un changement",
            "risque": "Repérer ce qui pourrait basculer sans signal",
        }
        title = title_map_fallback.get(motivation or "", "Garder un œil sur ce qui prend votre temps")
        vu = (
            "Le check-up n'a pas détecté de surcharge particulière. "
            "Un état des lieux régulier de ce qui vous prend du temps "
            "permettrait de l'anticiper si elle s'aggravait."
        )
        analyse_variants = [
            (
                "Aujourd'hui vous tenez la charge sans repère mesuré. Si elle augmente lentement, "
                "vous risquez de vous en rendre compte une fois fatigué plutôt qu'en amont."
            ),
            (
                "Pas de surcharge détectée pour l'instant, mais aussi pas de repère mesuré : un "
                "état des lieux préventif vous donne un point de référence si la charge se met "
                "à augmenter."
            ),
            (
                "Tout va bien aujourd'hui — c'est précisément le bon moment pour poser un repère "
                "mesuré. À chaud, on calibre rarement bien ; à froid, c'est l'inverse."
            ),
        ]
        analyse = templates._pick_variant(
            interview_id, analyse_variants, "analyse:demandes_directes:default"
        )
        pas_confirmer = (
            "Votre charge actuelle semble tenable, mais aucun repère mesuré ne permet de le "
            "confirmer. À valider par un état des lieux léger."
        )
        propose = (
            "À partir de votre check-up, on met en place avec vous — à distance ou au cabinet — un "
            "suivi discret de deux semaines pour repérer où passent vos heures (consultations, "
            "admin, sollicitations directes). Sans changement d'organisation."
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

def chantier_ia(
    answers: list[Any],
    interview_id: Optional[int] = None,
) -> dict[str, Any]:
    q13 = _selected(answers, "q13")
    triggered = q13 in ("q13_c", "q13_d")

    if triggered:
        # V1.1.8 : titre adapté selon la motivation Q06
        motivation = templates.derive_q06_motivation(answers)
        title_map = {
            "charge": "Alléger les tâches admin via une IA conforme",
            "evenement": "Mettre votre usage IA en conformité en amont de l'événement",
            "risque": "Sécuriser votre usage IA face au secret médical",
        }
        title = title_map.get(motivation or "", "Sécuriser votre usage actuel de l'IA")
        usage = _usage_ia_decrit(answers)

        if q13 == "q13_d":
            vu = (
                f"Vous utilisez un outil d'IA grand public pour {usage}, en retirant à la main "
                f"les informations identifiantes. Sans garantie réelle de secret médical."
            )
        else:  # q13_c
            vu = (
                f"Vous utilisez un outil d'IA grand public pour {usage}, avec une anonymisation "
                f"manuelle. Pratique vigilante, mais sans garantie structurelle de secret médical."
            )

        analyse_variants = [
            (
                "Le besoin est légitime, le canal ne l'est pas. Aujourd'hui votre vigilance "
                "tient seule un cadre exigeant — secret médical, RGPD, hébergement de santé, "
                "responsabilité civile professionnelle — qu'un outil dédié pourrait porter à "
                "votre place."
            ),
            (
                "L'usage est utile, le canal pose un problème de fond. Tout ce qui borde "
                "aujourd'hui votre pratique IA — secret médical, RGPD, hébergement de santé — "
                "repose sur votre seule discipline, alors que ces garanties pourraient être "
                "structurellement portées par l'outil."
            ),
            (
                "La pratique est installée et le bénéfice réel ; le sujet est donc de la "
                "sécuriser, pas d'y renoncer. Aujourd'hui c'est votre vigilance personnelle qui "
                "tient le secret médical et le cadre RGPD — un environnement dédié ferait porter "
                "ce poids à l'outil, pas à vous."
            ),
        ]
        analyse = templates._pick_variant(
            interview_id, analyse_variants, "analyse:ia:triggered"
        )
        pas_confirmer = (
            "Votre usage de l'IA concerne probablement des courriers complexes ponctuels, et "
            "pourrait s'étendre vers les comptes-rendus structurés ou les courriers aux "
            "spécialistes. À préciser ensemble pour calibrer la suite."
        )

        propose_parts = [
            "On vous fait tester un environnement IA conforme au secret médical et adapté à "
            "votre situation, en s'appuyant sur votre check-up. Deux ou trois cas d'usage prêts "
            "pour votre quotidien (courriers complexes, comptes-rendus, préparation de patients)."
        ]
        if _has_classical_dictation(answers):
            propose_parts.append(
                "Votre logiciel de dictée actuel reste — ce chantier porte uniquement sur "
                "l'aide à la rédaction structurée."
            )
        propose = " ".join(propose_parts)
    else:
        # V1.1.8 : titre fallback modulé selon Q06
        motivation = templates.derive_q06_motivation(answers)
        title_map_fallback = {
            "charge": "Découvrir une IA conforme qui peut alléger votre quotidien",
            "evenement": "Tester une IA conforme avant un changement à venir",
            "risque": "Découvrir une IA conforme avant que l'usage informel ne s'installe",
        }
        title = title_map_fallback.get(motivation or "", "Préparer un usage maîtrisé de l'IA")
        vu = (
            "Vous n'utilisez pas d'IA générative aujourd'hui. C'est un bon point de départ pour "
            "découvrir un environnement maîtrisé avant que l'usage ne se diffuse de manière informelle."
        )
        analyse_variants = [
            (
                "L'IA générative se diffuse rapidement dans les cabinets. Découvrir un environnement "
                "conforme dès maintenant évite d'avoir à recadrer des usages déjà installés."
            ),
            (
                "L'IA générative est déjà entrée dans la pratique d'une grande partie de vos "
                "confrères. Découvrir un environnement conforme avant d'en avoir besoin laisse le "
                "temps de choisir vos usages plutôt que de les corriger plus tard."
            ),
            (
                "Vous n'avez pas encore l'usage, ce qui est un avantage : vous pouvez explorer un "
                "environnement conforme sans pression. C'est plus facile de prendre une habitude "
                "propre dès le départ que de reprendre une habitude déjà installée."
            ),
        ]
        analyse = templates._pick_variant(
            interview_id, analyse_variants, "analyse:ia:default"
        )
        pas_confirmer = (
            "Vous trouveriez vraisemblablement des cas d'usage utiles dans un environnement IA "
            "conforme — courriers complexes, comptes-rendus, préparation de patients. À découvrir "
            "ensemble lors d'une présentation."
        )
        propose = (
            "On vous fait découvrir un environnement IA conforme au secret médical, en s'appuyant sur "
            "votre check-up, sur deux ou trois cas d'usage adaptés à votre quotidien (courriers, "
            "comptes-rendus, préparation de patients), à votre rythme."
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

def chantier_absence(
    answers: list[Any],
    interview_id: Optional[int] = None,
) -> dict[str, Any]:
    q08 = _selected(answers, "q08")
    triggered = q08 in ("q08_c", "q08_d")

    sec_label = templates.derive_secretariat_label(answers)
    pred = templates.derive_predecessor_name(answers)
    duree = templates.derive_duree_secretariat(answers)

    if triggered:
        # V1.1.8 : titre adapté selon la motivation Q06
        motivation = templates.derive_q06_motivation(answers)
        title_map = {
            "charge": "Sécuriser la continuité pour libérer du temps mental",
            "evenement": "Structurer une fiche relais transférable en amont de l'événement",
            "risque": "Sécuriser la continuité face à l'absence imprévue",
        }
        title = title_map.get(motivation or "", "Anticiper une absence prolongée")

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

        analyse_variants = [
            (
                "Le fonctionnement actuel tient tant que vous êtes présent. Quelques règles écrites "
                "sur les cas courants (renouvellements, urgences, contacts critiques) permettent "
                "d'absorber une absence courte sans rupture."
            ),
            (
                "Le test simple est celui de la semaine d'arrêt imprévu : aujourd'hui, le cabinet "
                "s'arrête avec vous. Quelques règles écrites suffisent pourtant — renouvellements, "
                "urgences, contacts critiques — à transformer cette rupture en relais."
            ),
            (
                "Le fonctionnement actuel est entièrement non-écrit : il tient parce que vous êtes "
                "là chaque jour. Écrire l'essentiel — qui prévenir, comment renouveler, quels "
                "contacts urgents — rend ce fonctionnement partageable, sans le rigidifier."
            ),
        ]
        analyse = templates._pick_variant(
            interview_id, analyse_variants, "analyse:absence:triggered"
        )
        pas_confirmer = (
            "Votre cabinet pourrait absorber une absence courte si quelques règles étaient "
            "écrites, mais une absence longue resterait critique. À simuler ensemble en testant "
            "un scénario d'arrêt de deux semaines."
        )
        propose = (
            "On structure votre fiche relais grâce à votre check-up — pas d'atelier "
            "découverte, pas de modèle générique. Une fiche structurée, prête à partager "
            "à votre prochain remplaçant."
        )
    else:
        # V1.1.8 : titre fallback modulé selon Q06
        motivation = templates.derive_q06_motivation(answers)
        title_map_fallback = {
            "charge": "Compléter votre dispositif pour libérer du mental",
            "evenement": "Compléter votre dispositif d'absence avant un événement",
            "risque": "Compléter votre dispositif d'absence sur les cas extrêmes",
        }
        title = title_map_fallback.get(motivation or "", "Compléter ce qui est déjà prévu pour vos absences")
        vu = (
            "Vous avez déjà quelques règles écrites pour le fonctionnement du cabinet sans vous. "
            "Le chantier consiste à les compléter pour mieux tenir un imprévu."
        )
        analyse_variants = [
            (
                "Plus solide que la moyenne, mais probablement perfectible sur les cas extrêmes "
                "(absence longue, arrêt imprévu). Un examen rapide permettrait de combler les "
                "angles morts encore présents."
            ),
            (
                "Vous êtes déjà mieux préparé que la moyenne sur ce sujet. Le travail restant "
                "porte sur les cas qu'on n'a pas anticipés : arrêt long, absence simultanée, "
                "panne d'outil critique."
            ),
            (
                "Le dispositif existant est solide pour les absences courtes. Une relecture "
                "rapide permet d'identifier les scénarios extrêmes qui n'ont pas encore été "
                "couverts — sans tout refaire."
            ),
        ]
        analyse = templates._pick_variant(
            interview_id, analyse_variants, "analyse:absence:default"
        )
        pas_confirmer = (
            "Votre dispositif tient pour les absences courtes mais reste vraisemblablement "
            "perfectible sur les cas extrêmes — arrêt long, panne d'outil critique. À valider "
            "ensemble par une relecture rapide."
        )
        propose = (
            "On relit ensemble votre dispositif d'absence grâce à votre check-up pour "
            "identifier les scénarios non couverts — arrêt long, panne d'outil critique. "
            "Un complément ciblé à ce qui existe déjà."
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
    """Génère les trois chantiers pour une interview, dans l'ordre de priorité.

    V1.1 Vague 2.2.0 : `interview_id` est propagé à chaque chantier pour
    permettre la sélection déterministe des variantes d'analyse via
    `templates._pick_variant`.
    """
    answers = db.get_answers(interview_id)
    return [
        chantier_demandes_directes(answers, interview_id),
        chantier_ia(answers, interview_id),
        chantier_absence(answers, interview_id),
    ]
