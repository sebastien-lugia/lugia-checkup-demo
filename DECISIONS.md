# DECISIONS

Décisions structurantes du projet, journalisées avec leur motivation et les alternatives écartées.

Toute évolution de l'une de ces décisions doit être discutée et journalisée comme une nouvelle entrée datée, sans effacer l'historique.

---

## D-021 — Refonte questionnaire V1.1 (Vague 3) : règles globales + dérogation à l'alternance

**Date :** 2026-05-15

**Décision :** Le questionnaire V1.1 est refondu (Q02 à Q11 hors Q07/Q10/Q12) selon cinq règles globales nouvelles, inscrites dans `resources/interview_protocol.md` section 1. Quatre options principales plus une option Autre (saisie inline), options factuelles ancrées dans des situations observables, options mutuellement exclusives, mise en scène d'une situation réelle quand c'est possible, et restriction des modes B et C aux questions où la réponse libre apporte un matériau verbatim irremplaçable. Trois questions changent de mode : Q04 et Q11 passent de Mode B à Mode A (doublon constaté entre réponse libre et QCM), Q06 passe de Mode C à Mode A (motivation traitable par QCM). Q01 conserve trois options principales en exception assumée (typologie close solo/groupe/MSP). La distribution de modes passe de 8 A / 4 B / 2 C en V1.0 à 11 A / 2 B / 1 C en V1.1.

**Pourquoi :** Premiers retours utilisateurs (mai 2026, backlog V1.1 Sébastien) sur trois questions : (a) les options de Q03 n'étaient pas exclusives, (b) la réponse libre de Q04 et Q11 faisait doublon avec le QCM, (c) plusieurs options reposaient sur des termes émotion-dépendants ("beaucoup", "souvent") qui dégradaient la reproductibilité de la lecture. Trois voies envisagées :

