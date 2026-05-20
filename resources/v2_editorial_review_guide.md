# Guide de relecture — Brouillon éditorial V2.0

**Version** : 1.0 — 19 mai 2026
**Destinataires** : 3 à 5 médecins testeurs (généralistes installés, profils variés)
**Document à relire** : `resources/v2_editorial_draft.md` (967 lignes, 5 lots)
**Temps estimé** : 45 à 60 minutes par relecteur
**Format de retour** : un seul document texte ou e-mail, structuré selon le template §7 ci-dessous

---

## 1. Pourquoi cette relecture

La V2.0 du check-up Lugia est une refonte de fond. Au-delà du design, c'est l'ensemble du **contenu éditorial** qui change : 76 reformulations terrain sur les options du questionnaire, 12 titres de diagnostic par niveau, 21 benchmarks chiffrés, 7 modules d'approfondissement, 13 règles de personnalisation. Tout passe au filtre d'un ton plus humain et plus systémique.

Le brouillon a été produit en interne par Lugia, à partir des spécifications V1.9. Avant de l'intégrer dans le code (étape suivante du chantier V2.0), nous avons besoin du regard de médecins généralistes en exercice pour valider deux choses :

- Que les formulations **résonnent** : un médecin se reconnaît dans la description, sans avoir l'impression qu'on lui fait la leçon.
- Que les chiffres **tiennent la route** : pas de pourcentage anxiogène ou faux, pas de benchmark générique qui sonne creux.

Cette relecture n'est pas une validation produit. C'est une relecture éditoriale ciblée — vos retours sur le ton, le wording et la crédibilité des chiffres.

---

## 2. Profil recherché pour les relecteurs

Pour avoir un regard varié sur les mêmes textes, l'idéal est de recruter une petite diversité de profils :

- Au moins **un médecin solo** installé depuis plus de 10 ans
- Au moins **un médecin en MSP ou en groupe**
- Au moins **un médecin junior** (installé depuis moins de 5 ans)
- Si possible, **un médecin en zone sous-dotée** et **un médecin en zone dense**

Pas besoin que le relecteur soit "favorable" à Lugia ni qu'il connaisse le check-up. Au contraire — un relecteur qui découvre le texte le lit comme un médecin réel le lirait.

---

## 3. Comment lire le brouillon

Le brouillon est organisé en 5 lots successifs. Inutile de tout lire d'un trait — la relecture peut se faire par séquences de 10 à 15 minutes.

| Lot | Contenu | Temps de lecture |
|---|---|---|
| **Lot 1** | Bloc A — Parcours patient (5 questions, ~25 reformulations + benchmarks) | 10–12 min |
| **Lot 2** | Bloc B — Équipe (5 questions, ~25 reformulations + benchmarks, dont routing solo) | 10–12 min |
| **Lot 3** | Bloc C — Outils & information (5 questions, ~25 reformulations + benchmarks) | 10–12 min |
| **Lot 4** | Modules d'approfondissement (7 modules « 1 chose cette semaine ») | 5–7 min |
| **Lot 5** | Règles de personnalisation (13 règles avec libellés Lugia) | 8–10 min |

Pour chaque option du questionnaire, vous trouverez :
- L'**énoncé de la question** (en italique)
- Les **4 options de réponse** (a, b, c, d) avec leur score interne (s=1 à 4 — vous n'avez pas à le commenter, c'est de la mécanique interne)
- La **reformulation Lugia** : c'est le texte que le médecin lit dans son rapport quand il a choisi cette option
- Le **benchmark** quand il existe : un chiffre contextuel pour situer la pratique

Concentrez-vous sur les reformulations et les benchmarks. C'est ce qui apparaîtra à l'écran.

---

## 4. Ce qu'on cherche à valider

Quatre choses à valider pendant la lecture :

**a. Le ton sonne juste.**
Lugia se veut sobre, factuel, descriptif. Pas de jargon consulting (« leverage », « best practice », « excellence opérationnelle »). Pas de morale (« vous devriez », « il faudrait »). Pas de drame (« épuisement professionnel », « burn-out imminent »). On décrit un système, pas une personne.

