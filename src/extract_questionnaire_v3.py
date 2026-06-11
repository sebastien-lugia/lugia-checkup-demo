"""
Extraction d'un substrat (objets par axe) depuis le questionnaire V3 prod.

Le questionnaire V3 (`interview_protocol_v3.json`) ne type pas ses options (juste
`{id, s}`). On fournit donc ici un SOCLE de placement : chaque question = un objet
canonique, placé sur un axe selon `lugia_placement_objets_axes.md` ; l'état de l'objet
dérive du score `s` (1-4) de l'option choisie. Produit un footprint (capability map)
avec OBJETS, pas seulement des scores.
"""
from __future__ import annotations
import json
from pathlib import Path
from typing import Any

_ROOT = Path(__file__).resolve().parent.parent
_PROTO = _ROOT / "resources" / "interview_protocol_v3.json"

FAC = {"acteur": "acteurs", "entite": "outils", "action": "actes"}
# Score s (1-4) → état WSF
SCORE_ETAT = {4: "OPTIMAL", 3: "FONCTIONNEL", 2: "DEGRADE", 1: "A_RISQUE"}
ETAT_SCORE = {"OPTIMAL": 1.0, "FONCTIONNEL": 0.8, "EN_TRANSFORMATION": 0.6,
              "DEGRADE": 0.5, "NON_DOCUMENTE": 0.4, "A_RISQUE": 0.3, "BLOQUE": 0.0}
_PIRE = ["OPTIMAL", "FONCTIONNEL", "EN_TRANSFORMATION", "DEGRADE", "NON_DOCUMENTE", "A_RISQUE", "BLOQUE"]

# SOCLE V3 : question → (libellé objet, type, axe d'attache, [axes référencés])
# Fondé sur lugia_placement_objets_axes.md (placement par fonction, pas par bloc).
EXTRACT_V3: dict[str, tuple[str, str, str, list[str]]] = {
    # Bloc A (libellé questionnaire « Parcours patient ») — placés par fonction
    "a1": ("Régulation des urgences du jour", "action", "processus_admin", []),
    "a2": ("Gestion des demandes non programmées", "action", "processus_admin", []),
    "a3": ("Consignes inter-consultations", "action", "parcours_client", []),
    "a4": ("Suivi des patients chroniques", "action", "coeur_metier", ["processus_admin"]),
    "a5": ("Relance des patients perdus de vue", "action", "coeur_metier", ["processus_admin"]),
    "a6": ("Tri des résultats d'examens", "action", "coeur_metier", ["processus_admin"]),
    # Bloc B (« Équipe & secrétariat »)
    "b1": ("Répartition des rôles", "acteur", "equipe_rh", []),
    "b3": ("Charge du secrétariat", "acteur", "equipe_rh", []),
    "b4": ("Circulation de l'information dans l'équipe", "action", "equipe_rh", ["processus_admin"]),
    "b5": ("Continuité d'activité (absence)", "action", "equipe_rh", ["processus_admin"]),
    "b6": ("Conduite du changement organisationnel", "action", "rd_innovation", []),
    "b7": ("Pilotage / recul sur l'organisation", "action", "strategie", []),
    # Bloc C (« Outils & dossiers »)
    "c1": ("Logiciel médical", "entite", "outils_data_infra", []),
    "c2": ("Tenue des dossiers patients", "entite", "outils_data_infra", []),
    "c3": ("Gestion administrative quotidienne", "action", "processus_admin", []),
    "c4": ("Outils numériques de santé", "entite", "outils_data_infra", []),
    "c5": ("IA générative", "entite", "outils_data_infra", ["conformite"]),
    "c6": ("Suivi de la conformité", "action", "conformite", []),
}

_opt_s_cache: dict[str, int] | None = None


def _opt_s() -> dict[str, int]:
    """Index option_id → score s, depuis le protocole V3."""
    global _opt_s_cache
    if _opt_s_cache is None:
        d = json.loads(_PROTO.read_text(encoding="utf-8"))
        out: dict[str, int] = {}

        def walk(o: Any) -> None:
            if isinstance(o, dict):
                for op in o.get("options", []) or []:
                    if "id" in op:
                        out[op["id"]] = op.get("s")
                for v in o.values():
                    walk(v)
            elif isinstance(o, list):
                for v in o:
                    walk(v)
        walk(d)
        _opt_s_cache = out
    return _opt_s_cache


def footprint(answers: list[dict[str, Any]]) -> dict[str, dict]:
    """answers = lignes db.get_answers() → footprint {axe: {objets, references_in, etat, sante}}."""
    opt_s = _opt_s()
    foot: dict[str, dict] = {}
    for a in answers:
        qid = a.get("question_id")
        oid = a.get("selected_option")
        spec = EXTRACT_V3.get(qid)
        if not spec or not oid:
            continue
        s = opt_s.get(oid)
        if s is None:
            continue
        label, typ, axe, refs = spec
        etat = SCORE_ETAT.get(s, "FONCTIONNEL")
        obj = {"id": qid, "label": label, "type": typ.upper(),
               "composante": FAC[typ].upper(), "etat": etat, "référencé_dans": refs}
        foot.setdefault(axe, {"objets": [], "references_in": []})["objets"].append(obj)
        for r in refs:
            foot.setdefault(r, {"objets": [], "references_in": []})["references_in"].append(
                {"label": label, "depuis": axe})
    for axe, d in foot.items():
        ets = [o["etat"] for o in d["objets"]]
        d["etat"] = max(ets, key=lambda e: _PIRE.index(e) if e in _PIRE else 0) if ets else "REFERENCE"
        d["sante"] = round(100 * sum(ETAT_SCORE.get(e, 0.4) for e in ets) / len(ets)) if ets else None
        d["source_questionnaire"] = True
    return foot
