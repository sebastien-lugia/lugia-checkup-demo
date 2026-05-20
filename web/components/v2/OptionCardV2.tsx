"use client";

import { useState } from "react";

import type { V2Option } from "@/lib/api";

/**
 * V2.0 — Carte d'option du bloc-question.
 *
 * Une option = un radio button visuel. Au clic :
 *   1. La carte se sélectionne visuellement (check-mark + bordure accent).
 *   2. La reformulation terrain Lugia apparaît sous l'option (animation fadeIn).
 *   3. Si l'option porte un benchmark, il s'affiche dans un encadré ambré.
 *   4. Le composant parent déclenche un auto-scroll 250ms après pour amener
 *      la prochaine question dans le viewport (sauf prefers-reduced-motion).
 *
 * Si l'option porte `has_entity_field=true`, un input de prénom optionnel
 * apparaît sous l'option sélectionnée (V1.1.5-i — mécanisme préservé).
 *
 * Spec V2 §11.5 + §11.6.
 */
export function OptionCardV2({
  option,
  selected,
  onSelect,
  entityName,
  onEntityNameChange,
  disabled,
}: {
  option: V2Option;
  selected: boolean;
  onSelect: () => void;
  entityName?: string | null;
  onEntityNameChange?: (name: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mb-3">
      <button
        onClick={() => !disabled && onSelect()}
        disabled={disabled}
        className={
          "w-full text-left rounded-lg border px-5 py-4 transition-all " +
          (selected
            ? "bg-[#fbf9f1] border-[#1a56a0] shadow-[0_0_0_3px_rgba(26,86,160,0.08)]"
            : "bg-white/60 border-[#d4cfbf] hover:border-[#888780] hover:bg-white") +
          (disabled ? " opacity-60 cursor-not-allowed" : "")
        }
        type="button"
      >
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className={
              "inline-flex items-center justify-center w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 " +
              (selected
                ? "border-[#1a56a0] bg-[#1a56a0]"
                : "border-[#d4cfbf] bg-white")
            }
          >
            {selected && (
              <svg viewBox="0 0 16 16" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 8l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </span>
          <span className="text-[15px] leading-[1.5] text-[#1a1a1a]">
            {option.label}
          </span>
        </div>
      </button>

      {/* Reformulation terrain — apparaît sous l'option sélectionnée */}
      {selected && (
        <div
          className="mt-3 pl-8 text-[14px] leading-[1.6] text-[#444] italic animate-fadeIn"
          style={{
            animation: "v2FadeIn 220ms ease-out",
          }}
        >
          {option.reformulation}
        </div>
      )}

      {/* Benchmark inline conditionnel (encadré ambré) */}
      {selected && option.benchmark && (
        <BenchmarkAmber benchmark={option.benchmark} />
      )}

      {/* Champ prénom optionnel (V1.1.5-i) */}
      {selected && option.has_entity_field && onEntityNameChange && (
        <div className="mt-3 ml-8">
          <input
            type="text"
            value={entityName ?? ""}
            onChange={(e) => onEntityNameChange(e.target.value)}
            placeholder={option.entity_field_label ?? "Prénom (optionnel)"}
            className="w-full max-w-[360px] text-[13px] border border-[#d4cfbf] rounded-md px-3 py-2 bg-white/80 focus:outline-none focus:border-[#1a56a0]"
          />
        </div>
      )}

      {/* Animation keyframe inline (évite de toucher globals.css depuis un composant) */}
      <style jsx>{`
        @keyframes v2FadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          div, span {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function BenchmarkAmber({
  benchmark,
}: {
  benchmark: NonNullable<V2Option["benchmark"]>;
}) {
  return (
    <div
      className="mt-3 ml-8 px-4 py-3 rounded-md border-l-[3px]"
      style={{
        backgroundColor: "#fbf3e3",
        borderLeftColor: "#c48a2a",
        animation: "v2BenchFadeIn 300ms ease-out",
      }}
    >
      <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[#8a5a14] mb-1">
        Repère terrain
      </div>
      <div className="text-[13px] leading-[1.5] text-[#5a3d10]">
        {benchmark.texte}
      </div>
      {benchmark.source_status === "to_confirm" && (
        <div className="text-[11px] text-[#8a5a14] italic mt-1">
          [À confirmer{benchmark.source_hint ? ` — source : ${benchmark.source_hint}` : ""}]
        </div>
      )}
      <style jsx>{`
        @keyframes v2BenchFadeIn {
          from { opacity: 0; transform: translateY(-3px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Hook utilitaire pour gérer l'entity_name d'une option côté parent.
// Exporté pour BlocQuestion qui orchestre les saisies.
export function useEntityName(initial: string | null | undefined) {
  return useState<string>(initial ?? "");
}
