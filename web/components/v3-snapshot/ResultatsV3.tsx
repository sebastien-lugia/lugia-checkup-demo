"use client";

/**
 * V3-brand — page résultats (refonte complète selon spec finale).
 *
 * Spec : `resources/v3_resultats_specs.md`
 * Maquette de référence : `wireframes/v3_resultats_test_v3.html`
 *
 * Structure (ordre de lecture) :
 *  1. Header — eyebrow + h1 + méta + phrase motivation
 *  2. Phrase choc — analyse croisée en serif, début neutre, fin en --warn (<strong>)
 *  3. Bilan global — 2 colonnes « Ce qui tient » / « Ce qui fragilise » avec risk-badge
 *  4. Radar + légende — SVG grand format 860×480 avec annotations latérales
 *  5. Par axe — 3 cards dépliantes avec Forces + Marges + risk-badge inline
 *  6. Chantiers prioritaires — opp-cards Effort+Délai+Gain (temps + €) + note astérisque
 *  7. Voir tous les chantiers — bouton outline
 *  8. Prochaine étape — 2 cards autonomie (gratuit) / Lugia (RDV)
 *
 * V3-brand-T-V3-7-spec — refonte selon spec Sébastien.
 */

import { useState, useRef } from "react";
import { fonts, paletteFor, type V3Theme } from "@/lib/v3-snapshot/tokens";

/* ───────────────────────────────────────────────────────────
 * Types
 * ─────────────────────────────────────────────────────────── */

export type AxisId = "A" | "B" | "C";
export type RiskLevel = "crit" | "warn" | "opt";

const RISK_LABEL: Record<RiskLevel, string> = {
  crit: "Critique",
  warn: "À surveiller",
  opt: "Optimisable",
};

export type BilanItem = {
  /** Titre court — Onest 500 navy. */
  title: string;
  /** Description sur 1-2 lignes — Onest navy600. */
  desc: string;
  /** Pour la colonne « Ce qui fragilise » : niveau de risque. */
  risk?: RiskLevel;
};

export type AxisDetail = {
  /** Phrase de synthèse — Onest 13 px. */
  summary: string;
  forces: string[];
  marges: Array<{ text: string; risk?: RiskLevel }>;
};

export type RadarAnnotation = {
  /** Quel point ancrer (`A`, `B`, `C` ou `BC` = milieu B-C). */
  axis: "A" | "B" | "C" | "BC";
  /** Côté du SVG vers lequel sort le trait. */
  side: "left" | "right";
  title: string;
  sub: string;
  badge: RiskLevel;
};

export type V3Opp = {
  id: string;
  icon: string;
  axis: AxisId;
  /** Si true, affiche le badge « ★ Recommandé pour commencer » + border-left coloré. */
  recommended?: boolean;
  title: string;
  desc: string;
  /** Niveau d'effort 1, 2 ou 3 (pip actifs). */
  effort: 1 | 2 | 3;
  /** Délai avant gain visible. */
  delai: string;
  /** Gain en temps (« -45 min/j », « -2h/sem »…). */
  gainTime: string;
  /** Gain en € (« +22 k€/an »). */
  gainEuros: string;
};

/* ───────────────────────────────────────────────────────────
 * Composant racine
 * ─────────────────────────────────────────────────────────── */

