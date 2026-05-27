# Moteur WSF — Améliorations de fidélité au réel
> Document d'évolution · Volet 2 · Lugia & Co · Mai 2026

---

## Préambule

Le premier document d'améliorations (`lugia_moteur_wsf_ameliorations.md`) visait à rendre le moteur plus **puissant** — couche économique, apprentissage, simulation avancée.

Ce document vise un objectif différent et complémentaire : rendre le moteur plus **fidèle à la réalité du travail**. Il ne s'agit plus de mieux calculer, mais de mieux représenter ce qui se passe vraiment dans une organisation.

Ces améliorations s'inspirent de l'ergonomie, de la sociologie du travail et de la théorie d'Alter, pour qui la santé d'un système de travail dépend de facteurs souvent invisibles dans une modélisation purement structurelle.

---

## Axe 11 — Le travail réel vs le travail prescrit

> **L'amélioration de fidélité la plus fondamentale. Tout le reste en découle.**

### Le constat
Ce qui est écrit dans les procédures n'est jamais ce qui se passe réellement. C'est la distinction centrale de l'ergonomie : entre le travail prescrit (la règle) et le travail réel (la pratique).

### Ce qu'on ajoute

**Double modélisation de chaque processus :**
```
Processus {
  ...
  version_prescrite : ce qui devrait se passer (procédure officielle)
  version_reelle    : ce qui se passe vraiment (pratique de terrain)
  ecart             : nature et ampleur de la différence
}
```

### Exemples concrets
- Un médecin note ses observations sur un post-it avant de les saisir le soir — dans aucune procédure, mais c'est le réel
- La secrétaire valide certaines choses "à la place" du médecin pour gagner du temps
- Le remplaçant utilise un raccourci non documenté

### Ce que ça révèle
L'écart entre prescrit et réel est souvent l'endroit où se cachent **à la fois les risques** (contournements dangereux) **et l'intelligence du terrain** (optimisations spontanées). Le diagnostic doit révéler ces écarts sans les juger.

### Valeur fidélité ★★★★★

---

## Axe 12 — Le travail informel et les relations non documentées

> **Une organisation fonctionne autant par ses canaux informels que par ses canaux officiels.**

### Le constat
Les organigrammes et les procédures ne montrent que la structure formelle. Le réel passe largement par l'informel.

### Ce qu'on ajoute

**Nouveau type de liaison :**
```
TypeLiaison {
  ...
  INFORMELLE   // échange non documenté, relation de confiance
}
```

**Nœuds de confiance :**
```
Participant {
  ...
  influence_informelle : poids réel au-delà du rôle officiel
}
```

### Exemples concrets
- Le médecin qui appelle un confrère de confiance plutôt que de suivre le circuit officiel d'adressage
- La conversation de couloir qui résout un problème plus vite qu'un email
- Le savoir tacite qui n'est écrit nulle part mais fait tourner le cabinet

### Ce que ça révèle
Certains participants ont une force réelle qui dépasse largement leur rôle officiel. Les ignorer, c'est passer à côté de la dynamique réelle de l'organisation — et risquer de casser ce qui marche en voulant "rationaliser".

### Valeur fidélité ★★★★

---

## Axe 13 — La variabilité et les cas particuliers

> **Une organisation ne vit pas dans la moyenne. Elle vit dans les exceptions.**

### Le constat
Le modèle traite un processus comme uniforme. Le réel est fait de variantes, d'exceptions, de cas particuliers qui ont chacun leur logique.

### Ce qu'on ajoute

**Décomposition des processus en variantes :**
```
Processus {
  ...
  variantes : [
    { nom: "Cas standard",     frequence: 0.70, cout, risque },
    { nom: "Cas complexe",     frequence: 0.15, cout, risque },
    { nom: "Urgence",          frequence: 0.10, cout, risque },
    { nom: "Nouveau patient",  frequence: 0.05, cout, risque }
  ]
}
```

### Exemples concrets
Un cabinet ne gère pas "des consultations" mais :
- Des consultations de routine (rapides, standardisées)
- Des urgences (imprévues, chronophages)
- Des cas chroniques (suivi long, dossier épais)
- Des nouveaux patients (création de dossier, anamnèse complète)

Chacun a un processus, un coût, un risque, un temps différents.

