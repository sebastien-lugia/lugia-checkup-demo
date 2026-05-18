"""V1.1.5-c : extraction Forces / Risques par option choisie au questionnaire.

Pour chaque facette, fragments analytiques déclenchés par option sélectionnée.
Triés par priorité (1 = le plus structurant, 3 = le moins) et tronqués selon
le niveau qualitatif de la facette (table de volume validée 2026-05-16).

| Niveau facette       | Forces max | Risques max |
|----------------------|------------|-------------|
| 1 (Maîtrisé)         | 3          | 1           |
| 2 (Opérationnel)     | 3          | 2           |
| 3 (À surveiller)     | 2          | 2           |
| 4 (En tension)       | 1          | 3           |
| 5 (À risque)         | 1          | 3           |

Garantie : au moins 1 force par facette grâce à un fragment de plancher
qui s'active si aucune force spécifique n'a été déclenchée pour la facette.

Les fragments sont rédigés en analyse systémique (cf MASTER_PROMPT §8) — pas
de constat plat ("les outils existent") mais une lecture du rôle que joue
l'élément dans le système ("la gestion des dossiers patients est bien
intégrée dans votre logiciel métier, qui centralise résultats et courriers").
"""

from __future__ import annotations

from typing import Any, Callable, TypedDict

from src import templates


class Fragment(TypedDict):
    trigger: Callable[[list[Any]], bool]
    # V1.1.5-i.5 : `text` peut être soit un str (fragment statique), soit un
    # Callable[[answers], str] qui calcule le texte à la volée selon entity_name.
    # build_facet_forces/risques résout les callables au moment de la sélection.
    text: Any  # str | Callable[[list[Any]], str]
    priority: int  # 1 = le plus structurant


# Volume par niveau qualitatif : (max_forces, max_risques)
VOLUME_PAR_NIVEAU: dict[int, tuple[int, int]] = {
    1: (3, 1),  # Maîtrisé
    2: (3, 2),  # Opérationnel
    3: (2, 2),  # À surveiller
    4: (1, 3),  # À risque (fusion V1.1.5-k)
}


# ---- Helpers ----

def _opt(answers: list[Any], qid: str) -> str | None:
    """Raccourci interne — option sélectionnée pour une question."""
    return templates._selected_option(answers, qid)


# ---- Forces par facette ----

