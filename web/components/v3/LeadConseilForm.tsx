/**
 * LeadConseilForm — C.D (2026-05-27)
 *
 * Permet au médecin de répondre à une offre de conseil sans passer par
 * Calendly : un texte libre + le contexte (profil + chantier) déjà connu côté
 * backend, envoyé comme lead à Sébastien (stocké en base + email).
 *
 * Composant autonome et thématisé (day/night), réutilisé en pied de chantier
 * (ModuleV3) et en fin de page résultats (ResultatsV3).
 */

"use client";

import * as React from "react";
import { fonts, paletteFor, type V3Theme } from "@/lib/v3/tokens";
import { submitConseilLead } from "@/lib/api";

export function LeadConseilForm({
  theme = "night",
  interviewId,
  moduleId = null,
  /** Intitulé contextuel (ex: nom du chantier) affiché en sous-texte. */
  contextLabel = null,
}: {
  theme?: V3Theme;
  interviewId: number;
  moduleId?: string | null;
  contextLabel?: string | null;
}) {
  const palette = paletteFor(theme);
  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const canSend = message.trim().length > 0 && status !== "sending";

  async function handleSubmit() {
    if (!canSend) return;
    setStatus("sending");
    setErrorMsg(null);
    try {
      await submitConseilLead(interviewId, message.trim(), moduleId);
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erreur inconnue");
    }
  }

  // État final : remerciement.
  if (status === "sent") {
    return (
      <div
        style={{
          border: `1px solid ${palette.lineStrong}`,
          background: theme === "day" ? palette.ivoryLight : palette.ivory,
          padding: "18px 20px",
          fontFamily: fonts.serif,
          fontSize: 15,
          lineHeight: 1.6,
          color: palette.navy,
          fontStyle: "normal",
        }}
      >
        Merci, votre demande est bien partie. Sébastien vous recontactera par
        email à l'adresse de votre compte.
      </div>
    );
  }

  // CTA replié.
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          background: "transparent",
          color: palette.navy,
          border: `1px solid ${palette.lineStrong}`,
          padding: "12px 22px",
          fontFamily: fonts.sans,
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: "0.02em",
          cursor: "pointer",
          transition: "border-color 180ms ease-out",
          fontStyle: "normal",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = palette.navy)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = palette.lineStrong)}
      >
        Être recontacté par un consultant
      </button>
    );
  }

  // Formulaire ouvert.
  return (
    <div
      style={{
        border: `1px solid ${palette.lineStrong}`,
        background: theme === "day" ? palette.ivoryLight : palette.ivory,
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div>
        <p
          style={{
            fontFamily: fonts.mono,
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: palette.argentDeep,
            margin: 0,
            fontStyle: "normal",
          }}
        >
          Répondre à une offre de conseil
        </p>
        <p
          style={{
            fontFamily: fonts.serif,
            fontSize: 15,
            lineHeight: 1.5,
            color: palette.navy,
            margin: "6px 0 0 0",
            fontStyle: "normal",
          }}
        >
          Je voudrais qu&apos;un consultant Lugia me contacte pour&nbsp;:
          {contextLabel ? (
            <span style={{ color: palette.argentDeep }}> ({contextLabel})</span>
          ) : null}
        </p>
      </div>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        maxLength={2000}
        autoFocus
        placeholder="Décrivez en quelques mots ce sur quoi vous aimeriez être accompagné…"
        style={{
          width: "100%",
          resize: "vertical",
          background: palette.paper,
          border: `1px solid ${palette.line}`,
          padding: "10px 12px",
          fontFamily: fonts.serif,
          fontSize: 15,
          lineHeight: 1.5,
          color: palette.navy,
          outline: "none",
          boxSizing: "border-box",
        }}
      />

      {status === "error" && (
        <p style={{ fontFamily: fonts.sans, fontSize: 13, color: palette.signalWarn.default, margin: 0 }}>
          L&apos;envoi a échoué. Réessayez, ou écrivez directement à Sébastien.
          {errorMsg ? ` (Détail : ${errorMsg})` : ""}
        </p>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSend}
          style={{
            background: palette.navy,
            color: palette.paper,
            border: "none",
            padding: "11px 22px",
            fontFamily: fonts.sans,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.02em",
            cursor: canSend ? "pointer" : "not-allowed",
            opacity: canSend ? 1 : 0.5,
            fontStyle: "normal",
          }}
        >
          {status === "sending" ? "Envoi…" : "Envoyer ma demande"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          style={{
            background: "transparent",
            color: palette.argentDeep,
            border: "none",
            padding: "11px 8px",
            fontFamily: fonts.sans,
            fontSize: 13,
            cursor: "pointer",
            fontStyle: "normal",
          }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
