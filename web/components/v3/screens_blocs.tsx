"use client";

/**
 * V3-brand — écrans des 3 blocs scorés + transitions inter-blocs.
 *
 * - `BlocQuestionV3` : une question d'un bloc (label serif + ctx mono +
 *   4 options + reformulation argent qui apparaît à la sélection +
 *   benchmark optionnel).
 * - `BlocV3` : un écran de bloc complet (eyebrow coloré par axe, titre,
 *   sous-titre, liste de questions, navigation).
 * - `BlockTransitionV3` : transition argent entre 2 blocs (« · » Lora 56 px
 *   en argent, titre du bloc fermé, niveaux des 3 axes, prompt vers le suivant).
 *
 * V3-brand-T-V3-6.
 */

import { fonts, paletteFor, type V3Theme, levelOf, LEVELS } from "@/lib/v3/tokens";
import { BlocBadge } from "@/components/v3/atoms";
// LEVELS, levelOf : utilisés dans les score cards de la transition pour afficher
// le niveau qualitatif de chaque bloc déjà fermé.
import type { V3Bloc, V3BlocQuestion, V3Option } from "@/lib/v3/protocol_data";
import { filterQuestionsByRouting } from "@/lib/v3/protocol_data";

type AxisId = "A" | "B" | "C";

/* ───────────────────────────────────────────────────────────
 * BackButton — « ← Précédent » discret en mono, sans fond.
 * Posé à gauche d'un CTA principal pour permettre la navigation arrière.
 * ─────────────────────────────────────────────────────────── */
function BackButton({ onBack, theme = "night" }: { onBack: () => void; theme?: V3Theme }) {
  const palette = paletteFor(theme);
  return (
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
      ← Précédent
    </button>
  );
}


/* ───────────────────────────────────────────────────────────
 * BlocQuestionV3 — une question scorée d'un bloc.
 * ─────────────────────────────────────────────────────────── */

