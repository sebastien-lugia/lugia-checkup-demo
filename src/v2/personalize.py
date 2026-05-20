"""Personnalisation déterministe V2.0 — 13 règles nommées.

Chaque règle est une fonction Python pure, testable unitairement,
auditable. Elles consomment :
- `profile` : dict du `user_profile` (cabinet_type, status, motivation,
  energy, horizon, territoire, volume, paramedical_team, rdv_canal, …).
- `scores` : sortie de `scoring.compute_all_scores()`.
- `answers` : liste de réponses (pour récupérer l'option énergie).

Posture éditoriale (rappel — spec V2 §10) : **levier d'action, jamais
culpabilité**. Tous les messages personnalisés sont formulés en positif
ou en interpellation factuelle, jamais comme reproche ou jugement.

Référence : `resources/v2_editorial_draft.md` lot 5 (libellés exacts
préservés).

V2.0-T2 — Sébastien.
"""

from __future__ import annotations

import hashlib
from typing import Any, Optional

from . import questions as v2_questions
from . import scoring as v2_scoring


# ----------------------------------------------------------------------
# Helpers internes
# ----------------------------------------------------------------------


def _pct(scores: dict[str, Any], axis: str) -> Optional[int]:
    """Récupère le score % d'un axe ou None s'il n'est pas encore calculé."""
    block = scores.get(axis)
    if not isinstance(block, dict):
        return None
    return block.get("pct")


def _pick_deterministic(
    variants: list[str], interview_id: int, salt: str
) -> str:
    """Sélectionne une variante de manière déterministe selon interview_id + salt.

    Réutilise la mécanique D-022 V1.1.x : deux médecins du même profil ne
    reçoivent pas la même variante, mais la même interview produit
    toujours la même variante (rejouable, auditable).
    """
    if not variants:
        return ""
    key = f"{interview_id}::{salt}".encode("utf-8")
    h = int.from_bytes(hashlib.sha256(key).digest()[:4], "big")
    return variants[h % len(variants)]


# ----------------------------------------------------------------------
# 10.1 Règles de tonalité
# ----------------------------------------------------------------------


def r_status_junior(profile: dict[str, Any], interview_id: int = 0) -> Optional[str]:
    """R-status-junior : si status=recent (< 3 ans), normaliser par temporalité.

    Évite tout encouragement paternaliste — ancre dans une norme historique.
    """
    if (profile or {}).get("status") != "recent":
        return None
    variants = [
        "C'est courant à ce stade d'installation — la plupart des cabinets prennent 2 à 3 ans à construire leurs routines.",
        "Beaucoup de médecins traversent cette phase dans leurs premières années d'exercice — c'est aussi le moment où l'organisation prend forme.",
        "À ce stade, ce qui semble pesant aujourd'hui est rarement définitif. Le cabinet prend sa forme progressivement.",
    ]
    return _pick_deterministic(variants, interview_id, "R-status-junior")


def r_status_senior(profile: dict[str, Any], interview_id: int = 0) -> Optional[str]:
    """R-status-senior : si status=senior ou approche_transmission, légitimer le recul."""
    status = (profile or {}).get("status")
    if status not in ("senior", "approche_transmission"):
        return None
    variants = [
        "Vous avez le recul nécessaire pour distinguer ce qui tient de ce qui dépend de vous.",
        "À votre stade, les chantiers utiles sont souvent ceux qui rendent le cabinet transmissible — pas ceux qui le complexifient.",
        "Vous avez vécu plusieurs cycles d'évolution du cabinet. Ce qui ressort aujourd'hui résonne probablement avec des points que vous percevez déjà.",
    ]
    return _pick_deterministic(variants, interview_id, "R-status-senior")


# Phrase d'accueil par motivation — message exact préservé du brouillon §10.1
_MOTIVATION_TONE = {
    "charge": "Vous avez démarré ce check-up pour identifier ce qui pèse le plus dans votre semaine. Voici ce qui ressort.",
    "evenement": "Vous avez démarré ce check-up pour préparer un événement à venir dans votre cabinet. Voici ce que ce diagnostic met en lumière.",
    "risque": "Vous avez démarré ce check-up pour sécuriser un risque identifié. Voici les points sur lesquels concentrer votre attention.",
    "curiosite": "Voici la lecture que ce check-up produit de votre cabinet.",
}


def r_motivation_tone(profile: dict[str, Any]) -> str:
    """R-motivation-tone : phrase d'accueil cadrée par la motivation déclarée.

    Reprend et étend le câblage Q06 V1.1.8. Toujours une phrase — pour
    `curiosite` une ouverture neutre, jamais d'introduction de cadrage.
    """
    motivation = (profile or {}).get("motivation") or "curiosite"
    return _MOTIVATION_TONE.get(motivation, _MOTIVATION_TONE["curiosite"])


