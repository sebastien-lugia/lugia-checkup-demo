# Specs — Page résultats Lugia & Co

**Fichier de référence** : `resultats_maquette.html`  
**Stack** : HTML standalone, CSS variables, SVG DOM natif, aucune dépendance externe sauf Google Fonts

---

## 1. Charte visuelle

### Polices (Google Fonts)
```
Lora        → titres, phrases d'analyse, niveaux de maturité (jamais en italique sauf res-phrase)
Onest       → corps, descriptions, sous-titres
IBM Plex Mono → labels, eyebrows, badges, meta données
```

### Variables CSS — deux modes

**Mode nuit** (défaut, `body.night`) :
```css
--bg: #192030          /* fond page */
--navy: #fbfaf6        /* texte principal — ivoire papier, pas blanc pur */
--navy400: #6e7a95     /* texte secondaire */
--navy600: #a8b2c8     /* texte tertiaire */
--ivory: #1e2738       /* fond cards */
--ivory2: #222d3e      /* fond cards secondaires */
--argent: #8E8E91      /* neutre — traits radar, badges Optimisable */
--line: rgba(251,250,246,0.08)
--line-strong: rgba(251,250,246,0.18)
--paper: #192030

/* Axes */
--axis-a: #4aab84      /* Parcours patient — vert */
--axis-b: #5b82d4      /* Équipe — bleu */
--axis-c: #e07040      /* Outils — orange (partagé avec Critique) */
--axis-ag: rgba(74,171,132,0.12)
--axis-bg: rgba(91,130,212,0.12)
--axis-cg: rgba(224,112,64,0.12)

/* Signal croisé */
--warn: #c4a055        /* ambre doré */
--warng: rgba(196,160,85,0.10)

/* Niveaux de risque */
--risk-crit-txt: #e07040   /* Critique — orange axe C */
--risk-warn-txt: #c4a055   /* À surveiller — ambre */
--risk-opt-txt:  #8E8E91   /* Optimisable — argent */
```

**Mode jour** (`body.day`) : mêmes variables, valeurs adaptées fond clair.

### Formes
- Tous les éléments : `border-radius: 0` (rectangulaire strict)
- Seule exception : `border-radius: 2px` sur les badges SVG du radar
- Bordures : `1px solid` via `--line` ou `--line-strong`

---

## 2. Structure de la page (ordre de lecture)

```
Topbar fixe (logo + barre 100%)
│
├─ 1. HEADER
│   ├─ Eyebrow "Diagnostic complet" + trait droit
│   ├─ Titre h1 "Votre cabinet en trois dimensions" (Lora, ~40px)
│   ├─ Meta : Dr · Date · Durée (IBM Mono, uppercase)
│   └─ Phrase motivation (Lora, 16px, opacity 0.72, margin-bottom 52px)
│
├─ 2. ANALYSE CROISÉE
│   ├─ Eyebrow "Ce que révèle votre diagnostic" + trait droit
│   └─ Phrase Lora (~17px) — début neutre, fin en --warn (strong)
│
├─ 3. POINTS FORTS & RISQUES GLOBAUX
│   ├─ Eyebrow + trait droit
│   └─ Grid 2 colonnes :
│       ├─ "Ce qui tient" (vert, trait vert) — liste sans puces colorées
│       └─ "Ce qui fragilise" (rouge, trait rouge) — liste avec badges risque
│
├─ 4. RADAR + LÉGENDE
│   ├─ Eyebrow "Cartographie organisationnelle" + trait droit
│   ├─ SVG radar annoté (voir section 5)
│   └─ Légende 3 lignes sous le SVG
│
├─ 5. PAR AXE (3 cards dépliables)
│   └─ <details> natif par axe → Forces / Marges de progression + badges risque
│
├─ 6. CHANTIERS PRIORITAIRES
│   └─ 4 cards cliquables — Effort + Délai + Gain (temps + €)
│
└─ 7. CTA FINAL
    └─ Grid 2 colonnes : Autonomie (gratuit) | Lugia & Co (RDV)
```

---

## 3. Eyebrow — pattern universel

Utilisé pour toutes les sections. Structure identique partout :

```html
<p class="eyebrow"><span>Titre de section</span></p>
```

```css
.eyebrow {
  font-family: var(--mono); font-size: 10px;
  letter-spacing: 0.18em; text-transform: uppercase;
  color: var(--navy400); margin: 0 0 24px;
  display: flex; align-items: center; gap: 16px;
}
.eyebrow::after { content: ""; flex: 1; height: 1px; background: var(--navy400); opacity: 0.4; }
```

**Exceptions** :
- "Ce qui tient" → `::before` vert (`--axis-a`)
- "Ce qui fragilise" → `display:flex; align-items:center; gap:8px` + `::before` rouge (`--risk-crit-txt`)

---

