# Lugia — Spécification du Schéma de Données
**Version** 0.5 — Santé fonctionnelle (workarounds & complétude fonctionnelle)  
**Projet** Lugia Checkup  
**Auteur** Sébastien / Lugia  
**Date** Juin 2026 — Arbitrages du 03/06/2026 · Temporalité v0.3 · Inter-systèmes v0.4 · Santé fonctionnelle v0.5

> **v0.5 — Trois ajouts issus du corpus Steven Alter** (arbitrage « justesse sans complexité ») :
> 1. **R14 Workaround détecté** (N6/N8) — le signal le plus honnête d'un désalignement entre système conçu et travail réel
> 2. **Complétude fonctionnelle** restreinte à 3 facettes de travail (N3/N6) — décider, communiquer, coordonner
> 3. **Workaround → −0.20 de stabilité** (N4) — renforce la transition actif → fragilisé
>
> Le reste du corpus Alter (24 principes, 8 espaces de design, 18 facettes complètes, axiomes A10-A24) reste un socle théorique nourrissant le prompt de l'IA et le protocole d'interview, **sans surcharger le moteur de règles**. Voir `lugia_complement_alter.md`.

---

## Sommaire

1. [Vision & Principes](#1-vision--principes)
2. [Architecture générale](#2-architecture-générale)
3. [Niveau 0 — Organisation](#3-niveau-0--organisation)
4. [Niveau 1 — Axes](#4-niveau-1--axes)
5. [Niveau 2 — Domaines](#5-niveau-2--domaines)
6. [Niveau 3 — Thèmes](#6-niveau-3--thèmes)
7. [Niveau 4 — Objets](#7-niveau-4--objets)
8. [Niveau 5 — Relations](#8-niveau-5--relations)
9. [Niveau 6 — Signaux](#9-niveau-6--signaux)
10. [Niveau 7 — Actions](#10-niveau-7--actions)
11. [Niveau 8 — Règles de détection](#11-niveau-8--règles-de-détection)
12. [Les 9 facettes WSF](#12-les-9-facettes-wsf)
13. [Les 8 axes organisationnels](#13-les-8-axes-organisationnels)
14. [Protocole d'extraction IA](#14-protocole-dextraction-ia)
15. [Règles de détection — catalogue initial](#15-règles-de-détection--catalogue-initial)
16. [Énumérations & Vocabulaire contrôlé](#16-énumérations--vocabulaire-contrôlé)
17. [Exemples d'extraction](#17-exemples-dextraction)
18. [Modélisation du changement dans le temps](#18-modélisation-du-changement-dans-le-temps)
19. [Décisions d'architecture](#19-décisions-darchitecture)

---

## 1. Vision & Principes

### 1.1 Ce que Lugia construit

Lugia est un **système d'intelligence organisationnelle conversationnel**. À partir d'un interview IA avec un professionnel de santé (ou tout professionnel d'une organisation), il construit automatiquement une **grille vivante** de l'organisation — sans effort de saisie pour l'utilisateur.

```
Interview IA (conversation naturelle)
        ↓
Extraction automatique d'objets typés
        ↓
Construction de la grille (8 axes × 9 lentilles WSF)
        ↓
Détection de signaux (risques, manques, incohérences)
        ↓
Génération d'actions suivies
        ↓
Grille mise à jour à chaque nouvelle interaction
```

### 1.2 Principes fondamentaux

**Substrat unique** — toutes les représentations (radar, matrice, processus, carte des risques) sont des **vues calculées** sur le même jeu de données. On ne stocke pas plusieurs modèles parallèles.

**Générique d'abord, sectoriel par apprentissage** — le schéma est universel. Les axes sont configurables par secteur. Les règles de détection peuvent être sectorielles ou génériques.

**L'IA alimente, l'humain valide** — l'IA extrait et propose. L'utilisateur corrige, confirme ou enrichit. Aucun objet n'est inscrit comme définitif sans une validation implicite ou explicite.

**La grille vit** — elle n'est pas un rapport statique. Elle reflète l'état réel de l'organisation à un instant T et évolue à chaque interaction.

**Confiance explicite** — chaque objet extrait par l'IA porte un score de confiance. Les objets à faible confiance sont marqués et soumis à validation.

### 1.3 Le cadre théorique

Le schéma croise deux dimensions :

- **Les 9 facettes WSF** (Work System Framework — Steven Alter, 2013) : la nature ontologique de chaque objet — ce qu'il *est*
- **Les 8 axes organisationnels** (taxonomie Lugia) : la fonction de chaque objet — à quoi il *contribue*

Cette combinaison est originale : le WSF est habituellement appliqué à un système de travail unique. Lugia l'applique à une organisation entière, en le croisant avec une structure de domaines métier.

---

## 2. Architecture générale

### 2.1 Vue d'ensemble des niveaux

```
Niveau 0 │ Organisation
         │    └─ instance unique par cabinet / structure
         │
Niveau 1 │ Axes (8)
         │    └─ structure organisationnelle de haut niveau
         │
Niveau 2 │ Domaines (N par axe)
         │    └─ regroupements fonctionnels stables
         │
Niveau 3 │ Thèmes (N par domaine)
         │    └─ sous-ensembles cohérents d'activités ou de ressources
         │
Niveau 4 │ Objets  ◄── cœur du substrat, alimenté par l'IA
         │    └─ chaque entité réelle de l'organisation
         │
Niveau 5 │ Relations
         │    └─ liens entre objets
         │
Niveau 6 │ Signaux  ◄── générés automatiquement par les règles
         │    └─ risques, manques, incohérences détectés
         │
Niveau 7 │ Actions  ◄── générées depuis les signaux
         │    └─ tâches concrètes à réaliser
         │
Niveau 8 │ Règles
         │    └─ logique de détection des signaux
```

### 2.2 Les deux axes de lecture de la grille

```
                    ← 9 FACETTES WSF (lentilles) →
                Patients Soins Actes Acteurs Données Outils Contexte Infra Stratégie
              ┌─────────────────────────────────────────────────────────────────────┐
Cœur métier   │  ●       ●     ●     ●        ●       ●       ●        ●     ●     │
Parcours      │  ●       ●     ●     ●        ●       ●       ●        ●     ●     │
Processus     │  ●       ●     ●     ●        ●       ●       ●        ●     ●     │
Équipe & RH   │  ●       ●     ●     ●        ●       ●       ●        ●     ●     │
Outils & Data │  ●       ●     ●     ●        ●       ●       ●        ●     ●     │
Finance       │  ●       ●     ●     ●        ●       ●       ●        ●     ●     │
Conformité    │  ●       ●     ●     ●        ●       ●       ●        ●     ●     │
Stratégie     │  ●       ●     ●     ●        ●       ●       ●        ●     ●     │
              └─────────────────────────────────────────────────────────────────────┘

● = cellule potentiellement remplie (toutes les cellules ont du contenu possible)
```

Chaque cellule contient la liste des **Objets** qui ont pour axe X et pour facette WSF Y.

---

## 3. Niveau 0 — Organisation

L'organisation est l'instance racine. Tout le reste lui est rattaché.

### Schéma

```typescript
Organisation {
  id:                 uuid                    // identifiant unique
  slug:               string                  // lugia-dr-martin-paris
  nom:                string                  // "Cabinet Dr Martin"
  secteur:            string                  // "médecine_générale"
  sous_secteur:       string?                 // "solo" | "MSP" | "groupe" | "CPTS"
  taille:             string?                 // "1-2" | "3-5" | "5-10" | "10+"
  localisation:       Localisation?
  date_création:      datetime
  date_modification:  datetime
  version_schema:     string                  // "1.0.0" — versioning du schéma
  statut:             "actif" | "archivé"
  axes:               Axe[]                   // → Niveau 1
  interviews:         Interview[]             // historique des sessions
  metadata:           Record<string, any>?    // données sectorielles libres
}

Localisation {
  ville:              string?
  departement:        string?
  region:             string?
  zone_type:          "urbain" | "semi_rural" | "rural" | "sous_dense" | null
}

Interview {
  id:                 uuid
  date:               datetime
  durée_minutes:      number
  mode:               "chat" | "vocal" | "import"
  statut:             "en_cours" | "complété" | "archivé"
  transcription:      string?                 // texte brut de la conversation
  objets_extraits:    uuid[]                  // ids des objets créés
  signaux_générés:    uuid[]                  // ids des signaux créés
}
```

---

## 4. Niveau 1 — Axes

Les 8 axes sont la structure organisationnelle de premier niveau. Ils sont **fixes** dans le schéma générique mais peuvent être **renommés et réordonnés** par secteur.

### Schéma

```typescript
Axe {
  id:               uuid
  organisation_id:  uuid
  code:             string                    // "coeur_metier" — stable, non modifiable
  label:            string                    // "Cœur de métier" — peut être renommé
  label_sectoriel:  string?                   // "Activité Clinique" pour médecine
  description:      string
  ordre:            number                    // 1 → 8
  couleur:          string                    // hex, pour l'UI
  icone:            string?                   // emoji ou identifiant
  domaines:         Domaine[]                 // → Niveau 2
  actif:            boolean
}
```

### Les 8 axes — valeurs par défaut

| Code | Label générique | Label médecine | Description |
|---|---|---|---|
| `coeur_metier` | Cœur de métier | Activité clinique | Ce que l'organisation sait faire — compétences, actes, produits/services intrinsèques |
| `parcours_client` | Parcours client | Parcours patient | Ce que le bénéficiaire vit — séquence d'expérience de bout en bout |
| `processus_admin` | Processus & Admin | Gestion administrative | Ce qui tourne en arrière-plan — opérations, back-office, coordination |
| `equipe_rh` | Équipe & RH | Équipe & RH | Qui compose l'organisation — recrutement, management, formation |
| `outils_data_infra` | Outils, Données & Infrastructure | Outils, Données & Infrastructure | Ce avec quoi on travaille — technologies, données, locaux, équipements |
| `finance` | Finance | Finance | Ce que ça coûte et rapporte — revenus, charges, trésorerie, investissements |
| `conformite` | Conformité, Sécurité & Éthique | Conformité, Sécurité & Éthique | Ce qui contraint — réglementation, sécurité, déontologie, RGPD |
| `strategie` | Stratégie & Environnement | Stratégie & Environnement | Pourquoi et dans quel monde — objectifs, contexte, concurrence, territoire |

---

## 5. Niveau 2 — Domaines

Les domaines sont des **regroupements fonctionnels stables** au sein d'un axe. Ils sont pré-définis pour chaque secteur mais peuvent être créés manuellement.

### Schéma

```typescript
Domaine {
  id:               uuid
  axe_id:           uuid
  organisation_id:  uuid
  label:            string                    // "Activité Clinique"
  description:      string?
  ordre:            number
  couleur:          string?                   // héritée de l'axe ou personnalisée
  source:           "prédéfini" | "extrait" | "manuel"
  thèmes:           Thème[]                   // → Niveau 3
  actif:            boolean
}
```

### Exemples — Médecine générale

**Axe Cœur de métier**
- Activité Clinique
- Dossier Patient
- Prévention & Santé Publique

**Axe Parcours patient**
- Accès aux soins
- Consultation
- Suivi & Coordination
- Orientation

**Axe Finance**
- Facturation
- Télétransmission
- Comptabilité

---

## 6. Niveau 3 — Thèmes

Les thèmes sont des **sous-ensembles cohérents** au sein d'un domaine. C'est le niveau de granularité intermédiaire — ni trop large, ni atomique.

### Schéma

```typescript
Thème {
  id:               uuid
  domaine_id:       uuid
  axe_id:           uuid                      // dénormalisé pour performance
  organisation_id:  uuid
  label:            string                    // "Consultation"
  description:      string?
  ordre:            number
  source:           "prédéfini" | "extrait" | "manuel"
  objets:           Objet[]                   // → Niveau 4
  completude:       number                    // 0.0 → 1.0, calculé automatiquement
                                              // = % de facettes WSF couvertes (structurelle)
  completude_fonctionnelle: number            // [v0.5] 0.0 → 1.0
                                              // = % de facettes de travail fondamentales
                                              //   couvertes (décider / communiquer / coordonner)
  actif:            boolean
}
```

### Règle de complétude structurelle

Un thème est considéré **structurellement complet** quand au moins une facette WSF parmi les 4 fondamentales est couverte :
- `Acteurs` (qui ?)
- `Actes` (comment ?)
- `Données` (quoi ?)
- `Outils` (avec quoi ?)

Un thème avec 0 objet dans ces 4 facettes génère un signal de type `vide`.

### Règle de complétude fonctionnelle [v0.5]

La complétude structurelle répond à *« sait-on ce qui se passe ici ? »*. La complétude fonctionnelle répond à une question distincte : *« sait-on comment le travail se fait ici ? »*.

Issue des 18 facettes de travail de Steven Alter (2021), restreinte volontairement à **3 facettes fondamentales** pour rester actionnable :

- **décider** (making decisions) — y a-t-il un processus de décision identifié ?
- **communiquer** (communicating) — l'information circule-t-elle vers où elle agit ?
- **coordonner** (coordinating) — les acteurs sont-ils coordonnés ?

```
completude_fonctionnelle = COUNT(facettes de travail couvertes) / 3

Détection d'une facette de travail dans un thème :
  "décider"      ← objet acteurs avec situation de type décision
                   OU objet actes avec lexique "choisir/arbitrer/valider"
  "communiquer"  ← relation transmet_à OU objet données avec destinataire
  "coordonner"   ← relation coordonne entre 2+ acteurs du thème
```

Un thème **actif** dont la complétude fonctionnelle = 0 (aucune des 3 facettes) génère un signal de type `trou_fonctionnel`. Un thème vide structurellement ne déclenche pas ce signal (on traite d'abord le `vide`).

---

## 7. Niveau 4 — Objets

Les objets sont le **cœur du substrat**. Chaque entité réelle de l'organisation est un objet — une personne, un outil, une donnée, une étape, un livrable, une règle, un client, un objectif.

### Schéma complet

```typescript
Objet {
  // Identité
  id:                 uuid
  organisation_id:    uuid
  thème_id:           uuid
  domaine_id:         uuid                    // dénormalisé
  axe_id:             uuid                    // dénormalisé

  // Description
  label:              string                  // "Doctolib", "Secrétaire Marie", "Ordonnance"
  label_normalisé:    string?                 // version normalisée pour déduplication
                                              // "doctolib", "secretaire", "ordonnance"
  description:        string?                 // description libre
  
  // Typage WSF
  facette_wsf:        FacetteWSF              // enum — voir section 12
  
  // Typage local (sectoriel)
  type_local:         string?                 // "Essentiel" | "Principal" | "Réglementaire"
                                              // valeurs libres, définies par secteur

  // Périmètre — interne ou externe au cabinet
  périmètre:          PérimètreObjet          // distingue les entités internes des acteurs
                                              // et systèmes de l'écosystème

  // Situations (le "comment" contextuel)
  situations:         string[]                // ["Prise de RDV", "Rappels", "Urgences du jour"]
  
  // Présence dans la grille
  // Un objet peut appartenir à plusieurs cases de la grille
  // via ses relations (voir Niveau 5)
  // Sa position primaire est thème_id × facette_wsf
  
  // Traçabilité
  source:             SourceObjet             // "interview" | "manuel" | "import" | "déduit"
  extrait_source:     string?                 // phrase exacte dite par l'utilisateur
                                              // ex: "j'utilise Doctolib pour mes rendez-vous"
  interview_id:       uuid?                   // interview d'origine
  confiance:          number                  // 0.0 → 1.0
                                              // 1.0 = validé explicitement
                                              // 0.8 = extrait avec certitude
                                              // 0.5 = extrait avec ambiguïté
                                              // < 0.5 = à valider

  // Validation
  validé:             boolean                 // true = confirmé par l'utilisateur
  validé_le:          datetime?
  
  // Métadonnées
  date_création:      datetime
  date_modification:  datetime
  tags:               string[]                // tags libres pour recherche
  metadata:           Record<string, any>?    // données sectorielles libres

  // Cycle de vie (modélisation du changement dans le temps)
  cycle_de_vie:       CycleVie

  // Relations (calculées)
  relations_sortantes: Relation[]             // → Niveau 5
  relations_entrantes: Relation[]
  signaux:             Signal[]               // signaux impliquant cet objet
}

CycleVie {
  statut:             StatutCycleVie          // où en est cet objet dans sa vie
  date_apparition:    datetime?               // quand cet objet est entré dans le cabinet
  date_adoption:      datetime?               // quand il est devenu vraiment opérationnel
                                              // (peut être postérieur à date_apparition)
  stabilité:          number                  // 0.0 → 1.0
                                              // 0.0 = très instable (vient d'arriver, testé)
                                              // 0.5 = utilisé mais pas ancré dans les habitudes
                                              // 1.0 = totalement ancré, difficile à changer
  tendance:           TendanceCycleVie        // direction observée sur les dernières sessions
  note_évolution:     string?                 // ex: "en cours de remplacement par MSSanté"
                                              //     "adopté suite formation DPC oct. 2026"
}

type StatutCycleVie =
  | "emergent"        // récemment apparu, pas encore stabilisé
  | "actif"           // opérationnel et utilisé régulièrement
  | "fragilisé"       // actif mais en difficulté (panne, insatisfaction, pression)
  | "en_transition"   // en cours de remplacement ou de transformation
  | "obsolete"        // plus vraiment utilisé, en attente de suppression

type TendanceCycleVie =
  | "croissant"       // l'objet prend de plus en plus de place dans l'organisation
  | "stable"          // pas de changement notable entre les sessions
  | "décroissant"     // l'objet est de moins en moins central
  | "incertain"       // tendance non détectable (pas assez de sessions)

type FacetteWSF =
  | "patients"       // ① Customers
  | "soins"          // ② Products & Services
  | "actes"          // ③ Processes & Activities
  | "acteurs"        // ④ Participants
  | "donnees"        // ⑤ Information
  | "outils"         // ⑥ Technologies
  | "contexte"       // ⑦ Environment
  | "infrastructure" // ⑧ Infrastructure
  | "strategie"      // ⑨ Strategy

type SourceObjet =
  | "interview"      // extrait d'une conversation IA
  | "manuel"         // saisi directement par l'utilisateur
  | "import"         // importé depuis un fichier externe
  | "déduit"         // inféré par l'IA depuis d'autres objets

type PérimètreObjet =
  | "interne"        // entité qui appartient au cabinet (médecin, secrétaire, LGC, locaux…)
  | "externe"        // entité de l'écosystème (CPAM, spécialiste, CPTS, ARS, laboratoire…)
  | "interface"      // à la frontière — entité partagée (DMP, MSSanté, Pro Santé Connect…)

// Un objet externe porte un contexte additionnel décrivant sa nature dans l'écosystème
ContexteExterne {
  catégorie:         CatégorieExterne
  flux_entrants:     FluxEcosystème[]         // ce que cet acteur externe envoie au cabinet
  flux_sortants:     FluxEcosystème[]         // ce que le cabinet envoie vers cet acteur
  intensité:         "quotidien" | "hebdo" | "mensuel" | "ponctuel"
                                              // fréquence de l'interaction
  critique:          boolean                  // si cet acteur externe disparaît,
                                              // le cabinet peut-il fonctionner ?
}

FluxEcosystème {
  label:             string                  // "Résultats biologiques", "Remboursements AM"
  type:              "données" | "financier" | "réglementaire" | "clinique" | "logistique"
  direction:         "entrant" | "sortant"   // du point de vue du cabinet
  support:           string?                 // "e-biologie", "virement SEPA", "FSE", "MSSanté"
  volume_estimé:     string?                 // "quotidien", "~50/mois"
}

type CatégorieExterne =
  | "assurance_maladie"     // CPAM, CNAM, mutuelles
  | "professionnel_sante"   // spécialiste, biologiste, radiologue, pharmacien, infirmier
  | "etablissement"         // hôpital, clinique, EHPAD, SSR
  | "institution"           // ARS, Ordre, HAS, CNIL, URSSAF, DGFiP
  | "patient"               // le patient lui-même (acteur externe primaire)
  | "reseau"                // CPTS, MSP, cabinet de groupe, groupement
  | "fournisseur"           // éditeur LGC, hébergeur HDS, prestataire informatique
  | "autre"
```

### Règles de déduplication

Un même objet réel peut être mentionné plusieurs fois dans des thèmes différents. Le système doit :

1. **Détecter les doublons** via `label_normalisé` (comparaison fuzzy)
2. **Créer un objet canonique** avec toutes les situations agrégées
3. **Créer des références** dans chaque thème concerné (via Relations de type `référencé_dans`)
4. **Ne pas fusionner automatiquement** sans confirmation utilisateur si confiance < 0.8

Exemple :
```
"Logiciel médical" mentionné dans :
  - Cœur de métier / Consultation → situations: ["Anamnèse", "Diagnostic"]
  - Cœur de métier / Prescription → situations: ["Médicaments", "Examens bio"]
  - Finance / Facturation → situations: ["Cotation CCAM"]

→ 1 objet canonique "Logiciel médical" (facette: outils)
→ 3 références dans 3 thèmes différents
→ situations agrégées sur l'objet canonique
```

---

## 8. Niveau 5 — Relations

Les relations modélisent les **liens entre objets**. Elles permettent de calculer les dépendances, les flux, et les risques de propagation.

### Schéma

```typescript
Relation {
  id:               uuid
  organisation_id:  uuid
  
  // Les deux objets reliés
  objet_source_id:  uuid
  objet_cible_id:   uuid

  // Périmètre de la relation
  périmètre:        "interne"        // les deux objets sont dans le cabinet
                  | "sortant"        // source interne → cible externe
                  | "entrant"        // source externe → cible interne
                  | "externe"        // les deux sont externes (rare — relation de contexte)
  
  // Type de relation
  type:             TypeRelation
  
  // Direction
  sens:             "unidirectionnel" | "bidirectionnel"
  
  // Force de la relation
  poids:            number                    // 1 (faible) → 5 (critique)
  
  // Traçabilité
  source:           "interview" | "manuel" | "déduit"
  extrait_source:   string?
  confiance:        number                    // 0.0 → 1.0
  validé:           boolean
  
  date_création:    datetime
}

type TypeRelation =
  // Relations internes (intra-cabinet)
  | "utilise"           // Acteur utilise Outil
  | "produit"           // Acte produit Soin / Donnée
  | "déclenche"         // Acte déclenche Acte
  | "dépend_de"         // Objet dépend d'un autre pour fonctionner
  | "remplace"          // Outil remplace Outil (migration)
  | "coordonne"         // Acteur coordonne Acteur
  | "contraint"         // Règle (Contexte) contraint Acte / Outil
  | "finance"           // Acte génère revenus (Finance)
  | "référencé_dans"    // Objet canonique référencé dans thème secondaire
  | "succède_à"         // Acte succède à Acte dans un processus
  | "bénéficie_à"       // Soin bénéficie à Patient

  // Relations inter-systèmes (flux sortants du cabinet vers l'écosystème)
  | "adresse_vers"      // Cabinet oriente un patient vers un acteur externe
                        // ex: Dr Martin → adresse_vers → Cardiologue Dr Dupont
  | "transmet_à"        // Cabinet envoie une donnée ou un document à un acteur externe
                        // ex: Ordonnance → transmet_à → Pharmacie
                        // ex: FSE → transmet_à → CPAM
                        // ex: Lettre adressage → transmet_à → Spécialiste (via MSSanté)
  | "contribue_à"       // Cabinet contribue à un bien collectif ou un réseau
                        // ex: Dr Martin → contribue_à → CPTS Nantes Nord
                        // ex: Vaccination → contribue_à → Immunité collective territoire
  | "reçoit_de"         // Cabinet reçoit quelque chose d'un acteur externe
                        // ex: Résultats biologiques → reçoit_de → Laboratoire Cerba
                        // ex: Remboursements → reçoit_de → CPAM
  | "contraint_par"     // Acteur externe impose une contrainte au cabinet
                        // ex: Convention médicale → contraint_par → CPAM
                        // ex: Protocole HDS → contraint_par → ANS
  | "partenaire_de"     // Relation de coordination sans hiérarchie
                        // ex: Dr Martin → partenaire_de → Infirmière libérale Mme Chen
```

### Utilisation des relations pour les signaux

Les relations permettent de calculer :

- **Degré de centralité** d'un objet → si `logiciel_médical` a >10 relations `utilise` entrantes, c'est un point de fragilité
- **Chaînes de dépendance** → si A dépend_de B qui dépend_de C, la défaillance de C propage jusqu'à A
- **Acteurs isolés** → si un acteur n'a aucune relation `coordonne`, il travaille en silo
- **Actes sans outil** → si un acte n'a aucune relation `utilise` vers un outil
- **Flux sortants manquants** → si un acte clinique n'a aucune relation `transmet_à` ou `adresse_vers`, l'information produite ne sort pas du cabinet
- **Acteurs externes critiques sans redondance** → si un acteur externe `critique=true` n'a qu'un seul canal de relation entrant, c'est une dépendance fragile

---

## 9. Niveau 6 — Signaux

Les signaux sont **générés automatiquement** par les règles de détection (Niveau 8) lorsqu'une condition est remplie. Ils représentent des risques, des manques ou des incohérences dans la grille.

### Schéma

```typescript
Signal {
  id:                   uuid
  organisation_id:      uuid
  
  // Classification
  type:                 TypeSignal
  sévérité:             "critique" | "moyen" | "vigilance"
  
  // Localisation dans la grille
  axe_id:               uuid?                 // où le signal est détecté
  domaine_id:           uuid?
  thème_id:             uuid?
  facette_wsf:          FacetteWSF?           // sous quelle lentille
  
  // Objets impliqués
  objets_impliqués:     uuid[]               // ids des objets concernés
  
  // Message
  titre:                string               // "Aucun outil pour la Finance"
  description:          string               // explication détaillée
  recommandation:       string?              // suggestion d'action
  
  // Règle déclencheuse
  règle_id:             uuid
  
  // Cycle de vie
  statut:               StatutSignal
  date_détection:       datetime
  date_modification:    datetime
  acquitté_le:          datetime?
  acquitté_par:         string?
  résolu_le:            datetime?

  // Vélocité (modélisation du changement dans le temps)
  vélocité:             VélocitéSignal        // direction observée sur ce signal
  delta_sessions:       number                // variation du score entre les 2 dernières sessions
                                              // positif = amélioration, négatif = dégradation
                                              // ex: +12 = mieux, -8 = pire, 0 = stable
  durée_jours:          number                // depuis combien de jours ce signal est ouvert
                                              // utilisé pour détecter les signaux chroniques
  session_première_détection: uuid?           // id du snapshot de première détection
  
  // Actions associées
  actions:              Action[]             // → Niveau 7
}

type VélocitéSignal =
  | "s_améliore"        // delta_sessions positif sur les 2 dernières sessions
  | "stable"            // delta_sessions proche de 0
  | "se_dégrade"        // delta_sessions négatif sur les 2 dernières sessions
  | "inconnu"           // pas assez de sessions pour calculer

type TypeSignal =
  | "vide"                  // cellule ou thème sans aucun objet
  | "dépendance_unique"     // un seul objet couvre trop de terrain
  | "contradiction"         // deux objets ou signaux incompatibles
  | "surcharge"             // un acteur porte trop de responsabilités
  | "absence"               // absence d'un type d'objet attendu
  | "obsolescence"          // objet marqué comme déprécié ou remplacé
  | "tension"               // désalignement entre deux axes (ex: stratégie vs contexte)
  | "silo"                  // acteur ou thème sans relation avec le reste
  | "conformité"            // règle réglementaire non couverte
  | "fragilité"             // point unique de défaillance
  | "flux_sortant_absent"   // un acte ou soin produit n'est transmis à personne
                            // ex: consultation sans lettre vers le spécialiste
                            // ex: vaccination sans mise à jour DMP
  | "isolement_ecosysteme"  // le cabinet n'a aucune relation sortante vers un type
                            // d'acteur externe attendu pour son secteur
                            // ex: aucune relation vers un réseau (CPTS / MSP)
                            // ex: aucune relation vers un établissement hospitalier
  | "workaround"            // [v0.5] contournement d'un outil ou processus officiel
                            // signal le plus honnête d'un désalignement
                            // système conçu vs travail réel
                            // ex: "le DMP je le fais quand j'ai le temps"
                            // ex: "le logiciel bugue donc je note sur papier"
  | "trou_fonctionnel"      // [v0.5] facette de travail fondamentale absente
                            // d'un thème actif (décider / communiquer / coordonner)
                            // distinct de "vide" qui est structurel

type StatutSignal =
  | "ouvert"                // détecté, non traité
  | "acquitté"              // vu et compris, en attente d'action
  | "en_cours"              // action associée en cours
  | "résolu"                // action résolue
  | "ignoré"                // volontairement écarté avec justification
  | "faux_positif"          // erreur de détection confirmée
```

---

## 10. Niveau 7 — Actions

Les actions sont des **tâches concrètes** générées depuis les signaux. Elles peuvent aussi être créées manuellement.

### Schéma

```typescript
Action {
  id:               uuid
  organisation_id:  uuid
  
  // Origine
  signal_id:        uuid?                     // signal déclencheur (null si manuel)
  
  // Description
  label:            string                    // "Configurer e-biologie avec le laboratoire"
  description:      string?                  // contexte et détail de l'action
  
  // Priorisation
  priorité:         "haute" | "moyenne" | "faible"
  impact_estimé:    "critique" | "significatif" | "mineur"
  effort_estimé:    "faible" | "moyen" | "élevé"
  
  // Assignation
  responsable:      string?                  // rôle ou nom : "médecin" | "secrétaire" | "prestataire"
  
  // Cycle de vie
  statut:           StatutAction
  date_création:    datetime
  date_échéance:    datetime?
  date_modification: datetime
  date_résolution:  datetime?
  
  // Suivi
  notes:            Note[]
  rappels:          Rappel[]
}

type StatutAction =
  | "à_faire"
  | "en_cours"
  | "en_attente"          // bloquée par une dépendance externe
  | "résolu"
  | "ignoré"

Note {
  id:               uuid
  action_id:        uuid
  contenu:          string
  date:             datetime
  auteur:           "utilisateur" | "ia"
}

Rappel {
  id:               uuid
  action_id:        uuid
  date:             datetime
  envoyé:           boolean
}
```

---

## 11. Niveau 8 — Règles de détection

Les règles sont la **logique de détection** des signaux. Elles s'exécutent automatiquement après chaque mise à jour de la grille.

### Schéma

```typescript
Règle {
  id:               uuid
  
  // Identification
  code:             string                    // "R01" — stable, non modifiable
  label:            string                    // "Axe sans acteur"
  description:      string                    // explication de la règle
  
  // Condition (exprimée en logique de requête)
  condition:        RègleCondition
  
  // Signal généré
  signal_type:      TypeSignal
  signal_sévérité:  "critique" | "moyen" | "vigilance"
  signal_titre:     string                   // template avec variables
  signal_description: string                 // template avec variables
  signal_recommandation: string?
  
  // Applicabilité
  secteurs:         string[]                 // [] = universel
                                             // ["médecine"] = sectoriel
  axes:             string[]                 // [] = tous les axes
  facettes:         FacetteWSF[]             // [] = toutes les facettes
  
  // Statut
  actif:            boolean
  priorité:         number                   // ordre d'exécution
}

RègleCondition {
  type:             "count" | "ratio" | "relation" | "comparaison" | "pattern"
  // Exemples :
  // count: { axe: X, facette: Y, operateur: "=", valeur: 0 }
  // ratio: { objet: A, relations_entrantes: "utilise", seuil: 0.6 }
  // relation: { objet_type: "acteur", relation: "coordonne", count: 0 }
  paramètres:       Record<string, any>
}
```

---

## 12. Les 9 facettes WSF

Référence complète des 9 facettes du Work System Framework (Steven Alter, 2013), adaptées au contexte Lugia.

| # | Code | Label | WSF officiel | Question clé | Description |
|---|---|---|---|---|---|
| ① | `patients` | Patients | Customers | *Qui bénéficie ?* | Bénéficiaires directs et indirects — patients, clients internes, régulateurs |
| ② | `soins` | Soins | Products & Services | *Qu'est-ce qui est produit ?* | Livrables, services, documents — ordonnances, CR, certificats, protocoles |
| ③ | `actes` | Actes | Processes & Activities | *Comment c'est produit ?* | Étapes, séquences, décisions, processus |
| ④ | `acteurs` | Acteurs | Participants | *Qui fait quoi ?* | Humains impliqués — médecin, secrétaire, infirmier, CPAM |
| ⑤ | `donnees` | Données | Information | *Quelles données circulent ?* | Données médicales, administratives, financières, réglementaires |
| ⑥ | `outils` | Outils | Technologies | *Avec quels outils ?* | Logiciels, plateformes, équipements numériques |
| ⑦ | `contexte` | Contexte | Environment | *Dans quel environnement ?* | Territoire, démographie, réglementation, concurrence, culture |
| ⑧ | `infrastructure` | Infrastructure | Infrastructure | *Sur quelle base physique ?* | Locaux, réseau, matériel médical, hébergement cloud |
| ⑨ | `strategie` | Stratégie | Strategy | *Pourquoi ?* | Objectifs, positionnement, orientations, vision |

### Répartition WSF interne / externe

Alter distingue 4 éléments **internes** (le travail lui-même) et 5 **externes** (le contexte) :

```
INTERNES (le cœur du système de travail)
  ③ Actes          — Processes & Activities
  ④ Acteurs         — Participants
  ⑤ Données         — Information
  ⑥ Outils          — Technologies

EXTERNES (l'environnement du système)
  ① Patients        — Customers
  ② Soins           — Products & Services
  ⑦ Contexte        — Environment
  ⑧ Infrastructure  — Infrastructure
  ⑨ Stratégie       — Strategy
```

---

## 13. Les 8 axes organisationnels

### Définitions détaillées

#### Axe 1 — Cœur de métier
**Ce que l'organisation sait faire intrinsèquement**

- Compétences cliniques, expertise, actes spécialisés
- Ce que le professionnel *est* et *produit* par son travail direct
- Indépendant de l'organisation humaine autour
- *Question clé : Si on enlève tout le reste, qu'est-ce qui reste ?*

Exemples médecine : consultation, diagnostic, prescription, vaccination, geste technique

#### Axe 2 — Parcours patient / client
**Ce que le bénéficiaire vit de bout en bout**

- Séquence d'expérience du point de vue du patient
- De la prise de conscience du besoin jusqu'à la résolution
- Inclut les moments de contact ET les moments invisibles (attente, coordination)
- *Question clé : Qu'est-ce que le patient traverse ?*

Exemples médecine : découverte du cabinet → prise de RDV → accueil → consultation → ordonnance → suivi → orientation

#### Axe 3 — Processus & Admin
**Ce qui tourne en arrière-plan pour que tout fonctionne**

- Opérations back-office, coordination, gestion
- Ce que le patient ne voit pas mais qui conditionne son expérience
- *Question clé : Qu'est-ce qui doit se passer pour que le cœur de métier tourne ?*

Exemples médecine : gestion agenda, vérification droits, cotation, télétransmission FSE, courriers

#### Axe 4 — Équipe & RH
**Qui compose l'organisation et comment elle fonctionne**

- Recrutement, onboarding, management, formation, planification
- Conditions de travail, culture, qualité de vie au travail
- *Question clé : Qui est là, comment sont-ils organisés, comment évoluent-ils ?*

Exemples médecine : médecin, secrétaire, internes, remplaçants, DPC, organisation des gardes

#### Axe 5 — Outils, Données & Infrastructure
**Ce avec quoi on travaille**

- Technologies : logiciels, plateformes, applications
- Données : ce qui est collecté, stocké, échangé
- Infrastructure : locaux, matériel physique, réseau, hébergement
- *Question clé : Sur quoi repose l'activité concrètement ?*

Exemples médecine : logiciel médical, DMP, Doctolib, e-biologie, HDS, lecteur CPS, tensiomètre

> Note : cet axe regroupe 3 facettes WSF (Outils, Données, Infrastructure) car dans une petite organisation, la frontière entre les trois est rarement pertinente opérationnellement.

#### Axe 6 — Finance
**Ce que ça coûte et ce que ça rapporte**

- Revenus, honoraires, facturation, remboursements
- Charges, investissements, amortissements
- Trésorerie, résultat, pilotage financier
- *Question clé : Comment l'organisation crée-t-elle et capture-t-elle de la valeur économique ?*

Exemples médecine : cotation CCAM/NGAP, tiers payant, FSE, BNC, comptabilité, expert-comptable

#### Axe 7 — Conformité, Sécurité & Éthique
**Ce qui contraint et ce qui protège**

- Obligations réglementaires (RGPD, HDS, déontologie, normes)
- Sécurité des données, des personnes, des actes
- Éthique professionnelle et valeurs
- *Question clé : Quelles règles doit-on respecter, et comment s'en assure-t-on ?*

Exemples médecine : RGPD/HDS, code de déontologie, assurance RCP, CCAM, HAS, ordre des médecins

#### Axe 8 — Stratégie & Environnement
**Pourquoi et dans quel monde**

- Objectifs stratégiques, vision, positionnement
- Contexte externe : territoire, marché, concurrence, tendances
- Environnement réglementaire global (distinct des règles opérationnelles de l'axe 7)
- *Question clé : Où va-t-on, pourquoi, et quel est le contexte qui nous y contraint ou nous y aide ?*

Exemples médecine : désert médical, stratégie MSP/CPTS, objectifs qualité, succession, vision à 5 ans

---

## 14. Protocole d'extraction IA

### 14.1 Vue d'ensemble

L'IA conduit un interview conversationnel et extrait en parallèle les objets, relations et signaux potentiels. L'extraction peut se faire :

- **En temps réel** : à chaque réplique, l'IA extrait et met à jour la grille (mode avancé)
- **Post-interview** : l'IA analyse la transcription complète (mode initial recommandé)

### 14.2 Prompt système de l'extracteur

L'extracteur IA reçoit :

```
CONTEXTE
- Organisation : {nom}, {secteur}, {sous_secteur}
- Grille existante : {état_actuel_de_la_grille}
- Objets déjà identifiés : {liste_objets}

INSTRUCTION
Pour chaque information extraite de la conversation, produis un JSON structuré 
selon le schéma Objet (voir spec). 

Pour chaque objet :
1. Identifie le label normalisé (minuscules, sans accents)
2. Détermine la facette WSF parmi les 9 options
3. Détermine l'axe et le thème les plus pertinents
4. Liste les situations contextuelles associées
5. Extrais la phrase source exacte
6. Score ta confiance (0.0 → 1.0)
7. Identifie les relations avec les objets déjà connus

RÈGLES D'EXTRACTION
- Un objet = une entité réelle identifiable (pas un concept abstrait)
- Si ambiguïté entre deux facettes, choisis la plus précise
- Si ambiguïté entre deux axes, crée une relation "référencé_dans" vers le secondaire
- Ne crée pas d'objet avec confiance < 0.3
- Signale les contradictions avec la grille existante
```

### 14.3 Logique d'extraction phrase par phrase

```
Entrée : phrase utilisateur
Sortie : liste d'objets + relations + signaux potentiels

Étape 1 — Identification des entités
  Recherche de : noms propres, outils, rôles, actes, documents, 
                 règles, lieux, objectifs, problèmes
  
Étape 2 — Typage WSF
  Pour chaque entité :
  - Personne / rôle → Acteurs
  - Outil / logiciel / équipement → Outils
  - Document / donnée / fichier → Données ou Soins
  - Étape / action / processus → Actes
  - Bénéficiaire → Patients
  - Règle / loi / norme → Contexte
  - Locaux / réseau / matériel → Infrastructure
  - Objectif / vision → Stratégie

Étape 3 — Placement dans la grille
  Axe ← déterminé par le contexte de la phrase
  Domaine ← déterminé par la catégorie fonctionnelle
  Thème ← déterminé par l'activité spécifique

Étape 4 — Déduplication
  Comparer label_normalisé avec objets existants
  Si match > 0.85 → référencer l'existant
  Si match 0.6-0.85 → proposer fusion, confiance = 0.7
  Si match < 0.6 → créer nouvel objet

Étape 5 — Relations
  Détecter les verbes de liaison dans la phrase :
  "utilise" → relation utilise
  "gère", "s'occupe de" → relation coordonne
  "produit", "génère" → relation produit
  "dépend de", "nécessite" → relation dépend_de
  "remplace", "a remplacé" → relation remplace

Étape 6 — Signaux potentiels
  Vérifier si la phrase révèle un signal :
  "je fais tout moi-même" → dépendance_unique
  "on n'a pas de..." → absence
  "c'est compliqué", "ça ne marche pas" → signal à investiguer
  "je ne sais pas si..." → zone d'incertitude
```

### 14.4 Questions de relance générées automatiquement

Après chaque mise à jour de la grille, l'IA identifie les **cellules vides critiques** et génère des questions de relance :

```
Axe Finance × Facette Outils → 0 objets
→ Question : "Avec quel outil suivez-vous vos revenus et votre trésorerie ?"

Axe Équipe & RH × Facette Actes → 0 objets
→ Question : "Comment se passe l'intégration d'un nouveau membre dans votre équipe ?"

Axe Stratégie × Facette Patients → 0 objets
→ Question : "À quels types de patients souhaitez-vous vous adresser en priorité ?"

Objet "Secrétaire" avec >5 actes assignés, 0 outil
→ Question : "Votre secrétaire utilise-t-elle des outils numériques pour gérer ces tâches ?"
```

### 14.5 Format de sortie de l'extracteur

```json
{
  "objets": [
    {
      "label": "Doctolib",
      "label_normalisé": "doctolib",
      "facette_wsf": "outils",
      "axe": "processus_admin",
      "domaine": "Gestion Administrative",
      "thème": "Agenda",
      "type_local": "Essentiel",
      "situations": ["Prise de RDV en ligne", "Rappels automatiques", "Urgences du jour"],
      "extrait_source": "j'utilise Doctolib pour mes rendez-vous, les patients peuvent prendre RDV en ligne",
      "confiance": 0.95,
      "relations_détectées": [
        {
          "cible_label_normalisé": "secretaire",
          "type": "utilise",
          "sens": "unidirectionnel",
          "confiance": 0.8
        }
      ]
    }
  ],
  "signaux_potentiels": [
    {
      "type": "absence",
      "description": "Aucun outil de facturation mentionné pour l'axe Finance",
      "sévérité": "moyen",
      "confiance": 0.7
    }
  ],
  "questions_relance": [
    "Avec quel logiciel gérez-vous votre facturation et votre comptabilité ?"
  ]
}
```

---

## 15. Règles de détection — catalogue initial

### Règles universelles (tous secteurs)

#### R01 — Axe sans acteur
```
Code:       R01
Label:      Axe sans acteur identifié
Condition:  COUNT(Objets) WHERE axe=X AND facette="acteurs" = 0
            pour tout axe X actif
Sévérité:   critique
Signal:     "Aucun acteur identifié pour l'axe {axe.label}"
Recommandation: "Identifier qui est responsable de cet axe dans votre organisation"
Secteurs:   []  (universel)
```

#### R02 — Dépendance unique sur un objet
```
Code:       R02
Label:      Point unique de défaillance
Condition:  COUNT(relations_entrantes WHERE type="utilise") / 
            COUNT(Objets total) > 0.6
            pour un même objet
Sévérité:   critique
Signal:     "{objet.label} est impliqué dans {ratio}% des activités — 
             sa défaillance impacte tout le système"
Recommandation: "Identifier des alternatives ou des procédures de secours"
Secteurs:   []
```

#### R03 — Thème sans outil
```
Code:       R03
Label:      Activité sans support numérique
Condition:  COUNT(Objets) WHERE thème=X AND facette="outils" = 0
            ET COUNT(Objets) WHERE thème=X AND facette="actes" > 0
Sévérité:   moyen
Signal:     "Le thème {thème.label} a des activités identifiées mais aucun outil"
Recommandation: "Vérifier si des outils existent pour cette activité ou si elle est 100% manuelle"
Secteurs:   []
```

#### R04 — Acteur sans outil sur un périmètre large
```
Code:       R04
Label:      Acteur sous-outillé
Condition:  Un acteur est assigné comme Principal sur > 3 thèmes
            ET a 0 relation "utilise" vers un outil
Sévérité:   moyen
Signal:     "{acteur.label} gère {count} thèmes sans outil identifié"
Recommandation: "Identifier les outils que cet acteur utilise réellement"
Secteurs:   []
```

#### R05 — Soin sans responsable
```
Code:       R05
Label:      Livrable sans responsable
Condition:  Un objet de facette "soins" n'a aucune relation entrante 
            depuis un objet de facette "acteurs"
Sévérité:   critique
Signal:     "{soin.label} est produit mais aucun acteur n'en est responsable"
Recommandation: "Clarifier qui est responsable de la production de ce livrable"
Secteurs:   []
```

#### R06 — Axe Finance vide
```
Code:       R06
Label:      Axe Finance non renseigné
Condition:  COUNT(Objets) WHERE axe="finance" = 0
Sévérité:   moyen
Signal:     "La dimension financière de l'organisation n'a pas été renseignée"
Recommandation: "Explorer comment l'organisation génère et gère ses revenus"
Secteurs:   []
```

#### R07 — Stratégie sans lien avec les actes
```
Code:       R07
Label:      Objectif stratégique non traduit en actions
Condition:  Un objet de facette "strategie" n'a aucune relation
            vers un objet de facette "actes"
Sévérité:   vigilance
Signal:     "L'objectif '{strategie.label}' n'est relié à aucun processus concret"
Recommandation: "Identifier quelles activités concrètes servent cet objectif"
Secteurs:   []
```

#### R08 — Contexte sans réponse stratégique
```
Code:       R08
Label:      Facteur contextuel sans réponse identifiée
Condition:  Un objet de facette "contexte" de sévérité élevée
            n'a aucune relation vers un objet de facette "strategie" ou "actes"
Sévérité:   vigilance
Signal:     "Le facteur contextuel '{contexte.label}' n'a pas de réponse organisationnelle"
Recommandation: "Définir comment l'organisation répond à ce facteur"
Secteurs:   []
```

#### R09 — Acteur en silo
```
Code:       R09
Label:      Acteur sans coordination avec les autres
Condition:  Un acteur n'a aucune relation "coordonne" (entrante ou sortante)
            ET est assigné sur > 2 thèmes
Sévérité:   vigilance
Signal:     "{acteur.label} travaille de manière isolée — aucune coordination identifiée"
Recommandation: "Vérifier comment cet acteur interagit avec le reste de l'équipe"
Secteurs:   []
```

#### R10 — Conformité sans couverture outil
```
Code:       R10
Label:      Obligation réglementaire sans outil de conformité
Condition:  Un objet de facette "contexte" de type réglementaire
            n'a aucune relation vers un objet de facette "outils" ou "actes"
Sévérité:   moyen
Signal:     "L'obligation '{contexte.label}' n'est couverte par aucun outil ni processus"
Recommandation: "Identifier comment cette obligation est actuellement respectée"
Secteurs:   []
```

### Règles sectorielles — Médecine générale

#### R-MED-01 — DMP non alimenté
```
Code:       R-MED-01
Label:      DMP non mentionné ou non utilisé
Condition:  Aucun objet avec label_normalisé="dmp" 
            OU objet DMP sans relation "produit" depuis un acte
Sévérité:   moyen
Signal:     "Le Dossier Médical Partagé ne semble pas intégré à la pratique"
Secteurs:   ["médecine_générale"]
```

#### R-MED-02 — Facturation sans télétransmission
```
Code:       R-MED-02
Label:      Facturation sans circuit de télétransmission
Condition:  Axe Finance a des objets "facturation" 
            mais aucun objet lié à SESAM-Vitale ou FSE
Sévérité:   critique
Signal:     "Aucun circuit de télétransmission identifié — risque de pertes financières"
Secteurs:   ["médecine_générale"]
```

#### R-MED-03 — Permanence des soins non couverte
```
Code:       R-MED-03
Label:      Continuité des soins hors heures non organisée
Condition:  Aucun objet dans thème "Permanence des soins"
Sévérité:   vigilance
Signal:     "La permanence des soins (gardes, astreintes) n'est pas documentée"
Secteurs:   ["médecine_générale"]
```

### Règles temporelles — Dynamique du changement

#### R11 — Signal chronique sans amélioration
```
Code:       R11
Label:      Signal chronique non résolu
Condition:  Signal.durée_jours > 90
            ET Signal.vélocité IN ["se_dégrade", "stable"]
            ET Signal.statut NOT IN ["résolu", "ignoré", "faux_positif"]
Sévérité:   critique
Signal:     "{signal.titre} — situation chronique non résolue depuis {durée_jours} jours"
Recommandation: "Ce signal est ouvert depuis plus de 3 mois sans amélioration.
                 Les situations non traitées sur la durée se normalisent dans les habitudes
                 et deviennent plus difficiles à changer."
Secteurs:   []
```

### Règles inter-systèmes — Flux sortants

#### R12 — Flux sortant absent sur un acte clinique
```
Code:       R12
Label:      Acte clinique sans transmission vers l'écosystème
Condition:  Un objet facette="actes" de l'axe coeur_metier
            n'a aucune relation sortante de type
            ["transmet_à", "adresse_vers", "contribue_à"]
            ET cet acte a une relation "produit" vers un objet facette="soins"
Sévérité:   vigilance
Signal:     "'{acte.label}' produit un résultat mais ne le transmet à aucun acteur externe"
Recommandation: "Vérifier si ce soin est partagé avec le patient, un confrère ou
                 alimenté dans le DMP."
Secteurs:   []
Note:       "Exemple typique : vaccination réalisée sans mise à jour DMP ni
             carnet vaccinal → la donnée reste dans le cabinet, invisible pour
             les autres professionnels de santé."
```

#### R13 — Isolement écosystème
```
Code:       R13
Label:      Cabinet sans relation vers un type d'acteur externe attendu
Condition:  Aucun objet externe de catégorie X détecté
            ET la catégorie X est attendue pour le secteur
Sévérité:   moyen (si catégorie="reseau") | vigilance (autres catégories)
Signal:     "Aucune relation identifiée avec {catégorie_label} — 
             isolement potentiel sur cette dimension"
Recommandation: selon catégorie :
  reseau           → "Avez-vous des contacts avec une CPTS ou une MSP sur votre territoire ?"
  etablissement    → "Comment adressez-vous vos patients vers l'hôpital ?"
  professionnel_sante → "Avec quels paramédicaux êtes-vous en lien régulier ?"
Secteurs:   ["médecine_générale"]
Catégories_attendues_médecine:
  assurance_maladie    (obligatoire — signal critique si absent)
  professionnel_sante  (attendu — signal moyen si absent)
  etablissement        (attendu — signal moyen si absent)
  patient              (obligatoire — signal critique si absent)
  reseau               (recommandé — signal vigilance si absent)
```

### Règles de santé fonctionnelle — Corpus Alter [v0.5]

> Ces règles ne mesurent plus la présence/absence d'éléments (santé structurelle) mais la correspondance entre le système conçu et le travail réel (santé fonctionnelle). Elles complètent les règles structurelles R01-R13 sans les remplacer.

#### R14 — Workaround détecté
```
Code:       R14
Label:      Contournement d'un outil ou processus officiel
Condition:  L'extrait_source d'un objet ou d'une relation contient
            le lexique de workaround
            ET il existe une relation vers un objet facette="outils"
               ou facette="actes"
Lexique:    "je contourne", "je ne fais pas vraiment", "je ne le fais
            pas systématiquement", "quand j'ai le temps", "je bricole",
            "j'ai trouvé un moyen de", "ça ne marche pas donc je",
            "en théorie oui mais en pratique", "officiellement... mais",
            "je note sur papier à la place", "je passe par autre chose"
Sévérité:   moyen
Signal:     "Contournement détecté : '{objet.label}' n'est pas utilisé
            comme prévu — {extrait_source}"
Recommandation: "Un contournement n'est pas une faute : c'est le signe que
                 l'outil ou le processus ne correspond pas au travail réel.
                 Soit l'outil doit s'adapter, soit le contournement révèle
                 une meilleure pratique à officialiser."
Effet N4:   stabilité de l'objet contourné -= 0.20 (voir section 18.2)
Secteurs:   []
Note:       "Signal le plus honnête qu'une organisation puisse émettre.
             Source : Theory of Workarounds (Alter, 2014) + axiomes
             A18 (agency) et A19 (compliance/noncompliance).
             Un workaround peut être bénéfique (à officialiser) ou
             nuisible (à corriger) — la règle le détecte, l'IA en
             interview en qualifie la nature."
```

#### R15 — Trou fonctionnel sur un thème actif
```
Code:       R15
Label:      Facette de travail fondamentale absente
Condition:  Un thème actif (au moins 1 objet structurel)
            a une completude_fonctionnelle = 0
            (aucune des 3 facettes : décider / communiquer / coordonner)
Sévérité:   vigilance
Signal:     "Sur '{thème.label}', on sait ce qui se passe mais pas
            comment le travail se décide, se communique ou se coordonne"
Recommandation: selon la facette manquante (questions posées en interview Phase 3) :
  décider     → "Qui décide quand il y a une exception sur ce point ?"
  communiquer → "Comment l'information circule-t-elle sur ce sujet ?"
  coordonner  → "Comment vous coordonnez-vous là-dessus avec les autres ?"
Secteurs:   []
Note:       "Distinct de R-vide (structurel). Un thème peut être plein
             d'objets (acteurs, outils, données) tout en n'ayant aucun
             mécanisme de décision/communication/coordination identifié.
             Source : Facets of Work (Alter, 2021), restreint à 3 des
             18 facettes pour rester actionnable."
```

> **Note sur les principes WST non transformés en règles.** Les principes P05 (latitude de jugement), P06 (corriger à la source) et P11 (alignement des incitations) seraient trop générateurs de faux positifs en détection automatique. Ils sont intégrés comme **questions ciblées de Phase 3 du protocole d'interview**, pas comme règles N8. Voir `lugia_interview_protocol.md` et `lugia_complement_alter.md`.

---

## 16. Énumérations & Vocabulaire contrôlé

### Types locaux par facette (médecine générale)

```
facette "acteurs"
  Principal | Support | Partenaire | Externe | Acteur | Salarié

facette "outils"
  Essentiel | Courant | Optionnel | Infrastructure nationale

facette "actes"
  Étape clinique | Étape admin | Étape technique | Étape relationnelle | Étape légale

facette "contexte"
  Réglementaire | Territorial | Démographique | Organisationnel | Culturel

facette "soins"
  Document médical | Document légal | Document partagé | Notification | Données | Flux électronique

facette "patients"
  Primaire | Secondaire | Intermédiaire | Interne | Réglementaire

facette "donnees"
  Médicale | Administrative | Financière | Juridique | Échange | Document | Santé publique

facette "infrastructure"
  Matériel | Réseau | Cloud | Locaux | Énergie | Réseau national

facette "strategie"
  Objectif clinique | Objectif économique | Objectif social | Objectif territorial | Objectif éthique | Objectif relationnel
```

### Secteurs supportés (v0.1)

```
médecine_générale
médecine_spécialisée
cabinet_infirmier
cabinet_kinésithérapie
pharmacie
cabinet_dentaire
(à compléter)
```

---

## 17. Exemples d'extraction

### Exemple 1 — Phrase simple

**Input utilisateur :**
> "J'utilise Doctolib pour la prise de RDV, c'est ma secrétaire qui gère l'agenda."

**Output extracteur :**

```json
{
  "objets": [
    {
      "label": "Doctolib",
      "label_normalisé": "doctolib",
      "facette_wsf": "outils",
      "axe": "processus_admin",
      "thème": "Agenda",
      "type_local": "Essentiel",
      "situations": ["Prise de RDV en ligne"],
      "extrait_source": "J'utilise Doctolib pour la prise de RDV",
      "confiance": 0.95
    },
    {
      "label": "Secrétaire",
      "label_normalisé": "secretaire",
      "facette_wsf": "acteurs",
      "axe": "processus_admin",
      "thème": "Agenda",
      "type_local": "Principal",
      "situations": ["Gestion agenda"],
      "extrait_source": "c'est ma secrétaire qui gère l'agenda",
      "confiance": 0.9
    }
  ],
  "relations": [
    {
      "source": "secretaire",
      "cible": "doctolib",
      "type": "utilise",
      "confiance": 0.85
    }
  ],
  "signaux_potentiels": [],
  "questions_relance": []
}
```

---

### Exemple 2 — Phrase révélant un risque

**Input utilisateur :**
> "Pour tout ce qui est comptabilité et finances, je m'en occupe moi-même, j'ai pas vraiment d'outil, je fais ça sur Excel."

**Output extracteur :**

```json
{
  "objets": [
    {
      "label": "Médecin généraliste",
      "label_normalisé": "medecin_generaliste",
      "facette_wsf": "acteurs",
      "axe": "finance",
      "thème": "Comptabilité",
      "type_local": "Principal",
      "situations": ["Gestion comptabilité", "Pilotage financier"],
      "extrait_source": "je m'en occupe moi-même",
      "confiance": 0.9
    },
    {
      "label": "Excel",
      "label_normalisé": "excel",
      "facette_wsf": "outils",
      "axe": "finance",
      "thème": "Comptabilité",
      "type_local": "Optionnel",
      "situations": ["Suivi financier manuel"],
      "extrait_source": "je fais ça sur Excel",
      "confiance": 0.95
    }
  ],
  "relations": [
    {
      "source": "medecin_generaliste",
      "cible": "excel",
      "type": "utilise",
      "confiance": 0.9
    }
  ],
  "signaux_potentiels": [
    {
      "type": "dépendance_unique",
      "description": "Le médecin gère seul la comptabilité sans outil dédié",
      "sévérité": "moyen",
      "objets": ["medecin_generaliste"],
      "confiance": 0.8
    },
    {
      "type": "absence",
      "description": "Pas d'expert-comptable ou de logiciel BNC identifié",
      "sévérité": "vigilance",
      "confiance": 0.7
    }
  ],
  "questions_relance": [
    "Faites-vous appel à un expert-comptable pour votre déclaration fiscale annuelle ?",
    "Avez-vous déjà envisagé un logiciel de comptabilité dédié aux professions médicales ?"
  ]
}
```

---

### Exemple 3 — Phrase ambiguë

**Input utilisateur :**
> "On a des problèmes avec le logiciel, ça rame souvent."

**Output extracteur :**

```json
{
  "objets": [
    {
      "label": "Logiciel (non identifié)",
      "label_normalisé": "logiciel_inconnu",
      "facette_wsf": "outils",
      "axe": "outils_data_infra",
      "thème": "Infrastructure numérique",
      "type_local": null,
      "situations": [],
      "extrait_source": "on a des problèmes avec le logiciel, ça rame souvent",
      "confiance": 0.4
    }
  ],
  "signaux_potentiels": [
    {
      "type": "fragilité",
      "description": "Problème de performance sur un outil non identifié",
      "sévérité": "vigilance",
      "confiance": 0.6
    }
  ],
  "questions_relance": [
    "De quel logiciel s'agit-il ? Votre logiciel médical, votre agenda, ou un autre outil ?",
    "Ces problèmes affectent-ils votre activité au quotidien ?"
  ]
}
```

---

## 18. Modélisation du changement dans le temps

La grille Lugia est un instantané — elle dit *ce qui est*. Pour modéliser *comment l'organisation évolue*, trois mécanismes complémentaires s'empilent.

### 18.1 Les snapshots (Niveau 0)

Après chaque session, un snapshot complet de la grille est archivé avec sa date. La comparaison entre snapshots révèle le changement global.

```typescript
GrilleSnapshot {
  id:               uuid
  organisation_id:  uuid
  interview_id:     uuid            // session qui a produit ce snapshot
  date_snapshot:    datetime
  payload:          json            // état complet de la grille à cet instant
  axes_scores:      Record<string, number>  // score de complétude par axe
  nb_objets:        number
  nb_signaux_ouverts: number
  nb_actions_en_cours: number
}
```

**Ce que ça permet** : voir si le cabinet progresse globalement entre deux sessions. Calculer des tendances sur 6 ou 12 mois.

**Ce que ça ne capture pas** : comment chaque objet individuel a évolué dans sa vie propre.

---

### 18.2 Le cycle de vie des objets (Niveau 4)

Chaque objet N4 porte maintenant un bloc `cycle_de_vie` (voir section 7) qui modélise son état et sa direction :

```
Doctolib
  statut: "actif" | stabilité: 0.9 | tendance: "stable"
  → Outil ancré depuis 3 ans, aucun mouvement

Procédure de continuité Crossway
  statut: "emergent" | stabilité: 0.3 | tendance: "croissant"
  → Créée il y a 2 mois, pas encore ancrée dans les habitudes
  → note: "posée dans un tiroir — à tester en conditions réelles"

Fax (envoi résultats labo)
  statut: "en_transition" | stabilité: 0.2 | tendance: "décroissant"
  → En cours de remplacement par e-biologie
  → note: "encore utilisé par 2 laboratoires qui n'ont pas e-biologie"
```

**Ce que ça permet** : distinguer ce qui est *actif* de ce qui est *ancré*. Un outil utilisé une fois n'a pas la même valeur qu'un outil intégré depuis 2 ans.

**Règle de mise à jour de la stabilité** :
```
À chaque session où l'objet est mentionné positivement :
  stabilité += 0.1 (capped at 1.0)

À chaque session où l'objet est mentionné avec une tension :
  stabilité -= 0.15

[v0.5] Si un workaround est détecté sur l'objet (signal R14) :
  stabilité -= 0.20
  → malus plus fort que la tension simple : un contournement
    signale un désalignement actif entre le système conçu et le
    travail réel, plus grave qu'une simple difficulté ponctuelle
  → renforce la transition actif → fragilisé

Si l'objet n'est pas mentionné pendant 2 sessions consécutives :
  tendance → "décroissant"

Si statut == "emergent" et stabilité > 0.6 après 2 sessions :
  statut → "actif" automatiquement

[v0.5] Si statut == "actif" et stabilité < 0.35 (SEUIL_FRAGILITE) :
  statut → "fragilisé" automatiquement
  → un objet contourné à répétition bascule en fragilisé
```

---

### 18.3 La vélocité des signaux (Niveau 6)

Chaque signal N6 porte maintenant un bloc de vélocité (voir section 9) qui indique si la situation s'améliore ou se dégrade :

```
Signal : Désynchronisation Doctolib ↔ Crossway
  statut: "en_cours"
  vélocité: "s_améliore"
  delta_sessions: +18
  durée_jours: 45
  → Le problème était critique, il est en cours de résolution

Signal : DMP non alimenté systématiquement
  statut: "ouvert"
  vélocité: "se_dégrade"
  delta_sessions: -5
  durée_jours: 180
  → Signal chronique qui empire — urgent d'agir
  → Déclenche une règle R-CHRONO-01 (signal ouvert > 90 jours sans amélioration)
```

**Ce que ça permet** : distinguer un signal récent d'un signal chronique. Prioriser les actions sur les signaux qui se dégradent.

---

### 18.4 Nouvelle règle de détection — Signal chronique

```json
{
  "id": "regle-R11",
  "code": "R11",
  "label": "Signal chronique sans amélioration",
  "condition": {
    "type": "durée",
    "paramètres": {
      "durée_min_jours": 90,
      "vélocité": ["se_dégrade", "stable"],
      "statuts_exclus": ["résolu", "ignoré", "faux_positif"]
    }
  },
  "signal_type": "fragilité",
  "signal_sévérité": "critique",
  "signal_titre": "{signal.titre} — situation chronique non résolue",
  "signal_description": "Ce signal est ouvert depuis {durée_jours} jours sans amélioration détectée. Les situations non traitées sur la durée tendent à se normaliser dans les habitudes et deviennent plus difficiles à changer.",
  "secteurs": [],
  "actif": true,
  "priorité": 1
}
```

---

### 18.5 Ce que ça donne visuellement sur la carte

La carte de capacité peut maintenant utiliser **3 dimensions visuelles** :

```
Couleur de fond du domaine  → complétude (grisé → coloré plein)
Intensité de la couleur     → stabilité (pâle = emergent, saturé = ancré)
Icône de tendance           → direction (↗ croissant · → stable · ↘ décroissant)
```

Et sur le schéma relationnel :
```
Épaisseur du lien           → poids de la relation
Couleur du lien             → type (bleu = utilise, rouge = dépend_de, etc.)
Style du lien               → statut (plein = actif, pointillé = en_transition)
Pulsation                   → signal ouvert sur cet objet (animation légère)
```

---

### 18.6 Exemple complet — Dr Martin sur 3 sessions

```
Session 1 — juin 2026
  Crossway : statut=actif, stabilité=0.9, tendance=stable
  Signal dépendance_unique : vélocité=inconnu, durée=0j
  Action "procédure de continuité" : statut=à_faire

Session 2 — septembre 2026
  Dr Martin : "j'ai fait la procédure, elle est dans un tiroir"
  Crossway : inchangé
  Procédure continuité (nouvel objet) : statut=emergent, stabilité=0.3, tendance=croissant
  Signal dépendance_unique : vélocité=s_améliore, delta=+15, durée=92j
  Action "procédure de continuité" : statut=résolu

Session 3 — décembre 2026
  Dr Martin : "on l'a testée lors d'une panne en octobre, ça a bien tenu"
  Procédure continuité : statut=actif, stabilité=0.75, tendance=croissant
                         note="testée en conditions réelles oct. 2026"
  Signal dépendance_unique : statut=résolu, vélocité=s_améliore
  → Signal supprimé de la vue active, archivé dans l'historique

Vue radar — évolution sur 6 mois :
  Outils & Données : 80% → 82% → 88%  (progression visible)
  Conformité : 55% → 55% → 60%  (légère progression)
```

---

## 19. Décisions d'architecture

~~Questions ouvertes~~ — **Toutes arbitrées le 03/06/2026.**

---

### Architecture

**Q1 — Base de données**
✅ **PostgreSQL** — relationnel standard, suffisant pour démarrer. Les relations entre objets se modélisent avec des tables de jonction + JSONB pour les métadonnées libres. Migration vers un graphe (Neo4j) possible plus tard si les requêtes de traversée complexes deviennent un besoin réel.

**Q2 — Multi-tenant**
✅ **Multi-tenant avec isolation par `organisation_id` (Row-Level Security PostgreSQL)** — une instance partagée, filtrage strict par org à chaque requête. Pas de base séparée par cabinet (trop coûteux à opérer). Toutes les tables portent `organisation_id` comme clé de partitionnement logique.

**Q3 — Versioning de la grille**
✅ **Snapshots datés après chaque interview** — l'état courant est maintenu en continu ; après chaque session, un snapshot complet de la grille est archivé avec sa date. Pas d'event sourcing micro-changement par micro-changement. Les snapshots permettent de visualiser l'évolution du cabinet entre deux sessions sans exploser le stockage.

```
grille_snapshots
  ├── id
  ├── organisation_id
  ├── interview_id         ← snapshot lié à la session qui l'a produit
  ├── date_snapshot
  ├── payload              ← JSONB — état complet de la grille à cet instant
  └── axes_scores          ← JSONB — scores de complétude par axe
```

---

### Extraction IA

**Q4 — Timing d'extraction**
✅ **Hybride — extraction en arrière-plan, résultats affichés à la fin** — l'IA conduit la conversation en premier plan. En parallèle, un processus d'extraction tourne silencieusement sur chaque échange (sans interrompre le flux). Les objets extraits ne sont pas affichés pendant l'interview — ils apparaissent seulement dans l'écran de révision post-interview. Avantage : la conversation reste fluide ET l'extraction bénéficie du contexte progressif (chaque échange enrichit la compréhension des échanges précédents).

```
Architecture hybride :
  Thread A (foreground) : conversation IA ↔ médecin
  Thread B (background) : extracteur analyse chaque échange au fil de l'eau
                          → accumule les objets dans un buffer
                          → n'affiche rien pendant l'interview
  Post-interview :
    → buffer consolidé
    → déduplication
    → évaluation des règles
    → écran de révision présenté au médecin
```

**Q5 — Modèle IA**
✅ **Claude Sonnet pour tout en V1** — interview ET extraction. L'extraction est la pièce critique : un objet mal typé ou une relation manquée fausse tout ce qui suit. Le surcoût vs Haiku est négligeable pour une session de 30 min. Révision possible en V2 pour des tâches répétitives à faible enjeu (déduplication, normalisation de labels).

**Q6 — Gestion des contradictions**
✅ **Marquage `ambigu` sur les deux objets, décision différée à la validation** — quand l'utilisateur dit A puis B incompatible avec A, les deux objets sont créés avec `statut = "ambigu"` et `confiance` réduite. Un signal de type `contradiction` est généré, qui remonte dans l'écran de révision. L'utilisateur tranche lui-même lors de la validation. On ne supprime jamais automatiquement — l'utilisateur peut avoir voulu dire les deux (contextes différents) ou avoir simplement changé d'avis.

```typescript
// Exemple de marquage ambiguïté
objet_A.statut = "ambigu"
objet_A.confiance = objet_A.confiance * 0.6   // confiance dégradée
objet_B.statut = "ambigu"
objet_B.confiance = objet_B.confiance * 0.6

Signal {
  type: "contradiction",
  sévérité: "moyen",
  objets_impliqués: [objet_A.id, objet_B.id],
  titre: "Contradiction détectée — arbitrage requis",
  description: `"${extrait_A}" semble incompatible avec "${extrait_B}". 
                Lequel reflète la réalité actuelle ?`
}
```

---

### UX & Validation

**Q7 — Présentation pour validation**
✅ **Écran de révision post-interview** — liste structurée de tous les objets extraits, regroupés par axe, avec les objets à faible confiance (< 0.75) et les objets `ambigu` mis en avant. L'utilisateur survole, corrige ce qui est faux, valide le reste en un clic. Pas d'interruption pendant l'interview.

```
Écran de révision :
  ┌─ Axe : Outils & Données ─────────────────────────┐
  │  ✓ Doctolib             [Essentiel]  conf: 0.97  │
  │  ✓ Crossway (LGC)       [Essentiel]  conf: 0.85  │
  │  ⚠ Hébergeur HDS        [À valider]  conf: 0.70  │  ← mis en avant
  │  ⚠ Synchro Doctolib↔LGC [Ambigu]    conf: 0.52  │  ← mis en avant
  └───────────────────────────────────────────────────┘
  [Valider tout] [Corriger un à un]
```

**Q8 — Granularité exposée à l'utilisateur**
✅ **Combinaison en couches** — trois niveaux d'accès selon le profil :

| Couche | Ce que voit l'utilisateur | Profil cible |
|---|---|---|
| Surface | Insights en langage naturel + radar par axe | Médecin |
| Intermédiaire | Liste des objets par axe + signaux + actions | Médecin avancé |
| Profond | Grille 8×9 complète, relations, graphe de dépendance | Consultant / éditeur |

Le médecin arrive toujours sur la couche Surface. Il peut descendre volontairement. Il ne voit jamais de JSON brut.

**Q9 — Objet marqué comme faux par l'utilisateur**
✅ **Marquage `faux_positif`** — l'objet n'est pas supprimé mais exclu de tous les calculs (grille, signaux, actions). Il reste dans la base avec `statut = "faux_positif"` pour traçabilité et amélioration future du modèle d'extraction. Le système génère automatiquement une question de relance pour recapturer la bonne information lors de la prochaine session ou en fin de révision.

```typescript
// Workflow "c'est faux"
objet.statut = "faux_positif"
objet.validé = false
// → exclu de tous les calculs
// → conservé pour dataset d'entraînement futur

QuestionRelance {
  déclencheur: objet.id,
  texte: `Vous avez indiqué que "${objet.label}" n'est pas exact. 
          Pouvez-vous me décrire comment ça fonctionne réellement ?`,
  timing: "fin_de_révision"
}
```

---

### Données & Confidentialité

**Q10 — Transcriptions et conformité HDS**
✅ **Les transcriptions sont considérées comme données de santé — hébergement HDS obligatoire pour tout** — par précaution maximale : un médecin peut spontanément mentionner un nom de patient, un diagnostic, une situation clinique dans l'interview. Le risque de contamination est réel et imprévisible. Décision : toute donnée issue d'un interview médical (transcription brute, objets extraits, grille) est hébergée sur infrastructure HDS certifiée ANS. Pas de distinction transcription / objets structurés — périmètre unifié, politique simple.

```
Périmètre HDS Lugia :
  ✓ Transcriptions d'interview (brutes)
  ✓ Objets extraits et leurs extrait_source
  ✓ Grille et snapshots
  ✓ Signaux et actions
  ✓ Toute métadonnée organisation

Hors HDS (infrastructure standard) :
  ✓ Données de compte utilisateur (email, nom, facturation)
  ✓ Logs techniques d'accès (sans contenu)
  ✓ Données agrégées anonymisées (si Q11 opt-in)
```

**Q11 — Données agrégées pour améliorer les règles**
✅ **Opt-in explicite du cabinet** — la contribution est proposée, jamais imposée. Proposition claire à l'onboarding : *"Contribuer à l'amélioration du système pour tous les cabinets Lugia — vos données sont anonymisées avant toute agrégation."* Les données partagées sont limitées aux patterns de détection (quels types de signaux déclenchés, quels objets fréquemment extraits) — jamais les extrait_source ni les valeurs textuelles libres.

```
Ce qui peut être agrégé (si opt-in) :
  ✓ Distribution des facettes_wsf par secteur
  ✓ Taux de déclenchement des règles de détection
  ✓ Scores de confiance moyens par type d'objet
  ✓ Taux de faux_positif par règle
  ✗ Jamais : extrait_source, labels d'objets libres, contenu transcription
```

**Q12 — Durée de rétention**
✅ **Transcriptions : 30 jours maximum — Grilles : durée de la relation contractuelle**

```
Politique de rétention :
  Transcriptions brutes     → suppression automatique après 30 jours
                               (ou dès validation de l'écran de révision si antérieure)
  Objets extraits           → durée de la relation contractuelle
  Grille courante           → durée de la relation contractuelle
  Snapshots d'interview     → durée de la relation contractuelle
  Données après résiliation → export proposé au cabinet, suppression sous 90 jours

Note : les données Lugia décrivent l'organisation du cabinet (outils, acteurs, 
processus), pas les patients. Elles ne sont pas soumises aux 20 ans du dossier 
médical — ce sont des données professionnelles du médecin, pas des données de santé 
de ses patients.
Exception : si un extrait_source contient des données patient identifiables, 
il est traité selon Q10 (HDS) et supprimé après 30 jours avec la transcription.
```

---

## Synthèse des décisions

| # | Question | Décision | Date |
|---|---|---|---|
| Q1 | Base de données | PostgreSQL + JSONB | 03/06/2026 |
| Q2 | Multi-tenant | organisation_id + RLS | 03/06/2026 |
| Q3 | Versioning | Snapshots post-interview | 03/06/2026 |
| Q4 | Timing extraction | Hybride — arrière-plan, résultats à la fin | 03/06/2026 |
| Q5 | Modèle IA | Claude Sonnet (V1 complet) | 03/06/2026 |
| Q6 | Contradictions | Marquage `ambigu` + différé à validation | 03/06/2026 |
| Q7 | Validation objets | Écran de révision post-interview | 03/06/2026 |
| Q8 | Granularité UX | Couches : insights → radar → grille détaillée | 03/06/2026 |
| Q9 | Objet faux | Marquage `faux_positif` + question de relance | 03/06/2026 |
| Q10 | HDS transcriptions | Tout en HDS — périmètre unifié | 03/06/2026 |
| Q11 | Données agrégées | Opt-in explicite | 03/06/2026 |
| Q12 | Rétention | Transcriptions 30j — Grilles durée contractuelle | 03/06/2026 |

---

*Fin du document — Version 0.2*  
*Toutes les décisions d'architecture sont arbitrées. Prochaine étape : prototype d'extraction IA.*
