# Lugia & Co — Spécification du jumeau numérique
> Document de spécification technique · Mai 2026

---

## Objet du document

Spécification du jumeau numérique du cabinet et de sa mécanique de visualisation multi-niveaux. Le jumeau numérique est la représentation vivante et évolutive de l'organisation du professionnel, construite progressivement par l'usage.

---

## Partie 1 — Principes fondateurs

### Le jumeau numérique n'est pas un formulaire

```
CE QUE CE N'EST PAS              CE QUE C'EST
───────────────────             ──────────────
Un formulaire à remplir         Un modèle vivant permanent
Une photo à un instant T        Un film qui se précise
15 min puis terminé             Un compagnon quotidien
"Je remplis l'outil"            "L'outil se remplit en m'aidant"
```

### Les 4 principes directeurs

1. **Complétude progressive invisible** — chaque usage enrichit le modèle sans saisie consciente
2. **Valeur à chaque étape** — le jumeau est utile dès 30% de complétude, jamais "en attente d'être fini"
3. **Fidélité par déduction** — le LLM infère le réel à partir de peu de questions et de la connaissance accumulée
4. **Jamais culpabilisant** — l'incomplétude est un potentiel à venir, pas un manque

---

## Partie 2 — Modèle de données du jumeau

### L'objet enrichi

```
Objet {
  id            : identifiant unique
  composante    : ComposanteWSF (1 des 9)
  type          : TypeObjet (acteur, entité, stock, action, décision, flux, contrainte, frontière)
  label         : contenu métier
  etat          : EtatObjet
  criticite     : Criticite
  sensibilite   : Sensibilite | null
  
  // Dimension de maturité (spécifique au jumeau vivant)
  maturite : {
    source        : CONFIRMÉ | INFÉRÉ | SUPPOSÉ
    completude    : 0.0 à 1.0
    derniere_maj  : timestamp
    confiance     : 0.0 à 1.0
  }
  
  // Dimensions économiques et humaines (améliorations)
  cout_temps      : heures/semaine | null
  cout_argent     : €/mois | null
  charge_cognitive: 1-5 | null
  
  metadata        : extension libre
  annotations     : notes du professionnel
}
```

### La liaison enrichie

```
Liaison {
  id          : identifiant unique
  source      : id objet source
  cible       : id objet cible
  type        : TypeLiaison
  sens        : UNIDIRECTIONNEL | BIDIRECTIONNEL
  force       : 0.0 à 1.0
  delai       : IMMEDIAT | COURT | MOYEN | LONG
  caractere   : OBLIGATOIRE | OPTIONNEL | CONDITIONNEL
  role        : string | null  // pour liaisons Participant → cible
  
  maturite : {
    source     : CONFIRMÉ | INFÉRÉ | SUPPOSÉ
    confiance  : 0.0 à 1.0
  }
}
```

### Les états de découverte

| Source | Signification | Rendu visuel |
|---|---|---|
| CONFIRMÉ | Validé par le professionnel | Point plein, net |
| INFÉRÉ | Déduit par le moteur, à valider | Point pointillé ambré |
| SUPPOSÉ | Hypothèse faible | Point estompé |
| (absent) | Non encore découvert | Zone dans l'ombre |

---

## Partie 3 — La mécanique de complétude progressive

### La boucle vertueuse

```
Le professionnel utilise l'outil pour une tâche utile
        ↓
Le modèle se complète (un objet passe d'INFÉRÉ à CONFIRMÉ, ou d'absent à découvert)
        ↓
La complétude débloque un nouveau bénéfice
        ↓
Le professionnel voit l'avancement et le bénéfice débloqué
        ↓
Il est incité à utiliser l'outil pour une autre tâche
        ↓
(la boucle se renforce)
```

### Les déclencheurs d'enrichissement

Chaque action quotidienne dépose de l'information dans le jumeau :

| Action du professionnel | Ce que le jumeau apprend |
|---|---|
| Rédige un courrier | Objet "Rédaction", "Compte-rendu", correspondant |
| Fait une ordonnance | Objet "Renouvellement", "Ordonnance" |
| Utilise l'IA | Objet "Outil IA", flux de données |
| Ajoute un remplaçant | Objet "Remplaçant", dépendance d'accès |
| Reçoit un résultat labo | Objet "Laboratoire", flux entrant, fréquence |

