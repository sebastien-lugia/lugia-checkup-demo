"use client";

/**
 * V3-brand — radar live qui se construit pendant le parcours.
 *
 * SVG sticky desktop (≥ 1140 px), masqué sur mobile/tablet. Polygones
 * concentriques + lignes d'axe + polygone des scores + 3 points argent
 * (un par axe) avec glow.
 *
 * Charte A1-ter (2026-05-21) :
 *  - Label "PROFIL EN COURS" en haut conservé.
 *  - Labels PARCOURS / ÉQUIPE / OUTILS sur les 3 angles du triangle.
 *  - Plus de liste de niveaux qualitatifs en bas.
 *  - viewBox élargie à gauche pour que "PARCOURS" tienne sans être coupé.
 *
 * Angles : -90° / 30° / 150° (sommet à gauche, inclinaison brand voulue).
 * Couleurs : argent uniforme (charte A1 — pas de couleur par axe).
 */

import { paletteFor, type V3Theme, RADAR_ANGLES_DEG } from "@/lib/v3/tokens";
import { fonts } from "@/lib/v3/tokens";

type AxisScore = number | null;

const AXIS_LABEL: Record<"A" | "B" | "C", string> = {
  A: "CLIENTS",
  B: "ÉQUIPE",
  C: "OUTILS",
};

export function RadarLiveV3({
  theme = "night",
  scores,
  /** Rayon du triangle (la SVG sera plus large pour les labels). */
  size = 180,
  inline = false,
}: {
  theme?: V3Theme;
  scores: { A: AxisScore; B: AxisScore; C: AxisScore };
  size?: number;
  inline?: boolean;
}) {
  const palette = paletteFor(theme);

  // SVG plus large que haute pour accueillir le label PARCOURS à gauche
  // et ÉQUIPE / OUTILS à droite. Triangle centré dans la zone visible.
  const SVG_W = size + 80;
  const SVG_H = size;
  const VIEW_X = -40;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 30;

  const axes = (["A", "B", "C"] as const).map((id) => {
    const score = scores[id] ?? 0;
    return {
      id,
      angle: RADAR_ANGLES_DEG[id],
      ratio: Math.min(Math.max(score / 100, 0), 1),
      hex: palette.axes[id],
    };
  });

  const pt = (angle: number, rad: number): [number, number] => {
    const a = ((angle - 90) * Math.PI) / 180;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  };

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

  const dp = axes.map((a) => pt(a.angle, r * Math.max(a.ratio, 0.05)));
  const polyPath =
    dp.map((p, i) => (i ? "L" : "M") + p.join(",")).join(" ") + "Z";

  const dots = axes.map((a, i) => {
    const [x, y] = dp[i];
    return (
      <circle
        key={a.id}
        cx={x}
        cy={y}
        r={3}
        fill={a.hex}
        filter={`url(#glow-${a.id})`}
      />
    );
  });

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
          <feGaussianBlur stdDeviation="3" result="blur" />
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

  const labelOffset = 12;
  const labels = axes.map((a) => {
    const [lx, ly] = pt(a.angle, r + labelOffset);
    let anchor: "start" | "middle" | "end" = "middle";
    if (a.id === "A") anchor = "end";
    if (a.id === "B") anchor = "start";
    if (a.id === "C") anchor = "start";
    return (
      <text
        key={a.id}
        x={lx}
        y={ly}
        textAnchor={anchor}
        dominantBaseline="middle"
        fontFamily={fonts.mono}
        fontSize={9}
        fill={palette.navy400}
        letterSpacing="0.12em"
        style={{ textTransform: "uppercase" }}
      >
        {AXIS_LABEL[a.id]}
      </text>
    );
  });

  const svg = (
    <svg
      width={SVG_W}
      height={SVG_H}
      viewBox={`${VIEW_X} 0 ${SVG_W} ${SVG_H}`}
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
      {labels}
    </svg>
  );

  const title = (
    <div style={{ margin: "0 0 10px", textAlign: "center" }}>
      <p
        style={{
          fontFamily: fonts.mono,
          fontSize: 9,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: palette.navy400,
          margin: "0 0 5px",
          fontStyle: "normal",
        }}
      >
        Profil en cours
      </p>
      <p
        style={{
          fontFamily: fonts.mono,
          fontSize: 9,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: palette.navy400,
          margin: 0,
          fontStyle: "normal",
        }}
      >
        de construction
      </p>
    </div>
  );

  if (inline) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: SVG_W,
        }}
      >
        {title}
        {svg}
      </div>
    );
  }

  return (
    <aside
      style={{
        position: "fixed",
        right: "max(24px, calc(50vw - 340px - 280px))",
        top: "50%",
        transform: "translateY(-50%)",
        width: SVG_W,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 50,
      }}
      className="v3-radar-live"
      aria-label="Radar de progression du profil"
    >
      {title}
      {svg}
      <style>{`@media (max-width: 1140px) { .v3-radar-live { display: none !important; } }`}</style>
    </aside>
  );
}
