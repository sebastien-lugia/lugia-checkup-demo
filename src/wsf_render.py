"""
Rendu d'un graphe WSF en flowable reportlab — pour le PDF chantier (C.B, 2026-05-27).

Le schéma du chantier est rendu côté navigateur par mermaid.js (SVG), ce qui
n'est pas disponible côté Python. On le redessine donc nativement avec
`reportlab.graphics` : boîtes colorées par état + flèches typées + libellés,
dans un layout vertical par couches (top-down, à la `flowchart TD` de mermaid).

Source de vérité des données : `web/lib/wsf/chantier-graphes.ts` (graphes
statiques) et le graphe enrichi produit par le chat (même structure). Si on
modifie l'un, penser à l'autre.

Un graphe = { "titre": str, "nodes": [ObjetWSF], "edges": [LiaisonWSF] }
  ObjetWSF  : { id, composante, type, label, etat, criticite }
  LiaisonWSF: { id, source, cible, type, force, delai }
"""

from __future__ import annotations

from typing import Any, Optional

from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon, Group, Circle, Ellipse
from reportlab.lib.colors import HexColor, Color

# ─────────────────────────────────────────────────────────────────────
# Couleurs par état — palette de marque Lugia (charte produit).
# États sobres (navy / argent / olive / brun / terracotta), pas de
# vert/ambre/rouge générique. Fills = teintes de marque aplaties sur paper
# (#FBFAF6) pour reportlab. Mapping moteur (8 états) -> charte (6 états) :
#   OPTIMAL->optimal · FONCTIONNEL->fonctionnel · DEGRADE->vigilance
#   A_RISQUE->risque · BLOQUE->critique · NON_DOCUMENTE->nondoc
#   EN_TRANSFORMATION->vigilance · INACTIF->nondoc
# Doit rester aligné avec web/lib/wsf/render-mermaid.ts ETAT_CLASS.
# ─────────────────────────────────────────────────────────────────────

ETAT_COLORS: dict[str, dict[str, str]] = {
    "OPTIMAL":           {"fill": "#EEEDEA", "stroke": "#1A2333", "text": "#1A2333"},
    "FONCTIONNEL":       {"fill": "#EEEEEA", "stroke": "#8E8E91", "text": "#3A4360"},
    "DEGRADE":           {"fill": "#EAE8DE", "stroke": "#6B6630", "text": "#6B6630"},
    "A_RISQUE":          {"fill": "#E9E4DA", "stroke": "#7A6030", "text": "#7A6030"},
    "BLOQUE":            {"fill": "#E9DED8", "stroke": "#7A3320", "text": "#7A3320"},
    "NON_DOCUMENTE":     {"fill": "#F3F3EF", "stroke": "#B5B5B8", "text": "#6E7795"},
    "EN_TRANSFORMATION": {"fill": "#EAE8DE", "stroke": "#6B6630", "text": "#6B6630"},
    "INACTIF":           {"fill": "#F3F3EF", "stroke": "#B5B5B8", "text": "#6E7795"},
}
_ETAT_DEFAULT = "FONCTIONNEL"


def _etat_colors(etat: str) -> dict[str, str]:
    return ETAT_COLORS.get(etat, ETAT_COLORS[_ETAT_DEFAULT])


# ─────────────────────────────────────────────────────────────────────
# Graphes WSF statiques (port de web/lib/wsf/chantier-graphes.ts)
# ─────────────────────────────────────────────────────────────────────

