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

import * as React from "react";
import { fonts, paletteFor, type V3Theme } from "@/lib/v3/tokens";
import { V3_TAG_LABELS, type V3Module, type V3ModuleTag } from "@/lib/v3/modules_data";
import { getOpp } from "@/lib/v3/opps_catalog";

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

        {/* Titre (charte J1 : pas d'emoji — retrait de l'icône) */}
        <h1
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(28px, 3.2vw, 32px)",
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            margin: "0 0 12px",
            color: axisColor,
            fontStyle: "normal",
          }}
        >
          {mod.label}
        </h1>

        {/* Filet sous le titre retiré pour un header plus aéré. */}
        <div aria-hidden="true" style={{ marginBottom: 28 }} />

        {/* En-tête : EFFORT / DÉLAI / GAIN (cf charte composant 12 — méta du chantier).
            Données récupérées par jointure id ↔ V3_OPPS_CATALOG (les ids matchent 1:1). */}
        <ChantierHeader theme={theme} moduleId={mod.id} />

        {/* Liste des étapes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 48 }}>
          {mod.etapes.map((etape) => (
            <StepCard key={etape.num} theme={theme} step={etape} />
          ))}
        </div>

        {/* Mini-encart « Avec Lugia » — ce que Lugia peut sécuriser ou
            accélérer sur ce chantier précisément. Ton respectueux de
            l'autonomie : le médecin peut tout faire seul, Lugia est une
            option. */}
        {mod.avecLugia && (
          <section
            style={{
              padding: "22px 26px",
              background: theme === "day" ? palette.ivoryLight : palette.ivory,
              borderTop: `1px solid ${palette.line}`,
              borderRight: `1px solid ${palette.line}`,
              borderBottom: `1px solid ${palette.line}`,
              borderLeft: `2px solid ${palette.argent}`,
              marginBottom: 32,
            }}
          >
            <p
              style={{
                fontFamily: fonts.mono,
                fontSize: 9,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: palette.argentDeep ?? palette.argent,
                margin: "0 0 10px",
                fontStyle: "normal",
              }}
            >
              Avec Lugia
            </p>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 14,
                lineHeight: 1.65,
                color: palette.navy,
                margin: 0,
                fontStyle: "normal",
              }}
            >
              {mod.avecLugia}
            </p>
          </section>
        )}

        {/* Données terrain — benchmark de conclusion */}
        <section
          style={{
            padding: "22px 26px",
            background: palette.signalWarn.surface,
            borderTop: `1px solid ${palette.signalWarn.border}`,
            borderRight: `1px solid ${palette.signalWarn.border}`,
            borderBottom: `1px solid ${palette.signalWarn.border}`,
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
              fontSize: "clamp(15px, 1.6vw, 18px)",
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

/**
 * En-tête du chantier (page module) — disposition verticale + tailles
 * relevées. Charte A1-ter : pas côte à côte, chaque info sur sa propre
 * ligne avec label mono caps + valeur Onest 500.
 */
function ChantierHeader({ theme, moduleId }: { theme: V3Theme; moduleId: string }) {
  const palette = paletteFor(theme);
  const opp = getOpp(moduleId);
  if (!opp) return null;

  // Reformulation langage naturel des chaînes télégraphiques du catalogue.
  // On laisse opps_catalog en données structurées (utile pour le radar, le tri,
  // les éventuelles agrégations), on adapte juste à l'affichage.
  const effortPhrase: Record<1 | 2 | 3, string> = {
    1: "Facile à mettre en place",
    2: "Demande un peu d'organisation",
    3: "Investissement plus profond",
  };

  function naturalDelai(s: string): string {
    // "< 1 semaine"  → "Quelques jours suffisent."
    // "2–4 semaines" → "Entre 2 et 4 semaines."
    if (s.startsWith("<")) return "Quelques jours suffisent.";
    const m = s.match(/^(\d+)\D+(\d+)\s*(\w+)/);
    if (m) return `Entre ${m[1]} et ${m[2]} ${m[3]}.`;
    return s + ".";
  }

  function naturalGain(time: string, euros: string): React.ReactNode {
    // time: "−20 min/j", "−1h/j", "−15 min/consult", "−2h/sem"
    // euros: "+10 k€/an"
    let timePart = time;
    const mDay = time.match(/^−(\d+)\s*min\/j$/);
    const mHourDay = time.match(/^−(\d+)\s*h\/j$/);
    const mConsult = time.match(/^−(\d+)\s*min\/consult$/);
    const mWeek = time.match(/^−(\d+)\s*h\/sem$/);
    if (mDay) timePart = `Environ ${mDay[1]} minutes libérées par jour`;
    else if (mHourDay) timePart = `Environ ${mHourDay[1]} h libérée${parseInt(mHourDay[1]) > 1 ? "s" : ""} par jour`;
    else if (mConsult) timePart = `Environ ${mConsult[1]} minutes par consultation`;
    else if (mWeek) timePart = `Environ ${mWeek[1]} h libérée${parseInt(mWeek[1]) > 1 ? "s" : ""} par semaine`;

    let eurosPart = euros;
    const mE = euros.match(/^\+(\d+)\s*k€\/an$/);
    if (mE) eurosPart = `~${mE[1]} k€ par an`;

    return (
      <>
        {timePart}, soit {eurosPart}
        <sup style={{ fontSize: 10, color: palette.navy400 }}>*</sup>.
      </>
    );
  }

  const rows: { label: string; value: React.ReactNode }[] = [
    {
      label: "Effort",
      value: (
        <span style={{ display: "inline-flex", gap: 12, alignItems: "center" }}>
          <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
            {[1, 2, 3].map((i) => (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  width: 22,
                  height: 3,
                  background: i <= opp.effort ? palette.navy : palette.lineStrong,
                }}
              />
            ))}
          </span>
          <span style={{ fontWeight: 400 }}>
            {effortPhrase[opp.effort]}.
          </span>
        </span>
      ),
    },
    { label: "Délai", value: naturalDelai(opp.delai) },
    {
      label: "Gain",
      value: naturalGain(opp.gainTime, opp.gainEuros),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        padding: "4px 0 26px",
        borderBottom: `1px solid ${palette.line}`,
        marginBottom: 44,
      }}
    >
      {rows.map((row) => (
        <div
          key={row.label}
          style={{
            display: "grid",
            gridTemplateColumns: "100px 1fr",
            alignItems: "center",
            gap: 24,
            fontStyle: "normal",
          }}
        >
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: palette.navy400,
            }}
          >
            {row.label}
          </span>
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 15,
              fontWeight: 500,
              color: palette.navy,
              lineHeight: 1.4,
            }}
          >
            {row.value}
          </span>
        </div>
      ))}

      {/* Footnote estimations — déplacée depuis la page résultats vers
          la page détail chantier (le `*` apparaît sur le GAIN ci-dessus). */}
      <p
        style={{
          fontFamily: fonts.mono,
          fontSize: 11,
          color: palette.navy400,
          letterSpacing: "0.04em",
          margin: "-2px 0 0",
          opacity: 0.75,
          fontStyle: "normal",
          gridColumn: "1 / -1",
          paddingLeft: 124,
        }}
      >
        * Estimations calculées sur la base de votre profil cabinet (220 jours, taux horaire médecin).
      </p>
    </div>
  );
}

function StepCard({
  theme,
  step,
}: {
  theme: V3Theme;
  step: { num: string; titre: string; body: string; tag: V3ModuleTag };
}) {
  const palette = paletteFor(theme);

  // Couleur du tag temporel (Charte A1 : pas de couleur d'axe par tag)
  // quick = navy (accent fort lisible dans les 2 modes), medium = warn
  // (effort signalé), invest = argent (matière neutre).
  const tagColor: Record<V3ModuleTag, string> = {
    quick: palette.navy,
    medium: palette.signalWarn.default,
    invest: palette.argent,
  };

  return (
    <article
      style={{
        background: "transparent",
        padding: "20px 0",
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
            fontSize: 18,
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
