# -*- coding: utf-8 -*-
exec(open("_gen.py").read().split("# ---------- M1")[0])  # reuse palette+head/foot/esc

# ================= M2 — RUBAN (symboles au trait) =================
W,H=1180,600
s=[head(W,H,"PARCOURS · RUBAN DE CHAÎNE DE VALEUR","Charge administrative d'une consultation")]
TRAIT=NAVY; TW=1.5
# symboles au trait (forme = type) ; size ~ box 34
def g_acteur(cx,cy,op=1.0):
    return (f'<g opacity="{op}"><circle cx="{cx}" cy="{cy-7}" r="6" fill="none" stroke="{TRAIT}" stroke-width="{TW}"/>'
            f'<path d="M{cx-11},{cy+11} q11,-16 22,0" fill="none" stroke="{TRAIT}" stroke-width="{TW}"/></g>')
def g_entite(cx,cy,op=1.0): return f'<rect x="{cx-16}" y="{cy-12}" width="32" height="24" fill="none" stroke="{TRAIT}" stroke-width="{TW}" opacity="{op}"/>'
def g_stock(cx,cy,op=1.0):
    return (f'<g opacity="{op}" fill="none" stroke="{TRAIT}" stroke-width="{TW}">'
            f'<ellipse cx="{cx}" cy="{cy-9}" rx="15" ry="5"/><path d="M{cx-15},{cy-9} v18 a15,5 0 0 0 30,0 v-18"/></g>')
def g_action(cx,cy,op=1.0): return f'<rect x="{cx-18}" y="{cy-11}" width="36" height="22" rx="11" fill="none" stroke="{TRAIT}" stroke-width="{TW}" opacity="{op}"/>'
def g_decision(cx,cy,op=1.0):
    return f'<polygon points="{cx},{cy-13} {cx+17},{cy} {cx},{cy+13} {cx-17},{cy}" fill="none" stroke="{TRAIT}" stroke-width="{TW}" opacity="{op}"/>'
def g_flux(cx,cy,op=1.0):
    return f'<polygon points="{cx-12},{cy-11} {cx+18},{cy-11} {cx+12},{cy+11} {cx-18},{cy+11}" fill="none" stroke="{TRAIT}" stroke-width="{TW}" opacity="{op}"/>'
def g_contrainte(cx,cy,op=1.0):
    return f'<polygon points="{cx-10},{cy-11} {cx+10},{cy-11} {cx+16},{cy+11} {cx-16},{cy+11}" fill="none" stroke="{TRAIT}" stroke-width="{TW}" opacity="{op}"/>'
def g_frontiere(cx,cy,op=1.0): return f'<circle cx="{cx}" cy="{cy}" r="14" fill="none" stroke="{TRAIT}" stroke-width="{TW}" opacity="{op}"/>'
SYM={"acteur":g_acteur,"entite":g_entite,"stock":g_stock,"action":g_action,"decision":g_decision,"flux":g_flux,"contrainte":g_contrainte,"frontiere":g_frontiere}
zones=["environnement","participant","technologie","information","processus","produit"]
y0=130; bh=72; lblx=44; x0=190
for i,z in enumerate(zones):
    yy=y0+i*bh
    s.append(f'<rect x="40" y="{yy}" width="{W-80}" height="{bh}" fill="{PAPER if i%2 else IVORY}" stroke="{LINE}" stroke-width="1"/>')
    s.append(f'<text x="{lblx}" y="{yy+bh/2+4}" {FM} font-size="10" letter-spacing="1" fill="{INK400}">{z.upper()}</text>')
def zc(z): return y0+zones.index(z)*bh+bh/2-4
cols=[x0+i*138 for i in range(7)]
# (zone, col, type, label, opacity)
items=[
 ("participant",0,"acteur","Médecin",1.0),
 ("participant",0,"acteur","Secrétariat",0.4),
 ("technologie",0,"entite","Logiciel",1.0),
 ("technologie",3,"entite","Lecteur Vitale",1.0),
 ("processus",1,"action","Cotation",1.0),
 ("information",2,"entite","Feuille de soins",1.0),
 ("processus",3,"action","Télétrans.",1.0),
 ("environnement",4,"frontiere","Payeur",1.0),
 ("processus",4,"decision","Retour ?",1.0),
 ("processus",5,"action","Encaissement",1.0),
 ("produit",1,"flux","Documents",1.0),
 ("processus",2,"action","MAJ dossier",1.0),
 ("information",6,"stock","Dossier",1.0),
]
# slight horizontal offset when two share same cell/zone
offset={}
for z,c,t,lab,op in items:
    key=(z,c); o=offset.get(key,0); offset[key]=o+1
    cx=cols[c]+o*30; cy=zc(z)
    s.append(SYM[t](cx,cy,op))
    s.append(f'<text x="{cx}" y="{cy+27}" text-anchor="middle" {FS} font-size="10" fill="{INK600}" opacity="{op}">{esc(lab)}</text>')
