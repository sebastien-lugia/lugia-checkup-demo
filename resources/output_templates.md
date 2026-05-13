# Output Templates — V0

Templates de génération du rapport de check-up en V0 : synthèse, résumés de facette, recommandation de prochaine étape. Système de placeholders et règles de composition.

> Version 1.0 — 13 mai 2026.

---

## 1. Structure du rapport

La page de résultats est composée des sections suivantes, dans cet ordre (cohérent avec le wireframe `wireframes/resultats.html` validé en V0-1) :

1. **En-tête** : marque, tag "Check-up préventif", titre du rapport, date.
2. **Synthèse** : section "Votre situation aujourd'hui" — un paragraphe de quelques phrases qui résume la lecture du check-up.
3. **Facettes** : section "Trois angles de votre cabinet" — trois cartes (Processus, Participants, Information) avec score sur 10 et résumé qualitatif de 2-3 phrases.
4. **Chantiers** : section "Trois chantiers prioritaires" — les trois chantiers sélectionnés (voir `workstream_templates.md`).
5. **Prochaine étape** : section "Prochaine étape ?" — trois options dont une recommandée.

---

## 2. Synthèse

### Cible

Quatre à six phrases qui doivent :

- **Reconnaître ce qui marche** dans le cabinet du médecin, en nommant des outils ou des dispositifs concrets identifiés dans les réponses (effet de personnalisation).
- **Pointer les zones de fragilité** sans culpabilisation, en nommant deux à trois fragilités précises.
- **Formuler le positionnement Lugia** (substitution-extension) sous forme de recommandation prioritaire.
- **Mentionner un enjeu temporel ou contextuel** spécifique si présent dans les réponses (par exemple la facturation électronique de septembre 2026).

### Squelette V0

```
{phrase_reconnaissance_fonctionnement}
{phrase_outillage_externalisations}
{phrase_fragilites_principales}
{phrase_recommandation_lugia}
```

### Variables principales

| Placeholder | Source | Exemple pour Dr Chateau |
|---|---|---|
| `{outils_metier}` | Q09 complement_text si présent, sinon "vos outils numériques" | "Maiia, Doctolib, Lifen, MSSanté/Mailiz, Mon Sisra, Mediadict" |
| `{duree_secretariat}` | Q02 complement_text si présent, sinon "récemment" | "depuis 18 mois" |
| `{externalisations}` | Composé selon Q02 (secrétariat) + persona | "votre télésecrétariat depuis 18 mois, l'externalisation comptable" |
| `{fragilite_1}` | Dérivé du chantier 1 (flux entrant ou charge) | "des appels et messages directs de patients que vous traitez en plus du télésecrétariat" |
| `{fragilite_2}` | Dérivé du chantier 2 (usage IA) | "l'usage que vous faites de ChatGPT pour vos courriers en sachant que ce n'est pas tout à fait conforme" |
| `{enjeu_temporel}` | Conditionnel : si entre mai et septembre 2026 | "y compris la facturation électronique de septembre" |

### Template type V0 (pour persona Chateau)

> Votre cabinet tourne, mais entièrement grâce à vous. Vous avez bâti une organisation efficace : {outils_metier}, {externalisations}. Pourtant deux zones vous fatiguent sans que vous puissiez bien les nommer : {fragilite_1}, et {fragilite_2}. **Avant tout autre chantier, et avant d'ajouter un agent ou un nouvel outil, ce qui vous aiderait le plus est de remplacer votre usage actuel de l'IA par un environnement adapté au secret médical, qui pourra ensuite vous aider à structurer le reste — {enjeu_temporel}.**

### Variations

Pour V0, on ne génère qu'une version de la synthèse (la cible ci-dessus). Pour V1, on prévoira plusieurs squelettes selon le profil dominant du médecin (déjà très outillé / partiellement / peu) et l'enjeu principal détecté.

---

## 3. Résumés de facette

Chaque facette obtient un résumé de 2-3 phrases qui :

