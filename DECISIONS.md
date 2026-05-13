# DECISIONS

Décisions structurantes du projet, journalisées avec leur motivation et les alternatives écartées.

Toute évolution de l'une de ces décisions doit être discutée et journalisée comme une nouvelle entrée datée, sans effacer l'historique.

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
