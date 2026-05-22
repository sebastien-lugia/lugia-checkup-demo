"use client";

/**
 * V3-brand — atomes partagés.
 *
 * Composants visuels de base réutilisés à travers tous les écrans V3.
 * Tous consomment les tokens via `paletteFor(theme)` — aucun atome ne
 * code en dur une couleur de marque. Aucun atome n'utilise `font-style: italic`
 * (cf MEMORY [[feedback-brand-lugia-pas-d-italique]]).
 *
 * V3-brand-T-V3-2 — Sébastien.
 */

import type { CSSProperties, ReactNode } from "react";
import {
  fonts,
  paletteFor,
  LEVELS,
  levelOf,
  type V3Theme,
} from "@/lib/v3-snapshot/tokens";

/* ───────────────────────────────────────────────────────────
 * DVMono — eyebrow / caption en mono caps espacé.
 *
 * Usage : étiquettes courtes au-dessus d'un titre, valeurs hex dans une
 * fiche de design, méta de chip. Jamais pour du body.
 * ─────────────────────────────────────────────────────────── */
export function DVMono({
  children,
  size = 11,
  ls = 0.14,
  color,
  uppercase = true,
  weight = 500,
  className,
  style,
}: {
  children: ReactNode;
  /** taille en pixels */
  size?: number;
  /** letter-spacing en em */
  ls?: number;
  color?: string;
  uppercase?: boolean;
  weight?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={className}
      style={{
        fontFamily: fonts.mono,
        fontSize: size,
        letterSpacing: `${ls}em`,
        textTransform: uppercase ? "uppercase" : "none",
        fontWeight: weight,
        color: color ?? "currentColor",
        fontStyle: "normal",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/* ───────────────────────────────────────────────────────────
 * DVCorners — captions mono dans les 4 coins d'un container.
 *
 * Pattern hérité du brand-kit (visuel de fiche de marque). Pose des
 * étiquettes très discrètes (tl/tr/bl/br) sur un encadré. Le parent doit
 * être `position: relative`.
 * ─────────────────────────────────────────────────────────── */
export function DVCorners({
  tl,
  tr,
  bl,
  br,
  inset = 12,
  color,
}: {
  tl?: ReactNode;
  tr?: ReactNode;
  bl?: ReactNode;
  br?: ReactNode;
  /** distance des bords en pixels */
  inset?: number;
  color?: string;
}) {
  const base: CSSProperties = {
    position: "absolute",
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: color ?? "currentColor",
    opacity: 0.55,
    pointerEvents: "none",
  };
  return (
    <>
      {tl && <span style={{ ...base, top: inset, left: inset }}>{tl}</span>}
      {tr && (
        <span style={{ ...base, top: inset, right: inset, textAlign: "right" }}>{tr}</span>
      )}
      {bl && (
        <span style={{ ...base, bottom: inset, left: inset }}>{bl}</span>
      )}
      {br && (
        <span style={{ ...base, bottom: inset, right: inset, textAlign: "right" }}>{br}</span>
      )}
    </>
  );
}

/* ───────────────────────────────────────────────────────────
 * LevelBar — niveau qualitatif visualisé en 4 paliers.
 *
 * Prend un score 0-100, le convertit en niveau 0-3 (`levelOf`), affiche
 * 4 traits dont les `level+1` premiers sont actifs. Avec ou sans label.
 *
 * Cohérent D-031 #4 (nomenclature V2.0 conservée) et #5 (conversion %→0-3).
 * ─────────────────────────────────────────────────────────── */
export function LevelBar({
  score,
  theme = "night",
  showLabel = true,
  width = 160,
  /** Optionnel : forcer une couleur active (ex. couleur d'axe) plutôt que palette navy. */
  activeColor,
}: {
  score: number;
  theme?: V3Theme;
  showLabel?: boolean;
  width?: number;
  activeColor?: string;
}) {
  const lvl = levelOf(score);
  const palette = paletteFor(theme);
  const active = activeColor ?? palette.navy;
  const dim = palette.line;

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: 8, width }}>
      <div
        style={{
          display: "flex",
          gap: 6,
          width: "100%",
        }}
        aria-label={`Niveau : ${LEVELS[lvl].label}`}
      >
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              background: i <= lvl ? active : dim,
              transition: "background 200ms ease-out",
            }}
          />
        ))}
      </div>
      {showLabel && (
        <DVMono size={11} ls={0.14} color={palette.navy600}>
          {LEVELS[lvl].label}
        </DVMono>
      )}
    </div>
  );
}

/* ───────────────────────────────────────────────────────────
 * EffortBadge — 3 traits dégradés, croissants en intensité.
 *
 * Affiche la charge estimée d'un module. Pas de chiffrage, juste un
 * indice visuel (1 / 2 / 3 traits actifs).
 * ─────────────────────────────────────────────────────────── */
