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

try:
    import ollama  # type: ignore
except ImportError:
    ollama = None  # type: ignore

# Limite produit : 20 questions max par conversation (sécurité au cas où
# le modèle ne ferme pas en phase 5).
MAX_USER_MESSAGES = 20

# Identifiants modèles par provider
ANTHROPIC_MODEL_ID = "claude-haiku-4-5-20251001"
# Compat ancien import — gardé pour pas casser d'autres modules.
MODEL_ID = ANTHROPIC_MODEL_ID

# SLM local par défaut : qwen2.5:3b (Alibaba) — bon FR, suit bien les
# contraintes JSON structurées, rapide sur Mac M-series (~15-30 tok/s).
# Surchargeable via OLLAMA_MODEL pour tester d'autres modèles.
OLLAMA_MODEL_ID = os.environ.get("OLLAMA_MODEL", "qwen2.5:3b")
# Note : on utilise 127.0.0.1 (IPv4 explicite) plutôt que "localhost" pour
# éviter les soucis de résolution IPv6 (::1) depuis le contexte async de
# FastAPI. Ollama n'écoute typiquement qu'en IPv4 ; si Python résout
# localhost en IPv6 d'abord, on a un "Failed to connect" même quand
# Ollama tourne bien. Surchargeable via OLLAMA_BASE_URL si besoin.
OLLAMA_BASE_URL = os.environ.get("OLLAMA_BASE_URL", "http://127.0.0.1:11434")

# Identifiants providers acceptés côté API
PROVIDER_ANTHROPIC = "anthropic"
PROVIDER_OLLAMA = "ollama"
ALLOWED_PROVIDERS = {PROVIDER_ANTHROPIC, PROVIDER_OLLAMA}


def _build_system_prompt(
    module: dict[str, Any],
    profile: Optional[dict[str, Any]],
    scores: Optional[dict[str, Any]] = None,
    turn_number: int = 1,
) -> str:
    """Compose le system prompt pour le tour courant uniquement.

    Refonte 2026-05-23 : l'ancien prompt enumerait les 5 tours d'un coup.
    qwen2.5:3b interpretait cela comme un template a reproduire dans son
    unique premier message (= envoyait tous les tours d'un coup, terminait
    par END_CONVERSATION, conversation cloturee immediatement, aucun
    SUGG_JSON emis).

    Le nouveau prompt ne decrit QUE l'attendu du `turn_number` courant.
    Le LLM ne voit jamais le mot "TOUR" ni la structure complete. Pour
    Claude (qui suivait deja bien) c'est juste plus economique en tokens ;
    pour les petits modeles c'est ce qui fait la difference entre
    fonctionner et ne pas fonctionner.
    """
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

    # Instructions specifiques au tour courant — c'est la cle de la refonte.
    # On clamp turn_number a [1, 5] pour eviter tout debordement.
    t = max(1, min(5, turn_number))

    if t == 1:
        turn_instruction = (
            "Ce message-ci est le tout premier echange. Le medecin vient de "
            "cliquer sur ce chantier — il n'a encore rien dit de specifique.\n"
            "  - Salue brievement (1 phrase max).\n"
            "  - Pose UNE question ouverte concrete sur son quotidien face a ce chantier.\n"
            "  - Pas de plan d'action a ce stade.\n"
            "  - Inclus 3 suggestions de reponse via SUGG_JSON."
        )
    elif t in (2, 3):
        turn_instruction = (
            "Le medecin vient de te repondre. C'est le moment de creuser.\n"
            "  - Reformule en UNE phrase ce que tu comprends de sa reponse.\n"
            "  - Pose UNE question de creusement plus precise (cause racine, "
            "contrainte du quotidien, ressource a sa disposition).\n"
            "  - Pas encore de plan d'action.\n"
            "  - Inclus 3 suggestions de reponse via SUGG_JSON."
        )
    elif t == 4:
        turn_instruction = (
            "Tu as assez de matiere pour proposer un plan d'action concret.\n"
            "  - Recapitule en UNE phrase ce qui ressort de l'echange.\n"
            "  - Propose un plan d'action en 3 ou 4 etapes via PLAN_JSON.\n"
            "  - Termine par une question type \"par quoi commenceriez-vous "
            "concretement cette semaine ?\".\n"
            "  - Inclus 3 suggestions correspondant aux etapes via SUGG_JSON."
        )
    else:  # t == 5
        turn_instruction = (
            "C'est le moment de cloturer la conversation.\n"
            "  - Court message d'encouragement personnalise (2 phrases max) "
            "sur le chantier qu'il a creuse.\n"
            "  - Mentionne que Sebastien peut l'accompagner via Calendly s'il "
            "veut aller plus loin.\n"
            "  - N'INCLUS PAS de SUGG_JSON ni PLAN_JSON.\n"
            "  - NE POSE PAS de question dans ce dernier message.\n"
            "  - Termine OBLIGATOIREMENT ton message par cette ligne exacte :\n"
            "    END_CONVERSATION:true"
        )

    return f"""Tu es un expert en organisation des cabinets de medecine generale liberale. Tu parles comme un confrere experimente — pas comme un consultant. Approche terrain, directe et bienveillante.

{profil_txt}{scores_txt}
CHANTIER CHOISI PAR LE MEDECIN : "{label}"

Etapes pre-existantes du plan d'action generique :
{etapes_txt}

Ce que Lugia peut faire sur ce chantier (a mentionner UNIQUEMENT si le medecin demande directement de l'aide pour executer) :
{avec_lugia}

TU AS DEJA ECHANGE {t - 1} fois avec ce medecin. CE MESSAGE-CI EST TON {t}E TOUR.

CONSIGNES POUR CE TOUR :
{turn_instruction}

REGLES ABSOLUES (toujours) :
- Aucun conseil medical, clinique ou therapeutique. Sujet = organisation seulement.
- Aucune donnee patient identifiable. Si le medecin en mentionne, recadre vers le systeme.
- Jamais de jargon consulting (« leverage », « best practice », « excellence operationnelle »).
- Pas de morale (« vous devriez »). Pas de drame (« burn-out imminent »).
- UNE SEULE question a la fois, comme lors d'un entretien entre confreres.
- Vouvoiement du medecin.
- 4 a 8 lignes de texte maximum dans la partie message. Pas de markdown lourd, pas de titres, pas de listes a puces.

FORMAT TECHNIQUE (extremement important) :
- Tu ecris UN SEUL message court (pas plusieurs tours d'un coup).
- N'ecris JAMAIS les mots « TOUR 1 », « TOUR 2 », etc. dans ton message.
- Ne decris JAMAIS la structure de la conversation au medecin.
- Le bloc SUGG_JSON doit etre sur UNE SEULE LIGNE et avoir EXACTEMENT 3 items courts (max 12 mots chacun, a la premiere personne, plausibles comme reponse du medecin) :
  SUGG_JSON:{{"items":["option 1","option 2","option 3"]}}
- Le bloc PLAN_JSON (tour 4 uniquement) doit etre sur UNE SEULE LIGNE :
  PLAN_JSON:{{"steps":[{{"num":"01","title":"...","body":"...","tag":"quick"}},{{"num":"02","title":"...","body":"...","tag":"medium"}}]}}
- Tags valides pour les steps : "quick" / "medium" / "invest"
- Pour signaler la fin (tour 5 UNIQUEMENT) : la ligne exacte END_CONVERSATION:true"""


