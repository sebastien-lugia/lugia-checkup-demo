# meta/

Ce dossier contient les "outils méta" du projet Lugia.

## Prompt d'ouverture

`PROMPT_OUVERTURE.md` est le prompt à utiliser au démarrage de toute nouvelle conversation Claude sur ce projet, quel que soit le sujet (démonstrateur technique, communication, marché, opérationnel). Tu le copies-colles tel quel comme premier message en remplaçant la dernière ligne par ta question ou ton objectif et en précisant le track si applicable.

Le prompt instruit Claude à lire les fichiers de cadrage du projet avant de répondre, ce qui garantit la cohérence transversale entre toutes les conversations sans avoir à re-briefer.

## Architecture des fichiers de mémoire transversale

Les fichiers `.md` à la racine du repo portent la mémoire du projet, partagée entre toutes les conversations Claude :

| Fichier | Rôle |
|---|---|
| `MASTER_PROMPT.md` | Cadre méta global, vision, positionnement |
| `DECISIONS.md` | Décisions structurantes journalisées |
| `ROADMAP.md` | Trajectoire produit, chantiers identifiés |
| `CHANGELOG.md` | Historique des modifications structurantes |
| `TODO.md` | Carnet de bord court-terme |

Tout ce qui doit survivre à une conversation Claude doit être consolidé dans ces fichiers avant de fermer la conversation.

Cf. `DECISIONS.md` D-019 pour la formalisation de l'organisation multi-tracks et multi-conversations.
