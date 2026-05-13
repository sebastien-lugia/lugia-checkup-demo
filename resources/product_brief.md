# Product Brief — Lugia Check-up Demo

> Brief produit du démonstrateur Lugia Check-up. Définit l'objectif, le public cible, la promesse, le périmètre, les bénéfices et les limites.
>
> Version 1.0 — 12 mai 2026.

---

## Objectif du démonstrateur

Le démonstrateur Lugia Check-up est un produit logiciel local qui permet à un médecin généraliste de réaliser, en moins de 30 minutes, un premier état des lieux structuré de son cabinet. Il transforme les réponses du médecin à un questionnaire guidé en une lecture organisée de son système de travail : ce qui fonctionne, ce qui fatigue, ce qui dépend de l'informel, et les premiers chantiers à engager.

Le démonstrateur a deux fonctions complémentaires :

1. **Démontrer la valeur de Lugia** auprès de médecins qui ne connaissent pas encore l'approche.
2. **Préparer une éventuelle prestation Lugia** (diagnostic terrain, accompagnement organisationnel) pour les médecins intéressés.

Le démonstrateur n'est ni un produit commercial fini, ni un outil de diagnostic clinique. C'est une porte d'entrée.

---

## Public cible

### Cible principale

**Médecin généraliste libéral** exerçant en cabinet de **1 à 5 médecins**, avec ou sans secrétariat (interne ou externalisé).

Profil typique : 40-60 ans, en charge clinique élevée, surchargé par la dimension administrative et organisationnelle de son activité, conscient que son fonctionnement pourrait être plus clair sans savoir par quel bout commencer.

### Hors cible

- Médecins exerçant uniquement à l'hôpital ou en clinique salariée.
- MSP de grande taille (au-delà de 5 médecins) — reportée en V1+.
- Autres professions médicales (spécialiste, dentiste, kinésithérapeute, infirmier libéral, sage-femme) — reportée en V1+.

### Persona de référence pour les tests V0

Voir `resources/persona_medecin_pchateau.md`. Le Dr Philippe Chateau (55 ans, médecin libéral solo à Saint-Mandé, ancien marathonien, en charge familiale lourde suite à la maladie de sa femme) est le persona unique pour les tests locaux de la V0.

---

## Promesse

> **En moins de 30 minutes, Lugia aide un médecin à répondre à la question : où en est réellement mon cabinet aujourd'hui ?**

Cette promesse est la formulation de référence. Elle doit apparaître sur la page d'accueil du démonstrateur et structurer la communication autour du produit.

Le démonstrateur fait trois choses :

1. **Mettre en mots** le fonctionnement réel du cabinet.
2. **Rendre visible** l'état actuel du système de travail.
3. **Proposer une feuille de route** cohérente et priorisée.

---

## Périmètre V0

Voir `MASTER_PROMPT.md` section 5 pour le détail. En résumé :

- Trois facettes WSF prioritaires : **Processus & Activités**, **Participants**, **Information**.
- Scoring simple à **un score sur 10 par facette**.
- **Trois chantiers prédéfinis** instanciés selon les réponses.
- Une page de résultats avec scores, résumés qualitatifs, chantiers et formulation de synthèse.
- Pas d'extraction de nœuds (nœuds candidats pré-écrits dans les QCM).
- Une seule visualisation (facettes en cartes), pas de Mermaid en V0.

---

## Bénéfices apportés par le check-up

### Bénéfice immédiat

Une première vision claire du système de travail dès la fin du check-up. Le médecin sort avec une carte mentale plus structurée de son cabinet : zones solides, zones fragiles, signaux faibles, premières priorités.

### Bénéfice psychologique

Une vision qui donne de la lisibilité à un professionnel surchargé. Le résultat doit donner de la clarté, jamais de la culpabilité. Le médecin doit pouvoir se dire : *"je comprends mieux pourquoi certaines choses me fatiguent"* ou *"ce n'est pas seulement moi ou mon équipe, c'est le système qui mérite d'être clarifié"*.

### Bénéfice opérationnel

Une vision des premières actions à mener. Le check-up propose quelques chantiers concrets, sans prétendre résoudre tout le problème : clarifier un flux, documenter une règle, réduire un canal de demande, identifier une dépendance, préparer une observation terrain, prioriser un chantier.

---

## Limites explicites

Le démonstrateur ne fait pas :

- **Pas de diagnostic médical** — il porte sur l'organisation, pas sur la qualité clinique des soins.
- **Pas de notation des personnes** — les scores portent sur le système de travail, jamais sur les individus.
- **Pas de stockage de données patient identifiables** — aucune donnée nominative ne doit être saisie.
- **Pas un diagnostic terrain complet** — le check-up est une première lecture déclarative, à partir des réponses du médecin. Un diagnostic Lugia complet nécessite une observation directe.
- **Pas un audit de conformité réglementaire** — il signale des zones à approfondir, il ne certifie pas.

Ces limites doivent être rappelées dans le démonstrateur lui-même : page d'accueil, mentions discrètes durant le questionnaire, page de résultats.

---

## Différenciation Lugia

Lugia se positionne comme la **substitution** d'un usage existant — celui de l'IA générative grand public utilisée par nécessité par les médecins, avec un goût de transgression et une culpabilité latente — par une interface sécurisée, conforme au secret médical. Le check-up est la porte d'entrée. L'interface se prolonge en hub d'organisation. **Pas un outil de plus, un remplacement-extension.**

Voir `DECISIONS.md` D-001 et `MASTER_PROMPT.md` section 3 pour le détail.

---

*Version 1.0. Toute modification structurante de ce brief doit être journalisée dans `DECISIONS.md`.*
