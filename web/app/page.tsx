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
  createInterviewV3,
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
  const activeV3 = actives["v3-brand-0"];

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

  async function handleStartV3() {
    // V3-brand-T-V3-14 : on crée une vraie interview en BDD (protocol_version
    // = "v3-brand-0") et on route en passant l'id en query string.
    setWorkingPath("v3");
    setError(null);
    try {
      const { interview_id } = await createInterviewV3();
      router.push(`/checkup/v3-charte?interview=${interview_id}&fresh=1`);
    } catch {
      setError(
        "Impossible de démarrer la version V3-brand. Vérifiez que le backend est accessible."
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

  function handleResumeV3() {
    if (!activeV3) return;
    // V3-brand : on route avec l'id de l'interview, la page se chargera
    // de reprendre l'état à partir des answers persistés.
    const path =
      activeV3.status === "completed"
        ? `/checkup/v3-charte?interview=${activeV3.id}&view=results`
        : `/checkup/v3-charte?interview=${activeV3.id}`;
    router.push(path);
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
            Trois versions sont disponibles aujourd&apos;hui — la version
            actuelle, la nouvelle version pilote, et la version brand kit en
            beta. Choisissez celle que vous voulez tester.
          </p>

          {/* Les 3 cartes — chacune avec son propre état "session en cours" */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
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

            {/* Carte V3-brand — beta brand kit (T-V3-9 / T-V3-14) */}
            <VersionCard
              variant="v3"
              loading={isLoadingActives}
              active={activeV3}
              working={workingPath === "v3"}
              workingPathSet={workingPath !== null}
              onStart={handleStartV3}
              onResume={handleResumeV3}
            />
          </div>

          {/* Version pré-charte conservée pour démo (accessible directement
              via /checkup/v3-snapshot — entrée UI retirée 2026-05-22). */}

          {/* Garde-fous communs */}
          <div className="rounded-xl border border-lugia-border bg-lugia-bg-card p-5 mb-6">
            <div className="text-[11px] uppercase tracking-[0.14em] font-semibold text-[#888780] mb-3">
              Vos garde-fous (les trois versions)
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
  variant: "classic" | "v2" | "v3";
  loading: boolean;
  active: Interview | undefined;
  working: boolean;
  workingPathSet: boolean;
  onStart: () => void;
  onResume: () => void;
}) {
  const isV2 = variant === "v2";
  const isV3 = variant === "v3";
  const title =
    isV3
      ? "Check-up V3 — brand kit"
      : isV2
      ? "Diagnostic organisationnel V2"
      : "Check-up classique";
  const eyebrow =
    isV3
      ? "Direction brand · Mode nuit"
      : isV2
      ? "Nouvelle version"
      : "Version actuelle";
  const eyebrowColor =
    isV3
      ? "text-[#8E8E91]"
      : isV2
      ? "text-[#1a56a0]"
      : "text-[#888780]";
  const description =
    isV3
      ? "Refonte visuelle complète selon le brand kit Lugia. Mode nuit par défaut, radar incliné, analyse croisée signalée, plans d'action chiffrés (gain temps + euros)."
      : isV2
      ? "Mini-profil en chips, 18 questions sur 3 axes, radar dynamique qui se construit en direct. Reformulations terrain inline, benchmarks chiffrés, 7 modules d'approfondissement."
      : "14 questions, ~25 min. Format question par question. Rapport en 3 facettes, 3 chantiers proposés.";
  const pills =
    isV3
      ? ["18 questions", "~25 min", "Gains chiffrés"]
      : isV2
      ? ["18 questions", "~25 min", "Radar live"]
      : ["14 questions", "~25 min"];

  const borderClass =
    isV3
      ? "border border-[#8E8E91] bg-[#f4efe5]"
      : isV2
      ? "border-2 border-[#1a56a0]"
      : "border border-lugia-border";

  const resumeIsResults =
    !!active &&
    (isV2
      ? active.status === "completed"
      : active.current_question_index >= 14);
  const startLabel =
    isV3
      ? "Découvrir la version beta →"
      : isV2
      ? "Essayer la nouvelle version →"
      : "Commencer →";
  const resumeLabel = resumeIsResults
    ? "Voir mes résultats →"
    : "Reprendre →";

  const handleClick = active ? onResume : onStart;
  const disabled = workingPathSet && !working;
  // Bug fix 2026-05-23 : quand une session est active, on n'exposait que
  // « Reprendre ». Le médecin qui voulait repartir à zéro n'avait pas
  // d'issue. On garde le button principal en « Reprendre » (clic naturel
  // sur la card = continuité) et on ajoute un second CTA discret en
  // dessous pour démarrer une nouvelle session de cette même version.
  // (HTML interdit nested <button> → on enveloppe dans un <div>.)

  return (
    <div className="flex flex-col gap-2">
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={
        "text-left transition-all p-7 disabled:opacity-50 disabled:cursor-not-allowed group relative " +
        (isV3 ? "" : "rounded-xl bg-lugia-bg-card ") +
        borderClass +
        (active ? " bg-[#fbf9f1]" : "") +
        (isV2 ? " hover:bg-white/70" : "") +
        (isV3 ? " hover:border-[#1a2333] hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_#8E8E91,0_12px_32px_-10px_rgba(142,142,145,0.4)]" : "") +
        (!isV2 && !isV3 ? " hover:border-lugia-text-tertiary" : "")
      }
      type="button"
    >
      {isV2 && (
        <span className="absolute top-3 right-3 text-[10px] uppercase tracking-[0.12em] font-semibold text-white bg-[#1a56a0] px-2.5 py-1 rounded-full">
          Pilote
        </span>
      )}
      {isV3 && (
        <span
          className="absolute top-3 right-3 text-[9px] uppercase tracking-[0.18em] font-bold text-[#1a2333] px-2.5 py-1 border border-[#8E8E91]"
          style={{
            background: "linear-gradient(90deg, #D2D2D5 0%, #faf7f1 50%, #D2D2D5 100%)",
          }}
        >
          Beta · Brand
        </span>
      )}
      <div className={"text-[10px] uppercase tracking-[0.16em] font-semibold mb-3 " + eyebrowColor}>
        {eyebrow}
      </div>
      <h2 className={"font-serif text-[22px] font-medium mb-3 " + (isV3 ? "text-[#1a2333]" : "text-[#111]")}>
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

      <div className={"text-[14px] font-medium group-hover:underline " + (isV3 ? "text-[#1a2333]" : "text-[#1a56a0]")}>
        {loading
          ? "…"
          : working
          ? "Création…"
          : active
          ? resumeLabel
          : startLabel}
      </div>
    </button>
    {active && (
      <button
        type="button"
        onClick={onStart}
        disabled={disabled || loading || working}
        className={
          "text-[12px] text-[#666] hover:text-[#1a2333] underline underline-offset-2 " +
          "self-start px-1 py-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        }
      >
        {working ? "Création…" : "Démarrer un nouveau check-up"}
      </button>
    )}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[11px] px-2.5 py-1 rounded-full border border-[#d4cfbf] bg-white/60 text-[#444]">
      {children}
    </span>
  );
}
