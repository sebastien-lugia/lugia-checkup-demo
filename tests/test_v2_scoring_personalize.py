"""Tests unitaires + intégration pour le package `src/v2/` (V2.0-T2).

Couvre :
- Routing solo b1b/b3 dans le bloc B (6 questions visibles).
- Scoring par bloc avec formule N_visible=6 + banker's rounding Python.
- Mapping niveaux qualitatifs (seuils 35 / 55 / 78).
- 6 signaux croisés en cascade priorisée (S-burnout, S-tech-vs-organisation,
  S-admin, S-paradox, S-tools-opp, S-structured).
- 13 règles de personnalisation sur 4 profils synthétiques.
- Déterminisme : même interview_id → même variante de message.
- Sécurité scoring : option d'une question non visible pour ce profil ignorée.

Lancement :
    cd lugia-checkup-demo
    python3 -m pytest tests/test_v2_scoring_personalize.py -v
    # ou en standalone :
    python3 tests/test_v2_scoring_personalize.py
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from src.v2 import (
    modules as v2_modules,
    personalize as v2_personalize,
    questions as v2_questions,
    scoring as v2_scoring,
    signals as v2_signals,
)


# ----------------------------------------------------------------------
# Fixtures
# ----------------------------------------------------------------------


def _profile_chateau() -> dict:
    """Profil persona Chateau adapté V2.0 (senior solo, transmission, charge)."""
    return {
        "cabinet_type": "solo",
        "volume": "80_120",
        "paramedical_team": "non",
        "logiciel_metier": "medidoc",
        "rdv_canal": "doctolib",
        "status": "approche_transmission",
        "territoire": "periurbain",
        "horizon": "preparer_transmission",
        "motivation": "charge",
    }


def _answers_chateau() -> list[dict]:
    """Parcours complet V2 — Chateau-style.

    Scores attendus (banker's rounding Python) :
    - A = (2+3+3+3+2+2) / 24 × 100 = 62.5 → 62
    - B = (1+1+1+2+2+2) / 24 × 100 = 37.5 → 38
    - C = (2+3+2+3+2+1) / 24 × 100 = 54.16 → 54
    """
    return [
        {"question_id": "energy", "selected_option": "energy_c", "scored": 0},
        # Bloc A
        {"question_id": "a1", "selected_option": "a1_b", "scored": 1},
        {"question_id": "a2", "selected_option": "a2_c", "scored": 1},
        {"question_id": "a3", "selected_option": "a3_c", "scored": 1},
        {"question_id": "a4", "selected_option": "a4_c", "scored": 1},
        {"question_id": "a5", "selected_option": "a5_b", "scored": 1},
        {"question_id": "a6", "selected_option": "a6_b", "scored": 1},
        # Bloc B (solo : b1b sert, b3 inactif)
        {"question_id": "b1", "selected_option": "b1_a", "scored": 1},
        {"question_id": "b1b", "selected_option": "b1b_a", "scored": 1},
        {"question_id": "b4", "selected_option": "b4_a", "scored": 1},
        {"question_id": "b5", "selected_option": "b5_b", "scored": 1},
        {"question_id": "b6", "selected_option": "b6_b", "scored": 1},
        {"question_id": "b7", "selected_option": "b7_b", "scored": 1},
        # Bloc C
        {"question_id": "c1", "selected_option": "c1_b", "scored": 1},
        {"question_id": "c2", "selected_option": "c2_c", "scored": 1},
        {"question_id": "c3", "selected_option": "c3_b", "scored": 1},
        {"question_id": "c4", "selected_option": "c4_c", "scored": 1},
        {"question_id": "c5", "selected_option": "c5_b", "scored": 1},
        {"question_id": "c6", "selected_option": "c6_a", "scored": 1},
    ]


# ----------------------------------------------------------------------
# Routing
# ----------------------------------------------------------------------


def test_routing_solo_serves_b1b():
    vis = v2_questions.get_visible_questions("B", {"cabinet_type": "solo"})
    ids = [q["id"] for q in vis]
    assert len(ids) == 6
    assert "b1b" in ids and "b3" not in ids


def test_routing_non_solo_serves_b3():
    vis = v2_questions.get_visible_questions("B", {"cabinet_type": "msp"})
    ids = [q["id"] for q in vis]
    assert len(ids) == 6
    assert "b3" in ids and "b1b" not in ids


def test_routing_empty_profile_defaults_non_solo():
    """Profil absent ou vide → fallback non-solo (b3 servi)."""
    vis = v2_questions.get_visible_questions("B", None)
    ids = [q["id"] for q in vis]
    assert "b3" in ids and "b1b" not in ids


# ----------------------------------------------------------------------
# Scoring
# ----------------------------------------------------------------------


def test_score_to_level_thresholds():
    assert v2_scoring.score_to_level(0) == "a_risque"
    assert v2_scoring.score_to_level(34) == "a_risque"
    assert v2_scoring.score_to_level(35) == "a_surveiller"
    assert v2_scoring.score_to_level(54) == "a_surveiller"
    assert v2_scoring.score_to_level(55) == "operationnel"
    assert v2_scoring.score_to_level(77) == "operationnel"
    assert v2_scoring.score_to_level(78) == "maitrise"
    assert v2_scoring.score_to_level(100) == "maitrise"


def test_chateau_scores_match_manual():
    scores = v2_scoring.compute_all_scores(_answers_chateau(), _profile_chateau())
    assert scores["A"]["pct"] == 62
    assert scores["B"]["pct"] == 38  # banker's rounding 37.5 → 38
    assert scores["C"]["pct"] == 54
    assert scores["global_score"] == 51
    assert scores["A"]["level"] == "operationnel"
    assert scores["B"]["level"] == "a_surveiller"
    assert scores["C"]["level"] == "a_surveiller"


def test_partial_journey_has_none_scores():
    partial = _answers_chateau()[:7]  # bloc A complet, B et C vides
    scores = v2_scoring.compute_all_scores(partial, _profile_chateau())
    assert scores["A"]["pct"] == 62
    assert scores["B"] is None
    assert scores["C"] is None
    assert scores["global_score"] is None
    assert v2_scoring.has_three_complete_blocks(scores) is False


def test_n_visible_ignores_non_routed_options():
    """Pour un MSP, la réponse à b1b ne doit PAS être comptée (b1b non visible)."""
    profile_msp = {"cabinet_type": "msp"}
    answers = [
        {"question_id": "b1", "selected_option": "b1_c", "scored": 1},  # s=3
        {"question_id": "b3", "selected_option": "b3_c", "scored": 1},  # s=3
        {"question_id": "b4", "selected_option": "b4_c", "scored": 1},  # s=3
        {"question_id": "b5", "selected_option": "b5_c", "scored": 1},  # s=3
        {"question_id": "b6", "selected_option": "b6_c", "scored": 1},  # s=3
        {"question_id": "b7", "selected_option": "b7_c", "scored": 1},  # s=3
        # b1b répondu mais non visible — doit être ignoré
        {"question_id": "b1b", "selected_option": "b1b_d", "scored": 1},
    ]
    score = v2_scoring.score_block("B", answers, profile_msp)
    # 6 réponses × s=3 = 18 / (6*4) = 75% — b1b ignoré
    assert score == 75


def test_energy_level_extraction():
    answers = [{"question_id": "energy", "selected_option": "energy_c", "scored": 0}]
    assert v2_scoring.get_energy_level(answers) == "energy_c"
    assert v2_scoring.get_energy_level([]) is None


# ----------------------------------------------------------------------
# Signaux croisés
# ----------------------------------------------------------------------


def _scores_from(a: int, b: int, c: int) -> dict:
    """Helper : construit un dict scores partiel suffisant pour les signaux."""
    def block(pct: int) -> dict:
        return {"pct": pct, "level": v2_scoring.score_to_level(pct),
                "label": "", "title": "", "axe_label": ""}
    return {"A": block(a), "B": block(b), "C": block(c)}


def test_signal_burnout():
    sig = v2_signals.evaluate_signals(_scores_from(20, 25, 40))
    assert sig is not None and sig["id"] == "S-burnout"


def test_signal_tech_vs_organisation_inhibits_burnout():
    """Cas limite : A=33 B=34 C=90 → S-burnout exclu car C≥55."""
    sig = v2_signals.evaluate_signals(_scores_from(33, 34, 90))
    assert sig is not None
    assert sig["id"] == "S-tech-vs-organisation"


def test_signal_admin():
    sig = v2_signals.evaluate_signals(_scores_from(60, 30, 30))
    assert sig is not None and sig["id"] == "S-admin"


def test_signal_paradox():
    sig = v2_signals.evaluate_signals(_scores_from(70, 30, 70))
    assert sig is not None and sig["id"] == "S-paradox"


def test_signal_structured():
    sig = v2_signals.evaluate_signals(_scores_from(70, 80, 70))
    assert sig is not None and sig["id"] == "S-structured"


def test_no_signal_on_incomplete_scores():
    """Un signal ne s'évalue que sur 3 axes complets."""
    incomplete = {"A": None, "B": _scores_from(50, 50, 50)["B"], "C": None}
    assert v2_signals.evaluate_signals(incomplete) is None


# ----------------------------------------------------------------------
# Personnalisation — 13 règles
# ----------------------------------------------------------------------


def test_r_status_junior_active_on_recent():
    msg = v2_personalize.r_status_junior({"status": "recent"}, interview_id=1)
    assert msg is not None
    assert v2_personalize.r_status_junior({"status": "senior"}) is None


def test_r_status_senior_active_on_senior_or_transmission():
    assert v2_personalize.r_status_senior({"status": "senior"}, 1) is not None
    assert v2_personalize.r_status_senior({"status": "approche_transmission"}, 1) is not None
    assert v2_personalize.r_status_senior({"status": "recent"}) is None


def test_r_motivation_tone_branches():
    for motiv, expected_keyword in (
        ("charge", "pèse"),
        ("evenement", "événement"),
        ("risque", "sécuriser"),
        ("curiosite", "lecture"),
    ):
        msg = v2_personalize.r_motivation_tone({"motivation": motiv})
        assert expected_keyword in msg.lower() or expected_keyword in msg


def test_r_energy_prio_at_bord_caps_effort():
    out = v2_personalize.r_energy_prio(
        [{"question_id": "energy", "selected_option": "energy_d"}]
    )
    assert out["max_effort"] == 1
    assert "dégager du temps" in out["tonalite"]


def test_r_energy_prio_bien_unlocks_invest():
    out = v2_personalize.r_energy_prio(
        [{"question_id": "energy", "selected_option": "energy_a"}]
    )
    assert out["max_effort"] == 3


def test_r_motivation_prio_risque_picks_lowest():
    scores = _scores_from(40, 25, 60)
    out = v2_personalize.r_motivation_prio({"motivation": "risque"}, scores)
    assert out["strategy"] == "lowest_first"
    assert out["axes_order"] == ["B", "A", "C"]  # B<A<C


def test_r_horizon_prio_transmission_promotes_B():
    out = v2_personalize.r_horizon_prio({"horizon": "preparer_transmission"})
    assert out["blocks_order"][0] == "B"


def test_r_bench_solo_charge_triggers_only_on_solo_low_B():
    scores_low_b = _scores_from(50, 25, 50)
    scores_ok_b = _scores_from(50, 50, 50)
    assert v2_personalize.r_bench_solo_charge({"cabinet_type": "solo"}, scores_low_b) is not None
    assert v2_personalize.r_bench_solo_charge({"cabinet_type": "solo"}, scores_ok_b) is None
    assert v2_personalize.r_bench_solo_charge({"cabinet_type": "msp"}, scores_low_b) is None


def test_r_bench_transmission_triggers_on_approche_and_low_B():
    assert v2_personalize.r_bench_transmission(
        {"status": "approche_transmission"}, _scores_from(60, 50, 60)
    ) is not None
    # B>54 → ne déclenche pas
    assert v2_personalize.r_bench_transmission(
        {"status": "approche_transmission"}, _scores_from(60, 60, 60)
    ) is None


def test_r_bench_solo_hero_strict_conditions():
    p = {"cabinet_type": "solo", "paramedical_team": "non"}
    assert v2_personalize.r_bench_solo_hero(p, _scores_from(75, 25, 50)) is not None
    # B≥35 → pas hero
    assert v2_personalize.r_bench_solo_hero(p, _scores_from(75, 50, 50)) is None
    # Avec paramédical → pas hero
    p_with_team = {**p, "paramedical_team": "infirmiere"}
    assert v2_personalize.r_bench_solo_hero(p_with_team, _scores_from(75, 25, 50)) is None


def test_r_replacement_returns_composite_payload():
    out = v2_personalize.r_replacement({"status": "remplacant"})
    assert out is not None
    assert out["active"] is True
    assert "remplaçant" in out["banner"].lower()
    assert "delegation" in out["excluded_modules"]
    assert "comm" in out["excluded_modules"]


def test_r_routing_rdv_doctolib_and_maiia():
    assert "Doctolib" in v2_personalize.r_routing_rdv({"rdv_canal": "doctolib"})
    assert "Maiia" in v2_personalize.r_routing_rdv({"rdv_canal": "maiia"})
    assert v2_personalize.r_routing_rdv({"rdv_canal": "tel_direct"}) is None


def test_r_territoire_context_only_on_sous_dotee():
    assert v2_personalize.r_territoire_context({"territoire": "zone_sous_dotee"}, 1) is not None
    assert v2_personalize.r_territoire_context({"territoire": "urbain_dense"}, 1) is None


def test_determinism_same_interview_id_same_variant():
    """Une même interview_id doit produire la même variante (rejouable)."""
    p = {"status": "senior"}
    v1 = v2_personalize.r_status_senior(p, 42)
    v1_again = v2_personalize.r_status_senior(p, 42)
    assert v1 == v1_again


# ----------------------------------------------------------------------
# Intégration : apply_rules consolide tout
# ----------------------------------------------------------------------


def test_apply_rules_chateau_consolidation():
    profile = _profile_chateau()
    answers = _answers_chateau()
    scores = v2_scoring.compute_all_scores(answers, profile)
    out = v2_personalize.apply_rules(profile, scores, answers, interview_id=42)

    # Tonalité senior (status=approche_transmission)
    assert out["tonality"]["status_senior"] is not None
    assert out["tonality"]["status_junior"] is None
    # Motivation charge → phrase d'accueil
    assert "ce qui pèse" in out["tonality"]["motivation_intro"]
    # Énergie C → max_effort 2
    assert out["prioritization"]["energy"]["max_effort"] == 2
    # Motivation charge → low_effort_first
    assert out["prioritization"]["motivation"]["strategy"] == "low_effort_first"
    # Horizon preparer_transmission → B avant A C
    assert out["prioritization"]["horizon"]["blocks_order"] == ["B", "A", "C"]
    # Benchmarks combinatoires : B=38 → transmission OK (B≤54), pas solo-charge (B>34)
    bench_ids = {b["id"] for b in out["benchmarks_combinatoire"]}
    assert "R-bench-transmission" in bench_ids
    assert "R-bench-solo-charge" not in bench_ids
    # Routing rdv doctolib
    assert "Doctolib" in out["routing"]["rdv_message"]
    # Pas en zone sous-dotée
    assert out["territoire_context"] is None
    # Pas remplaçant
    assert out["replacement"] is None


# ----------------------------------------------------------------------
# Standalone runner (pour ceux qui n'ont pas pytest)
# ----------------------------------------------------------------------


if __name__ == "__main__":
    import inspect

    tests = [
        (name, fn)
        for name, fn in sorted(inspect.getmembers(sys.modules[__name__]))
        if name.startswith("test_") and callable(fn)
    ]
    passed = 0
    failed = []
    for name, fn in tests:
        try:
            fn()
            passed += 1
            print(f"  ✓ {name}")
        except Exception as e:
            failed.append((name, e))
            print(f"  ✗ {name} — {e}")
    print()
    print(f"{passed}/{len(tests)} tests passent")
    if failed:
        sys.exit(1)
