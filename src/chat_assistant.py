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

# Limite produit : 10 ECHANGES (messages user) max par conversation.
# La synthese (plan + schema + cloture) tombe au 10e tour (SYNTHESE_TOUR).
MAX_USER_MESSAGES = 10

# Renfort spécifique aux petits modèles locaux (SLM) — ajouté au prompt quand
# provider=ollama. Les SLM suivent mal les consignes : on martèle les 3 règles
# qui cassent le plus (questions multiples, SUGG manquant, clôture prématurée).
SLM_REINFORCEMENT = """

RAPPEL STRICT (tu es un petit modèle, applique ces 3 regles a la lettre) :
1. UNE SEULE question par message. Jamais deux, jamais une liste de questions.
2. Termine TOUJOURS ton message par un bloc SUGG_JSON avec EXACTEMENT 3 items courts (sauf au message de synthese finale).
3. N'ecris JAMAIS END_CONVERSATION, ni PLAN_JSON, ni MERMAID_JSON tant que ce n'est pas le tour de synthese (tour 10) OU que le medecin ne demande pas explicitement de conclure. Avant cela, tu te contentes d'explorer avec UNE question."""

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



# ─── Mode « parcours » (pivot D-056) ────────────────────────────────────────
# Dialogue de MODELISATION d'un parcours metier precis, distinct du chat
# chantier. Meme moteur, meme contrat MERMAID_JSON (-> GrapheWSF), mais :
#  - on CREUSE le parcours (4 moments : ancrage / objets / frictions / bornes)
#  - la synthese produit une SYNTHESE ECRITE + le graphe du parcours
#    (10-15 noeuds), SANS PLAN_JSON (le plan d'action detaille reste payant).
# Spec : resources/methode/lugia_modelisations_graphiques_spec.md §11-12.

# Bloc de contrat MERMAID_JSON partage (memes enums que types.ts).
_MERMAID_FORMAT_BLOCK = """- Le bloc MERMAID_JSON (SYNTHESE finale UNIQUEMENT) doit etre sur UNE SEULE LIGNE et representer le PARCOURS comme graphe WSF. 10 a 15 noeuds.
  Format STRICT : MERMAID_JSON:{{"titre":"...","nodes":[{{"id":"x","composante":"PROCESSUS","type":"ACTION","label":"...","etat":"FONCTIONNEL","criticite":"IMPORTANT","axe":"processus_admin"}}],"edges":[{{"id":"e1","source":"x","cible":"y","type":"ALIMENTE","force":0.7,"delai":"IMMEDIAT"}}]}}
  - composante (obligatoire) : PARTICIPANT | INFORMATION | TECHNOLOGIE | PROCESSUS | INFRASTRUCTURE | STRATEGIE | ENVIRONNEMENT | PRODUIT | CLIENT
  - type (obligatoire) : ACTEUR | ENTITE | STOCK | ACTION | DECISION | FLUX | CONTRAINTE | FRONTIERE
  - etat (obligatoire) : OPTIMAL | FONCTIONNEL | DEGRADE | A_RISQUE | BLOQUE | NON_DOCUMENTE | EN_TRANSFORMATION | INACTIF
  - criticite (obligatoire) : CRITIQUE | IMPORTANT | STANDARD | PERIPHERIQUE
  - axe (obligatoire) : coeur_metier | parcours_client | processus_admin | equipe_rh | outils_data_infra | finance | conformite | strategie | developpement_commercial | rd_innovation
  - type de liaison : UTILISE | PRODUIT | CONSOMME | TRANSFORME | CONTRAINT | SUPPORTE | ALIMENTE | DELIVRE | ORIENTE | INTERFACE
  - force : nombre entre 0.0 et 1.0 ; delai : IMMEDIAT | COURT_TERME | MOYEN_TERME | LONG_TERME
  - Le graphe doit suivre l'ordre reel du parcours (les ACTION s'enchainent via ALIMENTE/PRODUIT/INTERFACE) et marquer 2 a 3 noeuds en DEGRADE / A_RISQUE / NON_DOCUMENTE : les fragilites reperees pendant l'echange."""


