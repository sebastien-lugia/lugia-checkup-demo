"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppHeader } from "@/components/AppHeader";
import {
  createInterview,
  getActiveInterview,
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

export default function AccueilPage() {
  const router = useRouter();
  const isAuthReady = useRequireAuth();
  const [isWorking, setIsWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);
  const [isLoadingActive, setIsLoadingActive] = useState(true);

  useEffect(() => {
    if (!isAuthReady) return;
    (async () => {
      try {
        const active = await getActiveInterview();
        setActiveInterview(active);
      } catch {
        // API indisponible : on n'affiche rien, le bouton Commencer reste utilisable
      } finally {
        setIsLoadingActive(false);
      }
    })();
  }, [isAuthReady]);

  async function handleStartNew() {
    setIsWorking(true);
    setError(null);
    try {
      const interviewId = await createInterview();
      router.push(`/checkup?interview=${interviewId}`);
    } catch {
      setError(
        "Impossible de créer une session. Vérifiez que le backend est accessible."
      );
      setIsWorking(false);
    }
  }

  function handleResume() {
    if (!activeInterview) return;
    router.push(`/checkup?interview=${activeInterview.id}`);
  }

  if (!isAuthReady) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-lugia-text-tertiary">Chargement…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 relative">
      <AppHeader />
      <div className="max-w-2xl w-full">
        <div className="text-sm font-medium mb-1">Lugia</div>
        <div className="text-xs uppercase tracking-wider text-lugia-text-tertiary mb-10">
          Le check-up préventif de votre cabinet
        </div>

        <h1 className="font-serif text-[28px] font-medium leading-snug mb-6">
          En moins de 30 minutes, Lugia vous aide à répondre à la question :{" "}
          <em className="italic text-lugia-accent">
            où en est réellement votre cabinet aujourd&apos;hui ?
          </em>
        </h1>

        <div className="text-base text-lugia-text-secondary leading-relaxed mb-8 space-y-2">
          <p>
            Le check-up transforme vos réponses en une première lecture de
            votre système de travail.
          </p>
          <p>
            Il met en mots ce qui fatigue, ce qui dépend trop de
            l&apos;informel, et les premiers chantiers à mener.
          </p>
          <p>
            Il prépare, si vous le souhaitez, une analyse plus approfondie
            avec Lugia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
          <div className="bg-lugia-bg-card border border-lugia-border rounded-xl p-5">
            <div className="text-xs uppercase tracking-wider font-medium text-lugia-text-secondary mb-2">
              Ce que vous pouvez attendre
            </div>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>Une lecture claire de votre fonctionnement actuel</li>
              <li>Trois chantiers prioritaires</li>
              <li>Une discussion possible avec Lugia ensuite</li>
            </ul>
          </div>
          <div className="bg-lugia-bg-card border border-lugia-border rounded-xl p-5">
            <div className="text-xs uppercase tracking-wider font-medium text-lugia-text-secondary mb-2">
              Vos garde-fous
            </div>
            <ul className="text-sm space-y-1 list-disc pl-5">
              <li>Aucune donnée patient identifiable saisie</li>
              <li>Aucun diagnostic médical produit</li>
              <li>Vos réponses restent confidentielles</li>
            </ul>
          </div>
        </div>

        <div className="pt-2">
          {isLoadingActive ? (
            <div className="text-sm text-lugia-text-tertiary">
              Chargement...
            </div>
          ) : activeInterview ? (
            <>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleResume}
                  disabled={isWorking}
                  className="bg-lugia-text text-white px-6 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reprendre votre check-up →
                </button>
                <button
                  onClick={handleStartNew}
                  disabled={isWorking}
                  className="bg-lugia-bg-card border border-lugia-border text-lugia-text px-6 py-3 rounded-lg font-medium text-sm hover:border-lugia-text-tertiary transition disabled:opacity-50"
                >
                  {isWorking ? "Création..." : "Commencer un nouveau check-up"}
                </button>
              </div>
              <div className="text-sm text-lugia-text-tertiary mt-3">
                Une session est en cours (commencée le{" "}
                {formatDate(activeInterview.created_at)}, question{" "}
                {activeInterview.current_question_index + 1} sur 14).
              </div>
            </>
          ) : (
            <>
              <button
                onClick={handleStartNew}
                disabled={isWorking}
                className="bg-lugia-text text-white px-6 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isWorking ? "Création..." : "Commencer le check-up →"}
              </button>
              <div className="text-sm text-lugia-text-tertiary mt-3">
                Moins de 30 minutes — vous pouvez interrompre et reprendre à
                tout moment.
              </div>
            </>
          )}

          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
