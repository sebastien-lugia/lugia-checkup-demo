# Modeling and Scoring — V0

Algorithme de scoring V0 du démonstrateur Lugia Check-up, ontologie minimale des nœuds, règles de gestion des cas limites, et exemple de calcul tracé pour le persona de référence.

> Version 1.0 — 13 mai 2026.

> **Décision fondatrice :** voir `DECISIONS.md` D-013. Le score doit être mathématiquement justifiable à tout moment, recalculable à la volée depuis la table `answer`. La pondération calibrée par benchmarking entre pairs est différée en V1+.

---

## 1. Vue d'ensemble

Le démonstrateur V0 produit trois scores entiers sur 10, un par facette WSF retenue : **Processus & activités**, **Participants**, **Information**. Le score d'une facette est la **moyenne arithmétique** des scores santé des options sélectionnées dans les questions de cette facette. Aucun bonus, aucun malus, aucune pondération en V0.

Cette simplicité est volontaire : elle garantit la traçabilité parfaite du calcul. Si un médecin demande "pourquoi 3 sur 10 ?", on lui montre les trois ou quatre options qui ont contribué et leur score santé respectif.

Pour la calibration de Dr Chateau, voir la section 4 plus bas — l'algorithme aboutit à des scores ~3/3/3, ce qui est plus sobre que les scores aspirationnels affichés en wireframe V0-1 (6/4/5). La nuance entre les facettes est portée par la **formulation qualitative** des résumés (voir `output_templates.md`), pas par les scores eux-mêmes.

---

## 2. Algorithme formel

### Entrées

- L'identifiant d'une interview (`interview_id`).
- La table `answer` de la base SQLite, contenant les réponses à chaque question.
- Le fichier `resources/interview_protocol.json`, qui fournit pour chaque question son `facet`, son `scored` (booléen), et pour chaque option son `health_score`.

### Algorithme

Pour chaque facette `F` dans `scored_facets` (= `["processes", "participants", "information"]` en V0) :

```
def compute_facet_score(interview_id, facet):
    contributions = []
    for answer in get_answers(interview_id):
        question = get_question(answer.question_id)
        if question.facet != facet:
            continue
        if not question.scored:
            continue
        if answer.selected_option is None:
            continue
        option = get_option(answer.question_id, answer.selected_option)
        if option.health_score is None:
            continue
        contributions.append({
            "question_id": question.id,
            "option_id": option.id,
            "option_label": option.label,
            "health_score": option.health_score,
        })

    if not contributions:
        return None  # pas assez de données pour scorer cette facette

    raw_mean = sum(c["health_score"] for c in contributions) / len(contributions)
    score = round(raw_mean)
    return {
        "facet": facet,
        "score": score,
        "raw_mean": raw_mean,
        "contributions": contributions,
    }
```

### Sortie