### L'inférence par la mémoire

Le jumeau ne demande pas tout. Il **infère** à partir de :
- Les réponses au questionnaire initial
- La connaissance accumulée sur des milliers de cabinets similaires
- Les actions observées

Le professionnel **valide ou corrige** les inférences plutôt que de tout saisir.

---

## Partie 4 — La vision de l'avancement

### Les 4 dimensions de la maturité

**1. Complétude par composante WSF**
Quelles des 9 composantes sont bien renseignées.
```
Participants     ████████░░  80%
Information       ██████░░░░  60%
Technologies      █████████░  90%
...
```

**2. Profondeur vs largeur**
- Largeur : combien d'objets identifiés
- Profondeur : à quel point chaque objet est documenté

**3. Fiabilité de l'information**
Répartition CONFIRMÉ / INFÉRÉ / À EXPLORER.

**4. Valeur débloquée**
Ce que chaque niveau de complétude rend possible.

### La maturité globale

```
maturite_globale = Σ score_source(objet) / nombre_objets

où score_source : CONFIRMÉ=1.0, INFÉRÉ=0.5, SUPPOSÉ=0.25, absent=0
```

### La métaphore : révéler un territoire

Pas une barre de progression de formulaire (corvée), mais une **carte qui se révèle** :
- Zones explorées : nettes, lumineuses
- Zones non explorées : dans la brume
- Chaque usage éclaire une nouvelle zone

Gratifiant plutôt qu'anxiogène : on révèle un territoire, on ne remplit pas un vide.

### Les bénéfices débloqués

Chaque bénéfice a un seuil de complétude et des objets requis :
```
Bénéfice {
  id, titre, description
  objets_requis : liste d'objets qui doivent être découverts
  seuil_maturite: niveau de complétude global requis
  etat          : DÉBLOQUÉ | PROCHAIN | VERROUILLÉ
}
```

Présentation non culpabilisante :
> Pas *"il vous manque 60%"*
> Mais *"voici ce que vous pourrez débloquer ensuite : pour le Registre RGPD, votre carte a besoin de découvrir vos Données et vos Obligations"*

---

## Partie 5 — La mécanique multi-niveaux

### Les 5 niveaux de zoom

```
NIVEAU 0 — VIGNETTE
État de santé global en un coup d'œil
Diagramme : aucun (voyant)
Public : médecin pressé

NIVEAU 1 — PYRAMIDE WSF
Les 9 composantes, structure d'Alter
Diagramme : flowchart pyramidal
Public : vue d'ensemble

NIVEAU 2 — DOMAINE
Zoom sur une composante, ses objets
Diagramme : selon composante (class, ER…)
Public : exploration ciblée

NIVEAU 3 — FLUX DE VALEUR
Une chaîne de bout en bout
Diagramme : sequence / flowchart
Public : optimisation

NIVEAU 4 — FICHE OBJET
Détail complet + chantier
Public : action
```

### Les transitions

- **Par le zoom** : un curseur continu du niveau 0 au niveau 4
- **Par le clic** : cliquer sur un élément entre dans son niveau inférieur
- **Par le fil d'Ariane** : remonter à n'importe quel niveau parcouru
- **Par la recherche** : aller directement à un objet, quel que soit son niveau

### Le fil d'Ariane

```
Cabinet › Carte WSF › Technologies › Outil IA
   0          1            2            4
```
Chaque maillon est cliquable pour remonter.

---

## Partie 6 — Les lentilles transversales

Angles de lecture applicables à tous les niveaux.

| Lentille | Recoloration | Question |
|---|---|---|
| Santé | État des objets | Où ça va mal ? |
| Conformité | Exposition réglementaire | Où à risque ? |
| Données | Sensibilité | Où mes données critiques ? |
| Maturité | Complétude | Que reste-t-il à cartographier ? |
| Charge/Temps | Charge de travail | Où part mon temps ? |
| Coût/Valeur | Coût/valeur | Où est l'argent ? |
| Fragilité | Points de défaillance | Qu'est-ce qui me fragilise ? |

La combinaison **niveau × lentille** donne la vue précise nécessaire à un instant.

---

## Partie 7 — Le mode focus (ego-network)

### Principe
Sélectionner un élément isole son voisinage immédiat.

