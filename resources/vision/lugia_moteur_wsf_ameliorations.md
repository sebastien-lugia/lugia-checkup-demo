# Moteur WSF — Améliorations possibles
> Document d'évolution · Lugia & Co · Mai 2026

---

## Préambule

Le moteur WSF actuel est une fondation solide : graphe typé par les 9 composantes d'Alter, liaisons causales, propagation d'impact, calcul de santé, séparation générique/sectoriel. Ce document recense les améliorations qui le feraient passer d'un **outil de diagnostic** à un véritable **moteur de décision et de transformation**.

Les améliorations sont organisées en 10 axes, chacun avec sa valeur, son effort, et son horizon de mise en œuvre.

---

## Axe 1 — La couche économique (coût et valeur)

> **Priorité absolue. C'est ce qui transforme le diagnostic en décision d'achat.**

### Le problème actuel
Le moteur simule l'impact en pourcentages abstraits. Un médecin veut des euros et des heures, pas des "+40%".

### Ce qu'on ajoute

**Sur chaque objet :**
```
Objet {
  ...
  cout_temps      : heures/semaine consommées
  cout_argent     : € /mois
  charge_mentale  : échelle 1-5
}
```

**Sur chaque PRODUIT :**
```
Produit {
  ...
  valeur_revenu       : € générés
  valeur_satisfaction : impact sur fidélité client
}
```

**Sur chaque chantier :**
```
Chantier {
  ...
  cout_mise_en_oeuvre : temps + € pour le réaliser
  retour_attendu      : gain en temps + € + réduction risque
  payback_period      : délai de rentabilisation
}
```

### Ce que ça change
La simulation ne dit plus *"+40% sur les outputs"* mais :
> *"Économise 6h/semaine, soit 9 000€/an, pour un chantier de 30 minutes. Rentabilisé dès la première semaine."*

### Valeur ★★★★★ · Effort moyen · Horizon : immédiat

---

## Axe 2 — La mémoire et l'apprentissage

> **L'amélioration la plus stratégique. C'est votre moat défendable à long terme.**

### Le problème actuel
Chaque cabinet est diagnostiqué dans le vide. Le moteur ne capitalise pas sur les milliers de graphes qu'il va accumuler.

### Ce qu'on ajoute

**Benchmarking entre systèmes similaires :**
- Comparer un cabinet à des cabinets comparables (taille, spécialité, région)
- *"Votre processus de rédaction est plus lent que 75% des cabinets similaires"*

**Calibration empirique des forces :**
- Les forces causales ne sont plus estimées mais **mesurées** sur les données réelles
- Chaque chantier réalisé ajuste la calibration du moteur

**Validation prédictive :**
- Comparer l'impact prédit à l'impact réel constaté
- Affiner le modèle en continu

### Ce que ça change
Plus vous avez de clients, plus vos prédictions sont précises. C'est un **effet de réseau** — un concurrent qui démarre n'a aucune donnée de calibration. Il ne peut pas vous rattraper.

### Valeur ★★★★★ · Effort élevé · Horizon : phase 2

---

## Axe 3 — Le temps et la dynamique

> **Révèle les vrais goulots, invisibles en statique.**

### Le problème actuel
Le modèle photographie le système à un instant T. Un système de travail vit dans le temps, sous charge variable.

### Ce qu'on ajoute

**Sur les flux :**
```
Flux {
  ...
  debit   : unités/période (ex: 25 patients/jour)
  volume  : stock accumulé
}
```

**Sur les processus :**
```
Processus {
  ...
  duree      : temps unitaire d'exécution
  capacite   : nombre d'exécutions parallèles possibles
  saturation : % de capacité utilisée
}
```

**Simulation sous charge :**
- Faire varier le débit d'entrée
- Détecter à quel niveau de charge un processus passe de FONCTIONNEL à DÉGRADÉ puis BLOQUÉ

### Ce que ça change
Le moteur détecte qu'un processus *"tient à 20 patients/jour mais s'effondre à 35"*. C'est un insight prédictif à forte valeur.

### Valeur ★★★★ · Effort moyen · Horizon : phase 1

---

## Axe 4 — L'incertitude et la probabilité

> **Crédibilise les prédictions, les rend honnêtes et défendables.**

### Le problème actuel
Le modèle est déterministe : une force de 0.7 produit toujours exactement le même impact. Le réel est probabiliste.

### Ce qu'on ajoute

**Forces avec fourchette :**
```
Liaison {
  ...
  force_min : 0.5
  force_max : 0.9
  force_mode: 0.7   // valeur la plus probable
}
```

**Probabilités de transition d'état :**
- Un objet À_RISQUE a X% de chance de devenir BLOQUÉ dans un délai donné
- Permet d'anticiper les dégradations futures

**Simulation Monte-Carlo :**
- Faire tourner la propagation 1000 fois avec des forces variables
- Présenter un intervalle de confiance

