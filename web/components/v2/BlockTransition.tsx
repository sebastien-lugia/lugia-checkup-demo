"use client";

import type { V2Scores, V2AxisScore } from "@/lib/api";

/**
 * V2.0 — Page intermédiaire entre 2 blocs (transition_A, transition_B).
 *
 * Spec V2 §11.6 : score-reveal animé sur le bloc qui vient d'être complété,
 * mention contextuelle qui prépare la suite. Pas de score chiffré exposé —
 * uniquement le niveau qualitatif Lugia.
 *
 * UX cible : un moment de respiration entre 2 blocs successifs (chacun de
 * 6 questions). Le médecin voit ce qui se construit, puis poursuit.
 */
export function BlockTransition({
  completedBlock,
  scores,
  nextBlockLabel,
  onContinue,
  isFinal = false,
}: {
  completedBlock: "A" | "B" | "C";
  scores: V2Scores | null;
  nextBlockLabel: string;
  onContinue: () => void;
  /**
   * Si true (cas transition_C), le bouton dit « Voir vos résultats → »
   * au lieu de « Continuer → » et l'en-tête de bloc suivant a un ton
   * de clôture plutôt que de transition.
   */
  isFinal?: boolean;
}) {
  const block: V2AxisScore | null = scores ? scores[completedBlock] : null;
  const completedLabel =
    completedBlock === "A"
      ? "Parcours patient"
      : completedBlock === "B"
      ? "Équipe & secrétariat"
      : "Outils & dossiers";

  return (
    <main className="max-w-[640px] mx-auto px-8 py-20 text-center">
      <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#888780] mb-6">
        Bloc {completedBlock} terminé
      </div>
      <h1 className="font-serif text-[36px] sm:text-[44px] font-medium leading-[1.15] tracking-[-0.015em] text-[#111] mb-3">
        {completedLabel}
      </h1>
      {block ? (
        <p className="text-[18px] leading-[1.55] text-[#444] mb-8">
          Niveau de maturité&nbsp;:&nbsp;
          <span
            className="font-medium text-[#1a1a1a]"
            style={{
              animation: "v2RevealUp 500ms ease-out 200ms both",
            }}
          >
            {block.label}
          </span>
        </p>
      ) : (
        <p className="text-[15px] text-[#888780] italic mb-8">
          (en cours de calcul)
        </p>
      )}
      {block && (
        <p
          className="font-serif text-[20px] leading-[1.4] italic text-[#444] max-w-[520px] mx-auto mb-12"
          style={{
            animation: "v2RevealUp 500ms ease-out 350ms both",
          }}
        >
          « {block.title} »
        </p>
      )}

      <div className="border-t border-[#e0dccc] pt-8">
        <div className="text-[12px] uppercase tracking-[0.14em] font-semibold text-[#888780] mb-2">
          {isFinal ? "Parcours terminé" : "Suite"}
        </div>
        <div className="text-[18px] text-[#1a1a1a] font-medium mb-7">
          {nextBlockLabel}
        </div>
        <button
          onClick={onContinue}
          className="bg-[#1f1f1f] hover:bg-[#2c2c2c] text-white font-medium text-[15px] rounded-full px-7 py-3 transition-colors"
          type="button"
        >
          {isFinal ? "Voir vos résultats →" : "Continuer →"}
        </button>
      </div>

      <style jsx>{`
        @keyframes v2RevealUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          span, p {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}
