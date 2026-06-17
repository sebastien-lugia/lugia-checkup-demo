"use client";

/**
 * ParcoursViews — visualisation d'un parcours métier modélisé sous ses trois
 * représentations (pivot D-056, chantier C.E).
 *
 *   1. Logigramme de process  — « Comment ça s'enchaîne, avec quels choix ? »
 *   2. Ruban de chaîne de valeur — « Quelles grandes étapes, d'un coup d'œil ? »
 *   3. Mini-carto des objets    — « Qu'est-ce qui est en jeu, et dans quel état ? »
 *
 * Les trois vues sont dérivées du MÊME GrapheWSF (substrat) et rendues en SVG
 * pur (charte Carte Vivante) — logigramme, ruban, mini-carto.
 *
 * Surface de lecture en climat Jour (D-050) — moment de lecture, pas d'action.
 * Spec : `resources/methode/lugia_modelisations_graphiques_spec.md`.
 */

import { useMemo, useState } from "react";

import { fonts, paletteFor, type V3Theme } from "@/lib/v3/tokens";
import { renderLogigrammeSVG } from "@/lib/wsf/render-logigramme";
import { renderRubanSVG } from "@/lib/wsf/render-ruban";
import { renderCartoSVG } from "@/lib/wsf/render-carto";
import type { GrapheWSF } from "@/lib/wsf/types";
import { deriveChantiers } from "@/lib/wsf/derive-chantiers";

type Vue = "logigramme" | "ruban" | "carto";

const ONGLETS: { id: Vue; label: string; question: string }[] = [
  { id: "logigramme", label: "Logigramme", question: "Comment ça s'enchaîne, avec quels choix ?" },
  { id: "ruban", label: "Chaîne de valeur", question: "Quelles grandes étapes, d'un coup d'œil ?" },
  { id: "carto", label: "Carte des objets", question: "Qu'est-ce qui est en jeu, et dans quel état ?" },
];

/** Rend la chaîne SVG responsive (largeur 100 %). */
function svgResponsive(svg: string): string {
  return svg.replace(
    /<svg /,
    '<svg style="width:100%;height:auto;display:block" '
  );
}

export function ParcoursViews({ graph, theme = "night", showChantiers = true }: { graph: GrapheWSF; theme?: V3Theme; showChantiers?: boolean }) {
  const palette = paletteFor(theme);
  const [vue, setVue] = useState<Vue>("logigramme");

  const logiSvg = useMemo(() => svgResponsive(renderLogigrammeSVG(graph, theme)), [graph, theme]);
  const rubanSvg = useMemo(() => svgResponsive(renderRubanSVG(graph, theme)), [graph, theme]);
  const cartoSvg = useMemo(() => svgResponsive(renderCartoSVG(graph, theme)), [graph, theme]);
  const chantiers = useMemo(() => deriveChantiers(graph), [graph]);


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
        {vue === "logigramme" && (
          // eslint-disable-next-line react/no-danger
          <div dangerouslySetInnerHTML={{ __html: logiSvg }} />
        )}

        {vue === "ruban" && (
          // eslint-disable-next-line react/no-danger
          <div dangerouslySetInnerHTML={{ __html: rubanSvg }} />
        )}

        {vue === "carto" && (
          // eslint-disable-next-line react/no-danger
          <div dangerouslySetInnerHTML={{ __html: cartoSvg }} />
        )}
      </div>

      {/* Chantiers dérivés du parcours (pivot D-056 §12) — teaser + verrou abonnement */}
      {showChantiers && chantiers.length > 0 && (
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${palette.line}` }}>
          <div style={{ ...eyebrow, marginBottom: 8 }}>Chantiers proposés</div>
          <p style={{ fontFamily: fonts.sans, fontSize: 13, lineHeight: 1.55, color: palette.navy600, fontStyle: "normal", margin: "0 0 14px", maxWidth: 620 }}>
            À partir de ce parcours, Lugia identifie les chantiers prioritaires. Le plan
            d&apos;action détaillé et le lancement sont inclus dans l&apos;abonnement.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {chantiers.map((c) => (
              <div
                key={c.id}
                style={{ border: `1px solid ${palette.line}`, background: "white", padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: fonts.sans, fontSize: 14, fontStyle: "normal", color: palette.navy, fontWeight: 600 }}>{c.titre}</div>
                  <div style={{ fontFamily: fonts.sans, fontSize: 12.5, fontStyle: "normal", color: palette.navy600, marginTop: 2 }}>{c.observation}</div>
                </div>
                <a
                  href="/tarifs"
                  title="Disponible avec l'abonnement Lugia"
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap", fontFamily: fonts.sans, fontSize: 12.5, fontStyle: "normal", padding: "7px 12px", border: `1px solid ${palette.argent}`, color: palette.navy600, background: palette.ivory, textDecoration: "none" }}
                >
                  <LockIcon /> Lancer ce chantier
                </a>
              </div>
            ))}
          </div>
          <a
            href="/tarifs"
            style={{ display: "inline-block", marginTop: 14, fontFamily: fonts.sans, fontSize: 13, fontStyle: "normal", padding: "9px 16px", background: palette.navy, color: "white", textDecoration: "none" }}
          >
            Passer à l&apos;abonnement pour lancer ces chantiers
          </a>
        </div>
      )}
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} style={{ display: "block" }}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export default ParcoursViews;
