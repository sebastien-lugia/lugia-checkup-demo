/**
 * V3-brand — tokens de design extraits du brand kit Lugia.
 *
 * Sources de vérité (cf `DECISIONS.md` D-031) :
 *  - `uploads/brand-master-v3.html` — axiomes, proportions, vocabulaire.
 *  - `uploads/brand-kit-v3.html` — palette, typo, scale, composants.
 *  - `uploads/lugia-survey-model.html` — palette mode jour/nuit + axes A/B/C
 *    + signal, c'est ici qu'on lit les valeurs hex définitives (variables
 *    `:root` et `[data-theme="dark"]`).
 *  - `uploads/lugia-survey-specs.md` — niveaux, scoring 0-3, ratios.
 *
 * Hiérarchie des couleurs (D-031, arbitrage #3) :
 *   1. Palette de marque : navy + ivoire + argent (décoratifs, identitaires).
 *   2. Couleur fonctionnelle : --signal-warn (ambre, sémantique, 1/écran max,
 *      3 usages canoniques — voir SIGNAL_WARN_USAGE plus bas).
 *   3. Couleurs d'axes : A/B/C (utilitaires de visualisation, n'apparaissent
 *      jamais hors radar et hors palette de l'axe).
 *
 * V3-brand-0 — Sébastien.
 */

/** Mode actif d'affichage. Le mode nuit est défaut pour le parcours questionnaire. */
export type V3Theme = "day" | "night";

/* ---------- Familles typographiques (D-031, arbitrage #1) ---------- */

/**
 * Deux familles éditoriales + un rôle utilitaire distinct.
 * Le mono n'est pas une famille de marque : il sert aux eyebrows, codes,
 * meta, captions. Jamais pour du body ou du titre.
 */
export const fonts = {
  serif:
    '"Lora", "Iowan Old Style", "Times New Roman", Times, serif',
  sans:
    '"Onest", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
  mono:
    '"IBM Plex Mono", "SF Mono", Menlo, Consolas, monospace',
} as const;

/** Règle absolue : Lora regular uniquement, jamais d'italique, jamais en caps. */
export const fontRules = {
  loraMinSize: 22, // pixels — sous 22 px, on bascule sur Onest
  italicAllowed: false,
  loraInCapsAllowed: false,
} as const;

/* ---------- Palette de marque, mode JOUR ---------- */
/**
 * Mode jour = communication corporate / synthèse / plan d'action / écran de fin.
 * Source : brand-kit-v3.html `:root` + model `:root`.
 */
export const dayPalette = {
  // Famille navy (texte, surfaces sombres ponctuelles)
  // Charte A1 : navy / navy-2 / navy-3 alignés sur les hex exacts.
  navy: "#1A2333",
  navy2: "#232B41",  // ex-navy800
  navy3: "#2D365A",  // nouveau token (charte)
  navy800: "#232B41",  // alias rétro-compatible vers navy2
  navy600: "#3A4360",  // ink-600 charte
  navy400: "#6E7795",  // ink-400 charte
  navy200: "#b8becc",
  navy100: "#d9dce4",

  // Famille ivoire (canvas = la marque)
  ivory: "#f4efe5",
  ivoryLight: "#faf7f1",
  ivory2: "#f8f4eb",
  paper: "#fbfaf6", // fond body en mode jour

  // Famille argent (signature visuelle, jamais décorative)
  // 2026-05-23 : argent passé de #B5B5B8 à #8E8E91 — le ton plus clair
  // était difficilement lisible comme texte d'eyebrow / label de tableau
  // sur fond ivoire (#fbfaf6). On aligne sur la valeur du mode nuit pour
  // une lecture confortable dans les deux modes. argentLight reste plus
  // clair (effet décoratif fin), argentDeep désormais plus foncé (#6E6E70).
  argent: "#8E8E91",
  argentLight: "#B5B5B8",
  argentDeep: "#6E6E70",

  // Filets et bordures
  line: "rgba(26,35,51,0.12)",
  lineStrong: "rgba(26,35,51,0.22)",
} as const;