def _build_parcours_system_prompt(
    module: dict[str, Any],
    profile: Optional[dict[str, Any]],
    scores: Optional[dict[str, Any]] = None,
    turn_number: int = 1,
) -> str:
    """System prompt du dialogue de MODELISATION d'un parcours (D-056)."""
    label = module.get("label", "ce parcours")

    profil_txt = ""
    if profile:
        cabinet = profile.get("cabinet_type") or "non renseigne"
        volume = profile.get("volume") or "non renseigne"
        secretariat = profile.get("secretariat") or "non renseigne"
        profil_txt = (
            f"PROFIL DU MEDECIN :\n"
            f"  - Type de cabinet : {cabinet}\n"
            f"  - Volume hebdomadaire : {volume}\n"
            f"  - Secretariat : {secretariat}\n"
        )

    SYNTHESE_TOUR = 10
    t = max(1, turn_number)

    if t == 1:
        turn_instruction = (
            "C'est le tout premier echange. Le medecin vient de choisir ce parcours a modeliser.\n"
            "  - Salue brievement (1 phrase).\n"
            "  - Explique en 1 phrase que vous allez reconstituer ensemble, etape par etape, "
            "comment ce moment se passe reellement chez lui.\n"
            "  - Pose UNE question d'ancrage tres concrete : par quoi ce parcours commence, "
            "quel est le tout premier geste ou la premiere action.\n"
            "  - OBLIGATOIRE : termine par un bloc SUGG_JSON de 3 reponses plausibles (1re personne, courtes)."
        )
    elif t <= 5:
        turn_instruction = (
            "Phase OBJETS. Tu reconstitues finement chaque etape du parcours.\n"
            "  - Reformule en UNE phrase ce que tu retiens de sa derniere reponse.\n"
            "  - Pose UNE seule question qui precise, pour l'etape en cours, l'un des angles "
            "encore flous (varie au fil des tours) :\n"
            "      . QUI agit a cette etape (medecin, secretariat, externe)\n"
            "      . QUEL OUTIL ou support est utilise (logiciel, papier, telephone)\n"
            "      . QUELLE INFORMATION entre ou sort, ou elle est stockee\n"
            "      . QUELLE EST L'ETAPE SUIVANTE (pour avancer dans l'ordre du parcours)\n"
            "  - Ne propose NI synthese NI schema a ce stade.\n"
            "  - Inclus 3 suggestions via SUGG_JSON."
        )
    elif t <= 7:
        turn_instruction = (
            "Phase FRICTIONS. Le parcours est a peu pres reconstitue ; tu cherches ou ca coince.\n"
            "  - Reformule en UNE phrase.\n"
            "  - Pose UNE question sur les frictions : ou ca attend, se repete, s'oublie, "
            "depend d'une seule personne, ou genere des reprises (ex. un rejet, une erreur).\n"
            "  - Inclus 3 suggestions via SUGG_JSON."
        )
    elif t < SYNTHESE_TOUR:
        turn_instruction = (
            "Phase BORNES / pre-synthese. Tu as beaucoup de matiere.\n"
            "  - Reformule en UNE phrase.\n"
            "  - Pose UNE derniere question sur les bornes du parcours (par quoi il se termine, "
            "quelles interfaces avec l'exterieur) OU propose de passer a la synthese.\n"
            "  - Inclus 3 suggestions via SUGG_JSON, dont une qui declenche la synthese "
            "(ex. \"Oui, recapitulons le parcours\")."
        )
    else:
        turn_instruction = (
            "C'est le moment de la SYNTHESE FINALE du parcours modelise.\n"
            "  - COMMENCE OBLIGATOIREMENT par une SYNTHESE ECRITE en prose (4 a 6 phrases, AVANT tout bloc JSON) : "
            "raconte le parcours tel que tu l'as compris, dans l'ordre, en langage du cabinet (pas de jargon), "
            "en nommant les etapes, les acteurs et outils en jeu, et en pointant 2 a 3 zones de fragilite. "
            "Ton non culpabilisant : tu racontes un fonctionnement, tu ne notes pas.\n"
            "  - Precise en 1 phrase que le medecin pourra corriger cette synthese avant de voir les schemas.\n"
            "  - Produis ENSUITE le graphe du parcours via MERMAID_JSON (10 a 15 noeuds).\n"
            "  - NE PRODUIS PAS de PLAN_JSON : l'identification detaillee des chantiers et le plan d'action "
            "ne font pas partie de cette etape (ils sont proposes ensuite).\n"
            "  - NE POSE PAS de nouvelle question. N'inclus PAS de SUGG_JSON.\n"
            "  - Termine OBLIGATOIREMENT par la ligne exacte : END_CONVERSATION:true"
        )

    synthese_anticipee = (
        "\n\nNOTE : si a tout moment le medecin demande de recapituler ou de conclure, "
        "produis IMMEDIATEMENT la SYNTHESE ECRITE + MERMAID_JSON + END_CONVERSATION:true "
        "(toujours sans PLAN_JSON)."
    )
    turn_instruction = turn_instruction + synthese_anticipee

    return f"""LANGUE : tu reponds TOUJOURS et EXCLUSIVEMENT en francais, y compris les \
suggestions (SUGG_JSON) et tous les labels du schema (MERMAID_JSON). N'utilise JAMAIS \
une autre langue, meme dans les valeurs JSON.

Tu aides un medecin generaliste a MODELISER un parcours de travail precis de son cabinet. \
Tu n'analyses pas l'acte de soin ni les personnes : tu reconstitues le SYSTEME DE TRAVAIL \
(les etapes, qui fait quoi, avec quels outils et quelles informations). Tu parles comme un \
confrere curieux et bienveillant, pas comme un consultant.

{profil_txt}
PARCOURS A MODELISER : "{label}"

TU AS DEJA ECHANGE {t - 1} fois avec ce medecin. CE MESSAGE-CI EST TON {t}E TOUR.

CONSIGNES POUR CE TOUR :
{turn_instruction}

REGLES ABSOLUES (toujours) :
- Reponds uniquement en francais (texte ET contenu des blocs JSON).
- Aucun conseil medical ou therapeutique. Sujet = organisation du travail seulement.
- Aucune donnee patient identifiable. Si le medecin en mentionne, recadre vers le systeme.
- Jamais de jargon consulting. Pas de morale (\"vous devriez\"). Pas de dramatisation.
- UNE SEULE question a la fois. Vouvoiement.
- 4 a 8 lignes de texte maximum. Pas de markdown lourd, pas de listes a puces.

FORMAT TECHNIQUE (extremement important) :
- Tu ecris UN SEUL message court. N'ecris JAMAIS \"TOUR 1\", \"TOUR 2\", etc.
- Le bloc SUGG_JSON doit etre sur UNE SEULE LIGNE et avoir EXACTEMENT 3 items courts :
  SUGG_JSON:{{"items":["option 1","option 2","option 3"]}}
{_MERMAID_FORMAT_BLOCK}
- Pour signaler la fin (SYNTHESE finale UNIQUEMENT) : la ligne exacte END_CONVERSATION:true
- Ne produis JAMAIS de bloc PLAN_JSON dans ce mode."""


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
    # D-056 : un parcours metier est modelise via une mecanique distincte.
    if module.get("kind") == "parcours":
        return _build_parcours_system_prompt(module, profile, scores, turn_number)
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

    # Mecanique en ~10 tours : exploration WSF approfondie puis synthese.
    # 4 phases basees sur le numero de tour. La synthese (plan + schema + cloture)
    # n'arrive qu'a la fin (tour >= SYNTHESE_TOUR) OU si le medecin demande
    # explicitement a conclure (le LLM le detecte et passe en synthese).
    SYNTHESE_TOUR = 10
    t = max(1, turn_number)

    if t == 1:
        turn_instruction = (
            "Ce message-ci est le tout premier echange. Le medecin vient de "
            "cliquer sur ce chantier — il n'a encore rien dit de specifique.\n"
            "  - Salue brievement (1 phrase max).\n"
            "  - Explique en 1 phrase que tu vas lui poser quelques questions "
            "pour bien comprendre comment ca se passe concretement chez lui.\n"
            "  - Pose UNE premiere question ouverte tres concrete sur son "
            "quotidien face a ce chantier.\n"
            "  - Pas de plan d'action, pas de schema a ce stade.\n"
            "  - OBLIGATOIRE : termine ton message par un bloc SUGG_JSON contenant "
            "EXACTEMENT 3 reponses possibles du medecin a ta question, en francais, "
            "a la premiere personne, courtes (max 12 mots). Ne termine jamais ce "
            "premier message sans ce bloc.\n"
            "    Exemple de format : "
            "SUGG_JSON:{\"items\":[\"L'interface est peu pratique\",\"On fait beaucoup d'erreurs de saisie\",\"Il manque des fonctions essentielles\"]}"
        )
    elif t < SYNTHESE_TOUR - 1:
        # Phase d'exploration WSF — le coeur de la conversation longue.
        turn_instruction = (
            "Tu es en phase d'EXPLORATION. Ton but : cartographier finement le "
            "systeme de travail reel autour de ce chantier, une question a la "
            "fois, comme un confrere curieux qui veut vraiment comprendre.\n"
            "  - Reformule en UNE phrase ce que tu retiens de sa derniere reponse.\n"
            "  - Pose UNE seule nouvelle question qui creuse une dimension encore "
            "non exploree. Varie les angles au fil des tours, parmi :\n"
            "      . QUI intervient (medecin, secretaire, remplacant, externes)\n"
            "      . QUELS OUTILS sont utilises (logiciel, papier, IA, telephone)\n"
            "      . QUELLES INFORMATIONS circulent et ou elles sont stockees\n"
            "      . COMMENT le processus se deroule vraiment (vs la theorie)\n"
            "      . QUELS IRRITANTS, blocages, lenteurs, taches penibles\n"
            "      . QUELLES DEPENDANCES critiques (que se passe-t-il si X absent)\n"
            "      . QUELS CAS PARTICULIERS / exceptions / urgences\n"
            "      . COMBIEN DE TEMPS ca prend, a quelle frequence\n"
            "  - Ne repose jamais une question deja posee. Approfondis ce qui est "
            "encore flou.\n"
            "  - Ne propose NI plan d'action, NI schema a ce stade.\n"
            "  - Inclus 3 suggestions de reponse plausibles via SUGG_JSON.\n"
            "  - EXCEPTION : si le medecin demande explicitement un plan, des "
            "actions, ou de conclure, passe directement en SYNTHESE (voir plus bas)."
        )
    elif t < SYNTHESE_TOUR:
        # Pre-synthese — on resserre, on signale qu'on approche de la fin.
        turn_instruction = (
            "Tu approches de la fin de l'exploration. Tu as deja beaucoup de "
            "matiere.\n"
            "  - Reformule en UNE phrase ce que tu retiens.\n"
            "  - Pose UNE derniere question pour lever un dernier point flou, OU "
            "si tu estimes avoir assez compris, propose de passer a la synthese "
            "(demande au medecin s'il veut que tu recapitules et proposes un plan).\n"
            "  - Inclus 3 suggestions via SUGG_JSON, dont une qui permet de "
            "declencher la synthese (ex : \"Oui, fais-moi la synthese\")."
        )
    else:
        # Synthese finale — plan + schema enrichi + cloture, tout d'un coup.
        turn_instruction = (
            "C'est le moment de la SYNTHESE FINALE. Tu as explore en profondeur "
            "le systeme de travail autour de ce chantier.\n"
            "  - COMMENCE OBLIGATOIREMENT ton message par un recap en PROSE de "
            "2-3 phrases (texte normal, AVANT tout bloc JSON) : les irritants "
            "principaux et les leviers identifies pendant l'echange. Ne saute "
            "jamais ce paragraphe et n'enchaine pas directement sur PLAN_JSON.\n"
            "  - Propose un plan d'action PRIORISE en 3 a 5 etapes via PLAN_JSON "
            "(de l'action la plus rapide a la plus structurante).\n"
            "  - Produis un schema ENRICHI du systeme de travail via MERMAID_JSON "
            "(6 a 8 noeuds), en marquant en etat DEGRADE / A_RISQUE / NON_DOCUMENTE "
            "les points faibles que la conversation a reveles.\n"
            "  - Mentionne que Sebastien peut accompagner la mise en place via "
            "Calendly si le medecin veut aller plus loin.\n"
            "  - NE POSE PAS de nouvelle question.\n"
            "  - N'inclus PAS de SUGG_JSON dans ce message final.\n"
            "  - Termine OBLIGATOIREMENT par la ligne exacte : END_CONVERSATION:true"
        )

    # Note pour le LLM : la synthese peut aussi etre declenchee avant le tour 20
    # si le medecin la demande. Dans ce cas le LLM produit directement
    # PLAN_JSON + MERMAID_JSON + END_CONVERSATION meme si t < SYNTHESE_TOUR.
    synthese_anticipee = (
        "\n\nNOTE : si a n'importe quel moment le medecin demande explicitement "
        "un plan d'action, des recommandations, ou de conclure la discussion, tu "
        "produis IMMEDIATEMENT la synthese finale (PLAN_JSON + MERMAID_JSON + "
        "END_CONVERSATION:true), meme si l'exploration n'est pas terminee."
    )
    turn_instruction = turn_instruction + synthese_anticipee

    return f"""LANGUE : tu reponds TOUJOURS et EXCLUSIVEMENT en francais. Chaque mot \
de chaque message, y compris les suggestions (SUGG_JSON), le plan d'action \
(PLAN_JSON) et tous les labels du schema (MERMAID_JSON), doit etre en francais. \
N'utilise JAMAIS le chinois, l'anglais ni aucune autre langue, meme dans les \
valeurs JSON.

Tu es un expert en organisation des cabinets de medecine generale liberale. Tu parles comme un confrere experimente — pas comme un consultant. Approche terrain, directe et bienveillante.

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
- Reponds uniquement en francais (texte ET contenu des blocs JSON). Jamais un autre alphabet.
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
  SUGG_JSON:{{"items":["option 1","option 2","option 3"]}}  (items en francais)
- Le bloc PLAN_JSON (SYNTHESE finale uniquement) doit etre sur UNE SEULE LIGNE :
  PLAN_JSON:{{"steps":[{{"num":"01","title":"...","body":"...","tag":"quick"}},{{"num":"02","title":"...","body":"...","tag":"medium"}}]}}
- Tags valides pour les steps : "quick" / "medium" / "invest"
- Le bloc MERMAID_JSON (SYNTHESE finale uniquement) doit etre sur UNE SEULE LIGNE et representer le systeme de travail (graphe WSF). 6 a 8 noeuds maximum.
  Format STRICT : MERMAID_JSON:{{"titre":"...","nodes":[{{"id":"x","composante":"PARTICIPANT","type":"ACTEUR","label":"...","etat":"FONCTIONNEL","criticite":"IMPORTANT","axe":"equipe_rh"}}],"edges":[{{"id":"e1","source":"x","cible":"y","type":"UTILISE","force":0.7,"delai":"IMMEDIAT"}}]}}
  - composante (obligatoire) : PARTICIPANT | INFORMATION | TECHNOLOGIE | PROCESSUS | INFRASTRUCTURE | STRATEGIE | ENVIRONNEMENT | PRODUIT | CLIENT
  - type (obligatoire) : ACTEUR | ENTITE | STOCK | ACTION | DECISION | FLUX | CONTRAINTE | FRONTIERE
  - etat (obligatoire) : OPTIMAL | FONCTIONNEL | DEGRADE | A_RISQUE | BLOQUE | NON_DOCUMENTE | EN_TRANSFORMATION | INACTIF
  - criticite (obligatoire) : CRITIQUE | IMPORTANT | STANDARD | PERIPHERIQUE
  - axe (obligatoire) : axe de la carte de capacite auquel l'objet contribue — coeur_metier | parcours_client | processus_admin | equipe_rh | outils_data_infra | finance | conformite | strategie | developpement_commercial | rd_innovation
    Socle de placement : prise de RDV / agenda / demandes entrantes -> processus_admin ; secretaire / medecin / equipe / remplacant -> equipe_rh ; logiciel / outil / IA / agenda en ligne -> outils_data_infra ; acte clinique / suivi chronique / teleconsultation / resultats d'examens -> coeur_metier ; experience patient / accueil -> parcours_client ; facturation / cotation / FSE -> finance ; RGPD / HDS / secret medical -> conformite
  - type de liaison : UTILISE | PRODUIT | CONSOMME | TRANSFORME | CONTRAINT | SUPPORTE | ALIMENTE | DELIVRE | ORIENTE
  - force : nombre entre 0.0 et 1.0
  - delai : IMMEDIAT | COURT_TERME | MOYEN_TERME | LONG_TERME
  - Identifie 1 ou 2 noeuds en etat DEGRADE ou A_RISQUE pour faire ressortir le point d'attention du chantier
- Pour signaler la fin (SYNTHESE finale UNIQUEMENT) : la ligne exacte END_CONVERSATION:true"""


