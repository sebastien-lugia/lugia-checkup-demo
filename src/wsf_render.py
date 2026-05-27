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

from reportlab.graphics.shapes import Drawing, Rect, String, Line, Polygon, Group
from reportlab.lib.colors import HexColor, Color

# ─────────────────────────────────────────────────────────────────────
# Couleurs par état (alignées sur web/lib/wsf/render-mermaid.ts ETAT_CLASS)
# ─────────────────────────────────────────────────────────────────────

ETAT_COLORS: dict[str, dict[str, str]] = {
    "OPTIMAL":           {"fill": "#d1fae5", "stroke": "#059669", "text": "#064e3b"},
    "FONCTIONNEL":       {"fill": "#f0fdf4", "stroke": "#16a34a", "text": "#14532d"},
    "DEGRADE":           {"fill": "#fef3c7", "stroke": "#d97706", "text": "#78350f"},
    "A_RISQUE":          {"fill": "#fee2e2", "stroke": "#dc2626", "text": "#7f1d1d"},
    "BLOQUE":            {"fill": "#fca5a5", "stroke": "#991b1b", "text": "#450a0a"},
    "NON_DOCUMENTE":     {"fill": "#f3f4f6", "stroke": "#9ca3af", "text": "#374151"},
    "EN_TRANSFORMATION": {"fill": "#dbeafe", "stroke": "#2563eb", "text": "#1e3a8a"},
    "INACTIF":           {"fill": "#e5e7eb", "stroke": "#6b7280", "text": "#374151"},
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
        d.add(Line(sx, y1, cx, y2, strokeColor=HexColor("#94a3b8"), strokeWidth=1.0))
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
                         fontSize=6.5, fillColor=HexColor("#64748b"),
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
    d.add(Polygon(pts, fillColor=HexColor("#94a3b8"), strokeColor=None))


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
