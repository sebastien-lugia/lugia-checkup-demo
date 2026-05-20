"use client";

import { useState } from "react";

import type { ProfileStep, UserProfile, UserProfilePatch } from "@/lib/api";
import { ChipsField } from "./ChipsField";

/**
 * V2.0 — Étape 1 du profil : 5 chips factuels.
 *
 * Spec V2 §3.1. Tous les champs sont obligatoires pour avancer — la
 * cohérence des règles de personnalisation et du routing solo en dépend.
 */
export function ProfilStep1({
  step,
  profile,
  onSubmit,
  saving,
}: {
  step: ProfileStep;
  profile: UserProfile | null;
  onSubmit: (patch: UserProfilePatch) => Promise<void>;
  saving?: boolean;
}) {
  const [draft, setDraft] = useState<UserProfilePatch>({
    cabinet_type: profile?.cabinet_type ?? null,
    volume: profile?.volume ?? null,
    paramedical_team: profile?.paramedical_team ?? null,
    logiciel_metier: profile?.logiciel_metier ?? null,
    logiciel_metier_other: profile?.logiciel_metier_other ?? null,
    rdv_canal: profile?.rdv_canal ?? null,
  });

  const isComplete =
    !!draft.cabinet_type &&
    !!draft.volume &&
    !!draft.paramedical_team &&
    !!draft.logiciel_metier &&
    !!draft.rdv_canal &&
    // Si l'option "Autre" est choisie pour le logiciel, exiger une saisie libre
    (draft.logiciel_metier !== "autre" ||
      (draft.logiciel_metier_other?.trim() ?? "") !== "");

  const update = (k: keyof UserProfilePatch) => (v: string) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <main className="max-w-[680px] mx-auto px-8 py-12">
      <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#888780] mb-4">
        Profil — étape 1 sur 2
      </div>
      <h1 className="font-serif text-[32px] sm:text-[40px] font-medium leading-[1.15] tracking-[-0.015em] text-[#111] mb-3">
        Quelques informations sur votre cabinet
      </h1>
      <p className="text-[15px] leading-[1.6] text-[#595959] mb-10 max-w-[580px]">
        {step.intro}
      </p>

      {step.fields.map((field) => {
        // Type assertion : on sait que les champs déclarés en JSON sont des
        // clés valides de UserProfilePatch (cf interview_protocol_v2.json).
        const key = field.id as keyof UserProfilePatch;
        const currentValue =
          typeof draft[key] === "string" ? (draft[key] as string) : null;
        return (
          <ChipsField
            key={field.id}
            field={field}
            value={currentValue}
            freeTextValue={draft.logiciel_metier_other}
            onChange={update(key)}
            onFreeTextChange={
              field.id === "logiciel_metier"
                ? (txt) =>
                    setDraft((d) => ({ ...d, logiciel_metier_other: txt }))
                : undefined
            }
            disabled={saving}
          />
        );
      })}

      <div className="mt-10 flex items-center gap-4">
        <button
          onClick={() => onSubmit(draft)}
          disabled={!isComplete || saving}
          className={
            "bg-[#1f1f1f] hover:bg-[#2c2c2c] text-white font-medium text-[15px] rounded-full px-7 py-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          }
          type="button"
        >
          {saving ? "Enregistrement…" : "Étape suivante →"}
        </button>
        {!isComplete && (
          <span className="text-[13px] text-[#888780]">
            Complétez les 5 champs pour continuer
          </span>
        )}
      </div>
    </main>
  );
}