## 4. Blocs de contenu

### 4.1 Phrase analyse croisée (`.phrase-choc`)

```css
.phrase-choc { margin: 0 0 48px; }
.phrase-choc-kicker { /* eyebrow standard */ }
.phrase-choc-text {
  font-family: var(--serif); font-size: clamp(15px, 1.6vw, 17px);
  line-height: 1.7; color: var(--navy); max-width: 580px;
}
.phrase-choc-text strong { color: var(--warn); font-weight: 400; }
```

**Règle** : début de phrase en `--navy`, fin clé en `--warn` via `<strong>`.

### 4.2 Bilan global (`.bilan-global`)

Grid 2 colonnes égales, gap 12px. Chaque colonne = fond `--ivory`, bordure `--line`, padding 20px 22px.

Items dans "Ce qui fragilise" portent chacun un badge risque :
```html
<span class="risk-badge crit">Critique</span>
<span class="risk-badge warn">À surveiller</span>
<span class="risk-badge opt">Optimisable</span>
```

```css
.risk-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 2px 8px; font-family: var(--mono); font-size: 9px;
  letter-spacing: 0.1em; text-transform: uppercase;
  font-weight: 600; border: 1px solid; flex-shrink: 0; margin-top: 5px;
}
.risk-badge::before { content: ""; width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
.risk-badge.crit { background: var(--risk-crit-bg); border-color: var(--risk-crit-border); color: var(--risk-crit-txt); }
.risk-badge.warn { background: var(--risk-warn-bg); border-color: var(--risk-warn-border); color: var(--risk-warn-txt); }
.risk-badge.opt  { background: var(--risk-opt-bg);  border-color: var(--risk-opt-border);  color: var(--risk-opt-txt); }
```

### 4.3 Cards axes (`.axis-card`)

`<details>` HTML natif. Chaque card :
- Bordure gauche `2px solid` couleur axe
- Summary : titre Lora coloré + niveau de maturité (mono, même couleur)
- Détail : Forces (dots colorés) / Marges de progression (dots gris + badges risque inline)

**Niveaux de maturité** : En construction / En transition / Stabilisé / Maîtrisé / Optimisé

Hover : `translateY(-1px)` + `box-shadow: 0 4px 16px -6px rgba(0,0,0,0.12)`

### 4.4 Cards chantiers (`.opp-card`)

```html
<button class="opp-card [recommended axis-b]">
  <span class="opp-card-icon">💬</span>
  <div class="opp-card-content">
    [badge ★ RECOMMANDÉ si applicable]
    <h4 class="opp-card-title">...</h4>
    <p class="opp-card-desc">...</p>
    <div class="opp-card-meta">
      <span class="meta-left">Effort <span class="effort-pips">...</span></span>
      <span class="meta-sep"></span>
      <span class="meta-delai">Délai <span class="meta-val">< 1 semaine</span></span>
      <span class="meta-sep"></span>
      <span class="meta-gain">Gain <span class="meta-val">−20 min/j</span> · <span class="meta-val">+10 k€/an<span class="meta-asterisk">*</span></span></span>
    </div>
  </div>
</button>
```

**Barre effort** : 3 traits `13×2px`, même couleur quand `.on` (`--navy` jour / `#fbfaf6` nuit).

**Gain** : toujours double — temps (`−X min/j`) + argent (`+X k€/an*`). L'astérisque renvoie à la note de calcul sous les chantiers.

**Note sous les chantiers** :
```
* Estimations calculées sur la base de votre profil cabinet (220 jours, taux horaire médecin).
```

Hover card : `translateX(2px)` + `box-shadow`

### 4.5 CTA final

Grid 2 colonnes. Carte gauche (Autonomie) + pastille "1er chantier gratuit" (argent). Carte droite (Lugia) avec bordure gauche `2px solid --navy`.

---

## 5. Radar SVG annoté

### Géométrie
```js
const W=860, H=480, CX=400, CY=240, R=155;
// Centre à ~46% de la largeur pour laisser de l'espace à gauche (annotation bc)
```

### Axes
```js
{ id:'a', angle:-90 }  // nord
{ id:'b', angle:30  }  // bas-droite
{ id:'c', angle:150 }  // bas-gauche
```

### Grille
4 niveaux (25/50/75/100%). Seul le niveau 4 a un fill léger (`gf`). Stroke fin sur 1–3, stroke légèrement plus épais sur 4.

Labels % positionnés sur l'axe nord (A), décalés de 5px à droite et 4px en haut.

