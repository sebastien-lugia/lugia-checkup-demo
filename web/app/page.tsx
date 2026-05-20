"use client";

/**
 * V2.0-T5 (révisée T5-fix) — Page d'accueil à 2 cartes.
 *
 * Permet de choisir entre Check-up classique (V1.1.9) et Diagnostic
 * organisationnel V2 (V2.0). Si une session est en cours pour l'une ou
 * l'autre version (ou les deux), chaque carte affiche son propre CTA
 * "Reprendre" — pas de bandeau unique en tête qui n'expose que la plus
 * récente.
 *
 * Cf D-029, spec V2 §11.5, et CHANGELOG entrée V2.0-T5-fix.
 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppHeader } from "@/components/AppHeader";
import { PageHeader } from "@/components/PageHeader";
import {
  type ActiveInterviewsByVersion,
  createInterview,
  createInterviewV2,
  getActiveInterviewsByVersion,
  type Interview,
} from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

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

function pathForResumeV1(interview: Interview): string {
  if (interview.current_question_index >= 14) {
    return `/resultats?interview=${interview.id}`;
  }
  return `/checkup?interview=${interview.id}`;
}

function pathForResumeV2(interview: Interview): string {
  if (interview.status === "completed") {
    return `/resultats/v2?id=${interview.id}`;
  }
  return "/checkup/v2";
}

export default function AccueilPage() {
  const router = useRouter();
  const isAuthReady = useRequireAuth();
  const [workingPath, setWorkingPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actives, setActives] = useState<ActiveInterviewsByVersion>({});
  const [isLoadingActives, setIsLoadingActives] = useState(true);

  useEffect(() => {
    if (!isAuthReady) return;
    (async () => {
      try {
        const a = await getActiveInterviewsByVersion();
        setActives(a);
      } catch {
        // API indisponible : pas bloquant, les cartes restent utilisables
      } finally {
        setIsLoadingActives(false);
      }
    })();
  }, [isAuthReady]);

  const activeV1 = actives["v1.1.9"];
  const activeV2 = actives["v2.0"];

  async function handleStartClassic() {
    setWorkingPath("classic");
    setError(null);
    try {
      const interviewId = await createInterview();
      router.push(`/checkup?interview=${interviewId}`);
    } catch {
      setError(
        "Impossible de créer une session. Vérifiez que le backend est accessible."
      );
      setWorkingPath(null);
    }
  }

  async function handleStartV2() {
    setWorkingPath("v2");
    setError(null);
    try {
      await createInterviewV2();
      router.push("/checkup/v2");
    } catch {
      setError(
        "Impossible de démarrer la nouvelle version. Vérifiez que le backend est accessible."
      );
      setWorkingPath(null);
    }
  }

  function handleResumeV1() {
    if (!activeV1) return;
    router.push(pathForResumeV1(activeV1));
  }

  function handleResumeV2() {
    if (!activeV2) return;
    router.push(pathForResumeV2(activeV2));
  }

  if (!isAuthReady) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-lugia-text-tertiary">Chargement…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <AppHeader />
      <div className="flex-1 flex items-start justify-center px-6 py-12">
        <div className="max-w-3xl w-full">
          <PageHeader mbBottom={10} />

          <h1 className="font-serif text-[28px] sm:text-[32px] font-medium leading-snug mb-5">
            Votre cabinet aussi mérite un check-up.
          </h1>

          <p className="text-base text-lugia-text-secondary leading-relaxed mb-10 max-w-[640px]">
            Deux versions du check-up sont disponibles aujourd&apos;hui.
            Choisissez celle que vous voulez tester — vous pourrez faire
            l&apos;autre par la suite.
          </p>

          {/* Les 2 cartes — chacune avec son propre état "session en cours" */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            {/* Carte V1.1.9 — version classique */}
            <VersionCard
              variant="classic"
              loading={isLoadingActives}
              active={activeV1}
              working={workingPath === "classic"}
              workingPathSet={workingPath !== null}
              onStart={handleStartClassic}
              onResume={handleResumeV1}
            />

            {/* Carte V2.0 — nouvelle version */}
            <VersionCard
              variant="v2"
              loading={isLoadingActives}
              active={activeV2}
              working={workingPath === "v2"}
              workingPathSet={workingPath !== null}
              onStart={handleStartV2}
              onResume={handleResumeV2}
            />
          </div>

          {/* Garde-fous communs */}
          <div className="rounded-xl border border-lugia-border bg-lugia-bg-card p-5 mb-6">
            <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#888780] mb-3">
              Vos garde-fous (les deux versions)
            </div>
            <ul className="text-[13px] leading-[1.55] text-[#595959] space-y-1.5 list-none p-0 m-0">
              <li>— Aucune donnée patient identifiable ne vous est demandée.</li>
              <li>
                — Le check-up porte sur votre organisation, pas sur votre
                clinique.
              </li>
              <li>
                — Vous pouvez interrompre et reprendre plus tard à tout moment.
              </li>
            </ul>
          </div>

          {error && (
            <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function VersionCard({
  variant,
  loading,
  active,
  working,
  workingPathSet,
  onStart,
  onResume,
}: {
  variant: "classic" | "v2";
  loading: boolean;
  active: Interview | undefined;
  working: boolean;
  workingPathSet: boolean;
  onStart: () => void;
  onResume: () => void;
}) {
  const isV2 = variant === "v2";
  const title = isV2 ? "Diagnostic organisationnel V2" : "Check-up classique";
  const eyebrow = isV2 ? "Nouvelle version" : "Version actuelle";
  const eyebrowColor = isV2 ? "text-[#1a56a0]" : "text-[#888780]";
  const description = isV2
    ? "Mini-profil en chips, 18 questions sur 3 axes, radar dynamique qui se construit en direct. Reformulations terrain inline, benchmarks chiffrés, 7 modules d'approfondissement."
    : "14 questions, ~25 min. Format question par question. Rapport en 3 facettes, 3 chantiers proposés.";
  const pills = isV2
    ? ["18 questions", "~25 min", "Radar live"]
    : ["14 questions", "~25 min"];

  const borderClass = isV2
    ? "border-2 border-[#1a56a0]"
    : "border border-lugia-border";

  const resumeIsResults =
    !!active &&
    (isV2
      ? active.status === "completed"
      : active.current_question_index >= 14);
  const startLabel = isV2 ? "Essayer la nouvelle version →" : "Commencer →";
  const resumeLabel = resumeIsResults
    ? "Voir mes résultats →"
    : "Reprendre →";

  const handleClick = active ? onResume : onStart;
  const disabled = workingPathSet && !working;

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={
        "text-left rounded-xl bg-lugia-bg-card transition-colors p-7 disabled:opacity-50 disabled:cursor-not-allowed group relative " +
        borderClass +
        (active ? " bg-[#fbf9f1]" : "") +
        (isV2 ? " hover:bg-white/70" : " hover:border-lugia-text-tertiary")
      }
      type="button"
    >
      {isV2 && (
        <span className="absolute top-3 right-3 text-[10px] uppercase tracking-[0.12em] font-semibold text-white bg-[#1a56a0] px-2.5 py-1 rounded-full">
          Pilote
        </span>
      )}
      <div className={"text-[10px] uppercase tracking-[0.16em] font-semibold mb-3 " + eyebrowColor}>
        {eyebrow}
      </div>
      <h2 className="font-serif text-[22px] font-medium text-[#111] mb-3">
        {title}
      </h2>
      <p className="text-[13px] leading-[1.55] text-[#444] mb-5">{description}</p>
      <div className="flex flex-wrap items-center gap-2 text-[13px] text-[#444] mb-5">
        {pills.map((p) => (
          <Pill key={p}>{p}</Pill>
        ))}
      </div>

      {/* Indicateur de session en cours pour cette version (si applicable) */}
      {active && (
        <div className="mb-4 px-3 py-2 rounded-md bg-white/70 border border-[#d4cfbf]">
          <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[#888780] mb-0.5">
            Session en cours
          </div>
          <div className="text-[12px] text-[#1a1a1a]">
            {isV2 ? (
              <>commencée le {formatDate(active.created_at)}</>
            ) : (
              <>
                commencée le {formatDate(active.created_at)} (question{" "}
                {active.current_question_index + 1}/14)
              </>
            )}
          </div>
        </div>
      )}

      <div className="text-[14px] font-medium text-[#1a56a0] group-hover:underline">
        {loading
          ? "…"
          : working
          ? "Création…"
          : active
          ? resumeLabel
          : startLabel}
      </div>
    </button>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[11px] px-2.5 py-1 rounded-full border border-[#d4cfbf] bg-white/60 text-[#444]">
      {children}
    </span>
  );
}
