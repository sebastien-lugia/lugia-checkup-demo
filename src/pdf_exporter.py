"""
PDF export pour les chantiers V3-charte (H.4, 2026-05-22).

Génère un PDF reprenant le contenu de la page chantier frontend :
en-tête marque, comparatif Autonomie vs Lugia, 4 étapes du plan d'action,
encart "Avec Lugia", footnote estimations.

Utilise reportlab Platypus (haut niveau : Paragraph, Spacer, Table).
Polices natives Helvetica + Times pour rester portable (pas de TTF à
embarquer). Couleurs charte Lugia codées en dur dans les styles.
"""

from __future__ import annotations

import io
import json
from pathlib import Path
from typing import Any, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

# ─── Charte Lugia ──────────────────────────────────────────────────────────

NAVY = colors.HexColor("#1A2333")
NAVY_600 = colors.HexColor("#4a5366")
NAVY_400 = colors.HexColor("#6b7689")
IVORY_LIGHT = colors.HexColor("#F8F4EB")
ARGENT = colors.HexColor("#B5B5B8")
ARGENT_DEEP = colors.HexColor("#8a8a8d")
SIGNAL_WARN = colors.HexColor("#7A6030")
LINE = colors.HexColor("#e8e3d6")


def _load_modules() -> dict[str, Any]:
    """Charge le catalogue des modules V3-charte (cf lib/v3/modules_data.ts).

    Comme les données canoniques sont en TypeScript côté frontend, on lit
    une copie JSON exportée. Pour cette première version, on lit directement
    le JSON V3 du protocole (qui contient au moins les ids) et on injecte les
    labels en dur.
    """
    # Charge le module data depuis le frontend (parse manuel du TS si besoin)
    # Pour cette V1 minimale, on garde une copie en dur ici — alignée avec
    # `lib/v3/modules_data.ts`. À industrialiser dans une prochaine itération.
    return _MODULES_FALLBACK


# Fallback : copie minimale du catalogue modules pour ne pas dépendre du TS.
# Aligné avec lib/v3/modules_data.ts au 2026-05-22.
_MODULES_FALLBACK: dict[str, Any] = {
    "urgences": {
        "label": "Organiser les urgences du jour",
        "effort": 2,
        "etapes": [
            {"num": "01", "titre": "Définir ce qu'est une « urgence du jour »",
             "body": "Pas les urgences vitales — celles-ci ont leur circuit propre. On parle ici des consultations qui ne peuvent pas attendre 48 h. Listez avec votre secrétariat les motifs qui rentrent dans cette catégorie : douleur thoracique, fièvre élevée chez un enfant, décompensation psychiatrique, suspicion d'infection sévère.",
             "tag": "quick"},
            {"num": "02", "titre": "Bloquer deux créneaux dédiés par jour",
             "body": "Un le matin, un l'après-midi. S'ils ne sont pas utilisés pour des urgences, ils sont récupérés pour des chroniques en fin de journée. Testez le format 3 semaines avant d'évaluer.",
             "tag": "quick"},
            {"num": "03", "titre": "Former le secrétariat au tri téléphonique",
             "body": "Trois questions suffisent pour trier 80 % des situations : depuis quand le symptôme dure-t-il, est-ce que ça s'aggrave, le patient a-t-il déjà eu ça ? Avec ces trois questions partagées, le secrétariat oriente sans vous interrompre.",
             "tag": "medium"},
            {"num": "04", "titre": "Évaluer après un mois",
             "body": "Combien de créneaux urgence utilisés par semaine ? Combien d'interruptions en consultation ? Renvois aux urgences en hausse ou en baisse ? Ces trois indicateurs suffisent à ajuster.",
             "tag": "medium"},
        ],
        "benchmark": {
            "texte": "Les cabinets qui mettent en place des créneaux dédiés réduisent de 60 à 70 % les interruptions en consultation. Un médecin interrompu huit fois par jour perd en moyenne 1 h 15 de concentration productive.",
        },
        "avecLugia": "Lugia peut animer le cadrage des critères de tri avec votre secrétariat, suivre les indicateurs du logiciel sur 4 semaines, et ajuster avec vous le format si les créneaux ne sont pas absorbés.",
    },
    "chroniques": {
        "label": "Structurer le suivi des patients chroniques",
        "effort": 2,
        "etapes": [],
        "benchmark": {"texte": ""},
        "avecLugia": "Lugia peut configurer les extractions logiciel pour repérer les chroniques silencieux, poser un rythme de revue d'équipe, et préparer un protocole qui tient quand vous êtes absent.",
    },
    "delegation": {
        "label": "Déléguer des tâches non médicales",
        "effort": 3,
        "etapes": [],
        "benchmark": {"texte": ""},
        "avecLugia": "Lugia peut cartographier avec vous ce qui peut être délégué (paramédical, secrétariat, prestataires), évaluer le temps regagné, et formaliser les protocoles de coopération qui sécurisent juridiquement la délégation.",
    },
    "comm": {
        "label": "Instaurer un rituel de communication d'équipe",
        "effort": 1,
        "etapes": [],
        "benchmark": {"texte": ""},
        "avecLugia": "Lugia peut dimensionner le rituel (durée, fréquence, format), accompagner les premières séances, et outiller la traçabilité des décisions prises en équipe.",
    },
    "logiciel": {
        "label": "Optimiser le logiciel médical",
        "effort": 2,
        "etapes": [],
        "benchmark": {"texte": ""},
        "avecLugia": "Lugia peut faire un audit ciblé de votre logiciel actuel, identifier les 3-4 fonctions sous-utilisées au meilleur retour, et former l'équipe sur les modèles et raccourcis qui font gagner le plus de temps.",
    },
    "admin": {
        "label": "Réduire la charge administrative quotidienne",
        "effort": 2,
        "etapes": [],
        "benchmark": {"texte": ""},
        "avecLugia": "Lugia peut vous aider à choisir et paramétrer les outils d'automatisation adaptés à votre profil (FSE, scan documents, signature), et à organiser la sous-traitance des tâches qui peuvent l'être.",
    },
    "pilotage": {
        "label": "Mettre en place un pilotage simple de l'activité",
        "effort": 1,
        "etapes": [],
        "benchmark": {"texte": ""},
        "avecLugia": "Lugia peut définir avec vous les 3 indicateurs les plus utiles, automatiser leur extraction depuis votre logiciel, et poser un rythme de revue trimestrielle qui transforme les chiffres en décisions.",
    },
}

