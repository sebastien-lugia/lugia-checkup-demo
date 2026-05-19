# CHANGELOG

Historique des modifications structurantes du projet, ordonnées par date décroissante.

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
