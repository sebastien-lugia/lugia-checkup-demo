# Lugia — Exemple de Schéma Complet (N0 → N8)
**Version** 0.1 — Document de travail  
**Projet** Lugia Checkup  
**Auteur** Sébastien / Lugia  
**Date** Juin 2026  
**Complément de** `lugia_schema_spec.md`

---

## Présentation de l'exemple

Ce document modélise un exemple concret et complet du schéma Lugia, de bout en bout — du niveau 0 (Organisation) au niveau 8 (Règles de détection). Il combine trois situations réelles :

**Exemple A — Une phrase de médecin**  
> *"J'utilise Doctolib pour mes RDV, ma secrétaire gère tout l'agenda, mais on a des problèmes de synchro avec le logiciel médical."*  
→ Comment une phrase devient un graphe d'objets typés.

**Exemple B — Une consultation standard complète**  
→ Modélisation bout en bout d'un processus : de la prise de RDV à la télétransmission FSE.

**Exemple C — Un signal critique en cascade**  
→ Le logiciel médical comme point unique de défaillance : du signal à l'action suivie.

L'ensemble forme une **instance cohérente** : tous les objets, relations, signaux et actions appartiennent au même cabinet fictif — le Cabinet du Dr Martin, médecin généraliste seul à Nantes.

---

## Sommaire