CHANTIER_GRAPHES: dict[str, dict[str, Any]] = {
    "comm": {
        "titre": "Communication d'équipe",
        "nodes": [
            {"id": "med", "type": "ACTEUR", "label": "Médecin", "etat": "FONCTIONNEL"},
            {"id": "sec", "type": "ACTEUR", "label": "Secrétaire", "etat": "FONCTIONNEL"},
            {"id": "coord", "type": "ACTION", "label": "Coordination quotidienne", "etat": "NON_DOCUMENTE"},
            {"id": "infos", "type": "STOCK", "label": "Infos du jour", "etat": "DEGRADE"},
            {"id": "continuite", "type": "FLUX", "label": "Continuité de service", "etat": "DEGRADE"},
        ],
        "edges": [
            {"source": "med", "cible": "coord", "type": "UTILISE"},
            {"source": "sec", "cible": "coord", "type": "UTILISE"},
            {"source": "infos", "cible": "coord", "type": "ALIMENTE"},
            {"source": "coord", "cible": "continuite", "type": "PRODUIT"},
        ],
    },
    "delegation": {
        "titre": "Délégation des tâches",
        "nodes": [
            {"id": "med", "type": "ACTEUR", "label": "Médecin", "etat": "A_RISQUE"},
            {"id": "equipe", "type": "ACTEUR", "label": "Équipe", "etat": "INACTIF"},
            {"id": "perimetre", "type": "ENTITE", "label": "Périmètre de délégation", "etat": "NON_DOCUMENTE"},
            {"id": "taches", "type": "ACTION", "label": "Tâches non médicales", "etat": "DEGRADE"},
            {"id": "temps", "type": "FLUX", "label": "Temps médical", "etat": "DEGRADE"},
        ],
        "edges": [
            {"source": "med", "cible": "taches", "type": "UTILISE"},
            {"source": "perimetre", "cible": "equipe", "type": "ORIENTE"},
            {"source": "equipe", "cible": "taches", "type": "UTILISE"},
            {"source": "taches", "cible": "temps", "type": "PRODUIT"},
        ],
    },
    "logiciel": {
        "titre": "Optimisation du logiciel",
        "nodes": [
            {"id": "med", "type": "ACTEUR", "label": "Médecin", "etat": "FONCTIONNEL"},
            {"id": "logiciel", "type": "ENTITE", "label": "Logiciel médical", "etat": "INACTIF"},
            {"id": "modeles", "type": "STOCK", "label": "Modèles de documents", "etat": "NON_DOCUMENTE"},
            {"id": "redac", "type": "ACTION", "label": "Rédaction", "etat": "DEGRADE"},
            {"id": "docs", "type": "FLUX", "label": "Documents produits", "etat": "FONCTIONNEL"},
        ],
        "edges": [
            {"source": "med", "cible": "logiciel", "type": "UTILISE"},
            {"source": "logiciel", "cible": "modeles", "type": "TRANSFORME"},
            {"source": "modeles", "cible": "redac", "type": "ALIMENTE"},
            {"source": "redac", "cible": "docs", "type": "PRODUIT"},
        ],
    },
    "chroniques": {
        "titre": "Suivi des chroniques",
        "nodes": [
            {"id": "med", "type": "ACTEUR", "label": "Médecin", "etat": "FONCTIONNEL"},
            {"id": "patients", "type": "ACTEUR", "label": "Patients chroniques", "etat": "FONCTIONNEL"},
            {"id": "fileactive", "type": "STOCK", "label": "File active", "etat": "NON_DOCUMENTE"},
            {"id": "suivi", "type": "ACTION", "label": "Suivi programmé", "etat": "DEGRADE"},
            {"id": "rappels", "type": "FLUX", "label": "Rappels de suivi", "etat": "INACTIF"},
        ],
        "edges": [
            {"source": "fileactive", "cible": "suivi", "type": "ALIMENTE"},
            {"source": "med", "cible": "suivi", "type": "UTILISE"},
            {"source": "suivi", "cible": "rappels", "type": "PRODUIT"},
            {"source": "rappels", "cible": "patients", "type": "DELIVRE"},
        ],
    },
    "urgences": {
        "titre": "Urgences du jour",
        "nodes": [
            {"id": "sec", "type": "ACTEUR", "label": "Secrétaire", "etat": "FONCTIONNEL"},
            {"id": "med", "type": "ACTEUR", "label": "Médecin", "etat": "A_RISQUE"},
            {"id": "tri", "type": "DECISION", "label": "Tri des urgences", "etat": "NON_DOCUMENTE"},
            {"id": "creneaux", "type": "ENTITE", "label": "Créneaux dédiés", "etat": "A_RISQUE"},
            {"id": "prise", "type": "FLUX", "label": "Prise en charge", "etat": "DEGRADE"},
        ],
        "edges": [
            {"source": "sec", "cible": "tri", "type": "UTILISE"},
            {"source": "creneaux", "cible": "tri", "type": "ALIMENTE"},
            {"source": "med", "cible": "tri", "type": "UTILISE"},
            {"source": "tri", "cible": "prise", "type": "PRODUIT"},
        ],
    },
    "admin": {
        "titre": "Charge administrative",
        "nodes": [
            {"id": "med", "type": "ACTEUR", "label": "Médecin", "etat": "A_RISQUE"},
            {"id": "logiciel", "type": "ENTITE", "label": "Outils numériques", "etat": "INACTIF"},
            {"id": "admin", "type": "ACTION", "label": "Tâches administratives", "etat": "DEGRADE"},
            {"id": "docs", "type": "STOCK", "label": "Documents administratifs", "etat": "DEGRADE"},
            {"id": "clinique", "type": "FLUX", "label": "Temps clinique", "etat": "DEGRADE"},
        ],
        "edges": [
            {"source": "med", "cible": "admin", "type": "UTILISE"},
            {"source": "docs", "cible": "admin", "type": "ALIMENTE"},
            {"source": "logiciel", "cible": "admin", "type": "SUPPORTE"},
            {"source": "admin", "cible": "clinique", "type": "PRODUIT"},
        ],
    },
    "pilotage": {
        "titre": "Pilotage de l'activité",
        "nodes": [
            {"id": "med", "type": "ACTEUR", "label": "Médecin", "etat": "FONCTIONNEL"},
            {"id": "stats", "type": "ENTITE", "label": "Module statistiques", "etat": "INACTIF"},
            {"id": "indic", "type": "STOCK", "label": "Indicateurs clés", "etat": "NON_DOCUMENTE"},
            {"id": "revue", "type": "ACTION", "label": "Revue régulière", "etat": "NON_DOCUMENTE"},
            {"id": "decisions", "type": "FLUX", "label": "Décisions éclairées", "etat": "DEGRADE"},
        ],
        "edges": [
            {"source": "stats", "cible": "indic", "type": "TRANSFORME"},
            {"source": "indic", "cible": "revue", "type": "ALIMENTE"},
            {"source": "med", "cible": "revue", "type": "UTILISE"},
            {"source": "revue", "cible": "decisions", "type": "PRODUIT"},
        ],
    },
}


