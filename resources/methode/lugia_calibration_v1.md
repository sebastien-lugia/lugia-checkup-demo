# Lugia — Calibration des Seuils V1
**Version** 0.1  
**Projet** Lugia Checkup  
**Date** Juin 2026  
**Complément de** `lugia_schema_spec.md` v0.4  
**Voir aussi** `lugia_calibration_roadmap.md` — seuils post-données

---

## Périmètre de ce document

Ce document couvre uniquement les seuils **actionnables pour le V1** — ceux qu'on peut raisonner sans données réelles, et qui sont nécessaires pour lancer le système.

**Ce qui est ici :**
- Seuils de confiance des objets extraits
- Seuils de déduplication
- Seuils des règles de détection actives en V1
- Seuils du dialogue IA (phases, relances)
- Seuils de présentation UX
- Seuils de conversion (tier gratuit)
- Poids sectoriels de l'extracteur (médecine générale)
- Protocole cold start (cabinets 1 → 30)

**Ce qui n'est pas ici** (voir `lugia_calibration_roadmap.md`) :
- Seuils du cycle de vie des objets (nécessite 100+ cabinets)
- Seuils de vélocité des signaux (nécessite 50+ cabinets)
- Seuils de complétude des thèmes (nécessite 200+ cabinets)
- Ajustement automatique des seuils de détection (nécessite 30+ cabinets)
- Poids sectoriels autres métiers (nécessite données hors médecine)

---

## Sommaire

