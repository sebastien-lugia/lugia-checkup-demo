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

## Vague 2.2 — Multiplication des variantes méthodologiques — LIVRÉE 2026-05-15

D-020 prévoyait "50+ variantes par section" comme cible Vague 2 méthodologique. Le travail livré par les Vagues 2 lite + 3.1 a produit ~37 fragments narratifs, mais avec une seule variante par pattern : deux médecins du même profil recevaient exactement le même rapport.

Vague 2.2 (5 sous-vagues, 2026-05-15) résout ce point : 63 fragments narratifs au total, dont 51 nouveaux, sélectionnés de manière déterministe par `_pick_variant(interview_id, variants, section_key)` avec sel par section. Critère opérationnel atteint : deux médecins du même profil ne reçoivent plus la même phrase analytique. La recommandation italique reste mono-variante par contexte (signature commerciale standardisée — voir `DECISIONS.md` D-022). Détail dans `TODO.md` section dédiée et `CHANGELOG.md`.

Donne au SLM V1.2 un meilleur socle de few-shot examples (51 nouveaux, répartis en 4 catégories sémantiques) et respecte la discipline D-020 "méthodologique d'abord, intelligence ensuite".

---

## V1.1.7 — Voix "vous" sur le callout + responsive + prénom médecin — LIVRÉE 2026-05-16

7 sous-vagues livrées le 16 mai à partir des specs V3 (`wireframes/resultats_v2_specs.md`). Voir `CHANGELOG.md` 2026-05-16 V1.1.7 et `DECISIONS.md` D-026.

Points structurants livrés :

- **Voix "vous"** sur le callout entre angles et opportunités. Plus de "Lugia commence par..." en 3ème personne. Le médecin reste sujet de l'action.
- **Responsive complet** : @media print (impression, export PDF) et @media mobile (max-width: 640px). Prérequis pour tout test prospect réel.
- **Prénom médecin persistant** : nouvelle table `user_profile`, champ optionnel dans /compte, sous-titre "Dr {prénom} — résultats du {date}" dans l'en-tête du rapport.
- **H1 reformulé** : "Votre cabinet, vu de l'extérieur" (Lugia positionné comme regard extérieur).
- **4 reformulations swot** : "répartie" (au lieu de lissée), "consultation libérée" sur Hervé, "aligné sur votre pratique" sur Robin, "sans protocole défini" sur les chroniques.
- **Phrase de transition** avant la section Prochaine étape.

Aucun changement de scoring, aucune refonte du questionnaire.

---

## V1.1.6 — Refonte UI page de résultats vers palette V2 sobre — LIVRÉE 2026-05-16

6 sous-vagues livrées le 16 mai à partir des specs V2 produites dans une conversation Claude parallèle (`wireframes/resultats_v2_specs.md`, `wireframes/resultats_v2_cible.pdf`). Voir `CHANGELOG.md` 2026-05-16 V1.1.6 et `DECISIONS.md` D-025.

Points structurants livrés :

