# Brief de démarrage — Conversation « Lugia · Business plan »

> À coller comme **premier message** d'une nouvelle conversation, dans le même dossier projet `lugia-checkup-demo` (pour partager mémoire, fichiers et instructions).

---

Tu vas m'aider à construire un **business plan** pour Lugia. Lis le contexte ci-dessous, puis pose-moi les questions de cadrage à la fin — n'écris pas le business plan tout de suite.

## Contexte produit (rappel)

**Lugia** est un check-up préventif de l'**organisation** d'un cabinet médical : il analyse le *système de travail* (quotidien, outils, points de friction), jamais la pratique médicale ni les individus, sans données patient identifiables. Ton clair, humain, préventif, anti-consulting.

Architecture en 2 niveaux :
- **Lugia Checkup Demo** (gratuit) — questionnaire + résultats (cartographie 3 axes) + chantiers + schéma du système de travail + assistant (LLM cloud ou SLM local navigateur, coût d'inférence quasi nul côté serveur). Aimant + qualification de leads (un formulaire « être recontacté » est déjà en place).
- **Lugia Work System** (payant, à construire) — 9 axes WSF, schémas détaillés + bibliothèque de lentilles, livrables réglementaires (registre RGPD, notice AI Act…), assistant multi-chantiers persistant, tokenisation/souveraineté des données. Moteur WSF générique réutilisable sur d'autres verticales (Doctor / Lawyer / Finance).

Cible cœur : **médecins généralistes libéraux en France** (solo, groupe, MSP), avec un potentiel B2B2B (URPS, ARS, assureurs RCP, OEM).

Éléments déjà cadrés à **lire dans le repo avant de démarrer** : `resources/vision/medvault_benefices_strategie_commerciale.md` (paliers de prix évoqués ~49 €/149 €, canaux B2C/MSP/assureurs/URPS/OEM, métriques), `lugia_co_doctor_specification.md` (feuille de route, enjeux réglementaires), `ROADMAP.md` (chantiers Work System WS.1→WS.7), `DECISIONS.md`. La stack actuelle : Next.js (Vercel) + FastAPI/SQLAlchemy (Render) + LLM cloud (Claude Haiku) et SLM navigateur (WebLLM/qwen) ; emails via Resend.

## Objectif de cette conversation

Produire un business plan structuré et chiffré. Il **dépend de l'étude de marché** (conversation séparée) : si elle est faite, on en reprend les chiffres ; sinon on pose des hypothèses explicites à affiner. Périmètre à couvrir (à valider avec moi) :

1. **Résumé exécutif** — la thèse en une page.
2. **Problème & proposition de valeur** — pourquoi maintenant, pour qui, quel gain concret.
3. **Modèle économique** — freemium (Demo gratuit → Work System payant), paliers de prix, éventuelles missions de conseil, et pistes B2B2B (licences URPS/assureurs, OEM).
4. **Go-to-market** — séquençage des canaux (direct, MSP/CPTS, URPS/ARS, assureurs, OEM), boucle d'acquisition (le check-up gratuit comme aimant).
5. **Structure de coûts** — infra (Vercel/Render), coûts LLM (et l'intérêt du SLM local pour les écraser), développement, conformité, commercial.
6. **Unit economics** — CAC, LTV, taux de conversion gratuit → payant, churn, marge.
7. **Projections financières** — 3 ans (P&L simplifié, hypothèses de volume et de prix, point mort).
8. **Besoins de financement** — bootstrap vs levée, et à quoi sert l'argent le cas échéant.
9. **Équipe & jalons** — qui, quelles étapes clés (dont les tests prospects en cours, puis WS.1+).
10. **Risques & mitigations** — adoption, réglementaire (AI Act/RGPD), dépendance LLM, concurrence des éditeurs.
11. **KPIs** — les 5-6 indicateurs à suivre.

## Méthode attendue

- Hypothèses **explicites et chiffrées**, séparées des faits ; signale ce qui vient de l'étude de marché vs ce qui est supposé.
- Reste **réaliste et prudent** sur les revenus (pas de hockey stick gratuit).
- Cohérent avec le positionnement (souveraineté des données, préventif, anti-consulting) et les garde-fous du projet.

## Avant de commencer — pose-moi ces questions

1. L'étude de marché est-elle déjà faite ? Si oui, je m'appuie dessus ; sinon, je pars d'hypothèses à valider.
2. Objectif du business plan : **pilotage interne**, **levée de fonds**, ou **dossier bancaire / subvention** ? (Ça change le niveau de détail et le ton.)
3. Horizon : 3 ans suffisent, ou tu veux 5 ans ?
4. Bootstrap ou levée envisagée ? Si levée, quel ordre de grandeur ?
5. As-tu déjà des chiffres réels (coûts actuels, premiers prix testés, premiers utilisateurs) à intégrer ?
6. Format de livrable final : Word, PDF, slides, ou markdown dans le repo ?

Une fois tes réponses obtenues, propose-moi un plan chiffré avant de rédiger.