# Catalogue opps (pour gainTime, delai, etc.) — aligné avec lib/v3/opps_catalog.ts
_OPPS_FALLBACK: dict[str, dict[str, Any]] = {
    "urgences":  {"axis": "A", "effort": 2, "delai": "< 1 semaine", "gainTime": "−30 min/j", "autoTaux": 0.20, "lugiaTaux": 0.75},
    "chroniques":{"axis": "A", "effort": 2, "delai": "2–4 semaines", "gainTime": "−2h/sem",  "autoTaux": 0.18, "lugiaTaux": 0.80},
    "delegation":{"axis": "B", "effort": 3, "delai": "< 1 semaine", "gainTime": "−45 min/j", "autoTaux": 0.15, "lugiaTaux": 0.85},
    "comm":      {"axis": "B", "effort": 1, "delai": "< 1 semaine", "gainTime": "−20 min/j", "autoTaux": 0.30, "lugiaTaux": 0.80},
    "logiciel":  {"axis": "C", "effort": 2, "delai": "< 1 semaine", "gainTime": "−15 min/consult", "autoTaux": 0.20, "lugiaTaux": 0.80},
    "admin":     {"axis": "C", "effort": 2, "delai": "< 1 semaine", "gainTime": "−1h/j",     "autoTaux": 0.20, "lugiaTaux": 0.75},
    "pilotage":  {"axis": "C", "effort": 1, "delai": "2–4 semaines", "gainTime": "−30 min/sem","autoTaux": 0.35, "lugiaTaux": 0.75},
}

# Constantes A.1ter (formule gain euros)
TAUX_HORAIRE_TTC = 70
EFFICIENCY = 0.7
JOURS_PAR_AN = 220
VOLUME_FACTOR = {"lt_80": 0.8, "80_120": 1.0, "gt_120": 1.25}
EFFORT_AUTO_H = {1: 6, 2: 15, 3: 30}
EFFORT_LUGIA_H = {1: 2, 2: 4, 3: 7}

# ─── Helpers de calcul (miroir de opps_catalog.ts) ─────────────────────────


def _parse_gain_time_min_per_day(s: str) -> Optional[int]:
    """Convertit gainTime du catalogue en minutes par jour équivalent."""
    import re
    s = s.replace(" ", " ").strip()
    for pattern, mult in [
        (r"^[−-]\s*(\d+)\s*min\s*/\s*j$", 1),
        (r"^[−-]\s*(\d+)\s*h\s*/\s*j$", 60),
        (r"^[−-]\s*(\d+)\s*min\s*/\s*consult$", 1),
    ]:
        m = re.match(pattern, s)
        if m:
            return int(m.group(1)) * mult
    m = re.match(r"^[−-]\s*(\d+)\s*h\s*/\s*sem$", s)
    if m: return round(int(m.group(1)) * 60 / 5)
    m = re.match(r"^[−-]\s*(\d+)\s*min\s*/\s*sem$", s)
    if m: return round(int(m.group(1)) / 5)
    return None


