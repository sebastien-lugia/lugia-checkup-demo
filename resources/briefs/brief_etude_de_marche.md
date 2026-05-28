# Brief de démarrage — Conversation « Lugia · Étude de marché »

> À coller comme **premier message** d'une nouvelle conversation, dans le même dossier projet `lugia-checkup-demo` (pour partager mémoire, fichiers et instructions).

---

Tu vas m'aider à construire une **étude de marché** pour Lugia. Avant de te lancer, lis le contexte ci-dessous, puis pose-moi les questions de cadrage à la fin — n'écris pas l'étude tout de suite.

## Contexte produit (rappel)

**Lugia** est un check-up préventif de l'**organisation** d'un cabinet médical — il analyse le *système de travail* (le quotidien, les outils, ce qui coince), jamais la pratique médicale ni les individus, et ne manipule aucune donnée patient identifiable. Positionnement : clair, humain, préventif, non culpabilisant, anti-jargon de consulting.

Architecture produit en 2 niveaux :
- **Lugia Checkup Demo** (gratuit) — questionnaire + page de résultats (cartographie en 3 axes), chantiers prioritaires avec plan d'action, schéma du système de travail, et une discussion assistant (LLM cloud ou SLM local navigateur). Sert d'aimant et de qualification.
- **Lugia Work System** (payant, à construire) — extension : 9 axes du Work System Framework (Steven Alter), schémas détaillés + bibliothèque de lentilles, livrables réglementaires (registre RGPD, notice AI Act…), assistant multi-chantiers persistant, usage sécurisé avec tokenisation (souveraineté des données). Cible aussi des verticales au-delà du médical (Doctor / Lawyer / Finance) via un moteur WSF générique.

Cible cœur : **médecins généralistes libéraux en France** (solo, cabinet de groupe, MSP). Le produit a aussi une dimension B2B2B potentielle (URPS, ARS, assureurs RCP, OEM logiciels).

Des documents de vision et de stratégie commerciale existent déjà dans le repo — **lis-les avant de démarrer** : `resources/vision/` (notamment `medvault_benefices_strategie_commerciale.md` pour les paliers de prix et canaux, `lugia_co_doctor_specification.md`, `lugia_nouveaux_benefices_ameliorations.md`), ainsi que `ROADMAP.md` et `DECISIONS.md`. La mémoire du projet contient aussi du contexte.

## Objectif de cette conversation

Produire une étude de marché structurée, sourcée et actionnable, qui servira ensuite d'intrant au business plan (conversation séparée). Périmètre à couvrir (à valider/ajuster avec moi) :

1. **Taille de marché** — TAM / SAM / SOM. Nombre de médecins généralistes libéraux en France, de cabinets de groupe et de MSP, dynamique démographique (départs à la retraite, déserts médicaux).
2. **Segments & personas** — solo vs groupe vs MSP ; installés vs remplaçants vs jeunes installés ; leurs douleurs organisationnelles, leur rapport au numérique et au conseil.
3. **Besoins & douleurs** — charge administrative, temps médical, coordination d'équipe, conformité, outils. Ce pour quoi ils paieraient (willingness-to-pay).
4. **Concurrence & alternatives** — logiciels métier (Doctolib, Cegedim, Weda, etc.), conseil en organisation de cabinet, outils de diagnostic / IA santé, et le statu quo (« ne rien faire »). Positionnement différenciant de Lugia.
5. **Vents porteurs réglementaires & marché** — AI Act (échéances 2026), RGPD/HDS, certification, financements (URPS, ARS, CPTS), tension sur le temps médical.
6. **Canaux de distribution** — direct B2C, MSP/CPTS, URPS/ARS, assureurs RCP, OEM. Lesquels sont les plus crédibles pour démarrer.
7. **Tendances** — IA en santé, souveraineté des données, exercice coordonné, prévention.

## Méthode attendue

- **Recherche web à jour** (chiffres datés, sources citées) — le marché FR évolue, vérifie plutôt que d'estimer de mémoire.
- Distingue clairement **faits sourcés** vs **hypothèses** (et marque les hypothèses comme telles).
- Reste **factuel et nuancé** sur la concurrence ; pas de survente.
- Concentre-toi sur la **France** sauf si je dis le contraire.

## Avant de commencer — pose-moi ces questions

1. Périmètre géographique : France seulement, ou aussi ambition internationale à terme ?
2. On priorise quel angle pour cette première étude : le **B2C médecins** (cœur), ou aussi le **B2B2B** (URPS/assureurs/OEM) ?
3. Niveau de profondeur attendu : note de synthèse (5-8 pages) ou étude détaillée ?
4. Format de livrable final : document Word, PDF, ou markdown dans le repo ?
5. Y a-t-il des chiffres / contacts / retours terrain que tu as déjà et que je dois intégrer ?

Une fois que j'ai tes réponses, propose-moi un plan de l'étude avant de la rédiger.
