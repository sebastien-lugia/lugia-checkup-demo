"use client";

/**
 * V3-brand — radar résultats grand format.
 *
 * SVG 380×340 avec viewBox élargi pour laisser la place aux labels d'axes
 * autour. Centre décalé pour équilibrer la composition (label A à droite,
 * B en haut, C en bas du décalage).
 *
 * Reprend la même formule angle que RadarLiveV3 (sommet à GAUCHE — modèle
 * cible). Polygone des scores + glow filter + labels mono caps positionnés
 * autour à 40 px du sommet.
 *
 * V3-brand-T-V3-7.
 */

import { paletteFor, type V3Theme, RADAR_ANGLES_DEG, fonts } from "@/lib/v3/tokens";

export function RadarResultV3({
  theme = "night",
  scores,
}: {
  theme?: V3Theme;
  scores: { A: number; B: number; C: number };
}) {
  const palette = paletteFor(theme);

  // ViewBox 380×340 — centre décalé légèrement à droite (cx=200) pour donner
  // de l'air à gauche où le label A se pose.
  const vw = 380;
  const vh = 340;
  const cx = 200;
  const cy = 170;
  const r = 108;

  const axes = (["A", "B", "C"] as const).map((id) => {
    const labels = {
      A: "Parcours patient",
      B: "Équipe & secrétariat",
      C: "Outils & dossiers",
    };
    return {
      id,
      label: labels[id],
      angle: RADAR_ANGLES_DEG[id],
      ratio: Math.min(Math.max(scores[id] / 100, 0), 1),
      hex: palette.axes[id],
    };
  });

  const pt = (angle: number, rad: number): [number, number] => {
    // Formule du modèle cible : sommet à GAUCHE (cf RadarLiveV3 commentaire).
    const a = ((angle - 90) * Math.PI) / 180;
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  };

  // Glow filters
  const defs = (
    <defs>
      {axes.map((a) => (
        <filter
          key={a.id}
          id={`result-glow-${a.id}`}
          x="-80%"
          y="-80%"
          width="260%"
          height="260%"
        >
          <feGaussianBlur stdDeviation="5" result="blur" />
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

  // Grilles concentriques (4 paliers, le dernier rempli en argent dilué)
  const grids = [1, 2, 3, 4].map((i) => {
    const gr = (r * i) / 4;
    const pts = axes.map((a) => pt(a.angle, gr));
    const pathStr = pts.map((p) => p.join(",")).join(" ");
    return (
      <polygon
        key={i}
        points={pathStr}
        fill={
          i === 4
            ? `color-mix(in srgb, ${palette.argent} 6%, transparent)`
            : "none"
        }
        stroke={i === 4 ? palette.lineStrong : palette.line}
        strokeWidth={i === 4 ? 1.5 : 0.6}
        opacity={i === 4 ? 0.5 : 0.35}
      />
    );
  });

  // Lignes d'axes
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
        strokeWidth={1.2}
        opacity={0.5}
      />
    );
  });

  // Polygone des scores
  const dp = axes.map((a) => pt(a.angle, r * Math.max(a.ratio, 0.05)));
  const polyPath =
    dp.map((p, i) => (i ? "L" : "M") + p.join(",")).join(" ") + "Z";

  // Points lumineux
  const dots = axes.map((a, i) => {
    const [x, y] = dp[i];
    return (
      <circle
        key={a.id}
        cx={x}
        cy={y}
        r={5.5}
        fill={a.hex}
        filter={`url(#result-glow-${a.id})`}
      />
    );
  });

  // Labels positionnés à 40 px du sommet de chaque axe — sur 2 lignes si
  // le label contient un espace au milieu, anchor adapté à gauche / droite.
  const labels = axes.map((a) => {
    const dist = r + 40;
    const [x, y] = pt(a.angle, dist);
    const words = a.label.split(" ");
    const mid = Math.ceil(words.length / 2);
    const l1 = words.slice(0, mid).join(" ");
    const l2 = words.slice(mid).join(" ");
    const anchor: "start" | "end" | "middle" =
      x < cx - 10 ? "end" : x > cx + 10 ? "start" : "middle";

    return (
      <g key={a.id}>
        <text
          x={x}
          y={y - 7}
          textAnchor={anchor}
          fontFamily={fonts.mono}
          fontSize="10"
          fill={a.hex}
          letterSpacing="0.04em"
          fontWeight="500"
        >
          {l1}
        </text>
        {l2 && (
          <text
            x={x}
            y={y + 7}
            textAnchor={anchor}
            fontFamily={fonts.mono}
            fontSize="10"
            fill={a.hex}
            letterSpacing="0.04em"
            fontWeight="500"
          >
            {l2}
          </text>
        )}
      </g>
    );
  });

  return (
    <svg
      width="100%"
      height="auto"
      viewBox={`0 0 ${vw} ${vh}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ maxWidth: vw, display: "block" }}
      aria-label="Radar de votre profil — 3 axes"
    >
      {defs}
      {grids}
      {axLines}
      <path
        d={polyPath}
        fill={`color-mix(in srgb, ${palette.argent} 14%, transparent)`}
        stroke={palette.argent}
        strokeWidth={1.2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {dots}
      {labels}
    </svg>
  );
}