### Ce que ça révèle
Les coûts cachés et les risques se concentrent souvent dans les cas particuliers, pas dans le cas standard. Modéliser uniquement la moyenne masque l'essentiel.

### Valeur fidélité ★★★★★

---

## Axe 14 — La charge cognitive et l'attention

> **Le facteur le plus sous-estimé. Un humain n'a pas une capacité d'attention infinie.**

### Le constat
Le modèle traite les participants comme ayant une capacité constante. En réalité, l'attention est une ressource limitée et fluctuante.

### Ce qu'on ajoute

**Sur les tâches :**
```
Processus {
  ...
  charge_cognitive : échelle 1-5 (attention requise)
}
```

**Sur les participants :**
```
Participant {
  ...
  charge_cognitive_cumulee : accumulation au fil de la journée
  cout_changement_contexte : pénalité de passage d'une tâche à l'autre
  courbe_fatigue           : dégradation de la qualité dans le temps
}
```

### Exemples concrets
- Un médecin à sa 28e consultation ne fonctionne pas comme à sa 3e
- Passer constamment de la consultation à l'administratif épuise plus que de faire chaque bloc séparément
- La qualité des décisions baisse en fin de journée

### Ce que ça révèle
Deux organisations avec la même structure peuvent avoir des santés très différentes selon la charge cognitive réelle. Un système "efficace sur le papier" peut être épuisant en pratique.

### Valeur fidélité ★★★★

---

## Axe 15 — Les interruptions et la fragmentation

> **Le travail réel n'est jamais linéaire. Il est constamment interrompu.**

### Le constat
Le modèle suppose des processus qui se déroulent d'un bloc. La réalité est faite d'interruptions et de reprises.

### Ce qu'on ajoute

**Flux d'interruption :**
```
Interruption {
  source       : téléphone, urgence, sollicitation
  frequence    : combien de fois par période
  cout_reprise : temps perdu à se replonger dans la tâche
}
```

**Impact sur les processus :**
- Un processus interrompu voit sa durée réelle exploser
- La qualité peut être affectée par la perte de fil

### Exemples concrets
- Un compte-rendu "de 5 minutes" prend 20 minutes parce qu'interrompu trois fois
- Le coût de reprise après interruption est souvent supérieur au temps de l'interruption elle-même
- La fragmentation augmente le taux d'erreur

### Ce que ça révèle
Le modèle linéaire surestime massivement l'efficacité. Modéliser les interruptions explique pourquoi "tout prend plus de temps que prévu" — une réalité que tout professionnel connaît.

### Valeur fidélité ★★★★

---

## Axe 16 — Le contexte spatial et matériel

> **Le travail se déroule dans un espace physique avec des contraintes matérielles.**

### Le constat
Le modèle est purement logique, hors-sol. Le réel est ancré dans des lieux et des objets physiques.

### Ce qu'on ajoute

**Dimension spatiale des infrastructures :**
```
Infrastructure {
  ...
  localisation     : où se trouve la ressource
  partage          : combien de personnes la partagent
  cout_deplacement : temps pour y accéder
}
```

### Exemples concrets
- Une seule imprimante pour tout le cabinet crée une file d'attente invisible
- Un seul appareil d'échographie partagé contraint le planning
- Les déplacements entre salle de consultation et secrétariat consomment du temps

### Ce que ça révèle
Des goulots physiques invisibles dans une modélisation purement logique. La ressource matérielle partagée est un point de friction classique.

### Valeur fidélité ★★★

---

## Axe 17 — Le rythme et la temporalité réelle

> **Une organisation a des rythmes — pics, creux, cycles.**

### Le constat
Le modèle traite l'activité comme constante. Le réel a des moments de pointe et des moments creux.

### Ce qu'on ajoute

**Temporalité cyclique des flux :**
```
Flux {
  ...
  profil_temporel : {
    pics       : moments de forte charge (lundi matin, fin de journée),
    creux      : moments calmes,
    saisonnalite : variations annuelles
  }
}
```

### Exemples concrets
- Le lundi matin et la fin de journée sont des pics de charge
- Les certificats de sport affluent en septembre
- L'épidémie de grippe transforme le régime du cabinet en hiver

