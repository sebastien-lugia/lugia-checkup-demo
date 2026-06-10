# Lugia — Spécification de la Calibration des Seuils
**Version** 0.1  
**Projet** Lugia Checkup  
**Auteur** Sébastien / Lugia  
**Date** Juin 2026  
**Complément de** `lugia_schema_spec.md` v0.4

---

## Présentation

Ce document spécifie les seuils utilisés dans le système Lugia — leur valeur de lancement, leur justification, leur mode de calcul automatique, et le protocole d'ajustement hybride (système propose, admin valide).

Les seuils sont des **paramètres vivants**. Leurs valeurs initiales sont des hypothèses raisonnées, pas des vérités. Elles seront ajustées dès que les données réelles de cabinets le permettront.

---

## Sommaire

1. [Taxonomie des seuils](#1-taxonomie-des-seuils)
2. [Seuils de confiance des objets (N4)](#2-seuils-de-confiance-des-objets-n4)
3. [Seuils des règles de détection (N8)](#3-seuils-des-règles-de-détection-n8)
4. [Seuils du cycle de vie (N4 CycleVie)](#4-seuils-du-cycle-de-vie-n4-cyclevie)
5. [Seuils de complétude des thèmes (N3)](#5-seuils-de-complétude-des-thèmes-n3)
6. [Seuils de vélocité des signaux (N6)](#6-seuils-de-vélocité-des-signaux-n6)
7. [Protocole d'ajustement automatique](#7-protocole-dajustement-automatique)
8. [Table de synthèse](#8-table-de-synthèse)

---

## 1. Taxonomie des seuils

Tous les seuils Lugia appartiennent à l'une des quatre familles suivantes :

```
Famille A — Confiance extraction
  Pilotent la création et la visibilité des objets extraits par l'IA.
  Impact : qualité du substrat de données.

Famille B — Détection de signaux
  Pilotent le déclenchement des règles N8.
  Impact : pertinence des alertes générées.

Famille C — Cycle de vie
  Pilotent la progression des objets entre états (emergent → actif…)
  et la vélocité des signaux.
  Impact : fidélité de la modélisation du changement.

Famille D — Complétude
  Pilotent le score de couverture des thèmes et axes.
  Impact : représentation du radar et des zones vides.
```

### Deux types d'erreurs à minimiser

Pour chaque seuil, le réglage cherche à minimiser deux erreurs opposées :

```
Faux positif (FP) : signal déclenché à tort → bruit, perte de confiance utilisateur
Faux négatif (FN) : signal non déclenché alors qu'il devrait l'être → risque manqué

Pour les seuils de confiance objet :
  Seuil trop bas → trop d'objets douteux → grille polluée (FP)
  Seuil trop haut → objets réels non créés → grille incomplète (FN)

Pour les seuils de règles :
  Seuil trop bas → trop d'alertes → fatigue utilisateur (FP)
  Seuil trop haut → risques réels non signalés → outil inutile (FN)
```

La calibration cherche le point d'équilibre selon le **coût asymétrique** de chaque erreur. Pour un outil médical, les FN (risques manqués) sont généralement plus coûteux que les FP (alertes en trop).

---

## 2. Seuils de confiance des objets (N4)

### 2.1 Définition

Le score de confiance `c ∈ [0.0, 1.0]` mesure la certitude de l'extracteur IA qu'un objet extrait correspond bien à une entité réelle de l'organisation.

### 2.2 Valeurs de lancement

| Seuil | Valeur | Comportement système |
|---|---|---|
| `CONF_MIN_CREATE` | **0.30** | En dessous : objet non créé |
| `CONF_AMBIGU` | **0.50** | En dessous : objet créé avec `statut = "ambigu"` |
| `CONF_VALIDATION` | **0.75** | En dessous : objet soumis à validation utilisateur |
| `CONF_AUTO_VALID` | **0.75** | Au-dessus : validation implicite, pas d'action requise |
| `CONF_EXPLICIT` | **1.00** | Réservé aux objets validés explicitement par l'utilisateur |

### 2.3 Justification des valeurs initiales

**`CONF_MIN_CREATE = 0.30`**

En dessous de 0.30, l'extracteur ne dispose pas d'assez d'éléments pour distinguer une entité réelle d'une hallucination ou d'une référence vague. La valeur 0.30 est tirée des benchmarks NLP sur la précision des modèles de NER (Named Entity Recognition) : en dessous de ce seuil, le taux de faux positifs dépasse 70% sur des textes conversationnels médicaux.

**`CONF_AMBIGU = 0.50`**

Entre 0.30 et 0.50, l'objet peut exister mais son label, sa facette ou son axe sont incertains. Créer l'objet avec le statut `ambigu` permet de l'accumuler sans polluer les calculs, en attendant une confirmation. La valeur 0.50 correspond au seuil de "chance raisonnable" — mieux que le hasard mais pas fiable.

**`CONF_VALIDATION = 0.75`**

Entre 0.50 et 0.75, l'objet est probablement réel mais mérite une vérification humaine. La valeur 0.75 est choisie pour minimiser la charge de validation : un seuil plus bas (ex: 0.60) génèrerait trop d'objets à valider ; un seuil plus haut (ex: 0.85) laisserait trop d'incertitudes dans la grille.

### 2.4 Mode de calcul automatique

Le score de confiance est calculé par l'extracteur IA selon la formule pondérée suivante :

```
c = w1 × score_entité
  + w2 × score_contexte
  + w3 × score_cohérence
  + w4 × score_source

Poids de lancement :
  w1 = 0.40  (score_entité)
  w2 = 0.25  (score_contexte)
  w3 = 0.20  (score_cohérence)
  w4 = 0.15  (score_source)
```

**score_entité** — clarté de l'entité dans la phrase source
```
1.0 : nom propre identifiable sans ambiguïté ("Crossway", "Isabelle", "CPAM")
0.8 : nom propre avec légère ambiguïté ("le logiciel", "ma secrétaire")
0.6 : description fonctionnelle sans nom ("un outil pour les RDV")
0.4 : référence vague ("un truc qu'on utilise")
0.1 : abstraction non identifiable ("le système")
```

**score_contexte** — richesse du contexte autour de l'entité
```
1.0 : phrase avec sujet + verbe + complément + situation
      ("j'utilise Doctolib pour les RDV en ligne depuis 2 ans")
0.7 : phrase avec sujet + verbe + complément
      ("j'utilise Doctolib pour les RDV")
0.5 : mention simple sans contexte
      ("on a Doctolib")
0.2 : mention incidente
      ("... et aussi Doctolib...")
```

**score_cohérence** — cohérence avec le graphe existant
```
1.0 : objet déjà présent dans la grille → confirmation
0.9 : objet compatible avec les objets connus (même axe, facette cohérente)
0.7 : objet nouveau mais cohérent avec le secteur
0.4 : objet en contradiction partielle avec un objet existant
0.1 : objet en contradiction directe avec un objet validé
```

**score_source** — nature de la source
```
1.0 : réponse directe à une question fermée (questionnaire)
0.9 : affirmation directe en interview ("j'utilise X")
0.7 : mention dans un contexte narratif
0.5 : inférence depuis une autre phrase ("puisqu'il utilise X, il a probablement Y")
0.3 : déduction logique sans mention explicite
```

### 2.5 Règle de mise à jour de la confiance

À chaque session, la confiance d'un objet existant est mise à jour :

```
Si l'objet est reconfirmé par le médecin (mentionné positivement) :
  c_new = min(1.0, c_old + 0.10)

Si l'objet est contredit ("c'est faux") :
  c_new = 0.0 → statut = "faux_positif"

Si l'objet n'est pas mentionné après 3 sessions :
  c_new = max(0.0, c_old - 0.05) par session manquante
  (décroissance lente — l'absence n'est pas une contradiction)
```

---

## 3. Seuils des règles de détection (N8)

### 3.1 R02 — Ratio de centralité (dépendance unique)

**Seuil : `RATIO_CENTRALITE = 0.60`**

#### Justification

Un objet avec un ratio de centralité > 0.60 couvre plus de 60% des flux critiques du cabinet. En théorie de la résilience organisationnelle, un composant qui dépasse 50% des flux représente un risque de propagation en cascade. Le seuil de 0.60 (plutôt que 0.50) intègre une marge de tolérance pour éviter les faux positifs sur des petits cabinets où par construction un outil comme le LGC est central.

#### Formule de calcul

```
ratio_centralite(objet) =
  SUM(poids des relations entrantes où poids >= 4)
  ──────────────────────────────────────────────────
  SUM(poids de toutes les relations du graphe où poids >= 4)

Avec :
  - "poids >= 4" = relation critique ou très importante
  - Le dénominateur exclut les relations de poids < 4 pour ne pas
    diluer avec des relations secondaires

Signal déclenché si : ratio_centralite(objet) > RATIO_CENTRALITE
Sévérité : critique si ratio > 0.70 | moyen si 0.60 < ratio ≤ 0.70
```

#### Seuil de révision automatique

```
Si taux_faux_positifs_R02 > 0.30 sur 30+ cabinets :
  Proposer RATIO_CENTRALITE += 0.05
  (le seuil est trop bas, trop d'alertes sans suite)

Si taux_faux_négatifs_R02 > 0.20 (pannes non anticipées) :
  Proposer RATIO_CENTRALITE -= 0.05
```

---

### 3.2 R11 — Signal chronique (durée sans amélioration)

**Seuil : `DUREE_CHRONIQUE_JOURS = 90`**

#### Justification

90 jours (3 mois) correspond à la durée minimale pour distinguer un signal "en cours de traitement" d'un signal "normalisé dans les habitudes". En dessous de 90 jours, un médecin peut raisonnablement être en train de traiter le problème. Au-delà, l'absence d'amélioration détectable indique une résistance au changement ou un oubli — les deux méritent une relance.

La valeur 90 jours s'aligne aussi sur la fréquence typique des sessions Lugia pour un abonné actif (mensuel à trimestriel) : au bout de 3 mois, l'utilisateur a eu au moins 1 à 3 occasions d'agir.

#### Formule de calcul

```
signal_chronique = (
  signal.durée_jours > DUREE_CHRONIQUE_JOURS
  AND signal.vélocité IN ["se_dégrade", "stable"]
  AND signal.statut NOT IN ["résolu", "ignoré", "faux_positif"]
)

durée_jours est calculé comme :
  today - signal.date_détection

vélocité est calculée sur les 2 dernières sessions :
  delta = score_session_n - score_session_n-1
  vélocité = "s_améliore" si delta > DELTA_MIN_AMELIORATION
           = "se_dégrade" si delta < -DELTA_MIN_DEGRADATION
           = "stable" sinon
```

#### Seuil de révision automatique

```
Si médiane(délai_résolution_signaux) > DUREE_CHRONIQUE_JOURS × 1.5
sur 50+ cabinets :
  Les cabinets mettent plus longtemps que prévu à résoudre
  → Proposer DUREE_CHRONIQUE_JOURS += 30

Si taux_signaux_jamais_résolus > 0.40 :
  Trop de signaux chroniques → le seuil est peut-être mal calibré
  OU les recommandations sont insuffisantes
  → Investiguer avant d'ajuster le seuil
```

---

### 3.3 R13 — Isolement écosystème

**Seuils par catégorie d'acteur externe attendu**

| Catégorie | Seuil déclenchement | Sévérité |
|---|---|---|
| `patient` | 0 objet externe de type patient | critique |
| `assurance_maladie` | 0 relation `transmet_à` vers AM | critique |
| `professionnel_sante` | 0 relation vers un paramed. | moyen |
| `etablissement` | 0 relation vers un établissement | moyen |
| `reseau` | 0 objet de catégorie réseau | vigilance |

#### Justification

Les catégories `patient` et `assurance_maladie` sont **obligatoires** — un cabinet sans patient ni lien CPAM n'est pas un cabinet. Leur absence dans la grille signale une extraction incomplète plutôt qu'une réalité organisationnelle.

Les catégories `professionnel_sante` et `etablissement` sont **attendues** — il serait rare qu'un médecin généraliste n'ait aucun lien avec un laboratoire, un pharmacien ou un hôpital. L'absence génère un signal moyen qui invite à explorer.

La catégorie `reseau` est **recommandée mais optionnelle** — certains médecins exercent légitimement sans MSP ni CPTS. Le signal vigilance invite à explorer sans présumer d'un problème.

#### Formule de calcul

```
Pour chaque catégorie_attendue du secteur :
  objets_externes_catégorie = COUNT(
    Objet WHERE périmètre = "externe"
    AND contexte_externe.catégorie = catégorie
    AND organisation_id = cabinet.id
  )

  relations_vers_catégorie = COUNT(
    Relation WHERE périmètre IN ["sortant", "entrant"]
    AND objet_cible.contexte_externe.catégorie = catégorie
    AND organisation_id = cabinet.id
  )

  signal_isolement = (
    objets_externes_catégorie = 0
    AND relations_vers_catégorie = 0
  )
```

---

## 4. Seuils du cycle de vie (N4 CycleVie)

### 4.1 Stabilité — incréments et transitions

**Valeurs de lancement**

| Événement | Delta stabilité | Justification |
|---|---|---|
| Objet reconfirmé positivement | `+0.10` | Chaque confirmation renforce l'ancrage |
| Objet mentionné avec tension | `-0.15` | La tension déstabilise plus vite qu'on ne se stabilise |
| Objet non mentionné (session) | `-0.05` | Décroissance lente — l'oubli n'est pas une contradiction |
| Validation explicite utilisateur | `+0.25` | Signal fort d'ancrage conscient |
| Objet marqué faux_positif | `→ 0.0` | Reset immédiat |

**Asymétrie justifiée** : la déstabilisation (`-0.15`) est plus forte que la stabilisation (`+0.10`). En théorie du changement organisationnel, les habitudes se défont plus vite qu'elles ne s'installent — un outil testé une fois et critiqué perd plus de capital qu'il n'en avait gagné.

**Seuils de transition d'état**

```
emergent  → actif        : stabilité > SEUIL_ADOPTION
                           ET sessions_depuis_création >= 2
                           (confirmé sur au moins 2 sessions)

actif     → fragilisé    : stabilité < SEUIL_FRAGILITE
                           OU signal critique sur cet objet ouvert

fragilisé → actif        : stabilité > SEUIL_ADOPTION
                           ET signal résolu

actif     → en_transition: note_évolution renseignée
                           OU relation "remplace" détectée

en_transit→ obsolete     : stabilité < SEUIL_OBSOLESCENCE
                           ET tendance = "décroissant"
                           ET sessions_sans_mention >= 3
```

**Valeurs des seuils de transition**

| Seuil | Valeur | Justification |
|---|---|---|
| `SEUIL_ADOPTION` | **0.60** | 3 confirmations positives depuis stabilité 0.3 initiale |
| `SEUIL_FRAGILITE` | **0.35** | En dessous, l'objet est plus instable qu'ancré |
| `SEUIL_OBSOLESCENCE` | **0.20** | Objet quasi-absent des conversations récentes |

#### Formule de calcul de la stabilité initiale

Quand un objet est créé, sa stabilité initiale dépend de sa source :

```
source = "questionnaire"  → stabilité_initiale = 0.80
  (le médecin a coché explicitement — c'est un outil qu'il reconnaît)

source = "interview"      → stabilité_initiale = 0.40
  (mentionné en conversation — réel mais pas nécessairement ancré)

source = "déduit"         → stabilité_initiale = 0.20
  (inféré par l'IA — hypothèse, pas une déclaration directe)

source = "manuel"         → stabilité_initiale = 0.70
  (saisi par l'utilisateur — délibéré mais pas encore confirmé par usage)
```

### 4.2 Tendance — calcul automatique

```
tendance = calculée sur les 3 dernières sessions

Δ_stabilité_moyenne = mean(
  stabilité_session_n - stabilité_session_n-1,
  stabilité_session_n-1 - stabilité_session_n-2
)

tendance = "croissant"   si Δ_stabilité_moyenne > +DELTA_TENDANCE
         = "décroissant" si Δ_stabilité_moyenne < -DELTA_TENDANCE
         = "stable"      si |Δ_stabilité_moyenne| <= DELTA_TENDANCE
         = "incertain"   si sessions_disponibles < 2

DELTA_TENDANCE = 0.05  (variation minimale pour qualifier une tendance)
```

---

## 5. Seuils de complétude des thèmes (N3)

### 5.1 Définition

La complétude d'un thème mesure le pourcentage des facettes WSF "fondamentales" couvertes par au moins un objet.

**Facettes fondamentales (4 sur 9)** :
- ③ Actes — comment ça se fait
- ④ Acteurs — qui le fait
- ⑤ Données — quelles informations circulent
- ⑥ Outils — avec quoi

Ces 4 facettes couvrent le cœur opérationnel de tout thème. Les 5 autres (Patients, Soins, Contexte, Infrastructure, Stratégie) sont des enrichissements — leur absence ne signale pas un thème incomplet.

### 5.2 Formule de calcul

```
completude(thème) =
  COUNT(facettes_fondamentales avec au moins 1 objet)
  ────────────────────────────────────────────────────
  4

Exemple :
  Thème "Consultation" avec :
    ③ Actes   : 3 objets → couvert
    ④ Acteurs : 2 objets → couvert
    ⑤ Données : 0 objets → non couvert
    ⑥ Outils  : 1 objet  → couvert

  completude = 3/4 = 0.75
```

### 5.3 Seuils de signal

| Seuil | Valeur | Signal généré | Sévérité |
|---|---|---|---|
| `COMPLETUDE_VIDE` | **0.00** | thème_vide — aucune facette couverte | critique |
| `COMPLETUDE_FAIBLE` | **0.25** | thème_incomplet — 1 facette sur 4 | moyen |
| `COMPLETUDE_PARTIELLE` | **0.50** | thème_partiel — 2 facettes sur 4 | vigilance |
| `COMPLETUDE_CIBLE` | **0.75** | pas de signal — thème suffisant | — |
| `COMPLETUDE_COMPLETE` | **1.00** | indicateur positif — thème complet | — |

**Justification du seuil cible à 0.75** : exiger 4/4 facettes serait trop strict — certaines combinaisons thème × facette sont légitimement vides (ex: un thème "Stratégie & Succession" n'a pas nécessairement d'outil dédié). Le seuil 0.75 (3 facettes sur 4) est un bon équilibre entre rigueur et pragmatisme.

### 5.4 Score de complétude d'un axe

```
completude(axe) =
  MEAN(completude(thème) pour tout thème de l'axe)

Score radar (0-100%) =
  completude(axe) × 100
```

---

## 6. Seuils de vélocité des signaux (N6)

### 6.1 Définition du delta

Le delta d'un signal mesure l'évolution du score de l'axe concerné entre deux sessions consécutives :

```
delta_session = score_axe_session_n - score_axe_session_n-1

score_axe = complétude(axe) × 100
  (nombre entre 0 et 100)
```

### 6.2 Seuils de vélocité

**Seuils de lancement**

| Seuil | Valeur | Justification |
|---|---|---|
| `DELTA_MIN_AMELIORATION` | **+5** | Variation minimale pour qualifier une amélioration réelle vs bruit de mesure |
| `DELTA_MIN_DEGRADATION` | **-5** | Symétrique — variation minimale pour qualifier une dégradation |

**Justification de ±5** : un score d'axe sur 100 peut varier de 1 à 3 points simplement parce que la conversation a abordé un thème différemment. La valeur 5 correspond à l'ajout ou la suppression d'environ un objet dans la grille — un changement réel et intentionnel.

### 6.3 Formule de calcul

```
vélocité(signal) =
  delta_moyen = mean(
    delta_session_n,
    delta_session_n-1   // moyenne sur 2 sessions pour lisser
  )

  SI delta_moyen > DELTA_MIN_AMELIORATION  → "s_améliore"
  SI delta_moyen < -DELTA_MIN_DEGRADATION  → "se_dégrade"
  SI sessions_disponibles < 2              → "inconnu"
  SINON                                    → "stable"
```

### 6.4 Interaction avec R11 (signal chronique)

Un signal peut être `stable` et déclencher R11 simultanément :

```
signal ouvert depuis 120 jours
vélocité = "stable" (pas de dégradation mais pas d'amélioration non plus)
→ R11 déclenché → signal_chronique = true

La stabilité ici n'est pas un signe de santé — c'est de l'inertie.
Le signal chronique est plus grave qu'un signal en dégradation récente
parce qu'il signale une normalisation du problème dans les habitudes.
```

---

## 7. Protocole d'ajustement automatique

### 7.1 Architecture

Le système de calibration automatique fonctionne en 3 couches :

```
Couche 1 — Collecte de métriques (automatique, continu)
  → Le système enregistre pour chaque signal :
     - A-t-il été acquitté ? (proxy : signal pertinent)
     - A-t-il été marqué faux_positif ? (proxy : signal non pertinent)
     - A-t-il été résolu ? Et en combien de temps ?
     - L'utilisateur a-t-il agi suite à ce signal ? (proxy : utilité)

Couche 2 — Détection d'anomalie de seuil (automatique, mensuel)
  → Sur N cabinets ayant le même signal, le système calcule :
     - Taux de faux positifs (FP) = signaux marqués faux_positif / total
     - Taux d'abandon (TA) = signaux jamais acquittés ni résolus / total
     - Délai médian de résolution
  → Si FP ou TA dépassent les seuils d'alerte → proposition d'ajustement

Couche 3 — Validation admin (manuelle, à la demande)
  → L'admin reçoit la proposition avec :
     - Le seuil actuel
     - Le seuil proposé
     - Les métriques qui justifient la proposition
     - L'impact estimé (combien de signaux seraient affectés)
  → L'admin valide, rejette, ou ajuste manuellement
```

### 7.2 Métriques de surveillance par famille de seuil

**Famille A — Confiance extraction**

```
Métrique surveillée : taux_faux_positifs_objets
  = COUNT(objets marqués faux_positif) / COUNT(objets créés)
  Calculé par tranche de confiance : [0.30-0.50], [0.50-0.75], [0.75-1.0]

Seuil d'alerte : taux_faux_positifs > 0.25 sur une tranche
Action proposée :
  Si FP élevé sur [0.30-0.50] → CONF_AMBIGU += 0.05 (remonter le seuil)
  Si FP élevé sur [0.50-0.75] → CONF_VALIDATION += 0.05
  Si FP élevé sur [0.75-1.0]  → investiguer l'extracteur (anomalie grave)

Minimum cabinets pour déclencher : 50
```

**Famille B — Règles de détection**

```
Métrique surveillée par règle :
  taux_faux_positifs_Rxx = COUNT(signaux_Rxx marqués faux_positif) /
                           COUNT(signaux_Rxx créés)
  taux_ignorés_Rxx       = COUNT(signaux_Rxx ignorés avec justif.) /
                           COUNT(signaux_Rxx créés)
  taux_résolus_Rxx        = COUNT(signaux_Rxx résolus) /
                           COUNT(signaux_Rxx créés)

Seuils d'alerte :
  taux_faux_positifs > 0.30 → seuil trop bas, trop d'alertes
  taux_ignorés > 0.40       → alertes perçues comme non pertinentes
  taux_résolus < 0.10       → alertes sans action possible (seuil ou recommandation ?)

Actions proposées :
  R02 FP élevé → RATIO_CENTRALITE += 0.05
  R11 FP élevé → DUREE_CHRONIQUE_JOURS += 15

Minimum cabinets : 30 pour R01-R10, 20 pour R11-R13
```

**Famille C — Cycle de vie**

```
Métrique surveillée :
  taux_revert_emergent_actif = COUNT(objets qui passent actif → emergent) /
                               COUNT(objets qui passent emergent → actif)
  (un taux élevé indique que le seuil SEUIL_ADOPTION est trop bas —
   des objets sont promus trop tôt et retombent)

  délai_médian_adoption = médiane(
    date_transition_actif - date_création
    pour tous les objets ayant atteint statut=actif
  )

Seuil d'alerte :
  taux_revert > 0.20       → SEUIL_ADOPTION += 0.05
  délai_médian > 180 jours → SEUIL_ADOPTION -= 0.05
                              (le seuil est trop haut, les objets n'atteignent jamais actif)

Minimum cabinets : 100 (nécessite plus de données temporelles)
```

**Famille D — Complétude**

```
Métrique surveillée :
  distribution_completude = histogramme des scores de complétude
                            sur l'ensemble des thèmes de tous les cabinets

  Si la distribution est bimodale (beaucoup de 0 et beaucoup de 1,
  peu de valeurs intermédiaires) → les seuils sont bien calibrés

  Si la distribution est plate (valeurs uniformes) → les seuils
  ne discriminent pas assez → réviser les facettes fondamentales

Pas de seuil d'alerte automatique — révision manuelle trimestrielle
Minimum cabinets : 200
```

### 7.3 Format de la proposition d'ajustement

Quand le système détecte une anomalie, il génère une proposition formelle soumise à l'admin :

```json
{
  "id": "prop-2026-09-001",
  "date": "2026-09-01",
  "statut": "en_attente_validation",

  "seuil_concerné": "RATIO_CENTRALITE",
  "famille": "B",
  "règle_concernée": "R02",

  "valeur_actuelle": 0.60,
  "valeur_proposée": 0.65,
  "direction": "hausse",

  "justification": {
    "métrique": "taux_faux_positifs_R02",
    "valeur_observée": 0.34,
    "seuil_alerte": 0.30,
    "période_observation": "2026-06-01 → 2026-09-01",
    "nb_cabinets": 47,
    "nb_signaux_analysés": 112,
    "nb_faux_positifs": 38
  },

  "impact_estimé": {
    "signaux_supprimés": 12,
    "signaux_conservés": 74,
    "pourcentage_rédution": "14%"
  },

  "décision_admin": null,
  "commentaire_admin": null,
  "date_décision": null
}
```

### 7.4 Règles de validation admin

```
L'admin PEUT valider si :
  - nb_cabinets >= minimum requis pour la famille
  - La direction de l'ajustement est cohérente avec la métrique
  - L'impact estimé est < 30% des signaux existants
    (un ajustement trop brutal doit être traité différemment)

L'admin DOIT investiguer avant de valider si :
  - L'ajustement est > 2 crans consécutifs dans la même direction
    (ex: RATIO_CENTRALITE déjà passé de 0.60 → 0.65, nouvelle prop. → 0.70)
  - taux_résolus < 0.10 ET FP élevé simultanément
    (peut indiquer un problème de recommandation, pas de seuil)

L'admin NE PEUT PAS :
  - Valider un ajustement qui amènerait un seuil hors de ses bornes définies
  - Valider sans avoir lu la justification
```

### 7.5 Bornes absolues des seuils

Pour éviter des dérives, chaque seuil a des bornes qu'aucun ajustement automatique ne peut franchir :

| Seuil | Borne basse | Borne haute | Justification |
|---|---|---|---|
| `CONF_MIN_CREATE` | 0.15 | 0.45 | En dessous : hallucinations. Au-dessus : grille trop vide |
| `CONF_VALIDATION` | 0.55 | 0.90 | Bornes de bon sens |
| `RATIO_CENTRALITE` | 0.40 | 0.80 | < 0.40 : tout est une dépendance. > 0.80 : rien ne l'est |
| `DUREE_CHRONIQUE_JOURS` | 30 | 180 | < 30j : trop impatient. > 180j : trop permissif |
| `SEUIL_ADOPTION` | 0.40 | 0.80 | Bornes de bon sens sur la stabilité |
| `DELTA_MIN_AMELIORATION` | 2 | 15 | < 2 : bruit. > 15 : changement trop exigeant |
| `COMPLETUDE_CIBLE` | 0.50 | 1.00 | Le cœur de métier doit être couvert |

---

## 8. Table de synthèse

| Seuil | Famille | Valeur initiale | Bornes | Min. cabinets | Règle associée |
|---|---|---|---|---|---|
| `CONF_MIN_CREATE` | A | 0.30 | [0.15, 0.45] | 50 | — |
| `CONF_AMBIGU` | A | 0.50 | [0.35, 0.65] | 50 | — |
| `CONF_VALIDATION` | A | 0.75 | [0.55, 0.90] | 50 | — |
| `RATIO_CENTRALITE` | B | 0.60 | [0.40, 0.80] | 30 | R02 |
| `DUREE_CHRONIQUE_JOURS` | B | 90 | [30, 180] | 30 | R11 |
| `SEUIL_ADOPTION` | C | 0.60 | [0.40, 0.80] | 100 | CycleVie |
| `SEUIL_FRAGILITE` | C | 0.35 | [0.20, 0.50] | 100 | CycleVie |
| `SEUIL_OBSOLESCENCE` | C | 0.20 | [0.10, 0.35] | 100 | CycleVie |
| `DELTA_TENDANCE` | C | 0.05 | [0.02, 0.10] | 100 | CycleVie |
| `COMPLETUDE_VIDE` | D | 0.00 | fixe | — | N3 |
| `COMPLETUDE_FAIBLE` | D | 0.25 | [0.10, 0.40] | 200 | N3 |
| `COMPLETUDE_CIBLE` | D | 0.75 | [0.50, 1.00] | 200 | N3 |
| `DELTA_MIN_AMELIORATION` | C | 5 | [2, 15] | 50 | N6 vélocité |
| `DELTA_MIN_DEGRADATION` | C | 5 | [2, 15] | 50 | N6 vélocité |

---

## Annexe — Valeurs initiales des poids extracteur

Ces poids pilotent la formule de calcul de la confiance (section 2.4). Ils sont des hyperparamètres de l'extracteur IA, révisables indépendamment des seuils.

| Poids | Valeur initiale | Rôle |
|---|---|---|
| `w1` (score_entité) | 0.40 | Clarté de l'entité dans la phrase |
| `w2` (score_contexte) | 0.25 | Richesse du contexte autour |
| `w3` (score_cohérence) | 0.20 | Cohérence avec le graphe existant |
| `w4` (score_source) | 0.15 | Nature de la source (questionnaire vs inférence) |

**Justification des poids** : `w1` est le plus élevé parce que la clarté de l'entité est la condition minimale. `w4` est le plus faible parce que la source seule ne garantit pas la qualité — un questionnaire peut générer un faux positif si la question était mal formulée.

**Révision des poids** : manuelle uniquement, après analyse qualitative des erreurs de l'extracteur. Pas de révision automatique sur les poids — trop de risque de dérive systémique.

---

*Fin du document — Version 0.1*  
*À lire en complément de `lugia_schema_spec.md` v0.4*
