"""Lugia Check-up — Page de résultats (V0-4b).

Charge l'interview courante, calcule les scores par facette via
`src.scoring`, compose la synthèse et les résumés par facette via
`src.templates`, et rend la page de résultats.

V0-4b : scoring et synthèse dynamiques. La section "chantiers" reste
mockée (statique) en attendant l'instanciation paramétrée en V0-4c.
"""

from __future__ import annotations

from datetime import datetime

import streamlit as st

from src import db
from src import questions as question_module
from src import scoring
from src import templates
from src import workstreams

st.set_page_config(
    page_title="Lugia — Résultats du check-up",
    layout="centered",
    initial_sidebar_state="collapsed",
)

CUSTOM_CSS = """
<style>
  [data-testid="stSidebarNav"] { display: none; }
  [data-testid="stSidebar"] { display: none; }
  [data-testid="collapsedControl"] { display: none; }

  .stApp { background-color: #faf9f5; }
  html, body, [class*="css"] {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    color: #1a1a1a;
  }

  .lugia-brand { font-size: 14px; font-weight: 500; letter-spacing: 0.02em; margin: 0 0 4px 0; }
  .lugia-tag { font-size: 12px; color: #888780; margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.08em; }
  .lugia-title { font-family: Georgia, "Times New Roman", serif; font-size: 26px; font-weight: 500; margin: 0 0 4px 0; }
  .lugia-date { font-size: 13px; color: #595959; margin-bottom: 2rem; }

  .lugia-mock-banner {
    background: #fefbe8;
    border: 0.5px solid #d4af37;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-size: 13px;
    color: #595959;
    margin-bottom: 1.5rem;
  }

  .lugia-section-label {
    font-size: 12px; font-weight: 500; color: #595959;
    margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.08em;
  }

  .lugia-synthesis {
    background: #f5f4ef;
    border-left: 2px solid #185FA5;
    padding: 1rem 1.25rem;
    margin-bottom: 2.5rem;
    font-family: Georgia, "Times New Roman", serif;
    font-size: 17px;
    line-height: 1.7;
  }
  .lugia-synthesis em { font-style: italic; color: #185FA5; }

  .lugia-facet {
    background: #ffffff;
    border: 0.5px solid rgba(0,0,0,0.15);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    height: 100%;
  }
  .lugia-facet-name { font-size: 14px; font-weight: 500; margin-bottom: 10px; }
  .lugia-facet-score { display: flex; align-items: baseline; gap: 4px; margin-bottom: 10px; }
  .lugia-facet-score-val { font-family: Georgia, "Times New Roman", serif; font-size: 32px; font-weight: 500; line-height: 1; }
  .lugia-facet-score-total { font-size: 13px; color: #595959; }
  .lugia-facet-bar { height: 3px; background: #f5f4ef; border-radius: 2px; margin-bottom: 12px; overflow: hidden; }
  .lugia-facet-bar-fill { height: 100%; background: #1a1a1a; border-radius: 2px; }
  .lugia-facet-summary { font-size: 13px; color: #595959; line-height: 1.6; }
  .lugia-facet-empty { font-size: 13px; color: #888780; font-style: italic; line-height: 1.6; }

  .lugia-chantier {
    background: #ffffff;
    border: 0.5px solid rgba(0,0,0,0.15);
    border-radius: 12px;
    padding: 1.25rem 1.5rem;
    margin-bottom: 12px;
  }
  .lugia-chantier-head {
    display: flex; justify-content: space-between; align-items: baseline;
    padding-bottom: 12px; margin-bottom: 14px;
    border-bottom: 0.5px solid rgba(0,0,0,0.15);
  }
  .lugia-chantier-title { font-size: 16px; font-weight: 500; }
  .lugia-chantier-prio { font-size: 12px; font-weight: 500; color: #595959; }
  .lugia-chantier-grid {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 14px 20px;
  }
  .lugia-chantier-block-label {
    font-size: 11px; font-weight: 500; color: #595959;
    margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.06em;
  }
  .lugia-chantier-block-text { font-size: 13px; line-height: 1.6; }

  .lugia-nextsteps-title {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 20px; font-weight: 500; margin: 2.5rem 0 1rem 0;
  }
  .lugia-nextstep {
    background: #ffffff;
    border: 0.5px solid rgba(0,0,0,0.15);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    height: 100%;
  }
  .lugia-nextstep-rec { border: 2px solid #185FA5; }
  .lugia-nextstep-badge {
    font-size: 11px; font-weight: 500; color: #595959;
    margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.06em;
  }
  .lugia-nextstep-badge-rec { color: #185FA5; }
  .lugia-nextstep-title { font-size: 14px; font-weight: 500; margin-bottom: 4px; }
  .lugia-nextstep-desc { font-size: 13px; color: #595959; line-height: 1.5; }

  .stButton > button {
    background: #1a1a1a; color: #ffffff; border: none;
    border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 500;
  }
  .stButton > button:hover { background: #333333; color: #ffffff; }
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


# ---- Vérification de session ----

interview_id = st.session_state.get("interview_id")
if interview_id is None:
    st.warning(
        "Aucune session active. Démarrez ou reprenez un check-up depuis l'accueil "
        "pour voir des résultats."
    )
    if st.button("Retour à l'accueil"):
        st.switch_page("app.py")
    st.stop()

interview = db.get_interview(interview_id)
if interview is None:
    st.error("Session introuvable en base.")
    if st.button("Retour à l'accueil"):
        st.switch_page("app.py")
    st.stop()


# ---- Calcul ----

answers = db.get_answers(interview_id)
facet_scores = scoring.compute_all_facet_scores(interview_id)
facet_labels = question_module.get_facet_labels()

synthesis_text = templates.build_synthesis(answers)
recommended_step = templates.build_next_step_recommendation(facet_scores, answers)


# ---- En-tête ----

created_at = interview["created_at"]
try:
    date_label = datetime.fromisoformat(created_at).strftime("%d %B %Y")
except (ValueError, TypeError):
    date_label = created_at[:10] if created_at else ""

st.markdown('<div class="lugia-brand">Lugia</div>', unsafe_allow_html=True)
st.markdown('<div class="lugia-tag">Check-up préventif</div>', unsafe_allow_html=True)
st.markdown('<h1 class="lugia-title">Votre cabinet vu par le check-up</h1>', unsafe_allow_html=True)
st.markdown(f'<div class="lugia-date">Réalisé le {date_label}</div>', unsafe_allow_html=True)


# ---- Synthèse ----

st.markdown(
    '<div class="lugia-section-label">Votre situation aujourd\'hui</div>',
    unsafe_allow_html=True,
)
st.markdown(f'<div class="lugia-synthesis">{synthesis_text}</div>', unsafe_allow_html=True)


# ---- Trois facettes ----

st.markdown(
    '<div class="lugia-section-label">Trois angles de votre cabinet</div>',
    unsafe_allow_html=True,
)

facet_order = ["processes", "participants", "information"]
facet_cols = st.columns(3)
for col, facet_key in zip(facet_cols, facet_order):
    score_data = facet_scores.get(facet_key)
    name = facet_labels.get(facet_key, facet_key).capitalize()
    summary = templates.build_facet_summary(facet_key, answers)

    with col:
        if score_data is None:
            st.markdown(
                f'<div class="lugia-facet">'
                f'<div class="lugia-facet-name">{name}</div>'
                f'<div class="lugia-facet-empty">Pas assez de données pour scorer cette facette.</div>'
                f'</div>',
                unsafe_allow_html=True,
            )
        else:
            score = score_data["score"]
            pct = max(0, min(100, score * 10))
            st.markdown(
                f'<div class="lugia-facet">'
                f'<div class="lugia-facet-name">{name}</div>'
                f'<div class="lugia-facet-score">'
                f'<span class="lugia-facet-score-val">{score}</span>'
                f'<span class="lugia-facet-score-total">/ 10</span>'
                f'</div>'
                f'<div class="lugia-facet-bar">'
                f'<div class="lugia-facet-bar-fill" style="width: {pct}%;"></div>'
                f'</div>'
                f'<div class="lugia-facet-summary">{summary}</div>'
                f'</div>',
                unsafe_allow_html=True,
            )


# ---- Chantiers (V0-4c) — générés dynamiquement ----

st.markdown("<div style='height: 2rem;'></div>", unsafe_allow_html=True)
st.markdown(
    '<div class="lugia-section-label">Trois chantiers prioritaires</div>',
    unsafe_allow_html=True,
)

generated_chantiers = workstreams.build_workstreams(interview_id)

for ch in generated_chantiers:
    st.markdown(
        f'<div class="lugia-chantier">'
        f'<div class="lugia-chantier-head">'
        f'<div class="lugia-chantier-title">{ch["title"]}</div>'
        f'<div class="lugia-chantier-prio">Priorité {ch["priority"]}</div>'
        f'</div>'
        f'<div class="lugia-chantier-grid">'
        f'<div><div class="lugia-chantier-block-label">Ce que le check-up a vu</div>'
        f'<div class="lugia-chantier-block-text">{ch["vu"]}</div></div>'
        f'<div><div class="lugia-chantier-block-label">Ce qu\'il ne peut pas confirmer seul</div>'
        f'<div class="lugia-chantier-block-text">{ch["pas_confirmer"]}</div></div>'
        f'<div><div class="lugia-chantier-block-label">Ce que Lugia propose</div>'
        f'<div class="lugia-chantier-block-text">{ch["propose"]}</div></div>'
        f'<div><div class="lugia-chantier-block-label">Ce que vous obtenez</div>'
        f'<div class="lugia-chantier-block-text">{ch["obtient"]}</div></div>'
        f'</div></div>',
        unsafe_allow_html=True,
    )


# ---- Prochaine étape ----

st.markdown('<h2 class="lugia-nextsteps-title">Prochaine étape ?</h2>', unsafe_allow_html=True)

NEXT_STEPS = {
    "autonomie": {
        "badge": "À votre rythme",
        "title": "Rester en autonomie",
        "desc": "Reprendre les chantiers proposés seul, à votre rythme.",
    },
    "lugia": {
        "badge": "Recommandé",
        "title": "Échanger avec Lugia",
        "desc": "30 minutes pour reprendre ce que vous avez vu et tester l'environnement sécurisé.",
    },
    "terrain": {
        "badge": "Plus complet",
        "title": "Lancer un diagnostic terrain",
        "desc": "Une journée d'observation sur place pour affiner les chantiers.",
    },
}

ns_cols = st.columns(3)
for col, key in zip(ns_cols, ["autonomie", "lugia", "terrain"]):
    step = NEXT_STEPS[key]
    is_rec = (key == recommended_step)
    classes = "lugia-nextstep lugia-nextstep-rec" if is_rec else "lugia-nextstep"
    badge_classes = "lugia-nextstep-badge lugia-nextstep-badge-rec" if is_rec else "lugia-nextstep-badge"
    badge_text = "Recommandé" if is_rec else step["badge"]
    with col:
        st.markdown(
            f'<div class="{classes}">'
            f'<div class="{badge_classes}">{badge_text}</div>'
            f'<div class="lugia-nextstep-title">{step["title"]}</div>'
            f'<div class="lugia-nextstep-desc">{step["desc"]}</div>'
            f'</div>',
            unsafe_allow_html=True,
        )


# ---- Navigation ----

st.markdown("<div style='height: 2rem;'></div>", unsafe_allow_html=True)
col_back, _ = st.columns([1, 2])
with col_back:
    if st.button("Retour à l'accueil", key="back_home"):
        st.switch_page("app.py")
