# Moteur WSF générique — Spécification technique
> Le cœur réutilisable de Lugia & Co · Mai 2026

---

## Principe directeur

> **Tout ce qui est dans ce document est générique. Rien n'est médical, juridique ou financier. Les secteurs sont des instances de ce moteur, jamais des exceptions à ce moteur.**

Le test de validation : un développeur qui lit cette spécification doit pouvoir construire Lugia Doctor, Lugia Lawyer ou Lugia Finance sans modifier une seule règle du moteur — uniquement en fournissant des données d'instanciation.

---

## 1. Le modèle de données du graphe

### 1.1 — L'objet (nœud du graphe)

Tout élément d'un système de travail est un **objet typé**. Un objet n'a jamais de sémantique métier dans le moteur — seulement un type WSF.

```
Objet {
  id            : identifiant unique         // "obj_a3f5c8"
  composante    : ComposanteWSF              // enum des 9 composantes
  type          : TypeObjet                  // sous-type structurel
  label         : string                     // contenu métier (instancié)
  etat          : EtatObjet                  // santé actuelle
  criticite     : Criticite                  // importance dans le système
  sensibilite   : Sensibilite | null         // pour les objets Information
  metadata      : map<string, any>           // extension sectorielle libre
}
```

### 1.2 — Les 9 composantes WSF (enum fermé)

```
ComposanteWSF {
  PARTICIPANT      // qui fait le travail
  INFORMATION      // ce qui est traité/produit
  TECHNOLOGIE      // les outils
  PROCESSUS        // comment le travail est fait
  INFRASTRUCTURE   // ressources partagées
  STRATEGIE        // orientations, objectifs
  ENVIRONNEMENT    // contexte externe (frontière du système)
  PRODUIT          // outputs (produits/services)
  CLIENT           // bénéficiaires de la valeur
}
```

Ces 9 composantes sont **immuables**. Aucun secteur n'en ajoute ni n'en retire. C'est ce qui garantit la réutilisabilité.

### 1.3 — Les types d'objets (forme structurelle)

Le type précise la forme de l'objet, indépendamment du secteur. Il détermine la forme Mermaid au rendu.

```
TypeObjet {
  ACTEUR        → forme: acteur       // un humain ou rôle
  ENTITE        → forme: rectangle    // un objet de données
  STOCK         → forme: cylindre     // une base, un réservoir
  ACTION        → forme: arrondi       // une étape de processus
  DECISION      → forme: losange       // un point de choix
  FLUX          → forme: parallélogramme // une entrée/sortie
  CONTRAINTE    → forme: triangle      // une règle, une limite
  FRONTIERE     → forme: cercle        // limite du système
}
```

### 1.4 — Les états d'un objet (santé)

L'état est le cœur de la lecture de "santé du système de travail".

```
EtatObjet {
  OPTIMAL          // fonctionne au mieux
  FONCTIONNEL      // fonctionne correctement
  DEGRADE          // fonctionne mais sous-optimal
  A_RISQUE         // exposition identifiée
  BLOQUE           // empêche le flux
  NON_DOCUMENTE    // existe mais non formalisé
  EN_TRANSFORMATION // en cours de chantier
  INACTIF          // présent mais non utilisé
}
```

### 1.5 — La criticité

```
Criticite {
  CRITIQUE      // sa défaillance arrête le système
  IMPORTANT     // sa défaillance dégrade fortement
  STANDARD      // sa défaillance a un impact modéré
  PERIPHERIQUE  // sa défaillance a peu d'impact
}
```

### 1.6 — La sensibilité (objets INFORMATION uniquement)

```
Sensibilite {
  CRITIQUE      // identifiant direct, donnée ultra-sensible
  ELEVEE        // identifiant indirect
  MODEREE       // donnée métier sensible
  STANDARD      // donnée métier courante
  PUBLIQUE      // aucune protection requise
}
```

---

## 2. Le modèle de liaison (arc du graphe)

### 2.1 — La liaison

```
Liaison {
  id          : identifiant unique
  source      : id de l'objet source
  cible       : id de l'objet cible
  type        : TypeLiaison
  sens        : UNIDIRECTIONNEL | BIDIRECTIONNEL
  force       : float [0.0 - 1.0]    // intensité causale
  delai       : Delai                 // temps de propagation
  caractere   : OBLIGATOIRE | OPTIONNEL | CONDITIONNEL
  condition   : string | null         // si CONDITIONNEL
}
```

