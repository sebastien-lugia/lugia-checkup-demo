"use client";

/**
 * V3-brand — toggle thème jour / nuit (pill qui glisse).
 *
 * Une « pill » (rectangle plein, no border-radius) glisse d'une moitié à
 * l'autre via `transform: translateX` pour matérialiser le changement
 * d'état. Les labels « Jour » / « Nuit » restent statiques en couleur ;
 * leur couleur change selon que la pill est sous eux ou pas — visuellement,
 * on voit le mouvement quand on switche.
 *
 * Cohérent brand : rectangulaire (aucun border-radius), couleurs de la
 * palette, transitions 250 ms ease-out.
 *
 * V3-brand-T-V3-5-fix-2.
 */

import { fonts, paletteFor, type V3Theme } from "@/lib/v3/tokens";

const OPT_WIDTH = 76; // largeur d'une moitié (label + icône)
const OPT_HEIGHT = 28;

export function ThemeToggleV3({
  theme,
  onToggle,
  offsetTop = 11,
}: {
  theme: V3Theme;
  onToggle: () => void;
  /** Surchargeable pour empiler avec un autre header (intro page). */
  offsetTop?: number;
}) {
  const palette = paletteFor(theme);

  // La pill glisse : 0 (gauche = Jour) ou OPT_WIDTH (droite = Nuit).
  const pillX = theme === "day" ? 0 : OPT_WIDTH;

  // Contraste fort entre actif et inactif :
  // actif = navy avec fontWeight 600 (clair, présent)
  // inactif = navy400 à opacity 0.45 (très estompé, on voit que c'est pas actif)
  const labelStyle = (isActive: boolean) => ({
    color: isActive ? palette.navy : palette.navy400,
    fontWeight: (isActive ? 600 : 400) as 400 | 600,
    opacity: isActive ? 1 : 0.45,
    transition: "color 250ms ease-out, opacity 250ms ease-out, font-weight 250ms ease-out",
  });

  // Click sur une pastille : no-op si on est déjà sur ce thème
  const goDay = () => { if (theme !== "day") onToggle(); };
  const goNight = () => { if (theme !== "night") onToggle(); };

  return (
    <div
      role="group"
      aria-label="Thème"
      style={{
        position: "fixed",
        top: offsetTop,
        right: 20,
        zIndex: 300,
        display: "inline-flex",
        alignItems: "stretch",
        gap: 0,
        background: palette.ivory,
        border: `1px solid ${palette.lineStrong}`,
        fontFamily: fonts.mono,
        fontSize: 10,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        userSelect: "none",
        overflow: "hidden",
        transition: "border-color 200ms ease-out, background 350ms ease-out",
        padding: 0,
        fontStyle: "normal",
        width: OPT_WIDTH * 2,
        height: OPT_HEIGHT,
      }}
    >
      {/* Pill qui glisse — rectangle plein argent semi-transparent + bordure-bas
         pour souligner la position. Pas d'arrondi (brand). */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: OPT_WIDTH,
          background: palette.ivory2,
          borderRight: `1px solid ${palette.lineStrong}`,
          transform: `translateX(${pillX}px)`,
          transition: "transform 250ms cubic-bezier(.4, 0, .2, 1)",
          // Quand la pill est à droite, son bord gauche fait office de séparateur
          ...(theme === "night" && {
            borderRight: "none",
            borderLeft: `1px solid ${palette.lineStrong}`,
          }),
        }}
      />

      {/* Label JOUR — bouton dédié */}
      <button
        type="button"
        onClick={goDay}
        aria-label="Passer en mode jour"
        aria-pressed={theme === "day"}
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          width: OPT_WIDTH,
          background: "transparent",
          border: "none",
          padding: 0,
          margin: 0,
          cursor: theme === "day" ? "default" : "pointer",
          fontFamily: "inherit",
          fontSize: "inherit",
          letterSpacing: "inherit",
          textTransform: "inherit",
          fontStyle: "normal",
          ...labelStyle(theme === "day"),
        }}
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <circle cx="6" cy="6" r="2.4" stroke="currentColor" strokeWidth="1.2" />
          <line x1="6" y1="0.5" x2="6" y2="2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="6" y1="9.5" x2="6" y2="11.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="0.5" y1="6" x2="2.5" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="9.5" y1="6" x2="11.5" y2="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="2.1" y1="2.1" x2="3.5" y2="3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="8.5" y1="8.5" x2="9.9" y2="9.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="9.9" y1="2.1" x2="8.5" y2="3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="3.5" y1="8.5" x2="2.1" y2="9.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        Jour
      </button>

      {/* Pastille NUIT — bouton dédié */}
      <button
        type="button"
        onClick={goNight}
        aria-label="Passer en mode nuit"
        aria-pressed={theme === "night"}
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 5,
          width: OPT_WIDTH,
          background: "transparent",
          border: "none",
          padding: 0,
          margin: 0,
          cursor: theme === "night" ? "default" : "pointer",
          fontFamily: "inherit",
          fontSize: "inherit",
          letterSpacing: "inherit",
          textTransform: "inherit",
          fontStyle: "normal",
          ...labelStyle(theme === "night"),
        }}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M12.5 10.5A6.5 6.5 0 1 1 5 2a5.5 5.5 0 0 0 7.5 8.5z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
        Nuit
      </button>
    </div>
  );
}
