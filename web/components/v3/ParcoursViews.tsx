"use client";

/**
 * ParcoursViews — visualisation d'un parcours métier modélisé sous ses trois
 * représentations (pivot D-056, chantier C.E).
 *
 *   1. Logigramme de process  — « Comment ça s'enchaîne, avec quels choix ? »
 *   2. Ruban de chaîne de valeur — « Quelles grandes étapes, d'un coup d'œil ? »
 *   3. Mini-carto des objets    — « Qu'est-ce qui est en jeu, et dans quel état ? »
 *
 * Les trois vues sont dérivées du MÊME GrapheWSF (substrat). Le logigramme
 * passe par la lib mermaid (lazy) ; le ruban et la mini-carto sont des chaînes
 * SVG pures (`render-ruban`, `render-carto`) injectées telles quelles.
 *
 * Surface de lecture en climat Jour (D-050) — moment de lecture, pas d'action.
 * Spec : `resources/methode/lugia_modelisations_graphiques_spec.md`.
 */

import { useEffect, useMemo, useState } from "react";

import { fonts, paletteFor } from "@/lib/v3/tokens";
import { graphToMermaid } from "@/lib/wsf/render-mermaid";
import { renderRubanSVG } from "@/lib/wsf/render-ruban";
import { renderCartoSVG } from "@/lib/wsf/render-carto";
import type { GrapheWSF } from "@/lib/wsf/types";

type Vue = "logigramme" | "ruban" | "carto";

const ONGLETS: { id: Vue; label: string; question: string }[] = [
  { id: "logigramme", label: "Logigramme", question: "Comment ça s'enchaîne, avec quels choix ?" },
  { id: "ruban", label: "Chaîne de valeur", question: "Quelles grandes étapes, d'un coup d'œil ?" },
  { id: "carto", label: "Carte des objets", question: "Qu'est-ce qui est en jeu, et dans quel état ?" },
];

let mermaidInitialized = false;

/** Rend la chaîne SVG responsive (largeur 100 %). */
function svgResponsive(svg: string): string {
  return svg.replace(
    /<svg /,
    '<svg style="width:100%;height:auto;display:block" '
  );
}

export function ParcoursViews({ graph }: { graph: GrapheWSF }) {
  // Surface de lecture = Jour, indépendamment du thème ambiant.
  const palette = paletteFor("day");
  const [vue, setVue] = useState<Vue>("logigramme");
  const [mermaidSvg, setMermaidSvg] = useState<string | null>(null);
  const [mermaidErr, setMermaidErr] = useState<string | null>(null);

  const rubanSvg = useMemo(() => svgResponsive(renderRubanSVG(graph)), [graph]);
  const cartoSvg = useMemo(() => svgResponsive(renderCartoSVG(graph)), [graph]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "neutral",
            securityLevel: "loose",
            fontFamily: "Onest, system-ui, sans-serif",
            themeVariables: { fontSize: "13px" },
          });
          mermaidInitialized = true;
        }
        const code = graphToMermaid(graph, { direction: "LR" });
        const id = `parcours-mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const result = await mermaid.render(id, code);
        if (cancelled) return;
        setMermaidSvg(svgResponsive(result.svg));
        setMermaidErr(null);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Erreur inconnue";
        // eslint-disable-next-line no-console
        console.warn("[ParcoursViews] mermaid render error:", err);
        setMermaidErr(`Impossible d'afficher le logigramme : ${msg}`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [graph]);

  const onglet = ONGLETS.find((o) => o.id === vue)!;

  const eyebrow: React.CSSProperties = {
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: palette.navy400,
    fontStyle: "normal",
  };

  return (
    <div
      style={{
        marginTop: 16,
        padding: "18px 20px",
        border: `1px solid ${palette.lineStrong}`,
        background: palette.ivoryLight,
      }}
    >
      <div style={{ ...eyebrow, marginBottom: 4 }}>
        Parcours modélisé {graph.titre ? `· ${graph.titre}` : ""}
      </div>

      {/* Barre d'onglets (segmented) */}
      <div
        role="tablist"
        aria-label="Représentations du parcours"
        style={{
          display: "flex",
          gap: 0,
          margin: "12px 0 6px",
          border: `1px solid ${palette.line}`,
          width: "fit-content",
        }}
      >
        {ONGLETS.map((o) => {
          const actif = o.id === vue;
          return (
            <button
              key={o.id}
              role="tab"
              aria-selected={actif}
              onClick={() => setVue(o.id)}
              style={{
                fontFamily: fonts.sans,
                fontSize: 12,
                fontStyle: "normal",
                padding: "7px 14px",
                cursor: "pointer",
                border: "none",
                borderRight: `1px solid ${palette.line}`,
                background: actif ? palette.navy : "transparent",
                color: actif ? palette.ivory : palette.navy600,
                letterSpacing: "0.02em",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      {/* Question portée par la vue active */}
      <div
        style={{
          fontFamily: fonts.sans,
          fontSize: 12.5,
          color: palette.navy600,
          fontStyle: "normal",
          margin: "6px 0 10px",
        }}
      >
        {onglet.question}
      </div>

      {/* Zone de rendu */}
      <div style={{ overflowX: "auto", padding: "4px 0" }}>
        {vue === "logigramme" &&
          (mermaidErr ? (
            <div style={{ ...eyebrow, color: palette.signalWarn.default }}>{mermaidErr}</div>
          ) : mermaidSvg ? (
            // eslint-disable-next-line react/no-danger
            <div dangerouslySetInnerHTML={{ __html: mermaidSvg }} />
          ) : (
            <div style={{ ...eyebrow, opacity: 0.6 }}>Génération du logigramme…</div>
          ))}

        {vue === "ruban" && (
          // eslint-disable-next-line react/no-danger
          <div dangerouslySetInnerHTML={{ __html: rubanSvg }} />
        )}

        {vue === "carto" && (
          // eslint-disable-next-line react/no-danger
          <div dangerouslySetInnerHTML={{ __html: cartoSvg }} />
        )}
      </div>
    </div>
  );
}

export default ParcoursViews;
