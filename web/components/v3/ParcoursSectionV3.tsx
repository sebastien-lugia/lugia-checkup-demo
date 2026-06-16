"use client";

/**
 * ParcoursSectionV3 — section « Modéliser un parcours » de la page résultats
 * (composant v3-charte). Remplace la liste de chantiers directs (pivot D-056).
 *
 * Style aligné sur la page : cartes type OppCard (surface + bordure, accent
 * à gauche pour le parcours sélectionné, badge mono « suggéré »), boutons
 * outline-mono. Règle charte : `palette.navy` = couleur de TEXTE, jamais un
 * fond (sinon aplat clair sur la page nuit). Les 3 vues restent une surface
 * de lecture claire (climat « Jour = lecture », D-050).
 */

import { useMemo, useState } from "react";

import { fonts, paletteFor, type V3Theme } from "@/lib/v3/tokens";
import {
  CATALOGUE_MEDECIN,
  PARCOURS_FIXTURES,
  suggestParcours,
} from "@/lib/wsf/parcours/catalogue";
import { ParcoursViews } from "@/components/v3/ParcoursViews";
import { ParcoursDialogModal } from "@/components/v3/ParcoursDialogModal";
import type { GrapheWSF } from "@/lib/wsf/types";

export function ParcoursSectionV3({
  theme = "night",
  interviewId,
  axisScores,
}: {
  theme?: V3Theme;
  interviewId: number | null;
  /** Scores radar : A = Parcours patient, B = Équipe, C = Outils.
   *  Score le plus BAS = axe le plus fragile → parcours suggéré. */
  axisScores?: { A: number; B: number; C: number };
}) {
  const palette = paletteFor(theme);
  const cardBg = theme === "day" ? palette.ivoryLight : palette.ivory;

  const suggestedId = useMemo(
    () =>
      suggestParcours({
        processes: axisScores ? -axisScores.A : undefined,
        participants: axisScores ? -axisScores.B : undefined,
        information: axisScores ? -axisScores.C : undefined,
      }),
    [axisScores],
  );

  const [selected, setSelected] = useState<string>(suggestedId);
  const [modeled, setModeled] = useState<Record<string, GrapheWSF>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedEntry = CATALOGUE_MEDECIN.find((p) => p.id === selected);
  const suggestedEntry = CATALOGUE_MEDECIN.find((p) => p.id === suggestedId);
  const graph = modeled[selected] ?? PARCOURS_FIXTURES[selected];

  const microLabel: React.CSSProperties = {
    display: "inline-block",
    fontFamily: fonts.mono,
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    fontStyle: "normal",
  };

  return (
    <section style={{ marginBottom: 56 }}>
      {/* Eyebrow */}
      <p
        style={{
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: palette.navy400,
          margin: "0 0 16px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontStyle: "normal",
        }}
      >
        <span aria-hidden="true" style={{ display: "inline-block", width: 20, height: 1, background: palette.navy400 }} />
        Modéliser un parcours
      </p>

      <h2
        style={{
          fontFamily: fonts.serif,
          fontSize: "clamp(22px, 2.5vw, 28px)",
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: "-0.015em",
          margin: "0 0 8px",
          color: palette.navy,
          fontStyle: "normal",
        }}
      >
        Par où commencer
      </h2>

      <p style={{ fontFamily: fonts.sans, fontSize: 13, lineHeight: 1.6, color: palette.navy600, margin: "0 0 18px", fontStyle: "normal", maxWidth: 640 }}>
        Choisissez un moment précis de votre cabinet : Lugia le modélise avec vous,
        puis vous le rend sous trois angles. On regarde le fonctionnement du travail,
        jamais les personnes.
      </p>

      {/* Note de suggestion */}
      {suggestedEntry && (
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 13,
            lineHeight: 1.55,
            color: palette.navy600,
            background: cardBg,
            borderLeft: `2px solid ${palette.argent}`,
            padding: "11px 15px",
            margin: "0 0 18px",
            fontStyle: "normal",
            maxWidth: 640,
          }}
        >
          D&apos;après votre check-up, Lugia vous suggère de commencer par&nbsp;:{" "}
          <strong style={{ fontWeight: 600, color: palette.navy }}>{suggestedEntry.label}</strong>. À vous de trancher.
        </p>
      )}

      {/* Sélecteur — cartes type OppCard, grille régulière */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 8,
          marginBottom: 20,
        }}
      >
        {CATALOGUE_MEDECIN.map((p) => {
          const actif = p.id === selected;
          const suggere = p.id === suggestedId;
          return (
            <button
              key={p.id}
              type="button"
              disabled={!p.disponible}
              onClick={() => p.disponible && setSelected(p.id)}
              title={p.disponible ? p.coeur : "Modélisation par dialogue — bientôt"}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 5,
                padding: "13px 15px",
                background: cardBg,
                borderTop: `1px solid ${palette.line}`,
                borderRight: `1px solid ${palette.line}`,
                borderBottom: `1px solid ${palette.line}`,
                borderLeft: actif ? `3px solid ${palette.navy400}` : `1px solid ${palette.line}`,
                textAlign: "left",
                cursor: p.disponible ? "pointer" : "not-allowed",
                opacity: p.disponible ? 1 : 0.5,
                fontFamily: fonts.sans,
                fontStyle: "normal",
                transition: "border-color 180ms ease-out, transform 180ms ease-out",
              }}
              onMouseEnter={(e) => {
                if (!p.disponible) return;
                e.currentTarget.style.borderColor = palette.navy400;
                if (actif) e.currentTarget.style.borderLeftColor = palette.navy400;
                e.currentTarget.style.transform = "translateX(2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = palette.line;
                if (actif) e.currentTarget.style.borderLeftColor = palette.navy400;
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              {(suggere || !p.disponible) && (
                <span style={{ ...microLabel, color: palette.argent }}>
                  {!p.disponible ? "Bientôt" : "★ Suggéré"}
                </span>
              )}
              <span
                style={{
                  fontFamily: fonts.serif,
                  fontSize: 15,
                  lineHeight: 1.3,
                  letterSpacing: "-0.005em",
                  color: palette.navy,
                  fontStyle: "normal",
                }}
              >
                {p.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* CTA dialogue — bouton outline-mono (idiome de la page) */}
      {selectedEntry?.disponible && selectedEntry.moduleId && interviewId != null && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14, marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            style={{
              background: "transparent",
              color: palette.navy,
              border: `1px solid ${palette.lineStrong}`,
              padding: "12px 24px",
              fontFamily: fonts.mono,
              fontSize: 10,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontStyle: "normal",
              transition: "border-color 180ms ease-out, background 180ms ease-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = palette.navy;
              e.currentTarget.style.background = cardBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = palette.lineStrong;
              e.currentTarget.style.background = "transparent";
            }}
          >
            Modéliser ce parcours avec Lugia →
          </button>
          <span style={{ fontFamily: fonts.sans, fontSize: 12.5, color: palette.navy400, fontStyle: "normal" }}>
            Un court dialogue, puis vous validez avant de voir les vues.
          </span>
        </div>
      )}

      {/* Rendu : graphe modélisé / exemple / invite */}
      {graph ? (
        <>
          <ParcoursViews graph={graph} />
          <p style={{ fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 1.6, color: palette.navy400, marginTop: 12, fontStyle: "normal", maxWidth: 640 }}>
            {modeled[selected]
              ? "Voici votre parcours, tel que vous l'avez validé avec Lugia."
              : "Exemple pré-modélisé. Lancez « Modéliser ce parcours » pour construire le vôtre."}
          </p>
        </>
      ) : (
        <div style={{ fontFamily: fonts.sans, fontSize: 13.5, lineHeight: 1.6, color: palette.navy600, background: cardBg, border: `1px solid ${palette.line}`, padding: "16px 18px", fontStyle: "normal", maxWidth: 640 }}>
          {selectedEntry?.disponible
            ? "Cliquez sur « Modéliser ce parcours avec Lugia » pour le construire en quelques minutes."
            : "Ce parcours se modélise par un court dialogue avec Lugia — bientôt disponible."}
        </div>
      )}

      {dialogOpen && selectedEntry?.moduleId && interviewId != null && (
        <ParcoursDialogModal
          interviewId={interviewId}
          moduleId={selectedEntry.moduleId}
          parcoursLabel={selectedEntry.label}
          onClose={() => setDialogOpen(false)}
          onValidated={(g) => setModeled((prev) => ({ ...prev, [selected]: g }))}
        />
      )}
    </section>
  );
}

export default ParcoursSectionV3;
