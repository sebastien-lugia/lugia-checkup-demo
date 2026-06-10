# Lugia — Spec de placement des objets sur les axes (socle générique)

**Statut** v1.0 · 2026-06-09 · **fondé sur** la Capability Map Générique **v8** (`capability_map_generique_v8.pdf`).
**Rôle** Fixer la règle qui affecte un objet du substrat à un axe (N1) / domaine (N2) / thème (N3),
pour éliminer toute affectation « au jugé ». Ce document est le **socle générique** : il définit le
placement par défaut. Il pourra être **personnalisé par cabinet, a posteriori**, sans casser le socle.

---

## 1. Principe

Un objet ne « choisit » pas son axe librement. Il s'attache au **thème de la capability map dont la
définition décrit sa fonction**. Le thème (N3) détermine mécaniquement son domaine (N2) et son axe (N1).

> **Règle fondatrice : on place par la fonction, via le thème de la capability map — jamais par intuition.**

La capability map v8 est le **référentiel de placement** : ses 10 axes × leurs domaines × leurs thèmes
sont la grille de référence. Affecter un objet = trouver le thème capmap qui le décrit.

## 2. Deux propriétés indépendantes : la nature et la place

- **Facette WSF = la nature ontologique** de l'objet (acteur, outil, acte, données, soins, infrastructure,
  contexte, stratégie, patients). Elle ne dépend **pas** de l'axe. Un médecin est `acteur` partout.
- **Axe / thème = la place fonctionnelle** : à quoi l'objet *contribue*. Donnée par le thème capmap.

On ne confond jamais les deux. (Le `node_type` du questionnaire taguait la *réponse*, pas l'objet : il
est donc réinterprété ici selon la fonction, pas repris tel quel.)

## 3. Multi-axe : thème d'attache + `référencé_dans`

Un objet a **un seul thème d'attache** (sa place principale) mais peut **servir dans plusieurs axes**.
Les places secondaires sont déclarées dans `référencé_dans` (liste de thèmes). On y recourt quand un
objet a légitimement sa place à deux endroits à la fois.

> Exemple : **Tri des résultats d'examens** — l'interprétation est un acte **clinique** (attache : Cœur de
> métier), mais le flux de tri/triage relève aussi de la **Gestion administrative** (`référencé_dans`).

Le thème d'attache est le défaut générique ; le médecin peut le repondérer a posteriori (cf §6).

## 4. Socle de placement — objets du diagnostic gratuit

Affectations par défaut, fondées sur les thèmes de la capmap v8. (« A » = axe d'attache.)

| Objet | Facette | Thème d'attache (capmap v8) | A — Axe | Référencé_dans |
|---|---|---|---|---|
| Le médecin | acteurs | Organisation · Composition & répartition des rôles | Équipe & RH | Cœur · Prestation principale |
| Secrétariat | acteurs | Organisation · Composition & répartition des rôles | Équipe & RH | Processus & Admin · Gestion des entrées |
| Cadre / tri des appels & demandes | actes | Flux d'activité · Gestion des entrées (triage) | Processus & Admin | — |
| Canaux de prise de RDV | actes | Flux d'activité · Gestion des entrées (prise de RDV) | **Processus & Admin** | — |
| Gestion administrative récurrente | actes | Documents & Traçabilité / Flux d'activité | Processus & Admin | — |
| Continuité d'activité (absence) | actes | Ressources humaines · Continuité en cas d'absence | **Équipe & RH** | Processus & Admin · résilience |
| Suivi des patients chroniques | actes | Actes & Prestations · suivi clinique | **Activité clinique (Cœur)** | Processus & Admin · Suivi des dossiers actifs |
| Tri des résultats d'examens | actes | Actes & Prestations · interprétation clinique | **Activité clinique (Cœur)** | **Processus & Admin · Suivi des dossiers actifs** ; Outils · Données externes reçues |
| Téléconsultation (prestation) | actes | Actes & Prestations · Variantes & modalités (distanciel) | **Activité clinique (Cœur)** | Parcours patient · modalité d'accès |
| Stack outils numériques | outils | Outils numériques · Logiciel métier / Agenda | Outils, Données & Infra | (chaque acte qui l'utilise) |
| IA générative | outils | Outils numériques | Outils, Données & Infra | Conformité · secret médical / HDS |
| Motivation du check-up | — (intention) | — | Stratégie & Environnement | — *(note stratégique, pas un objet)* |

**Corrections explicites vs mon placement initial** (validées par Sébastien) : Canaux de RDV → Processus &
Admin (et non Parcours) ; Continuité → Équipe & RH (et non Processus & Admin) ; Tri des résultats →
Cœur **+** Processus & Admin (multi-axe) ; Téléconsultation → Cœur (en tant que prestation).

## 5. Règle d'extraction (questionnaire → substrat)

1. Chaque **question** porte un objet canonique (colonne « Objet » ci-dessus) : axe + facette **fixes**.
2. La **réponse** ne change pas l'axe ; elle donne l'**état** (depuis `health_score`) et peut émettre un
   **signal** (si la réponse décrit un symptôme/risque) ou signifier l'**absence** de l'objet.
3. Les signaux transverses (ex. IA non conforme) sont rattachés à leur axe propre (Conformité).

## 6. Personnalisation a posteriori (hors socle V1)

Le socle est le défaut. Un cabinet peut, **après coup** : repondérer le thème d'attache d'un objet
(ex. un cabinet qui pilote tout depuis l'agenda peut rattacher la prise de RDV ailleurs), ajouter des
`référencé_dans`, ou créer des thèmes `source: "manuel"`. La personnalisation ne modifie jamais le socle
générique — elle s'y superpose au niveau de l'instance (organisation_id).

---

*Référentiel : `capability_map_generique_v8.pdf`. Lié à `lugia_schema_spec_v0.6.md` (typage 1 facette / N axes),
`lugia_reference_axes_fonctionnels.md` (les 10 axes). Implémentation : `demo/extract_questionnaire.py` (table EXTRACT).*
