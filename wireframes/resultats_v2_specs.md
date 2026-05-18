# Specs design — Page check-up préventif Lugia

## Contexte
Page de résultats d'un questionnaire de diagnostic pour médecins généralistes. Ton sobre, professionnel, sans couleurs vives. Le fichier de référence est `lugia_checkup_v2.html`.

---

## Palette

| Usage | Valeur |
|---|---|
| Texte principal | `#111` |
| Texte secondaire | `#555` |
| Texte discret | `#999` |
| Bordures | `#e5e5e5` |
| Fond subtil (gris très clair) | `#f7f7f7` |
| Vert (points forts uniquement) | `#2e7d4f` |
| Orange (points de vigilance uniquement) | `#b45200` |
| Bleu accent (bouton CTA recommandé) | `#1a56a0` |

**Règle importante** : le vert est réservé aux "Points forts" des angles de cabinet. Ne pas l'utiliser ailleurs pour éviter toute confusion sémantique.

---

## Typographie
- Police système : `-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, sans-serif`
- Corps de texte : 15px / line-height 1.6
- Labels de section : 11px, uppercase, letter-spacing 0.1em, couleur `#999`
- Titres de cartes : 14–15px, font-weight 600

---

## Structure de la page

### 1. Nav
Logo Lugia à gauche, email + lien déconnexion à droite. Bordure basse `1px solid #e5e5e5`.

### 2. Hero
- Breadcrumb : "Diagnostic préventif gratuit" (label de section)
- H1 : "Votre cabinet vu par le check-up"
- Date en gris sous le titre
- Bloc situation avec bordure gauche (`3px solid #e5e5e5`, padding-left 20px)
  - Deux paragraphes séparés (saut de ligne entre "Au quotidien…" et "Deux points…")
  - Les deux points prioritaires : tirets `–` gris, pas de bullets colorées
  - Callout en fond gris `#f7f7f7`, italique, coins arrondis

### 3. Grille 3 angles
- 3 colonnes égales, gap 1px, fond de grille `#e5e5e5` (crée les séparateurs), border-radius 8px
- Chaque colonne : titre 14px bold + badge statut alignés en flex space-between
- **Badges statut** :
  - "À surveiller" : fond `#f0f0f0`, texte `#555`
  - "En tension" : fond `#fdf0e0`, texte `#9a5a00`
- Séparateur `1px solid #ebebeb` entre "Points forts" et "Points de vigilance" dans chaque colonne
- Labels "Points forts" / "Points de vigilance" : 10px, uppercase, bold, couleurs vert/orange
- Items en liste : tirets `–` gris, 13px
- **Légende** sous la grille expliquant les deux badges

### 4. Opportunités d'action
3 cartes empilées verticalement. Chaque carte :

**En-tête** (`background: #f7f7f7`, bordure basse) :
- Numéro grand (28px, bold, couleur `#d0d8f0`) à gauche
- Titre (15px, bold) à droite du numéro
- Flex row, gap 16px, align-items center
- **Pas de badge "Priorité X"** — le numéro seul suffit

**Corps** : 2 colonnes égales séparées par `1px solid #e5e5e5`
- Colonne gauche (fond blanc) : label "LA SITUATION" + texte
- Colonne droite (fond `#fcfcfc`) : label "L'ACTION PROPOSÉE" + texte
- Labels : 10px, uppercase, bold, couleur `#999`
- Texte : 13px, couleur `#555`

**Note "À confirmer"** (bas de carte) :
- Fond `#f7f7f7`, bordure haute, padding 12px 18px
- `::before` pseudo-élément : "À confirmer ensemble" en 10px uppercase bold `#999` — **sur sa propre ligne** (flex-direction column, gap 4px)
- Texte de la note : 12.5px, couleur `#555`

### 5. Prochaine étape
3 cartes en grille 3 colonnes, gap 12px.
- Cartes standard : bordure `#e5e5e5`, padding 20px, border-radius 8px
- **Carte recommandée** : bordure `#1a56a0` (bleu), bouton CTA fond bleu + texte blanc
- Cartes secondaires : bouton CTA bordure grise + texte gris
- Tag catégorie : 10px uppercase bold, gris pour les standards, bleu pour le recommandé

### 6. Footer
Flex space-between, 12px, couleur `#999`. Liens légaux à droite.

---

## Règles de ton visuel
- Jamais de bullets colorées (points, ronds) — toujours des tirets `–` gris
- Pas de vert hors des "Points forts" des angles
- Les couleurs servent la sémantique, pas la décoration
- Fond de page blanc, pas de sections colorées pleine largeur
- Max-width 840px, centré, padding horizontal 32px

---

## Ce qui a été délibérément écarté
- Accordéon/liste verticale pour les 3 angles (trop aéré)
- 4 sous-sections par carte opportunité (trop dense)
- Badge "Priorité 1/2/3" coloré (ambigu — pâle ≠ moins urgent)
- Bullets colorées dans l'introduction
- 3 options "Prochaine étape" à égalité visuelle
