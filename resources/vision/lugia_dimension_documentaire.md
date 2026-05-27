# Lugia & Co — La dimension documentaire
> Spécification · Structuration de la connaissance documentaire · Mai 2026

---

## Objet du document

La connaissance documentaire est un angle mort majeur dans les cabinets et un dysfonctionnement récurrent. Aucun outil existant ne l'adresse vraiment. Ce document spécifie comment Lugia & Co aide le professionnel à structurer sa connaissance documentaire et à suivre un état d'avancement fin de cette structuration.

---

## Partie 1 — Le problème

### Pourquoi la connaissance documentaire dysfonctionne

Dans un cabinet, la documentation souffre de problèmes spécifiques et récurrents :

**La dispersion** — les documents sont partout : ordinateur, classeur papier, email, tête du professionnel, post-it. Rien n'est centralisé.

**L'obsolescence silencieuse** — un protocole rédigé il y a 3 ans, jamais mis à jour, qu'on suit encore par habitude alors qu'il est faux.

**Le savoir tacite non documenté** — le "comment on fait ici" qui n'existe que dans la tête du titulaire ou de la secrétaire. Si la personne part, le savoir part avec elle.

**Les doublons et contradictions** — plusieurs versions du même modèle, on ne sait plus laquelle est la bonne.

**L'absence de propriété** — personne n'est responsable de maintenir tel document à jour, donc personne ne le fait.

**L'invisibilité du manque** — on ne sait pas ce qui manque, parce qu'un document absent ne se signale jamais.

### L'impact réel

- Perte de temps à chercher ou refaire ce qui existe
- Risque de continuité : le cabinet dépend de la mémoire d'une personne
- Risque de conformité : beaucoup d'obligations sont documentaires
- Difficulté de transmission : un cabinet non documenté se transmet mal
- Fragilité : un savoir critique tacite est un point de défaillance unique

---

## Partie 2 — Positionnement dans le WSF

La connaissance documentaire est une **sous-composante de l'Information** — distincte des données opérationnelles.

```
INFORMATION (composante WSF)
├── Données opérationnelles    → dossiers patients, RDV, résultats
└── Connaissance documentaire  → le savoir qui fait tourner le cabinet
    ├── Procédures et protocoles    (comment on fait)
    ├── Modèles de documents          (courriers types, formulaires)
    ├── Référentiels et guides        (bonnes pratiques, recommandations)
    ├── Contrats et conventions       (assurances, partenaires, baux)
    └── Mémoire du cabinet            (savoir tacite, habitudes, historique)
```

Elle mérite son propre traitement car sa nature et ses problèmes diffèrent des données opérationnelles : elle n'est pas produite par l'activité, elle la **structure**.

---

## Partie 3 — Le modèle de l'objet documentaire

```
DocumentObjet {
  id
  nom              : "Protocole d'accueil patient"
  categorie        : PROCEDURE | MODELE | REFERENTIEL | CONTRAT | MEMOIRE
  lie_a            : processus ou composante WSF rattachée
  criticite        : CRITIQUE | IMPORTANT | STANDARD | PERIPHERIQUE

  etat_structuration : {
    existence      : EXISTE | MANQUANT | A_CREER
    localisation   : CENTRALISE | DISPERSE | INTROUVABLE
    actualite      : A_JOUR | OBSOLETE | INCONNUE
    proprietaire   : DEFINI | ORPHELIN
    formalisation  : ECRIT | TACITE | PARTIEL
    accessibilite  : PARTAGE | PERSONNEL | INACCESSIBLE
  }

  niveau_maturite  : 0 à 6 (calculé depuis l'état)
  derniere_revision: date
  proprietaire     : participant responsable | null
}
```

---

## Partie 4 — L'échelle de maturité documentaire (suivi fin)

C'est le cœur du suivi d'avancement. Chaque document se situe sur une échelle précise de 0 à 6.