/* ---------- Palette de marque, mode NUIT ---------- */
/**
 * Mode nuit = parcours questionnaire (défaut). Les rôles navy/ivory s'inversent
 * sémantiquement : navy devient la valeur claire (texte), ivoire devient
 * la valeur sombre (surface). Le code conserve les NOMS de la palette jour
 * pour la cohérence des composants, seules les valeurs changent.
 *
 * Source : model `[data-theme="dark"]`.
 */
export const nightPalette = {
  // En mode nuit, "navy" est la couleur du TEXTE → claire (inversion sémantique).
  // On utilise l'ivoire chaleureux (#f4efe5) plutôt que le paper quasi-blanc (#fbfaf6)
  // pour conserver la chaleur de la canvas brand — sinon le texte paraît blanc clinique.
  navy: "#f4efe5",
  navy800: "#d0d6e2",
  navy600: "#a8b2c8",
  navy400: "#6e7a95",
  navy200: "#3a4255",
  navy100: "#252e42",

  // Et "ivory" est la SURFACE → sombre. Charte A1 : navy-2/navy-3 exacts.
  ivory: "#232B41",       // navy-2 charte = surface carte
  ivoryLight: "#2D365A",  // navy-3 charte = surface élevée
  ivory2: "#2D365A",      // navy-3 charte = surface élevée
  paper: "#1A2333",       // navy charte = fond body en mode nuit

  // Argent — inversion claire/sombre
  argent: "#8E8E91",
  argentLight: "#6a6a6d",
  argentDeep: "#B5B5B8",

  line: "rgba(251,250,246,0.10)",
  lineStrong: "rgba(251,250,246,0.20)",
} as const;

/* ---------- Tokens d'axes radar / barres (CHARTE A1 — argent uniforme) ---------- */
/**
 * La charte d'application questionnaire v1.0 (règle A1 + section 03) interdit
 * toute couleur sémantique par axe. La différenciation des 3 axes A/B/C se
 * fait uniquement par direction sur le radar (RADAR_ANGLES_DEG), par numéro
 * et par badge contextuel (navy-2 / transparent+argent / ivoire — règle C2-C4).
 *
 * On garde la structure A/B/C/Ag/Bg/Cg/Ah/Bh/Ch pour ne pas casser l'API des
 * composants, mais TOUS les tokens pointent vers l'argent (palette de marque).
 * Conséquence : sur le radar, les 3 axes se lisent par leur position
 * géométrique et leur label texte, jamais par leur teinte.
 *
 *  - `A/B/C` → argent (#B5B5B8)
 *  - `Ah/Bh/Ch` → argent-deep en jour (#8E8E91) / argent-light en nuit (#D2D2D5)
 *  - `Ag/Bg/Cg` → fond argent dilué à 8-10 %
 *
 * Migration vers la charte v1.0 (T-V3-charte-A1, 2026-05-21).
 */
export const dayAxes = {
  A: "#B5B5B8",
  Ag: "rgba(181,181,184,0.08)",
  Ah: "#8E8E91",
  B: "#B5B5B8",
  Bg: "rgba(181,181,184,0.08)",
  Bh: "#8E8E91",
  C: "#B5B5B8",
  Cg: "rgba(181,181,184,0.08)",
  Ch: "#8E8E91",
} as const;

export const nightAxes = {
  A: "#B5B5B8",
  Ag: "rgba(181,181,184,0.10)",
  Ah: "#D2D2D5",
  B: "#B5B5B8",
  Bg: "rgba(181,181,184,0.10)",
  Bh: "#D2D2D5",
  C: "#B5B5B8",
  Cg: "rgba(181,181,184,0.10)",
  Ch: "#D2D2D5",
} as const;

/* ---------- Couleur fonctionnelle : signal d'attention ---------- */