### 2.2 — Les types de liaison (enum fermé)

```
TypeLiaison {
  UTILISE       // Participant utilise Technologie
  PRODUIT       // Processus produit Information/Produit
  CONSOMME      // Processus consomme Information
  TRANSFORME    // Action transforme Information
  CONTRAINT     // Stratégie/Contrainte contraint Processus
  SUPPORTE      // Infrastructure supporte Participant/Techno
  ALIMENTE      // Information alimente Processus
  DELIVRE       // Produit délivré à Client
  ORIENTE       // Stratégie oriente Processus
  INTERFACE     // Output d'un WSF → Input d'un autre WSF
  REMPLACE      // un objet remplace un autre (transformation)
}
```

### 2.3 — Le délai de propagation

```
Delai {
  IMMEDIAT     → facteur 1.0
  COURT_TERME  → facteur 0.7   // jours/semaines
  MOYEN_TERME  → facteur 0.4   // mois
  LONG_TERME   → facteur 0.2   // trimestres/années
}
```

---

## 3. Les règles de cohérence du graphe

Un graphe WSF est **valide** si et seulement si toutes ces règles sont respectées :

### R1 — Typage des liaisons
Chaque type de liaison n'est valide qu'entre certaines composantes :

| TypeLiaison | Source autorisée | Cible autorisée |
|---|---|---|
| UTILISE | PARTICIPANT | TECHNOLOGIE |
| PRODUIT | PROCESSUS | INFORMATION, PRODUIT |
| CONSOMME | PROCESSUS | INFORMATION |
| TRANSFORME | PROCESSUS, TECHNOLOGIE | INFORMATION |
| CONTRAINT | STRATEGIE, ENVIRONNEMENT | PROCESSUS, TECHNOLOGIE |
| SUPPORTE | INFRASTRUCTURE | PARTICIPANT, TECHNOLOGIE, PROCESSUS |
| ALIMENTE | INFORMATION | PROCESSUS |
| DELIVRE | PRODUIT | CLIENT |
| ORIENTE | STRATEGIE | PROCESSUS, PARTICIPANT |
| INTERFACE | PRODUIT, INFORMATION | (objet d'un autre WSF) |
| REMPLACE | tout | même composante |

### R2 — Frontière du système
Un objet de composante ENVIRONNEMENT ne peut être que **source** d'une liaison CONTRAINT, jamais cible. L'environnement agit sur le système, le système n'agit pas sur l'environnement (dans le périmètre modélisé).

### R3 — Chaîne de valeur obligatoire
Tout graphe valide doit contenir au moins un chemin complet :
```
PARTICIPANT → (UTILISE) → TECHNOLOGIE → (TRANSFORME) → INFORMATION
→ (ALIMENTE) → PROCESSUS → (PRODUIT) → PRODUIT → (DELIVRE) → CLIENT
```
S'il n'existe pas, le système de travail est incomplet.

### R4 — Pas de cycle non intentionnel
Les cycles sont autorisés uniquement s'ils sont marqués comme boucle de feedback (pattern explicite). Un cycle non marqué est une erreur de modélisation.

### R5 — Cohérence sensibilité/protection
Tout objet INFORMATION de sensibilité CRITIQUE ou ELEVEE qui est cible d'une liaison INTERFACE (sort du système) doit passer par un objet TECHNOLOGIE de type protection (le vault). Sinon → alerte de risque.

---

## 4. La bibliothèque de patterns

Un **pattern** est un sous-graphe nommé, réutilisable, indépendant du secteur.

### 4.1 — Structure d'un pattern

```
Pattern {
  id          : identifiant            // "pattern_validation_humaine"
  nom         : string                 // "Validation humaine"
  description : string
  objets      : liste d'objets génériques (avec placeholders)
  liaisons    : liste de liaisons génériques
  parametres  : liste de placeholders à instancier
  sante_type  : quel problème de santé il résout
}
```

### 4.2 — Les patterns fondamentaux (catalogue de base)

**P1 — Flux de traitement**
```
[Input:INFORMATION] --ALIMENTE--> (Transformation:PROCESSUS) --PRODUIT--> [Output:PRODUIT]
```
Universel. Présent dans tout processus.

**P2 — Validation humaine**
```
(Système:TECHNOLOGIE) --PRODUIT--> [Suggestion:INFORMATION]
[Suggestion] --ALIMENTE--> (Validation:PROCESSUS par PARTICIPANT)
(Validation) --PRODUIT--> [Action validée:PRODUIT]
```
Présent partout où l'IA assiste sans décider.

**P3 — Boucle de feedback**
```
[Output:PRODUIT] --ALIMENTE--> (Mesure:PROCESSUS)
(Mesure) --PRODUIT--> [Métrique:INFORMATION]
[Métrique] --ORIENTE--> (Processus initial:PROCESSUS)   [boucle marquée]
```

**P4 — Interface inter-systèmes**
```
[Output WSF-A:PRODUIT] --INTERFACE--> [Input WSF-B:INFORMATION]
```
Pattern de liaison entre deux organisations.

**P5 — Goulot d'étranglement**
```
[Flux entrant:multiple] --ALIMENTE--> (Ressource limitée:PARTICIPANT/TECHNO état:DEGRADE)
(Ressource limitée) --PRODUIT--> [Flux sortant:réduit]
```
Pattern de diagnostic de santé.

**P6 — Conformité comme contrainte**
```
[Réglementation:ENVIRONNEMENT] --CONTRAINT--> (Processus:PROCESSUS)
(Processus) --REMPLACE--> (Processus adapté:PROCESSUS)
```
Pattern central de Lugia & Co.

**P7 — Protection des données**
```
[Donnée sensible:INFORMATION sensibilite:CRITIQUE] --ALIMENTE--> (Vault:TECHNOLOGIE)
(Vault) --TRANSFORME--> [Donnée tokenisée:INFORMATION sensibilite:PUBLIQUE]
[Donnée tokenisée] --INTERFACE--> [Système externe:ENVIRONNEMENT]
```

### 4.3 — Règles d'instanciation d'un pattern

Un pattern devient sectoriel par **substitution de placeholders** :

```
Pattern générique P2 (Validation humaine)
─────────────────────────────────────────
{Système}     → "Assistant IA Lugia"
{Suggestion}  → "Projet d'ordonnance"     (Doctor)
              → "Projet de conclusions"   (Lawyer)
              → "Recommandation produit"  (Finance)
{Validation}  → "Le médecin relit et signe"
{Action}      → "Ordonnance délivrée"
```

La structure (objets, types, liaisons, forces) reste identique. Seuls les labels changent.

### 4.4 — Détection automatique de patterns

Le moteur scanne un graphe et identifie les patterns présents par **isomorphisme de sous-graphe** :
- Mêmes types de composantes dans le même agencement
- Mêmes types de liaisons
- Indépendamment des labels

Quand un pattern est détecté, le moteur peut :
- Suggérer des améliorations connues pour ce pattern
- Réutiliser des chantiers déjà calibrés pour ce pattern dans d'autres secteurs
- Alerter sur les problèmes de santé typiques de ce pattern

---

## 5. Le moteur de simulation causale

### 5.1 — Principe

Quand un objet change d'état, l'impact se propage dans le graphe selon les liaisons et leurs forces.

### 5.2 — Algorithme de propagation

```
fonction propager(objet_modifié, nouvel_état):
    impact_initial = magnitude(ancien_état → nouvel_état)
    file = [(objet_modifié, impact_initial)]
    impacts = {}
    visités = ensemble vide

    tant que file non vide:
        (objet, impact) = défiler(file)

        si objet dans visités:           # règle anti-cycle R4
            continuer
        marquer objet comme visité

        pour chaque liaison sortante de objet:
            cible = liaison.cible
            facteur_délai = facteur(liaison.delai)
            impact_cible = liaison.force × impact × facteur_délai

            si impact_cible >= SEUIL (0.05):     # arrêt si trop faible
                impacts[cible] += impact_cible
                si cible.composante != ENVIRONNEMENT:  # règle R2
                    enfiler(cible, impact_cible)

    retourner impacts
```

### 5.3 — Magnitude d'un changement d'état

```
matrice_magnitude[ancien_état][nouvel_état] :

           OPTIMAL FONCT DEGRADE RISQUE BLOQUE
OPTIMAL      0.0   -0.3   -0.6   -0.8   -1.0
FONCTIONNEL +0.3    0.0   -0.4   -0.6   -0.9
DEGRADE     +0.6   +0.4    0.0   -0.3   -0.7
A_RISQUE    +0.8   +0.6   +0.3    0.0   -0.5
BLOQUE      +1.0   +0.9   +0.7   +0.5    0.0

(positif = amélioration, négatif = dégradation)
```

### 5.4 — Résultat de simulation

```
SimulationResult {
  objet_source     : objet modifié
  impacts_directs  : liste (objet, impact, niveau:1)
  impacts_indirects: liste (objet, impact, niveau:2,3...)
  impact_outputs   : impact agrégé sur les PRODUIT
  impact_clients   : impact agrégé sur les CLIENT
  chemins_critiques: chemins où force cumulée > 0.5
  delai_global     : délai max de matérialisation
}
```

### 5.5 — Usages de la simulation

**Améliorer un processus**
```
simuler(améliorer technologie X de DEGRADE → OPTIMAL)
→ voir l'impact sur les outputs et les clients
→ comparer plusieurs interventions
→ choisir celle au meilleur ratio impact/effort
```

**Évaluer un risque**
```
simuler(passer infrastructure Y de FONCTIONNEL → BLOQUE)
→ voir ce qui s'effondre en cascade
→ identifier les dépendances critiques
→ prioriser la résilience
```

**Aligner moyens et objectifs**
```
pour chaque STRATEGIE (objectif):
    identifier les PROCESSUS qu'elle ORIENTE
    simuler l'état actuel de ces processus
    si impact sur PRODUIT < objectif visé:
        → désalignement détecté
        → proposer un chantier sur le maillon faible
```

---

## 6. L'état de santé du système de travail

### 6.1 — Calcul du score de santé global

```
santé_globale = Σ (poids_criticité(objet) × score_état(objet)) / Σ poids_criticité(objet)

où:
  poids_criticité: CRITIQUE=4, IMPORTANT=3, STANDARD=2, PERIPHERIQUE=1
  score_état: OPTIMAL=1.0, FONCTIONNEL=0.8, DEGRADE=0.5,
              A_RISQUE=0.3, NON_DOCUMENTE=0.4, BLOQUE=0.0,
              EN_TRANSFORMATION=0.6, INACTIF=0.5
```

### 6.2 — Santé par composante

Le système calcule un score de santé pour chacune des 9 composantes WSF, ce qui donne une lecture en radar :

```
Participants     ████████░░  0.82
Information       ██████░░░░  0.61
Technologies      █████░░░░░  0.54
Processus         ███████░░░  0.70
Infrastructure    ████████░░  0.80
Stratégies        ██████░░░░  0.65
```

### 6.3 — Détection des désalignements

Un **désalignement** est détecté quand :
- Une STRATEGIE (objectif) oriente un PROCESSUS dont la santé est < 0.5
- Un PRODUIT critique dépend d'une chaîne contenant un objet BLOQUE
- Un flux INTERFACE expose une INFORMATION sensible sans protection (règle R5)

Chaque désalignement génère une **action recommandée** (un chantier).

---

## 7. Du diagnostic au chantier — la boucle complète

```
1. QUESTIONNAIRE
   Les réponses instancient le graphe WSF
   (objets, états, liaisons calibrées)
        ↓
2. DIAGNOSTIC
   Calcul de la santé globale et par composante
   Détection des patterns présents
   Détection des désalignements
        ↓
3. RESTITUTION
   Score de santé en radar
   Patterns identifiés
   Désalignements → chantiers recommandés
        ↓
4. SIMULATION (par chantier)
   "Si vous menez ce chantier, voici l'impact en cascade"
   Quantifie le gain sur outputs et clients
        ↓
5. CHANTIER (LLM)
   Le LLM connaît le graphe, les patterns, les désalignements
   Il guide la transformation d'un objet DEGRADE/A_RISQUE → OPTIMAL
        ↓
6. MISE À JOUR DU GRAPHE
   L'objet transformé change d'état
   Le graphe se met à jour
   La santé globale est recalculée
        ↓
   (retour à l'étape 2 — le système est vivant)
```

---

## 8. Séparation générique / sectoriel

C'est la règle d'or pour rendre l'option B possible plus tard.

### Ce qui est GÉNÉRIQUE (le moteur, jamais modifié)
- Les 9 composantes WSF
- Les types d'objets et de liaisons
- Les états et la matrice de magnitude
- Les règles de cohérence R1–R5
- La bibliothèque de patterns de base
- L'algorithme de propagation
- Le calcul de santé

### Ce qui est SECTORIEL (fourni par instanciation)
- Le questionnaire (questions → objets et états)
- Les labels métiers des objets
- Les patterns sectoriels spécifiques
- Les chantiers et leurs livrables LLM
- Les contraintes réglementaires du secteur (objets ENVIRONNEMENT)
- La calibration fine des forces causales

### Le contrat d'instanciation d'un secteur

Pour lancer une nouvelle verticale, il suffit de fournir :

```
InstanciationSecteur {
  nom                : "Lugia Lawyer"
  questionnaire      : liste de questions → règles de génération du graphe
  labels             : map<type_générique, label_métier>
  patterns_secteur   : patterns spécifiques au secteur
  environnement      : objets ENVIRONNEMENT (réglementations)
  chantiers          : liste de chantiers avec prompts LLM
  calibration        : forces causales ajustées au terrain
}
```

**Aucun code du moteur n'est touché.** C'est ça qui garantit qu'on passe de 6 mois à 6 semaines pour lancer une verticale.

---

## 9. Représentation Mermaid — règle de rendu

Le moteur génère automatiquement le Mermaid depuis le graphe.

### Mapping objet → forme Mermaid
```
ACTEUR      → A[nom]           (rectangle, ou acteur en sequence)
ENTITE      → B[nom]           (rectangle)
STOCK       → C[(nom)]         (cylindre)
ACTION      → D(nom)           (arrondi)
DECISION    → E{nom}           (losange)
FLUX        → F[/nom/]         (parallélogramme)
CONTRAINTE  → G[\nom\]         (trapèze inversé)
FRONTIERE   → H((nom))         (cercle)
```

### Mapping état → style (classDef)
```
OPTIMAL          → fill vert, stroke vert
FONCTIONNEL      → fill neutre, stroke vert clair
DEGRADE          → fill ambre clair, stroke ambre
A_RISQUE         → fill rouge clair, stroke rouge
BLOQUE           → fill rouge, stroke rouge foncé
NON_DOCUMENTE    → fill gris, stroke pointillé
EN_TRANSFORMATION→ fill bleu clair, stroke bleu
```

### Mapping liaison → flèche Mermaid
```
force >= 0.7   → ==>  (épaisse, critique)
force 0.3-0.7  → -->  (normale)
force < 0.3    → -.-> (pointillée, faible)
OBLIGATOIRE    → trait plein
OPTIONNEL      → trait pointillé
INTERFACE      → --o  (cercle, inter-systèmes)
```

### Choix du type de diagramme selon la question
```
"Comment ça fonctionne ?"        → flowchart
"Quelles données ?"               → erDiagram / classDiagram
"Comment se déroule ce chantier ?"→ sequenceDiagram
"Quel est l'état de santé ?"      → stateDiagram + radar custom
"Par quoi commencer ?"            → quadrantChart
"Quel impact si je change X ?"    → flowchart avec mise en évidence du chemin
```

---

## 10. Ce que ce moteur permet, à terme

- **Option A** : modéliser n'importe quel cabinet/cabinet dans n'importe quel secteur réglementé, diagnostiquer sa santé, recommander des chantiers
- **Réutilisabilité** : un pattern calibré dans la santé sert dans le juridique sans recommencer
- **Simulation** : montrer au professionnel l'impact en cascade d'un changement avant de le faire
- **Inter-systèmes** : relier le WSF d'un cabinet à celui d'un partenaire (labo, tribunal, assureur)
- **Option B (à terme)** : exposer le moteur à des tiers pour modéliser tout système de travail

---

*Spécification moteur WSF générique — Lugia & Co — Mai 2026*
*Document d'architecture — fondation de toutes les verticales*