# ----------------------------------------------------------------------
# 10.2 Règles de priorisation
# ----------------------------------------------------------------------


def r_energy_prio(answers: list[dict[str, Any]]) -> dict[str, Any]:
    """R-energy-prio : adapte l'effort proposé au niveau d'énergie.

    Retourne un dict consommé par l'orchestrateur d'opportunités :
    ```
    {
        "energy": "energy_d",
        "max_effort": 1,        # contrainte sur la sélection des modules
        "tonalite": "On commence par dégager du temps mental ...",
    }
    ```
    """
    energy = v2_scoring.get_energy_level(answers)
    if energy == "energy_d":
        return {
            "energy": energy,
            "max_effort": 1,
            "tonalite": "On commence par dégager du temps mental. Le reste viendra quand vous aurez retrouvé un peu de marge.",
        }
    if energy == "energy_c":
        return {
            "energy": energy,
            "max_effort": 2,
            "tonalite": "On vise des leviers qui se mettent en place rapidement, sans demander une bascule organisationnelle complète.",
        }
    if energy == "energy_b":
        return {
            "energy": energy,
            "max_effort": 3,
            "tonalite": None,  # ordre standard
        }
    if energy == "energy_a":
        return {
            "energy": energy,
            "max_effort": 3,
            "tonalite": "Vous avez la disponibilité pour engager des chantiers structurels — c'est le moment où ces bascules portent le plus.",
        }
    # Énergie non renseignée — pas de contrainte, ordre standard
    return {"energy": None, "max_effort": 3, "tonalite": None}


def r_motivation_prio(profile: dict[str, Any], scores: dict[str, Any]) -> dict[str, Any]:
    """R-motivation-prio : pondération différentielle selon motivation.

    Filière 1 de priorisation — s'applique **avant** R-horizon-prio et
    R-energy-prio.
    """
    motivation = (profile or {}).get("motivation")

    if motivation == "risque":
        # Le score le plus bas remonte en priorité absolue.
        ordered_axes = [
            ax for ax in ("A", "B", "C")
            if isinstance(scores.get(ax), dict)
        ]
        ordered_axes.sort(key=lambda a: scores[a]["pct"])
        return {
            "motivation": motivation,
            "strategy": "lowest_first",
            "axes_order": ordered_axes,
            "favor_efforts": None,
        }
    if motivation == "charge":
        return {
            "motivation": motivation,
            "strategy": "low_effort_first",
            "axes_order": None,
            "favor_efforts": [1, 2],
        }
    if motivation == "evenement":
        return {
            "motivation": motivation,
            "strategy": "transmissibility_first",
            "axes_order": None,
            "favor_modules": ["comm", "delegation", "chroniques"],  # cadre/protocoles/équipe
        }
    # Curiosité ou motivation absente → ordre standard
    return {
        "motivation": motivation,
        "strategy": "standard",
        "axes_order": None,
        "favor_efforts": None,
    }


def r_horizon_prio(profile: dict[str, Any]) -> dict[str, Any]:
    """R-horizon-prio : pondération secondaire selon horizon 3 ans.

    Filière 2 — s'applique après R-motivation-prio, avant R-energy-prio.
    """
    horizon = (profile or {}).get("horizon")

    if horizon == "preparer_transmission":
        return {
            "horizon": horizon,
            "blocks_order": ["B", "A", "C"],
            "favor_modules": ["delegation", "comm", "chroniques"],
        }
    if horizon == "renforcer_equipe":
        return {
            "horizon": horizon,
            "blocks_order": ["B", "A", "C"],
            "favor_modules": ["delegation", "comm"],
        }
    if horizon == "demenager_agrandir":
        return {
            "horizon": horizon,
            "blocks_order": ["C", "A", "B"],
            "favor_modules": ["logiciel", "admin"],
        }
    return {"horizon": horizon, "blocks_order": None, "favor_modules": None}


# ----------------------------------------------------------------------
# 10.3 Règles de benchmarks combinatoires (page résultats finale uniquement)
# ----------------------------------------------------------------------


def r_bench_solo_charge(profile: dict[str, Any], scores: dict[str, Any]) -> Optional[dict[str, Any]]:
    """R-bench-solo-charge : si solo ET score_B ≤ 34."""
    if (profile or {}).get("cabinet_type") != "solo":
        return None
    if (_pct(scores, "B") or 100) > 34:
        return None
    return {
        "id": "R-bench-solo-charge",
        "message": (
            "À votre profil, sans équipe formalisée, vous portez seul "
            "l'équivalent d'1,5 ETP d'organisation. C'est une charge "
            "difficile à tenir sur la durée — et c'est précisément ce que "
            "la délégation vient soulager."
        ),
        "source_status": "to_confirm",
        "source_hint": "Études CMG ou DREES sur la charge non médicale du généraliste solo",
    }