- **Palette V2 resserrée** (vert/orange/bleu strictement sémantiques, jamais décoratifs).
- **Badges asymétriques** : Maîtrisé/Opérationnel muets (l'absence est signal positif), À surveiller gris, À risque rouille.
- **Suppression de la barre 4 segments** au profit du seul badge texte.
- **Refonte opportunités** : numéro grand sans badge "Priorité X", 2 colonnes Situation/Action, note "À confirmer ensemble" en pied.
- **Carte recommandée mise en avant** sur Prochaine étape (bordure bleue + bouton bleu + CTA "Prendre rendez-vous").
- **Recommandation italique extraite de la synthèse** : positionnée en transition entre les facettes et les opportunités, plus sobre, sans encadré.
- **22 mots-clés en gras** ajoutés dans les variantes phrase choc pour révéler les pivots MBTI.

Aucun changement de scoring, aucune migration BDD, aucune dépendance ajoutée. Purement frontend (à 95%) + backend mineur pour exposer `recommendation` séparément.

---

## V1.1.5 — Refonte UI/méthodologique de la page de résultats — LIVRÉE 2026-05-16

10 sous-vagues livrées dans la journée du 16 mai (a, b, c, d, e, f, h, i, j, k — `g` est la journalisation). Voir `CHANGELOG.md` 2026-05-16 V1.1.5 et `DECISIONS.md` D-023 + D-024.

Points structurants livrés :

- **4 niveaux qualitatifs** (Maîtrisé / Opérationnel / À surveiller / À risque) en remplacement du score chiffré /10, avec seuils stricts publics et fusion empirique des ex-niveaux 4-5.
- **Forces et risques par facette** extraits des options du questionnaire avec mécanique de priorité, troncature par niveau, planchers de garantie. Module dédié `src/swot.py` (40 fragments).
- **Reframing des chantiers en "opportunités d'action"** avec 4 labels internes renommés et 7 phrases `pas_confirmer` réécrites en hypothèses à confirmer ensemble.
- **Champ prénom optionnel** (`entity_name`) sur 8 options secrétariat/équipe pour personnaliser les forces du rapport. Migration BDD légère et fallback silencieux si non saisi.
- **dump_report** mis à jour pour produire des markdowns alignés sur le nouveau format.

Donne à V1.2 SLM un substrat plus riche : 40 fragments swot + 4 niveaux + 7 hypothèses + champ entity_name. La discipline D-020 (méthodologique d'abord) reste respectée.

---

## V1.1.8 — Câblage Q06 (motivation du check-up) — LIVRÉE 2026-05-18

Q06 (*"Qu'est-ce qui vous fait faire ce check-up aujourd'hui ?"*) est collectée depuis V1 mais n'irrigue actuellement aucun bloc de la page résultats. Elle propose 4 motivations distinctes — curiosité, fatigue qui dure, événement récent, anticipation — qui devraient moduler le rapport entier.

### Pourquoi c'est devenu prioritaire

Identifié en V1.1.7 sur le profil "porteur_solo" : les phrases choc pointent un risque structurel (mémoire individuelle, transmissibilité, non-délégation) qui n'est **pas un problème pour tous les médecins**. Un médecin de 55 ans qui anticipe sa cession va trouver l'analyse pertinente ; un médecin de 45 ans qui fait le check-up par curiosité peut la trouver alarmiste ou moralisatrice. La cascade actuelle `build_phrase_choc` ne fait aucune distinction. Q06 est la donnée qui permet ce raffinement.

### Travail prévu

**1. Qualifier le statut du répondant via Q06**
Étendre Q06 (ou la croiser avec une question contextuelle additionnelle) pour qualifier la situation du médecin au-delà de la motivation pure :
- *cession à venir* (médecin senior, transmissibilité critique)
- *structurer la transmissibilité* (mid-career, prépare l'avenir)
- *aller mieux au quotidien* (fatigue, surcharge actuelle)
- *anticiper un événement* (arrivée d'un associé, déménagement, congé)
- *curiosité pure* (pas de besoin pressant identifié)

**2. Moduler la phrase choc selon Q06**
Un médecin qui coche "anticipation" reçoit une phrase choc orientée transmissibilité ; un médecin qui coche "fatigue" en reçoit une orientée charge personnelle ; un médecin qui coche "curiosité" reçoit une formulation douce qui ne sur-dramatise pas.

**3. Adapter l'orientation des chantiers**
Chaque chantier devrait également se reformuler selon la motivation. *Anticiper une absence* fait sens pour un médecin qui anticipe ; pour un médecin en fatigue, le même chantier est mieux positionné comme *"libérer du temps"*. Le contenu structurel reste le même, le packaging change.

**4. Tests en local**
Sur persona Château et 4-5 variantes manuelles couvrant les 4 motivations.

**5. Pas de migration BDD nécessaire** (la donnée est déjà stockée).

### Pourquoi avant le SLM V1.2

On enrichit le socle méthodologique tant qu'on peut. Q06 a un coût d'intégration faible (4 valeurs nominales) et un fort effet narratif. C'est l'opportunité typique D-020 — *"méthodologique d'abord, intelligence ensuite"*. Quand le SLM arrivera en V1.2, il pourra interpoler entre les variantes Q06 plutôt que de les générer à blanc.

---

## V1.1.9 — Refonte UI questionnaire + page résultats + enrichissement contexte — LIVRÉE 2026-05-19

Vague visuelle livrée en 5 sous-vagues sur la journée du 19 mai. Voir `CHANGELOG.md` entrée du 19 mai 2026 et `DECISIONS.md` D-028.

**Livrables :**
- 4 nouveaux composants frontend (`CheckupHeader`, `CheckupProgress`, `CheckupIntro`, `CheckupTransition` — ce dernier produit mais désactivé sur retour utilisateur).
- Refonte de `CheckupWidgets.tsx` (OptionCard avec check-mark, split labels `mot-clé — détail`, QuestionTitle avec note italique séparée).
- Refonte de `web/app/checkup/page.tsx` (machine à états intro/question/completed, sauvegarde visible, raccourci Entrée, animations fade-slide).
- Refonte de `web/app/resultats/page.tsx` (hero ample, sections numérotées I-IV, synthèse en lead serif + corps aéré, pause narrative pleine largeur, opportunités narratives, prochaine étape mise en valeur).
- Protocol JSON v1.10 (17 questions, Q15 statut d'installation / Q16 territoire / Q17 horizon ajoutées, IDs Q01-Q14 strictement préservés).
- Wireframes HTML autonomes (`wireframes/checkup_v1_1_9_*.html`, `wireframes/resultats_v1_1_9_wireframe.html`) + specs (`wireframes/checkup_v1_1_9_specs.md`).

**Non-régression confirmée** : hash sha256 du rapport généré strictement identique à V1.1.8 équivalent. Q15/Q16/Q17 collectées en base mais non câblées dans le rapport en V1.1.9 — substrat dormant pour V1.2 SLM (discipline D-020 respectée).

---

## V1.1.10 — Bloquants tests prospects (CTAs + questionnaire approfondissement Path A) — PROCHAIN CHANTIER

Deux chantiers non-visuels à traiter **avant** d'envoyer le démonstrateur à 3-5 médecins :

1. **Câblage des CTAs Prochaine étape** sur `/resultats` — "Choisir un chantier" et "En parler avec Lugia" sont inertes. À câbler au minimum sur un `mailto:` ou un formulaire de contact pour ne pas perdre confiance instantanément.
2. **Construction du questionnaire d'approfondissement (Path A)** — la carte "Approfondir un chantier, en autonomie" promet *"un questionnaire ciblé, ~15 min, gratuit"*. À construire (5-7 questions par chantier débouchant sur un plan d'action concret), sinon la promesse écrite ne tient pas.

V1.1.10 est indépendante de V1.1.9 (chantier non-visuel). Peut être traitée dans une conversation Claude dédiée. Cible : livraison avant tests prospects.

---

## V1.2 — Intégration SLM/LLM hybride — APRÈS V1.1

Ajout d'une couche d'orchestration LLM en surcouche du méthodologique enrichi de V1.1, avec fallback systématique. Cible : faire passer le rapport de "templating combinatoire 50+ variantes" à "génération contextualisée par section" (synthèse, analyse facettes, analyse chantiers).

Architecture envisagée :

- **Dev** : Ollama local sur MacBook Pro de Sébastien, expérimentation gratuite des prompts.
- **Prod** : API cloud bon marché (Anthropic Haiku, Mistral Small, ou équivalent), ~0.005-0.015€/rapport.
- **Sélecteur** : variable d'environnement `MODEL_PROVIDER` (ollama|anthropic|...) et `LLM_ENABLED` (0/1) pour basculer sans modifier le code.
- **Fallback** : sur erreur LLM, indisponibilité, ou `LLM_ENABLED=0`, retour automatique aux templates V1.1.



### Exploitation de Q14 (texte libre de clôture)

Q14 (*"En une phrase, qu'est-ce qui vous aiderait le plus aujourd'hui dans votre cabinet ?"*) est collectée depuis V1 mais reste cantonnée à un usage offline (handover commercial). Avec un SLM, on peut l'exploiter dans le rapport :

- **Reformuler le texte libre du médecin** dans la phrase d'ouverture du rapport ou de la recommandation, pour renvoyer son besoin tel qu'il l'a exprimé ("Vous nous avez dit vouloir X. Voici comment Lugia peut y contribuer.").
- **Aligner les opportunités d'action** : pondérer la sélection des chantiers selon les mots-clés du free_text ("souffler", "déléguer", "sécuriser"...).
- **Détecter les hors-périmètre** : si Q14 mentionne quelque chose que Lugia ne couvre pas (financement, juridique, RH), le rapport peut l'acknowledger sans prétendre y répondre.

Pas faisable en méthodologique pur (le free_text exige du parsing sémantique). Donc à intégrer en même temps que la couche SLM V1.2.

---

### Sélection sophistiquée des chaînes causales

`src/templates.py::build_chaine_causale` (livrée Vague 3.1j) détecte 5 chaînes saillantes selon des combinaisons d'options et applique le premier match en cascade. Limite identifiée : pour un profil qui matche plusieurs chaînes, la cascade peut sélectionner la moins pertinente. Exemple Chateau : matche chaîne 1 (débordement admin) ET chaîne 2 (fragilité continuité) ; la cascade prend la 1 alors que la 2 résonne potentiellement plus avec son contexte familial.

V1.2 : un module de scoring de saillance (priorité × profondeur × cohérence avec Q06/Q14) demande au SLM de classer les chaînes pertinentes pour un profil donné, et n'en retient qu'une ou deux. Permet aussi d'agréger plusieurs chaînes faibles en une chaîne synthétique inédite.

Fallback systématique sur la cascade V1.1 si SLM indisponible.

Travail prévu :
- Choix du provider API cloud pour prod et signature des conditions.
- Architecture d'orchestration côté `backend/main.py` ou nouveau module `src/llm.py`.
- Rédaction des prompts par section avec few-shot examples issus de V1.1.
- Tests A/B en interne sur Chateau persona refondu : rapport templated V1.1 vs rapport LLM-augmenté V1.2.
- Mise à jour `MASTER_PROMPT.md` section 6 (architecture).

### Génération dynamique des options de QCM

Demande utilisateur V1.1 Vague 3.1 : pour certaines questions (notamment Q10 suivi des chroniques, Q11 tri des résultats), les options actuelles supposent une équipe ; un médecin solo se reconnaît mal dans "Un membre de l'équipe trie les résultats". En V1.2, le LLM réécrit ces options à la volée à partir des réponses précédentes (Q01 type de cabinet, Q02 secrétariat, Q07 équipe étendue), pour ne proposer que des libellés cohérents avec le profil du répondant.

Architecture envisagée :

- Une étape de "personnalisation initiale" en début de questionnaire (après Q01/Q02), qui prépare les options dynamiques de Q07 à Q11. Cette étape peut prendre 10 à 30 secondes côté API cloud, voire plus côté Ollama local.
- Pendant ce temps de calcul, **écran d'attente non vide** : un paragraphe explicatif Lugia présente la méthode et le sens du check-up (substitution-extension, analyse du système et non des personnes, garde-fous secret médical). L'attente devient une porte d'entrée pédagogique au lieu d'un frottement.
- Fallback systématique sur les options statiques V1.1 si l'appel LLM échoue ou si `LLM_ENABLED=0`.
- Les libellés statiques V1.1 restent l'oracle de référence — toute option dynamique générée doit converger sémantiquement vers l'une des 4 options statiques (pour préserver la justifiabilité mathématique du scoring, voir D-013).

### Enjeux temporels sectoriels datés

V1.1 avait introduit `derive_enjeu_temporel` (supprimée Vague 3.1) qui injectait, dans la recommandation italique, *« y compris la facturation électronique de septembre »* quand la date de bascule (1ᵉʳ septembre 2026) était à moins de 200 jours. L'idée mérite d'être généralisée en V1.2+ : un mécanisme `temporal_concerns.json` listant les échéances réglementaires ou sectorielles datées (facturation électronique B2B/B2C, généralisation MSSanté, mise à jour HDS, échéances ROSP, etc.). À chaque génération de rapport, les échéances actives (à moins de N jours) sont injectées dans la recommandation ou dans une carte dédiée "À surveiller dans les prochains mois".

Bénéfice attendu : montrer au répondant que le questionnaire connaît son calendrier métier, et l'ancrer dans une actualité concrète plutôt que dans une analyse purement organisationnelle. Liste à enrichir au contact des prospects et avec les retours terrain V1-7+.

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

- **Question dédiée aux imprévus opérationnels (axe 2 Lugia)** : au-delà de l'absence planifiée (Q08), sonder la capacité du cabinet à absorber les surcharges ponctuelles non planifiées — annulation jour J, panne d'outil, pic de demande, urgence soudaine. Identifié comme gap V1.1 (cf TODO et `MASTER_PROMPT.md` section 2). À traiter avant V1.5.
- **Onboarding gamifié type paramétrage profil de jeu vidéo** : remplacer l'entrée linéaire dans le questionnaire par une étape de paramétrage visuelle où le répondant clique sur des icônes pour composer le profil de son cabinet (personas qui y travaillent, tâches récurrentes, outils en place, enjeux essentiels). Ce contexte alimente ensuite les questions du parcours principal et les analyses du rapport. Plutôt destiné au questionnaire d'approfondissement payant (V1.5 ou V2), en cohérence avec le second questionnaire wow déjà inscrit en V1.5.
- **Cohérence narrative thématique du questionnaire** : aujourd'hui le médecin a l'impression de répondre à des questions silotées (téléconsultation, outils, secrétariat) sans percevoir le fil rouge. Refondre l'ordre et le groupement en trois ou quatre sections explicites avec micro-titres ("Votre temps", "La cohérence de vos actions", "Vos risques", "Votre résilience"), pour qu'il ressente qu'on l'interroge sur sa gestion globale, pas sur des sujets isolés. Le contenu des questions reste, c'est leur scénographie qui change. Impact UI mais aussi `interview_protocol.json` (ajout d'un champ `section`).
- **Question d'auto-priorisation médecin** : *"Si vous pouviez changer une seule chose demain, ce serait quoi ?"* avant la sortie de la synthèse Lugia. Permet de confronter la priorité ressentie du médecin à la priorisation calculée par le rapport. Axe 3 Lugia (savoir par quel problème commencer) renforcé.
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