- **Reconnaît une force** quand il y en a une (option avec health_score ≥ 7 dans la facette).
- **Nomme la principale fragilité** (option avec health_score ≤ 4 dans la facette, la plus basse en priorité).
- **Cite si possible un élément concret** issu des réponses libres (Mode B) ou des compléments.

### Template par facette

```
{phrase_force_facette}. {phrase_fragilite_facette}.{phrase_citation_specifique?}
```

Le `?` indique que la citation spécifique est conditionnelle (si une réponse libre ou un complément fournit une accroche concrète).

### Résumés type V0 pour Dr Chateau

**Processus et activités (3 / 10)**

> Votre prise de rendez-vous et le tunnel patient fonctionnent grâce à vos outils. Mais une part des demandes vous arrive en direct (appels mobile, SMS, mails), en plus du télésecrétariat. Ce flux parallèle n'est tracé nulle part.

**Participants (3 / 10)**

> Depuis le départ de Catherine il y a 18 mois, rien n'est écrit. Votre télésecrétariat travaille avec des règles que vous n'avez jamais cadrées avec eux. Si vous deviez vous arrêter une semaine, personne ne saurait précisément que faire.

**Information (3 / 10)**

> Vos résultats, courriers et ordonnances arrivent bien dans vos outils. Mais aucun patient chronique qui ne revient pas ne vous remonte d'alerte, et un résultat vu en retard reste possible — comme cela s'est produit il y a quelques mois.

### Règles de composition des résumés

Pour chaque facette F :

1. Lister les options sélectionnées qui contribuent au score (health_score non null, question scored).
2. Identifier l'option avec le score santé le **plus haut** dans la facette → utiliser pour la phrase de force (formulation positive, atténuée si score < 7).
3. Identifier l'option avec le score santé le **plus bas** dans la facette → utiliser pour la phrase de fragilité (formulation factuelle, sans dramatisation).
4. Chercher dans les réponses libres ou compléments des questions de la facette une citation concrète (date, exemple, élément factuel) qui peut être insérée comme troisième phrase.
5. Composer le résumé en respectant les principes de `brand_guidelines.md` (vocabulaire métier, pas de jugement individuel).

### Pour V0-4b

L'implémentation peut commencer par des résumés **hardcodés pour Dr Chateau** (puisque c'est la session de référence) et étendre progressivement à d'autres profils en V1. Conserver le squelette de règles pour aligner les futures versions.

---

## 4. Prochaine étape

Trois options présentées en cartes, dont une recommandée. Choix de la carte recommandée selon des règles simples.

### Trois options possibles

| Option | Quand la recommander |
|---|---|
| **Rester en autonomie** | Si tous les scores ≥ 7 (cabinet en bonne santé) — peu fréquent en V0 |
| **Échanger avec Lugia** | Cas par défaut : 30 minutes pour reprendre les conclusions et explorer l'environnement sécurisé |
| **Lancer un diagnostic terrain** | Si au moins deux facettes ≤ 3 ET au moins un Mode B révèle un incident concret (Q04, Q05, Q11) |

### Pour Dr Chateau