def get_chantier_graphe(module_id: str) -> Optional[dict[str, Any]]:
    """Graphe WSF statique d'un chantier, ou None si inconnu."""
    return CHANTIER_GRAPHES.get(module_id)


# ─────────────────────────────────────────────────────────────────────
# Layout par couches (longest-path top-down) + dessin reportlab
# ─────────────────────────────────────────────────────────────────────

# Dimensions (points PDF).
_BOX_W = 150.0
_BOX_H = 40.0
_VGAP = 34.0   # espace vertical entre couches
_HGAP = 14.0   # espace horizontal entre boîtes d'une même couche
_PAD = 6.0     # marge autour du dessin


def _compute_layers(nodes: list[dict], edges: list[dict]) -> dict[str, int]:
    """Assigne une couche (0 = sommet) à chaque nœud par plus long chemin.

    Robuste aux cycles (relaxation bornée) et aux liaisons vers des nœuds
    inconnus (ignorées). Les nœuds sans entrée commencent en couche 0.
    """
    ids = {n["id"] for n in nodes}
    valid_edges = [e for e in edges if e.get("source") in ids and e.get("cible") in ids]
    layer = {nid: 0 for nid in ids}
    # Relaxation : layer[cible] = max(layer[cible], layer[source] + 1).
    for _ in range(len(ids)):
        changed = False
        for e in valid_edges:
            cand = layer[e["source"]] + 1
            if cand > layer[e["cible"]]:
                layer[e["cible"]] = cand
                changed = True
        if not changed:
            break
    return layer


def _wrap_label(label: str, max_chars: int = 18) -> list[str]:
    """Coupe un label en 1-2 lignes pour tenir dans la boîte."""
    if len(label) <= max_chars:
        return [label]
    words = label.split(" ")
    line1, line2 = "", ""
    for w in words:
        if not line1 or len(line1) + 1 + len(w) <= max_chars:
            line1 = (line1 + " " + w).strip()
        else:
            line2 = (line2 + " " + w).strip()
    if len(line2) > max_chars:
        line2 = line2[: max_chars - 1] + "…"
    return [line1, line2] if line2 else [line1]