# ─── Parsing de la réponse Claude ──────────────────────────────────────────


_RE_END = re.compile(r"END_CONVERSATION\s*:\s*(true|false)", re.IGNORECASE)
_RE_PLAN = re.compile(r"PLAN_JSON:\s*(\{.*?\}\s*\]\s*\}|\{.*?\})", re.DOTALL)
_RE_SUGG = re.compile(r"SUGG_JSON:\s*(\{[^}]+\})", re.DOTALL)
# Le MERMAID_JSON contient nodes:[{...}] et edges:[{...}] — la regex doit
# pouvoir matcher des objets imbriques. On capture jusqu'au }] }] de
# fermeture du dernier array, puis le } final.
_RE_MERMAID = re.compile(r"MERMAID_JSON:\s*(\{[\s\S]*?\}\s*\]\s*\})", re.DOTALL)
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

    # END_CONVERSATION (true OU false — on strippe le marker dans les deux cas,
    # ended=True uniquement si la valeur est 'true'). Les petits modeles ecrivent
    # souvent END_CONVERSATION:false par mimetisme — il ne doit jamais s'afficher.
    m_end = _RE_END.search(text)
    if m_end:
        ended = m_end.group(1).lower() == "true"
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

    # MERMAID_JSON (tour 4 — graphe WSF du chantier)
    m_mermaid = _RE_MERMAID.search(text)
    mermaid_graph: Optional[dict[str, Any]] = None
    if m_mermaid:
        try:
            raw_mermaid = m_mermaid.group(1).replace("\n", " ")
            obj = json.loads(raw_mermaid)
            # Validation minimale : nodes et edges doivent etre des listes
            if isinstance(obj, dict) and isinstance(obj.get("nodes"), list) and isinstance(obj.get("edges"), list):
                mermaid_graph = obj
            text = text.replace(m_mermaid.group(0), "").strip()
        except Exception:
            pass

    # Strip defensif du suffixe __LUGIA_META__ que qwen mime parfois
    text = _RE_META.sub("", text)

    return {
        "text": text.strip(),
        "suggestions": suggestions,
        "plan": plan,
        "ended": ended,
        "mermaid_graph": mermaid_graph,
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
        max_tokens=2000,  # synthese (recap + PLAN + MERMAID) depasse 1000
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
                "num_predict": 2000,
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
        system_prompt = system_prompt + SLM_REINFORCEMENT

    if provider == PROVIDER_OLLAMA:
        raw = _send_ollama(user_message, history, system_prompt)
    else:
        raw = _send_anthropic(user_message, history, system_prompt)

    return parse_assistant_reply(raw)