export function ResultatsV3({
  theme = "night",
  firstname,
  completedDate,
  durationMinutes,
  motivPhrase,
  phraseChocBefore,
  phraseChocAfter,
  bilanForces,
  bilanRisques,
  radarScores,
  radarAnnotations,
  axisALevel,
  axisADetail,
  axisBLevel,
  axisBDetail,
  axisCLevel,
  axisCDetail,
  opps,
  onOpenModule,
  onOpenAll,
  onAutonomie,
  onLugia,
}: {
  theme?: V3Theme;
  firstname: string;
  completedDate: string;
  durationMinutes: number;
  motivPhrase: string;
  /** Texte avant le `<strong>` en --warn. */
  phraseChocBefore: string;
  /** Texte mis en exergue en --warn. */
  phraseChocAfter: string;
  bilanForces: BilanItem[];
  bilanRisques: BilanItem[];
  radarScores: { A: number; B: number; C: number };
  radarAnnotations: RadarAnnotation[];
  axisALevel: string;
  axisADetail: AxisDetail;
  axisBLevel: string;
  axisBDetail: AxisDetail;
  axisCLevel: string;
  axisCDetail: AxisDetail;
  opps: V3Opp[];
  onOpenModule?: (id: string) => void;
  onOpenAll?: () => void;
  onAutonomie?: () => void;
  onLugia?: () => void;
}) {
  const palette = paletteFor(theme);

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
        {/* ── Header ── */}
        <Eyebrow theme={theme}>Diagnostic complet</Eyebrow>
        <h1
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(32px, 3.5vw, 40px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: "0 0 20px",
            color: palette.navy,
            fontStyle: "normal",
          }}
        >
          Votre cabinet
          <br />
          en trois dimensions
        </h1>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "6px 14px",
            margin: "0 0 20px",
            fontFamily: fonts.mono,
            fontSize: 11,
            letterSpacing: "0.10em",
            textTransform: "uppercase",
            color: palette.navy600,
            fontStyle: "normal",
          }}
        >
          <span>Dr {firstname}</span>
          <span style={{ opacity: 0.4 }} aria-hidden="true">·</span>
          <span>{completedDate}</span>
          <span style={{ opacity: 0.4 }} aria-hidden="true">·</span>
          <span>{durationMinutes} min</span>
        </div>
        <p
          style={{
            fontFamily: fonts.serif,
            fontSize: 16,
            fontWeight: 400,
            lineHeight: 1.65,
            color: palette.navy,
            opacity: 0.72,
            margin: "0 0 52px",
            maxWidth: 580,
            fontStyle: "normal",
          }}
        >
          {motivPhrase}
        </p>

        {/* ── 1. Phrase choc ── */}
        <PhraseChoc theme={theme} before={phraseChocBefore} after={phraseChocAfter} />

        {/* ── 2. Bilan global ── */}
        <Eyebrow theme={theme}>Points forts &amp; risques globaux</Eyebrow>
        <BilanGlobal theme={theme} forces={bilanForces} risques={bilanRisques} />

        {/* ── 3. Radar + légende ── */}
        <section style={{ marginBottom: 48 }}>
          <Eyebrow theme={theme}>Cartographie organisationnelle</Eyebrow>
          <RadarSvg theme={theme} scores={radarScores} annotations={radarAnnotations} />
          <RadarLegend
            theme={theme}
            scores={radarScores}
            levels={{ A: axisALevel, B: axisBLevel, C: axisCLevel }}
          />
        </section>

        {/* ── 4. Par axe ── */}
        <Eyebrow theme={theme}>Par axe</Eyebrow>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 10,
            marginBottom: 48,
          }}
        >
          <AxisCard theme={theme} axis="A" title="Parcours patient" level={axisALevel} detail={axisADetail} />
          <AxisCard theme={theme} axis="B" title="Équipe & secrétariat" level={axisBLevel} detail={axisBDetail} />
          <AxisCard theme={theme} axis="C" title="Outils & dossiers" level={axisCLevel} detail={axisCDetail} />
        </div>

        {/* ── 5. Chantiers prioritaires ── */}
        <Eyebrow theme={theme}>Chantiers prioritaires</Eyebrow>
        <h2
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(22px, 2.5vw, 26px)",
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
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 13,
            lineHeight: 1.6,
            color: palette.navy600,
            margin: "0 0 20px",
            fontStyle: "normal",
          }}
        >
          Ces chantiers ont été sélectionnés pour leur effet de levier sur votre
          profil — accessibles à court terme, sans ressource supplémentaire.
        </p>

        <div style={{ display: "grid", gap: 8, marginBottom: 16 }}>
          {opps.map((opp) => (
            <OppCard
              key={opp.id}
              theme={theme}
              opp={opp}
              onOpen={onOpenModule}
            />
          ))}
        </div>

        <p
          style={{
            fontFamily: fonts.mono,
            fontSize: 9,
            color: palette.navy400,
            letterSpacing: "0.06em",
            margin: "0 0 8px",
            opacity: 0.7,
            fontStyle: "normal",
          }}
        >
          * Estimations calculées sur la base de votre profil cabinet (220 jours,
          taux horaire médecin).
        </p>

        <div style={{ margin: "8px 0 56px" }}>
          <button
            type="button"
            onClick={() => onOpenAll?.()}
            style={{
              background: "transparent",
              color: palette.navy,
              border: `1px solid ${palette.lineStrong}`,
              padding: "10px 22px",
              fontFamily: fonts.mono,
              fontSize: 10,
              letterSpacing: "0.10em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "border-color 180ms ease-out, background 180ms ease-out",
              fontStyle: "normal",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = palette.navy;
              e.currentTarget.style.background = palette.ivory;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = palette.lineStrong;
              e.currentTarget.style.background = "transparent";
            }}
          >
            Voir tous les chantiers →
          </button>
        </div>

        {/* ── 6. Prochaine étape ── */}
        <Eyebrow theme={theme}>Prochaine étape</Eyebrow>
        <NextStepCards theme={theme} onAutonomie={onAutonomie} onLugia={onLugia} />
      </div>
    </main>
  );
}