```
NIVEAU  ÉTAT                          SIGNIFICATION
──────  ────────────────────────────  ─────────────────────────────────
  0     Inexistant, non identifié     On ne sait même pas qu'il manque
  1     Identifié comme nécessaire    On sait qu'il faudrait l'avoir
  2     Existe mais tacite            Dans la tête, pas écrit
  3     Écrit mais dispersé           Existe quelque part, introuvable
  4     Centralisé mais obsolète      Rangé, mais pas à jour
  5     À jour mais sans propriétaire Bon, mais personne ne le maintient
  6     Structuré et maintenu         Idéal : à jour, accessible, possédé
```

### Calcul du niveau

Le niveau découle de l'état de structuration :
```
si existence = MANQUANT et non identifié    → 0
si identifié mais existence = A_CREER        → 1
si formalisation = TACITE                    → 2
si localisation = DISPERSE/INTROUVABLE       → 3
si actualite = OBSOLETE                      → 4
si proprietaire = ORPHELIN                   → 5
si tout est optimal                          → 6
```

### Maturité documentaire globale
```
maturite_doc = Σ niveau(doc) / (nombre_docs × 6)
```

Exprimée en pourcentage, c'est l'indicateur de santé documentaire du cabinet.

---

## Partie 5 — La visualisation de l'avancement

### Vue par catégorie
```
Procédures        ████████░░  4/5 structurées
Modèles de docs   ██████░░░░  6/10 structurés
Référentiels      ███░░░░░░░  2/7 structurés
Contrats          █████████░  3/3 structurés
Mémoire cabinet   ██░░░░░░░░  surtout tacite
```

### Vue par niveau de structuration
Histogramme du nombre de documents à chaque niveau (0 à 6) — pour voir où se concentre le travail à faire.

### Vue par criticité
Priorisation : les documents critiques non structurés en premier — ceux dont l'absence ou l'obsolescence crée un vrai risque.

### La carte documentaire
Chaque document positionné selon son lien avec un processus du cabinet. On voit visuellement quels processus sont bien documentés et lesquels sont des zones d'ombre.

### Vue d'évolution
La maturité documentaire dans le temps — le chemin parcouru, motivant.

---

## Partie 6 — Intégration dans le jumeau existant

La dimension documentaire réutilise toute la mécanique déjà construite.

### Une nouvelle lentille : "Documentation"
Recoloration du jumeau par état de structuration documentaire.
Répond à : *"Quelle connaissance est bien structurée, laquelle est fragile ?"*

### Des objets documentaires rattachés aux composantes
Chaque processus, chaque technologie peut avoir des documents associés :
- Le processus "Consultation" a-t-il un protocole ?
- La technologie "Outil IA" a-t-elle une procédure d'usage ?
- Le participant "Remplaçant" a-t-il un livret d'accueil ?

### Des chantiers de structuration documentaire
- *"Structurez votre protocole d'accueil patient"*
- *"Formalisez le savoir tacite de votre secrétaire avant son départ"*
- *"Mettez à jour vos modèles de courrier obsolètes"*
- *"Centralisez vos documents dispersés"*

### La détection des fragilités documentaires
Lien direct avec la dépendance cachée : un savoir critique tacite, détenu par une seule personne, est un point de défaillance unique. Le système l'alerte en priorité.

---

## Partie 7 — La synergie avec l'IA

C'est là que la dimension documentaire rejoint le cœur du produit, dans un cercle vertueux.

### L'IA aide à formaliser le tacite
Le professionnel décrit oralement *"comment on fait l'accueil ici"*, l'IA en fait un protocole écrit structuré. Le savoir tacite devient explicite sans effort de rédaction.

> Niveau 2 (tacite) → Niveau 6 (structuré) en une conversation.

### L'IA détecte l'obsolescence
En croisant un document avec la réglementation à jour, l'IA repère ce qui est périmé.
> *"Ce protocole référence une obligation abrogée en 2024."*

### La documentation structurée nourrit l'IA
Plus la connaissance du cabinet est structurée, plus l'IA peut s'en servir :
- Rédiger des courriers cohérents avec les protocoles du cabinet
- Répondre aux questions selon les procédures établies
- Assister les remplaçants avec le "comment on fait ici"