Application des règles :
- Tous les scores ≥ 7 ? Non (scores 3/3/3).
- Au moins deux facettes ≤ 3 ET un incident concret en Mode B ? Oui (Q11 mentionne l'incident résultat retardé).

Recommandation : **Lancer un diagnostic terrain** *ou* **Échanger avec Lugia** selon la sévérité ressentie.

En V0 (simplification) : recommander **Échanger avec Lugia** systématiquement comme entrée de gamme la moins engageante. Le diagnostic terrain reste affiché en option, sans être marqué "Recommandé". Cela conserve la cohérence avec le wireframe V0-1.

### Templates de description

| Option | Badge | Description |
|---|---|---|
| Rester en autonomie | À votre rythme | Reprendre les chantiers proposés seul, à votre rythme. |
| Échanger avec Lugia | Recommandé | 30 minutes pour reprendre ce que vous avez vu et tester l'environnement sécurisé. |
| Lancer un diagnostic terrain | Plus complet | Une journée d'observation sur place pour affiner les chantiers. |

---

## 5. Système de placeholders

### Sources des données

Chaque placeholder est dérivé d'une ou plusieurs sources :

- **`{type_cabinet}`** : `selected_option_label` de Q01.
- **`{secretariat}`** : `selected_option_label` de Q02 (forme courte).
- **`{outils_metier}`** : `complement_text` de Q09 si présent, sinon liste construite à partir du `selected_option_label`.
- **`{duree_secretariat}`** : extrait du `complement_text` de Q02 (par regex sur "X mois", "X ans") sinon "récemment".
- **`{externalisations}`** : composée selon les réponses (Q02 et persona-related).
- **`{fragilite_*}`** : composées à partir des chantiers déclenchés (voir `workstream_templates.md`).
- **`{enjeu_temporel}`** : conditionnel — calendrier de la session.

### Résolution conditionnelle

Certains placeholders peuvent être absents si les conditions ne sont pas remplies. Dans ce cas, la phrase qui les contient peut être :
- **Sautée** (si le placeholder est essentiel à la phrase).
- **Reformulée** avec une variante sans le placeholder.

Pour V0, le code de génération doit gérer les fallback proprement : si `{outils_metier}` est null, utiliser "vos outils numériques" ; si `{duree_secretariat}` est null, utiliser "récemment".

### Liste exhaustive des placeholders V0

| Placeholder | Type | Fallback |
|---|---|---|
| `{type_cabinet}` | string | "votre cabinet" |
| `{secretariat}` | string | "votre secrétariat" |
| `{outils_metier}` | string | "vos outils numériques" |
| `{duree_secretariat}` | string | "" (phrase reformulée) |
| `{externalisations}` | string | "vos externalisations" |
| `{fragilite_1}` | string | (toujours présent — chantier 1 obligatoire) |
| `{fragilite_2}` | string | (toujours présent — chantier 2 obligatoire) |
| `{enjeu_temporel}` | string | "" (phrase reformulée sans cet ajout) |
| `{outil_ia_actuel}` | string | "une IA grand public" |
| `{incident_resultat}` | string | "un retard ponctuel" (si Q11=d) |

---

## 6. Règles de composition

### Priorité aux faits

Les phrases doivent s'appuyer sur des faits issus des réponses. Pas de généralités. Pas de "votre cabinet semble fonctionner globalement bien" — formuler en s'appuyant sur des points concrets.

### Ton

Voir `brand_guidelines.md` section 2. Sobre, clair, humain, non culpabilisant. Pas de jargon excessif. Phrases courtes.

### Personnalisation

Les outils nommés, dates, incidents précisés dans les réponses libres doivent être **cités textuellement** dans les résumés et la synthèse. C'est l'effet de personnalisation que l'utilisateur a demandé en V0-1 iter 2.

### Garde-fous

Voir `brand_guidelines.md` section 4. Pas de notation des personnes, pas de diagnostic médical, scoring déclaratif. Toute formulation doit pouvoir être lue par un médecin comme "ce check-up parle de mon système de travail", pas "ce check-up me juge".

---

## 7. Pistes V1 et au-delà

Inscrites dans `ROADMAP.md` :

- **Génération contextuelle par LLM** des phrases de synthèse et de résumé, à partir d'un schéma JSON strict et d'exemples few-shot.
- **Plusieurs squelettes de synthèse** selon le profil dominant (déjà très outillé, partiellement outillé, peu outillé, en crise organisationnelle, etc.).
- **Citations textuelles** des réponses libres dans le rapport (Mode B et C) — déjà partiellement V0 mais à étendre.
- **Export PDF** du rapport avec mise en page propre.

---

*Version 1.0. Toute évolution structurante des templates doit être journalisée dans `DECISIONS.md`.*