### Ce que ça change
La prédiction passe de *"améliore les outputs de 40%"* à *"améliore les outputs de 30 à 50%, avec 80% de confiance"*. Plus honnête, plus crédible auprès d'un public exigeant (médecins, investisseurs).

### Valeur ★★★ · Effort moyen · Horizon : phase 2

---

## Axe 5 — La résistance des acteurs

> **Explique les échecs réels de transformation que personne ne modélise.**

### Le problème actuel
Les participants sont traités comme des rouages passifs. Dans le WSF d'Alter, ils ont des objectifs, des résistances, des préférences.

### Ce qu'on ajoute

**Sur les objets PARTICIPANT :**
```
Participant {
  ...
  adhesion       : échelle 0-1 (résistance ↔ enthousiasme)
  competence     : niveau de maîtrise des outils
  charge_actuelle: % de capacité déjà utilisée
}
```

**Modulation des liaisons :**
- La force réelle d'une liaison UTILISE est modulée par l'adhésion du participant
- Un excellent outil mal adopté a un impact réel faible

**Détection des conflits d'intérêts :**
- Les objectifs des acteurs peuvent diverger
- Ex : le médecin veut gagner du temps, la secrétaire craint pour son rôle

### Ce que ça change
Le moteur explique pourquoi certains chantiers échouent : pas un problème technique, un problème d'adoption. C'est souvent la vraie cause — et personne ne la modélise.

### Valeur ★★★★ · Effort faible · Horizon : phase 1

---

## Axe 6 — Les boucles et effets systémiques

> **Capture la vraie dynamique d'un système — cercles vertueux et vicieux.**

### Le problème actuel
La règle anti-cycle (R4) coupe les boucles pour éviter les calculs infinis. Mais les boucles sont souvent là où se cache la dynamique réelle.

### Ce qu'on ajoute

**Boucles de rétroaction explicites :**
- **Cercle vertueux** : IA libère du temps → plus de patients vus → plus de revenus → réinvestissement dans l'outil
- **Cercle vicieux** : surcharge → erreurs → reprises → plus de surcharge

**Calcul de convergence/divergence :**
- Itérer la propagation sur plusieurs cycles
- Détecter si la boucle converge (stabilisation) ou diverge (emballement)

**Effets de seuil :**
- Modéliser les points de rupture : tout va bien jusqu'au seuil critique
- Alerter avant d'atteindre le point de non-retour

### Ce que ça change
Le moteur capture les dynamiques non-linéaires : pourquoi un système peut basculer brutalement, ou pourquoi une petite amélioration peut déclencher un cercle vertueux.

### Valeur ★★★ · Effort élevé · Horizon : phase 3

---

## Axe 7 — Les scénarios comparés

> **Aide à la décision : comparer plusieurs futurs possibles.**

### Le problème actuel
Le moteur simule un chantier à la fois. Une décision réelle implique de comparer plusieurs options.

### Ce qu'on ajoute

**Simulation multi-chantiers :**
- Comparer l'impact de plusieurs chantiers menés ensemble
- Détecter les synergies (deux chantiers qui se renforcent) et les redondances

**Scénarios "et si" :**
- *"Et si je délègue à un remplaçant ?"*
- *"Et si je passe à 30 patients/jour ?"*
- *"Et si la réglementation se durcit ?"*

**Optimisation sous contrainte :**
- *"Avec un budget de X heures, quelle combinaison de chantiers maximise l'impact ?"*

### Ce que ça change
Le moteur devient un véritable outil d'aide à la décision stratégique, pas seulement de diagnostic.

### Valeur ★★★★ · Effort moyen · Horizon : phase 2

---

## Axe 8 — L'inter-systèmes approfondi

> **Modéliser les écosystèmes, pas seulement les organisations isolées.**

### Le problème actuel
Le pattern d'interface inter-systèmes existe mais reste sommaire. Or la valeur d'un cabinet dépend largement de son écosystème.

### Ce qu'on ajoute

**Graphes multi-organisations :**
- Relier le WSF d'un cabinet médecin à celui d'un laboratoire, d'un spécialiste, d'un hôpital
- Modéliser les flux qui traversent les frontières organisationnelles

**Qualité d'interface :**
- Chaque interface a une qualité (fiabilité, délai, format)
- Une interface dégradée impacte les deux systèmes

**Propagation inter-systèmes :**
- Un changement chez un partenaire se propage dans votre système
- Ex : le labo change son format de résultats → impact sur votre processus

### Ce que ça change
Le moteur modélise des chaînes de valeur complètes, pas des organisations isolées. Ouvre la voie à des cas d'usage B2B (relier deux entreprises).

### Valeur ★★★ · Effort élevé · Horizon : phase 3

---

## Axe 9 — La détection automatique avancée

> **Le moteur devient proactif plutôt que réactif.**

### Le problème actuel
Les patterns et désalignements sont détectés par règles fixes. On peut aller beaucoup plus loin.

### Ce qu'on ajoute