def build_wsf_drawing(graphe: dict[str, Any], max_width: float = 470.0) -> Optional[Drawing]:
    """Construit un Drawing reportlab (flowable) représentant le graphe WSF.

    Retourne None si le graphe est vide / invalide (le PDF saute alors la
    section schéma sans casser).
    """
    nodes = graphe.get("nodes") or []
    edges = graphe.get("edges") or []
    if not nodes:
        return None

    layer = _compute_layers(nodes, edges)
    # Regroupe par couche, en conservant l'ordre d'apparition.
    layers: dict[int, list[dict]] = {}
    for n in nodes:
        layers.setdefault(layer[n["id"]], []).append(n)
    n_layers = max(layers) + 1

    # Largeur du dessin = couche la plus large.
    def layer_width(items: list[dict]) -> float:
        k = len(items)
        return k * _BOX_W + (k - 1) * _HGAP

    content_w = max(layer_width(items) for items in layers.values())
    width = max(content_w, _BOX_W) + 2 * _PAD  # largeur naturelle
    height = n_layers * _BOX_H + (n_layers - 1) * _VGAP + 2 * _PAD

    d = Drawing(width, height)

    # Position du centre de chaque nœud. Couche 0 en haut => y le plus grand.
    pos: dict[str, tuple[float, float]] = {}
    for lyr, items in layers.items():
        lw = layer_width(items)
        x0 = (width - lw) / 2.0
        # y du centre de la rangée
        cy = height - _PAD - _BOX_H / 2.0 - lyr * (_BOX_H + _VGAP)
        for i, n in enumerate(items):
            cx = x0 + i * (_BOX_W + _HGAP) + _BOX_W / 2.0
            pos[n["id"]] = (cx, cy)

    ids = set(pos)

    # 1. Liaisons (dessinées avant les boîtes pour passer dessous).
    for e in edges:
        s, c = e.get("source"), e.get("cible")
        if s not in ids or c not in ids:
            continue
        sx, sy = pos[s]
        cx, cy = pos[c]
        # On part du bas de la source vers le haut de la cible (sens top-down),
        # sauf si la cible est au-dessus (liaison remontante) — on relie alors
        # les centres, c'est rare sur ces petits graphes.
        if cy < sy:
            y1 = sy - _BOX_H / 2.0
            y2 = cy + _BOX_H / 2.0
        else:
            y1, y2 = sy, cy
        d.add(Line(sx, y1, cx, y2, strokeColor=HexColor("#B3B5B8"), strokeWidth=1.0))
        # Flèche à l'extrémité cible.
        _add_arrowhead(d, sx, y1, cx, y2)
        # Label de liaison (type en minuscule) au milieu.
        label = str(e.get("type", "")).lower().replace("_", " ")
        if label:
            mx, my = (sx + cx) / 2.0, (y1 + y2) / 2.0
            tw = len(label) * 4.0
            d.add(Rect(mx - tw / 2.0 - 2, my - 4, tw + 4, 9,
                       fillColor=HexColor("#ffffff"), strokeColor=None))
            d.add(String(mx, my - 2.5, label, fontName="Helvetica",
                         fontSize=6.5, fillColor=HexColor("#6E7795"),
                         textAnchor="middle"))

    # 2. Nœuds.
    for n in nodes:
        cx, cy = pos[n["id"]]
        cols = _etat_colors(n.get("etat", _ETAT_DEFAULT))
        x = cx - _BOX_W / 2.0
        y = cy - _BOX_H / 2.0
        d.add(Rect(x, y, _BOX_W, _BOX_H, rx=5, ry=5,
                   fillColor=HexColor(cols["fill"]),
                   strokeColor=HexColor(cols["stroke"]), strokeWidth=1.2))
        lines = _wrap_label(str(n.get("label", "")))
        tcol = HexColor(cols["text"])
        if len(lines) == 1:
            d.add(String(cx, cy - 3, lines[0], fontName="Helvetica-Bold",
                         fontSize=8.5, fillColor=tcol, textAnchor="middle"))
        else:
            d.add(String(cx, cy + 3, lines[0], fontName="Helvetica-Bold",
                         fontSize=8.5, fillColor=tcol, textAnchor="middle"))
            d.add(String(cx, cy - 7, lines[1], fontName="Helvetica-Bold",
                         fontSize=8.5, fillColor=tcol, textAnchor="middle"))

    # Mise a l'echelle : si une couche large depasse max_width, on reduit
    # tout le dessin proportionnellement plutot que de laisser deborder.
    if width > max_width:
        scale = max_width / width
        d.transform = (scale, 0, 0, scale, 0, 0)
        d.width = width * scale
        d.height = height * scale

    return d


