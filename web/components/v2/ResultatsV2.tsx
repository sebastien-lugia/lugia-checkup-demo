"use client";

import Link from "next/link";
import { useState } from "react";

import type { V2Report, V2AxisScore, V2Module } from "@/lib/api";
import { RadarResult } from "./RadarResult";

/**
 * V2.0 — Page résultats complète.
 *
 * Spec V2 §11.5. Le payload V2 du backend (`/interviews/{iid}/report`)
 * contient tout ce qui est nécessaire pour rendre cette page sans
 * autres appels :
 *  - scores 3 axes + niveaux + titres diagnostic
 *  - signal croisé conditionnel
 *  - tonalité personnalisée (phrase d'accueil + status_senior/junior)
 *  - benchmarks combinatoires (R-bench-*)
 *  - opportunités ordonnées (compute_opportunities_order côté backend)
 *  - bandeau remplaçant si applicable
 *  - les 7 modules complets avec étapes + benchmark de conclusion
 */

const AXIS_COLORS = {
  A: "#2e7d4f",
  B: "#a85d2b",
  C: "#1a56a0",
} as const;

export function ResultatsV2({ report }: { report: V2Report }) {
  const { scores, signal, tonality, replacement, benchmarks_combinatoire } = report;

  return (
    <main className="max-w-[840px] mx-auto px-8 py-14">
      {/* Bandeau remplaçant (si applicable) */}
      {replacement && (
        <div
          className="mb-8 px-5 py-4 rounded-md border-l-[3px]"
          style={{ backgroundColor: "#f5f4ef", borderLeftColor: "#888780" }}
        >
          <div className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#444] mb-1">
            À noter
          </div>
          <div className="text-[13px] leading-[1.55] text-[#444]">
            {replacement.banner}
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#1a56a0] mb-5">
        Résultats — diagnostic V2
      </div>
      <h1 className="font-serif text-[36px] sm:text-[44px] font-medium leading-[1.1] tracking-[-0.015em] text-[#111] mb-4">
        Votre cabinet, vu du diagnostic
        {report.interview.doctor_firstname && (
          <>, Dr {report.interview.doctor_firstname}</>
        )}
      </h1>
      <p className="font-serif text-[19px] italic leading-[1.5] text-[#444] mb-12 max-w-[680px]">
        « {tonality.motivation_intro} »
      </p>

      {/* Radar grand format */}
      <div className="my-12">
        <RadarResult scores={scores} />
      </div>

      {/* Signal croisé */}
      {signal && <SignalBanner signal={signal} />}

      {/* Tonalité status (junior/senior) sous forme d'aparté */}
      {(tonality.status_junior || tonality.status_senior) && (
        <p className="text-[14px] italic text-[#666] border-l-[3px] border-[#d4cfbf] pl-4 my-10 max-w-[640px]">
          {tonality.status_junior ?? tonality.status_senior}
        </p>
      )}

      {/* Cartes par axe */}
      <section className="mt-14">
        <SectionTitle number="I" title="Les trois axes" />
        <div className="mt-6 space-y-4">
          {(["A", "B", "C"] as const).map((axis) => {
            const block = scores[axis];
            if (!block) return null;
            return <FacetCard key={axis} axis={axis} block={block} />;
          })}
        </div>
      </section>

      {/* Benchmarks combinatoires */}
      {benchmarks_combinatoire.length > 0 && (
        <section className="mt-14">
          <SectionTitle number="II" title="Repères terrain personnalisés" />
          <div className="mt-6 space-y-4">
            {benchmarks_combinatoire.map((b) => (
              <BenchmarkBox key={b.id} benchmark={b} />
            ))}
          </div>
        </section>
      )}

      {/* Opportunités d'action — modules ordonnés */}
      <section className="mt-14">
        <SectionTitle number="III" title="Opportunités d'action" />
        <p className="text-[14px] text-[#595959] italic mt-2 max-w-[560px]">
          Sélection ordonnée selon votre profil et votre niveau d'énergie.
          La première carte est la plus alignée avec ce que vous avez
          déclaré.
        </p>
        <div className="mt-6 space-y-3">
          {report.opportunities_order.slice(0, 4).map((modId, idx) => {
            const mod = report.modules.find((m) => m.id === modId);
            if (!mod) return null;
            return (
              <ChantierCard
                key={mod.id}
                mod={mod}
                rank={idx + 1}
                recommended={idx === 0}
              />
            );
          })}
        </div>
      </section>

      {/* Tous les modules accessibles */}
      <section className="mt-14 mb-8">
        <SectionTitle number="IV" title="Tous les chantiers" />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {report.modules.map((mod) => (
            <ModuleSummary key={mod.id} mod={mod} />
          ))}
        </div>
      </section>
    </main>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="border-t border-[#e0dccc] pt-8">
      <div className="flex items-baseline gap-4">
        <span className="font-serif text-[36px] text-[#d4cfbf] font-medium">
          {number}
        </span>
        <h2 className="font-serif text-[28px] font-medium text-[#111]">
          {title}
        </h2>
      </div>
    </div>
  );
}

function SignalBanner({ signal }: { signal: NonNullable<V2Report["signal"]> }) {
  const isAlert =
    signal.tonalite === "alerte_forte" || signal.tonalite === "alerte";
  const isPositive = signal.tonalite === "positif";
  let bg = "#f5f4ef";
  let border = "#d4cfbf";
  if (isAlert) {
    bg = "#fbeae0";
    border = "#a85d2b";
  } else if (isPositive) {
    bg = "#e8f1ec";
    border = "#2e7d4f";
  } else if (signal.tonalite === "recadrage") {
    bg = "#e6edf6";
    border = "#1a56a0";
  }
  return (
    <div
      className="my-10 px-6 py-5 rounded-md border-l-[3px]"
      style={{ backgroundColor: bg, borderLeftColor: border }}
    >
      <div className="text-[11px] uppercase tracking-[0.14em] font-semibold mb-2 text-[#444]">
        Signal croisé
      </div>
      <h3 className="font-serif text-[20px] font-medium text-[#111] leading-[1.3] mb-2">
        {signal.titre}
      </h3>
      <p className="text-[14px] leading-[1.55] text-[#444] m-0">
        {signal.message}
      </p>
    </div>
  );
}

function FacetCard({
  axis,
  block,
}: {
  axis: "A" | "B" | "C";
  block: V2AxisScore;
}) {
  const [expanded, setExpanded] = useState(false);
  const color = AXIS_COLORS[axis];
  const showBadge =
    block.level === "a_surveiller" || block.level === "a_risque";
  const badgeBg =
    block.level === "a_risque" ? "#fbeae0" : "#f0f0f0";
  const badgeColor =
    block.level === "a_risque" ? "#8a3a14" : "#444";

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className="w-full text-left rounded-lg border border-[#e0dccc] bg-white/40 hover:border-[#888780] transition-colors px-6 py-5 block"
      type="button"
    >
      <div className="flex items-start gap-4">
        <span
          className="inline-block w-2 h-2 rounded-full mt-2.5 flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#888780]">
              {block.axe_label}
            </span>
            {showBadge && (
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-[0.08em]"
                style={{ backgroundColor: badgeBg, color: badgeColor }}
              >
                {block.label}
              </span>
            )}
          </div>
          <h3 className="font-serif text-[22px] font-medium text-[#111] leading-[1.3]">
            {block.title}
          </h3>
          {!showBadge && (
            <div className="text-[13px] text-[#595959] mt-1">{block.label}</div>
          )}
        </div>
        <span
          className="text-[18px] text-[#888780] flex-shrink-0"
          aria-hidden
        >
          {expanded ? "−" : "+"}
        </span>
      </div>
      {expanded && (
        <div className="mt-4 pl-6 border-t border-[#e8e3d3] pt-4">
          <p className="text-[14px] text-[#595959] italic">
            Détail des forces, fragilités et pistes d'action — disponible dans
            les chantiers ci-dessous (sélection ordonnée selon votre profil).
          </p>
        </div>
      )}
    </button>
  );
}

function BenchmarkBox({
  benchmark,
}: {
  benchmark: V2Report["benchmarks_combinatoire"][number];
}) {
  return (
    <div
      className="px-5 py-4 rounded-md border-l-[3px]"
      style={{ backgroundColor: "#fbf3e3", borderLeftColor: "#c48a2a" }}
    >
      <p className="text-[14px] leading-[1.55] text-[#5a3d10] m-0">
        {benchmark.message}
      </p>
      {benchmark.source_status === "to_confirm" && (
        <div className="text-[11px] text-[#8a5a14] italic mt-2">
          [À confirmer
          {benchmark.source_hint ? ` — source : ${benchmark.source_hint}` : ""}
          ]
        </div>
      )}
    </div>
  );
}

function ChantierCard({
  mod,
  rank,
  recommended,
}: {
  mod: V2Module;
  rank: number;
  recommended: boolean;
}) {
  return (
    <Link
      href={`/modules/${mod.id}`}
      className={
        "block rounded-lg border bg-white/40 px-6 py-5 transition-colors hover:bg-white/70 " +
        (recommended
          ? "border-[#1a56a0] shadow-[0_0_0_2px_rgba(26,86,160,0.06)]"
          : "border-[#e0dccc] hover:border-[#888780]")
      }
    >
      <div className="flex items-start gap-5">
        <span
          className="font-serif text-[44px] leading-none text-[#d4cfbf] font-medium flex-shrink-0"
          aria-hidden
        >
          {String(rank).padStart(2, "0")}
        </span>
        <div className="flex-1">
          {recommended && (
            <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[#1a56a0] mb-1">
              Recommandé pour vous
            </div>
          )}
          <h3 className="font-serif text-[20px] font-medium text-[#111] leading-[1.3] mb-2">
            {mod.icone} {mod.label}
          </h3>
          <div className="flex items-center gap-3 text-[12px] text-[#888780]">
            <EffortPips effort={mod.effort} />
            <span>·</span>
            <span>
              {mod.impact === "immediat"
                ? "Impact immédiat"
                : mod.impact === "court_terme"
                ? "Impact court terme"
                : "Impact moyen terme"}
            </span>
            <span>·</span>
            <span>{mod.etapes.length} étapes</span>
          </div>
          <div className="mt-3 text-[13px] font-medium text-[#1a56a0]">
            Voir le détail →
          </div>
        </div>
      </div>
    </Link>
  );
}

function EffortPips({ effort }: { effort: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`Effort ${effort} sur 3`}>
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className="inline-block w-2 h-2 rounded-full"
          style={{
            backgroundColor: n <= effort ? "#888780" : "#e0dccc",
          }}
        />
      ))}
    </span>
  );
}

function ModuleSummary({ mod }: { mod: V2Module }) {
  return (
    <Link
      href={`/modules/${mod.id}`}
      className="block border border-[#e0dccc] rounded-md bg-white/30 hover:bg-white/70 hover:border-[#888780] transition-colors px-4 py-3"
    >
      <div className="text-[15px] font-medium text-[#1a1a1a] mb-1">
        {mod.icone} {mod.label}
      </div>
      <div className="flex items-center gap-2 text-[11px] text-[#888780]">
        <EffortPips effort={mod.effort} />
        <span>· {mod.etapes.length} étapes</span>
      </div>
    </Link>
  );
}
