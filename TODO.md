# TODO

Tâches restantes, bugs et points à valider. Tient lieu de carnet de bord court-terme. Les tâches accomplies sont remontées dans `CHANGELOG.md`.

---

## V1 figée (à tagger v1-final quand prêt)

Toutes les phases V0 et V1 sont closes :

- **V0** (12-13 mai 2026) — démonstrateur Streamlit local, figé sur `v0-final`.
- **V1-0 à V1-8** (13 mai 2026) — portage technique complet sur le web + RGPD minimal.

Le check-up est accessible en production sur `https://diagnostic.lugia.fr`.

Tag à poser quand tu veux figer cette version pré-retours :

```bash
cd /Users/sebastien/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
git pull
git tag -a v1-final -m "V1 complète — version validée le 13/05/2026 avant retours clients externes"
git push origin v1-final
```

---

## V1.1 EN COURS — itération sur retours premiers prospects (mai 2026)

Premier backlog reçu de Sébastien le 14 mai 2026 (PDF complet, 40+ retours répartis sur en-tête, login, accueil, questionnaire, résultats, prochaine étape). Cadre stratégique acté en D-020 : méthodologique enrichi comme socle V1.1, SLM en surcouche V1.2.

Découpage en 3 vagues, traitables en parallèle :

### Vague 1 — Quick wins éditoriaux et UX (1-2 jours, autonomie utilisateur)

À exécuter directement côté Sébastien (Next.js/Tailwind, wording principalement). Liste exhaustive dans le dernier message Claude de la session du 14 mai.

### Vague 2 — Méthodologique enrichi 50+ variantes (3-5 jours, session collab)

Refonte `src/templates.py` et `src/workstreams.py`. Sessions à prévoir :

- Session de vulgarisation WSF (lecture commune des templates actuels, dictionnaire jargon → langage métier-médecin).
- Conception des 5+ patterns de phrase choc révélatrice.
- Intégration Q14 dans la synthèse (option A).
- Refonte structure chantier en 5 sections.
- Suppression des citations nominatives d'outils tiers (généralisation).
- Refonte de l'encart Participants (cas médecin libéral solo).
- Rendre les phrases sous chaque facette analytiques au lieu de redites.

### Vague 3 — Refonte du questionnaire (4-7 jours, session collab)

Revue question par question. Sessions à prévoir :

- Q2 (secrétariat) : ajouter clairement le cas solo.
- Q3 : passer en multi-choix.
- Q4 : retirer doublon texte libre / choix.
- Q5 : reformuler pour clarifier objectif.
- Q6 (motivation) : passer en QCM.
- Q8 : adoucir.
- Q9 (présence) : reformuler en factuel.
- Q11 : retirer doublon texte/QCM.
- Application des règles globales : 4 options + autre, factualité, mise en scène réelle, percutance.
- Format Autre éditable inline (UX inspirée Claude).
- Mise à jour `resources/interview_protocol.json` + mapping `node_type`/`health_score`.

### Critère de fin V1.1

Une session de test avec Sébastien jouant le persona Chateau refondu produit un rapport perçu comme "analyse" et non "redite". Tag `v1.1` posable après cette validation. v1-final sera posé en amont pour figer l'état pré-retours.

---

## V1.2 PRÉVUE après V1.1 — intégration SLM hybride

Cadrée en D-020. Architecture orchestration LLM avec fallback méthodologique systématique.

À préparer avant d'attaquer :

- Choix du provider API cloud pour prod (Anthropic Haiku par défaut).
- Test exploratoire Ollama en local sur MacBook Pro pour valider la qualité des prompts.
- Conception du module `src/llm.py` ou intégration directe dans `templates.py` avec branchement conditionnel.

---

## Tracks parallèles (cf. D-019)

Chaque track est traité dans sa propre conversation Claude, avec le prompt d'ouverture `meta/PROMPT_OUVERTURE.md`.

- **Démonstrateur technique** — cette conversation (V1.1, V1.2, V1.5, V2).
- **Communication** — identité visuelle, page `/qui-est-lugia` (rédactionnel), site marketing `lugia.fr`, slides.
- **Marché et clients** — V1-7 préparation (prospect Chateau identifié côté Sébastien), fiches prospects, étude de marché.
- **Opérationnel** — méthode, scoring avancé, templates de livrables clients.

---

## Vigilance opérationnelle continue

- **Postgres Render free tier** — expiration le **11 août 2026**. Bascule à prévoir avant cette date : plan Starter (~7$/mois) ou recréation + migration.
- **DPA à signer** côté Vercel, Render, Resend — gratuit, ~15 min par fournisseur, à régulariser avant tout contrat commercial.
- **Relecture juridique RGPD** — recommandée (200-500€) avant signature premier client payant.

---

## Outils de dev disponibles

```bash
python scripts/seed_persona.py            # ajoute une session pré-remplie (Chateau)
python scripts/seed_persona.py --reset    # supprime toutes les sessions puis seed
python scripts/dump_report.py --list      # liste les interviews en base locale
python scripts/dump_report.py --id <N>    # dump le rapport d'une interview
```

Convention `+test` pour distinguer tests prospects de vraies données en prod.
