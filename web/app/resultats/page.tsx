"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { AppHeader } from "@/components/AppHeader";
import { getReport, type Report, type Workstream } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

const FACET_ORDER = ["processes", "participants", "information"] as const;

// V1.1.7-m : 2 chemins (autonomie / lugia), V1.1.9-s : titres serif + descriptions
// préservées identiques à V1.1.7 (pas de refonte éditoriale en V1.1.9).
const NEXT_STEPS: Record<
  "autonomie" | "lugia",
  { badge: string; title: string; desc: string; cta: string }
> = {
  autonomie: {
    badge: "Pour explorer",
    title: "Approfondir un chantier, en autonomie",
    desc: "Un questionnaire ciblé sur l'opportunité de votre choix. Environ 15 minutes, gratuit, sans rendez-vous — à votre rythme.",
    cta: "Choisir un chantier",
  },
  lugia: {
    badge: "Recommandé",
    title: "Avancer avec Lugia, en réel",
    desc: "Vous choisissez une opportunité, on la traite ensemble dans votre cabinet. Pas un appel d'identification — le chantier lui-même, structuré à partir de dispositifs éprouvés chez d'autres confrères.",
    cta: "En parler avec Lugia",
  },
};

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso.slice(0, 10);
  }
}

/* ============================================================================
 * V1.1.9-s : SectionHeader — eyebrow numéroté en marge + filet horizontal
 *   Le numéro romain est positionné à -64px sur desktop (≥880px) via un
 *   wrapper relative, et bascule en flow normal au-dessus de l'eyebrow en
 *   mobile (gérée par la classe utility `lugia-section`).
 * ========================================================================== */

function SectionHeader({
  num,
  label,
  className = "",
}: {
  num: string; // "I", "II", "III", "IV"
  label: string;
  className?: string;
}) {
  return (
    <header className={`lugia-section-header relative ${className}`}>
      <span
        aria-hidden="true"
        className="lugia-section-num font-serif text-[13px] font-medium text-[#c7c2b1] tracking-[0.04em]"
      >
        {num}.
      </span>
      <div className="flex items-center gap-3.5">
        <span className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#888780]">
          {label}
        </span>
        <span className="flex-1 h-px bg-[#e5e5e5]" />
      </div>
    </header>
  );
}

/* ============================================================================
 * V1.1.9-s : FacetCard — conservée en grille 3 cols, plus d'air à l'intérieur,
 *   séparateur subtil entre forces et risques. Badges asymétriques V1.1.6
 *   (Maîtrisé/Opérationnel muets, À surveiller/À risque visibles).
 * ========================================================================== */

