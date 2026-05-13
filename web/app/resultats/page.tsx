"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { getReport, type Report, type Workstream } from "@/lib/api";

const FACET_ORDER = ["processes", "participants", "information"] as const;

const NEXT_STEPS: Record<
  "autonomie" | "lugia" | "terrain",
  { badge: string; title: string; desc: string }
> = {
  autonomie: {
    badge: "À votre rythme",
    title: "Rester en autonomie",
    desc: "Reprendre les chantiers proposés seul, à votre rythme.",
  },
  lugia: {
    badge: "Recommandé",
    title: "Échanger avec Lugia",
    desc: "30 minutes pour reprendre ce que vous avez vu et tester l'environnement sécurisé.",
  },
  terrain: {
    badge: "Plus complet",
    title: "Lancer un diagnostic terrain",
    desc: "Une journée d'observation sur place pour affiner les chantiers.",
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

function FacetCard({
  label,
  score,
  summary,
}: {
  label: string;
  score: number | null;
  summary: string;
}) {
  if (score === null) {
    return (
      <div className="bg-lugia-bg-card border border-lugia-border rounded-xl p-5">
        <div className="text-sm font-medium mb-2 capitalize">{label}</div>
        <div className="text-sm italic text-lugia-text-tertiary">
          Pas assez de données pour scorer cette facette.
        </div>
      </div>
    );
  }
  const pct = Math.max(0, Math.min(100, score * 10));
  return (
    <div className="bg-lugia-bg-card border border-lugia-border rounded-xl p-5">
      <div className="text-sm font-medium mb-2 capitalize">{label}</div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="font-serif text-[32px] font-medium leading-none">
          {score}
        </span>
        <span className="text-sm text-lugia-text-secondary">/ 10</span>
      </div>
      <div className="h-[3px] bg-lugia-bg-soft rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-lugia-text rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-sm text-lugia-text-secondary leading-relaxed">
        {summary}
      </div>
    </div>
  );
}

function ChantierBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider font-medium text-lugia-text-secondary mb-1">
        {label}
      </div>
      <div className="text-sm leading-relaxed">{text}</div>
    </div>
  );
}

function ChantierCard({ chantier }: { chantier: Workstream }) {
  return (
    <div className="bg-lugia-bg-card border border-lugia-border rounded-xl p-6 mb-3">
      <div className="flex justify-between items-baseline pb-3 mb-4 border-b border-lugia-border">
        <div className="text-base font-medium">{chantier.title}</div>
        <div className="text-xs font-medium text-lugia-text-secondary">
          Priorité {chantier.priority}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6">
        <ChantierBlock
          label="Ce que le check-up a vu"
          text={chantier.vu}
        />
        <ChantierBlock
          label="Ce qu'il ne peut pas confirmer seul"
          text={chantier.pas_confirmer}
        />
        <ChantierBlock
          label="Ce que Lugia propose"
          text={chantier.propose}
        />
        <ChantierBlock
          label="Ce que vous obtenez"
          text={chantier.obtient}
        />
      </div>
    </div>
  );
}

function NextStepCard({
  stepKey,
  isRecommended,
}: {
  stepKey: "autonomie" | "lugia" | "terrain";
  isRecommended: boolean;
}) {
  const step = NEXT_STEPS[stepKey];
  return (
    <div
      className={`bg-lugia-bg-card rounded-xl p-5 h-full ${
        isRecommended
          ? "border-2 border-lugia-accent"
          : "border border-lugia-border"
      }`}
    >
      <div
        className={`text-[11px] uppercase tracking-wider font-medium mb-2 ${
          isRecommended ? "text-lugia-accent" : "text-lugia-text-secondary"
        }`}
      >
        {isRecommended ? "Recommandé" : step.badge}
      </div>
      <div className="text-sm font-medium mb-1">{step.title}</div>
      <div className="text-sm text-lugia-text-secondary leading-relaxed">
        {step.desc}
      </div>
    </div>
  );
}

function ResultatsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewIdParam = searchParams.get("interview");
  const interviewId = interviewIdParam ? parseInt(interviewIdParam, 10) : null;

  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [interviewId]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-xl text-center">
          <div className="text-sm font-medium mb-1">Lugia</div>
          <div className="text-xs uppercase tracking-wider text-lugia-text-tertiary mb-8">
            Check-up préventif
          </div>
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
      </main>
    );
  }

  if (!report) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="text-sm text-lugia-text-tertiary">
          Chargement des résultats...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="text-sm font-medium mb-1">Lugia</div>
        <div className="text-xs uppercase tracking-wider text-lugia-text-tertiary mb-6">
          Check-up préventif
        </div>
        <h1 className="font-serif text-[26px] font-medium leading-snug mb-1">
          Votre cabinet vu par le check-up
        </h1>
        <div className="text-sm text-lugia-text-secondary mb-10">
          Réalisé le {formatDate(report.interview.created_at)}
        </div>

        {/* Synthèse */}
        <div className="text-xs uppercase tracking-wider font-medium text-lugia-text-secondary mb-3">
          Votre situation aujourd&apos;hui
        </div>
        <div
          className="lugia-synthesis bg-lugia-bg-soft border-l-2 border-lugia-accent px-5 py-4 mb-10 font-serif text-[17px] leading-relaxed"
          dangerouslySetInnerHTML={{ __html: report.synthesis }}
        />

        {/* Trois facettes */}
        <div className="text-xs uppercase tracking-wider font-medium text-lugia-text-secondary mb-3">
          Trois angles de votre cabinet
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
          {FACET_ORDER.map((facetKey) => {
            const facet = report.facets[facetKey];
            if (!facet) return null;
            return (
              <FacetCard
                key={facetKey}
                label={facet.label}
                score={facet.score}
                summary={facet.summary}
              />
            );
          })}
        </div>

        {/* Trois chantiers */}
        <div className="text-xs uppercase tracking-wider font-medium text-lugia-text-secondary mb-3">
          Trois chantiers prioritaires
        </div>
        <div className="mb-10">
          {report.workstreams.map((ch) => (
            <ChantierCard key={ch.key} chantier={ch} />
          ))}
        </div>

        {/* Prochaine étape */}
        <h2 className="font-serif text-[20px] font-medium mb-4">
          Prochaine étape ?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
          {(["autonomie", "lugia", "terrain"] as const).map((key) => (
            <NextStepCard
              key={key}
              stepKey={key}
              isRecommended={report.recommended_next_step === key}
            />
          ))}
        </div>

        {/* Navigation */}
        <div>
          <button
            onClick={() => router.push("/")}
            className="bg-lugia-bg-card border border-lugia-border text-lugia-text px-5 py-2.5 rounded-lg text-sm font-medium hover:border-lugia-text-tertiary transition"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    </main>
  );
}

export default function ResultatsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-sm text-lugia-text-tertiary">Chargement...</div>
        </main>
      }
    >
      <ResultatsContent />
    </Suspense>
  );
}
