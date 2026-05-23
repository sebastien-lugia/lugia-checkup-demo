"""
Assistant Lugia — discussion chantier autonome (A.2, refonte 2026-05-22).

Mécanique structurée 4 phases inspirée du wireframe uploaded :
 - Phase 1 (tour 1) : question ouverte + 3 suggestions
 - Phase 2-3 (tours 2-3) : reformulation + creusement + 3 suggestions
 - Phase 4 (tour 4) : récap + plan d'action structuré (PLAN_JSON) + 3 suggestions
 - Phase 5 (tour 5) : clôture personnalisée + END_CONVERSATION:true

Format de retour Claude (parsé côté backend) :
 - SUGG_JSON:{"items":[...]}  → suggestions cliquables (3 items)
 - PLAN_JSON:{"steps":[{"num","title","body","tag"}]}  → carte plan d'action
 - END_CONVERSATION:true  → bascule UI en mode clôturé
"""

from __future__ import annotations

import json
import os
import re
from typing import Any, Optional

import anthropic


# Limite produit : 20 questions max par conversation (sécurité au cas où
# Claude ne ferme pas en phase 5).
MAX_USER_MESSAGES = 20

MODEL_ID = "claude-haiku-4-5-20251001"


def _build_system_prompt(
    module: dict[str, Any],
    profile: Optional[dict[str, Any]],
    scores: Optional[dict[str, Any]] = None,
) -> str:
    """Compose le system prompt avec la structure 4 phases."""
    label = module.get("label", "ce chantier")
    avec_lugia = module.get("avecLugia", "")
    etapes_txt = "\n".join(
        f"  {e.get('num', '?')}. {e.get('titre', '')}"
        for e in module.get("etapes", [])
    ) or "  (les 4 étapes sont en cours de rédaction)"

    profil_txt = ""
    if profile:
        cabinet = profile.get("cabinet_type") or "non renseigné"
        volume = profile.get("volume") or "non renseigné"
        territoire = profile.get("territoire") or "non renseigné"
        secretariat = profile.get("secretariat") or "non renseigné"
        profil_txt = (
            f"PROFIL DU MÉDECIN :\n"
            f"  - Type de cabinet : {cabinet}\n"
            f"  - Volume hebdomadaire : {volume}\n"
            f"  - Secrétariat : {secretariat}\n"
            f"  - Territoire : {territoire}\n"
        )

    scores_txt = ""
    if scores:
        parts = []
        for axis_id, name in (("A", "Parcours patient"), ("B", "Équipe & secrétariat"), ("C", "Outils & dossiers")):
            axis = scores.get(axis_id)
            if isinstance(axis, dict) and axis.get("pct") is not None:
                parts.append(f"  - {name} : {axis['pct']}% ({axis.get('label', '')})")
        if parts:
            scores_txt = "SCORES DU CHECK-UP :\n" + "\n".join(parts) + "\n"

    return f"""Tu es un expert en organisation des cabinets de médecine générale libérale, avec une approche terrain, directe et bienveillante. Tu parles comme un confrère expérimenté — pas comme un consultant.

{profil_txt}{scores_txt}
CHANTIER CHOISI PAR LE MÉDECIN : "{label}"

Étapes pré-existantes du plan d'action générique :
{etapes_txt}

Ce que Lugia peut faire sur ce chantier (à mentionner UNIQUEMENT si le médecin demande directement de l'aide pour exécuter) :
{avec_lugia}

TON RÔLE :
Tu conduis une conversation de creusement sur ce chantier précis. Le médecin a déjà vu son diagnostic — ne répète pas les scores, ne fais pas de résumé. Plonge directement dans le vif du sujet, en parlant de SA situation à LUI.

STRUCTURE DE LA CONVERSATION (5 tours) :

TOUR 1 — Ouverture
- Une question ouverte très concrète sur le quotidien du médecin face à ce chantier
- 3 suggestions courtes de réponse rapide via SUGG_JSON

TOURS 2 et 3 — Creusement
- Reformule en UNE phrase ce que tu comprends de sa réponse
- Pose UNE question de creusement plus précise (cause racine, contrainte, ressource disponible)
- 3 suggestions courtes de réponse rapide via SUGG_JSON

TOUR 4 — Plan d'action
- Bref récap (1 phrase) de ce qui ressort de l'échange
- Propose un plan d'action en 3 ou 4 étapes concrètes via PLAN_JSON
- Une dernière question : "Par quoi commenceriez-vous concrètement cette semaine ?"
- 3 suggestions courtes correspondant aux étapes du plan via SUGG_JSON

TOUR 5 — Clôture
- Court message d'encouragement personnalisé sur le choix qu'il a fait
- Inclus IMPÉRATIVEMENT la balise END_CONVERSATION:true à la fin du message
- N'inclus AUCUNE suggestion (pas de SUGG_JSON) ni question dans ce dernier message
- Si le médecin veut aller plus loin, mentionne que Sébastien peut accompagner via Calendly

RÈGLES ABSOLUES :
1. Aucun conseil médical, clinique ou thérapeutique. Sujet = organisation.
2. Aucune donnée patient identifiable. Si le médecin en mentionne, recadre vers le système.
3. Jamais de jargon consulting (« leverage », « best practice », « excellence opérationnelle »).
4. Pas de morale (« vous devriez »). Pas de drame (« burn-out imminent »).
5. Une SEULE question à la fois, comme lors d'un entretien entre confrères.
6. Formule comme à un café avec un collègue, pas comme un rapport.
7. Vouvoiement du médecin (respect).

FORMAT TECHNIQUE (très important) :
- À CHAQUE message des tours 1, 2, 3, 4 : tu DOIS inclure EXACTEMENT 3 suggestions via SUGG_JSON.
- Suggestions = vraies réponses plausibles que le médecin pourrait donner, à la première personne, courtes (max 12 mots chacune).
- Format JSON sur une SEULE ligne pour le plan :
  PLAN_JSON:{{"steps":[{{"num":"01","title":"...","body":"...","tag":"quick"}},{{"num":"02","title":"...","body":"...","tag":"medium"}}]}}
- Format JSON sur une SEULE ligne pour les suggestions :
  SUGG_JSON:{{"items":["option 1","option 2","option 3"]}}
- Pour signaler la fin (tour 5 UNIQUEMENT) : END_CONVERSATION:true
- Tags valides pour les steps : "quick" / "medium" / "invest"
- Le reste de ta réponse est du texte normal, sans markdown lourd (pas de titres, pas de listes à puces — le plan d'action est dans PLAN_JSON, pas dans le texte)."""


