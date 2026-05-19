"use client";

import type { Protocol } from "@/lib/api";

/**
 * V1.1.9 : indicateur de progression segmenté par facette.
 *
 * Le protocole entrelace les facettes (ex. Q06 motivation au milieu du parcours,
 * Q12 processes après Q11 information). On ne peut donc pas raisonner
 * « facette passée / courante / à venir » comme dans un parcours strictement
 * linéaire. À la place :
 *
 *   - chaque segment représente une facette (largeur ∝ nb de questions),
 *   - chaque segment se remplit selon la part des questions de la facette
 *     déjà répondues (peu importe l'ordre dans le parcours),
 *   - la facette de la question courante est marquée avec la couleur accent
 *     (bleu), les autres facettes en gris sombre,
 *   - les facettes complètement répondues passent en gris sombre, plein.
 *
 * Sous l'indicateur : label de la section courante + compteur global Q X / N.
 */
export function CheckupProgress({
  protocol,
  currentIndex,
}: {
  protocol: Protocol;
  currentIndex: number;
}) {
  const questions = protocol.questions; // déjà trié par position côté API

  // Ordre d'apparition des facettes (1ère occurrence) — sert pour l'affichage
  // gauche-à-droite de la barre.
  const facetOrder: string[] = [];
  const facetTotal: Record<string, number> = {};
  for (const q of questions) {
    if (!(q.facet in facetTotal)) {
      facetOrder.push(q.facet);
      facetTotal[q.facet] = 0;
    }
    facetTotal[q.facet] += 1;
  }

  // Comptage des questions répondues par facette (basé sur currentIndex).
  // currentIndex est le pointeur vers la question en cours — toutes les
  // questions d'index < currentIndex sont considérées comme répondues.
  const facetAnswered: Record<string, number> = {};
  for (const f of facetOrder) facetAnswered[f] = 0;
  for (let i = 0; i < Math.min(currentIndex, questions.length); i++) {
    facetAnswered[questions[i].facet] += 1;
  }

  // Facette de la question courante
  const currentQuestion =
    currentIndex >= 0 && currentIndex < questions.length
      ? questions[currentIndex]
      : null;
  const currentFacet = currentQuestion ? currentQuestion.facet : null;

  const sectionLabel = currentFacet
    ? protocol.facet_labels[currentFacet] || currentFacet
    : "—";
  const totalQuestions = questions.length;

  return (
    <div>
      <div className="flex gap-[3px] mb-2.5">
        {facetOrder.map((facet) => {
          const total = facetTotal[facet];
          const answered = facetAnswered[facet];
          const pct = total > 0 ? Math.min(100, (answered / total) * 100) : 0;
          const isCurrent = facet === currentFacet;
          // Couleur de remplissage : bleu si facette courante (en cours
          // de complétion), gris sombre sinon.
          const fillColor = isCurrent ? "var(--lugia-accent, #185FA5)" : "#595959";
          return (
            <div
              key={facet}
              className="h-[4px] rounded-[2px] relative overflow-hidden bg-[#efece4]"
              style={{ flex: total }}
              aria-label={`${protocol.facet_labels[facet] || facet} — ${answered} sur ${total}`}
            >
              <div
                className="absolute left-0 top-0 bottom-0 rounded-[2px] transition-[width] duration-300 ease-out"
                style={{ width: `${pct}%`, background: fillColor }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex justify-between items-baseline text-[11px] text-[#888780]">
        <span className="uppercase tracking-[0.12em] font-semibold text-[#595959]">
          {sectionLabel}
        </span>
        <span className="tracking-[0.04em] font-medium">
          Question {Math.min(currentIndex + 1, totalQuestions)} sur {totalQuestions}
        </span>
      </div>
    </div>
  );
}
