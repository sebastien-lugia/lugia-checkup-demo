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
} from "@/lib/v3/tokens";

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

/* ───────────────────────────────────────────────────────────
 * BlocBadge — repère visuel du bloc A/B/C (charte C2/C3/C4)
 *
 * Spec charte (section 03 Encodage des blocs) :
 *  - A : badge plein navy-2, lettre A en ivoire mono
 *  - B : badge transparent, bordure argent, lettre B en argent
 *  - C : badge ivoire plein, lettre C en navy
 *
 * Adaptation Day mode (charte ne précise pas explicitement) :
 *  - C en Mode Jour : ivoire plein devient invisible sur fond ivoire,
 *    donc on inverse → fond navy, lettre C en ivoire. Cohérent
 *    sémantiquement (C = bloc saturé du mode opposé au fond courant).
 * ─────────────────────────────────────────────────────────── */

type BlocBadgeId = "A" | "B" | "C";

export function BlocBadge({
  id,
  theme = "night",
  size = "md",
  style,
}: {
  id: BlocBadgeId;
  theme?: V3Theme;
  /** sm = 24px (cartes étroites, chantiers) ; md = 36px (transition, axis cards) */
  size?: "sm" | "md";
  style?: CSSProperties;
}) {
  const palette = paletteFor(theme);
  const dim = size === "sm" ? 24 : 36;
  const fontSize = size === "sm" ? 12 : 16;

  // Hex de marque invariants (pas mode-dependent — le badge identifie
  // l'axe, pas le mode).
  const BRAND_NAVY = "#1A2333";
  const BRAND_NAVY2 = "#232B41";
  const BRAND_IVORY = "#F4EFE5";

  // L'argent du badge B doit s'adapter au mode pour rester lisible
  // (argentDeep en Jour = plus contrasté sur ivoire).
  const argentForB = theme === "day" ? palette.argentDeep : palette.argent;

  // Style par bloc — l'inversion C en Day est la seule adaptation mode-aware.
  // Reflet adaptatif : blanc sur fond sombre, navy sur fond clair.
  // L'overlay shine doit contraster avec le fond du badge pour etre visible.
  const SHINE_LIGHT = "rgba(255, 255, 255, 0.32)"; // pour fonds sombres
  const SHINE_DARK = "rgba(26, 35, 51, 0.18)"; // pour fonds clairs

  const styles: Record<BlocBadgeId, CSSProperties & { "--bloc-badge-shine"?: string }> = {
    A: {
      background: BRAND_NAVY2,
      color: BRAND_IVORY,
      border: `1px solid ${BRAND_NAVY2}`,
      "--bloc-badge-shine": SHINE_LIGHT, // fond sombre dans les 2 modes
    },
    B: {
      background: "transparent",
      color: argentForB,
      border: `1px solid ${argentForB}`,
      // Night: transparent sur navy = fond sombre → shine clair
      // Day:   transparent sur ivoire = fond clair → shine sombre
      "--bloc-badge-shine": theme === "day" ? SHINE_DARK : SHINE_LIGHT,
    },
    C: {
      background: theme === "day" ? palette.paper : BRAND_IVORY,
      color: BRAND_NAVY,
      border:
        theme === "day"
          ? `1px solid ${BRAND_NAVY}`
          : `1px solid ${BRAND_IVORY}`,
      "--bloc-badge-shine": SHINE_DARK, // fond clair dans les 2 modes
    },
  };

  return (
    <>
      {/* Effet de reflet adapte a la luminosite du fond — esprit "argent brosse" charte */}
      <style>{`
        .lc-bloc-badge {
          position: relative;
          overflow: hidden;
          isolation: isolate;
        }
        .lc-bloc-badge::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 35%,
            var(--bloc-badge-shine, rgba(255, 255, 255, 0.32)) 50%,
            transparent 65%
          );
          transform: translateX(-110%);
          transition: transform 720ms cubic-bezier(0.4, 0, 0.2, 1);
          pointer-events: none;
          z-index: 1;
        }
        .lc-bloc-badge:hover::before {
          transform: translateX(110%);
        }
        .lc-bloc-badge > .lc-bloc-badge-letter {
          position: relative;
          z-index: 2;
        }
        @media (prefers-reduced-motion: reduce) {
          .lc-bloc-badge::before { display: none; }
        }
      `}</style>
      <span
        className="lc-bloc-badge"
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: dim,
          height: dim,
          fontFamily: fonts.mono,
          fontSize,
          fontWeight: 500,
          letterSpacing: "0.02em",
          lineHeight: 1,
          flexShrink: 0,
          fontStyle: "normal",
          ...styles[id],
          ...style,
        }}
      >
        <span className="lc-bloc-badge-letter">{id}</span>
      </span>
    </>
  );
}

/* ───────────────────────────────────────────────────────────
 * TypingDots — 3 points argent qui pulsent (charte H8)
 *
 * Remplace les spinners et autres loaders rotatifs : la charte
 * impose 3 points argent (5 px chacun), pulsation décalée, sans
 * conteneur. Utilisé pour les états de chargement (hydratation,
 * traitement IA, attente backend).
 * ─────────────────────────────────────────────────────────── */

export function TypingDots({
  theme = "night",
  size = 6,
  gap = 6,
}: {
  theme?: V3Theme;
  size?: number;
  gap?: number;
}) {
  const palette = paletteFor(theme);
  return (
    <>
      <style>{`
        @keyframes v3DotPulse {
          0%, 80%, 100% { opacity: 0.30; transform: scale(0.85); }
          40% { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .v3-dot { animation: none !important; opacity: 0.6 !important; }
        }
      `}</style>
      <div
        aria-label="Chargement"
        role="status"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap,
        }}
      >
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="v3-dot"
            style={{
              width: size,
              height: size,
              borderRadius: "50%",
              background: palette.argent,
              animation: `v3DotPulse 1200ms ${i * 200}ms ease-in-out infinite`,
            }}
          />
        ))}
      </div>
    </>
  );
}