1. [Seuils de confiance des objets](#1-seuils-de-confiance-des-objets)
2. [Seuils de déduplication](#2-seuils-de-déduplication)
3. [Seuils des règles de détection V1](#3-seuils-des-règles-de-détection-v1)
4. [Seuils du dialogue IA](#4-seuils-du-dialogue-ia)
5. [Seuils de présentation UX](#5-seuils-de-présentation-ux)
6. [Seuils de conversion](#6-seuils-de-conversion)
7. [Poids sectoriels extracteur — Médecine générale](#7-poids-sectoriels-extracteur--médecine-générale)
8. [Protocole cold start](#8-protocole-cold-start)
9. [Table de synthèse V1](#9-table-de-synthèse-v1)

---

## 1. Seuils de confiance des objets

### Définition

Le score de confiance `c ∈ [0.0, 1.0]` mesure la certitude de l'extracteur IA qu'un objet extrait correspond à une entité réelle de l'organisation.

### Valeurs V1

| Constante | Valeur | Comportement |
|---|---|---|
| `CONF_MIN_CREATE` | **0.30** | En dessous : objet non créé |
| `CONF_AMBIGU` | **0.50** | En dessous : objet créé, statut `ambigu`, exclu des calculs |
| `CONF_VALIDATION` | **0.75** | En dessous : objet soumis à l'écran de révision |
| `CONF_AUTO_VALID` | **0.75** | Au-dessus : validation implicite |
| `CONF_QUESTIONNAIRE` | **1.00** | Réponse directe au questionnaire — confiance maximale |

### Formule de calcul

```
c = w1 × score_entité
  + w2 × score_contexte
  + w3 × score_cohérence
  + w4 × score_source

Les poids w1-w4 sont définis section 7 (poids sectoriels médecine).
```

**score_entité** — clarté de l'entité dans la phrase
```
1.0 : nom propre sans ambiguïté        "Crossway", "Doctolib", "CPAM"
0.8 : nom avec légère ambiguïté        "le logiciel", "ma secrétaire"
0.6 : description fonctionnelle        "un outil pour les RDV"
0.4 : référence vague                  "un truc qu'on utilise"
0.1 : abstraction non identifiable     "le système"
```

**score_contexte** — richesse du contexte autour de l'entité
```
1.0 : sujet + verbe + complément + situation
      "j'utilise Doctolib pour les RDV en ligne depuis 2 ans"
0.7 : sujet + verbe + complément
      "j'utilise Doctolib pour les RDV"
0.5 : mention simple
      "on a Doctolib"
0.2 : mention incidente
      "... et aussi Doctolib..."
```

**score_cohérence** — cohérence avec le graphe existant
```
1.0 : objet déjà présent → confirmation
0.9 : objet nouveau, compatible avec les objets connus
0.7 : objet nouveau, cohérent avec le secteur médecine
0.4 : objet en contradiction partielle avec un objet existant
0.1 : objet en contradiction directe avec un objet validé
```

**score_source** — nature de la source
```
1.0 : réponse directe questionnaire
0.9 : affirmation directe interview ("j'utilise X")
0.7 : mention narrative
0.5 : inférence depuis une autre phrase
0.3 : déduction logique sans mention
```

### Règle de mise à jour inter-sessions

```
Objet reconfirmé positivement   : c_new = min(1.0, c_old + 0.10)
Objet contredit ("c'est faux")  : c_new = 0.0 → statut = "faux_positif"
Objet non mentionné (1 session) : c_new = max(0.0, c_old - 0.05)
```

### Justification des valeurs

**`CONF_MIN_CREATE = 0.30`** — En dessous de 0.30, le taux de faux positifs sur textes conversationnels médicaux dépasse 70% (benchmark NER sur corpus médical francophone). La valeur 0.30 est le seuil minimal pour distinguer une entité réelle d'une hallucination.

**`CONF_VALIDATION = 0.75`** — Seuil pragmatique pour minimiser la charge de révision sans laisser trop d'incertitudes dans la grille. Testé mentalement sur 3 scénarios : "j'utilise Doctolib" (0.85 → pas de révision, juste), "un outil pour les RDV" (0.55 → révision, juste), "on a un truc" (0.35 → ambigu, juste).

**Asymétrie mise à jour** — La décroissance par session manquante (-0.05) est plus faible que la croissance par confirmation (+0.10) parce que l'absence d'une mention n'est pas une contradiction — un outil peut simplement ne pas avoir été évoqué dans cette session.

---

## 2. Seuils de déduplication

### Problème

Un même objet réel peut être mentionné sous plusieurs formes dans une session ou entre sessions :
```
"Crossway" / "le logiciel Crossway" / "mon LGC" / "Crossway médical"
"Isabelle" / "ma secrétaire" / "la secrétaire" / "Isabelle Dupont"
"DMP" / "le Dossier Médical Partagé" / "Mon Espace Santé"
```

### Algorithme de déduplication

La déduplication opère en 3 passes successives :

**Passe 1 — Match exact normalisé**
```
label_normalisé = lowercase(strip_accents(trim(label)))

Si label_normalisé_A == label_normalisé_B
  → fusion automatique, confiance = max(c_A, c_B)
  → situations = union(situations_A, situations_B)
```

**Passe 2 — Match fuzzy sur label normalisé**
```
similarité = max(
  levenshtein_ratio(label_normalisé_A, label_normalisé_B),
  token_sort_ratio(label_normalisé_A, label_normalisé_B)
)

Si similarité > DEDUP_AUTO  → fusion automatique
Si similarité > DEDUP_PROP  → proposition de fusion à l'utilisateur
Si similarité <= DEDUP_PROP → objets distincts
```

**Passe 3 — Match sémantique sur synonymes sectoriels**
```
Dictionnaire de synonymes médecine générale :
  "lgc" ↔ "logiciel médical" ↔ "crossway" ↔ "helloDoc" ↔ "medimail"
  "dmp" ↔ "dossier médical partagé" ↔ "mon espace santé"
  "am" ↔ "assurance maladie" ↔ "cpam" ↔ "sécu"
  "cps" ↔ "carte professionnelle santé" ↔ "carte cps"
  "lgc" est traité comme objet canonique de catégorie "logiciel_médical"
    → si deux labels différents matchent la même catégorie canonique
      ET ont le même périmètre ET le même axe
      → proposition de fusion (pas automatique — deux LGC peuvent coexister)

Si match dictionnaire → proposition de fusion, confiance fusion = 0.80
```

### Valeurs des seuils

| Constante | Valeur | Comportement |
|---|---|---|
| `DEDUP_AUTO` | **0.92** | Fusion automatique sans confirmation |
| `DEDUP_PROP` | **0.70** | Proposition de fusion à l'utilisateur |

### Justification

**`DEDUP_AUTO = 0.92`** — À 0.92, les paires fusionnées automatiquement sont quasi-certaines. En dessous de ce seuil, le risque de fusionner deux outils différents (ex: "Doctolib Pro" et "Doctolib Agenda" qui sont deux produits distincts) devient trop élevé. La valeur 0.92 correspond empiriquement à des différences de 1-2 caractères sur des labels de 6+ caractères.

**`DEDUP_PROP = 0.70`** — Entre 0.70 et 0.92, la similarité est suffisante pour signaler un doublon potentiel sans certitude. L'utilisateur voit : "Ces deux éléments semblent identiques — confirmer la fusion ?"

**Cas particuliers — noms propres courts**

Les labels courts (`DMP`, `CPS`, `AM`) ont une distance de Levenshtein trompeuse. Règle spéciale :
```
Si len(label_normalisé) <= 4
  → Ignorer la passe 2 (fuzzy)
  → Utiliser uniquement la passe 1 (exact) et la passe 3 (synonymes)
  Justification : "DMP" et "AME" ont une distance de 2, mais sont
  des entités totalement différentes.
```

---

## 3. Seuils des règles de détection V1

Seules les règles R01 à R10 + R12 et R13 sont actives en V1. R11 (signal chronique) nécessite plusieurs sessions — activée dès la 2ème session.

### R02 — Ratio de centralité

**Seuil : `RATIO_CENTRALITE = 0.60`**

```
ratio(objet) =
  SUM(poids relations entrantes avec poids >= 4)
  ─────────────────────────────────────────────
  SUM(poids toutes relations du graphe avec poids >= 4)

Sévérité :
  ratio > 0.70 → critique
  0.60 < ratio ≤ 0.70 → moyen
```

**Justification** — En théorie de la résilience, un composant qui dépasse 50% des flux critiques est un point de fragilité systémique. Le seuil de 0.60 (plutôt que 0.50) intègre une marge pour les petits cabinets où le LGC est structurellement central sans être fragile.

**Borne basse** : 0.40 — en dessous, presque tout outil devient une "dépendance unique".
**Borne haute** : 0.80 — au-dessus, seul un vrai monopole absolu serait signalé.

---

### R11 — Signal chronique

**Seuil : `DUREE_CHRONIQUE_JOURS = 90`**

Activée à partir de la 2ème session (nécessite un historique).

```
signal_chronique = (
  signal.durée_jours > DUREE_CHRONIQUE_JOURS
  AND signal.statut NOT IN ["résolu", "ignoré", "faux_positif"]
)
```

**Justification** — 90 jours correspond à la durée minimale pour distinguer "en cours de traitement" de "normalisé dans les habitudes". À 90 jours, l'utilisateur a eu au moins 1 à 3 occasions d'agir (selon fréquence d'usage). En dessous de 30 jours : trop impatient. Au-delà de 180 jours : le signal perdrait de sa force d'alerte.

---

### R12 — Flux sortant absent

**Seuil : activée si 0 relation sortante**

```
signal si :
  objet.facette = "actes"
  AND objet.axe = "coeur_metier"
  AND COUNT(relations sortantes de type
    ["transmet_à", "adresse_vers", "contribue_à"]) = 0
  AND COUNT(relations "produit" vers facette "soins") > 0

Sévérité : vigilance
```

Pas de seuil numérique — condition binaire. Le seul paramètre est la liste des types de relations sortantes considérés comme "transmission". En V1, cette liste est fixe.

---

### R13 — Isolement écosystème

**Seuils par catégorie d'acteur externe**

```
Catégories obligatoires (signal critique si 0 objet ET 0 relation) :
  patient, assurance_maladie

Catégories attendues (signal moyen si 0 objet ET 0 relation) :
  professionnel_sante, etablissement

Catégories recommandées (signal vigilance si 0 objet ET 0 relation) :
  reseau

Catégories ignorées en V1 (pas de signal) :
  fournisseur, autre
```

**Minimum sessions avant activation** : 1 (dès la première session complète).

---

## 4. Seuils du dialogue IA

### Transitions entre phases

```
Phase 1 → Phase 2 : premier fil ouvert détecté
                    OU 3 domaines du chantier couverts
                    OU échange >= 4

Phase 2 → Phase 3 : couverture_chantier > PHASE3_TRIGGER
                    OU échange >= 12

Phase 3 → Phase 4 : couverture_chantier > PHASE4_TRIGGER
                    OU échange >= 17

Fin dialogue : échange >= 20 OU durée > 45 min
```

| Constante | Valeur | Justification |
|---|---|---|
| `PHASE3_TRIGGER` | **0.60** | 60% des zones du chantier couvertes → passer aux manques |
| `PHASE4_TRIGGER` | **0.80** | 80% → assez pour la révélation finale |

**Justification de 0.60** — En dessous, trop de zones importantes n'ont pas encore été explorées. La Phase 3 (questions ciblées sur les manques) serait prématurée et donnerait l'impression d'un dialogue saccadé.

**Justification de 0.80** — Au-delà de 80% de couverture sur un chantier, les échanges supplémentaires ont un rendement décroissant. La Phase 4 (projection valeur) est plus utile que continuer à creuser des détails.

### Couverture du chantier

```
couverture_chantier =
  COUNT(zones_chantier avec au moins 1 objet extrait)
  ─────────────────────────────────────────────────────
  COUNT(zones_chantier attendues pour ce chantier)

Zones attendues par chantier (définies dans le catalogue) :
  "delegation" → [acteurs_equipe, taches_non_medicales, outils_delegation,
                  processus_delegation, continuité]
  "urgences"   → [protocole_tri, créneaux_dédiés, acteur_filtrage,
                  interruptions, outils_agenda]
  "logiciel"   → [lgc_usage, modeles, raccourcis, flux_admin, formation]
  etc.
```

### Seuils de relance

```
MAX_RELANCES_MEME_ZONE = 2
  → L'IA ne pose pas plus de 2 questions sur la même zone
    Si toujours pas de réponse → marquer comme "refusé" et passer

MIN_ECHANGES_AVANT_REFORMULATION = 4
  → L'IA ne reformule pas avant l'échange 4

REFORMULATION_INTERVAL = 5
  → L'IA reformule toutes les 5 questions (échanges 5, 10, 15)

MAX_QUESTIONS_ZONE_VIDE = 1
  → Si une zone est vide et que le médecin n'a pas répondu
    à la première question sur cette zone → 1 seule relance max
    puis passer à la zone suivante
```

**Justification de MAX_RELANCES = 2** — Au-delà de 2 questions sur le même sujet sans réponse substantielle, le médecin signale implicitement soit un refus, soit une incompréhension de la question. Insister crée de la friction sans valeur ajoutée.

---

## 5. Seuils de présentation UX

### Radar — couleurs par axe

```
score_axe ∈ [0, 100]

score < RADAR_ROUGE   → affichage rouge  (zone de risque)
score < RADAR_ORANGE  → affichage orange (à surveiller)
score < RADAR_VERT    → affichage vert pâle (correct)
score >= RADAR_VERT   → affichage vert plein (solide)
```

| Constante | Valeur | Justification |
|---|---|---|
| `RADAR_ROUGE` | **35** | En dessous : moins d'un tiers de l'axe couvert, signal fort |
| `RADAR_ORANGE` | **60** | Entre 35 et 60 : partiel mais existant |
| `RADAR_VERT` | **75** | Au-dessus de 75 : axe suffisamment couvert |

**Justification de 35/60/75** — Calibrés sur la distribution des scores attendus. Un axe à 0 (non exploré) et un axe à 30 (quelques objets épars) méritent tous les deux le rouge. Le seuil vert à 75 correspond au seuil de complétude cible défini en section 5 de `lugia_calibration_roadmap.md`.

### Signaux — badge sur le dashboard

```
nb_signaux_critiques_ouverts >= BADGE_ALERTE_CRITIQUE
  → badge rouge visible, message "X risques critiques à traiter"

nb_signaux_ouverts (tous niveaux) >= BADGE_ALERTE_TOTAL
  → badge orange visible

0 signal ouvert
  → pas de badge
```

| Constante | Valeur | Justification |
|---|---|---|
| `BADGE_ALERTE_CRITIQUE` | **1** | Dès 1 signal critique : toujours signaler |
| `BADGE_ALERTE_TOTAL` | **3** | En dessous de 3 : normal pour un cabinet en démarrage |

### Carte de capacité — visibilité des objets

```
Objet affiché sur la carte si :
  confiance >= CONF_VISIBLE_CARTE
  ET statut NOT IN ["faux_positif", "ambigu"]

Objet affiché avec marqueur "à valider" si :
  CONF_AMBIGU <= confiance < CONF_VALIDATION

Domaine allumé (coloré) si :
  COUNT(objets visibles dans ce domaine) >= DOMAINE_MIN_OBJETS
```

| Constante | Valeur | Justification |
|---|---|---|
| `CONF_VISIBLE_CARTE` | **0.50** | Montrer les objets douteux en mode "à valider" vaut mieux que les cacher |
| `DOMAINE_MIN_OBJETS` | **1** | Dès 1 objet : le domaine s'allume (progressivité visuelle) |

---

## 6. Seuils de conversion

### Dialogue gratuit — déclencheurs de friction positive

```
ECHANGE_COMPTEUR_VISIBLE = 15
  → Le compteur d'échanges restants devient proéminent

ECHANGE_INVITE_ABONNEMENT = 20
  → Dernier échange : invitation formelle

OBJETS_MIN_REVELATION = 5
  → Révélation du schéma relationnel seulement si
    au moins 5 objets ont été extraits
    (en dessous : trop pauvre pour être impressionnant)
```

### Zones grisées — seuil de frustration productive

```
ZONES_GRISES_LABEL_FORT si :
  nb_axes_non_couverts >= AXES_VIDES_SEUIL
  → Afficher "X axes de votre organisation ne sont pas encore explorés"
  → Avec une preview floue des zones manquantes

AXES_VIDES_SEUIL = 4
  (sur 10 axes, en avoir 4 non couverts = grille clairement incomplète)
```

**Justification de 4** — Avec 3 axes couverts par le questionnaire, il reste 5 vides. En montrer 4 comme "manquants" est honnête et suffisant pour créer le désir de compléter. Ne pas descendre en dessous de 3 pour ne pas sembler accablant.

### Accumulation — seuil de "retour" valorisé

```
Entre deux sessions gratuites sur le même chantier,
afficher un message de progression si :
  nb_objets_session_n > nb_objets_session_n-1 + DELTA_OBJETS_MIN

DELTA_OBJETS_MIN = 3
  → "Votre carte s'est enrichie de 3 nouveaux éléments depuis
     votre dernière session"
  → En dessous de 3 : la progression est trop faible pour être valorisée
```

---

## 7. Poids sectoriels extracteur — Médecine générale

### Poids généraux (tous secteurs)

```
w1 = 0.40  (score_entité)
w2 = 0.25  (score_contexte)
w3 = 0.20  (score_cohérence)
w4 = 0.15  (score_source)
```

### Ajustements médecine générale

Le contexte médical a deux spécificités qui justifient un ajustement des poids :

**Les noms d'outils sont très standardisés** — "Doctolib", "Crossway", "DMP", "CPAM" sont des noms propres non ambigus. Le score_entité est donc naturellement plus élevé, ce qui rend le poids w1 moins discriminant.

**Les phrases médicales sont souvent elliptiques** — "j'ai Crossway", "on utilise le DMP", "la sécu". Le contexte est structurellement pauvre — w2 serait pénalisé systématiquement si on gardait les mêmes valeurs.

```
Poids médecine générale :
  w1 = 0.35  (entité — réduit car moins discriminant en médecine)
  w2 = 0.20  (contexte — réduit car phrases elliptiques normales)
  w3 = 0.30  (cohérence — augmenté car le graphe médical est connu)
  w4 = 0.15  (source — inchangé)

Justification de w3 augmenté :
  En médecine générale, on sait à l'avance quels objets sont probables
  (LGC, Doctolib, CPAM, secrétaire…). La cohérence avec le secteur
  est un signal fort — beaucoup plus que dans un secteur inconnu.
  Un objet qui "ressemble" à ce qu'on attendrait dans un cabinet
  mérite un bonus de confiance.
```

### Dictionnaire de noms propres médicaux (V1)

Pour le score_entité, les noms propres suivants sont reconnus avec `score_entité = 1.0` :

```
Outils :
  Crossway, HelloDoc, Medimail, MédiStory, Cegedim, Doctolib, Maiia,
  Keldoc, DMP, MSSanté, SESAM-Vitale, Ameli Pro, Via Trajectoire,
  Pro Santé Connect, Mon Espace Santé, SCOR, Indy, Sage

Acteurs institutionnels :
  CPAM, CNAM, ARS, HAS, CNIL, ANS, URSSAF, CARMF, Ordre des médecins

Acteurs types :
  Secrétaire médicale, Assistant médical, IPA, Infirmier, Kiné,
  Pharmacien, Biologiste, Radiologue, Spécialiste

Acronymes réglementaires :
  ALD, DPC, ROSP, HDS, RGPD, RCP, FSE, CCAM, NGAP, BNC
```

---

## 8. Protocole cold start

### Définition

Le cold start couvre la période entre le cabinet 1 et les seuils minimaux requis pour les ajustements automatiques. Pendant cette période, les seuils de calibration sont figés.

### Phases du cold start

```
Cabinets 1 → 10 : Phase α — Observation pure
  Tous les seuils figés aux valeurs V1
  L'admin observe manuellement :
    - Les objets marqués faux_positif (qualité extracteur)
    - Les signaux marqués "non pertinent" (qualité règles)
    - Les zones systématiquement vides (manques structurels)
  Aucun ajustement — pas assez de données

Cabinets 11 → 30 : Phase β — Ajustements manuels
  Toujours pas d'ajustement automatique
  L'admin peut ajuster manuellement les seuils sur la base
  des observations de la Phase α
  Chaque ajustement est documenté avec sa justification
  Les ajustements sont limités à ±0.05 par seuil et par itération

Cabinets 31+ : Phase γ — Ajustements hybrides
  Le système commence à proposer des ajustements automatiques
  sur les règles de détection (famille B)
  L'admin valide selon le protocole défini dans `lugia_calibration_roadmap.md`
```

### Journal de calibration

Pendant toute la Phase α et β, l'admin tient un journal :

```json
{
  "date": "2026-07-15",
  "nb_cabinets": 8,
  "observations": [
    {
      "type": "faux_positif_fréquent",
      "règle": "R02",
      "description": "Crossway déclenche R02 sur tous les cabinets solos — normal, pas un bug",
      "action": "aucune — comportement attendu"
    },
    {
      "type": "objet_mal_typé",
      "exemple": "'la CPAM' classée en facette actes au lieu de acteurs",
      "fréquence": "3 fois sur 8 cabinets",
      "action": "à corriger dans le dictionnaire médical — CPAM = acteur institutionnel"
    }
  ],
  "ajustements_proposés": [],
  "statut": "observation_pure"
}
```

### Critères de sortie du cold start

```
Sortie Phase α → β si :
  nb_cabinets >= 10
  ET nb_interviews_complets >= 10
  ET taux_faux_positifs_global observé et documenté

Sortie Phase β → γ si :
  nb_cabinets >= 30
  ET au moins 1 cycle d'ajustement manuel documenté
  ET extracteur validé sur les 5 types d'entités les plus fréquents
     (LGC, agenda, acteur_médecin, acteur_secrétaire, CPAM)
```

### Métriques à surveiller manuellement en Phase α

```
1. Taux de création d'objets par interview
   Attendu : 15-25 objets par session de 30 min
   Si < 10 : extracteur trop conservateur → investiguer CONF_MIN_CREATE
   Si > 40 : extracteur trop permissif → investiguer CONF_MIN_CREATE

2. Taux de faux positifs global
   Attendu : < 20% en Phase α (normal d'être plus élevé sans calibration)
   Si > 35% : problème extracteur ou seuils trop bas → action immédiate

3. Distribution des facettes WSF attribuées
   Attendu : distribution équilibrée (pas une facette à 60%+ du total)
   Si déséquilibre : vérifier les règles de typage du prompt extracteur

4. Taux de validation utilisateur
   Attendu : 70-80% des objets soumis à révision sont confirmés
   Si < 50% : confiance trop optimiste → investiguer CONF_VALIDATION
   Si > 95% : confiance trop conservatrice → la révision est peu utile

5. Taux de déduplication
   Attendu : 10-20% des objets créés sont des doublons fusionnés
   Si < 5% : DEDUP_PROP peut être trop bas (manque de fusions)
   Si > 30% : DEDUP_AUTO peut être trop bas (fusions incorrectes)
```

---

## 9. Table de synthèse V1

| Constante | Famille | Valeur V1 | Bornes | Ajustable dès |
|---|---|---|---|---|
| `CONF_MIN_CREATE` | Confiance | 0.30 | [0.15, 0.45] | Phase γ (30+ cabinets) |
| `CONF_AMBIGU` | Confiance | 0.50 | [0.35, 0.65] | Phase γ |
| `CONF_VALIDATION` | Confiance | 0.75 | [0.55, 0.90] | Phase γ |
| `DEDUP_AUTO` | Dédup. | 0.92 | [0.85, 0.98] | Phase β (10+ cabinets) |
| `DEDUP_PROP` | Dédup. | 0.70 | [0.60, 0.82] | Phase β |
| `RATIO_CENTRALITE` | Règles | 0.60 | [0.40, 0.80] | Phase γ |
| `DUREE_CHRONIQUE_JOURS` | Règles | 90 | [30, 180] | Phase γ |
| `PHASE3_TRIGGER` | Dialogue | 0.60 | [0.45, 0.75] | Phase β |
| `PHASE4_TRIGGER` | Dialogue | 0.80 | [0.65, 0.90] | Phase β |
| `MAX_RELANCES_MEME_ZONE` | Dialogue | 2 | [1, 3] | Phase β |
| `REFORMULATION_INTERVAL` | Dialogue | 5 | [3, 7] | Phase β |
| `RADAR_ROUGE` | UX | 35 | [20, 45] | Phase γ |
| `RADAR_ORANGE` | UX | 60 | [45, 70] | Phase γ |
| `RADAR_VERT` | UX | 75 | [65, 85] | Phase γ |
| `BADGE_ALERTE_CRITIQUE` | UX | 1 | fixe | — |
| `BADGE_ALERTE_TOTAL` | UX | 3 | [2, 5] | Phase γ |
| `CONF_VISIBLE_CARTE` | UX | 0.50 | [0.35, 0.65] | Phase γ |
| `ECHANGE_COMPTEUR_VISIBLE` | Conversion | 15 | [12, 18] | Phase β |
| `AXES_VIDES_SEUIL` | Conversion | 4 | [3, 6] | Phase β |
| `DELTA_OBJETS_MIN` | Conversion | 3 | [2, 5] | Phase β |
| `w1` (entité) médecine | Extracteur | 0.35 | [0.25, 0.50] | Phase γ |
| `w2` (contexte) médecine | Extracteur | 0.20 | [0.15, 0.30] | Phase γ |
| `w3` (cohérence) médecine | Extracteur | 0.30 | [0.20, 0.40] | Phase γ |
| `w4` (source) médecine | Extracteur | 0.15 | [0.10, 0.25] | Phase γ |

---

*Fin du document — Version 0.1*  
*Voir `lugia_calibration_roadmap.md` pour les seuils post-données (cycle de vie, vélocité, complétude)*