def r_bench_volume_admin(profile: dict[str, Any], scores: dict[str, Any]) -> Optional[dict[str, Any]]:
    """R-bench-volume-admin : si volume > 120 actes/semaine ET score_C ≤ 54."""
    if (profile or {}).get("volume") != "gt_120":
        return None
    if (_pct(scores, "C") or 100) > 54:
        return None
    return {
        "id": "R-bench-volume-admin",
        "message": (
            "À votre volume hebdomadaire, la moyenne du temps administratif "
            "est de 2 h 45 par jour — vous êtes probablement au-dessus de "
            "cette moyenne. La marge n'est pas dans plus d'efforts "
            "personnels, elle est dans la délégation ou l'automatisation "
            "d'une partie de ces tâches."
        ),
        "source_status": "to_confirm",
        "source_hint": "CNOM ou DREES temps médecin libéral",
    }


def r_bench_transmission(profile: dict[str, Any], scores: dict[str, Any]) -> Optional[dict[str, Any]]:
    """R-bench-transmission : si status=approche_transmission ET score_B ≤ 54.

    Reformulé en positif post-revue : ce que vous gagnez en structurant,
    pas ce que vous perdez si vous ne le faites pas.
    """
    if (profile or {}).get("status") != "approche_transmission":
        return None
    if (_pct(scores, "B") or 100) > 54:
        return None
    return {
        "id": "R-bench-transmission",
        "message": (
            "Un cabinet bien organisé se valorise 30 à 40 % mieux à la "
            "transmission. Les acheteurs paient pour un système qui tient "
            "sans le médecin sortant — pas pour un poste de travail qui "
            "dépend d'une personne."
        ),
        "source_status": "to_confirm",
        "source_hint": "URML / MG France / conseillers cession cabinet médical",
    }


def r_bench_solo_hero(profile: dict[str, Any], scores: dict[str, Any]) -> Optional[dict[str, Any]]:
    """R-bench-soloHero : solo + sans paramédical + score_A ≥ 55 + score_B ≤ 34.

    Reconnait la performance ET nomme le risque de soutenabilité. Subtil
    — à valider en pilote terrain.
    """
    p = profile or {}
    if p.get("cabinet_type") != "solo":
        return None
    if p.get("paramedical_team") != "non":
        return None
    if (_pct(scores, "A") or 0) < 55:
        return None
    if (_pct(scores, "B") or 100) > 34:
        return None
    return {
        "id": "R-bench-soloHero",
        "message": (
            "Vous tenez votre cabinet à bout de bras, et vous le tenez "
            "bien — c'est ce que le diagnostic dit sur votre parcours "
            "patient. La question n'est pas si vous savez faire. Elle "
            "est : pour combien de temps encore, sans relai ?"
        ),
        "source_status": "qualitative",
        "source_hint": None,
    }


def evaluate_combinatoire_benchmarks(
    profile: dict[str, Any], scores: dict[str, Any]
) -> list[dict[str, Any]]:
    """Évalue les 4 benchmarks combinatoires R-bench-* dans l'ordre.

    Retourne la liste (potentiellement vide) des messages applicables au
    profil×scores. Affichés sur la page résultats finale uniquement, sous
    le radar grand format (cf spec V2 §11.6 — pas pendant le parcours).

    Les benchmarks combinatoires sont **complémentaires** des benchmarks
    inline d'option (qui apparaissent sous chaque question répondue dans
    `interview_protocol_v2.json::options[].benchmark`). Pas de doublon
    possible — les R-bench-* portent sur des combinaisons profil×scores,
    pas sur des options spécifiques.
    """
    out: list[dict[str, Any]] = []
    for rule in (
        r_bench_solo_charge,
        r_bench_volume_admin,
        r_bench_transmission,
        r_bench_solo_hero,
    ):
        result = rule(profile, scores)
        if result is not None:
            out.append(result)
    return out


# ----------------------------------------------------------------------
# 10.4 Règles de routing
# ----------------------------------------------------------------------


# R-routing-solo est implémenté côté `questions.get_visible_questions` —
# silencieux pour le médecin. Pas de message ici.


