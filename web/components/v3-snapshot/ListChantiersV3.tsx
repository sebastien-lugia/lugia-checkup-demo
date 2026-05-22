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

import { fonts, paletteFor, type V3Theme } from "@/lib/v3-snapshot/tokens";
import { listAllOpps, type V3OppEntry } from "@/lib/v3-snapshot/opps_catalog";

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
            fontSize: "clamp(28px, 3.2vw, 36px)",
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
        background: palette.ivory,
        border: `1px solid ${palette.line}`,
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
      <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, paddingTop: 2 }}>{opp.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            fontFamily: fonts.serif,
            fontSize: 17,
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            fontFamily: fonts.mono,
            fontSize: 10,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: palette.navy400,
            fontStyle: "normal",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Effort
            <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    width: 13,
                    height: 2,
                    background: i <= opp.effort ? palette.navy : palette.lineStrong,
                    verticalAlign: "middle",
                  }}
                />
              ))}
            </span>
          </span>
          <span aria-hidden="true" style={{ display: "inline-block", width: 1, height: 12, background: palette.lineStrong }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Délai
            <span style={{ color: palette.navy, fontWeight: 500 }}>{opp.delai}</span>
          </span>
          <span aria-hidden="true" style={{ display: "inline-block", width: 1, height: 12, background: palette.lineStrong }} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            Gain
            <span style={{ color: palette.navy, fontWeight: 500 }}>{opp.gainTime}</span>
            <span aria-hidden="true">·</span>
            <span style={{ color: palette.navy, fontWeight: 500 }}>
              {opp.gainEuros}
              <sup style={{ fontSize: 8, color: palette.navy400 }}>*</sup>
            </span>
          </span>
        </div>
      </div>
    </button>
  );
}
