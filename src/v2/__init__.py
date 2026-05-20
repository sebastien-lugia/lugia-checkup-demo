"""Modules backend du parcours V2.0 du check-up Lugia.

Architecture déterministe (cf D-029 + D-030) : aucun SLM dans le scope V2.0.
Les 13 règles de personnalisation et les 6 signaux croisés sont des fonctions
Python pures, testables unitairement, auditables.

Modules :
- `questions` : chargement protocole V2 + résolution routing solo b1b/b3
- `scoring`   : % par bloc + niveau qualitatif Lugia
- `signals`   : 6 signaux croisés inter-axes en cascade priorisée
- `personalize` : 13 règles déterministes (tonalité, priorisation, benchmarks)
- `modules`   : 7 modules d'approfondissement statiques

Le dispatcher backend (`backend/main.py`) lit `interview.protocol_version` et
route soit vers les modules `src/*` (V1.1.x figés) soit vers `src/v2/*`.
"""

__version__ = "2.0.0"
