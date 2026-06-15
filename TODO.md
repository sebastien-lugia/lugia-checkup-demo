# TODO

Tâches restantes, bugs et points à valider. Tient lieu de carnet de bord court-terme. Les tâches accomplies sont remontées dans `CHANGELOG.md`.

---


## Pivot Demo — parcours métier modélisé (ouvert le 2026-06-15, D-056)

Préalable méthodo (à mener AVANT tout code) :

- Réécrire `resources/briefs/brief_modelisations_graphiques.md` autour du pivot : grammaire des 3 représentations (logigramme / ruban chaîne de valeur / mini-carto objets), catalogue de micro-parcours par métier, mécanique du chat IA de modélisation, boucle synthèse → validation → graphes → chantiers.
- Démarrer la conv « modélisations graphiques » avec ce brief. Sortie attendue : spec produit du pivot + maquettes des 3 représentations + premier catalogue de micro-parcours pour le médecin généraliste.

✅ **Préalable méthodo levé (2026-06-15)** — spec + maquettes livrées : `resources/methode/lugia_modelisations_graphiques_spec.md` et `resources/methode/maquettes_parcours/`. Voir CHANGELOG.

Points à valider sur la spec :

- Valider le découpage démo vs Work System du catalogue (10 micro-parcours médecin) avec un usage réel.
- Trancher : logigramme en swimlanes vs annotation (Q ouverte 1) ; nb de zones du ruban (Q ouverte 2).
- Caler la règle de suffisance du chat sur les premiers parcours réels (Q ouverte 3).
- Figer la convention visuelle du « désalignement tracé » dans le ruban avec la charte éditoriale (Q ouverte 5).
- Compléter les catalogues avocat / kiné (conv dédiée).
- Nettoyer les scripts scratch `resources/methode/maquettes_parcours/_gen*.py` (suppression bloquée côté agent).

Après spec uniquement (ne pas coder avant) :

