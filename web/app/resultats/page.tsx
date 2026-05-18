"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { AppHeader } from "@/components/AppHeader";
import { PageHeader } from "@/components/PageHeader";
import { getReport, type Report, type Workstream } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

const FACET_ORDER = ["processes", "participants", "information"] as const;

// V1.1.7-m : passage de 3 à 2 chemins (suppression "terrain"), reformulation
// "lugia" en travail réel sur le chantier choisi, intégration de la force #5
// (référence aux dispositifs éprouvés chez d'autres confrères).
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
      <div className="bg-white p-5">
        <div className="text-sm font-semibold mb-2 text-[#111]">{label}</div>
        <div className="text-sm italic text-[#999]">
          Pas assez de données pour évaluer cette facette.
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white p-5">
      <div className="flex justify-between items-start gap-3 mb-4">
        <div className="text-[15px] font-semibold text-[#111]">{label}</div>
        <FacetBadge level={level} label={levelLabel} />
      </div>
      <div className="text-[10px] uppercase tracking-wider font-bold text-[#2e7d4f] mb-1.5">
        Points forts
      </div>
      <ul className="text-[13px] leading-relaxed space-y-1 text-[#555] mb-4 list-none">
        {forces.map((f, i) => (
          <li key={i} className="pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-[#999]">
            {f}
          </li>
        ))}
      </ul>
      {risques.length > 0 && (
        <div className="pt-3 mt-3 border-t border-[#ebebeb]">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#b45200] mb-1.5">
            Points de vigilance
          </div>
          <ul className="text-[13px] leading-relaxed space-y-1 text-[#555] list-none">
            {risques.map((r, i) => (
              <li key={i} className="pl-4 relative before:content-['–'] before:absolute before:left-0 before:text-[#999]">
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// V1.1.6 : FacetBadge selon V2 specs — chaque niveau a un fond et une
// couleur de texte propres. Maîtrisé (1) et Opérationnel (2) sont muets
// (pas de badge affiché) — l'absence de signal est elle-même un signal positif.
const FACET_BADGE_STYLES: Record<number, { bg: string; color: string }> = {
  3: { bg: "#f0f0f0", color: "#555" },       // À surveiller : gris neutre
  4: { bg: "#fbeae0", color: "#8a4a1a" },    // À risque : rouille
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

function ChantierCard({ chantier }: { chantier: Workstream }) {
  // V1.1.7-l : refonte vers structure compacte 2 sections.
  //   - LA SITUATION = chantier.vu (analyse mise de côté, conservée backend)
  //   - LE LEVIER    = chantier.propose (réécrit dans workstreams.py V1.1.7-l)
  // chantier.pas_confirmer reste populé en backend pour réversibilité mais n'est plus rendu.
  return (
    <div className="bg-white border border-[#e5e5e5] rounded-lg overflow-hidden mb-4 lugia-opp-card">
      {/* En-tête : numéro grand + titre */}
      <div className="bg-[#f7f7f7] border-b border-[#e5e5e5] px-6 py-4 flex items-center gap-4">
        <div className="text-[28px] font-bold text-[#d0d8f0] leading-none flex-shrink-0">
          {chantier.priority}
        </div>
        <div className="text-[15px] font-semibold text-[#111]">
          {chantier.title}
        </div>
      </div>
      {/* Corps unique : Situation puis Levier, empilés */}
      <div className="bg-white px-6 py-5">
        <div className="text-[10px] uppercase tracking-wider font-bold text-[#999] mb-2">
          La situation
        </div>
        <div className="text-[13px] leading-relaxed text-[#555] mb-5">
          {chantier.vu}
        </div>
        <div className="text-[10px] uppercase tracking-wider font-bold text-[#999] mb-2">
          Ce qu&apos;on mettrait rapidement en place
        </div>
        <div className="text-[13px] leading-relaxed text-[#555]">
          {chantier.propose}
        </div>
      </div>
    </div>
  );
}

function NextStepCard({
  stepKey,
  isRecommended,
}: {
  stepKey: "autonomie" | "lugia";
  isRecommended: boolean;
}) {
  const step = NEXT_STEPS[stepKey];
  // V1.1.6 : carte recommandée bordure bleue + bouton bleu + tag bleu uppercase.
  // Cartes secondaires : bordure grise + bouton bordure grise + tag gris.
  return (
    <div
      className={`bg-white rounded-lg p-5 h-full flex flex-col ${
        isRecommended
          ? "border-2 border-[#1a56a0]"
          : "border border-[#e5e5e5]"
      }`}
    >
      <div
        className={`text-[10px] uppercase tracking-[0.1em] font-bold mb-2 ${
          isRecommended ? "text-[#1a56a0]" : "text-[#999]"
        }`}
      >
        {isRecommended ? "Recommandé" : step.badge}
      </div>
      <div className="text-[15px] font-semibold mb-2 text-[#111]">
        {step.title}
      </div>
      <div className="text-[13px] text-[#555] leading-relaxed mb-4 flex-1">
        {step.desc}
      </div>
      <button
        type="button"
        className={`w-full px-4 py-2.5 rounded text-[13px] font-medium transition ${
          isRecommended
            ? "bg-[#1a56a0] text-white hover:bg-[#144a8c]"
            : "border border-[#e5e5e5] text-[#555] hover:border-[#999] hover:text-[#111]"
        }`}
      >
        {step.cta}
      </button>
    </div>
  );
}

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
            <PageHeader subtitle="Check-up préventif" mbBottom={8} />
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
          Chargement des résultats...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-lugia-bg">
      <AppHeader />
      <div className="max-w-[840px] mx-auto px-8 py-10 lugia-page-wrapper">
        {/* En-tête */}
        <div className="text-xs uppercase tracking-wider text-lugia-accent mb-3">
          Diagnostic préventif gratuit
        </div>
        <h1 className="font-serif text-[28px] font-semibold leading-tight mb-1 text-[#111] lugia-h1">
          Votre cabinet, vu de l&apos;extérieur
        </h1>
        {/* V1.1.7-c : sous-titre personnalisé "Dr {prénom} — résultats du {date}".
            Si prénom non saisi (profil utilisateur vide), on n'affiche que la date. */}
        <div className="text-[17px] text-[#999] mb-10 lugia-subtitle">
          {report.interview.doctor_firstname ? (
            <>Dr {report.interview.doctor_firstname} — résultats du {formatDate(report.interview.created_at)}</>
          ) : (
            <>Réalisé le {formatDate(report.interview.created_at)}</>
          )}
        </div>

        {/* Synthèse */}
        <div className="text-[11px] uppercase tracking-[0.1em] text-[#999] font-medium mb-3">
          Ce qui ressort
        </div>
        <div
          className="lugia-synthesis border-l-[3px] border-[#e5e5e5] pl-5 mb-10 text-[15px] leading-relaxed text-[#555]"
          dangerouslySetInnerHTML={{ __html: report.synthesis }}
        />

        {/* Trois facettes */}
        <div className="text-[11px] uppercase tracking-[0.1em] text-[#999] font-medium mb-3">
          Trois angles de votre cabinet
        </div>
        <div className="bg-[#e5e5e5] rounded-lg overflow-hidden mb-3 lugia-facets-grid">
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
        {/* Légende des badges — V1.1.7-j : conditionnelle, n'affiche que
            les entrées correspondant aux badges effectivement présents.
            Si aucune facette n'est en niveau 3 ou 4, pas de légende du tout. */}
        {(() => {
          const levels = FACET_ORDER
            .map((k) => report.facets[k]?.level)
            .filter((l): l is NonNullable<typeof l> => l != null);
          const hasL3 = levels.includes(3);
          const hasL4 = levels.includes(4);
          if (!hasL3 && !hasL4) return null;
          return (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#999] mb-10">
              {hasL3 && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: "#f0f0f0", color: "#555" }}>À surveiller</span>
                  <span>Situation à améliorer, non urgente</span>
                </span>
              )}
              {hasL4 && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: "#fbeae0", color: "#8a4a1a" }}>À risque</span>
                  <span>Point critique, à traiter en priorité</span>
                </span>
              )}
            </div>
          );
        })()}

        {/* V1.1.7-d : callout reformulé en voix "vous", style discret
            (fond gris très clair + border-left gris). Plus d'italique
            global — le frontend laisse les <strong> retournés ressortir
            la phrase clé. */}
        {report.recommendation && (
          <div
            className="mb-10 px-5 py-4 bg-lugia-bg-soft border-l-[3px] border-[#c9c4b3] rounded-r text-[13px] leading-relaxed text-[#555] [&_strong]:font-semibold [&_strong]:text-[#111]"
            dangerouslySetInnerHTML={{ __html: report.recommendation }}
          />
        )}

        {/* Trois chantiers */}
        <div className="text-[11px] uppercase tracking-[0.1em] text-[#999] font-medium mb-3">
          Trois opportunités d&apos;action
        </div>
        <p className="text-[14px] leading-relaxed text-[#555] mb-6">
          Chacune répond aux risques relevés plus haut, en s&apos;appuyant sur les forces déjà en place. À vous d&apos;arbitrer ce qui vaut la peine d&apos;être engagé en premier.
        </p>
        <div className="mb-10">
          {report.workstreams.map((ch) => (
            <ChantierCard key={ch.key} chantier={ch} />
          ))}
        </div>

        {/* Prochaine étape */}
        <div className="text-[11px] uppercase tracking-[0.1em] text-[#999] font-medium mb-3">
          Prochaine étape ?
        </div>
        {/* V1.1.7-e : phrase de transition courte avant les cartes Prochaine étape */}
        <p className="text-[14px] leading-relaxed text-[#555] mb-6">
          Vous avez vu les opportunités. Voici comment les transformer en chantiers avec Lugia.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10 lugia-next-grid">
          {(["autonomie", "lugia"] as const).map((key) => (
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
            className="bg-white border border-[#e5e5e5] text-[#555] px-5 py-2.5 rounded text-[13px] font-medium hover:border-[#999] hover:text-[#111] transition"
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