def _compute_gain_euros(gain_time: str, volume: Optional[str]) -> Optional[int]:
    m = _parse_gain_time_min_per_day(gain_time)
    if m is None:
        return None
    factor = VOLUME_FACTOR.get(volume or "80_120", 1.0)
    euros = (m / 60) * TAUX_HORAIRE_TTC * JOURS_PAR_AN * EFFICIENCY * factor
    return round(euros / 100) * 100


def _format_euros(v: int) -> str:
    if v < 10000:
        return f"{v:,}".replace(",", " ") + " €"
    return f"{v/1000:.1f}".replace(".", ",") + " k€"


def _delai_autonomie(delai: str) -> str:
    import re
    if re.match(r"^<\s*1\s*semaine", delai):
        return "1 à 2 semaines"
    m = re.match(r"^(\d+)\s*[–-]\s*(\d+)\s*semaines?", delai)
    if m:
        lo = round(int(m.group(1)) * 1.5)
        hi = round(int(m.group(2)) * 1.5)
        return f"{lo} à {hi} semaines"
    return delai


def _taux_to_ratio(p: float) -> str:
    if p <= 0:
        return "très rare"
    if p >= 0.95:
        return "quasi-systématique"
    if p <= 0.5:
        denom = max(2, round(1 / p))
        return f"1 cabinet sur {denom}"
    Y = max(2, round(1 / (1 - p)))
    X = max(1, round(p * Y))
    return f"{X} cabinet{'s' if X > 1 else ''} sur {Y}"


def _natural_gain_time(time_str: str) -> str:
    """Format français lisible du gainTime."""
    import re
    m = re.match(r"^[−-]\s*(\d+)\s*min\s*/\s*j$", time_str)
    if m: return f"Environ {m.group(1)} minutes libérées par jour"
    m = re.match(r"^[−-]\s*(\d+)\s*h\s*/\s*j$", time_str)
    if m:
        h = int(m.group(1))
        return f"Environ {h} h libérée{'s' if h > 1 else ''} par jour"
    m = re.match(r"^[−-]\s*(\d+)\s*min\s*/\s*consult$", time_str)
    if m: return f"Environ {m.group(1)} minutes de gain par consultation"
    m = re.match(r"^[−-]\s*(\d+)\s*h\s*/\s*sem$", time_str)
    if m:
        h = int(m.group(1))
        return f"Environ {h} h libérée{'s' if h > 1 else ''} par semaine"
    m = re.match(r"^[−-]\s*(\d+)\s*min\s*/\s*sem$", time_str)
    if m: return f"Environ {m.group(1)} minutes libérées par semaine"
    return time_str


# ─── Styles reportlab ──────────────────────────────────────────────────────


def _make_styles():
    s = getSampleStyleSheet()
    return {
        "eyebrow": ParagraphStyle("eyebrow", parent=s["Normal"],
                                  fontName="Helvetica-Bold", fontSize=8,
                                  textColor=NAVY_400, spaceAfter=8,
                                  letterSpacing=1),
        "h1": ParagraphStyle("h1", parent=s["Normal"],
                             fontName="Times-Roman", fontSize=22,
                             textColor=NAVY, leading=26, spaceAfter=14),
        "h2": ParagraphStyle("h2", parent=s["Normal"],
                             fontName="Times-Roman", fontSize=14,
                             textColor=NAVY, leading=18, spaceBefore=10, spaceAfter=6),
        "body": ParagraphStyle("body", parent=s["Normal"],
                               fontName="Helvetica", fontSize=10.5,
                               textColor=NAVY, leading=15, spaceAfter=8),
        "small": ParagraphStyle("small", parent=s["Normal"],
                                fontName="Helvetica", fontSize=8.5,
                                textColor=NAVY_400, leading=12, spaceAfter=6),
        "step_num": ParagraphStyle("step_num", parent=s["Normal"],
                                   fontName="Helvetica-Bold", fontSize=12,
                                   textColor=NAVY_400, leading=14),
        "step_title": ParagraphStyle("step_title", parent=s["Normal"],
                                     fontName="Times-Roman", fontSize=13,
                                     textColor=NAVY, leading=16, spaceAfter=4),
        "lugia_label": ParagraphStyle("lugia_label", parent=s["Normal"],
                                      fontName="Helvetica-Bold", fontSize=8,
                                      textColor=ARGENT_DEEP, spaceAfter=4),
    }