✅ **Renderers web des 3 représentations livrés (2026-06-15)** — `web/lib/wsf/palette.ts`, `parcours/charge-admin.ts`, `render-ruban.ts`, `render-carto.ts` (logigramme via `graphToMermaid`). Suite renderers :
- Porter ruban + mini-carto en reportlab natif (`src/wsf_render.py`) pour le PDF.
- ✅ Composant `ParcoursViews.tsx` + câblage page résultats livrés (2026-06-15) : section « Modéliser un parcours » avec sélecteur (`lib/wsf/parcours/catalogue.ts`), pilote rendu, autres « bientôt ».
- ✅ Portage reportlab des vues parcours (ruban + carto) livré (2026-06-15).
- ✅ Suggestion IA du parcours à creuser livrée (heuristique footprint, 2026-06-15).
- ✅ Démotion : liste de chantiers directs retirée, parcours en sortie principale (2026-06-15).
- ✅ Export PDF du parcours modélisé (3 vues) livré (2026-06-15).
- ✅ Catalogues avocat/kiné amorcés (2026-06-15) ; reste à les rendre modélisables (backend + flow sectoriel) et à brancher un flux résultats par secteur.
- Coder la dérivation des chantiers À PARTIR du parcours modélisé (le « 3e temps » promis dans la copy) — fonctionnalité produit, payante.
- ✅ Dialogue IA de modélisation (C.E) livré (incréments 1+2, 2026-06-15) : moteur backend mode « parcours » + `ParcoursDialogModal` (cloud) + validation → `ParcoursViews`, câblé page résultats sur le pilote.
- ✅ Mode navigateur (web-llm) ajouté à `ParcoursDialogModal` (2026-06-15).
- ✅ Les 10 micro-parcours ouverts (backend + catalogue) (2026-06-15).
- Rendre modélisables les 9 autres micro-parcours (les enregistrer en `_MODULES_FALLBACK` + passer `disponible:true` au catalogue, une fois la modale validée).
- Optionnel : ajuster `MAX_USER_MESSAGES` spécifique parcours (actuellement 10 partagé).
- Compléter le catalogue avocat / kiné dans `catalogue.ts`.
- Faire converger `render-mermaid.ts` sur `palette.ts` (suppression du double mapping d'états).

- Refondre la page résultats V3 : nouvelle sortie principale « modéliser un parcours » remplaçant « explorer un chantier ».
- Construire l'écran de dialogue IA de modélisation (mécanique distincte du chat chantier).
- Construire l'écran de synthèse + validation par le médecin.
- Construire l'écran de visualisation des trois représentations.
- Déplacer la génération des chantiers en aval du parcours modélisé (réemploi des composants C.A/C.B).
- Brancher le catalogue de micro-parcours côté backend (table de parcours par métier).

Points à arbitrer pendant la spec :

- Suggestion du parcours par l'IA à partir des réponses du questionnaire : algorithme ? heuristique simple ou dérivation depuis le footprint ?
- Profondeur exacte du teaser de chantiers en sortie gratuite (combien de zones de fragilité pointées, à quel niveau de détail).
- Persistance : le parcours modélisé est-il stocké comme graphe WSF (nœuds objets + liaisons typées) pour réutilisation par les chantiers ? Si oui, format/schema.
- Stack IA : Cloud (Claude) vs Navigateur (qwen 7B + fallback 3B) — comportement en mode local pour un chat de modélisation potentiellement plus long que les 4 phases actuelles.
- Quand le médecin a-t-il droit à un second parcours ? (gratuit toujours, gratuit une fois, payant ?)


## Substrat de démo — arbitrages révélés (2026-06-08)

Le moteur `resources/methode/demo/engine.py` valide le seed et reproduit les 3 signaux, mais a révélé 2 points de calibration :

- ~~**Complétude par thème — périmètre**~~ ✅ **Tranché D-053** : deux métriques (documentaire stricte + fonctionnelle via `référencé_dans`). Implémenté dans `engine.py`. Reste : que l'extracteur peuple `référencé_dans` de façon fiable (lié au backlog « axe primaire / référencé_dans »).
- ~~**Règle R02 — formule**~~ ✅ **Tranché D-054** : centralité locale + garde degré ≥ 3, figée dans `schema_exemple.md` et `engine.py`. **Reste ouvert** : recaler le seuil 0,60 sur données (gel honnête en attendant, cf `calibration_roadmap`).


## Paramétrage de production — méthode (ouvert le 2026-06-08)

**Préalable fait** : 10 axes figés dans les specs sources (D-052, `schema_spec_v0.6` source de vérité).

Coutures à régler en backlog (non bloquantes pour démarrer la prod) :

- **Réconciliation questionnaire ↔ substrat** : règle de priorité quand saisie structurée et extraction IA se contredisent.
- **Priorisation des chantiers cross-axe** : règle d'ordonnancement des actions issues d'axes différents.
- **Propagation v0.5/v0.6** des ajouts Alter (R14 workaround, R15, complétude fonctionnelle) dans `interview_protocol` + `calibration_v1` (vérifier qu'ils y sont bien) et dans le jeu générique.
- **Règle « axe primaire / re-pondération »** d'un objet multi-axes (par fréquence d'usage / situations) — éviter qu'un objet saute d'axe à chaque session ; paramétrage par défaut + co-construit avec le médecin.
- **Règle « scinder ou pas »** un objet (module à part = objet distinct + regroupement par tag/relation ; sinon `situations`). À ajouter au protocole d'extraction.
- **Vocabulaire céleste interne vs end-user** (arbitrage interface — non urgent côté prod).
- **Régénérer** `capability_map_generique` et `wsf_matrix` en **10 axes** (HTML v7 périmé ; v8 PDF fait foi).

Backlog règles sectorielles : règles propres aux axes 9 (ex. « développement sans canal d'acquisition ») et 10 (ex. « aucune veille sur marché en évolution rapide »).

---

## Site web V1 (`site/`) - a valider

- Lancer en local et relire : `cd site && npm install && npm run dev`.
- ~~Confirmer le slug Calendly~~ Fait (`sebastien-lugia/30min`). Reste : confirmer l'URL diagnostic definitive.
- Valider la copy (hero, prix 49/149/499/devis, comparatif).
- Verifier le responsive / l'overlay de nav sur mobile.
- Deployer quand valide (Vercel) ; favicon + OpenGraph.

---

## Business plan — suivi (28 mai 2026, v1.1)

Le BP v1.1 est livré (`etudes/Lugia_Business_Plan_2026-05.html` + `.pdf`, 45 pages, charte Lugia appliquée, doctrine 10-partis intégrée). Points à instruire :

- **Faire valider le BP par Sébastien** — passage section par section. Corriger les zones `[HYP]` qui ont une valeur réelle disponible (coûts infra réels, ARPU effectif premiers prospects, forme juridique, etc.).
- ~~Installer les polices Onest et IBM Plex Mono~~ ✅ Fait — `assets/fonts/` contient Lora, Onest, IBM Plex Mono (Fontsource v5) ; HTML BP les charge via @font-face. Rendu PDF 100 % conforme charte.
- **Instrumenter les hypothèses clés dès les pilotes** : ARPU effectif, taux de conversion diagnostic → payant, churn mensuel par cohorte, CAC tous canaux. Pas attendre une éventuelle levée pour les mesurer.
- **Mesurer la fidélité de la simulation causale** (gain en € et heures vs réalité observée sur pilote). Ne pas en faire un argument commercial fort avant validation.
- **Préparer un pitch deck dérivé** (10-15 slides) si l'option pré-seed se confirme. Le BP v1.1 fournit déjà la matière pour les slides (six retournements, projections par scénario, allocation pré-seed/seed).
- ✅ **Plaquette commerciale tri-fold médecin** (2 pages A4 paysage à plier en 3) — livrée 28 mai 2026.
- **Extraire un template HTML/CSS réutilisable** pour les prochaines études et rapports Lugia (cover + sommaire + opener + corps + tableaux + annexes en composants réutilisables).
- **Itérer le BP au prochain palier** (post-pilotes ou pré-levée) — passer en v1.2.


## Document maître — suivi (28 mai 2026)

Lancement du document maître Lugia, complément au BP, à rédiger bloc par bloc.

- ✅ **Bloc A — Vision & marché** (28 pages interne / 26 client) — livré 28 mai 2026.
- ✅ **Bloc B — Offre & approche commerciale** (47 pages interne / 42 client) — livré 28 mai 2026.
- ✅ **Bloc C — Méthode & technique** (80 pages interne / 72 client) — livré 28 mai 2026. Cœur méthodologique du document.
- ✅ **Bloc D — Réalisation & organisation** (108 pages interne / 98 client) — livré 28 mai 2026.
- ✅ **Bloc E — Actifs, roadmap, conclusion** + 12 annexes (133 pages interne / 119 client) — livré 28 mai 2026. Document maître v1.0 COMPLET.
- **Décisions ouvertes** : section 0.7 du bloc A liste D1 (financement), D2 (CTO), D3 (médecin advisor), D4 (forme juridique), D5 (extension Lawyer vs Finance), D6 (politique communication externe).
- **À surveiller** : maintenir la séparation claire entre passages `strict-interne` et passages publics dans tous les futurs blocs.

---

## V3-brand EN COURS — 3ème carte beta alignée brand kit (20 mai 2026)

Phase d'amorçage de la V3-brand : parcours entièrement aligné sur le brand kit Lugia (navy / ivoire / argent + signal ambre, Onest+Lora+IBM Plex Mono, layout angulaire, mode nuit par défaut). Route séparée `/checkup/v3-brand`, cohabitation avec V2.0 maintenue, dépréciation V2.0 après validation V3 (cf `DECISIONS.md` D-031).

### Arbitrages figés (D-031)

| # | Arbitrage | Décision |
|---|---|---|
| 1 | Familles typo | 2 éditoriales (Onest + Lora) + 1 utilitaire (IBM Plex Mono) |
| 2 | Proportions surface | 65/25/5 jour, ~75/20/5 nuit (à valider en T-V3-1) |
| 3 | Ambre | Token `--signal-warn` séparé — 1/écran max, 3 usages canoniques |
| 4 | Niveaux | « Fragile / En transition / Solide / Mature » conservés (V2.0) |
| 5 | Scoring | % backend conservé, conversion 0-3 au rendu V3 (`lvl()`) |
| 6 | Topbar | Barre continue 28 micro-étapes + étiquette de chapitre |
| 7 | Analyse croisée | Toujours affichée (avec fallback éditorial) |
| 8 | Angles radar | -90° / 30° / 150° (axe A vers le haut) |
| 9 | Route | `/checkup/v3-brand`, `protocol_version = "v3-brand-0"`, scoring partagé |

### Reste à faire — sous-vagues V3-brand

| Sous-vague | Livrables prévus |
|---|---|
| **T-V3-1** | Tokens design : extraire `web/lib/v3/tokens.ts` (couleurs, polices, surfaces jour/nuit, signal ambre, shimmers) — premiers tests lisibilité ambre `#b5780a` vs `#c8851a` sur navy + ivoire. |
| **T-V3-2** | Atomes partagés : `DVMono`, `DVCorners`, surfaces shimmer, niveau qualitatif, badge effort/gain. |
| **T-V3-3** | State machine V3 : extension `web/lib/v3/state.ts` — 28 étapes + transitions + reprise. |
| **T-V3-4** | Topbar progression + chapitre + énergie / radar live sticky ≥1140 px. |
| **T-V3-5** | Écrans intro / profil_step1 / profil_step2 / energy (mode nuit par défaut, toggle jour optionnel). |
| **T-V3-6** | Blocs A/B/C + transitions inter-blocs (filet argent, fondu, Lora 56 px « · »). |
| **T-V3-7** | Page résultats V3 (radar SVG glow filter, niveaux par axe, analyse croisée systématique, signaux 6 + fallback). |
| **T-V3-8** | Modules : 7 modules avec conditions d'activation (`OPPS` du modèle cible), page détail. |
| **T-V3-9** | 3ème carte « beta » sur page d'accueil + bouton accès `/checkup/v3-brand`. |
| **T-V3-10** | Smoke test bout en bout V3-brand + non-régression V2.0 et V1.1.9. |
| **T-V3-11** | ✅ Branchement éditorial dynamique page résultats (signals + axis_details + buildResultatsContent). |
| **T-V3-12** | ✅ Page « Tous les chantiers » + extraction opps_catalog partagé. |
| **T-V3-13** | ✅ Intégration Calendly sur boutons « Prendre rendez-vous » et « En parler avec Lugia ». |
| **T-V3-14** | ✅ Backend V3-brand (extension `protocol_version=v3-brand-0` + dispatchers scoring/report minimaux). |
| **T-V3-15** | ✅ Persistance backend dans `/checkup/v3-brand` — query string + listAnswers + saveAnswer + patchMyProfileV2 + completeInterview. |
| **T-V3-audit-final** | ✅ Revue de cohérence visuelle + propreté code + responsive mobile (#73). |
| **T-V3-snapshot** | ✅ Gel pré-charte : `/checkup/v3-snapshot` figé, `/checkup/v3-charte` actif, alias rétro-compatible `/checkup/v3-brand`. D-033. |
| **T-V3-charte** | ✅ Audit règle par règle contre charte v1.0 terminé. 45 règles validées (axes A-J). Refactor : palette axes argent uniforme, badges A/B/C avec reflet hover, contexte/reformulation/benchmark migrés, échelle typo alignée, reset CSS italique, TypingDots, tags FR Rapide/Posé/Approfondi. Écart documenté en D-034 (box-shadows hover). Tests visuels à valider. |
| **T-V3-charte-refinement** | ✅ Refonte post-charte (2026-05-22) : routing dénominateurs alignés (compteur footer + buildLocalScores + Topbar + radar), 23 labels bloc B/C resserrés en 1 ligne, Q04 outils numériques re-paliérisée, harmonisation POV médecin (7 labels), transition « Bloc A/B/C terminé », page résultats avec entête + back + radar enrichi (labels + phrase de lecture + échelle 100%), section motivPhrase dédiée, RiskBadge 3 niveaux différenciés par transparence, mini-encart « Avec Lugia » par chantier (D-035), KPIs langage naturel, footnote estimations déplacée, 6 conflits border/borderLeft corrigés. Voir CHANGELOG 2026-05-22. |
| **T-V3-charte-vague-A2** | ✅ Grande vague mai 2026 (séquence A.1 → A.2 v2) : branchement éditorial dynamique page résultats, phrase choc personnalisée (motivation × status × énergie), estimations gain € calculées (formule 70 € TTC × 220 j × 70 % × volumeFactor), comparatif Autonomie vs Avec Lugia sur chaque chantier (D-037), backend V3-charte aligné (secretariat + protocole + scoring), persistance refresh complète (extras + resumeStep + URL ?step= + thème localStorage), Calendly branché, refonte 7 pages auxiliaires charte (login + compte + legal + confidentialite + le-checkup + notre-accompagnement + lugia), export PDF par chantier (reportlab), assistant Lugia chat 4 phases avec suggestions + plan d'action structuré + END_CONVERSATION (D-036), guide de relecture testeurs. Voir CHANGELOG 2026-05-22, D-036 à D-039. |
| **T-V3-pilote-visuel** | ⏳ Smoke test visuel global sur les 5 écrans clés (intro, blocs, transition, résultats, module) en Nuit et Jour, après tous les changements axes A-J. |
| **T-V3-responsive** | ⏳ Audit responsive mobile (INTRO_PROMISES collapse 480px, Topbar tightness ≤360px, smoke test à 375×667 et 320×568). Identifié en audit-final, reporté à post-charte. |

### Reste à faire — V3-brand

- Smoke test bout en bout V3-brand (parcours complet en mode persistant : refresh entre les étapes doit reprendre au bon endroit).
- Non-régression V2.0 + V1.1.9 (les 3 versions cohabitent — vérifier qu'on peut basculer librement entre les 3 cartes de l'accueil sans interférence).
- (Différé) Discussion autonome avec un assistant LLM en page résultats — nécessite un endpoint LLM backend qui n'existe pas encore. Capturé en ROADMAP.

### Chantiers éditoriaux complémentaires (parallèle technique)

1. **Passe rédactionnelle au filtre de la charte questionnaire** sur les 18 questions actuelles : appliquer le test OK/BAD (verbe au présent, sujet concret, conditionnel évité, phrase courte, fermée) ; reformulation au filet argent à gauche, Lora regular, sans jugement.
2. **Glossaire à privilégier / à éviter** du brand-master ajouté en `RESOURCES.md` ou nouveau `resources/v3_glossaire_marque.md` (vocabulaire OK : *travail réel, mettre en place, aller jusqu'au bout, clarifier, ce qui freine* ; vocabulaire NOK : *synergies, disruptif, stack, game-changer, capacitaire, verticales*).
3. **Phrases-types canoniques** (« Partir du réel. Traiter les causes. Aller jusqu'à la mise en place. ») à placer dans l'intro et la conclusion V3.

### Points à valider quand on codera

- Valeur hex précise de `--signal-warn` (ambre brûlé) : `#b5780a` vs `#c8851a` — test contraste sur navy `#1a2333` + ivoire `#f4efe5`.
- Mode jour / nuit : toggle utilisateur ou nuit-only ? Décision lors de T-V3-5.
- Inscription du token `--signal-warn` dans le brand-master (amendement à proposer à la direction com — niveau projet, non bloquant pour V3).

## V2.0 EN COURS — pilote rédactionnel avant intégration technique (19 mai 2026)

Refonte structurelle V2.0 amorcée (cf `DECISIONS.md` D-029). Séquence retenue par Sébastien le 19 mai : **pilote rédactionnel → intégration technique → sourcing benchmarks**.

### Livré aujourd'hui

| Sous-vague | Livré |
|---|---|
| V2.0-specs | `wireframes/checkup_v2_specs.md` v1.9 (~625 lignes) — cadrage complet |
| V2.0-wireframe | `wireframes/checkup_v2_wireframe.html` (~1300 lignes) — 9 écrans + switcher |
| V2.0-editorial | `resources/v2_editorial_draft.md` v1.0 (5 lots, 967 lignes) — 76 reformulations + 12 titres + 21 benchmarks + 7 modules + 13 règles |
| V2.0-pilote | `resources/v2_editorial_review_guide.md` v1.0 — guide pour 3-5 médecins testeurs |

### Reste à faire avant tag V2.0

> **Inversion de séquence — D-030 (2026-05-19) :** intégration technique d'abord, pilote sur le parcours en prod ensuite. Le guide de relecture reste envoyé en parallèle pour ne pas perdre la boucle critique sur le wording.

1. **Intégration technique V2.0 — EN COURS (7 sous-vagues)**

   | Sous-vague | Livrables |
   |---|---|
   | **V2.0-T1** | `resources/interview_protocol_v2.json` + `resources/diagnostics_v2.json` + `resources/modules_v2.json` extraits du brouillon |
   | **V2.0-T2** | `src/v2/scoring.py` (scoring V2.0 avec routing solo b1b/b3, seuils 35/55/78) + `src/v2/personalize.py` (13 règles + 6 signaux croisés) |
   | **V2.0-T3** | Migration BDD : champ `protocol_version` sur `interview` + dispatcher backend + Alembic |
   | **V2.0-T4** | Frontend Next.js V2 : `web/app/checkup/v2/page.tsx` + composants IntroV2, ProfilStep1, ProfilStep2, Energie, BlocQuestion, RadarAside, Transition, Resultats |
   | **V2.0-T5** | Page accueil 2 cartes (V1.1.9 / V2.0) + route `/protocol?version=v2` |
   | **V2.0-T6** | Migration prod + déploiement Vercel/Render + smoke test cohabitation |
   | **V2.0-T7** | Pilote terrain : envoi URL + guide adapté aux 3-5 médecins, retours sous 7-10 jours |

2. **Pilote rédactionnel en parallèle** (non bloquant)
   - Envoi de `resources/v2_editorial_draft.md` + `resources/v2_editorial_review_guide.md` à 3-5 médecins pendant que l'intégration technique avance.
   - Délai souhaité : 7 jours après envoi.
   - Centraliser les retours dans `resources/v2_editorial_reviews/` (un fichier par relecteur).
   - Produire `resources/v2_editorial_review_consolidation.md` synthétisant les 3 catégories : à corriger sans débat / à arbitrer / à documenter en limite assumée.
   - Appliquer la révision sur les fichiers JSON V2.0 **avant V2.0-T6** (mise en prod).

3. **Sourcing des 21 benchmarks** marqués `[À CONFIRMER]` (peut se faire en parallèle de l'intégration)
   - Sources cibles : DREES, CNAM, CMG, URPS, CPTS, ANS, CNOM, CNIL.
   - Remplacer la mention `[À CONFIRMER]` par la citation précise, ou retirer le benchmark.

4. **Brand kit Lugia** (passe finale, après V2.0-T6 et avant tag V2.0)
   - Application du brand kit (palette / typo / icônes) prévue par track Communication.
   - Découplage volontaire entre cycle fonctionnel V2.0 et cycle identitaire.

### Pistes V3/V6 reçues aujourd'hui — versées en ROADMAP

Notes externes `pistes_amelioration_v3.md` et `pistes_amelioration_v6.md` reçues. Idées au-delà du périmètre V2.0 versées en `ROADMAP.md` (V2.1+). Voir section dédiée du ROADMAP.

---

## V1.1.9 LIVRÉE — refonte apparence questionnaire + page résultats + enrichissement contexte (19 mai 2026)

Vague visuelle V1.1.9 livrée en 5 sous-vagues sur la journée du 19 mai. Voir `CHANGELOG.md` 2026-05-19 et `DECISIONS.md` D-028.

### Récap

| Sous-vague | Livré |
|---|---|
| V1.1.9-cadrage | `wireframes/checkup_v1_1_9_specs.md` (direction UI, périmètre contexte, critères d'acceptation) |
| V1.1.9-a | `wireframes/checkup_v1_1_9_wireframe.html` (5 écrans : intro / question A / transition / question B / fin) |
| V1.1.9-r | `wireframes/resultats_v1_1_9_wireframe.html` (hero ample, sections numérotées, pause narrative, opportunités narratives) |
| V1.1.9-c | Protocol JSON v1.10 (17 questions, Q15/Q16/Q17 ajoutées, Q01 réordonné, Q02 reformulé) + seed + sample_answers v2.5 |
| V1.1.9-b | Refonte Next.js questionnaire (4 nouveaux composants + refonte CheckupWidgets + refonte page.tsx) |
| V1.1.9-s | Refonte Next.js page résultats (sections numérotées I-IV, pause narrative, opportunités pleine largeur) |
| V1.1.9-d | Tests bout en bout : hash rapport identique à V1.1.8, cohérence MD/JSON OK, validation visuelle |
| V1.1.9-e | Journalisation (cette section + CHANGELOG + DECISIONS D-028 + ROADMAP) |

### Procédure de déploiement V1.1.9

```bash
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo

# Vérifier la cohérence locale
python scripts/seed_persona.py --email sebastien+test@gmail.com --reset
python3 src/questions.py  # → "OK — JSON et .md cohérents (17 questions)."

# Build frontend
cd web && npm run build

# Commit + push
git add -A
git commit -m "V1.1.9 : refonte UI questionnaire + page résultats + enrichissement contexte (Q15/Q16/Q17)"
git push origin main
```

Après push, Render rebuild auto (~3 min) puis Vercel rebuild auto (~2 min). **Pas de migration BDD à appliquer** — IDs Q01-Q14 strictement préservés, les nouvelles questions Q15/Q16/Q17 sont stockées comme les autres dans `answer`.

### Vérification post-déploiement sur `diagnostic.lugia.fr`

1. `/checkup?interview=...` : écran d'intro pédagogique avant Q01, indicateur segmenté par facette, cartes options retravaillées (check-mark + descriptions secondaires), pastille `✓ Enregistré` après chaque clic, raccourci Entrée fonctionnel.
2. Parcours complet : Q01 → Q02 → Q15 → Q16 → Q17 → Q03 → ... → Q14 → écran de fin.
3. `/resultats?interview=...` : hero serif 44px, sections numérotées I-IV en marge, synthèse en lead serif 22px, pause narrative beige avec guillemet décoratif, opportunités en cards pleine largeur avec numéro grand serif, carte Lugia recommandée en bleu + gradient.
4. Print (Cmd+P) : nav cachée, sections empilées, page-break-inside avoid sur les cartes opportunités.
5. Mobile (≤640px) : grids 3 cols → stacks verticaux, numéros romains en flow normal.

### Tag `v1.1.9` posable

Après vérification post-déploiement :

```bash
git tag -a v1.1.9 -m "V1.1.9 — refonte UI questionnaire + page résultats + enrichissement contexte"
git push origin v1.1.9
```

---

## V1.1.10 — REMPLACÉE par la mécanique chat A.2 v2 (D-043, 2026-05-26)

Les deux chantiers initialement prévus en V1.1.10 sont absorbés ailleurs :

1. **Path A approfondissement** : remplacé par la discussion LLM 4 phases (chat A.2 v2 — D-036 + D-040 + D-043). Déjà livré en prod sur V3-charte. Limité à 10 messages en Demo (D-044), étendu en Work System payant.
2. **Path B « En parler avec Lugia »** : Calendly câblé (D-037, livré). Le complément « répondre à une offre de conseil » (formulaire + lead email) est tracé en C.D du cap court terme — voir ROADMAP.

Plus rien à faire spécifiquement sous V1.1.10. Les chantiers actifs sont remontés sous le cap court terme du Checkup Demo (C.A → C.D dans ROADMAP).

## Cap court terme Checkup Demo — C.A à C.D

| Item | Statut | Description courte |
|---|---|---|
| **C.A — Schéma Mermaid simplifié du chantier** | ✅ livré (2026-05-27) | Deux niveaux : schéma WSF **statique** par chantier sur la page module (sans LLM), et schéma **enrichi** généré à la synthèse du chat (MERMAID_JSON) sous le plan d'action. Moteur WSF générique dans `web/lib/wsf/`. Compatible Claude + qwen WebLLM (7B + fallback 3B). |
| **C.B — Polish PDF chantier** | ✅ livré (2026-05-27) | Schéma WSF dessiné nativement en reportlab (`src/wsf_render.py`) sous le plan d'action du PDF, alimenté par le graphe enrichi du chat si dispo, sinon le graphe statique. |
| **C.C — Formaliser cross-sell Calendly** | ✅ déjà câblé | « En parler avec Lugia » via Calendly opérationnel (D-037). Tracking d'attribution à affiner si nécessaire. |
| **C.D — Formulaire de réponse à offre conseil** | ✅ livré (2026-05-27) | Composant `LeadConseilForm` en pied de chantier (ModuleV3) ET en fin de résultats (ResultatsV3). Endpoint `POST /interviews/{id}/conseil-lead` : stocke le lead (table `conseil_lead`) puis notifie Sébastien par email (Resend + fallback console, `reply_to` = médecin). Contexte profil + chantier joint. |

## Tests prospects — préalable à V1.2

Une fois V1.1.10 livrée (bloquants ci-dessus traités) : envoyer le démonstrateur à 3-5 médecins du réseau. Brief :
- *"Faites le check-up complet (~30 min). Notez ce qui parle, ce qui hérisse. Imaginez cliquer sur 'En parler avec Lugia' — le feriez-vous ?"*

Le retour qualitatif validera (ou pas) :
- La simplification 9→3 facettes (cf D-027 dette acquise)
- Le câblage Q06 (priorité de cascade)
- Le ton anti-consulting (audits V1.1.7-t et V1.1.8-a)
- Les ouvertures de phrase choc selon profil

**Ne pas attaquer V1.2 SLM tant que ce retour terrain n'a pas eu lieu.** Il pourrait obliger à rouvrir la richesse analytique (graphes Mermaid, 9 facettes en arrière-plan) plutôt qu'à empiler une couche LLM.

---

## V0 et V1 figées

- **V0** Streamlit local — figée 12-13 mai 2026, tag `v0-final`. On n'y touche plus.
- **V1** portage technique web — figée 13 mai 2026, tag `v1-final`. Accessible en prod sur `https://diagnostic.lugia.fr`.

---

## V1.1 LIVRÉE — méthodologique enrichi (15 mai 2026)

Itération sur le backlog des premiers retours utilisateurs (mai 2026). Cadre stratégique acté en D-020 (méthodologique enrichi en V1.1, SLM en V1.2). Sept vagues livrées en cascade dans la journée du 15 mai :

- **Vague 1** — quick wins éditoriaux et UX (Sébastien en autonomie, 14 mai).
- **Vague 2 lite** — nettoyage structurel du moteur de rapport (15 mai matin).
- **Vague 3** — refonte du questionnaire (Q2-Q11 + règles globales 4 options + Autre).
- **Vague 3.1a→f** — homogénéisation format mot-clé — détail, ton resserré, synthèse analytique, philosophie Lugia ancrée dans MASTER_PROMPT (4 axes + vision intégration).
- **Vague 3.1g→h** — corrections wording (Q06_b, Q07, Q05/Q09 "Par exemple :", phrase choc punchifiée, pattern 4 neutre solo, intro chantiers moins de gras).
- **Vague 3.1i** — pattern défaut adouci, fix espace JSX, allégement chantier IA, fix bug session Chateau.
- **Vague 3.1j** — gap axe 2 comblé (Q08 planifié + imprévu) et chaîne causale en synthèse (5 patterns).
- **Vague 3.1k** — scores en entiers visibles (plus de moyenne brute décimale).

Le check-up V1.1 est accessible en prod, méthodologique enrichi sans appel API tiers. ~32 fragments narratifs distincts (à comparer aux 50+ visés par D-020).

### Tag `v1.1` posable

Après les tests utilisateurs en cours et la validation finale en prod, poser :

```bash
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
git pull
git tag -a v1.1 -m "V1.1 — questionnaire et rapport méthodologique enrichi, après retours premiers prospects"
git push origin v1.1
```

---

## V1.1.7 LIVRÉE — voix "vous" + responsive + prénom médecin (16 mai 2026)

Itération sur V1.1.6 livrée le même jour, à partir des specs V3 (`wireframes/resultats_v2_specs.md`). 7 sous-vagues. Voir `CHANGELOG.md` 2026-05-16 V1.1.7 et `DECISIONS.md` D-026.

### Récap

| Sous-vague | Livré |
|---|---|
| V1.1.7-a | Backend prénom médecin : table user_profile + endpoints /me/profile |
| V1.1.7-b | Frontend : page /compte avec champ Prénom |
| V1.1.7-c | Hero V3 : H1 "Votre cabinet, vu de l'extérieur" + sous-titre "Dr X — résultats du Y" |
| V1.1.7-d | Callout voix "vous" (suppression "Lugia commence par...") + style discret |
| V1.1.7-e | 4 reformulations swot + phrase de transition avant Prochaine étape |
| V1.1.7-f | @media print + @media mobile (640px) |
| V1.1.7-g | Tests & journalisation (cette section) |

### Procédure de déploiement V1.1.7

1. Commit + push depuis machine locale. Render + Vercel rebuild automatiquement (~3 min).
2. Au démarrage Render, `init_db()` applique la nouvelle table user_profile (idempotent).
3. Vérification post-déploiement sur `diagnostic.lugia.fr` :
   - Aller sur `/compte`, saisir un prénom, enregistrer.
   - Vérifier `/resultats?interview=<id>` : H1 "Votre cabinet, vu de l'extérieur" + sous-titre "Dr {prénom} — résultats du {date}".
   - Callout entre angles et opportunités en voix "vous" (plus de "Lugia commence par...").
   - Phrase de transition "Vous avez vu les chantiers..." avant Prochaine étape.
   - Test impression : Cmd+P / Ctrl+P, vérifier que nav et footer disparaissent, grilles empilées.
   - Test mobile : réduire la fenêtre <640px, vérifier que les grids 3 cols deviennent des stacks verticaux.

```bash
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
git add CHANGELOG.md DECISIONS.md TODO.md ROADMAP.md \
        src/db.py src/templates.py src/swot.py \
        backend/main.py scripts/dump_report.py \
        web/lib/api.ts web/components/AppHeader.tsx \
        web/app/compte/page.tsx web/app/resultats/page.tsx web/app/globals.css
git commit -m "V1.1.7 : voix 'vous' sur le callout + responsive print/mobile + prénom médecin"
git push origin main
```

### Tag `v1.1.7` posable

```bash
git tag -a v1.1.7 -m "V1.1.7 — voix 'vous' sur le callout + responsive + prénom médecin"
git push origin v1.1.7
```

---

## V1.1.6 LIVRÉE — refonte UI page de résultats vers palette V2 (16 mai 2026)

Refonte visuelle complète selon les specs V2 (cf `wireframes/resultats_v2_specs.md` et `wireframes/resultats_v2_cible.pdf`). 6 sous-vagues livrées le 16 mai. Voir `CHANGELOG.md` 2026-05-16 V1.1.6 et `DECISIONS.md` D-025.

### Récap

| Sous-vague | Livré |
|---|---|
| V1.1.6-a | Structure & palette (nav, Hero, max-w-[840px], palette V2 sobre) |
| V1.1.6-b | Refonte facettes (badge asymétrique 1-2 muets / 3-4 colorés, tirets, séparateur fin) |
| V1.1.6-c | Refonte opportunités (numéro grand + 2 colonnes Situation/Action + À confirmer en pied) |
| V1.1.6-d | Refonte Prochaine étape (carte recommandée bleue mise en avant + boutons CTA) |
| V1.1.6-e | Tests & journalisation (cette section) |
| V1.1.6-f | Séparation recommandation italique en transition entre facettes et opportunités |

### Procédure de déploiement V1.1.6

1. Commit + push depuis machine locale. Render + Vercel rebuild automatiquement (~3 min).
2. Pas de migration BDD à appliquer (UI uniquement).
3. Vérification post-déploiement sur `diagnostic.lugia.fr` :
   - Nav avec logo Lugia gauche + email droite + bordure basse.
   - 3 cards facette côte à côte avec séparateurs naturels (gap 1px sur fond gris).
   - Badge "À surveiller" / "À risque" uniquement sur les facettes concernées.
   - Reco italique entre les facettes et les opportunités (pas dans la synthèse).
   - Cartes opportunités avec numéro grand + 2 colonnes.
   - Carte "Échanger avec Lugia" mise en avant en bleu sur Prochaine étape.

```bash
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
git add CHANGELOG.md DECISIONS.md TODO.md ROADMAP.md \
        src/templates.py backend/main.py scripts/dump_report.py \
        web/lib/api.ts web/components/AppHeader.tsx web/app/resultats/page.tsx web/app/globals.css \
        wireframes/resultats_v1_actuel.pdf wireframes/resultats_v2_cible.pdf wireframes/resultats_v2_specs.md
git commit -m "V1.1.6 : refonte UI page de résultats vers palette V2 sobre + reco italique en transition"
git push origin main
```

### Tag `v1.1.6` posable

Après vérification post-déploiement, poser :

```bash
git tag -a v1.1.6 -m "V1.1.6 — refonte UI page de résultats vers palette V2"
git push origin v1.1.6
```

---

## V1.1.5 LIVRÉE — niveaux qualitatifs + forces/risques + opportunités + prénom optionnel (16 mai 2026)

Refonte UI/méthodologique de la page de résultats. 10 sous-vagues livrées dans la journée du 16 mai (a, b, c, d, e, f, h, i, j, k — la lettre `g` est la journalisation finale). Voir `CHANGELOG.md` et `DECISIONS.md` D-023 + D-024.

### Récap

| Sous-vague | Livré |
|---|---|
| V1.1.5-a | Bug visuel alignement + intro chantiers raccourcie |
| V1.1.5-b | Mapping score → niveau qualitatif backend |
| V1.1.5-c | Module `src/swot.py` : 40 fragments Forces/Risques par option |
| V1.1.5-d | API `/report` expose niveau + forces/risques |
| V1.1.5-e | Refonte affichage facettes (badge niveau + barre + listes) |
| V1.1.5-f | Reframing chantiers en "opportunités d'action" |
| V1.1.5-g | Journalisation finale (cette entrée + CHANGELOG + DECISIONS + ROADMAP) |
| V1.1.5-h | 3 analyses chantiers enrichies métier |
| V1.1.5-i | Champ prénom optionnel (BDD + protocol + API + frontend + moteur + seed) |
| V1.1.5-j | Risque plancher dès niveau 2 + note confidentialité prénom + layout 3 colonnes |
| V1.1.5-k | Fusion 5 niveaux → 4 niveaux + forces personnalisées raccourcies |

### Procédure de déploiement V1.1.5

1. Commit + push depuis machine locale (Vercel + Render rebuildent automatiquement, ~3 min).
2. Au démarrage Render, `init_db()` applique automatiquement la migration `entity_name` (idempotente).
3. Vérification post-déploiement sur `diagnostic.lugia.fr` :
   - Page résultats avec un compte test → 3 cards facette en grid 3 colonnes, badge niveau + barre 4 segments + listes Points forts / Points de vigilance.
   - Questionnaire avec un compte test → input prénom optionnel apparaît sous Q02_a/b/c/other et Q07_b/c/d/other quand sélectionné.

```bash
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
git add CHANGELOG.md DECISIONS.md TODO.md ROADMAP.md \
        src/scoring.py src/swot.py src/templates.py src/workstreams.py src/db.py \
        backend/main.py scripts/dump_report.py scripts/seed_persona.py \
        resources/interview_protocol.json \
        web/lib/api.ts web/components/CheckupWidgets.tsx web/app/resultats/page.tsx
git commit -m "V1.1.5 : niveaux qualitatifs + forces/risques par facette + opportunités d'action + prénom optionnel"
git push origin main
```

### Tag `v1.1.5` posable

Après vérification post-déploiement, poser :

```bash
git tag -a v1.1.5 -m "V1.1.5 — niveaux qualitatifs + forces/risques + opportunités d'action + prénom optionnel"
git push origin v1.1.5
```

---

## Vague 2.2 LIVRÉE — multiplication des variantes méthodologiques (15 mai 2026)

Livrée en 5 sous-vagues dans la même journée que V1.1 Vague 3.1. Critère opérationnel atteint : *deux médecins du même profil ne reçoivent plus exactement la même phrase analytique*. Voir `DECISIONS.md` D-022 et `CHANGELOG.md` entrées 2.2.0 / 2.2a / 2.2b / 2.2c / 2.2d.

### Bilan final

| Section | Variantes finales | Nouvelles |
|---|---|---|
| Phrase choc (6 patterns × 4 variantes) | 24 | 18 |
| Recommandation italique (3 contextes × 1 variante) | 3 | 3 (réécrites concises métier, pas multipliées par choix : voir D-022) |
| Chaînes causales (5 patterns × 3 variantes) | 15 | 10 |
| Analyses chantier (7 contextes × 3 variantes) | 21 | 14 |
| **Total** | **63** | **45 nouvelles + 3 réécrites** |

Sortie strictement identique à V1.1 sur le chemin `interview_id=None` (V0 Streamlit figé sur `v0-final` non impacté). Sortie diversifiée à partir de l'appel API et `dump_report.py` qui passent maintenant `interview_id`.

### Reste à valider en local

Test bout en bout sur 5-10 profils distincts à passer côté machine de Sébastien :

```bash
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
source .venv/bin/activate

# Seed Chateau standard
python scripts/seed_persona.py --email sebastien+test@gmail.com --reset
python scripts/dump_report.py --list
python scripts/dump_report.py --id <id>   # rapport généré dans resources/sample_report.md

# Re-seed avec un autre email = autre interview_id = autre tirage
python scripts/seed_persona.py --email sebastien+test2@gmail.com
python scripts/dump_report.py --list
python scripts/dump_report.py --id <new_id> --out resources/sample_report_v2.md

# Diff visuel à l'œil : la phrase choc, la chaîne causale et l'analyse chantier doivent
# être différentes entre les deux rapports. La reco italique doit être identique.
diff resources/sample_report.md resources/sample_report_v2.md
```

Critères d'acceptation visuels :

- Sur 3 rapports d'un même profil (Chateau × 3 ids), la phrase choc, la chaîne causale et au moins 2 analyses chantier sur 3 sont différentes entre les rapports.
- La reco italique est identique aux 3 rapports d'un même contexte (`reco:ia_visible` ou `reco:descriptions` ou `reco:default`).
- Aucun rapport ne contient de phrase qui sonne plaquée, condescendante ou en doublon avec la phrase suivante.

### V1.2 SLM débloquée

Le socle de 63 fragments narratifs (dont 51 nouveaux) est posé. Voir `ROADMAP.md` V1.2 pour la suite : choix provider API cloud, conception `src/llm.py`, prompts par section avec few-shot V1.1 Vague 2.2.

---

## V1.2 PROCHAIN CHANTIER — SLM hybride

Cadré en D-020 (méthodologique enrichi comme socle, SLM en surcouche avec fallback systématique). À ouvrir dans une nouvelle conversation Claude dédiée (cf D-019).

À couvrir :

- Choix du provider API cloud pour prod (Anthropic Haiku par défaut, alternative Mistral Small).
- Test exploratoire Ollama local sur le MacBook Pro pour calibrer les prompts gratuitement.
- Conception du module `src/llm.py` ou intégration directe dans templates.py avec branchement conditionnel.
- Sélecteur de provider via variables d'environnement `MODEL_PROVIDER` et `LLM_ENABLED`.
- Génération dynamique des options de QCM selon Q01/Q02/Q07 (notamment Q10/Q11 adaptées au médecin solo), avec écran d'attente Lugia pédagogique pendant le calcul.
- Pondération de saillance des chaînes causales par SLM (voir Vague 3.1j + ROADMAP V1.2).
- Enjeux temporels sectoriels datés (`temporal_concerns.json`).
- Fallback systématique sur les templates V1.1 si SLM indisponible ou `LLM_ENABLED=0`.

Voir `ROADMAP.md` section V1.2 + V1.2+ pour le détail.

---

### Critère de fin V1.1

### Critère de fin V1.1

Une session de test avec Sébastien jouant le persona Chateau refondu produit un rapport perçu comme "analyse" et non "redite". Tag `v1.1` posable après cette validation. v1-final reste à poser en amont pour figer l'état pré-retours.

### Session dédiée à venir — combler le gap axe 2 (imprévus) et l'axe 1 (interdépendances)

Audit du parcours V1.1 Vague 3.1f vs les 4 axes Lugia (cf `MASTER_PROMPT.md` section 2) : le questionnaire est fidèle aux axes 1, 3, 4 mais a un gap clair sur l'axe 2 (imprévus et surcharges ponctuelles) et l'axe 1 (interdépendances rarement explicitées). À traiter dans une conversation Claude dédiée :

- **Q08 enrichie** : capter les deux dimensions (congés planifiés ET absence imprévue) dans le même QCM, ou la dédoubler en Q08a/Q08b. Le complément libre de Chateau le révèle déjà ("Une semaine d'arrêt non planifié, je ne sais pas comment je gérerais") — le QCM doit le sonder.
- **Chaîne causale nommée en synthèse** : `build_phrase_choc` ou `build_synthesis` doit pouvoir produire une formulation type "Votre débordement administratif (Q05) trouve sa source dans des canaux non régulés (Q04) et un cadre non formalisé (Q03)" au lieu de juxtaposer deux symptômes. Plus disruptif, plus fidèle à l'axe 1.

---

## V1.2 PRÉVUE après V1.1 — intégration SLM hybride

Cadrée en D-020. Architecture orchestration LLM avec fallback méthodologique systématique.

À préparer avant d'attaquer :

- Choix du provider API cloud pour prod (Anthropic Haiku par défaut).
- Test exploratoire Ollama en local sur MacBook Pro pour valider la qualité des prompts.
- Conception du module `src/llm.py` ou intégration directe dans `templates.py` avec branchement conditionnel.

---

## Tracks parallèles (cf. D-019)

Chaque track est traité dans sa propre conversation Claude, avec le prompt d'ouverture `meta/PROMPT_OUVERTURE.md`.

- **Démonstrateur technique** — cette conversation (V1.1, V1.2, V1.5, V2).
- **Communication** — identité visuelle, page `/qui-est-lugia` (rédactionnel), site marketing `lugia.fr`, slides.
- **Marché et clients** — V1-7 préparation (prospect Chateau identifié côté Sébastien), fiches prospects, étude de marché.
- **Opérationnel** — méthode, scoring avancé, templates de livrables clients.

---

## Vigilance opérationnelle continue

- **Postgres Render free tier** — expiration le **11 août 2026**. Bascule à prévoir avant cette date : plan Starter (~7$/mois) ou recréation + migration.
- **DPA à signer** côté Vercel, Render, Resend — gratuit, ~15 min par fournisseur, à régulariser avant tout contrat commercial.
- **Relecture juridique RGPD** — recommandée (200-500€) avant signature premier client payant.

---

## Outils de dev disponibles

```bash
# Seed persona Chateau pour ton email, idéal pour itérer sur le rapport
python scripts/seed_persona.py --email sebastien+test@gmail.com --reset

# Idem mais contre Postgres prod
DATABASE_URL='postgresql://...' python scripts/seed_persona.py --email sebastien+test@gmail.com --reset

# Dump du rapport généré pour comparer deux versions sans navigateur
python scripts/dump_report.py --list
python scripts/dump_report.py --id <N>
```

Documentation complète d'usage : `docs/seed_persona_usage.md`.

Convention `+test` pour distinguer tests prospects de vraies données en prod.


## Modélisations graphiques — suivi (2 juin 2026)

Architecture posée (D-047, spec `resources/vision/lugia_systeme_modelisations_graphiques.md`). Chantiers ouverts :

- ✅ **Protocole de saisie — démarrage à froid** : spécifié (`resources/vision/lugia_protocole_saisie.md` + proto `lugia_proto_demarrage_froid.html`). Restent ouverts : boucles de correction LLM, amorçage de la 1re verticale (échafaudage initial à la main), mesure de la qualité d'inférence, sondes non suggestives.
- **Règle d'agrégation de santé** (politique maillon-faible + pondération criticité) : à figer, conditionne l'honnêteté des vues macro.
- **Exigences de grammaire du BPMN** (gateways, événements, flux de messages) : éprouver les TypeObjet/TypeLiaison sans casser généricité ni élicitabilité.
- ✅ **Couche de mise en page** : parti pris posé (D-048, grammaire positionnelle, forme ruban/cellule) — `lugia_regles_representation.md` + proto `lugia_proto_representation_ruban.html`. Restent ouverts : algorithme de placement auto (graphe → layout), règle des branches du parcours, cellules denses (>8 objets), nommage de la forme.
- **Design des représentations** : itérer le ruban/cellule en session design (densifier, brancher, animer).
- **Réaligner `lugia_proto_capability_map.html`** sur la charte produit v2 (états bg/bd/couleur, angles vifs, Onest 500) — laissé en l'état pour l'instant.
- **Implémentation** : couche `web/lib/wsf/derive/*` (opérateurs) au-dessus de `types.ts` ; `render-mermaid.ts` devient un export figé parmi les vues.