# ─── Parsing de la réponse Claude ──────────────────────────────────────────


_RE_END = re.compile(r"END_CONVERSATION\s*:\s*true", re.IGNORECASE)
_RE_PLAN = re.compile(r"PLAN_JSON:\s*(\{.*?\}\s*\]\s*\}|\{.*?\})", re.DOTALL)
_RE_SUGG = re.compile(r"SUGG_JSON:\s*(\{[^}]+\})", re.DOTALL)


def parse_assistant_reply(raw: str) -> dict[str, Any]:
    """Extrait text/suggestions/plan/ended depuis la réponse brute Claude.

    Retourne un dict :
      {
        "text": str,                     # message principal nettoyé
        "suggestions": list[str] | None, # 3 réponses rapides
        "plan": list[dict] | None,       # étapes du plan d'action
        "ended": bool,                   # True si END_CONVERSATION détecté
      }
    """
    text = raw
    plan: Optional[list[dict[str, Any]]] = None
    suggestions: Optional[list[str]] = None
    ended = False

    # END_CONVERSATION
    if _RE_END.search(text):
        ended = True
        text = _RE_END.sub("", text)

    # PLAN_JSON
    m_plan = _RE_PLAN.search(text)
    if m_plan:
        try:
            plan_raw = m_plan.group(1).replace("\n", " ")
            obj = json.loads(plan_raw)
            steps = obj.get("steps")
            if isinstance(steps, list):
                plan = steps
            # Retire le bloc PLAN_JSON du texte affiché
            text = text.replace(m_plan.group(0), "").strip()
        except Exception:
            pass  # parsing KO → on laisse tel quel

    # SUGG_JSON
    m_sugg = _RE_SUGG.search(text)
    if m_sugg:
        try:
            obj = json.loads(m_sugg.group(1))
            items = obj.get("items")
            if isinstance(items, list):
                suggestions = [str(s) for s in items][:3]  # max 3
            text = text.replace(m_sugg.group(0), "").strip()
        except Exception:
            pass

    return {
        "text": text.strip(),
        "suggestions": suggestions,
        "plan": plan,
        "ended": ended,
    }


def get_anthropic_client() -> anthropic.Anthropic:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY n'est pas configurée. "
            "Définissez la variable d'environnement avant de démarrer le backend."
        )
    return anthropic.Anthropic(api_key=api_key)


def send_message(
    user_message: str,
    history: list[dict[str, str]],
    module: dict[str, Any],
    profile: Optional[dict[str, Any]] = None,
    scores: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """Envoie un message + historique à Claude. Renvoie la réponse PARSÉE."""
    client = get_anthropic_client()
    system_prompt = _build_system_prompt(module, profile, scores)

    messages = list(history)
    messages.append({"role": "user", "content": user_message})

    response = client.messages.create(
        model=MODEL_ID,
        max_tokens=1000,  # +200 vs avant pour absorber les blocs JSON
        system=system_prompt,
        messages=messages,
    )
    parts = []
    for block in response.content:
        if hasattr(block, "text"):
            parts.append(block.text)
    raw = "".join(parts).strip()
    return parse_assistant_reply(raw)
