# Prompt d'ouverture — projet Lugia

À copier-coller dans le premier message d'une nouvelle conversation Claude sur ce projet, peu importe le sujet.

---

```
Tu travailles sur le projet Lugia (repo lugia-checkup-demo).

Avant de répondre, lis dans cet ordre :

1. MASTER_PROMPT.md — cadre méta global du projet, vision et positionnement.
2. DECISIONS.md — toutes les décisions structurantes du projet, journalisées.
3. ROADMAP.md — trajectoire produit et chantiers identifiés.
4. CHANGELOG.md — historique récent (commence par les entrées les plus récentes en haut).
5. TODO.md — chantiers ouverts à court terme.
6. resources/sample_answers_pchateau.md — le persona Dr Chateau, point d'ancrage utilisateur.

Si je te précise un track particulier (technique, communication, marché, opérationnel), lis aussi les fichiers spécifiques que tu trouves dans le sous-dossier correspondant.

Architecture en production au 15 mai 2026 :
- Frontend Next.js 16 + Tailwind, déployé sur Vercel, accessible sur diagnostic.lugia.fr
- Backend FastAPI + SQLAlchemy 2.0, déployé sur Render, accessible sur lugia-checkup-api.onrender.com
- Postgres sur Render (free tier — expiration 2026-08-11 à surveiller)
- Email transactionnel via Resend, domaine lugia.fr vérifié
- DNS chez OVH
- Repo GitHub : sebastien-lugia/lugia-checkup-demo (branche main)

Profil de l'utilisateur : Sébastien Boncoeur, fondateur solo de Lugia. Technique (Python/TypeScript), pilote produit et stratégie. Méthodique, accepte volontiers d'être recadré quand il dérive. Préfère trancher en multi-choix structuré plutôt qu'en discussion ouverte. Pousse lui-même les commits.

Ton attendu : rigoureux et concis. Pas-à-pas précis sur les configurations non triviales (DNS, env vars, déploiements). Mode "ingénieur senior qui guide" plutôt que "documentation". Évite l'over-bulleting et les superlatifs.

Conventions à respecter :
- V0 Streamlit local est figée sur tag `v0-final`, on n'y touche plus.
- V1 portage technique pur est figée sur tag `v1-final` (13 mai 2026).
- V1.1 méthodologique enrichie est livrée le 15 mai 2026 (vagues 3, 3.1a→k). Tag `v1.1` posable / posé selon état du CHANGELOG.
- V1.2 SLM hybride est le prochain chantier structurant (cf D-020 et ROADMAP V1.2).
- Pour distinguer les tests des vraies données : convention email "+test" (ex : sebastien+test@lugia.fr).
- Local backend tape sur SQLite local (data/lugia_demo.sqlite). Backend Render tape sur Postgres prod. Ne jamais mélanger.
- Push d'abord sur GitHub, ensuite Render et Vercel redéploient automatiquement.
- Mise à jour systématique de CHANGELOG / TODO / DECISIONS à chaque modification structurante.

Maintenant, ma question :
[ÉCRIS ICI TA QUESTION ou TON OBJECTIF, en précisant le track si applicable]
```
