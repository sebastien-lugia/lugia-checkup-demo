"use client";

/**
 * V3-brand — radar live qui se construit pendant le parcours.
 *
 * SVG sticky desktop (≥ 1140 px), masqué sur mobile/tablet. Polygones
 * concentriques + lignes d'axe + polygone des scores + 3 points lumineux
 * (un par axe) avec glow filter SVG.
 *
 * Angles : -90° / 30° / 150° (D-031 #8, axe A vers le haut, rotation horaire).
 * Couleurs : `palette.axes.A/B/C` selon le thème.
 *
 * V3-brand-T-V3-6.
 */

import { paletteFor, type V3Theme, RADAR_ANGLES_DEG } from "@/lib/v3-snapshot/tokens";
import { fonts } from "@/lib/v3-snapshot/tokens";

type AxisScore = number | null; // 0-100 ou null si pas encore évalué

export function RadarLiveV3({
  theme = "night",
  scores,
  /** Taille en pixels (carré). */
  size = 160,
  /** Si true, n'affiche pas le wrapper sticky (utile pour test isolé). */
  inline = false,
}: {
  theme?: V3Theme;
  scores: { A: AxisScore; B: AxisScore; C: AxisScore };
  size?: number;
  inline?: boolean;
}) {
  const palette = paletteFor(theme);
  const cx = size / 2;
  const cy = size / 2;
  const r = (size / 2) - 28; // marge pour les points lumineux

  const axes = (["A", "B", "C"] as const).map((id) => {
    const score = scores[id] ?? 0;
    return {
      id,
      angle: RADAR_ANGLES_DEG[id],
      ratio: Math.min(Math.max(score / 100, 0), 1),
      hex: palette.axes[id],
      glow: palette.axes[`${id}g`],
    };
  });

  const pt = (angle: number, rad: number): [number, number] => {
    // Formule du modèle cible. Avec angles -90 / 30 / 150 :
    //   A à -90° : (cx - r, cy)      → SOMMET À GAUCHE
    //   B à  30° : (cx + r/2, cy - r·√3/2) → HAUT-DROITE
    //   C à 150° : (cx + r/2, cy + r·√3/2) → BAS-DROITE
    // Triangle pointe à GAUCHE — c'est l'inclinaison brand voulue.
    const a = ((angle - 90) * Math.PI) / 180;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  };

  // Grilles concentriques (4 paliers) — opacité atténuée (deviner, pas voir)
  const grids = [1, 2, 3, 4].map((i) => {
    const gr = (r * i) / 4;
    const pts = axes.map((a) => pt(a.angle, gr));
    const path = pts.map((p) => p.join(",")).join(" ");
    return (
      <polygon
        key={i}
        points={path}
        fill="none"
        stroke={i === 4 ? palette.lineStrong : palette.line}
        strokeWidth={i === 4 ? 1 : 0.5}
        opacity={i === 4 ? 0.4 : 0.3}
      />
    );
  });

  // Lignes d'axes — opacité atténuée
  const axLines = axes.map((a) => {
    const [x, y] = pt(a.angle, r);
    return (
      <line
        key={a.id}
        x1={cx}
        y1={cy}
        x2={x}
        y2={y}
        stroke={palette.line}
        strokeWidth={1}
        opacity={0.4}
      />
    );
  });

  // Polygone des scores (avec un minimum de 0.05 sinon le path est dégénéré)
  const dp = axes.map((a) => pt(a.angle, r * Math.max(a.ratio, 0.05)));
  const polyPath =
    dp.map((p, i) => (i ? "L" : "M") + p.join(",")).join(" ") + "Z";

  // Points lumineux avec filtre glow
  const dots = axes.map((a, i) => {
    const [x, y] = dp[i];
    return (
      <circle
        key={a.id}
        cx={x}
        cy={y}
        r={4}
        fill={a.hex}
        filter={`url(#glow-${a.id})`}
      />
    );
  });

  // Filtres glow définis dans <defs>
  const defs = (
    <defs>
      {axes.map((a) => (
        <filter
          key={a.id}
          id={`glow-${a.id}`}
          x="-100%"
          y="-100%"
          width="300%"
          height="300%"
        >
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feFlood floodColor={a.hex} result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      ))}
    </defs>
  );

  const svg = (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      {defs}
      {grids}
      {axLines}
      <path
        d={polyPath}
        fill={`color-mix(in srgb, ${palette.argent} 12%, transparent)`}
        stroke={palette.argent}
        strokeWidth={1}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {dots}
    </svg>
  );

  // Niveau qualitatif sous chaque ligne
  const levelLabels = (["A", "B", "C"] as const).map((id) => {
    const s = scores[id];
    if (s === null || s === 0) return "—";
    if (s < 35) return "Fragile";
    if (s < 55) return "En transition";
    if (s < 78) return "Solide";
    return "Mature";
  });

  const content = (
    <>
      <p
        style={{
          fontFamily: fonts.mono,
          fontSize: 9,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: palette.navy400,
          margin: "0 0 4px",
          textAlign: "center",
          fontStyle: "normal",
        }}
      >
        Profil en cours
      </p>
      {svg}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", padding: "0 4px" }}>
        {(["A", "B", "C"] as const).map((id, i) => {
          const labels = { A: "Parcours patient", B: "Équipe", C: "Outils" };
          return (
            <div key={id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: palette.axes[id],
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 9,
                  letterSpacing: "0.04em",
                  color: palette.navy400,
                  flex: 1,
                  fontStyle: "normal",
                }}
              >
                {labels[id]}
              </span>
              <span
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 9,
                  fontWeight: 600,
                  color: palette.axes[id],
                  fontStyle: "normal",
                }}
              >
                {levelLabels[i]}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );

  if (inline) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, width: 200 }}>
        {content}
      </div>
    );
  }

  // Sticky desktop ≥ 1140 px — masquage via media query inline impossible en React,
  // donc on rend toujours et le parent applique un wrapper avec @media.
  return (
    <aside
      style={{
        position: "fixed",
        right: "max(24px, calc(50vw - 340px - 220px))",
        top: "50%",
        transform: "translateY(-50%)",
        width: 200,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        zIndex: 50,
      }}
      className="v3-radar-live"
      aria-label="Radar de progression du profil"
    >
      {content}
      {/* Media query injectée pour masquer en dessous de 1140 px */}
      <style>{`@media (max-width: 1140px) { .v3-radar-live { display: none !important; } }`}</style>
    </aside>
  );
}
