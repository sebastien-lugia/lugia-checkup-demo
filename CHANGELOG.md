# CHANGELOG

Historique des modifications structurantes du projet, ordonnées par date décroissante.

---

## 2026-05-22 — V3-charte : alignement des dénominateurs visuels avec le routing

Le compteur footer affichait `6 / 9 réponses` pour un profil routé (vrai dénominateur visible : 6). Refactor pour que **tout l'écosystème visuel** (compteur footer, completeness, barre Topbar, radar live, transitions) utilise le même dénominateur — celui des questions effectivement présentées au médecin après application du routing solo / non-solo / secrétariat.

- **`filterQuestionsByRouting`** déplacé de `screens_blocs.tsx` vers `lib/v3/protocol_data.ts` (utilitaire partagé) — `screens_blocs.tsx` consomme l'import.
- **Compteur footer bloc** : `bloc.questions.length` → `visibleQuestions.length` (ligne 402 de `screens_blocs.tsx`).
- **`buildLocalScores`** dans `app/checkup/v3-charte/page.tsx` accepte désormais `cabinetType / secretariat / paramedicalTeam` et filtre les questions avant de calculer `completeness`. Avant ce fix, `completeness` ne pouvait jamais atteindre 1 pour les profils filtrés (ex : 6/9 = 0.67), ce qui cassait silencieusement `isBlockComplete`, le radar `numScoresIfComplete`, et la barre Topbar.
- **`UserProfile`** (`lib/api.ts`) : ajout du champ `secretariat?: string | null` — le backend ignore les champs non reconnus, on ne casse pas V1.x / V2.0.
- **`STEP1_REQUIRED`** (`lib/v3/state.ts`) : ajout de `secretariat` → 6 chips étape 1 (au lieu de 5). `V3_TOTAL_PROGRESS_STEPS` passe de 28 à 29 micro-étapes. Commentaires arithmétiques de `stepProgressLowerBound` / `stepProgressUpperBound` actualisés.
- **Validation manuelle** : 6 profils testés (`solo isolé`, `solo + paramédical`, `solo + secrétariat`, `cabinet groupe`, `cabinet groupe seul`, `MSP complète`). 4 profils donnent exactement 6 questions par bloc B, 2 edge-cases en donnent 5 — désormais affiché honnêtement comme `x / 5` (cohérent avec la règle "6 max par bloc").

### Bloc B — labels resserrés en 1 ligne (12 réécritures)

Pari de lisibilité : faire tenir chaque option en une ligne (≤ 82 caractères à Onest 13 px sur 582 px utiles) sans diluer le message. b1_b, b1_d, b3_a, b3_d, b4_d, b5_a, b5_c, b7_a, b7_c, b7_d, b9_d, b10_d réécrits. Cas extrêmes assumés sur 2 lignes uniquement quand la précision pédagogique l'exige.

### Bloc C — labels resserrés (11 réécritures) + Q04 et Q06 réorganisées

- Suppression du palier irréaliste « Aucun outil numérique » sur Q04 outils numériques (carte Vitale obligatoire pour tous) ; ajout d'un palier intermédiaire « J'ai testé quelques outils en plus… sans régularité » entre « par obligation » et « activement plusieurs ».
- Q05 et Q06 harmonisées en « Je » : c5_b, c5_c, c6_d repassent en première personne — cohérence d'écriture sur les 4 options de chaque question.
- « workflow » remplacé par « organisation » dans 6 occurrences du bloc C (c1_d, c4_d, c5_d).
- Contexte de Q06 (conformité) condensé de 127c → 30c : « RGPD, HDS, DMP, CCAM, MSSanté… » (au lieu d'une énumération exhaustive).

### Harmonisation POV médecin — passage en « Je » de 7 labels supplémentaires

b7_c, b7_d, b9_d, b10_d, c2_c, c2_d, c4_d réécrits en première personne pour éviter les débuts nominaux (« Trame cohérente », « Dossiers structurés », etc.) qui faisaient moins naturels et créaient une inhomogénéité dans les questions où les autres options étaient déjà en « Je ».

### Page transition après bloc C

- « Bloc 1/2/3 terminé » → « Bloc A/B/C terminé » (cohérent avec l'eyebrow `Q06 · BLOC B` des questions).
- nextBlocLabel « Votre profil et trois leviers à votre main » → « Votre profil et les actions à votre portée » (suppression d'une formulation inexacte — la page résultats affiche jusqu'à 4 chantiers, pas 3).

### Page résultats — entête + back + lisibilité radar

- Ajout de l'IntroHeaderShortcuts (Mon compte / email / Se déconnecter), de la Topbar (progression 100 % avec étiquette « Résultats ») et d'un bouton « ← Précédent » discret en haut de la page (pattern aligné sur ListChantiersV3) qui ramène à `transition_C`.
- Eyebrow « DIAGNOSTIC COMPLET », « CARTOGRAPHIE ORGANISATIONNELLE » et « PROCHAINE ÉTAPE » repassées en variante « petit trait à gauche » (alignement sur l'eyebrow d'accueil). Les autres eyebrows de la page (axes A/B/C) conservent le filet à droite par contraste.
- Radar grand format enrichi : labels CLIENTS / ÉQUIPE / OUTILS aux 3 vertices (alignés sur le radar live du parcours, décalage vertical -18 px sur A pour éviter la collision avec la ligne d'annotation BC), phrase de lecture sous l'eyebrow (« Plus chaque axe s'éloigne du centre, plus l'organisation est mature sur cet aspect. »), échelle simplifiée à 100 % seul (suppression des 25/50/75 flottants).
- Section dédiée « Votre motivation de départ » créée autour de la motivPhrase (eyebrow + filet à droite, même pattern que « Ce que révèle votre diagnostic »). Taille typo alignée sur la PhraseChoc (clamp 15-18 px) avec opacité 0.72.
- Items Forces & Pistes d'actions explicitement en `fontFamily: fonts.sans` (avant : héritage Lora du parent).
- Renommage : « Marges de progression » → « Pistes d'actions », hint dépli « ↓ Forces & pistes d'action » → « ↓ Cliquer pour Forces et pistes d'actions ».

### RiskBadge — 3 niveaux différenciés visuellement

- Le 3e niveau `opt` « OPTIMISABLE » (palette argent neutre) est exposé via 3 items de démo (un par axe) — il était dans le type mais pas dans les démo-data.
- `warn` désaturé par transparence sur les 3 dimensions (texte ~69 %, bg ~6 %, border ~25 % via suffixes hexa) pour créer un écart visuel net avec `crit` qui reste pleine intensité signalWarn.
- Suppression du `marginTop: 5` qui poussait la pastille vers le bas → remplacé par `verticalAlign: "middle"` pour alignement propre sur la baseline du texte voisin.

### Page chantier — mini-encart « Avec Lugia » + KPIs en langage naturel

- Mini-encart « AVEC LUGIA » ajouté en bas de chaque feuille de route (D-035) : 7 textes spécifiques (un par chantier), ton respectueux de l'autonomie (« Lugia peut… »), filet argent à gauche pour signaler visuellement que c'est une option, pas un avertissement.
- Footnote « * Estimations calculées sur la base de votre profil cabinet… » déplacée depuis la page résultats vers le ChantierHeader de la page détail (cohérent : le `*` apparaît dans la même vue que sa note). Taille 9 px → 11 px pour la lisibilité.
- KPIs EFFORT / DÉLAI / GAIN reformulés en langage naturel via un transform de présentation (« Facile à mettre en place. », « Quelques jours suffisent. », « Environ 20 minutes libérées par jour, soit ~10 k€ par an. ») — le catalogue `opps_catalog.ts` reste structuré pour radar/tri/agrégation.
- Filet sous le titre + borderTop du ChantierHeader retirés (header plus aéré). Description de l'effort 18 px → 15 px (cohérence avec les 2 autres lignes). Couleur de l'effort harmonisée sur navy plein.
- StepCard : background `palette.ivoryLight/ivory` + border retirés → étapes en transparent sur fond paper (lecture épurée).

### Console errors — 6 conflits `border` shorthand + `borderLeft` longhand

React 18 / Next 16 warning « Updating a style property during rerender (border) when a conflicting property is set (borderLeft) ». Migration de 6 endroits vers la forme longhand explicite (`borderTop` + `borderRight` + `borderBottom` + `borderLeft`) : `app/checkup/v3-charte/error.tsx`, `components/v3/ModuleV3.tsx`, `components/v3/ResultatsV3.tsx` (3 occurrences), `components/v3/ListChantiersV3.tsx`. Les fichiers `v3-snapshot/*` (route gelée) conservent les conflits — cohérent avec le pattern de cohabitation.

### Branchement éditorial dynamique de la page résultats (A.1)

- `pickSignal(scores)` et `getAxisDetail(axis, level)` désormais branchés dans `page.tsx`. Plus de phrase choc / bilan / annotations radar / axis details en dur — tout vient des fichiers `lib/v3/signals_data.ts` et `lib/v3/axis_details_data.ts`.
- 6 signaux conditionnels + 1 fallback couvrent 64 combinaisons de niveaux (4^3) ; 12 axis details (3 axes × 4 niveaux) alimentent les cards dépliantes.
- Validation simulation : 5/6 profils types hitent un signal spécifique, 1/6 le fallback.

### Phrase choc personnalisée par motivation + status + énergie (A.1bis)

- `buildPhraseChoc({signal, motivations, status, energy})` dans `signals_data.ts` compose un opener qui contextualise le diagnostic avec :
  - motivations multi-select (charge / evenement / risque / curiosite) — gère 1, 2, 3+ motivations naturellement
  - status d'exercice (recent / installe / senior) — préfixe « Cabinet récent — », « Cabinet installé — », « Avec votre expérience d'exercice — »
  - énergie (4 paliers) — clause adaptive « avec une énergie qui tient le rythme » à « à un moment où l'énergie est sur le fil »
- Le cœur diagnostic des 7 signaux reste inchangé ; seul l'opener varie. Option (A) validée — pas d'explosion combinatoire.

### Estimations gain € calculées depuis le profil (A.1ter)

- Formule : `gainEuros_an = gainTime_min/j × 220 × (70/60) × 0.7 × volumeFactor` (taux horaire 70 € TTC, 70 % réinvesti, 220 j/an, factor volume lt_80=0.8 / 80_120=1.0 / gt_120=1.25).
- Les anciennes valeurs `gainEuros` du catalogue (souvent ×3 supérieures) sont retirées : `computeGainEurosPerYear` calcule dynamiquement. `formatGainEuros` formate en français (« 3 600 € » / « 12,4 k€ »).
- Footnote du chantier reformulé honnêtement : « *Estimation à partir de votre volume hebdomadaire — taux horaire 70 € TTC, 220 jours/an, 70 % du temps libéré réinvesti.* »

### Comparatif Autonomie vs Avec Lugia sur chaque chantier (D-036)

- ChantierHeader remplacé par un tableau 2 colonnes : Gain attendu × Délai × Votre temps × Taux d'aboutissement, comparant « En autonomie » et « Avec Lugia ».
- Probabilités par chantier (auto 15-35 %, lugia 75-85 %) issues de la littérature change management organisationnel. Effort cumulé : effort 1 → 6 h auto / 2 h lugia, effort 2 → 15 h / 4 h, effort 3 → 30 h / 7 h. Délai autonomie = catalog × 1.5.
- `tauxToRatio(p)` produit du « 1 cabinet sur 7 » / « 4 cabinets sur 5 » selon la probabilité.
- StepCard du plan d'action transparente sans bordure (épure post charte).
- Mini-encart « Avec Lugia » conservé en bas du chantier (D-035), reformulé pour 7 chantiers spécifiques.

### Calendly branché et configuré (C.1)

- URL Calendly réelle posée par défaut : `https://calendly.com/sebastien-lugia/30min`.
- Override possible via env var `NEXT_PUBLIC_LUGIA_CALENDLY_URL`.
- Tracking automatique : `utm_source=v3-charte`, `utm_content=<module_id>` quand vient d'un chantier, `name=<firstname>` pour pré-remplir le prénom.
- `.env.local.example` documenté.

### Persistance refresh complète (E.3 — 4 fixes successifs)

Bootstrap V3-charte hydratait mal la session au refresh. Fix complet :

1. **`extras` hydraté** depuis `userProfile` à chaque bootstrap (sinon chips profil pages 1-2 vides au refresh).
2. **`resumeStep` appelé** au bootstrap pour calculer le bon step à partir des données chargées (avant : restait sur "intro" indéfiniment).
3. **URL `?step=` étendue** aux transitions A/B/C + résultats + module détail + liste complète des chantiers. Validation cohérence systématique (completeness ≥ 1 avant d'autoriser une page enfant de résultats).
4. **Thème persisté en localStorage**, et auto-bascule Day vers livrable « gated » par hydrationSnapped pour ne pas écraser la préférence utilisateur au refresh.

### Backend V3-charte aligné (E.1 / E.2)

- `secretariat` ajouté à `UserProfile` (Pydantic) + colonne `user_profile.secretariat` + migration auto + `USER_PROFILE_V2_FIELDS`.
- `interview_protocol_v3.json` créé (21 questions structurelles : 6A + 9B + 6C, routings has_team / secretariat / cabinet_type).
- `src/v2/questions.py` étendu avec `load_protocol(version)` multi-version, helpers `_has_team`, `_secretariat_is_seul`, `_paramedical_is_none`, `_check_routing` (6 strings supportés), `get_visible_questions(block_id, profile, protocol_version)`.
- `src/v2/scoring.py` : `score_block` et `compute_all_scores` acceptent `protocol_version`.
- `backend/main.py` : les deux endpoints `v3-brand-0` (scores + report) passent `pv` au scoring.
- Tests Python : 2 profils contrastés (solo isolé / cabinet groupe) donnent les 6 bonnes questions B chacun.

### Refonte pages auxiliaires charte V3 (B.1 / B.2 / B.3 / B.4 / B.5)

- **`/login`** : refonte complète palette navy/ivoire, Lora/Onest/Mono, ThemeToggle, brand mark navy plein. Logique magic link préservée.
- **`/le-checkup`** (anciennement `/presentation` qui devient un alias redirect 308) : titre « Le check-up préventif. », sections approche / 3 axes BlocBadges / 4 principes / rythme. Eyebrow « Méthode ».
- **`/notre-accompagnement`** (nouveau) : contenu médecin-centric, mission + positionnement + méthode + 4 engagements. Eyebrow « Une offre sur mesure ».
- **`/lugia`** (À propos de Lugia & Co) : contenu vision élargie d'après brief utilisateur — mission entreprises toute taille, approche progressive, différenciation (vs consulting / vs SaaS / techno au service du métier), à qui s'adresse Lugia (4 profils-cibles), engagements, phrase d'engagement avec filet argent (pas d'italique).
- **`/compte`** : refonte 4 vues (loading / deleted / onboarding / default). Zone de suppression passée du rouge agressif vers le signalWarn ambre charte. Encart « Notre engagement » filet argent au-dessus. État ✓ Enregistré après save firstname.
- **`/legal`** : 6 sections RGPD, listes ListItem argent.
- **`/confidentialite`** : 11 sections RGPD. L'unique `<em>` interdit par la charte remplacé par `<strong>`.
- **Bouton retour ← Retour** discret en haut des pages auxiliaires (history.back() avec fallback `/`).
- **Header** repensé : 3 liens « LE CHECK-UP / NOTRE ACCOMPAGNEMENT / À PROPOS DE LUGIA & CO » dans AppHeader (Tailwind, home) et version compactée « Le check-up · Notre accompagnement · À propos » dans IntroHeaderShortcuts (mono caps 9px).

### Topbar ajustements

- Séparateur vertical entre logo et chapter label retiré.
- maxWidth interne 720 → 680 puis aligné avec le bloc central de contenu (margin 0 auto).
- paddingRight 160 pour éviter le chevauchement avec IntroHeaderShortcuts sur viewports moyens.
- Logo cliquable → router.push("/") avec aria-label.
- Email caché par défaut dans IntroHeaderShortcuts pour libérer la place des 3 nouveaux liens.

### Cleanup home (F)

- Lien visible vers `/checkup/v3-snapshot` retiré de la home. Le code V3-snapshot (8700 lignes) reste accessible via URL directe pour démo localhost (commentaire dans le code).

### Export PDF des chantiers (H.4)

- Backend `reportlab>=4.0` ajouté. `src/pdf_exporter.py` (~280 lignes) génère le PDF d'un chantier avec polices natives Helvetica/Times et palette charte Lugia.
- Structure : en-tête marque + plan d'action + mécanique + comparatif Auto/Lugia tableau + 4 étapes + encart Avec Lugia + données terrain + footer (lugia.fr + page X).
- Endpoint `GET /interviews/{id}/modules/{module_id}/pdf` avec auth + ownership check.
- Frontend `downloadChantierPdf(interviewId, moduleId)` dans `lib/api.ts` + bouton « Télécharger en PDF » à côté de « Imprimer » sur ModuleV3.

### Assistant Lugia — chat 4 phases structurées (A.2 + A.2 v2, D-036)

- `anthropic>=0.40` ajouté. Modèle Claude Haiku 4.5.
- **System prompt 5 tours structurés** (inspiré du wireframe utilisateur) :
  - T1 : ouverture par question ouverte + 3 suggestions SUGG_JSON
  - T2-T3 : reformulation + creusement + 3 suggestions
  - T4 : récap + plan d'action PLAN_JSON 3-4 étapes + 3 suggestions
  - T5 : clôture personnalisée + END_CONVERSATION:true (pas de suggestions)
- 7 règles absolues : pas de conseil médical, pas de données patient, pas de jargon consulting, pas de morale, ton confrère, une question à la fois, vouvoiement.
- **Parsing structuré côté backend** (`parse_assistant_reply`) : 3 regex extraient suggestions / plan / ended du raw Claude. Renvoie un dict typé.
- **Persistance complète** : table `chat_message` (id, interview_id, module_id, email, role, content, created_at). Le contenu assistant inclut un suffixe `\n\n__LUGIA_META__:{json}` pour préserver les métadonnées (suggestions/plan/ended) à travers le reload.
- **Rate limiting** : 20 messages user max par conversation (HTTP 429 si dépassé). 1 conversation par chantier (groupée par (interview × module × email)).
- **Modal plein écran frontend** (`ChatChantierModal.tsx`) :
  - Auto-init au 1er ouvrir (envoie automatiquement « Je veux creuser le chantier : X »).
  - Suggestions cliquables (3 boutons sous le dernier message assistant).
  - Carte plan d'action structurée avec numéro + titre + body + tag temporel.
  - État clôturé : footer « Conversation clôturée » avec CTAs Calendly + Retour, input désactivé.
  - Compteur visible dans le header + récap en bas.
- **Bouton « Discuter avec l'assistant »** sur la page chantier (argent, distinctif).
- Responsive : padding réduit sur ≤640px (header / list / footer).

### Guide de relecture pour testeurs (G.1)

- `resources/v3_charte_review_guide.md` (189 lignes, 8 sections) : profils recherchés, parcours à dérouler, points à valider/invalider (ton, routing, comparatif, chantiers), template de retour structuré, cadre RGPD.

---

## 2026-05-21 — V3-charte : audit règle par règle contre la charte d'application questionnaire v1.0

Audit méthodique des 45 règles de la charte v1.0, regroupées en 10 axes A-J. Méthode : présentation règle par règle → analyse → proposition → validation utilisateur → correction. Toutes les corrections appliquées sur la route active `/checkup/v3-charte` (la version pré-charte reste accessible en lecture sur `/checkup/v3-snapshot`).

### Axe A — Palette & couleurs (3 lots)

- **Lot 1** — Suppression complète des couleurs d'axes vert/bleu/orange. `dayAxes` et `nightAxes` aplaties sur argent uniforme (`A = B = C = #B5B5B8`). Refactor 7 usages dans `ResultatsV3.tsx`, 1 dans `ModuleV3.tsx`, propagation automatique sur radars et axis cards.
- **Lot 2** — Consolidation `signalWarn.default` sur `#C8A04A` (charte). Suppression des 5 valeurs candidates héritées de T-V3-1 (terreux/brûlé/saturé).
- **Lot 3** — Alignement variants navy : `navy = #1A2333`, ajout `navy3 = #2D365A` (token charte manquant). Surfaces Nuit : `paper = #1A2333`, `ivory = #232B41` (navy-2), `ivory2 = #2D365A` (navy-3).
- **Page résultats — solution visuelle Forces/Risques** : remplacement des pastilles vertes/oranges par filets argent (Forces) et `signalWarn` (Risques) + labels mono caps. Pastille « Recommandé pour commencer » passe en argent neutre. RiskBadge `crit` unifié sur `signalWarn`.

### Axe A1-bis et A1-ter — Ajustements post-test visuel

- **RadarLiveV3** refonte : labels PARCOURS/ÉQUIPE/OUTILS posés sur les 3 angles du triangle, retrait de la liste de niveaux qualitatifs en dessous, viewBox élargie pour éviter le truncate de PARCOURS, restauration du titre PROFIL EN COURS. Container passé à 260 px de large.
- **Cartes chantier** (`ListChantiersV3` + `ResultatsV3`) : retrait des emojis à gauche, suppression du bloc EFFORT/DÉLAI/GAIN, ajout d'un tag temporel `RAPIDE / POSÉ / APPROFONDI` (palette navy / argentDeep / signalWarn). POSÉ utilise `argentDeep` pour rester lisible sur fond ivoire en Mode Jour.
- **Page module** : retrait de l'emoji devant le titre, ajout d'un `ChantierHeader` avec EFFORT/DÉLAI/GAIN en 3 lignes verticales (label mono 11 caps + valeur Onest 16 px / 500). Effort visualisé par 3 segments 22×3 px.
- **Page résultats — radar grand format** : trou central des points argent retiré (les points deviennent des disques argent pleins), légende sous le radar supprimée (les AxisCards en dessous suffisent).
- **Page transition entre blocs** : ajout du titre h1 « Bloc X terminé. » sous le logo, score cards repassées en `palette.ivory2 + lineStrong` pour visibilité Mode Jour, niveau de maturité passé en Lora navy 500 22 px.

### Axe B — Modes Nuit / Jour

- **B2 — Bascule auto vers Day** : effect React qui détecte l'entrée sur les écrans livrables (`step === "resultats"`, `listChantiersOpen`, `openModuleId`) et bascule le thème vers Day une seule fois (via `useRef`). Toggle utilisateur préservé.
- **B3** — 0 gradient navy↔ivoire dans le code, 0 mix Day/Night dans une même vue. Cleanup `error.tsx` : alignement `#192030`→`#1A2333` et warn rgba.
- **B6 — Logo Lugia** : wordmark « Lugia & Co » retiré de la Topbar (picto seul). SVG monochrome qui hérite de `palette.navy` → s'inverse automatiquement Day/Night.

### Axe C — Encodage des blocs (badges A/B/C)

- Création de l'atome `<BlocBadge id="A|B|C" theme size="sm|md" />` dans `atoms.tsx` :
  - A : fond `#232B41` (navy-2), lettre ivoire
  - B : transparent, bordure `argent` ou `argentDeep` selon mode, lettre argent
  - C : Nuit = fond ivoire/lettre navy. Jour = inversion fond navy/lettre ivoire (sinon invisible sur fond ivoire).
- **Effet de reflet argent au survol** : CSS `::before` avec gradient blanc translucide (rgba 0.32) qui glisse en 720 ms (cubic-bezier ease-out). Respecte `prefers-reduced-motion`.
- Injecté à 4 endroits : transition score cards, AxisCard, OppCard (résultats), ChantierCard (Tous les chantiers).

### Axe D — Polices

- **D5** — Reset CSS global ajouté à `app/globals.css` : `em, i, cite, address { font-style: normal; }`. Verrouillage italique à 3 niveaux (inline + reset + token).
- D1-D6 conformes par construction (Lora sur titres de page validé en option a — D-031 #1).

### Axe E — Échelle typographique

- Consolidation 13 → 11 tailles (toutes alignées charte) :
  - `8 → 9` (1), `12 → 11` (6), `17 → 18` (6), `16 → 18` (3 instances texte)
  - Le `<span fontSize: 16>+</span>` UI dans ChipsField laissé (symbole icône)
- Clamps responsive alignés sur bornes charte : `(14-17)→(14-18)`, `(15-17)→(15-18)`, `(22-26)→(22-28)`, `(28-36)→(28-32)`, `(32-40)→(32-48)`, `(34-54)→(32-56)`.

### Axe F — Voix & ton

- **F3 vocabulaire** : 7 remplacements (`optimisation/optimiser → réglage/rodé/fluidifier`, `KPI → indicateurs`, `écosystème → numérique`).
- **F1 conditionnels → affirmatif** : 10 reformulations dans benchmarks et signaux (`pourraient être X → sont X-ables`).

### Axe G — Anatomie de la question

- **G3 contexte** : Mono 11 → **Lora 15 / lh 1.45** + filet gauche conservé.
- **G4 reformulation** : ajout `fontFamily: fonts.serif` + `fontSize: 15 / lh 1.55` + filet argent (au lieu de filet axe-coloré) + texte navy (au lieu d'axisColor).
- **G5 benchmark** : Mono 11 → **Onest 13 / lh 1.6** + surface warn + filet 2 px warn.
- **G6 container** : padding 24 → **28** (charte).
- **G7 numéro** : `Q1` → **`Q01 · Bloc A`** en Mono caps 11 px / 0.16em.
- **G1 — 3 questions reformulées** : b5 (ajout `?`), b6 et b7 (raccourcies + détails en `context`).

### Axe H — Composants

- **H1 — Bouton primaire** : statu quo Onest 14 (option a, lisibilité web-standard préférée à mono 11 caps).
- **H3 — Chips profil** : `fontFamily: fonts.mono`, `fontSize: 13`, `padding: 9px 18px`, `letterSpacing: 0.02em`.
- **H8 — État loading** : création de l'atome `<TypingDots>` (3 cercles argent 6 px, animation `v3DotPulse` 1200 ms avec décalage de 200 ms, respect `prefers-reduced-motion`). Early return dans la route v3-charte quand `isHydrating` est vrai.

### Axe I — Forme & traitement visuel

- **I2 — D-034 écart documenté** : conservation des 14 hover box-shadows sur les cartes cliquables (affordance interactive). Statu quo motivé par UX feedback.
- I1, I3, I4, I5 conformes.

### Axe J — Iconographie

- **Suppression des champs `icon` / `icone` orphelins** : retrait du type et des 14 entrées dans `opps_catalog.ts` et `modules_data.ts` (déjà débranchés en A1-bis, dette technique nettoyée).
- J2 numérotation `01-07` paddée déjà conforme.

### D-034 (nouvelle décision)

Conservation des box-shadows hover sur les cartes cliquables comme exception charte I2 — affordance interactive forte sur les CTA. À revisiter si le pilote terrain (T7) le justifie.

### Vérifications

- `npx tsc --noEmit` : 0 erreur applicative à chaque palier
- 0 italique dans le code applicatif, 0 emoji rendu, 0 couleur d'axe vert/bleu/orange, 0 conditionnel `pourrait/seraient` dans les fichiers data, 0 mot interdit (optimiser, KPI, écosystème) dans les fichiers data
- 11 tailles typo distinctes, toutes alignées charte
- 4 badges `BlocBadge` injectés (transition + axis card + 2× cartes chantier)
- 1 atome `TypingDots` créé
- Reset CSS `em, i, cite, address { font-style: normal; }` ajouté à `app/globals.css`

---

## 2026-05-21 — V3-charte-snapshot : gel pré-charte + cohabitation v3-snapshot / v3-charte

Avant d'attaquer la refonte selon la charte d'application questionnaire v1.0, on gèle l'état actuel V3-brand pour conserver une version comparable. La route active migre en `/checkup/v3-charte`, et la version pré-charte reste accessible en lecture sur `/checkup/v3-snapshot`. Backend inchangé : `protocol_version="v3-brand-0"` reste l'identifiant en BDD pour les deux routes.

### D-033 — Cohabitation v3-snapshot / v3-charte

Pattern déjà éprouvé sur V1.1.9 ↔ V2.0 ↔ V3-brand : on duplique côté frontend (composants, lib, route) pour permettre la comparaison côte à côte pendant la refonte. Backend partagé car la charte est essentiellement un travail visuel/typographique (le scoring, les blocs A/B/C, le protocole sont inchangés).

### Livrables

| Livrable | Description |
|---|---|
| `web/components/v3-snapshot/` | 11 fichiers (`atoms.tsx`, `ChipsFieldV3.tsx`, `ListChantiersV3.tsx`, `ModuleV3.tsx`, `RadarLiveV3.tsx`, `RadarResultV3.tsx`, `ResultatsV3.tsx`, `screens.tsx`, `screens_blocs.tsx`, `ThemeToggleV3.tsx`, `Topbar.tsx`). Copie figée des composants v3 pré-charte. Imports internes réécrits pour pointer vers `@/components/v3-snapshot/` et `@/lib/v3-snapshot/`. |
| `web/lib/v3-snapshot/` | 9 fichiers (`axis_details_data.ts`, `links.ts`, `modules_data.ts`, `opps_catalog.ts`, `opps_data.ts`, `protocol_data.ts`, `signals_data.ts`, `state.ts`, `tokens.ts`). Copie figée de la lib v3 pré-charte. |
| `web/app/checkup/v3-snapshot/` | Copie figée de la route (`page.tsx`, `error.tsx`), imports pointant vers les copies snapshot. |
| `web/app/checkup/v3-charte/` | Route active renommée depuis `v3-brand`. Imports inchangés vers `@/components/v3/` et `@/lib/v3/` (qui évolueront avec la charte). |
| `web/app/checkup/v3-brand/page.tsx` | Alias rétro-compatible : redirige vers `/checkup/v3-charte` en préservant la query string (`interview=`, `view=`, etc.). Garantit que les signets et URL partagées avant la bascule continuent de fonctionner. |
| `web/app/page.tsx` | Liens des handlers `handleStartV3` / `handleResumeV3` pointent maintenant vers `/checkup/v3-charte`. Ajout d'un lien discret en-dessous des 3 cartes vers `/checkup/v3-snapshot` pour accès à la version pré-charte. La clé backend `actives["v3-brand-0"]` reste inchangée (protocol_version BDD). |

### Vérifications

- 32 réécritures d'imports dans 22 fichiers (composants + lib + route snapshot).
- Aucun import croisé v3 ↔ v3-snapshot (vérifié par grep dans les deux sens).
- `npx tsc --noEmit` : aucune erreur applicative (seul bruit résiduel : artefacts `.next/types/*d 2.ts` stale).
- Empreinte disque : ~25 fichiers dupliqués, taille négligeable (~150 ko).

### Prochaine étape

Démarrage de la passe règle par règle contre la charte (45 règles extraites, regroupées en 10 axes A-J). Première règle traitée : A1 — palette autorisée.

---

## 2026-05-20 — V3-brand : amorçage (D-031 + T-V3-1 tokens design)

Amorçage de la V3-brand — 3ème carte « beta » alignée brand kit Lugia (cf D-031).

### D-031 — 9 arbitrages de cadrage figés

Familles typo (2 éditoriales + mono utilitaire), proportions de surface différenciées jour/nuit, ambre promu `--signal-warn` (token fonctionnel séparé avec 3 règles intangibles), niveaux V2.0 conservés (« Fragile / En transition / Solide / Mature »), scoring backend en % + rendu V3 en niveaux 0-3, topbar 28 micro-étapes avec étiquette de chapitre, analyse croisée toujours affichée, angles radar -90°/30°/150°, route séparée `/checkup/v3-brand` avec `protocol_version = "v3-brand-0"` et cohabitation V2.0 maintenue.

### V3-brand-T-V3-1 — Tokens design + test lisibilité ambre

| Livrable | Description |
|---|---|
| `web/lib/v3/tokens.ts` | 341 lignes — palette jour + nuit, polices, axes A/B/C, signal-warn (avec usages canoniques typés), shimmers, échelle typo, niveaux, angles radar, helper `paletteFor(theme)`, fonction `levelOf(score)` 0-3. Compile sans erreur (`tsc --noEmit`). |
| `wireframes/v3_tokens_ambre_test.html` | Page autonome qui compare 3 candidats `--signal-warn` (terreux #7a6030/#c4a055 = modèle cible, brûlé #b5780a/#d68f1a, saturé #c8851a/#e8a035) sur les deux surfaces canoniques (jour ivoire + nuit navy), avec 4 composants en contexte : benchmark critique, chip signal, titre de module à fort enjeu, recommandation sur surface diluée. Valeur de départ retenue dans tokens.ts : **terreux** (modèle cible). À substituer en T-V3-1 fin si Sébastien préfère brûlé ou saturé. |


### V3-brand-T-V3-2 — Atomes partagés livrés

| Livrable | Description |
|---|---|
| `web/components/v3/atoms.tsx` | 377 lignes — DVMono, DVCorners, LevelBar (avec variantes colorées par axe), EffortBadge (low/med/high), GainBadge (fast/mid/slow), Em (argent/warn — relais visuel à l'italique interdit), Divider, SurfaceShimmer. Tous consomment `paletteFor(theme)`, aucun ne code en dur une couleur. Compile sans erreur. |
| `wireframes/v3_atoms_test.html` | 453 lignes — vue côte à côte mode jour / mode nuit des 8 atomes, avec démos de cas réels (benchmark, citations du brand-master en emphase argent ou warn). |

Règle « jamais d'italique » du brand-master encodée à 3 endroits : reset CSS global dans les pages standalone, `fontRules.italicAllowed: false` dans les tokens, `fontStyle: "normal"` explicite dans Em. Mémoire mise à jour (`feedback-brand-lugia-pas-d-italique`).


### V3-brand-T-V3-3 — State machine V3 (28 micro-étapes)

`web/lib/v3/state.ts` (391 lignes, compile vert). Indépendant de `lib/v2/state.ts` — les deux machines cohabitent comme prévu D-031 #9.

| Apport vs V2.0 | Détail |
|---|---|
| `V3_TOTAL_PROGRESS_STEPS = 28` | 5 chips profil step1 + 4 chips step2 + 1 énergie + 3 blocs × 6 questions. Constante dérivée des `STEP1_REQUIRED.length` etc., pas hardcodée — toute modif du profil ou du nombre de questions/bloc se propage. |
| `progressIndex(profile, scores, answeredIds)` | NEW — entier 0-28 calculé à partir des réponses *réelles* (cumulatif, ne diminue pas si l'utilisateur recule). |
| `progressRatio(...)` | NEW — équivalent en 0-1 pour styler la barre. |
| `stepProgressLowerBound(step)` / `stepProgressUpperBound(step)` | NEW — bornes par étape pour faciliter le rendu de segments « passés / en cours / à venir » dans la topbar T-V3-4. |
| `resumeStep` | Reprise V2.0 reportée (T6-fix-2/3 inclus) : ramène à la transition entre blocs si le bloc suivant n'a pas démarré. |
| `stepChapter` | 5 chapitres (Profil / Ancrage / Parcours / Équipe / Outils) — l'étiquette qui surmontera la barre 28-étapes. |

Pas de page de test visuelle à ce stade (T-V3-3 = logique pure). Les visus arrivent en T-V3-4 (topbar) qui consomme cette state machine.


### V3-brand-T-V3-4 — Topbar V3 + page de test multi-états

| Livrable | Description |
|---|---|
| `web/components/v3/Topbar.tsx` | 298 lignes — barre continue 28 micro-étapes, étiquette de chapitre (X/5 · label), logo Lugia path SVG inline, toggle thème jour/nuit (lune/soleil 14×14). Position `fixed`, fond semi-transparent + `backdrop-filter: saturate(140%) blur(12px)`, transitions 350-500 ms. Sur step `intro`, la zone progression fade à `opacity:0` (cohérent modèle cible). ARIA `progressbar` avec `aria-valuenow/min/max`. Consomme `progressIndex`, `progressRatio`, `stepChapter` de la state machine, et `paletteFor(theme)` des tokens. Compile vert. |
| `wireframes/v3_topbar_test.html` | 390 lignes — 5 états (intro / profil step1 3 chips / bloc B 4 questions / transition_C 100 % / résultats) sur les deux thèmes côte à côte. Reset global `em { font-style: normal; }` appliqué — aucun italique. |

Toggle thème conditionnel : ne s'affiche que si `onToggleTheme` est fourni en prop. Permet de rendre la topbar « lecture seule » pour les écrans qui ne portent pas le state du thème.


### V3-brand-T-V3-5 — Écrans intro + profil step1/step2 + énergie

| Livrable | Description |
|---|---|
| `web/components/v3/ChipsFieldV3.tsx` | 115 lignes — atome chips réutilisable, rectangulaire (no border-radius), bordure 1 px, surface ivoire diluée sur sélectionné. ARIA `radiogroup`. Theme-aware. |
| `web/components/v3/screens.tsx` | 578 lignes — quatre écrans (IntroV3, ProfilStep1V3, ProfilStep2V3, EnergyV3) + helpers internes (Shell, Eyebrow, Title, Body, PrimaryCta) + export des constantes `PROFIL_STEP1_FIELDS` (5), `PROFIL_STEP2_FIELDS` (4), `ENERGY_FIELD`. Libellés et options copiés du `interview_protocol_v2.json` (D-031 #9, scoring partagé). Tout consomme `paletteFor(theme)`, aucune couleur en dur, aucun italique. |
| `wireframes/v3_intro_profil_energy_test.html` | 409 lignes — 4 écrans empilés avec topbar fixe, toggle thème jour/nuit fonctionnel (script JS qui switche les classes `night` ↔ `day` et l'icône lune/soleil). Pré-sélections représentatives sur chaque écran. |

Pattern emphase non-italique appliqué partout via le composant `Em` (couleur argent dans les titres : « votre cabinet », « vous », « là où vous en êtes »). Reset CSS global `em { font-style: normal; }` dans la page de test.


### V3-brand-T-V3-5-fix — 5 corrections suite revue Sébastien

| Correction | Détail |
|---|---|
| Intro alignée sur le modèle cible | Eyebrow « Diagnostic organisationnel », titre serif sur 3 lignes (« Où en est / votre cabinet / aujourd'hui ? » — mot du milieu en argent via Em), body « 25 minutes. 15 questions adaptées… », 4 promises en grille 2×2 (Adaptatif / Métier / Croisé / Opérationnel) chacune avec son SVG icon repris fidèlement du modèle, CTA « Commencer le diagnostic → ». Le titre est celui demandé (« Où en est votre cabinet aujourd'hui ? »). |
| Toggle thème séparé en composant dédié | Nouveau `web/components/v3/ThemeToggleV3.tsx` : deux pastilles JOUR / NUIT avec icônes soleil / lune, séparateur 1 px, fond ivoire, position fixed top-right au-dessus de la topbar. L'option active a fond plein navy + couleur navy ; l'inactive est tamisée (opacity 45 %). Affordance visuelle évidente — on voit immédiatement que c'est un toggle entre deux états. |
| Retrait du toggle de la Topbar | `web/components/v3/Topbar.tsx` simplifié : retrait de la prop `onToggleTheme`, de la fonction `ThemeIcon` interne et du bouton encadré. La topbar ne porte plus que la barre de progression. 228 lignes (vs 298 avant). |
| CalibProgress restauré dans profil step1/step2 | Composant interne `CalibProgress({done, total, theme})` qui rend une barre 2 px + label mono « X / 5 » (step1) ou « X / 4 » (step2), inséré juste après le body de chaque écran. Anime à 350 ms ease-out, ARIA `role="status" aria-live="polite"`. |
| Page de test mise à jour | `wireframes/v3_intro_profil_energy_test.html` reprend les 3 corrections : toggle deux pastilles fonctionnel (script JS qui switche les classes), intro modèle cible avec 4 promises, calib-progress visible sur les 2 étapes profil. |


### V3-brand-T-V3-5-fix-2 — 7 micro-corrections suite revue Sébastien

| # | Correction | Détail |
|---|---|---|
| 1 | « 18 questions » dans intro | Aligné sur la state machine (3 blocs × 6 = 18). « 15 questions » du modèle cible était hérité d'une version avant routing solo — corrigé. |
| 2 | ProfilSub restauré sous les titres | Nouveau helper `<ProfilSub theme={...}>` (mono 12 px, navy400, letter-spacing 0.04 em, max-width 540 px). Step1 : « Ces informations calibrent les questions et personnalisent le diagnostic. ». Step2 : « Quatre repères réflexifs qui éclairent la suite — pas un test, juste un cadrage. ». Énergie : « Cette question n'entre pas dans le score. Elle aide à formuler les retours de manière utile. ». |
| 3 | Chip sélectionné en argent semi-transparent | `background: color-mix(in srgb, var(--argent) 18%, transparent); border-color: color-mix(in srgb, var(--argent) 60%, transparent); color: var(--navy)`. Effet beaucoup plus subtil que navy plein, cohérent avec « l'argent frappe, ne décore pas ». Idem pour energy-card sélectionnée (14 % surface). |
| 4 | CTA intro = « Commencer le diagnostic → » | Déjà en place depuis T-V3-5-fix. Confirmé. |
| 5 | CTA énergie renommé | « Aborder les blocs → » remplacé par « Commencer les questions → » — plus clair, plus direct. |
| 6 | Ligne confidentialité + icône bouclier | Ajoutée juste avant le CTA intro : SVG bouclier 13×15 avec coche intérieure, texte mono 11 px « Vos réponses sont traitées confidentiellement et ne sont jamais revendues. », couleur navy400. Tonalité rassurante sans alarme. |
| 7 | ThemeToggle = pill qui glisse | `ThemeToggleV3.tsx` refondu : pill (rectangle plein ivory2, no border-radius, brand-compliant) qui translate de 0 à 76 px via `transform: translateX(...)` avec `cubic-bezier(.4, 0, .2, 1)` sur 250 ms. Les labels Jour/Nuit restent statiques, leur couleur passe de navy400 (inactif) à navy (sous la pill) via transition 250 ms. Bordure de la pill bascule droite ↔ gauche selon position pour rester séparateur. |

Page de test `wireframes/v3_intro_profil_energy_test.html` reprend les 7 corrections, en interactif (le toggle fonctionne réellement).


### V3-brand-T-V3-5-fix-3 — Rollback commentaires titres + hints sous questions

| Correction | Détail |
|---|---|
| Rollback du point 2 de fix-2 | Les ProfilSub mono restaurés en T-V3-5-fix-2 sous les titres principaux sont annulés. On revient aux Body originaux (« Cinq éléments factuels… » / « Quatre questions qui éclairent… » / « Cette question n'entre pas dans le score… ») — Sébastien préférait. Le helper `ProfilSub` reste dans le code pour usage futur. |
| Hints sous chaque question | Nouveau champ `hint?: string` sur le type `V3Field`. Rendu sous chaque label de question dans `ChipsFieldV3` en mono 11 px navy400, letter-spacing 0.04 em. Les 9 questions de profil ont reçu une hint courte. |

Hints ajoutés (extraits) : « Configuration actuelle du cabinet » sous *Type de cabinet*, « Consultations par semaine en moyenne » sous *Volume hebdomadaire d'actes*, « L'outil que vous ouvrez tous les jours » sous *Logiciel médical principal*, « Le canal principal, là où passe l'essentiel du flux » sous *Comment vos patients prennent-ils RDV ?*, « À ce poste précisément, pas la durée totale d'exercice » sous *Depuis combien de temps exercez-vous ici ?*, « Ce qui vous a fait cliquer en premier » sous *Pourquoi ce check-up ?*.

Page de test `wireframes/v3_intro_profil_energy_test.html` reprend les changements — Body restaurés en gros sous les titres principaux, hints mono small sous chacune des 9 questions de profil.


### V3-brand-T-V3-5-fix-4 — Multi-select sur 4 questions + retrait options status

| Évolution | Détail |
|---|---|
| `ChipsFieldV3` supporte multi-select | Nouvelles props `multi?: boolean` et `allowFreeAdd?: boolean` sur `V3Field`. En multi : value devient `string[]`, click toggle au lieu de remplacer, plusieurs chips peuvent être sélectionnées en argent semi-transparent simultanément. ARIA `role="group"` + `role="checkbox"` sur chaque chip. |
| Chip « + Ajouter » avec saisie libre | Si `multi && allowFreeAdd`, une chip dashed « + Ajouter » ouvre un input texte (Enter pour valider, Escape pour annuler, blur committe). Les items libres apparaissent comme des chips sélectionnées avec un × pour les retirer. |
| 4 questions passent en multi | `logiciel_metier` (rename « Logiciels que vous utilisez » + allowFreeAdd, hint « Sélectionnez tous ceux que vous utilisez vraiment — ajoutez les autres au besoin »), `rdv_canal` (hint « Tous les canaux par lesquels passent les patients »), `horizon` (hint « Plusieurs réponses possibles si vous avez plusieurs objectifs »), `motivation` (hint « Toutes les raisons qui comptent pour vous »). |
| Status épuré | « Approche transmission » et « Remplaçant » retirés (ambigus, hors cible pilote V3-brand). Question redevient mono-select propre avec 3 paliers exclusifs (Récent / Installé / Senior). |
| Type draft adapté | `Record<string, string \| string[]>` dans ProfilStep1V3 et ProfilStep2V3. Nouveau helper `isFieldFilled(field, value)` qui gère mono (truthy) et multi (array non-vide). CalibProgress branché dessus. |
| Suppression de `logiciel_metier_other` | L'ancienne saisie libre dédiée à « Autre » n'est plus nécessaire — la chip « + Ajouter » absorbe ce cas. |
| ROADMAP entrée V3+ | Ajout section « V3+ — Extension des statuts du profil — REPORTÉ (post pilote V3-brand) » avec 3 pistes (reprise en cours d'un confrère, remplaçant longue durée, approche transmission clarifiée). |

Page de test `wireframes/v3_intro_profil_energy_test.html` affiche désormais des multi-sélections représentatives : Médidoc + Doctolib Pro + une entrée libre « Ordoclic » sur la question logiciels, deux canaux RDV cumulés, deux horizons cumulés, deux motivations cumulées, et la chip dashed « + Ajouter » visible.


### V3-brand-T-V3-6 — Blocs A/B/C + transitions inter-blocs + radar live sticky

Le gros morceau de V3 : 4 livrables, tout compile vert.

| Livrable | Description |
|---|---|
| `web/lib/v3/protocol_data.ts` | 188 lignes — questions des 3 blocs extraites de `resources/interview_protocol_v2.json` (18 questions au total, sans `b1b` qui est routing solo). Types `V3Bloc`, `V3BlocQuestion`, `V3Option` exportés, plus une constante `V3_BLOCS` et un helper `getBloc(id)`. À remplacer par un fetch backend en phase d'intégration. |
| `web/components/v3/RadarLiveV3.tsx` | 253 lignes — SVG sticky desktop (≥1140 px, masqué sinon via media query injectée), polygones concentriques (4 paliers), lignes d'axes, polygone des scores en argent semi-transparent, 3 points lumineux avec `feGaussianBlur` + `feFlood` + `feComposite` + `feMerge`. Niveaux qualitatifs sous le radar par axe (Fragile / En transition / Solide / Mature). Angles -90°/30°/150° (D-031 #8). |
| `web/components/v3/screens_blocs.tsx` | 606 lignes — `BlocQuestionV3` (card avec Q-num mono, label serif, contexte mono optionnel à gauche du filet, 4 options A/B/C/D, reformulation colorée par axe à la sélection avec `feFadeSlide` animation, benchmark ambre optionnel) ; `BlocV3` (écran complet : eyebrow colorée par axe avec trait, titre coloré, sous-titre mono, liste de questions, nav bas avec progression « X / 6 réponses ») ; `BlockTransitionV3` (séparateur « · » Lora 56 px en argent, tag mono, titre bloc fermé, niveau de maturité avec serif 22 px, 3 cards de scores par axe, suite vers le bloc suivant ou résultats). |
| `wireframes/v3_blocs_test.html` | 490 lignes — 4 états interactifs : Bloc A avec Q1 répondue + reformulation + benchmark visibles, transition A→B avec niveau Solide, Bloc B en cours Q4 répondue, transition C finale vers résultats avec les 3 niveaux. Radar live sticky desktop fonctionnel (visible ≥1140 px) avec polygone réel + 3 dots glow + niveaux par axe. Toggle thème jour/nuit fonctionnel. |

**Conventions appliquées dans tous les composants :**
- Aucune couleur en dur — toutes via `palette.axes.A/B/C` ou `palette.signalWarn.*`.
- Aucun italique — `fontStyle: "normal"` explicite partout, reset CSS dans la page de test.
- Animations 250-300 ms ease-out, `prefers-reduced-motion` respecté.
- ARIA `radio` sur les options, `progressbar` implicite via le ratio dans la topbar.


### V3-brand-T-V3-6-fix — 11 corrections sur blocs / radar / transitions / toggle

| # | Correction | Détail |
|---|---|---|
| 1 | Icône Jour 8 rayons restaurée | Le SVG du `tg-opt.day` repris avec ses 8 lignes (4 cardinales + 4 diagonales) comme T-V3-5. |
| 2 | Surbrillance option = argent semi-transparent | Plus de coloration par axe sur l'option sélectionnée. `background: color-mix(in srgb, argent 18%, transparent)` + `border-color: color-mix(in srgb, argent 60%, transparent)`. Cohérent avec les chips de profil. |
| 3 | Reformulation + benchmark restent colorés | Comportement inchangé : reformulation en couleur d'axe (`axes.A/B/C`), benchmark en `signal-warn`. |
| 4 | Maths radar corrigées | Formule `a = angle * π / 180` (et plus `(angle - 90) * π / 180`). Avec angles -90 / 30 / 150, le triangle pointe en HAUT (A sommet, B bas-droite, C bas-gauche). L'ancienne formule donnait un sommet à gauche — bug visuel du modèle cible reporté. |
| 5 | Radar visible en mode jour | Couleurs hardcodées `rgba(255,255,255,0.10)` remplacées par `var(--line)` et `var(--line-strong)`. Bonus : opacité de `--line` augmentée de 0.12 à 0.18 en mode jour pour plus de lisibilité. |
| 6 | Filet sous titre de bloc | Reprise du pattern modèle cible `bloc-title::after` : div 60×1 px de la couleur d'axe à 30 % opacité, juste sous le titre h2. Appliqué dans `BlocV3` (sous le titre du bloc) et dans `BlockTransitionV3` (sous le titre du bloc fermé). |
| 7 | TOUTES les questions affichées | La page de test affiche désormais les 6 questions du bloc A et les 6 du bloc B, générées par script Python à partir du JSON V2 (3 réponses pré-cochées sur A, 4 sur B, avec reformulations et benchmarks visibles). |
| 8 | Page de transition refondue | Reprise fidèle du modèle cible : logo Lugia centré 56×47 navy, eyebrow mono avec nom du bloc + dots `●○○`, titre serif coloré par axe, filet 60 px sous le titre, body court qui contextualise. Plus de séparateur « · » Lora 56 px. |
| 9 | Plus de radar live sur transitions | Le radar live sticky est rendu une seule fois en haut de page de test — il n'apparaît visuellement que sur les écrans de bloc, pas sur les écrans de transition (cadrage central qui occupe toute la zone). En prod V3, c'est le composant parent qui gère son montage. |
| 10 | Suite + bouton Continuer maintenus | Pattern existant conservé : eyebrow « Suite », label du bloc suivant en serif 17 px, CTA navy plein « Continuer → » (ou « Voir mon diagnostic → » en finale). Pas de nom de bloc dans le bouton. |
| 11 | Eyebrow transition = dots de progression | `Nom du bloc — ●○○` (3 cercles 7×7, bordure navy400, fond navy plein pour les axes complétés). Animation neutre. Donne immédiatement la position du parcours sans avoir à dire « Bloc A terminé ». |
| 12 | Bouton « ← Précédent » partout | Nouveau composant `BackButton` (mono 11 px, navy400, hover navy, transparent). Ajouté à `BlocV3`, `BlockTransitionV3`, `ProfilStep1V3`, `ProfilStep2V3`, `EnergyV3` via prop optionnelle `onBack?: () => void` — le bouton n'apparaît que si la prop est fournie. |

Pages mises à jour : `wireframes/v3_blocs_test.html` (615 lignes — 4 écrans avec radar live correct, transitions refondues, 12 questions visibles). Composants TS : `RadarLiveV3.tsx` (formule), `screens_blocs.tsx` (surbrillance argent, trait sous titre, transition refondue avec logo + dots, BackButton, prop onBack), `screens.tsx` (BackButtonV3 helper local + prop onBack sur ProfilStep1V3 / ProfilStep2V3 / EnergyV3).


### V3-brand-T-V3-6-fix-2 — Transition épurée + radar incliné + toggle no-op + filet à droite

| # | Correction | Détail |
|---|---|---|
| 1 | Transition épurée — fin des redondances | Eyebrow ●○○ retiré, body « Vous venez de terminer ce bloc. Niveau de maturité : Solide. » retiré, filet 60 px sous le titre retiré. Reste : logo Lugia + titre h2 coloré par axe + 3 score cards + Suite + Continuer. La complétion se lit naturellement sur les 3 score cards (le bloc fermé a un niveau, les autres ont « — »). |
| 2 | Opacités du radar atténuées | Grilles concentriques à `opacity=0.3`, axe extérieur à `opacity=0.4`, lignes d'axes à `opacity=0.4`. On devine la structure plutôt que de la voir distinctement — cohérent avec le minimalisme brand. |
| 3 | Toggle Jour/Nuit no-op si déjà actif | Le composant devient un `<div role="group">` qui contient deux `<button>` distincts. `goDay` ne fait rien si on est déjà en jour, idem pour `goNight`. Cursor passe à `default` quand l'option est déjà active. Contraste renforcé : actif = `color: navy` + `fontWeight: 600` + `opacity: 1`, inactif = `color: navy400` + `fontWeight: 400` + `opacity: 0.45`. Différence immédiatement lisible. |
| 4 | Radar incliné | `transform: rotate(20deg)` appliqué au SVG du radar (origin: center). Les axes restent à -90 / 30 / 150 dans la state machine, c'est juste le rendu visuel qui s'incline. |
| 5 | Filet à DROITE de l'eyebrow bloc | Pseudo-élément `::after` avec `flex: 1` + `height: 1px` + opacité 0.4 — le filet s'étend depuis le texte de l'eyebrow jusqu'à la marge droite du shell. Plus de `::before` 20 px à gauche, plus de filet 60 px sous le titre h2. |
| 6 | Continuer centré + Précédent en absolu à gauche | `.trans-actions` devient `position: relative` avec un `min-height: 48px`. Continuer (`<button class="cta">`) reste centré via flex parent. Précédent (`<button class="btn-back">`) en `position: absolute; left: 0; top: 50%; translateY(-50%)`. Visuellement, on enchaîne en lisant le Continuer central, et Précédent reste accessible mais discret. |

Page de test `wireframes/v3_blocs_test.html` reprend les 6 corrections : toggle pill avec contraste fort + click no-op, radar incliné 20° avec traits estompés, transition épurée à logo + titre + scores, filet eyebrow à droite, Continuer centré sous le bloc suivant.


### V3-brand-T-V3-6-fix-3 — Phrase encourageante sur transition + inclinaison radar du modèle cible

| # | Correction | Détail |
|---|---|---|
| 1 | Titre du bloc fermé → phrase encourageante | Sur la page de transition, le `<h2>` qui répétait le nom du bloc (« Parcours patient ») est remplacé par une phrase serif 40 px qui contextualise la progression et encourage. Calculée à partir du nombre de blocs avec un score : 1 bloc → « Un premier axe posé. Le profil commence à se dessiner. », 2 blocs → « Deux axes sur trois. Le profil prend forme. », 3 blocs ou `isFinal` → « Les trois axes sont posés. Votre profil est prêt. ». Plus humain, plus lisible, et le nom du bloc reste présent dans la score card juste en dessous. |
| 2 | Radar : inclinaison du modèle cible restaurée | Retour à la formule originale `a = (angle - 90) * π / 180`. Avec angles -90 / 30 / 150 : A sommet à GAUCHE, B haut-droite, C bas-droite. Triangle qui pointe à GAUCHE — c'est l'inclinaison brand voulue depuis le départ (cf `lugia-survey-model.html`). Le `transform: rotate(20deg)` ajouté en fix-2 est retiré : l'inclinaison vient naturellement de la formule. |

Recalcul complet des coordonnées dans la page de test : grilles concentriques (4 paliers) à `(67,80) (86.5,68.74) (86.5,91.26)` etc., points de score à `(44.64, 80)` pour A à 68%, `(90.92, 61.09)` pour B à 42%, `(94.30, 104.77)` pour C à 55%. Lignes d'axes du centre vers chaque sommet.


### V3-brand-T-V3-6-fix-4 — Phrase mieux dimensionnée + texte ivoire en mode nuit

| Correction | Détail |
|---|---|
| Taille phrase encourageante | `font-size: clamp(28px, 4vw, 40px)` était trop grand sur écran large (paraissait crier). Réduit à `clamp(22px, 2.6vw, 28px)` avec `line-height: 1.35` (plus de respiration) et `max-width: 480px`. Plus discret, plus classe. |
| Texte mode nuit en ivoire chaleureux | `nightPalette.navy` passait de `#fbfaf6` (paper presque-blanc, clinique) à `#f4efe5` (ivoire chaleureux de la canvas brand). Plus aligné avec « le canvas est la marque » du brand-master. Propagé dans tous les HTML tests V3 (5 fichiers). Le modèle cible utilisait `#fbfaf6` qui paraissait trop blanc en contexte nuit — on garde la nuance ivoire pour conserver la chaleur de la marque. |


### V3-brand-T-V3-audit + T-V3-audit-fix — Repasse conformité brand kit

**Audit exhaustif effectué** sur 10 fichiers V3 (tokens, state, atoms, ChipsFieldV3, Topbar, ThemeToggleV3, RadarLiveV3, screens, screens_blocs, protocol_data) + 5 wireframes HTML. Verdict :

| Règle brand | État avant audit | Après audit |
|---|---|---|
| Pas d'italique | OK partout, juste mentions dans les commentaires | inchangé |
| Pas de border-radius | OK (`50%` uniquement sur cercles sémantiques : dots radar, dots progression, ac::before) | inchangé |
| Pas de couleurs hex hardcodées | OK (palette via `paletteFor()`, var(--*) partout) | inchangé |
| Vocabulaire à éviter | OK (un faux positif « verticale » dans un commentaire JS) | inchangé |
| Reset CSS `em { font-style: normal }` | OK sur les 5 wireframes | inchangé |
| Esperluette avec `&nbsp;` | ❌ 18 occurrences `Lugia &amp; Co` au lieu de `Lugia&nbsp;&amp;&nbsp;Co` | ✓ corrigé partout (Topbar.tsx + 4 wireframes) |
| Lora ≥ 22 px | ❌ 4 violations dans le code TS + 8 dans les wireframes | ✓ documenté via D-032 (exception éditoriale) |

**D-032 inscrit dans DECISIONS.md** — « V3-brand : exception Lora < 22 px pour le contenu éditorial du parcours ». Le brand-master garde sa règle « Lora ≥ 22 px » pour toute la marque, sauf sur 4 usages précisément bornés : `q-text` (16 px), `energy-card` (17 px), `tsc-level` score cards (17 px), `trans-next-label` (17 px). Justifié par la posture « voix du confrère » du parcours et l'alignement avec le modèle cible.

### V3-brand-T-V3-6-fix-5 — Phrase sur une ligne + bloc C ajouté + transition B→C

| Correction | Détail |
|---|---|
| Phrase encourageante sur 1 ligne | Réduction à `clamp(18-22px)` + retrait de `max-width` (le shell de transition borné à 560 px fait office de limite naturelle). `<br>` retirés du HTML test. Les 3 phrases (« Un premier axe posé. Le profil commence à se dessiner. » / « Deux axes sur trois. Le profil prend forme. » / « Les trois axes sont posés. Votre profil est prêt. ») tiennent désormais sur une ligne unique sur écran moyen et large. |
| Bloc C ajouté + transition B→C | Le `wireframes/v3_blocs_test.html` montrait A + transition A→B + B + transition C → manquait toute la portion C. Ajout du **bloc C (Outils & dossiers, 6 questions, 4 pré-répondues)** + de la **transition B→C** avec la phrase « Deux axes sur trois. Le profil prend forme. ». Parcours complet de 6 écrans : A → trans A→B → B → trans B→C → C → trans C→résultats. |


### V3-brand-T-V3-6-fix-6 — Phrase transition à 17 px max pour tenir sur 1 ligne

`clamp(18px, 2.2vw, 22px)` était trop grand : la phrase « Un premier axe posé. Le profil commence à se dessiner. » (54 caractères) wrappait à 22 px dans le shell de transition borné à 560 px. Réduit à `clamp(15px, 1.6vw, 17px)` avec `letter-spacing: 0` (plus de spacing négatif qui resserrait). Les 3 phrases tiennent désormais sur une ligne unique, de façon homogène. Appliqué dans `screens_blocs.tsx` et `wireframes/v3_blocs_test.html`.


### V3-brand-T-V3-7 — Page résultats V3 complète

Le dernier gros morceau d'écran avant les modules. 5 livrables, tout compile vert.

| Livrable | Description |
|---|---|
| `web/lib/v3/signals_data.ts` | 98 lignes — 6 signaux croisés (triple_faiblesse, outils_ok_humain_fragile, equipe_outils_faibles, parcours_ok_equipe_fragile, pratique_ok_outils_faibles, tout_bon) + fallback toujours-affiché (D-031 #7). Chaque signal porte une condition typée `(s: AxisLevels) => boolean` sur les niveaux 0-3, un titre et un corps éditorial. Helper `pickSignal(scores)` qui rend le premier signal qui matche, ou le fallback. |
| `web/lib/v3/opps_data.ts` | 112 lignes — 7 opportunités/modules (urgences, chroniques, délégation, comm, logiciel, admin, pilotage) avec icon, label, desc, effort (low/med/high), gain (fast/mid/slow), condition d'activation. Helper `pickOpportunities(levels, max=4)`. |
| `web/components/v3/RadarResultV3.tsx` | 207 lignes — SVG grand format 380×340 avec viewBox élargi, cx=200/cy=170 (décalé pour laisser la place aux labels), r=108. Polygones concentriques 4 paliers + glow filter par axe (stdDeviation 5) + points 5.5px + labels d'axes mono caps sur 2 lignes positionnés à r+40px de chaque sommet, text-anchor adapté à la position gauche/droite/milieu. |
| `web/components/v3/ResultatsV3.tsx` | 548 lignes — page résultats complète : eyebrow filet-droite, hero serif 50px « Votre cabinet en trois dimensions », phrase de motivation contextualisée, radar grand format, **analyse croisée TOUJOURS affichée** (signal qui matche ou fallback), 3 axis cards (un par axe avec niveau qualitatif + phrase contextuelle parmi les 12 du tableau AXIS_PHRASES), liste OpportunityCard avec icon + label serif + desc Onest + badges Effort/Gain mono, CTA-block « Creuser un chantier » avec les 4 boutons mêmes opportunités. |
| `wireframes/v3_resultats_test.html` | 463 lignes — profil-exemple complet : Dr Chateau, motivation = charge, scores A=68 / B=42 / C=55 (Solide / En transition / En transition). Radar grand format SVG inline avec polygone scores réel + 3 dots glow + labels d'axes. Analyse croisée + 3 axis cards + 4 opportunités prioritaires + CTA-block. Toggle thème jour/nuit fonctionnel. |

Conventions appliquées : aucun italique, aucune couleur hex hardcodée hors palette, palette utilisée pour les axes (jamais hors radar/cards d'axe), Lora ≥ 22 px sauf les exceptions D-032 (q-text, energy-card, tsc-level, trans-next-label — n'apparaissent pas dans cette page), filet eyebrow à droite, rectangulaire partout (no border-radius hors cercles sémantiques), animations ≤ 250 ms.


### V3-brand-T-V3-7-fix — Date+durée, signal ambre, axis cards dépliantes, chantiers cliquables

| # | Correction | Détail |
|---|---|---|
| 1 | Méta date + durée sous le titre | Props `completedAt?: Date \| string` et `durationMinutes?: number` ajoutées à `ResultatsV3`. Rendu en mono 11 px navy400 sous le titre h1 sous forme « Dr Chateau · Réalisé le 20 mai 2026 · Durée 18 min ». Démontre le suivi intelligent du temps par Lugia. |
| 2 | Analyse croisée en signal-warn (ambre) | Le bloc d'analyse croisée passe de fond ivoire neutre à `background: signalWarn.surface` (rgba ambre 10 %) + `border: 1px signalWarn.border` (rgba ambre 32 %) + `borderLeft: 2px signalWarn.default`. Eyebrow « Analyse croisée » en couleur ambre. C'est l'usage canonique #2 de D-031 #3 (« signal croisé d'alerte ») — un seul ambre par écran respecté. |
| 3 | Axis cards dépliantes | Nouveau composant `AxisCardExpandable` qui remplace les 3 div statiques. État initial collapsed (titre + niveau qualitatif + phrase contextuelle). Click sur la card → expand vers détail « Forces » (puces couleur axe) et « Marges de progression » (puces argent). Toggle « + » qui rote à 45° quand expanded. Tableau `AXIS_DETAILS` qui contient 12 paires forces/marges (3 axes × 4 niveaux) avec contenu éditorial. Dans la page de test HTML, utilisation de `<details>`/`<summary>` natifs pour la même UX sans JS. |
| 4 | Chantiers cliquables (avec placeholder module) | Page de test : chaque opp-card et chaque cta-btn déclenche un `openModule(name)` JS qui affiche un placeholder « Plan d'action — bientôt » avec scroll smooth. La vraie page module arrive en T-V3-8. Côté composant React, `onOpenModule(oppId)` était déjà branché. |

**Audit V2.0 vs V3-brand-0 — ce qui reste à arbitrer :**

| Section V2 | V3 actuel | Décision en attente |
|---|---|---|
| Aparté tonalité status junior/senior | Absent | À garder ou non en V3 ? |
| Section II « Repères terrain personnalisés » (benchmarks combinatoires ambrés) | Absent | À réintégrer ? (utile pour cas spécifiques d'usage) |
| Section IV « Tous les chantiers » (grid 2 col tous modules) | Absent | À réintégrer en lien expand ? |
| Ranking 1er/2e/3e + flag « recommandé » sur l'opp principale | Absent | À ajouter ? |
| Sections numérotées I/II/III/IV en serif | Absent | À garder absent ou réintroduire ? |

Page de test `wireframes/v3_resultats_test.html` (600 lignes) reflète les 4 corrections. Composant `ResultatsV3.tsx` à 856 lignes après ajout d'`AxisCardExpandable` (~200 lignes de détails forces/marges typés par axe × niveau).


### V3-brand-T-V3-7-fix-2 — Invite à cliquer + méta plus visible

| Correction | Détail |
|---|---|
| Phrase d'invitation au-dessus des axis cards | Nouvelle phrase mono caps « ↓ Cliquez sur un axe pour voir les pistes d'action » posée juste au-dessus de la grille des 3 axis cards. Couleur navy600, flèche ↓ en 14 px. Annonce l'interaction de dépli. |
| Méta sous le titre plus visible | Couleur passée de `palette.navy400` (gris-bleu terne) à `palette.navy600` (plus clair, plus proche de l'ivoire en mode nuit). La méta « Dr Chateau · Réalisé le 20 mai 2026 · Durée 18 min » est désormais lisible sans avoir à chercher. |
| Phrase de motivation plus visible | Passe de `navy600` plein à `navy` avec `opacity: 0.85` — un cran plus lumineux, garde une légère hiérarchie sous le titre h1 mais sans paraître éteint. |


### V3-brand-T-V3-7-fix-3 — 5 corrections page résultats

| Correction | Détail |
|---|---|
| Invite à cliquer DANS chaque axis card | Phrase « ↓ Cliquer pour les pistes d'action » déplacée du haut de la grille vers le summary de chaque axis card. Mono 11 px navy400, visible uniquement quand la card est collapsed (`[open]` la masque automatiquement). Plus contextuel, plus lisible. |
| Doublon Analyse croisée + Lecture croisée retiré | Plus d'eyebrow mono + titre h2 redondants. Un seul titre h2 « Analyse croisée » serif `clamp(26-32px)`, couleur signal-warn (ambre). Le titre devient l'objet du bloc, le body éditorial reste en dessous. |
| Forces ET marges en ivoire | Les puces de marges de progression passent de `navy600` (gris-bleu) à `navy` (ivoire en mode nuit). Plus visibles, plus présentes. Forces et marges ont désormais la même valeur de texte, seule la puce les différencie (couleur axe vs argent). |
| Descriptions opp-cards raccourcies | Toutes les desc de `opps_data.ts` ramenées à ~50-60 caractères pour tenir sur une ligne. Ex. : « Périmètre clair de l'équipe sur ce qui ne nécessite pas le médecin — gain typique : 45 min/jour. » → « Périmètre clair de l'équipe — gain typique 45 min/jour. ». |
| Pips d'effort + libellé alignés | `vertical-align: middle` sur les pips + `align-items: center` + `line-height: 1` sur le libellé. Les 3 traits sont désormais sur la même ligne horizontale que « EFFORT SOUTENU ». |


### V3-brand-T-V3-7-fix-4 + audit comparatif V1.1.9 / V2.0 / V3-brand

**Corrections page résultats V3 :**

| Correction | Détail |
|---|---|
| Bloc Analyse croisée aligné sur axis cards | Padding passé de `28px 32px` à `20px 24px` (même que axis-card). Titre h2 passé de `clamp(26-32px)` à `22px` fixe (même que axis-card-title). Margins ajustés (10 px sous le titre, plus 18 px). Visuellement, le bloc warn et les 3 axis cards forment maintenant une suite cohérente, même grammaire visuelle. |
| Phrases revenues en argent (navy600) | Rollback du fix-3 sur l'« ivoirisation » : axis-card-body, forces et marges reviennent en `navy600`. Cohérent avec l'esprit brand-master « argent = signature ». La phrase d'invite reste en navy400 (plus discrète). |

**Livrables comparatifs V1.1.9 / V2.0 / V3-brand :**

| Livrable | Description |
|---|---|
| `wireframes/v3_audit_comparatif_resultats.md` | 64 lignes — tableau Markdown des différences section par section (Hero, méta, radar, signal, status, axes, benchmarks, opportunités, tous les chantiers, prochaine étape, sections numérotées), des différences éditoriales (ton, synthèse, lexique niveaux), des différences visuelles (palette, typo, forme, toggle, italique). Liste les 5 éléments perdus en V3 et les 7 éléments ajoutés. |
| `wireframes/v3_audit_comparatif_resultats.html` | 527 lignes — vue 3 colonnes côte à côte des trois versions de page résultats avec wireframes simplifiés mais représentatifs. Chaque colonne reproduit la structure d'origine : V1.1.9 avec 4 sections romaines + pause narrative + 2 prochaines étapes, V2.0 avec radar + signal + apartés + 4 sections + benchmarks + tous les chantiers, V3-brand avec radar incliné + analyse croisée warn toujours-affichée + axis cards dépliantes + chantiers prioritaires + CTA-block. Légende synthèse en pied de page avec 5 décisions à prendre. |


### V3-brand-T-V3-7-fix-5 — Bloc autonomie/Lugia + badge 1ère reco + lien « tous les chantiers »

Arbitrages Sébastien sur l'audit V2→V3 et logique business intégrée :

| Décision | Application |
|---|---|
| Aparté status junior/senior | À arbitrer séparément (italique interdit en V3, à adapter ou retirer). |
| Repères terrain personnalisés | Pas en section séparée, **à intégrer en bas du détail des chantiers** (page module T-V3-8). |
| Ranking opportunités | Pas de numérotation 1/2/3/4, mais **badge « ★ Recommandé pour commencer »** en mono argent sur la 1ère opp-card. Tri global par pertinence conservé (cond + ordre dans `opps_data.ts`). |
| Accès aux autres chantiers | Lien discret **« → Voir tous les chantiers »** en mono navy400 sous le bloc Prochaine étape, qui ouvrira une page placeholder (vraie page T-V3-9). |
| Sections numérotées I/II/III/IV | Pas de numéros en V3 — confirmé. |

**Refonte du bloc final selon la logique business Lugia :**

Remplace le « Creuser un chantier » (qui faisait double emploi avec les opp-cards juste au-dessus) par le pattern V1.1.9 adapté brand V3 — deux cartes côte à côte :

| Carte | Eyebrow | Titre | Description |
|---|---|---|---|
| Autonomie | « En autonomie · 1er chantier gratuit » (argent) | « Approfondir un chantier de votre choix » | « Une discussion ciblée avec un assistant Lugia — 15 minutes, à votre rythme. Le premier chantier est offert ; les suivants sont accessibles sur abonnement. » |
| Lugia (recommandé) | « ★ Recommandé · Avec Lugia, en réel » (navy 600) | « Avancer avec Lugia, dans votre cabinet » | « Vous choisissez un chantier, on le traite ensemble dans votre cabinet. Pas un appel d'identification — le chantier lui-même, structuré à partir de dispositifs éprouvés chez d'autres confrères. » |

La carte Lugia a une bordure-gauche 2 px navy pour marquer le badge « Recommandé ». Logique business respectée : 1er chantier en autonomie gratuit (LLM), suivants payants pour la version autonomie ; expérience accompagnée pour la version Lugia.


### V3-brand-T-V3-7-fix-6 — Restructuration narrative (accroche + Forces/Risques + personnalisation)

Refonte structurelle de la page résultats selon la lecture narrative V1.1.9 et la logique éditoriale Lugia.

**Nouvelle structure de la page :**

1. Hero (titre + méta date/durée)
2. **Phrase de motivation enrichie** — fusionne motivation déclarée + ton status (junior/installé/senior) + prénoms des associés s'ils sont saisis. Plus d'aparté séparé en italique comme V2.0.
3. **Phrase d'accroche choc** — serif `clamp(24-30px)` en couleur argent, **sans encadré** (citation visuelle pure), juste avant le radar. Reprend `signal.title` (« Paradoxe : bon parcours patient, équipe fragile. » par ex.). Résume tout le questionnaire en une déclaration.
4. Radar grand format
5. **Bloc « Pourquoi cette lecture »** — body de l'analyse croisée en signal-warn ambre, complète l'accroche.
6. **Section « Forces »** (axes au niveau Solide ou Mature) — axis cards dépliantes.
7. **Section « Risques »** (axes au niveau Fragile ou En transition) — axis cards dépliantes.
8. Chantiers prioritaires
9. Prochaine étape (autonomie / Lugia)
10. → Voir tous les chantiers

**Personnalisation V1.1.9 amorcée :**

| Élément | Détail |
|---|---|
| Prop `associateNames?: string[]` | Liste de prénoms des associés du cabinet. La phrase d'accroche bascule de « Vous avez démarré » à « Vous, Marie et Pierre avez démarré » (avec gestion de l'oxford-comma : « Vous, Marie, Pierre et Sophie »). |
| Prop `status?: "recent" \| "installe" \| "senior"` | Le ton bascule en fin de phrase : « à un moment où poser de bonnes bases compte particulièrement » (recent), « à un moment où le cabinet a son rythme — c'est le bon moment pour le clarifier » (installe), « avec une vue d'ensemble qui mérite d'être outillée » (senior). |
| Aparté status retiré | Le ton est désormais fondu dans la phrase de motivation principale (fusion B confirmée). |

**Composant `SectionHeading`** ajouté — eyebrow mono 11 px navy400 avec filet horizontal à droite, utilisé pour « Forces » et « Risques ».

Page de test mise à jour avec un profil exemple personnalisé : Dr Chateau, status `installe`, associés Marie + Pierre, motivation `charge`, scores A=68 (Force) / B=42 + C=55 (Risques). La phrase d'accroche affichée : « Paradoxe : bon parcours patient, équipe fragile. ». La phrase de motivation : « Vous, Marie et Pierre avez démarré ce check-up pour réduire votre charge actuelle, à un moment où le cabinet a son rythme — c'est le bon moment pour le clarifier. »

**Note** : la personnalisation complète (prénoms associés dans les reformulations des questions, situations territoriales adaptées) reste à compléter en T-V3-7-fix-7 ou en phase d'intégration backend. Les emplacements sont préparés via les props.


### V3-brand-T-V3-7-fix-7 — Rollback haut + double bloc gauche/droite + boutons CTA + effort/gain interactif

**Rollback fix-6** (le haut de la page revient à l'état fix-5 — Sébastien souhaite rediscuter de la structure narrative) :

- Phrase d'accroche choc serif argent retirée
- Bloc Analyse croisée renommé back de « Pourquoi cette lecture » → « Analyse croisée », avec `signal.title` restauré en serif 17 px sous le titre h2
- Sections « Forces » et « Risques » retirées — retour aux 3 axis cards ensemble (toujours dépliantes)
- Phrase de motivation enrichie (status + associateNames) **conservée** — la fusion B reste

**Évolutions bas appliquées sur le rollback :**

| Évolution | Détail |
|---|---|
| Prochaine étape en gauche/droite | Le bloc passe d'une stack verticale à un `grid-template-columns: 1fr 1fr` avec gap 16 px. Sur mobile (≤ 640 px), retour automatique en stack vertical via media query. |
| CTA cliquable sous chaque carte | Chaque carte autonomie/Lugia est un `<div>` (plus un `<button>` global) avec un bouton CTA en bas qui dépasse via `margin-top: auto`. Autonomie : bouton outline navy « Choisir un chantier ». Lugia : bouton plein navy « En parler avec Lugia → » avec hover qui ajoute un box-shadow argent diffus + lift de 1 px — donne envie d'être cliqué. |
| Effort/Gain réorganisé sur opp-cards | Nouveau layout en 3 zones : (a) pips d'effort + label « Effort » à gauche, (b) séparateur vertical 1×14 px, (c) label « Gain » + rectangle outline cliquable avec la durée chiffrée (« < 1 semaine », « 2 à 4 semaines »). Le rectangle s'éclaire au survol — fond ivory2 + bordure navy400. Le hover est déclenché par la card entière. |

**Livrables :**

| Fichier | Description |
|---|---|
| `web/components/v3/ResultatsV3.tsx` | 1140 lignes — rollback fix-6 + 3 évolutions bas. Compile vert. |
| `wireframes/v3_resultats_test.html` | (inchangé — archive de fix-6 pour comparaison) |
| `wireframes/v3_resultats_test_v2.html` | Nouvelle page de test 750 lignes — rollback + évolutions bas, prête à comparer avec l'ancienne. |


### V3-brand-T-V3-7-fix-8 — Taille titre réduite + phrase motivation sans associés

| Correction | Détail |
|---|---|
| Titre h1 plus mesuré | `clamp(34px, 5vw, 50px)` → `clamp(32px, 3.5vw, 40px)`. Plafond à 40 px sur grand écran. Plus aligné avec la hiérarchie des autres titres de la page. |
| Phrase de motivation sans associés | Sujet redevient toujours « Vous » — plus de « Vous, Marie et Pierre avez démarré ». La prop `associateNames` est conservée dans l'API du composant (pour usage futur dans les reformulations des questions ou les analyses d'axes) mais n'est plus utilisée dans la phrase d'accroche. |


### V3-brand-T-V3-7-fix-9 — Harmonisation chantiers + tous chantiers + hover durée + pastille reco

| # | Correction | Détail |
|---|---|---|
| 1 | Tailles harmonisées entre Chantiers prioritaires et Prochaine étape | `opp-card-title` passe de 17 px à **18 px** (= même taille que `next-card-title`). Mêmes titres h3, mêmes desc 13 px navy600. Cohérence visuelle entre les deux blocs. |
| 2 | « Voir tous les chantiers » déplacé + visibilité renforcée | Le lien sous-souligné navy400 sous Prochaine étape est **retiré**, remplacé par un **bouton outline navy** posé en bas de la section Chantiers prioritaires (juste avant Prochaine étape). Taille 13 px Onest, padding 11×22 px, bordure 1 px `line-strong`, hover bordure navy + fond argent 8 %. |
| 3 | Hover du rectangle Gain plus marqué | Au survol de la card : (a) fond passe de `transparent` à **`ivory` plein** (au lieu de `ivory2`), (b) bordure passe en `navy` plein (au lieu de `navy400`), (c) `transform: translateY(-1px)` léger lift, (d) `font-weight: 500` en permanence. L'interaction est désormais clairement visible — on voit que c'est cliquable. |
| 4 | Pastille « Recommandé pour commencer » plus visible | Passe de texte mono argent à **mini pill** : padding 3×9 px, fond `color-mix(argent 25%, transparent)`, bordure 1 px argent, texte navy gras (fontWeight 600), icône ★. Inline-flex avec gap 5 px. Pour la card recommandée, ajout d'une **bordure-gauche 3 px de la couleur d'axe** (vert axe A, bleu axe B, orange axe C — selon le chantier). L'œil va directement dessus. |


### V3-brand-T-V3-7-spec — Refonte complète page résultats selon spec finale

Sébastien a livré la **spec finale** + une **maquette HTML cible** travaillées dans une autre fenêtre. Réécriture intégrale de la page résultats pour s'aligner.

| Livrable | Description |
|---|---|
| `wireframes/v3_resultats_test_v3.html` | 1051 lignes — maquette de Sébastien déposée telle quelle comme nouvelle référence. Toutes les versions précédentes (`v3_resultats_test.html`, `_v2.html`) restent comme archives. |
| `resources/v3_resultats_specs.md` | 348 lignes — spec finale Sébastien (chartes, structure, eyebrows, blocs, radar SVG annoté, signaux, topbar, toggle, interactions, points d'extension). |
| `web/components/v3/ResultatsV3.tsx` | 1483 lignes — refonte complète qui matche la maquette pixel-perfect. Compile vert. |

**Changements structurels majeurs vs la version précédente :**

| Section | Nouveauté |
|---|---|
| **Phrase choc** | Plus de bloc encadré : phrase serif `clamp(15-17px)` avec début neutre + fin clé en `<strong>` couleur `--warn` (ambre). Eyebrow « Ce que révèle votre diagnostic ». |
| **Bilan global** (NEW) | Grid 2 colonnes égales : « Ce qui tient » (vert, items sans badge) / « Ce qui fragilise » (rouge, items avec `risk-badge` Critique / À surveiller / Optimisable). Sur la maquette : 3 forces + 3 risques. |
| **Risk badges** | 3 niveaux normalisés : `crit` (orange axe C), `warn` (ambre warn), `opt` (argent). Mini pill avec dot 5×5 px + texte mono 9 px caps 600. Apparaissent dans bilan global + marges des axis cards + annotations radar SVG. |
| **Radar SVG annoté** | Refonte complète. Format 860×480, viewBox élargi pour laisser la place aux annotations latérales. **Annotations latérales** : 3 callouts reliés aux points du radar (B, C, midBC) par traits argent dashed, chacune avec titre Lora 17 px gras + sous-titre Onest 14 px + badge SVG aux dimensions calculées dynamiquement. Point midBC (cercle creux argent) pour les signaux croisés inter-axes. |
| **Niveaux de maturité** | Élargis à **5 paliers** : En construction / En transition / Stabilisé / **Maîtrisé** / Optimisé (« Maîtrisé » ajouté pour matcher la maquette). À refléter dans tokens.ts en T-V3-7-spec-fix si besoin. |
| **Axis cards** | Borderline navy400 / shadow soft `0 4px 16px -6px rgba(0,0,0,0.15)` + `translateY(-1px)` au hover. Badges risque **inline** dans les puces de marges. |
| **Opp-cards** | Effort + **Délai** (nouveau, séparé) + **Gain double** (temps « -45 min/j » + euros « +22 k€/an* »). Astérisque relié à une **note de calcul** sous les chantiers : « * Estimations calculées sur la base de votre profil cabinet (220 jours, taux horaire médecin). ». Hover : `translateX(2px)` (latéral). |
| **CTA final** | Carte Autonomie avec **pastille « 1er chantier gratuit »** dans l'eyebrow row (argent outline). Carte Lugia &amp; Co intitulée « Débriefing avec un consultant » + bouton plein « Prendre rendez-vous → » (au lieu de « En parler avec Lugia »). |
| **Bouton « Voir tous les chantiers » plus loin** | Posé après la note astérisque, format mono caps 10 px (et plus Onest 13 px). |

**Conventions confirmées :**

- `border-radius: 0` strict (sauf `rx: 2` sur badges SVG du radar).
- Lora jamais en italique (`em, i, cite, address { font-style: normal }`).
- Trait pointillé radar en argent `#8E8E91`, badge SVG couleur **par sévérité** (jamais par axe).
- Animations 180-250 ms ease-out.

**Reste à faire / à arbitrer :**

- Page de test interactive utilisant le composant React (la maquette HTML statique de Sébastien tient lieu de référence visuelle pour l'instant).
- Mise à jour de `LEVELS` dans `tokens.ts` pour passer de 4 à 5 paliers (avec « Maîtrisé » entre Solide et Mature).
- Brancher `radarAnnotations` sur les signaux + scores dynamiquement (cf `points d'extension` de la spec).
- Calcul des gains €/an depuis le profil (volume hebdo, taux horaire).


### V3-brand-T-V3-8 — Page module (plan d'action en 4 étapes + données terrain)

Le dernier écran du parcours V3-brand est posé. Avec lui, le parcours est complet bout en bout : intro → profil → énergie → blocs → résultats → **module**.

| Livrable | Description |
|---|---|
| `web/lib/v3/modules_data.ts` | 305 lignes — 7 modules × 4 étapes = 28 étapes typées + tag temporel (quick/medium/invest) + benchmark de conclusion avec source. Extrait de `resources/modules_v2.json`. Helper `getModule(id)`. |
| `web/components/v3/ModuleV3.tsx` | 404 lignes — page module complète. Bouton retour discret, eyebrow « Plan d'action », titre serif coloré par axe avec icône émoji 32 px, filet 60 px sous, **4 StepCards** (numéro mono + titre serif 17 px + body Onest + tag temporel coloré quick=vert / medium=ambre / invest=argent), section **« Données terrain »** en bas (warn ambre avec benchmark + source), CTA bas page avec bouton Retour + Imprimer + « En parler avec Lugia → » plein navy avec shimmer hover. |
| `wireframes/v3_module_test.html` | 336 lignes — page de test autonome avec un exemple complet : Rituel de communication d'équipe (axe B). Toggle Jour/Nuit fonctionnel. Print prêt. |

**Conventions appliquées :**

- Aucun italique nulle part (relais argent / couleur pour l'emphase)
- Bordures rectangulaires (no border-radius)
- Tag temporel : couleur par sévérité (quick/medium/invest), jamais par axe
- Données terrain : signal-warn ambre (cohérent avec usage canonique #3 « module à fort enjeu »)
- Hover du CTA Lugia : `box-shadow: 0 0 0 1px argent, 0 8px 24px -8px argent` + `translateY(-1px)`

**Le parcours V3-brand est désormais complet bout-en-bout côté composants React :**

| Étape | Composant |
|---|---|
| Intro + Profil + Énergie | `web/components/v3/screens.tsx` |
| Blocs A/B/C + transitions | `web/components/v3/screens_blocs.tsx` + `RadarLiveV3.tsx` |
| Résultats | `web/components/v3/ResultatsV3.tsx` (refonte spec finale) |
| **Module** | `web/components/v3/ModuleV3.tsx` (livré T-V3-8) |
| Topbar progression | `web/components/v3/Topbar.tsx` |
| Toggle thème | `web/components/v3/ThemeToggleV3.tsx` |

**Reste à faire pour la 3ème carte beta sur la page d'accueil :**

- T-V3-9 : page d'accueil V3 (route `/checkup/v3-brand`), 3ème carte « beta » sur la home avec accès au parcours V3
- T-V3-10 : page « Tous les chantiers » liste complète (placeholder pour l'instant)
- T-V3-11 : intégration backend (protocol_version, persistance, scoring) — phase suivante
- Élargir `LEVELS` dans `tokens.ts` à 5 paliers si Sébastien valide (ajout « Maîtrisé »)


### V3-brand-T-V3-9 — Page d'accueil avec 3ème carte beta V3-brand

3 livrables. Le parcours V3-brand devient accessible depuis la home en cohabitation avec V1.1.9 et V2.0.

| Livrable | Description |
|---|---|
| `wireframes/v3_home_test.html` | 305 lignes — maquette HTML autonome de la nouvelle home avec 3 cartes côte à côte. Carte V3-brand en style brand kit : fond ivoire, titre Lora, badge « Beta · Brand » en argent shimmer (linear-gradient), hover qui déclenche un shadow argent diffus + lift -2 px. Mini-preview interne navy nuit pour donner un avant-goût. Garde-fous communs en pied de page. |
| `web/app/page.tsx` | +63 lignes — modification de la home Next.js existante : élargissement du type `variant` de `"classic" \| "v2"` à `"classic" \| "v2" \| "v3"`, ajout d'un `handleStartV3` qui route vers `/checkup/v3-brand`, élargissement de la grille `md:grid-cols-2` → `md:grid-cols-3`, et adaptation du composant `VersionCard` pour rendre la 3ème variante avec son look brand. Le wording d'intro passe de « Deux versions… » à « Trois versions… ». Compile vert. |
| `web/app/checkup/v3-brand/page.tsx` | 111 lignes — route Next.js placeholder qui affiche un écran intro V3 fonctionnel (mode nuit + toggle Jour/Nuit). Le bouton `Commencer` ouvre une alert qui prévient que l'orchestration interactive complète arrive en T-V3-10/11. Lien retour vers la home. |

**Décisions implémentées (D-031 #9) :**

- Route séparée `/checkup/v3-brand` accessible uniquement depuis la 3ème carte beta — pas de modification du parcours V1.1.9 ou V2.0.
- `protocol_version` sera « v3-brand-0 » côté backend (T-V3-11 quand on intégrera).
- Pas de cohabitation BDD pour l'instant — la route placeholder n'écrit pas en base.

**Pattern visuel de la 3ème carte (différenciation brand) :**

| Élément | V1.1.9 | V2.0 | **V3-brand** |
|---|---|---|---|
| Fond | white | white | **ivoire `#f4efe5`** |
| Bordure | crème 1 px | bleu 2 px | **argent 1 px** |
| Border-radius | 12 px | 12 px | **0 (rectangulaire brand)** |
| Titre | Lora 22 px navy | Lora 22 px navy | Lora 22 px navy brand `#1a2333` |
| Badge | aucun | « Pilote » bleu rounded | **« Beta · Brand » argent shimmer rectangulaire** |
| Hover | bordure plus sombre | fond légèrement teinté | **lift -2 px + shadow argent diffus** |
| CTA | bleu V1 | bleu V2 | **navy brand `#1a2333`** |

**Reste à faire :**

- T-V3-10 : orchestration interactive de la route `/checkup/v3-brand` (state machine 28 étapes + dispatch des composants V3 selon `V3Step`)
- T-V3-11 : intégration backend (créer un endpoint `POST /v3-brand/interviews`, scoring partagé V2, persistance avec `protocol_version = "v3-brand-0"`)
- T-V3-12 : page « Tous les chantiers » liste étendue accessible depuis la page résultats


### V3-brand-T-V3-10 — Orchestration interactive complète de /checkup/v3-brand

La route placeholder créée en T-V3-9 devient un **parcours complet bout-en-bout** avec state machine fonctionnelle.

| Livrable | Description |
|---|---|
| `web/app/checkup/v3-brand/page.tsx` | 558 lignes — orchestration React qui assemble tous les composants V3 livrés (T-V3-1 à T-V3-8) dans une state machine locale. Compile vert. |

**Parcours implémenté** (sans backend, state purement React) :

```
intro ─→ profil_step1 ─→ profil_step2 ─→ energy ─→
  bloc_A ─→ transition_A ─→ bloc_B ─→ transition_B ─→ bloc_C ─→ transition_C ─→
    resultats ─→ [module ouvert] ─→ retour resultats
```

**Helpers locaux (T-V3-10) :**

- `buildLocalScores(answers)` — calcule les scores 0-100 par axe depuis les options sélectionnées du `protocol_data`. Formule : moyenne(opt.score) / 4 × 100. Renvoie aussi `completeness` (ratio 0-1 par bloc).
- `buildV2ScoresShim(local)` — wrappe les scores locaux en `V2Scores` minimal (A/B/C = null, completeness rempli) pour satisfaire la signature de `Topbar` qui consomme `progressIndex` (lequel n'utilise que `completeness`).
- `buildMotivPhrase(motivation, status)` — assemble la phrase de motivation enrichie depuis les chips du profil step1/2 (fusion B confirmée en T-V3-7-fix-6).
- `OPPS_CATALOG` + `pickOpps(local, max)` — catalogue local de 7 opportunités avec conditions sur les niveaux 0-3 + gains chiffrés (temps + €). Retourne les 4 premières qui matchent, la 1ère étant `recommended`.

**State (useState) :**

| Variable | Rôle |
|---|---|
| `theme` | jour / nuit (toggle global) |
| `step` | V3Step courant — pilote le rendu |
| `profile` | `UserProfile` partiel (chips factuels en mono-select) |
| `extras` | `Record<string, string \| string[]>` — chips multi-select (logiciels, RDV, horizon, motivation) + energy |
| `answers` | qid → optionId pour les 18 questions des blocs |
| `openModuleId` | si non-null, on bascule en mode module au-dessus des résultats |
| `startedAt` | timestamp pour calculer la durée affichée sur les résultats |

**Handlers de navigation** : 5 onSubmit par écran + onBlocAnswer + onTransitionNext, tous compatibles avec les composants V3 qui gèrent leur propre validation locale. Bouton « Précédent » câblé partout.

**Mode résultats** assemble dynamiquement toutes les props de `ResultatsV3` :
- Date de complétion + durée calculée
- Phrase motivation enrichie
- Phrase choc + body en signal-warn (3 annotations radar codées en dur pour la démo : 2 critiques + 1 warn croisé BC)
- Bilan global (3 forces + 3 risques avec risk-badge)
- 12 phrases AXIS_PHRASES par niveau (forces + marges) — fournies depuis le composant `ResultatsV3` lui-même
- `pickOpps` qui filtre dynamiquement les opportunités selon les scores

**Mode module** (cliquer un chantier) :
- `setOpenModuleId(oppId)` bascule en mode module
- `ModuleV3` rendu en pleine page avec onBack pour revenir aux résultats
- Le tag temporel des étapes (quick/medium/invest) est coloré par sévérité

**Limites assumées (à compléter en T-V3-11) :**

- Aucun appel backend — toute la state est en mémoire React, perdue à chaque refresh.
- Phrase choc, bilan global et annotations radar sont **codés en dur** pour la démo (à dériver des signaux croisés en T-V3-11 selon les scores réels).
- Boutons « En autonomie », « Lugia », « Tous les chantiers » ouvrent juste une alert (Calendly + page liste viendront en T-V3-11 / T-V3-12).
- `print()` pour le module fonctionne nativement mais sans feuille print dédiée.

**Le parcours V3-brand est désormais fonctionnel** : Sébastien peut tester la route `/checkup/v3-brand` localement (`npm run dev` dans `web/`) et naviguer de bout en bout.


### V3-brand-T-V3-10-fix — Régénérer protocol_data.ts (options des questions étaient vides)

Bug T-V3-6 trouvé en testant T-V3-10 : impossible de répondre aux questions des blocs A/B/C, parce que toutes les options de réponse étaient vides dans `lib/v3/protocol_data.ts`. Les libellés des questions étaient OK, donc le bug est passé inaperçu jusqu'au premier test interactif.

**Cause** : le script Python d'extraction utilisait les anciens noms de champs (`q.get('opts')`, `o.get('t')`) alors que le JSON `interview_protocol_v2.json` utilise `q.options` et `o.label`. Toutes les itérations sur `q.get('opts', [])` retournaient `[]`, donc les options finissaient dans un tableau vide côté TS.

**Fix** : `lib/v3/protocol_data.ts` régénéré avec les bons noms de champs (`options`, `label`, `s`, `reformulation`, `benchmark.texte`). 18 questions × 4 options = **72 options** correctement importées. La page `/checkup/v3-brand` est désormais navigable bout-en-bout.


### V3-brand-T-V3-10-fix-2 — Scores null pour blocs non démarrés + radar live sticky pendant les blocs

| Bug | Cause | Fix |
|---|---|---|
| À transition_A, les axes B et C non démarrés s'affichaient « Fragile » (axe rouge dans la card score) au lieu de « — » | `numScores` retournait `{ A, B, C: 0 }` quand un bloc n'avait pas commencé. `BlockTransitionV3` reçoit `scores: { A: number \| null }` et n'affiche « — » que si null — un 0 numérique est traité comme un score réel et `levelOf(0)` retourne « Fragile ». | Nouveau `numScoresOrNull` calculé en `useMemo` qui retourne `null` quand `completeness === 0`, sinon le score numérique. Passé aux 3 `BlockTransitionV3` (transition_A/B/C). |
| Radar live sticky absent pendant les blocs A/B/C alors qu'il fait partie de l'UX V3 (« radar qui se construit pendant qu'on répond ») | `RadarLiveV3` n'était pas monté dans l'orchestration de la route. Oubli T-V3-10. | Ajout de `<RadarLiveV3 theme={theme} scores={numScoresOrNull} />` conditionnel sur `step === bloc_A/B/C`. Visible uniquement pendant les blocs (masqué sur intro/profil/energy/transitions). Le composant lui-même reste auto-masqué sous 1140 px de viewport via media query interne. |

Le radar live consomme aussi `numScoresOrNull` (null = point au centre, sinon point sur l'axe à `ratio = score/100`). Cohérent avec ce qui est attendu — au début du bloc A, A monte mais B et C restent au centre ; au cours du bloc B, B commence à se déplacer ; etc.


### V3-brand-T-V3-10-fix-3 — Logo cliquable + scroll-top + boundary d'erreur pour debug du crash résultats

| # | Bug | Correction |
|---|---|---|
| 1 | Logo Lugia dans la Topbar non cliquable | Nouvelle prop `onHomeClick?: () => void` ajoutée à `Topbar.tsx`. Si fournie, la marque (logo + nom) devient un `<button>` cliquable avec opacity 0.7 au hover. Sur la route `/checkup/v3-brand`, on passe `() => router.push("/")` qui ramène à la home. |
| 2 | Scroll restait là où il était au changement d'étape | `useEffect` ajouté dans la page V3-brand qui appelle `window.scrollTo({ top: 0, behavior: "instant" })` à chaque changement de `step` ou de `openModuleId`. Les écrans commencent maintenant tous en haut. |
| 3 | Crash runtime sur la page résultats (cause inconnue, build Next ne tourne pas dans la sandbox pour le reproduire) | Création d'un boundary d'erreur Next.js `app/checkup/v3-brand/error.tsx` qui capture les crashes runtime au lieu de la page blanche. Affiche : message d'erreur en mono, stack trace dans un `<details>` repliable, digest, deux boutons « Réessayer » + « Retour à l'accueil ». Quand le crash se produit, Sébastien verra l'erreur précise pour qu'on puisse cibler le fix dans une passe suivante. |

**Note debug** : le tsc passe vert et l'audit défensif (vérification des `as const`, fallbacks pour scores nullables, types stricts) n'a rien révélé. Le crash est très probablement sur un cas spécifique de rendu (ex. un index dynamique sur palette ou un cas null non couvert). L'error boundary va exposer l'erreur précise au prochain run.


### V3-brand-T-V3-10-fix-4 — Radar agrandi + retrait du + sur axis cards + vignettes niveaux

| # | Correction | Détail |
|---|---|---|
| 1 | Radar trop petit / polygone écrasé | `R` passé de 155 à 200 dans le SVG 860×480. Le polygone occupe désormais une part bien plus visible du viewBox, et reste lisible quand le SVG est contraint à 680 px par le shell de page. Dots agrandis de r=8→10 (avec trou central r=3.5→4.5) et midBC de r=6→7 — meilleure proportion visuelle. |
| 2 | Toggle « + » retiré sur les axis cards | L'affordance de dépli reste portée par la phrase « ↓ Forces & pistes d'action » qui apparaît quand la card est collapsed. Visuellement plus calme — le niveau de maturité devient l'élément focal à droite du titre. |
| 3 | Niveaux de maturité en vignette pill | Le simple texte mono caps coloré devient une vignette : padding 3×10 px, bordure 1 px couleur axe, background `color-mix(axe, 12%, transparent)`, font-weight 600, et un petit dot 5×5 px à gauche (currentColor). Format aligné sur les `RiskBadge` et le badge de pastille recommandé — cohérence visuelle des badges dans la page. |

Compile vert. Recharge `/checkup/v3-brand` jusqu'à la page résultats — radar plus présent, axis cards plus calmes, niveaux mieux signalés.


### V3-brand-T-V3-11 — Phase 1 : branchement éditorial dynamique page résultats

Le contenu de la page résultats est maintenant **entièrement dérivé** des scores réels et du profil. Plus de contenu figé sur le scénario type — chaque médecin avec un profil différent verra une analyse différente.

| Livrable | Description |
|---|---|
| `web/lib/v3/axis_details_data.ts` | 217 lignes — référentiel central des 12 combinaisons axe × niveau (3 axes A/B/C × 4 niveaux Fragile / En transition / Solide / Mature). Chaque combo porte : `summary` (1 phrase contextuelle), `forces[]` (2-3 bullets), `marges[{text, risk}]` (2-3 bullets avec niveau de risque). Helper `getAxisDetail(axis, level)`. |
| `web/lib/v3/signals_data.ts` | Étendu de 98 → 226 lignes. Chaque signal porte désormais 5 nouveaux champs : `phraseChocBefore` + `phraseChocAfter` (texte de la phrase choc avec emphase en --warn), `bilanForces[]` + `bilanRisques[]` (items du bilan global), `radarAnnotations[]` (jusqu'à 3 callouts radar). 7 signaux entièrement remplis (6 conditionnels + fallback). |
| `web/app/checkup/v3-brand/page.tsx` | Section « Mode résultats » réécrite : 50 lignes de contenu hardcodé remplacées par 10 lignes qui appellent `pickSignal(numScores)` et `getAxisDetail(axis, level)`. Tout le contenu vient désormais des data files. |

**Avant / après :**

| Élément | Avant T-V3-11 | Après T-V3-11 |
|---|---|---|
| Phrase choc | Texte fixe « Paradoxe : bon parcours patient... » | Dérivée du signal qui matche (7 variantes éditoriales) |
| Bilan global | 3 forces + 3 risques fixes | Forces/risques agrégés du signal détecté |
| Annotations radar | 3 callouts fixes (B, C, BC) | Annotations dynamiques selon le signal (jusqu'à 3) |
| AxisDetail (forces + marges par axe) | 3 axisXDetail fixes pour le scénario Solide/Transition/Transition | 12 combinaisons axe × niveau, sélectionnées par `levelOf(score)` |
| Niveau qualitatif (« Fragile », « Solide », ...) | Déjà dynamique | Inchangé (depuis levelOf) |
| Scores numériques + opportunités | Déjà dynamiques | Inchangé |

**Couverture éditoriale du premier jet :**

- 7 signaux × 5 champs (title, body, phraseChoc avant/après, bilan forces, bilan risques, radar annotations) ≈ 35 paragraphes ou listes
- 12 axis_details × (summary + forces + marges) ≈ 36 entrées
- Total : ~70 unités de contenu écrites en premier jet à passer au filtre brand (charte questionnaire + voix confrère)

**Reste à faire (Phase 1) :**

- **Passe éditoriale** : Sébastien repasse les ~70 unités pour les aligner sur le ton brand (« confrère expérimenté », vocabulaire à privilégier, pas de jargon, pas d'italique)
- Possible affinage des conditions des signaux si certains profils ne matchent pas le bon scénario

**Reste à faire (Phases 2-5) :**

- Phase 2 : pages « Tous les chantiers », « Discussion autonome », intégration Calendly
- Phase 3 : backend V3-brand (persistance, scoring partagé, reprise de session)
- Phase 4 : sourcing benchmarks + pilote terrain
- Phase 5 : mise en prod


### V3-brand-T-V3-12 — Page « Tous les chantiers » + extraction opps_catalog

Phase 2 amorcée. Le bouton « Voir tous les chantiers » de la page résultats ouvre désormais une vraie page listant les 7 chantiers groupés par axe.

| Livrable | Description |
|---|---|
| `web/lib/v3/opps_catalog.ts` | 146 lignes — catalogue partagé des 7 chantiers (extrait du `OPPS_CATALOG` local de la page V3-brand). Type `V3OppEntry` complet (icon, axis, title, desc, effort, delai, gainTime, gainEuros, cond). 3 helpers : `pickOppsFromScores(scores, max)` pour la page résultats (filtrée), `getOpp(id)` pour la page module, `listAllOpps()` pour la liste complète (triée par axe puis effort croissant). |
| `web/components/v3/ListChantiersV3.tsx` | 296 lignes — page liste avec bouton retour discret, eyebrow « Tous les chantiers », titre « Sept chantiers, trois axes. », phrase contextuelle, **3 sections par axe** (Parcours patient vert, Équipe bleu, Outils orange) avec eyebrow coloré + filet à droite, et `ChantierCard` par chantier (icon, titre serif, desc, métadonnées Effort/Délai/Gain avec hover translateX 2px + shadow). |
| `web/app/checkup/v3-brand/page.tsx` | Refactor : (a) OPPS_CATALOG local supprimé (113 lignes en moins), `pickOpps` réduit à 18 lignes qui délègue à `pickOppsFromScores`, (b) nouveau state `listChantiersOpen: boolean`, (c) nouveau sub-mode prioritaire avant `module` qui rend `<ListChantiersV3>`, (d) le bouton « Voir tous les chantiers » bascule en `setListChantiersOpen(true)`, (e) click sur un chantier dans la liste → ferme la liste + ouvre le module correspondant, (f) bouton retour ramène à la page résultats. |

**Navigation depuis la page résultats :**

```
Résultats
  │
  ├─ click sur opp-card prioritaire ────→ ModuleV3 (plan d'action)
  │
  └─ click « Voir tous les chantiers » ──→ ListChantiersV3
                                              │
                                              ├─ click sur un chantier ──→ ModuleV3
                                              └─ click « ← Retour » ─────→ Résultats
```

Le sub-mode `listChantiersOpen` prend le pas sur tout le reste (intro, profil, blocs, résultats, module) pour éviter les flashes d'écran intermédiaires lors de la navigation. Le scroll-top automatique gère le passage entre sub-modes.

**Reste Phase 2 :**

- Page « Discussion autonome avec assistant Lugia » (parcours LLM-chat avec le chantier choisi) — nécessite un backend LLM
- Intégration Calendly pour le bouton « Prendre rendez-vous »


### V3-brand-T-V3-13 — Intégration Calendly sur les boutons Lugia

Les boutons « Prendre rendez-vous → » (page résultats) et « En parler avec Lugia → » (page module) ouvrent désormais Calendly dans un nouvel onglet.

| Livrable | Description |
|---|---|
| `web/lib/v3/links.ts` | 49 lignes — `LUGIA_CALENDLY_URL` configurable via `NEXT_PUBLIC_LUGIA_CALENDLY_URL` avec fallback placeholder `https://calendly.com/lugia-and-co/diagnostic`. Helper `openCalendly({ chantierId?, firstname? })` qui ouvre dans un nouvel onglet avec `noopener,noreferrer`. Ajoute automatiquement `utm_source=v3-brand` et `utm_content=<chantierId>` quand un chantier est ouvert — permettra côté Calendly de savoir d'où vient la prise de rendez-vous (page résultats globale vs. module spécifique). Ajoute aussi `name=<firstname>` pour pré-remplir le formulaire Calendly. |
| `web/app/checkup/v3-brand/page.tsx` | 2 `alert()` placeholder remplacés par des appels à `openCalendly()`. Le bouton Lugia du module passe l'id du chantier, celui de la page résultats passe juste le prénom. |

**Configuration côté prod :**

Pour pointer vers le vrai Calendly Lugia, ajouter dans `.env.local` (dev) ou les variables d'environnement Vercel (prod) :

```
NEXT_PUBLIC_LUGIA_CALENDLY_URL=https://calendly.com/<slug>/<event>
```

Sans cette variable, l'URL placeholder est utilisée (renvoie un 404 Calendly tant que le slug n'existe pas). Pas de blocage UX — le bouton fonctionne, mais arrive sur une page 404 jusqu'à ce que Sébastien crée le bon créneau côté Calendly et fixe la variable.

**Pas de widget embed** — ouverture dans un nouvel onglet. Évite l'ajout d'un script externe (Calendly Widget JS), préserve les performances et la confidentialité (pas de tracker Calendly chargé tant que l'utilisateur ne clique pas).

**Reste de la Phase 2 :**

- Discussion autonome avec assistant Lugia (LLM-chat) — nécessite un backend LLM, attente Phase 3.


### V3-brand-T-V3-14 — Backend V3-brand : extension protocol_version + dispatchers scoring/report

Phase 3 amorcée. Le backend FastAPI accepte désormais `protocol_version = "v3-brand-0"` et dispatch correctement scoring + report. La home Next.js crée une vraie interview V3 en BDD au lieu de juste router.

| Livrable | Description |
|---|---|
| `backend/main.py` | (a) `_SUPPORTED_PROTOCOL_VERSIONS` étendu à `("v1.1.9", "v2.0", "v3-brand-0")`, (b) dispatcher scoring V3 réutilise `v2_scoring.compute_all_scores` (D-031 #9 — scoring partagé V2/V3), (c) dispatcher report V3 retourne un payload **minimal** : `interview` meta + `profile` + `scores` + `answers`. Volontairement pas de phrase choc / bilan / axis_details / opps côté backend — ils sont assemblés côté client via `lib/v3/signals_data.ts`, `axis_details_data.ts`, `opps_catalog.ts`. Évite de dupliquer le référentiel éditorial en Python. |
| `web/lib/api.ts` | Ajout de `createInterviewV3()` (POST /interviews avec `protocol_version: "v3-brand-0"`), `getReportV3(interviewId)` (GET /interviews/{id}/report typé `V3BrandReport`), et du type `V3BrandReport`. |
| `web/app/page.tsx` | `handleStartV3` passe d'un simple `router.push` à un `await createInterviewV3()` qui crée la session en BDD puis route avec `?interview=<id>`. Ajout de `handleResumeV3()` qui route vers `/checkup/v3-brand?interview=<id>&view=results` si la session est completed, sinon juste avec l'id. Lecture de `actives["v3-brand-0"]` pour afficher l'état de la session V3 sur la 3ème carte. |

**Architecture confirmée (D-031 #9) :**
- **Scoring** : 100% partagé V2 / V3-brand (même 18 questions, même barème 1-4, mêmes seuils 0-100)
- **Référentiel éditorial** : côté frontend uniquement (signals, axis_details, opps_catalog en TS dans `lib/v3/`)
- **Backend V3-brand** : minimaliste — il ne sert qu'à persister les réponses et restituer les scores. Pas de logique éditoriale dupliquée en Python.

**Migration BDD** : aucune nécessaire. La colonne `protocol_version` accepte déjà n'importe quelle valeur texte (ajoutée en V2.0-T3). Il suffit de lui passer `v3-brand-0` côté backend.

**Pas encore branché (T-V3-15) :**
- Persistance dans `app/checkup/v3-brand/page.tsx` : lire `?interview=<id>` depuis l'URL, charger le profil + answers existants, persister à chaque action (PUT /interviews/{id}/answers/{qid}, PATCH /me/profile). La state machine actuelle reste 100 % React local — quand l'utilisateur refresh, il perd tout. Le branchement vient en T-V3-15.


### V3-brand-T-V3-15 — Persistance backend dans /checkup/v3-brand

Le parcours V3-brand passe en mode persistant : si l'utilisateur refresh, ferme l'onglet ou revient plus tard, son interview est retrouvée (profil + réponses + énergie).

**Mécanique** :
- `app/page.tsx` : `handleStartV3()` devient async — il appelle d'abord `createInterviewV3()`, puis fait `router.push("/checkup/v3-brand?interview=<id>")`. `handleResumeV3` ajoute juste le paramètre `?interview=<id>` à l'URL pour reprendre une session existante (lue depuis `getActiveInterviewsByVersion()`).
- `app/checkup/v3-brand/page.tsx` : nouveau `useEffect` de bootstrap au mount :
  1. Lit `?interview=` dans la query string. Si absent, crée une interview V3 et met l'URL à jour via `window.history.replaceState` (pas de history push — on conserve l'URL propre).
  2. Charge le profil via `getMyProfile()` et merge sur le state local (préserve `firstname` et chips déjà saisies dans une session précédente).
  3. Charge les réponses persistées via `listAnswers(id)` (tableau `(Answer & { question_id, id })[]`) et reconstruit un `Record<question_id, option_id>` exploitable par le state local. Au passage, si `energy` a été répondue, elle est restaurée dans `extras`.
  4. Si `?view=results` est présent, bascule directement sur l'étape `resultats` (utilisé par la 3ème carte de l'accueil quand on vient revoir une interview complétée).
  5. Si le backend est KO (mode démo offline), `console.warn` silencieux — le parcours continue 100 % local. L'utilisateur n'est jamais bloqué par une panne backend.
- Chaque handler (`onStep1Submit`, `onStep2Submit`, `onEnergySubmit`, `onBlocAnswer`) déclenche un appel best-effort en parallèle :
  - profil → `patchMyProfileV2(updates)` (ne réenvoie que les champs modifiés).
  - énergie → `saveAnswer(id, "energy", { mode: "A", scored: false, ... })` avec label retrouvé dans `ENERGY_FIELD`.
  - bloc → `saveAnswer(id, qid, { mode: A|B|C dérivé du préfixe qid, scored: true, ... })` avec label retrouvé via `getBloc(blocId).questions`.
- Le passage à `transition_C` déclenche `completeInterview(id)` en best-effort pour que la session passe en `status=completed` côté backend.

**Choix de design** :
- Le scoring + le contenu éditorial restent calculés **côté frontend** (à partir de `lib/v3/*`) — le backend ne stocke que les réponses brutes. Cela évite de dupliquer signals_data, axis_details_data et opps_catalog en Python. Le frontend assemble la page résultats dynamiquement à partir des scores locaux.
- Tous les appels backend sont best-effort (`.catch(console.warn)`) : on ne bloque jamais le parcours sur une panne réseau. Une connexion intermittente ne casse pas l'expérience utilisateur — la persistance reprendra dès que possible.
- Le bootstrap utilise une variable `cancelled` pour éviter les setState après unmount (cleanup proprement). `isHydrating` est tenue à jour mais pas (encore) utilisée pour bloquer l'UI — le mode démo doit pouvoir avancer même sans backend.

**Fichiers modifiés** :
- `web/lib/api.ts` : ajout de `createInterviewV3()`, `getReportV3()`, type `V3BrandReport` (déjà fait en T-V3-14 — rappel).
- `web/app/page.tsx` : `handleStartV3` async + `handleResumeV3` + lecture `actives["v3-brand-0"]`.
- `web/app/checkup/v3-brand/page.tsx` : +90 lignes (imports `useSearchParams`, `Answer`, `ENERGY_FIELD`, `createInterviewV3`, `getMyProfile`, `patchMyProfileV2`, `listAnswers`, `saveAnswer`, `completeInterview` ; state `interviewId` + `isHydrating` ; useEffect bootstrap ; instrumentation des 4 handlers ; `completeInterview` au passage de transition_C).

**Vérifié** : `npx tsc --noEmit` passe sans erreur (les seules sorties sont les TS6053 sur `.next/types/*.d 2.ts` — artefacts du cache build, sans rapport avec notre code).


## 2026-05-19 — V2.0 : passe éditoriale complète + guide de relecture pour pilote

Refonte V2.0 du check-up amorcée (cf D-029). Trois livrables rédactionnels produits dans la journée + démarrage de l'intégration technique en soirée (sous-vague T1 livrée) suite à l'inversion de séquence D-030.

### V2.0-T5-fix — accueil : sessions en cours par version (pas une seule globale)

Sébastien constate qu'avec une V1.1.9 en cours ET une V2.0 en cours, l'accueil n'affichait qu'une seule session "active" (la plus récente updatée). L'utilisateur ne pouvait donc pas reprendre celle des deux qu'il voulait.

**Backend** :
- `src/db.py` : nouveau helper `get_in_progress_interviews_by_version(email)` qui retourne un dict `{version: Interview}` — pour chaque version, l'interview `in_progress` la plus récente du user (ou une seule si plusieurs in_progress sur la même version, ce qui ne devrait pas arriver mais est géré).
- `backend/main.py` : nouvel endpoint `GET /interviews/actives` (pluriel) qui expose ce dict. L'endpoint legacy `GET /interviews/active` (singulier) reste en place pour compat — il continue de renvoyer la plus récente toutes versions confondues.

**Frontend** :
- `web/lib/api.ts` : type `ActiveInterviewsByVersion = Partial<Record<string, Interview>>` + fonction `getActiveInterviewsByVersion()`.
- `web/app/page.tsx` réécrit : retrait du bandeau "Session en cours" en tête, refonte avec un composant `<VersionCard>` réutilisé pour les 2 cartes. Chaque carte affiche :
  - Si pas de session active pour cette version : eyebrow + titre + description + pills + CTA "Commencer →" ou "Essayer la nouvelle version →".
  - Si une session est en cours : encart "Session en cours" intégré sous les pills (date + position pour V1, juste date pour V2 vu que V2 a son `resumeStep` interne), CTA "Reprendre →" (ou "Voir mes résultats →" si la session est completed) à la place du CTA de démarrage. Fond de carte légèrement teinté `#fbf9f1`.
- Routing intelligent : `pathForResumeV1` pointe vers `/checkup?interview={id}` ou `/resultats?interview={id}` selon `current_question_index >= 14`. `pathForResumeV2` pointe vers `/checkup/v2` (la machine à états V2 `resumeStep` choisit l'étape) ou `/resultats/v2?id={id}` si `status === 'completed'`.

**Tests validés** (5 scénarios end-to-end via TestClient) :
- 0 session → dict vide.
- 1 session V1.1.9 → `{v1.1.9: ...}`.
- 1 V1.1.9 + 1 V2.0 → dict avec les 2 clés, chacune pointant sur la bonne interview.
- Compléter V1.1.9 → la clé `v1.1.9` disparaît du dict, `v2.0` reste.
- Legacy `/interviews/active` (singulier) reste fonctionnel et renvoie V2.0 (la plus récente in_progress).

TypeScript strict : 0 erreur.

### V1.1.9-revision — retrait Q15/Q16/Q17 (dormantes)

Sébastien constate en testant V1.1.9 que les 3 questions de contexte (Q15 statut, Q16 territoire, Q17 horizon) ajoutées en v1.10 polluent le parcours classique. Elles étaient marquées comme **dormantes** (collectées en BDD mais non câblées dans les rapports — substrat différé pour V1.2 SLM cf D-020 et D-028). Or l'information équivalente est désormais portée par le mini-onboarding profil V2.0 (chips factuels `cabinet_type` + chips réflexifs `status` / `territoire` / `horizon`), ce qui rend la collecte côté V1.1.9 doublement redondante.

**Décision Sébastien** : V1.1.9 doit être strictement les 14 questions d'origine. Les reformulations Q01 (réordering) et Q02 (libellés) introduites en v1.10 sont préservées — elles font partie de la V1.1.9 visuelle stricto sensu.

**Fichiers modifiés** :
- `resources/interview_protocol.json` v1.10 → v1.11 : retrait des 3 entrées q15/q16/q17, repositionnement de q03..q14 en positions 3..14, `total_questions: 17 → 14`.
- `resources/interview_protocol.md` : note v1.10 → v1.11 expliquant la révision post-V2.0, distribution refondue (11 A + 2 B + 1 C, alternance `A A A A B A A A A A A A B C`), retrait des 3 sections Q15/Q16/Q17 + des 3 lignes correspondantes dans le persona Chateau, renumérotation des positions, titre `Les 17 questions → Les 14 questions`.
- `scripts/seed_persona.py` : retrait des 3 entrées ANSWERS pour q15/q16/q17, docstring mise à jour.
- `resources/sample_answers_pchateau.md` v2.5 → v2.6 : retrait des 3 lignes dans la table, retrait des 3 sections détail, titre `Détail des 17 réponses → Détail des 14 réponses`, note mise à jour.

**Validation** :
- `python3 src/questions.py` → `OK — JSON et .md cohérents (14 questions).`
- `check_md_json_consistency()` → `True`, aucune erreur.
- Seed Chateau insère bien 14 réponses (IDs séquentiels q01..q14).
- `dump_report` génère un rapport de 5 757 caractères sans aucune référence q15/q16/q17 et sans erreur.
- Scores facettes inchangés : processes 3 (raw_mean 3.33), participants 3 (3.33), information 3 (2.75).
- Le hash sha256 du rapport diffère de l'ancien (puisque les options Q15/Q16/Q17 ne sont plus dans la BDD), mais la structure et le contenu du rapport sont strictement identiques à V1.1.8 ergonomiquement.

**Impact prod** : la migration BDD T3 n'est pas touchée — les colonnes `protocol_version`, `scored`, et les 10 colonnes V2 de `user_profile` restent. Les interviews existantes qui ont des answers q15/q16/q17 conservent ces données en BDD (sans impact — `dump_report` ignore les question_id absents du protocole courant), mais aucune nouvelle interview V1.1.9 n'en collectera plus.

### V2.0-T4g — page dédiée /modules/[id] (détail d'un module)

Complète T4e. La page résultats V2 affichait jusqu'ici les cartes-résumé des opportunités sans permettre d'accéder au détail des 4 étapes + benchmark de conclusion. Cette sous-vague livre la page dédiée prévue par la spec V2 §11.5 et rend les cartes cliquables.

**`backend/main.py`** :
- Import `from src.v2 import modules as v2_modules`.
- Nouveaux endpoints publics (pas d'auth — contenu statique partageable) :
  - `GET /modules` retourne la liste complète des 7 modules (cf `modules_v2.json`).
  - `GET /modules/{module_id}` retourne le détail d'un module. 404 si l'id n'existe pas.

**`web/lib/api.ts`** :
- Nouveau type `V2ModulesPayload` (wrapping du JSON `modules_v2.json`).
- Fonctions `listModulesV2()` et `getModuleV2(moduleId)`.

**`web/app/modules/[id]/page.tsx`** (~180 lignes, nouvelle page Next.js) :
- Route dynamique `/modules/{urgences|chroniques|delegation|comm|logiciel|admin|pilotage}`.
- Hero : eyebrow accent bleu « Module d'approfondissement », titre serif avec icône, méta `EffortPips + impact + N étapes`.
- 4 étapes numérotées : grand chiffre serif `01/02/03/04`, titre, pill colorée selon tag temporalité (`quick` vert / `medium` ambre / `invest` bleu) avec libellé complet, body en prose.
- Encadré ambré « Repère terrain » avec le benchmark de conclusion et marqueur `[À confirmer]` si applicable.
- Lien retour `router.back()` en tête + note de partage en pied (URL publique partageable avec un associé sans connexion requise).
- Gestion d'erreur 404 explicite (« Ce module n'existe pas »).

**`web/components/v2/ResultatsV2.tsx`** :
- Import `Link from "next/link"`.
- `ChantierCard` (section III opportunités) devient un `<Link href={`/modules/${mod.id}`}>` cliquable avec hover bg-white/70 + bordure plus marquée + CTA « Voir le détail → » accent bleu sous le bloc méta.
- `ModuleSummary` (section IV grille tous chantiers) devient également un `<Link>` cliquable avec hover.

**Validation** :
- TypeScript strict : `tsc --noEmit -p .` → 0 erreur.
- API : `GET /modules` retourne les 7 IDs, `GET /modules/comm` retourne le détail complet (label, 4 étapes avec tags `['quick', 'quick', 'medium', 'medium']`, benchmark `to_confirm`), `GET /modules/inconnu` → 404 avec detail explicite.

### V2.0-T5-fix — bugfix runtime sur /checkup/v2 (optional chaining)

Erreur runtime remontée en dev par Sébastien sur la page `/checkup/v2` au premier chargement : *« undefined is not an object (evaluating 'protocol?.blocks.find') »* à `app/checkup/v2/page.tsx:190`. Cause : `blockA/B/C` étaient calculés à chaque render avec `protocol?.blocks.find(...)`, y compris pendant l'état initial où `protocol === null`. La spec ECMAScript prévoit que la chaîne court-circuite proprement (`null?.blocks.find()` retourne `undefined`), mais Turbopack/Next 16 + WebKit ne propage pas le short-circuit comme attendu dans ce cas précis.

Correction : déplacement des 3 lignes `const blockA/B/C = protocol.blocks.find(...) ?? null` **sous** l'early return `if (!protocol || !profile) return null;`. À ce point `protocol` est garanti non-nul, on peut supprimer l'optional chaining. Plus de risque d'évaluer `.find(...)` sur undefined.

Aucun impact sur les autres composants V2 — TypeScript reste à 0 erreur.

### V2.0-T5 — page d'accueil 2 cartes (V1.1.9 / V2.0)

Refonte de `app/page.tsx` pour permettre au médecin testeur de choisir entre les deux versions du check-up. Cf D-029 et spec V2 §11.5.

**`web/lib/api.ts`** :
- Type `Interview` étendu avec `protocol_version?: string` (optionnel pour préserver la compat — le backend l'expose toujours depuis T3 grâce à `interview.protocol_version NOT NULL DEFAULT 'v1.1.9'`).

**`web/app/page.tsx`** réécrit (~245 lignes) :
- Hero épuré avec phrase d'accroche.
- Bandeau « Session en cours » conditionnel — affiche la version (Check-up classique / Nouvelle version), la date de démarrage, et un CTA « Reprendre » qui route vers `/checkup`, `/checkup/v2`, `/resultats?interview=...` ou `/resultats/v2?id=...` selon `protocol_version` et `status` (via `pathForResume`).
- 2 cartes côte à côte (`grid-cols-1 md:grid-cols-2`) :
  - **Check-up classique** (V1.1.9) — eyebrow gris « Version actuelle », titre serif, 2 pills `14 questions` + `~25 min`, CTA bleu. Au clic : `createInterview()` puis `router.push('/checkup?interview=...')`.
  - **Diagnostic organisationnel V2** (V2.0) — badge `Pilote` accent bleu en haut à droite, bordure 2px bleue, eyebrow bleu « Nouvelle version », 3 pills `18 questions` + `~25 min` + `Radar live`, CTA. Au clic : `createInterviewV2()` puis `router.push('/checkup/v2')`.
- Carte « Vos garde-fous (les deux versions) » sous les cartes (aucune donnée patient / pas de diagnostic médical / reprise possible).
- État `workingPath: 'classic' | 'v2' | null` partagé entre les 2 cartes pour désactiver les boutons pendant la création.
- Helper `Pill` réutilisé pour les badges de spec.

**Validation** :
- TypeScript strict : `tsc --noEmit -p .` → 0 erreur.
- Test API : `GET /interviews/active` expose bien `protocol_version` (déjà présent en BDD depuis T3). Scénario validé : V1.1.9 créée → reportée comme `v1.1.9` ; V1.1.9 completed + V2.0 créée → V2.0 devient l'active. Le bandeau de reprise peut donc router correctement.

**Substrat livré pour T6** — la page d'accueil ne dépend plus que du backend déjà en place (T3 + T4a). T6 est purement opérationnel : migration prod, déploiement Vercel + Render, smoke test cohabitation.

### V2.0-T4c/d/e/f — composants Next.js V2 + orchestrateur + page résultats + test bout en bout

3 vagues UI livrées d'un trait — la totalité du parcours V2 est codée et fonctionnelle.

**`web/components/v2/`** — 11 composants :
- `IntroV2.tsx` (~80 lignes) — page d'intro 4 cartes promesses (Adaptatif / Terrain / Croisé / Actionnable), CTA pilule sombre.
- `ChipsField.tsx` (~55 lignes) — composant chips réutilisable avec free_text optionnel pour l'option « Autre ».
- `ProfilStep1.tsx` (~90 lignes) — 5 chips factuels (cabinet_type / volume / paramedical_team / logiciel_metier / rdv_canal), validation côté client.
- `ProfilStep2.tsx` (~70 lignes) — 4 chips réflexifs (status / territoire / horizon / motivation), bouton retour étape 1.
- `Energie.tsx` (~80 lignes) — 1 question 4 options non scorée, check-mark accent bleu, CTA Continuer explicite.
- `OptionCardV2.tsx` (~140 lignes) — option avec check-mark, **reformulation terrain inline** apparaissant sous l'option sélectionnée, **benchmark ambré** conditionnel avec marqueur `[À confirmer]` quand `source_status='to_confirm'`, support `has_entity_field` (V1.1.5-i préservé), animations CSS-in-JS avec respect `prefers-reduced-motion`.
- `BlocQuestion.tsx` (~130 lignes) — **format bloc-entier** (6 questions rendues sur la même page), persistance immédiate de chaque réponse via `onAnswer`, **auto-scroll 250ms** après chaque clic (`window.scrollBy` smooth pour positionner le bas de la carte répondue à 70 % du viewport, désactivé si `prefers-reduced-motion: reduce`), bouton « Bloc suivant » actif uniquement quand les 6 sont répondues.
- `RadarAside.tsx` + `RadarTopbar` (~190 lignes) — **radar SVG dynamique** style V4 : triangle équilatéral tourné (sommet A à 0°/droite, C à 120°/haut-gauche, B à 240°/bas-gauche), **4 polygones concentriques** (25/50/75/100 %), **3 points couleur r=4** même dimension dès le départ (positionnés à 4 % du rayon si axe pas encore commencé), polygone des scores qui se construit en direct avec transitions CSS 300ms, mini-barres horizontales sous chaque axe, **aucun score numérique exposé** (D-013/D-023). `RadarTopbar` est le fallback texte uniquement pour mobile (`< 1080px`).
- `BlockTransition.tsx` (~80 lignes) — page intermédiaire entre 2 blocs, score-reveal animé sur le niveau qualitatif + le titre diagnostic du bloc tout juste complété (`v2RevealUp` 500ms ease-out staggered, désactivé en `prefers-reduced-motion`).
- `RadarResult.tsx` (~140 lignes) — radar grand format 340×340 pour la page résultats, même orientation que `RadarAside`, **labels des axes affichés sur le SVG** (contrairement à l'aside), `text-anchor` typé strict (`"start" | "middle" | "end"`).
- `ResultatsV2.tsx` (~310 lignes) — page résultats complète : bandeau remplaçant conditionnel, hero personnalisé avec prénom Dr X, phrase d'accueil italique (`motivation_intro`), radar grand format, **SignalBanner** stylé selon `tonalite` (alerte / recadrage / opportunité / positif), aparté status_junior ou status_senior, **section I « Les trois axes »** avec 3 `FacetCard` dépliables (titres diagnostic + badges asymétriques Maîtrisé/Opérationnel muets vs gris/rouille pour À surveiller/À risque), **section II « Repères terrain personnalisés »** avec les `R-bench-*` déclenchés en encadrés ambrés, **section III « Opportunités d'action »** avec les 4 premières opportunités (compute_opportunities_order côté backend) — première carte mise en avant « Recommandé pour vous » bordure bleue, **section IV « Tous les chantiers »** grille des 7 modules.

**`web/app/checkup/v2/page.tsx`** (~310 lignes) — orchestrateur du parcours V2 :
- Machine à états utilisant `V2Step` + `resumeStep` (un médecin qui revient sur son parcours reprend automatiquement au bon endroit).
- Bootstrap : `Promise.all([getProtocolV2(), getMyProfile()])` au mount.
- 9 transitions explicites : `intro → profil_step1 → profil_step2 → energy → bloc_A → transition_A → bloc_B → transition_B → bloc_C → /resultats/v2?id={iid}`.
- Création différée de l'interview V2 : à la validation de l'étape 2 du profil (et pas à l'intro), pour éviter les interviews orphelines.
- Refresh des scores en arrière-plan après chaque réponse via `getScoresV2(iid)` → mise à jour du radar live sans bloquer la saisie.
- Layout responsive : aside radar 220px visible `≥ xl (1280px)`, sinon `RadarTopbar` texte uniquement.
- Barre de progression chapitres (Profil / Ancrage / Parcours patient / Équipe & secrétariat / Outils & dossiers).

**`web/app/resultats/v2/page.tsx`** (~80 lignes) — page résultats :
- Charge `/interviews/{id}/report` au mount, redirige vers `/resultats?id={id}` (legacy) si `protocol_version !== 'v2.0'`.
- Affiche un message d'attente si `is_complete: false`.
- Délègue le rendu à `<ResultatsV2 report={report} />`.

**Validation** :
- TypeScript strict : `tsc --noEmit -p .` retourne **0 erreur** sur l'ensemble du code projet (incluant les 11 nouveaux composants V2 + 2 nouvelles pages).
- Test bout en bout via FastAPI TestClient simulant ce que le frontend fera : GET protocol V2 + GET profile + PATCH étape 1 + PATCH étape 2 + POST interview V2 + PUT 18 réponses (1 scored=false énergie + 17 scorées) + GET scores intermédiaire + POST complete + GET report. Validation des assertions clés : Chateau-style produit `A=62%/B=38%/C=54%`, niveaux qualitatifs corrects, prénom Pierre, R-bench-transmission déclenché, routing Doctolib, `opportunities_order=['comm', 'chroniques', 'delegation', 'pilotage', 'logiciel', 'admin', 'urgences']` (premier `comm` cohérent avec `motivation=charge` favor effort 1-2 + `horizon=preparer_transmission` favor B).
- Smoke build Next.js : la commande `npm run build` échoue uniquement sur le binaire SWC du sandbox Linux/arm64 (problème d'environnement, pas du code). Build OK attendu sur le MacBook.

**Reste à coder en aval** :
- T5 (page d'accueil 2 cartes V1.1.9 / V2.0) — court, désormais débloqué.
- T6 (mise en prod : migration Alembic, déploiement Vercel + Render, smoke test cohabitation).
- T7 (pilote terrain : envoi de l'URL prod + guide adapté aux 3-5 médecins testeurs).
- Sourcing benchmarks (tâche #6 en parallèle) — application des sources DREES / CNAM / CMG / URPS sur les 21 chiffres `[À confirmer]`.
- Application du brand kit Lugia en passe finale (track Communication).

### V2.0-T4b — infrastructure frontend (types TS + API client + state machine)

Préparation du socle TypeScript pour les écrans V2 (T4c-T4e). Aucun composant React produit dans cette sous-vague — uniquement les types et les fonctions utilitaires que les prochains écrans vont consommer.

**`web/lib/api.ts`** (étendu) :
- `UserProfile` enrichi des 10 champs V2 (cabinet_type, volume, paramedical_team, logiciel_metier, logiciel_metier_other, rdv_canal, status, territoire, horizon, motivation) — tous optionnels (null tant que le médecin n'a pas démarré V2.0).
- Nouveau type `UserProfilePatch` pour le patch partiel du profil.
- `patchMyProfileV2(patch)` — patch partiel multi-champs (étape 1 ou 2 indépendamment).
- `createInterviewV2()` — POST /interviews avec `{protocol_version:'v2.0'}`, retourne `{interview_id, protocol_version}`.
- `Answer` étendu avec `scored?: boolean` (défaut conservatoire true côté backend).
- Types V2 complets : `ProtocolV2`, `V2Block`, `V2Question`, `V2Option`, `V2OptionBenchmark`, `V2EnergyQuestion`, `V2RoutingRule`, `V2RenderingHints`, `V2Scores`, `V2AxisScore`, `V2Level`, `V2Signal`, `V2Tonality`, `V2EnergyPrio`, `V2MotivationPrio`, `V2HorizonPrio`, `V2Prioritization`, `V2BenchmarkCombi`, `V2RoutingMessages`, `V2ReplacementPayload`, `V2Module`, `V2ModuleStep`, `V2Report`.
- `getProtocolV2()`, `getScoresV2(iid)`, `getReportV2(iid)` — wrappers typés.
- Utilitaire pur `getVisibleQuestions(block, profile)` qui réplique côté client la logique de routing solo de `src/v2/questions.py` (b1b si cabinet_type=solo, b3 sinon). Permet au frontend de filtrer les questions sans rappel backend.

**`web/lib/v2/state.ts`** (nouveau) :
- Type `V2Step` énumérant les 10 étapes du parcours (intro → profil_step1 → profil_step2 → energy → bloc_A → transition_A → bloc_B → transition_B → bloc_C → resultats).
- Constante `V2_STEP_ORDER` — ordre canonique pour la barre de progression.
- Prédicats `isProfileStep1Complete`, `isProfileStep2Complete`, `isEnergyAnswered`, `isBlockComplete` — chacun pur, sans side-effect.
- `nextStep(current)` / `prevStep(current)` — transitions linéaires.
- `resumeStep(profile, scores, answeredIds)` — détermine l'étape initiale à servir, saute les étapes déjà complétées (un médecin qui a saisi son profil dans une session précédente reprend directement à l'énergie ou au bloc A en cours).
- `stepLabel(step)` et `stepChapter(step)` — helpers d'affichage pour la barre de progression (5 chapitres : Profil / Ancrage / Parcours patient / Équipe / Outils).

**Validation TypeScript** : `tsc --noEmit -p .` ne remonte aucune erreur sur le code projet (les warnings éventuels viennent de node_modules/next/, filtrés). 11 nouveaux exports utilitaires côté `state.ts`, ~23 types V2 + 3 fonctions API côté `api.ts`.

**Substrat livré pour T4c** — les composants Intro V2 / Profil étape 1/2 / Énergie pourront :
- `import { getProtocolV2, patchMyProfileV2, ProtocolV2, UserProfile } from "@/lib/api"`.
- `import { V2Step, isProfileStep1Complete, nextStep, stepChapter } from "@/lib/v2/state"`.
- Récupérer le protocole V2 une seule fois côté page, dériver la liste des chips à afficher depuis `protocol.profile.step1.fields`.
- Sauvegarder via `patchMyProfileV2({cabinet_type: '...', volume: '...', ...})` avec sémantique patch (l'étape 2 ne réécrase pas l'étape 1).

### V2.0-T4a — glue backend du parcours V2 (dispatcher /report + /scores + scored sur /answers)

Première sous-vague de T4 — préparation du backend pour que le frontend V2 (T4b-T4e) puisse consommer un payload propre.

**`src/v2/report.py`** (nouveau) :
- `build_report(interview, answers, profile)` — assemble le payload V2 complet : scores 3 axes + signal croisé + tonalité + prioritization + benchmarks combinatoires + routing messages + replacement + modules + opportunities_order. Pas de génération narrative — c'est le frontend qui assemble visuellement à partir du payload structuré.
- `compute_opportunities_order(profile, scores, rules_output)` — cascade de priorisation des 7 modules : R-motivation-prio puis R-horizon-prio puis R-energy-prio (max_effort) puis filtre R-replacement puis tri secondaire par score d'axe associé. Fonction pure, déterministe.

**`backend/main.py`** :
- Import des modules V2 (`src.v2.report`, `src.v2.scoring`) — inconditionnel, le dispatcher les active seulement pour les interviews `protocol_version='v2.0'`. Aucun impact V1.1.9.
- `SaveAnswerBody` reçoit le champ `scored: bool = True`. Par défaut conservatoire (préserve le comportement V1.x), permet à V2 d'envoyer `scored=False` pour l'ancrage énergie.
- `PUT /interviews/{iid}/answers/{qid}` propage `body.scored` à `db.save_answer`.
- `GET /interviews/{iid}/scores` : dispatcher. Pour V2.0 retourne `v2_scoring.compute_all_scores(answers, profile)` (payload léger 3 axes + niveaux + completeness suffisant pour le radar live). Pour V1.x : comportement legacy inchangé.
- `GET /interviews/{iid}/report` : dispatcher. Pour V2.0 retourne `v2_report.build_report(...)` (payload V2 complet). Pour V1.x : comportement legacy bit-à-bit identique. Le `global_score` V2 est persisté en BDD via `db.set_global_score` à la première lecture du rapport (pour analyses cohortes admin — jamais exposé au médecin).

**Tests end-to-end validés** (sur BDD éphémère via FastAPI TestClient) :
- Création interview V2.0 via `POST /interviews {protocol_version:'v2.0'}`.
- 18 réponses persistées dont l'énergie avec `scored=False` (vérifié en BDD : `energy.scored=0`, `a1.scored=1`).
- `GET /scores` V2 retourne A=62%/B=38%/C=54% (Chateau-style), niveaux qualitatifs Lugia, titres diagnostic, completeness 1.0 sur les 3 axes.
- `GET /report` V2 retourne le payload complet : protocol_version v2.0, doctor_firstname Pierre, tonalité status_senior, phrase d'accueil charge, R-bench-transmission déclenché (B=38 ≤ 54), routing Doctolib, opportunities_order = `['comm', 'chroniques', 'delegation', 'pilotage', 'logiciel', 'admin', 'urgences']` (cohérent — favor_modules de horizon=preparer_transmission + favor_efforts de motivation=charge promeut `comm` effort 1 en premier).
- `global_score=51` persisté en BDD côté interview.
- Non-régression V1.1.9 : `GET /report` sur une interview legacy retourne la structure `facets + synthesis + workstreams + recommendation`, sans clé `protocol_version` — comportement strictement préservé.

**Substrat livré pour T4b** — le frontend Next.js V2 pourra consommer :
- `POST /interviews` body `{protocol_version: 'v2.0'}` → crée interview V2.
- `PATCH /me/profile` → saisie en 2 étapes des chips factuels + réflexifs.
- `GET /protocol?version=v2.0` → schéma complet du questionnaire (chargé une fois).
- `PUT /interviews/{iid}/answers/{qid}` body `{scored: false}` pour l'énergie.
- `GET /interviews/{iid}/scores` → mise à jour du radar live après chaque réponse.
- `GET /interviews/{iid}/report` → payload complet pour la page résultats.

### V2.0-T2 — scoring + personnalisation backend

Package `src/v2/` créé (5 modules Python + 1 marker) qui consomme les JSON de T1 et les colonnes BDD de T3 pour produire le rapport V2.0 en règles déterministes.

**`src/v2/questions.py`** — chargement du protocole + résolution du routing solo.
- `load_protocol()` — cache singleton.
- `get_visible_questions(block_id, profile)` — applique R-routing-solo sur le bloc B (b1b XOR b3), toujours 6 questions visibles par bloc.
- `get_all_visible_question_ids(profile)` — IDs plats pour vérifier la complétude.
- `find_question(question_id)` + `get_option(question, option_id)`.

**`src/v2/scoring.py`** — % par bloc + niveaux qualitatifs.
- `score_to_level(pct)` — mapping seuils 35 / 55 / 78 (cf spec V2 §8.2).
- `score_block(block_id, answers, profile)` — formule `Σ s / (N_visible × 4) × 100`, ignore les réponses non visibles via routing.
- `compute_all_scores(answers, profile)` — payload complet 3 axes + `global_score` (non exposé au médecin) + `completeness` (utile au radar live).
- `has_three_complete_blocks(scores)` — gate pour l'orchestrateur rapport.
- `get_energy_level(answers)` — extrait l'option énergie non scorée.

**`src/v2/signals.py`** — 6 signaux croisés en cascade priorisée.
- `evaluate_signals(scores)` — premier match gagne, retour `None` si aucun pattern.
- Mini-DSL `_condition_matches` qui parse `A <= 34 AND B <= 34 AND C <= 54` depuis `diagnostics_v2.json` (opérateurs `<= >= < > ==`, liaison `AND`). Évite d'avoir à coder 6 conditions à la main et garde la spec déclarative.
- Cas limite documenté testé : A=33 B=34 C=90 → `S-burnout` exclu (C≥55), match `S-tech-vs-organisation` (recadrage plus juste que l'alerte générique).

**`src/v2/personalize.py`** — 13 règles déterministes nommées.
- Tonalité : `r_status_junior`, `r_status_senior` (3 variantes chacune, sélection déterministe par `interview_id`), `r_motivation_tone` (4 branches motivation, libellés exacts du brouillon).
- Priorisation : `r_energy_prio` (max_effort + tonalité par énergie), `r_motivation_prio` (4 stratégies dont `lowest_first` pour `motivation=risque`), `r_horizon_prio` (3 ordres de blocs selon horizon).
- Benchmarks combinatoires : `r_bench_solo_charge`, `r_bench_volume_admin`, `r_bench_transmission` (positif post-revue), `r_bench_solo_hero` (qualitatif). Tous marqués `source_status: to_confirm` ou `qualitative`. Affichés en page résultats finale uniquement (cf spec V2 §11.6).
- Routing/contexte : `r_routing_rdv` (Doctolib / Maiia nommés explicitement), `r_territoire_context` (mention sur chantiers coordination, **ne modifie jamais le score** — garde-fou documenté cf §3.3).
- Composite : `r_replacement` (bandeau + ton de découverte + modules exclus `comm` + `delegation` + fallback message).
- Orchestrateur `apply_rules(profile, scores, answers, interview_id)` → payload consolidé pour le futur `templates.py`.
- Sélection déterministe `_pick_deterministic(variants, interview_id, salt)` — réutilise la mécanique D-022 (deux médecins du même profil ne reçoivent pas la même variante, mais même interview rejoue à l'identique).

**`src/v2/modules.py`** — chargement simple des 7 modules d'approfondissement (lecture pure du JSON, pas de logique métier — la sélection arrivera dans `templates.py` à T4).

**Tests** — `tests/test_v2_scoring_personalize.py` (29 tests, tous passent) :
- Routing solo : `b1b` servi aux solos, `b3` aux non-solos, profil vide → fallback non-solo.
- Scoring : seuils 35/55/78, banker's rounding (37.5 → 38), parcours partiel renvoie `None`, b1b répondu par un MSP ignoré dans le calcul.
- Signaux : les 6 patterns validés sur scores synthétiques + cas limite S-tech-vs-organisation + scores incomplets → `None`.
- Personnalisation : 13 règles validées indépendamment + intégration `apply_rules` sur Chateau-style (senior solo transmission charge).
- Déterminisme : `r_status_senior({"status": "senior"}, 42)` rejouable à l'identique.

**Substrat livré pour T4** — le frontend pourra consommer :
- `compute_all_scores(answers, profile)` après chaque réponse pour mettre à jour le radar live.
- `evaluate_signals(scores)` à la fin du parcours pour afficher le signal croisé.
- `apply_rules(...)` pour les benchmarks combinatoires, tonalités et priorisations sur la page résultats.

Ce qui reste à coder (différé à T4 ou T2-bis si nécessaire) : `src/v2/opportunities.py` (sélection ordonnée des chantiers en consommant les payloads de priorisation), `src/v2/templates.py` (assemblage narratif final).

### V2.0-T3 — migration BDD cohabitation V1.1.9 / V2.0

Schéma BDD étendu pour permettre la cohabitation des protocoles (cf D-029 + D-030). Modifications strictement additives — aucune colonne supprimée, défauts conservatoires sur toutes les nouvelles colonnes pour préserver la compatibilité descendante.

**`src/db.py`** :
- `interview` reçoit `protocol_version TEXT NOT NULL DEFAULT 'v1.1.9'` et `global_score INTEGER` (nullable, non exposé au médecin — cf D-013, D-023).
- `answer` reçoit `scored INTEGER NOT NULL DEFAULT 1` (stocke 0/1 côté SQLite, sert l'ancrage énergie V2 non scoré).
- `user_profile` reçoit 10 colonnes V2 nullables : `cabinet_type`, `volume`, `paramedical_team`, `logiciel_metier`, `logiciel_metier_other`, `rdv_canal`, `status`, `territoire`, `horizon`, `motivation`.
- 3 helpers idempotents : `_ensure_interview_v2_columns()`, `_ensure_answer_scored_column()`, `_ensure_profile_v2_columns()`, tous appelés via `init_db()`.
- `create_interview(email, protocol_version='v1.1.9')` — paramètre ajouté, défaut conservatoire.
- `save_answer(..., scored=True)` — paramètre ajouté, défaut conservatoire.
- Nouveau helper `upsert_user_profile_v2(email, fields)` — patch partiel (les champs non passés restent inchangés), garde-fou contre injection de champs inconnus via la constante `USER_PROFILE_V2_FIELDS`.
- Nouveau helper `set_global_score(interview_id, score)`.

**`backend/main.py`** :
- `POST /interviews` accepte un body optionnel `{protocol_version: 'v1.1.9'|'v2.0'}`. Sans body → v1.1.9 par défaut (compat V1.x). Version inconnue → 400 explicite.
- Réponse `CreateInterviewResponse` étendue à `{interview_id, protocol_version}`.
- `GET /protocol?version=v2.0` retourne le protocole V2.0 (chargé depuis `resources/interview_protocol_v2.json` + cache singleton par processus). Sans `version` → V1.x legacy.
- `GET /me/profile` retourne les 12 champs (firstname + 10 V2 + email). Les champs non saisis sont à `null`.
- `PATCH /me/profile` étendu aux 11 champs en patch partiel — la saisie en 2 étapes (5 chips factuels puis 4 chips réflexifs) ne nécessite pas de renvoyer l'ensemble.
- Helper `_normalize_text(v)` partagé (trim + chaîne vide → None).

**Tests validés** (10 tests end-to-end via FastAPI TestClient + tests unitaires db) :
- Schéma sur BDD fraîche : 8 tables, toutes colonnes V2 présentes.
- Idempotence : `init_db()` re-run sans erreur ni doublon.
- Upgrade depuis BDD V1.1.9 existante : colonnes ajoutées, données legacy préservées, défauts auto-appliqués (`protocol_version='v1.1.9'` sur les interviews existantes).
- `POST /interviews` : v1.1.9 par défaut, v2.0 explicite, v9.99 → 400.
- `PATCH /me/profile` : patch partiel étape 1 puis étape 2 — étape 1 préservée.
- Sécurité : champ inconnu `evil_field` filtré silencieusement par `USER_PROFILE_V2_FIELDS`.
- Non-régression V1.1.9 : rapport Chateau de 5 757 caractères généré sans erreur sur le schéma étendu, aucune fuite de mention V2 dans le rendu V1.

### V2.0-T1 — fichiers de données JSON

Extraction du brouillon éditorial (`resources/v2_editorial_draft.md` v1.0) vers les 3 fichiers de données exploitables par le backend V2.0 :

- `resources/interview_protocol_v2.json` (49.6 KB, version 2.0) : profil 5+4 chips, ancrage énergie non scoré, 3 blocs (A Parcours patient / B Équipe & secrétariat / C Outils & dossiers), 19 IDs de questions (a1-a6 + b1+b1b+b3+b4-b7 + c1-c6) avec routing R-routing-solo position 2 du bloc B (b1b XOR b3), 76 options scorées 1-4 avec reformulation Lugia, 14 benchmarks inline marqués `source_status: to_confirm`, mécanisme `entity_name` (V1.1.5-i) préservé sur 4 options éligibles, hints de rendu (bloc-entier, auto-scroll 250ms, prefers-reduced-motion, breakpoints radar aside/topbar).
- `resources/modules_v2.json` (17.2 KB) : 7 modules d'approfondissement (urgences / chroniques / délégation / comm / logiciel / admin / pilotage), chacun avec 4 étapes numérotées 01-04 + tag temporalité quick/medium/invest + benchmark de conclusion marqué `to_confirm`. Champ `logiciel_dynamique: true` sur le module `logiciel` pour permettre le nommage dynamique via `profile.logiciel_metier` (logique côté templates V2).
- `resources/diagnostics_v2.json` (5.4 KB) : 12 titres de diagnostic (3 axes × 4 niveaux qualitatifs), seuils 35/55/78 codifiés, 6 signaux croisés (S-burnout, S-tech-vs-organisation, S-admin, S-paradox, S-tools-opp, S-structured) avec condition logique, priorité d'évaluation, titre, tonalité et message.

**Validation** : `json.load` OK sur les 3 fichiers, comptages structurels conformes à la spec V2 §5-7 (3 blocs × 6 visibles, scores [1,2,3,4] sur toutes les options, 21 benchmarks total). Tous les chiffres non sourcés sont préservés avec le marqueur `[À CONFIRMER]` (cf instruction Sébastien — sourcing en parallèle tâche #6).

**Substrat dormant** : ces 3 fichiers ne sont pas encore lus par le backend en V2.0-T1. Ils servent la sous-vague T2 (`src/v2/scoring.py` + `src/v2/personalize.py`) et T4 (frontend V2).

### V2.0-specs — note de cadrage v1.9

`wireframes/checkup_v2_specs.md` v1.9 (~625 lignes) : note de cadrage complète de la refonte V2.0. Rompt avec D-021 (alternance des modes) et suspend D-020 (SLM hybride en V1.2). Mode A pur, 3 blocs successifs, radar dynamique permanent, modules d'approfondissement statiques, 13 règles déterministes de personnalisation, 6 signaux croisés inter-axes. Détail complet dans `DECISIONS.md` D-029.

### V2.0-wireframe — maquette HTML autonome

`wireframes/checkup_v2_wireframe.html` (~1300 lignes) : 9 écrans (Accueil / Intro V2 / Profil étape 1 / Profil étape 2 / Énergie / Bloc-question avec radar aside / Transition inter-blocs / Résultats / Module). Switcher en haut pour parcourir les états. Radar aside style V4 (rotated pointe à droite, grille 4 niveaux concentriques). Conservation de la palette V1.1.9 (crème + serif + bleu accent).

### V2.0-editorial — brouillon éditorial complet

`resources/v2_editorial_draft.md` v1.0 (967 lignes, 5 lots) :
- **Lot 1** — Bloc A Parcours patient : 5 questions × 4 options reformulées ton Lugia + 12 benchmarks marqués `[À CONFIRMER]`.
- **Lot 2** — Bloc B Équipe : 5 questions × 4 options + routing solo (b1b/b3) + benchmarks.
- **Lot 3** — Bloc C Outils & information : 5 questions × 4 options (dont C5 IA reformulée anti-désirabilité) + benchmarks.
- **Lot 4** — 7 modules d'approfondissement "1 chose cette semaine" en ton Lugia.
- **Lot 5** — 13 règles déterministes de personnalisation avec libellés complets (R-status-junior, R-status-senior, R-motivation-tone, R-energy-prio, R-bench-soloHero, R-bench-transmission, etc.).

76 reformulations terrain + 12 titres de diagnostic + 21 benchmarks + 7 modules + 13 règles. Tonalité non culpabilisante, descriptif systémique, posture levier d'action.

### V2.0-pilote — guide de relecture pour médecins testeurs

`resources/v2_editorial_review_guide.md` v1.0 produit aujourd'hui. Guide structuré pour faciliter la relecture critique du brouillon par 3 à 5 médecins testeurs en 45-60 min. Sections : objectifs de la relecture, profil recherché, format pratique, 4 critères de validation, 5 pièges à invalider, 5 points sensibles à challenger explicitement (C5 IA, R-status junior/senior, R-bench-soloHero, R-bench-transmission 30-40 %, titres niveau "À risque"), template de feedback standardisé, modalités pratiques (e-mail à `sebastien@lugia.fr`, délai 7 jours), procédure interne de consolidation des retours.

Le guide précède l'étape suivante (intégration technique V2.0 — création de `interview_protocol_v2.json`, `diagnostics_v2.json`, `modules_v2.json`, `src/v2/personalize.py` à partir du brouillon consolidé). La séquence retenue est : **pilote rédactionnel → intégration technique → sourcing benchmarks** (décision Sébastien 2026-05-19).

### Pistes V3 et V6 versées en ROADMAP

Deux notes externes `pistes_amelioration_v3.md` et `pistes_amelioration_v6.md` reçues aujourd'hui. Idées au-delà du périmètre V2.0 versées en ROADMAP V2.1+ (mode équipe, mini-vérifications de réalité, historique radar comparatif T0→T+3→T+6, capture d'engagement post-diagnostic, nomination explicite des limites de l'outil, 4ᵉ axe ancrage territorial via Q16 collectée mais non câblée).

### État de la BDD

Aucune migration nécessaire à ce stade — les livrables d'aujourd'hui sont 100 % rédactionnels et de cadrage. La cohabitation `protocol_version` (V1.1.9 / V2.0) sera mise en place à l'étape d'intégration technique.

---

## 2026-05-19 — V1.1.9 : refonte UI questionnaire + page résultats + enrichissement contexte

Vague visuelle V1.1.9 livrée. Refonte complète de l'apparence du questionnaire et de la page résultats dans une direction « moderne immersive métier », avec enrichissement du bloc Contexte de départ (3 nouvelles questions de qualification). Aucun changement de scoring, aucun câblage des nouvelles questions dans le rapport en V1.1.9 — substrat pour V1.2 SLM.

### V1.1.9-cadrage — note de specs

`wireframes/checkup_v1_1_9_specs.md` v1.0 produit. Cadre la direction UI (typographie aérée, layout max-w-680px, indicateur segmenté par facette, écran d'intro, cartes options retravaillées), le périmètre Contexte enrichi (Q01/Q02 reformulées + Q15/Q16/Q17 ajoutées), les impacts éventuels sur scoring/templates (aucun en V1.1.9 — câblage différé V1.2), les critères d'acceptation (non-régression Chateau exigée).

### V1.1.9-a — wireframe HTML autonome du questionnaire

`wireframes/checkup_v1_1_9_wireframe.html` produit. 5 écrans avec sélecteur de bascule en haut (Intro, Question Mode A, Transition facette, Question Mode B, Fin). Données mockées Chateau. Validation visuelle obtenue avant code Next.js.

### V1.1.9-r — wireframe page résultats

`wireframes/resultats_v1_1_9_wireframe.html` produit. Hero ample (titre serif 44px), sections numérotées I-IV en marge gauche, synthèse refondue en lead serif 22px + corps aéré, reco italique en pause narrative pleine largeur (encadré beige + guillemet décoratif), opportunités en cards pleine largeur avec numéro grand serif, prochaine étape avec carte recommandée bordure bleue + gradient. Données mockées Chateau.

### V1.1.9-c — enrichissement contexte (protocol JSON)

**`resources/interview_protocol.json` v1.10** (backup `*.bak-v1.9` conservé) :
- Q01 : `q01_a` (Solo) inchangé · `q01_b` reformulé en "Cabinet de groupe — 2 à 3 médecins" · `q01_d` nouveau "Cabinet de groupe — 4 à 5 médecins" inséré en 3ème position visuelle · `q01_c` (MSP) déplacé en 4ème position visuelle (IDs strictement préservés pour zéro migration BDD).
- Q02 : libellés des options légèrement reformulés, **IDs strictement préservés** (toutes les dépendances `q02_a/b/c/d` dans swot/templates sont safe).
- **Q15** (Statut d'installation : récent / installé / senior / approche transmission / remplaçant), **Q16** (Territoire et patientèle : urbain dense / périurbain / rural / zone sous-dotée), **Q17** (Horizon 3 ans : reconduire / renforcer équipe / déménager / préparer transmission / incertain) ajoutées en positions 3, 4, 5. Mode A, facette `context`, non scorées.
- Positions Q03–Q14 décalées de +3. IDs `q03..q14` inchangés.
- Total 17 questions, version `1.10`, last_updated `2026-05-19`.

**`resources/interview_protocol.md` v1.10** : tableau distribution mis à jour (15 A / 2 B / 1 C), insertion des sections Q15/Q16/Q17 entre Q02 et Q03, tableau persona Chateau étendu à 17 lignes.

**`scripts/seed_persona.py`** : ANSWERS passe à 17 entrées. Chateau coche `q15_c` (senior), `q16_b` (périurbain), `q17_d` (préparer transmission). Libellé Q02 mis à jour.

**`resources/sample_answers_pchateau.md` v2.5** : tableau persona à 17 lignes, sections par question alignées. **Alignement Q06 au passage** : `q06_c` (ancien libellé V1.1.7 "événement récent") corrigé en `q06_a` (libellé V1.1.8 "réduire ma charge actuelle"). Le seed et la prod utilisaient déjà `q06_a` depuis V1.1.8 ; seul le sample documentait encore l'ancien.

**Test de cohérence MD/JSON** : `python3 src/questions.py` retourne *"OK — JSON et .md cohérents (17 questions)."*

**Non-régression du rapport** : smoke test sur les fragments narratifs (build_synthesis, build_phrase_choc, build_chaine_causale, build_recommandation, chantier_demandes_directes/absence/ia, swot) avec et sans les nouvelles réponses q15/q16/q17. Hash sha256 du rapport généré strictement identique à V1.1.8 équivalent (`a862a32ad3a06655` dans les deux cas). Aucune référence brute aux IDs q15/q16/q17 dans le rapport. **Critère d'acceptation V1.1.9 validé**.

### V1.1.9-b — implémentation Next.js questionnaire

Refonte complète de `web/app/checkup/page.tsx` et `web/components/CheckupWidgets.tsx`. 4 nouveaux composants atomiques :

- **`web/components/CheckupHeader.tsx`** — bandeau Lugia minimal (logo rond + nom à gauche, lien Quitter à droite). Pas d'email/menu compte pour ne pas distraire le médecin.
- **`web/components/CheckupProgress.tsx`** — indicateur segmenté par facette, chaque segment se remplit proportionnellement aux questions de la facette répondues, **indépendamment de l'ordre du parcours** (le protocole entrelace les facettes : Q06 motivation au milieu, Q12 processes après Q11 information — un système linéaire « passé/courant/à venir » n'aurait pas tenu).
- **`web/components/CheckupIntro.tsx`** — écran d'intro avant Q01 (promesse temporelle, encadré garde-fous, bouton « Commencer le check-up »). Apparaît une seule fois — saute automatiquement à la reprise d'une session.
- **`web/components/CheckupTransition.tsx`** — carton de transition entre facettes (produit mais désactivé sur retour utilisateur, voir « Retrait » plus bas).

**Refonte de `CheckupWidgets.tsx`** :
- Nouvelle `OptionCard` avec check-mark personnalisé à la place du radio natif.
- Split automatique des labels `"mot-clé — détail"` : titre en 15px medium, détail en 13px gris sur une 2ème ligne.
- « Autre » pré-teinté `#f5f4ef`, champ inline visible après sélection.
- Composant `QuestionTitle` qui sépare la question (serif 26px) de la note (`Par exemple :` ou `Note :`, italique grise).
- Animation fade-slide à chaque changement de question via la classe `lugia-question-anim`.

**Refonte de `web/app/checkup/page.tsx`** :
- Machine à états `phase: "intro" | "question" | "completed"`.
- Sauvegarde silencieuse + pastille `✓ Enregistré` 1.5s après chaque clic Suivant (clé `Date.now()` pour rejouer l'animation).
- Raccourci clavier `Entrée` qui valide la question quand la réponse est complète, sauf si focus sur textarea/input.
- Reprise de session : si l'utilisateur revient sur une interview avec `currentIndex > 0` ou des réponses déjà saisies, on saute l'intro.

**CSS V1.1.9 dans `globals.css`** : animations `lugia-fade-in`, `lugia-fade-slide-in`, `lugia-pulse-saved`, classe `.lugia-saved-pill`, ajustement responsive 640px pour la pastille.

**Retrait sur retour utilisateur** : les cartons de transition entre facettes (`CheckupTransition`) ont été désactivés (jugés perturbants dans le déroulé). Le composant reste sur disque non importé, peut être rebranché plus tard. Suppression du state `seenFacets` et de la phase `"transition"`.

**Fix bug d'interpolation JSX** : sur l'écran d'intro et l'écran de fin, le texte du paragraphe utilisait `Vous allez répondre à {totalQuestions} questions...` — selon le formattage, JSX pouvait avaler l'espace autour de l'interpolation. Migration vers des template literals `${totalQuestions}` qui sont insensibles au whitespace JSX.

**Validation** : `npx tsc --noEmit` passe (exit 0).

### V1.1.9-s — implémentation Next.js page résultats

Refonte complète de `web/app/resultats/page.tsx` selon le wireframe V1.1.9-r :

- **Hero ample** — eyebrow `CHECK-UP PRÉVENTIF — VOTRE LECTURE PERSONNELLE`, H1 serif 44px en deux lignes "Votre cabinet, / vu de l'extérieur.", sous-titre conditionnel `Dr X — résultats du Y` (préservé V1.1.7-c).
- **Sections numérotées I. II. III. IV.** en marge gauche, position absolute -60px sur desktop, bascule en flow normal sur mobile via media query. Eyebrow prolongé d'un filet horizontal 1px.
- **Synthèse refondue** — premier `<p>` retourné par le backend devient automatiquement un lead serif 22px via `.lugia-synthesis > *:first-child`. Le corps passe à 16px line-height 1.7. Plus de border-left gris.
- **Trois angles** — grille 3 cols conservée (séparateurs naturels), padding intérieur p-6, séparateur subtil entre forces et risques, badges asymétriques V1.1.6 préservés.
- **Reco italique → pause narrative pleine largeur** — encadré fond beige `#f7f5ee`, padding 44px, citation centrée serif italique 19px max-w-640px, guillemet décoratif `❝` en haut-gauche (serif 64px gris très clair, masqué en print).
- **Opportunités en cards pleine largeur** — numéro grand serif (`1`, `2`, `3`) 56px desktop / 38px mobile en marge gauche, titre serif 22px, structure 2 sections conservée (`La situation` + `Ce qu'on mettrait rapidement en place`), padding 36-40px aéré.
- **Prochaine étape** — cards plus hautes, titres serif 21px. Carte recommandée : bordure bleue 2px + gradient subtil `#fbfdff → blanc` + CTA bleu plein.

**CSS V1.1.9-s dans `globals.css`** : `.lugia-section-num` (absolute -60px desktop, flow mobile), `.lugia-synthesis` qui style le premier `<p>` en lead serif via `:first-child`, ajustements print pour la pause narrative.

**Classes utilitaires V1.1.6/V1.1.7 préservées** : `lugia-page-wrapper`, `lugia-h1`, `lugia-subtitle`, `lugia-facets-grid`, `lugia-opp-card`, `lugia-opp-body`, `lugia-next-grid` — toutes encore présentes, le print CSS et le responsive 640px restent fonctionnels.

**Validation** : `npx tsc --noEmit` passe (exit 0).

### V1.1.9-d — tests bout en bout

Smoke test backend complet : cohérence JSON/MD à 17 questions, fragments narratifs sur les 17 réponses Chateau, hash de rapport identique à V1.1.8 équivalent (`a862a32ad3a06655`), aucune référence brute aux IDs q15/q16/q17. Validation visuelle confirmée par l'utilisateur sur le parcours questionnaire et la page résultats refondues.

### Fichiers modifiés

Backend / ressources :
- `resources/interview_protocol.json` v1.9 → v1.10 (17 questions, q15/q16/q17 ajoutées, q01 réordonné)
- `resources/interview_protocol.md` v1.6 → v1.10
- `resources/sample_answers_pchateau.md` v2.4 → v2.5
- `scripts/seed_persona.py` (17 réponses, libellés Q02 et Q06 alignés)

Frontend (nouveaux) :
- `web/components/CheckupHeader.tsx`
- `web/components/CheckupProgress.tsx`
- `web/components/CheckupIntro.tsx`
- `web/components/CheckupTransition.tsx` (présent mais non importé — réserve pour rebranchement futur)

Frontend (refondus) :
- `web/components/CheckupWidgets.tsx`
- `web/app/checkup/page.tsx`
- `web/app/resultats/page.tsx`
- `web/app/globals.css` (bloc V1.1.9 + bloc V1.1.9-s)

Documentation :
- `wireframes/checkup_v1_1_9_specs.md` (nouveau)
- `wireframes/checkup_v1_1_9_wireframe.html` (nouveau)
- `wireframes/resultats_v1_1_9_wireframe.html` (nouveau)

Voir `DECISIONS.md` D-028.

---

## 2026-05-18 — V1.1.8-a : 2 fixes éditoriaux post-test prod

**Q05 — reformulation question** : *"Dans une semaine ordinaire, où aboutissent ces tâches administratives qui n'ont pas été faites entre deux patients ?"* → *"Dans une semaine ordinaire, à quel moment finissez-vous vos tâches administratives (courriers, ordonnances, certificats, suivi de dossiers) ?"*. L'ancienne formulation contredisait l'option q05_a (*"Faites au fil de l'eau — entre deux patients"*). La nouvelle question s'applique aux 4 options sans incohérence.

**Phrase choc default #1 — transition cassée corrigée** : les exemples qui suivaient *"frictions absorbées en silence"* étaient des **événements** (pic épidémique, absence confrère, journée dense), pas des frictions. Remplacés par des frictions concrètes : *"un dossier qui dort sans déclencher d'alerte, un courrier en retard rattrapé de mémoire, une demande directe traitée hors radar"*. *"par vous-même ou par votre secrétariat"* supprimé — les exemples portent désormais le mécanisme d'absorption.

Fichiers : `resources/interview_protocol.json`, `src/templates.py`.

---

## 2026-05-18 — V1.1.8 : câblage Q06 dans la phrase choc et les titres de chantiers

Q06 (*"Quelle est la raison principale qui vous fait faire ce check-up maintenant ?"*), collectée depuis V1 mais sans effet sur le rapport, est désormais câblée pour personnaliser le ton et la framing de la page résultats. Démarche médiane (V1.1.8) : phrase choc + titres de chantiers adaptés, propose et contenu des chantiers inchangés.

**Q06 réécrite (interview_protocol.json v1.9)** — passage d'une logique émotionnelle à une logique de motivation professionnelle factuelle :

| ID | Avant | Après |
|---|---|---|
| q06_a | Curiosité (1ère position) | **Réduire ma charge actuelle** — identifier ce qui pèse le plus dans ma semaine et alléger |
| q06_b | Une fatigue qui dure | **Anticiper un événement à venir** — préparer l'arrivée d'un associé, un déménagement, un agrandissement, une transmission ou une cession du cabinet |
| q06_c | Un événement récent | **Sécuriser un risque identifié** — consolider un dispositif fragile, traiter un incident récent ou répondre à une obligation de conformité (RGPD, IA, secret médical) |
| q06_d | Anticiper | **Curiosité** (descendue en dernière position) |

**Modulation phrase choc** — 3 ouvertures personnalisées (1 variante par motivation) :

- q06_a → *"Vous avez démarré ce check-up pour identifier ce qui pèse le plus dans votre semaine. "*
- q06_b → *"Vous avez démarré ce check-up pour préparer un événement à venir dans votre cabinet. "*
- q06_c → *"Vous avez démarré ce check-up pour sécuriser un risque identifié. "*
- q06_d, q06_other ou Q06 non répondue → ouverture vide (la phrase choc démarre directement comme en V1.1.7)

**Modulation des titres de chantiers triggered** :

| Chantier | q06_a (charge) | q06_b (événement) | q06_c (risque) | Défaut (q06_d/other/none) |
|---|---|---|---|---|
| Demandes directes | Réduire la charge des demandes directes | Cadrer les demandes directes en amont de l'événement | Sécuriser les demandes directes non tracées | Reprendre la main sur les demandes directes |
| IA | Alléger les tâches admin via une IA conforme | Mettre votre usage IA en conformité en amont de l'événement | Sécuriser votre usage IA face au secret médical | Sécuriser votre usage actuel de l'IA |
| Absence | Sécuriser la continuité pour libérer du temps mental | Structurer une fiche relais transférable en amont de l'événement | Sécuriser la continuité face à l'absence imprévue | Anticiper une absence prolongée |

Les **titres fallback** (cas où aucun risque ne fire) restent inchangés — pas de modulation Q06 sur les chantiers préventifs.

**Architecture** :
- `src/templates.py` : nouveaux helpers `derive_q06_motivation(answers)` et `build_phrase_choc_opening(answers)`. L'ouverture est prependée dans `build_synthesis` avant le résultat de `build_phrase_choc` (cascade des 6 patterns inchangée).
- `src/workstreams.py` : `title_map` Q06-aware dans chaque fonction `chantier_*` (cas triggered uniquement).
- `scripts/seed_persona.py` : Château q06 = q06_a (réduire ma charge) pour aligner sur son profil porteur solo + débordement admin.
- Pas de changement frontend, pas de migration BDD.

**Conséquence pour les médecins en prod** : ceux qui avaient répondu à l'ancien Q06 (q06_a/b/c/d aux libellés émotionnels) verront leur réponse mappée aux nouveaux libellés selon l'index. L'effet narratif sera donc influencé par la migration des libellés. Acceptable car la base utilisateurs prod est encore réduite et les libellés émotionnels n'ont jamais été affichés dans le rapport jusqu'à présent.

---

## 2026-05-18 — V1.1.8 : câblage Q06 — priorité de cascade phrase choc + titres chantiers modulés

Q06 (*"Quelle est la raison principale qui vous fait faire ce check-up maintenant ?"*) est désormais exploitée pour personnaliser le rapport — **modification de l'ordre de la cascade de sélection des patterns** de phrase choc + titres des 3 chantiers reformulés selon motivation.

### Q06 réécrite (interview_protocol.json v1.9)

Refonte des options pour passer d'une dimension émotionnelle (curiosité/fatigue/événement/anticipation) à une dimension **factuelle professionnelle** :

| ID | Libellé |
|---|---|
| q06_a | Réduire ma charge actuelle — identifier ce qui pèse le plus dans ma semaine et alléger |
| q06_b | Anticiper un événement à venir — préparer l'arrivée d'un associé, un déménagement, un agrandissement, une transmission ou une cession du cabinet |
| q06_c | Sécuriser un risque identifié — consolider un dispositif fragile, traiter un incident récent ou répondre à une obligation de conformité (RGPD, IA, secret médical) |
| q06_d | Curiosité — comprendre ce qu'un outil comme Lugia peut apporter à mon cabinet |

Toutes les sous-phrases démarrent par un verbe à l'infinitif (cohérence éditoriale). Curiosité descend en 4ème position. Événement et transmission fusionnés dans q06_b. Conformité intégrée dans q06_c.

### Modulation du rapport — priorité de cascade

**Approche** : on ne change pas le contenu des phrases choc existantes (24 variantes V1.1.7), on change **l'ordre dans lequel les patterns sont testés** dans la cascade. Selon la motivation Q06, le médecin voit en priorité le pattern le plus pertinent pour son besoin.

| Motivation | Ordre de priorité |
|---|---|
| **charge** (q06_a) | debordement_perso → porteur_solo → signaux_disperses → cadre_absent → ia_stack → default |
| **evenement** (q06_b) | cadre_absent → porteur_solo → ia_stack → debordement_perso → signaux_disperses → default |
| **risque** (q06_c) | ia_stack → cadre_absent → porteur_solo → debordement_perso → signaux_disperses → default |
| **curiosité / autre / None** | ia_stack → debordement_perso → cadre_absent → porteur_solo → signaux_disperses → default (ordre V1.1.7-s inchangé) |

Implémentation : nouveau helper `_select_phrase_choc_pattern(answers)` qui consulte `PHRASE_CHOC_ORDER_BY_MOTIVATION` et applique la cascade selon Q06. `build_phrase_choc` refactorée en if/elif sur `pattern` (au lieu de l'ancienne cascade de conditions). Aucun changement de contenu des variantes.

### Titres de chantiers modulés

18 reformulations (3 chantiers × 2 modes triggered/fallback × 3 motivations actives a/b/c). Pour q06_d/other/None, titres standards V1.1.7. Exemple chantier 1 triggered :
- *charge* → *"Réduire la charge des demandes directes"*
- *evenement* → *"Cadrer les demandes directes en amont de l'événement"*
- *risque* → *"Sécuriser les demandes directes non tracées"*
- *curiosité / autre* → *"Reprendre la main sur les demandes directes"* (V1.1.7)

Implémentation : `title_map` (triggered) + `title_map_fallback` inline dans chaque fonction chantier de `workstreams.py`.

### Pas de modulation côté

- LA SITUATION, CE QU'ON METTRAIT RAPIDEMENT EN PLACE, cartes Prochaine étape — pas adaptés (concentration sur l'accroche + titres).
- `build_phrase_choc_opening` neutralisée — retourne toujours `""` désormais. Le préfixe d'accroche imaginé en première itération s'est révélé sans valeur ajoutée. La modulation Q06 est désormais entièrement dans la cascade.

### Code dead conservé pour réversibilité

Conformément à D-027 :
- `build_phrase_choc_opening` reste exposée (signature compatible, retour vide).
- `build_recommandation` reste exposée (idem, depuis V1.1.7-k).
- `chantier.analyse` et `chantier.pas_confirmer` toujours générés en backend bien que non rendus côté frontend.

Le SLM V1.2 pourra réutiliser ces matériaux. Cleanup différé à une vague dédiée.

### Audit éditorial post-V1.1.7-t

Au passage : reformulation de C1.3 chaîne causale (*"ce qui reste finit chaque jour sur votre soirée"* → *"ce qui reste retombe sur votre soirée"*, moins fataliste) et de phrase choc ia_stack variant 2.3 (*"la responsabilité revient au médecin qui en fait usage"* → *"la responsabilité vous revient"*, voix vous cohérente V1.1.7-d).

### Statut Curiosité

q06_d (Curiosité) ne déclenche **aucune modulation** : cascade par défaut V1.1.7-s, titres chantiers V1.1.7. Choix volontaire — pas d'amplification pour ce qui n'est pas une motivation pro forte.


## 2026-05-18 — V1.1.7-t : audit éditorial complet templates/swot/workstreams

Passage systématique sur tous les fichiers de génération texte pour détecter les tournures accusatrices, normatives ou consulting :

- *"aurait dû"*, *"devrait"*, *"tant que ... reste"*, *"il faudrait"*, *"par négligence"*, *"vous savez que"*, *"vous restez conscient"*, *"sous le seuil"*, *"vous compensez"*, etc.

6 corrections appliquées au-delà des reformulations précédentes :

| Lieu | Avant | Après |
|---|---|---|
| `templates.py` C1.3 (débordement admin) | *"aurait dû être filtré en amont. Tant que les canaux restent ouverts..."* | *"qui n'ont pas pu être triées dans la journée — appels, SMS, mails... ce qui reste finit chaque jour sur votre soirée."* |
| `templates.py` signaux_disperses #3 | *"qu'il ne devrait pas"* + *"sous le seuil de l'effort à corriger"* | *"hors de son périmètre"* + *"ne pèse pas assez pour qu'on prenne le temps de le regarder"* |
| `templates.py` Chaîne 4.2 (perte de vue chroniques) | *"Vous ne perdez personne par négligence — vous perdez la trace..."* | *"La trace se perd silencieusement, sans rien pour vous l'indiquer."* |
| `templates.py` `build_processes_summary` | *"Vous compensez ce qui ne se voit pas la journée."* | *"C'est votre temps personnel qui absorbe ce qui ne se voit pas la journée."* |
| `workstreams.py` C1 q05_d `vu` | *"Vous compensez ce qui ne se voit pas la journée."* | *"C'est votre temps personnel qui absorbe ce qui ne se voit pas la journée."* |
| `workstreams.py` C1 q05_d analyse #1 | *"savoir ce qu'il faudrait alléger en priorité"* | *"savoir ce qui pourrait être allégé en priorité"* |

**Résiduel acceptable** : 1 occurrence de *"devrait"* conservée dans phrase choc cadre_absent #2 — le sujet désigne le remplaçant qui débarque, pas le médecin (*"Il devrait reconstituer ces règles..."*). Pas culpabilisant.

Cohérence philosophique restaurée : le ton reste descriptif systémique partout, sans glisser vers le jugement de valeur. Fichier : `src/templates.py`, `src/workstreams.py`.

---

## 2026-05-18 — V1.1.7-s : reorder cascade phrase_choc + ROADMAP Q06 enrichi

**Cascade `build_phrase_choc` réorganisée** pour éviter que le profil *porteur_solo* (≥ 3 signaux d'effort) ne capte la majorité des médecins solo qui matchent naturellement plusieurs signaux à la fois (canaux directs + débordement + ferme congés + porte seul).

Nouvelle priorité :

| # | Profil | Critère |
|---|---|---|
| 1 | IA grand public + outils empilés | régulatoire prioritaire |
| 2 | Débordement perso | santé personnelle du médecin |
| 3 | Cadre absent | transmissibilité actionnable |
| 4 | Porteur solo | meta-profil cumulatif (≥ 3 signaux) |
| 5 | Signaux dispersés | ≥ 2 signaux d'effort |
| 6 | Default | équilibre tenu |

Avant : porteur_solo en #1 → la plupart des médecins solo recevaient cette phrase choc en priorité, ce qui pouvait sonner moralisateur pour un médecin qui exerce ainsi depuis 20 ans sans problème.

Après : les profils thématiques (IA, débordement, cadre) prennent la priorité ; porteur_solo ne déclenche que si aucune dimension thématique n'a déjà été identifiée. Plus juste.

**ROADMAP V1.1.8 (Q06) enrichi** avec la stratégie de qualification statut répondant (cession à venir, structurer transmissibilité, aller mieux au quotidien, anticiper événement, curiosité). Q06 deviendra le pivot qui personnalise le ton de la phrase choc et l'orientation des chantiers selon la situation du médecin.

Fichiers : `src/templates.py` (`build_phrase_choc`), `ROADMAP.md` (section V1.1.8).

---

## 2026-05-18 — V1.1.7-r : refonte bloc CE QUI RESSORT (synthèse)

Audit éditorial du bloc synthèse suite à retours utilisateur (4 défauts repérés). Trois corrections structurelles :

**1. Première phrase du phrase_choc default variant #3 raccourcie**
Une phrase de 60 mots avec colon + tiret + énumération devient 3 phrases plus courtes. Le punch *"La différence ne se voit pas de l'intérieur, c'est précisément ce qu'un regard extérieur peut faire apparaître"* est désormais en gras et porte la chute, au lieu d'être noyé dans la longueur.

**2. Chaîne causale `fragilite_continuite` variant #3 réécrite**
Avant : *"La fragilité que vous percevez sur la continuité n'est pas une faille d'organisation isolée — c'est la conséquence directe d'un mode solo sans renfort régulier. Plus le quotidien tient bien sans appui extérieur, plus une absence devient un événement à fort impact."*

Après : *"Cette fragilité de continuité a une racine simple : vous exercez seul, sans renfort régulier ni dispositif partagé. Au-delà d'une journée d'absence, rien ne prend le relais."*

Corrections :
- *"que vous percevez"* → présupposition retirée. Le médecin n'a pas dit qu'il percevait la fragilité ; il a juste répondu à Q08. La nouvelle version nomme la fragilité comme un fait sans présumer de son ressenti.
- *"mode solo sans renfort régulier"* → *"vous exercez seul, sans renfort régulier"*. Sortie du registre management.
- *"Plus le quotidien tient bien sans appui extérieur, plus une absence devient un événement à fort impact"* → la formule rhétorique inversée ne disait rien. Remplacée par un scénario concret : *"Au-delà d'une journée d'absence, rien ne prend le relais"*.

**3. Bloc "organisation" supprimé entièrement de `build_synthesis`**
La phrase *"Au quotidien, vous vous appuyez sur votre télésecrétariat."* (ou équivalent selon outils détectés) interrompait le flux entre phrase choc et chaîne causale sans apporter d'information utile. Le médecin sait sur quoi il s'appuie ; on n'a pas besoin de le lui répéter. La garde précédente (V1.1.7-j, qui ne coupait qu'en cas de zone vide) est aussi retirée car elle laissait la phrase orpheline quand une chaîne causale fire. Cette suppression rend la synthèse strictement *phrase_choc + zone*.

Fichier : `src/templates.py` (`build_synthesis`, `build_phrase_choc`, `build_chaine_causale`).

---

## 2026-05-18 — V1.1.7-q : dump_report.py aligné sur la page web

Le script `scripts/dump_report.py` est mis en cohérence avec la page résultats refondue :

- **Cartes opportunités** : passage de 4 sous-sections (Ce que nous avons observé / Ce que ça révèle / À confirmer ensemble / L'opportunité d'action) à 2 (LA SITUATION + CE QU'ON METTRAIT EN PLACE), comme sur la page web.
- **Prochaine étape** : 2 chemins (autonomie + Lugia en réel) au lieu de 3, avec les libellés et descriptions identiques au frontend.
- **Phrase de transition** *"Vous avez vu les opportunités. Voici comment les transformer en chantiers avec Lugia."* ajoutée avant Prochaine étape.
- Titre de section *"Prochaine étape recommandée"* → *"Prochaine étape ?"* (cohérent avec frontend).

Le callout recommandation est déjà géré : `build_recommandation` retournant `""` depuis V1.1.7-k, le `if recommendation:` du dump ne déclenche plus rien.

Fichier : `scripts/dump_report.py`.

---

## 2026-05-18 — V1.1.7-p : polishings éditoriaux finaux cartes opportunités

Cinq retouches de cohérence après tests visuels :

**1. Transition opportunité → chantier explicitée**
Avant : *"Vous avez vu les chantiers. Voici comment avancer avec Lugia."*
Après : *"Vous avez vu les opportunités. Voici comment les transformer en chantiers avec Lugia."*
La distinction sémantique est désormais portée : opportunité = ce qui est identifié au diagnostic, chantier = ce qu'on entreprend.

**2. Ouverture de cartes "Prochaine étape" parallèles**
Ajout d'une virgule sur le titre du chemin autonome pour matcher la structure du chemin Lugia : *"Approfondir un chantier, en autonomie"* / *"Avancer avec Lugia, en réel"*.

**3. Ancrages "check-up" distincts par chantier**
Pour éviter la collision visuelle entre cartes opportunités, chaque chantier a désormais sa propre formulation d'ancrage au check-up :
- C1 : *"À partir de votre check-up, on..."*
- C2 : *"...en s'appuyant sur votre check-up..."*
- C3 : *"...grâce à votre check-up..."*

**4. Ouverture C2 fallback alignée sur la forme verbale**
*"À partir de votre check-up, on vous fait découvrir..."* → *"On vous fait découvrir un environnement IA conforme au secret médical, en s'appuyant sur votre check-up, sur deux ou trois cas d'usage..."*. Évite que C1 fallback et C2 fallback commencent par la même structure.

**5. LA SITUATION éditoriales tendues**
Trois retouches pour aligner le ton :
- C1 Q04=d : *"...représentent une charge invisible"* → *"...ne sont tracées nulle part."* (interprétation retirée)
- C2 Q13=d : *"Vous savez que ce n'est pas une vraie garantie..."* → *"Sans garantie réelle de secret médical."* (formulation directe)
- C2 Q13=c : *"Vous restez conscient des limites de cette pratique."* → *"Pratique vigilante, mais sans garantie structurelle de secret médical."* (nomme le risque au lieu du compliment)

**6. Hybride distance/cabinet sur chantier 1**
La modalité hybride *"à distance ou au cabinet"* est placée sur **l'acte de travail** (pose, mesure, mise en place) et non sur la restitution finale.

Fichier : `src/workstreams.py` (`propose` et `vu` de 5 variants), `web/app/resultats/page.tsx` (transition + virgule titre carte autonomie).

---

## 2026-05-18 — V1.1.7-o : 3 micro-corrections cartes opportunités

- **Label de section** : "LE LEVIER" renommé en "CE QU'ON METTRAIT EN PLACE". Le levier était trop abstrait/management ; la nouvelle formulation signale qu'on adapte plutôt qu'on applique une recette.
- **Fallback chantier 1** : la phrase ne décrivait pas l'action Lugia. Réécrite pour intégrer le mode opératoire concret — *"on installe un suivi discret en arrière-plan pendant deux semaines pour mesurer où passent vraiment vos heures"*.
- **Chantier 3 triggered** : *"Une fiche d'une page"* → *"Une fiche structurée"*. La taille fixe était inutilement restrictive.

---

## 2026-05-18 — V1.1.7-n : états de chargement et d'erreur restructurés

Correction du bug visuel résiduel sur `/checkup` et `/resultats` : 4 états (3 sur /checkup error/loading/completed + 1 sur /resultats error) avaient encore `<AppHeader />` à l'intérieur d'un `<main flex items-center justify-center>`, ce qui plaçait le nav et le contenu côte à côte au lieu d'empiler proprement.

Refonte uniforme : `<main flex flex-col><AppHeader /><div flex-1 flex items-center justify-center>...content...</div></main>`. Le nav reste en haut, le contenu s'centre verticalement dans l'espace restant.

L'écran "Compte supprimé" sur /compte n'a pas d'AppHeader (l'utilisateur est déconnecté à ce stade) — pas touché, le flex-center y est correct.

---

## 2026-05-18 — V1.1.7-m : Prochaine étape refondue en 2 chemins

La section "Prochaine étape ?" en bas de `/resultats` passe de 3 cartes à 2.

**Avant** : Approfondir un chantier (autonomie) / Échanger avec Lugia 30 min / Diagnostic terrain 1 jour.

**Après** :
- *Approfondir un chantier en autonomie* — questionnaire ciblé sur l'opportunité choisie, ~15 min, gratuit, sans rendez-vous.
- *Avancer avec Lugia, en réel* (recommandé) — *"Vous choisissez une opportunité, on la traite ensemble dans votre cabinet. Pas un appel d'identification — le chantier lui-même, structuré à partir de dispositifs éprouvés chez d'autres confrères."*

**Pourquoi** : se démarquer des cabinets IA qui vendent des appels de 30/45 min pour "tout identifier". Lugia propose deux chemins concrets, dont aucun n'est un teaser de qualification. Le carton "diagnostic terrain 1 journée" est supprimé (la même intervention est désormais incluse dans "Lugia en réel" et fait moins peur en l'absence de durée fixe).

**Force #5 (références confrères)** intégrée dans la description de la carte Lugia : *"structuré à partir de dispositifs éprouvés chez d'autres confrères"*. C'est la preuve sociale par les pairs.

Fichiers : `web/app/resultats/page.tsx` (NEXT_STEPS, NextStepCard signature, grille md:grid-cols-2), `web/lib/api.ts` (type `recommended_next_step` réduit à `"autonomie" | "lugia"`).

Pas de changement backend : `build_next_step_recommendation` retournait déjà toujours `"lugia"`.

---

## 2026-05-18 — V1.1.7-l : refonte cartes opportunités (Situation + Levier)

Les 3 cartes "Trois opportunités d'action" passent d'une structure à 3 sections (Situation / Action proposée / À confirmer ensemble) à une **structure à 2 sections empilées** : **LA SITUATION** + **LE LEVIER**.

**Frontend** — `web/app/resultats/page.tsx::ChantierCard` :
- Layout single-column au lieu de 2 colonnes
- Suppression du pied "À CONFIRMER ENSEMBLE"
- Renommage "L'ACTION PROPOSÉE" → "CE QU'ON METTRAIT EN PLACE" (V1.1.7-l rebaptisé)
- LA SITUATION rend désormais uniquement `chantier.vu` (le champ `analyse` reste populé en backend mais n'est plus affiché — réversibilité 1-click)
- Le champ `pas_confirmer` reste populé en backend mais n'est plus rendu

**Backend** — `src/workstreams.py` : réécriture du champ `propose` (rendu sous le label LE LEVIER) pour les 7 variants (3 chantiers × triggered/fallback) :

| Chantier | Variant | Nouvelle formulation |
|---|---|---|
| Demandes directes | q04_d | *À partir de votre check-up, on mesure ensemble le volume réel de demandes qui passent par vos canaux directs (mobile, SMS, mails), et on pose une consigne claire avec {sec_label} — à communiquer à vos patients réguliers.* |
| Demandes directes | q05_d | *À partir de votre check-up, on regarde ensemble où votre charge administrative déborde aujourd'hui sur vos soirées et week-ends — puis on identifie les pistes concrètes que vous pourriez expérimenter sur deux semaines.* |
| Demandes directes | fallback | *À partir de votre check-up, on regarde avec vous où se concentrent vos heures aujourd'hui — un repère mesuré, sans changer votre organisation actuelle.* |
| IA | triggered (q13_c/d) | *On vous fait tester un environnement IA conforme au secret médical et adapté à votre situation, à partir de votre check-up. Deux ou trois cas d'usage installés pour votre quotidien (courriers complexes, comptes-rendus, préparation de patients).* |
| IA | fallback | *On vous fait tester un environnement IA conforme au secret médical sur quelques tâches concrètes (courriers, comptes-rendus, préparation de patients), à votre rythme et sans engagement.* |
| Absence | triggered (q08_c/d) | *On structure votre fiche relais à partir de votre check-up — pas d'atelier découverte, pas de modèle générique. Une fiche d'une page, prête à partager à votre prochain remplaçant.* |
| Absence | fallback | *On relit ensemble votre dispositif d'absence à partir de votre check-up pour identifier les scénarios non couverts — arrêt long, panne d'outil critique. Un complément ciblé à ce qui existe déjà.* |

**Principes éditoriaux** (alignés sur retours utilisateur V1.1.7-l) :
- Pas de surpromesse chiffrée ("vous récupérez des heures par semaine" → coupé).
- Pas de blabla consulting ("vous repartez avec une vue d'ensemble", "à découvrir ensemble lors d'une présentation", "à simuler ensemble en testant un scénario" → coupés).
- Lugia comme acteur explicite via verbes ("on mesure", "on pose", "on structure", "on fait tester", "on relit").
- Force #1 (contexte déjà collecté) explicite via "à partir de votre check-up" dans chaque variant.
- Force #5 (références confrères) non déployée dans les cartes — reste à intégrer dans la future section "Comment avancer" en pied de page.

**Réversibilité** : les champs `analyse` et `pas_confirmer` restent générés et exposés dans le payload `/report`. Pour revenir à la structure 3 sections, c'est un revert ciblé de `ChantierCard` (~30 lignes).

---

## 2026-05-18 — V1.1.7-k : suppression du callout recommandation

Le bloc *"recommandation"* intercalé entre la grille des facettes et les opportunités d'action (livré en V1.1.6-f) est supprimé. À l'usage les 3 variants se sont tous révélés sans valeur ajoutée :

- `reco:ia_visible` dupliquait le chantier IA qui apparaît juste en dessous dans les opportunités.
- `reco:descriptions` était une invitation vague à appeler ("Une heure d'échange suffit à confirmer cette lecture…") sans nommer de chantier concret.
- `reco:default` (déjà retiré en V1.1.7-h) était purement filler.

`src/templates.py::build_recommandation` retourne désormais toujours `""`. La signature est conservée pour ne pas casser l'API `/report` ni le rendu frontend (le `{report.recommendation && (...)}` du composant ne déclenche plus jamais).

Conséquence visuelle : la page résultats enchaîne directement de la grille des 3 facettes vers "Trois opportunités d'action". Plus serré, plus honnête.

Si un futur besoin justifie un bloc à cet emplacement (synthèse transversale des 3 facettes par exemple), il faudra réintroduire un contenu vraiment additif, pas une reformulation des chantiers à venir.

---

## 2026-05-18 — V1.1.7-j : synthèse propre quand aucun risque ne fire + légende conditionnelle

Deux ajustements de cohérence sur la page résultats.

**Synthèse** : si la zone *"ce qui demande attention"* est vide (aucun risque détecté), la phrase orpheline *"Au quotidien, vous vous appuyez sur…"* est coupée elle aussi. Elle était conçue comme une transition vers la zone risque ; sans elle, elle dangle. La synthèse se referme désormais sur la phrase choc.

**Légende sous la grille** : la légende ("À surveiller", "À risque") n'apparaît plus que pour les badges effectivement présents dans la grille. Si toutes les facettes sont en niveau 1-2 (Maîtrisé / Opérationnel), pas de légende. Si seulement "À risque" s'affiche, seule cette entrée est listée.

Fichiers : `src/templates.py` (build_synthesis), `web/app/resultats/page.tsx` (légende calculée à la volée).

---

## 2026-05-18 — V1.1.7-h : alignement ton des RISQUE_PLANCHER

Audit de tous les fragments forces/risques pré-paramétrés (49 entrées) suite à V1.1.7-e : style nominal et longueur respectés partout (4-10 mots) sauf 3 fallbacks `RISQUE_PLANCHER` qui dénotaient à 10-12 mots. Préfixe *"Vigilance à maintenir"* conservé (doux pour un fallback), suite raccourcie.

| Facette | Avant | Après |
|---|---|---|
| processes | Vigilance à maintenir sur l'évolution du volume de demandes. (10w) | Vigilance à maintenir sur le volume de demandes. (8w) |
| participants | Vigilance à maintenir sur la transmission et la couverture des absences. (11w) | Vigilance à maintenir sur la couverture des absences. (8w) |
| information | Vigilance à maintenir sur l'intégration des outils et les nouveaux usages. (12w) | Vigilance à maintenir sur l'intégration des outils. (8w) |

Fichier : `src/swot.py` (lignes 257-259). Pas d'impact logique : ces fragments ne s'activent qu'en fallback si aucun risque spécifique ne déclenche pour une facette de niveau ≥ 2.

---

## 2026-05-16 — V1.1.7 : voix "vous" sur le callout + responsive + prénom médecin

Itération sur la V1.1.6 livrée plus tôt dans la journée, à partir des specs V3 (`wireframes/resultats_v2_specs.md` + retours utilisateurs). Sept sous-vagues. Pas de changement de scoring ni de logique métier.

### Sous-vagues livrées

| Sous-vague | Périmètre | Fichiers principaux |
|---|---|---|
| V1.1.7-a | Backend prénom médecin : table user_profile + endpoints GET/PATCH /me/profile + injection doctor_firstname dans /report | `src/db.py`, `backend/main.py` |
| V1.1.7-b | Frontend : page /compte avec champ prénom + getMyProfile / updateMyProfile dans api.ts | `web/lib/api.ts`, `web/app/compte/page.tsx` |
| V1.1.7-c | Hero V3 : H1 "Votre cabinet, vu de l'extérieur" + sous-titre "Dr {prénom} — résultats du {date}" | `web/app/resultats/page.tsx`, `web/lib/api.ts` |
| V1.1.7-d | Callout reformulé en voix "vous" (suppression "Lugia commence par..."), style discret bg gris + border-left, plus d'italique | `src/templates.py`, `web/app/resultats/page.tsx`, `scripts/dump_report.py` |
| V1.1.7-e | 4 reformulations swot ("répartie", consultation libérée, aligné sur votre pratique, sans protocole défini) + phrase de transition avant Prochaine étape | `src/swot.py`, `web/app/resultats/page.tsx` |
| V1.1.7-f | Responsive : @media print + @media (max-width: 640px) mobile | `web/app/globals.css`, classes utilitaires ajoutées dans `web/app/resultats/page.tsx` et `AppHeader.tsx` |
| V1.1.7-g | Tests + journalisation (cette entrée) | docs structurantes |

### Refonte de la voix du callout (V1.1.7-d)

Avant : *"Avant tout chantier, Lugia commence par une vue d'ensemble de votre cabinet. Pour vous, le pas qui pèse le plus est de remplacer votre IA grand public..."*

Après (3 contextes adaptés) : *"Ce check-up vous donne une vue d'ensemble avant d'engager quoi que ce soit. **Le chantier le plus urgent pour vous : remplacer votre IA grand public par un environnement conforme au secret médical.**"*

Changements :

- Plus de "Lugia commence par..." en 3ème personne — le médecin reste sujet de l'action.
- Plus d'italique global (couché de la classe CSS `italic`) — la phrase clé en gras suffit à signaler la hiérarchie.
- Saut de ligne `<br /><br />` entre les deux phrases pour aérer.
- Style frontend : `bg-[#f7f7f7] border-l-[3px] border-[#e5e5e5]` — discret, fait transition entre angles et opportunités sans encadrer comme un "encart commercial".

### Prénom médecin (V1.1.7-a/b/c)

- Nouvelle table `user_profile(email PRIMARY KEY, firstname, updated_at)` dans `src/db.py`.
- Helpers `db.get_user_profile(email)` et `db.upsert_user_profile(email, firstname)`.
- Endpoints `GET /me/profile` et `PATCH /me/profile` avec modèle Pydantic `UserProfileUpdate`.
- Page `/compte` : nouvelle section "Prénom" en haut, input + bouton enregistrer + feedback de succès/erreur. Note "Affiché en en-tête de votre rapport personnel".
- Type `Interview` côté frontend enrichi : `doctor_firstname?: string | null`.
- Hero affiche conditionnellement :
  - Si prénom saisi : *"Dr {prénom} — résultats du {date}"*
  - Si prénom absent : *"Réalisé le {date}"* (fallback V1.1.6)
- Aucune migration manuelle requise : la table est créée par `metadata.create_all(engine)` au démarrage du backend.

### 4 reformulations swot

| Avant | Après |
|---|---|
| Charge administrative lissée sur deux journées de cabinet. | Charge administrative répartie sur deux journées de cabinet. |
| Hervé, votre assistant·e médical·e, en soutien direct. | Hervé, votre assistant·e médical·e en soutien direct — consultation libérée, accueil professionnalisé. |
| Secrétariat interne avec Marie, stable et intégré. | Marie, secrétariat interne stable et aligné sur votre pratique. |
| Suivi des chroniques au cas par cas. | Suivi des patients chroniques sans protocole défini. |

Décision conservée : `assistant·e médical·e` en plein (l'abréviation "AM" des specs V3 a été rejetée pour rester accessible aux médecins moins habitués à la nomenclature hospitalière).

### Responsive (V1.1.7-f)

**@media print** :
- Nav et footer cachés.
- Page padding réduit à 24px.
- Grilles 3 colonnes (facettes, prochaine étape) deviennent des blocs empilés.
- Corps des opportunités passe en bloc vertical.
- `page-break-inside: avoid` sur les cartes opportunités et facettes.
- Bordures `#ccc` adaptées pour l'impression noir et blanc.

**@media (max-width: 640px)** :
- Nav : padding horizontal réduit.
- Page wrapper : padding 20px (vs 32px desktop).
- H1 : 24px (vs 28px desktop).
- Sous-titre : 15px (vs 17px desktop).
- Tailwind gère automatiquement les grids `grid-cols-1 md:grid-cols-3` → bascule en colonne unique sous 768px (breakpoint Tailwind md).

Pour cibler les éléments via les media queries CSS, des classes utilitaires sémantiques ont été ajoutées : `lugia-page-wrapper`, `lugia-facets-grid`, `lugia-opp-card`, `lugia-opp-body`, `lugia-next-grid`, `lugia-h1`, `lugia-subtitle`, `lugia-nav-inner`.

### Modifié — résumé par fichier

| Fichier | Changement |
|---|---|
| `src/db.py` | Table `user_profile` + helpers `get_user_profile` / `upsert_user_profile` |
| `src/templates.py` | `build_recommandation` reformulée en voix "vous", suppression `<em>`, ajout `<br /><br /><strong>` |
| `src/swot.py` | 4 reformulations forces/risques |
| `backend/main.py` | Endpoints `GET/PATCH /me/profile`, `doctor_firstname` dans payload `/report` |
| `scripts/dump_report.py` | Callout sans italique markdown |
| `web/lib/api.ts` | Types `UserProfile`, fonctions `getMyProfile`/`updateMyProfile`, `Interview.doctor_firstname?` |
| `web/components/AppHeader.tsx` | Classe `lugia-nav-inner` pour responsive |
| `web/app/compte/page.tsx` | Section Prénom (input + sauvegarde) |
| `web/app/resultats/page.tsx` | H1 + sous-titre prénom, callout V1.1.7-d, phrase transition, classes responsive |
| `web/app/globals.css` | @media print et @media mobile |

### Tests

- Smoke tests sur build_recommandation : 3 contextes ia_visible / descriptions / default produisent le nouveau wording voix "vous".
- Vérif syntaxe Python (db, templates, swot, dump_report, backend) — OK.
- Vérif brace balance TypeScript sur compte/page.tsx et resultats/page.tsx — OK.
- Validation visuelle locale par utilisateur à faire avant push (notamment responsive mobile <640px).

### Reste ouvert

- Hero V3 specs détaille un `<p>` séparé pour chacun des 3 blocs de la situation (phrase choc / organisation / "Deux points méritent..."). Aujourd'hui ces blocs sont concaténés dans la chaîne HTML de `build_synthesis`, séparés par un `<br /><br />` avant "Deux points". Pour avoir 3 vrais paragraphes `<p>`, il faudrait modifier `build_synthesis` pour wrapper chaque bloc — repoussé à V1.5+ si besoin.

---

## 2026-05-16 — V1.1.6 : refonte UI page de résultats vers palette V2 sobre

Refonte visuelle de la page de résultats. Pas de changement de scoring ni de logique métier — purement UI et structure. Sept sous-vagues (a, b, c, d, e, f, +ajustements) livrées dans la journée du 16 mai à partir des specs V2 partagées par Sébastien (`wireframes/resultats_v2_specs.md`, `wireframes/resultats_v2_cible.pdf`).

### Sous-vagues livrées

| Sous-vague | Périmètre | Fichiers principaux |
|---|---|---|
| V1.1.6-a | Structure & palette : nav, Hero, max-w-[840px], palette V2 | `web/components/AppHeader.tsx`, `web/app/resultats/page.tsx`, `web/app/globals.css` |
| V1.1.6-b | Refonte facettes : badge sans barre, tirets, séparateur entre forts/vigilance | `web/app/resultats/page.tsx` |
| V1.1.6-c | Refonte opportunités : numéro grand + 2 colonnes (Situation / Action) + pied À confirmer | `web/app/resultats/page.tsx` |
| V1.1.6-d | Refonte Prochaine étape : carte recommandée mise en avant + boutons CTA | `web/app/resultats/page.tsx` |
| V1.1.6-f | Séparation reco italique : entre angles et opportunités, plus dans la synthèse | `src/templates.py`, `backend/main.py`, `scripts/dump_report.py`, `web/lib/api.ts`, `web/app/resultats/page.tsx` |
| V1.1.6-e | Tests + journalisation (cette entrée) | `CHANGELOG.md`, `DECISIONS.md`, `TODO.md`, `ROADMAP.md` |

### Palette V1.1.6 (référence)

```
Texte :     #111 / #555 / #999
Bordures :  #e5e5e5
Fond subtil : #f7f7f7
Fond page : #faf9f5 (Lugia, gardé inchangé)

Vert (Points forts) :        #2e7d4f
Orange (Points vigilance) :  #b45200
Bleu (CTA recommandé) :      #1a56a0

Badge "À surveiller" :  fond #f0f0f0  /  texte #555  (gris neutre)
Badge "À risque" :       fond #fbeae0  /  texte #8a4a1a  (rouille discret)
```

### Niveaux qualitatifs — badges asymétriques

| Niveau | Badge affiché ? | Forces max | Risques max |
|---|---|---|---|
| 1 Maîtrisé | non (l'absence est un signal positif) | 3 | 0 |
| 2 Opérationnel | non (idem) | 3 | 2 (plancher si rien ne déclenche) |
| 3 À surveiller | oui (gris neutre) | 2 | 2 |
| 4 À risque | oui (rouille discret) | 1 | 3 |

La distinction Maîtrisé/Opérationnel se fait par la **présence ou non de la section "Points de vigilance"** : Maîtrisé n'affiche que les forces, Opérationnel ajoute 1 ou 2 vigilances.

### Refonte du Hero

- Plus de `PageHeader` (composant retiré de la page résultats — toujours utilisé sur les autres pages).
- Breadcrumb simple en uppercase 11px gris : `DIAGNOSTIC PRÉVENTIF GRATUIT`.
- H1 serif Georgia 28px (typo Lugia conservée — un kit de marque global viendra ultérieurement).
- Date en gris #999.
- Bloc situation : border-left 3px gris #e5e5e5 (au lieu de l'encadré crème V1.1.5).
- Saut de ligne (`<br /><br />`) + gras sur la phrase pivot *"Deux points méritent d'être regardés en priorité"* (ou *"Un point mérite d'être regardé en priorité"*).

### Refonte facettes

- Grid `gap-[1px]` sur fond `#e5e5e5` créant des séparateurs naturels, border-radius 8px.
- Cartes : fond blanc, padding 20px, sans bordure individuelle.
- Listes : tirets `–` gris #999 (`before:content-['–']`), plus de bullets disc.
- Labels Points forts (vert #2e7d4f) / Points de vigilance (orange #b45200) — uppercase bold 10px.
- Séparateur fin `border-t border-[#ebebeb]` entre forts et vigilance dans chaque card.
- Légende sous la grille : badges + signification.
- **LevelBar (barre 4 segments) supprimée** — le badge texte suffit, plus épuré.

### Refonte opportunités

- Plus de badge "Priorité X" — remplacé par un numéro 28px bold couleur pâle `#d0d8f0` à gauche du titre.
- En-tête fond `#f7f7f7` avec bordure basse.
- Corps en **2 colonnes** :
  - Gauche (fond blanc) : `LA SITUATION` = `chantier.vu + " " + chantier.analyse` (fusion fluide).
  - Droite (fond `#fcfcfc`) : `L'ACTION PROPOSÉE` = `chantier.propose`.
- Pied fond `#f7f7f7` : label `À CONFIRMER ENSEMBLE` sur sa ligne + texte `chantier.pas_confirmer` en 12.5px.
- Plus de schéma 4 quadrants — la matière analytique reste, la présentation est resserrée.

### Refonte Prochaine étape

- 3 cards grid avec carte recommandée mise en avant : bordure bleue `#1a56a0` + bouton CTA bleu plein.
- Cartes secondaires : bordure grise + bouton bordure grise.
- Nouveau champ `cta` dans `NEXT_STEPS` ("Choisir un chantier", "Prendre rendez-vous", "En savoir plus").
- Titre "Prochaine étape ?" passe de h2 serif à label uppercase 11px gris.

### Séparation de la recommandation italique (V1.1.6-f)

La phrase italique de Lugia (*"Avant tout chantier, Lugia commence par une vue d'ensemble..."*) était précédemment incluse en fin de synthèse. Elle est désormais **extraite dans une section dédiée**, affichée **entre les facettes et les opportunités d'action**, pour faire transition narrative entre "voici votre situation" et "voici les leviers d'action".

- Backend : nouvelle fonction `build_recommandation(answers, interview_id)` dans `src/templates.py`. Logique de sélection 3 contextes identique à V1.1.5-b (`reco:ia_visible` / `reco:descriptions` / `reco:default`).
- `build_synthesis` ne retourne plus la reco. Le payload `/report` expose désormais `synthesis` ET `recommendation` séparément.
- Type `Report` côté frontend enrichi (`recommendation?: string`).
- Rendu frontend : italique pleine largeur centré, marges verticales aérées (`py-6`), pas de bordure colorée (premier essai avec border-left bleu retiré sur retour utilisateur).
- `dump_report.py` adapté : insertion `> *...*` entre angles et opportunités.

### Phrase choc enrichie de `<strong>`

Les 22 variantes de `build_phrase_choc` portent maintenant 1 ou 2 mots-clés en gras pour faire ressortir le pivot révélateur. Exemple : *"Un remplaçant qui débarquerait demain n'aurait pas de document à consulter"* (cadre_absent #1), *"votre fatigue"* (debordement_perso #0), *"n'a pourtant pas de lien contractuel avec votre cabinet"* (ia_stack #0).

### Wireframes ajoutés

Trois fichiers de référence dans `wireframes/` :

- `resultats_v1_actuel.pdf` — V1.1.5 état avant V1.1.6.
- `resultats_v2_cible.pdf` — maquette cible V1.1.6.
- `resultats_v2_specs.md` — specs détaillées (palette, typo, layout, règles de ton visuel).

### Modifié — résumé par fichier

| Fichier | Changement |
|---|---|
| `web/components/AppHeader.tsx` | Refondu en nav V2 (logo + actions + bordure basse) |
| `web/app/globals.css` | Suppression encart crème sur `.lugia-synthesis em` |
| `web/lib/api.ts` | `Report.recommendation?` ajouté |
| `web/app/resultats/page.tsx` | Refonte complète (Hero, FacetCard sans barre, ChantierCard 2 colonnes, NextStepCard CTA, reco déplacée) |
| `src/templates.py` | `build_recommandation` extraite, `build_synthesis` épurée, 22 `<strong>` injectés dans phrase_choc, gras + saut de ligne sur "Deux/Un point" |
| `backend/main.py` | Expose `recommendation` dans payload `/report` |
| `scripts/dump_report.py` | Markdown adapté au format V2 (entête, niveaux qualitatifs, reco entre angles et opportunités) |

### Tests bout en bout

- Test local sur Chateau + profils opposés : rendu V2 conforme aux specs.
- Validation visuelle par Sébastien sur plusieurs profils (Maîtrisé / Opérationnel / À surveiller / À risque).
- Couleurs vérifiées : vert/orange/bleu/rouille uniquement où sémantiquement justifiées, fond crème Lugia conservé.

### Reste ouvert

- **dump_report et synthèse** : la fonction `build_synthesis` retourne toujours une chaîne unique sans `<p>` entre les blocs (phrase choc, organisation, zone). Avec V1.1.6-f, le saut de ligne `<br /><br />` est introduit avant "Deux/Un point", mais le rendu reste un seul paragraphe sinon. Si le besoin d'aération supplémentaire émerge, modifier `build_synthesis` pour wrapper chaque bloc dans un `<p>`.
- **Synthèse mobile** : le rendu sur écran étroit (mobile, <600px) n'a pas été testé en V1.1.6. À valider en V1.2 ou avant le premier test client.
- **Kit de marque global** : Sébastien prépare un kit complet (typo, couleurs, logo) qui viendra harmoniser l'ensemble. La typo Georgia + sans-serif système reste pour l'instant — sera revisitée à réception du kit.

---

## 2026-05-16 — V1.1.5 : niveaux qualitatifs + forces/risques par facette + opportunités d'action + prénom optionnel

Refonte UI/méthodologique de la page de résultats. Sept sous-vagues livrées dans la journée (a, b, c, d, e, f, h, i, j, k — la lettre `g` est cette entrée). Aucune dépendance ajoutée, aucune rupture de l'auth ou du déploiement Render/Vercel.

### Vue d'ensemble

Avant V1.1.5, la page de résultats affichait pour chaque facette un score sur 10 + une phrase de résumé + 3 cartes de "chantiers prioritaires". Le calibrage des seuils niveaux qualitatifs et la valeur méthodologique de l'analyse étaient saturés. V1.1.5 refond cet affichage en :

- **4 niveaux qualitatifs** au lieu d'un score chiffré (Maîtrisé / Opérationnel / À surveiller / À risque).
- **Forces et points de vigilance** affichés explicitement, extraits des options du questionnaire avec priorité.
- **Chantiers reframés en "opportunités d'action"** explicitement liées aux risques relevés plus haut.
- **Champ prénom optionnel** sur les options secrétariat/équipe pour personnaliser le rapport ("Marie, votre télésecrétaire", "Hervé, votre assistant·e médical·e").

### Sous-vagues livrées

| Sous-vague | Périmètre | Fichiers principaux |
|---|---|---|
| V1.1.5-a | Bug visuel + intro chantiers raccourcie | `web/app/resultats/page.tsx` |
| V1.1.5-b | Mapping score → niveau qualitatif backend | `src/scoring.py`, `backend/main.py` |
| V1.1.5-c | Templates Forces/Risques par option (40 fragments) | `src/swot.py` (nouveau module) |
| V1.1.5-d | Exposition niveau + forces/risques dans `/report` | `backend/main.py`, `web/lib/api.ts` |
| V1.1.5-e | Refonte affichage facettes : badge niveau + barre segments + listes | `web/app/resultats/page.tsx`, `web/components/CheckupWidgets.tsx` |
| V1.1.5-f | Reframing chantiers en opportunités (titre + 4 labels + intro + 7 pas_confirmer) | `web/app/resultats/page.tsx`, `src/workstreams.py` |
| V1.1.5-h | Patch 3 analyses chantiers avec références métier | `src/workstreams.py` |
| V1.1.5-i | Champ prénom optionnel (BDD + protocol + API + frontend + moteur rapport + seed) | 6 fichiers (cf D-024) |
| V1.1.5-j | Risque de plancher dès niveau 2, note confidentialité prénom, layout 3 colonnes | `src/swot.py`, `web/components/CheckupWidgets.tsx`, `web/app/resultats/page.tsx` |
| V1.1.5-k | Fusion ex-niveau 4-5 en un seul niveau 4 (À risque) + raccourcissement forces personnalisées | `src/scoring.py`, `src/swot.py`, `web/lib/api.ts`, `web/app/resultats/page.tsx` |

### Mapping score → niveau qualitatif

Décision actée en `DECISIONS.md` D-023. 4 niveaux, seuils stricts :

| Score brut /10 | Niveau | Label | Couleur (sémantique) |
|---|---|---|---|
| 9-10 | 1 | Maîtrisé | green |
| 7-8 | 2 | Opérationnel | yellow |
| 5-6 | 3 | À surveiller | orange |
| 0-4 | 4 | À risque | red |

La fusion niveau 4-5 a été décidée en V1.1.5-k après constat empirique : la calibration des `health_scores` du questionnaire (cf `resources/interview_protocol.json`) ne permet pas mathématiquement à toutes les facettes d'atteindre l'ex-niveau 5 (score ≤ 2). Au pire absolu, Parcours patient plafonne à 3,3, Équipe et secrétariat à 2,7. Fusionner garde une échelle cohérente avec ce que le scoring peut produire et évite de promettre un niveau inatteignable.

### Forces et risques par facette

Mécanique en deux temps documentée dans `src/swot.py` :

1. **Filtrage + tri + troncature** — chaque option du questionnaire peut être taguée comme déclencheur de force ou de risque, avec une priorité (1 = le plus structurant). À la génération, on garde les fragments dont le trigger est actif, on trie par priorité, on tronque selon le volume du niveau :

| Niveau | Forces max | Risques max |
|---|---|---|
| 1 Maîtrisé | 3 | 1 |
| 2 Opérationnel | 3 | 2 |
| 3 À surveiller | 2 | 2 |
| 4 À risque | 1 | 3 |

2. **Planchers de garantie** — si la liste est vide après filtrage, on active une phrase de plancher :
   - **Force** : toujours active si rien ne déclenche (chaque facette a 1 force générique).
   - **Risque** : active uniquement si niveau ≥ 2. Le niveau 1 reste sans risque affiché.

**40 fragments** au total : 21 forces + 15 risques + 3 forces de plancher + 3 risques de plancher.

Le format des fragments est passé de phrases analytiques longues (V1.1.5-c initial) à des phrases nominales courtes (V1.1.5-c bis, suite retour utilisateur "trop long"). La matière analytique reste accessible dans le bloc "Ce que ça révèle" des opportunités, enrichi par V1.1.5-h.

### Opportunités d'action (anciennement "chantiers")

Le titre de section "Trois chantiers prioritaires" devient **"Trois opportunités d'action"**. L'intro est reformulée pour expliciter le lien forces/risques/opportunités :

> *Les opportunités ci-dessous sont des leviers d'action concrets : chacune répond aux risques relevés plus haut, en s'appuyant sur les forces déjà en place quand c'est possible. À vous d'arbitrer ce qui vaut la peine d'être engagé en premier.*

Les 4 labels internes de chaque carte d'opportunité ont été renommés (V1.1.5-f) :

| Avant | Après |
|---|---|
| Ce que nous avons compris | Ce que nous avons observé |
| Ce que ça révèle | Ce que ça révèle *(inchangé)* |
| Ce qui nous échappe encore | À confirmer ensemble |
| Ce que nous vous proposons | L'opportunité d'action |

Les 7 phrases `pas_confirmer` ont été réécrites en hypothèses à confirmer ensemble (format *"Probablement... À mesurer ensemble"*), pour faire entendre l'accompagnement humain proposé.

### Champ prénom optionnel (V1.1.5-i)

Cf `DECISIONS.md` D-024 pour la motivation et l'architecture. Résumé technique :

- Nouvelle colonne `entity_name TEXT NULL` dans la table `answer` (migration légère via SQLAlchemy + ALTER TABLE).
- 8 options du questionnaire portent `has_entity_field: true` dans `interview_protocol.json` : Q02_a/b/c/other (secrétariat) et Q07_b/c/d/other (équipe étendue).
- Input texte conditionnel sous l'option choisie côté frontend, avec label contextuel ("Prénom de votre secrétaire", "Prénom de votre assistant·e médical·e", etc.).
- Note de confidentialité factuelle : *"Donnée privée, stockée dans votre espace, jamais partagée ni utilisée à d'autres fins."*
- 6 fragments forces enrichis : si `entity_name` présent, version personnalisée ("Hervé, votre assistant·e médical·e, en soutien direct."), sinon fallback générique ("Assistant médical en soutien direct au cabinet.").
- Fallback silencieux : `entity_name` null, vide ou composé d'espaces → strip → traité comme None → fallback générique. Pas d'invention de prénom, jamais.
- Seed Chateau enrichi : `entity_name="Marie"` pour Q02 (la télésecrétaire actuelle, post-Catherine).

### Modifié — résumé par fichier

| Fichier | Changement |
|---|---|
| `src/scoring.py` | `score_to_level()` + 4 niveaux (V1.1.5-b puis fusion V1.1.5-k) |
| `src/swot.py` | Nouveau module — 40 fragments forces/risques + planchers + `_pick_variant` réutilisé + lambdas pour entity_name |
| `src/templates.py` | `derive_entity_name(answers, qid)` |
| `src/workstreams.py` | 7 phrases `pas_confirmer` réécrites en hypothèses + 3 analyses enrichies métier (V1.1.5-h) |
| `src/db.py` | Colonne `entity_name` + migration `_ensure_entity_name_column_on_answer()` + `save_answer` accepte `entity_name` |
| `backend/main.py` | API `/report` expose niveau + forces/risques. `POST /answer` accepte `entity_name`. Import `swot`. |
| `scripts/seed_persona.py` | `entity_name="Marie"` pour Q02 |
| `scripts/dump_report.py` | Refonte complète du markdown : niveaux qualitatifs, barre 5 segments (markdown ▰░), forces/risques en listes, opportunités d'action |
| `resources/interview_protocol.json` | 8 options enrichies `has_entity_field` + `entity_field_label`, version 1.7 → 1.8 |
| `web/lib/api.ts` | Type `Option` enrichi (`has_entity_field?`, `entity_field_label?`). Type `Answer` enrichi (`entity_name?`). Type `FacetScore` enrichi (`level`, `level_label`, `level_color`, `forces?`, `risques?`) |
| `web/components/CheckupWidgets.tsx` | Input prénom conditionnel + note confidentialité. `AnswerState` enrichi. |
| `web/app/resultats/page.tsx` | Refonte `FacetCard` (niveau + barre 4 segments + forces + risques) + `LevelBar` + `LevelBadge` + reframing chantiers en opportunités |

### Tests bout en bout

- Smoke tests `score_to_level` sur 0-10 → mapping conforme 4 niveaux.
- Tests forces/risques : `_pick_variant` déterministe, plancher activé correctement par niveau, callables (entity_name) résolus en runtime.
- Test fallback `entity_name=None/""/"   "` → version générique systématique. Pas d'invention de prénom.
- Test bout en bout local (backend uvicorn + frontend npm run dev pointé localhost:8000) : seed Chateau, login lien magique en mode console, page `/resultats?interview=<id>`, vérification visuelle des 3 cards facette + opportunités + Marie dans la force participants. Validé par l'utilisateur le 2026-05-16.
- Test profil "tout au pire" : 3 facettes en "À risque" rouge (validation V1.1.5-k).

### Reste ouvert (V1.5+)

- Q12 (téléconsultation) limite mathématiquement Parcours patient à un score min de 3,3 → calibration health_scores à revisiter en V1.5.
- Prédécesseur du secrétariat ("départ de Catherine") reste extrait par regex sur `complement_text` — mécanisme fragile, à transformer en champ structuré en V1.5+ si le besoin se confirme côté retours utilisateurs.
- Page `/methode` qui rend public le mapping score → niveau et le mécanisme forces/risques par option, pour défendre publiquement la grille de lecture (cf D-023).

---

---

## 2026-05-16 — V1.1 Vague 2.2 patch éditorial : refonte des 24 phrases choc

Après tests locaux du 16 mai sur 3 interview_ids Chateau consécutifs (28/29/30), refonte complète des 24 variantes de `build_phrase_choc`. Les retours utilisateurs ont fait remonter cinq problèmes éditoriaux structurants que les variantes initiales (livrées en 2.2a) reproduisaient à des degrés divers.

### Cinq problèmes corrigés

**1. Phrases qui critiquent la pratique du médecin.** Le check-up ne sait pas si la configuration actuelle est subie ou choisie. Tant que cette information n'est pas dans le questionnaire, formuler une critique reste une hypothèse de Lugia. Tournures éliminées : "rien n'est doublé", "le maillon faible", "variable d'ajustement par défaut", "angle mort", "usage débrouillard", "irritants". Remplacées par des constats systémiques (configuration, mécanisme d'absorption, point de passage, dispositif unique).

**2. Phrases qui confortent dans les convictions.** L'esprit MBTI exige une interrogation des limites même quand tout semble bien fonctionner. Toutes les variantes du pattern `default` ont été refondues pour poser la question "est-ce que rien ne va mal, ou est-ce que personne ne mesure ?" plutôt que pour valider la sérénité du médecin.

**3. Constats banaux qui ne révèlent rien.** "Votre cabinet est tenu par une seule personne — vous" est évident pour un médecin solo : ce n'est pas une révélation. Les variantes ont été reformulées pour pointer des zones aveugles non évidentes : mémoire non documentée, absence de trace IA, fatigue comme seul indicateur, frictions invisibles, etc.

**4. Vocabulaire et formulations problématiques.**
- *"capacité d'amortissement"* (financier, décalé en contexte médical) → *"marge de manœuvre"*
- *"vous répondrez devant l'Ordre ou la CNIL"* (menace explicite, bloque la lecture) → *"la responsabilité revient au médecin qui en fait usage"*
- *"un avantage qui devient une dépendance"* (jugement) → *"cette configuration repose sur votre présence continue ; toute absence, même brève, ralentit l'ensemble"*
- *"les cabinets regrettent"* (faute rétrospective moralisatrice) → *"c'est précisément le moment où des repères posés à froid peuvent être utiles"*
- *"dans votre tête, pas dans le système"* (infantilisant) → *"ce suivi vit dans votre attention au fil des dossiers"*
- *"en sachant qu'il ne saurait pas lesquelles poser"* (paradoxe alambiqué) → *"il devrait reconstituer ces règles à mesure que les situations se présentent"*
- *"organisations"* (4 occurrences hors-contexte) → *"cabinets"* / *"cabinet médical"*

**5. Manque d'ancrage métier.** Les phrases initiales restaient systémiques mais désincarnées. La refonte ajoute des références concrètes à des situations professionnelles que les médecins rencontrent au quotidien : courriers au spécialiste, comptes-rendus, renouvellements, résultats anormaux, certificats, suivi des chroniques, tiers payant, SMS de patient, anonymisation, saison épidémique, départ secrétariat, contacts privilégiés chez les spécialistes, etc. 18 phrases sur 24 contiennent désormais au moins un ancrage métier nommé.

### Principe éditorial désormais documenté

La phrase choc doit suivre une structure de **constat factuel du système** + **interrogation/risque non évident**, et jamais :

- Conforter le médecin dans son fonctionnement ("vous faites bien").
- Critiquer son mode de fonctionnement ("rien n'est doublé").
- Répéter une évidence connue ("vous êtes seul").
- Imposer une lecture ("organisation insuffisante").
- Citer nommément une institution répressive (Ordre, CNIL, etc.).

Elle doit pointer une **zone aveugle systémique** : absence de mesure, absence de trace, dépendance silencieuse, friction absorbée sans signal, ressource non remplaçable. Le médecin choisit s'il s'y reconnaît ou non.

### Modifié (Vague 2.2 patch éditorial)

- `src/templates.py::build_phrase_choc` — fonction entièrement réécrite. Les 6 patterns × 4 variantes = 24 phrases finales, toutes refondues selon le principe éditorial ci-dessus.
- Docstring mise à jour pour documenter le principe.

### Tests

Tests précédents (déterminisme, sel par section, fallback `None`, stabilité, diversité sur 10 ids par pattern) restent valides — seul le wording des variantes a changé, pas la mécanique de sélection.

### Reste ouvert

Test local utilisateur final sur 4-9 ids consécutifs pour vérifier visuellement le rendu des 4 variantes par pattern. Si une formulation reste trop directe / trop molle / non métier, à signaler avec son ref `phrase_choc:<pattern>` + numéro de variante.

---

## 2026-05-15 — V1.1 Vague 2.2d : 21 analyses chantier (2 nouvelles par contexte × 7 contextes)

Quatrième et dernière sous-vague d'écriture. Multiplie de 1 à 3 le nombre de variantes pour chacun des 7 contextes d'analyse chantier — c'est la phrase qui dit "ce que ça révèle" entre l'observation et la proposition de chaque chantier, sur les trois cartes du bas de page. Diversité analytique : chaque contexte propose un angle différent de la même analyse.

Rythme aligné sur 2.2c (3 variantes par contexte = 1 héritée + 2 nouvelles) plutôt que les 3-4 prévues initialement. Critère "pas de surqualité" : 3 angles distincts suffisent pour éviter la perception "rapport copié-collé entre deux médecins" ; au-delà, les variantes deviennent difficiles à différencier clairement.

### Contextes enrichis

| Contexte | section_key | Variantes | Trigger |
|---|---|---|---|
| Demandes directes Q04=q04_d | `analyse:demandes_directes:q04` | 3 | canaux directs (type Chateau) |
| Charge déborde Q05=q05_d | `analyse:demandes_directes:q05` | 3 | débordement admin sans canaux directs |
| Aucun trigger demandes | `analyse:demandes_directes:default` | 3 | pas de surcharge détectée |
| IA grand public Q13=q13_c/d | `analyse:ia:triggered` | 3 | usage IA déclaré |
| Pas d'IA déclarée | `analyse:ia:default` | 3 | aucun usage IA |
| Absence fragile Q08=q08_c/d | `analyse:absence:triggered` | 3 | continuité fragile |
| Absence couverte | `analyse:absence:default` | 3 | dispositif solide |

Total : 21 analyses chantier, 14 nouvelles (2 par contexte), 7 héritées de V1.1.

### Angles distincts par contexte

- **demandes_directes:q04** : suivi mental seul (V1.1) / visibilité absente (#1) / installation auto-renforçante (#2)
- **demandes_directes:q05** : compensation invisible (V1.1) / ressource d'amortissement (#1) / indicateur en retard (#2)
- **demandes_directes:default** : repère mesuré (V1.1) / état des lieux préventif (#1) / bon moment à froid (#2)
- **ia:triggered** : vigilance seule (V1.1) / responsabilité structurelle (#1) / sécuriser plutôt que renoncer (#2)
- **ia:default** : diffusion rapide (V1.1) / pratique confrères (#1) / apprentissage à froid (#2)
- **absence:triggered** : règles écrites (V1.1) / test semaine d'arrêt (#1) / ce qui se transmet (#2)
- **absence:default** : perfectible (V1.1) / mieux préparé que la moyenne (#1) / audit léger (#2)

### Tests

- Non-régression `interview_id=None` → identique V1.1 sur les 7 contextes.
- Diversité sur 10 `interview_id` par contexte : 3/3 variantes couvertes pour 6 contextes, 2/3 pour 1 contexte (absence:triggered) — distribution conforme aux probabilités d'un tirage 3-cases × 10-essais.
- Stabilité confirmée : 3 ids × 5 appels chacun → analyse toujours identique.

### Modifié (Vague 2.2d)

- `src/workstreams.py` — branches `analyse_variants` enrichies pour les 3 chantiers : `chantier_demandes_directes` (3 contextes), `chantier_ia` (2 contextes), `chantier_absence` (2 contextes). Aucune autre signature ne change.

### Vague 2.2 — wording terminé

Au total après 2.2a-d :

| Section | Variantes | Source |
|---|---|---|
| Phrase choc | 24 | Vague 2.2a |
| Recommandation italique | 3 | Vague 2.2b (signature concise + ancrage métier) |
| Chaînes causales | 15 | Vague 2.2c |
| Analyses chantier | 21 | Vague 2.2d |
| **Total** | **63 fragments** | **51 nouveaux** (12 hérités V1.1) |

Reste à faire :

- **2.2e** — tests bout en bout sur 5-10 profils distincts en local (Chateau + variantes + profils opposés) via `python scripts/dump_report.py`, lecture humaine de la diversité perçue.
- Journalisation finale : `DECISIONS.md` D-022 (sel par section + critère "pas de variantes sur la reco commerciale"), `TODO.md` (Vague 2.2 livrée), `ROADMAP.md` (V1.2 SLM débloquée).

---

## 2026-05-15 — V1.1 Vague 2.2c : 15 chaînes causales (2 nouvelles par pattern × 5 patterns)

Troisième sous-vague d'écriture. Multiplie de 1 à 3 le nombre de variantes pour chacun des 5 patterns de chaîne causale. C'est ici que la diversité analytique compte le plus : la chaîne causale **nomme une interdépendance** entre deux ou trois constats — c'est l'endroit du rapport qui pile l'axe 1 Lugia ("comprendre les causes racines et les interdépendances", cf MASTER_PROMPT §2). Trois angles distincts par pattern, pour proposer trois lectures cohérentes de la même interdépendance.

### Patterns enrichis

| Pattern | section_key | Variantes | Trigger |
|---|---|---|---|
| Débordement admin (canaux directs + cadre flou) | `chaine:debordement_admin` | 3 | q05_d + q04_d + q03_c/d |
| Fragilité continuité (solo + isolement + pas de dispositif) | `chaine:fragilite_continuite` | 3 | q08_c/d + q07_a + q01_a |
| Usage IA grand public (besoin réel + stack peu intégré) | `chaine:ia_stack` | 3 | q13_c/d + q09_d |
| Perte de vue chroniques (solo + pas d'alerte) | `chaine:perte_vue_chroniques` | 3 | q10_d + q07_a |
| Tri opportuniste résultats (isolement + pas d'alerte) | `chaine:tri_opportuniste` | 3 | q11_d + q07_a |

Total : 15 chaînes causales, 10 nouvelles (2 par pattern), 5 héritées de V1.1.

### Angles distincts par pattern

Chaque pattern propose trois angles d'attaque de la même interdépendance :

- **debordement_admin** : double facteur (V1.1) / cascade (#1) / filtrage en amont (#2)
- **fragilite_continuite** : isolement (V1.1) / réseau absent (#1) / paradoxe robustesse/fragilité (#2)
- **ia_stack** : alternative manquante (V1.1) / besoin pragmatique (#1) / contournement rationnel (#2)
- **perte_vue_chroniques** : initiative patient (V1.1) / angle mort silencieux (#1) / inversion contrôle (#2)
- **tri_opportuniste** : contrainte (V1.1) / méthode forcée (#1) / charge attentionnelle (#2)

### Tests

- Non-régression `interview_id=None` → identique V1.1 sur les 5 patterns.
- Diversité sur 10 `interview_id` par pattern : **3/3 variantes couvertes** pour les 5 patterns (couverture maximale sur tous).
- Stabilité confirmée : 4 ids × 5 appels chacun → chaîne toujours identique.

### Modifié (Vague 2.2c)

- `src/templates.py::build_chaine_causale` — chaque branche enrichie de 2 variantes supplémentaires. Aucune autre signature ne change.

### Reste ouvert (Vague 2.2d)

- 2.2d — analyses chantier : 3-4 par contexte × 7 contextes (~18-21 nouvelles). C'est la sous-vague la plus volumineuse en écriture.

---

## 2026-05-15 — V1.1 Vague 2.2b : reco italique réécrite concise, pas de variantes

Itération directe sur la première version 2.2b. Après réflexion utilisateur : la recommandation italique est une **fermeture commerciale standardisée**, pas une phrase d'analyse. Sa fonction est de rappeler la thèse Lugia ("vue d'ensemble avant chantier") et d'inviter à la suite. Pour deux médecins du même profil, le contenu est intrinsèquement identique — varier le wording de cette phrase est de la cosmétique, qui peut même affaiblir la "signature Lugia" reconnaissable.

Décision : revenir à **1 variante par contexte** (au lieu des 4 prévues initialement par la cible TODO), mais réécrire chacune pour qu'elle soit **plus concise que la V1.1 héritée et plus ancrée dans le métier** (cabinet, secret médical, semaine). L'effort éditorial libéré est réinvesti sur 2.2c (chaînes causales) et 2.2d (analyses chantier) où la diversité a un vrai sens analytique.

### Reco italique réécrite (3 phrases, 1 par contexte)

**`reco:ia_visible`** (~30 mots, métier : secret médical + IA grand public)
*Avant tout chantier, Lugia commence par une vue d'ensemble de votre cabinet. Pour vous, le pas qui pèse le plus est de remplacer votre IA grand public par un environnement conforme au secret médical.*

**`reco:descriptions`** (~35 mots, métier : organisation cabinet + demandes patients + courriers + coordination)
*Lugia commence par une vue d'ensemble de votre organisation de cabinet, avant tout chantier ciblé. Une heure d'échange suffit à confirmer cette lecture et tracer la première action — qu'il s'agisse de demandes patients, de courriers ou de coordination.*

**`reco:default`** (~35 mots, métier : coordination + suivi chroniques + courriers + organisation interne)
*Lugia commence par une vue d'ensemble de votre cabinet, même quand rien ne presse. Une heure d'échange suffit à identifier où porter l'attention en premier — coordination, suivi des chroniques, courriers ou organisation interne.*

### Itération sur l'ancrage métier des reco non-IA

Une seconde passe a élargi l'ancrage métier des reco non-IA. La V0 du revirement (sobriété : "votre cabinet" + "votre semaine") faisait paraître ces reco "trop génériques" face à la V1.1 héritée qui mentionnait au moins le secret médical pour ia_visible. Décision : nommer plusieurs sujets concrets de médecin libéral (demandes patients, courriers, coordination, suivi des chroniques, organisation interne) dans les reco non-IA, sans introduire l'IA hors-contexte. La reco devient ainsi reconnaissable même quand le sujet IA ne s'applique pas, en proposant un éventail de sujets que le médecin sait être les siens. Aucune projection hors-questionnaire : tous les sujets cités sont des champs Lugia explicites (Q04 demandes patients, Q05/Q09 courriers, Q10 chroniques, Q07/Q12 coordination, Q03 organisation interne).

### Pourquoi ce revirement

Question utilisateur : "pourquoi créer des variantes de la dernière phrase si c'est pour le même profil de persona ?". Argument retenu : la diversité d'écriture a du sens pour les phrases **d'analyse** (phrase choc, chaîne causale, analyses chantier) qui proposent un angle de lecture différent du même profil. Elle n'a pas de sens pour une phrase **commerciale** qui propose toujours la même chose (consultation Lugia + thèse vue d'ensemble + référence métier). Mieux vaut une signature reconnaissable, courte et ancrée dans le métier qu'un éparpillement cosmétique.

### Critère opérationnel TODO ajusté

Le critère "deux médecins du même profil ne reçoivent pas la même phrase" est **maintenu pour les sections analytiques** (phrase choc, chaîne causale, analyses chantier) mais **levé pour la recommandation italique** qui est commerciale. La signature Lugia gagne en clarté.

### Tests

- Non-régression `interview_id=None` non testée pour cette section (le wording a changé volontairement, plus comparable à V1.1).
- 20 ids × 3 contextes → toujours 1 reco unique par contexte. Comportement attendu.

### Modifié (Vague 2.2b révisée)

- `src/templates.py::build_synthesis` — 3 branches `reco_variants` ramenées à 1 variante chacune, réécrites concises et métier. Aucune autre signature ne change.

### Reste ouvert (Vagues 2.2c-d)

- 2.2c — chaînes causales : 15 phrases (2 nouvelles par pattern × 5 patterns). Diversité analytique pertinente.
- 2.2d — analyses chantier : ~25 phrases (3-4 par contexte × 7 contextes). Diversité analytique pertinente.

---

## 2026-05-15 — V1.1 Vague 2.2a : 24 phrases choc (3 nouvelles par pattern × 6 patterns)

Première sous-vague d'écriture de wording après mise en place du squelette 2.2.0. Multiplie de 1 à 4 le nombre de variantes pour chacun des 6 patterns de la phrase choc. Style MBTI conservé (ouverture qui claque + nuance qui ouvre), ton accompagnant, pas de marques nominales, factuel sur le système et pas sur la personne. Voir `MASTER_PROMPT.md` §2 (4 axes Lugia) et §8 (tonalité et garde-fous).

### Patterns enrichis

| Pattern | section_key | Variantes | Trigger |
|---|---|---|---|
| Porteur solo (type Chateau) | `phrase_choc:porteur_solo` | 4 | `signals_effort >= 3` |
| IA grand public + outils empilés | `phrase_choc:ia_stack` | 4 | `ia_non_conf and outils_empiles` |
| Débordement personnel sur cabinet structuré | `phrase_choc:debordement_perso` | 4 | `debordement_admin and not outils_empiles` |
| Cadre largement informel | `phrase_choc:cadre_absent` | 4 | `cadre_absent` |
| Signaux dispersés (effort modéré) | `phrase_choc:signaux_disperses` | 4 | `signals_effort >= 2` |
| Équilibre tenu (défaut) | `phrase_choc:default` | 4 | sinon |

Total : 24 phrases choc, 18 nouvelles (3 par pattern), 6 héritées de V1.1.

### Tests

- Non-régression `interview_id=None` → strictement identique à V1.1 sur les 6 patterns.
- Diversité sur 10 `interview_id` par pattern : entre 3 et 4 variantes uniques selon le pattern, distribution conforme aux probabilités (tirage 4 cases × 10 essais → couverture 3-4 attendue). Cible "deux médecins du même profil ne reçoivent pas la même phrase" largement atteinte : au minimum 5 ids sur 10 reçoivent une phrase distincte du tirage majoritaire.
- Stabilité : 4 ids × 5 appels chacun → phrase toujours identique.

### Modifié (Vague 2.2a)

- `src/templates.py::build_phrase_choc` — chaque branche enrichie de 3 variantes supplémentaires. Aucune autre signature ne change.

### Reste ouvert (Vagues 2.2b-d)

- 2.2b — recommandation italique : 9 phrases (3 par contexte × 3 contextes).
- 2.2c — chaînes causales : 15 phrases (3 par pattern × 5 patterns).
- 2.2d — analyses chantier : ~25 phrases (3-4 par contexte × 7 contextes).

---

## 2026-05-15 — V1.1 Vague 2.2.0 : mécanique de sélection déterministe des variantes

Squelette de la Vague 2.2 méthodologique (cf. `TODO.md` section dédiée). Ajoute l'infrastructure de sélection déterministe des variantes narratives, sans toucher au wording — sortie strictement identique à V1.1 tant que chaque pattern n'a qu'une seule variante. Prépare les Vagues 2.2a-d qui multiplieront les wordings.

### Mécanique

- Helper `_pick_variant(interview_id, variants, section_key)` ajouté à `src/templates.py`. Hash `md5(f"{interview_id}:{section_key}")` modulo `len(variants)`, stable cross-runs (contrairement à `hash()` Python qui randomise les strings). Sel par section : deux sections du même rapport piochent indépendamment, ce qui évite que deux médecins du même profil voient leurs sections shifter en bloc.
- Fallback `interview_id=None` → `variants[0]`. Le chemin V0 Streamlit (`pages/02_Resultats.py`, figé sur `v0-final`) reste compatible sans modification : il appelle `build_synthesis(answers)` et récupère le comportement V1.1 single-variant.

### Signatures et propagation

- `build_phrase_choc(answers, interview_id=None)` — 6 patterns, chacun expose désormais une liste de variantes (encore unique en 2.2.0).
- `build_chaine_causale(answers, interview_id=None)` — 5 patterns en cascade, idem.
- `build_synthesis(answers, interview_id=None)` — propage `interview_id` aux deux fonctions ci-dessus + bascule la recommandation italique (3 contextes) sur `_pick_variant`.
- `chantier_demandes_directes`, `chantier_ia`, `chantier_absence` (`src/workstreams.py`) — propagent `interview_id` à la fabrique de l'analyse (7 contextes au total). `build_workstreams(interview_id)` est inchangé dans sa signature publique.
- Callers patchés : `backend/main.py::get_report` et `scripts/dump_report.py::generate_markdown` passent désormais `interview_id` à `build_synthesis`. Aucun autre caller à toucher.

### Décision de sel par section

Choix retenu après arbitrage : `hash((interview_id, section_key)) % N` plutôt qu'un sel global unique. Garantit l'indépendance des sections entre deux profils similaires (phrase choc, recommandation, chaîne causale, analyses chantier piochent chacune dans leur propre espace). Pas de migration BDD nécessaire. Le jitter par interview en base est repoussé en V1.2 si besoin.

### Tests

Smoke test exécuté localement sandbox :

- Déterminisme stable : `_pick_variant(42, V, K) == _pick_variant(42, V, K)` répété N fois.
- Sel par section : `id=42` donne des indices distincts selon `section_key` (B, D, A, D sur 4 sections testées).
- Diversité : 10 `interview_id` distincts couvrent les 4 variantes d'une liste de test (3+ uniques requis, 4 atteints).
- Fallback `None` → toujours `variants[0]`.
- `ValueError` sur liste vide.
- Cross-runs : digest MD5 d'une clé connue produit l'index attendu (1 pour `42:phrase_choc:porteur_solo`).

Non-régression V1.1 → 2.2.0 confirmée sur 4 profils synthétiques (Chateau complet, minimal, IA-stack, neutre) : `build_phrase_choc`, `build_chaine_causale`, `build_synthesis`, les 3 facet summaries et les 3 chantiers retournent strictement les mêmes chaînes que la version V1.1 (testé avec `interview_id=None` et `interview_id=42`, équivalents tant qu'il n'y a qu'une variante par pattern).

### Modifié (Vague 2.2.0)

- `src/templates.py` — `_pick_variant` ajouté, signatures `build_phrase_choc`/`build_chaine_causale`/`build_synthesis` étendues, chaque branche enveloppe sa phrase actuelle dans une liste à un élément avec un `section_key` stable (`phrase_choc:porteur_solo`, `phrase_choc:ia_stack`, `phrase_choc:debordement_perso`, `phrase_choc:cadre_absent`, `phrase_choc:signaux_disperses`, `phrase_choc:default`, `chaine:debordement_admin`, `chaine:fragilite_continuite`, `chaine:ia_stack`, `chaine:perte_vue_chroniques`, `chaine:tri_opportuniste`, `reco:ia_visible`, `reco:descriptions`, `reco:default`).
- `src/workstreams.py` — signatures `chantier_*(answers, interview_id=None)`, branches `analyse_variants = [...]` + `_pick_variant` avec section keys `analyse:demandes_directes:q04`, `analyse:demandes_directes:q05`, `analyse:demandes_directes:default`, `analyse:ia:triggered`, `analyse:ia:default`, `analyse:absence:triggered`, `analyse:absence:default`. `build_workstreams` propage `interview_id` aux 3 chantiers.
- `backend/main.py` — `templates.build_synthesis(answers, interview_id)`.
- `scripts/dump_report.py` — `_html_to_md(templates.build_synthesis(answers, interview_id))`.

### Test local recommandé avant de pousser

```bash
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
source .venv/bin/activate
python scripts/seed_persona.py --email sebastien+test@gmail.com --reset
python scripts/dump_report.py --id <id>
diff <(git show v1.1:resources/sample_report.md 2>/dev/null || cat resources/sample_report.md) resources/sample_report.md
```

Diff attendu : aucune différence textuelle (mécanique seule, wording inchangé). Si différence il y a, c'est un bug.

### Reste ouvert (Vagues 2.2a-d)

Le squelette est prêt à recevoir les variantes supplémentaires : 18 phrases choc (3 par pattern × 6 patterns), 6 recommandations italiques (2 par contexte × 3 contextes), 10 chaînes causales (2 par pattern × 5 patterns), ~18 analyses chantier (2-3 par contexte × 7 contextes). Total cible Vague 2.2 : ~70 nouvelles formulations.

---

## 2026-05-15 — V1.1 Vague 3.1 : second passage sur questionnaire et ton du rapport

Itération sur les 8 retours utilisateur post-Vague 3 (Q03 hors axe, Q05 trop direct, format hétérogène, Q10 inadapté solo, Q11 peu pro, synthèse pas analytique, ton des analyses trop direct, mention facturation électronique oubliée). Aucune nouvelle dépendance, aucun changement de schéma BDD.

### Questionnaire (interview_protocol v1.4)

- **Format "mot-clé — détail" homogène** appliqué à Q02, Q03, Q04, Q05, Q06, Q07, Q08, Q09, Q10, Q11, Q12, Q13. Q01 conserve son format court (typologie close). Inscrit dans `global_rules_v1_1` comme 6ᵉ règle.
- **Q03 axe réaligné** sur le seul niveau de cadrage explicite : cadre écrit et appliqué (9), cadre oral (6), cadre écrit peu suivi (4), pas de cadre formel (3). L'option Vague 3 "découvertes surprenantes" (hors axe) disparaît du QCM.
- **Q05 reformulée** : free_text orienté tâches récurrentes hors temps de travail (au lieu de "hier soir" direct) ; frontière q05_c (bloc fin de journée au cabinet) vs q05_d (à la maison) désormais nette.
- **Q06_c reformatée** : "Un événement récent — j'ai eu besoin de prendre du recul sur mon organisation".
- **Q08 libellés homogénéisés** : "Tout continue — un dispositif…", "Un confrère assure — …", "Continuité partielle — …", "Fermeture — …".
- **Q10_b neutralisé** pour rester valide pour un médecin solo : "Liste de relance — je la tiens à jour (seul ou avec mon équipe)".
- **Q11 libellés professionnels** : "Alerte automatique — …", "Tri délégué — …", "Vérification régulière — …", "Vérification opportuniste — …".

### Synthèse "Votre situation aujourd'hui" — refonte

`src/templates.py::build_synthesis` est précédée d'une nouvelle phrase analytique `build_phrase_choc(answers)` qui sélectionne parmi quatre patterns selon le profil du répondant : effort personnel concentré, organisation informelle avec outils multiples, IA grand public au cœur du fonctionnement, ou équilibre tenu sur plusieurs points sensibles. La synthèse ne commence plus par une description ("Votre cabinet tourne. Vous en êtes seul aux commandes.") mais par une lecture du système ("Votre cabinet tient — mais il tient surtout par votre effort personnel, plus que par les dispositifs qui l'entourent.").

La mention de la facturation électronique de septembre est supprimée (`derive_enjeu_temporel` retirée). La recommandation italique est reformulée plus directe : "Le geste qui pèse le plus aujourd'hui est de…" au lieu de "La première chose qui vous aiderait est de prendre une vue d'ensemble…".

### Ton des analyses — adouci

`src/workstreams.py::chantier_ia` analyse : "L'IA arrivera dans votre cabinet d'une manière ou d'une autre" → reformulé en "L'IA générative est en train de devenir un outil courant pour beaucoup de professionnels de santé. Aborder le sujet maintenant, dans un cadre maîtrisé, permet de choisir vos usages plutôt que de les subir…".

`src/workstreams.py::chantier_absence` analyse : "Votre cabinet repose aujourd'hui sur votre seule mémoire. Aussi solide soit-elle, elle n'est pas transmissible. Un imprévu de plus de quelques jours expose vos patients à une rupture de service…" → reformulé en "Le fonctionnement actuel tient tant que vous êtes présent. Quelques règles écrites sur les cas courants (renouvellements, urgences, contacts critiques) permettent d'absorber une absence courte sans rupture."

### Vague 3.1b — compactage des analyses

Retour utilisateur immédiat sur Vague 3.1 : "trop de storytelling, reste concis et concret". Quatre analyses raccourcies à 2 phrases maximum, sans introduction générale type "Beaucoup de cabinets fonctionnent ainsi" :

- `chantier_flux` Q04+Q05 : 3 sub-phrases → 1 phrase factuelle.
- `chantier_ia` triggered : 3 phrases → 2 phrases ("Le besoin est légitime, le canal ne l'est pas.").
- `chantier_ia` non-triggered : 2 phrases longues → 2 phrases courtes.
- `chantier_absence` triggered : 3 phrases avec énumération → 2 phrases concrètes.

### Vague 3.1j — gap axe 2 (imprévus) et chaîne causale en synthèse

Suite de l'audit du parcours vs les 4 axes Lugia (cf MASTER_PROMPT section 2 et TODO session dédiée).

**Q08 refondue : planifié + imprévu en une seule question :**

Le gap axe 2 (imprévus et surcharges ponctuelles) identifié en audit. Q08 captait seulement les congés planifiés ("Quand vous prenez une semaine de congé"). Reformulée pour couvrir les deux dimensions :

| ID | Label | Santé |
|---|---|---|
| q08_a | Tout continue — un dispositif est prêt, planifié ou non | 9 |
| q08_b | Couvert dans les deux cas — un confrère ou un remplaçant prend le relais quelle que soit l'absence | 7 |
| q08_c | Préparé pour les congés, fragile pour l'imprévu | 4 |
| q08_d | Pas de dispositif — le cabinet ferme dans tous les cas | 2 |

Le palier intermédiaire q08_c est le plus juste pour la majorité des médecins solo qui gèrent leurs congés en fermant mais ne savent pas absorber une absence imprévue. Pour Chateau, le complément libre l'exprimait déjà ("Une semaine d'arrêt non planifié, je ne sais pas comment je gérerais") — il passe maintenant explicitement sur q08_c. Score Participants 3,00 → 3,33.

**`build_chaine_causale(answers)` — axe 1 Lugia nommé :**

Nouvelle fonction dans `src/templates.py` qui détecte cinq chaînes causales saillantes selon les combinaisons de réponses, et nomme une interdépendance plutôt que d'aligner deux symptômes :

| Trigger | Chaîne nommée |
|---|---|
| q05_d + q04_d + q03_c/d | Débordement admin ← canaux directs + cadre flou |
| q08_c/d + q07_a + q01_a | Fragilité continuité ← solo + isolement + absence dispositif |
| q13_c/d + q09_d | Usage IA grand public ← besoin réel + stack peu intégré |
| q10_d + q07_a | Perte de vue chroniques ← isolement + pas d'alerte |
| q11_d + q07_a | Tri opportuniste résultats ← isolement + pas d'alerte |

`build_synthesis` intègre la chaîne quand elle s'applique, à la place du bloc *"Deux points méritent d'être regardés en priorité : X et Y"*. Pile l'axe 1 Lugia ("comprendre les causes racines et les interdépendances"). Fallback systématique sur l'ancienne énumération si aucune chaîne ne déclenche.

**Adaptation `build_participants_summary` :**

Phrase Q08 adaptée à la nouvelle sémantique. Trois branches (q08_b, q08_c, q08_d) avec wordings cohérents avec la dimension imprévue.

### Modifié (Vague 3.1j)

- `resources/interview_protocol.json` v1.7 — Q08 refondue (qcm_prompt + 4 options).
- `resources/interview_protocol.md` v1.6 — tableau Chateau et descriptions Q08.
- `resources/sample_answers_pchateau.md` v2.4 — Chateau passe q08_c.
- `scripts/seed_persona.py` — Chateau Q08 = q08_c, complément libre adapté.
- `src/templates.py` — `build_chaine_causale` ajoutée, `build_synthesis` intègre la chaîne, phrase Q08 dans `build_participants_summary` mise à jour.

### Reste ouvert (V1.5+)

- Question imprévus opérationnels plus larges (au-delà de l'absence : annulation jour J, panne d'outil, pic de demande). Inscrit ROADMAP V1.5+.
- Question d'auto-priorisation médecin (axe 3 Lugia). Inscrit ROADMAP V1.5+.

### Vague 3.1i — quatre corrections après nouveau test prod

Quatre retours après second test prod avec un nouveau profil utilisateur.

**Pattern défaut moins rude :**

*"Pas de point de rupture évident dans votre cabinet — mais ce n'est pas une raison pour ne rien faire."* → *"Votre cabinet ne présente pas de point de rupture marqué. Quelques fragilités précises méritent quand même un coup d'œil, et toutes sont à portée."* Plus accompagnant, conserve l'invitation à agir sans la teneur de reproche.

**Bug d'espacement JSX dans l'intro chantiers :**

L'intro affichait *"anticiper les fragilitésencore gérables"* — JSX absorbait l'espace après `</strong>` suivi d'un saut de ligne. Refonte du JSX avec `{" "}` systématique autour de chaque `<strong>` pour garantir les espaces, peu importe la mise en page du code source.

**Chantier IA allégé :**

- Analyse : 5 lignes → 3 lignes. *"Le besoin est légitime, le canal ne l'est pas. Aujourd'hui votre vigilance tient seule un cadre exigeant — secret médical, RGPD, hébergement de santé, responsabilité civile professionnelle — qu'un outil dédié pourrait porter à votre place."* Les références métier sont condensées (pas d'énumération en deux temps avec "(HDS)" entre parenthèses).
- Proposition : 8 lignes → 4 lignes. *"Vous donner accès à un environnement IA conforme au secret médical pour les mêmes usages, sans anonymisation à la main. À votre rythme, ouverture à d'autres tâches utiles : préparation de courriers aux spécialistes, suivi de patients chroniques, comptes-rendus structurés."*

**Bug session "Voir résultats" → Chateau :**

Diagnostic : `get_active_interview` filtre sur `status == "in_progress"` et `order_by(updated_at)` desc. Le seed Chateau laissait volontairement la session en `in_progress` à `current_question_index = 14` (pour permettre la reprise depuis l'accueil). Conséquence : si le seed Chateau est rattaché au même email que celui avec lequel le user teste son propre parcours, et que le user n'a pas marqué sa session `complete` (ou si Chateau est plus récent), le bouton "Voir résultats" de l'accueil pointait sur Chateau.

Fix : `scripts/seed_persona.py` appelle désormais `db.mark_interview_completed(interview_id)` après l'insertion des 14 réponses. Chateau ne ressort plus comme "interview active" du user. Le rapport Chateau reste accessible via l'URL directe `/resultats?interview=<id>` (sortie de `dump_report.py --list`) ou via `python scripts/dump_report.py --id <id>`.

Note : à plus long terme (V1.5+), permettre une vraie liste des sessions du user sur l'accueil (in_progress + complete), avec un sélecteur. Pour V1.1 le fix court terme suffit.

### Modifié (Vague 3.1i)

- `src/templates.py` — pattern défaut de `build_phrase_choc` adouci.
- `web/app/resultats/page.tsx` — intro chantiers avec `{" "}` systématique.
- `src/workstreams.py` — analyse et propose chantier IA allégées.
- `scripts/seed_persona.py` — Chateau marqué `complete` à la fin du seed.

### Vague 3.1h — trois corrections après test prod V1.1 Vague 3.1g

Trois retours de test prod après push Vague 3.1g.

**Phrase choc — pattern 4 adapté au solo :**

Pattern 4 (`cadre_absent`) disait *"Votre cabinet fonctionne sur ce que chacun sait, pas sur ce qui est écrit. Tenable au quotidien, mais difficile à transmettre dès que quelque chose change."* — formulation inadaptée à un médecin libéral seul (pas de "chacun"). Refondue en formulation neutre qui marche dans les deux cas : *"Votre cabinet repose sur des règles qui ne sont nulle part écrites. Tenable au quotidien, moins évident dès qu'il faut transmettre, déléguer ou s'absenter."*

**Phrase Q08_d sans accusation implicite :**

`build_participants_summary` disait *"Pendant vos congés, le cabinet ferme — c'est la solution que vous avez retenue, **faute d'un dispositif préparé en amont**."* Le segment "faute de" est un reproche tacite à un médecin solo qui choisit légitimement de fermer pour ses congés. Refondue en simple constat : *"Pendant vos congés, le cabinet ferme — c'est l'organisation que vous avez retenue."* L'information "pas de dispositif" reste utilisée par `chantier_absence` (analyse + proposition), elle n'a pas besoin d'être répétée dans la synthèse facette.

À reconsidérer en V1.5+ : ajouter une question explicite "fermeture voulue ou subie ?" qui justifierait alors de différencier le wording.

**Intro chantiers — moins de gras :**

Vague 3.1g mettait 6 expressions en gras (4 axes + vision intégration intégrale), ce qui sursignifiait et perdait la hiérarchie. Vague 3.1h garde 3 ancres seulement : **vision complète**, **anticiper les fragilités**, **interface où votre organisation**. Les autres axes restent dans le texte sans emphase. Aligné côté MD (`scripts/dump_report.py`) et JSX (`web/app/resultats/page.tsx`).

### Modifié (Vague 3.1h)

- `src/templates.py` — pattern 4 de `build_phrase_choc` neutre solo/groupe + phrase Q08_d sans "faute de".
- `scripts/dump_report.py` — intro chantiers : 3 mots-clés en gras au lieu de 6.
- `web/app/resultats/page.tsx` — idem côté JSX.

### Vague 3.1g — finitions sur le second test local

Cinq retours après second test local et deux idées de fond inscrites en ROADMAP.

**Questionnaire (JSON v1.6) :**

- **Q06_b** : "Une fatigue qui dure — je sens qu'il est temps de prendre du recul" → "Une fatigue qui dure — j'ai besoin d'identifier ce qui pèse vraiment dans ma semaine". Lève le doublon avec Q06_c ("Un événement récent — j'ai eu besoin de prendre du recul…").
- **Q07** simplifiée : retire l'option "Locaux partagés — un IDEL, un kinésithérapeute ou un confrère" jugée non pertinente pour l'organisation médicale du cabinet. Quatre options désormais : Seul / Assistant(e) médical(e) / Confrère associé / Confrère remplaçant. Scores santé recalibrés (3 / 8 / 7 / 6).
- **Q05 et Q09** : "Note :" → "Par exemple :" pour les énumérations d'exemples (courriers/ordonnances/… et RDV/consultation/…). "Note :" reste sur Q13 (exclusion conceptuelle Dragon).

**Frontend (`web/components/CheckupWidgets.tsx`) :**

`ModeAWidget` et `ModeBWidget` splittent désormais sur les deux séparateurs (" Note :" et " Par exemple :"). Le label affiché s'adapte automatiquement au séparateur détecté.

**Phrases choc — punch augmenté :**

Les 6 patterns de `build_phrase_choc` sont refondus pour ouvrir par un superlatif ou une affirmation tranchée, suivis d'une nuance qui ouvre. La phrase default plate ("Votre cabinet présente un équilibre tenu…") devient *"Pas de point de rupture évident dans votre cabinet — mais ce n'est pas une raison pour ne rien faire. Plusieurs fragilités précises méritent un coup d'œil, et toutes sont accessibles."* Pattern 1 (Chateau-type) devient *"Rares sont les cabinets qui tiennent autant sur une seule personne que le vôtre. Ce qui le fait tourner aujourd'hui est exactement ce qui le fragilise au moindre imprévu."*

**Intro chantiers — lisibilité :**

Côté MD (`scripts/dump_report.py`) : mots-clés en **gras** sur les 4 axes ("vision complète", "comprendre l'origine", "savoir par où commencer", "absorber les imprévus", "anticiper les fragilités") et sur la vision intégration ("interface où votre organisation, physique et numérique, tient ensemble dans un cadre protégé et sécurisé"). Côté JSX (`web/app/resultats/page.tsx`) : typographie passée de `text-sm text-lugia-text-secondary` à `text-[15px] text-lugia-text-primary` (plus lisible), mots-clés en `<strong className="font-semibold">`.

**ROADMAP V1.5+ — deux notes ajoutées :**

1. **Onboarding gamifié** type paramétrage profil de jeu vidéo (icônes pour personas, tâches, outils, enjeux), accessible dans le questionnaire d'approfondissement payant. Alimente le contexte des questions du parcours principal et des analyses du rapport.
2. **Cohérence narrative thématique** : refondre l'ordre/groupement des questions en sections explicites avec micro-titres ("Votre temps", "La cohérence de vos actions", "Vos risques", "Votre résilience"), pour que le médecin ressente un fil rouge plutôt que des silos.

### Modifié (Vague 3.1g)

- `resources/interview_protocol.json` v1.6 — Q06_b, Q07 (4 options refondues), Q05/Q09 "Par exemple :".
- `resources/sample_answers_pchateau.md` v2.3 — labels alignés.
- `scripts/seed_persona.py` — labels alignés.
- `src/templates.py` — 6 patterns `build_phrase_choc` plus punchy.
- `scripts/dump_report.py` — intro chantiers avec **mots-clés gras**.
- `web/app/resultats/page.tsx` — intro chantiers en typo `text-[15px] text-lugia-text-primary` + `<strong>` sur les axes Lugia.
- `web/components/CheckupWidgets.tsx` — split générique " Note :" / " Par exemple :".
- `ROADMAP.md` V1.5+ — gamification onboarding et cohérence narrative thématique inscrites.

### Vague 3.1f — philosophie Lugia ancrée dans la mémoire produit et dans le rapport

Sébastien précise la philosophie attendue du check-up : les médecins n'ont jamais une vision complète de leur organisation, et Lugia doit les amener à voir quatre choses à la fois — comprendre les causes racines des contraintes et leurs interdépendances, faire face aux imprévus et surcharges ponctuelles, savoir par quel problème commencer, anticiper les fragilités encore gérables. Vision long terme : intégrer dans une seule interface protégée et sécurisée l'ensemble de l'organisation du cabinet, physique et numérique.

**Mémoire produit (`MASTER_PROMPT.md`) :**

- Section 2 enrichie d'un sous-bloc "Ce que le check-up doit faire vivre au répondant" listant les 4 axes. Toute formulation du rapport doit servir au moins l'un d'eux.
- Section 3 enrichie d'un sous-bloc "Vision long terme" qui formalise l'ambition V2+ d'intégration physique/numérique. Toute communication produit (rapport, marketing, slides) doit faire entendre cette vision.

**Rapport (`scripts/dump_report.py` et `web/app/resultats/page.tsx`) :**

Intro avant les 3 chantiers refondue. Ne dit plus "vue d'ensemble + efficacité opérationnelle + environnement sécurisé" (séquence opérationnelle pure) mais articule les 4 axes et termine sur la vision intégration : *"Les trois chantiers ci-dessous servent une même ambition : vous donner une vision complète de votre cabinet pour comprendre l'origine des contraintes que vous vivez, savoir par où commencer, absorber les imprévus et anticiper les fragilités encore gérables. Le check-up pose la vue d'ensemble ; les chantiers sont la première marche vers une interface où votre organisation, physique et numérique, tient ensemble dans un cadre protégé et sécurisé."*

### Modifié (Vague 3.1f)

- `MASTER_PROMPT.md` — sections 2 et 3 enrichies.
- `scripts/dump_report.py` — intro chantiers refondue.
- `web/app/resultats/page.tsx` — intro chantiers refondue.

### Vague 3.1e — analyse IA recadrée + intro parcours Lugia

Deux retours après test local Vague 3.1d :

**Analyse chantier IA** — la formulation polyfactorielle ("trois risques cumulés : violation du secret médical (article 226-13 du Code pénal), non-conformité RGPD avec hébergement non HDS, et engagement de votre responsabilité civile professionnelle…") sonnait comme une gradation accusatrice. Refondue en cadre métier factuel : *"Le besoin de rédaction structurée est légitime, le canal ne l'est pas. Aujourd'hui, c'est votre vigilance qui tient seule l'ensemble du cadre dans lequel ces échanges circulent : secret médical, RGPD, hébergement de santé (HDS), couverture par votre responsabilité civile professionnelle. C'est un poids que l'outil pourrait porter à votre place."* Les références métier sont conservées (secret médical, RGPD, HDS, RCP), mais cadrées comme un poids actuellement porté seul plutôt qu'une accusation de risque.

**Intro parcours Lugia** — les 3 chantiers étaient lus comme des pistes indépendantes ; la valeur ajoutée Lugia (mise à plat de l'organisation puis accompagnement structuré) n'apparaissait pas. Paragraphe d'intro ajouté avant "Trois chantiers prioritaires" dans le rapport MD (`scripts/dump_report.py`) et dans la page de résultats Next.js (`web/app/resultats/page.tsx`) : *"Les trois chantiers ci-dessous s'inscrivent dans une même démarche Lugia : poser une vue d'ensemble de votre cabinet, avancer pas à pas sur des leviers d'efficacité opérationnelle, puis installer un environnement sécurisé qui prend en charge ce que vous faites déjà — y compris l'IA — sans rupture pour votre quotidien."* Posé en miroir de la recommandation italique de la synthèse, qui ouvre déjà sur la thèse "vue d'ensemble avant chantier".

### Modifié (Vague 3.1e)

- `src/workstreams.py` — analyse `chantier_ia` triggered recadrée.
- `scripts/dump_report.py` — intro parcours Lugia avant la section Chantiers.
- `web/app/resultats/page.tsx` — intro parcours Lugia avant la grille des chantiers.

### Vague 3.1d — passe sur 10 retours après test local

Validé en local par Sébastien avec backend uvicorn + frontend Next.js localhost. Dix retours portant sur le questionnaire, la synthèse, et le ton des analyses.

**Questionnaire (JSON v1.5) :**

- **Q02_d** : "Aucun — je gère moi-même les rendez-vous et les appels" → "Personne — …".
- **Q05** open_prompt raccourci : sortie des exemples "(courriers, ordonnances, certificats, suivi de dossiers)" en note séparée. Reformulé "à finir pendant votre temps de travail" → "à finir sur vos heures de travail prévues", "lesquelles vous prennent le plus souvent" → "lesquelles vous prennent le plus de temps".
- **Q09** qcm_prompt raccourci : "(prise de rendez-vous, consultation, ordonnance, courrier)" sorti en note séparée.
- **Q11_a** : "Alerte automatique — mon outil signale immédiatement les résultats critiques" → "Signalement automatique — mon logiciel met en évidence les résultats critiques sans intervention de ma part" (plus métier, moins techno-jargonnant).
- **Q11_c et Q11_d** : "boîte de résultats" → "résultats" simplement.
- **Q13_d** : "IA grand public sans illusion — …" → "IA grand public, en connaissance de cause — …" (plus pro, moins gauche).

**Frontend `web/components/CheckupWidgets.tsx` :**

`ModeAWidget` adapté pour splitter `qcm_prompt` sur " Note :" comme le fait déjà `ModeBWidget` sur `open_prompt`. La note s'affiche en typographie atténuée sous le prompt principal. Permet de garder les détails utiles sans alourdir la question.

**Synthèse "Votre situation aujourd'hui" — phrase choc style MBTI :**

`build_phrase_choc` refondue pour produire une affirmation forte qui pose le diagnostic dès la première ligne, sur le modèle des conclusions MBTI. Cinq patterns selon profil :

1. Cabinet tenu par une seule personne (effort_signals ≥ 3) : *"Peu de cabinets tiennent autant sur une seule personne que le vôtre. C'est ce qui le fait tourner aujourd'hui — et ce qui rend le moindre imprévu coûteux demain."*
2. IA grand public + outils empilés : *"Votre cabinet a déjà intégré l'IA dans son quotidien — vous êtes en avance sur beaucoup de confrères. Reste maintenant à sécuriser ce gain pour qu'il dure, sans porter seul le risque juridique."*
3. Organisation structurée mais débordement admin : *"Votre cabinet est plus structuré que la moyenne — sauf sur un point : votre temps personnel sert encore de variable d'ajustement."*
4. Cadre largement informel : *"Votre cabinet fonctionne sur une organisation principalement implicite. Tout repose sur ce que chacun sait sans que rien ne soit écrit — c'est tenable tant que personne ne change de poste, ou de jour."*
5. Défaut : *"Votre cabinet présente un équilibre tenu sur plusieurs points sensibles. Les fragilités sont précises, repérables, et toutes solubles — le plus dur est de décider par laquelle commencer."*

**Recommandation italique — thèse Lugia réintégrée :**

La phrase de fin de synthèse rouvre désormais sur la thèse de différenciation Lugia : *"Avant d'engager un chantier précis, Lugia commence par poser une vue d'ensemble de votre organisation — c'est là que les vrais leviers apparaissent."* Avait disparu dans la passe 3.1.

**Analyse du chantier IA — polyfactorielle :**

`chantier_ia` triggered. L'analyse précédente ("Le besoin est légitime, le canal ne l'est pas. Tant que vous passez par un outil grand public, l'anonymisation manuelle reste à votre seule charge.") ne mentionnait que la surcharge personnelle. Refonte intégrant les risques juridiques : *"Le besoin de rédaction structurée est légitime, le canal ne l'est pas. Au-delà de la charge d'anonymisation manuelle qui repose sur vous, vous êtes exposé à trois risques cumulés : violation du secret médical (article 226-13 du Code pénal), non-conformité RGPD avec hébergement non HDS, et engagement de votre responsabilité civile professionnelle en cas d'incident."*

**Chantier absence non-triggered — surpromesse retirée :**

"Vous repartez avec l'assurance que votre cabinet tient même si vous devez vous absenter." → "Vous repartez avec un cadre prêt à être enrichi au fil de l'eau, qui réduit le risque de rupture lors d'une absence imprévue." Plus mesuré, plus juste.

### Modifié (Vague 3.1d)

- `resources/interview_protocol.json` v1.5 — Q02_d, Q05, Q09, Q11, Q13_d.
- `resources/interview_protocol.md` v1.5 — note Vague 3.1d.
- `resources/sample_answers_pchateau.md` v2.2 — labels alignés.
- `scripts/seed_persona.py` — labels alignés.
- `src/templates.py` — `build_phrase_choc` refondue style MBTI, `build_synthesis` réintègre la thèse Lugia.
- `src/workstreams.py` — analyse IA polyfactorielle (risques juridiques) + chantier absence non-triggered mesuré.
- `web/components/CheckupWidgets.tsx` — `ModeAWidget` splitte sur " Note :".

### Vague 3.1c — alignement "Prochaine étape recommandée" entre rapport MD et frontend

Backlog initial point Prochaine étape n°1 ("On se tire une balle dans le pied avec l'option Rester en autonomie") : le frontend Next.js avait déjà été refondu en Vague 1 (la clé `autonomie` affiche désormais "Approfondir un chantier — un second questionnaire ciblé gratuit"), mais `scripts/dump_report.py` était resté désynchronisé et imprimait encore "Rester en autonomie — Reprendre les chantiers proposés seul, à votre rythme". Aligné sur le wording frontend. Les trois options sont désormais toutes des accompagnements Lugia :

- **Approfondir un chantier** — second questionnaire ciblé, gratuit, à son rythme.
- **Échanger avec Lugia** — 30 minutes, badge "Recommandé" par défaut.
- **Lancer un diagnostic terrain** — une journée sur place avec Lugia.

La clé interne `autonomie` reste pour ne pas casser l'API entre backend et frontend (renommage propre à reporter en V1.2 quand on touchera au routage).

Mention "facturation électronique de septembre" dans le chantier IA supprimée et remplacée par "préparation des comptes-rendus structurés".

### Adaptation des templates aux nouveaux IDs

- Phrase Q03 dans `build_participants_summary` (templates.py) : trois branches selon q03_b (cadre oral), q03_c (cadre écrit peu suivi), q03_d (pas de cadre formel) — sémantique nouvelle de l'axe homogène.
- Phrase Q11_d : "le tri des résultats se fait sans rythme défini, ce qui peut laisser passer un signal" (au lieu de "au fil de l'eau, sans rythme garanti").

### Oracle Chateau v2.1

`resources/sample_answers_pchateau.md` v2.1 : Chateau passe Q03 de q03_c (santé 4) à q03_d "Pas de cadre formel — chaque cas est tranché au moment où il se présente" (santé 3). Scores facettes : Processus 3,33 (idem), **Participants 3,00** (vs 3,33 en Vague 3), Information 2,75 (idem). `scripts/seed_persona.py` aligné automatiquement avec les nouveaux libellés via reconstruction du bloc `ANSWERS`.

### ROADMAP V1.2+ — deux notes ajoutées

1. **Génération dynamique des options de QCM** selon Q01/Q02/Q07 (notamment Q10/Q11 adaptés au médecin solo) en V1.2. Pendant le temps de calcul LLM, un écran d'attente affichera un paragraphe explicatif Lugia (méthode, substitution-extension, garde-fous secret médical) — l'attente devient pédagogique. Fallback systématique sur les libellés statiques V1.1.

2. **Enjeux temporels sectoriels datés** (généralisation de `derive_enjeu_temporel` supprimée Vague 3.1) : `temporal_concerns.json` à V1.2+ qui injecte dans la recommandation ou dans une carte dédiée les échéances réglementaires actives (facturation électronique B2B/B2C, MSSanté, HDS, ROSP, etc.). Montre au répondant que le questionnaire connaît son calendrier métier.

### Modifié

- `resources/interview_protocol.json` v1.4 — 12 questions reformatées, Q03 axe homogénéisé, 6ᵉ règle globale ajoutée.
- `resources/interview_protocol.md` v1.4 — notes Vague 3.1, tableau Chateau mis à jour, calculs indicatifs revus.
- `resources/sample_answers_pchateau.md` v2.1 — Q03 q03_d, scores recalculés.
- `scripts/seed_persona.py` — labels et compléments alignés sur v1.4 du JSON.
- `src/templates.py` — `build_phrase_choc` ajoutée, `build_synthesis` refondue, `derive_enjeu_temporel` supprimée, phrases Q03 et Q11_d adaptées.
- `src/workstreams.py` — analyses IA et absence adoucies, mention facturation supprimée.
- `ROADMAP.md` — section "Génération dynamique des options de QCM" ajoutée en V1.2.

### Vérifications passées

- `python -m src.questions` : JSON et MD cohérents, 14 questions.
- Harness stdlib : scores Chateau conformes (Processus 3,33 / Participants 3,00 / Information 2,75), tous IDs choisis existants.
- IDs hardcodés `src/templates.py` et `src/workstreams.py` : tous valides.
- Audit ton hors docstrings/TOOL_CATEGORIES : aucune fuite (facturation, "L'IA arrivera", "pas transmissible", marques nominales).
- Syntaxe Python OK sur templates, workstreams, scoring, seed_persona, dump_report.

### À tester localement avant push

1. `python scripts/seed_persona.py --email sebastien+test@gmail.com --reset` (en venv local).
2. `python scripts/dump_report.py --list` puis `--id <N>` → relire `resources/sample_report.md` régénéré. Vérifier : pas de mention "facturation électronique", pas de "L'IA arrivera", pas de "votre seule mémoire pas transmissible", première phrase de synthèse analytique et non descriptive.
3. `npm run dev` côté web/ → parcourir le questionnaire : Q06 en QCM, Q08 et Q11 avec libellés "mot-clé — détail", Q10_b compatible solo, scores 3,33 / 3,00 / 2,75.
4. Push GitHub → Render/Vercel redéploient.

---

## 2026-05-15 — V1.1 Vague 3 : refonte du questionnaire (Q2 à Q11 + règles globales)

Refonte des 8 questions ciblées par le backlog utilisateur (Q02 à Q11 hors Q07/Q10/Q12 jugées OK) et inscription des règles globales V1.1 dans `resources/interview_protocol.md`. Aucune nouvelle dépendance, aucun changement de schéma BDD.

### Règles globales V1.1 ajoutées

1. 4 options principales + 1 option Autre (saisie inline, déjà livrée Vague 1).
2. Options factuelles, ancrées dans des situations observables.
3. Options mutuellement exclusives.
4. Mise en scène d'une situation réelle quand c'est possible.
5. Mode B et C parcimonieux — réservés aux questions où la réponse libre apporte un matériau verbatim irremplaçable.

Exception assumée : Q01 conserve 3 options principales + Autre (typologie close solo/groupe/MSP).

### Changements par question

- **Q02** — libellés normalisés, ajout du cas **"Moi-même (pas de secrétariat dédié)"** pour le libéral solo qui gère ses RDV.
- **Q03** — axe unique "niveau de cadrage explicite des règles". 4 options exclusives (cadre écrit / cadre oral figé / pas de cadre formel / écart régulier entre cadre et pratique). Pas de multi-sélection (D-021).
- **Q04** — passage **Mode B → Mode A**. La réponse libre faisait doublon avec le QCM.
- **Q05** — reste Mode B mais open_prompt refondu : récit concret de "hier soir / ce week-end". Le QCM met en scène 19h en fin de journée, options factuelles graduées.
- **Q06** — passage **Mode C → Mode A**. 4 typologies de motivation : curiosité IA, fatigue accumulée, événement déclencheur, anticipation.
- **Q08** — reformulation factuelle non anxiogène : "Quand vous prenez une semaine de congé…" au lieu de "Si vous deviez vous arrêter une semaine…". Option q08_d "Le cabinet ferme — c'est ce que je fais en pratique" (santé 3 au lieu de 2).
- **Q09** — axe factuel "nombre d'outils + double saisie" au lieu de "niveau d'intégration". 4 paliers chiffrés (un / deux sans double saisie / trois à cinq / plus de cinq). Suppression de toutes les marques nominales.
- **Q11** — passage **Mode B → Mode A**. Options centrées sur l'organisation actuelle, exclusives ; l'incident passé n'est plus dans le QCM mais peut figurer en complément libre.

Q13 jugée OK ; mineure : généralisation "ChatGPT ou similaire" → "IA grand public" dans les libellés (cohérence Vague 2 lite).

### Distribution de modes V1.1

Avant : 8 A / 4 B / 2 C. Après : **11 A / 2 B / 1 C**. L'alternance se dégrade volontairement au profit de la cohérence factuelle. Mode B conservé sur Q05 et Q13 (matériau verbatim utile), Mode C conservé sur Q14 uniquement.

### Adaptation du moteur de rapport

- `src/templates.py` : phrases sur Q08_d et Q11_d réécrites pour matcher la nouvelle sémantique. Q08_d ne dit plus "personne ne saurait" mais "Pendant vos congés, le cabinet ferme — c'est la solution que vous avez retenue". Q11_d ne dit plus "comme cela s'est produit il y a quelques mois" (incident inventé) mais "le tri des résultats se fait au fil de l'eau, sans rythme garanti".

### Oracle Chateau V1.1

- `resources/sample_answers_pchateau.md` réécrit en v2.0 : 4 réponses ajustées (Q06 q06_c, Q08 q08_d nouveau sens, Q09 q09_d nouveau palier, Q11 q11_c au lieu de q11_d).
- Scores attendus : **Processus 3,33 ; Participants 3,33 ; Information 2,75**. Information et Processus stables vs V1.0 par recalibrage (Q09 baisse de 4 à 2, Q11 monte de 3 à 5, équilibre). Participants remonte légèrement (Q08 passe de 2 à 3).
- `scripts/seed_persona.py` aligné : labels, free_text, complément réécrits, suppression de toute mention nominale ChatGPT/Maiia/Doctolib/Lifen/Mailiz dans la base seedée.

### Modifié

- `resources/interview_protocol.json` v1.3 — refonte 8 questions + section `global_rules_v1_1`.
- `resources/interview_protocol.md` v1.3 — règles globales, nouvelle distribution, nouveau tableau Chateau.
- `resources/sample_answers_pchateau.md` v2.0.
- `scripts/seed_persona.py` — labels et compléments alignés.
- `scripts/dump_report.py` — structure de chantier alignée sur Vague 2 lite (4 sections : compris / révèle / échappe / proposons). Régression Vague 2 lite rattrapée pendant Vague 3 (le script lisait encore le champ `obtient` supprimé).
- `src/templates.py` — phrases Q08_d et Q11_d corrigées.
- `DECISIONS.md` — D-021 ajoutée (refonte questionnaire V1.1 Vague 3 + dérogation au principe d'alternance).

### Vérifications passées

- `python -m src.questions` (cohérence JSON ↔ MD) : OK, 14 questions.
- Harness stdlib : tous les IDs choisis par Chateau existent, scores facettes conformes (3,33 / 3,33 / 2,75), aucune marque nominale dans les labels.
- Audit IDs hardcodés dans `src/templates.py` et `src/workstreams.py` : tous valides, aucune référence morte.
- Syntaxe Python OK sur templates, workstreams, scoring, seed_persona, dump_report.

### En attente de validation utilisateur

À tester localement par Sébastien (le sandbox Linux n'a pas accès au venv macOS) :

1. `python scripts/seed_persona.py --email sebastien+test@gmail.com --reset` → réseed Chateau V1.1 dans SQLite local.
2. `python scripts/dump_report.py --list` puis `--id <N>` → relire le sample_report généré et vérifier qu'aucune phrase ne mentionne d'incident inventé sur Q11, ni de scénario anxiogène sur Q08.
3. `npm run dev` côté web/, parcourir le questionnaire : vérifier que Q06 affiche bien un QCM (et non un textarea) et que l'option Autre se saisit inline partout.
4. Vérifier que les scores affichés sur la page de résultats correspondent à 3,33 / 3,33 / 2,75 (ou aux arrondis qu'utilise le scoring).
5. Si tout est conforme, push GitHub → Render et Vercel redéploient.

---

## 2026-05-15 — V1.1 Vague 2 lite : nettoyage structurel du moteur de rapport

Refonte de `src/templates.py` et `src/workstreams.py` pour produire un rapport plus directement utilisable par un médecin, sans modifier le questionnaire (Vague 3 reste à venir).

### Vulgarisation du langage

Approche : réécriture contextuelle de chaque passage jargonneux, pas substitution mot-à-mot. Le sens prime sur le terme.

Exemples : "flux parallèle critique" → "demandes en direct qui s'empilent" (ou "surcharge particulière" selon contexte), "cartographier" → "recenser" / "lister", "leviers d'optimisation" → "pistes d'allègement", "conformité HDS" → "conforme au secret médical", "anonymisation manuelle" → "anonymiser à la main", "dispositif de continuité" disparaît au profit de "ce qui est prévu pour vos absences".

Ton ajusté : factuel non-dramatique, jamais accusateur. Suite à retour utilisateur sur premières réécritures trop sèches.

### Suppression des citations nominatives d'outils

Nouvelle constante `TOOL_CATEGORIES` qui mappe les marques détectées (Maiia, Doctolib, Lifen, etc.) vers des catégories génériques (logiciel métier, plateforme de rendez-vous, outil d'envoi de courriers, etc.). `derive_outils_principaux` retourne désormais "votre logiciel métier et votre plateforme de rendez-vous" au lieu de "Maiia et Doctolib". Idem pour ChatGPT → "outil d'IA grand public".

Les marques restent détectées en interne pour adapter les phrases, mais ne sont jamais imprimées dans le rapport.

### Refonte de la structure des chantiers

4 sections au lieu de 4, mais réaffectées : la section "Ce que vous obtenez" est fusionnée dans "Ce que nous vous proposons" (la proposition se termine par le bénéfice attendu), libérant un slot pour la nouvelle section "Ce que ça révèle".

| Position | Avant V1.1 | Après V1.1 lite |
|---|---|---|
| 1 | Ce que le check-up a vu | Ce que nous avons compris |
| 2 | Ce qu'il ne peut pas confirmer seul | **Ce que ça révèle** (nouveau) |
| 3 | Ce que Lugia propose | Ce qui nous échappe encore |
| 4 | Ce que vous obtenez | Ce que nous vous proposons (avec bénéfice intégré) |

Côté backend, chaque chantier expose maintenant les champs `vu`, `analyse`, `pas_confirmer`, `propose` (l'ancien `obtient` est fusionné dans `propose`).

### Refonte de la synthèse

- "Vous avez bâti une organisation efficace : ..." (formulation incohérente pour un médecin solo) supprimée. Remplacée par "Au quotidien, vous vous appuyez sur ..." (factuel, sans jugement).
- Ouverture adaptée au type de cabinet : solo libéral porte tout → "Vous en êtes seul aux commandes" (factuel, pas accusateur). Cabinet de groupe avec tout passe par le médecin → "tout finit par passer par vous".
- Recommandation italique conservée, vocabulaire vulgarisé ("environnement conforme au secret médical" au lieu de "conforme HDS").

### Q14 reportée en V1.2

Tentative d'intégration de la Q14 ("ce que vous aimeriez approfondir") via heuristique textuelle pure rejetée — trop fragile, risque de produire un non-sens. Q14 attend le SLM en V1.2 (note ajoutée à D-020).

### Modifié

- `src/templates.py` — refonte complète.
- `src/workstreams.py` — refonte complète, structure 4 sections avec analyse.
- `web/lib/api.ts` — type `Workstream` mis à jour (champ `analyse` ajouté, `obtient` supprimé, `propose` enrichi).
- `web/app/resultats/page.tsx` — `ChantierCard` affiche les 4 nouvelles sections.
- `DECISIONS.md` D-020 — note explicite du report de Q14.

### En attente de validation utilisateur

Tester sur diagnostic.lugia.fr ou en local (via seed_persona). Vérifier que :

1. La synthèse ne mentionne plus "Maiia", "Doctolib", "ChatGPT", "organisation efficace".
2. Les 3 cartes facettes "Parcours patient" / "Équipe et secrétariat" / "Outils et dossiers" affichent des descriptions non-jargonneuses.
3. Chaque carte chantier affiche 4 sections dans l'ordre : "Ce que nous avons compris" → "Ce que ça révèle" → "Ce qui nous échappe encore" → "Ce que nous vous proposons" (avec bénéfice à la fin).
4. Le ton est factuel et respectueux, jamais accusateur.

---

## 2026-05-14 — Backend : détection de l'Origin pour les liens magiques

Le backend FastAPI détecte désormais le header `Origin` de la requête `/auth/request-link` et l'utilise (s'il est dans l'allowlist) pour construire le lien magique. Plus besoin de modifier manuellement la variable `FRONTEND_URL` sur Render à chaque bascule entre tests local et prod.

### Allowlist en V1.1

- `http://localhost:3000` (dev local)
- `https://diagnostic.lugia.fr` (prod)
- `https://*.vercel.app` (previews Vercel)

### Sécurité

Allowlist explicite pour empêcher qu'un attaquant force le backend à envoyer un lien magique pointant vers un domaine arbitraire. Fallback systématique sur `FRONTEND_URL` env var si l'Origin n'est pas reconnu (cas curl, hors navigateur, etc.).

### Modifié

- `backend/main.py` — ajout import `Request`, ajout helper `_resolve_frontend_url`, constante `ALLOWED_FRONTEND_ORIGINS`, signature de `_send_magic_link_email` qui prend désormais `frontend_url` en paramètre, endpoint `/auth/request-link` qui passe `request` puis l'URL résolue.

---

## 2026-05-14 — Backlog V1.1 reçu, cadre acté

Première vague de retours utilisateurs reçue de Sébastien sous forme de PDF structuré (40+ retours répartis sur en-tête, page de login, accueil, questionnaire, résultats, prochaine étape). Lecture critique en session, 7 challenges proposés, 7 réponses utilisateur intégrées.

### Décidé

- **D-020** acté : méthodologique enrichi (50+ variantes) en V1.1 comme socle, SLM hybride (Ollama dev + cloud API prod) en surcouche V1.2 avec fallback systématique sur templating. Méthodologique reste backup permanent même après SLM.
- V1.1 structurée en 3 vagues : quick wins éditoriaux (1-2j), méthodologique enrichi (3-5j), refonte questionnaire (4-7j). Total estimé 8-14 jours de travail concentré.
- Pré-questionnaire psychologique (3 profils répondant) déplacé en V1.5.
- Second questionnaire d'approfondissement avec effet wow (PDF, dessin organisationnel, pyramide, analyse cohérences) déplacé en V1.5, à développer en environnement de test.
- Modèle commercial 1-chantier-gratuit / 3-chantiers-payants déplacé en V2 (dépend Stripe).
- v1-final reste à poser pour figer la version pré-retours.

### Mis à jour

- `DECISIONS.md` D-020 (nouvelle décision).
- `ROADMAP.md` insertion V1.1, V1.2, compléments V1.5 (pré-questionnaire psychologique, second questionnaire wow).
- `TODO.md` plan V1.1 détaillé en 3 vagues.

---

## 2026-05-13 — V1 close. Cap sur les 4 tracks parallèles.

V1 est figée sur le tag `v1-final`. Le démonstrateur technique cesse d'être le seul chantier ; à partir de maintenant, le projet Lugia se déploie sur quatre tracks parallèles (D-019) :

- **Démonstrateur technique** — V1.5 puis V2, dans ce repo.
- **Communication** — identité visuelle, page `/qui-est-lugia`, site `lugia.fr`, slides.
- **Marché et clients** — V1-7 et tests prospects, étude de marché, fiches prospects.
- **Opérationnel** — méthode, scoring avancé, templates de livrables clients.

Chaque track est traité dans sa propre conversation Claude, avec un prompt d'ouverture standardisé dans `meta/`. La mémoire transversale reste portée par les fichiers `.md` du repo (MASTER_PROMPT, DECISIONS, ROADMAP, CHANGELOG, TODO).

Cette conversation Claude dédiée au démonstrateur, ouverte le 12 mai 2026 pour produire V0, peut maintenant être close. La suite du développement technique se fera dans une nouvelle conversation, amorcée avec `meta/PROMPT_OUVERTURE_DEMONSTRATEUR.md`.

### Ajouté

- `meta/PROMPT_OUVERTURE_DEMONSTRATEUR.md`, `meta/PROMPT_OUVERTURE_COMMUNICATION.md`, `meta/PROMPT_OUVERTURE_MARCHE.md`, `meta/PROMPT_OUVERTURE_OPERATIONS.md` — prompts d'ouverture pour les nouvelles conversations Claude par track.
- `meta/README.md` — mode d'emploi de ces prompts.
- `DECISIONS.md` D-019 — formalisation de l'organisation multi-tracks et multi-conversations.

---

## 2026-05-13 — Phase V1-8 : RGPD minimale intégrée à V1

### Décision

D-018 actée : on intègre un socle RGPD minimum dans V1 plutôt que de le différer en V2. Sans mentions légales, sans politique de confidentialité, sans droit à l'effacement, V1-7 (test client réel face à un médecin) ne serait pas défendable.

### Ajouté

- `src/db.py` — helper `delete_user_data(email)` qui purge interview + answers + facet_scores + workstreams + auth_tokens + sessions associés à un email, en une seule transaction. Suppressions explicites (pas de dépendance au CASCADE qui est inopérant par défaut en SQLite).
- `backend/main.py` — endpoint `DELETE /me` (protégé par auth) qui appelle `delete_user_data(email)` et retourne `{ok, deleted: { interviews, answers, ... }}`.
- `web/lib/api.ts` — fonction `deleteAccount()` exposant l'endpoint.
- `web/components/Footer.tsx` — pied de page commun (server component, sans état) avec liens vers `/legal`, `/confidentialite` et mailto contact.
- `web/app/legal/page.tsx` — Mentions légales. Éditeur = Sébastien Boncoeur, particulier. Contact email uniquement (France, pas d'adresse postale précise). Hébergeurs détaillés (Vercel, Render, Resend, OVH). Note sur la propriété intellectuelle et la loi française.
- `web/app/confidentialite/page.tsx` — Politique de confidentialité en 11 sections : responsable, données collectées (email + réponses + métadonnées), finalités, base légale (consentement art. 6.1.a RGPD), destinataires (sous-traitants), transferts hors UE, durées de conservation, droits utilisateur (accès, rectification, effacement, opposition, portabilité, CNIL), cookies/localStorage (mention "pas de cookies tiers"), sécurité, modifications.
- `web/app/compte/page.tsx` — Page authentifiée : affiche l'email courant, rappelle les données stockées, propose la suppression définitive avec confirmation par saisie du mot `SUPPRIMER`. Après succès, écran "Compte supprimé" + retour login.

### Modifié

- `web/app/layout.tsx` — intégration du `<Footer />` au RootLayout pour qu'il apparaisse automatiquement sur toutes les pages.
- `web/components/AppHeader.tsx` — l'email affiché en haut à droite est désormais cliquable et mène vers `/compte`. Conserve le bouton "Se déconnecter".

### Hors périmètre V1-8 (différé)

- DPA signés avec Vercel/Render/Resend — à régulariser avant tout contrat commercial.
- Bandeau cookies — non requis tant qu'on n'utilise que localStorage technique.
- Endpoint d'export de données (portabilité) — droit annoncé dans la politique de confidentialité, traité par email sur demande pour V1.
- Relecture avocat RGPD — recommandée avant V1-7 commercial mais non bloquante pour test prospect informel.

### En attente de validation utilisateur

Tester localement après `npm install` (rien de nouveau côté deps) :

1. Backend : `uvicorn backend.main:app --reload` → `/docs` doit afficher `DELETE /me` dans la section auth.
2. Frontend : `npm run dev` → vérifier `/legal`, `/confidentialite` accessibles **sans** être connecté. Footer visible sur toutes les pages.
3. Une fois connecté : cliquer l'email en haut à droite → arrive sur `/compte`. Tester la confirmation `SUPPRIMER` puis la suppression effective (utiliser un email de test).
4. Vérifier en base via `/docs` GET `/auth/me` après suppression : doit retourner 401 (session purgée).

---

## 2026-05-13 — V1 complète : check-up préventif en ligne sur diagnostic.lugia.fr

L'ensemble du parcours est désormais accessible en production via `https://diagnostic.lugia.fr`. Frontend Next.js sur Vercel, backend FastAPI sur Render, Postgres provisionné, auth par lien magique avec emails Resend depuis le domaine `lugia.fr` vérifié. Le check-up reproduit à l'identique le périmètre fonctionnel V0 (14 questions, 3 modes A/B/C, 3 facettes scorées, 3 chantiers paramétrés, recommandation prochaine étape), mais accessible à distance, sans installation locale.

Note : V1 sera figée par le tag `v1-final` **après V1-8** (RGPD minimal), pas après V1-6 comme initialement prévu. Reste à valider V1-7 : premier test client en condition réelle. Les extensions méthodologiques (9 facettes, pyramide animée, section "Vos mots", PDF export) restent inscrites en V1.5 et V2 dans la ROADMAP.

---

## 2026-05-13 — Phase V1-6 : déploiement frontend Vercel — VALIDÉE

Frontend Next.js publié sur Vercel avec Root Directory `web/`, Framework Preset Next.js, env var `NEXT_PUBLIC_API_URL` pointant sur l'API Render. Un bug de peer dependency corrigé en passant : `eslint` bumpé de `^8.57.0` à `^9.0.0` pour respecter le peer requirement de Next.js 16 (le `npm install` Vercel est strict là où le `npm install` local tolérait grâce au lockfile pré-résolu).

La page placeholder de V1-1 est remplacée par le vrai frontend. `https://diagnostic.lugia.fr` redirige correctement sur `/login` si pas de session. Test bout en bout réussi : email saisi → lien magique reçu depuis `[email protected]` → clic vers `diagnostic.lugia.fr/auth?token=…` → redirection sur l'accueil connecté → check-up démarré, quitté, repris → tout est ok.

V1 (portage technique de V0 sur le web) est désormais close. Tag git `v1-final` à poser.

---

## 2026-05-13 — Phase V1-5c : frontend auth — VALIDÉE

### Ajouté

- `web/lib/auth.ts` — helpers de session côté client : `getSessionToken`, `setSession`, `clearSession`, `hasSession`, `getSessionEmail`. Tous SSR-safe (gardes `typeof window !== "undefined"`). Hook `useRequireAuth` qui redirige vers `/login` si pas de session et retourne un booléen `ready` pour gater le rendu des pages protégées.
- `web/app/login/page.tsx` — formulaire email simple (Lugia, max-w-md), bouton "Recevoir mon lien d'accès" qui appelle `POST /auth/request-link`. États idle / sending / sent / error. Message de confirmation après envoi avec rappel "valable 30 minutes" et possibilité de réessayer.
- `web/app/auth/page.tsx` — page d'atterrissage du lien magique. Lit `?token=...`, purge toute session existante, appelle `POST /auth/verify-token`, stocke `session_token` et `email` en localStorage, redirige sur `/`. Gère token absent et token invalide/expiré avec lien vers `/login` pour redemander.
- `web/components/AppHeader.tsx` — bandeau discret en haut à droite des pages protégées : email courant + lien "Se déconnecter". Best-effort sur `POST /auth/logout` (déconnexion locale même si backend injoignable).

### Modifié

- `web/lib/api.ts` — la fonction `request<T>` ajoute désormais automatiquement le header `Authorization: Bearer ${session_token}` quand un token est présent. Sur 401 avec token, purge la session et redirige vers `/login` (token expiré ou révoqué). Ajout des endpoints `requestMagicLink`, `verifyMagicToken`, `authMe`, `logout`.
- `web/app/page.tsx`, `web/app/checkup/page.tsx`, `web/app/resultats/page.tsx` — chaque page protégée appelle `useRequireAuth()` en tête, gate son `useEffect` de fetch sur `isAuthReady`, et affiche `<AppHeader />` une fois le rendu autorisé.

### Validation

Parcours complet vérifié en local contre le backend Render distant. Redirection sur `/login` à l'ouverture, lien magique reçu, échange token → session, parcours check-up → résultats, déconnexion. Le frontend est désormais prêt pour le déploiement Vercel (V1-6).

---

## 2026-05-13 — Phase V1-5b : envoi réel d'email via Resend — VALIDÉE

Domaine `lugia.fr` vérifié sur Resend (région Ireland eu-west-1). Trois enregistrements DNS ajoutés chez OVH : DKIM (`resend._domainkey`), MX `send` (priorité 10 vers `feedback-smtp.eu-west-1.amazonses.com`), SPF TXT sur `send`. Vérification Resend : 10 minutes après ajout des entrées.

Variables d'environnement ajoutées sur Render Web Service `lugia-checkup-api` : `RESEND_API_KEY`, `RESEND_FROM_EMAIL=Lugia <[email protected]>`, `FRONTEND_URL=https://diagnostic.lugia.fr`.

Code V1-5a (branche `main`) poussé sur GitHub en deux commits propres : `V1-4: frontend Next.js` et `V1-5a: backend auth lien magique`. Render a redéployé automatiquement avec installation de `resend>=2.0`.

Test bout en bout validé : `POST /auth/request-link` sur l'API distante avec une vraie adresse email → email Lugia reçu en boîte de réception Gmail en quelques secondes (DKIM OK, signature visible). Sujet, design noir, mention "valable 30 minutes" et bouton "Accéder à mon check-up" rendus correctement. Le clic sur le bouton renvoie un 404 attendu (le `/auth` côté Next.js sera implémenté en V1-5c et déployé en V1-6).

### Inscrit pour suite

- V1-5c — frontend auth (pages `/login` et `/auth`, propagation Bearer token).
- V1-6 — déploiement frontend Next.js sur Vercel (remplacement de la page placeholder V1-1).

---

## 2026-05-13 — Conscience explicite des limites du scoring V0 et trajectoire V1+

### Ajouté

- `DECISIONS.md` D-016 — Limites assumées du scoring V0 et trajectoire V1+. Acte la conscience collective des 5 biais (effet de compensation, absence de hiérarchie, dilution par le nombre, invisibilité des signaux faibles, injustice contextuelle).
- `ROADMAP.md` section "Scoring V1+ — vers une moyenne pondérée avec conditions et Flags". Détaille pondération avec conditions, scores planchers (K.O. critère), système de Flags critiques (FLUX_ANARCHIQUE, SURCHARGE_ADMIN, DEPENDANCE_UNITAIRE, DELEGATION_OPAQUE, NON_CONFORMITE_HDS, DEFAUT_TRACABILITE), catégories Expert (Efficience & Temps Médical, Résilience & Coordination, Sécurité & Gouvernance Numérique), Cartouche de Diagnostic comme format de présentation, architecture multi-secteur.

### Modifié

- `resources/modeling_scoring.md` section 7 — refonte pour expliciter les 5 limites structurelles avec leur impact concret en V0, et la compensation partielle par la narration des templates.

### Motif

Retour utilisateur posant explicitement les 5 limites de la moyenne brute (effet masquage, absence de hiérarchie, dilution, signaux faibles, injustice solo) et proposant une trajectoire V1 détaillée. La position V0 (moyenne brute simple) reste valide comme point de départ démonstratif, mais doit s'accompagner d'une conscience explicite des limites pour ne pas devenir un standard pérenne.

---

## 2026-05-13 — Phase V1-3b : Postgres provisionné et lié à l'API — VALIDÉE

Base Postgres `lugia-checkup-db` créée sur Render Free tier, variable d'environnement `DATABASE_URL` ajoutée au Web Service `lugia-checkup-api`. Test de persistance validé : une interview créée avant un cold start est retrouvée après le réveil du service. Le disque éphémère SQLite est résolu.

Note pour mémoire : Render Free Postgres expire après 90 jours. Bascule en plan Starter (~7$/mois) ou rotation manuelle à prévoir avant le 11 août 2026.

---

## 2026-05-13 — Phase V1-5a : backend auth lien magique

### Ajouté

- `src/db.py` — tables `auth_token` et `session`, column `email` ajoutée à `interview` via migration `_ensure_email_column_on_interview` (idempotente, SQLite et Postgres). Helpers `create_auth_token`, `verify_auth_token` (one-time use avec marquage), `create_session`, `get_session_email`, `revoke_session`. Constantes `MAGIC_LINK_TTL_MINUTES=30`, `SESSION_TTL_DAYS=30`.
- `backend/main.py` — endpoints auth : `POST /auth/request-link` (génère token + envoie email ou print console), `POST /auth/verify-token` (consomme token et crée session), `GET /auth/me`, `POST /auth/logout`. Middleware `get_current_user_email` via `HTTPBearer`. Tous les endpoints `/interviews/*` sont désormais protégés et filtrent par propriétaire (`_assert_user_owns_interview`). Helper `_send_magic_link_email` avec fallback console si `RESEND_API_KEY` n'est pas configuré.
- `backend/requirements.txt` — ajout de `resend>=2.0` (SDK Python officiel pour Resend).

### Endpoint public (pas d'auth)

`GET /protocol` reste public car il sert juste les questions du questionnaire — pas de donnée utilisateur.

### Backward compat

- La colonne `email` sur `interview` est nullable. Les interviews créées avant V1-5a (et celles créées par V0 Streamlit local ou par les scripts `seed_persona.py` qui appellent `create_interview()` sans email) restent accessibles à n'importe quel user authentifié (le helper `_assert_user_owns_interview` traite `email=None` comme legacy).
- V0 Streamlit local fonctionne toujours (utilise `src/db.py` directement, pas l'API authentifiée).

### Mode dev console

Si `RESEND_API_KEY` n'est pas défini, le lien magique est imprimé dans la console uvicorn au lieu d'être envoyé par email. Permet de tester V1-5a en local sans avoir configuré Resend.

### Validée le 13 mai 2026

Les 8 vérifications sur `/docs` sont passées : request-link, lien magique en console, verify-token, Authorize, /auth/me, POST /interviews, GET /interviews/active, test négatif après logout. Le non-envoi d'email à une adresse réelle est attendu en mode console (RESEND_API_KEY non défini). V1-5b prendra le relai pour activer l'envoi réel.

---

## 2026-05-13 — Phase V1-4c : page résultats Next.js

### Ajouté

- `web/app/resultats/page.tsx` — page résultats Next.js. Appelle `GET /interviews/{id}/report` pour récupérer toutes les données (synthèse, facettes scorées, chantiers paramétrés, prochaine étape recommandée), puis les affiche selon la structure du wireframe V0-1 iter 2 : en-tête, synthèse en serif sur fond beige clair avec barre bleue à gauche et italiques colorées sur les `<em>`, trois cartes facettes avec score + barre + résumé, trois cartes chantiers en grille 2×2 avec les 4 parties, trois cartes prochaine étape avec mise en avant de la recommandation. Suspense boundary pour le `useSearchParams`.
- `web/app/globals.css` — règle `.lugia-synthesis em { font-style: italic; color: #185fa5; }` pour styliser les `<em>` du HTML retourné par le backend.

### Composants extraits

`FacetCard`, `ChantierCard`, `ChantierBlock`, `NextStepCard` sont définis localement dans le fichier de la page. Si V1.5 nécessite de les réutiliser ailleurs, ils seront extraits dans `web/components/`.

### Parcours bout en bout fonctionnel

Accueil → Commencer → 14 questions → Merci → Voir les résultats → page résultats complète avec les données réelles. Tout le flux V0 est désormais reproduit en Next.js + FastAPI + Postgres.

### En attente de validation utilisateur avant Phase V1-5 (auth lien magique).

---

## 2026-05-13 — Phase V1-4b iter 2 : reprise depuis l'accueil

### Modifié

- `web/app/page.tsx` — au chargement de l'accueil, appel à `getActiveInterview()` pour détecter une éventuelle session in_progress en base. Si présente, deux boutons s'affichent : "Reprendre votre check-up" (primary, route vers `/checkup?interview=N`) et "Commencer un nouveau check-up" (secondary, crée une nouvelle session). Une mention discrète indique la date de création et la position dans le questionnaire (par exemple "question 7 sur 14"). Si aucune session active, seul le bouton "Commencer le check-up" est affiché, comme avant.

### Motif

Le bouton "Quitter et reprendre plus tard" de la page interview ramenait l'utilisateur à l'accueil mais aucun moyen visuel de reprendre la session sauvegardée n'était proposé. La V0 Streamlit avait cette logique, elle n'avait pas été portée en V1-4a. C'est désormais corrigé.

### Note

Si le frontend pointe vers une API distante (production), l'accueil détecte les sessions in_progress de cette API. Si le frontend tourne en local et pointe vers `localhost:8000`, l'accueil détecte les sessions in_progress du backend local. Les deux bases sont distinctes — c'est attendu.

---

## 2026-05-13 — Phase V1-4b : page interview avec modes A/B/C

### Ajouté

- `web/components/CheckupWidgets.tsx` — trois composants React typés (`ModeAWidget`, `ModeBWidget`, `ModeCWidget`) qui couvrent les trois modes d'interaction du questionnaire, plus une fonction `isAnswerComplete` qui valide selon le mode.
- `web/app/checkup/page.tsx` — page interview complète : chargement du protocole et de l'état de l'interview, préremplissage des widgets depuis la base via `listAnswers`, navigation Précédent / Suivant / Quitter, sauvegarde de chaque réponse à chaque clic Suivant, complétion automatique de l'interview au dernier Suivant et redirection vers `/resultats`, écran "Merci" si l'utilisateur revient sur l'interview après l'avoir terminée. Barre de progression, pill de facette, gestion d'erreur réseau.
- Suspense boundary autour du contenu de la page pour gérer le `useSearchParams` Next.js App Router.

### En attente de validation utilisateur avant Phase V1-4c (page résultats).

---

## 2026-05-13 — Phase V1-4a : setup Next.js frontend

### Ajouté

- `web/package.json` — déclaration de l'app Next.js 14, React 18, TypeScript 5, Tailwind 3.4. Scripts dev, build, start, lint.
- `web/tsconfig.json` — config TypeScript en mode strict avec alias `@/*`.
- `web/next.config.js`, `web/postcss.config.js`, `web/tailwind.config.ts` — configurations standards Next.js + Tailwind.
- `web/.gitignore` — exclusion node_modules, .next, .env.local.
- `web/.env.local.example` — template pour la variable `NEXT_PUBLIC_API_URL`.
- `web/app/layout.tsx`, `web/app/page.tsx`, `web/app/globals.css` — root layout, page d'accueil reproduisant le wireframe V0-1 iter 2 (promesse, deux cartes "attendre / garde-fous", bouton "Commencer"), styles Tailwind avec palette Lugia.
- `web/lib/api.ts` — client API typé avec fonctions pour appeler tous les endpoints du backend FastAPI (createInterview, getActiveInterview, getProtocol, saveAnswer, getReport, etc.).

### Palette Tailwind Lugia

Couleurs nommées dans `tailwind.config.ts` (lugia-bg, lugia-text, lugia-accent, etc.) pour réutiliser le système chromatique du wireframe V0-1.

### Note

L'ancien `web/index.html` (placeholder V1-1) sera écrasé par le build Next.js. Il peut être supprimé manuellement après confirmation que Next.js fonctionne.

### En attente de validation utilisateur avant Phase V1-4b.

---

## 2026-05-13 — Phase V1-3a : abstraction SQLAlchemy SQLite/Postgres

### Modifié

- `src/db.py` — refactor complet vers SQLAlchemy 2.0 Core. Déclaration du schéma via `MetaData` + `Table`, helpers (`create_interview`, `get_interview`, `get_answers`, `save_answer`, etc.) retournent désormais des `dict[str, Any]` (compatible avec les consommateurs qui font `row["key"]`). Détection du backend via la variable d'environnement `DATABASE_URL` : si présente et de la forme `postgres://` ou `postgresql://`, utilise Postgres ; sinon fallback sur SQLite local. La conversion `postgres://` → `postgresql://` (héritage Render) est gérée automatiquement.
- `scripts/seed_persona.py::reset_database` — utilise `db.get_engine()` et `text()` au lieu de `db.get_connection()`.
- `scripts/dump_report.py::_latest_interview_id` et `_list_interviews` — idem, adaptés à SQLAlchemy.
- `requirements.txt` (racine) — ajout de `sqlalchemy>=2.0` (utilisé par V0 Streamlit local et les scripts).
- `backend/requirements.txt` — ajout de `sqlalchemy>=2.0` et `psycopg2-binary>=2.9` (driver Postgres pour la production).

### Compatibilité descendante

Le schéma SQLAlchemy correspond exactement au schéma SQLite existant après V0-3b. `metadata.create_all()` est idempotent et ne touche pas aux tables existantes. Les bases SQLite locales antérieures restent utilisables sans migration.

### En attente de validation utilisateur avant Phase V1-3b (provisionnement Postgres sur Render).

---

## 2026-05-13 — Phase V1-2a : backend FastAPI minimal

### Ajouté

- `backend/__init__.py`, `backend/main.py`, `backend/requirements.txt` — application FastAPI qui expose les modules `src/*` de V0 via une API REST. Endpoints : health, protocol, gestion d'interviews, sauvegarde de réponses, calcul de scores, génération de rapport. CORS permissif en V1-2 (sera restreint en V2). Documentation Swagger UI auto-générée à `/docs`.

### Architecture

- `backend/main.py` ajoute la racine du projet à `sys.path` pour importer `src/*`. Aucune réécriture de code métier — réutilisation intégrale de `db`, `scoring`, `templates`, `workstreams`, `questions`.
- V0 Streamlit reste fonctionnel en parallèle (les deux applications partagent la même base SQLite locale).

### En attente de validation utilisateur avant Phase V1-2b (déploiement Render).

---

## 2026-05-13 — Phase V1-1 : infrastructure déployée

### Validé par l'utilisateur

- Dépôt `lugia-checkup-demo` poussé sur GitHub (privé), incluant le tag `v0-final`.
- Vercel connecté au repo, déploiement automatique du contenu de `web/` à chaque push sur main.
- DNS OVH configuré : CNAME `diagnostic` → `aed4c8d94f10e709.vercel-dns-017.com` (cible Vercel spécifique au projet). HTTPS actif via Let's Encrypt automatique de Vercel.
- `https://diagnostic.lugia.fr` accessible et affiche la page placeholder.
- Compte Resend créé, API key stockée en sécurité (utilisation en V1-5 pour les liens magiques).
- Compte Render créé et lié à GitHub (utilisation en V1-2b pour le backend).

### Ajouté

- `web/index.html` — page placeholder "Bienvenue sur la zone de test Lugia". Servie par Vercel sur `diagnostic.lugia.fr`. Inclut `<meta name="robots" content="noindex, nofollow">` pour ne pas être indexée par les moteurs de recherche.

### Note technique pour le futur

Si le DNS doit être reconfiguré : la cible CNAME exacte fournie par Vercel pour ce projet est `aed4c8d94f10e709.vercel-dns-017.com.`. La cible générique `cname.vercel-dns.com.` ne fonctionne plus pour les nouveaux projets Vercel — chaque projet a sa cible spécifique communiquée lors de l'ajout du domaine.

---

## 2026-05-13 — Phase V1-0 : cadrage V1 portage technique pur

### Décision majeure

D-017 inscrite dans `DECISIONS.md` : V1 est strictement un portage technique de V0 vers une architecture web distante (Next.js + FastAPI + Postgres, hébergée sur Vercel + Render, accessible via `diagnostic.lugia.fr` avec auth par lien magique). Aucune nouvelle fonctionnalité produit en V1. Les extensions méthodologiques (9 facettes, animations pyramide, "Vos mots", export PDF) glissent en V1.5. La conformité commerciale et l'auth moderne attendent V2.

### Modifié

- `MASTER_PROMPT.md` — version 3.0. Section 5 (périmètre) restructurée en V0 / V1 / V1.5 / V2 / Au-delà. Section 6 (architecture) divisée entre stack V0 (Streamlit + SQLite, fonctionnel en local) et stack V1 (Next.js + FastAPI + Postgres + Vercel + Render). Section 11 enrichie avec les huit phases V1 (V1-0 à V1-7) et leurs critères d'acceptation.
- `ROADMAP.md` — restructuration majeure. Quatre jalons distincts : V0 livrée, V1 portage en cours, V1.5 extension méthodologique, V2 montée commerciale. Section "Conformité réglementaire pré-commercialisation" ajoutée en V2.
- `DECISIONS.md` — D-017 ajoutée (cadrage V1 complet).

### À faire côté utilisateur

- Poser le tag git `v0-final` sur l'état actuel du dépôt (commande fournie en réponse).

### En attente de validation utilisateur avant Phase V1-1.

---

## 2026-05-13 — V0 complète : test manuel validé, limites éditoriales inscrites en V1

### Validé par l'utilisateur

- Test bout en bout réalisé avec des réponses manuelles (pas seulement le persona). Parcours fonctionnel, base SQLite cohérente, rapport régénérable à la volée via `scripts/dump_report.py`.
- Limite éditoriale V0 reconnue : les réponses textuelles (Mode B initial, Mode C, compléments) sont stockées en base mais peu intégrées au rendu final. Le rapport reflète principalement les options QCM, pas le texte écrit par le médecin. Limite assumée pour V0 — pas de correction immédiate.

### Ajouté

- `scripts/dump_report.py` enrichi avec les options `--list` (liste des interviews disponibles) et `--out` (chemin alternatif d'écriture du rapport).
- `ROADMAP.md` — entrée "Section 'Vos mots'" en V1 Restitution : encart qui cite verbatim les réponses libres du médecin sous la synthèse, pour compenser la limite éditoriale V0.

### Phase V0 globalement complète

Toutes les phases V0-1 à V0-5 sont validées. Démonstrateur fonctionnel de bout en bout, traçable, recalculable à la volée, démontrable à un médecin réel. Les limites V0 sont documentées (D-013, D-016, modeling_scoring.md section 7) et les améliorations V1+ inscrites dans la roadmap.

---

## 2026-05-13 — Phase V0-5 : test bout en bout et premier sample_report

### Ajouté

- `scripts/dump_report.py` — utilitaire qui charge une interview, applique les trois moteurs V0-4 (`src/scoring`, `src/templates`, `src/workstreams`), et écrit le rapport en Markdown dans `resources/sample_report.md`. Options `--id <N>` (interview précise, défaut : la plus récente), `--stdout` (écriture stdout au lieu du fichier). Cohérent avec `DECISIONS.md` D-010 (le rapport est produit par le démonstrateur, pas rédigé en amont).
- `resources/sample_report.md` — premier rapport réel produit pour le persona Dr Chateau. Synthèse, trois facettes scorées à 3/3/3, trois chantiers paramétrés, prochaine étape recommandée. Sert d'oracle de non-régression pour les évolutions futures du scoring, des templates et des chantiers.

### Critères d'acceptation V0-5

- Session complète jouée : oui, via `scripts/seed_persona.py` puis génération du rapport par `scripts/dump_report.py`.
- `resources/sample_report.md` produit : oui.
- Démonstrateur jugé "démontrable" : en attente de validation finale par l'utilisateur après un dernier passage manuel dans l'app.

### Phase V0-4c validée par l'utilisateur (validation implicite : "Super, allons y pour un test de bout en bout").

### En attente de validation finale de la V0 par l'utilisateur.

---

## 2026-05-13 — Phase V0-4c : instanciation paramétrée des trois chantiers

### Ajouté

- `src/workstreams.py` — moteur de génération des trois chantiers V0. Une fonction par chantier (`chantier_demandes_directes`, `chantier_ia`, `chantier_absence`) avec logique de trigger (version standard si déclenchée, version préventive sinon) et composition par placeholders. Helpers spécifiques (`_canaux_paralleles_phrase`, `_flux_principal`, `_usage_ia_decrit`, `_has_classical_dictation`). Dispatcher `build_workstreams(interview_id)` retournant la liste des trois chantiers dans l'ordre de priorité.

### Modifié

- `src/templates.py` — ajout de `derive_secretariat_with_du` (variante du libellé secrétariat après préposition "de") pour préserver la grammaire française naturelle dans les phrases des chantiers.
- `pages/02_Resultats.py` — remplacement de la liste mockée `MOCKED_CHANTIERS` par un appel à `workstreams.build_workstreams(interview_id)`. Retrait du bandeau jaune V0-4c.

### Calibration sur Dr Chateau

L'exécution du script `seed_persona.py` puis l'accès à la page de résultats doit afficher trois chantiers tous en version standard (correctrice), avec :

- **Chantier 1** "Reprendre la main sur les demandes directes" — vu mentionnant Doctolib et le télésecrétariat.
- **Chantier 2** "Sécuriser votre usage actuel de l'IA" — vu mentionnant ChatGPT et l'anonymisation manuelle, obtient incluant la mention "La dictée vocale classique que vous utilisez déjà reste" (déclenchée par Mediadict dans Q09 complement).
- **Chantier 3** "Anticiper une absence prolongée" — vu citant "Depuis le départ de Catherine, rien n'est documenté".

### Phase V0-4 complète. Plus de section mockée sur la page de résultats — toute la page est dynamique.

### En attente de validation utilisateur avant Phase V0-5 (test bout en bout et production de `sample_report.md`).

---

## 2026-05-13 — Phase V0-4b : implémentation du scoring et de la synthèse dynamiques

### Ajouté

- `src/scoring.py` — moteur de calcul des scores par facette. `compute_facet_score(interview_id, facet)` et `compute_all_facet_scores(interview_id)` implémentent l'algorithme de moyenne brute documenté dans `modeling_scoring.md`. Retournent le score arrondi, la moyenne brute et la liste des contributions traçables.
- `src/templates.py` — moteur de génération des textes du rapport. Helpers de lecture des réponses (`_get_answer`, `_selected_option`, `_complement`), dérivation des placeholders (`derive_outils_principaux`, `derive_duree_secretariat`, `derive_predecessor_name`, `derive_externalisations`, `derive_enjeu_temporel`), composition des phrases de fragilité (`fragilite_flux_entrant`, `fragilite_ia`), synthèse complète (`build_synthesis`), résumés par facette (`build_processes_summary`, `build_participants_summary`, `build_information_summary`, dispatcher `build_facet_summary`), et recommandation de prochaine étape (`build_next_step_recommendation`).

### Modifié

- `pages/02_Resultats.py` — réécriture pour charger l'interview courante depuis la base, calculer les scores via `src.scoring`, composer la synthèse et les résumés de facette via `src.templates`, et rendre la page avec les données réelles. La section "chantiers" reste en données mockées en attendant la Phase V0-4c. Date de session affichée à partir de `interview.created_at`. Recommandation de prochaine étape mise en surbrillance selon la règle (par défaut "Échanger avec Lugia" en V0).

### Calibration sur Dr Chateau

L'exécution du script `seed_persona.py` puis l'accès à la page de résultats doit afficher :
- Trois scores 3 / 3 / 3 (cohérents avec l'oracle `sample_answers_pchateau.md`).
- Une synthèse qui mentionne `Maiia et Doctolib`, `votre télésecrétariat depuis 18 mois`, les canaux directs comme première fragilité, l'usage ChatGPT comme seconde fragilité, et la facturation électronique de septembre.
- Un résumé Participants qui cite "Depuis le départ de Catherine il y a 18 mois".
- Un résumé Information qui mentionne "comme cela s'est produit il y a quelques mois".

### En attente de validation utilisateur avant Phase V0-4c.

---

## 2026-05-13 — Phase V0-4a : ressources scoring, templates et chantiers — VALIDÉE

### Ajouté

- `resources/modeling_scoring.md` — algorithme de scoring V0 (moyenne brute pure, sans bonus). Cas limites (Sans objet, Autre, questions non répondues). Validation tracée pour Dr Chateau : scores 3/3/3. Ontologie minimale V0 (7 types de nœuds). Détail recalculable depuis `answer`. Limites assumées et pistes V1.
- `resources/output_templates.md` — squelette du rapport, template de synthèse avec placeholders, templates de résumés de facette, recommandation de prochaine étape. Système de placeholders et règles de composition. Calibration sur Dr Chateau.
- `resources/workstream_templates.md` — trois chantiers prédéfinis V0 avec leur structure en 4 parties, conditions de déclenchement (triggers), placeholders paramétrables, versions standard et préventive. Algorithme de sélection V0 (systématique). Calibration sur Dr Chateau.

### Décision méthodologique majeure

Scoring V0 = **moyenne brute pure** des scores santé, sans bonus contextuel. Cohérent avec D-013 (justifiabilité mathématique). Conséquence assumée : les scores attendus du Dr Chateau seront 3/3/3 (au lieu de 6/4/5 du wireframe aspirationnel V0-1). La nuance entre facettes est portée par la formulation qualitative (résumés et synthèse), pas par les chiffres.

### En attente de validation utilisateur avant Phase V0-4b.

---

## 2026-05-13 — Outils de dev et inscriptions ROADMAP

### Ajouté

- `scripts/seed_persona.py` — script de seed du parcours Dr Chateau dans la base SQLite locale. Crée une interview, insère les 14 réponses du persona (encodées en clair dans le script), positionne le pointeur en fin de session. La session reste en `in_progress` pour être accessible via "Reprendre votre check-up" sur l'accueil. Option `--reset` pour repartir d'une base vierge. Utilitaire de dev pour itérer sur V0-4 sans rejouer le questionnaire.
- `ROADMAP.md` — entrée "Pré-remplissage automatique du questionnaire à partir d'un contexte client externe (document, transcription vocale)". Le script de seed est l'ancêtre minimal de ce mécanisme.
- `ROADMAP.md` — entrée "Rapprochement Streamlit / wireframe" et "Migration vers React ou Next.js" pour le rendu visuel à terme.

### Phase V0-3c validée par l'utilisateur.

---

## 2026-05-13 — Phase V0-3c : oracle persona Dr Chateau

### Ajouté

- `resources/sample_answers_pchateau.md` — session de référence (oracle) du persona Dr Philippe Chateau pour les 14 questions V0. Choix QCM, réponses libres en Mode B, réponses ouvertes en Mode C, compléments optionnels, le tout aligné sur le persona (outils nommés, incident du résultat vu en retard, usage ChatGPT culpabilisé, contexte familial allusif).
- Section "Synthèse rapide" avec scores bruts attendus par facette (Processus 3,33 / Participants 3,00 / Information 2,75) et écarts avec les cibles V0-1 (6 / 4 / 5).
- Notes méthodologiques pour Phase V0-4 : pistes d'ajustement (bonus stack intégré, bonus externalisation, bonus reconnaissance des fragilités).

### Méthode

Session générée à partir du contexte persona sans passage réel par l'application Streamlit, conformément au choix de l'utilisateur. Le test bout en bout en Phase V0-5 devra reproduire ces réponses à l'identique pour vérifier la cohérence du parcours et du scoring.

### En attente de validation utilisateur avant Phase V0-4.

---

## 2026-05-13 — Phase V0-3b iteration 3 : Q05 supprimée et promesse revue

### Supprimé

- Q05 (Canal principal de rendez-vous, Mode A) — redondante avec Q04 (Flux entrant). Les options du Q04 indiquaient déjà le canal dominant.

### Modifié

- `resources/interview_protocol.json` — total ramené à 14 questions, renumérotation propre des IDs et option IDs.
- `resources/interview_protocol.md` — réécrit avec nouvelle distribution et nouvelle alternance.
- `MASTER_PROMPT.md` — promesse mise à jour à "moins de 30 minutes", références à 15 questions remplacées par 14.
- `README.md`, `resources/product_brief.md`, `resources/brand_guidelines.md` — promesse mise à jour partout.
- `app.py`, `wireframes/accueil.html` — texte de la promesse et de la note CTA mis à jour.
- `DECISIONS.md` — D-015 ajoutée (promesse revue), D-005 conservée en archive.
- `ROADMAP.md` — entrée "Différenciation Q04/Q05" remplacée par "Approfondissement du canal principal" en V1.

### Nouvelle distribution V0

14 questions, séquence A A A B B C A A A A B A B C (8 mode A, 4 mode B, 2 mode C).

### En attente de validation utilisateur avant Phase V0-3c.

---

## 2026-05-13 — Phase V0-3b iteration 2 : refonte interview suite retours utilisateur

### Bug et UX

- `src/db.py` — ajout de la colonne `selected_option_label` à `answer` (migration idempotente `_migrate_answer_columns`). Le libellé de l'option choisie est désormais stocké en clair, la base est lisible sans cross-référence avec le JSON.
- `pages/01_Checkup.py` — bouton "Précédent" ajouté (navigation libre arrière) avec sauvegarde partielle non destructive de la réponse en cours. "Quitter et reprendre plus tard" sauvegarde aussi partiellement.
- `pages/01_Checkup.py` — préremplissage des widgets depuis la base si la question a déjà été répondue (cas du retour sur une question après quit, ou via le bouton Précédent dans une nouvelle session).

### Calibration des questions

- `resources/interview_protocol.json` — Q06 (charge admin) recalibré : "moins d'une heure" passe de 9 à 7, "une à deux heures" passe de 7 à 9. Le 9 sur la fourchette basse était suspect chez un libéral.
- `resources/interview_protocol.json` — Q14 (IA) prompt clarifié : la dictée vocale classique de type Dragon n'est pas comptée comme IA générative. L'option `q14_a` mentionne explicitement la dictée vocale classique pour lever l'ambiguïté.

### Refonte du format

- Mode A étendu pour porter un complément optionnel (toujours affiché, devient obligatoire si "Autre" est choisi). Conséquence : moins de Mode B chronophage, plus de QCM rapides avec respiration optionnelle.
- Trois Mode B convertis en Mode A+complément : Q08 (dépendance), Q10 (suivi chroniques), Q13 (cadre du secrétariat).
- Q07 (équipe étendue, devenu Q08) ramené à 4 + Autre (suppression de l'option "plusieurs combinées").
- Q10 (outils, devenu Q10) ramené à 4 + Autre (suppression de l'option "papier" peu plausible pour la cible).

### Réorganisation et renumérotation

- Cadre du secrétariat (Q13 en v1.0) remonté en Q03, juste après les qualifications Q01 et Q02. Continuité narrative immédiate.
- Renumérotation propre des IDs et option IDs pour qu'ils suivent les nouvelles positions. Conséquence : les éventuelles données SQLite générées avec la v1.0 contiennent des IDs orphelins ; recommandation de supprimer `data/lugia_demo.sqlite` avant de retester.
- Distribution nouvelle : **A A A B A B C A A A A B A B C** (9 mode A, 4 mode B, 2 mode C).

### Documentation

- `resources/interview_protocol.md` — réécrit pour refléter la nouvelle distribution et la nouvelle définition du Mode A. Le détail des options reste exclusivement dans le JSON pour éviter la dette de duplication.

### En attente de validation utilisateur avant Phase V0-3c.

---

## 2026-05-12 — Phase V0-3b : Implémentation interview Modes A/B/C

### Ajouté

- `pages/01_Checkup.py` — réécriture complète. Flow linéaire question par question, trois composants distincts par mode :
  - **Mode A** : `st.radio` avec `index=None`, plus champ texte conditionnel pour "Autre".
  - **Mode B** : `st.text_area` (réponse ouverte) puis `st.radio` (relance), plus complément optionnel.
  - **Mode C** : `st.text_area` seul, prompt narratif.
- Barre de progression `st.progress` plus caption "Question X sur 15".
- Pill de facette en tête de chaque question (Processus, Participants, Information, Contexte, Motivation, Clôture).
- Validation minimale par mode (réponse ouverte requise en B et C ; "Autre" doit être précisé en A).
- Bouton "Quitter et reprendre plus tard" disponible à tout moment.
- Écran de fin "Merci" affiché quand `current_question_index >= 15`, avec redirection vers la page de résultats (mockée en V0-3b, calculée en V0-4).

### Modifié

- `src/db.py` — ajout de la colonne `complement_text` à la table `answer` (migration non destructive `_migrate_answer_add_complement`). Ajout des helpers `save_answer`, `get_answer`, `get_answers`, `set_current_question_index`.

### Modèle de stockage des réponses

- Mode A : `selected_option` + `free_text` si "Autre".
- Mode B : `selected_option` + `free_text` (ouvert) + `complement_text` (optionnel).
- Mode C : `free_text` seul.
- Une seule ligne `answer` par (interview, question). Réécriture en cas de re-réponse.

### Critères d'acceptation V0-3

- Les 15 questions affichent dans l'ordre avec alternance visible des modes — OK.
- Les réponses sont sauvegardées dans SQLite à chaque "Suivant" — OK.
- Le médecin peut interrompre (bouton "Quitter") et reprendre (depuis l'accueil) — OK.

### En attente de validation utilisateur avant Phase V0-3c.

---

## 2026-05-12 — D-014 et migration JSON : format canonique des questions

### Ajouté

- `resources/interview_protocol.json` — source de vérité technique pour les 15 questions V0, avec métadonnées de facette, scored, modes, options.
- `src/questions.py` — loader minimal (`load_protocol`, `load_questions`, `get_facet_labels`, `get_scored_facets`, `get_question_by_id`) et retro-test (`check_md_json_consistency`) exécutable directement par `python -m src.questions`.
- `DECISIONS.md` D-014 — Format canonique JSON. Pourquoi, alternatives écartées (Python dict, parseur Markdown, YAML).

### Modifié

- `resources/interview_protocol.md` — note de tête ajoutée précisant que le JSON est la source de vérité technique et que le `.md` est la documentation humaine, tenue à jour manuellement.

### Motif

Anticipation d'une dette de transition ultérieure. JSON sera de toute façon nécessaire en V1 (9 facettes, plus de questions, possiblement édition par tiers), autant l'adopter dès maintenant que la base de questions est petite.

---

## 2026-05-12 — D-013 et entrées roadmap : scoring justifiable

### Ajouté

- `DECISIONS.md` D-013 — Scoring : justifiabilité mathématique non négociable. V0 = moyenne brute recalculable à la volée depuis `answer`. Pondération différée en V1+.
- `ROADMAP.md` — entrée V1 "Approfondissement des questions par facette" (fréquence, satisfaction, durée, ancienneté).
- `ROADMAP.md` — entrée V1 "Encart détail de votre score" sur la page de résultats.
- `ROADMAP.md` — entrée V1+ "Pondération calibrée du scoring par benchmarking entre pairs".

---

## 2026-05-12 — Phase V0-3a : Interview Protocol — rédaction — VALIDÉE

### Ajouté

- `resources/interview_protocol.md` — 15 questions V0 réparties en quatre groupes : 2 questions de qualification (contextuelles), 4 sur Processus & Activités, 3 sur Participants, 4 sur Information, plus 1 motivation et 1 clôture en mode C. Alternance des modes documentée : A A B A B C A B A B B A B B C (5 mode A, 8 mode B, 2 mode C).
- Métadonnées d'option : score santé sur 10, type de nœud (ontologie minimale V0), tags.
- Tableau des réponses attendues du persona Dr Chateau pour calibration de l'oracle V0-3c. Premier calcul vérifié et écarts identifiés (Processus 4 attendu vs 6 cible, Information 2,75 attendu vs 5 cible) — ajustements à faire en V0-4 sur le scoring détaillé.

### En attente de validation utilisateur avant Phase V0-3b.

---

## 2026-05-12 — Phase V0-2 : Squelette Streamlit et SQLite — VALIDÉE

### Ajouté

- `app.py` — page d'accueil Streamlit (promesse, garde-fous, démarrage et reprise de session).
- `pages/01_Checkup.py` — squelette de la page interview (le questionnaire sera implémenté en V0-3).
- `pages/02_Resultats.py` — page de résultats avec données mockées issues du persona Dr Chateau.
- `src/__init__.py`, `src/db.py` — module Python avec helpers SQLite (init, création, lecture, mise à jour de session).
- `requirements.txt` — dépendance unique `streamlit>=1.36`.
- `.gitignore` — exclusion des fichiers Python compilés, environnements virtuels et base SQLite locale.
- `.streamlit/config.toml` — palette Lugia (fond beige, accent bleu sourd).
- `data/.gitkeep` — préservation du dossier de la base.

### Modifié

- `README.md` — section "Installation et lancement" renseignée (création d'un venv, installation des dépendances, commande `streamlit run app.py`).

### Schéma SQLite minimal

Quatre tables créées au premier lancement : `interview` (sessions de check-up), `answer` (réponses aux questions), `facet_score` (scores par facette WSF), `workstream` (chantiers instanciés). Foreign keys actives, contraintes `ON DELETE CASCADE`.

### Critères d'acceptation

- L'application se lance avec `streamlit run app.py` (instructions dans `README.md`) — OK.
- Trois pages navigables (Accueil, Interview, Résultats) — OK, navigation par boutons et `st.switch_page`.
- Base SQLite initialisée avec schéma minimal (interview, answer, facet_score, workstream) — OK.
- Sauvegarde et reprise d'une session interrompue — OK, via `st.session_state` (intra-session) et `db.get_latest_in_progress_interview()` (cross-session).

### Note

Smoke test automatisé non exécuté (sandbox bash indisponible lors de l'écriture). Code relu manuellement. Premier lancement local par l'utilisateur attendu pour validation finale.

### En attente de validation utilisateur avant Phase V0-3.

---

## 2026-05-12 — Phase V0-1 : Wireframes artefacts (itération 2) — VALIDÉE

### Modifié

- `wireframes/resultats.html` — version 2 :
  - Formulations reprises en langage métier médical (suppression de "filet de continuité", "réguler le flux entrant").
  - Personnalisation accrue de la synthèse et des chantiers avec des éléments concrets issus du persona : outils nommés (Maiia, Doctolib, ChatGPT), durée du télésecrétariat (18 mois), nom de l'ancienne secrétaire (Catherine), incident du résultat vu en retard, échéance facturation électronique de septembre 2026.
  - Titres de chantiers reformulés : "Réguler le flux entrant" → "Reprendre la main sur les demandes directes" ; "Préparer un filet de continuité" → "Anticiper une absence prolongée".
  - Sections renommées : "Lecture de synthèse" → "Votre situation aujourd'hui" ; "Trois facettes de votre système de travail" → "Trois angles de votre cabinet".

### Motif

Retour utilisateur sur l'itération 1 : trop de vocabulaire consulting (jugé "filet de continuité", "absorber" peu naturels pour un médecin), et manque de personnalisation perçue dans la conclusion et les chantiers.

---

## 2026-05-12 — Phase V0-1 : Wireframes artefacts (itération 1)

### Ajouté

- `wireframes/accueil.html` — maquette HTML autonome de la page d'accueil (promesse, description, garde-fous, CTA).
- `wireframes/resultats.html` — maquette HTML autonome de la page de résultats avec données mockées issues du persona Dr Chateau (lecture de synthèse, trois facettes scorées, trois chantiers en structure 4 parties, trois prochaines étapes dont une recommandée).

### Critères d'acceptation cochés

- Page d'accueil : promesse, garde-fous, bouton "Commencer" — OK.
- Page de résultats : trois facettes avec score, résumé qualitatif, liste de chantiers — OK.
- Données mockées issues du persona Dr Chateau — OK.
- Tonalité conforme aux garde-fous (sobriété, non-culpabilisation, vocabulaire validé) — OK.

### En attente de validation utilisateur avant Phase V0-2.

---

## 2026-05-12 — Initialisation du projet

### Ajouté

- `MASTER_PROMPT.md` à la racine — cadre méta du projet, version 2.0.
- `resources/persona_medecin_pchateau.md` — persona médecin de référence (Dr Philippe Chateau, 55 ans, médecin libéral solo à Saint-Mandé).
- `README.md` — présentation du projet.
- `CHANGELOG.md`, `TODO.md`, `DECISIONS.md`, `ROADMAP.md` — fichiers de suivi initialisés.
- `resources/product_brief.md` — brief produit (objectif, public, promesse, périmètre, bénéfices, limites).
- `resources/brand_guidelines.md` — voix, ton, vocabulaire, garde-fous, principes de design.
- `resources/wsf_reference.md` — note de référence sur le Work System Framework adaptée au cabinet médical.

### Décidé

Douze décisions structurantes formalisées dans `DECISIONS.md`. Principales :

- Positionnement Lugia comme **substitution-extension** (et non outil supplémentaire).
- Périmètre V0 réduit à **trois facettes WSF** : Processus & Activités, Participants, Information.
- Trois **modes d'interaction du questionnaire** (A QCM pur, B Hybride par défaut, C Ouvert) avec principe d'alternance.
- **Workflow design** : wireframe artefact d'abord, Streamlit ensuite.
- **Stratégie LLM** : règles déterministes prioritaires, LLM encadré par schémas JSON et température basse.
- **Durée cible** du check-up : 45 minutes (et non 20).
- **Découpage V0** en cinq phases (et non douze).

### Reporté en roadmap

Voir `ROADMAP.md`. Principaux reports : extension aux 9 facettes WSF, 6 constantes transversales, extraction de nœuds via LLM, visualisations Mermaid, pyramide WSF interactive, export PDF, alignement aux axiomes Alter, MSP de grande taille, version vendable Next.js.

---

*Format inspiré de [Keep a Changelog](https://keepachangelog.com/). Mettre à jour à chaque fin de phase.*
