"use client";

import type { V2Scores, V2AxisScore } from "@/lib/api";

/**
 * V2.0 — Radar dynamique en colonne latérale.
 *
 * Spec V2 §11.6 — Style V4 flottant :
 *  - Pas de carte conteneur (fond transparent — `--lugia-bg`).
 *  - Triangle équilatéral tourné : sommet A à 0° (droite), C à 120°
 *    (haut-gauche), B à 240° (bas-gauche).
 *  - SVG ~150px max-width, 4 polygones concentriques (25/50/75/100 %),
 *    3 axes en stroke discret.
 *  - 3 points couleur (r=4, même dimension dès le départ), positionnés à
 *    4% du rayon si l'axe n'est pas encore commencé.
 *  - Sous le SVG : 3 lignes axe (dot + nom + niveau qualitatif) +
 *    mini-barre de progression en proportion du score.
 *  - Masqué en mobile (< 1081px) — la topbar prend le relais.
 *
 * Aucun score numérique affiché — uniquement les niveaux qualitatifs
 * Lugia (Maîtrisé / Opérationnel / À surveiller / À risque), cf D-013.
 */

const SVG_SIZE = 150;
const CENTER = SVG_SIZE / 2;
const RADIUS = 60;
// Angles (en degrés) — convention : 0° = droite (axe A), antihoraire :
//   A à 0°, C à 120° (haut-gauche), B à 240° (bas-gauche).
const AXIS_ANGLES = { A: 0, C: 120, B: 240 } as const;
const AXIS_COLORS = {
  A: "#2e7d4f", // vert parcours patient
  B: "#a85d2b", // ambre équipe
  C: "#1a56a0", // bleu outils
} as const;
const AXIS_LABELS = {
  A: "Parcours patient",
  B: "Équipe & secrétariat",
  C: "Outils & dossiers",
} as const;

function polar(angleDeg: number, radius: number): { x: number; y: number } {
  // SVG y va vers le bas → on inverse sin
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(rad),
    y: CENTER - radius * Math.sin(rad),
  };
}

function ringPath(level: number): string {
  // level ∈ [0.25, 0.5, 0.75, 1.0]
  const points = (["A", "C", "B"] as const).map((axis) => {
    const { x, y } = polar(AXIS_ANGLES[axis], RADIUS * level);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  return `M ${points.join(" L ")} Z`;
}

function polygonPath(scores: V2Scores): string {
  // Le polygone du médecin — un sommet par axe au % calculé.
  // Si un axe n'a pas encore de score, on positionne à 4% du rayon
  // (proche du centre, mais pas confondu — donne un point visible).
  const points = (["A", "C", "B"] as const).map((axis) => {
    const block = scores[axis];
    const pct = block ? block.pct / 100 : 0.04;
    const { x, y } = polar(AXIS_ANGLES[axis], RADIUS * pct);
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });
  return `M ${points.join(" L ")} Z`;
}

export function RadarAside({ scores }: { scores: V2Scores | null }) {
  const empty = scores === null;
  // Fallback : un radar avec scores null tous (les points partent à 4 %).
  const effective: V2Scores =
    scores ?? {
      A: null,
      B: null,
      C: null,
      global_score: null,
      completeness: { A: 0, B: 0, C: 0 },
    };

  return (
    <aside
      className="radar-aside sticky top-24 ml-4 w-full max-w-[220px] hidden xl:block"
      aria-label="Maturité du cabinet par axe (mise à jour en temps réel)"
    >
      <svg
        viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
        width="100%"
        style={{ maxWidth: SVG_SIZE }}
        className="mx-auto"
      >
        {/* 4 polygones concentriques (grille) */}
        {[0.25, 0.5, 0.75, 1].map((level, i) => (
          <path
            key={level}
            d={ringPath(level)}
            fill="none"
            stroke={i === 3 ? "#d4cfbf" : "#e8e3d3"}
            strokeWidth={i === 3 ? 1.2 : 0.8}
          />
        ))}

        {/* Axes (lignes du centre vers les sommets) */}
        {(["A", "C", "B"] as const).map((axis) => {
          const { x, y } = polar(AXIS_ANGLES[axis], RADIUS);
          return (
            <line
              key={axis}
              x1={CENTER}
              y1={CENTER}
              x2={x}
              y2={y}
              stroke="#e0dccc"
              strokeWidth="0.8"
            />
          );
        })}

        {/* Polygone des scores */}
        <path
          d={polygonPath(effective)}
          fill={empty ? "transparent" : "rgba(26, 86, 160, 0.08)"}
          stroke={empty ? "transparent" : "#1a56a0"}
          strokeWidth="1.5"
          style={{ transition: "d 300ms ease" }}
        />

        {/* 3 points couleur */}
        {(["A", "C", "B"] as const).map((axis) => {
          const block = effective[axis];
          const pct = block ? block.pct / 100 : 0.04;
          const { x, y } = polar(AXIS_ANGLES[axis], RADIUS * pct);
          return (
            <circle
              key={axis}
              cx={x}
              cy={y}
              r="4"
              fill={AXIS_COLORS[axis]}
              stroke="#faf9f5"
              strokeWidth="1.5"
              style={{ transition: "cx 300ms ease, cy 300ms ease" }}
            />
          );
        })}
      </svg>

      <div className="border-t border-[#e0dccc] mt-4 pt-4 space-y-3">
        {(["A", "B", "C"] as const).map((axis) => (
          <AxisLine key={axis} axis={axis} block={effective[axis]} />
        ))}
      </div>
    </aside>
  );
}

function AxisLine({
  axis,
  block,
}: {
  axis: "A" | "B" | "C";
  block: V2AxisScore | null;
}) {
  const color = AXIS_COLORS[axis];
  const label = AXIS_LABELS[axis];
  const niveau = block ? block.label : "À évaluer";
  const pct = block ? block.pct : 0;

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span
          className="inline-block w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-[11px] font-medium text-[#444] truncate">{label}</span>
      </div>
      <div className="text-[12px] text-[#1a1a1a] font-medium pl-4">{niveau}</div>
      {/* Mini-barre de progression (proportionnelle au score %, jamais affichée numériquement) */}
      <div className="ml-4 mt-1.5 h-[2px] bg-[#e8e3d3] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: color,
            transition: "width 400ms ease-out",
          }}
        />
      </div>
    </div>
  );
}

// Fallback responsive — masqué desktop, visible en mobile/tablette.
export function RadarTopbar({ scores }: { scores: V2Scores | null }) {
  const effective: V2Scores =
    scores ?? {
      A: null,
      B: null,
      C: null,
      global_score: null,
      completeness: { A: 0, B: 0, C: 0 },
    };
  return (
    <div className="xl:hidden border-y border-[#e8e3d3] bg-[#fbf9f1]/40">
      <div className="max-w-[680px] mx-auto px-6 py-2 grid grid-cols-3 gap-2">
        {(["A", "B", "C"] as const).map((axis) => {
          const block = effective[axis];
          return (
            <div key={axis} className="text-[11px] leading-tight">
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: AXIS_COLORS[axis] }}
                />
                <span className="font-medium text-[#444] truncate">
                  {AXIS_LABELS[axis]}
                </span>
              </div>
              <div className="text-[#1a1a1a] mt-0.5 pl-3">
                {block ? block.label : "—"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