# ─── Parsing de la réponse Claude ──────────────────────────────────────────


_RE_END = re.compile(r"END_CONVERSATION\s*:\s*true", re.IGNORECASE)
_RE_PLAN = re.compile(r"PLAN_JSON:\s*(\{.*?\}\s*\]\s*\}|\{.*?\})", re.DOTALL)
_RE_SUGG = re.compile(r"SUGG_JSON:\s*(\{[^}]+\})", re.DOTALL)
# Bug fix 2026-05-23 : qwen2.5:3b a parfois appris (à tort) à imiter
# notre suffixe interne `__LUGIA_META__:{...}` qui sert à la persistance
# BDD. On le strippe defensivement de la sortie du LLM pour qu'il
# n'apparaisse jamais cote UI. Voir aussi backend/main.py qui nettoie
# l'historique avant de le passer au LLM (deux verrous).
_RE_META = re.compile(r"\n*__LUGIA_META__:\s*\{.*?\}", re.DOTALL)


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

    # Strip defensif du suffixe __LUGIA_META__ que qwen mime parfois
    text = _RE_META.sub("", text)

    return {
        "text": text.strip(),
        "suggestions": suggestions,
        "plan": plan,
        "ended": ended,
    }


# ─── Erreurs typées pour remonter une 503 lisible côté API ──────────────


class LLMProviderUnavailable(RuntimeError):
    """Le provider demandé n'est pas joignable (Ollama down, lib non installée,
    clé API manquante, etc.). L'endpoint FastAPI le convertit en HTTP 503."""


# ─── Clients ───────────────────────────────────────────────────────────────


def get_anthropic_client() -> anthropic.Anthropic:
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise LLMProviderUnavailable(
            "ANTHROPIC_API_KEY n'est pas configurée. "
            "Définissez la variable d'environnement avant de démarrer le backend."
        )
    return anthropic.Anthropic(api_key=api_key)


