# Lugia & Co — La bibliothèque de lentilles
> Spécification · Les angles de lecture du jumeau numérique · Mai 2026

---

## Objet du document

Une **lentille** est un angle de lecture du jumeau numérique. Le même modèle WSF, recoloré et filtré différemment, répond à une question précise que se pose le professionnel. Ce document spécifie la bibliothèque complète des lentilles, leur logique, leur public, et leur priorité.

---

## Principe directeur

> **Une lentille n'a de valeur que si elle révèle quelque chose d'invisible autrement.**

Chaque lentille doit :
- Répondre à une **question distincte** que le professionnel se pose vraiment
- Recolorer le jumeau selon une **dimension mesurable**
- S'appliquer à **tous les niveaux de zoom** (vignette, carte, domaine, flux, objet)
- Ne pas se recouper avec une autre lentille

La combinaison **niveau de zoom × lentille** donne la vue précise nécessaire à un instant donné.

---

## Vue d'ensemble — les 22 lentilles par famille

```
FONDAMENTALES (8 — déjà spécifiées)
├── Santé · Conformité · Données · Maturité
└── Charge/Temps · Coût/Valeur · Fragilité · Documentation

STRATÉGIQUES (3)
├── Alignement stratégique ⭐
├── Retour sur investissement
└── Effort de changement

MÉTIER / FONCTIONNELLES (3)
├── Automatisation/Manuel ⭐
├── Adoption/Usage réel
└── Dépendance externe

TEMPORELLES (3)
├── Évolution/Tendance
├── Récence/Fraîcheur
└── Saisonnalité

HUMAINES (3)
├── Charge mentale/Bien-être
├── Satisfaction/Friction
└── Compétence/Maîtrise

PROTECTION (2)
├── Cybersécurité/Exposition
└── Réversibilité
```

---

# Partie 1 — Les lentilles fondamentales (rappel)

Déjà spécifiées dans les documents précédents, listées ici pour complétude.

| Lentille | Coloration par | Question |
|---|---|---|
| Santé | État des objets | Où ça va mal ? |
| Conformité | Exposition réglementaire | Où suis-je à risque RGPD/AI Act ? |
| Données | Sensibilité des informations | Où sont mes données critiques ? |
| Maturité | Complétude du modèle | Que reste-t-il à cartographier ? |
| Charge/Temps | Charge de travail | Où part mon temps ? |
| Coût/Valeur | Coût ou valeur générée | Où est l'argent ? |
| Fragilité | Points de défaillance unique | Qu'est-ce qui me rend vulnérable ? |
| Documentation | État de structuration documentaire | Quel savoir est fragile ? |

---

# Partie 2 — Les lentilles stratégiques

## 2.1 — Alignement stratégique ⭐
> **La lentille la plus centrale — elle incarne la proposition fondamentale d'Alter.**

### Ce qu'elle montre
Quels éléments servent réellement les objectifs (composante Stratégies) et lesquels n'y contribuent pas. Elle trace les chemins entre chaque objectif stratégique et les éléments qui le portent — ou révèle les objectifs orphelins (sans moyens) et les moyens orphelins (sans objectif).

### Question
*"Mes moyens servent-ils mes buts ?"*

### Coloration
- Vert : élément aligné, contribue à un objectif
- Ambre : élément faiblement relié aux objectifs
- Rouge : élément qui ne sert aucun objectif (gaspillage) OU objectif sans moyen (vœu pieux)

### Pourquoi elle est centrale
C'est littéralement le cœur du Work System Framework : un système de travail sain est un système où moyens et objectifs sont alignés. Cette lentille devrait presque être la vue par défaut du diagnostic. Elle révèle les désalignements — qui sont la source des chantiers.

### Détection associée
- Objectif sans moyen : *"Vous voulez gagner du temps mais aucun de vos processus n'est optimisé pour ça"*
- Moyen sans objectif : *"Cet outil ne sert aucun de vos objectifs déclarés"*

### Public : tous, en priorité le décideur

---

## 2.2 — Retour sur investissement

### Ce qu'elle montre
Croise le coût d'un chantier et son impact attendu pour révéler où l'effort sera le plus rentable.

