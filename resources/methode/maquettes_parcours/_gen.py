# -*- coding: utf-8 -*-
IVORY="#F4EFE5"; PAPER="#FBFAF6"; NAVY="#1A2333"; INK600="#3A4360"; INK400="#6E7795"
ARG="#B5B5B8"; ARGD="#8E8E91"; ARGL="#D4D4D6"; LINE="rgba(26,35,51,0.12)"
FS='font-family="Onest, -apple-system, sans-serif"'
FM='font-family="IBM Plex Mono, monospace"'
FL='font-family="Lora, Georgia, serif"'
# états: (bg, trait, texte)
ST={
 "optimal":("#F4F3F0","#1A2333","#1A2333"),
 "fonct":("#EFEFEC","#8E8E91","#3A4360"),
 "vigilance":("#EAE8DE","#6B6630","#6B6630"),
 "risque":("#E9E4DA","#7A6030","#7A6030"),
 "critique":("#E9DED8","#7A3320","#7A3320"),
 "nondoc":("#F3F3EF","#B5B5B8","#6E7795"),
}
def head(w,h,eyebrow,title):
    return (f'<svg viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" font-family="Onest, sans-serif">'
        f'<rect width="{w}" height="{h}" fill="{IVORY}"/>'
        f'<text x="40" y="46" {FM} font-size="12" letter-spacing="2" fill="{INK400}">{eyebrow}</text>'
        f'<text x="40" y="78" {FL} font-size="26" fill="{NAVY}">{title}</text>'
        f'<line x1="40" y1="96" x2="{w-40}" y2="96" stroke="{LINE}" stroke-width="1"/>')
def foot(): return "</svg>"
def esc(s): return s.replace("&","&amp;")

# ---------- M1 LOGIGRAMME ----------
W,H=1180,600
s=[head(W,H,"PARCOURS · LOGIGRAMME DE PROCESS","Charge administrative d'une consultation")]
s.append(f'<defs><marker id="ah" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="{ARGD}"/></marker></defs>')
def rrect(x,y,w,h,label,etat,rx=10):
    bg,tr,tx=ST[etat]
    return (f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{bg}" stroke="{tr}" stroke-width="1.6"/>'
            f'<text x="{x+w/2}" y="{y+h/2+4}" text-anchor="middle" {FS} font-size="13" fill="{tx}">{esc(label)}</text>')
def rect(x,y,w,h,label,etat): return rrect(x,y,w,h,label,etat,rx=2)
def diamond(cx,cy,r,label,etat):
    bg,tr,tx=ST[etat]
    pts=f"{cx},{cy-r} {cx+r*1.4},{cy} {cx},{cy+r} {cx-r*1.4},{cy}"
    return (f'<polygon points="{pts}" fill="{bg}" stroke="{tr}" stroke-width="1.6"/>'
            f'<text x="{cx}" y="{cy+4}" text-anchor="middle" {FS} font-size="12" fill="{tx}">{esc(label)}</text>')
def cyl(x,y,w,h,label,etat):
    bg,tr,tx=ST[etat]; e=8
    return (f'<path d="M{x},{y+e} a{w/2},{e} 0 0 1 {w},0 v{h-2*e} a{w/2},{e} 0 0 1 {-w},0 Z" fill="{bg}" stroke="{tr}" stroke-width="1.6"/>'
            f'<path d="M{x},{y+e} a{w/2},{e} 0 0 0 {w},0" fill="none" stroke="{tr}" stroke-width="1.6"/>'
            f'<text x="{x+w/2}" y="{y+h/2+6}" text-anchor="middle" {FS} font-size="13" fill="{tx}">{esc(label)}</text>')
def para(x,y,w,h,label,etat):
    bg,tr,tx=ST[etat]; sk=14
    pts=f"{x+sk},{y} {x+w},{y} {x+w-sk},{y+h} {x},{y+h}"
    return (f'<polygon points="{pts}" fill="{bg}" stroke="{tr}" stroke-width="1.6"/>'
            f'<text x="{x+w/2}" y="{y+h/2+4}" text-anchor="middle" {FS} font-size="13" fill="{tx}">{esc(label)}</text>')
def arrow(x1,y1,x2,y2,label=None,dash=False,thick=False):
    d='stroke-dasharray="5 4"' if dash else ''
    sw='2.4' if thick else '1.4'
    out=f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{ARGD}" stroke-width="{sw}" marker-end="url(#ah)" {d}/>'
    if label:
        mx,my=(x1+x2)/2,(y1+y2)/2-6
        out+=f'<text x="{mx}" y="{my}" text-anchor="middle" {FM} font-size="10" fill="{INK400}">{esc(label)}</text>'
    return out
# main row y=200 h=54 w=150
y=205;h=54;w=150
N={}
N['clo']=(40,y); N['cot']=(228,y); N['fse']=(416,y); N['tel']=(604,y)
s.append(rrect(40,y,w,h,"Clôture de l'acte","fonct"))
s.append(rrect(228,y,w,h,"Cotation de l'acte","risque"))
s.append(rect(416,y,w,h,"Feuille de soins","fonct"))
s.append(rrect(604,y,w,h,"Télétransmission","fonct"))
# decision
dcx,dcy=860,y+h/2
s.append(diamond(dcx,dcy,40,"Retour payeur ?","risque"))
# encaiss up-right
s.append(rrect(960,150,180,h,"Encaissement","fonct"))
# suivi rejet below
s.append(rrect(770,330,160,h,"Reprise du rejet","vigilance"))
# bottom cluster from clôture
s.append(para(228,440,170,h,"Documents associés","vigilance"))
s.append(rrect(430,440,150,h,"MAJ du dossier","nondoc"))
s.append(cyl(620,432,150,70,"Dossier patient","fonct"))
# arrows main
s.append(arrow(190,y+h/2,228,y+h/2,"produit"))
s.append(arrow(378,y+h/2,416,y+h/2,"produit"))
s.append(arrow(566,y+h/2,604,y+h/2,"alimente",thick=True))
s.append(arrow(754,y+h/2,dcx-56,dcy,"interface"))
s.append(arrow(dcx+30,dcy-18,960,178,"accepté"))
s.append(arrow(dcx,dcy+40,850,330,"rejeté"))
s.append(arrow(770,356,690,y+h,"reprise",dash=True))
# bottom
s.append(arrow(95,y+h,260,440,"produit"))
s.append(arrow(130,y+h,470,440,"produit"))
s.append(arrow(505,494,620,478,"transforme"))
s.append(arrow(360,494,628,470,"délivre"))
# légende états (bas)
lx=40;ly=560
s.append(f'<text x="{lx}" y="{ly-14}" {FM} font-size="10" letter-spacing="1.5" fill="{INK400}">ÉTATS</text>')
for i,(k,(bg,tr,tx)) in enumerate(ST.items()):
    cx=lx+i*180
    s.append(f'<rect x="{cx}" y="{ly}" width="16" height="16" rx="3" fill="{bg}" stroke="{tr}" stroke-width="1.4"/>')
    s.append(f'<text x="{cx+22}" y="{ly+12}" {FS} font-size="11" fill="{INK600}">{k}</text>')
s.append(foot())
open("maquette_1_logigramme.svg","w").write("".join(s))
print("M1 ok")
