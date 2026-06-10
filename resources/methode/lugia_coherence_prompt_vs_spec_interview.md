# Lugia — Point de cohérence : prompt prod ↔ spec d'interview

**Date** 2026-06-09 · **objet** confronter le prompt de conduite d'interview en prod
(`src/chat_assistant.py`) au spec documenté (`lugia_coaching_dialog_spec.md`, et
`generique/lugia_interview_protocol_generique.md`) et noter les écarts.

## Ce qui est aligné ✓

- **Pilotage par phases selon le numéro de tour** : les deux structurent en 4 phases.
- **Une seule question par échange** (spec §3 / prompt « REGLES ABSOLUES »).
- **Posture** : ton confrère/terrain, bienveillant, vouvoiement, pas de jargon consulting,
  pas de morale ni de dramatisation. Identique des deux côtés.
- **Garde-fous** : aucun conseil médical/clinique, aucune donnée patient identifiable. Le prompt
  est même plus explicite que le spec sur ce point.
- **Synthèse finale avec schéma WSF** (plan + schéma + clôture).
- **Démarrage** : reçoit profil + scores du check-up + chantier choisi.

## Écarts notés ⚠

| # | Spec documenté | Prompt prod | Nature |
|---|---|---|---|
| 1 | **20 échanges** max | **10 échanges** (`MAX_USER_MESSAGES`/`SYNTHESE_TOUR`=10) | **Décidé** (10 acté 2026-06-09) → **le spec est périmé**, à mettre à jour |
| 2 | 4 phases **Ancrage / Exploration / Révélation / Projection** | 4 phases **ouverture / exploration / pré-synthèse / synthèse** | Drift de modèle — voir 3 & 4 |
| 3 | **Extraction silencieuse à CHAQUE échange** + la carte de capacité **se remplit en direct** (cœur de la promesse : « le médecin voit son organisation se dessiner ») | **Aucune extraction progressive** : le graphe WSF n'est émis/dérivé **qu'à la fin** (synthèse, tour 10) | **Écart fonctionnel majeur** |
| 4 | **Phase 3 Révélation** (échanges 13-17) : montrer ce qui se dessine, nommer les manques, quantifier — la phase clé pour la conversion | Pas de phase « révélation » en cours de conversation ; tout est repoussé à la synthèse finale | **Écart fonctionnel** |
| 5 | **Reformulation cadrée** à l'échange 6/7 (spec) / « toutes les N questions » (protocole générique) | Reformulation seulement en **pré-synthèse** (tour 9), pas de cadence intermédiaire | Drift mineur |
| 6 | **Honnêteté sur la limite** : « il vous reste X/20 échanges » exposé à l'IA | Le `remaining` est suivi côté backend mais **non injecté dans le prompt** | Drift mineur |
| 7 | Phase 4 **Projection** : « valeur concrète calculée » (échange 19), invitation structurée | Synthèse = plan + schéma + mention Calendly ; pas de bloc « valeur calculée » | Drift de contenu |

## Cause racine

Le prompt de conduite est **codé en dur dans `src/chat_assistant.py`**, jamais chargé depuis le spec.
Les deux ont divergé : le spec décrit l'expérience cible (20 échanges, révélation progressive), le prompt
implémente une version plus courte et **plus pauvre sur la révélation progressive**.

## Recommandations (à arbitrer)

1. **Mettre à jour le spec sur la longueur** : 10 échanges (acté). Réécrire le découpage des phases sur
   10 tours (ex. Ancrage 1-3 / Exploration 4-7 / Révélation 8-9 / Synthèse 10).
2. **Trancher l'écart fonctionnel #3** : veut-on l'**extraction progressive** (la carte qui s'allume au fil
   de la conversation, promesse forte du spec) ? Si oui, c'est un vrai chantier (émettre/dériver un substrat
   partiel à chaque tour, pas seulement à la fin) — à mettre au backlog produit.
3. **Réintroduire une phase de révélation** explicite (tour 8-9) : reformuler + nommer ce qui se dessine +
   un manque, avant la synthèse — pour récupérer l'effet de conversion du spec.
4. **Source unique** : à terme, faire dériver le prompt du spec (ou au moins ajouter un test qui vérifie
   que le prompt couvre les invariants du spec) pour éviter la re-dérive.

---
*Réf. : `src/chat_assistant.py` (prompt), `lugia_coaching_dialog_spec.md` (spec médecine),
`generique/lugia_interview_protocol_generique.md` (protocole générique).*
