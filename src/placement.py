"""
Placement & dérivation du substrat WSF → carte de capacité + carte vivante.

Fonde le placement objet→axe sur le socle (resources/methode/lugia_placement_objets_axes.md, D-055).
Entrée : un graphe WSF (web/lib/wsf/types.ts) = {"objets":[ObjetWSF], "liaisons":[LiaisonWSF]}.
Décisions (2026-06-09) : ruban dérivé des liaisons ; multi-axe = axe primaire émis + références dérivées.
"""
from __future__ import annotations
from typing import Any

# Les 10 axes de la carte de capacité (cf lugia_reference_axes_fonctionnels.md)
AXES = ["coeur_metier", "parcours_client", "processus_admin", "equipe_rh", "outils_data_infra",
        "finance", "conformite", "strategie", "developpement_commercial", "rd_innovation"]

# Fallback déterministe composante WSF → axe (si l'agent n'émet pas / émet un axe invalide)
COMPOSANTE_AXE = {
    "PARTICIPANT": "equipe_rh", "INFORMATION": "outils_data_infra", "TECHNOLOGIE": "outils_data_infra",
    "PROCESSUS": "processus_admin", "INFRASTRUCTURE": "outils_data_infra", "STRATEGIE": "strategie",
    "ENVIRONNEMENT": "strategie", "PRODUIT": "coeur_metier", "CLIENT": "parcours_client",
}
# Surcharges socle par mot-clé du label (raffinent le fallback ; ne priment pas sur un axe émis valide)
SOCLE_MOTS = [
    (("rendez-vous", "rdv", "agenda", "prise de rdv"), "processus_admin"),
    (("continuité", "continuite", "absence", "remplaçant", "remplacant"), "equipe_rh"),
    (("chronique", "suivi des patients"), "coeur_metier"),
    (("résultat", "resultat", "examen"), "coeur_metier"),
    (("téléconsultation", "teleconsultation"), "coeur_metier"),
    (("facturation", "fse", "cotation", "tiers payant", "impayé"), "finance"),
    (("rgpd", "hds", "secret médical", "conformité", "conformite"), "conformite"),
]

ETAT_SCORE = {"OPTIMAL": 1.0, "FONCTIONNEL": 0.8, "EN_TRANSFORMATION": 0.6, "DEGRADE": 0.5,
              "INACTIF": 0.5, "NON_DOCUMENTE": 0.4, "A_RISQUE": 0.3, "BLOQUE": 0.0}
_ETAT_ORDER = ["OPTIMAL", "FONCTIONNEL", "EN_TRANSFORMATION", "INACTIF", "DEGRADE",
               "NON_DOCUMENTE", "A_RISQUE", "BLOQUE"]  # du meilleur au pire
FLUX_LIAISONS = {"PRODUIT", "ALIMENTE", "DELIVRE", "CONSOMME", "TRANSFORME"}


def placer(objet: dict[str, Any]) -> str:
    """Axe d'attache d'un objet : axe émis (si valide) > socle par mot-clé > fallback composante."""
    axe = objet.get("axe")
    if axe in AXES:
        return axe
    label = (objet.get("label") or "").lower()
    for mots, a in SOCLE_MOTS:
        if any(m in label for m in mots):
            return a
    return COMPOSANTE_AXE.get(objet.get("composante"), "processus_admin")


def _refs_derivees(objet_id: str, axe_par_id: dict[str, str], liaisons: list[dict]) -> list[str]:
    """Axes des objets reliés (hors axe propre) = référencé_dans dérivé des liaisons."""
    mon_axe = axe_par_id[objet_id]
    refs = set()
    for l in liaisons:
        autre = l["cible"] if l["source"] == objet_id else (l["source"] if l["cible"] == objet_id else None)
        if autre and autre in axe_par_id and axe_par_id[autre] != mon_axe:
            refs.add(axe_par_id[autre])
    return sorted(refs)


def _pire_etat(etats: list[str]) -> str:
    return max(etats, key=lambda e: _ETAT_ORDER.index(e) if e in _ETAT_ORDER else 0) if etats else "NON_DOCUMENTE"