function FacetCard({
  label,
  level,
  levelLabel,
  forces = [],
  risques = [],
}: {
  label: string;
  level: 1 | 2 | 3 | 4 | null;
  levelLabel: string | null;
  forces?: string[];
  risques?: string[];
}) {
  if (level === null) {
    return (
      <div className="bg-white p-6">
        <div className="text-[15px] font-semibold mb-2 text-[#111]">{label}</div>
        <div className="text-[13px] italic text-[#999]">
          Pas assez de données pour évaluer cette facette.
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start gap-3">
        <div className="text-[15px] font-semibold text-[#111] leading-[1.3]">
          {label}
        </div>
        <FacetBadge level={level} label={levelLabel} />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-[0.12em] font-bold text-[#2e7d4f] mb-2">
          Points forts
        </div>
        <ul className="text-[13.5px] leading-[1.55] space-y-1.5 text-[#555] list-none m-0 p-0">
          {forces.map((f, i) => (
            <li
              key={i}
              className="pl-3.5 relative before:content-['—'] before:absolute before:left-0 before:text-[#999]"
            >
              {f}
            </li>
          ))}
        </ul>
      </div>
      {risques.length > 0 && (
        <div className="pt-4 border-t border-[#efece4]">
          <div className="text-[10px] uppercase tracking-[0.12em] font-bold text-[#b45200] mb-2">
            Points de vigilance
          </div>
          <ul className="text-[13.5px] leading-[1.55] space-y-1.5 text-[#555] list-none m-0 p-0">
            {risques.map((r, i) => (
              <li
                key={i}
                className="pl-3.5 relative before:content-['—'] before:absolute before:left-0 before:text-[#999]"
              >
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const FACET_BADGE_STYLES: Record<number, { bg: string; color: string }> = {
  3: { bg: "#f0f0f0", color: "#555" },       // À surveiller
  4: { bg: "#fbeae0", color: "#8a4a1a" },    // À risque
};

function FacetBadge({
  level,
  label,
}: {
  level: 1 | 2 | 3 | 4;
  label: string | null;
}) {
  if (level < 3 || !label) return null;
  const style = FACET_BADGE_STYLES[level];
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {label}
    </span>
  );
}

/* ============================================================================
 * V1.1.9-s : ChantierCard — refonte vers card pleine largeur avec numéro
 *   grand serif en marge gauche. Structure 2 sections conservée (LA SITUATION
 *   + CE QU'ON METTRAIT RAPIDEMENT EN PLACE). Plus narrative qu'en V1.1.7.
 * ========================================================================== */

function ChantierCard({ chantier }: { chantier: Workstream }) {
  return (
    <article className="lugia-opp-card bg-white border border-[#e5e5e5] rounded-xl overflow-hidden mb-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="lugia-opp-body grid grid-cols-[80px_1fr] gap-5 px-9 py-9 max-md:grid-cols-1 max-md:px-7 max-md:py-7">
        <div className="font-serif text-[56px] font-medium text-[#c7c2b1] leading-none tracking-[-0.02em] max-md:text-[38px]">
          {chantier.priority}
        </div>
        <div className="min-w-0">
          <h3 className="font-serif text-[22px] font-medium leading-[1.3] tracking-[-0.005em] text-[#111] mt-1.5 mb-6">
            {chantier.title}
          </h3>
          <div className="mb-4">
            <div className="text-[10px] uppercase tracking-[0.12em] font-bold text-[#999] mb-2">
              La situation
            </div>
            <div className="text-[14.5px] leading-[1.65] text-[#555]">
              {chantier.vu}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.12em] font-bold text-[#999] mb-2">
              Ce qu&apos;on mettrait rapidement en place
            </div>
            <div className="text-[14.5px] leading-[1.65] text-[#555]">
              {chantier.propose}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ============================================================================
 * V1.1.9-s : NextStepCard — cartes plus hautes, titres serif 21px, carte
 *   recommandée avec bordure bleue 2px + gradient subtil + CTA bleu plein.
 * ========================================================================== */

function NextStepCard({
  stepKey,
  isRecommended,
}: {
  stepKey: "autonomie" | "lugia";
  isRecommended: boolean;
}) {
  const step = NEXT_STEPS[stepKey];
  return (
    <div
      className={`rounded-xl p-7 h-full flex flex-col shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
        isRecommended
          ? "border-2 border-[#1a56a0] bg-gradient-to-b from-[#fbfdff] to-white"
          : "border border-[#e5e5e5] bg-white"
      }`}
    >
      <div
        className={`text-[10px] uppercase tracking-[0.14em] font-bold mb-3 ${
          isRecommended ? "text-[#1a56a0]" : "text-[#888780]"
        }`}
      >
        {isRecommended ? "Recommandé" : step.badge}
      </div>
      <h3 className="font-serif text-[21px] font-medium leading-[1.3] tracking-[-0.005em] text-[#111] mb-3">
        {step.title}
      </h3>
      <p className="text-[14.5px] text-[#555] leading-[1.6] mb-6 flex-1">
        {step.desc}
      </p>
      <button
        type="button"
        className={`px-5 py-3 rounded-lg text-[14px] font-medium transition ${
          isRecommended
            ? "bg-[#1a56a0] text-white hover:bg-[#144a8c]"
            : "border border-[#e5e5e5] bg-white text-[#555] hover:border-[#888780] hover:text-[#111]"
        }`}
      >
        {step.cta}
      </button>
    </div>
  );
}

/* ============================================================================
 * Composant principal — orchestration des sections
 * ========================================================================== */

function ResultatsContent() {
  const router = useRouter();
  const isAuthReady = useRequireAuth();
  const searchParams = useSearchParams();
  const interviewIdParam = searchParams.get("interview");
  const interviewId = interviewIdParam ? parseInt(interviewIdParam, 10) : null;

  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!interviewId) {
      setError("Aucune interview à afficher.");
      return;
    }
    (async () => {
      try {
        const r = await getReport(interviewId);
        setReport(r);
      } catch {
        setError(
          "Impossible de charger les résultats. Vérifiez que l'API est accessible."
        );
      }
    })();
  }, [isAuthReady, interviewId]);

  if (!isAuthReady) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="text-sm text-lugia-text-tertiary">Chargement…</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="max-w-xl text-center">
            <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              {error}
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-lugia-text text-white px-6 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition"
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="text-sm text-lugia-text-tertiary">
          Chargement des résultats…
        </div>
      </main>
    );
  }

  // Préparation des badges affichés sous la grille des facettes (conditionnel)
  const levels = FACET_ORDER.map((k) => report.facets[k]?.level).filter(
    (l): l is NonNullable<typeof l> => l != null
  );
  const hasL3 = levels.includes(3);
  const hasL4 = levels.includes(4);

  return (
    <main className="min-h-screen bg-lugia-bg">
      <AppHeader />
      <div className="max-w-[920px] mx-auto px-14 py-12 lugia-page-wrapper max-md:px-7 max-md:py-9">
        {/* ===== HERO ===== */}
        <header className="mb-16 max-md:mb-12">
          <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#888780] mb-6">
            Check-up préventif — votre lecture personnelle
          </div>
          <h1 className="lugia-h1 font-serif text-[44px] font-medium leading-[1.15] tracking-[-0.015em] text-[#111] mb-3.5 max-w-[720px] max-md:text-[32px]">
            Votre cabinet,
            <br />
            vu de l&apos;extérieur.
          </h1>
          <div className="lugia-subtitle text-[17px] text-[#888780] leading-[1.5]">
            {report.interview.doctor_firstname ? (
              <>Dr {report.interview.doctor_firstname} — résultats du {formatDate(report.interview.created_at)}</>
            ) : (
              <>Réalisé le {formatDate(report.interview.created_at)}</>
            )}
          </div>
        </header>

        {/* ===== SECTION I — Synthèse ===== */}
        <section className="lugia-section mb-20 max-md:mb-14">
          <SectionHeader num="I" label="Ce qui ressort" className="mb-7" />
          <div
            className="lugia-synthesis text-[#555] [&_strong]:font-semibold [&_strong]:text-[#111]"
            dangerouslySetInnerHTML={{ __html: report.synthesis }}
          />
        </section>

        {/* ===== SECTION II — Trois angles ===== */}
        <section className="lugia-section mb-20 max-md:mb-14">
          <SectionHeader num="II" label="Trois angles de votre cabinet" className="mb-8" />
          <div className="bg-[#e5e5e5] rounded-xl overflow-hidden mb-4 lugia-facets-grid">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px]">
              {FACET_ORDER.map((facetKey) => {
                const facet = report.facets[facetKey];
                if (!facet) return null;
                return (
                  <FacetCard
                    key={facetKey}
                    label={facet.label}
                    level={facet.level}
                    levelLabel={facet.level_label}
                    forces={facet.forces}
                    risques={facet.risques}
                  />
                );
              })}
            </div>
          </div>
          {(hasL3 || hasL4) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-[#888780] mt-3">
              {hasL3 && (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded"
                    style={{ backgroundColor: "#f0f0f0", color: "#555" }}
                  >
                    À surveiller
                  </span>
                  <span>Situation à améliorer, non urgente</span>
                </span>
              )}
              {hasL4 && (
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="text-[10px] font-medium px-2 py-0.5 rounded"
                    style={{ backgroundColor: "#fbeae0", color: "#8a4a1a" }}
                  >
                    À risque
                  </span>
                  <span>Point critique, à traiter en priorité</span>
                </span>
              )}
            </div>
          )}
        </section>

        {/* ===== PAUSE NARRATIVE — Recommandation italique ===== */}
        {report.recommendation && (
          <section className="lugia-pause relative mb-20 max-md:mb-14 px-14 py-11 bg-[#f7f5ee] rounded-xl text-center max-md:px-7 max-md:py-8">
            <span
              aria-hidden="true"
              className="lugia-pause-quote absolute left-5 top-3 font-serif text-[64px] leading-none text-[#c7c2b1] opacity-60 max-md:text-[44px]"
            >
              &#10077;
            </span>
            <div
              className="lugia-pause-text font-serif italic text-[19px] leading-[1.65] text-[#555] max-w-[640px] mx-auto [&_strong]:not-italic [&_strong]:font-semibold [&_strong]:text-[#111] max-md:text-[16.5px]"
              dangerouslySetInnerHTML={{ __html: report.recommendation }}
            />
          </section>
        )}

        {/* ===== SECTION III — Trois opportunités d'action ===== */}
        <section className="lugia-section mb-20 max-md:mb-14">
          <SectionHeader num="III" label="Trois opportunités d'action" className="mb-8" />
          <p className="text-[15.5px] leading-[1.65] text-[#555] max-w-[720px] mb-9">
            Chacune répond aux points de vigilance relevés plus haut, en
            s&apos;appuyant sur les forces déjà en place. À vous d&apos;arbitrer ce
            qui vaut la peine d&apos;être engagé en premier.
          </p>
          <div>
            {report.workstreams.map((ch) => (
              <ChantierCard key={ch.key} chantier={ch} />
            ))}
          </div>
        </section>

        {/* ===== SECTION IV — Prochaine étape ===== */}
        <section className="lugia-section mb-12">
          <SectionHeader num="IV" label="Prochaine étape ?" className="mb-8" />
          <p className="text-[15.5px] leading-[1.65] text-[#555] max-w-[720px] mb-7">
            Vous avez vu les opportunités. Voici deux façons de les transformer
            en chantiers concrets — à votre rythme, ou avec Lugia.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lugia-next-grid">
            {(["autonomie", "lugia"] as const).map((key) => (
              <NextStepCard
                key={key}
                stepKey={key}
                isRecommended={report.recommended_next_step === key}
              />
            ))}
          </div>
        </section>

        {/* ===== Footer ===== */}
        <footer className="pt-8 border-t border-[#e5e5e5]">
          <button
            onClick={() => router.push("/")}
            className="bg-white border border-[#e5e5e5] text-[#555] px-5 py-2.5 rounded-lg text-[13.5px] font-medium hover:border-[#888780] hover:text-[#111] transition"
          >
            ← Retour à l&apos;accueil
          </button>
        </footer>
      </div>
    </main>
  );
}

export default function ResultatsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-sm text-lugia-text-tertiary">Chargement…</div>
        </main>
      }
    >
      <ResultatsContent />
    </Suspense>
  );
}
