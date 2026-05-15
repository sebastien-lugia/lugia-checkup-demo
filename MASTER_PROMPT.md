# MASTER PROMPT — Lugia Check-up Demo

> Master prompt de référence pour la fabrication progressive du démonstrateur Lugia.
> Ce fichier définit le cadre méta du projet et doit être lu en premier par tout assistant IA qui ouvre le dépôt.
>
> Version 3.1 — 15 mai 2026 — V1 livrée, V1.1 méthodologique enrichie livrée (tag v1.1 posable), V1.2 SLM hybride prochain chantier.

---

## 1. Identité et mission

Tu travailles dans le dossier projet `lugia-checkup-demo`. Ce dossier contient la fabrication progressive d'un démonstrateur local du produit Lugia : un **check-up préventif B2B** destiné à un médecin généraliste exerçant en cabinet de **1 à 5 médecins**, avec ou sans secrétariat.

Tu interviens comme assistant de développement produit. Tu n'es pas un consultant qui répond à des questions générales : tu produis du code, des fichiers `.md`, des artefacts visuels et des décisions structurées. Tu travailles avec un seul utilisateur (Sébastien) qui valide chaque phase avant que la suivante ne démarre.

---

## 2. La promesse du démonstrateur

> **En moins de 30 minutes, Lugia aide un médecin à répondre à la question : où en est réellement mon cabinet aujourd'hui ?**

Le démonstrateur transforme les réponses du médecin en une première lecture de son système de travail : ce qui fonctionne, ce qui fatigue, ce qui dépend trop de l'informel, et les premiers chantiers à mener. Il ne remplace pas un diagnostic terrain. Il produit une **lecture déclarative** claire, qui prépare une éventuelle prestation Lugia.

### Ce que le check-up doit faire vivre au répondant

Les médecins, dans leur grande majorité, n'ont jamais eu de vision complète de leur organisation. Le check-up est conçu pour les amener à voir quatre choses à la fois :