**b. Les formulations sont crédibles côté terrain.**
Un médecin doit pouvoir lire la phrase et se dire « oui, c'est exactement ça » — ou au moins « c'est plausible chez certains de mes confrères ». Une formulation qui paraît hors-sol (vocabulaire de cabinet de conseil, situation théorique qui n'arrive jamais) est à signaler.

**c. La distinction entre les 4 niveaux est claire.**
Pour chaque question, le passage de a (faible) à d (mature) doit faire un parcours intelligible. Si deux niveaux paraissent dire la même chose, ou si l'écart entre deux niveaux est trop grand, à signaler.

**d. Les benchmarks paraissent plausibles.**
Sans être chercheur, un médecin a une intuition raisonnable sur ce qui est crédible (« 60 % des passages aux urgences évitables » — plausible ou pas ?) et ce qui ne l'est pas. Tous les chiffres sont marqués **[À CONFIRMER]** dans le brouillon — c'est normal, on les sourcera après. Mais si un chiffre vous paraît invraisemblable côté terrain, c'est un signal fort qu'il faudrait le sourcer en priorité ou le retirer.

---

## 5. Ce qu'on cherche à invalider

Cinq pièges à débusquer pendant la lecture :

**a. Une formulation qui hérisse.**
Une phrase qui donne l'impression qu'on juge le médecin (et pas son organisation). Le test simple : si vous la lisiez dans votre propre rapport, est-ce qu'elle vous mettrait sur la défensive ? Si oui, à signaler.

**b. Du jargon caché.**
Lugia veut écrire en français métier, pas en français consulting. « Industrialisé », « process », « stack technique », « benchmark positionnel », « parcours patient » utilisé dans un sens administratif… Repérez les mots qui sonnent bureau et qui n'apparaîtraient jamais dans une vraie conversation médicale.

**c. Une situation décrite qui n'existe pas en cabinet réel.**
Si une option décrit une organisation que vous n'avez jamais vue ni en cabinet solo ni en MSP, signalez-la — soit la formulation est mal calibrée, soit la situation est si rare qu'elle ne mérite pas d'occuper une option.

**d. Un benchmark qui sonne faux.**
Si un chiffre vous paraît trop rond, trop générique, ou clairement décorrélé du terrain, dites-le. Mieux vaut retirer un benchmark que d'en garder un qui décrédibilise le reste.

**e. Une tonalité culpabilisante.**
Le check-up doit aider le médecin à voir son organisation, pas le faire culpabiliser de ses choix. Une phrase qui pointe une fragilité doit le faire factuellement, sans verbe d'obligation, sans pathos. Repérez les formulations qui glissent vers le reproche.

---

## 6. Points sensibles à challenger explicitement

Cinq endroits du brouillon où nous savons que la formulation est délicate et où votre regard sera particulièrement précieux.

### 6.1. Bloc C — Question C5 sur l'IA et la confidentialité

Cette question a été reformulée pour ne **pas** présupposer un usage illicite. Le risque inverse : qu'aucun médecin n'ose cocher l'option a (s=1) même si elle décrit honnêtement sa pratique.

**Ce qu'on aimerait savoir** :
- Les options a et b (les moins matures) sont-elles **assumables** par un médecin qui les pratique vraiment ?
- Y a-t-il un signal de jugement caché qui pousserait quelqu'un à mentir vers c ou d ?
- La formulation rend-elle l'option c (s=3) trop évidente comme « la bonne réponse à cocher » ?

### 6.2. Règles de personnalisation R-status-junior et R-status-senior

Le brouillon adapte la tonalité du rapport selon que le médecin est installé depuis moins de 5 ans (junior) ou plus de 15 ans (senior). L'idée : un médecin junior qui n'a pas encore eu le temps de structurer son cabinet n'a pas à recevoir le même message qu'un médecin qui n'a jamais structuré en 20 ans.

**Ce qu'on aimerait savoir** :
- La normalisation par temporalité (« vous êtes installé depuis 3 ans, c'est normal que… ») est-elle **bienvenue** ou **paternaliste** ?
- Pour un médecin senior, la formulation « après 20 ans, certaines habitudes ont eu le temps de s'installer » est-elle juste, ou est-ce qu'elle sonne comme un reproche déguisé ?

### 6.3. Règle R-bench-soloHero

Cette règle s'applique aux médecins solo qui ont des scores élevés en bloc B (équipe). Elle commente le fait de tout porter seul.

**Ce qu'on aimerait savoir** :
- L'interpellation directe (« vous portez beaucoup seul ») est-elle **percutante** ou **intrusive** ?
- Y a-t-il un médecin solo qui se reconnaîtrait dans cette description sans se sentir agressé ?

### 6.4. Règle R-bench-transmission (chiffre 30-40 %)

Le brouillon mentionne : « Un cabinet bien organisé se valorise 30-40 % mieux à la transmission. »

**Ce qu'on aimerait savoir** :
- L'ordre de grandeur est-il plausible (sans qu'on demande une précision scientifique) ?
- Le terme « transmission » est-il préférable à « cession », « rachat », « passation » dans votre langage quotidien ?

### 6.5. Niveau « À risque » — titres de diagnostic

Pour chaque axe (A/B/C), le niveau le plus bas reçoit un titre court de type *« Le patient navigue à vue »* ou *« L'équipe avance sans cadre partagé »*. Ces titres sont volontairement directs.

**Ce qu'on aimerait savoir** :
- Sont-ils trop **brutaux** ? Trop **doux** ? Justes ?
- Si vous receviez un rapport avec ce titre sur l'un de vos axes, quelle serait votre première réaction émotionnelle ?

---

## 7. Template de feedback

Pour faciliter la consolidation, merci d'utiliser ce format (ou copier-coller dans un mail).

```
# Relecture brouillon V2.0 — [Votre prénom]
Profil : [solo / MSP / groupe — années d'installation — département]
Temps passé : [X minutes]

## Impression générale
[2-3 lignes : globalement, est-ce que ça tient ? Qu'est-ce qui vous frappe en premier ?]

## Points qui vous ont semblé justes
- [Référence : lot/question/option, ex. "Lot 1 / A1 / option a"]
  [Pourquoi ça fonctionne]
- [Autre référence]
  ...

## Points qui vous ont hérissé ou semblé faux
- [Référence + extrait court de la formulation problématique]
  [Pourquoi ça ne va pas — une phrase suffit]
- [Autre référence]
  ...

## Benchmarks à challenger
- [Référence du chiffre + reformulation alternative si vous en voyez une]
  ...

## Réponses aux 5 points sensibles (§6)
6.1 — C5 IA : [option a/b assumables ? jugement caché ?]
6.2 — Junior/senior : [bienvenu ou paternaliste ?]
6.3 — Solo qui porte seul : [percutant ou intrusif ?]
6.4 — Transmission 30-40 % : [plausible ? bon mot ?]
6.5 — Titres "À risque" : [brutaux / doux / justes ?]

## Un point libre
[Quelque chose qui vous a fait penser pendant la lecture et qui n'entre pas dans les cases ci-dessus]
```

Pas besoin d'écrire long. Une demi-page bien ciblée vaut mieux qu'un essai exhaustif.

---

## 8. Modalités pratiques

**Comment vous procurer le brouillon** : Sébastien Château vous envoie le fichier `v2_editorial_draft.md` par e-mail (ou un PDF généré à partir, si vous préférez le format imprimable).

**Où renvoyer le retour** : par e-mail à `sebastien@lugia.fr`, en pièce jointe ou directement dans le corps du message.

**Délai souhaité** : sous 7 jours après réception. La consolidation des retours conditionne le démarrage de l'intégration technique de V2.0.

**Confidentialité** : le brouillon reflète un travail interne en cours. Merci de ne pas le diffuser à l'extérieur du cercle des relecteurs.

**Compensation** : un retour offert sur le rapport Lugia de votre cabinet (check-up complet + suivi à 6 semaines) à titre de remerciement, si vous le souhaitez.

---

## 9. Ce que vous ne devez pas faire

Pour rester dans les clous de la relecture éditoriale, **ne perdez pas de temps sur** :

- Le scoring interne (s=1 à 4) — c'est de la mécanique back-office.
- La structure des questions ou l'ordre des blocs — c'est figé par les spécifications V1.9.
- La forme du rapport final (mise en page, radar, couleurs) — c'est l'objet d'une autre relecture, plus tard.
- La cohérence des règles de personnalisation entre elles — c'est validé en interne.

Votre temps est précieux : 45 minutes sur le ton et les chiffres vaut beaucoup plus que 2 heures sur tout.

---

## 10. Consolidation interne (interne Lugia, pas pour le relecteur)

Cette section trace le post-traitement après réception des relectures.

**Étape 1 — Réception** : centralisation des 3 à 5 retours dans `resources/v2_editorial_reviews/` (un fichier par relecteur).

**Étape 2 — Synthèse** : un document `resources/v2_editorial_review_consolidation.md` qui agrège les retours par référence (lot/question/option/règle). Trois catégories :

- **À corriger sans débat** : ce sur quoi plusieurs relecteurs convergent — modification directe du brouillon.
- **À discuter en arbitrage** : ce sur quoi les retours divergent — décision Sébastien.
- **À documenter en limite assumée** : ce qui ne peut pas être corrigé en V2.0 mais doit être inscrit en `ROADMAP.md`.

**Étape 3 — V1.1 du brouillon** : `v2_editorial_draft.md` est mis à jour, en conservant la version 1.0 dans `v2_editorial_draft_v1.0.md` pour traçabilité.

**Étape 4 — Bascule** : feu vert pour démarrer l'intégration technique (création des fichiers `interview_protocol_v2.json`, `diagnostics_v2.json`, `modules_v2.json` et `src/v2/personalize.py` à partir du brouillon consolidé).

---

*Ce guide est versionné dans `resources/`. Toute évolution structurante du brouillon doit s'accompagner d'une mise à jour du guide.*