Pour chaque facette, un dictionnaire avec :
- `facet` : identifiant de la facette.
- `score` : entier 0-10 (arrondi à l'unité).
- `raw_mean` : moyenne brute non arrondie (utile pour l'encart "détail du score").
- `contributions` : liste des contributions individuelles, avec id de question, id et libellé de l'option, score santé.

### Arrondi

L'arrondi est mathématique (`round()` Python). 3,33 devient 3. 3,50 devient 4 (banker's rounding pour les cas .5, Python par défaut). 2,75 devient 3.

### Décalage entre brut et entier

La valeur `raw_mean` est conservée à 2 décimales dans le détail du score affiché. Si un médecin voit "3/10" et lit "moyenne brute 3,33 sur 3 réponses", l'écart est immédiatement compréhensible.

---

## 3. Cas limites

### Option "Sans objet" sélectionnée

Certaines questions ont une option "Sans objet" (par exemple `q03_e` pour le cadre du secrétariat quand il n'y a pas de secrétariat). Son `health_score` est `null` dans le JSON. Elle est **exclue** du calcul de la moyenne. Si toutes les options d'une question portent `null`, la question entière ne contribue pas.

### Option "Autre" sélectionnée

Toutes les questions ont une option "Autre" (par exemple `q01_other`). Son `health_score` est `null`. Elle est **exclue** du calcul, exactement comme "Sans objet". Le complément texte saisi par l'utilisateur n'est pas scoré automatiquement en V0 — il alimente la matière qualitative (résumés, citations dans le rapport) mais pas le chiffre.

### Question non répondue

Si l'utilisateur a quitté avant la fin et que certaines questions n'ont pas de ligne dans la table `answer`, elles sont **exclues** du calcul. La moyenne se fait sur les questions effectivement répondues. La facette peut alors avoir une moyenne basée sur moins de questions que prévu — c'est documenté dans l'encart "détail".

### Aucune contribution valide

Si après filtrage il ne reste **aucune contribution** pour une facette, le score retourné est `None`. La page de résultats doit alors afficher un message clair ("Pas assez de données pour scorer cette facette") plutôt qu'un score arbitraire. En V0, ce cas est très improbable (le questionnaire force la complétion), mais l'algorithme le gère proprement.

---

## 4. Validation : exemple Dr Chateau

Voici le calcul tracé pour le persona de référence, à partir de ses réponses encodées dans `scripts/seed_persona.py` (cohérentes avec `resources/sample_answers_pchateau.md`).

### Facette Processus & activités

| Question | Option | Score santé |
|---|---|---|
| Q04 (Flux entrant) | `q04_d` — Plusieurs canaux dont certains en direct | 3 |
| Q05 (Charge admin) | `q05_d` — Débordement soir/weekend | 2 |
| Q12 (Téléconsultation) | `q12_b` — Régulière sans règle | 5 |

Moyenne brute = (3 + 2 + 5) / 3 = **3,33**
Score arrondi = **3 / 10**

### Facette Participants

| Question | Option | Score santé |
|---|---|---|
| Q03 (Cadre du secrétariat) | `q03_c` — Confiance, ne sais pas précisément | 4 |
| Q07 (Équipe étendue) | `q07_a` — Porte seul l'organisation | 3 |
| Q08 (Dépendance) | `q08_d` — Cabinet à l'arrêt en cas d'absence | 2 |

Moyenne brute = (4 + 3 + 2) / 3 = **3,00**
Score arrondi = **3 / 10**

### Facette Information

| Question | Option | Score santé |
|---|---|---|
| Q09 (Outils numériques) | `q09_d` — Empilement avec double saisie | 4 |
| Q10 (Suivi chroniques) | `q10_d` — Perte de vue | 2 |
| Q11 (Résultats examens) | `q11_d` — Incident passé | 3 |
| Q13 (Usage IA) | `q13_d` — ChatGPT non conforme assumé | 2 |

Moyenne brute = (4 + 2 + 3 + 2) / 4 = **2,75**
Score arrondi = **3 / 10**

### Synthèse de calibration

Dr Chateau termine à **3 / 3 / 3** en V0. Les trois facettes sont uniformément fragiles parce que ses points forts (externalisations comptable et télésecrétariat, capacité à travailler tard) ne sont pas directement scorés — les questions de qualification (Q01, Q02) n'alimentent pas le score, et les questions sur l'admin/charge captent les conséquences fragiles plutôt que les forces compensatoires.

Cette uniformité est **honnête** et reflète la réalité du cabinet de Chateau : son organisation tient grâce à sa présence personnelle, pas grâce à des dispositifs structurels solides. C'est exactement ce que le rapport doit dire, en mots.

L'écart avec les scores aspirationnels du wireframe V0-1 (6/4/5) sera matérialisé dans la mise à jour de `pages/02_Resultats.py` en V0-4b — le rendu en local refléterea les vrais scores calculés.

---

## 5. Ontologie minimale V0

Chaque option du JSON porte un `node_type`. En V0 cette information est descriptive (sert à enrichir le rapport et à préparer V1) mais **n'est pas utilisée par l'algorithme de scoring**. Le scoring V0 utilise uniquement les `health_score`.

Sept types de nœuds en V0 :

| Type | Sens | Exemples d'options |
|---|---|---|
| **Acteur** | Personne ou organisation qui contribue au système | Médecin, secrétariat, assistant, IDEL, télésecrétariat |
| **Outil** | Logiciel, équipement, ou service technique | Doctolib, Maiia, Lifen, ChatGPT, environnement IA conforme |
| **Processus** | Activité organisée, règle, façon de faire | Tri à plusieurs niveaux, cadre explicite, téléconsultation cadrée |
| **Information** | Donnée, connaissance, transmission | (peu d'options taggées Information directement en V0) |
| **Symptôme** | Signe observable d'une fragilité | Canaux parallèles, charge débordement, empilement d'outils |
| **Cause** | Élément à l'origine d'un symptôme | (réservé V1 pour analyse causale) |
| **Risque** | Conséquence potentielle si rien ne change | Point unique de défaillance, IA non conforme assumée |

Ces types sont consommés à terme par les visualisations Mermaid de V1. En V0 ils servent au filtrage qualitatif (par exemple, le rapport peut citer "trois symptômes principaux" en sélectionnant les options de type Symptôme dans les réponses scorées).

---

## 6. Détail recalculable

Conformément à `DECISIONS.md` D-013, la table `facet_score` peut être laissée vide en V0 — les scores sont **calculés à la volée** à chaque chargement de la page de résultats. Le coût (3 lectures de la table `answer`, quelques moyennes) est négligeable et garantit la cohérence permanente entre les réponses stockées et les scores affichés.

L'encart "détail de votre score" (différé en V1, voir ROADMAP) affichera pour chaque facette le tableau complet de la section 4 — c'est exactement la structure que `compute_facet_score()` retourne.

Si plus tard on veut figer un score dans la table `facet_score` (par exemple pour comparer dans le temps), ce sera une décision additionnelle à inscrire dans DECISIONS.

---

## 7. Confiance et limites du scoring

### Niveau de confiance

Le scoring V0 ne calcule pas explicitement de niveau de confiance par facette. Tous les scores sont présentés comme des **estimations déclaratives** au sens de `brand_guidelines.md` — première lecture, pas une vérité.

Implicitement, la confiance dépend de :
- Le **nombre de contributions** par facette (3 ou 4 en V0).
- La **dispersion** des scores santé contribuant à la moyenne.
- La présence de réponses "Autre" ou "Sans objet" non scorées (réduit la base).

Ces signaux pourront être exploités en V1 pour produire un niveau de confiance affiché (Fort / Moyen / Faible).

### Limites structurelles assumées en V0

La moyenne brute est un choix conscient de simplicité pour la V0, mais elle porte cinq limites structurelles importantes qui doivent être connues. Ces limites ne sont pas des bugs : ce sont les caractéristiques inhérentes à toute moyenne brute non pondérée.

**1. Effet de compensation (masquage).** Un excellent score sur une question périphérique peut effacer un score catastrophique sur une question vitale. Exemple : un médecin obtient 10/10 sur son logiciel de prise de rendez-vous et 0/10 sur la confidentialité des données patient — sa moyenne 5/10 cache une situation de risque juridique critique. La V0 ne déclenche aucune alerte structurelle dans ce cas. En partie compensé en V0 par les templates de synthèse, qui peuvent foregrounder un Red Flag dans la narration, mais ce n'est pas un mécanisme structurel.

**2. Absence de hiérarchie (loi du tout se vaut).** Le scoring V0 traite chaque question avec le même poids. Or, dans la réalité métier, une question sur l'oubli d'un résultat d'examen (Q11) n'a pas le même ordre de gravité qu'une question sur la téléconsultation (Q12). Les questions critiques sont diluées par les questions de confort. Pas de mécanisme V0 pour redresser ce déséquilibre.

**3. Dilution par le nombre (effet ventre mou).** Plus le questionnaire compte de questions, plus la moyenne tend mathématiquement vers le centre. Sur 14 questions et un mécanisme uniforme, la quasi-totalité des répondants finit dans la fourchette 4-7/10. Le score perd sa capacité à discriminer un cabinet vraiment excellent d'un cabinet juste correct.

**4. Invisibilité des signaux faibles (Red Flags).** Certaines réponses sont des alertes rouges qui devraient court-circuiter le calcul agrégé. L'analogie médicale est juste : si un patient a une tension normale et une température normale mais une douleur fulgurante dans la poitrine, on ne fait pas la moyenne de ses constantes — la douleur thoracique devient l'unique indicateur qui compte. La V0 traite tous les scores comme fongibles et perd cette logique de priorité absolue.

**5. Injustice contextuelle pour les petites structures.** La moyenne brute pénalise structurellement les cabinets solos. Un médecin solo aura toujours des scores bas sur les questions de coordination, de continuité ou de délégation — pas parce qu'il est mal organisé mais parce qu'il est seul. La moyenne brute ne fait pas la différence entre "structurellement contraint" et "mal organisé", et présente un score qui semble dire que le médecin solo travaille mal alors qu'il est juste petit.

### Limites techniques additionnelles assumées en V0

- Le scoring V0 ne tient pas compte des **réponses en texte libre** (Mode B initial, Mode C, complément). Cette matière qualitative alimente la formulation du rapport mais pas les chiffres.
- Le scoring V0 ne prend pas en compte les **interactions entre questions**. Une réponse fragile à Q08 + une fragile à Q11 ne s'aggravent pas mutuellement.
- Le scoring V0 traite chaque facette **indépendamment**. Pas de score global synthétique.
- Le scoring V0 ne distingue pas, pour une même question, entre "non applicable" et "défavorable" lorsque l'utilisateur n'a pas choisi explicitement "Sans objet".

### Compensation partielle par la narration V0

Les templates de synthèse et de chantiers de la V0 (voir `output_templates.md` et `workstream_templates.md`) compensent partiellement les limites ci-dessus en **foregroundant les Red Flags dans la formulation** : l'usage IA non conforme apparaît en première position de la synthèse, la dépendance critique apparaît comme priorité 3 systématiquement, etc. Cette compensation est **éditoriale**, pas structurelle. Elle dépend de la qualité des templates et de la cohérence du paramétrage, pas d'un mécanisme algorithmique. C'est suffisant pour le démonstrateur, insuffisant pour un produit final.

### Trajectoire V1+

L'ensemble de ces limites est traité en V1+ par l'introduction d'un scoring pondéré avec conditions et flags. Voir `ROADMAP.md` section dédiée "Scoring V1+".

---

## 8. Pistes V1 et au-delà

Inscrites dans `ROADMAP.md` :

- **Pondération calibrée par benchmarking entre pairs** (cohortes anonymisées de professionnels du même secteur).
- **Cinq sous-dimensions par facette** (clarté, fluidité, fiabilité, soutenabilité, adaptabilité) — un score par sous-dimension, le score de facette est la moyenne ou un agrégat plus fin.
- **Niveau de confiance explicite** par facette (fort / moyen / faible).
- **Règles d'interaction** entre questions pour capturer des amplifications (ex : flux non régulé + secrétariat opaque = aggravation Participants).
- **Encart "détail de votre score"** sur la page de résultats pour montrer la traçabilité complète.
- **Alignement aux 5 catégories d'axiomes Alter** (System in Context, System Operation, Goal Attainment, Operational Variability, System Change).

---

*Version 1.0. Toute évolution structurante de l'algorithme de scoring doit être journalisée dans `DECISIONS.md`.*