### Question
*"Où mon effort sera-t-il le plus rentable ?"*

### Coloration
Gradient du meilleur ROI (vert vif) au moins bon (estompé). Les quick wins ressortent : fort impact, faible effort.

### Usage
La lentille de décision pure. Elle oriente directement vers le bon chantier à lancer en premier. Se combine naturellement avec le quadrant de priorisation.

### Public : le décideur, l'investisseur

---

## 2.3 — Effort de changement

### Ce qu'elle montre
La difficulté à modifier chaque élément — certains sont faciles à changer, d'autres verrouillés (contrats, habitudes ancrées, dépendances techniques).

### Question
*"Qu'est-ce qui est facile à changer, qu'est-ce qui est verrouillé ?"*

### Coloration
- Vert : facilement modifiable
- Ambre : modifiable avec effort
- Rouge : verrouillé (contrat long, forte dépendance, résistance)

### Usage
Aide à choisir des chantiers réalistes. Un chantier à fort impact mais sur un élément verrouillé est un piège ; mieux vaut commencer par le modifiable.

### Public : le décideur opérationnel

---

# Partie 3 — Les lentilles métier / fonctionnelles

## 3.1 — Automatisation / Manuel ⭐
> **La lentille qui pointe directement vers l'IA.**

### Ce qu'elle montre
Ce qui est fait manuellement vs ce qui est automatisé. Met en évidence les tâches répétitives encore manuelles.

### Question
*"Qu'est-ce que je fais encore à la main qui pourrait être automatisé ?"*