1. [Niveau 0 — Organisation](#niveau-0--organisation)
2. [Niveau 1 — Axes](#niveau-1--axes)
3. [Niveau 2 — Domaines](#niveau-2--domaines)
4. [Niveau 3 — Thèmes](#niveau-3--thèmes)
5. [Niveau 4 — Objets](#niveau-4--objets)
6. [Niveau 5 — Relations](#niveau-5--relations)
7. [Niveau 6 — Signaux](#niveau-6--signaux)
8. [Niveau 7 — Actions](#niveau-7--actions)
9. [Niveau 8 — Règles de détection](#niveau-8--règles-de-détection)
10. [Lecture transversale](#lecture-transversale)

---

## Niveau 0 — Organisation

L'instance racine. Tout le reste lui est rattaché.

```json
{
  "id": "org-martin-nantes-001",
  "slug": "cabinet-dr-martin-nantes",
  "nom": "Cabinet du Dr Martin",
  "secteur": "médecine_générale",
  "sous_secteur": "solo",
  "taille": "1-2",
  "localisation": {
    "ville": "Nantes",
    "departement": "44",
    "region": "Pays de la Loire",
    "zone_type": "urbain"
  },
  "date_création": "2026-06-01T09:00:00Z",
  "version_schema": "1.0.0",
  "statut": "actif",
  "interviews": [
    {
      "id": "itw-001",
      "date": "2026-06-01T10:00:00Z",
      "durée_minutes": 28,
      "mode": "chat",
      "statut": "complété",
      "transcription": "Je suis médecin généraliste à Nantes depuis 12 ans, en cabinet seul...",
      "objets_extraits": ["obj-001", "obj-002", "obj-003", "obj-004", "obj-005",
                          "obj-006", "obj-007", "obj-008", "obj-009", "obj-010",
                          "obj-011", "obj-012", "obj-013", "obj-014", "obj-015"],
      "signaux_générés": ["sig-001", "sig-002", "sig-003"]
    }
  ]
}
```

**Pourquoi c'est important** : l'organisation est le périmètre d'isolation. Tous les objets, relations et signaux sont scoped à cette instance. Deux cabinets distincts ne partagent jamais d'objets — même si le Dr Martin et sa consœur utilisent tous les deux Doctolib.

---

## Niveau 1 — Axes

Les 10 axes organisationnels sont instanciés pour ce cabinet. Ils sont fixes dans leur structure mais leur contenu est propre à l'instance.

```json
[
  {
    "id": "axe-001", "organisation_id": "org-martin-nantes-001",
    "code": "coeur_metier", "label": "Cœur de métier",
    "label_sectoriel": "Activité Clinique",
    "description": "Ce que le Dr Martin sait faire — consultation, diagnostic, prescription, actes techniques",
    "ordre": 1, "couleur": "#166534", "actif": true
  },
  {
    "id": "axe-002", "organisation_id": "org-martin-nantes-001",
    "code": "parcours_client", "label": "Parcours patient",
    "label_sectoriel": "Parcours patient",
    "description": "Ce que le patient vit de bout en bout — de la prise de RDV à la clôture du suivi",
    "ordre": 2, "couleur": "#1e3a8a", "actif": true
  },
  {
    "id": "axe-003", "organisation_id": "org-martin-nantes-001",
    "code": "processus_admin", "label": "Processus & Admin",
    "label_sectoriel": "Gestion Administrative",
    "description": "Ce qui tourne en arrière-plan — agenda, dossiers, facturation, coordination",
    "ordre": 3, "couleur": "#4c1d95", "actif": true
  },
  {
    "id": "axe-004", "organisation_id": "org-martin-nantes-001",
    "code": "equipe_rh", "label": "Équipe & RH",
    "description": "Composition du cabinet — le Dr Martin et sa secrétaire Isabelle",
    "ordre": 4, "couleur": "#831843", "actif": true
  },
  {
    "id": "axe-005", "organisation_id": "org-martin-nantes-001",
    "code": "outils_data_infra", "label": "Outils, Données & Infrastructure",
    "description": "Stack technique du cabinet — LGC, Doctolib, DMP, hébergeur HDS",
    "ordre": 5, "couleur": "#7c2d12", "actif": true
  },
  {
    "id": "axe-006", "organisation_id": "org-martin-nantes-001",
    "code": "finance", "label": "Finance",
    "description": "Revenus, charges, facturation, comptabilité BNC",
    "ordre": 6, "couleur": "#713f12", "actif": true
  },
  {
    "id": "axe-007", "organisation_id": "org-martin-nantes-001",
    "code": "conformite", "label": "Conformité, Sécurité & Éthique",
    "description": "Obligations légales — RGPD, HDS, RCP, déontologie",
    "ordre": 7, "couleur": "#581c87", "actif": true
  },
  {
    "id": "axe-008", "organisation_id": "org-martin-nantes-001",
    "code": "strategie", "label": "Stratégie & Environnement",
    "description": "Positionnement, objectifs, contexte territorial nantais",
    "ordre": 8, "couleur": "#0c4a6e", "actif": true
  }
]
```

---

## Niveau 2 — Domaines

Les domaines sont instanciés pour chaque axe. Seuls les domaines pertinents à ce cabinet sont créés — un cabinet sans MSP n'a pas de domaine "Réseau pluriprofessionnel".

```json
[
  {
    "id": "dom-001", "axe_id": "axe-001", "organisation_id": "org-martin-nantes-001",
    "label": "Consultation & Diagnostic",
    "description": "Actes cliniques de première ligne — anamnèse, examen, décision",
    "ordre": 1, "source": "prédéfini", "actif": true
  },
  {
    "id": "dom-002", "axe_id": "axe-001", "organisation_id": "org-martin-nantes-001",
    "label": "Suivi & Prévention",
    "description": "Gestion des pathologies chroniques, vaccination, dépistage",
    "ordre": 2, "source": "prédéfini", "actif": true
  },
  {
    "id": "dom-003", "axe_id": "axe-002", "organisation_id": "org-martin-nantes-001",
    "label": "Accès aux soins",
    "description": "Prise de RDV, accueil, gestion des urgences du jour",
    "ordre": 1, "source": "prédéfini", "actif": true
  },
  {
    "id": "dom-004", "axe_id": "axe-003", "organisation_id": "org-martin-nantes-001",
    "label": "Gestion de l'agenda",
    "description": "Planification, RDV, rappels, annulations",
    "ordre": 1, "source": "prédéfini", "actif": true
  },
  {
    "id": "dom-005", "axe_id": "axe-003", "organisation_id": "org-martin-nantes-001",
    "label": "Dossier & Documents",
    "description": "Tenue du dossier médical, DMP, ordonnances, courriers",
    "ordre": 2, "source": "prédéfini", "actif": true
  },
  {
    "id": "dom-006", "axe_id": "axe-003", "organisation_id": "org-martin-nantes-001",
    "label": "Facturation & Télétransmission",
    "description": "Cotation, FSE, remboursements, rejets CPAM",
    "ordre": 3, "source": "prédéfini", "actif": true
  },
  {
    "id": "dom-007", "axe_id": "axe-004", "organisation_id": "org-martin-nantes-001",
    "label": "Équipe du cabinet",
    "description": "Dr Martin (médecin) et Isabelle (secrétaire médicale)",
    "ordre": 1, "source": "extrait", "actif": true
  },
  {
    "id": "dom-008", "axe_id": "axe-005", "organisation_id": "org-martin-nantes-001",
    "label": "Outils numériques",
    "description": "LGC, Doctolib, DMP, e-biologie — stack applicatif du cabinet",
    "ordre": 1, "source": "extrait", "actif": true
  },
  {
    "id": "dom-009", "axe_id": "axe-006", "organisation_id": "org-martin-nantes-001",
    "label": "Facturation",
    "description": "Revenus, cotation CCAM, tiers payant",
    "ordre": 1, "source": "prédéfini", "actif": true
  }
]
```

---

## Niveau 3 — Thèmes

Les thèmes sont le niveau de granularité intermédiaire. Chaque domaine en contient plusieurs.

```json
[
  {
    "id": "theme-001", "domaine_id": "dom-001", "axe_id": "axe-001",
    "label": "Consultation",
    "description": "La consultation médicale standard — anamnèse, examen clinique, décision",
    "ordre": 1, "source": "prédéfini",
    "completude": 0.89
  },
  {
    "id": "theme-002", "domaine_id": "dom-003", "axe_id": "axe-002",
    "label": "Prise de RDV",
    "description": "Le processus de prise de rendez-vous — en ligne et par téléphone",
    "ordre": 1, "source": "prédéfini",
    "completude": 0.75
  },
  {
    "id": "theme-003", "domaine_id": "dom-004", "axe_id": "axe-003",
    "label": "Gestion agenda",
    "description": "Gestion quotidienne de l'agenda — RDV, urgences, annulations",
    "ordre": 1, "source": "prédéfini",
    "completude": 0.62
  },
  {
    "id": "theme-004", "domaine_id": "dom-005", "axe_id": "axe-003",
    "label": "Dossier médical",
    "description": "Tenue et mise à jour du dossier patient dans le LGC",
    "ordre": 1, "source": "prédéfini",
    "completude": 0.80
  },
  {
    "id": "theme-005", "domaine_id": "dom-006", "axe_id": "axe-003",
    "label": "Facturation & FSE",
    "description": "Cotation des actes, émission et télétransmission des FSE",
    "ordre": 1, "source": "prédéfini",
    "completude": 0.70
  },
  {
    "id": "theme-006", "domaine_id": "dom-007", "axe_id": "axe-004",
    "label": "Médecin",
    "description": "Dr Martin — rôles, responsabilités, charge de travail",
    "ordre": 1, "source": "extrait",
    "completude": 0.90
  },
  {
    "id": "theme-007", "domaine_id": "dom-007", "axe_id": "axe-004",
    "label": "Secrétaire médicale",
    "description": "Isabelle — rôles, outils, périmètre de délégation",
    "ordre": 2, "source": "extrait",
    "completude": 0.70
  },
  {
    "id": "theme-008", "domaine_id": "dom-008", "axe_id": "axe-005",
    "label": "Logiciel médical (LGC)",
    "description": "Crossway — dossier, ordonnances, facturation intégrée",
    "ordre": 1, "source": "extrait",
    "completude": 0.85
  },
  {
    "id": "theme-009", "domaine_id": "dom-008", "axe_id": "axe-005",
    "label": "Agenda en ligne",
    "description": "Doctolib — prise de RDV patient, rappels automatiques",
    "ordre": 2, "source": "extrait",
    "completude": 0.65
  }
]
```

**Note sur la complétude** : un thème est complet à 100% quand les 4 facettes fondamentales (Acteurs, Actes, Données, Outils) ont au moins un objet.

**Deux métriques de complétude (D-053).** Une mesure unique induit en erreur : un thème comme « Consultation » a peu d'objets *rattachés* (surtout l'acte), alors que la consultation mobilise bien un acteur, des données et un outil — mais ceux-ci vivent dans leur thème d'attache (Médecin, Dossier, Logiciel). On distingue donc :
- **Complétude documentaire** — facettes présentes parmi les objets *rattachés* (`thème_id`). Mesure « combien a-t-on documenté ici » ; **pilote les relances d'interview**. (Consultation ≈ 0,25.)
- **Complétude fonctionnelle** — facettes présentes parmi les objets rattachés **+ `référencé_dans`**. Mesure « cette fonction a-t-elle ses 4 pièces, où qu'elles soient rangées » ; **santé structurelle**. (Consultation = 1,0 une fois Médecin/Dossier/Crossway référencés dans le thème.)

Les valeurs `completude` stockées dans les thèmes ci-dessus (0.89, 0.75…) correspondent à la lecture **fonctionnelle**.

---

## Niveau 4 — Objets

Les objets sont le **cœur du substrat**. Voici les 15 objets extraits de l'interview du Dr Martin.

---

### Exemple A — Extraction depuis une phrase

**Phrase source :**
> *"J'utilise Doctolib pour mes RDV, ma secrétaire gère tout l'agenda, mais on a des problèmes de synchro avec le logiciel médical."*

Cette seule phrase génère **3 objets**, **2 relations**, et **1 signal potentiel**.

#### Objet 1 — Doctolib

```json
{
  "id": "obj-001",
  "organisation_id": "org-martin-nantes-001",
  "thème_id": "theme-009",
  "domaine_id": "dom-008",
  "axe_id": "axe-005",

  "label": "Doctolib",
  "label_normalisé": "doctolib",
  "description": "Plateforme de prise de RDV en ligne utilisée par le cabinet",

  "facette_wsf": "outils",
  "type_local": "Essentiel",
  "situations": ["Prise de RDV en ligne", "Rappels automatiques SMS"],

  "source": "interview",
  "extrait_source": "J'utilise Doctolib pour mes RDV",
  "interview_id": "itw-001",
  "confiance": 0.97,
  "validé": true,

  "date_création": "2026-06-01T10:04:22Z",
  "date_modification": "2026-06-01T10:04:22Z",
  "tags": ["agenda", "numérique", "patient-facing"]
}
```

#### Objet 2 — Secrétaire médicale (Isabelle)

```json
{
  "id": "obj-002",
  "organisation_id": "org-martin-nantes-001",
  "thème_id": "theme-007",
  "domaine_id": "dom-007",
  "axe_id": "axe-004",

  "label": "Secrétaire médicale",
  "label_normalisé": "secretaire_medicale",
  "description": "Isabelle — gère l'agenda, l'accueil et une partie de la facturation",

  "facette_wsf": "acteurs",
  "type_local": "Principal",
  "situations": ["Gestion agenda", "Accueil patients", "Télétransmission FSE"],

  "source": "interview",
  "extrait_source": "ma secrétaire gère tout l'agenda",
  "interview_id": "itw-001",
  "confiance": 0.92,
  "validé": true,

  "date_création": "2026-06-01T10:04:28Z",
  "date_modification": "2026-06-01T10:12:00Z",
  "tags": ["équipe", "admin", "pivot"]
}
```

#### Objet 3 — Logiciel médical Crossway

```json
{
  "id": "obj-003",
  "organisation_id": "org-martin-nantes-001",
  "thème_id": "theme-008",
  "domaine_id": "dom-008",
  "axe_id": "axe-005",

  "label": "Crossway (logiciel médical)",
  "label_normalisé": "crossway_lgc",
  "description": "Logiciel de gestion de cabinet — dossier patient, ordonnances, facturation, agenda interne",

  "facette_wsf": "outils",
  "type_local": "Essentiel",
  "situations": [
    "Dossier patient", "Rédaction ordonnances",
    "Facturation CCAM", "Agenda interne",
    "Télétransmission FSE", "DMP"
  ],

  "source": "interview",
  "extrait_source": "on a des problèmes de synchro avec le logiciel médical",
  "interview_id": "itw-001",
  "confiance": 0.85,
  "validé": true,

  "date_création": "2026-06-01T10:04:35Z",
  "date_modification": "2026-06-01T10:04:35Z",
  "tags": ["lgc", "critique", "point-unique-défaillance"]
}
```

---

### Exemple B — Objets extraits pour la consultation standard

Les objets suivants couvrent l'ensemble du processus de consultation, du RDV à la FSE.

#### Objet 4 — Dr Martin (médecin)

```json
{
  "id": "obj-004",
  "thème_id": "theme-006",
  "axe_id": "axe-004",

  "label": "Dr Martin",
  "label_normalisé": "dr_martin_medecin",

  "facette_wsf": "acteurs",
  "type_local": "Principal",
  "situations": [
    "Consultation", "Diagnostic", "Prescription",
    "Suivi chronique", "Vaccination", "Gestion cabinet"
  ],

  "source": "interview",
  "extrait_source": "je suis médecin généraliste à Nantes depuis 12 ans",
  "confiance": 1.0,
  "validé": true,
  "tags": ["médecin", "responsable", "acteur-unique"]
}
```

#### Objet 5 — Patient (bénéficiaire)

```json
{
  "id": "obj-005",
  "thème_id": "theme-001",
  "axe_id": "axe-001",

  "label": "Patient",
  "label_normalisé": "patient",

  "facette_wsf": "patients",
  "type_local": "Primaire",
  "situations": [
    "Consultation", "Prise de RDV", "Suivi chronique",
    "Vaccination", "Urgences du jour"
  ],

  "source": "déduit",
  "extrait_source": null,
  "confiance": 1.0,
  "validé": true,
  "tags": ["bénéficiaire", "customer"]
}
```

#### Objet 6 — Consultation médicale (acte produit)

```json
{
  "id": "obj-006",
  "thème_id": "theme-001",
  "axe_id": "axe-001",

  "label": "Consultation médicale",
  "label_normalisé": "consultation_medicale",
  "description": "L'acte de consultation — diagnostic, plan de soins, ordonnance",

  "facette_wsf": "soins",
  "type_local": "Document médical",
  "situations": ["Consultation standard", "Renouvellement ALD", "Urgence"],

  "source": "déduit",
  "confiance": 1.0,
  "validé": true
}
```

#### Objet 7 — Anamnèse & examen clinique (processus)

```json
{
  "id": "obj-007",
  "thème_id": "theme-001",
  "axe_id": "axe-001",

  "label": "Anamnèse & examen clinique",
  "label_normalisé": "anamnese_examen_clinique",

  "facette_wsf": "actes",
  "type_local": "Étape clinique",
  "situations": ["Consultation standard", "Consultation complexe"],

  "source": "prédéfini",
  "confiance": 1.0,
  "validé": true
}
```

#### Objet 8 — Dossier patient (données)

```json
{
  "id": "obj-008",
  "thème_id": "theme-004",
  "axe_id": "axe-003",

  "label": "Dossier patient",
  "label_normalisé": "dossier_patient",
  "description": "Antécédents, traitements actifs, allergies, constantes historisées",

  "facette_wsf": "donnees",
  "type_local": "Médicale",
  "situations": ["Consultation", "Suivi chronique", "Urgence"],

  "source": "prédéfini",
  "confiance": 1.0,
  "validé": true
}
```

#### Objet 9 — Ordonnance médicale (soin produit)

```json
{
  "id": "obj-009",
  "thème_id": "theme-001",
  "axe_id": "axe-001",

  "label": "Ordonnance médicale",
  "label_normalisé": "ordonnance_medicale",

  "facette_wsf": "soins",
  "type_local": "Document légal",
  "situations": ["Médicaments", "Examens biologiques", "Imagerie", "Kinésithérapie"],

  "source": "prédéfini",
  "confiance": 1.0,
  "validé": true
}
```

#### Objet 10 — Feuille de soins électronique (FSE)

```json
{
  "id": "obj-010",
  "thème_id": "theme-005",
  "axe_id": "axe-003",

  "label": "FSE (Feuille de Soins Électronique)",
  "label_normalisé": "fse_telétransmission",

  "facette_wsf": "soins",
  "type_local": "Flux électronique",
  "situations": ["Facturation CPAM", "Tiers payant", "Remboursements"],

  "source": "prédéfini",
  "confiance": 1.0,
  "validé": true
}
```

#### Objet 11 — SESAM-Vitale (infrastructure)

```json
{
  "id": "obj-011",
  "thème_id": "theme-005",
  "axe_id": "axe-005",

  "label": "SESAM-Vitale",
  "label_normalisé": "sesam_vitale",
  "description": "Infrastructure nationale de télétransmission des FSE à l'Assurance Maladie",

  "facette_wsf": "infrastructure",
  "type_local": "Réseau national",
  "situations": ["Télétransmission FSE", "Vérification droits AM"],

  "source": "déduit",
  "confiance": 0.90,
  "validé": false,
  "tags": ["infrastructure", "nationale", "obligatoire"]
}
```

#### Objet 12 — Désert médical nantais (contexte)

```json
{
  "id": "obj-012",
  "thème_id": "theme-006",
  "axe_id": "axe-008",

  "label": "Pression démographique médicale — Nantes",
  "label_normalisé": "pression_demographique_nantes",
  "description": "Nantes classée zone tendue — afflux de patients sans médecin traitant",

  "facette_wsf": "contexte",
  "type_local": "Territorial",
  "situations": ["Surcharge file active", "Demandes de médecin traitant"],

  "source": "interview",
  "extrait_source": "j'ai beaucoup de demandes de nouveaux patients que je ne peux plus accepter",
  "confiance": 0.88,
  "validé": true
}
```

#### Objet 13 — Convention médicale (contexte réglementaire)

```json
{
  "id": "obj-013",
  "thème_id": "theme-005",
  "axe_id": "axe-007",

  "label": "Convention médicale CPAM",
  "label_normalisé": "convention_medicale_cpam",

  "facette_wsf": "contexte",
  "type_local": "Réglementaire",
  "situations": ["Tarification actes", "ROSP", "Tiers payant obligatoire"],

  "source": "prédéfini",
  "confiance": 1.0,
  "validé": true
}
```

#### Objet 14 — Objectif qualité de vie au travail (stratégie)

```json
{
  "id": "obj-014",
  "thème_id": "theme-006",
  "axe_id": "axe-008",

  "label": "Réduction de la charge de travail",
  "label_normalisé": "objectif_reduction_charge",

  "facette_wsf": "strategie",
  "type_local": "Objectif social",
  "situations": ["Plafonnement file active", "Jours off", "Prévention burnout"],

  "source": "interview",
  "extrait_source": "j'aimerais pouvoir prendre plus de temps pour chaque patient sans travailler 60h par semaine",
  "confiance": 0.91,
  "validé": true
}
```

#### Objet 15 — Hébergeur HDS (infrastructure)

```json
{
  "id": "obj-015",
  "thème_id": "theme-008",
  "axe_id": "axe-005",

  "label": "Hébergeur HDS",
  "label_normalisé": "hebergeur_hds",
  "description": "Hébergement certifié HDS pour les données de santé du cabinet",

  "facette_wsf": "infrastructure",
  "type_local": "Cloud",
  "situations": ["Stockage données patient", "Backup", "RGPD"],

  "source": "déduit",
  "extrait_source": null,
  "confiance": 0.70,
  "validé": false,
  "tags": ["conformité", "rgpd", "hds", "à-valider"]
}
```

**Note** : l'objet 15 est déduit — le Dr Martin n'a pas mentionné son hébergeur. Le système infère qu'il en a nécessairement un (ou devrait en avoir un). Confiance faible → sera soumis à validation : *"Quel hébergeur utilisez-vous pour stocker vos données patient ?"*

---

## Niveau 5 — Relations

Les relations connectent les objets entre eux. Elles permettent de calculer les dépendances, les flux, et les risques de propagation.

### Relations issues de l'Exemple A (la phrase de synchro)

```json
[
  {
    "id": "rel-001",
    "objet_source_id": "obj-002",
    "objet_cible_id": "obj-001",
    "type": "utilise",
    "sens": "unidirectionnel",
    "poids": 5,
    "source": "interview",
    "extrait_source": "ma secrétaire gère tout l'agenda",
    "confiance": 0.90,
    "validé": true
  },
  {
    "id": "rel-002",
    "objet_source_id": "obj-001",
    "objet_cible_id": "obj-003",
    "type": "dépend_de",
    "sens": "unidirectionnel",
    "poids": 4,
    "source": "interview",
    "extrait_source": "on a des problèmes de synchro avec le logiciel médical",
    "confiance": 0.82,
    "validé": false
  }
]
```

**Lecture** : la secrétaire `utilise` Doctolib (poids 5 = critique, c'est son outil principal pour le RDV). Doctolib `dépend_de` Crossway (synchro agenda) — relation de poids 4, non encore validée car la nature exacte du problème de synchro n'est pas connue.

### Relations issues de l'Exemple B (consultation standard)

```json
[
  {
    "id": "rel-003",
    "objet_source_id": "obj-004",
    "objet_cible_id": "obj-007",
    "type": "produit",
    "sens": "unidirectionnel",
    "poids": 5,
    "source": "prédéfini",
    "confiance": 1.0,
    "validé": true,
    "note": "Le Dr Martin réalise l'anamnèse & examen clinique"
  },
  {
    "id": "rel-004",
    "objet_source_id": "obj-007",
    "objet_cible_id": "obj-008",
    "type": "utilise",
    "sens": "unidirectionnel",
    "poids": 5,
    "source": "prédéfini",
    "confiance": 1.0,
    "validé": true,
    "note": "L'anamnèse consomme le dossier patient"
  },
  {
    "id": "rel-005",
    "objet_source_id": "obj-004",
    "objet_cible_id": "obj-003",
    "type": "utilise",
    "sens": "unidirectionnel",
    "poids": 5,
    "source": "prédéfini",
    "confiance": 1.0,
    "validé": true,
    "note": "Le Dr Martin utilise Crossway pour consulter et saisir"
  },
  {
    "id": "rel-006",
    "objet_source_id": "obj-004",
    "objet_cible_id": "obj-009",
    "type": "produit",
    "sens": "unidirectionnel",
    "poids": 5,
    "source": "prédéfini",
    "confiance": 1.0,
    "validé": true,
    "note": "Le Dr Martin produit l'ordonnance"
  },
  {
    "id": "rel-007",
    "objet_source_id": "obj-002",
    "objet_cible_id": "obj-010",
    "type": "produit",
    "sens": "unidirectionnel",
    "poids": 4,
    "source": "prédéfini",
    "confiance": 0.95,
    "validé": true,
    "note": "La secrétaire produit la FSE et la télétransmet"
  },
  {
    "id": "rel-008",
    "objet_source_id": "obj-010",
    "objet_cible_id": "obj-011",
    "type": "utilise",
    "sens": "unidirectionnel",
    "poids": 5,
    "source": "déduit",
    "confiance": 1.0,
    "validé": true,
    "note": "La FSE transite obligatoirement par SESAM-Vitale"
  },
  {
    "id": "rel-009",
    "objet_source_id": "obj-003",
    "objet_cible_id": "obj-008",
    "type": "produit",
    "sens": "bidirectionnel",
    "poids": 5,
    "source": "prédéfini",
    "confiance": 1.0,
    "validé": true,
    "note": "Crossway stocke et expose le dossier patient"
  },
  {
    "id": "rel-010",
    "objet_source_id": "obj-003",
    "objet_cible_id": "obj-015",
    "type": "dépend_de",
    "sens": "unidirectionnel",
    "poids": 5,
    "source": "déduit",
    "confiance": 0.70,
    "validé": false,
    "note": "Crossway repose sur un hébergeur — lequel ? À valider"
  },
  {
    "id": "rel-011",
    "objet_source_id": "obj-014",
    "objet_cible_id": "obj-012",
    "type": "contraint",
    "sens": "unidirectionnel",
    "poids": 3,
    "source": "déduit",
    "confiance": 0.75,
    "validé": false,
    "note": "La pression démographique locale contraint l'objectif de QVT"
  }
]
```

### Graphe de dépendance calculé

À partir de ces relations, le système calcule le **degré de centralité** de chaque objet :

```
Crossway (obj-003)
  ← utilise : Dr Martin (5)
  ← utilise : Anamnèse/examen (5)  
  ← dépend_de : Doctolib (4)
  ← dépend_de : hébergeur HDS (5)
  → produit : Dossier patient (5)
  → produit : FSE (4)

Degré entrant : 19 / 28 points possibles = 68%
→ Déclenche la règle R02 (seuil > 60%)
```

---

## Niveau 6 — Signaux

Les signaux sont générés automatiquement après chaque mise à jour du graphe.

### Signal 1 — Dépendance unique sur Crossway

```json
{
  "id": "sig-001",
  "organisation_id": "org-martin-nantes-001",

  "type": "dépendance_unique",
  "sévérité": "critique",

  "axe_id": "axe-005",
  "facette_wsf": "outils",

  "objets_impliqués": ["obj-003", "obj-004", "obj-002", "obj-010"],

  "titre": "Crossway — point unique de défaillance",
  "description": "Crossway (logiciel médical) est impliqué dans 68% des flux critiques du cabinet. Sa défaillance impacte simultanément : la consultation clinique, la tenue du dossier patient, la facturation, la télétransmission FSE, et la synchronisation agenda.",
  "recommandation": "Définir une procédure de continuité d'activité en cas de panne : ordonnances papier disponibles, facturation différée, contact éditeur prioritaire.",

  "règle_id": "regle-R02",

  "statut": "ouvert",
  "date_détection": "2026-06-01T10:05:00Z",
  "date_modification": "2026-06-01T10:05:00Z"
}
```

### Signal 2 — Désynchronisation Doctolib / Crossway

```json
{
  "id": "sig-002",
  "organisation_id": "org-martin-nantes-001",

  "type": "contradiction",
  "sévérité": "moyen",

  "axe_id": "axe-003",
  "facette_wsf": "outils",

  "objets_impliqués": ["obj-001", "obj-003", "obj-002"],

  "titre": "Désynchronisation Doctolib ↔ Crossway",
  "description": "Doctolib et Crossway coexistent comme deux sources de vérité pour l'agenda. La secrétaire gère les RDV dans Doctolib, mais Crossway dispose d'un agenda interne — la synchro entre les deux est défaillante selon le médecin. Risque de double saisie, incohérences, rendez-vous perdus.",
  "recommandation": "Auditer la configuration de l'interface Doctolib ↔ Crossway. Contacter le support Crossway pour vérifier la connexion API. Envisager d'utiliser un seul outil comme agenda de référence.",

  "règle_id": "regle-R03",

  "statut": "ouvert",
  "date_détection": "2026-06-01T10:05:10Z"
}
```

### Signal 3 — Hébergeur HDS non identifié

```json
{
  "id": "sig-003",
  "organisation_id": "org-martin-nantes-001",

  "type": "absence",
  "sévérité": "critique",

  "axe_id": "axe-007",
  "facette_wsf": "infrastructure",

  "objets_impliqués": ["obj-015", "obj-008"],

  "titre": "Hébergeur HDS non confirmé",
  "description": "Le Dr Martin n'a pas mentionné d'hébergeur certifié HDS. Les données patient stockées dans Crossway doivent obligatoirement être hébergées par un prestataire certifié HDS (loi santé). Si Crossway est installé sur un serveur local ou un hébergeur générique, le cabinet est hors conformité.",
  "recommandation": "Vérifier avec l'éditeur Crossway où sont hébergées les données : leur propre infrastructure HDS, un hébergeur tiers certifié, ou installation locale (à risque). Régulariser si nécessaire.",

  "règle_id": "regle-R10",

  "statut": "ouvert",
  "date_détection": "2026-06-01T10:05:20Z"
}
```

---

## Niveau 7 — Actions

Chaque signal ouvert génère une ou plusieurs actions concrètes et suivies.

### Action 1 — Procédure de continuité (issue de sig-001)

```json
{
  "id": "act-001",
  "organisation_id": "org-martin-nantes-001",
  "signal_id": "sig-001",

  "label": "Créer une procédure de continuité en cas de panne Crossway",
  "description": "Documenter les étapes à suivre si Crossway est indisponible : ordonnancier papier de secours, liste des patients du jour, numéro support éditeur, procédure de facturation différée.",

  "priorité": "haute",
  "impact_estimé": "critique",
  "effort_estimé": "faible",

  "responsable": "médecin",

  "statut": "à_faire",
  "date_création": "2026-06-01T10:05:00Z",
  "date_échéance": "2026-06-15T00:00:00Z",

  "notes": [
    {
      "id": "note-001",
      "contenu": "Action générée automatiquement depuis le signal sig-001 (dépendance unique Crossway)",
      "date": "2026-06-01T10:05:00Z",
      "auteur": "ia"
    }
  ],
  "rappels": [
    {
      "id": "rap-001",
      "date": "2026-06-10T08:00:00Z",
      "envoyé": false
    }
  ]
}
```

### Action 2 — Audit synchro Doctolib/Crossway (issue de sig-002)

```json
{
  "id": "act-002",
  "organisation_id": "org-martin-nantes-001",
  "signal_id": "sig-002",

  "label": "Auditer et corriger la synchronisation Doctolib ↔ Crossway",
  "description": "Contacter le support Crossway pour diagnostiquer le problème de synchro avec Doctolib. Vérifier si l'interface est activée et correctement configurée. Définir un agenda de référence unique.",

  "priorité": "haute",
  "impact_estimé": "significatif",
  "effort_estimé": "moyen",

  "responsable": "prestataire",

  "statut": "à_faire",
  "date_création": "2026-06-01T10:05:10Z",
  "date_échéance": "2026-06-20T00:00:00Z",

  "notes": [
    {
      "id": "note-002",
      "contenu": "Le Dr Martin a mentionné ce problème spontanément — c'est un irritant quotidien pour la secrétaire.",
      "date": "2026-06-01T10:05:10Z",
      "auteur": "ia"
    }
  ]
}
```

### Action 3 — Vérification conformité HDS (issue de sig-003)

```json
{
  "id": "act-003",
  "organisation_id": "org-martin-nantes-001",
  "signal_id": "sig-003",

  "label": "Vérifier la conformité HDS de l'hébergement Crossway",
  "description": "Contacter l'éditeur Crossway pour confirmer le mode d'hébergement des données. Obtenir une attestation HDS ou identifier l'hébergeur certifié. Si non-conformité avérée, lancer une procédure de régularisation.",

  "priorité": "haute",
  "impact_estimé": "critique",
  "effort_estimé": "faible",

  "responsable": "médecin",

  "statut": "à_faire",
  "date_création": "2026-06-01T10:05:20Z",
  "date_échéance": "2026-06-08T00:00:00Z",

  "notes": [
    {
      "id": "note-003",
      "contenu": "Risque réglementaire majeur — à traiter en priorité absolue. CNIL peut sanctionner jusqu'à 4% du CA.",
      "date": "2026-06-01T10:05:20Z",
      "auteur": "ia"
    }
  ]
}
```

---

## Niveau 8 — Règles de détection

Les règles sont la logique qui a produit les signaux ci-dessus. Voici les 3 règles activées sur ce cabinet.

### Règle R02 — Dépendance unique

```json
{
  "id": "regle-R02",
  "code": "R02",
  "label": "Point unique de défaillance",

  "description": "Un objet est impliqué dans plus de 60% des relations critiques (poids ≥ 4) du graphe. Sa défaillance propage une interruption en cascade.",

  "condition": {
    "type": "ratio_centralité_locale",
    "paramètres": {
      "numerateur": "SUM(poids des liens incidents critiques (poids>=4), entrants OU bidirectionnels, sur l'objet)",
      "denominateur": "SUM(poids de TOUS les liens incidents à l'objet)",
      "garde_degré_min": 3,
      "seuil": 0.60,
      "seuil_provisoire": true,
      "operateur": ">",
      "note": "Formule LOCALE figée (D-054). Le dénominateur global initial ne passait pas à l'échelle. Seuil 0.60 provisoire — à recalibrer sur données (cf calibration_roadmap)."
    }
  },

  "signal_type": "dépendance_unique",
  "signal_sévérité": "critique",
  "signal_titre": "{objet.label} — point unique de défaillance",
  "signal_description": "{objet.label} est impliqué dans {ratio}% des flux critiques du cabinet.",
  "signal_recommandation": "Définir une procédure de continuité d'activité en cas de défaillance de {objet.label}.",

  "secteurs": [],
  "axes": [],
  "facettes": ["outils", "acteurs", "infrastructure"],
  "actif": true,
  "priorité": 1
}
```

**Résultat sur ce cabinet** : Crossway (obj-003) a un ratio de **centralité locale ≈ 74 %** (14 de flux critiques incidents / 19 de flux incidents total) → seuil 0,60 dépassé → signal sig-001 généré. *(Le « 68 % » du graphe narratif ci-dessus s'appuyait sur des arêtes non listées formellement ; la valeur exécutable est ~74 %.)*

---

### Règle R03 — Contradiction entre outils liés

```json
{
  "id": "regle-R03",
  "code": "R03",
  "label": "Désynchronisation entre outils liés",

  "description": "Deux outils ont une relation 'dépend_de' ou 'utilise' ET la phrase source contient un lexique de dysfonctionnement (problème, bug, synchro, lent, bugué, ne marche pas).",

  "condition": {
    "type": "pattern",
    "paramètres": {
      "relation_types": ["dépend_de", "utilise"],
      "lexique_dysfonctionnement": [
        "problème", "bug", "synchro", "lent", "ne marche pas",
        "bugué", "plante", "panne", "erreur", "rame", "bloqué"
      ],
      "source": "extrait_source"
    }
  },

  "signal_type": "contradiction",
  "signal_sévérité": "moyen",
  "signal_titre": "Dysfonctionnement entre {objet_a.label} et {objet_b.label}",
  "signal_description": "Un problème de {type_dysfonctionnement} a été détecté entre {objet_a.label} et {objet_b.label}.",

  "secteurs": [],
  "actif": true,
  "priorité": 3
}
```

**Résultat sur ce cabinet** : "problèmes de synchro avec le logiciel médical" → lexique détecté sur la relation rel-002 (Doctolib dépend_de Crossway) → signal sig-002 généré.

---

### Règle R10 — Conformité sans couverture outil

```json
{
  "id": "regle-R10",
  "code": "R10",
  "label": "Obligation réglementaire sans couverture identifiée",

  "description": "Un axe 'Conformité' contient des obligations réglementaires critiques (facette contexte, type réglementaire) mais aucun objet de facette 'infrastructure' ou 'outils' n'est validé dans ce périmètre.",

  "condition": {
    "type": "absence",
    "paramètres": {
      "axe_source": "conformite",
      "facette_obligation": "contexte",
      "type_local_obligation": "Réglementaire",
      "facette_cible_absente": ["infrastructure", "outils"],
      "état_requis": "validé = true",
      "seuil_confiance": 0.75
    }
  },

  "signal_type": "absence",
  "signal_sévérité": "critique",
  "signal_titre": "{obligation.label} — couverture non confirmée",
  "signal_description": "L'obligation réglementaire '{obligation.label}' n'est pas couverte par un outil ou une infrastructure validé.",

  "secteurs": ["médecine_générale", "médecine_spécialisée"],
  "actif": true,
  "priorité": 2
}
```

**Résultat sur ce cabinet** : l'objet "Hébergeur HDS" (obj-015) existe mais `validé = false` et `confiance = 0.70` → seuil 0.75 non atteint → signal sig-003 généré.

---

## Lecture transversale

### Ce que ce schéma révèle sur le Cabinet du Dr Martin

En traversant les 8 niveaux sur ce cabinet fictif, on obtient une image organisationnelle précise :

```
Situation globale
─────────────────
3 signaux actifs : 2 critiques, 1 moyen
3 actions générées : 2 haute priorité, 1 haute priorité
15 objets extraits en 28 minutes d'interview
11 relations mappées

Zones de fragilité identifiées
────────────────────────────────
① Dépendance totale sur Crossway — aucun fallback
② Agenda dédoublé (Doctolib + Crossway) — source de friction quotidienne
③ Conformité HDS non confirmée — risque réglementaire immédiat

Zones bien couvertes
─────────────────────
✓ Cœur de métier clinique — complet, bien décrit
✓ Équipe — deux acteurs clairement définis
✓ Finance — processus de facturation tracé

Zones non encore explorées
───────────────────────────
○ Stratégie & succession — aucun objet validé
○ Réseau professionnel — pas de CPTS / MSP mentionnés
○ Formation continue (DPC) — non abordée
```

### Ce que le schéma rend possible

**Vue radar** calculée depuis les thèmes et leur complétude :
```
Cœur de métier       ████████░░  85%
Parcours patient     ██████░░░░  62%
Processus & Admin    ███████░░░  70%
Équipe & RH          ██████░░░░  65%
Outils & Données     ████████░░  80%
Finance              ██████░░░░  60%
Conformité           █████░░░░░  50%  ← zone de risque
Stratégie            ████░░░░░░  40%  ← zone de risque
```

**Matrice WSF** : chaque cellule (facette × axe) est calculée depuis les objets qui ont cette combinaison (facette_wsf, axe_id). Pas de saisie manuelle — la matrice est un rendu du graphe d'objets.

**Carte des dépendances** : le graphe de relations permet de visualiser les chaînes de défaillance — si Crossway tombe, quels objets sont impactés, dans quel ordre, avec quelle sévérité.

**Suivi dans le temps** : à la prochaine session, si le Dr Martin dit *"j'ai appelé Crossway, ils m'ont confirmé qu'ils sont bien hébergés chez OVHcloud santé"* → obj-015 passe à `validé = true`, confiance = 1.0 → sig-003 passe à `résolu` → act-003 passe à `résolu`.

---

### La boucle complète

```
Phrase du médecin
        ↓
Extraction IA (N4 objets + N5 relations)
        ↓
Évaluation des règles (N8)
        ↓
Génération de signaux (N6)
        ↓
Génération d'actions (N7)
        ↓
Mise à jour de la grille (N1-N3)
        ↓
Nouvelles questions de relance
        ↓
Prochaine phrase du médecin
        ↓ (boucle)
```

C'est cette boucle — conversation → extraction → grille → questions — qui constitue le cœur du système Lugia.

---

*Fin du document — Version 0.1*  
*À lire en parallèle de `lugia_schema_spec.md`*