FORCE_FRAGMENTS: dict[str, list[Fragment]] = {
    "processes": [
        {
            "trigger": lambda a: _opt(a, "q04") == "q04_a",
            "text": (
                "Prise de rendez-vous centralisée sur un canal unique."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q04") == "q04_c",
            "text": (
                "Canaux en ligne et téléphonique avec séparation claire des cas."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q04") == "q04_b",
            "text": (
                "Prise de rendez-vous centralisée sur le secrétariat."
            ),
            "priority": 2,
        },
        {
            "trigger": lambda a: _opt(a, "q05") == "q05_a",
            "text": (
                "Charge administrative traitée au fil de l'eau."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q05") == "q05_b",
            "text": (
                "Charge administrative répartie sur deux journées de cabinet."
            ),
            "priority": 2,
        },
        {
            "trigger": lambda a: _opt(a, "q12") == "q12_a",
            "text": (
                "Téléconsultation cadrée par des règles claires."
            ),
            "priority": 2,
        },
        {
            "trigger": lambda a: _opt(a, "q12") == "q12_c",
            "text": (
                "Activité majoritairement présentielle assumée."
            ),
            "priority": 3,
        },
    ],
    "participants": [
        {
            "trigger": lambda a: _opt(a, "q07") == "q07_b",
            "text": lambda a: (
                f"{templates.derive_entity_name(a, 'q07')}, votre assistant·e médical·e en soutien direct — consultation libérée, accueil professionnalisé."
                if templates.derive_entity_name(a, "q07")
                else "Assistant médical en soutien direct au cabinet."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q07") == "q07_c",
            "text": lambda a: (
                f"Cabinet partagé avec votre associé {templates.derive_entity_name(a, 'q07')}."
                if templates.derive_entity_name(a, "q07")
                else "Cabinet à plusieurs médecins associés."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q07") == "q07_d",
            "text": lambda a: (
                f"Confrère remplaçant régulier — {templates.derive_entity_name(a, 'q07')}."
                if templates.derive_entity_name(a, "q07")
                else "Confrère remplaçant régulier dans le cabinet."
            ),
            "priority": 2,
        },
        {
            "trigger": lambda a: _opt(a, "q08") == "q08_a",
            "text": (
                "Dispositif d'absence prêt pour tous les cas."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q08") == "q08_b",
            "text": (
                "Relais externe assuré pour vos absences."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q03") == "q03_a",
            "text": (
                "Cadre du secrétariat formalisé et appliqué."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q02") == "q02_a",
            "text": lambda a: (
                f"{templates.derive_entity_name(a, 'q02')}, secrétariat interne stable et aligné sur votre pratique."
                if templates.derive_entity_name(a, "q02")
                else "Secrétariat interne stable et intégré au cabinet."
            ),
            "priority": 2,
        },
        {
            "trigger": lambda a: _opt(a, "q02") == "q02_b",
            "text": lambda a: (
                f"Télésecrétariat structuré avec {templates.derive_entity_name(a, 'q02')}."
                if templates.derive_entity_name(a, "q02")
                else "Télésecrétariat structuré et durable."
            ),
            "priority": 2,
        },
        {
            "trigger": lambda a: _opt(a, "q02") == "q02_c",
            "text": lambda a: (
                f"Secrétariat hybride avec {templates.derive_entity_name(a, 'q02')} en interne."
                if templates.derive_entity_name(a, "q02")
                else "Dispositif de secrétariat hybride interne et externalisé."
            ),
            "priority": 2,
        },
    ],
    "information": [
        {
            "trigger": lambda a: _opt(a, "q09") == "q09_a",
            "text": (
                "Solution logicielle unique pour tout le cabinet."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q09") == "q09_b",
            "text": (
                "Deux outils articulés sans double saisie."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q10") == "q10_a",
            "text": (
                "Alerte logicielle pour le suivi des chroniques."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q10") == "q10_b",
            "text": (
                "Liste de relance active des patients chroniques."
            ),
            "priority": 2,
        },
        {
            "trigger": lambda a: _opt(a, "q11") == "q11_a",
            "text": (
                "Signalement automatique des résultats anormaux."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q11") == "q11_b",
            "text": (
                "Premier tri des résultats délégué à l'équipe."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q13") == "q13_b",
            "text": (
                "IA conforme au secret médical en place."
            ),
            "priority": 1,
        },
    ],
}


# ---- Forces de plancher (garantie min 1 force par facette) ----

FORCE_PLANCHER: dict[str, str] = {
    "processes": "Parcours de rendez-vous fonctionnel au quotidien.",
    "participants": "Appui dédié pour la gestion administrative.",
    "information": "Logiciel métier centralisant les dossiers patients.",
}


# ---- Risques de plancher (activés dès niveau 2 si aucun risque ne déclenche) ----
# V1.1.5-j : pour les facettes au niveau Opérationnel (2) ou plus risqué, on
# garantit l'affichage d'au moins 1 point de vigilance. Si aucun risque
# spécifique ne déclenche, on active un plancher générique factuel. Le niveau
# Maîtrisé (1) reste exempt — on ne fabrique pas de vigilance quand tout va bien.

RISQUE_PLANCHER: dict[str, str] = {
    "processes": "Vigilance à maintenir sur le volume de demandes.",
    "participants": "Vigilance à maintenir sur la couverture des absences.",
    "information": "Vigilance à maintenir sur l'intégration des outils.",
}


# ---- Risques par facette ----

RISQUE_FRAGMENTS: dict[str, list[Fragment]] = {
    "processes": [
        {
            "trigger": lambda a: _opt(a, "q04") == "q04_d",
            "text": (
                "Demandes directes par mobile, SMS ou mail non tracées."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q05") == "q05_d",
            "text": (
                "Charge administrative qui déborde sur le temps personnel."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q05") == "q05_c",
            "text": (
                "Charge administrative repoussée en fin de journée."
            ),
            "priority": 2,
        },
        {
            "trigger": lambda a: _opt(a, "q12") == "q12_b",
            "text": (
                "Téléconsultation au cas par cas, sans règle."
            ),
            "priority": 3,
        },
    ],
    "participants": [
        {
            "trigger": lambda a: _opt(a, "q07") == "q07_a",
            "text": (
                "Organisation du cabinet portée seul sans renfort."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q08") == "q08_d",
            "text": (
                "Aucun dispositif prévu pour vos absences."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q03") == "q03_d",
            "text": (
                "Secrétariat sans cadre formel écrit."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q08") == "q08_c",
            "text": (
                "Continuité fragile en cas d'absence imprévue."
            ),
            "priority": 2,
        },
        {
            "trigger": lambda a: _opt(a, "q03") == "q03_c",
            "text": (
                "Cadre du secrétariat écrit mais peu suivi."
            ),
            "priority": 2,
        },
    ],
    "information": [
        {
            "trigger": lambda a: _opt(a, "q10") == "q10_d",
            "text": (
                "Suivi des chroniques sur initiative patient uniquement."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q11") == "q11_d",
            "text": (
                "Tri des résultats sans rythme défini."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q13") == "q13_d",
            "text": (
                "Usage d'IA grand public sans garantie de secret médical."
            ),
            "priority": 1,
        },
        {
            "trigger": lambda a: _opt(a, "q09") == "q09_d",
            "text": (
                "Plus de cinq outils numériques mobilisés."
            ),
            "priority": 2,
        },
        {
            "trigger": lambda a: _opt(a, "q10") == "q10_c",
            "text": (
                "Suivi des patients chroniques sans protocole défini."
            ),
            "priority": 2,
        },
        {
            "trigger": lambda a: _opt(a, "q13") == "q13_c",
            "text": (
                "Usage d'IA grand public avec anonymisation manuelle."
            ),
            "priority": 2,
        },
        {
            "trigger": lambda a: _opt(a, "q09") == "q09_c",
            "text": (
                "Trois à cinq outils avec double saisie ponctuelle."
            ),
            "priority": 3,
        },
    ],
}


# ---- API publique ----

def _resolve_text(fragment_text: Any, answers: list[Any]) -> str:
    """Résout un fragment text : appelle le callable s'il y en a un, sinon retourne le str."""
    if callable(fragment_text):
        return fragment_text(answers)
    return fragment_text


def build_facet_forces(
    facet: str,
    answers: list[Any],
    level: int | None,
) -> list[str]:
    """Retourne la liste des forces affichées pour une facette.

    Args:
        facet: identifiant de la facette ("processes", "participants", "information").
        answers: liste des réponses de l'interview.
        level: niveau qualitatif de la facette (1-5) ou None.

    Returns:
        Liste de textes de forces, triés par priorité, tronqués selon le
        volume associé au niveau. Toujours au moins 1 force (force de
        plancher activée si aucune force spécifique ne déclenche).
    """
    max_forces, _ = VOLUME_PAR_NIVEAU.get(level or 5, (1, 3))
    candidates = [
        f for f in FORCE_FRAGMENTS.get(facet, [])
        if f["trigger"](answers)
    ]
    candidates.sort(key=lambda f: f["priority"])
    selected = [_resolve_text(f["text"], answers) for f in candidates[:max_forces]]
    if not selected:
        plancher = FORCE_PLANCHER.get(facet)
        if plancher:
            selected = [plancher]
    return selected


def build_facet_risques(
    facet: str,
    answers: list[Any],
    level: int | None,
) -> list[str]:
    """Retourne la liste des risques affichés pour une facette.

    V1.1.5-j : garantie min 1 risque dès niveau 2 (Opérationnel) — si
    aucun risque spécifique ne déclenche, on active un fallback générique
    issu de RISQUE_PLANCHER. Le niveau 1 (Maîtrisé) reste exempt : on ne
    fabrique pas de vigilance quand tout va bien.

    Args:
        facet: identifiant de la facette.
        answers: liste des réponses de l'interview.
        level: niveau qualitatif de la facette (1-5) ou None.

    Returns:
        Liste de textes de risques, triés par priorité, tronqués selon le
        volume associé au niveau. Vide uniquement si niveau 1 sans risque.
    """
    _, max_risques = VOLUME_PAR_NIVEAU.get(level or 5, (1, 3))
    candidates = [
        r for r in RISQUE_FRAGMENTS.get(facet, [])
        if r["trigger"](answers)
    ]
    candidates.sort(key=lambda r: r["priority"])
    selected = [_resolve_text(r["text"], answers) for r in candidates[:max_risques]]
    # Activation du plancher pour niveau >= 2 si rien ne déclenche
    if not selected and (level or 0) >= 2:
        plancher = RISQUE_PLANCHER.get(facet)
        if plancher:
            selected = [plancher]
    return selected