export function BlocQuestionV3({
  question,
  questionNumber,
  blockId,
  selectedOptionId,
  onSelect,
  theme = "night",
  secretariat,
}: {
  question: V3BlocQuestion;
  questionNumber: number; // 1-6
  blockId: AxisId;
  selectedOptionId: string | null;
  onSelect: (optionId: string) => void;
  theme?: V3Theme;
  /** secretariat du profil — pour adapter les labels d'options "secrétariat". */
  secretariat?: string;
}) {
  const palette = paletteFor(theme);
  const axisColor = palette.axes[blockId];
  const axisBgKey = `${blockId}g` as const;
  const axisBg = palette.axes[axisBgKey];

  const selectedOption: V3Option | null = selectedOptionId
    ? question.options.find((o) => o.id === selectedOptionId) ?? null
    : null;
  const answered = selectedOption !== null;
  const letters = ["A", "B", "C", "D", "E"];

  return (
    <article
      style={{
        marginBottom: 24,
        padding: 28,
        background: theme === "day" ? palette.ivoryLight : palette.ivory,
        border: `1px solid ${answered ? `${axisColor}50` : palette.line}`,
        transition: "border-color 250ms ease-out",
      }}
    >
      <p
        style={{
          fontFamily: fonts.mono,
          fontSize: 11,
          color: palette.navy400,
          margin: "0 0 14px",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          fontStyle: "normal",
        }}
      >
        Q{String(questionNumber).padStart(2, "0")} · Bloc {blockId}
      </p>
      <p
        style={{
          fontFamily: fonts.serif,
          fontSize: 18,
          fontWeight: 400,
          lineHeight: 1.5,
          margin: "0 0 8px",
          color: palette.navy,
          letterSpacing: "-0.01em",
          fontStyle: "normal",
        }}
      >
        {question.label}
      </p>
      {question.context && (
        <p
          style={{
            fontFamily: fonts.serif,
            fontSize: 15,
            fontWeight: 400,
            lineHeight: 1.45,
            color: palette.navy400,
            margin: "0 0 18px",
            paddingLeft: 12,
            borderLeft: `1px solid ${palette.lineStrong}`,
            fontStyle: "normal",
          }}
        >
          {question.context}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {question.options.map((opt, oi) => {
          const isSelected = selectedOptionId === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              role="radio"
              aria-checked={isSelected}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 13px",
                background: isSelected
                  ? `color-mix(in srgb, ${palette.argent} 18%, transparent)`
                  : palette.paper,
                border: `1px solid ${
                  isSelected
                    ? `color-mix(in srgb, ${palette.argent} 60%, transparent)`
                    : palette.line
                }`,
                cursor: "pointer",
                textAlign: "left",
                fontSize: 13,
                color: palette.navy,
                lineHeight: 1.5,
                transition: "all 150ms ease-out",
                width: "100%",
                fontFamily: fonts.sans,
                fontStyle: "normal",
              }}
            >
              <span
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 9,
                  color: palette.navy400,
                  flexShrink: 0,
                  paddingTop: 2,
                  minWidth: 14,
                  letterSpacing: "0.06em",
                }}
              >
                {letters[oi]}
              </span>
              <span>{secretariat === "seul" && opt.labelSeul ? opt.labelSeul : opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Reformulation argent — apparaît dès la sélection */}
      {selectedOption && (
        <div
          style={{
            marginTop: 12,
            padding: "14px 16px",
            fontFamily: fonts.serif,
            fontSize: 15,
            fontWeight: 400,
            lineHeight: 1.55,
            background: axisBg,
            borderLeft: `2px solid ${palette.argent}`,
            color: palette.navy,
            animation: "v3FadeSlide 300ms ease-out both",
            fontStyle: "normal",
          }}
        >
          {selectedOption.reformulation}
        </div>
      )}

      {/* Benchmark ambre — apparaît si l'option en a un */}
      {selectedOption?.benchmark && (
        <div
          style={{
            marginTop: 8,
            padding: "12px 16px",
            background: palette.signalWarn.surface,
            borderLeft: `2px solid ${palette.signalWarn.default}`,
            fontFamily: fonts.sans,
            fontSize: 13,
            fontWeight: 400,
            color: palette.signalWarn.default,
            lineHeight: 1.6,
            animation: "v3FadeSlide 300ms 100ms ease-out both",
            fontStyle: "normal",
          }}
        >
          {selectedOption.benchmark}
        </div>
      )}

      {/* Animation locale (déclarée une fois côté Bloc, mais on la met
         aussi ici au cas où la card est utilisée isolément). */}
      <style>{`
        @keyframes v3FadeSlide {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .v3-question-card * { animation: none !important; }
        }
      `}</style>
    </article>
  );
}

/* ───────────────────────────────────────────────────────────
 * BlocV3 — écran complet d'un bloc (les 6 questions).
 * ─────────────────────────────────────────────────────────── */

export function BlocV3({
  bloc,
  answers,
  onAnswer,
  onNext,
  onBack,
  theme = "night",
  isLast = false,
  cabinetType,
  secretariat,
  paramedicalTeam,
}: {
  bloc: V3Bloc;
  answers: Record<string, string>;
  onAnswer: (questionId: string, optionId: string) => void;
  onNext: () => void;
  /** Bouton « ← Précédent » optionnel (caché si absent). */
  onBack?: () => void;
  theme?: V3Theme;
  /** cabinet_type du profil — utilisé pour le routing des questions. */
  cabinetType?: string;
  /** secretariat du profil — utilisé pour le routing de b3. */
  secretariat?: string;
  /** paramedical_team du profil — utilisé pour le routing has_team. */
  paramedicalTeam?: string;
  /** Si true (bloc C), le CTA est « Voir mon diagnostic → ». */
  isLast?: boolean;
}) {
  const palette = paletteFor(theme);
  const axisColor = palette.axes[bloc.id];
  const blocNumber = { A: 1, B: 2, C: 3 }[bloc.id];

  const visibleQuestions = filterQuestionsByRouting(bloc.questions, cabinetType, secretariat, paramedicalTeam);
  const answeredCount = visibleQuestions.filter((q) => !!answers[q.id]).length;
  const allAnswered = answeredCount === visibleQuestions.length;

  return (
    <main
      style={{
        background: palette.paper,
        color: palette.navy,
        minHeight: "100vh",
        paddingTop: 88,
        paddingBottom: 96,
        transition: "background 350ms ease-out, color 350ms ease-out",
      }}
    >
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px" }}>
        {/* Eyebrow colorée par axe avec filet à DROITE qui s'étend */}
        <p
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: axisColor,
            margin: "0 0 24px",
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontStyle: "normal",
          }}
        >
          <span style={{ flexShrink: 0 }}>Bloc {blocNumber} / 3 — {bloc.label}</span>
          <span
            style={{
              flex: 1,
              height: 1,
              background: axisColor,
              opacity: 0.4,
            }}
            aria-hidden="true"
          />
        </p>

        <h2
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(28px, 4vw, 32px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: "0 0 12px",
            color: axisColor,
            fontStyle: "normal",
          }}
        >
          {bloc.label}
        </h2>

        <p
          style={{
            fontFamily: fonts.mono,
            fontSize: 11,
            color: palette.navy400,
            margin: "0 0 32px",
            letterSpacing: "0.02em",
            lineHeight: 1.55,
            fontStyle: "normal",
          }}
        >
          {bloc.subtitle}
        </p>

        {/* Cartes question */}
        {visibleQuestions.map((q, i) => (
          <BlocQuestionV3
            key={q.id}
            question={q}
            questionNumber={i + 1}
            secretariat={secretariat}
            blockId={bloc.id}
            selectedOptionId={answers[q.id] ?? null}
            onSelect={(optionId) => onAnswer(q.id, optionId)}
            theme={theme}
          />
        ))}

        {/* Navigation bas de bloc */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 32,
            paddingTop: 24,
            borderTop: `1px solid ${palette.line}`,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {onBack && <BackButton onBack={onBack} theme={theme} />}
            <span
              style={{
                fontFamily: fonts.mono,
                fontSize: 11,
                color: palette.navy400,
                letterSpacing: "0.08em",
                fontStyle: "normal",
              }}
            >
              {answeredCount} / {visibleQuestions.length} réponses
            </span>
          </div>
          <button
            type="button"
            onClick={onNext}
            disabled={!allAnswered}
            style={{
              background: palette.navy,
              color: palette.paper,
              border: "none",
              padding: "13px 28px",
              fontFamily: fonts.sans,
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.02em",
              cursor: allAnswered ? "pointer" : "not-allowed",
              opacity: allAnswered ? 1 : 0.4,
              transition: "opacity 200ms ease-out",
              fontStyle: "normal",
            }}
          >
            {isLast ? "Voir mon diagnostic →" : "Bloc suivant →"}
          </button>
        </div>
      </div>
    </main>
  );
}

