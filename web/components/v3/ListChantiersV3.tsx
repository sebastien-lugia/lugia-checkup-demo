"use client";

/**
 * V3-brand — page « Tous les chantiers » (liste complète).
 *
 * Accessible depuis la page résultats via le bouton « Voir tous les
 * chantiers ». Liste les 7 chantiers du catalogue, sans filtrage selon
 * les scores — le médecin peut explorer tout ce qui existe au-delà des
 * 4 prioritaires.
 *
 * V3-brand-T-V3-12.
 */

import { fonts, paletteFor, type V3Theme } from "@/lib/v3/tokens";
import { BlocBadge } from "@/components/v3/atoms";
import { listAllOpps, type V3OppEntry } from "@/lib/v3/opps_catalog";

export function ListChantiersV3({
  theme = "night",
  onOpenModule,
  onBack,
}: {
  theme?: V3Theme;
  onOpenModule?: (id: string) => void;
  onBack?: () => void;
}) {
  const palette = paletteFor(theme);
  const opps = listAllOpps();

  return (
    <main
      style={{
        background: palette.paper,
        color: palette.navy,
        minHeight: "100vh",
        paddingTop: 88,
        paddingBottom: 96,
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px" }}>
        {/* Bouton retour discret */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontFamily: fonts.mono,
              fontSize: 11,
              color: palette.navy400,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              transition: "color 180ms ease-out",
              marginBottom: 32,
              fontStyle: "normal",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = palette.navy)}
            onMouseLeave={(e) => (e.currentTarget.style.color = palette.navy400)}
          >
            ← Retour aux résultats
          </button>
        )}

        {/* Eyebrow */}
        <p
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: palette.navy400,
            margin: "0 0 18px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontStyle: "normal",
          }}
        >
          <span style={{ flexShrink: 0 }}>Tous les chantiers</span>
          <span
            aria-hidden="true"
            style={{ flex: 1, height: 1, background: palette.navy400, opacity: 0.4 }}
          />
        </p>

        {/* Titre */}
        <h1
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(28px, 3.2vw, 32px)",
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            margin: "0 0 12px",
            color: palette.navy,
            fontStyle: "normal",
          }}
        >
          Sept chantiers, trois axes.
        </h1>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 14,
            lineHeight: 1.7,
            color: palette.navy600,
            margin: "0 0 36px",
            maxWidth: 540,
            fontStyle: "normal",
          }}
        >
          Au-delà des 4 chantiers priorisés sur votre profil, voici l&apos;ensemble
          des leviers disponibles dans Lugia. Ils sont rangés par axe et triés
          par effort croissant.
        </p>

        {/* Grouper par axe pour la lecture */}
        {(["A", "B", "C"] as const).map((axis) => {
          const axisOpps = opps.filter((o) => o.axis === axis);
          if (axisOpps.length === 0) return null;
          const axisLabels = {
            A: "Parcours patient",
            B: "Équipe & secrétariat",
            C: "Outils & dossiers",
          };
          const axisColor = palette.axes[axis];

          return (
            <section key={axis} style={{ marginBottom: 40 }}>
              <h2
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 11,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: axisColor,
                  margin: "0 0 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  fontWeight: 600,
                  fontStyle: "normal",
                }}
              >
                <span style={{ flexShrink: 0 }}>{axisLabels[axis]}</span>
                <span
                  aria-hidden="true"
                  style={{
                    flex: 1,
                    height: 1,
                    background: axisColor,
                    opacity: 0.4,
                  }}
                />
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {axisOpps.map((opp) => (
                  <ChantierCard key={opp.id} theme={theme} opp={opp} onOpen={onOpenModule} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}

/* ───────────────────────────────────────────────────────────
 * ChantierCard — card de chantier dans la liste complète
 * ─────────────────────────────────────────────────────────── */

function ChantierCard({
  theme,
  opp,
  onOpen,
}: {
  theme: V3Theme;
  opp: V3OppEntry;
  onOpen?: (id: string) => void;
}) {
  const palette = paletteFor(theme);
  const axisColor = palette.axes[opp.axis];

  return (
    <button
      type="button"
      onClick={() => onOpen?.(opp.id)}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 16,
        padding: "18px 22px",
        background: theme === "day" ? palette.ivoryLight : palette.ivory,
        borderTop: `1px solid ${palette.line}`,
        borderRight: `1px solid ${palette.line}`,
        borderBottom: `1px solid ${palette.line}`,
        borderLeft: `2px solid ${axisColor}`,
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        transition: "border-color 180ms ease-out, transform 180ms ease-out, box-shadow 250ms ease-out",
        fontFamily: fonts.sans,
        fontStyle: "normal",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = palette.navy400;
        e.currentTarget.style.borderLeftColor = axisColor;
        e.currentTarget.style.transform = "translateX(2px)";
        e.currentTarget.style.boxShadow = "0 2px 12px -4px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = palette.line;
        e.currentTarget.style.borderLeftColor = axisColor;
        e.currentTarget.style.transform = "translateX(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Badge bloc A/B/C en tete de carte (charte C2-C4, taille sm) */}
      <BlocBadge id={opp.axis} theme={theme} size="sm" style={{ marginTop: 2 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            fontFamily: fonts.serif,
            fontSize: 18,
            fontWeight: 400,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
            margin: "0 0 5px",
            color: palette.navy,
            fontStyle: "normal",
          }}
        >
          {opp.title}
        </h3>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.55,
            color: palette.navy600,
            margin: "0 0 12px",
            fontStyle: "normal",
          }}
        >
          {opp.desc}
        </p>
        <TagTemporel theme={theme} effort={opp.effort} />
      </div>
    </button>
  );
}

/* ───────────────────────────────────────────────────────────
 * TagTemporel — étiquette quick/medium/invest dérivée de l'effort
 *
 * Mapping (cf charte composant 13) :
 *   effort 1 → QUICK   — color navy (= ivoire en mode Nuit)
 *   effort 2 → MEDIUM  — color argent
 *   effort 3 → INVEST  — color warn (or-signal)
 * ─────────────────────────────────────────────────────────── */

function TagTemporel({ theme, effort }: { theme: V3Theme; effort: 1 | 2 | 3 }) {
  const palette = paletteFor(theme);
  const tag =
    effort === 1
      ? { label: "RAPIDE", color: palette.navy }
      : effort === 2
      ? { label: "POSÉ", color: palette.argentDeep }
      : { label: "APPROFONDI", color: palette.signalWarn.default };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        fontFamily: fonts.mono,
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: tag.color,
        border: `1px solid ${tag.color}`,
        fontStyle: "normal",
      }}
    >
      {tag.label}
    </span>
  );
}
