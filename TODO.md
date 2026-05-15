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

### Vague 3 — Refonte du questionnaire — LIVRÉE 2026-05-15

Travail journalisé dans `CHANGELOG.md` (2026-05-15) et `DECISIONS.md` D-021.

- ✅ Règles globales V1.1 inscrites dans `interview_protocol.md` section 1 (4 options + Autre, factualité, exclusivité, mise en scène, mode B/C parcimonieux).
- ✅ Q02 — cas solo explicite ("Moi-même (pas de secrétariat dédié)").
- ✅ Q03 — 4 options exclusives (réécriture, pas de multi-sélection).
- ✅ Q04 — passage Mode B → Mode A (doublon supprimé).
- ✅ Q05 — open_prompt refondu sur "hier soir / ce week-end", QCM mis en scène à 19h.
- ✅ Q06 — passage Mode C → Mode A (4 typologies de motivation).
- ✅ Q08 — reformulation factuelle non anxiogène, libellé q08_d adouci.
- ✅ Q09 — axe factuel "nombre d'outils + double saisie", paliers chiffrés, marques supprimées.
- ✅ Q11 — passage Mode B → Mode A, options exclusives.
- ✅ Format Autre éditable inline : déjà livré Vague 1 dans `CheckupWidgets.tsx`.
- ✅ Oracle Chateau aligné V1.1 (`sample_answers_pchateau.md` v2.0, `scripts/seed_persona.py`).
- ✅ Adaptation `src/templates.py` (phrases Q08_d et Q11_d réécrites pour matcher la nouvelle sémantique).
- ✅ Vérifications : cohérence JSON/MD, scores Chateau conformes (3,33 / 3,33 / 2,75), aucun ID hardcodé orphelin.

### Validation utilisateur attendue avant tag `v1.1`

1. Test local : `python scripts/seed_persona.py --email sebastien+test@gmail.com --reset` puis `python scripts/dump_report.py --list` et relecture du sample_report généré.
2. Test parcours : `npm run dev` → vérifier Q06 en QCM, Q04/Q11 en QCM pur, Autre inline partout, scores corrects sur la page de résultats.
3. Push GitHub → redéploiement automatique Render et Vercel → test à distance sur diagnostic.lugia.fr.
4. Si le rapport est perçu comme "analyse" et non "redite", tag `v1.1` posable.

### Critère de fin V1.1

Une session de test avec Sébastien jouant le persona Chateau refondu produit un rapport perçu comme "analyse" et non "redite". Tag `v1.1` posable après cette validation. v1-final reste à poser en amont pour figer l'état pré-retours.

### Session dédiée à venir — combler le gap axe 2 (imprévus) et l'axe 1 (interdépendances)

Audit du parcours V1.1 Vague 3.1f vs les 4 axes Lugia (cf `MASTER_PROMPT.md` section 2) : le questionnaire est fidèle aux axes 1, 3, 4 mais a un gap clair sur l'axe 2 (imprévus et surcharges ponctuelles) et l'axe 1 (interdépendances rarement explicitées). À traiter dans une conversation Claude dédiée :

- **Q08 enrichie** : capter les deux dimensions (congés planifiés ET absence imprévue) dans le même QCM, ou la dédoubler en Q08a/Q08b. Le complément libre de Chateau le révèle déjà ("Une semaine d'arrêt non planifié, je ne sais pas comment je gérerais") — le QCM doit le sonder.
- **Chaîne causale nommée en synthèse** : `build_phrase_choc` ou `build_synthesis` doit pouvoir produire une formulation type "Votre débordement administratif (Q05) trouve sa source dans des canaux non régulés (Q04) et un cadre non formalisé (Q03)" au lieu de juxtaposer deux symptômes. Plus disruptif, plus fidèle à l'axe 1.

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
# Seed persona Chateau pour ton email, idéal pour itérer sur le rapport
python scripts/seed_persona.py --email sebastien+test@gmail.com --reset

# Idem mais contre Postgres prod
DATABASE_URL='postgresql://...' python scripts/seed_persona.py --email sebastien+test@gmail.com --reset

# Dump du rapport généré pour comparer deux versions sans navigateur
python scripts/dump_report.py --list
python scripts/dump_report.py --id <N>
```

Documentation complète d'usage : `docs/seed_persona_usage.md`.

Convention `+test` pour distinguer tests prospects de vraies données en prod.