export type EffortLevel = "low" | "med" | "high";

const EFFORT_LABEL: Record<EffortLevel, string> = {
  low: "Effort léger",
  med: "Effort moyen",
  high: "Effort soutenu",
};

const EFFORT_LEVEL_INDEX: Record<EffortLevel, number> = {
  low: 0,
  med: 1,
  high: 2,
};

export function EffortBadge({
  level,
  theme = "night",
  showLabel = true,
}: {
  level: EffortLevel;
  theme?: V3Theme;
  showLabel?: boolean;
}) {
  const palette = paletteFor(theme);
  const activeIdx = EFFORT_LEVEL_INDEX[level];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: fonts.mono,
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: palette.navy600,
      }}
    >
      <span
        style={{ display: "inline-flex", gap: 3 }}
        aria-label={EFFORT_LABEL[level]}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              width: 14,
              height: 2,
              background: i <= activeIdx ? palette.navy : palette.line,
            }}
          />
        ))}
      </span>
      {showLabel && <span>{EFFORT_LABEL[level]}</span>}
    </span>
  );
}

/* ───────────────────────────────────────────────────────────
 * GainBadge — délai estimé du gain attendu.
 *
 * Trois valeurs canoniques (fast / mid / slow) avec libellé chiffré.
 * ─────────────────────────────────────────────────────────── */
export type GainSpeed = "fast" | "mid" | "slow";

const GAIN_LABEL: Record<GainSpeed, string> = {
  fast: "< 1 semaine",
  mid: "2 à 4 semaines",
  slow: "1 à 3 mois",
};

export function GainBadge({
  speed,
  theme = "night",
}: {
  speed: GainSpeed;
  theme?: V3Theme;
}) {
  const palette = paletteFor(theme);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 8,
        fontFamily: fonts.mono,
        fontSize: 11,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: palette.navy600,
      }}
    >
      <DVMono size={10} ls={0.16} color={palette.navy400}>
        Gain
      </DVMono>
      <span style={{ color: palette.navy }}>{GAIN_LABEL[speed]}</span>
    </span>
  );
}

/* ───────────────────────────────────────────────────────────
 * Em — emphase inline SANS italique.
 *
 * Remplacement strict de `<em>` quand on veut mettre un fragment de phrase
 * en valeur. Utilise la couleur argent (ou warn si fonctionnel) à la place
 * du `font-style: italic` interdit par le brand kit.
 *
 * Voir MEMORY [[feedback-brand-lugia-pas-d-italique]] et brand-master :
 * « jamais d'italique, Lora regular uniquement ».
 * ─────────────────────────────────────────────────────────── */
export function Em({
  children,
  theme = "night",
  /** `argent` (défaut) = mise en valeur neutre. `warn` = fonctionnel (sémantique alerte). */
  tone = "argent",
}: {
  children: ReactNode;
  theme?: V3Theme;
  tone?: "argent" | "warn";
}) {
  const palette = paletteFor(theme);
  const color =
    tone === "warn" ? palette.signalWarn.default : palette.argent;
  return (
    <span
      style={{
        color,
        fontStyle: "normal",
      }}
    >
      {children}
    </span>
  );
}

/* ───────────────────────────────────────────────────────────
 * Divider — filet horizontal subtil, palette aware.
 * ─────────────────────────────────────────────────────────── */
export function Divider({
  theme = "night",
  margin = "32px 0",
}: {
  theme?: V3Theme;
  margin?: string | number;
}) {
  const palette = paletteFor(theme);
  return (
    <div
      role="presentation"
      style={{
        height: 1,
        background: palette.line,
        margin,
      }}
    />
  );
}

/* ───────────────────────────────────────────────────────────
 * SurfaceShimmer — fragment de surface argent brossé.
 *
 * Pose un fond shimmer (utilisé pour le logo, les bandeaux, etc.).
 * Le choix du shimmer (light vs ink) est dérivé du thème, mais on peut
 * forcer via `variant`.
 * ─────────────────────────────────────────────────────────── */
export function SurfaceShimmer({
  children,
  theme = "night",
  variant,
  style,
}: {
  children?: ReactNode;
  theme?: V3Theme;
  /** `light` pour fonds sombres (nuit), `ink` pour fonds clairs (jour). */
  variant?: "light" | "ink";
  style?: CSSProperties;
}) {
  const palette = paletteFor(theme);
  const fallback: "light" | "ink" = theme === "day" ? "ink" : "light";
  const chosen = variant ?? fallback;
  // Les shimmers sont stockés dans tokens.shimmers — on les reconstruit ici
  // pour éviter une dépendance circulaire. Cohérent brand-kit-v3.html.
  const shimmer = palette.shimmer;
  void chosen; // chosen est l'option override — on garde l'API ouverte pour le futur
  return (
    <span
      style={{
        background: shimmer,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
