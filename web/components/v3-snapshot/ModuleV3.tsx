"use client";

/**
 * V3-brand — page module (plan d'action en 4 étapes).
 *
 * Accessible depuis les chantiers prioritaires de la page résultats.
 * Structure :
 *  - Bouton retour
 *  - Eyebrow "Plan d'action" + titre serif coloré par axe + icône
 *  - Sous-titre court (optionnel)
 *  - 4 étapes (mod-step) : numéro mono + titre serif + body Onest + tag temporel
 *  - Section "Données terrain" : benchmark de conclusion + source
 *  - Boutons retour + (option) imprimer + CTA Lugia
 *
 * V3-brand-T-V3-8.
 */

import { fonts, paletteFor, type V3Theme } from "@/lib/v3-snapshot/tokens";
import { V3_TAG_LABELS, type V3Module, type V3ModuleTag } from "@/lib/v3-snapshot/modules_data";

export type AxisId = "A" | "B" | "C";

export function ModuleV3({
  theme = "night",
  module: mod,
  /** Axe principal du module (alimente la couleur du titre + filet). */
  axis,
  onBack,
  onLugia,
  onPrint,
}: {
  theme?: V3Theme;
  module: V3Module;
  axis: AxisId;
  onBack?: () => void;
  onLugia?: () => void;
  onPrint?: () => void;
}) {
  const palette = paletteFor(theme);
  const axisColor = palette.axes[axis];

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
            ← Retour au diagnostic
          </button>
        )}

        {/* Eyebrow Plan d'action */}
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
          <span style={{ flexShrink: 0 }}>Plan d&apos;action</span>
          <span
            aria-hidden="true"
            style={{ flex: 1, height: 1, background: palette.navy400, opacity: 0.4 }}
          />
        </p>

        {/* Titre avec icône */}
        <h1
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(28px, 3.2vw, 36px)",
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            margin: "0 0 12px",
            color: axisColor,
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontStyle: "normal",
          }}
        >
          <span style={{ fontSize: 32, lineHeight: 1, flexShrink: 0 }}>{mod.icone}</span>
          {mod.label}
        </h1>

        {/* Filet sous le titre */}
        <div
          aria-hidden="true"
          style={{
            width: 60,
            height: 1,
            background: axisColor,
            opacity: 0.4,
            marginBottom: 40,
          }}
        />

        {/* Liste des étapes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 48 }}>
          {mod.etapes.map((etape) => (
            <StepCard key={etape.num} theme={theme} step={etape} />
          ))}
        </div>

        {/* Données terrain — benchmark de conclusion */}
        <section
          style={{
            padding: "22px 26px",
            background: palette.signalWarn.surface,
            border: `1px solid ${palette.signalWarn.border}`,
            borderLeft: `2px solid ${palette.signalWarn.default}`,
            marginBottom: 48,
          }}
        >
          <p
            style={{
              fontFamily: fonts.mono,
              fontSize: 9,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: palette.signalWarn.default,
              margin: "0 0 10px",
              fontStyle: "normal",
            }}
          >
            Données terrain
          </p>
          <p
            style={{
              fontFamily: fonts.serif,
              fontSize: "clamp(15px, 1.6vw, 17px)",
              fontWeight: 400,
              lineHeight: 1.7,
              color: palette.navy,
              margin: 0,
              maxWidth: 580,
              fontStyle: "normal",
            }}
          >
            {mod.benchmark.texte}
          </p>
          {mod.benchmark.source_hint && (
            <p
              style={{
                fontFamily: fonts.mono,
                fontSize: 10,
                letterSpacing: "0.08em",
                color: palette.signalWarn.default,
                margin: "12px 0 0",
                fontStyle: "normal",
                opacity: 0.8,
              }}
            >
              Source&nbsp;: {mod.benchmark.source_hint}
              {mod.benchmark.source_status === "to_confirm" && (
                <span style={{ marginLeft: 6, opacity: 0.7 }}>· à confirmer</span>
              )}
            </p>
          )}
        </section>

        {/* CTA bas de page */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            paddingTop: 24,
            borderTop: `1px solid ${palette.line}`,
          }}
        >
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
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
                  fontStyle: "normal",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = palette.navy)}
                onMouseLeave={(e) => (e.currentTarget.style.color = palette.navy400)}
              >
                ← Retour
              </button>
            )}
            {onPrint && (
              <button
                type="button"
                onClick={onPrint}
                style={{
                  background: "transparent",
                  border: `1px solid ${palette.lineStrong}`,
                  padding: "8px 16px",
                  fontFamily: fonts.mono,
                  fontSize: 10,
                  color: palette.navy,
                  letterSpacing: "0.10em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "border-color 180ms ease-out",
                  fontStyle: "normal",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = palette.navy)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = palette.lineStrong)}
              >
                Imprimer
              </button>
            )}
          </div>
          {onLugia && (
            <button
              type="button"
              onClick={onLugia}
              style={{
                background: palette.navy,
                color: palette.paper,
                border: "none",
                padding: "12px 22px",
                fontFamily: fonts.sans,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "0.02em",
                cursor: "pointer",
                transition: "box-shadow 250ms ease-out, transform 180ms ease-out",
                fontStyle: "normal",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 1px ${palette.argent}, 0 8px 24px -8px ${palette.argent}`;
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              En parler avec Lugia →
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

/* ───────────────────────────────────────────────────────────
 * StepCard — une étape du plan d'action
 * ─────────────────────────────────────────────────────────── */

function StepCard({
  theme,
  step,
}: {
  theme: V3Theme;
  step: { num: string; titre: string; body: string; tag: V3ModuleTag };
}) {
  const palette = paletteFor(theme);

  // Couleur du tag temporel
  const tagColor: Record<V3ModuleTag, string> = {
    quick: palette.axes.A,
    medium: palette.signalWarn.default,
    invest: palette.argent,
  };

  return (
    <article
      style={{
        background: palette.ivory,
        border: `1px solid ${palette.line}`,
        padding: "20px 24px",
        display: "flex",
        gap: 20,
        alignItems: "flex-start",
      }}
    >
      {/* Numéro mono — colonne gauche */}
      <span
        aria-hidden="true"
        style={{
          fontFamily: fonts.mono,
          fontSize: 13,
          fontWeight: 500,
          color: palette.navy400,
          letterSpacing: "0.04em",
          flexShrink: 0,
          paddingTop: 2,
          minWidth: 22,
        }}
      >
        {step.num}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Titre */}
        <h3
          style={{
            fontFamily: fonts.serif,
            fontSize: 17,
            fontWeight: 400,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
            margin: "0 0 8px",
            color: palette.navy,
            fontStyle: "normal",
          }}
        >
          {step.titre}
        </h3>

        {/* Body */}
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 13,
            lineHeight: 1.65,
            color: palette.navy600,
            margin: "0 0 12px",
            fontStyle: "normal",
          }}
        >
          {step.body}
        </p>

        {/* Tag temporel */}
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "3px 9px",
            fontFamily: fonts.mono,
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            border: `1px solid ${tagColor[step.tag]}40`,
            color: tagColor[step.tag],
            background: `${tagColor[step.tag]}14`,
            fontStyle: "normal",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "currentColor",
              flexShrink: 0,
            }}
          />
          {V3_TAG_LABELS[step.tag]}
        </span>
      </div>
    </article>
  );
}
