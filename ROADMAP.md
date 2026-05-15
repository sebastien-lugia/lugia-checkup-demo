# ROADMAP

Trajectoire du projet structurée en quatre jalons : V0 livré, V1 en cours (portage technique pur), V1.5 (extensions méthodologiques), V2 (montée commerciale), et Au-delà (visions long terme).

> Restructuration majeure le 13 mai 2026 suite à D-017 (cadrage V1 portage pur).

---

## V0 — LIVRÉE le 13 mai 2026

Démonstrateur local Streamlit + SQLite. Tag git `v0-final`. Voir `CHANGELOG.md` pour le détail des phases V0-1 à V0-5.

---

## V1 — Portage technique pur — EN COURS

Migration V0 vers Next.js + FastAPI + Postgres, accessible à distance via `diagnostic.lugia.fr`. **Aucune nouvelle fonctionnalité produit.** Voir `DECISIONS.md` D-017 et `MASTER_PROMPT.md` sections 5, 6, 11.

Phases :

- V1-0 Cadrage
- V1-1 Setup infrastructure (Vercel + Render + Resend + DNS OVH)
- V1-2 Backend FastAPI
- V1-3 Migration SQLite vers Postgres
- V1-4 Frontend Next.js (trois pages portées fidèlement)
- V1-5 Auth lien magique
- V1-6 Test bout en bout et déploiement
- V1-7 Premier test client

---

## V1.1 — Itération sur retours premiers prospects — EN COURS

Première vague de retours utilisateurs reçue en mai 2026 (cf backlog V1.1 produit par Sébastien). 40+ retours répartis sur en-tête, page de login, accueil, questionnaire, page de résultats, prochaine étape. Refonte structurée en 3 vagues :

- **Vague 1 — Quick wins éditoriaux et UX** : ~12 corrections de wording, confirmation à la déconnexion, format "Autre" éditable inline. 1-2 jours.
- **Vague 2 — Méthodologique enrichi (50+ variantes)** : refonte de `src/templates.py` et `src/workstreams.py` pour produire une analyse à valeur ajoutée et non une redite de l'entretien. Phrase choc révélatrice en synthèse, structure chantier à 5 sections (observation → analyse → ce qui échappe → proposition → bénéfice), suppression des citations nominatives d'outils tiers, vulgarisation jargon WSF en langage métier-médecin. 3-5 jours.
- **Vague 3 — Refonte du questionnaire** : LIVRÉE 2026-05-15 (D-021). 8 questions refondues, règles globales inscrites, distribution de modes passée de 8 A / 4 B / 2 C à 11 A / 2 B / 1 C. Reste validation utilisateur avant tag `v1.1`.

Aucun ajout de dépendance, aucun appel API tiers. Reste 100% sur Render/Vercel/Postgres existants.

Voir `DECISIONS.md` D-020 pour le cadrage de fond (méthodologique enrichi comme socle avant SLM en V1.2).

---

## V1.2 — Intégration SLM/LLM hybride — APRÈS V1.1

Ajout d'une couche d'orchestration LLM en surcouche du méthodologique enrichi de V1.1, avec fallback systématique. Cible : faire passer le rapport de "templating combinatoire 50+ variantes" à "génération contextualisée par section" (synthèse, analyse facettes, analyse chantiers).

Architecture envisagée :

- **Dev** : Ollama local sur MacBook Pro de Sébastien, expérimentation gratuite des prompts.
- **Prod** : API cloud bon marché (Anthropic Haiku, Mistral Small, ou équivalent), ~0.005-0.015€/rapport.
- **Sélecteur** : variable d'environnement `MODEL_PROVIDER` (ollama|anthropic|...) et `LLM_ENABLED` (0/1) pour basculer sans modifier le code.
- **Fallback** : sur erreur LLM, indisponibilité, ou `LLM_ENABLED=0`, retour automatique aux templates V1.1.

Travail prévu :
- Choix du provider API cloud pour prod et signature des conditions.
- Architecture d'orchestration côté `backend/main.py` ou nouveau module `src/llm.py`.
- Rédaction des prompts par section avec few-shot examples issus de V1.1.
- Tests A/B en interne sur Chateau persona refondu : rapport templated V1.1 vs rapport LLM-augmenté V1.2.
- Mise à jour `MASTER_PROMPT.md` section 6 (architecture).

Voir `DECISIONS.md` D-020.

---

## V1.5 — Extension méthodologique — APRÈS V1.2

Tout ce qui était initialement prévu en "V1" dans la roadmap précédente glisse ici, à exécuter une fois V1.1+V1.2 stables distants.