# ─── Génération du PDF ─────────────────────────────────────────────────────


def build_chantier_pdf(
    module_id: str,
    profile: Optional[dict[str, Any]] = None,
    graphe: Optional[dict[str, Any]] = None,
) -> bytes:
    """Génère le PDF d'un chantier en bytes (à servir tel quel par FastAPI).

    `profile` est utilisé pour personnaliser les gains € selon le volume
    cabinet (lt_80 / 80_120 / gt_120). Si absent, utilise le volume médian.

    `graphe` (C.B) : graphe WSF à dessiner sous le plan d'action. Si fourni
    (typiquement le schéma enrichi produit par le chat), il est utilisé tel
    quel ; sinon on retombe sur le graphe statique du chantier.
    """
    mod = _MODULES_FALLBACK.get(module_id)
    opp = _OPPS_FALLBACK.get(module_id)
    if mod is None or opp is None:
        raise ValueError(f"Module inconnu : {module_id}")

    volume = (profile or {}).get("volume") if profile else None
    gain_euros = _compute_gain_euros(opp["gainTime"], volume)
    auto_euros = round(gain_euros * opp["autoTaux"] / 100) * 100 if gain_euros else None
    lugia_euros = round(gain_euros * opp["lugiaTaux"] / 100) * 100 if gain_euros else None

    styles = _make_styles()
    story: list[Any] = []

    # ── En-tête ──
    story.append(Paragraph("LUGIA & CO &nbsp; · &nbsp; PLAN D'ACTION", styles["eyebrow"]))
    story.append(Spacer(1, 4))
    story.append(Paragraph(mod["label"] + ".", styles["h1"]))

    # ── Mécanique du chantier ──
    story.append(Paragraph("MÉCANIQUE DU CHANTIER", styles["eyebrow"]))
    story.append(Paragraph(
        f"{_natural_gain_time(opp['gainTime'])} si le chantier est mené à son terme.",
        styles["body"]
    ))
    story.append(Spacer(1, 12))

    # ── Comparatif Autonomie vs Lugia ──
    auto_str = _format_euros(auto_euros) if auto_euros else "—"
    lugia_str = _format_euros(lugia_euros) if lugia_euros else "—"
    eff_auto = EFFORT_AUTO_H[opp["effort"]]
    eff_lugia = EFFORT_LUGIA_H[opp["effort"]]

    comparatif_data = [
        ["", "EN AUTONOMIE", "AVEC LUGIA"],
        ["Gain attendu", f"~{auto_str}/an", f"~{lugia_str}/an"],
        ["Délai", _delai_autonomie(opp["delai"]), opp["delai"]],
        ["Votre temps", f"~{eff_auto} h cumulées", f"~{eff_lugia} h cumulées"],
        ["Taux d'aboutissement", _taux_to_ratio(opp["autoTaux"]), _taux_to_ratio(opp["lugiaTaux"])],
    ]
    comparatif_tbl = Table(comparatif_data, colWidths=[45*mm, 60*mm, 60*mm])
    comparatif_tbl.setStyle(TableStyle([
        # Header row
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 8),
        ("TEXTCOLOR", (0, 0), (-1, 0), NAVY_400),
        ("TEXTCOLOR", (2, 0), (2, 0), NAVY),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("LINEBELOW", (0, 0), (-1, 0), 0.5, LINE),
        # Body rows
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 1), (0, -1), 8),
        ("TEXTCOLOR", (0, 1), (0, -1), NAVY_400),
        ("FONTNAME", (1, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (1, 1), (-1, -1), 10.5),
        ("TEXTCOLOR", (1, 1), (1, -1), NAVY_600),
        ("TEXTCOLOR", (2, 1), (2, -1), NAVY),
        ("FONTNAME", (2, 1), (2, 1), "Helvetica-Bold"),  # Gain Lugia en gras
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.white]),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 8),
        ("TOPPADDING", (0, 1), (-1, -1), 4),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(comparatif_tbl)
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        "Gain attendu = gain théorique × probabilité d'aboutir. Hypothèses : 70 € TTC/h, 220 jours/an, 70 % du temps libéré réinvesti.",
        styles["small"]
    ))
    story.append(Spacer(1, 18))

    # ── 4 étapes ──
    if mod["etapes"]:
        for etape in mod["etapes"]:
            num_p = Paragraph(etape["num"], styles["step_num"])
            tag_label = {"quick": "RAPIDE", "medium": "POSÉ", "invest": "APPROFONDI"}.get(
                etape.get("tag", "quick"), "RAPIDE"
            )
            title_with_tag = (
                f'{etape["titre"]} &nbsp; '
                f'<font color="#6b7689" size="7">[{tag_label}]</font>'
            )
            content_p = [
                Paragraph(title_with_tag, styles["step_title"]),
                Paragraph(etape["body"], styles["body"]),
            ]
            tbl = Table(
                [[num_p, content_p]],
                colWidths=[14*mm, 151*mm],
            )
            tbl.setStyle(TableStyle([
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 2),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
            ]))
            story.append(tbl)
    else:
        story.append(Paragraph(
            "Les 4 étapes du plan d'action de ce chantier sont en cours de rédaction.",
            styles["body"]
        ))

    story.append(Spacer(1, 10))

    # ── Schéma du chantier (C.B, 2026-05-27) ──
    # Graphe enrichi (chat) si fourni, sinon graphe statique du chantier.
    from src.wsf_render import (
        build_wsf_drawing,
        get_chantier_graphe,
        etats_presents,
        ETAT_COLORS,
        ETAT_LABEL,
    )
    _graphe = graphe or get_chantier_graphe(module_id)
    if _graphe:
        _drawing = build_wsf_drawing(_graphe, max_width=165 * mm)
        if _drawing is not None:
            story.append(Paragraph("SCHÉMA DU CHANTIER", styles["eyebrow"]))
            story.append(Spacer(1, 8))
            story.append(_drawing)
            story.append(Spacer(1, 6))
            _etats = etats_presents(_graphe)
            if _etats:
                _parts = []
                for _e in _etats:
                    _col = ETAT_COLORS.get(_e, ETAT_COLORS["FONCTIONNEL"])["stroke"]
                    _lab = ETAT_LABEL.get(_e, _e)
                    _parts.append(f'<font color="{_col}">●</font> {_lab}')
                story.append(Paragraph(
                    "&nbsp;&nbsp;".join(_parts), styles["small"]
                ))
            story.append(Spacer(1, 16))

    # ── Encart Avec Lugia ──
    if mod.get("avecLugia"):
        lugia_tbl = Table([[
            [
                Paragraph("AVEC LUGIA", styles["lugia_label"]),
                Paragraph(mod["avecLugia"], styles["body"]),
            ]
        ]], colWidths=[165*mm])
        lugia_tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), IVORY_LIGHT),
            ("LINEBEFORE", (0, 0), (0, -1), 2, ARGENT),
            ("LEFTPADDING", (0, 0), (-1, -1), 14),
            ("RIGHTPADDING", (0, 0), (-1, -1), 14),
            ("TOPPADDING", (0, 0), (-1, -1), 14),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(lugia_tbl)
        story.append(Spacer(1, 14))

    # ── Données terrain (benchmark) ──
    if mod.get("benchmark", {}).get("texte"):
        bench_tbl = Table([[
            [
                Paragraph("DONNÉES TERRAIN", ParagraphStyle(
                    "warn_label", parent=styles["lugia_label"],
                    textColor=SIGNAL_WARN
                )),
                Paragraph(mod["benchmark"]["texte"], styles["body"]),
            ]
        ]], colWidths=[165*mm])
        bench_tbl.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F2EEE2")),
            ("LINEBEFORE", (0, 0), (0, -1), 2, SIGNAL_WARN),
            ("LEFTPADDING", (0, 0), (-1, -1), 14),
            ("RIGHTPADDING", (0, 0), (-1, -1), 14),
            ("TOPPADDING", (0, 0), (-1, -1), 14),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 14),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(bench_tbl)

    # ── Génération ──
    buffer = io.BytesIO()
    doc = BaseDocTemplate(
        buffer, pagesize=A4,
        leftMargin=22*mm, rightMargin=22*mm,
        topMargin=22*mm, bottomMargin=22*mm,
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin,
                  doc.width, doc.height, id="normal")

    def _footer(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(NAVY_400)
        canvas.drawString(22*mm, 12*mm, "lugia.fr  ·  sebastien@lugia.fr")
        canvas.drawRightString(A4[0] - 22*mm, 12*mm, f"page {doc.page}")
        canvas.restoreState()

    template = PageTemplate(id="main", frames=[frame], onPage=_footer)
    doc.addPageTemplates([template])
    doc.build(story)
    return buffer.getvalue()
