# Sample Report — Dr Philippe Chateau

> Rapport produit par le démonstrateur Lugia Check-up à partir d'une session du persona de référence (`resources/sample_answers_pchateau.md`).
> Généré par `scripts/dump_report.py` qui applique les modules V0-4 (`src/scoring`, `src/templates`, `src/workstreams`) à la session pré-remplie par `scripts/seed_persona.py`.
> Date de génération : 13/05/2026.

## Session

- **Interview id** : 9
- **Date de session** : 13/05/2026
- **Statut** : in_progress
- **Nombre de réponses** : 14

---

## Votre situation aujourd'hui

Votre cabinet tourne, mais entièrement grâce à vous. Vous avez bâti une organisation efficace : Maiia et Doctolib, votre télésecrétariat depuis 18 mois. Pourtant deux zones vous fatiguent sans que vous puissiez bien les nommer : des appels et messages directs de patients que vous traitez en plus de votre télésecrétariat, et l'usage que vous faites de ChatGPT pour vos courriers en sachant que ce n'est pas tout à fait conforme. *Avant tout autre chantier, et avant d'ajouter un agent ou un nouvel outil, ce qui vous aiderait le plus est de remplacer votre usage actuel de l'IA par un environnement adapté au secret médical, qui pourra ensuite vous aider à structurer le reste — y compris la facturation électronique de septembre.*

---

## Trois angles de votre cabinet

### Processus et activités — **3 / 10**

Votre prise de rendez-vous et le tunnel patient fonctionnent grâce à vos outils. Mais une part des demandes vous arrive en direct (appels mobile, SMS, mails), en plus de votre télésecrétariat. Ce flux parallèle n'est tracé nulle part.

*Détail du calcul : moyenne brute des 3 contributions = 3.33 → arrondi 3. Contributions : Q04 (3), Q05 (2), Q12 (5).*

### Participants — **3 / 10**

Depuis le départ de Catherine il y a 18 mois, rien n'est écrit. Votre télésecrétariat travaille avec des règles que vous n'avez jamais cadrées avec eux. Si vous deviez vous arrêter une semaine, personne ne saurait précisément que faire.

*Détail du calcul : moyenne brute des 3 contributions = 3.00 → arrondi 3. Contributions : Q03 (4), Q07 (3), Q08 (2).*

### Information — **3 / 10**

Vos résultats, courriers et ordonnances arrivent bien dans vos outils. Mais aucun patient chronique qui ne revient pas ne vous remonte d'alerte, et un résultat vu en retard reste possible — comme cela s'est produit il y a quelques mois.

*Détail du calcul : moyenne brute des 4 contributions = 2.75 → arrondi 3. Contributions : Q09 (4), Q10 (2), Q11 (3), Q13 (2).*

---

## Trois chantiers prioritaires

### Chantier 1 — Reprendre la main sur les demandes directes

**Ce que le check-up a vu**

Vous recevez des appels sur votre mobile, des SMS de patients réguliers et des mails directs, en plus de Doctolib et du télésecrétariat. Ces demandes ne sont tracées nulle part et représentent une charge invisible.

**Ce qu'il ne peut pas confirmer seul**

Le volume exact, l'impact réel sur votre journée, et les raisons pour lesquelles certains patients passent par vous plutôt que par votre télésecrétariat.

**Ce que Lugia propose**

Cartographier ces demandes directes sur deux semaines pour en mesurer la volumétrie, puis définir avec vous une règle simple à communiquer aux patients et à votre télésecrétariat.

**Ce que vous obtenez**

Une vue claire de ces flux parallèles, une règle simple à communiquer à vos patients, et un brief précis pour votre télésecrétariat.

### Chantier 2 — Sécuriser votre usage actuel de l'IA

**Ce que le check-up a vu**

Vous utilisez ChatGPT pour vos courriers complexes et vos comptes-rendus, avec une anonymisation manuelle des extraits de dossier. Vous savez que cela ne garantit pas la conformité au secret médical.

**Ce qu'il ne peut pas confirmer seul**

La fréquence, le type de courriers concernés, et les autres usages éventuels (résumés de consultations, recherches médicales).

**Ce que Lugia propose**

Mettre à votre disposition un environnement IA conforme HDS qui couvre les mêmes usages, sans anonymisation manuelle. Transition sans changer votre façon de travailler.

**Ce que vous obtenez**

Un usage conforme dès le premier jour, puis à votre rythme l'ouverture à d'autres tâches utiles (préparation de réponse à un spécialiste, suivi de patients chroniques, préparation à la facturation électronique de septembre). La dictée vocale classique que vous utilisez déjà reste — ce chantier porte sur l'aide à la rédaction structurée.

### Chantier 3 — Anticiper une absence prolongée

**Ce que le check-up a vu**

Tout le fonctionnement de votre cabinet est dans votre tête. Depuis le départ de Catherine, rien n'est documenté. En cas d'arrêt de plusieurs jours, votre télésecrétariat et vos patients ne sauraient pas quoi faire.

**Ce qu'il ne peut pas confirmer seul**

Ce qui se passerait concrètement, qui pourrait prendre le relais sur quoi, et quels patients chroniques nécessitent une vigilance particulière.

**Ce que Lugia propose**

Mettre par écrit les règles essentielles de fonctionnement de votre cabinet : à qui adresser quels types de demandes, comment gérer les renouvellements, qui contacter en cas de problème technique.

**Ce que vous obtenez**

Un document simple, à jour, partageable avec votre télésecrétariat et un remplaçant éventuel. La conviction qu'en cas d'imprévu, votre cabinet ne s'arrête pas net.

---

## Prochaine étape recommandée

**Échanger avec Lugia** *(recommandé)*

30 minutes pour reprendre ce que vous avez vu et tester l'environnement sécurisé.

Autres options :

- *Rester en autonomie* : Reprendre les chantiers proposés seul, à votre rythme.
- *Lancer un diagnostic terrain* : Une journée d'observation sur place pour affiner les chantiers.

---

## Notes méthodologiques

- **Scoring V0** : moyenne brute pure des scores santé des options sélectionnées dans les questions scorées. Voir `DECISIONS.md` D-013 et `resources/modeling_scoring.md`.
- **Limites assumées** : effet de compensation, absence de hiérarchie, dilution par le nombre, invisibilité des signaux faibles, injustice contextuelle. Voir `DECISIONS.md` D-016 et `ROADMAP.md` section Scoring V1+.
- **Personnalisation** : les outils nommés, dates, incidents cités proviennent directement des réponses du questionnaire (compléments, réponses libres). Aucune génération LLM en V0.

---

*Sample report généré automatiquement. Régénérable à tout moment avec `python scripts/dump_report.py` après `python scripts/seed_persona.py --reset`. Sert d'oracle de non-régression pour les évolutions futures.*
