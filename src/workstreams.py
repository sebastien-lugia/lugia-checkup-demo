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
        title = "Reprendre la main sur les demandes directes"
        if q04 == "q04_d":
            canaux = _canaux_paralleles_phrase()
            flux = _flux_principal_categorie(answers)
            vu = (
                f"Vous recevez des {canaux}, en plus de {flux} et {sec_du}. "
                f"Ces demandes ne sont pas tracées et représentent une charge invisible."
            )
            analyse_variants = [
                (
                    f"Ces demandes directes restent invisibles à {sec_label} : vous portez seul "
                    f"le suivi mental, et le coût s'accumule à mesure que les canaux se multiplient."
                ),
                (
                    f"Ces demandes directes échappent au tableau de bord de {sec_label} et reposent "
                    f"uniquement sur votre mémoire. Pas de comptabilité, pas de suivi partagé : le "
                    f"coût réel n'est mesurable nulle part."
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
            analyse_variants = [
                (
                    "Cette compensation tient parce que vous l'assumez, mais elle masque la vraie "
                    "volumétrie de votre charge. Sans repère mesuré, il est difficile de savoir "
                    "ce qu'il faudrait alléger en priorité."
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

def chantier_ia(
    answers: list[Any],
    interview_id: Optional[int] = None,
) -> dict[str, Any]:
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
            "La fréquence, le type de courriers concernés, et les autres usages éventuels "
            "(résumés de consultations, recherches médicales)."
        )

        propose_parts = [
            "Vous donner accès à un environnement IA conforme au secret médical pour les "
            "mêmes usages, sans anonymisation à la main. À votre rythme, ouverture à "
            "d'autres tâches utiles : préparation de courriers aux spécialistes, suivi "
            "de patients chroniques, comptes-rendus structurés."
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
            "Ce qui est déjà couvert et ce qui ne l'est pas encore."
        )
        propose = (
            "Faire un point rapide sur ce qui est en place et compléter ce qui manque. "
            "Vous repartez avec un cadre prêt à être enrichi au fil de l'eau, qui réduit "
            "le risque de rupture lors d'une absence imprévue."
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