def get_ollama_client():
    """Retourne un client Ollama pointant sur OLLAMA_BASE_URL.

    Lève LLMProviderUnavailable si :
     - la lib python `ollama` n'est pas installée (pip install ollama)
     - le serveur Ollama ne répond pas sur OLLAMA_BASE_URL
    """
    if ollama is None:
        raise LLMProviderUnavailable(
            "La lib python `ollama` n'est pas installée. "
            "Lancez : pip install ollama --break-system-packages"
        )
    try:
        # Client explicite pour respecter OLLAMA_BASE_URL même si différent
        # du défaut localhost:11434.
        return ollama.Client(host=OLLAMA_BASE_URL)
    except Exception as exc:
        raise LLMProviderUnavailable(
            f"Impossible de créer un client Ollama sur {OLLAMA_BASE_URL} : {exc}"
        )


# ─── Sender par provider ──────────────────────────────────────────────────


def _send_anthropic(
    user_message: str,
    history: list[dict[str, str]],
    system_prompt: str,
) -> str:
    """Appelle Claude Haiku et retourne la réponse RAW (pré-parsing)."""
    client = get_anthropic_client()
    messages = list(history)
    messages.append({"role": "user", "content": user_message})

    response = client.messages.create(
        model=ANTHROPIC_MODEL_ID,
        max_tokens=1000,  # +200 vs avant pour absorber les blocs JSON
        system=system_prompt,
        messages=messages,
    )
    parts = []
    for block in response.content:
        if hasattr(block, "text"):
            parts.append(block.text)
    return "".join(parts).strip()


def _send_ollama(
    user_message: str,
    history: list[dict[str, str]],
    system_prompt: str,
) -> str:
    """Appelle Ollama (qwen2.5:3b par défaut) et retourne la réponse RAW.

    Convention Ollama : le system prompt est passé en premier message
    `{"role": "system", ...}` (contrairement à Anthropic qui a un paramètre
    `system` séparé). On préserve l'historique tel quel.
    """
    client = get_ollama_client()
    messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_message})

    try:
        response = client.chat(
            model=OLLAMA_MODEL_ID,
            messages=messages,
            options={
                # Température basse → modèle plus discipliné sur les markers
                # JSON (SUGG_JSON / PLAN_JSON / END_CONVERSATION).
                "temperature": 0.4,
                "num_predict": 1000,
            },
        )
    except Exception as exc:
        # Connexion refusée, modèle non tiré, etc.
        raise LLMProviderUnavailable(
            f"Ollama indisponible ({OLLAMA_BASE_URL}, modèle {OLLAMA_MODEL_ID}) : {exc}. "
            "Vérifiez qu'Ollama tourne (`ollama serve`) et que le modèle est "
            "tiré (`ollama pull qwen2.5:3b`)."
        )

    # Format de retour Ollama : {"message": {"role": "assistant", "content": "..."}}
    msg = response.get("message") if isinstance(response, dict) else getattr(response, "message", None)
    if isinstance(msg, dict):
        return str(msg.get("content", "")).strip()
    if msg is not None and hasattr(msg, "content"):
        return str(msg.content).strip()
    return ""


# ─── Dispatcher public ────────────────────────────────────────────────────


def send_message(
    user_message: str,
    history: list[dict[str, str]],
    module: dict[str, Any],
    profile: Optional[dict[str, Any]] = None,
    scores: Optional[dict[str, Any]] = None,
    provider: str = PROVIDER_ANTHROPIC,
    turn_number: int = 1,
) -> dict[str, Any]:
    """Envoie un message + historique au LLM choisi. Renvoie la réponse PARSÉE.

    provider :
      - "anthropic" (défaut) → Claude Haiku via API cloud
      - "ollama"             → SLM local (qwen2.5:3b par défaut)

    turn_number : numéro du tour courant (1 = première réponse de l'assistant,
    5 = clôture). Sert à scoper les instructions du system prompt à ce tour
    précisément, pour éviter que les petits modèles enumerent les 5 tours
    d'un coup.

    Lève LLMProviderUnavailable si le provider demandé n'est pas joignable
    (l'endpoint FastAPI convertit en HTTP 503).
    """
    if provider not in ALLOWED_PROVIDERS:
        raise ValueError(
            f"provider invalide : {provider!r}. Valeurs attendues : {sorted(ALLOWED_PROVIDERS)}"
        )

    system_prompt = _build_system_prompt(module, profile, scores, turn_number)

    if provider == PROVIDER_OLLAMA:
        raw = _send_ollama(user_message, history, system_prompt)
    else:
        raw = _send_anthropic(user_message, history, system_prompt)

    return parse_assistant_reply(raw)
