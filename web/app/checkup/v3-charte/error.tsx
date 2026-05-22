"use client";

/**
 * V3-charte — gestionnaire d'erreur Next.js pour la route /checkup/v3-charte.
 *
 * Capture les crashes runtime et affiche un panneau avec le message + stack
 * (au lieu de la page blanche par défaut). Utile pour debug local.
 *
 * V3-brand-T-V3-10-fix-3.
 */

import { useEffect } from "react";

export default function CheckupV3BrandError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log côté client pour la console
    // eslint-disable-next-line no-console
    console.error("[V3-brand crash]", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#1A2333",
        color: "#f4efe5",
        padding: "60px 24px",
        fontFamily: '"Onest", -apple-system, sans-serif',
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <p
          style={{
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#c4a055",
            margin: "0 0 16px",
          }}
        >
          V3-brand · Erreur runtime
        </p>
        <h1
          style={{
            fontFamily: '"Lora", serif',
            fontSize: 32,
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            margin: "0 0 24px",
          }}
        >
          La page a rencontré une erreur.
        </h1>
        <div
          style={{
            background: "rgba(200,160,74,0.10)",
            borderTop: "1px solid rgba(200,160,74,0.32)",
            borderRight: "1px solid rgba(200,160,74,0.32)",
            borderBottom: "1px solid rgba(200,160,74,0.32)",
            borderLeft: "2px solid #c4a055",
            padding: "20px 24px",
            marginBottom: 32,
          }}
        >
          <p
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#c4a055",
              margin: "0 0 12px",
            }}
          >
            Message
          </p>
          <p
            style={{
              fontFamily: '"IBM Plex Mono", monospace',
              fontSize: 13,
              lineHeight: 1.6,
              color: "#f4efe5",
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {error.message}
          </p>
          {error.stack && (
            <details style={{ marginTop: 16 }}>
              <summary
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: 11,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#c4a055",
                  cursor: "pointer",
                }}
              >
                Stack trace
              </summary>
              <pre
                style={{
                  fontFamily: '"IBM Plex Mono", monospace',
                  fontSize: 11,
                  lineHeight: 1.55,
                  color: "#a8b2c8",
                  margin: "12px 0 0",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {error.stack}
              </pre>
            </details>
          )}
          {error.digest && (
            <p
              style={{
                fontFamily: '"IBM Plex Mono", monospace',
                fontSize: 10,
                letterSpacing: "0.08em",
                color: "#6e7a95",
                margin: "12px 0 0",
              }}
            >
              digest : {error.digest}
            </p>
          )}
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#f4efe5",
              color: "#1A2333",
              border: "none",
              padding: "12px 22px",
              fontFamily: '"Onest", -apple-system, sans-serif',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.02em",
              cursor: "pointer",
            }}
          >
            Réessayer
          </button>
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "12px 22px",
              background: "transparent",
              color: "#f4efe5",
              border: "1px solid rgba(251,250,246,0.20)",
              fontFamily: '"Onest", -apple-system, sans-serif',
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.02em",
              textDecoration: "none",
            }}
          >
            ← Retour à l&apos;accueil
          </a>
        </div>
      </div>
    </main>
  );
}
