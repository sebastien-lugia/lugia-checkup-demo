"use client";

import { useState } from "react";

import type { ProfileStep, UserProfile, UserProfilePatch } from "@/lib/api";
import { ChipsField } from "./ChipsField";

/**
 * V2.0 — Étape 2 du profil : 4 chips réflexifs.
 *
 * Spec V2 §3.2. Calibre la tonalité, la priorisation des chantiers et
 * le filtrage des opportunités. Status=remplaçant active R-replacement.
 */
export function ProfilStep2({
  step,
  profile,
  onSubmit,
  onBack,
  saving,
}: {
  step: ProfileStep;
  profile: UserProfile | null;
  onSubmit: (patch: UserProfilePatch) => Promise<void>;
  onBack: () => void;
  saving?: boolean;
}) {
  const [draft, setDraft] = useState<UserProfilePatch>({
    status: profile?.status ?? null,
    territoire: profile?.territoire ?? null,
    horizon: profile?.horizon ?? null,
    motivation: profile?.motivation ?? null,
  });

  const isComplete =
    !!draft.status && !!draft.territoire && !!draft.horizon && !!draft.motivation;

  const update = (k: keyof UserProfilePatch) => (v: string) =>
    setDraft((d) => ({ ...d, [k]: v }));

  return (
    <main className="max-w-[680px] mx-auto px-8 py-12">
      <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#888780] mb-4">
        Profil — étape 2 sur 2
      </div>
      <h1 className="font-serif text-[32px] sm:text-[40px] font-medium leading-[1.15] tracking-[-0.015em] text-[#111] mb-3">
        Votre regard sur la situation
      </h1>
      <p className="text-[15px] leading-[1.6] text-[#595959] mb-10 max-w-[580px]">
        {step.intro}
      </p>

      {step.fields.map((field) => {
        const key = field.id as keyof UserProfilePatch;
        const currentValue =
          typeof draft[key] === "string" ? (draft[key] as string) : null;
        return (
          <ChipsField
            key={field.id}
            field={field}
            value={currentValue}
            onChange={update(key)}
            disabled={saving}
          />
        );
      })}

      <div className="mt-10 flex items-center gap-4">
        <button
          onClick={onBack}
          disabled={saving}
          className="text-[14px] text-[#595959] hover:text-[#111] underline-offset-4 hover:underline transition-colors"
          type="button"
        >
          ← Retour
        </button>
        <button
          onClick={() => onSubmit(draft)}
          disabled={!isComplete || saving}
          className="bg-[#1f1f1f] hover:bg-[#2c2c2c] text-white font-medium text-[15px] rounded-full px-7 py-3 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          type="button"
        >
          {saving ? "Enregistrement…" : "Commencer le check-up →"}
        </button>
      </div>
    </main>
  );
}
