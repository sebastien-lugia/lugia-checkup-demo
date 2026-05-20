"use client";

import { useState } from "react";

import type { V2EnergyQuestion } from "@/lib/api";

/**
 * V2.0 — Question d'ancrage énergie (non scorée).
 *
 * Spec V2 §4. Posée juste après le profil, avant le bloc A. Stockée avec
 * scored=false. Pilote R-energy-prio (priorisation des chantiers selon
 * énergie disponible).
 *
 * UI : 4 options en pleine largeur (descriptions plus longues que des
 * chips). Pas de scoring affiché. Pas d'auto-continue au clic — un CTA
 * "Continuer" explicite pour que le médecin puisse changer d'avis.
 */
export function Energie({
  question,
  initialValue,
  onSubmit,
  saving,
}: {
  question: V2EnergyQuestion;
  initialValue?: string | null;
  onSubmit: (optionId: string, label: string) => Promise<void>;
  saving?: boolean;
}) {
  const [selected, setSelected] = useState<string | null>(initialValue ?? null);

  const selectedOption = question.options.find((o) => o.id === selected);

  return (
    <main className="max-w-[680px] mx-auto px-8 py-12">
      <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#888780] mb-4">
        Ancrage — avant les questions
      </div>
      <h1 className="font-serif text-[28px] sm:text-[36px] font-medium leading-[1.2] tracking-[-0.01em] text-[#111] mb-3">
        {question.label}
      </h1>
      <p className="text-[14px] leading-[1.55] text-[#888780] italic mb-9 max-w-[560px]">
        Ce repère n'entre pas dans le calcul. Il sert juste à mieux situer
        ce qui ressortira du diagnostic.
      </p>

      <div className="space-y-2.5 mb-10">
        {question.options.map((opt) => {
          const isSel = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => !saving && setSelected(opt.id)}
              disabled={saving}
              className={
                "w-full text-left text-[15px] leading-[1.5] rounded-lg border px-5 py-4 transition-all " +
                (isSel
                  ? "bg-[#fbf9f1] border-[#1a56a0] shadow-[0_0_0_3px_rgba(26,86,160,0.08)]"
                  : "bg-white/60 border-[#d4cfbf] hover:border-[#888780] hover:bg-white")
              }
              type="button"
            >
              <span className="inline-flex items-center gap-3">
                <span
                  className={
                    "inline-block w-5 h-5 rounded-full border-2 flex-shrink-0 " +
                    (isSel
                      ? "border-[#1a56a0] bg-[#1a56a0]"
                      : "border-[#d4cfbf]")
                  }
                >
                  {isSel && (
                    <svg
                      viewBox="0 0 16 16"
                      className="w-full h-full text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M4 8l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className="text-[#1a1a1a]">{opt.label}</span>
              </span>
            </button>
          );
        })}
      </div>

      <button
        onClick={() =>
          selectedOption && onSubmit(selectedOption.id, selectedOption.label)
        }
        disabled={!selected || saving}
        className="bg-[#1f1f1f] hover:bg-[#2c2c2c] text-white font-medium text-[15px] rounded-full px-7 py-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        type="button"
      >
        {saving ? "Enregistrement…" : "Continuer →"}
      </button>
    </main>
  );
}
