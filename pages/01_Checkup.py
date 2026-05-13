"""Lugia Check-up — Page interview (V0-3b iter 2).

Affiche les 15 questions du protocole V0 une à une, avec les trois modes
d'interaction (A QCM+complément, B Hybride, C Ouvert pur) et l'alternance
définie dans `resources/interview_protocol.json`.

Persiste chaque réponse dans la table `answer` au moment du "Suivant" et
en partie au moment du "Précédent" (sauvegarde partielle non destructive).
Permet l'interruption et la reprise via `current_question_index` sur
`interview`, et la navigation arrière via "Précédent". Préremplit les
widgets depuis la base lors d'un retour sur une question déjà répondue.
"""

from __future__ import annotations

from typing import Any, Optional

import streamlit as st

from src import db
from src import questions

# ---- Configuration ----

st.set_page_config(
    page_title="Lugia — Interview",
    layout="centered",
    initial_sidebar_state="collapsed",
)

# ---- Styles ----

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
  .lugia-tag { font-size: 12px; color: #888780; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.08em; }

  .lugia-facet-pill {
    display: inline-block;
    font-size: 11px; font-weight: 500; color: #185FA5;
    background: rgba(24, 95, 165, 0.08);
    padding: 3px 10px; border-radius: 999px;
    text-transform: uppercase; letter-spacing: 0.06em;
    margin-bottom: 12px;
  }

  .lugia-question-prompt {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 22px; font-weight: 500; line-height: 1.4;
    margin: 0 0 1.25rem 0; color: #1a1a1a;
  }
  .lugia-question-prompt-secondary {
    font-size: 16px; font-weight: 500; line-height: 1.5;
    margin: 1.75rem 0 0.75rem 0; color: #1a1a1a;
  }
  .lugia-prompt-note {
    font-size: 13px; color: #888780; line-height: 1.5; margin-bottom: 1rem;
  }

  .lugia-thanks-title {
    font-family: Georgia, "Times New Roman", serif;
    font-size: 28px; font-weight: 500;
    margin: 2rem 0 1rem 0;
  }
  .lugia-thanks-text {
    font-size: 16px; color: #595959; line-height: 1.7; margin-bottom: 1.5rem;
  }

  /* Streamlit overrides */
  .stProgress > div > div > div { background-color: #1a1a1a; }
  .stTextArea textarea, .stTextInput input {
    border-radius: 8px; font-size: 14px;
  }
  .stRadio > div { gap: 6px; }
  .stRadio label { font-size: 14px; }

  .stButton > button {
    background: #1a1a1a; color: #ffffff; border: none;
    border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 500;
  }
  .stButton > button:hover { background: #333333; color: #ffffff; }
  .stButton > button:disabled { background: #c9c8c2; color: #ffffff; cursor: not-allowed; }
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


# ---- Helpers ----

def _label_for_option(question: dict[str, Any], option_id: Optional[str]) -> Optional[str]:
    """Retourne le label d'une option donnée d'une question."""
    if option_id is None:
        return None
    for opt in question["options"]:
        if opt["id"] == option_id:
            return opt["label"]
    return None


def _option_for_label(question: dict[str, Any], label: Optional[str]) -> Optional[dict]:
    """Retourne l'option correspondant à un label affiché."""
    if label is None:
        return None
    for opt in question["options"]:
        if opt["label"] == label:
            return opt
    return None


def _prime_widget_state(key: str, value: Any) -> None:
    """Initialise `st.session_state[key]` avec `value` s'il n'existe pas déjà."""
    if key not in st.session_state and value is not None:
        st.session_state[key] = value


# ---- Vérification de session ----

interview_id = st.session_state.get("interview_id")
if interview_id is None:
    st.warning("Aucune session en cours. Retournez à l'accueil pour démarrer un check-up.")
    if st.button("Retour à l'accueil"):
        st.switch_page("app.py")
    st.stop()

db.touch_interview(interview_id)


# ---- Chargement du protocole ----

all_questions = questions.load_questions()
facet_labels = questions.get_facet_labels()
total = len(all_questions)

interview_row = db.get_interview(interview_id)
if interview_row is None:
    st.error("Session introuvable en base. Retour à l'accueil.")
    if st.button("Retour à l'accueil"):
        st.switch_page("app.py")
    st.stop()

current_index = interview_row["current_question_index"]


# ---- En-tête commun ----

st.markdown('<div class="lugia-brand">Lugia</div>', unsafe_allow_html=True)
st.markdown('<div class="lugia-tag">Check-up préventif</div>', unsafe_allow_html=True)


# ---- Cas 1 : Interview terminée ----

if current_index >= total:
    st.markdown('<h1 class="lugia-thanks-title">Merci.</h1>', unsafe_allow_html=True)
    st.markdown(
        '<p class="lugia-thanks-text">Vos 15 réponses sont enregistrées. '
        'La page de résultats vous propose une première lecture de votre cabinet. '
        '<br><br>'
        '<em>Note V0-3b : la version actuelle des résultats est mockée à partir du persona '
        'de référence. Le calcul réel à partir de vos réponses sera implémenté en Phase V0-4.</em></p>',
        unsafe_allow_html=True,
    )
    col_a, col_b = st.columns([1, 1])
    with col_a:
        if st.button("Voir les résultats", key="to_results"):
            st.switch_page("pages/02_Resultats.py")
    with col_b:
        if st.button("Retour à l'accueil", key="to_home"):
            st.switch_page("app.py")
    st.stop()


# ---- Cas 2 : Question en cours ----

question = all_questions[current_index]
mode = question["mode"]
facet = question["facet"]
facet_label = facet_labels.get(facet, facet)

# Précharge depuis la base si la question a déjà été répondue (reprise après quit)
existing_answer = db.get_answer(interview_id, question["id"])

radio_key = f"radio_{question['id']}"
open_key = f"open_{question['id']}"
complement_key = f"complement_{question['id']}"

if existing_answer is not None:
    if existing_answer["selected_option_label"]:
        _prime_widget_state(radio_key, existing_answer["selected_option_label"])
    if existing_answer["free_text"]:
        _prime_widget_state(open_key, existing_answer["free_text"])
    if existing_answer["complement_text"]:
        _prime_widget_state(complement_key, existing_answer["complement_text"])

# Progress bar + topic
st.progress(current_index / total)
st.caption(f"Question {current_index + 1} sur {total}")
st.markdown(f'<div class="lugia-facet-pill">{facet_label}</div>', unsafe_allow_html=True)


# ---- Variables remplies par les widgets selon le mode ----

selected_option_id: Optional[str] = None
selected_option_label: Optional[str] = None
free_text_val: Optional[str] = None
complement_text_val: Optional[str] = None


# ---- Rendu par mode ----

if mode == "A":
    # QCM avec complément optionnel
    st.markdown(
        f'<p class="lugia-question-prompt">{question["qcm_prompt"]}</p>',
        unsafe_allow_html=True,
    )

    options = question["options"]
    labels = [opt["label"] for opt in options]
    choice = st.radio(
        "Réponse",
        labels,
        key=radio_key,
        label_visibility="collapsed",
        index=None,
    )

    if choice is not None:
        chosen = _option_for_label(question, choice)
        if chosen:
            selected_option_id = chosen["id"]
            selected_option_label = chosen["label"]

    complement_label = (
        "Précisez votre réponse"
        if selected_option_id and selected_option_id.endswith("_other")
        else "Un détail à ajouter (optionnel)"
    )
    complement_text_val = st.text_area(
        complement_label,
        key=complement_key,
        height=70,
        placeholder=(
            "Précisez en quelques mots…"
            if selected_option_id and selected_option_id.endswith("_other")
            else "Un exemple récent, une précision, un détail à ajouter…"
        ),
    )

elif mode == "B":
    # Hybride : réponse libre, puis QCM, puis complément optionnel
    open_prompt = question["open_prompt"]
    # Note explicative éventuelle dans le prompt (cas Q14)
    if " Note :" in open_prompt:
        main, note = open_prompt.split(" Note :", 1)
        st.markdown(
            f'<p class="lugia-question-prompt">{main.strip()}</p>',
            unsafe_allow_html=True,
        )
        st.markdown(
            f'<div class="lugia-prompt-note">Note : {note.strip()}</div>',
            unsafe_allow_html=True,
        )
    else:
        st.markdown(
            f'<p class="lugia-question-prompt">{open_prompt}</p>',
            unsafe_allow_html=True,
        )

    free_text_val = st.text_area(
        "Votre réponse en une ou deux phrases",
        key=open_key,
        height=90,
        label_visibility="collapsed",
        placeholder="Votre réponse en une ou deux phrases…",
    )

    st.markdown(
        f'<p class="lugia-question-prompt-secondary">{question["qcm_prompt"]}</p>',
        unsafe_allow_html=True,
    )

    options = question["options"]
    labels = [opt["label"] for opt in options]
    choice = st.radio(
        "Relance",
        labels,
        key=radio_key,
        label_visibility="collapsed",
        index=None,
    )

    if choice is not None:
        chosen = _option_for_label(question, choice)
        if chosen:
            selected_option_id = chosen["id"]
            selected_option_label = chosen["label"]

    complement_label = (
        "Précisez votre 'Autre'"
        if selected_option_id and selected_option_id.endswith("_other")
        else "Un détail à ajouter (optionnel)"
    )
    complement_text_val = st.text_area(
        complement_label,
        key=complement_key,
        height=70,
        placeholder=(
            "Précisez en quelques mots…"
            if selected_option_id and selected_option_id.endswith("_other")
            else "Un exemple récent, une précision, un détail à ajouter…"
        ),
    )

elif mode == "C":
    # Ouvert pur
    st.markdown(
        f'<p class="lugia-question-prompt">{question["open_prompt"]}</p>',
        unsafe_allow_html=True,
    )

    free_text_val = st.text_area(
        "Votre réponse",
        key=open_key,
        height=130,
        label_visibility="collapsed",
        placeholder="Prenez le temps de répondre librement…",
    )


# ---- Validation ----

can_submit = True
if mode == "A":
    if selected_option_id is None:
        can_submit = False
    elif selected_option_id.endswith("_other") and not (complement_text_val or "").strip():
        can_submit = False
elif mode == "B":
    if not (free_text_val or "").strip():
        can_submit = False
    elif selected_option_id is None:
        can_submit = False
    elif selected_option_id.endswith("_other") and not (complement_text_val or "").strip():
        can_submit = False
elif mode == "C":
    if not (free_text_val or "").strip():
        can_submit = False


# ---- Helper : sauvegarde partielle ----

def _save_partial() -> None:
    """Sauvegarde l'état courant sans validation, si quelque chose à enregistrer."""
    has_something = (
        selected_option_id is not None
        or (free_text_val or "").strip()
        or (complement_text_val or "").strip()
    )
    if has_something:
        db.save_answer(
            interview_id=interview_id,
            question_id=question["id"],
            mode=mode,
            selected_option=selected_option_id,
            selected_option_label=selected_option_label,
            free_text=(free_text_val or "").strip() or None,
            complement_text=(complement_text_val or "").strip() or None,
        )


# ---- Boutons : Précédent · Suivant · Quitter ----

st.markdown("<div style='height: 1rem;'></div>", unsafe_allow_html=True)

is_last = (current_index + 1) >= total
label_next = "Terminer le check-up" if is_last else "Suivant"

col_prev, col_next = st.columns([1, 1])

with col_prev:
    if current_index > 0:
        if st.button("← Précédent", key=f"prev_{question['id']}"):
            _save_partial()
            db.set_current_question_index(interview_id, current_index - 1)
            st.rerun()
    else:
        st.write("")  # alignement

with col_next:
    if st.button(label_next, key=f"next_{question['id']}", disabled=not can_submit):
        db.save_answer(
            interview_id=interview_id,
            question_id=question["id"],
            mode=mode,
            selected_option=selected_option_id,
            selected_option_label=selected_option_label,
            free_text=(free_text_val or "").strip() or None,
            complement_text=(complement_text_val or "").strip() or None,
        )
        new_index = current_index + 1
        db.set_current_question_index(interview_id, new_index)
        if new_index >= total:
            db.mark_interview_completed(interview_id)
        st.rerun()

st.markdown("<div style='height: 0.5rem;'></div>", unsafe_allow_html=True)

# Quitter discret
quit_cols = st.columns([1, 2, 1])
with quit_cols[1]:
    if st.button("Quitter et reprendre plus tard", key=f"quit_{question['id']}"):
        _save_partial()
        st.switch_page("app.py")