/**
 * `--signal-warn` — token séparé de la palette de marque.
 *
 * Valeurs candidates testées en T-V3-1 (voir
 * `wireframes/v3_tokens_ambre_test.html`) :
 *
 *  | Variante     | Jour       | Nuit       | Profil                       |
 *  | ------------ | ---------- | ---------- | ---------------------------- |
 *  | terreux      | #7a6030    | #c4a055    | brun-doré sourdine (modèle)  |
 *  | brûlé        | #b5780a    | #d68f1a    | orange brûlé classique       |
 *  | saturé       | #c8851a    | #e8a035    | ambre vif et lisible         |
 *
 * Valeur de DÉPART retenue (modifiable en T-V3-1 après visuel) : terreux,
 * cohérente avec le modèle cible et la consigne « jamais alarmiste ».
 */
export const daySignalWarn = {
  // Charte A1 : or-signal #C8A04A, identique jour et nuit (rgb 200,160,74).
  default: "#C8A04A",
  surface: "rgba(200,160,74,0.10)", // surface 10 %
  border: "rgba(200,160,74,0.32)", // bordure 32 %
} as const;

export const nightSignalWarn = {
  default: "#C8A04A",
  surface: "rgba(200,160,74,0.10)",
  border: "rgba(200,160,74,0.32)",
} as const;

/**
 * Les TROIS SEULS usages canoniques du signal-warn (D-031 #3, charte
 * questionnaire). Toute autre apparition doit faire l'objet d'une décision
 * explicite.
 */
export const SIGNAL_WARN_USAGE = {
  benchmarkCritical:
    "Benchmark avec dépassement de seuil signalé (ex. % rappels évitables).",
  crossedSignal:
    "Signal croisé d'alerte (ex. axe A < 35 ET volume hebdo > 200).",
  highStakesModule:
    "Module à fort enjeu / urgence (effort élevé OU gain < 1 semaine critique).",
} as const;

/** Règle d'or : un seul élément en signal-warn par écran maximum. */
export const SIGNAL_WARN_MAX_PER_SCREEN = 1;

/* ---------- Shimmer (argent brossé) ---------- */
/**
 * Utilities CSS — à appliquer comme classes statiques côté composants.
 * Pour fond sombre (navy/nuit) → `.shimmer` / pour fond clair → `.shimmer-ink`.
 * Voir brand-kit-v3.html lignes 30-65.
 *
 * Ces strings sont les valeurs CSS prêtes à coller dans une property
 * `background`. Le `background-clip: text` reste à appliquer côté composant.
 */
export const shimmers = {
  light: [
    "repeating-linear-gradient(90deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0.08) 1px, rgba(0,0,0,0.05) 2px, rgba(255,255,255,0) 3px)",
    "linear-gradient(90deg, #8E8E91 0%, #C5C5C8 12%, #ECECEE 24%, #B5B5B8 38%, #DDDDDF 52%, #A1A1A4 64%, #DBDBDD 78%, #ABABAE 90%, #8E8E91 100%)",
  ].join(", "),
  ink: [
    "repeating-linear-gradient(90deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0.10) 1px, rgba(0,0,0,0.08) 2px, rgba(255,255,255,0) 3px)",
    "linear-gradient(90deg, #3A3A3D 0%, #6A6A6E 14%, #8E8E92 28%, #4F4F53 42%, #7D7D81 56%, #3F3F43 70%, #757579 84%, #3A3A3D 100%)",
  ].join(", "),
  line: "linear-gradient(90deg, transparent 0%, #B5B5B8 20%, #ECECEE 50%, #B5B5B8 80%, transparent 100%)",
} as const;

/* ---------- Proportions de surface (D-031, arbitrage #2 + charte A2) ---------- */
/**
 * Quotas d'usage GLOBAUX recommandés par la charte d'application questionnaire v1.0,
 * mesurés à l'échelle du parcours entier (pas par écran).
 *
 *   Nuit (navy)      65 %  — cœur du flow : intro, profil, énergie, blocs, transitions, chat.
 *   Jour (ivoire)    25 %  — livrables : synthèse, plan d'action, fin, sections d'info dense.
 *   Argent            5 %  — moments-signature (logos, filets, polygones radar).
 *   Or-signal       < 5 %  — sémantique d'alerte, jamais décoratif.
 *
 * À considérer comme un guide de composition à l'échelle du parcours, pas une règle
 * au pixel près. Le `ThemeToggleV3` permet à l'utilisateur d'inverser ponctuellement.
 */