### Dots radar
```js
// Cercle coloré avec glow + trou fond
el('circle', {r:'8', fill: colMap[ax.id], filter: `url(#rg${i})`})
el('circle', {r:'3.5', fill: T.bg})  // trou couleur fond
```

### Annotations — règle de construction

Chaque annotation est définie par :

| Propriété | Description |
|---|---|
| `axis` | Id axe (`'a'`, `'b'`, `'c'`, `'bc'`) |
| `anchor` | `[px, py]` — point radar exact ou midpoint |
| `side` | `'right'` ou `'left'` |
| `lineEndX` | X de fin de trait (≈ bord SVG) |
| `title` | Lora 17px gras |
| `sub` | Onest 14px |
| `badge` | Texte du badge |
| `type` | `'crit'` / `'warn'` — détermine la couleur badge |

**Alignement vertical** (tout ancré sur `lineY = anchor[1]`) :
```
lineY + 0px   → titre (dominant-baseline: middle)
lineY + 22px  → sous-titre
lineY + 48px  → centre badge
```

**Trait** : argent `#8E8E91`, `stroke-width: 0.9`, `stroke-dasharray: 3.5 3.5` — couleur découplée du badge.

**Badge couleur** : toujours par sévérité (`type`), jamais par axe.
- `crit` → `--axis-c` / orange
- `warn` → `--warn` / ambre

### Point interdépendant (midBC)
```js
const midBC = [(dp[1][0]+dp[2][0])/2, (dp[1][1]+dp[2][1])/2];
// Cercle creux argent r=6 + pastille pleine r=2.5
// Trait vers la gauche (side: 'left')
```

### Annotations actuelles (données Dr Chateau)
```js
[
  { axis:'b', side:'right', anchor:dp[1],
    title:'Rôles sans cadre formel.', sub:'Absences déstabilisantes.', badge:'Critique', type:'crit' },
  { axis:'c', side:'right', anchor:dp[2],
    title:'Logiciel sous-exploité.', sub:'Pilotage absent.', badge:'À surveiller', type:'warn' },
  { axis:'bc', side:'left', anchor:midBC,
    title:'Manque de cadre.', sub:'Charge ressentie amplifiée.', badge:'Critique', type:'crit' }
]
```

### Légende
Sous le SVG en HTML, 3 lignes verticales :
- Point glow coloré (css `box-shadow`) + nom axe (mono, `--mid`) + niveau (mono gras, couleur axe)

---

## 6. Signaux croisés — logique de sélection

7 signaux hiérarchisés, premier match affiché :

| Priorité | Condition | Titre |
|---|---|---|
| 1 | A≤1 ET B≤1 ET C≤2 | Triple faiblesse |
| 2 | C≥3 ET A≤1 ET B≤1 | Outils bons, humain fragile |
| 3 | B≤1 ET C≤1 | Surcharge administrative chronique |
| 4 | A≥3 ET B≤1 | Paradoxe : bon parcours, équipe fragile |
| 5 | C≤1 ET A≥2 | Opportunité : bonne pratique, outils faibles |
| 6 | A≥3 ET B≥3 ET C≥3 | Cabinet structuré |
| 7 | `always true` | Lecture croisée générique (fallback) |

Scores : `s ∈ {1,2,3,4}` → niveau % = moyenne × 25.

---

## 7. Topbar

Fixe, backdrop-filter blur. Barre de progression à 100% sur la page résultats.

```html
<div class="topbar">
  <div class="tb-inner">
    [logo SVG Lugia] [nom "Lugia & Co"] [sep] [label "Résultats"] [track 100%] [pct "100 %"]
  </div>
</div>
```

---

## 8. Toggle jour/nuit

Pill animée (`translateX`) via CSS, deux boutons `<button class="tg-opt day/night">`. Appelle `setTheme(t)` → `document.body.className = t` → `drawRadar()` pour recalculer les couleurs du SVG.

---

## 9. Interactions

| Élément | Comportement |
|---|---|
| Cards axes | `<details>` natif — `+` rotate 45° à l'ouverture |
| Cards chantiers | `translateX(2px)` + `box-shadow` au hover |
| Cards CTA | `translateY(-1px)` + `box-shadow` au hover |
| `.next-cta-filled` | `box-shadow: 0 0 0 1px --argent, 0 8px 24px -8px --argent` + `translateY(-1px)` |
| `.gain-pill` | `background: --ivory2` + `translateY(-1px)` au hover parent |

Toutes les transitions : `180–250ms ease-out`.

---

## 10. Points d'extension

- **Nom Dr** : hardcodé "Dr Chateau" → à remplacer par `ST.profil.nom` si collecté
- **Phrase motivation** : hardcodée → à générer depuis `ST.profil.motivation` (4 variantes)
- **Scores** : fictifs (A=68%, B=42%, C=55%) → à brancher sur `ST.scores`
- **Chantiers** : hardcodés → à filtrer dynamiquement via `OPPS` et `ST.scores`
- **Annotations radar** : hardcodées → à générer depuis les signaux `SIGNALS` et les scores
- **Gains €** : estimations statiques → à recalculer depuis `ST.profil.volume` (actes/sem)