### Le cercle vertueux
```
L'IA aide à structurer la documentation
            ↓
La documentation structurée nourrit l'IA
            ↓
L'IA devient plus utile et plus fidèle au cabinet
            ↓
Le professionnel structure davantage
            ↓
(la boucle se renforce)
```

---

## Partie 8 — Les bénéfices pour le professionnel

| Bénéfice | Description |
|---|---|
| Continuité | Un remplaçant ou repreneur s'y retrouve — le cabinet ne dépend plus d'une mémoire |
| Sérénité | Le savoir du cabinet est sécurisé, pas dans des têtes qui peuvent partir |
| Efficacité | Ne plus chercher "le bon modèle", ne plus refaire ce qui existe |
| Transmission | Un cabinet documenté se transmet et se valorise infiniment mieux |
| Conformité | Beaucoup d'obligations sont documentaires — bien structurer, c'est être conforme |
| Résilience | Les savoirs critiques ne dépendent plus d'une seule personne |

---

## Partie 9 — Les chantiers documentaires types

### Chantier "Formaliser le tacite"
Identifier les savoirs critiques non écrits, les transformer en documents structurés via dialogue IA. Priorité aux savoirs détenus par une seule personne.

### Chantier "Centraliser le dispersé"
Recenser les documents éparpillés, les regrouper dans une structure claire et accessible.

### Chantier "Actualiser l'obsolète"
Repérer les documents périmés (croisement avec la réglementation), les mettre à jour.

### Chantier "Attribuer les propriétaires"
Pour chaque document critique, définir qui est responsable de le maintenir à jour.

### Chantier "Combler les manques"
Identifier les documents nécessaires absents (par comparaison avec des cabinets similaires), les créer.

### Chantier "Préparer la transmission"
Constituer le corpus documentaire complet nécessaire à une cession ou un remplacement long.

---

## Partie 10 — Le suivi d'avancement, en pratique

### Ce que le professionnel voit

**Un score de maturité documentaire global**
> *"Votre connaissance documentaire est structurée à 58%. 3 savoirs critiques restent tacites."*

**Un suivi fin par document**
Chaque document avec son niveau (0-6), son état, sa criticité, son propriétaire.

**Une progression motivante**
> *"Vous avez formalisé 4 protocoles ce trimestre. Votre savoir d'accueil patient est désormais transmissible."*

**Une priorisation claire**
Les documents critiques non structurés mis en avant, avec le chantier associé.

### Ce qui reste invisible
- La mécanique de calcul des niveaux
- L'échelle technique 0-6 (présentée en langage clair)
- Les détails d'implémentation

Le professionnel voit une connaissance qui se structure, pas un système de gestion documentaire complexe.

---

## Synthèse

```
LA DIMENSION DOCUMENTAIRE
│
├── Une sous-composante de l'INFORMATION (le savoir, pas les données)
│
├── Chaque document = un objet avec un état de structuration fin
│   Échelle de maturité 0 à 6 (inexistant → structuré et maintenu)
│
├── Un suivi d'avancement multi-vues
│   par catégorie · par niveau · par criticité · carte · évolution
│
├── Intégrée au jumeau via une LENTILLE "Documentation"
│   + objets documentaires rattachés aux composantes
│   + chantiers de structuration dédiés
│   + détection des fragilités (savoir tacite critique)
│
├── En SYNERGIE avec l'IA (cercle vertueux)
│   l'IA formalise le tacite ↔ la doc structurée nourrit l'IA
│
└── Bénéfice central : transformer le savoir du cabinet
    d'un actif fragile et dispersé
    en un patrimoine structuré, maintenu et transmissible
```

> **La connaissance documentaire n'est pas un module annexe — c'est ce qui rend le cabinet résilient, transmissible et conforme. Lugia & Co en fait un avancement mesurable et accompagné.**

---

*Spécification de la dimension documentaire — Lugia & Co — Mai 2026*
*À lire avec la spécification du jumeau numérique et du moteur WSF*