/* ───────────────────────────────────────────────────────────
 * Sous-composants
 * ─────────────────────────────────────────────────────────── */

function Eyebrow({ children, theme }: { children: React.ReactNode; theme: V3Theme }) {
  const palette = paletteFor(theme);
  return (
    <p
      style={{
        fontFamily: fonts.mono,
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: palette.navy400,
        margin: "0 0 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        fontStyle: "normal",
      }}
    >
      <span style={{ flexShrink: 0 }}>{children}</span>
      <span
        aria-hidden="true"
        style={{ flex: 1, height: 1, background: palette.navy400, opacity: 0.4 }}
      />
    </p>
  );
}

function PhraseChoc({
  theme,
  before,
  after,
}: {
  theme: V3Theme;
  before: string;
  after: string;
}) {
  const palette = paletteFor(theme);
  return (
    <div style={{ margin: "0 0 48px" }}>
      <p
        style={{
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: palette.navy400,
          margin: "0 0 20px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontStyle: "normal",
        }}
      >
        <span style={{ flexShrink: 0 }}>Ce que révèle votre diagnostic</span>
        <span
          aria-hidden="true"
          style={{ flex: 1, height: 1, background: palette.navy400, opacity: 0.4 }}
        />
      </p>
      <p
        style={{
          fontFamily: fonts.serif,
          fontSize: "clamp(15px, 1.6vw, 17px)",
          fontWeight: 400,
          lineHeight: 1.7,
          letterSpacing: "-0.005em",
          color: palette.navy,
          margin: 0,
          maxWidth: 580,
          fontStyle: "normal",
        }}
      >
        {before}{" "}
        <strong
          style={{
            color: palette.signalWarn.default,
            fontWeight: 400,
          }}
        >
          {after}
        </strong>
      </p>
    </div>
  );
}

function RiskBadge({ theme, level }: { theme: V3Theme; level: RiskLevel }) {
  const palette = paletteFor(theme);
  const colors = {
    crit: { txt: palette.axes.C, bg: palette.axes.Cg, border: `${palette.axes.C}59` },
    warn: { txt: palette.signalWarn.default, bg: palette.signalWarn.surface, border: palette.signalWarn.border },
    opt: { txt: palette.argent, bg: `${palette.argent}1A`, border: `${palette.argent}48` },
  }[level];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 8px",
        fontFamily: fonts.mono,
        fontSize: 9,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontWeight: 600,
        border: `1px solid ${colors.border}`,
        background: colors.bg,
        color: colors.txt,
        flexShrink: 0,
        marginTop: 5,
        fontStyle: "normal",
      }}
    >
      <span
        aria-hidden="true"
        style={{ width: 5, height: 5, borderRadius: "50%", background: "currentColor", flexShrink: 0 }}
      />
      {RISK_LABEL[level]}
    </span>
  );
}

