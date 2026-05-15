# Sample Answers — Dr Philippe Chateau

> Session de référence (oracle) du persona Dr Philippe Chateau pour le démonstrateur Lugia Check-up.
>
> Version 2.0 — 15 mai 2026 — Refonte V1.1 Vague 3 (questionnaire refondu, voir D-021).
>
> La session est générée à partir du contexte du persona (`persona_medecin_pchateau.md`) sans passage réel par l'application. Elle sert d'oracle de calibration et de seed `scripts/seed_persona.py`. Un test joué dans l'application doit reproduire ces réponses à l'identique pour vérifier la cohérence du parcours et la stabilité du rapport.

---

## Contexte de session

- **Persona** : Dr Philippe Chateau, 55 ans, médecin généraliste libéral solo à Saint-Mandé.
- **Date de la session simulée** : 15 mai 2026.
- **Durée perçue** : environ 18 minutes (questionnaire refondu, plus de QCM, moins d'ouvert).
- **Tonalité observée** : posée, vocabulaire emprunté au monde tech, minimisation initiale qui cède quand les questions touchent un nerf, retenue sur le contexte personnel.

---

## Synthèse rapide

### Choix par question — V1.1

| Position | ID | Mode | Facette | Choix | Score santé |
|---|---|---|---|---|---|
| 1 | Q01 | A | Contexte | `q01_a` | — |
| 2 | Q02 | A | Contexte | `q02_b` | — |
| 3 | Q03 | A | Participants | `q03_c` | 4 |
| 4 | Q04 | A | Processus | `q04_d` | 3 |
| 5 | Q05 | B | Processus | `q05_d` | 2 |
| 6 | Q06 | A | Motivation | `q06_c` | — |
| 7 | Q07 | A | Participants | `q07_a` | 3 |
| 8 | Q08 | A | Participants | `q08_d` | 3 |
| 9 | Q09 | A | Information | `q09_d` | 2 |
| 10 | Q10 | A | Information | `q10_d` | 2 |
| 11 | Q11 | A | Information | `q11_c` | 5 |
| 12 | Q12 | A | Processus | `q12_b` | 5 |
| 13 | Q13 | B | Information | `q13_d` | 2 |
| 14 | Q14 | C | Clôture | — | — |

### Scores bruts attendus par facette (moyenne des scores santé)

| Facette | Questions | Détail | Moyenne brute V1.1 | Moyenne brute V1.0 |
|---|---|---|---|---|
| Processus & activités | Q04, Q05, Q12 | (3 + 2 + 5) / 3 | **3,33** | 3,33 |
| Participants | Q03, Q07, Q08 | (4 + 3 + 3) / 3 | **3,33** | 3,00 |
| Information | Q09, Q10, Q11, Q13 | (2 + 2 + 5 + 2) / 4 | **2,75** | 2,75 |

Les scores Processus et Information restent identiques à V1.0, par recalibrage : Q08 monte de 2 à 3 (formulation moins anxiogène), Q09 baisse de 4 à 2 (palier factuel "plus de cinq outils"), Q11 monte de 3 à 5 (vigilance personnelle régulière au lieu d'"incident passé"). L'effet net sur Information se compense ; Participants remonte légèrement.

---

## Détail des 14 réponses V1.1

### Q01 — Type de votre cabinet

- **Mode** : A
- **Choix** : `q01_a` — *Cabinet libéral solo (un seul médecin)*
- **Complément** : *(aucun)*

### Q02 — Prise des rendez-vous et des appels

- **Mode** : A
- **Choix** : `q02_b` — *Un télésecrétariat externalisé*
- **Complément** : "Depuis 18 mois, après le départ de Catherine qui était en interne pendant 8 ans."

### Q03 — Cadre du secrétariat

- **Mode** : A
- **Choix** : `q03_c` — *Pas de cadre formel, le secrétariat décide au cas par cas*
- **Complément** : "Je leur ai brièvement expliqué mon fonctionnement au démarrage, on en est resté là. Quelques RDV mal orientés de temps en temps, rien d'alarmant."

### Q04 — Canaux d'entrée des demandes

- **Mode** : A
- **Choix** : `q04_d` — *Plusieurs canaux dont des canaux directs vers moi (mobile, SMS, mail)*
- **Complément** : "Principalement Doctolib pour les nouveaux RDV et le télésecrétariat pour les appels. Quelques patients de longue date me sollicitent encore en direct par mail ou SMS — je ne veux pas couper le lien avec eux."

### Q05 — Charge administrative en fin de journée

- **Mode** : B
- **Réponse libre initiale** : "Hier soir, j'ai traité une vingtaine de courriers spécialistes via Lifen, quelques renouvellements d'ordonnances longues et trois résultats biologiques que je n'avais pas eu le temps de regarder dans la journée. Le week-end, j'avance souvent sur les comptes-rendus de visites à domicile."
- **Choix** : `q05_d` — *…se prolongent chez moi le soir ou le week-end*
- **Complément** : "Pas tous les soirs, mais souvent. Je le fais parce que ça ne se voit pas le lendemain et que ça reste tenable pour moi."

### Q06 — Pourquoi ce check-up maintenant

- **Mode** : A
- **Choix** : `q06_c` — *Un événement récent qui m'a poussé à me poser des questions*
- **Complément** : "Un confrère m'a parlé de Lugia il y a quelques semaines, dans un contexte familial qui me pousse à prendre du recul sur mon organisation. Et je m'intéresse depuis longtemps à l'IA pour le cabinet."

### Q07 — Équipe étendue du cabinet

- **Mode** : A
- **Choix** : `q07_a` — *Personne, je porte seul l'organisation du cabinet*
- **Complément** : "Externalisations comptable et télésecrétariat à côté, mais rien dans le quotidien du cabinet lui-même."

### Q08 — Continuité en cas d'absence

- **Mode** : A
- **Choix** : `q08_d` — *Le cabinet ferme — c'est ce que je fais en pratique*
- **Complément** : "Je n'ai jamais vraiment fait l'expérience d'un arrêt long. Pour mes congés je préviens en amont et je ferme. Une semaine d'arrêt non planifié, je ne sais pas comment je gérerais."

### Q09 — Nombre d'outils numériques

- **Mode** : A
- **Choix** : `q09_d` — *Plus de cinq outils, avec des informations à saisir à plusieurs endroits*
- **Complément** : "Un logiciel métier, une plateforme de rendez-vous, un outil d'envoi de courriers aux spécialistes, une messagerie sécurisée, une dictée vocale, un dossier régional. Tout fonctionne mais il reste de la double saisie pour les nouveaux patients."

### Q10 — Suivi des patients chroniques

- **Mode** : A
- **Choix** : `q10_d` — *Je ne le sais pas, sauf si le patient revient de lui-même*
- **Complément** : "C'est un point que j'avais identifié mais que je n'ai jamais vraiment adressé. Ils reviennent quand ils reviennent — ou ne reviennent pas."

### Q11 — Tri des résultats d'examens

- **Mode** : A
- **Choix** : `q11_c` — *Je consulte la boîte de résultats moi-même, plusieurs fois par jour*
- **Complément** : "Je vérifie deux fois par jour depuis qu'un résultat biologique modérément urgent m'avait échappé quatre jours il y a six mois. Sans conséquence pour la patiente, mais l'épisode m'a marqué. C'est une vigilance personnelle qui repose sur moi seul."

### Q12 — Téléconsultation

- **Mode** : A
- **Choix** : `q12_b` — *Régulièrement, à la demande des patients, sans règle particulière*
- **Complément** : "3 à 5 par semaine. Je l'accepte quand un patient demande si le motif me paraît compatible. Pas de règle écrite ni d'horaire réservé."

### Q13 — Usage de l'IA générative

- **Mode** : B
- **Réponse libre initiale** : "Oui, je l'utilise depuis six mois pour mes courriers complexes — typiquement les courriers de synthèse pour les spécialistes ou les comptes-rendus de visite à domicile. Je remplace les données identifiantes par des codes avant de coller le contexte. Mais je sais que ce n'est pas une garantie suffisante."
- **Choix** : `q13_d` — *Oui, j'utilise une IA grand public et je sais que ce n'est pas tout à fait conforme*
- **Complément** : "C'est l'usage qui me met le plus mal à l'aise dans mon organisation actuelle. La dictée vocale classique existe, je l'utilise pour mes comptes-rendus standards, mais ce que je cherche en plus, c'est l'aide à la rédaction structurée."

### Q14 — Ce qui vous aiderait le plus

- **Mode** : C
- **Réponse libre** : "Gagner du temps utile. Pas du temps de productivité — du temps libre pour mes proches, surtout en ce moment. Et idéalement sans avoir à apprendre un nouvel outil. Ce qui m'aiderait vraiment, c'est un environnement qui prendrait en charge ce que je fais déjà — y compris l'IA — mais de manière propre et conforme."

---

## Notes méthodologiques

### Sur la refonte V1.1

Quatre changements de réponse par rapport à l'oracle V1.0 :

- **Q06** passe de Mode C (récit libre) à Mode A. Le choix `q06_c` (événement déclencheur) capte la composante familiale du persona ; le complément libre conserve la double motivation (curiosité IA + recul personnel).
- **Q08** passe de l'option "personne ne saurait, le cabinet serait à l'arrêt" (santé 2) à "le cabinet ferme — c'est ce que je fais en pratique" (santé 3). Plus juste : Chateau ferme proprement pendant ses congés, sa fragilité concerne l'arrêt non planifié, capturée en complément libre.
- **Q09** passe de "empilement avec double saisie résiduelle" (santé 4) à "plus de cinq outils, double saisie à plusieurs endroits" (santé 2). Refonte factuelle : six outils nommés en complément.
- **Q11** passe de l'option "incident passé" (santé 3, mode B) à "je consulte plusieurs fois par jour" (santé 5, mode A). Le QCM mesure désormais l'organisation actuelle (vigilance personnelle régulière), l'incident passé reste en complément libre.

### Sur la cohérence avec le persona

Les complément libres sont volontairement riches en éléments concrets qui pourront alimenter le rapport — sans citer aucune marque (Maiia, Doctolib, ChatGPT, Lifen, Mailiz) pour rester cohérent avec le ton Vague 2 lite (15 mai 2026). Les outils du persona sont nommés en interne dans le persona, mais le rapport généré les agrège en catégories (logiciel métier, plateforme de rendez-vous, outil de courriers, messagerie sécurisée, dictée, dossier régional, IA grand public).

### Sur les écarts de score

Les écarts entre scores attendus (3,33 / 3,33 / 2,75) et cibles initiales V0-1 (6 / 4 / 5) sont stables. Toute compensation reste traitée en aval — soit éditorialement par les templates (Vague 2 lite), soit ultérieurement par le scoring V1+ (pondération, Flags critiques, voir `ROADMAP.md` section Scoring V1+).

---

*Version 2.0. Toute évolution structurante de cet oracle doit être journalisée dans `DECISIONS.md`. Mettre à jour cette session si le protocole `interview_protocol.json` évolue.*
