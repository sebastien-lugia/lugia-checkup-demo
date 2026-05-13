# Workstream Templates — V0

Les trois chantiers prédéfinis V0 du démonstrateur Lugia Check-up, leurs conditions de déclenchement, leur structure en 4 parties, et les placeholders paramétrables à partir des réponses du médecin.

> Version 1.0 — 13 mai 2026.

---

## 1. Vue d'ensemble

En V0, le démonstrateur propose **trois chantiers** au médecin. Ces chantiers sont prédéfinis : ils ne sont pas générés dynamiquement par un LLM. Leur sélection et leur instanciation suivent des règles déterministes décrites ci-dessous.

Chaque chantier suit la structure en **4 parties** validée en V0-1 :

1. **Ce que le check-up a vu** — les signaux observés dans les réponses, formulés en s'appuyant sur des éléments concrets.
2. **Ce qu'il ne peut pas confirmer seul** — les limites de la lecture déclarative, ce qui nécessite un diagnostic terrain pour être confirmé.
3. **Ce que Lugia propose** — l'intervention concrète, alignée sur le positionnement de substitution-extension (D-001).
4. **Ce que vous obtenez** — les livrables tangibles que le médecin emporte.

Les trois chantiers V0 sont :

| Priorité | Titre | Facette principale |
|---|---|---|
| 1 | Reprendre la main sur les demandes directes | Processus & activités |
| 2 | Sécuriser votre usage actuel de l'IA | Information |
| 3 | Anticiper une absence prolongée | Participants |

### Règle de sélection V0

Pour V0 simplicité, les trois chantiers sont **systématiquement affichés** dans cet ordre de priorité. La calibration sur le persona Dr Chateau active les trois (tous les triggers sont satisfaits). Pour des profils moins fragiles, les chantiers seront formulés avec une intensité atténuée — l'algorithme de formulation choisit la version "préventive" plutôt que la version "correctrice" selon les options sélectionnées.

En V1, un mécanisme de sélection dynamique parmi un pool plus large (5-8 chantiers) sera introduit, avec scoring de pertinence par chantier.

---

## 2. Chantier 1 — Reprendre la main sur les demandes directes

### Facette principale

Processus & activités. Touche aussi Information (les flux directs ne sont pas tracés).

### Conditions de déclenchement

Triggers (au moins un suffit, plusieurs augmentent la pertinence) :

- Q04 (Flux entrant) = `q04_d` — plusieurs canaux directs.
- Q05 (Charge admin) = `q05_d` — débordement soir/weekend.
- Q03 (Cadre du secrétariat) = `q03_c` ou `q03_d` — boîte noire ou écarts surprises.

### Variables (placeholders)

| Placeholder | Source |
|---|---|
| `{secretariat_type}` | Q02 selected_option_label (forme courte : "votre télésecrétariat") |
| `{canaux_paralleles}` | Composé selon Q04 free_text si présent, sinon liste type "appels mobile, SMS, mails directs" |
| `{justification_personnelle}` | Q04 complement_text si présent (citation textuelle), sinon omis |
| `{flux_principal}` | Q04 selected_option_label (forme courte) |

### Template

**Titre :** Reprendre la main sur les demandes directes

**Priorité :** 1

#### Partie 1 — Ce que le check-up a vu

> Vous recevez des {canaux_paralleles}, en plus de {flux_principal} et de {secretariat_type}. Ces demandes ne sont tracées nulle part et représentent une charge invisible.{justification_personnelle_phrase?}

Variante quand `q04_d` ET `q05_d` (forte charge admin) :

> {phrase_canaux_paralleles}. Et au quotidien, vous terminez fréquemment chez vous le soir — ces deux signaux se renforcent.

#### Partie 2 — Ce qu'il ne peut pas confirmer seul

> Le volume exact, l'impact réel sur votre journée, et les raisons pour lesquelles certains patients passent par vous plutôt que par {secretariat_type}.

#### Partie 3 — Ce que Lugia propose

> Cartographier ces demandes directes sur deux semaines pour en mesurer la volumétrie, puis définir avec vous une règle simple à communiquer aux patients et à {secretariat_type}.

#### Partie 4 — Ce que vous obtenez

> Une vue claire de ces flux parallèles, une règle simple à communiquer à vos patients, et un brief précis pour {secretariat_type}.

### Version "préventive" (si triggers seulement partiels)

Si Q04 ≠ `q04_d` mais Q05 = `q05_d` (charge sans canaux parallèles déclarés), le chantier devient :