def r_routing_rdv(profile: dict[str, Any]) -> Optional[str]:
    """R-routing-rdv : enrichit la reformulation C4 si plateforme connue."""
    canal = (profile or {}).get("rdv_canal")
    if canal == "doctolib":
        return (
            "Vous utilisez déjà Doctolib pour la prise de RDV — voici les "
            "outils suivants à explorer qui s'intègrent à votre écosystème : "
            "MSSanté pour les correspondances confrères, Mon Espace Santé "
            "pour alimenter le dossier patient."
        )
    if canal == "maiia":
        return (
            "Vous utilisez déjà Maiia pour la prise de RDV — l'environnement "
            "est cohérent avec une extension côté téléconsultation et "
            "messagerie sécurisée."
        )
    return None


# ----------------------------------------------------------------------
# 10.5 Règle territoire (enrichit, ne modifie jamais le scoring — cf §3.3)
# ----------------------------------------------------------------------


def r_territoire_context(
    profile: dict[str, Any], interview_id: int = 0
) -> Optional[str]:
    """R-territoire-context : si territoire=zone_sous_dotee, mention sur les
    chantiers de coordination/orientation. **Ne modifie jamais le score.**
    """
    if (profile or {}).get("territoire") != "zone_sous_dotee":
        return None
    variants = [
        "Sachant les délais d'accès aux spécialistes dans votre zone, ce chantier prend une dimension supplémentaire — la coordination locale n'est pas une option, c'est ce qui compense l'écart d'offre.",
        "En zone sous-dotée, ce levier compense partiellement ce que vous ne pouvez pas obtenir de l'écosystème médical autour.",
    ]
    return _pick_deterministic(variants, interview_id, "R-territoire-context")


# ----------------------------------------------------------------------
# 10.6 Règle remplaçant (composite : bandeau + ton + filtre)
# ----------------------------------------------------------------------


# Chantiers exclus pour un remplaçant : ceux qui supposent une autorité
# d'installation (recrutement assistant médical, formalisation rôles
# équipe, restructuration protocoles, délégation formelle).
_REPLACEMENT_EXCLUDED_MODULES = frozenset({"delegation", "comm"})


def r_replacement(profile: dict[str, Any]) -> Optional[dict[str, Any]]:
    """R-replacement : composite si status=remplacant.

    Retourne un payload structuré :
    ```
    {
        "active": True,
        "banner": "Vous êtes remplaçant — ...",
        "tonality_examples": ["Vous observez actuellement ...", ...],
        "excluded_modules": frozenset({"delegation", "comm"}),
        "fallback_if_too_short": "À ce stade, le check-up sert d'outil ..."
    }
    ```
    """
    if (profile or {}).get("status") != "remplacant":
        return None
    return {
        "active": True,
        "banner": (
            "Vous êtes remplaçant — les recommandations qui suivent sont à "
            "lire comme une grille de lecture des cabinets que vous "
            "traversez, pas comme un plan d'action immédiat."
        ),
        "tonality_examples": [
            "Vous observez actuellement comment ce cabinet est organisé sur ce point.",
            "À votre stade, l'enjeu est moins de transformer que d'identifier les pratiques que vous voudrez reprendre dans votre installation future.",
        ],
        "excluded_modules": _REPLACEMENT_EXCLUDED_MODULES,
        "fallback_if_too_short": (
            "À ce stade, le check-up sert d'outil de lecture. Refaites-le "
            "quand vous serez installé — il prendra une autre profondeur."
        ),
    }


# ----------------------------------------------------------------------
# Orchestrateur : agrège toutes les règles applicables pour un profil donné
# ----------------------------------------------------------------------


def apply_rules(
    profile: Optional[dict[str, Any]],
    scores: dict[str, Any],
    answers: list[dict[str, Any]],
    interview_id: int = 0,
) -> dict[str, Any]:
    """Évalue les 13 règles déterministes et retourne un payload consolidé.

    Ce payload est consommé par le futur `src/v2/templates.py` (T4) pour
    assembler la page résultats finale. À ce stade T2, on expose juste
    les sorties brutes — pas encore d'assemblage narratif.
    """
    profile = profile or {}

    return {
        "tonality": {
            "status_junior": r_status_junior(profile, interview_id),
            "status_senior": r_status_senior(profile, interview_id),
            "motivation_intro": r_motivation_tone(profile),
        },
        "prioritization": {
            "energy": r_energy_prio(answers),
            "motivation": r_motivation_prio(profile, scores),
            "horizon": r_horizon_prio(profile),
        },
        "benchmarks_combinatoire": evaluate_combinatoire_benchmarks(profile, scores),
        "routing": {
            "rdv_message": r_routing_rdv(profile),
        },
        "territoire_context": r_territoire_context(profile, interview_id),
        "replacement": r_replacement(profile),
    }
