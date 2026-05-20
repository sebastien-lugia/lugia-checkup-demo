"use client";

/**
 * V2.0-T4g — Page détail d'un module d'approfondissement V2.0.
 *
 * URL : /modules/{id} où id ∈ {urgences, chroniques, delegation, comm,
 * logiciel, admin, pilotage}.
 *
 * Page publique (pas d'auth) — les modules sont du contenu statique
 * partageable, un médecin peut envoyer le lien d'un module à son
 * associé sans qu'il ait à se connecter.
 *
 * Spec V2 §11.5.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { getModuleV2, type V2Module } from "@/lib/api";
import { AppHeader } from "@/components/AppHeader";

const TAG_LABELS: Record<string, string> = {
  quick: "Action rapide — < 1 semaine",
  medium: "Projet court — 1 à 4 semaines",
  invest: "Investissement — 1 à 3 mois",
};

const TAG_COLORS: Record<string, { bg: string; color: string }> = {
  quick: { bg: "#e8f1ec", color: "#2e7d4f" },
  medium: { bg: "#fbf3e3", color: "#8a5a14" },
  invest: { bg: "#e6edf6", color: "#1a56a0" },
};

const IMPACT_LABELS: Record<string, string> = {
  immediat: "Impact immédiat (< 2 mois)",
  court_terme: "Impact court terme (2-6 mois)",
  moyen_terme: "Impact moyen terme (6 mois+)",
};

export default function ModulePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const moduleId = params?.id ?? "";

  const [module, setModule] = useState<V2Module | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!moduleId) return;
    let cancelled = false;
    (async () => {
      try {
        const mod = await getModuleV2(moduleId);
        if (cancelled) return;
        setModule(mod);
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof Error ? e.message : String(e);
        setError(msg.includes("404") ? "Ce module n'existe pas." : msg);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#faf9f5]">
        <AppHeader />
        <main className="max-w-[680px] mx-auto px-8 py-20">
          <h1 className="font-serif text-[28px] text-[#a85d2b] mb-4">
            Module introuvable
          </h1>
          <p className="text-[14px] text-[#444] mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="text-[14px] text-[#1a56a0] hover:underline"
            type="button"
          >
            ← Retour
          </button>
        </main>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-[#faf9f5]">
        <AppHeader />
        <main className="max-w-[680px] mx-auto px-8 py-20 text-[#888780]">
          Chargement du module…
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <AppHeader />
      <main className="max-w-[760px] mx-auto px-8 py-14">
        {/* Lien de retour */}
        <button
          onClick={() => router.back()}
          className="text-[13px] text-[#595959] hover:text-[#111] underline-offset-4 hover:underline transition-colors mb-8"
          type="button"
        >
          ← Retour aux résultats
        </button>

        {/* En-tête module */}
        <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#1a56a0] mb-5">
          Module d&apos;approfondissement
        </div>
        <h1 className="font-serif text-[36px] sm:text-[44px] font-medium leading-[1.15] tracking-[-0.015em] text-[#111] mb-4">
          {module.icone} {module.label}
        </h1>

        {/* Méta : effort + impact */}
        <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#595959] mb-10">
          <EffortPips effort={module.effort} />
          <span className="text-[#d4cfbf]">·</span>
          <span>{IMPACT_LABELS[module.impact] ?? module.impact}</span>
          <span className="text-[#d4cfbf]">·</span>
          <span>{module.etapes.length} étapes</span>
        </div>

        {/* Les 4 étapes numérotées */}
        <section className="border-t border-[#e0dccc] pt-10 mb-12 space-y-10">
          {module.etapes.map((etape) => (
            <Etape key={etape.num} etape={etape} />
          ))}
        </section>

        {/* Benchmark de conclusion */}
        <section className="mt-10">
          <div
            className="px-6 py-5 rounded-md border-l-[3px]"
            style={{ backgroundColor: "#fbf3e3", borderLeftColor: "#c48a2a" }}
          >
            <div className="text-[10px] uppercase tracking-[0.14em] font-semibold text-[#8a5a14] mb-2">
              Repère terrain
            </div>
            <p className="text-[14px] leading-[1.6] text-[#5a3d10] m-0">
              {module.benchmark_conclusion.texte}
            </p>
            {module.benchmark_conclusion.source_status === "to_confirm" && (
              <div className="text-[11px] text-[#8a5a14] italic mt-3">
                [À confirmer
                {module.benchmark_conclusion.source_hint
                  ? ` — source : ${module.benchmark_conclusion.source_hint}`
                  : ""}
                ]
              </div>
            )}
          </div>
        </section>

        {/* Pied — partage / lien interne */}
        <section className="mt-12 pt-8 border-t border-[#e0dccc]">
          <p className="text-[13px] text-[#888780] italic">
            Vous pouvez partager ce module avec un membre de votre équipe ou
            l&apos;un de vos associés — l&apos;adresse{" "}
            <code className="text-[12px] bg-[#f5f4ef] px-1.5 py-0.5 rounded">
              /modules/{module.id}
            </code>{" "}
            est publique et ne nécessite pas de connexion.
          </p>
        </section>
      </main>
    </div>
  );
}

function Etape({
  etape,
}: {
  etape: V2Module["etapes"][number];
}) {
  const tagColor = TAG_COLORS[etape.tag] ?? { bg: "#f0f0f0", color: "#444" };
  return (
    <article>
      <div className="flex items-baseline gap-5">
        <span
          className="font-serif text-[40px] leading-none text-[#d4cfbf] font-medium flex-shrink-0"
          aria-hidden
        >
          {etape.num}
        </span>
        <div className="flex-1">
          <h2 className="font-serif text-[22px] font-medium text-[#111] leading-[1.3] mb-2">
            {etape.titre}
          </h2>
          <span
            className="inline-block text-[10px] uppercase tracking-[0.12em] font-semibold px-2.5 py-1 rounded-full mb-3"
            style={{ backgroundColor: tagColor.bg, color: tagColor.color }}
          >
            {TAG_LABELS[etape.tag] ?? etape.tag}
          </span>
          <p className="text-[15px] leading-[1.65] text-[#444] m-0">
            {etape.body}
          </p>
        </div>
      </div>
    </article>
  );
}

function EffortPips({ effort }: { effort: number }) {
  const labels = ["Effort léger", "Effort modéré", "Effort significatif"];
  return (
    <span className="inline-flex items-center gap-2">
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
      <span>{labels[effort - 1] ?? `Effort ${effort}/3`}</span>
    </span>
  );
}

// Lien interne réutilisable (non utilisé directement ici mais exporté pour
// que d'autres composants puissent générer un lien vers un module sans
// dupliquer la convention d'URL).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ModuleLink({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <Link href={`/modules/${id}`} className="text-[#1a56a0] hover:underline">
      {children}
    </Link>
  );
}
