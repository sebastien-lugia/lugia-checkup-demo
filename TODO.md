# TODO

Tâches restantes, bugs et points à valider, ordonnés par priorité de prise en charge.

---

## Phases validées

- **V0-1 à V0-5** — 12-13 mai 2026. V0 figée sur tag `v0-final`.
- **V1-0** — Tag git `v0-final`, MASTER_PROMPT v3.0, D-017, ROADMAP restructuré.
- **V1-1** — Infra déployée. `diagnostic.lugia.fr` accessible avec page placeholder. Comptes Vercel, Render, Resend opérationnels.
- **V1-2a / V1-2b** — Backend FastAPI minimal, déployé sur Render `https://lugia-checkup-api.onrender.com`.
- **V1-3a / V1-3b** — Refactor SQLAlchemy, Postgres provisionné, persistance prouvée entre deux cold starts.
- **V1-4a / V1-4b / V1-4b iter 2 / V1-4c** — Frontend Next.js complet (accueil → check-up → résultats), reprise depuis l'accueil.
- **V1-5a** — Backend auth lien magique opérationnel en local. Les 8 vérifications passées. Mode console suffisant tant que Resend n'est pas configuré.
- **V1-5b** — Envoi réel d'email via Resend. Domaine `lugia.fr` vérifié, DNS OVH posés, env vars Render configurées, code V1-5a poussé sur GitHub, test bout en bout réussi (email reçu et bien rendu).
- **V1-5c** — Frontend auth livré et validé. Pages `/login` et `/auth`, `web/lib/auth.ts`, propagation Bearer, guard `useRequireAuth` sur les 3 pages protégées, header avec email + déconnexion.
- **V1-6** — Déploiement frontend Vercel validé. `diagnostic.lugia.fr` sert le vrai frontend Next.js. Parcours bout en bout en prod réussi. Fix peer dep eslint ^9 commité dans le passage.

## V1 complète

Tag git `v1-final` à poser pour figer la version :

```bash
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
git pull
git tag -a v1-final -m "V1 complète — check-up en ligne sur diagnostic.lugia.fr"
git push origin v1-final
```

## Prochaine phase — V1-7 : premier test client en condition réelle

Trouver un médecin généraliste prospect, lui faire passer le check-up à distance via `diagnostic.lugia.fr`, observer ce qui se passe sans intervenir. Points à observer :

- Compréhension de la promesse à l'arrivée (login).
- Friction sur l'email + lien magique (latence Resend, spams, certaines boîtes mail médicales filtrent agressivement).
- Lecture des questions : ambiguïtés, hésitations, abandons partiels.
- Pertinence ressentie du rapport (synthèse, scores, chantiers, prochaine étape).
- Réaction à la recommandation "Échanger avec Lugia" en fin de rapport.

À préparer avant le test :

1. Choisir le prospect (Dr Chateau Saint-Mandé déjà identifié ? autre piste plus accessible ?).
2. Email d'invitation, créneau, durée prévisionnelle (~30 min).
3. Mode : à distance pur (pas d'observation directe) ou en visio avec partage d'écran (plus instrumenté, mais change l'expérience).
4. Grille de debriefing post-test : compréhension, friction, surprises, attentes vis-à-vis de Lugia.
5. Critère de succès à clarifier — probablement : parcours complet sans abandon, rapport produit, réaction comprise.

---

## Outils de dev disponibles

```bash
python scripts/seed_persona.py            # ajoute une session pré-remplie
python scripts/seed_persona.py --reset    # supprime toutes les sessions puis seed
python scripts/dump_report.py --list      # liste les interviews
python scripts/dump_report.py --id <N>    # dump le rapport d'une interview
```

---

## Points à valider plus tard (V1.5 / V2)

- Format final du rapport PDF, choix outil d'export (WeasyPrint, ReportLab).
- Pyramide animée (V1.5).
- Section "Vos mots" enrichie (V1.5).
- Auth permanente avec compte + mot de passe (V2).
- Conformité RGPD complète (V2).
- Pricing et facturation (V2).

---

*À nettoyer à chaque fin de phase. Les tâches accomplies sont remontées dans `CHANGELOG.md`.*