**Titre :** Cartographier les sources de votre charge administrative

— mêmes 4 parties, reformulées pour cibler les sources de charge sans présupposer des canaux directs.

---

## 3. Chantier 2 — Sécuriser votre usage actuel de l'IA

### Facette principale

Information. Touche aussi Processus (les courriers rédigés par IA sont un processus de production).

### Conditions de déclenchement

Triggers :

- Q13 (Usage IA) = `q13_c` ou `q13_d` — usage de ChatGPT ou similaire avec vigilance ou en conscience non conforme.

### Variables (placeholders)

| Placeholder | Source |
|---|---|
| `{outil_ia_actuel}` | "ChatGPT ou similaire" si Q13=c/d, sinon vide |
| `{usage_decrit}` | Q13 free_text si présent (citation textuelle), sinon "courriers complexes" |
| `{niveau_conscience}` | "en faisant attention à l'anonymisation" si Q13=c, "en sachant que ce n'est pas tout à fait conforme" si Q13=d |
| `{outil_dictee_present}` | bool : "Mediadict" ou "dictée vocale" mentionné dans Q09 complement_text |

### Template

**Titre :** Sécuriser votre usage actuel de l'IA

**Priorité :** 2

#### Partie 1 — Ce que le check-up a vu

> Vous utilisez {outil_ia_actuel} pour {usage_decrit}, {niveau_conscience}.

Variante si Q13=d (usage assumé non conforme) :

> Vous utilisez {outil_ia_actuel} pour {usage_decrit}, en sachant que cela ne garantit pas la conformité au secret médical.

#### Partie 2 — Ce qu'il ne peut pas confirmer seul

> La fréquence, le type de courriers concernés, et les autres usages éventuels (résumés de consultations, recherches médicales).

#### Partie 3 — Ce que Lugia propose

> Mettre à votre disposition un environnement IA conforme HDS qui couvre les mêmes usages, sans anonymisation manuelle. Transition sans changer votre façon de travailler.

Variante si Q14 (clôture) mentionne "temps" :

> Mettre à votre disposition un environnement IA conforme HDS qui couvre les mêmes usages que ceux que vous avez aujourd'hui, sans anonymisation manuelle ni apprentissage d'un nouvel outil.

#### Partie 4 — Ce que vous obtenez

> Un usage conforme dès le premier jour, puis à votre rythme l'ouverture à d'autres tâches utiles (préparation de réponse à un spécialiste, suivi de patients chroniques, préparation à la facturation électronique de septembre).

### Note sur la dictée vocale

Si l'utilisateur a mentionné une dictée vocale classique (Mediadict, Dragon) dans Q09 complement_text, ajouter en sous-texte :

> Note : la dictée vocale classique que vous utilisez déjà reste, ce chantier porte sur l'aide à la rédaction structurée.

### Version "préventive"

