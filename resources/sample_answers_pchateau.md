# Sample Answers — Dr Philippe Chateau

> Session de référence (oracle) du persona Dr Philippe Chateau pour le démonstrateur Lugia Check-up.
>
> Version 2.6 — 19 mai 2026 — V1.1.9 stricte (révision v1.11) : retrait des questions q15/q16/q17 ajoutées en v1.10 mais dormantes (non câblées dans le rapport). L'information équivalente (statut, territoire, horizon) est désormais portée par le mini-onboarding profil V2.0 sur `user_profile`. Chateau revient à 14 réponses scorées comme avant l'ajout v1.10. Alignement Q06 préservé : `q06_a` ("réduire ma charge actuelle").
>
> La session est générée à partir du contexte du persona (`persona_medecin_pchateau.md`) sans passage réel par l'application. Elle sert d'oracle de calibration et de seed `scripts/seed_persona.py`. Un test joué dans l'application doit reproduire ces réponses à l'identique.

---

## Contexte de session

- **Persona** : Dr Philippe Chateau, 55 ans, médecin généraliste libéral solo à Saint-Mandé.
- **Date de la session simulée** : 15 mai 2026.
- **Durée perçue** : environ 18 minutes.
- **Tonalité observée** : posée, minimisation initiale qui cède sur les questions qui touchent un nerf, retenue sur le contexte personnel.

---

## Synthèse rapide

### Choix par question — V1.1.9

| Position | ID | Mode | Facette | Choix | Score santé |
|---|---|---|---|---|---|
| 1 | Q01 | A | Contexte | `q01_a` | — |
| 2 | Q02 | A | Contexte | `q02_b` | — |
| 3 | Q03 | A | Participants | `q03_d` | 3 |
| 4 | Q04 | A | Processus | `q04_d` | 3 |
| 5 | Q05 | B | Processus | `q05_d` | 2 |
| 6 | Q06 | A | Motivation | `q06_a` | — |
| 7 | Q07 | A | Participants | `q07_a` | 3 |
| 8 | Q08 | A | Participants | `q08_c` | 4 |
| 9 | Q09 | A | Information | `q09_d` | 2 |
| 10 | Q10 | A | Information | `q10_d` | 2 |
| 11 | Q11 | A | Information | `q11_c` | 5 |
| 12 | Q12 | A | Processus | `q12_b` | 5 |
| 13 | Q13 | B | Information | `q13_d` | 2 |
| 14 | Q14 | C | Clôture | — | — |

### Scores bruts attendus par facette (moyenne)

| Facette | Questions | Détail | Score sur 10 |
|---|---|---|---|
| Processus & activités | Q04, Q05, Q12 | 3 + 2 + 5 | **3** |
| Participants | Q03, Q07, Q08 | 3 + 3 + 4 | **3** |
| Information | Q09, Q10, Q11, Q13 | 2 + 2 + 5 + 2 | **3** |

Q03 passe de santé 4 (q03_c "pas de cadre formel" en Vague 3) à santé 3 (q03_d "pas de cadre formel — chaque cas est tranché au moment où il se présente" en Vague 3.1) ; Participants baisse de 3,33 à 3,00. Cohérent avec l'axe homogénéisé "niveau de cadrage", qui place le sans-cadre tout en bas.

---

## Détail des 14 réponses V1.1.9

### Q01 — Type de votre cabinet
- **Mode** : A · **Choix** : `q01_a` — *Cabinet libéral solo (un seul médecin)*

### Q02 — Prise des rendez-vous et des appels
- **Mode** : A · **Choix** : `q02_b` — *Télésecrétariat externalisé — prestataire à distance*
- **Complément** : "Depuis 18 mois, après le départ de Catherine qui était en interne pendant 8 ans."

### Q03 — Cadre du secrétariat
- **Mode** : A · **Choix** : `q03_d` — *Pas de cadre formel — chaque cas est tranché au moment où il se présente*
- **Complément** : "Je leur ai brièvement expliqué mon fonctionnement au démarrage, on en est resté là. Quelques rendez-vous mal orientés de temps en temps, rien d'alarmant."

### Q04 — Canaux d'entrée des demandes
- **Mode** : A · **Choix** : `q04_d` — *Plusieurs canaux dont des canaux directs vers moi — appels mobile, SMS, mails*
- **Complément** : "Principalement la plateforme en ligne pour les nouveaux rendez-vous et le télésecrétariat pour les appels. Quelques patients de longue date me sollicitent encore en direct par mail ou SMS — je ne veux pas couper le lien avec eux."