# Le seul désalignement tracé : règle de cotation non documentée -> cotation
# contrainte posée au-dessus de la cotation (processus col1)
ccx=cols[1]; ccy=y0-6
s.append(g_contrainte(ccx,zc("processus")-bh*0+0,1.0)) if False else None
# place contrainte symbol in a thin band note above ruban near cotation
s.append(f'<text x="{cols[1]}" y="116" text-anchor="middle" {FM} font-size="9" fill="#7A3320">désalignement</text>')
cot_cx=cols[1]; cot_cy=zc("processus")
s.append(f'<line x1="{cot_cx}" y1="120" x2="{cot_cx}" y2="{cot_cy-12}" stroke="#7A3320" stroke-width="1.6" stroke-dasharray="4 3"/>')
s.append(g_contrainte(cols[1],108,1.0).replace(TRAIT,"#7A3320"))
# légende symboles (bas)
ly=H-46
s.append(f'<text x="40" y="{ly-12}" {FM} font-size="10" letter-spacing="1.5" fill="{INK400}">8 SYMBOLES — LA FORME DIT LE TYPE · plein = confirmé, atténué = inféré</text>')
leg=[("acteur","Acteur"),("entite","Entité"),("stock","Stock"),("action","Action"),("decision","Décision"),("flux","Flux"),("contrainte","Contrainte"),("frontiere","Frontière")]
for i,(t,lab) in enumerate(leg):
    cx=70+i*140; cy=ly+12
    s.append(SYM[t](cx,cy))
    s.append(f'<text x="{cx+26}" y="{cy+4}" {FS} font-size="11" fill="{INK600}">{lab}</text>')
s.append(foot())
open("maquette_2_ruban.svg","w").write("".join(s))
print("M2 ok")

# ================= M3 — MINI-CARTO (points par état) =================
W,H=1180,620
s=[head(W,H,"PARCOURS · MINI-CARTO DES OBJETS","Charge administrative d'une consultation")]
# points: (x,y,état,label,opacity)
P={
 "med":(250,170,"fonct","Médecin",1.0),
 "secr":(190,235,"nondoc","Secrétariat",0.45),
 "dpi":(470,150,"fonct","Logiciel métier",1.0),
 "tla":(560,205,"fonct","Lecteur Vitale",1.0),
 "regle":(230,400,"nondoc","Règles de cotation",1.0),
 "cotation":(430,360,"risque","Cotation",1.0),
 "fse":(620,310,"fonct","Feuille de soins",1.0),
 "teletrans":(640,420,"fonct","Télétransmission",1.0),
 "payeur":(880,300,"fonct","Payeur (externe)",1.0),
 "rejet":(840,430,"risque","Retour payeur",1.0),
 "suivi":(770,520,"vigilance","Reprise du rejet",1.0),
 "encaiss":(1000,440,"fonct","Encaissement",1.0),
 "docs":(380,500,"vigilance","Documents",1.0),
 "maj":(560,530,"nondoc","MAJ dossier",1.0),
 "dossier":(760,300,"fonct","Dossier patient",1.0),
}
links=[("med","dpi"),("med","tla"),("med","cotation"),("med","docs"),("med","maj"),
 ("regle","cotation"),("cotation","fse"),("fse","teletrans"),("tla","teletrans"),
 ("teletrans","payeur"),("payeur","rejet"),("rejet","suivi"),("rejet","encaiss"),
 ("maj","dossier"),("docs","dossier"),("secr","med")]
# links first (thin argent)
for a,b in links:
    x1,y1=P[a][0],P[a][1]; x2,y2=P[b][0],P[b][1]
    op=0.45 if (P[a][4]<1 or P[b][4]<1) else 1
    s.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{ARG}" stroke-width="1.1" opacity="{0.5*op}"/>')
# points
for k,(x,y,et,lab,op) in P.items():
    bg,tr,tx=ST[et]
    s.append(f'<circle cx="{x}" cy="{y}" r="10" fill="{tr}" stroke="{IVORY}" stroke-width="2" opacity="{op}"/>')
    s.append(f'<text x="{x+15}" y="{y+4}" {FS} font-size="11.5" fill="{INK600}" opacity="{op}">{esc(lab)}</text>')
# légende états
ly=H-44
s.append(f'<text x="40" y="{ly-12}" {FM} font-size="10" letter-spacing="1.5" fill="{INK400}">ÉTAT DE SANTÉ DES OBJETS · point atténué = inféré</text>')
for i,(k,(bg,tr,tx)) in enumerate(ST.items()):
    cx=70+i*180; cy=ly+10
    s.append(f'<circle cx="{cx}" cy="{cy}" r="8" fill="{tr}"/>')
    s.append(f'<text x="{cx+16}" y="{cy+4}" {FS} font-size="11" fill="{INK600}">{k}</text>')
s.append(foot())
open("maquette_3_minicarto.svg","w").write("".join(s))
print("M3 ok")