/* ───────────────────────────────────────────────────────────
 * BlockTransitionV3 — transition argent entre 2 blocs.
 * ─────────────────────────────────────────────────────────── */

export function BlockTransitionV3({
  closedBloc,
  scores,
  nextBlocLabel,
  onContinue,
  onBack,
  theme = "night",
  isFinal = false,
}: {
  closedBloc: AxisId;
  scores: { A: number | null; B: number | null; C: number | null };
  nextBlocLabel: string;
  onContinue: () => void;
  /** Bouton « ← Précédent » optionnel pour revenir au bloc qui vient de finir. */
  onBack?: () => void;
  theme?: V3Theme;
  /** Si true (transition_C), CTA = « Voir mon diagnostic → » + tonalité de clôture. */
  isFinal?: boolean;
}) {
  const palette = paletteFor(theme);
  const blocLabels: Record<AxisId, string> = {
    A: "Parcours patient",
    B: "Équipe & secrétariat",
    C: "Outils & dossiers",
  };

  return (
    <main
      style={{
        background: palette.paper,
        color: palette.navy,
        minHeight: "100vh",
        paddingTop: 88,
        paddingBottom: 96,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background 350ms ease-out, color 350ms ease-out",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        {/* Logo Lugia centré (comme modèle cible) */}
        <svg
          width="56"
          height="47"
          viewBox="0 0 261 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{ display: "block", margin: "0 auto 32px", color: palette.navy }}
        >
          <path
            d="M4.89203 214.075C19.1426 199.271 37.0201 179.22 46.4715 167.44C52.3767 160.08 53.9276 158.048 60.2051 149.445C83.8782 117.005 103.023 82.0726 116.337 47.0247C120.033 37.2956 125.447 19.4831 127.971 8.75085L130.028 0L130.837 4.08933C133.48 17.4491 140.016 38.487 146.67 55.0528C163.069 95.8803 187.169 135.548 219.704 175.261C225.982 182.924 246.366 205.454 255.269 214.57C258.398 217.775 260.639 220.212 260.248 219.985C255.879 217.457 223.652 192.442 216.188 185.785C215.774 185.416 212.671 182.712 209.291 179.777C205.912 176.841 201.537 172.997 199.57 171.235C197.603 169.472 194.441 166.644 192.543 164.95C186.414 159.478 169.288 142.646 157.141 130.155C137.343 109.796 135.386 107.893 132.853 106.533C128.294 104.086 127.792 104.46 107.082 125.742C90.6617 142.615 78.1358 154.929 69.6629 162.527C66.1685 165.66 62.4203 169.04 61.3336 170.037C45.4767 184.585 27.0938 199.743 8.44852 213.643C-2.01646 221.445 -2.22738 221.471 4.89203 214.075Z"
            fill="currentColor"
          />
        </svg>

        {/* Titre — Bloc X terminé (charte A1-ter) */}
        <h1
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(28px, 3.2vw, 32px)",
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            margin: "0 0 16px",
            color: palette.navy,
            fontStyle: "normal",
          }}
        >
          {isFinal
            ? "Diagnostic prêt."
            : `Bloc ${closedBloc} terminé.`}
        </h1>

        {/* Phrase encourageante qui contextualise la progression. */}
        <h2
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(15px, 1.6vw, 18px)",
            fontWeight: 400,
            lineHeight: 1.35,
            letterSpacing: 0,
            margin: "0 0 40px",
            color: palette.navy,
            fontStyle: "normal",
            // 17 px max calibré pour que la phrase la plus longue (~54 caractères)
            // tienne sur une ligne dans le shell de transition (560 px).
          }}
        >
          {(() => {
            const blocsDone = (["A", "B", "C"] as const).filter(
              (k) => (scores[k] ?? 0) > 0
            ).length;
            if (isFinal || blocsDone === 3) {
              return "Les trois axes sont posés. Votre profil est prêt.";
            }
            if (blocsDone === 2) {
              return "Deux axes sur trois. Le profil prend forme.";
            }
            return "Un premier axe posé. Le profil commence à se dessiner.";
          })()}
        </h2>

        {/* Animation rise + stagger pour faire apparaître les 3 cards comme des pierres qui se posent */}
        <style>{`
          @keyframes v3TransRiseIn {
            from { opacity: 0; transform: translateY(14px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .v3-trans-card {
            animation: v3TransRiseIn 700ms cubic-bezier(0.25, 0.1, 0.25, 1) both;
            will-change: transform, opacity;
          }
          .v3-trans-card:nth-child(1) { animation-delay: 350ms; }
          .v3-trans-card:nth-child(2) { animation-delay: 550ms; }
          .v3-trans-card:nth-child(3) { animation-delay: 750ms; }
          @media (prefers-reduced-motion: reduce) {
            .v3-trans-card { animation: none; }
          }
        `}</style>

        {/* Trois scores en pill (toujours sur 1 ligne) */}
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          {(["A", "B", "C"] as const).map((id) => {
            const s = scores[id];
            const lbl = s !== null ? LEVELS[levelOf(s)].label : "—";
            const axisColor = palette.axes[id];
            const axisBg = palette.axes[`${id}g`];
            const names: Record<AxisId, string> = {
              A: "Parcours patient",
              B: "Équipe & secrétariat",
              C: "Outils & dossiers",
            };
            return (
              <div
                key={id}
                className="v3-trans-card"
                style={{
                  padding: "14px 8px",
                  textAlign: "center",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {/* Badge bloc A/B/C (charte C2-C4) */}
                <BlocBadge id={id} theme={theme} size="md" style={{ marginBottom: 6 }} />
                <p
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    margin: "0 0 8px",
                    color: palette.navy400,
                    fontStyle: "normal",
                    whiteSpace: "nowrap",
                  }}
                >
                  {names[id]}
                </p>
                {/* Niveau de maturité — Lora navy 500, plus visible (charte A1-ter) */}
                <p
                  style={{
                    fontFamily: fonts.serif,
                    fontSize: 22,
                    fontWeight: 500,
                    lineHeight: 1.1,
                    margin: 0,
                    color: palette.navy,
                    fontStyle: "normal",
                  }}
                >
                  {lbl}
                </p>
              </div>
            );
          })}
        </div>

        {/* Suite — Continuer centré sous le label, Précédent absolu à gauche */}
        <div
          style={{
            paddingTop: 24,
            borderTop: `1px solid ${palette.line}`,
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: palette.navy400,
              margin: "0 0 10px",
              fontStyle: "normal",
            }}
          >
            {isFinal ? "Diagnostic" : "Suite"}
          </p>
          <p
            style={{
              fontFamily: fonts.serif,
              fontSize: 18,
              color: palette.navy,
              margin: "0 0 28px",
              fontStyle: "normal",
            }}
          >
            {nextBlocLabel}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: 48,
            }}
          >
            {onBack ? (
              <BackButton onBack={onBack} theme={theme} />
            ) : (
              <span aria-hidden="true" />
            )}
            <button
              type="button"
              onClick={onContinue}
              style={{
                background: palette.navy,
                color: palette.paper,
                border: "none",
                padding: "13px 28px",
                fontFamily: fonts.sans,
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: "0.02em",
                cursor: "pointer",
                fontStyle: "normal",
              }}
            >
              {isFinal ? "Voir mon diagnostic →" : "Continuer →"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ───────────────────────────────────────────────────────────
 * BlocsWithRadar — wrapper qui place le radar sticky + le bloc.
 * Composant de confort qui regroupe BlocV3 et RadarLiveV3.
 * (Le parent peut aussi les composer manuellement.)
 * ─────────────────────────────────────────────────────────── */

// Re-exports pour confort
export type { V3Bloc, V3BlocQuestion, V3Option } from "@/lib/v3/protocol_data";
export { V3_BLOCS, getBloc } from "@/lib/v3/protocol_data";