### Q05 — Charge administrative récurrente
- **Mode** : B
- **Réponse libre initiale** : "Les courriers de synthèse pour les spécialistes, les renouvellements d'ordonnances longues, les comptes-rendus de visite à domicile. Je n'arrive pas toujours à les finir entre deux consultations, et certains finissent invariablement le soir."
- **Choix** : `q05_d` — *Finies à la maison — le soir ou le week-end, sur des plages personnelles*
- **Complément** : "Pas tous les soirs, mais souvent. Je le fais parce que ça ne se voit pas le lendemain et que ça reste tenable pour moi."

### Q06 — Pourquoi ce check-up maintenant
- **Mode** : A · **Choix** : `q06_a` — *Réduire ma charge actuelle — identifier ce qui pèse le plus dans ma semaine et alléger*
- **Complément** : "Un confrère m'a parlé de Lugia il y a quelques semaines, dans un contexte familial qui me pousse à prendre du recul sur mon organisation. Et je m'intéresse depuis longtemps à l'IA pour le cabinet."

### Q07 — Équipe étendue du cabinet
- **Mode** : A · **Choix** : `q07_a` — *Seul — je porte l'organisation du cabinet sans renfort régulier*
- **Complément** : "Externalisations comptable et télésecrétariat à côté, mais rien dans le quotidien du cabinet lui-même."

### Q08 — Résilience aux absences (planifiées et imprévues)
- **Mode** : A · **Choix** : `q08_c` — *Préparé pour les congés, fragile pour l'imprévu — je sais fermer pour mes congés, je ne sais pas comment je gérerais une absence soudaine*
- **Complément** : "Pour mes congés je préviens en amont et je ferme, c'est gérable. Mais une semaine d'arrêt non planifié, je ne sais pas comment je gérerais."

### Q09 — Nombre d'outils numériques
- **Mode** : A · **Choix** : `q09_d` — *Plus de cinq outils — informations à saisir à plusieurs endroits*
- **Complément** : "Un logiciel métier, une plateforme de rendez-vous, un outil d'envoi de courriers aux spécialistes, une messagerie sécurisée, une dictée vocale, un dossier régional. Tout fonctionne mais il reste de la double saisie pour les nouveaux patients."

### Q10 — Suivi des patients chroniques
- **Mode** : A · **Choix** : `q10_d` — *Pas de système — sauf si le patient revient de lui-même*
- **Complément** : "C'est un point que j'avais identifié mais que je n'ai jamais vraiment adressé."

### Q11 — Tri des résultats d'examens
- **Mode** : A · **Choix** : `q11_c` — *Vérification régulière — je consulte les résultats à heures fixes plusieurs fois par jour*
- **Complément** : "Je vérifie deux fois par jour depuis qu'un résultat biologique modérément urgent m'avait échappé quatre jours il y a six mois. Sans conséquence pour la patiente, mais l'épisode m'a marqué. C'est une vigilance personnelle qui repose sur moi seul."

### Q12 — Téléconsultation
- **Mode** : A · **Choix** : `q12_b` — *Régulière à la demande — sans règle particulière, au cas par cas*
- **Complément** : "3 à 5 par semaine. Je l'accepte quand un patient demande si le motif me paraît compatible. Pas de règle écrite ni d'horaire réservé."

### Q13 — Usage de l'IA générative
- **Mode** : B
- **Réponse libre initiale** : "Oui, je l'utilise depuis six mois pour mes courriers complexes — typiquement les courriers de synthèse pour les spécialistes ou les comptes-rendus de visite à domicile. Je remplace les données identifiantes par des codes avant de coller le contexte. Mais je sais que ce n'est pas une garantie suffisante."
- **Choix** : `q13_d` — *IA grand public, en connaissance de cause — je sais que ce n'est pas tout à fait conforme*
- **Complément** : "C'est l'usage qui me met le plus mal à l'aise dans mon organisation actuelle. La dictée vocale classique existe, je l'utilise pour mes comptes-rendus standards, mais ce que je cherche en plus, c'est l'aide à la rédaction structurée."

### Q14 — Ce qui vous aiderait le plus
- **Mode** : C
- **Réponse libre** : "Gagner du temps utile. Pas du temps de productivité — du temps libre pour mes proches, surtout en ce moment. Et idéalement sans avoir à apprendre un nouvel outil. Ce qui m'aiderait vraiment, c'est un environnement qui prendrait en charge ce que je fais déjà — y compris l'IA — mais de manière propre et conforme."

---

*Version 2.5. Toute évolution structurante de cet oracle doit être journalisée dans `DECISIONS.md` et `CHANGELOG.md`.*