### Ce que ça révèle
Un système peut être sain en moyenne mais saturé aux heures de pointe. Les moments de bascule, où le système change de régime, sont critiques à identifier.

### Valeur fidélité ★★★

---

## Axe 18 — Les émotions et la dimension humaine

> **Le travail de soin, de conseil, de droit est profondément relationnel et émotionnel.**

### Le constat
Le modèle traite les participants comme des processeurs. Dans ces métiers, la dimension humaine est centrale, pas accessoire.

### Ce qu'on ajoute

**Charge émotionnelle des interactions :**
```
Processus {
  ...
  charge_emotionnelle : intensité émotionnelle de la tâche
}
```

**Qualité relationnelle comme output :**
```
Produit {
  ...
  qualite_relationnelle : dimension humaine de la valeur délivrée
}
```

**Épuisement comme état de santé :**
```
EtatObjet {
  ...
  EPUISEMENT   // état spécifique aux participants
}
```

### Exemples concrets
- Annoncer un diagnostic difficile a une charge émotionnelle élevée
- La qualité de la relation médecin-patient est une valeur en soi, pas un effet secondaire
- Le burn-out est un état de santé du système, pas un échec individuel

### Ce que ça révèle
La santé d'un système de travail dans ces métiers ne se réduit pas à l'efficacité. La soutenabilité humaine est une dimension de premier ordre — et un facteur de churn réel (un professionnel épuisé change ses outils, son organisation, voire de métier).

### Valeur fidélité ★★★★

---

## Axe 19 — L'historique et la trajectoire

> **Une organisation a une histoire qui explique son présent.**

### Le constat
Le modèle photographie le présent sans son contexte historique. Or beaucoup de choses ne s'expliquent que par l'histoire.

### Ce qu'on ajoute

**Dimension temporelle longue :**
```
Objet {
  ...
  anciennete  : depuis quand il existe
  origine     : pourquoi il a été mis en place
  trajectoire : comment il a évolué
}
```

### Exemples concrets
- L'outil qu'on garde par habitude alors qu'il est dépassé
- La pratique mise en place pour résoudre un problème qui n'existe plus
- La trajectoire qui révèle où va l'organisation

### Ce que ça révèle
Comprendre pourquoi le présent est ce qu'il est aide à proposer des changements acceptables. Un changement qui ignore l'histoire se heurte à des résistances incompréhensibles.

### Valeur fidélité ★★

---

## Axe 20 — Les dépendances cachées et points de fragilité

> **L'insight qui surprend et qui a une valeur immédiate.**

### Le constat
Le réel est plein de dépendances qu'on ne voit qu'au moment où elles cassent.

### Ce qu'on ajoute

**Détection automatique des single points of failure :**
```
Analyse {
  dependances_critiques : objets dont la défaillance bloque le système
  bus_factor            : combien de personnes peuvent faire chaque tâche
  resilience            : capacité à fonctionner en cas d'absence
}
```

### Exemples concrets
- La secrétaire qui seule sait faire telle démarche
- Le processus qui ne marche que parce qu'une personne précise est là
- L'outil unique sans solution de repli

### Ce que ça révèle
*"Votre cabinet s'arrête si votre secrétaire est malade"* — un médecin le ressent confusément mais ne l'a jamais vu formalisé. C'est un insight à forte valeur émotionnelle et pratique, qui justifie immédiatement un chantier de résilience.

### Valeur fidélité ★★★★★

---

## Synthèse — Matrice de fidélité au réel

| Axe | Amélioration | Capture | Valeur |
|---|---|---|---|
| 11 | Travail réel vs prescrit | L'écart procédure/pratique | ★★★★★ |
| 13 | Variabilité et cas particuliers | Les exceptions du quotidien | ★★★★★ |
| 20 | Dépendances cachées | Les fragilités invisibles | ★★★★★ |
| 12 | Travail informel | Les canaux non documentés | ★★★★ |
| 14 | Charge cognitive | Les limites humaines d'attention | ★★★★ |
| 15 | Interruptions | La fragmentation du travail | ★★★★ |
| 18 | Émotions et dimension humaine | La soutenabilité du travail | ★★★★ |
| 16 | Contexte spatial | Les contraintes physiques | ★★★ |
| 17 | Rythme et temporalité | Les pics et les cycles | ★★★ |
| 19 | Historique | Le contexte du présent | ★★ |