function BilanGlobal({
  theme,
  forces,
  risques,
}: {
  theme: V3Theme;
  forces: BilanItem[];
  risques: BilanItem[];
}) {
  const palette = paletteFor(theme);
  return (
    <div style={{ margin: "0 0 48px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
        className="v3-bilan-cols"
      >
        {/* Forces */}
        <div
          style={{
            background: palette.ivory,
            border: `1px solid ${palette.line}`,
            padding: "20px 22px",
          }}
        >
          <p
            style={{
              fontFamily: fonts.mono,
              fontSize: 9,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              margin: "0 0 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: palette.axes.A,
              fontStyle: "normal",
            }}
          >
            <span aria-hidden="true" style={{ width: 14, height: 1, background: palette.axes.A, flexShrink: 0 }} />
            Ce qui tient
          </p>
          {forces.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                marginBottom: i === forces.length - 1 ? 0 : 12,
              }}
            >
              <div
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  lineHeight: 1.65,
                  color: palette.navy600,
                  flex: 1,
                  fontStyle: "normal",
                }}
              >
                <strong
                  style={{
                    fontWeight: 500,
                    color: palette.navy,
                    display: "block",
                    marginBottom: 1,
                  }}
                >
                  {item.title}
                </strong>
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Risques */}
        <div
          style={{
            background: palette.ivory,
            border: `1px solid ${palette.line}`,
            padding: "20px 22px",
          }}
        >
          <p
            style={{
              fontFamily: fonts.mono,
              fontSize: 9,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              margin: "0 0 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: palette.axes.C,
              fontStyle: "normal",
            }}
          >
            <span aria-hidden="true" style={{ width: 14, height: 1, background: palette.axes.C, flexShrink: 0 }} />
            Ce qui fragilise
          </p>
          {risques.map((item, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                marginBottom: i === risques.length - 1 ? 0 : 12,
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 13,
                    lineHeight: 1.65,
                    color: palette.navy600,
                    fontStyle: "normal",
                  }}
                >
                  <strong
                    style={{
                      fontWeight: 500,
                      color: palette.navy,
                      display: "block",
                      marginBottom: 1,
                    }}
                  >
                    {item.title}
                  </strong>
                  {item.desc}
                </div>
                {item.risk && <RiskBadge theme={theme} level={item.risk} />}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 520px) { .v3-bilan-cols { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

function AxisCard({
  theme,
  axis,
  title,
  level,
  detail,
}: {
  theme: V3Theme;
  axis: AxisId;
  title: string;
  level: string;
  detail: AxisDetail;
}) {
  const palette = paletteFor(theme);
  const axisColor = palette.axes[axis];
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        background: palette.ivory,
        border: `1px solid ${palette.line}`,
        borderLeft: `2px solid ${axisColor}`,
        overflow: "hidden",
        transition: "border-color 180ms ease-out, transform 180ms ease-out, box-shadow 250ms ease-out",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = "0 4px 16px -6px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{
          display: "block",
          cursor: "pointer",
          padding: "20px 24px",
          width: "100%",
          background: "transparent",
          border: "none",
          color: "inherit",
          textAlign: "left",
          fontFamily: "inherit",
          fontStyle: "normal",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 8,
          }}
        >
          <h3
            style={{
              fontFamily: fonts.serif,
              fontSize: 20,
              fontWeight: 400,
              lineHeight: 1.2,
              letterSpacing: "-0.01em",
              margin: 0,
              color: axisColor,
              fontStyle: "normal",
            }}
          >
            {title}
          </h3>
          {/* Vignette pill du niveau de maturité — pas de toggle « + », l'affordance
              de dépli reste portée par la phrase hint « ↓ Forces & pistes d'action ». */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "3px 10px",
              fontFamily: fonts.mono,
              fontSize: 10,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: axisColor,
              border: `1px solid ${axisColor}`,
              background: `color-mix(in srgb, ${axisColor} 12%, transparent)`,
              flexShrink: 0,
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
            {level}
          </span>
        </div>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 13,
            lineHeight: 1.7,
            color: palette.navy600,
            margin: 0,
            fontStyle: "normal",
          }}
        >
          {detail.summary}
        </p>
        {!open && (
          <p
            style={{
              fontFamily: fonts.mono,
              fontSize: 10,
              letterSpacing: "0.08em",
              color: palette.navy400,
              margin: "10px 0 0",
              fontStyle: "normal",
            }}
          >
            ↓ Forces &amp; pistes d&apos;action
          </p>
        )}
      </button>

      {open && (
        <div style={{ padding: "16px 24px 22px", borderTop: `1px solid ${palette.line}` }}>
          {detail.forces.length > 0 && (
            <>
              <p
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 9,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: palette.navy400,
                  margin: "0 0 10px",
                  fontStyle: "normal",
                }}
              >
                Forces
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {detail.forces.map((f, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: palette.navy600,
                      paddingLeft: 16,
                      position: "relative",
                      fontStyle: "normal",
                    }}
                  >
                    <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, color: axisColor }}>·</span>
                    {f}
                  </li>
                ))}
              </ul>
            </>
          )}
          {detail.marges.length > 0 && (
            <>
              <p
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 9,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: palette.navy400,
                  margin: detail.forces.length > 0 ? "16px 0 10px" : "0 0 10px",
                  fontStyle: "normal",
                }}
              >
                Marges de progression
              </p>
              <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
                {detail.marges.map((m, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: 13,
                      lineHeight: 1.6,
                      color: palette.navy600,
                      paddingLeft: 16,
                      position: "relative",
                      fontStyle: "normal",
                    }}
                  >
                    <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, color: palette.argent }}>·</span>
                    {m.text}
                    {m.risk && (
                      <>
                        {" "}
                        <RiskBadge theme={theme} level={m.risk} />
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function OppCard({
  theme,
  opp,
  onOpen,
}: {
  theme: V3Theme;
  opp: V3Opp;
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
        borderLeft: opp.recommended ? `3px solid ${axisColor}` : `1px solid ${palette.line}`,
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
        transition: "border-color 180ms ease-out, transform 180ms ease-out, box-shadow 250ms ease-out",
        fontFamily: fonts.sans,
        fontStyle: "normal",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = palette.navy400;
        if (opp.recommended) {
          e.currentTarget.style.borderLeftColor = axisColor;
        }
        e.currentTarget.style.transform = "translateX(2px)";
        e.currentTarget.style.boxShadow = "0 2px 12px -4px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = palette.line;
        if (opp.recommended) {
          e.currentTarget.style.borderLeftColor = axisColor;
        }
        e.currentTarget.style.transform = "translateX(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0, paddingTop: 2 }}>{opp.icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {opp.recommended && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              padding: "2px 9px",
              background: palette.axes.Cg,
              border: `1px solid ${palette.axes.C}40`,
              color: palette.axes.C,
              fontFamily: fonts.mono,
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              marginBottom: 10,
              fontStyle: "normal",
            }}
          >
            ★ Recommandé pour commencer
          </span>
        )}
        <h4
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
        </h4>
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
        <OppMeta theme={theme} opp={opp} />
      </div>
    </button>
  );
}

