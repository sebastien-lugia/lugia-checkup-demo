"use client";

import { useCallback, useRef, useState } from "react";

import type { Answer, V2Block, V2Question, UserProfile } from "@/lib/api";
import { getVisibleQuestions } from "@/lib/api";
import { OptionCardV2 } from "./OptionCardV2";

/**
 * V2.0 — Bloc-entier : 6 questions du bloc actif rendues dans une seule
 * page (format bloc-entier vs question-par-question).
 *
 * Spec V2 §11.5 + §11.6 :
 *  - Auto-scroll 250ms après chaque clic (positionne le bas de la carte
 *    répondue à ~70% du viewport pour laisser apparaître la question
 *    suivante).
 *  - Désactivé si `prefers-reduced-motion: reduce` côté utilisateur.
 *  - Persistance immédiate de chaque réponse via `onAnswer` — le bouton
 *    "Bloc suivant" n'est actif que quand les 6 sont répondues.
 */

type QuestionAnswers = Record<string, Answer>;

const SCROLL_DELAY_MS = 250;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollNextIntoView(currentEl: HTMLElement | null) {
  if (!currentEl) return;
  if (prefersReducedMotion()) return;
  // On vise à mettre le bas de la carte répondue à ~70% du viewport.
  const rect = currentEl.getBoundingClientRect();
  const viewportH = window.innerHeight;
  const targetBottom = viewportH * 0.7;
  const delta = rect.bottom - targetBottom;
  if (Math.abs(delta) < 24) return; // pas la peine de bouger
  window.scrollBy({ top: delta, behavior: "smooth" });
}

export function BlocQuestion({
  block,
  profile,
  initialAnswers,
  onAnswer,
  onComplete,
  saving,
}: {
  block: V2Block;
  profile: UserProfile | null;
  initialAnswers: QuestionAnswers;
  /** Sauvegarde une réponse (persistance backend). Retourne quand fini. */
  onAnswer: (questionId: string, answer: Answer) => Promise<void>;
  /** Appelé quand toutes les questions visibles ont une réponse. */
  onComplete: () => void;
  saving?: boolean;
}) {
  const visible = getVisibleQuestions(block, profile);
  const [answers, setAnswers] = useState<QuestionAnswers>(initialAnswers);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const allAnswered = visible.every(
    (q) => answers[q.id]?.selected_option != null
  );

  const handleSelect = useCallback(
    async (q: V2Question, optId: string) => {
      const opt = q.options.find((o) => o.id === optId);
      if (!opt) return;
      const ans: Answer = {
        mode: "A",
        selected_option: optId,
        selected_option_label: opt.label,
        free_text: null,
        complement_text: null,
        entity_name: answers[q.id]?.entity_name ?? null,
        scored: true,
      };
      setAnswers((prev) => ({ ...prev, [q.id]: ans }));
      // Save in background — don't await before scroll, mais on signale
      // les erreurs réseau au parent.
      await onAnswer(q.id, ans).catch(() => {
        // swallow ici — le parent gère le toast d'erreur. Re-throw si on
        // veut une UX plus rigide.
      });
      // Scroll vers la question suivante
      window.setTimeout(() => {
        scrollNextIntoView(cardRefs.current[q.id]);
      }, SCROLL_DELAY_MS);
    },
    [answers, onAnswer]
  );

  const handleEntityName = useCallback(
    async (q: V2Question, name: string) => {
      const existing = answers[q.id];
      if (!existing?.selected_option) return;
      const ans: Answer = { ...existing, entity_name: name || null };
      setAnswers((prev) => ({ ...prev, [q.id]: ans }));
      await onAnswer(q.id, ans).catch(() => {});
    },
    [answers, onAnswer]
  );

  return (
    <div className="space-y-12">
      {visible.map((q, idx) => {
        const ans = answers[q.id];
        const selectedId = ans?.selected_option ?? null;
        return (
          <div
            key={q.id}
            ref={(el) => {
              cardRefs.current[q.id] = el;
            }}
          >
            <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#888780] mb-3">
              Question {idx + 1} sur {visible.length}
            </div>
            <h2 className="font-serif text-[22px] sm:text-[26px] font-medium leading-[1.3] text-[#111] mb-2">
              {q.label}
            </h2>
            {q.context && (
              <p className="text-[13px] italic text-[#888780] mb-5">
                {q.context}
              </p>
            )}
            <div className="mt-4 space-y-1">
              {q.options.map((opt) => (
                <OptionCardV2
                  key={opt.id}
                  option={opt}
                  selected={selectedId === opt.id}
                  onSelect={() => handleSelect(q, opt.id)}
                  entityName={
                    selectedId === opt.id ? ans?.entity_name ?? null : null
                  }
                  onEntityNameChange={
                    opt.has_entity_field
                      ? (name) => handleEntityName(q, name)
                      : undefined
                  }
                  disabled={saving}
                />
              ))}
            </div>
          </div>
        );
      })}

      <div className="pt-8 border-t border-[#e0dccc] flex items-center gap-4">
        <button
          onClick={onComplete}
          disabled={!allAnswered || saving}
          className="bg-[#1f1f1f] hover:bg-[#2c2c2c] text-white font-medium text-[15px] rounded-full px-7 py-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          type="button"
        >
          Bloc suivant →
        </button>
        {!allAnswered && (
          <span className="text-[13px] text-[#888780]">
            {`Répondez aux ${visible.length - Object.values(answers).filter((a) => a.selected_option).length} questions restantes`}
          </span>
        )}
      </div>
    </div>
  );
}