---

## Les trois à privilégier pour la fidélité

**1. Le travail réel vs prescrit (Axe 11)** — la condition de toute fidélité. Modéliser ce qui se passe vraiment, pas ce qui devrait se passer.

**2. La variabilité et les cas particuliers (Axe 13)** — parce que l'organisation vit dans les exceptions, pas dans la moyenne. C'est là que sont les coûts cachés et les risques.

**3. Les dépendances cachées (Axe 20)** — parce que c'est l'insight qui surprend et crée une valeur immédiate. *"Votre cabinet s'arrête si X est absent."*

---

## La tension fondamentale : fidélité vs simplicité

Ces améliorations posent une question de fond sur le produit.

```
Plus le modèle est fidèle au réel
         ↓
Plus il est PRÉCIS
         ↓
Mais plus il est LOURD à renseigner
         ↓
Ce qui contredit la force de Lugia : un questionnaire de 15 minutes
```

La vraie question n'est donc pas *"jusqu'où peut-on modéliser le réel ?"* mais :

> **"Quel niveau de fidélité crée le plus de valeur pour le minimum de friction ?"**

---

## La réponse : la fidélité par déduction, pas par interrogation

La conviction directrice : **modéliser le réel par déduction intelligente plutôt que par interrogation exhaustive.**

```
MAUVAISE APPROCHE                 BONNE APPROCHE
─────────────────                 ──────────────
Poser 200 questions               Poser 20 questions simples
pour tout capturer                + le LLM INFÈRE le reste

Le médecin décrit                 Le moteur SAIT, parce qu'il a vu
ses interruptions                 5 000 cabinets similaires, qu'un
une par une                       généraliste est interrompu N fois
                                  par consultation — et l'applique
```

### Le mécanisme
1. Le questionnaire pose 20 questions simples (zéro friction)
2. Le LLM, nourri par la mémoire du moteur (Axe 2), **infère** :
   - Le travail réel probable
   - Les cas particuliers typiques du secteur
   - Les dépendances cachées récurrentes
   - Les interruptions moyennes
3. Le médecin **valide ou corrige** les inférences plutôt que de tout saisir

### La synergie clé
**La fidélité au réel et la mémoire/apprentissage (Axe 2) se rejoignent :**

> La fidélité ne vient pas de questions plus nombreuses. Elle vient de la connaissance accumulée.

Plus Lugia & Co a de clients, plus il connaît la réalité du travail dans chaque secteur, et plus il peut inférer fidèlement le réel d'un nouveau cabinet à partir de quelques réponses. C'est encore un effet de réseau — et le même qui crée le moat défendable.

---

## Recommandation de séquencement

### Vague A — Fidélité à fort impact, faible friction
- **Axe 20** (dépendances cachées) — déductible, insight fort, peu de questions
- **Axe 13** (variabilité) — quelques questions sur les types de cas
- **Axe 11** (réel vs prescrit) — une ou deux questions bien posées révèlent l'écart

### Vague B — Fidélité par inférence (après accumulation de données)
- **Axe 14** (charge cognitive) — inférée depuis le volume et le type d'activité
- **Axe 15** (interruptions) — inférée depuis le secteur et la configuration
- **Axe 18** (émotions) — inférée depuis le type de métier et d'interactions

### Vague C — Fidélité fine (cas avancés)
- **Axe 12** (informel) — nécessite une exploration plus poussée
- **Axe 16** (spatial) — pertinent surtout pour les structures multi-lieux
- **Axe 17** (temporalité) — pertinent pour l'optimisation avancée
- **Axe 19** (historique) — contexte utile mais rarement déterminant

---

## La règle d'or, à nouveau

> **Toute amélioration de fidélité doit pouvoir être INFÉRÉE autant que possible, et VALIDÉE par le professionnel — jamais imposée comme une saisie exhaustive.**

Le produit reste un questionnaire de 15 minutes. La profondeur vient de l'intelligence du moteur, pas de la longueur du formulaire.

---

*Document d'évolution du moteur WSF — Volet fidélité au réel — Lugia & Co — Mai 2026*
*À lire avec la spécification du moteur et le volet 1 des améliorations*
