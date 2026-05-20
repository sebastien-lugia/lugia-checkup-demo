"use client";

import type { V2Scores } from "@/lib/api";

/**
 * V2.0 — Radar grand format de la page résultats.
 *
 * Spec V2 §11.6 — Reprend strictement la même orientation que le
 * RadarAside (sommet A à 0°/droite, C à 120°/haut-gauche, B à
 * 240°/bas-gauche), avec 4 polygones concentriques visibles et 3 points
 * couleur à même dimension. Dimension plus grande (340×340) pour donner
 * du poids à la silhouette finale du cabinet. Les labels d'axes sont
 * affichés directement sur le SVG ici (contrairement à l'aside).
 */

const SVG_SIZE = 340;
const CENTER = SVG_SIZE / 2;
const RADIUS = 120;
const AXIS_ANGLES = { A: 0, C: 120, B: 240 } as const;
const AXIS_COLORS = {
  A: "#2e7d4f",
  B: "#a85d2b",
  C: "#1a56a0",
} as const;
const AXIS_LABELS = {
  A: "Parcours patient",
  B: "Équipe & secrétariat",
  C: "Outils & dossiers",
} as const;

function polar(angleDeg: number, radius: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER - radius * Math.sin(rad),
  };
}

function ringPath(level: number): string {
  const points = (["A", "C", "B"] as const).map((axis) => {
    const { x, y } = polar(AXIS_ANGLES[axis], RADIUS * level);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  return `M ${points.join(" L ")} Z`;
}

function polygonPath(scores: V2Scores): string {
  const points = (["A", "C", "B"] as const).map((axis) => {
    const block = scores[axis];
    const pct = block ? block.pct / 100 : 0.04;
    const { x, y } = polar(AXIS_ANGLES[axis], RADIUS * pct);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  return `M ${points.join(" L ")} Z`;
}

type TextAnchor = "start" | "middle" | "end";

function labelPos(axis: "A" | "B" | "C"): { x: number; y: number; anchor: TextAnchor } {
  const { x, y } = polar(AXIS_ANGLES[axis], RADIUS + 32);
  let anchor: TextAnchor = "middle";
  if (axis === "A") anchor = "start";
  if (axis === "B" || axis === "C") anchor = "end";
  return { x, y, anchor };
}

export function RadarResult({ scores }: { scores: V2Scores }) {
  return (
    <svg
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      width="100%"
      style={{ maxWidth: SVG_SIZE }}
      className="mx-auto"
      aria-label="Maturité de votre cabinet sur les 3 axes du diagnostic"
    >
      {/* Grilles concentriques */}
      {[0.25, 0.5, 0.75, 1].map((level, i) => (
        <path
          key={level}
          d={ringPath(level)}
          fill="none"
          stroke={i === 3 ? "#d4cfbf" : "#e8e3d3"}
          strokeWidth={i === 3 ? 1.5 : 1}
        />
      ))}

      {/* Axes */}
      {(["A", "C", "B"] as const).map((axis) => {
        const { x, y } = polar(AXIS_ANGLES[axis], RADIUS);
        return (
          <line
            key={axis}
            x1={CENTER}
            y1={CENTER}
            x2={x}
            y2={y}
            stroke="#d4cfbf"
            strokeWidth="1"
          />
        );
      })}

      {/* Polygone des scores */}
      <path
        d={polygonPath(scores)}
        fill="rgba(26, 86, 160, 0.10)"
        stroke="#1a56a0"
        strokeWidth="2"
      />

      {/* 3 points couleur */}
      {(["A", "C", "B"] as const).map((axis) => {
        const block = scores[axis];
        const pct = block ? block.pct / 100 : 0.04;
        const { x, y } = polar(AXIS_ANGLES[axis], RADIUS * pct);
        return (
          <circle
            key={axis}
            cx={x}
            cy={y}
            r="6"
            fill={AXIS_COLORS[axis]}
            stroke="#faf9f5"
            strokeWidth="2"
          />
        );
      })}

      {/* Labels d'axes (autour du triangle) */}
      {(["A", "C", "B"] as const).map((axis) => {
        const pos = labelPos(axis);
        return (
          <text
            key={axis}
            x={pos.x}
            y={pos.y}
            textAnchor={pos.anchor}
            dominantBaseline="middle"
            fontSize="12"
            fontWeight="500"
            fill={AXIS_COLORS[axis]}
          >
            {AXIS_LABELS[axis]}
          </text>
        );
      })}
    </svg>
  );
}
