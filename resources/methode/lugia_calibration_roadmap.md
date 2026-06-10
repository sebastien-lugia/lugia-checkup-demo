# Lugia — Calibration des Seuils — Roadmap Post-Données
**Version** 0.1  
**Projet** Lugia Checkup  
**Date** Juin 2026  
**Complément de** `lugia_calibration_v1.md`  
**Prérequis** Données réelles de cabinets (seuils minimaux indiqués)

---

## Présentation

Ce document spécifie les seuils qui **ne peuvent pas être calibrés sans données réelles**. Chaque section indique le nombre minimal de cabinets requis, les métriques à collecter, et le protocole d'ajustement hybride (système propose, admin valide).

Ces seuils sont des **promesses documentées** — ils seront implémentés progressivement à mesure que la base de cabinets grandit.

---

## Sommaire

1. [Seuils du cycle de vie des objets](#1-seuils-du-cycle-de-vie-des-objets)
2. [Seuils de vélocité des signaux](#2-seuils-de-vélocité-des-signaux)
3. [Seuils de complétude des thèmes](#3-seuils-de-complétude-des-thèmes)
4. [Ajustement automatique des règles de détection](#4-ajustement-automatique-des-règles-de-détection)
5. [Poids sectoriels autres métiers](#5-poids-sectoriels-autres-métiers)
6. [Protocole d'ajustement hybride](#6-protocole-dajustement-hybride)
7. [Roadmap par palier de cabinets](#7-roadmap-par-palier-de-cabinets)

---

## 1. Seuils du cycle de vie des objets

**Prérequis : 100+ cabinets avec 3+ sessions chacun**

### Pourquoi on ne peut pas calibrer maintenant

Les seuils du cycle de vie (`SEUIL_ADOPTION`, `SEUIL_FRAGILITE`, `SEUIL_OBSOLESCENCE`) mesurent des transitions d'état sur des objets observés dans le temps. Sans plusieurs sessions par cabinet, on ne peut pas observer ces transitions ni valider que les seuils les capturent correctement.

Exemple : le seuil `SEUIL_ADOPTION = 0.60` dit qu'un objet devient "actif" quand sa stabilité dépasse 0.60. Mais si en réalité les médecins confirment un outil en moyenne après 4 sessions (stabilité attendue ~0.70 après 4 confirmations), le seuil est trop bas — les objets passeraient à "actif" trop tôt.

### Métriques à collecter

```
Pour chaque objet ayant atteint statut = "actif" :
  nb_sessions_avant_adoption         // combien de sessions pour passer emergent → actif
  stabilité_au_moment_adoption       // quelle stabilité effective à la transition
  taux_revert_actif_vers_emergent    // objet revenu en emergent après adoption

Pour chaque objet resté en statut = "emergent" > 6 mois :
  stabilité_actuelle                 // est-elle bloquée sous SEUIL_ADOPTION ?
  nb_mentions_positives              // l'objet est bien là mais le seuil l'empêche de monter ?
```

### Seuils provisoires V1 (gel)

| Seuil | Valeur gelée V1 | Cible de révision |
|---|---|---|
| `SEUIL_ADOPTION` | 0.60 | Après 100 cabinets × 3 sessions |
| `SEUIL_FRAGILITE` | 0.35 | Après 100 cabinets × 3 sessions |
| `SEUIL_OBSOLESCENCE` | 0.20 | Après 100 cabinets × 3 sessions |
| `DELTA_TENDANCE` | 0.05 | Après 100 cabinets × 3 sessions |

### Formule de révision

```
SEUIL_ADOPTION_révisé =
  percentile_25(stabilité_au_moment_adoption)
  sur l'ensemble des cabinets observés

Justification : on veut que 75% des transitions "émergent → actif"
se produisent à une stabilité supérieure au seuil.
Si percentile_25 > SEUIL_ADOPTION_actuel + 0.05 → proposer hausse
Si percentile_25 < SEUIL_ADOPTION_actuel - 0.05 → proposer baisse
```

---

## 2. Seuils de vélocité des signaux

**Prérequis : 50+ cabinets avec 2+ sessions chacun**

### Pourquoi on ne peut pas calibrer maintenant

Les seuils de vélocité (`DELTA_MIN_AMELIORATION`, `DELTA_MIN_DEGRADATION`) mesurent des variations de score entre sessions. Sans données multi-sessions, on ne connaît pas la **variance naturelle** des scores — c'est-à-dire combien un score peut varier entre deux sessions simplement parce que la conversation a abordé des sujets différents, sans que l'organisation ait réellement changé.

Si la variance naturelle est de ±8 points, fixer `DELTA_MIN_AMELIORATION = 5` générerait beaucoup de faux signaux d'amélioration.

### Métriques à collecter

```
Pour chaque paire de sessions consécutives (session_n, session_n-1) :
  delta_score_par_axe[A, B, C, …]   // variation de score pour chaque axe
  actions_réalisées_entre_sessions   // y avait-il des actions en cours ?

Calcul de la variance naturelle :
  variance_naturelle(axe) =
    std(delta_score[axe]) sur les paires où aucune action n'était en cours
    // variation "à organisation constante"

Calcul du signal de changement réel :
  delta_réel_min =
    percentile_90(|delta_score[axe]|) sur les paires avec action réalisée
    - variance_naturelle(axe)
    // variation attribuable à une action réelle
```

### Seuils provisoires V1 (gel)

| Seuil | Valeur gelée V1 | Révision |
|---|---|---|
| `DELTA_MIN_AMELIORATION` | 5 | Après 50 cabinets × 2 sessions |
| `DELTA_MIN_DEGRADATION` | 5 | Après 50 cabinets × 2 sessions |

### Formule de révision

```
DELTA_MIN_AMELIORATION_révisé =
  variance_naturelle_médiane + 1.5 × écart_type_variance_naturelle

Justification : on veut que le seuil soit au-dessus du "bruit" naturel
avec une marge de 1.5 σ — suffisant pour distinguer signal/bruit
sans être trop exigeant.
```

---

## 3. Seuils de complétude des thèmes

**Prérequis : 200+ cabinets**

### Pourquoi on ne peut pas calibrer maintenant

Les seuils de complétude (`COMPLETUDE_FAIBLE`, `COMPLETUDE_CIBLE`) définissent ce qu'est un thème "bien couvert". Sans données, on ne sait pas quelle complétude est réaliste dans un cabinet réel — un médecin généraliste seul ne peut peut-être pas dépasser 0.50 de complétude sur l'axe Finance sans expert-comptable, et ce serait normal.

Imposer un seuil cible de 0.75 sur des axes structurellement limités génèrerait des signaux permanents et non actionnables.

### Métriques à collecter

```
Pour chaque axe × thème :
  distribution_completude             // histogramme des scores sur tous les cabinets
  completude_médiane_par_profil       // solo / MSP / groupe
  completude_médiane_par_territoire   // urbain / rural / sous-dense
  taux_thèmes_jamais_complétés        // thèmes qui restent systématiquement bas
```

### Seuils provisoires V1 (gel)

| Seuil | Valeur gelée V1 | Révision |
|---|---|---|
| `COMPLETUDE_FAIBLE` | 0.25 | Après 200 cabinets |
| `COMPLETUDE_PARTIELLE` | 0.50 | Après 200 cabinets |
| `COMPLETUDE_CIBLE` | 0.75 | Après 200 cabinets |

### Formule de révision

```
Pour chaque axe A :
  completude_réaliste(A) =
    percentile_75(completude(A)) sur les cabinets du même profil

  Si completude_réaliste(A) < COMPLETUDE_CIBLE - 0.10 :
    → Le seuil cible est trop ambitieux pour cet axe et ce profil
    → Proposer COMPLETUDE_CIBLE(A, profil) = completude_réaliste(A) - 0.05

Justification : les seuils de complétude doivent être segmentés
par profil cabinet (solo vs groupe vs MSP) car les structures
ont des capacités organisationnelles différentes.
Un seuil universel unique est une simplification du V1.
```

### Segmentation future des seuils de complétude

Un axe qui vaut 0.75 pour un cabinet de groupe peut valoir 0.50 pour un solo — et les deux peuvent être "normaux". À terme :

```
COMPLETUDE_CIBLE = f(axe, profil, territoire)

Profils :
  solo          → seuils plus bas sur Équipe & RH, Finance
  msp           → seuils plus élevés sur Processus & Admin, Coordination
  groupe_libéral → seuils intermédiaires

Territoires :
  sous_dense    → seuil Stratégie plus élevé (enjeux de succession plus critiques)
  urbain        → seuil Parcours patient plus élevé (concurrence, e-réputation)
```

---

## 4. Ajustement automatique des règles de détection

**Prérequis : 30+ cabinets (famille B), 100+ cabinets (famille C-D)**

### Métriques de surveillance

Pour chaque règle Rxx :

```
taux_fp_Rxx =
  COUNT(signaux_Rxx marqués "faux_positif") /
  COUNT(signaux_Rxx créés)

taux_abandon_Rxx =
  COUNT(signaux_Rxx jamais acquittés ni résolus après 60 jours) /
  COUNT(signaux_Rxx créés)

taux_résolution_Rxx =
  COUNT(signaux_Rxx avec statut "résolu") /
  COUNT(signaux_Rxx créés)

délai_médian_résolution_Rxx =
  médiane(date_résolution - date_détection)
  pour signaux_Rxx résolus
```

### Seuils d'alerte pour proposition d'ajustement

```
Proposition de HAUSSE du seuil (trop d'alertes) si :
  taux_fp > 0.30
  OU taux_abandon > 0.40
  ET nb_signaux_analysés >= minimum_règle

Proposition de BAISSE du seuil (pas assez d'alertes) si :
  taux_résolution < 0.10
  ET taux_fp < 0.10
  ET retours_qualitatifs signalent des risques non détectés

Pas de proposition si :
  nb_signaux_analysés < minimum_règle
  OU ajustement déjà en attente de validation admin
```

### Minimums par règle

| Règle | Minimum signaux | Minimum cabinets |
|---|---|---|
| R01 à R10 | 50 | 30 |
| R11 (chronique) | 30 | 20 (nécessite multi-sessions) |
| R12 (flux sortant) | 40 | 25 |
| R13 (isolement) | 30 | 20 |

### Amplitude maximale d'ajustement par itération

```
Pour les seuils numériques (RATIO_CENTRALITE, DUREE_CHRONIQUE_JOURS) :
  delta_max_par_iteration = 0.05 (pour les ratios)
                          = 15   (pour les durées en jours)

Pas plus de 3 ajustements consécutifs dans la même direction
sans validation manuelle approfondie.
```

---

## 5. Poids sectoriels autres métiers

**Prérequis : 50+ cabinets par nouveau secteur**

### Secteurs prévus après médecine générale

```
Ordre de priorité pressenti :
  1. Cabinet infirmier libéral
  2. Cabinet kinésithérapie
  3. Pharmacie d'officine
  4. Cabinet dentaire
  5. Médecine spécialisée
  6. Cabinet d'avocats (premier secteur non-santé)
```

### Protocole d'extension sectorielle

Pour chaque nouveau secteur :

```
Étape 1 — Analyse qualitative (5-10 entretiens exploratoires)
  → Identifier les entités les plus fréquentes (équivalent du dictionnaire médical)
  → Identifier les ellipses et raccourcis du langage métier
  → Identifier les facettes WSF naturellement dominantes

Étape 2 — Configuration initiale
  → Créer le dictionnaire de noms propres sectoriels
  → Définir les poids w1-w4 sectoriels par analogie avec la médecine
    (si langage standardisé → élever w1, si langage elliptique → baisser w2)
  → Définir les catégories_attendues pour R13

Étape 3 — Calibration empirique (après 50 cabinets)
  → Même protocole que médecine générale
  → Objectif : poids sectoriels propres validés

Étape 4 — Validation croisée
  → Vérifier que les seuils sectoriels ne dégradent pas
    les performances sur les autres secteurs déjà calibrés
```

---

## 6. Protocole d'ajustement hybride

### Architecture

```
Couche 1 — Collecte automatique continue
  Le système enregistre pour chaque signal :
  statut final, délai résolution, action admin

Couche 2 — Détection d'anomalie (mensuelle automatique)
  Calcul des métriques de surveillance
  Si seuil d'alerte franchi → génération proposition

Couche 3 — Validation admin (manuelle à la demande)
  L'admin reçoit la proposition avec justification
  Valide, rejette, ou ajuste manuellement
  Décision tracée avec horodatage et commentaire
```

### Format de proposition d'ajustement

```json
{
  "id": "prop-YYYY-MM-NNN",
  "date_génération": "YYYY-MM-DD",
  "statut": "en_attente_validation",

  "seuil": "RATIO_CENTRALITE",
  "famille": "B",
  "règle": "R02",

  "valeur_actuelle": 0.60,
  "valeur_proposée": 0.65,
  "direction": "hausse",
  "amplitude": 0.05,

  "justification": {
    "métrique_déclenchante": "taux_fp_R02",
    "valeur_observée": 0.34,
    "seuil_alerte": 0.30,
    "période": "YYYY-MM-DD → YYYY-MM-DD",
    "nb_cabinets": 47,
    "nb_signaux_analysés": 112,
    "nb_faux_positifs": 38
  },

  "impact_estimé": {
    "nb_signaux_supprimés": 12,
    "nb_signaux_conservés": 74,
    "réduction_pourcentage": "14%",
    "cabinets_impactés": 8
  },

  "bornes": { "min": 0.40, "max": 0.80 },
  "dans_les_bornes": true,

  "décision_admin": null,
  "commentaire_admin": null,
  "date_décision": null
}
```

### Règles de validation admin

```
L'admin PEUT valider si :
  dans_les_bornes = true
  ET nb_cabinets >= minimum_règle
  ET nb_ajustements_consécutifs_même_direction < 3
  ET impact_estimé.réduction_pourcentage < 30%

L'admin DOIT investiguer avant de valider si :
  nb_ajustements_consécutifs_même_direction >= 3
  OU taux_résolution < 0.10 ET taux_fp > 0.30 simultanément
     (signal que le problème est la recommandation, pas le seuil)
  OU impact > 30% des signaux existants

L'admin NE PEUT PAS valider si :
  dans_les_bornes = false
  OU nb_cabinets < minimum_règle
  OU seuil déjà ajusté dans les 7 derniers jours
```

### Traçabilité

Toute modification de seuil (manuelle ou validée) est tracée :

```json
{
  "seuil": "RATIO_CENTRALITE",
  "valeur_avant": 0.60,
  "valeur_après": 0.65,
  "date": "YYYY-MM-DD",
  "type": "automatique_validé",
  "proposition_id": "prop-YYYY-MM-NNN",
  "admin": "sebastien@lugia.fr",
  "commentaire": "Trop de FP sur cabinets solos — LGC structurellement central",
  "nb_cabinets_au_moment": 47
}
```

---

## 7. Roadmap par palier de cabinets

```
Palier 1 : 10 cabinets
  → Fin Phase α cold start
  → Première analyse qualitative manuelle
  → Ajustements manuels possibles sur DEDUP_AUTO, DEDUP_PROP
  → Validation du dictionnaire de noms propres médicaux

Palier 2 : 30 cabinets
  → Activation ajustements automatiques règles B (R01-R10, R12-R13)
  → Fin Phase β cold start
  → Première révision manuelle des poids extracteur si FP > 25%

Palier 3 : 50 cabinets × 2 sessions
  → Activation calibration vélocité des signaux
  → Révision DELTA_MIN_AMELIORATION et DELTA_MIN_DEGRADATION

Palier 4 : 100 cabinets × 3 sessions
  → Activation calibration cycle de vie des objets
  → Révision SEUIL_ADOPTION, SEUIL_FRAGILITE, SEUIL_OBSOLESCENCE

Palier 5 : 200 cabinets
  → Activation calibration complétude des thèmes
  → Segmentation des seuils par profil cabinet (solo/MSP/groupe)
  → Révision COMPLETUDE_CIBLE par axe et profil

Palier 6 : 50 cabinets par nouveau secteur
  → Extension sectorielle (cabinet infirmier, kiné, pharmacie…)
  → Poids extracteur sectoriels propres
  → Dictionnaires de noms propres sectoriels
```

---

## Annexe — Questions ouvertes à arbitrer avant implémentation

Ces questions ne peuvent pas être résolues sans données — elles sont documentées ici pour ne pas être oubliées.

**Q-CAL-01** — Faut-il des seuils de complétude différents par profil cabinet dès le V1, ou attendre les données pour segmenter ?
*Risque si on attend : les solos se retrouvent avec des alertes permanentes sur des axes structurellement limités.*

**Q-CAL-02** — Comment gérer les cabinets qui ne font qu'une seule session (one-shot) dans les calculs de vélocité et cycle de vie ?
*Ces cabinets ne peuvent pas alimenter les métriques temporelles mais représenteront probablement la majorité des utilisateurs gratuits.*

**Q-CAL-03** — Les poids de l'extracteur doivent-ils être appris automatiquement (fine-tuning sur les faux positifs) ou ajustés manuellement uniquement ?
*L'apprentissage automatique est plus puissant mais risque de dériver vers des biais non détectés.*

**Q-CAL-04** — Comment calibrer les seuils de conversion (DELTA_OBJETS_MIN, AXES_VIDES_SEUIL) sans données de taux de conversion ?
*Ces seuils impactent directement le revenu — ils méritent un A/B test dès que possible.*

**Q-CAL-05** — À quel moment la calibration automatique peut-elle fonctionner sans admin humain dans la boucle ?
*Probablement jamais pour les seuils à fort impact (règles critiques, UX). Peut-être pour les seuils à faible impact (déduplication, confiance objet).*

---

*Fin du document — Version 0.1*  
*À relire à chaque palier de cabinets atteint*  
*Voir `lugia_calibration_v1.md` pour les seuils actionnables maintenant*
