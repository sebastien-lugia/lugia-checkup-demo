# Audit comparatif — page résultats V1.1.9 / V2.0 / V3-brand

Vue d'ensemble des trois versions de la page résultats du check-up Lugia, livrées le 2026-05-20 (V3-brand) après audit demandé par Sébastien.

---

## Structure d'ensemble

| Section / élément | V1.1.9 (prod) | V2.0 (prod cohabit.) | V3-brand-0 |
|---|---|---|---|
| **Hero — eyebrow** | « Résultats du check-up » | « Résultats — diagnostic V2 » | « Diagnostic complet » avec filet à droite |
| **Hero — titre** | Serif 44 px « Votre cabinet, …, Dr X » | Serif 36-44 px « Votre cabinet, vu du diagnostic, Dr X » | Serif 50 px « Votre cabinet en trois dimensions » |
| **Méta date + durée** | ✓ « Réalisé le X » | ✓ « Réalisé le X » | ✓ « Dr X · Réalisé le X · Durée Y min » (nouveau format aligné) |
| **Phrase de motivation** | ❌ | ✓ « tonality.motivation_intro » en serif italique | ✓ Phrase contextualisée à la motivation déclarée (Onest 17 px) |
| **Radar grand format** | ❌ (pas de radar — facettes textuelles) | ✓ 380×340 avec axes A/B/C labels mono | ✓ 380×340 avec labels d'axes brand, sommet à gauche (modèle cible), glow filter |
| **Analyse croisée / signal** | ❌ | ✓ SignalBanner (signal qui matche, fond crème, pas de fallback systématique) | ✓ Bloc warn ambre TOUJOURS affiché — un seul titre h2 « Analyse croisée » + body. 6 signaux + fallback. |
| **Aparté status junior/senior** | ❌ | ✓ Encart italique avec filet gauche crème | ❌ (perdu — décision à arbitrer) |
| **Cards par axe** | « Trois angles de votre cabinet » — 3 FacetCards en grille 3 cols (non dépliantes) | « Section I — Les trois axes » — 3 FacetCards en stack DÉPLIANTES (mais détail vide en V2) | 3 axis cards DÉPLIANTES (border-left axe), expand vers Forces + Marges (12 paires éditoriales) |
| **Pause narrative** | ✓ Encart `lugia-pause` arrondi bg crème entre III et IV | ❌ | ❌ |
| **Benchmarks combinatoires** | ❌ | ✓ « Section II — Repères terrain personnalisés » (BenchmarkBox ambré, source_status) | ❌ (perdu — décision à arbitrer) |
| **Opportunités** | « Trois opportunités d'action » — 3 cards | « Section III — Opportunités d'action » — 4 max avec ranking 1er/2e/3e/4e + flag « recommandé » sur la 1ère | 4 opp-cards avec icon emoji + desc raccourcie + EffortBadge (3 pips) + GainBadge (label chiffré). Pas de ranking. |
| **Tous les chantiers** | ❌ | ✓ « Section IV — Tous les chantiers » grid 2 cols | ❌ (perdu — décision à arbitrer) |
| **Prochaine étape (autonomie / Lugia)** | ✓ « Section IV — Prochaine étape ? » — 2 cards (autonomie + Lugia recommandé) | ❌ | ❌ (la 3ème carte beta sera le mode V3) |
| **CTA final** | 2 CTA dans section IV | (juste opportunités, pas de CTA-block dédié) | « Creuser un chantier » — bloc dédié avec 4 boutons d'accès rapide aux modules |
| **Sections numérotées I/II/III/IV** | ✓ Romains en marge négative + filet horizontal | ✓ Romains gros serif + titre serif | ❌ (perdu — décision à arbitrer) |

## Différences éditoriales

| Aspect | V1.1.9 | V2.0 | V3-brand |
|---|---|---|---|
| Ton | « Vous », humain, posé | Idem + ajout d'aparté status | Idem + ajout phrase encouragement (« Le profil prend forme ») |
| Synthèse globale | Section I « Ce qui ressort » (paragraphes) | Phrase de motivation + signal croisé | Phrase motivation + analyse croisée TOUJOURS |
| Lexique des niveaux | Forces / Risques par option (V1) | Solide / Confortable / Fragile / À risque | Fragile / En transition / Solide / Mature |

## Différences visuelles

| Aspect | V1.1.9 | V2.0 | V3-brand |
|---|---|---|---|
| Palette | Crème + navy + un peu d'ambre (`#f7f5ee` pause) | Crème + navy + ambre benchmarks + accent bleu (`#1a56a0`) | Navy nuit (défaut) / ivoire jour, argent signature, ambre warn fonctionnel |
| Typo | Serif + sans (Inter / Söhne) | Serif Lora + sans (Inter) | Lora + Onest + IBM Plex Mono (3 familles brand kit) |
| Forme | Cards `rounded-lg` (radius) | Cards `rounded-md`/`rounded-lg` | **Rectangulaire pur** (no border-radius hors cercles) |
| Toggle thème | ❌ | ❌ | ✓ Pill Jour/Nuit |
| Italique | Aparté en italique | Aparté en italique | **Jamais d'italique** (relais argent) |

## Ce que V3 a perdu vs V2.0

5 éléments à arbitrer pour réintégration éventuelle :

1. **Aparté tonalité status junior/senior** — utile pour personnaliser le ton selon l'ancienneté du médecin.
2. **Benchmarks combinatoires** — section dédiée aux benchmarks qui ne se déclenchent que sur certains profils (ex. volume élevé + cabinet solo).
3. **Ranking sur les opportunités** — flag « première recommandation » sur la 1ère card, numéro 1/2/3/4.
4. **« Tous les chantiers »** — accès aux 3 autres modules au-delà des 4 prioritaires.
5. **Sections numérotées I/II/III/IV** — repère structurel fort en V2, perdu en V3.

## Ce que V3 a ajouté vs V2.0

1. **Méta date + durée** (« Réalisé le X · Durée Y min ») — signal de suivi intelligent.
2. **Analyse croisée TOUJOURS affichée** (avec fallback systématique).
3. **Axis cards dépliantes avec Forces + Marges éditorialisées par niveau** (12 paires écrites, vs détail vide en V2).
4. **Phrase encourageante en transition** (« Le profil prend forme »).
5. **Toggle Jour / Nuit** (mode nuit par défaut, jour optionnel).
6. **Radar incliné** (sommet à gauche, B haut-droite, C bas-droite — modèle cible).
7. **Confidentialité explicite** sur l'intro.