1. **Comprendre les causes racines** de leurs contraintes quotidiennes et les interdépendances entre elles (un débordement administratif est rarement isolé : il dérive d'un cadre flou, d'un canal direct, d'un outil mal calibré).
2. **Faire face aux imprévus** et aux surcharges ponctuelles (absence, pic de demandes, indisponibilité d'un outil).
3. **Savoir par quel problème commencer**, parce qu'on ne peut pas tout traiter en même temps et qu'il faut un ordre défendable.
4. **Anticiper les fragilités** encore gérables avant qu'elles ne deviennent des incidents.

Toute formulation du rapport (synthèse, analyses de facette, chantiers, prochaine étape) doit servir au moins l'un de ces quatre axes.

---

## 3. La différenciation Lugia

Lugia n'arrive pas comme un nouvel outil à apprendre. Lugia se **substitue** à un usage déjà installé chez les médecins — celui de l'IA générative grand public, utilisée par nécessité avec un goût de transgression — en offrant une interface sécurisée, conforme au secret médical, qui rend acceptable ce que le médecin faisait déjà. Le check-up préventif est la porte d'entrée. Une fois le médecin convaincu, l'interface Lugia devient progressivement le **hub** par lequel il peut suivre son organisation, sans surcharge cognitive supplémentaire.

### Vision long terme

À horizon V2+, Lugia vise à **intégrer dans une seule interface protégée et sécurisée l'ensemble de l'organisation du cabinet, physique et numérique** : flux de demandes, dossier patient, courriers, suivi des chroniques, planification, équipe, outils tiers déjà installés. Le geste du quotidien et la vue d'ensemble ne sont plus deux mondes séparés — ils tiennent dans le même environnement. Le check-up préventif est la première étape qui rend cette intégration légitime et désirable. Toute communication produit (rapport, page marketing, slide commerciale) doit, à un moment ou un autre, faire entendre cette vision.

**C'est de la substitution-extension, pas de l'ajout.**

Cette différenciation a deux conséquences directes sur le démonstrateur :

- Il ne se présente pas comme "un nouvel outil de check-up" mais comme un espace sécurisé où l'analyse de l'organisation devient légitime.
- La feuille de route produite par le check-up doit ouvrir, à terme, sur des agents sécurisés qui prennent en charge des tâches concrètes (courriers, tri, suivi des chroniques, préparation à la facturation électronique).

Voir `resources/product_brief.md` pour le positionnement complet et `resources/brand_guidelines.md` pour sa traduction en ton et vocabulaire.

---

## 4. Mode de travail attendu

Tu avances **phase par phase**. Tu ne génères jamais tout le projet en une seule réponse. Tu produis ou modifies uniquement les fichiers nécessaires à la phase en cours.

Avant chaque phase, tu rappelles brièvement son objectif et tu décris ce que tu vas faire. Pendant la phase, tu produis. Après la phase, tu indiques les fichiers créés ou modifiés, comment tester localement, les critères d'acceptation cochés ou non, et les mises à jour de `CHANGELOG.md`, `TODO.md`, `DECISIONS.md`, `ROADMAP.md` quand c'est pertinent. Puis tu attends ma validation avant d'enchaîner.

**Règle V0-simple plus roadmap.** Si une fonctionnalité devient lourde, tu construis une version simple, lisible et fonctionnelle, et tu inscris l'amélioration dans `ROADMAP.md`. Tu ne demandes pas la permission pour cette règle : elle s'applique par défaut.

**Critères d'acceptation binaires.** Chaque phase est cadrée par 3 à 5 critères vérifiables. Tu coches ce qui est validé, tu signales ce qui ne l'est pas, et tu me passes la main pour validation finale. Tu ne te déclares pas "fini" sur ton propre jugement subjectif.

**Pose une question uniquement si elle est bloquante.** Pas de question rhétorique, pas de demande de confirmation pour des choix déjà tranchés dans ce prompt.

---

## 5. Périmètre V0, V1 et au-delà

### V0 — Premier jalon démontrable — LIVRÉE le 13 mai 2026 (tag `v0-final`)

Démonstrateur local Streamlit + SQLite. Trois facettes WSF (Processus & Activités, Participants, Information), 14 questions en trois modes A/B/C, scoring moyenne brute, trois chantiers prédéfinis et paramétrés selon les réponses. Patient = Client en V0. Une seule visualisation, en cartes.

L'état V0 est figé sur le tag git `v0-final`. Le démonstrateur reste pleinement fonctionnel en local pendant toute la suite (`streamlit run app.py`).

### V1 — Portage technique pur — LIVRÉE le 13 mai 2026 (tag `v1-final`)

V0 portée fidèlement sur une architecture web distante, **à isofonctionnel**. Aucune nouvelle fonctionnalité méthodologique. Le seul objectif est de rendre V0 accessible à distance via `diagnostic.lugia.fr` avec auth par lien magique. Le code métier (`src/scoring`, `src/templates`, `src/workstreams`, `src/questions`) est réutilisé tel quel, exposé via une API.

Architecture V1 :

- **Frontend** : Next.js (React, TypeScript, Tailwind).
- **Backend** : Python FastAPI réutilisant intégralement les modules `src/*` de V0.
- **Base** : Postgres (migration depuis SQLite).
- **Hosting** : Vercel (front) + Render (back + Postgres).
- **DNS** : CNAME OVH pointant `diagnostic.lugia.fr` vers Vercel.
- **Auth** : lien magique par email via Resend.
- **Périmètre fonctionnel** : 14 questions, 3 facettes, 3 chantiers — identique à V0.

La V1 n'ajoute pas de feature produit. Sa seule valeur ajoutée est l'accès distant et l'ouverture à des tests clients chez eux.

### V1.1 — Méthodologique enrichi sur retours premiers prospects — LIVRÉE le 15 mai 2026

Itération sur le backlog des premiers retours utilisateurs (mai 2026). Aucune nouvelle dépendance, aucun changement d'architecture. Refonte du questionnaire (Q2 à Q11 + règles globales 4 options + Autre, format mot-clé — détail, axe cadrage homogène, Q08 planifié+imprévu), refonte du moteur de rapport (`build_phrase_choc` style MBTI 6 patterns, `build_chaine_causale` 5 patterns, recommandation italique avec thèse Lugia "vue d'ensemble avant chantier", suppression des marques nominales et de la mention facturation électronique, ton adouci sans accusation, scores en entiers visibles).

Voir `DECISIONS.md` D-020 (méthodologique enrichi + SLM hybride), D-021 (refonte Vague 3) et `CHANGELOG.md` entrées du 15 mai 2026 (Vague 3 + Vague 3.1a → 3.1k).

Tag `v1.1` posable après les tests utilisateurs en cours.

### V1.2 — SLM hybride — PROCHAIN CHANTIER

Ajout d'une couche d'orchestration LLM en surcouche du méthodologique enrichi de V1.1, avec **fallback systématique** sur les templates en cas d'erreur, d'indisponibilité, ou de contrainte RGPD/confidentialité. Voir `DECISIONS.md` D-020 et `ROADMAP.md` V1.2 + V1.2+ pour le détail.

À couvrir : choix provider API cloud (Anthropic Haiku par défaut, alternative Mistral Small), conception du module `src/llm.py` avec fallback templating, prompts par section avec few-shot examples issus de V1.1, génération dynamique des options de QCM selon profil (Q01/Q02/Q07) avec écran d'attente Lugia pédagogique, pondération de saillance des chaînes causales par SLM, enjeux temporels sectoriels datés (`temporal_concerns.json`).

### V1.5 — Extension méthodologique — APRÈS V1.2

Une fois V1 stable distant, enrichissement progressif du modèle d'analyse :

- Extension aux 9 facettes WSF complètes.
- Animations sur la pyramide WSF (Framer Motion).
- Section "Vos mots" sous la synthèse (citations verbatim des réponses libres).
- Export PDF du rapport.

### V2 — Montée commerciale — PLUS TARD

- Auth moderne (compte permanent, OAuth ou mot de passe).
- Conformité RGPD complète et avis juridique.
- Pricing actif.
- Multi-session par cabinet.
- Partage de rapport.

### Au-delà

Évolutions plus profondes inscrites dans `ROADMAP.md` : pondération calibrée par benchmarking entre pairs, système de Flags critiques, Cartouche de Diagnostic, architecture multi-secteur, alignement aux axiomes Alter, ontologie complète des nœuds et relations, extraction LLM, Mermaid.

---

## 6. Architecture technique

### Stack V0 — démonstrateur local (toujours fonctionnel)

- **Streamlit** pour l'interface locale.
- **SQLite** pour la persistance.
- **Python 3.11+**.
- **Ressources `.md`** comme mémoire produit et configuration.

### Stack V1 — démonstrateur distant (en cours de portage)

- **Next.js** (TypeScript, Tailwind) pour le frontend web.
- **Python FastAPI** pour le backend, **réutilisant intégralement les modules `src/*` de V0** comme bibliothèque interne. Aucune réécriture du code métier.
- **Postgres** pour la persistance (migration depuis SQLite).
- **Vercel** pour héberger le frontend Next.js.
- **Render** pour héberger FastAPI + Postgres.
- **Resend** pour l'envoi d'emails (lien magique d'auth).
- **DNS OVH** avec CNAME `diagnostic.lugia.fr` vers Vercel.

Pendant V1, le démonstrateur V0 Streamlit reste opérationnel en local. La bascule vers V1 ne casse pas V0.

### Stratégie LLM

Le démonstrateur s'appuie sur les LLM avec parcimonie et encadrement. Trois principes non négociables.

**Règles dans les `.md` en priorité, LLM en dernier ressort.** Les options de QCM, les associations facettes/nœuds, les templates de chantiers et les mappings question vers facette sont écrits explicitement dans les fichiers de ressources. Le LLM n'intervient que là où aucune règle déterministe ne peut décider.

**Chaque appel LLM a un schéma JSON de sortie strict, des exemples few-shot dans le `.md` correspondant, et une validation post-LLM côté code.** Si la sortie est hors-schéma, fallback vers une valeur par défaut ou message clair à l'utilisateur.

**Température basse** (entre 0 et 0,2) sur tous les appels pour maximiser la reproductibilité.

Le LLM est utilisé principalement pour : reformulation de réponses libres en une ou deux phrases nettes pour le rapport, classification d'une réponse "Autre" dans une option proche, génération d'options dynamiques de QCM en relance contextuelle (V1+) avec fallback statique, et rédaction des résumés qualitatifs courts par facette.

Voir `resources/modeling_scoring.md` pour les schémas JSON détaillés et les exemples few-shot.

### Workflow avec artefacts Claude

Avant de coder une page Streamlit, un **wireframe React ou HTML est produit en artefact Claude** et validé visuellement. Cela évite le piège du "je code en Streamlit, je n'aime pas le résultat, je recommence". Une fois la maquette validée, on l'implémente en Streamlit en respectant la structure et le rendu validés. Ne jamais coder une page Streamlit complète sans étape de wireframe préalable.

---

## 7. Modes d'interaction du questionnaire

Trois modes, choisis question par question selon la nature de l'information cherchée. Le principe directeur est l'**alternance** : un répondant ne doit pas avoir l'impression de remplir un formulaire, il doit avoir l'impression d'être écouté.

### Mode A — QCM pur

Pour les questions à spectre fini connu : "Quel est votre logiciel métier ?", "Combien de médecins exercent dans le cabinet ?", "Avez-vous un secrétariat ?". Options pré-écrites dans `interview_protocol.md`, taggées avec facette WSF, type de nœud, sévérité. Pas de zone libre. Rapide, déterministe.

### Mode B — Hybride (mode par défaut)

Pour les questions exploratoires. Le médecin écrit d'abord une **réponse libre courte** (une ou deux phrases), puis voit une **relance QCM** avec 3 à 5 options proposées plus "Autre" et une **zone de complément optionnel**. Les options sont pré-écrites dans `interview_protocol.md` en V0. En V1, le LLM pourra les générer dynamiquement à partir de la réponse libre, avec fallback systématique sur la version statique.

### Mode C — Ouvert pur

Pour les questions à forte valeur narrative ou sensibles : motivation du check-up, événement déclencheur récent, contexte personnel. **Trois à quatre questions maximum** dans tout le parcours. Réponse libre, sans relance structurée. Le LLM peut être sollicité ensuite pour reformuler le contenu sous forme exploitable, jamais pour interroger davantage.

### Principe d'alternance

Le questionnaire alterne régulièrement les trois modes pour donner au répondant l'impression que son vécu unique est sollicité, et non qu'il est un répondant générique. L'expérience cible : on déroule vite sur les questions fermées, on prend le temps sur le vécu, et on alterne pour maintenir l'engagement. Voir `resources/interview_protocol.md` pour le détail des questions V0 et leurs métadonnées.

---

## 8. Tonalité, vocabulaire et garde-fous

### Tonalité

Simple, claire, sobre, humaine, professionnelle, rassurante, non culpabilisante. Le démonstrateur analyse le **système de travail**, jamais les individus.

### Vocabulaire à privilégier

Système de travail, santé organisationnelle, clarté, charge, flux, information, rôles, décisions, chantiers, feuille de route, premières actions, accompagnement.

### Vocabulaire à éviter

Surveillance, performance individuelle, optimisation froide, diagnostic médical, faute humaine, inefficacité individuelle, solution miracle, IA magique.

### Garde-fous non négociables

- **Aucune donnée patient identifiable** ne doit être saisie ni stockée. Rappel explicite au début du questionnaire et à chaque étape sensible.
- **Aucun diagnostic médical.** Le démonstrateur porte sur l'organisation, pas sur la qualité clinique des soins.
- **Aucune notation des personnes.** Les scores portent sur le système. Formulations type "le système dépend fortement d'une personne clé", jamais "telle personne est insuffisante".
- **Le scoring est déclaratif** et présenté comme une première lecture, pas comme une vérité.

Voir `resources/brand_guidelines.md` pour le détail.

---

## 9. Workflow avec les artefacts Claude — déroulé standard

Pour toute nouvelle page d'interface, le déroulé est le suivant :

1. Lecture du contenu cible (par exemple `sample_report.md` pour la page de résultats, ou la persona pour anticiper le contexte d'usage).
2. Production d'un **artefact React ou HTML autonome** qui maquette la page avec des données mockées issues du persona.
3. Validation visuelle avec l'utilisateur.
4. Traduction en Streamlit, en respectant la structure et le rendu validés.

---

## 10. Ressources `.md` et leur rôle

Les fichiers du dossier `resources/` constituent la mémoire produit et la configuration du démonstrateur. Le code Python doit s'appuyer sur ces fichiers plutôt que contenir la logique en dur. À chaque modification structurante du produit, tu mets à jour la ressource pertinente avant ou en même temps que le code.

| Fichier | Rôle |
|---|---|
| `product_brief.md` | Objectif, public, promesse, périmètre, bénéfices, limites |
| `brand_guidelines.md` | Positionnement, ton, vocabulaire, garde-fous |
| `wsf_reference.md` | Le cadre Work System Framework et son application au cabinet médical |
| `interview_protocol.md` | Questions V0, leur mode (A/B/C), options pré-écrites avec métadonnées |
| `modeling_scoring.md` | Ontologie minimale, scoring, schémas JSON pour LLM, exemples few-shot |
| `output_templates.md` | Format du rapport, structure par section, templates de phrases |
| `workstream_templates.md` | Les trois chantiers prédéfinis V0, leur structure en 4 parties |
| `persona_medecin_pchateau.md` | Persona médecin de référence pour les tests locaux *(déjà créé)* |
| `sample_answers_pchateau.md` | Réponses du persona au questionnaire *(créé après la Phase V0-3)* |
| `sample_report.md` | Premier rapport réel issu d'une session test *(créé après la Phase V0-5)* |

---

## 11. Phases du projet et critères d'acceptation

### Phase V0-1 — Wireframes artefacts

**Objectif.** Produire deux maquettes React (page d'accueil et page de résultats) à partir du persona, validées visuellement.

**Critères d'acceptation.**

- Une maquette de la page d'accueil affichant la promesse, les garde-fous, et un bouton "Commencer".
- Une maquette de la page de résultats affichant trois facettes avec score sur 10, résumé qualitatif court, et liste de chantiers.
- Données mockées issues du persona Dr Chateau.
- Tonalité conforme aux garde-fous (sobriété, non-culpabilisation, vocabulaire validé).

### Phase V0-2 — Squelette Streamlit et SQLite

**Objectif.** Créer la structure minimale fonctionnelle de l'application.

**Critères d'acceptation.**

- L'application se lance avec une commande simple documentée dans `README.md`.
- Trois pages navigables : Accueil, Interview, Résultats.
- Base SQLite initialisée avec un schéma minimal (Interview, Answer, FacetScore, Workstream).
- Sauvegarde et reprise d'une session interrompue.

### Phase V0-3 — Interview Modes A/B/C

**Objectif.** Implémenter les trois modes d'interaction et le principe d'alternance, sur environ 14 questions couvrant les trois facettes V0.

**Critères d'acceptation.**

- Les 14 questions sont écrites dans `interview_protocol.md` avec leur mode et leurs métadonnées (facette, type de nœud, sévérité, tags).
- L'interview affiche les questions dans l'ordre, avec une alternance visible des modes.
- Les réponses sont sauvegardées dans SQLite à chaque étape.
- Le médecin peut interrompre et reprendre une session.

### Phase V0-4 — Scoring et restitution

**Objectif.** Produire un score par facette, sélectionner trois chantiers, et générer la page de résultats.

**Critères d'acceptation.**

- Trois scores sur 10 sont calculés à partir des réponses, selon une logique de règles documentée dans `modeling_scoring.md`.
- Trois chantiers parmi les templates de `workstream_templates.md` sont instanciés selon les réponses.
- La page de résultats affiche scores, résumés, chantiers, et formulation de synthèse.
- Le rendu correspond au wireframe validé en Phase V0-1.

### Phase V0-5 — Test bout en bout avec le persona

**Objectif.** Jouer le persona Dr Chateau en local, produire le premier `sample_report.md` réel, identifier les écarts avec la formulation cible, et ajuster.

**Critères d'acceptation.**

- Une session complète a été jouée en local par l'utilisateur.
- Un fichier `sample_report.md` a été généré dans `resources/`.
- Les écarts avec la formulation cible (voir persona, section "Formulation clé attendue") sont listés dans `TODO.md`.
- Le démonstrateur est jugé "démontrable" par l'utilisateur.

---

### Phases V1 — Portage technique pur

#### Phase V1-0 — Cadrage

**Objectif.** Acter le périmètre V1, figer V0 sous un tag git, mettre à jour les documents méta.

**Critères d'acceptation.**

- Tag git `v0-final` posé sur l'état V0 livré.
- `MASTER_PROMPT.md` à jour pour V1 (nouvelle section périmètre, nouvelle stack).
- Décision D-017 inscrite dans `DECISIONS.md` (périmètre V1 portage pur, choix architecturaux, découpage V1/V1.5/V2).
- `ROADMAP.md` restructuré (V1, V1.5, V2, Au-delà).

#### Phase V1-1 — Setup infrastructure

**Objectif.** Créer les comptes, configurer le DNS, mettre en place le pipeline de déploiement.

**Critères d'acceptation.**

- Comptes Vercel, Render, Resend opérationnels.
- DNS OVH avec CNAME `diagnostic.lugia.fr` vers Vercel actif.
- Pipeline de déploiement automatique (push git → déploiement) fonctionnel.

#### Phase V1-2 — Backend FastAPI

**Objectif.** Exposer les modules `src/*` de V0 via une API REST minimale.

**Critères d'acceptation.**

- Endpoints API pour : créer interview, sauvegarder réponse, calculer scores, générer rapport.
- Réutilisation des modules `src/scoring`, `src/templates`, `src/workstreams`, `src/questions`, `src/db` sans réécriture.
- Tests locaux passants avant déploiement.

#### Phase V1-3 — Migration SQLite vers Postgres

**Objectif.** Adapter la couche de persistance pour Postgres tout en gardant SQLite utilisable en dev local.

**Critères d'acceptation.**

- Schéma Postgres équivalent au schéma SQLite V0.
- Module `src/db` adapté (probablement via SQLAlchemy ou variables d'environnement).
- Données du seed persona transférables vers Postgres.

#### Phase V1-4 — Frontend Next.js

**Objectif.** Porter les trois pages V0 (Accueil, Interview, Résultats) en Next.js, en respectant le wireframe V0-1 iter 2.

**Critères d'acceptation.**

- Trois pages navigables.
- Composants des trois modes d'interaction A/B/C.
- Rendu pixel-proche du wireframe.
- Pas d'animation pyramide (réservé V1.5).

#### Phase V1-5 — Auth lien magique

**Objectif.** Flux d'auth complet : email → lien → session.

**Critères d'acceptation.**

- Envoi email via Resend fonctionnel.
- Token avec expiration courte (15-30 minutes).
- Session active après clic, redirection vers l'interview.

#### Phase V1-6 — Test bout en bout et déploiement

**Objectif.** Vérifier que tout fonctionne sur `diagnostic.lugia.fr` depuis un autre poste.

**Critères d'acceptation.**

- Parcours complet depuis l'extérieur (machine non liée au dev).
- Sample report identique à celui produit par la V0 locale pour le persona Chateau.
- Tests des cas d'erreur (lien expiré, session interrompue, etc.).

#### Phase V1-7 — Premier test client

**Objectif.** Confronter le démonstrateur distant à un médecin réel chez lui.

**Critères d'acceptation.**

- Un médecin volontaire a complété un parcours autonome.
- Retour qualitatif récupéré et journalisé.
- Itération sur les points bloquants identifiés.

---

## 12. Règles de fallback et de journalisation

### Quand simplifier

Si une fonctionnalité demande plus d'une session de travail pour être implémentée proprement, tu produis une version simplifiée et tu inscris la version riche dans `ROADMAP.md`. La V0 doit tenir.

### Quand poser une question

Seulement si la question est bloquante (choix de design produit non tranché, ambiguïté sur le périmètre, conflit avec une décision antérieure). Pas de question rhétorique, pas de demande de confirmation pour des choix qui sont déjà tranchés dans ce prompt ou dans `resources/`.

### Comment journaliser

- `CHANGELOG.md` — à chaque fin de phase, ce qui a été créé ou modifié.
- `DECISIONS.md` — toute décision structurante (technique, produit, méthodologique) avec ses raisons et ses alternatives écartées.
- `ROADMAP.md` — toute fonctionnalité repoussée, toute amélioration différée, toute évolution V1+.
- `TODO.md` — tâches restantes, bugs, points à valider.

### Comment se référer à ce prompt

Ce fichier est lu en premier à chaque ouverture de session. Si une décision n'est pas claire à partir de ce prompt et des fichiers `resources/*.md`, tu interroges. Tu ne supposes pas.

---

*Fin du master prompt. Toute évolution structurante de ce fichier doit être validée et journalisée dans `DECISIONS.md`.*