def _add_arrowhead(d: Drawing, x1: float, y1: float, x2: float, y2: float) -> None:
    """Petit triangle plein à l'extrémité (x2,y2), orienté selon (x1,y1)->(x2,y2)."""
    import math
    dx, dy = x2 - x1, y2 - y1
    dist = math.hypot(dx, dy) or 1.0
    ux, uy = dx / dist, dy / dist
    size = 6.0
    # base du triangle un peu en retrait de la pointe
    bx, by = x2 - ux * size, y2 - uy * size
    # perpendiculaire
    px, py = -uy, ux
    half = 3.0
    pts = [x2, y2,
           bx + px * half, by + py * half,
           bx - px * half, by - py * half]
    d.add(Polygon(pts, fillColor=HexColor("#B3B5B8"), strokeColor=None))


# Légende état -> libellé lisible (pour une éventuelle légende sous le schéma).
ETAT_LABEL = {
    "OPTIMAL": "Optimal",
    "FONCTIONNEL": "Fonctionnel",
    "DEGRADE": "Dégradé",
    "A_RISQUE": "À risque",
    "BLOQUE": "Bloqué",
    "NON_DOCUMENTE": "Non documenté",
    "EN_TRANSFORMATION": "En transformation",
    "INACTIF": "Inactif",
}


def etats_presents(graphe: dict[str, Any]) -> list[str]:
    """États réellement présents dans le graphe (pour une légende ciblée)."""
    seen: list[str] = []
    for n in graphe.get("nodes") or []:
        e = n.get("etat", _ETAT_DEFAULT)
        if e not in seen:
            seen.append(e)
    return seen


# ─────────────────────────────────────────────────────────────────────
# Parcours (pivot D-056) : ruban de chaîne de valeur + mini-carto.
# Pendants reportlab des renderers web web/lib/wsf/render-ruban.ts et
# render-carto.ts. Mêmes règles : ruban = symboles au trait (la forme dit
# le type), carto = points colorés par état. Spec §5-6.
# ─────────────────────────────────────────────────────────────────────

_NAVY = "#1A2333"
_ARGENT = "#B5B5B8"
_INK600 = "#3A4360"
_INK400 = "#6E7795"
_TERRA = "#7A3320"
_PAPER = "#FBFAF6"
_IVORY = "#F4EFE5"

# Ordre canonique des zones (composantes) du ruban, haut → bas.
_ZONE_ORDER = [
    "ENVIRONNEMENT", "STRATEGIE", "PARTICIPANT", "TECHNOLOGIE",
    "INFORMATION", "PROCESSUS", "PRODUIT", "CLIENT", "INFRASTRUCTURE",
]
_ZONE_LABEL = {
    "ENVIRONNEMENT": "Environnement", "STRATEGIE": "Stratégie",
    "PARTICIPANT": "Participant", "TECHNOLOGIE": "Technologie",
    "INFORMATION": "Information", "PROCESSUS": "Processus",
    "PRODUIT": "Produit", "CLIENT": "Client", "INFRASTRUCTURE": "Infrastructure",
}
_FLOW_TYPES = {"PRODUIT", "ALIMENTE", "TRANSFORME", "INTERFACE", "DELIVRE", "CONSOMME", "CONTRAINT"}
_ETAT_SEVERITE = {
    "BLOQUE": 5, "A_RISQUE": 4, "DEGRADE": 3, "NON_DOCUMENTE": 2,
    "INACTIF": 2, "EN_TRANSFORMATION": 1, "FONCTIONNEL": 0, "OPTIMAL": 0,
}


def _maturite_opacite(node: dict) -> float:
    m = str((node.get("metadata") or {}).get("maturite", "")).upper()
    if m in ("INFERE", "INFÉRÉ"):
        return 0.42
    if m in ("SUPPOSE", "SUPPOSÉ"):
        return 0.28
    return 1.0


def _col(hex_str: str, alpha: float = 1.0) -> Color:
    c = HexColor(hex_str)
    return Color(c.red, c.green, c.blue, alpha)