## V2 — Montée commerciale — PLUS TARD

Conformité RGPD complète, auth moderne, pricing actif, multi-session, partage de rapport, etc.

## Au-delà — Visions long terme

Tout ce qui était inscrit en "V1+" reste pertinent à plus long terme.

---

## V1.5 — Marche suivante après V1 portage

### Extension du modèle d'analyse

- Extension aux **9 facettes WSF** complètes (V0 : 3 facettes seulement).
- Ajout des **6 constantes transversales** (service rendu, information utile, décisions claires, charge soutenable, règles et apprentissages, capacité à changer).
- Patient = Client + Participant ponctuel selon contexte (V0 : Client uniquement).
- Inspection des **antécédents organisationnels** (changements récents, ce qui a tenu, ce qui a échoué).
- Recherche structurée des **signaux faibles** (fragilités encore gérables mais déjà visibles).
- **Approfondissement des questions par facette** : fréquence d'usage des outils, satisfaction perçue, ancienneté des dispositifs, durée moyenne des tâches. La V0 a fait le choix explicite de la **largeur** (15 questions sur 3 facettes) plutôt que de la **profondeur** (voir `DECISIONS.md` D-002).

### Extraction et structuration

- **Extraction de nœuds via LLM** avec schémas JSON et validation post-LLM (V0 : nœuds candidats pré-écrits dans les QCM).
- Mise en place des **13 types de nœuds** (Acteur, Besoin, Service, Activité, Information, Outil, Contrainte, Ressource, Objectif, Symptôme, Cause, Risque, Chantier).
- Mise en place des **13 types de relations** entre nœuds (utilise, réalise, produit, transmet, dépend de, bloque, ralentit, sature, cause, aggrave, réduit, améliore, risque de provoquer).
- **Génération dynamique des options de QCM** en Mode B par le LLM, avec fallback statique systématique.

### Visualisation

- **Pyramide WSF interactive**, d'abord en cartes sélectionnables, puis en SVG responsive.
- **Vues Mermaid** : vue d'ensemble, vue de fonctionnement, vue diagnostic, vue de transformation.
- Nœuds cliquables dans les graphes Mermaid, ou fallback sidebar avec sélection.

### Pré-questionnaire psychologique pour adaptation du ton

- **Identification du profil émotionnel du répondant** avant le check-up principal : désespéré (à encourager), confiant à tort (à respectueusement provoquer), curieux sans urgence (à intriguer). 3-5 questions courtes en entrée. Modifie ensuite le ton de génération du rapport (paramètre de prompt en V1.2+, paramètre de sélection de templates en méthodologique). Découle d'une observation utilisateur en V1-7 : la même réponse au questionnaire ne doit pas produire le même rapport selon l'état psychologique du répondant.

### Second questionnaire d'approfondissement (effet wow)

- **Questionnaire d'approfondissement par chantier**, accessible après le check-up principal. Logique commerciale : 1 chantier en libre-service gratuit (effet de découverte), 3 chantiers payants (modèle commercial V2). Au-delà du contenu textuel approfondi, l'effet wow vient de la **présentation visuelle augmentée** : export PDF, dessin organisationnel du cabinet, pyramide WSF visuelle, analyse dynamique des cohérences entre facettes. À développer en environnement de test (Vercel preview deployments) avant déploiement prod.

### Restitution

