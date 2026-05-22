"use client";

/**
 * V3-brand — atome ChipsField.
 *
 * Rend un label de question (+ hint optionnel) + une grille de chips
 * rectangulaires. Supporte deux modes :
 *  - mono-select (par défaut) : valeur est `string | null`, click remplace.
 *  - multi-select (si `field.multi`) : valeur est `string[]`, click toggle.
 *    Avec `field.allowFreeAdd`, une chip « + Ajouter » ouvre un input texte
 *    qui ajoute l'item saisi à la liste comme une chip sélectionnée
 *    désélectionnable.
 *
 * Cohérent brand : rectangulaire (no border-radius), bordure 1 px, sélection
 * en argent semi-transparent, mono small pour la hint.
 *
 * V3-brand-T-V3-5-fix-4.
 */

import { useState } from "react";
import { fonts, paletteFor, type V3Theme } from "@/lib/v3-snapshot/tokens";

export type V3ChipOption = {
  id: string;
  label: string;
};

export type V3Field = {
  id: string;
  label: string;
  hint?: string;
  options: V3ChipOption[];
  /** Si true, plusieurs options peuvent être sélectionnées (value devient string[]). */
  multi?: boolean;
  /** Si true (et multi=true), affiche une chip « + Ajouter » pour saisir une option libre. */
  allowFreeAdd?: boolean;
};

export function ChipsFieldV3({
  field,
  value,
  onChange,
  theme = "night",
  disabled,
}: {
  field: V3Field;
  /** `string | null` en mono, `string[]` en multi. */
  value: string | string[] | null;
  /** `(string)` en mono, `(string[])` en multi. */
  onChange: (next: string | string[]) => void;
  theme?: V3Theme;
  disabled?: boolean;
}) {
  const palette = paletteFor(theme);
  const isMulti = !!field.multi;

  // Normalisation : on travaille toujours avec un Set pour le rendu.
  const selectedSet: Set<string> = isMulti
    ? new Set(Array.isArray(value) ? value : [])
    : new Set(typeof value === "string" && value ? [value] : []);

  // State local pour la chip « + Ajouter » : valeurs libres + input ouvert.
  const [freeAdds, setFreeAdds] = useState<string[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [addDraft, setAddDraft] = useState("");

  const toggleOption = (id: string) => {
    if (disabled) return;
    if (isMulti) {
      const next = new Set(selectedSet);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      onChange(Array.from(next));
    } else {
      onChange(id);
    }
  };

  const removeFreeAdd = (label: string) => {
    setFreeAdds((arr) => arr.filter((x) => x !== label));
    if (isMulti) {
      const next = new Set(selectedSet);
      next.delete(label);
      onChange(Array.from(next));
    }
  };

  const commitFreeAdd = () => {
    const v = addDraft.trim();
    if (!v) {
      setAddOpen(false);
      setAddDraft("");
      return;
    }
    // dédup
    if (!freeAdds.includes(v)) {
      setFreeAdds((arr) => [...arr, v]);
    }
    if (isMulti) {
      const next = new Set(selectedSet);
      next.add(v);
      onChange(Array.from(next));
    }
    setAddDraft("");
    setAddOpen(false);
  };

  const chipStyle = (selected: boolean) => ({
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: (selected ? 500 : 400) as 400 | 500,
    lineHeight: 1.4,
    padding: "9px 16px",
    border: `1px solid ${
      selected
        ? `color-mix(in srgb, ${palette.argent} 60%, transparent)`
        : palette.lineStrong
    }`,
    background: selected
      ? `color-mix(in srgb, ${palette.argent} 18%, transparent)`
      : "transparent",
    color: palette.navy,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    transition:
      "background 180ms ease-out, color 180ms ease-out, border-color 180ms ease-out",
    fontStyle: "normal" as const,
  });

  return (
    <section style={{ marginBottom: 36 }}>
      <h3
        style={{
          fontFamily: fonts.serif,
          fontSize: 22,
          lineHeight: 1.3,
          fontWeight: 400,
          letterSpacing: "-0.01em",
          margin: field.hint ? "0 0 6px" : "0 0 16px",
          color: palette.navy,
          fontStyle: "normal",
        }}
      >
        {field.label}
      </h3>
      {field.hint && (
        <p
          style={{
            fontFamily: fonts.mono,
            fontSize: 11,
            color: palette.navy400,
            margin: "0 0 16px",
            letterSpacing: "0.04em",
            lineHeight: 1.55,
            fontStyle: "normal",
          }}
        >
          {field.hint}
        </p>
      )}

      <div
        style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
        role={isMulti ? "group" : "radiogroup"}
        aria-label={field.label}
      >
        {/* Options préconfigurées */}
        {field.options.map((opt) => {
          const selected = selectedSet.has(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              role={isMulti ? "checkbox" : "radio"}
              aria-checked={selected}
              onClick={() => toggleOption(opt.id)}
              disabled={disabled}
              style={chipStyle(selected)}
            >
              {opt.label}
            </button>
          );
        })}

        {/* Items libres déjà ajoutés (ils apparaissent comme des chips
           sélectionnées avec un petit × pour les retirer). */}
        {freeAdds.map((label) => {
          const selected = selectedSet.has(label);
          return (
            <span
              key={label}
              style={{
                ...chipStyle(selected),
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={() => toggleOption(label)}
                disabled={disabled}
                style={{
                  all: "unset",
                  cursor: disabled ? "not-allowed" : "pointer",
                  fontFamily: fonts.sans,
                  fontSize: 14,
                  fontWeight: selected ? 500 : 400,
                  color: palette.navy,
                }}
              >
                {label}
              </button>
              <button
                type="button"
                onClick={() => removeFreeAdd(label)}
                disabled={disabled}
                aria-label={`Retirer ${label}`}
                style={{
                  all: "unset",
                  cursor: disabled ? "not-allowed" : "pointer",
                  color: palette.navy400,
                  fontFamily: fonts.mono,
                  fontSize: 12,
                  lineHeight: 1,
                  padding: "0 2px",
                }}
              >
                ×
              </button>
            </span>
          );
        })}

        {/* Chip « + Ajouter » — ouverte uniquement si multi + allowFreeAdd */}
        {isMulti && field.allowFreeAdd && (
          <>
            {addOpen ? (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  border: `1px solid ${palette.navy400}`,
                  background: "transparent",
                  padding: "4px 6px 4px 12px",
                }}
              >
                <input
                  type="text"
                  autoFocus
                  value={addDraft}
                  onChange={(e) => setAddDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitFreeAdd();
                    } else if (e.key === "Escape") {
                      setAddOpen(false);
                      setAddDraft("");
                    }
                  }}
                  onBlur={commitFreeAdd}
                  placeholder="Nom de l'outil…"
                  style={{
                    all: "unset",
                    fontFamily: fonts.sans,
                    fontSize: 14,
                    color: palette.navy,
                    width: 160,
                    fontStyle: "normal",
                  }}
                />
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                disabled={disabled}
                style={{
                  ...chipStyle(false),
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  borderStyle: "dashed",
                  color: palette.navy400,
                }}
                aria-label="Ajouter un autre outil"
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
                Ajouter
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
