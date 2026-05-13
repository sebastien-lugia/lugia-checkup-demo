# Work System Framework — Note de référence

> Cadre conceptuel utilisé par Lugia pour décrire et analyser le système de travail d'une organisation.
> Cette note adapte les travaux de Steven Alter (Université de San Francisco) au contexte d'un cabinet de médecine générale.
>
> Version 1.0 — 12 mai 2026.

---

## 1. Le Work System Framework, en deux phrases

Le **Work System Framework** (WSF) est une grille à neuf éléments qui décrit comment un système de travail fonctionne. Il a été développé par Steven Alter dans le cadre de la **Work System Theory** (Information Systems, Université de San Francisco, à partir de 2003), avec pour objectif de rendre l'analyse des systèmes accessible à la fois aux professionnels métier et aux experts techniques.

Pour Lugia, le WSF sert d'**ossature de lecture** : chaque réponse du médecin au check-up est rattachable à une ou plusieurs facettes du WSF, et le diagnostic est structuré autour de ces facettes.

---

## 2. Définition d'un système de travail

> Un système de travail est un **système dans lequel des participants humains et/ou des machines réalisent un travail** (processus et activités) **en utilisant de l'information, de la technologie et d'autres ressources, pour produire des produits ou services destinés à des clients internes ou externes**.

Appliqué à un cabinet de médecine générale, le système de travail est l'ensemble formé par : les médecins, le secrétariat éventuel (interne ou externalisé), les patients, les outils numériques, les processus administratifs et cliniques d'organisation, les locaux, les flux d'information, et les règles informelles ou formelles.

Le système de travail **n'est pas le médecin**. C'est l'environnement de travail dans lequel le médecin opère.

---

## 3. Les neuf éléments du WSF

Le cadre identifie **neuf éléments**, organisés en **trois cercles concentriques**.

### Cercle interne — Quatre éléments entièrement internes au système

Ce sont les éléments sur lesquels le cabinet a directement la main.

| Élément | Définition | Exemples en cabinet médical |
|---|---|---|
| **Processus & Activités** | Le travail réalisé, structuré ou non, par des humains ou des machines | Prise de rendez-vous, tri des appels, consultation, rédaction de courrier, suivi des résultats d'examens, gestion des renouvellements, coordination avec spécialistes |
| **Participants** | Les acteurs humains qui réalisent les activités | Médecin, secrétaire interne, télésecrétariat, assistant médical, IDEL, remplaçant, expert-comptable, conjoint dépanneur ponctuel |
| **Information** | Toute évidence ou connaissance utilisée — données, paroles, notes, dossiers, transmissions orales | Dossier patient (DMP), agenda Doctolib, résultats biologiques, courriers spécialistes, transmissions orales entre médecin et secrétaire, post-it, mémoire de l'équipe |
| **Technologies** | Outils, logiciels, matériel utilisés pour soutenir les activités | Maiia ou Weda, Doctolib, MSSanté/Mailiz, Lifen, Mon Sisra, dictée vocale, lecteur CB, borne d'enregistrement, agents IA |

### Cercle intermédiaire — Deux éléments à cheval

Ces éléments font interface entre le système et son extérieur.

| Élément | Définition | Exemples en cabinet médical |
|---|---|---|
| **Clients** | Les bénéficiaires des produits ou services. Peuvent être internes ou externes au système, et participer ponctuellement aux activités | Patients, aidants, familles, partenaires de soin |
| **Produits & Services** | Ce que le système produit ou délivre | Consultation, téléconsultation, ordonnance, renouvellement, certificat, courrier de correspondance, orientation, suivi chronique, prévention, coordination |