Si Q13 = `q13_a` (pas d'usage IA), le chantier devient :

**Titre :** Préparer un usage maîtrisé de l'IA

— les 4 parties reformulées pour proposer une exploration encadrée d'un environnement IA sécurisé, plutôt qu'une substitution d'un usage existant.

---

## 4. Chantier 3 — Anticiper une absence prolongée

### Facette principale

Participants. Touche aussi Processus (les règles de continuité sont des processus).

### Conditions de déclenchement

Triggers :

- Q08 (Dépendance) = `q08_c` ou `q08_d` — continuité partielle ou inexistante.
- Q07 (Équipe étendue) = `q07_a` (porte seul) — renforce la pertinence.

### Variables (placeholders)

| Placeholder | Source |
|---|---|
| `{contexte_secretariat}` | Selon Q02 : "votre télésecrétariat" / "votre secrétariat interne" / vide |
| `{contexte_seul}` | "Depuis le départ de Catherine" si Q02 complement_text mentionne un départ, sinon "Depuis votre installation en solo" |
| `{absence_jamais_experimentee}` | bool : phrase ajoutée si Q08=d |

### Template

**Titre :** Anticiper une absence prolongée

**Priorité :** 3

#### Partie 1 — Ce que le check-up a vu

> Tout le fonctionnement de votre cabinet est dans votre tête. {contexte_seul}, rien n'est documenté. En cas d'arrêt de plusieurs jours, {contexte_secretariat} et vos patients ne sauraient pas quoi faire.

#### Partie 2 — Ce qu'il ne peut pas confirmer seul

> Ce qui se passerait concrètement, qui pourrait prendre le relais sur quoi, et quels patients chroniques nécessitent une vigilance particulière.

#### Partie 3 — Ce que Lugia propose

> Mettre par écrit les règles essentielles de fonctionnement de votre cabinet : à qui adresser quels types de demandes, comment gérer les renouvellements, qui contacter en cas de problème technique.

#### Partie 4 — Ce que vous obtenez

> Un document simple, à jour, partageable avec {contexte_secretariat} et un remplaçant éventuel. La conviction qu'en cas d'imprévu, votre cabinet ne s'arrête pas net.

### Version "préventive"

Si Q08 = `q08_a` ou `q08_b` (continuité préparée ou relais disponible), le chantier devient :

**Titre :** Formaliser la continuité que vous avez déjà construite

— reconnaît l'existant et propose de structurer ce qui est déjà là plutôt que de partir d'une page blanche.

---

## 5. Algorithme de sélection et d'instanciation

### Sélection (V0)

Les trois chantiers sont systématiquement affichés dans l'ordre 1, 2, 3.

Pour chaque chantier, l'algorithme vérifie si les triggers sont déclenchés :

- Si **au moins un trigger satisfait** : utiliser la version standard (correctrice).
- Si **aucun trigger satisfait** : utiliser la version préventive (formulation atténuée).

### Instanciation

Pour chaque placeholder du chantier sélectionné :

1. Lire la source (réponse correspondante en base).
2. Appliquer le fallback si la source est null ou inexploitable.
3. Substituer dans le template.

### Note sur les variantes conditionnelles

Le template Markdown utilise une syntaxe simple `{nom_de_phrase?}` pour les fragments conditionnels. En V0-4b, l'implémentation Python peut traiter ces marqueurs avec une logique d'inclusion/exclusion basée sur la présence du placeholder.

---

## 6. Calibration sur Dr Chateau

Pour le persona de référence, voici les triggers et placeholders attendus :

### Chantier 1 — Reprendre la main sur les demandes directes

- Triggers : Q04=`q04_d` ✓, Q05=`q05_d` ✓
- Variante : standard (correctrice), avec la phrase de renforcement charge+canaux
- Placeholders :
  - `{secretariat_type}` = "votre télésecrétariat"
  - `{canaux_paralleles}` = "appels sur votre mobile, SMS de patients réguliers et mails directs"
  - `{justification_personnelle}` = "Je ne veux pas couper le lien avec ceux qui m'écrivent depuis des années"
  - `{flux_principal}` = "Doctolib"

### Chantier 2 — Sécuriser votre usage actuel de l'IA

- Triggers : Q13=`q13_d` ✓
- Variante : standard, avec la version "non conforme assumé"
- Placeholders :
  - `{outil_ia_actuel}` = "ChatGPT"
  - `{usage_decrit}` = "vos courriers complexes" (extrait de Q13 free_text)
  - `{niveau_conscience}` = "en sachant que cela ne garantit pas la conformité au secret médical"
  - `{outil_dictee_present}` = true (Mediadict mentionné dans Q09 complement_text)

### Chantier 3 — Anticiper une absence prolongée

- Triggers : Q08=`q08_d` ✓, Q07=`q07_a` ✓
- Variante : standard
- Placeholders :
  - `{contexte_secretariat}` = "votre télésecrétariat"
  - `{contexte_seul}` = "Depuis le départ de Catherine" (Q02 complement_text)
  - `{absence_jamais_experimentee}` = true (mentionnée dans Q08 complement_text)

### Résultat attendu

Les trois chantiers s'affichent sur la page de résultats en mode "correctrice", avec les placeholders correctement substitués, reproduisant fidèlement le contenu du wireframe `wireframes/resultats.html` V0-1 iter 2.

---

## 7. Pistes V1 et au-delà

Inscrites dans `ROADMAP.md` :

- **Pool plus large de chantiers** (5-8 chantiers couvrant les 9 facettes WSF).
- **Scoring de pertinence par chantier** pour sélectionner les 3 plus prioritaires.
- **Génération contextuelle par LLM** des phrases de chantier, à partir de templates plus riches et d'exemples few-shot.
- **Citations textuelles** directes des réponses libres dans les chantiers (Mode B et C).
- **Liens hypertexte** entre chantiers et facettes/nœuds sur la pyramide WSF (V1+).

---

*Version 1.0. Toute évolution structurante des chantiers ou de leur algorithme de sélection doit être journalisée dans `DECISIONS.md`.*