function OppMeta({ theme, opp }: { theme: V3Theme; opp: V3Opp }) {
  const palette = paletteFor(theme);
  return (
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
      <span
        aria-hidden="true"
        style={{ display: "inline-block", width: 1, height: 12, background: palette.lineStrong, flexShrink: 0 }}
      />
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        Délai
        <span style={{ color: palette.navy, fontWeight: 500 }}>{opp.delai}</span>
      </span>
      <span
        aria-hidden="true"
        style={{ display: "inline-block", width: 1, height: 12, background: palette.lineStrong, flexShrink: 0 }}
      />
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
  );
}

function NextStepCards({
  theme,
  onAutonomie,
  onLugia,
}: {
  theme: V3Theme;
  onAutonomie?: () => void;
  onLugia?: () => void;
}) {
  const palette = paletteFor(theme);
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
      className="v3-next-cards"
    >
      {/* Autonomie */}
      <div
        style={{
          background: palette.ivory,
          border: `1px solid ${palette.line}`,
          padding: "20px 22px",
          display: "flex",
          flexDirection: "column",
          transition: "border-color 180ms ease-out, transform 180ms ease-out, box-shadow 250ms ease-out",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = palette.navy400;
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 16px -6px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = palette.line;
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 10px" }}>
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 9,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: palette.navy400,
              fontStyle: "normal",
            }}
          >
            Autonomie
          </span>
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 8,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              padding: "2px 8px",
              border: `1px solid ${palette.argent}`,
              color: palette.argent,
              background: "transparent",
              fontWeight: 600,
              fontStyle: "normal",
            }}
          >
            1er chantier gratuit
          </span>
        </div>
        <h3
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(14px, 1.8vw, 17px)",
            fontWeight: 400,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
            margin: "0 0 6px",
            color: palette.navy,
            whiteSpace: "nowrap",
            fontStyle: "normal",
          }}
        >
          Choisir un chantier de votre choix
        </h3>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: palette.navy600,
            margin: "0 0 18px",
            fontStyle: "normal",
          }}
        >
          Une discussion ciblée avec l&apos;assistant Lugia, à votre rythme. Premier
          chantier offert ; les suivants sur abonnement.
        </p>
        <button
          type="button"
          onClick={() => onAutonomie?.()}
          style={{
            marginTop: "auto",
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
            textAlign: "center",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = palette.navy)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = palette.lineStrong)}
        >
          Explorer un chantier
        </button>
      </div>

      {/* Lugia */}
      <div
        style={{
          background: palette.ivory,
          border: `1px solid ${palette.line}`,
          borderLeft: `2px solid ${palette.navy}`,
          padding: "20px 22px",
          display: "flex",
          flexDirection: "column",
          transition: "border-color 180ms ease-out, transform 180ms ease-out, box-shadow 250ms ease-out",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 16px -6px rgba(0,0,0,0.12)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "0 0 10px" }}>
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 9,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: palette.navy,
              fontWeight: 600,
              fontStyle: "normal",
            }}
          >
            Lugia &amp; Co
          </span>
        </div>
        <h3
          style={{
            fontFamily: fonts.serif,
            fontSize: 17,
            fontWeight: 400,
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
            margin: "0 0 6px",
            color: palette.navy,
            fontStyle: "normal",
          }}
        >
          Débriefing avec un consultant
        </h3>
        <p
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: palette.navy600,
            margin: "0 0 18px",
            fontStyle: "normal",
          }}
        >
          45 min pour lire ensemble ce diagnostic, prioriser et définir un premier
          chantier concret.
        </p>
        <button
          type="button"
          onClick={() => onLugia?.()}
          style={{
            marginTop: "auto",
            background: palette.navy,
            color: palette.paper,
            border: "none",
            padding: "12px 20px",
            fontFamily: fonts.sans,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.02em",
            cursor: "pointer",
            transition: "box-shadow 250ms ease-out, transform 180ms ease-out",
            fontStyle: "normal",
            textAlign: "center",
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
          Prendre rendez-vous →
        </button>
      </div>

      <style>{`@media (max-width: 560px) { .v3-next-cards { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

/* ───────────────────────────────────────────────────────────
 * Radar SVG grand format avec annotations latérales
 * ─────────────────────────────────────────────────────────── */

function RadarSvg({
  theme,
  scores,
  annotations,
}: {
  theme: V3Theme;
  scores: { A: number; B: number; C: number };
  annotations: RadarAnnotation[];
}) {
  const palette = paletteFor(theme);
  const ref = useRef<SVGSVGElement>(null);

  // Géométrie spec — radar agrandi pour ne pas paraître écrasé quand le SVG
  // est contraint en largeur par le shell de page (680 px max).
  const W = 860;
  const H = 480;
  const CX = 400;
  const CY = 240;
  const R = 200;

  // Conversion ratio
  const ratios = { A: scores.A / 100, B: scores.B / 100, C: scores.C / 100 };

  const rad = (d: number) => ((d - 90) * Math.PI) / 180;
  const pt = (angle: number, r: number): [number, number] => [
    CX + r * Math.cos(rad(angle)),
    CY + r * Math.sin(rad(angle)),
  ];

  const AXES: Array<{ id: AxisId; angle: number; ratio: number }> = [
    { id: "A", angle: -90, ratio: ratios.A },
    { id: "B", angle: 30, ratio: ratios.B },
    { id: "C", angle: 150, ratio: ratios.C },
  ];

  // Data points
  const dp: Record<AxisId, [number, number]> = {
    A: pt(-90, R * Math.max(ratios.A, 0.05)),
    B: pt(30, R * Math.max(ratios.B, 0.05)),
    C: pt(150, R * Math.max(ratios.C, 0.05)),
  };
  const midBC: [number, number] = [
    (dp.B[0] + dp.C[0]) / 2,
    (dp.B[1] + dp.C[1]) / 2,
  ];

  // Path scores
  const pathD = [dp.A, dp.B, dp.C]
    .map((p, i) => (i ? "L" : "M") + p.join(","))
    .join(" ") + "Z";

  const RIGHT_END = W - 2;
  const LEFT_END = 2;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
    >
      <defs>
        {AXES.map((ax, i) => (
          <filter key={ax.id} id={`rg${i}`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feFlood floodColor={palette.axes[ax.id]} floodOpacity="0.75" result="c" />
            <feComposite in="c" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>

      {/* Grilles concentriques */}
      {[1, 2, 3, 4].map((i) => {
        const pts = AXES.map((ax) => pt(ax.angle, (R * i) / 4).join(",")).join(" ");
        return (
          <polygon
            key={i}
            points={pts}
            fill={i === 4 ? `color-mix(in srgb, ${palette.navy} 4%, transparent)` : "none"}
            stroke={i === 4 ? palette.lineStrong : palette.line}
            strokeWidth={i === 4 ? 1.5 : 0.6}
          />
        );
      })}

      {/* Labels % axe A */}
      {[25, 50, 75, 100].map((p) => {
        const [lx, ly] = pt(-90, (R * p) / 100);
        return (
          <text
            key={p}
            x={lx + 5}
            y={ly - 4}
            fontSize="10"
            fill={palette.lineStrong}
            fontFamily={fonts.mono}
          >
            {p}%
          </text>
        );
      })}

      {/* Axes */}
      {AXES.map((ax) => {
        const [x, y] = pt(ax.angle, R);
        return <line key={ax.id} x1={CX} y1={CY} x2={x} y2={y} stroke={palette.line} strokeWidth={1} />;
      })}

      {/* Polygone scores */}
      <path
        d={pathD}
        fill={`color-mix(in srgb, ${palette.navy} 6%, transparent)`}
        stroke={`color-mix(in srgb, ${palette.navy} 50%, transparent)`}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Annotations */}
      {annotations.map((ann, idx) => {
        const anchor: [number, number] = ann.axis === "BC" ? midBC : dp[ann.axis];
        const lineEndX = ann.side === "right" ? RIGHT_END : LEFT_END;
        const lineY = anchor[1];
        const badgeColor =
          ann.badge === "crit" ? palette.axes.C : palette.signalWarn.default;
        const isRight = ann.side === "right";
        const MARGIN = 18;
        const textX = isRight ? lineEndX + MARGIN : lineEndX - MARGIN;
        const textAnchor: "start" | "end" = isRight ? "start" : "end";

        const badgeText = RISK_LABEL[ann.badge].toUpperCase();
        const badgeW = badgeText.length * 8 + 28;
        const badgeX = isRight ? textX : textX - badgeW;
        const badgeY = lineY + 54;

        return (
          <g key={idx}>
            {/* Trait dasharray argent */}
            <line
              x1={anchor[0]}
              y1={lineY}
              x2={lineEndX}
              y2={lineY}
              stroke={palette.argent}
              strokeWidth={0.9}
              strokeDasharray="3.5 3.5"
              opacity={0.9}
            />
            <text
              x={textX}
              y={lineY}
              fontSize="17"
              fontWeight="600"
              fill={palette.navy}
              fontFamily={fonts.serif}
              textAnchor={textAnchor}
              dominantBaseline="middle"
            >
              {ann.title}
            </text>
            <text
              x={textX}
              y={lineY + 24}
              fontSize="14"
              fill={palette.navy600}
              fontFamily={fonts.sans}
              textAnchor={textAnchor}
              dominantBaseline="middle"
            >
              {ann.sub}
            </text>
            <rect
              x={badgeX}
              y={badgeY - 10}
              width={badgeW}
              height={20}
              rx={2}
              fill={`${badgeColor}28`}
              stroke={badgeColor}
              strokeWidth={1}
            />
            <circle cx={badgeX + 12} cy={badgeY} r={3.5} fill={badgeColor} />
            <text
              x={badgeX + 22}
              y={badgeY}
              fontSize="10"
              fontWeight="700"
              fill={badgeColor}
              fontFamily={fonts.mono}
              letterSpacing="0.12em"
              dominantBaseline="middle"
            >
              {badgeText}
            </text>
          </g>
        );
      })}

      {/* Dots avec glow + trou */}
      {AXES.map((ax, i) => (
        <g key={ax.id}>
          <circle cx={dp[ax.id][0]} cy={dp[ax.id][1]} r={10} fill={palette.axes[ax.id]} filter={`url(#rg${i})`} />
          <circle cx={dp[ax.id][0]} cy={dp[ax.id][1]} r={4.5} fill={palette.paper} />
        </g>
      ))}

      {/* MidBC cercle creux */}
      <circle cx={midBC[0]} cy={midBC[1]} r={7} fill="none" stroke={palette.argent} strokeWidth={1.5} opacity={0.85} />
      <circle cx={midBC[0]} cy={midBC[1]} r={3} fill={palette.argent} opacity={0.7} />
    </svg>
  );
}

function RadarLegend({
  theme,
  scores,
  levels,
}: {
  theme: V3Theme;
  scores: { A: number; B: number; C: number };
  levels: { A: string; B: string; C: string };
}) {
  const palette = paletteFor(theme);
  const entries: Array<{ id: AxisId; name: string }> = [
    { id: "A", name: "Parcours patient" },
    { id: "B", name: "Équipe & secrétariat" },
    { id: "C", name: "Outils & dossiers" },
  ];
  void scores; // évite warning unused — utilisable pour pourcentage si besoin
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        marginTop: 20,
        marginBottom: 24,
      }}
    >
      {entries.map((e) => (
        <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            aria-hidden="true"
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: palette.axes[e.id],
              boxShadow: `0 0 6px ${palette.axes[e.id]}`,
              flexShrink: 0,
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 10,
              color: palette.navy600,
              letterSpacing: "0.04em",
              fontStyle: "normal",
            }}
          >
            {e.name}
          </span>
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 10,
              fontWeight: 600,
              color: palette.axes[e.id],
              letterSpacing: "0.06em",
              fontStyle: "normal",
            }}
          >
            {levels[e.id]}
          </span>
        </div>
      ))}
    </div>
  );
}