```
Sélection de "Outil IA"
        ↓
Illumination :
  ← qui l'utilise (Médecin, rôle: rédaction)
  ← ce qui le contraint (RGPD)
  → ce qu'il transforme (Données patient)
        ↓
Tout le reste s'estompe à ~12% d'opacité
        ↓
Bandeau : liste tous les liens avec leur rôle
```

### Usage
Répond à : *"De quoi dépend cet élément, qu'est-ce qui dépend de lui ?"*
Fondamental avant toute simulation de changement.

---

## Partie 8 — La simulation causale

### Depuis la fiche objet ou un désalignement

```
Simuler(améliorer objet X : état actuel → OPTIMAL)
        ↓
Propagation dans le graphe selon force × délai
        ↓
Impact agrégé sur Produits et Clients
        ↓
Restitution en euros et heures (couche économique)
```

### Algorithme (rappel)
```
Impact(cible) = force(source→cible) × Impact(source) × facteur_délai
Arrêt si Impact < seuil (0.05) ou frontière Environnement atteinte
```

### Restitution
> Pas *"+40% sur les outputs"*
> Mais *"économise 6h/semaine, soit 9 000€/an, pour un chantier de 30 min"*

---

## Partie 9 — Les visualisations complémentaires

### Dynamiques
- Propagation d'impact (onde animée)
- Découverte progressive (révélation de la carte)
- Flux animé (particules sur les liaisons)

### Non-graphe
- Radar (santé par composante)
- Barres de progression (complétude)
- Quadrant (priorisation chantiers)
- Timeline (évolution temporelle)
- Récit narratif (transformation accomplie)
- Comparaison avant/après

---

## Partie 10 — Règles d'expérience utilisateur

### Ce qui doit rester invisible
| Invisible | Pourquoi |
|---|---|
| Le mot "vault" | Trop technique |
| La tokenisation | Idem |
| Les appels API | Idem |
| Les pourcentages de conformité bruts | Anxiogène |
| La configuration avancée | Paralyse |

### Ce que le professionnel doit toujours voir
- Sa progression (de façon gratifiante)
- La valeur débloquée et à venir
- La prochaine étape claire et non culpabilisante
- De la valeur utile dès maintenant

### Les règles de ton
- L'incomplétude = potentiel, jamais manque
- L'avancement = exploration, jamais corvée
- Les risques = informations, jamais jugements

---

## Partie 11 — Architecture de données

### Stockage du jumeau
```
Jumeau {
  cabinet_id
  secteur          : doctor | lawyer | finance | ...
  objets[]         : tous les objets avec maturité
  liaisons[]       : toutes les liaisons avec rôles
  benefices[]      : état des bénéfices débloqués
  historique[]     : snapshots datés (pour avant/après)
  maturite_globale : calculée
  derniere_maj
}
```

### Séparation générique / sectoriel
- La **structure** du jumeau (9 composantes, types, états, niveaux, lentilles) est générique
- Le **contenu** (objets, labels, chantiers) est sectoriel
- Un même moteur de visualisation sert toutes les verticales

### Mise à jour
- Temps réel à chaque action du professionnel
- Snapshots datés pour l'historique et le mode avant/après
- Recalcul de la maturité et des bénéfices à chaque changement

---

## Synthèse — la mécanique complète

```
JUMEAU NUMÉRIQUE VIVANT
│
├── Se construit progressivement par l'usage (jamais un formulaire)
├── S'enrichit par inférence + validation (fidélité sans friction)
├── Montre l'avancement comme un territoire qui se révèle
│
├── Se visualise sur 5 NIVEAUX DE ZOOM
│   0 Vignette · 1 Pyramide WSF · 2 Domaine · 3 Flux · 4 Objet
│
├── Se lit sous 7 LENTILLES
│   Santé · Conformité · Données · Maturité · Charge · Coût · Fragilité
│
├── Se concentre avec le MODE FOCUS (ego-network)
│
├── Se projette avec la SIMULATION CAUSALE (en euros et heures)
│
└── Reste INVISIBLE dans sa complexité technique
```

> **Le professionnel voit son cabinet se dessiner, comprend sa situation, et agit — sans jamais avoir l'impression d'utiliser un outil technique.**

---

*Spécification du jumeau numérique — Lugia & Co — Mai 2026*
*À lire avec la spécification du moteur WSF et le document Mermaid & WSF*