**Détection de patterns émergents :**
- Identifier des configurations récurrentes non encore cataloguées
- Enrichir automatiquement la bibliothèque de patterns

**Détection d'anomalies :**
- Repérer les configurations inhabituelles par rapport aux systèmes similaires
- *"Ce flux est atypique — 90% des cabinets font autrement"*

**Recommandations prédictives :**
- Anticiper les problèmes avant qu'ils surviennent
- *"À votre rythme de croissance, ce processus sera saturé dans 4 mois"*

### Ce que ça change
Le moteur ne se contente plus de décrire l'existant — il anticipe et recommande de façon proactive.

### Valeur ★★★★ · Effort élevé · Horizon : phase 2-3

---

## Axe 10 — La dimension réglementaire dynamique

> **Spécifique à la proposition de valeur conformité de Lugia & Co.**

### Le problème actuel
Les contraintes réglementaires (objets ENVIRONNEMENT) sont statiques. Or la réglementation évolue constamment.

### Ce qu'on ajoute

**Veille réglementaire intégrée :**
- Les objets ENVIRONNEMENT sont mis à jour quand la réglementation change
- Ex : nouvelle obligation AI Act → nouvel objet contrainte → re-simulation automatique

**Échéancier réglementaire :**
- Chaque contrainte a une date d'entrée en vigueur
- Le moteur alerte sur les échéances à venir

**Score d'exposition réglementaire :**
- Mesurer à quel point le système est exposé aux risques de non-conformité
- Prioriser les chantiers selon l'urgence réglementaire réelle

### Ce que ça change
Le moteur devient un système d'alerte réglementaire vivant. Quand l'AI Act évolue, tous les cabinets sont automatiquement re-diagnostiqués et alertés.

### Valeur ★★★★ · Effort moyen · Horizon : phase 1-2

---

## Synthèse — Matrice de priorisation

| Axe | Amélioration | Valeur | Effort | Horizon |
|---|---|---|---|---|
| 1 | Couche économique (€/heures) | ★★★★★ | Moyen | Immédiat |
| 2 | Mémoire et apprentissage | ★★★★★ | Élevé | Phase 2 |
| 3 | Temps et dynamique | ★★★★ | Moyen | Phase 1 |
| 5 | Résistance des acteurs | ★★★★ | Faible | Phase 1 |
| 7 | Scénarios comparés | ★★★★ | Moyen | Phase 2 |
| 9 | Détection automatique avancée | ★★★★ | Élevé | Phase 2-3 |
| 10 | Réglementaire dynamique | ★★★★ | Moyen | Phase 1-2 |
| 4 | Incertitude (Monte-Carlo) | ★★★ | Moyen | Phase 2 |
| 6 | Boucles systémiques | ★★★ | Élevé | Phase 3 |
| 8 | Inter-systèmes approfondi | ★★★ | Élevé | Phase 3 |

---

## Recommandation de séquencement

### Vague 1 — Rendre le moteur vendeur (Phase 1)
- **Axe 1** : couche économique → transforme le diagnostic en décision d'achat
- **Axe 5** : résistance des acteurs → effort faible, explique les échecs réels
- **Axe 3** : temps et dynamique → révèle les vrais goulots
- **Axe 10** : réglementaire dynamique → cœur de la valeur conformité

> Ces 4 axes transforment le moteur en outil de décision concret, avec un effort raisonnable.

### Vague 2 — Rendre le moteur intelligent (Phase 2)
- **Axe 2** : mémoire et apprentissage → le moat défendable
- **Axe 7** : scénarios comparés → aide à la décision avancée
- **Axe 9** : détection automatique → proactivité
- **Axe 4** : incertitude → crédibilité des prédictions

> Ces axes créent l'effet de réseau et la sophistication qui rendent le produit unique.

### Vague 3 — Rendre le moteur systémique (Phase 3)
- **Axe 6** : boucles systémiques → dynamiques non-linéaires
- **Axe 8** : inter-systèmes → écosystèmes complets

> Ces axes ouvrent les cas d'usage les plus avancés et préparent l'option B (plateforme ouverte).

---

## La règle d'or des améliorations

> **Chaque amélioration doit rester dans la couche générique du moteur, jamais dans le sectoriel.**

Une amélioration bien faite bénéficie automatiquement à toutes les verticales (Doctor, Lawyer, Finance…) sans code supplémentaire. C'est le test : si une amélioration ne sert qu'un seul secteur, elle est mal conçue.

---

## L'amélioration à faire en premier, en une phrase

**La couche économique (Axe 1)** — parce qu'elle transforme la phrase qui vend :

> Avant : *"résoudre ce désalignement améliore les outputs de 40%"* — abstrait, intéresse.
>
> Après : *"résoudre ce désalignement vous fait gagner une demi-journée par semaine, soit 11 000€ par an, pour 30 minutes de mise en place"* — concret, fait sortir la carte de crédit.

---

*Document d'évolution du moteur WSF — Lugia & Co — Mai 2026*
*À lire avec la spécification du moteur WSF générique*