**Note V0** : par décision (D-003), les patients sont traités comme "Clients" uniquement dans la V0, même quand ils participent ponctuellement aux activités (par exemple lors du recueil d'information pendant un examen).

### Cercle externe — Trois éléments largement extérieurs au système

Ces éléments pèsent sur le système sans qu'il puisse les modifier directement. Ils ne peuvent pas faire l'objet d'un "chantier" classique : on apprend à les **absorber**, on s'adapte à eux, on les anticipe.

| Élément | Définition | Exemples en cabinet médical |
|---|---|---|
| **Environnement** | Le contexte organisationnel, concurrentiel, réglementaire, culturel et démographique pertinent pour le système | Pression patientèle locale, désert médical, démographie vieillissante, obligations administratives (DMP, ROSP, facturation électronique 2026), relations avec autres acteurs de soin, marché du démarchage IA |
| **Infrastructure** | Ressources humaines, informationnelles et techniques partagées par plusieurs systèmes de travail | Connexion internet, fournisseurs cloud, hébergeurs de données de santé (HDS), support informatique externalisé, télésecrétariat partagé, services postaux, banques |
| **Stratégies** | Stratégies à différents niveaux (cabinet, professionnel, organisationnel) qui orientent les choix | Priorités du cabinet (qualité, accessibilité, réduction de charge), stratégie d'adoption d'outils, stratégie de transmission, stratégie d'évolution de l'activité |

---

## 4. Représentation visuelle (pyramide)

Le WSF est traditionnellement représenté sous forme de pyramide, où :

- Le **noyau interne** (Processus & Activités, Participants, Information, Technologies) est à la base.
- Les **Produits & Services** s'élèvent au-dessus, dirigés vers les **Clients** au sommet de la pyramide.
- L'**Environnement** et les **Stratégies** encadrent la pyramide sur les côtés gauche et droit.
- L'**Infrastructure** forme la base supportant l'ensemble.

En V0, le démonstrateur affiche les trois facettes prioritaires (Processus, Participants, Information) **en cartes simples**, sans pyramide complète. La pyramide complète est reportée en V1.

---

## 5. Périmètre V0 — Trois facettes prioritaires

Par décision (D-002), la V0 du démonstrateur traite uniquement trois facettes WSF : **Processus & Activités**, **Participants**, **Information**.

Ce choix repose sur deux raisons :

1. Ce sont les **trois éléments entièrement internes** du noyau WSF — ceux sur lesquels le cabinet a directement la main et peut donc agir.
2. Ce sont les **plus parlantes pour un médecin** : elles correspondent au quotidien immédiat (ce qui se passe, qui fait quoi, ce qui circule).

Les autres facettes (Technologies, Clients, Produits & Services, Environnement, Infrastructure, Stratégies) sont reportées en V1. Voir `ROADMAP.md`.

---

## 6. Lecture du diagnostic selon les cercles

La position d'une facette dans le WSF influence la **nature des chantiers** que le démonstrateur peut proposer.

### Pour les facettes internes (Processus, Participants, Information, Technologies)

Le cabinet a un **levier direct**. Les chantiers peuvent porter sur la clarification, la redistribution, la formalisation, l'outillage.

### Pour les facettes à cheval (Clients, Produits & Services)

Le cabinet a une **marge de manœuvre limitée**. Les chantiers portent sur la délimitation des services, le contrat implicite avec les patients, l'éducation des attentes.

### Pour les facettes externes (Environnement, Infrastructure, Stratégies)

Le cabinet **ne peut pas modifier directement** ces éléments. Les chantiers visent à mieux les **absorber** : anticiper l'échéance facturation électronique, comprendre la dépendance à un télésecrétariat externalisé, formuler une stratégie d'évolution de l'activité.

Cette lecture est rappelée dans `workstream_templates.md` et dans `output_templates.md`.

---

## 7. Au-delà du WSF — Les éléments associés (V1+)

Pour mémoire, Steven Alter a développé deux extensions du WSF que Lugia pourra mobiliser plus tard.

### Le Work System Life Cycle Model (WSLC)

Décrit comment un système de travail évolue dans le temps, en quatre phases : **Initiation**, **Development**, **Implementation**, **Operation & Maintenance**. Le modèle distingue deux types de changement — **planifié** (projets formels qui parcourent ces quatre phases) et **non planifié** (workarounds, adaptations informelles, ajustements ponctuels).

Pour un cabinet médical, le WSLC permettrait par exemple de situer le cabinet du Dr Chateau dans sa séquence : sortie d'un changement majeur (passage au télésecrétariat il y a 18 mois), absorption d'un événement non planifié (hospitalisation de sa femme il y a un mois), préparation d'un changement à venir (facturation électronique en septembre 2026).

### Les 24 axiomes Alter (2025)

Organisés en cinq catégories : **System in Context**, **System Operation**, **Goal Attainment**, **Operational Variability**, **System Change**. Ces axiomes recouvrent largement les six constantes transversales prévues en V1 du démonstrateur Lugia (service rendu, information utile, décisions claires, charge soutenable, règles et apprentissages, capacité à changer).

L'alignement formel des six constantes Lugia avec les cinq catégories d'axiomes Alter est une évolution prévue en V1+. Voir `ROADMAP.md`.

---

## 8. Périmètre de validité du WSF

Le WSF est conçu pour analyser :

- Des systèmes de travail de **taille modérée** (ni trop petits ni trop grands).
- Des systèmes qui **opèrent dans la durée** (semaines, mois, années).
- Des systèmes **sociotechniques** (humains + machines) ou **entièrement automatisés**.

Le WSF **n'est pas conçu** pour analyser :

- Les systèmes naturels (biologiques, géologiques).
- Les représentations statiques (code source, ontologies abstraites).
- Les activités personnelles très brèves.
- Les transformations d'entreprise de très grande échelle.

Un cabinet médical de 1 à 5 médecins entre **pleinement** dans la cible du WSF. Voir `DECISIONS.md` D-004.

---

## 9. Références

- Alter, S. (2013). *Work System Theory.* Journal of the Association for Information Systems, Vol. 14, Issue 2.
- Alter, S. (2006, 2008). *The Work System Method.*
- Alter, S. (2025). *A Set of Axioms Providing a Basis for Understanding and Analyzing Work Systems.* USF Scholarship.
- Alter, S. (2025). *AI-Based Requirements Analysis Assistant.* CAISE 2025.

---

*Version 1.0. Toute évolution structurante de cette note (par exemple, élargissement aux 9 facettes en V1) doit être journalisée dans `DECISIONS.md`.*
