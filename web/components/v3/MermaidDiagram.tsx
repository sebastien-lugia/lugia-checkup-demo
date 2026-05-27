"use client";

/**
 * MermaidDiagram — affichage du schéma WSF d'un chantier (C.A, 2026-05-26).
 *
 * Prend un GrapheWSF, le convertit en code Mermaid via `graphToMermaid`,
 * puis utilise la lib `mermaid` officielle pour render le SVG dans un div.
 *
 * Lazy load de la lib mermaid (~500 Ko) : on n'importe que quand le
 * composant est monté, pas en SSR.
 */

import { useEffect, useRef, useState } from "react";

import { paletteFor, fonts, type V3Theme } from "@/lib/v3/tokens";
import { graphToMermaid, composantesPresentes, nodesEnAlerte } from "@/lib/wsf/render-mermaid";
import type { GrapheWSF } from "@/lib/wsf/types";

/** Conversion d'une composante WSF brute en label humain pour les chips. */
const COMPOSANTE_LABEL: Record<string, string> = {
  PARTICIPANT: "Acteurs",
  INFORMATION: "Informations",
  TECHNOLOGIE: "Outils",
  PROCESSUS: "Processus",
  INFRASTRUCTURE: "Infrastructure",
  STRATEGIE: "Stratégies",
  ENVIRONNEMENT: "Environnement",
  PRODUIT: "Produits",
  CLIENT: "Bénéficiaires",
};

let mermaidInitialized = false;

export function MermaidDiagram({
  graph,
  theme = "night",
}: {
  graph: GrapheWSF;
  theme?: V3Theme;
}) {
  const palette = paletteFor(theme);
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // Lazy import — évite que Next.js tente de bundler mermaid en SSR
        const mermaid = (await import("mermaid")).default;

        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "neutral",
            securityLevel: "loose",
            fontFamily: "Onest, system-ui, sans-serif",
            themeVariables: {
              fontSize: "13px",
            },
          });
          mermaidInitialized = true;
        }

        const code = graphToMermaid(graph, { direction: "TD" });
        // Unique id pour permettre plusieurs diagrammes sur la même page
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const result = await mermaid.render(id, code);
        if (cancelled) return;
        setSvg(result.svg);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : "Erreur inconnue";
        // eslint-disable-next-line no-console
        console.warn("[MermaidDiagram] render error:", err);
        setError(`Impossible d'afficher le schéma : ${msg}`);
      }
    })();

    return () => { cancelled = true; };
  }, [graph]);

  const alertes = nodesEnAlerte(graph);
  const composantes = composantesPresentes(graph);

  return (
    <div
      style={{
        marginTop: 16,
        padding: "18px 20px",
        border: `1px solid ${palette.lineStrong}`,
        background: theme === "day" ? palette.ivoryLight : palette.ivory,
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: palette.navy400,
          marginBottom: 12,
          fontStyle: "normal",
        }}
      >
        Schéma du chantier {graph.titre ? `· ${graph.titre}` : ""}
      </div>

      {error ? (
        <div
          style={{
            padding: 12,
            border: `1px solid ${palette.signalWarn.default}`,
            background: `${palette.signalWarn.default}11`,
            color: palette.signalWarn.default,
            fontFamily: fonts.mono,
            fontSize: 11,
            fontStyle: "normal",
          }}
        >
          {error}
        </div>
      ) : svg ? (
        <div
          ref={containerRef}
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "8px 0",
            overflowX: "auto",
          }}
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 11,
            color: palette.navy400,
            opacity: 0.6,
            fontStyle: "normal",
          }}
        >
          Génération du schéma…
        </div>
      )}

      {/* Récap composantes WSF couvertes par le schéma */}
      {composantes.length > 0 && (
        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: `1px solid ${palette.line}`,
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 9,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: palette.navy400,
              fontStyle: "normal",
            }}
          >
            Couvre :
          </span>
          {composantes.map((c) => (
            <span
              key={c}
              style={{
                fontFamily: fonts.mono,
                fontSize: 10,
                padding: "2px 8px",
                border: `1px solid ${palette.line}`,
                color: palette.navy600,
                background: "transparent",
                letterSpacing: "0.04em",
                fontStyle: "normal",
              }}
            >
              {COMPOSANTE_LABEL[c] || c}
            </span>
          ))}
        </div>
      )}

      {/* Points d'attention — nœuds DEGRADE/A_RISQUE/BLOQUE/NON_DOCUMENTE */}
      {alertes.length > 0 && (
        <div
          style={{
            marginTop: 12,
            fontFamily: fonts.mono,
            fontSize: 11,
            letterSpacing: "0.04em",
            color: palette.signalWarn.default,
            fontStyle: "normal",
          }}
        >
          <strong style={{ fontWeight: 600 }}>
            {alertes.length === 1 ? "Point d'attention" : "Points d'attention"} :
          </strong>{" "}
          {alertes
            .map((n) => `${n.label} (${n.etat.toLowerCase().replace(/_/g, " ")})`)
            .join(" · ")}
        </div>
      )}
    </div>
  );
}