export const surfaceRatios = {
  night: 65,
  day: 25,
  argent: 5,
  warn: 5,
} as const;

/* ---------- Échelle typographique ---------- */
/**
 * Source brand-kit-v3.html section « scale ». Toutes les tailles sont en
 * pixels. line-height en multiplicateur quand non précisé.
 */
export const typeScale = {
  // Hero / Display
  h1: { size: 96, lineHeight: 1.15, family: "serif", weight: 400, letterSpacing: -0.03 },
  // Sections
  h2: { size: 48, lineHeight: 1.15, family: "serif", weight: 400, letterSpacing: -0.02 },
  h3: { size: 28, lineHeight: 1.15, family: "serif", weight: 400, letterSpacing: -0.01 },
  // Body
  lead: { size: 20, lineHeight: 1.4, family: "sans", weight: 400, letterSpacing: 0 },
  body: { size: 16, lineHeight: 1.55, family: "sans", weight: 400, letterSpacing: 0 },
  bodySmall: { size: 14, lineHeight: 1.55, family: "sans", weight: 400, letterSpacing: 0 },
  // Utilitaire mono
  eyebrow: { size: 11, lineHeight: 1.4, family: "mono", weight: 500, letterSpacing: 0.14, uppercase: true },
  caption: { size: 10, lineHeight: 1.4, family: "mono", weight: 400, letterSpacing: 0.12, uppercase: true },
} as const;

/* ---------- Niveaux qualitatifs (D-031, arbitrage #4) ---------- */
/**
 * Nomenclature V2.0 conservée. La fonction `levelOf` convertit un score 0-100
 * en niveau qualitatif 0-3 (D-031, arbitrage #5).
 *
 * Seuils du modèle cible : <35 / <55 / <78 / >=78.
 */
export const LEVELS = [
  { id: 0, label: "Fragile" },
  { id: 1, label: "En transition" },
  { id: 2, label: "Solide" },
  { id: 3, label: "Mature" },
] as const;

export type V3LevelId = 0 | 1 | 2 | 3;

export function levelOf(score: number): V3LevelId {
  if (score < 35) return 0;
  if (score < 55) return 1;
  if (score < 78) return 2;
  return 3;
}

export function levelLabel(score: number): string {
  return LEVELS[levelOf(score)].label;
}

/* ---------- Angles radar (D-031, arbitrage #8) ---------- */
/**
 * Axe A pointant vers le haut (-90°), puis rotation horaire.
 *  - A à -90° (12 h)
 *  - B à 30° (4 h)
 *  - C à 150° (8 h)
 * Cohérent avec le modèle cible (lugia-survey-model.html).
 */
export const RADAR_ANGLES_DEG = {
  A: -90,
  B: 30,
  C: 150,
} as const;

/* ---------- Helper : palette par thème ---------- */
/**
 * Récupère la palette complète d'un thème (palette + axes + signal-warn).
 * Permet aux composants V3 de ne pas faire eux-mêmes le branchement
 * day/night — on leur passe le thème, ils consomment.
 */
export function paletteFor(theme: V3Theme) {
  if (theme === "day") {
    return {
      ...dayPalette,
      axes: dayAxes,
      signalWarn: daySignalWarn,
      shimmer: shimmers.ink, // sur fond clair → shimmer assombri
    };
  }
  return {
    ...nightPalette,
    axes: nightAxes,
    signalWarn: nightSignalWarn,
    shimmer: shimmers.light, // sur fond sombre → shimmer clair
  };
}

/* ---------- Exports groupés (pour confort d'import) ---------- */
export const v3Tokens = {
  fonts,
  fontRules,
  dayPalette,
  nightPalette,
  dayAxes,
  nightAxes,
  daySignalWarn,
  nightSignalWarn,
  shimmers,
  surfaceRatios,
  typeScale,
  LEVELS,
  RADAR_ANGLES_DEG,
  paletteFor,
  levelOf,
  levelLabel,
  SIGNAL_WARN_USAGE,
  SIGNAL_WARN_MAX_PER_SCREEN,
} as const;

export default v3Tokens;
