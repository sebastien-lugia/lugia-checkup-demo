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
import {
  getOpp,
  computeGainEurosPerYear,
  formatGainEuros,
  computeChantierStats,
  tauxToRatio,
  type VolumeId,
  ESTIMATION,
} from "@/lib/v3/opps_catalog";

export type AxisId = "A" | "B" | "C";

export function ModuleV3({
  theme = "night",
  module: mod,
  /** Axe principal du module (alimente la couleur du titre + filet). */
  axis,
  onBack,
  onLugia,
  onPrint,
  onDownloadPdf,
  onOpenChat,
  volume,
}: {
  theme?: V3Theme;
  module: V3Module;
  axis: AxisId;
  onBack?: () => void;
  onLugia?: () => void;
  onPrint?: () => void;
  /** H.4 : télécharger le chantier en PDF généré côté backend. */
  onDownloadPdf?: () => void;
  /** A.2 : ouvrir le modal de discussion avec l'assistant Lugia. */
  onOpenChat?: () => void;
  /** Volume hebdomadaire du cabinet — alimente le calcul des gains €. */
  volume?: VolumeId | null;
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

        {/* Titre (charte J1 : pas d'emoji — retrait de l'icône).
            2026-05-23 : en day, axisColor (#B5B5B8) etait trop pale pour
            un titre serif. On passe en palette.argentDeep (#6E6E70) — on
            reste dans la famille argent (gris neutre, pas de bleu) mais
            plus contraste sur fond ivoire. En night, axisColor argent
            (#B5B5B8) ressort bien sur fond navy, inchange. */}
        <h1
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(28px, 3.2vw, 32px)",
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            margin: "0 0 12px",
            color: theme === "day" ? palette.argentDeep : axisColor,
            fontStyle: "normal",
          }}
        >
          {mod.label}
        </h1>

        {/* Filet sous le titre retiré pour un header plus aéré. */}
        <div aria-hidden="true" style={{ marginBottom: 28 }} />

        {/* En-tête : EFFORT / DÉLAI / GAIN (cf charte composant 12 — méta du chantier).
            Données récupérées par jointure id ↔ V3_OPPS_CATALOG (les ids matchent 1:1). */}
        <ChantierHeader theme={theme} moduleId={mod.id} volume={volume ?? null} />

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
                color: palette.argentDeep,
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
            {onOpenChat && (
              <button
                type="button"
                onClick={onOpenChat}
                style={{
                  background: palette.argent,
                  color: palette.navy,
                  border: `1px solid ${palette.argent}`,
                  padding: "10px 18px",
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  cursor: "pointer",
                  transition: "opacity 180ms ease-out",
                  fontStyle: "normal",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Discuter avec l&apos;assistant
              </button>
            )}
            {onDownloadPdf && (
              <button
                type="button"
                onClick={onDownloadPdf}
                style={{
                  background: "transparent",
                  color: palette.navy,
                  border: `1px solid ${palette.lineStrong}`,
                  padding: "10px 18px",
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  cursor: "pointer",
                  transition: "border-color 180ms ease-out",
                  fontStyle: "normal",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = palette.navy)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = palette.lineStrong)}
              >
                Télécharger en PDF
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
function ChantierHeader({ theme, moduleId, volume }: { theme: V3Theme; moduleId: string; volume: VolumeId | null }) {
  const palette = paletteFor(theme);
  const opp = getOpp(moduleId);
  if (!opp) return null;

  const stats = computeChantierStats(opp, volume);

  // Reformulation langage naturel du gainTime — partagée par les deux scénarios.
  function naturalGainTime(time: string): string {
    let timePart = time;
    const mDay = time.match(/^−(\d+)\s*min\/j$/);
    const mHourDay = time.match(/^−(\d+)\s*h\/j$/);
    const mConsult = time.match(/^−(\d+)\s*min\/consult$/);
    const mWeek = time.match(/^−(\d+)\s*h\/sem$/);
    const mWeekMin = time.match(/^−(\d+)\s*min\/sem$/);
    if (mDay) timePart = `Environ ${mDay[1]} min libérées/jour`;
    else if (mHourDay) timePart = `Environ ${mHourDay[1]} h libérée${parseInt(mHourDay[1]) > 1 ? "s" : ""}/jour`;
    else if (mConsult) timePart = `Environ ${mConsult[1]} min gagnées/consultation`;
    else if (mWeek) timePart = `Environ ${mWeek[1]} h libérée${parseInt(mWeek[1]) > 1 ? "s" : ""}/semaine`;
    else if (mWeekMin) timePart = `Environ ${mWeekMin[1]} min libérées/semaine`;
    return timePart;
  }

  type Row = {
    label: string;
    auto: React.ReactNode;
    lugia: React.ReactNode;
  };
  const rows: Row[] = [
    {
      label: "Gain attendu",
      auto:
        stats.gainAttenduAuto !== null
          ? `~${formatGainEuros(stats.gainAttenduAuto)}/an`
          : "—",
      lugia:
        stats.gainAttenduLugia !== null ? (
          <strong style={{ color: palette.navy, fontWeight: 600 }}>
            ~{formatGainEuros(stats.gainAttenduLugia)}/an
          </strong>
        ) : (
          "—"
        ),
    },
    {
      label: "Délai",
      auto: stats.delaiAuto,
      lugia: stats.delaiLugia,
    },
    {
      label: "Votre temps",
      auto: `~${stats.effortAutoHours} h cumulées`,
      lugia: `~${stats.effortLugiaHours} h cumulées`,
    },
    {
      label: "Taux d'aboutissement",
      auto: tauxToRatio(stats.tauxAuto),
      lugia: tauxToRatio(stats.tauxLugia),
    },
  ];

  return (
    <div
      style={{
        padding: "4px 0 26px",
        borderBottom: `1px solid ${palette.line}`,
        marginBottom: 32,
      }}
    >
      {/* Bandeau temps libéré (commun aux 2 scénarios) — pédagogie sur l'origine du gain */}
      <p
        style={{
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: palette.navy400,
          margin: "0 0 6px",
          fontStyle: "normal",
        }}
      >
        Mécanique du chantier
      </p>
      <p
        style={{
          fontFamily: fonts.sans,
          fontSize: 14,
          lineHeight: 1.55,
          color: palette.navy,
          margin: "0 0 20px",
          fontStyle: "normal",
        }}
      >
        {naturalGainTime(opp.gainTime)} si le chantier est mené à son terme.
      </p>

      {/* En-tête colonnes du comparatif */}
      <div
        className="v3-chantier-comparatif-head"
        style={{
          display: "grid",
          gridTemplateColumns: "140px 1fr 1fr",
          gap: 16,
          alignItems: "end",
          paddingBottom: 10,
          borderBottom: `1px solid ${palette.line}`,
          marginBottom: 14,
        }}
      >
        <span />
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: palette.navy400,
            fontStyle: "normal",
          }}
        >
          En autonomie
        </span>
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: palette.navy,
            fontWeight: 600,
            fontStyle: "normal",
          }}
        >
          Avec Lugia
        </span>
      </div>

      {/* Lignes du comparatif */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rows.map((row) => (
          <div
            key={row.label}
            className="v3-chantier-comparatif-row"
            style={{
              display: "grid",
              gridTemplateColumns: "140px 1fr 1fr",
              gap: 16,
              alignItems: "baseline",
              fontStyle: "normal",
            }}
          >
            <span
              style={{
                fontFamily: fonts.mono,
                fontSize: 11,
                letterSpacing: "0.14em",
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
                color: palette.navy600,
                lineHeight: 1.4,
              }}
            >
              {row.auto}
            </span>
            <span
              style={{
                fontFamily: fonts.sans,
                fontSize: 15,
                color: palette.navy,
                lineHeight: 1.4,
              }}
            >
              {row.lugia}
            </span>
          </div>
        ))}
      </div>

      {/* Footnote */}
      <p
        style={{
          fontFamily: fonts.mono,
          fontSize: 11,
          color: palette.navy400,
          letterSpacing: "0.04em",
          lineHeight: 1.55,
          margin: "18px 0 0",
          opacity: 0.75,
          fontStyle: "normal",
        }}
      >
        Gain attendu = gain théorique × probabilité d'aboutir. Probabilités issues de la littérature change management
        organisationnel. Hypothèses : 70 € TTC/h, 220 jours/an, 70 % du temps libéré réinvesti.
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