- Refonte mineure préservant tous les modes — rejetée : ne résolvait pas le doublon de Q04/Q11 ni la non-exclusivité de Q03.
- Passage en multi-sélection sur Q03 — rejeté : décision structurelle imposant migration BDD (`answer.option_id` actuellement scalaire), surcharge frontend (checkboxes), complication du scoring moyenne brute (pondération par nombre d'options ?), pour un bénéfice marginal puisqu'une réécriture exclusive des options résout le même besoin sans casser le schéma.
- Refonte structurelle avec règles globales — retenue : résout le doublon, l'exclusivité et la factualité en une passe, sans toucher au schéma BDD ni au moteur de scoring. Permet une trajectoire stable vers V1.2 (le questionnaire fiabilisé devient un meilleur substrat pour le SLM, voir D-020).

Le coût payé en compensation est la dégradation de l'alternance des modes (8 A / 4 B / 2 C → 11 A / 2 B / 1 C). Cette perte d'engagement par alternance est jugée acceptable parce que la cohérence factuelle des options apporte un gain perçu plus grand : le médecin se reconnaît mieux dans un libellé observable que dans un mode varié. Les retours V1.1 confirmeront ou infirmeront ce trade-off.

**Conséquence pour V1.1 :** `resources/interview_protocol.json` v1.3 réécrit pour les 8 questions concernées + ajout de la clé `global_rules_v1_1` (lisible mais non exploitée par le code, sert de documentation contractuelle). `resources/interview_protocol.md` v1.3 mis à jour avec la section "Règles globales V1.1", la nouvelle distribution et le nouveau tableau Chateau. `resources/sample_answers_pchateau.md` v2.0 réécrit avec quatre changements de réponse (Q06 q06_c, Q08 q08_d nouvelle sémantique, Q09 q09_d nouveau palier factuel, Q11 q11_c au lieu de q11_d). `scripts/seed_persona.py` aligné. `src/templates.py` corrigé sur Q08_d (suppression de la phrase "personne ne saurait", remplacée par "le cabinet ferme — solution retenue") et Q11_d (suppression de l'incident inventé "il y a quelques mois", remplacée par "tri au fil de l'eau, sans rythme garanti"). Aucun changement de schéma BDD, aucun ajout de dépendance, déploiement Render/Vercel inchangé.

**Conséquence pour V1.2 :** Le matériau verbatim de Q05 (récit concret du soir/weekend), Q13 (contexte d'usage IA) et Q14 (aspiration finale) reste le substrat principal de la couche SLM. La refonte V1.1 a précisément concentré le mode B/C sur ces trois questions, ce qui simplifie l'écriture des prompts SLM ultérieurs.

**Alternatives écartées :**

- *Passage en multi-sélection sur Q03* : décision structurelle disproportionnée pour un gain marginal — voir ci-dessus.
- *Conservation stricte de l'alternance A/B/C en V1.0* : impossible sans réintroduire les doublons libre/QCM que le backlog identifie comme un défaut structurel. La règle d'alternance reste un objectif souhaitable mais elle n'est pas un invariant non négociable.
- *Refonte complète du questionnaire (réécriture from scratch)* : trop coûteuse et peu justifiée — la structure V1.0 est saine sur 6 questions sur 14, seules 8 questions méritaient une refonte.
- *Multi-sélection ailleurs (Q07, Q12, Q13)* : non demandée par le backlog, prématurée.

---

## D-020 — Stratégie de génération du rapport : méthodologique enrichi puis SLM hybride

**Date :** 2026-05-14

**Décision :** Le moteur de génération du rapport (`src/templates.py`, `src/workstreams.py`) évolue en deux temps. En V1.1, refonte méthodologique pure : passer d'une dizaine à plus de 50 variantes par section, structure narrative renforcée (phrase choc révélatrice en synthèse, étape d'analyse explicite entre observation et proposition dans les chantiers), vulgarisation du jargon WSF en langage métier-médecin. En V1.2, ajout d'une couche SLM/LLM en surcouche, avec **fallback systématique** sur le templating en cas d'erreur, d'indisponibilité, ou de contrainte RGPD/confidentialité. Le méthodologique enrichi reste le socle, le SLM ajoute de la personnalisation contextuelle.

**Pourquoi :** Les retours utilisateurs de la première vague de tests (mai 2026, backlog V1.1) pointent un défaut structurel : le rapport décrit ses propres entrées (redite de l'entretien) au lieu de produire une analyse à valeur ajoutée. Trois voies envisagées (méthodologique pure, SLM pur, hybride) ; la voie hybride avec méthodologique enrichi comme socle a été retenue pour plusieurs raisons : (a) prépare la matière first-shot que le SLM utilisera ensuite, (b) garantit une disponibilité 100% même si SLM tombe, (c) reste auditeur et explicable (utile face à un médecin qui demande pourquoi telle conclusion), (d) découple la qualité produit de la dépendance API tierce, (e) évite que le défaut "rapport peu personnalisé" soit confondu avec un défaut SLM. La discipline « méthodologie d'abord, intelligence ensuite » respecte aussi l'ordre d'apprentissage : on ne peut pas calibrer un SLM sur un questionnaire mal ficelé.

**Conséquence pour V1.1 :** Refonte des templates pour atteindre 50+ variantes, refonte du questionnaire (Vague 3) pour fiabiliser les entrées avant SLM, structure narrative à 5 sections par chantier au lieu de 4 (observation → analyse → ce qui échappe → proposition → bénéfice), suppression des citations nominatives d'outils tiers (ChatGPT, Maiia, etc.), traduction du jargon WSF en langage métier. Aucun appel API tiers, aucune dépendance ajoutée, déploiement Render/Vercel inchangé.

**Conséquence pour V1.2 :** Architecture d'orchestration LLM à concevoir, avec sélecteur de provider (Ollama local en dev, API cloud type Anthropic Haiku en prod). Section de chaque rapport (synthèse, analyse facette, analyse chantier) générée via prompt structuré avec quelques few-shot examples issus de V1.1. Si l'appel LLM échoue ou si une variable d'environnement `LLM_ENABLED=0` est posée, fallback automatique sur les templates V1.1 sans dégradation perceptible. Coût opérationnel estimé : ~0.005-0.015€ par rapport en prod cloud, zéro en dev local.

**Conséquence architecturale plus large :** Le MacBook Pro de Sébastien équipé pour faire tourner Ollama est destiné au développement et à l'expérimentation des prompts. Pour la prod accessible à des prospects à distance via diagnostic.lugia.fr, l'inférence SLM tournera côté cloud API (option A privilégiée en V1.2). Une éventuelle bascule vers une architecture "Mac dédié serveur" ou "GPU cloud autohébergé" n'est pas exclue plus tard, mais n'est pas prioritaire.

**Note V1.1 — Q14 reportée à V1.2 :** En audit de Vague 2 lite (mai 2026), tentative d'intégrer la Q14 ("ce que vous aimeriez approfondir") dans la synthèse via heuristique textuelle pure (citation de la première phrase tronquée, blacklist de génériques). Approche rejetée : trop fragile, risque de produire un non-sens en conclusion du rapport. Décision : Q14 dort en base le temps de V1.1, sera traitée par le SLM en V1.2 (qui saura reformuler ou ignorer selon la qualité de la réponse). Les free_text Q14 deviendront un matériau-test idéal pour calibrer les prompts du SLM.

**Alternatives écartées :**

- **SLM/LLM dès V1.1** — risquerait de masquer la faiblesse du questionnaire actuel par de la fluence générative. Discipline : fiabiliser le socle avant d'ajouter de l'intelligence.
- **Templating pur sans SLM** — fonctionne mais limite la personnalisation à des combinatoires statiques, contrarie les ambitions V1.5 (pré-questionnaire psychologique, second questionnaire wow, multi-métier).
- **SLM en remplacement total du templating** — supprime le socle reproductible et auditable, expose à 100% aux pannes externes, complique le débogage.

---

## D-019 — Organisation multi-tracks et multi-conversations Claude

**Date :** 2026-05-13

**Décision :** Le projet Lugia n'est plus traité dans une conversation Claude unique mais découpé en 4 tracks parallèles, chacun avec sa propre conversation Claude au gré des chantiers. Tracks identifiés : Démonstrateur technique (le présent repo), Communication (identité visuelle, site marketing, slides), Marché et clients (étude marché, prospects, tests V1-7+), Opérationnel (méthode, livrables clients, scoring avancé). La mémoire transversale est portée par les fichiers `.md` à la racine du repo (MASTER_PROMPT, DECISIONS, ROADMAP, CHANGELOG, TODO). Les prompts d'ouverture sont versionnés dans `meta/PROMPT_OUVERTURE_<TRACK>.md`.

**Pourquoi :** Une conversation Claude saturée perd en qualité de réponse et mélange des modes mentaux incompatibles (debug technique vs rédaction marketing vs analyse prospect). La discipline documentaire déjà en place rend la séparation en plusieurs conversations soutenable sans perdre la cohérence du projet : chaque conversation lit le même socle de fichiers .md au démarrage. Cette organisation scale aussi naturellement vers V2 et au-delà, et permet à un chantier court (par exemple "rédaction page /qui-est-lugia") d'être traité dans une conversation focalisée puis close, sans polluer la conversation principale.

**Conséquence :** Le repo gagne un dossier `meta/` qui rassemble les 4 prompts d'ouverture standardisés. Avant chaque nouvelle conversation Claude, le prompt correspondant est collé en premier message. Les livrables produits dans chaque conversation sont consolidés dans les fichiers .md du repo avant clôture. Quand un track grandit, un sous-dossier dédié (communication/, marche/, operations/) peut être créé avec son propre INSTRUCTIONS.md.

**Alternatives écartées :**

- Une seule conversation Claude pour tout — perte de finesse rapide, pollution croisée, difficile à reprendre après pause.
- Une conversation par track sans rotation — la durée de vie d'une conversation reste limitée même au sein d'un track ; mieux vaut une conversation par chantier qu'une conversation longue par track.
- Repos GitHub séparés (lugia-tech, lugia-business, lugia-content) — prématuré tant que le projet est en phase démonstrateur. À envisager en V2.

---

## D-018 — RGPD minimale intégrée à V1, pas à V2

**Date :** 2026-05-13

**Décision :** Intégrer un socle RGPD minimal dès la V1 (avant le tag `v1-final` initialement prévu après V1-6), plutôt que de différer l'intégralité du sujet à V2. Périmètre retenu : mentions légales `/legal`, politique de confidentialité `/confidentialite`, footer commun, droit à l'effacement (`DELETE /me` côté API + page `/compte` côté frontend). Hors périmètre V1 : DPA signés avec sous-traitants, bandeau cookies (non requis tant qu'on n'utilise que localStorage technique), export de données (à voir si demandé). Auth permanente avec mot de passe reste différée à V2.

**Pourquoi :** Un test V1-7 face à un médecin prospect impose un minimum de défendabilité. Sans mentions légales, sans politique de confidentialité, sans droit à l'effacement opérationnel, le produit n'est pas présentable en l'état à un professionnel qui regardera le footer et les CGU avant tout. Reporter à V2 reviendrait à présenter une démo "indéfendable" — risque de braquage du prospect ou de signalement CNIL si l'usage devient même informel. Le coût en temps de développement est faible (4 fichiers nouveaux + 2 modifiés côté frontend, 1 endpoint côté backend) ; le coût d'opportunité est élevé.

**Conséquence :** Responsable du traitement déclaré comme **personne physique** (Sébastien Boncoeur, particulier) tant que la société n'est pas constituée. Contact RGPD : sebastien@lugia.fr. Sous-traitants mentionnés sans DPA signés (Vercel, Render, Resend) — à régulariser dans la foulée, possible avant V2. Avant tout test client en condition réelle, une relecture rapide par un avocat RGPD est conseillée (200-500€) — non bloquant pour V1-7 informel mais à prévoir avant un premier contrat commercial.

**Alternatives écartées :**

- Reporter intégralement à V2 — risque de braquage des prospects.
- Niveau "avancé" (DPA, bandeau cookies, export portabilité) — coût trop élevé pour V1, plus-value marginale en pré-commercial.
- Sous-traiter la rédaction des mentions à un avocat — différerait V1-7 de plusieurs semaines, non justifié au stade démonstrateur.

---

## D-001 — Positionnement Lugia : substitution-extension

**Date :** 2026-05-12

**Décision :** Lugia ne se positionne pas comme un outil supplémentaire à apprendre, mais comme la substitution d'un usage existant (IA générative grand public non sécurisée) par une interface conforme au secret médical. Cette interface se prolonge progressivement en hub de suivi de l'organisation.

**Pourquoi :** Le travail sur le persona Dr Chateau a révélé une réalité forte chez les médecins-cibles : ils n'ont pas besoin d'un énième outil, ils ont besoin de temps et de sécurité sur ce qu'ils font déjà. Le positionnement "outil de plus" serait perçu comme une charge supplémentaire et rejeté.

**Alternatives écartées :** positionnement "outil de check-up générique" (déjà saturé sur le marché), positionnement "outil d'audit" (anxiogène, technocratique).

---

## D-002 — Périmètre V0 : trois facettes WSF prioritaires

**Date :** 2026-05-12

**Décision :** La V0 du démonstrateur traite uniquement trois facettes WSF — **Processus & Activités**, **Participants**, **Information**. Les six autres facettes sont reportées en V1.

**Pourquoi :** Les trois facettes retenues correspondent au noyau interne du WSF (entièrement sous la responsabilité du cabinet) et sont les plus parlantes pour un médecin. Cela permet une V0 réellement démontrable sans diluer la qualité.

**Alternatives écartées :** V0 sur les 9 facettes (trop lourde, dilution garantie), V0 sur une seule facette (insuffisamment démonstrative).

---

## D-003 — Patient = Client en V0

**Date :** 2026-05-12

**Décision :** Dans la modélisation V0, les patients sont toujours traités comme "Clients" au sens WSF, et non comme "Participants" même quand ils participent ponctuellement aux activités (examen, recueil d'information).

**Pourquoi :** Simplification de l'ontologie pour la V0. La nuance "patient = participant ponctuel" est défendue par Steven Alter mais alourdit le modèle sans gain immédiat pour le démonstrateur.

**Alternatives écartées :** double catégorisation Client + Participant ponctuel — reportée en V1+.

---

## D-004 — Périmètre cible : cabinets de 1 à 5 médecins +/- secrétariat

**Date :** 2026-05-12

**Décision :** Le démonstrateur cible les cabinets de 1 à 5 médecins, avec ou sans secrétariat (interne ou externalisé). Les MSP de grande taille sont reportées en V1+.

**Pourquoi :** Le WSF est conçu pour des systèmes opérationnels de taille modérée. Au-delà de 5 médecins, le cabinet devient une organisation à plusieurs systèmes imbriqués, ce qui dépasse le scope du démonstrateur et nécessite une analyse multi-systèmes.

**Alternatives écartées :** périmètre étendu aux MSP de grande taille dès la V0 (complexité non maîtrisable), périmètre restreint au cabinet solo uniquement (insuffisamment représentatif).

---

## D-005 — Durée cible du check-up : 45 minutes

**Date :** 2026-05-12

**Décision :** La promesse du démonstrateur est de produire une première lecture en 45 minutes, et non 20 comme initialement envisagé.

**Pourquoi :** La richesse du questionnaire (qualification, signaux faibles, antécédents, trois facettes V0 puis neuf en V1, exemples concrets demandés) rendait la promesse de 20 minutes irréaliste. Le passage à 45 minutes permet un check-up substantiel sans bâclage. Le mécanisme de réponses pré-rédigées à partir de la mi-questionnaire compense partiellement l'effort de saisie.

**Alternatives écartées :** maintenir 20 minutes au prix d'un questionnaire bâclé, ou monter à 60 minutes au risque de perdre le médecin.

---

## D-006 — Persona unique pour les tests : Dr Philippe Chateau

**Date :** 2026-05-12

**Décision :** Un unique persona médecin est utilisé pour les tests locaux de la V0 — le Dr Philippe Chateau, 55 ans, médecin libéral solo à Saint-Mandé, ancien marathonien, en charge familiale lourde suite à la maladie de sa femme.

**Pourquoi :** Un persona contrasté (forces apparentes massives, fragilités cachées profondes, événement personnel récent) sert mieux le démonstrateur qu'un persona moyen. Il permet de tester la capacité du produit à révéler ce qu'on ne voit pas, et offre un meilleur cas commercial pour Lugia. Voir `resources/persona_medecin_pchateau.md`.

**Alternatives écartées :** plusieurs personas (trop lourd pour la V0), persona générique (insuffisamment instructif), persona "fatigué qui se plaint" (cas trop facile, peu différenciant).

---

## D-007 — Trois modes d'interaction du questionnaire

**Date :** 2026-05-12

**Décision :** Le questionnaire alterne trois modes d'interaction. **Mode A** (QCM pur) pour les questions à spectre fini connu. **Mode B** (Hybride, par défaut) avec réponse libre courte puis relance QCM puis complément optionnel. **Mode C** (Ouvert pur) pour les questions à forte valeur narrative ou sensibles, limité à trois ou quatre questions dans tout le parcours.

**Pourquoi :** Réduit l'hallucination du LLM (les options QCM sont pré-taggées avec leur facette, type de nœud, sévérité), améliore la reproductibilité (deux passages produisent le même modèle structurel), réduit le coût cognitif du médecin (clics au lieu de paragraphes). Le principe d'alternance maintient l'engagement et donne au médecin l'impression d'être écouté sur son vécu unique.

**Alternatives écartées :** QCM pur (perte de texture pour le rapport, biais d'ancrage), réponse libre pure (hallucination LLM, coût cognitif), mode hybride sans alternance (sensation de formulaire générique).

---

## D-008 — Workflow design : artefact d'abord, Streamlit ensuite

**Date :** 2026-05-12

**Décision :** Avant de coder une page Streamlit, un wireframe React ou HTML est produit en artefact Claude et validé visuellement. Streamlit n'intervient qu'après validation visuelle.

**Pourquoi :** Évite le piège du "je code en Streamlit, je n'aime pas le résultat, je recommence". Réduit le coût d'itération sur l'UX. Le wireframe artefact est rapide à produire et à modifier.

**Alternatives écartées :** coder directement en Streamlit (coûteux à itérer), recourir à Figma ou autre outil de design (rupture dans le flow de travail avec Claude).

---

## D-009 — Stratégie LLM : règles déterministes prioritaires, LLM encadré

**Date :** 2026-05-12

**Décision :** Le démonstrateur s'appuie en priorité sur des règles déterministes inscrites dans les fichiers `.md`. Le LLM intervient uniquement là où aucune règle ne peut décider. Tout appel LLM a un schéma JSON de sortie strict, des exemples few-shot dans le `.md` correspondant, une validation post-LLM côté code, et une température comprise entre 0 et 0,2.

**Pourquoi :** Maximise la reproductibilité, réduit drastiquement le risque d'hallucination, rend le démonstrateur démontrable en démo (résultats stables d'une exécution à l'autre).

**Alternatives écartées :** LLM-first (risque d'hallucination, incohérence d'une exécution à l'autre, démonstrabilité dégradée), règles déterministes uniquement (rigidité, pas d'adaptabilité au texte libre).

---

## D-010 — Sample report généré par session réelle, pas pré-écrit

**Date :** 2026-05-12

**Décision :** Le fichier `resources/sample_report.md` n'est pas rédigé en amont. Il sera généré par le démonstrateur lui-même à l'issue de la première session complète jouée avec le persona Dr Chateau (Phase V0-5).

**Pourquoi :** Évite le piège du "rapport rêvé qui ne correspond à rien d'atteignable techniquement". Le rapport réel produit par le démonstrateur sert ensuite d'oracle pour les itérations.

**Alternatives écartées :** rédiger le rapport idéal en amont (risque de viser une cible inatteignable et de diverger silencieusement).

---

## D-011 — Cinq phases V0 (et non douze)

**Date :** 2026-05-12

**Décision :** La V0 est découpée en cinq phases : V0-1 wireframes, V0-2 squelette Streamlit + SQLite, V0-3 interview Modes A/B/C, V0-4 scoring et restitution, V0-5 test bout en bout avec le persona. Les phases 1 à 12 du document d'origine sont soit fusionnées, soit reportées en V1.

**Pourquoi :** Le découpage en 12 phases incluait des phases V1+ qui auraient dilué la V0. Cinq phases V0 plus extension progressive en V1 est plus tenable et lisible.

---

## D-012 — `MASTER_PROMPT.md` à la racine du projet

**Date :** 2026-05-12

**Décision :** Le fichier `MASTER_PROMPT.md` est placé à la racine du projet, et non dans `resources/`.

**Pourquoi :** C'est un fichier méta du projet, à lire en premier par tout assistant IA qui ouvre le dépôt. Sa place à la racine signale ce statut.

**Alternatives écartées :** placer dans `resources/` (perdrait son statut de fichier de cadrage prioritaire), placer dans un dossier `meta/` (sur-ingénierie pour un projet de cette taille).

---

## D-013 — Scoring : justifiabilité mathématique non négociable

**Date :** 2026-05-12

**Décision :** Le score produit par le démonstrateur doit être mathématiquement justifiable à tout moment. Si un utilisateur demande "pourquoi 6 sur 10 ?", on doit pouvoir lui montrer le détail du calcul — quelles questions, quelles options choisies, et la contribution de chacune à la facette concernée.

En V0, le calcul est volontairement simple : moyenne brute des scores santé des options sélectionnées dans chaque facette. Le détail est **recalculable à la volée** à partir de la table `answer` (pas de stockage redondant en V0). Un encart "détail de votre score" sur la page de résultats est différé en V1.

Une pondération calibrée par benchmarking entre pairs (cohortes anonymisées de professionnels du même secteur) est différée en V1+, quand la maturité du produit le permettra.

**Pourquoi :** Le scoring est au cœur de la valeur du démonstrateur. Sans transparence et justifiabilité, le médecin ne peut pas faire confiance à la lecture proposée. La simplicité du calcul V0 est un trade-off assumé : il vaut mieux un score simple et défendable qu'un score sophistiqué et opaque. La pondération viendra progressivement, calibrée par échanges avec plusieurs professionnels du même secteur, lorsque la base de données de répondants atteindra une taille suffisante.

**Alternatives écartées :** scoring boîte noire calculé par LLM (impossible à expliquer mathématiquement), pondération a priori sans validation empirique (risque d'arbitraire), stockage de scores agrégés sans détail (perte de la justifiabilité).

---

## D-014 — Format canonique des questions du questionnaire : JSON

**Date :** 2026-05-12

**Décision :** Les données structurées du questionnaire V0 vivent dans `resources/interview_protocol.json` (source de vérité technique). Le fichier `resources/interview_protocol.md` reste la documentation humaine et est tenu à jour manuellement. Le module `src/questions.py` est un loader minimal qui lit le JSON, et expose une fonction `check_md_json_consistency()` qui vérifie au démarrage que les IDs des questions et le compte sont alignés entre les deux fichiers.

**Pourquoi :** Le format JSON est strictement typé, stdlib-parseable, et accessible à un éditeur non développeur. Il scale mieux que Python dict-as-data quand le nombre de questions augmente (V1 visera plusieurs dizaines de questions). Le retro-test au démarrage évite la dette de divergence silencieuse entre les deux représentations.

**Alternatives écartées :** Python dict (`src/questions.py` comme source) — plus simple à l'écriture mais mélange code et données, scale moins bien, et accessible seulement aux développeurs. Parseur Markdown du `.md` — overkill pour la V0, fragile au format. YAML — ajouterait une dépendance (PyYAML) sans bénéfice net face au JSON pour la V0.

---

## D-015 — Promesse revue : "moins de 30 minutes" en V0

**Date :** 2026-05-13

**Décision :** La promesse du démonstrateur est révisée à **"En moins de 30 minutes, Lugia aide un médecin à répondre à la question : où en est réellement mon cabinet aujourd'hui ?"**. La valeur précédente de 45 minutes (voir D-005) est obsolète pour la V0 mais conservée en archive historique.

**Pourquoi :** Trois évolutions cumulées ont réduit la durée effective du questionnaire :
- Extension du Mode A pour porter un complément optionnel (la majorité des questions sont désormais en Mode A).
- Conversion de plusieurs Mode B en Mode A+complément (Q08, Q10, Q13 en v1.1).
- Suppression de Q05 (Canal principal de rendez-vous), redondante avec Q04.

Le test utilisateur en mode parcours rapide donne 8 minutes pour les 14 questions, ce qui place la durée pour un répondant qui réfléchit à environ 15-25 minutes. La promesse "moins de 30 minutes" est tenable, plus crédible, et constitue un argument commercial plus fort qu'un check-up de 45 minutes.

**Alternatives écartées :** maintenir 45 minutes (n'est plus réaliste depuis la simplification du parcours), passer à 20 minutes (potentiellement trop court pour un médecin qui prend vraiment le temps de répondre — risque d'attente déçue).

---

## D-016 — Limites assumées du scoring V0 et trajectoire V1+

**Date :** 2026-05-13

**Décision :** Le scoring V0 (moyenne brute pure, voir D-013) est conscient de ses cinq limites structurelles : effet de compensation, absence de hiérarchie, dilution par le nombre, invisibilité des signaux faibles, injustice contextuelle pour les petites structures. Ces limites sont documentées explicitement dans `modeling_scoring.md` section 7.

Pour le démonstrateur V0, ces limites sont **assumées et partiellement compensées** par la narration : les templates de synthèse et de chantiers foregroundent les Red Flags critiques (usage IA non conforme, dépendance personnelle, flux parallèles). La compensation est éditoriale, pas structurelle.

La trajectoire V1+ est documentée dans `ROADMAP.md` section dédiée "Scoring V1+". Elle comporte cinq mécanismes : pondération avec conditions, scores planchers (K.O. critère), système de Flags critiques, Cartouche de Diagnostic, architecture multi-secteur.

**Pourquoi :** D-013 a établi le principe de justifiabilité mathématique non négociable. L'erreur initiale aurait été d'identifier "justifiable mathématiquement" avec "moyenne brute". Une moyenne pondérée avec conditions est tout aussi justifiable — la justification consiste à expliciter chaque poids et chaque règle plancher. La simplicité de la moyenne brute reste acceptable comme point de départ V0, mais la conscience explicite de ses limites est nécessaire pour ne pas en faire un standard pérenne.

**Alternatives écartées :** introduire dès la V0 un système de Flags critiques ou de scores planchers (complexifie significativement V0, mieux vaut un V0 simple mais conscient qu'un V0 partiellement sophistiqué). Renoncer à la moyenne brute pour V0 et passer directement à la pondération (prématuré, pondérations non calibrées sans données de pairs).

---

## D-017 — Cadrage V1 : portage technique pur, découpage V1 / V1.5 / V2, choix architecturaux

**Date :** 2026-05-13

**Décision :**

**Périmètre V1.** V1 = portage technique pur de V0 vers une architecture web distante, à isofonctionnel. Aucune nouvelle fonctionnalité méthodologique en V1. Mêmes 3 facettes, mêmes 14 questions, mêmes 3 chantiers, même rapport. La seule valeur ajoutée de V1 est l'accès distant via `diagnostic.lugia.fr` avec auth par lien magique.

**Découpage V1 / V1.5 / V2.**
- V1 = portage technique pur (15-18 sessions estimées).
- V1.5 = extensions méthodologiques après V1 stable (extension 9 facettes, animations pyramide, section "Vos mots", export PDF). 12-15 sessions.
- V2 = montée commerciale (auth moderne, conformité RGPD complète, pricing actif, multi-session).

**Choix architecturaux V1 :**
- Frontend Next.js (TypeScript, Tailwind, Framer Motion à venir en V1.5).
- Backend Python FastAPI réutilisant intégralement les modules `src/*` de V0.
- Base Postgres (migration depuis SQLite).
- Hosting : Vercel (frontend) + Render (backend + Postgres).
- DNS OVH avec CNAME `diagnostic.lugia.fr` vers Vercel.
- Auth lien magique par email via Resend.
- Conformité V1 : minimale (test, prospects volontaires, pas de données patient). Conformité complète en V2.
- Pricing : décision différée à V1-4 ou V1-5.

**Pourquoi :** Trois raisons interdépendantes.

D'abord, **éviter le "fourre-tout V1"**. Un V1 qui mélange portage technique et extension méthodologique multiplie les risques et allonge le délai avant le premier test client réel. Découpler les deux laisse le portage tech se stabiliser avant d'ajouter de la complexité produit.

Ensuite, **Next.js plutôt que Streamlit étendu** parce que les animations sur la pyramide WSF (prévues V1.5) et la qualité de rendu visuel attendue par un client payant excèdent ce que Streamlit produit naturellement. Migrer maintenant évite une réécriture forcée plus tard. Le code métier (`src/scoring`, `src/templates`, `src/workstreams`) est réutilisé tel quel — l'effort se concentre sur la couche présentation.

Enfin, **Vercel + Render plutôt que VPS OVH dédié** parce que l'hébergement OVH actuel est mutualisé (Free Hosting, sans Node ni Python). Vercel + Render offrent des free tiers suffisants pour la phase test et un chemin de paiement raisonnable (~15-20€/mois) pour la phase commerciale. Migration vers OVH possible en V2 si l'usage le justifie.

**Alternatives écartées :**

- *Streamlit étendu pour V1* : faisable mais limité visuellement, et oblige à une réécriture en V2. Mauvais investissement temporel.
- *V1 = portage + extensions méthodologiques en même temps* : V1 fourre-tout, risque de délai et de qualité dégradée. Le découpage V1/V1.5 évite ce piège.
- *VPS OVH dédié dès V1* : hébergement actuel est mutualisé Free Hosting, ne supporte pas Node/Python/Postgres. Migrer vers un VPS est possible mais ajoute du setup infra qui n'apporte pas de valeur produit en phase test.
- *Auth complète V1 (compte permanent, mot de passe, OAuth)* : disproportionné pour un test commercial initial. Le lien magique est suffisant et plus simple à implémenter.

---

*Modèle d'entrée à respecter pour les futures décisions : identifiant D-NNN, titre court, date, décision, pourquoi, alternatives écartées.*