- **Diagnostic synthétique formulé** selon la formule "Le cabinet présente une fragilité de [famille], située principalement dans [facettes WSF], visible à travers [symptômes]...".
- **Génération contextuelle de chantiers** par LLM, au-delà des trois templates prédéfinis de la V0.
- **Encart "détail de votre score"** sur la page de résultats : décomposition transparente question par question, contribution de chaque option choisie au score de la facette. Garantie de la justifiabilité mathématique (voir `DECISIONS.md` D-013).
- **Section "Vos mots"** dans le rapport : encart sous la synthèse qui cite verbatim les réponses libres du médecin (Mode B et Mode C). Le médecin se reconnaît immédiatement parce que ses propres mots apparaissent dans le rapport, indépendamment de la génération templated. Compense la limite V0 où les réponses textuelles sont stockées en base mais peu intégrées au rendu final. Reste pertinent en V1 avec LLM (le LLM produit la synthèse, "Vos mots" garde une fonction d'ancrage textuel direct).
- **Export PDF** du rapport final, respectant les principes de design Lugia (sobre, clair, professionnel).

### Design et expérience utilisateur

- Améliorations design de l'interface Streamlit (CSS personnalisé, typographie, hiérarchie visuelle, cartes, espaces blancs).
- Iconographie sobre et lisible.
- Mode d'affichage adapté à un médecin en mobilité (responsive).
- Mécanisme d'arrêt-reprise plus fin (sauvegarde de l'état d'avancement, reprise par section).
- **Sommaire / outline du questionnaire visible** au répondant pendant l'interview (par exemple "Partie 1 : votre cabinet · Partie 2 : votre flux · Partie 3 : votre équipe · Partie 4 : votre information · Partie 5 : conclusion"), pour donner le sens du chemin parcouru et restant.

### Pré-remplissage automatique du questionnaire

- **Génération de réponses à partir d'un contexte client externe** : à partir d'un document fourni par le client (transcription d'entretien vocal, brief Word, prise de notes), le démonstrateur utilise un LLM pour extraire les réponses aux 14 questions et pré-remplir le questionnaire. Le médecin valide ensuite chaque réponse à son rythme. Évite la barrière de saisie initiale et accélère la production d'un check-up. Le script V0 `scripts/seed_persona.py` est l'ancêtre minimal de ce mécanisme.

### Rendu visuel

- **Rapprochement Streamlit ↔ wireframe** : le rendu Streamlit V0 n'atteint pas la finesse du wireframe HTML (bullets natifs plus gros, largeur de contenu différente, marges imposées). Des surcharges CSS plus poussées peuvent rapprocher les deux rendus.
- **Migration vers React ou Next.js** pour un rendu pixel-perfect aligné sur les wireframes. Inscrit comme objectif quand la maturité du produit le justifiera (probablement après les premières prestations payantes).

### Affinage des questions

- **Refinement des formulations métier au contact des premiers clients** : la V0 fixe une base raisonnable, mais chaque entretien réel doit alimenter une révision continue du wording.
- **Affinage de Q09 (dépendance à votre présence)** : formulation plus précise sur ce qu'est "se mettre à l'arrêt", typologie des arrêts (planifié court, planifié long, imprévu).
- **Approfondissement du canal principal de rendez-vous** : la V0 a supprimé l'ancienne Q05 sur le canal dominant car redondante avec Q04 (flux entrant). Une question plus distinctive sur la profondeur de l'usage du canal principal (pourcentage des RDV qui y passent, satisfaction, friction) pourrait être réintroduite en V1 avec un angle complémentaire à Q04.

---

## V2 et au-delà — Évolutions plus lointaines

### Profondeur méthodologique

- **Alignement explicite** des 6 constantes avec les 5 catégories d'**axiomes de Steven Alter** (System in Context, System Operation, Goal Attainment, Operational Variability, System Change).
- Intégration du **Work System Life Cycle Model** (WSLC) pour situer le cabinet dans son cycle (initiation, développement, implémentation, opération/maintenance).
- Prise en compte des changements **planifiés vs non planifiés** (workarounds, adaptations informelles, comportements de compensation).

### Scoring V1+ — vers une moyenne pondérée avec conditions et Flags

Cette section trace l'évolution du scoring pour traiter les cinq limites structurelles documentées dans `modeling_scoring.md` section 7 (effet de compensation, absence de hiérarchie, dilution par le nombre, invisibilité des signaux faibles, injustice contextuelle).

**Pondération avec conditions.** Multiplier le score des questions critiques (sécurité, suivi patient, conformité réglementaire) par un coefficient supérieur, et les questions de confort par un coefficient inférieur. Les pondérations sont documentées question par question. À terme, calibration via benchmarking entre pairs (cohortes anonymisées du même secteur).

**Scores planchers (K.O. critère).** Si une question vitale obtient un score inférieur à un seuil (par exemple 2/10), le score de la facette entière est plafonné, quel que soit le reste des réponses. Évite que des forces périphériques n'éclipsent une faiblesse critique. Documenter chaque K.O. critère explicitement.

**Système de Flags critiques.** Certaines combinaisons de réponses lèvent des indicateurs qui apparaissent au-dessus des scores chiffrés, pour forcer l'attention sur ce qui compte vraiment. Exemples :

- `FLUX_ANARCHIQUE` — déclenché par plusieurs canaux directs (Q04=d), label "Dispersion des flux entrants".
- `SURCHARGE_ADMIN` — déclenché par travail soir/weekend (Q05=d), label "Dette administrative critique".
- `DEPENDANCE_UNITAIRE` — déclenché par cabinet à l'arrêt en cas d'absence (Q08=d), label "Vulnérabilité de continuité opérationnelle".
- `DELEGATION_OPAQUE` — déclenché par pas de règles claires avec le secrétariat (Q03=c/d), label "Défaut de cadrage des habilitations".
- `NON_CONFORMITE_HDS` — déclenché par usage de ChatGPT grand public (Q13=d), label "Rupture de confidentialité (RGPD/HDS)".
- `DEFAUT_TRACABILITE` — déclenché par pas de système pour les patients perdus de vue (Q10=d), label "Carence de suivi actif".

Chaque Flag porte un label "Expert", un déclencheur traçable, et un impact (formulation des conséquences pour le cabinet et la patientèle).

**Catégories Expert** en remplacement (ou complément) des facettes WSF brutes, pour parler le langage métier du répondant :

- Processus & activités → **Efficience & Temps Médical**. Promesse : mesurer la capacité à se concentrer sur le soin.
- Participants → **Résilience & Coordination**. Promesse : évaluer la solidité de l'équipe et la continuité.
- Information → **Sécurité & Gouvernance Numérique**. Promesse : vérifier la conformité et la fiabilité des flux.

**Cartouche de Diagnostic** comme format de présentation des résultats : pour chaque catégorie, un score chiffré ajusté, une liste d'indicateurs de vigilance (Flags), une liste d'atouts détectés (forces saillantes). Remplace les barres de progression simples par une vue diagnostic structurée.

**Architecture multi-secteur** : la grille (facettes, Flags, catégories Expert) reste constante d'un secteur à l'autre. Seuls les labels et les déclencheurs spécifiques changent. Pour un avocat : Efficience devient "Rentabilité & Temps Facturable", Sécurité devient "Secret Professionnel & Risque de Procédure", `NON_CONFORMITE_HDS` devient `NON_CONFORMITE_RGPD_AVOCAT`. Le moteur de calcul reste unique, l'expérience devient ultra-spécifique au métier.

**Pondération calibrée par benchmarking entre pairs** (objectif de fond). Quand la base de répondants atteint une taille suffisante, les coefficients de pondération et les seuils de K.O. critère sont calibrés par cohortes anonymisées. Méthodologie à définir.

### Élargissement du périmètre

### Élargissement du périmètre

- Support des **MSP de grande taille** (au-delà de 5 médecins) — nécessitera une réflexion sur l'analyse multi-systèmes.
- **Spécialisation à d'autres métiers** (médecin spécialiste, chirurgien-dentiste, kinésithérapeute, sage-femme, infirmier libéral). Architecture multi-secteur préfigurée par la trajectoire scoring V1+ (voir ci-dessus).
- **Multi-session par cabinet** : suivi dans le temps de l'évolution de l'organisation.

### Technique

- Version vendable en **Next.js + better-sqlite3** (au-delà du démonstrateur Streamlit).
- Intégration **Claude Skills** ou autres mécanismes d'itération IA pour les médecins utilisateurs.
- API d'accès aux données pour intégration avec d'autres outils Lugia.
- Chiffrement local renforcé des données stockées.

### Vers le produit complet Lugia

- Ouverture du hub d'organisation au-delà du check-up : suivi continu, agents sécurisés pour des tâches concrètes (courriers, tri, suivi des chroniques, préparation à la facturation électronique).
- Mode "diagnostic terrain" avec Lugia, en prolongement du check-up déclaratif.
- Mode "abonnement de suivi" pour les cabinets accompagnés.

### Conformité réglementaire pré-commercialisation (V2)

À mettre en place avant l'ouverture commerciale large, voir D-017 :

- Mentions légales sur le sous-domaine.
- Politique de confidentialité RGPD (finalité, durée, droits d'accès et d'oubli).
- Cookie banner si tracking analytique.
- Privacy by design (logs minimaux, chiffrement au repos).
- Avis juridique professionnel avant ouverture grand public.
- HDS si à terme un cas d'usage touche des données patient (n'est pas le cas en V0/V1/V1.5).

---

## Hors périmètre

Éléments explicitement écartés du projet, pour rester focalisé.

- **Diagnostic médical des soins** — le démonstrateur porte sur l'organisation, pas sur la qualité clinique des actes.
- **Notation individuelle des participants** — les scores portent toujours sur le système de travail.
- **Stockage de données patient identifiables** — interdit en toutes circonstances.
- **Audit de conformité réglementaire complet** — hors scope, le check-up signale les zones à approfondir, il ne certifie pas.
- **Plateforme multi-tenant en V0 et V1** — single-cabinet pour l'instant, multi-cabinet est une question V1+.

---

*À mettre à jour à chaque fin de phase, et à chaque fois qu'une fonctionnalité est consciemment repoussée.*