### Coloration
- Vert : automatisé
- Ambre : semi-automatisé
- Rouge : entièrement manuel et répétitif (candidat prioritaire à l'IA)

### Pourquoi elle est importante
Elle transforme le diagnostic en opportunités concrètes de gain de temps. Chaque zone rouge répétitive est un candidat direct à l'optimisation par l'IA — le cœur de la valeur de Lugia & Co.

### Public : le professionnel cherchant à gagner du temps

---

## 3.2 — Adoption / Usage réel

### Ce qu'elle montre
L'intensité d'utilisation réelle de chaque élément. Révèle les outils dormants, les processus abandonnés, les abonnements payés mais non utilisés.

### Question
*"Qu'est-ce que j'utilise vraiment vs ce que je possède ou paie sans m'en servir ?"*

### Coloration
- Vert : utilisé intensément
- Ambre : utilisé occasionnellement
- Gris : dormant, non utilisé (gaspillage potentiel)

### Usage
Identifie le gaspillage (abonnements inutiles) et les outils sous-exploités (qui pourraient apporter plus). Lien direct avec la lentille Coût.

### Public : le professionnel, le gestionnaire

---

## 3.3 — Dépendance externe

### Ce qu'elle montre
Le degré de dépendance à des tiers (éditeurs, partenaires, plateformes). Tournée vers l'extérieur, contrairement à la fragilité qui regarde l'interne.

### Question
*"De qui/quoi je dépends, et que se passe-t-il si ça disparaît ou change ses conditions ?"*

### Coloration
- Vert : autonome ou alternatives disponibles
- Ambre : dépendance avec alternatives coûteuses
- Rouge : dépendance critique sans alternative

### Usage
Anticipe les risques externes : un éditeur qui ferme, un partenaire qui change ses tarifs, une plateforme qui modifie ses règles.

### Public : le décideur, le repreneur

---

# Partie 4 — Les lentilles temporelles

## 4.1 — Évolution / Tendance

### Ce qu'elle montre
Ce qui s'améliore vs ce qui se dégrade dans le temps, par des flèches de tendance sur chaque élément.

### Question
*"Qu'est-ce qui va dans le bon sens, qu'est-ce qui se détériore ?"*

### Coloration
- Flèche verte montante : s'améliore
- Flèche ambre stable : stagne
- Flèche rouge descendante : se dégrade

### Pourquoi elle est utile
Bien plus parlante qu'un état figé. Un élément "fonctionnel mais en dégradation" mérite plus d'attention qu'un élément "à risque mais en amélioration". La tendance prime souvent sur l'état.

### Public : tous, pour le suivi continu

---

## 4.2 — Récence / Fraîcheur

### Ce qu'elle montre
L'ancienneté de la dernière mise à jour ou révision de chaque élément.

### Question
*"Qu'est-ce qui n'a pas été revu depuis longtemps ?"*

### Coloration
Gradient du récent (vif) à l'ancien (estompé). Ce qui dort ressort.

### Usage
Détecte ce qui mériterait une révision : un protocole jamais relu, un accès jamais vérifié, un outil jamais réévalué.

### Public : le professionnel en routine de maintenance

---

## 4.3 — Saisonnalité

### Ce qu'elle montre
Les éléments soumis à des pics d'activité selon le moment (semaine, saison).

### Question
*"Qu'est-ce qui sature à certains moments ?"*

### Coloration
Met en évidence les éléments à forte variabilité temporelle.

### Usage
Anticiper les pics : certificats de sport en septembre, grippe en hiver, lundi matin. Aide au dimensionnement et à la planification.

### Public : le professionnel planifiant son activité

---

# Partie 5 — Les lentilles humaines

## 5.1 — Charge mentale / Bien-être

### Ce qu'elle montre
La charge cognitive et émotionnelle de chaque élément — distincte de la charge en temps. Une tâche peut être courte mais épuisante.

### Question
*"Qu'est-ce qui m'épuise réellement ?"*

### Coloration
- Vert : léger mentalement
- Ambre : exigeant
- Rouge : épuisant (charge cognitive ou émotionnelle élevée)

### Pourquoi elle est importante
Liée à la soutenabilité et à la prévention du burn-out. Pour les métiers de soin, de conseil, de droit, la charge émotionnelle est une dimension de premier ordre, pas un détail. Un cabinet efficace mais épuisant est à risque.

### Public : le professionnel soucieux de sa soutenabilité

---

## 5.2 — Satisfaction / Friction

### Ce qu'elle montre
Ce qui fonctionne sans douleur vs ce qui crée de la frustration au quotidien.

### Question
*"Qu'est-ce qui m'agace tous les jours ?"*

### Coloration
- Vert : fluide, satisfaisant
- Rouge : source de friction quotidienne

### Pourquoi elle est distincte
Ce qui crée de la friction est souvent différent de ce qui est "à risque" objectivement. Un outil parfaitement conforme mais pénible à utiliser génère de l'insatisfaction. Cette lentille capte le vécu, pas seulement l'objectif.

### Public : le professionnel, pour améliorer son quotidien

---

## 5.3 — Compétence / Maîtrise

### Ce qu'elle montre
Le niveau de maîtrise des participants sur chaque outil ou processus.

### Question
*"Où ai-je besoin de monter en compétence, ou de former quelqu'un ?"*

### Coloration
- Vert : bien maîtrisé
- Ambre : maîtrise partielle
- Rouge : faible maîtrise (besoin de formation)

### Usage
Identifie les besoins de formation, les outils sous-exploités par manque de maîtrise, les risques liés à une compétence détenue par une seule personne.

### Public : le professionnel, le responsable d'équipe

---

# Partie 6 — Les lentilles de protection

## 6.1 — Cybersécurité / Exposition

### Ce qu'elle montre
L'exposition aux risques techniques : intrusion, perte de données, ransomware, accès non sécurisés. Distincte de la conformité (qui est réglementaire).

### Question
*"Où suis-je vulnérable techniquement ?"*

### Coloration
- Vert : sécurisé
- Ambre : exposition modérée
- Rouge : vulnérabilité critique

### Distinction avec Conformité
La conformité est juridique (RGPD, AI Act), la cybersécurité est technique (intrusion, sauvegarde). Un système peut être conforme sur le papier mais techniquement vulnérable.

### Public : le DPO, le responsable technique

---

## 6.2 — Réversibilité

### Ce qu'elle montre
Ce qui est réversible vs irréversible. Quelles décisions peuvent être annulées, lesquelles engagent durablement.

### Question
*"Si je me trompe, puis-je revenir en arrière ?"*

### Coloration
- Vert : réversible
- Ambre : réversible avec coût
- Rouge : irréversible (suppression de données, engagement long)

### Usage
Importante avant les décisions engageantes : changer d'outil, supprimer des données, signer un contrat long. Aide à prendre des risques mesurés.

### Public : le décideur face à un choix engageant

---

# Partie 7 — Lentilles et publics

Toutes les lentilles ne servent pas tout le monde. Le ciblage par public est aussi un levier produit.

| Public | Lentilles prioritaires |
|---|---|
| Médecin / professionnel | Santé, Charge, Charge mentale, Automatisation, Satisfaction, Documentation |
| DPO / responsable conformité | Conformité, Données, Cybersécurité, Réversibilité |
| Investisseur / repreneur | ROI, Fragilité, Dépendance externe, Valorisation, Documentation |
| Institution (URPS, ARS) | Alignement, Évolution, Maturité (agrégés et anonymisés) |
| Responsable d'équipe / MSP | Compétence, Charge, Adoption, Alignement |

### Levier produit
Les lentilles avancées (alignement, ROI, cybersécurité) peuvent être réservées aux offres supérieures (Pro, Institution). Les lentilles de base (santé, conformité, documentation) sont dans l'offre d'entrée.

---

# Partie 8 — Règles de conception des lentilles

### R1 — Unicité de question
Chaque lentille répond à une question distincte. Pas de recouvrement. Si deux lentilles répondent à la même question, en supprimer une.

### R2 — Mesurabilité
Une lentille recolore selon une dimension mesurable, calculée depuis les attributs des objets et liaisons. Pas de lentille "impressionniste".

### R3 — Universalité de niveau
Une lentille s'applique à tous les niveaux de zoom. Si elle n'a de sens qu'à un seul niveau, ce n'est pas une lentille mais une vue.

### R4 — Généricité sectorielle
Une lentille est définie dans la couche générique du moteur. Elle sert toutes les verticales (Doctor, Lawyer, Finance). Une lentille spécifique à un secteur est mal conçue.

### R5 — Légende contextuelle
Chaque lentille affiche sa propre légende expliquant son code couleur. Le professionnel comprend toujours ce qu'il regarde.

---

# Partie 9 — Priorisation de développement

### Vague 1 — Les lentilles qui vendent et qui alignent
- **Alignement stratégique** ⭐ — le cœur de la proposition, presque la vue par défaut
- **Automatisation/Manuel** ⭐ — pointe vers l'IA, transforme le diagnostic en opportunités
- **Retour sur investissement** — oriente vers le bon chantier à lancer

### Vague 2 — Les lentilles de profondeur
- Évolution/Tendance — le suivi dans le temps
- Charge mentale/Bien-être — la soutenabilité humaine
- Adoption/Usage réel — la chasse au gaspillage

### Vague 3 — Les lentilles spécialisées
- Cybersécurité, Dépendance externe (publics DPO/repreneur)
- Satisfaction, Compétence (amélioration du quotidien)
- Récence, Saisonnalité, Effort de changement, Réversibilité (raffinements)

---

## Synthèse

```
LA BIBLIOTHÈQUE DE LENTILLES — 22 angles de lecture
│
├── FONDAMENTALES (8) — santé, conformité, données, maturité,
│   charge, coût, fragilité, documentation
│
├── STRATÉGIQUES (3) — alignement ⭐, ROI, effort de changement
│
├── MÉTIER (3) — automatisation ⭐, adoption, dépendance externe
│
├── TEMPORELLES (3) — évolution, récence, saisonnalité
│
├── HUMAINES (3) — charge mentale, satisfaction, compétence
│
└── PROTECTION (2) — cybersécurité, réversibilité

        + ciblage par public (levier produit)
        + 5 règles de conception
        + 3 vagues de développement
```

> **Une lentille = une question distincte que le professionnel se pose vraiment.**
> **Le même jumeau, vingt-deux façons de le comprendre — chacune au bon moment, pour le bon public.**

La plus centrale de toutes : **l'alignement stratégique**, car elle incarne la raison d'être du Work System Framework — vérifier que les moyens servent les objectifs, en tenant compte de l'état de santé du système.

---

*Spécification de la bibliothèque de lentilles — Lugia & Co — Mai 2026*
*À lire avec la spécification du jumeau numérique et du moteur WSF*