def footprint(graphe: dict) -> dict:
    """Empreinte sur les axes (capability map) : objets par axe d'attache + état agrégé + références."""
    objets = graphe.get("objets") or graphe.get("nodes") or []
    liaisons = graphe.get("liaisons") or graphe.get("edges") or []
    axe_par_id = {o["id"]: placer(o) for o in objets}
    foot: dict[str, dict] = {}
    for o in objets:
        a = axe_par_id[o["id"]]
        foot.setdefault(a, {"objets": [], "references_in": []})
        foot[a]["objets"].append({"id": o["id"], "label": o["label"], "type": o["type"],
                                  "etat": o["etat"], "composante": o["composante"],
                                  "référencé_dans": _refs_derivees(o["id"], axe_par_id, liaisons)})
    # références entrantes (objets d'un autre axe qui pointent vers cet axe)
    for o in objets:
        for r in _refs_derivees(o["id"], axe_par_id, liaisons):
            foot.setdefault(r, {"objets": [], "references_in": []})
            foot[r]["references_in"].append({"label": o["label"], "depuis": axe_par_id[o["id"]]})
    for a, d in foot.items():
        d["etat"] = _pire_etat([x["etat"] for x in d["objets"]]) if d["objets"] else "REFERENCE"
        d["sante"] = round(100 * sum(ETAT_SCORE.get(x["etat"], 0.4) for x in d["objets"]) / len(d["objets"])) if d["objets"] else None
    return foot


def chaine_de_valeur(graphe: dict) -> list[dict]:
    """Ruban : étapes (ACTION/FLUX) ordonnées par tri topologique sur les liaisons de flux."""
    _objs = graphe.get("objets") or graphe.get("nodes") or []
    objets = {o["id"]: o for o in _objs}
    etapes = [oid for oid, o in objets.items() if o["type"] in ("ACTION", "FLUX")]
    succ = {oid: set() for oid in etapes}; indeg = {oid: 0 for oid in etapes}
    for l in (graphe.get("liaisons") or graphe.get("edges") or []):
        if l.get("type") in FLUX_LIAISONS and l["source"] in succ and l["cible"] in succ:
            if l["cible"] not in succ[l["source"]]:
                succ[l["source"]].add(l["cible"]); indeg[l["cible"]] += 1
    # Kahn (ordre stable)
    file = [o for o in etapes if indeg[o] == 0]; ordre = []; seen = set()
    while file:
        n = file.pop(0)
        if n in seen: continue
        seen.add(n); ordre.append(n)
        for m in sorted(succ[n]):
            indeg[m] -= 1
            if indeg[m] <= 0: file.append(m)
    for o in etapes:  # cycles / non atteints
        if o not in seen: ordre.append(o)
    return [{"id": oid, "label": objets[oid]["label"], "type": objets[oid]["type"], "etat": objets[oid]["etat"]} for oid in ordre]


def signaux(graphe: dict) -> list[dict]:
    """Signaux dérivés : R02 (point unique de défaillance) ; R03 (désalignement)."""
    _objs = graphe.get("objets") or graphe.get("nodes") or []
    objets = {o["id"]: o for o in _objs}
    liaisons = graphe.get("liaisons") or graphe.get("edges") or []
    indeg: dict[str, int] = {oid: 0 for oid in objets}
    for l in liaisons:
        if l["cible"] in indeg: indeg[l["cible"]] += 1
    out = []
    for oid, o in objets.items():
        if o.get("criticite") == "CRITIQUE" and indeg[oid] >= 2:
            out.append({"regle": "R02", "type": "dépendance_unique", "sévérité": "critique",
                        "label": f"{o['label']} — point unique de défaillance", "objets": [oid]})
    for l in liaisons:
        s, c = objets.get(l["source"]), objets.get(l["cible"])
        if s and c and {s["etat"], c["etat"]} & {"A_RISQUE", "DEGRADE", "BLOQUE"} \
           and s["composante"] == "TECHNOLOGIE" and c["composante"] == "TECHNOLOGIE":
            faible = c if c["etat"] in ("A_RISQUE", "DEGRADE", "BLOQUE") else s
            out.append({"regle": "R03", "type": "désalignement", "sévérité": "risque",
                        "label": f"Désalignement {s['label']} ↔ {c['label']}", "objets": [l["source"], l["cible"]]})
    # dédoublonnage par (regle, tuple objets)
    vu = set(); uniq = []
    for sg in out:
        k = (sg["regle"], tuple(sorted(sg["objets"])))
        if k not in vu: vu.add(k); uniq.append(sg)
    return uniq


def derive(graphe: dict) -> dict:
    """Dérivation complète stockée à côté du graphe brut."""
    return {"footprint": footprint(graphe), "chaine_de_valeur": chaine_de_valeur(graphe), "signaux": signaux(graphe)}