def _symbole(d: Drawing, type_obj: str, cx: float, cy: float, op: float) -> None:
    """Ajoute le symbole au trait du TypeObjet (forme = type)."""
    stroke = _col(_NAVY, op)
    none = None
    t = type_obj
    if t == "ACTEUR":
        d.add(Circle(cx, cy + 5, 5, strokeColor=stroke, strokeWidth=1.3, fillColor=none))
        d.add(Polygon([cx - 9, cy - 8, cx + 9, cy - 8, cx + 6, cy - 1, cx - 6, cy - 1],
                      strokeColor=stroke, strokeWidth=1.3, fillColor=none))
    elif t == "ENTITE":
        d.add(Rect(cx - 13, cy - 9, 26, 18, strokeColor=stroke, strokeWidth=1.3, fillColor=none))
    elif t == "STOCK":
        d.add(Ellipse(cx, cy + 8, 12, 4, strokeColor=stroke, strokeWidth=1.3, fillColor=none))
        d.add(Rect(cx - 12, cy - 8, 24, 16, strokeColor=stroke, strokeWidth=1.3, fillColor=none))
    elif t == "ACTION":
        d.add(Rect(cx - 15, cy - 9, 30, 18, rx=9, ry=9, strokeColor=stroke, strokeWidth=1.3, fillColor=none))
    elif t == "DECISION":
        d.add(Polygon([cx, cy + 11, cx + 14, cy, cx, cy - 11, cx - 14, cy],
                      strokeColor=stroke, strokeWidth=1.3, fillColor=none))
    elif t == "FLUX":
        d.add(Polygon([cx - 10, cy - 9, cx + 15, cy - 9, cx + 10, cy + 9, cx - 15, cy + 9],
                      strokeColor=stroke, strokeWidth=1.3, fillColor=none))
    elif t == "CONTRAINTE":
        d.add(Polygon([cx - 9, cy + 9, cx + 9, cy + 9, cx + 14, cy - 9, cx - 14, cy - 9],
                      strokeColor=stroke, strokeWidth=1.3, fillColor=none))
    elif t == "FRONTIERE":
        d.add(Circle(cx, cy, 12, strokeColor=stroke, strokeWidth=1.3, fillColor=none))
    else:
        d.add(Rect(cx - 13, cy - 9, 26, 18, strokeColor=stroke, strokeWidth=1.3, fillColor=none))


def build_ruban_drawing(graphe: dict[str, Any], max_width: float = 470.0) -> Optional[Drawing]:
    """Ruban de chaîne de valeur : symboles au trait par zone, lecture g→d.

    Pendant reportlab de render-ruban.ts. Trait sobre navy ; la couleur
    d'état n'est PAS le canal porteur ici (c'est la mini-carto).
    """
    nodes = graphe.get("nodes") or []
    edges = graphe.get("edges") or []
    if not nodes:
        return None

    present = {n["composante"] for n in nodes}
    zones = [z for z in _ZONE_ORDER if z in present]

    # Ordre de lecture g→d par layering sur les liaisons de flux.
    flow = [e for e in edges if e.get("type") in _FLOW_TYPES]
    layer = _compute_layers(nodes, flow)
    max_layer = max(layer.values()) if layer else 0

    lbl_w = 78.0
    x0 = lbl_w + 18.0
    col_w = 78.0
    band_h = 46.0
    pad = 8.0
    width = max(x0 + (max_layer + 1) * col_w + pad, 360.0)
    height = pad * 2 + len(zones) * band_h

    d = Drawing(width, height)

    def zone_cy(z: str) -> float:
        i = zones.index(z)
        return height - pad - i * band_h - band_h / 2.0

    def col_x(l: int) -> float:
        return x0 + l * col_w

    # Bandes de zones.
    for i, z in enumerate(zones):
        yy = height - pad - (i + 1) * band_h
        d.add(Rect(pad, yy, width - 2 * pad, band_h,
                   fillColor=HexColor(_PAPER if i % 2 else _IVORY),
                   strokeColor=_col(_NAVY, 0.10), strokeWidth=0.8))
        d.add(String(pad + 4, yy + band_h / 2 - 3, _ZONE_LABEL[z].upper(),
                     fontName="Helvetica", fontSize=6, fillColor=HexColor(_INK400)))

    # Désalignement à tracer : objet le plus sévère.
    worst = sorted(nodes, key=lambda n: (_ETAT_SEVERITE.get(n.get("etat", ""), 0),
                                         1 if n.get("criticite") == "CRITIQUE" else 0),
                   reverse=True)
    worst_id = worst[0]["id"] if worst else None

    # Symboles, avec décalage horizontal si collision (zone, colonne).
    offset: dict[str, int] = {}
    for n in nodes:
        if n["composante"] not in zones:
            continue
        l = layer.get(n["id"], 0)
        key = f'{n["composante"]}:{l}'
        o = offset.get(key, 0)
        offset[key] = o + 1
        cx = col_x(l) + o * 20
        cy = zone_cy(n["composante"])
        op = _maturite_opacite(n)
        _symbole(d, n.get("type", ""), cx, cy, op)
        lab = str(n.get("label", ""))[:16]
        d.add(String(cx, cy - 20, lab, fontName="Helvetica", fontSize=5.5,
                     fillColor=_col(_INK600, op), textAnchor="middle"))
        if worst_id and n["id"] == worst_id:
            d.add(Circle(cx, cy, 18, strokeColor=HexColor(_TERRA), strokeWidth=1.1,
                         fillColor=None, strokeDashArray=[3, 2]))

    if width > max_width:
        scale = max_width / width
        d.transform = (scale, 0, 0, scale, 0, 0)
        d.width = width * scale
        d.height = height * scale
    return d


