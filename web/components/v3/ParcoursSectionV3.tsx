"use client";

/**
 * ParcoursSectionV3 — section « Modéliser un parcours » de la page résultats
 * (composant v3-charte, thème sombre). Remplace la liste de chantiers directs
 * (pivot D-056) : le parcours modélisé devient la sortie principale.
 *
 * Chrome thémé (jour/nuit) ; les 3 vues (ParcoursViews) restent une surface de
 * lecture claire posée sur la page (climat « Jour = lecture », D-050).
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
  /** Scores radar par axe : A = Parcours patient, B = Équipe, C = Outils.
   *  Le score le plus BAS = l'axe le plus fragile → parcours suggéré. */
  axisScores?: { A: number; B: number; C: number };
}) {
  const palette = paletteFor(theme);

  // suggestParcours veut « plus haut = plus fragile » ; on passe -score pour
  // que l'axe au score le plus bas ressorte comme le plus fragile (échelle-agnostique).
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

      <p style={{ fontFamily: fonts.sans, fontSize: 13, lineHeight: 1.6, color: palette.navy600, margin: "0 0 16px", fontStyle: "normal", maxWidth: 640 }}>
        Choisissez un moment précis de votre cabinet : Lugia le modélise avec vous,
        puis vous le rend sous trois angles. On regarde le fonctionnement du travail,
        jamais les personnes.
      </p>

      {suggestedEntry && (
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 13,
            lineHeight: 1.55,
            color: palette.navy600,
            background: palette.ivory,
            borderLeft: `2px solid ${palette.navy}`,
            padding: "10px 14px",
            margin: "0 0 18px",
            fontStyle: "normal",
            maxWidth: 640,
          }}
        >
          D&apos;après votre check-up, Lugia vous suggère de commencer par&nbsp;:{" "}
          <strong style={{ fontWeight: 600, color: palette.navy }}>{suggestedEntry.label}</strong>. À vous de trancher.
        </p>
      )}

      {/* Sélecteur de micro-parcours */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {CATALOGUE_MEDECIN.map((p) => {
          const actif = p.id === selected;
          const base: React.CSSProperties = {
            fontFamily: fonts.sans,
            fontSize: 12.5,
            lineHeight: 1.3,
            fontStyle: "normal",
            padding: "7px 12px",
            textAlign: "left",
            maxWidth: 280,
            cursor: p.disponible ? "pointer" : "not-allowed",
          };
          const style: React.CSSProperties = !p.disponible
            ? { ...base, background: "transparent", color: palette.navy400, border: `1px solid ${palette.line}` }
            : actif
              ? { ...base, background: palette.navy, color: palette.paper, border: `1px solid ${palette.navy}` }
              : { ...base, background: "transparent", color: palette.navy600, border: `1px solid ${palette.lineStrong}` };
          return (
            <button key={p.id} type="button" disabled={!p.disponible} onClick={() => p.disponible && setSelected(p.id)} style={style} title={p.disponible ? p.coeur : "Modélisation par dialogue — bientôt"}>
              {p.label}
              {p.id === suggestedId && p.disponible && (
                <span style={{ display: "block", fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.85, marginTop: 2 }}>suggéré</span>
              )}
              {!p.disponible && (
                <span style={{ display: "block", fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7, marginTop: 2 }}>bientôt</span>
              )}
            </button>
          );
        })}
      </div>

      {/* CTA dialogue */}
      {selectedEntry?.disponible && selectedEntry.moduleId && interviewId != null && (
        <div style={{ marginBottom: 18 }}>
          <button
            type="button"
            onClick={() => setDialogOpen(true)}
            style={{ fontFamily: fonts.sans, fontSize: 13.5, fontStyle: "normal", padding: "10px 18px", border: "none", background: palette.navy, color: palette.paper, cursor: "pointer" }}
          >
            Modéliser ce parcours avec Lugia
          </button>
          <span style={{ fontFamily: fonts.sans, fontSize: 12.5, color: palette.navy400, marginLeft: 12, fontStyle: "normal" }}>
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
        <div style={{ fontFamily: fonts.sans, fontSize: 13.5, lineHeight: 1.6, color: palette.navy600, background: palette.ivory, padding: "16px 18px", fontStyle: "normal", maxWidth: 640 }}>
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
