"""Lugia Check-up — Page d'accueil.

Point d'entrée du démonstrateur Streamlit. Initialise la base SQLite, affiche
la page d'accueil (promesse, garde-fous, CTA), et orchestre le démarrage ou
la reprise d'une session d'interview.
"""

from __future__ import annotations

import streamlit as st

from src import db

# ---- Configuration de la page Streamlit ----

st.set_page_config(
    page_title="Lugia — Check-up préventif",
    layout="centered",
    initial_sidebar_state="collapsed",
)

# Initialisation de la base si nécessaire (idempotent à chaque rerun)
db.init_db()

# ---- Styles inspirés des wireframes V0-1 ----

CUSTOM_CSS = """
<style>
  /* Sidebar masquée pour préserver un parcours linéaire en V0 */
  [data-testid="stSidebarNav"] { display: none; }
  [data-testid="stSidebar"] { display: none; }
  [data-testid="collapsedControl"] { display: none; }

  .stApp { background-color: #faf9f5; }
  html, body, [class*="css"] {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
    color: #1a1a1a;
  }

  .lugia-brand { font-size: 14px; font-weight: 500; letter-spacing: 0.02em; margin: 0 0 4px 0; }
  .lugia-tag { font-size: 12px; color: #888780; margin-bottom: 2.5rem; text-transform: uppercase; letter-spacing: 0.08em; }
  .lugia-promise {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 28px; font-weight: 500; line-height: 1.4;
    margin: 0 0 1.5rem 0;
  }
  .lugia-promise em { font-style: italic; color: #185FA5; }
  .lugia-desc { font-size: 16px; color: #595959; margin-bottom: 2rem; line-height: 1.7; }
  .lugia-desc p { margin: 0 0 0.5rem 0; }

  .lugia-card {
    background: #ffffff;
    border: 0.5px solid rgba(0,0,0,0.15);
    border-radius: 12px;
    padding: 1rem 1.25rem;
    height: 100%;
  }
  .lugia-card-label {
    font-size: 12px; font-weight: 500; color: #595959;
    margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.06em;
  }
  .lugia-card-list { font-size: 14px; margin: 0; padding-left: 18px; line-height: 1.7; color: #1a1a1a; }
  .lugia-card-list li { margin: 2px 0; }

  .lugia-cta-note { font-size: 13px; color: #888780; margin-top: 12px; }

  /* Boutons Streamlit alignés sur le wireframe */
  .stButton > button {
    background: #1a1a1a;
    color: #ffffff;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
  }
  .stButton > button:hover {
    background: #333333;
    color: #ffffff;
  }
  .stButton > button:focus {
    box-shadow: 0 0 0 2px rgba(24,95,165,0.3);
    outline: none;
  }
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)

# ---- En-tête et promesse ----

st.markdown('<div class="lugia-brand">Lugia</div>', unsafe_allow_html=True)
st.markdown(
    '<div class="lugia-tag">Le check-up préventif de votre cabinet</div>',
    unsafe_allow_html=True,
)
st.markdown(
    '<p class="lugia-promise">En moins de 30 minutes, Lugia vous aide à répondre à la '
    'question : <em>où en est réellement votre cabinet aujourd\'hui ?</em></p>',
    unsafe_allow_html=True,
)
st.markdown(
    '<div class="lugia-desc">'
    '<p>Le check-up transforme vos réponses en une première lecture de votre système de travail.</p>'
    '<p>Il met en mots ce qui fatigue, ce qui dépend trop de l\'informel, et les premiers chantiers à mener.</p>'
    '<p>Il prépare, si vous le souhaitez, une analyse plus approfondie avec Lugia.</p>'
    '</div>',
    unsafe_allow_html=True,
)

# ---- Cartes "Ce que vous pouvez attendre" et "Vos garde-fous" ----

col_left, col_right = st.columns(2)
with col_left:
    st.markdown(
        '<div class="lugia-card">'
        '<div class="lugia-card-label">Ce que vous pouvez attendre</div>'
        '<ul class="lugia-card-list">'
        '<li>Une lecture claire de votre fonctionnement actuel</li>'
        '<li>Trois chantiers prioritaires</li>'
        '<li>Une discussion possible avec Lugia ensuite</li>'
        '</ul></div>',
        unsafe_allow_html=True,
    )
with col_right:
    st.markdown(
        '<div class="lugia-card">'
        '<div class="lugia-card-label">Vos garde-fous</div>'
        '<ul class="lugia-card-list">'
        '<li>Aucune donnée patient identifiable saisie</li>'
        '<li>Aucun diagnostic médical produit</li>'
        '<li>Vos réponses restent en local</li>'
        '</ul></div>',
        unsafe_allow_html=True,
    )

st.markdown("<div style='height: 2rem;'></div>", unsafe_allow_html=True)

# ---- Logique de démarrage / reprise ----

existing = db.get_latest_in_progress_interview()
existing_id = existing["id"] if existing else None
current_id = st.session_state.get("interview_id")

if current_id is not None:
    # Session déjà active dans cet onglet
    if st.button("Continuer votre check-up", key="continue"):
        st.switch_page("pages/01_Checkup.py")
    st.markdown(
        '<div class="lugia-cta-note">Vous pouvez interrompre et reprendre à tout moment.</div>',
        unsafe_allow_html=True,
    )
elif existing_id is not None:
    # Session in_progress retrouvée en base
    col_a, col_b = st.columns([1, 1])
    with col_a:
        if st.button("Reprendre votre check-up", key="resume"):
            st.session_state["interview_id"] = existing_id
            st.switch_page("pages/01_Checkup.py")
    with col_b:
        if st.button("Commencer un nouveau check-up", key="restart"):
            new_id = db.create_interview()
            st.session_state["interview_id"] = new_id
            st.switch_page("pages/01_Checkup.py")
    st.markdown(
        f'<div class="lugia-cta-note">Une session précédente est en cours '
        f'(créée le {existing["created_at"][:10]}).</div>',
        unsafe_allow_html=True,
    )
else:
    # Pas de session
    if st.button("Commencer le check-up", key="start"):
        new_id = db.create_interview()
        st.session_state["interview_id"] = new_id
        st.switch_page("pages/01_Checkup.py")
    st.markdown(
        '<div class="lugia-cta-note">Moins de 30 minutes — vous pouvez'
        'interrompre et reprendre à tout moment.</div>',
        unsafe_allow_html=True,
    )