# Ancrage souple d'un cluster par composante (coords normalisées [0,1]).
_CARTO_ANCHOR = {
    "PARTICIPANT": (0.21, 0.74), "TECHNOLOGIE": (0.45, 0.80),
    "STRATEGIE": (0.20, 0.36), "INFORMATION": (0.72, 0.70),
    "PROCESSUS": (0.49, 0.42), "PRODUIT": (0.71, 0.22),
    "ENVIRONNEMENT": (0.88, 0.52), "CLIENT": (0.88, 0.24),
    "INFRASTRUCTURE": (0.21, 0.14),
}


def build_carto_drawing(graphe: dict[str, Any], max_width: float = 470.0) -> Optional[Drawing]:
    """Mini-carto des objets : points colorés par état, liens argent fins.

    Pendant reportlab de render-carto.ts. La couleur d'état est ici le canal
    porteur (seul endroit du triptyque).
    """
    import math
    nodes = graphe.get("nodes") or []
    edges = graphe.get("edges") or []
    if not nodes:
        return None

    width = max_width
    height = max_width * 0.62
    pad = 12.0

    by_comp: dict[str, list[str]] = {}
    for n in nodes:
        by_comp.setdefault(n["composante"], []).append(n["id"])

    pos: dict[str, tuple[float, float]] = {}
    for comp, ids in by_comp.items():
        ax, ay = _CARTO_ANCHOR.get(comp, (0.5, 0.5))
        cx0 = pad + ax * (width - 2 * pad)
        cy0 = pad + ay * (height - 2 * pad)
        k = len(ids)
        for i, nid in enumerate(ids):
            if k == 1:
                pos[nid] = (cx0, cy0)
            else:
                r = 16 + k * 3
                a = (i / k) * 2 * math.pi - math.pi / 2
                pos[nid] = (cx0 + r * math.cos(a), cy0 + r * math.sin(a))

    d = Drawing(width, height)
    node_by_id = {n["id"]: n for n in nodes}

    # Liens (traits fins argent, épaisseur ∝ force).
    for e in edges:
        a = pos.get(e.get("source"))
        b = pos.get(e.get("cible"))
        if not a or not b:
            continue
        so = node_by_id.get(e.get("source"))
        ci = node_by_id.get(e.get("cible"))
        op = min(_maturite_opacite(so) if so else 1.0,
                 _maturite_opacite(ci) if ci else 1.0) * 0.55
        sw = 0.6 + float(e.get("force", 0.5)) * 1.2
        d.add(Line(a[0], a[1], b[0], b[1], strokeColor=_col(_ARGENT, op), strokeWidth=sw))

    # Points (couleur = état).
    for n in nodes:
        p = pos.get(n["id"])
        if not p:
            continue
        cols = _etat_colors(n.get("etat", _ETAT_DEFAULT))
        op = _maturite_opacite(n)
        d.add(Circle(p[0], p[1], 7, fillColor=_col(cols["stroke"], op),
                     strokeColor=_col(_IVORY, op), strokeWidth=1.5))
        d.add(String(p[0] + 11, p[1] - 3, str(n.get("label", ""))[:22],
                     fontName="Helvetica", fontSize=6, fillColor=_col(_INK600, op)))

    return d
