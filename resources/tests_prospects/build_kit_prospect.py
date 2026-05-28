# -*- coding: utf-8 -*-
"""Genere le kit de test prospect Lugia en PDF (4 sections)."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import (
    BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, ListFlowable, ListItem,
)

import os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "lugia_kit_test_prospect.pdf")

# Palette Lugia (sobre)
NAVY = colors.HexColor("#1A2333")
NAVY_SOFT = colors.HexColor("#3A4360")
ARGENT = colors.HexColor("#8e8e91")
IVORY = colors.HexColor("#F8F4EB")
IVORY_LINE = colors.HexColor("#ECE6D8")
WARN = colors.HexColor("#7A6030")
LINE = colors.HexColor("#D8D2C6")

SERIF = "Times-Roman"
SERIF_B = "Times-Bold"
SERIF_I = "Times-Italic"
SANS = "Helvetica"
SANS_B = "Helvetica-Bold"

s = getSampleStyleSheet()

def P(name, **kw):
    base = dict(parent=s["Normal"], fontName=SERIF, fontSize=10.5, leading=15,
                textColor=NAVY, spaceAfter=0)
    base.update(kw)
    return ParagraphStyle(name, **base)

st = {
    "eyebrow": P("eyebrow", fontName=SANS, fontSize=8, textColor=ARGENT,
                 leading=12, spaceAfter=3),
    "h1": P("h1", fontName=SERIF_B, fontSize=22, leading=25, spaceAfter=4),
    "sub": P("sub", fontName=SERIF, fontSize=11.5, textColor=NAVY_SOFT, leading=16,
             spaceAfter=2),
    "h2": P("h2", fontName=SERIF_B, fontSize=15, leading=19, textColor=NAVY,
            spaceBefore=4, spaceAfter=6),
    "h3": P("h3", fontName=SANS_B, fontSize=9.5, textColor=NAVY, leading=13,
            spaceBefore=8, spaceAfter=3),
    "body": P("body", spaceAfter=7),
    "body_i": P("body_i", fontName=SERIF_I, textColor=NAVY_SOFT, spaceAfter=7),
    "li": P("li", spaceAfter=2),
    "small": P("small", fontSize=9, textColor=NAVY_SOFT, leading=13),
    "label": P("label", fontName=SANS, fontSize=7.5, textColor=ARGENT, leading=11),
    "q": P("q", fontName=SERIF, fontSize=10.5, leading=15, spaceAfter=4),
    "scale": P("scale", fontName=SANS_B, fontSize=10, textColor=NAVY_SOFT, leading=14, alignment=1),
    "qn": P("qn", fontName=SANS_B, fontSize=10.5, textColor=NAVY, leading=15),
}


def bullets(items, style="li"):
    return ListFlowable(
        [ListItem(Paragraph(t, st[style]), leftIndent=10, value="—",
                  bulletColor=ARGENT) for t in items],
        bulletType="bullet", start="—", leftIndent=12, bulletFontName=SANS,
        bulletFontSize=9, spaceBefore=0, spaceAfter=6,
    )


def band(title_eyebrow, title):
    """Bandeau de section : eyebrow + titre, avec filet."""
    tbl = Table(
        [[Paragraph(title_eyebrow, st["eyebrow"])],
         [Paragraph(title, st["h2"])]],
        colWidths=[166 * mm],
    )
    tbl.setStyle(TableStyle([
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("LINEBELOW", (0, 1), (0, 1), 1, LINE),
    ]))
    return tbl


def quote_box(text):
    t = Table([[Paragraph(text, st["body_i"])]], colWidths=[166 * mm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), IVORY),
        ("LINEBEFORE", (0, 0), (0, -1), 2, ARGENT),
        ("LEFTPADDING", (0, 0), (-1, -1), 12),
        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    return t


story = []

# ── EN-TÊTE ──
story.append(Paragraph("LUGIA &amp; CO &nbsp;·&nbsp; KIT DE TEST", st["eyebrow"]))
story.append(Spacer(1, 4))
story.append(Paragraph("Tester le check-up auprès de médecins.", st["h1"]))
story.append(Spacer(1, 4))
story.append(Paragraph(
    "Tout ce qu'il faut pour faire tester la démo à 3-5 médecins du réseau : "
    "le message d'invitation, le déroulé du test, la grille de feedback et le "
    "guide d'entretien. Objectif : recueillir un avis franc avant d'ouvrir plus "
    "largement.", st["sub"]))
story.append(Spacer(1, 10))

# Rappel posture (encadré)
story.append(quote_box(
    "Rappel de posture : Lugia analyse le <b>système de travail</b> du cabinet "
    "(le quotidien, les outils, ce qui coince) — jamais la pratique médicale, "
    "jamais les individus. Aucune donnée patient n'est demandée. On cherche "
    "à comprendre « où en est le cabinet », sans culpabiliser."))
story.append(Spacer(1, 16))

# ── 1. EMAIL D'INVITATION ──
story.append(band("Section 1", "Message d'invitation"))
story.append(Spacer(1, 8))
story.append(Paragraph(
    "À envoyer en direct (mail, SMS, WhatsApp). À tutoyer ou vouvoyer selon "
    "votre lien. Court, personnel, franc.", st["small"]))
story.append(Spacer(1, 8))

mail = Table([[
    [
        Paragraph("OBJET", st["label"]),
        Paragraph("Tu veux bien tester un truc pour moi&nbsp;? (~30 min)", st["q"]),
        Spacer(1, 6),
        Paragraph("Bonjour [Prénom],", st["body"]),
        Paragraph(
            "Je développe <b>Lugia</b>, un check-up préventif qui aide un médecin à "
            "faire le point sur l'<b>organisation</b> de son cabinet — pas sa "
            "pratique, mais son système de travail : le quotidien, les outils, ce "
            "qui coince.", st["body"]),
        Paragraph(
            "J'aimerais beaucoup ton regard avant d'ouvrir plus largement. "
            "Concrètement&nbsp;: 20-30&nbsp;min pour faire le check-up en ligne, puis "
            "un court échange avec moi (15-20&nbsp;min) pour me dire ce qui t'a parlé "
            "et, surtout, ce qui t'a hérissé.", st["body"]),
        Paragraph(
            "Aucune donnée patient n'est demandée. C'est gratuit, sans engagement, "
            "et ton avis honnête vaut de l'or — les critiques encore plus que les "
            "compliments.", st["body"]),
        Paragraph("Le lien&nbsp;: <b>[LIEN DE LA DÉMO]</b>", st["body"]),
        Paragraph("Tu me dis quand tu as 30&nbsp;min&nbsp;?", st["body"]),
        Paragraph("Merci beaucoup,<br/>Sébastien", st["body"]),
    ]
]], colWidths=[166 * mm])
mail.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), IVORY),
    ("BOX", (0, 0), (-1, -1), 0.5, IVORY_LINE),
    ("LEFTPADDING", (0, 0), (-1, -1), 16),
    ("RIGHTPADDING", (0, 0), (-1, -1), 16),
    ("TOPPADDING", (0, 0), (-1, -1), 14),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story.append(mail)
story.append(PageBreak())

# ── 2. PROTOCOLE DE TEST ──
story.append(band("Section 2", "Protocole de test"))
story.append(Spacer(1, 8))
story.append(Paragraph(
    "À transmettre au médecin (ou à garder pour vous si vous l'accompagnez). "
    "Pas de préparation, pas de mode d'emploi : on veut justement voir si c'est "
    "limpide tout seul.", st["body"]))

story.append(Paragraph("Avant de commencer", st["h3"]))
story.append(bullets([
    "Se mettre dans la peau de son <b>cabinet réel</b> (répondre comme c'est vraiment, pas comme ce serait idéal).",
    "Prévoir ~30&nbsp;min au calme, sur ordinateur de préférence (le mode local utilise le navigateur).",
    "Avoir un carnet ou une note ouverte pour jeter ses réactions au fil de l'eau.",
]))

story.append(Paragraph("Le déroulé (~30 min)", st["h3"]))
story.append(bullets([
    "<b>1. Faire le check-up complet</b> — répondre à tout le questionnaire sans le survoler.",
    "<b>2. Lire la page de résultats</b> — la cartographie, la phrase d'ouverture, ce qui tient, ce qui fragilise. Prendre le temps.",
    "<b>3. Ouvrir un chantier prioritaire</b> — lire le plan d'action et regarder le schéma du chantier.",
    "<b>4. Discuter avec l'assistant</b> — lancer la discussion sur ce chantier, échanger quelques messages, aller jusqu'à la synthèse.",
    "<b>5. S'arrêter sur le bouton « En parler avec Lugia » / « Être recontacté »</b> — sans cliquer pour de vrai, se demander honnêtement&nbsp;: est-ce que je le ferais&nbsp;?",
]))

story.append(Paragraph("À noter au fil de l'eau", st["h3"]))
story.append(bullets([
    "Ce qui <b>parle</b> (« ah oui, c'est exactement ça »).",
    "Ce qui <b>hérisse</b> ou sonne faux (« non, pas du tout », « ça me parle pas »).",
    "Ce qui n'est <b>pas clair</b> (une question, un mot, un écran).",
    "Le moment où l'attention décroche, le cas échéant.",
]))
story.append(Spacer(1, 4))
story.append(quote_box(
    "À dire au médecin&nbsp;: « Je cherche ce qui <b>ne va pas</b>, pas des "
    "compliments. Sois aussi cash que possible — c'est comme ça que tu m'aides "
    "le plus. »"))
story.append(PageBreak())

# ── 3. GRILLE DE FEEDBACK ──
story.append(band("Section 3", "Grille de feedback"))
story.append(Spacer(1, 8))
story.append(Paragraph(
    "À remplir juste après le test (~5 min), à chaud. Notes de 1 (pas du tout) "
    "à 5 (tout à fait), plus une ligne libre. Le médecin la remplit seul, ou "
    "vous la remplissez ensemble au début du debrief.", st["body"]))
story.append(Spacer(1, 6))

def grid(rows):
    data = [[Paragraph("Question", st["label"]),
             Paragraph("NOTE 1-5", st["label"]),
             Paragraph("Commentaire", st["label"])]]
    for q in rows:
        data.append([
            Paragraph(q, st["q"]),
            Paragraph("1&nbsp;&nbsp;2&nbsp;&nbsp;3&nbsp;&nbsp;4&nbsp;&nbsp;5", st["scale"]),
            Paragraph("", st["small"]),
        ])
    t = Table(data, colWidths=[86 * mm, 28 * mm, 52 * mm])
    sty = [
        ("FONTNAME", (0, 0), (-1, 0), SANS),
        ("BACKGROUND", (0, 0), (-1, 0), IVORY),
        ("LINEBELOW", (0, 0), (-1, 0), 0.5, LINE),
        ("LINEBELOW", (0, 1), (-1, -1), 0.4, IVORY_LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]
    t.setStyle(TableStyle(sty))
    return t

story.append(Paragraph("Globalement", st["h3"]))
story.append(grid([
    "Le check-up était <b>clair</b> et facile à suivre.",
    "La durée était <b>acceptable</b>.",
    "À la fin, j'avais une vision plus nette de « où en est mon cabinet ».",
]))

story.append(Paragraph("Le questionnaire", st["h3"]))
story.append(grid([
    "Les questions étaient claires et je voyais pourquoi on me les posait.",
    "Lire mon cabinet en <b>3 grands axes</b> me parle (ni trop simplifié, ni trop vague).",
    "On m'a demandé <b>ma motivation</b> à faire le check-up — c'était pertinent.",
]))

story.append(Paragraph("Les résultats et le ton", st["h3"]))
story.append(grid([
    "La phrase d'ouverture des résultats sonnait <b>juste</b> (ni exagérée, ni à côté).",
    "Le ton était celui d'un <b>confrère</b>, pas d'un consultant.",
    "À aucun moment je ne me suis senti <b>jugé ou culpabilisé</b>.",
    "Les chantiers / le plan d'action m'ont paru <b>utiles</b> (pas génériques).",
    "Le <b>schéma du chantier</b> m'a aidé à voir « le quoi ».",
    "La <b>discussion avec l'assistant</b> apportait quelque chose (pas un gadget).",
]))

story.append(Paragraph("Intention", st["h3"]))
story.append(grid([
    "Je cliquerais sur « En parler avec Lugia » / « Être recontacté ».",
    "Je recommanderais ce check-up à un confrère.",
]))
story.append(Spacer(1, 6))

# Deux champs libres
free = Table([
    [Paragraph("EN UNE PHRASE — le meilleur", st["label"])],
    [Paragraph("", st["small"])],
    [Paragraph("EN UNE PHRASE — le pire / le plus agaçant", st["label"])],
    [Paragraph("", st["small"])],
], colWidths=[166 * mm], rowHeights=[12, 26, 12, 26])
free.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), IVORY),
    ("LINEBELOW", (0, 1), (0, 1), 0.4, LINE),
    ("LINEBELOW", (0, 3), (0, 3), 0.4, LINE),
    ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
]))
story.append(free)
story.append(PageBreak())

# ── 4. GUIDE D'ENTRETIEN ──
story.append(band("Section 4", "Guide d'entretien (debrief 15-20 min)"))
story.append(Spacer(1, 8))
story.append(Paragraph(
    "Trame de questions ouvertes pour l'échange après le test. À mener comme "
    "une conversation, pas un interrogatoire&nbsp;: relancer, creuser, se taire.", st["body"]))
story.append(Spacer(1, 4))
story.append(quote_box(
    "Pour l'animateur&nbsp;: <b>ne défendez pas le produit.</b> Quand le médecin "
    "critique, creusez (« qu'est-ce qui t'a fait dire ça&nbsp;? ») au lieu "
    "d'expliquer. Notez ses <b>mots exacts</b> — ce sont eux qui serviront."))
story.append(Spacer(1, 10))

def qa(num, question, relances=None):
    out = [Paragraph(f"{num}. {question}", st["qn"])]
    if relances:
        out.append(Spacer(1, 2))
        out.append(Paragraph("Relances : " + relances, st["body_i"]))
    out.append(Spacer(1, 8))
    return out

for block in [
    qa("1", "À chaud, c'était quoi ton impression générale ?"),
    qa("2", "Raconte-moi un moment où tu t'es dit « ah oui, c'est vrai, c'est exactement ça ».",
       "Sur quel écran&nbsp;? Quelle phrase&nbsp;?"),
    qa("3", "Et un moment où tu as tiqué, où tu n'étais pas d'accord, ou où ça sonnait faux ?",
       "Qu'est-ce qui t'a gêné précisément&nbsp;?"),
    qa("4", "Le ton, ça te faisait penser à qui ? Un confrère, un consultant, un coach, autre ?",
       "Trop commercial&nbsp;? Trop scolaire&nbsp;? Juste&nbsp;?"),
    qa("5", "Est-ce que les résultats reflètent vraiment ton cabinet ? Qu'est-ce qui manque ou qui est faux ?"),
    qa("6", "La promesse « savoir où en est mon cabinet » — elle est tenue, à ton avis ?"),
    qa("7", "Qu'est-ce qui te ferait — ou pas — demander un accompagnement après ça ?",
       "Qu'est-ce qui manque pour franchir le pas&nbsp;?"),
    qa("8", "À ton avis, c'est gratuit jusqu'où, et payant à partir de quoi ?"),
    qa("9", "Si tu avais une baguette magique, qu'est-ce que tu changerais en premier ?"),
    qa("10", "Tu connais un ou deux confrères à qui ça pourrait parler ?",
       "(Et&nbsp;: ok pour que je te recontacte&nbsp;?)"),
]:
    for el in block:
        story.append(el)

story.append(Spacer(1, 6))
story.append(Paragraph(
    "Après l'entretien&nbsp;: noter à chaud les 3 verbatims les plus marquants "
    "et les 3 frictions à corriger en priorité.", st["small"]))


# ── Pied de page ──
def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont(SANS, 7.5)
    canvas.setFillColor(ARGENT)
    canvas.drawString(22 * mm, 12 * mm, "Lugia & Co — Kit de test prospect")
    canvas.drawRightString(188 * mm, 12 * mm, "Confidentiel · usage interne")
    canvas.restoreState()


doc = BaseDocTemplate(
    OUT, pagesize=A4,
    leftMargin=22 * mm, rightMargin=22 * mm, topMargin=20 * mm, bottomMargin=20 * mm,
)
frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="n")
doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=footer)])
doc.build(story)
print("PDF genere:", OUT)
