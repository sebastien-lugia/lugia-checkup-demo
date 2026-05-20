"use client";

import type { ProfileField } from "@/lib/api";

/**
 * V2.0 — composant de saisie en chips réutilisé par ProfilStep1, ProfilStep2
 * et Energie.
 *
 * Chips sélectionnables (radio-style mono-sélection). L'option "Autre" peut
 * déclencher un champ de saisie libre via le mécanisme `free_text_field` du
 * protocole (cf logiciel_metier dans interview_protocol_v2.json).
 */
export function ChipsField({
  field,
  value,
  freeTextValue,
  onChange,
  onFreeTextChange,
  disabled,
}: {
  field: ProfileField;
  value: string | null | undefined;
  freeTextValue?: string | null;
  onChange: (id: string) => void;
  onFreeTextChange?: (text: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mb-7">
      <div className="text-[15px] font-medium text-[#111] mb-3">
        {field.label}
      </div>
      <div className="flex flex-wrap gap-2">
        {field.options.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => !disabled && onChange(opt.id)}
              disabled={disabled}
              className={
                "text-[14px] px-4 py-2 rounded-full border transition-colors " +
                (selected
                  ? "bg-[#1f1f1f] text-white border-[#1f1f1f]"
                  : "bg-white/60 text-[#1a1a1a] border-[#d4cfbf] hover:border-[#888780] hover:bg-white") +
                (disabled ? " opacity-50 cursor-not-allowed" : "")
              }
              type="button"
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {/* Champ texte libre pour les options "Autre" (logiciel_metier) */}
      {value &&
        field.options.find((o) => o.id === value)?.free_text_field &&
        onFreeTextChange && (
          <input
            type="text"
            value={freeTextValue ?? ""}
            onChange={(e) => onFreeTextChange(e.target.value)}
            placeholder="Précisez…"
            className="mt-3 w-full max-w-[420px] text-[14px] border border-[#d4cfbf] rounded-md px-3 py-2 bg-white/80 focus:outline-none focus:border-[#1a56a0]"
          />
        )}
    </div>
  );
}
