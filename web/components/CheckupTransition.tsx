"use client";

import { useEffect, useState } from "react";

/**
 * V1.1.9 : carton de transition entre deux facettes.
 *
 * Apparaît la première fois qu'on entre dans une nouvelle facette (sauf
 * Contexte qui démarre directement après l'intro). Visible 1.5s puis
 * auto-skip — peut aussi être skippé manuellement au clic ou avec Entrée.
 *
 * Pas de bouton bloquant : on ne veut pas casser le rythme.
 *
 * La phrase pédagogique passe en prop pour rester portable. Le composant
 * gère le timer et le raccourci clavier en interne.
 */

const FACET_PEDAGOGIE: Record<string, string> = {
  context:
    "On commence par poser le cadre — votre cabinet, votre territoire, et ce qui vous amène ici aujourd'hui.",
  processes:
    "On regarde maintenant comment les demandes patients circulent jusqu'à vous — par quels canaux, à quel rythme, et où elles aboutissent.",
  participants:
    "On regarde votre équipe — qui contribue au quotidien, comment les règles sont définies, et comment vous tenez en cas d'absence.",
  information:
    "On regarde les outils et l'information — les logiciels, le suivi des chroniques, le tri des résultats, et votre usage actuel de l'IA.",
  motivation:
    "Une petite pause pour qualifier ce qui vous amène ici aujourd'hui.",
  closing:
    "Dernière question, libre — ce qui vous aiderait le plus dans votre cabinet.",
};

export function CheckupTransition({
  facet,
  sectionLabel,
  sectionIndex,
  totalSections,
  onContinue,
  autoSkipMs = 1500,
}: {
  facet: string;
  sectionLabel: string;
  sectionIndex: number; // 1-based
  totalSections: number;
  onContinue: () => void;
  autoSkipMs?: number;
}) {
  const [hasBeenSkipped, setHasBeenSkipped] = useState(false);

  // Auto-skip après autoSkipMs
  useEffect(() => {
    const id = setTimeout(() => {
      if (!hasBeenSkipped) {
        setHasBeenSkipped(true);
        onContinue();
      }
    }, autoSkipMs);
    return () => clearTimeout(id);
  }, [autoSkipMs, onContinue, hasBeenSkipped]);

  // Skip manuel à Entrée ou Espace
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!hasBeenSkipped) {
          setHasBeenSkipped(true);
          onContinue();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onContinue, hasBeenSkipped]);

  const description = FACET_PEDAGOGIE[facet] || "";

  return (
    <main
      className="flex items-center justify-center px-8 py-16 animate-fade-in min-h-[calc(100vh-200px)]"
      onClick={() => {
        if (!hasBeenSkipped) {
          setHasBeenSkipped(true);
          onContinue();
        }
      }}
      role="presentation"
    >
      <div className="max-w-[540px] text-center">
        <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#888780] mb-4">
          Section {sectionIndex} sur {totalSections}
        </div>
        <h2 className="font-serif text-[32px] font-medium leading-[1.25] tracking-[-0.01em] text-[#111] mb-4">
          {sectionLabel}
        </h2>
        {description && (
          <p className="text-[16px] leading-[1.6] text-[#595959] mb-9">
            {description}
          </p>
        )}
        <div className="text-[12px] text-[#888780]">
          Continuer → (ou appuyez sur Entrée)
        </div>
      </div>
    </main>
  );
}
