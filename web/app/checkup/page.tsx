"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import {
  completeInterview,
  getInterview,
  getProtocol,
  listAnswers,
  saveAnswer,
  updateCursor,
  type Protocol,
} from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { CheckupHeader } from "@/components/CheckupHeader";
import { CheckupIntro } from "@/components/CheckupIntro";
import { CheckupProgress } from "@/components/CheckupProgress";
// V1.1.9 — la phase "transition" (carton entre facettes) a été retirée
// sur retour utilisateur (perturbation du rythme). Le composant
// `CheckupTransition` reste disponible si on veut le rebrancher plus tard.
import {
  isAnswerComplete,
  ModeAWidget,
  ModeBWidget,
  ModeCWidget,
  type AnswerState,
} from "@/components/CheckupWidgets";

const EMPTY_ANSWER: AnswerState = {
  selected_option: null,
  selected_option_label: null,
  free_text: null,
  complement_text: null,
  entity_name: null,
};

type Phase = "intro" | "question" | "completed";

/* ============================================================================
 * V1.1.9 — Refonte UI questionnaire
 *
 * Orchestration :
 *   - phase "intro"      : écran d'intro (uniquement si currentIndex=0 ET
 *                          aucune réponse enregistrée — sinon on reprend
 *                          directement à la question en cours)
 *   - phase "question"   : écran d'une question (Mode A/B/C)
 *   - phase "completed"  : écran de fin "Merci pour vos réponses."
 *
 * La phase intermédiaire "transition" (carton entre 2 facettes) a été
 * retirée sur retour utilisateur — perçue comme perturbante dans le
 * déroulé. Le composant CheckupTransition reste disponible si on veut
 * le rebrancher plus tard.
 *
 * Sauvegarde silencieuse + pastille "Enregistré" 1.5s après chaque Suivant.
 * Raccourci clavier Entrée pour valider quand la réponse est complète.
 * ========================================================================== */

function CheckupContent() {
  const router = useRouter();
  const isAuthReady = useRequireAuth();
  const searchParams = useSearchParams();
  const interviewIdParam = searchParams.get("interview");
  const interviewId = interviewIdParam ? parseInt(interviewIdParam, 10) : null;

  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [answer, setAnswer] = useState<AnswerState>(EMPTY_ANSWER);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [savedPillKey, setSavedPillKey] = useState<number | null>(null);

  // Chargement initial : protocole, état de l'interview, réponses
  useEffect(() => {
    if (!isAuthReady) return;
    if (!interviewId) {
      setError("Aucune session active. Retournez à l'accueil.");
      return;
    }
    (async () => {
      try {
        const [protocolData, interview, answers] = await Promise.all([
          getProtocol(),
          getInterview(interviewId),
          listAnswers(interviewId),
        ]);
        setProtocol(protocolData);
        setCurrentIndex(interview.current_question_index);

        // Choix de la phase initiale
        if (interview.current_question_index >= protocolData.questions.length) {
          setPhase("completed");
        } else if (
          interview.current_question_index === 0 &&
          answers.length === 0
        ) {
          // Vraie première fois — afficher l'intro
          setPhase("intro");
        } else {
          // Reprise — sauter l'intro et aller directement à la question.
          setPhase("question");
        }
      } catch {
        setError(
          "Impossible de charger l'interview. Vérifiez que l'API est accessible."
        );
      }
    })();
  }, [isAuthReady, interviewId]);

  // Préremplissage de la réponse à chaque changement de question
  useEffect(() => {
    if (!isAuthReady) return;
    if (!interviewId || !protocol || currentIndex === null) return;
    if (phase !== "question") return;
    const question = protocol.questions[currentIndex];
    if (!question) return;

    (async () => {
      try {
        const answers = await listAnswers(interviewId);
        const existing = answers.find((a) => a.question_id === question.id);
        if (existing) {
          setAnswer({
            selected_option: existing.selected_option,
            selected_option_label: existing.selected_option_label,
            free_text: existing.free_text,
            complement_text: existing.complement_text,
            entity_name: existing.entity_name ?? null,
          });
        } else {
          setAnswer(EMPTY_ANSWER);
        }
      } catch {
        setAnswer(EMPTY_ANSWER);
      }
    })();
  }, [isAuthReady, interviewId, protocol, currentIndex, phase]);

  const handleAnswerChange = useCallback(
    (partial: Partial<AnswerState>) => {
      setAnswer((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const persistAnswer = useCallback(
    async (questionId: string, mode: string, current: AnswerState) => {
      if (!interviewId) return;
      await saveAnswer(interviewId, questionId, {
        mode,
        selected_option: current.selected_option,
        selected_option_label: current.selected_option_label,
        free_text: current.free_text,
        complement_text: current.complement_text,
        entity_name: current.entity_name,
      });
    },
    [interviewId]
  );

  const hasSomethingToSave = useCallback(
    (current: AnswerState): boolean => {
      return Boolean(
        current.selected_option ||
          current.free_text?.trim() ||
          current.complement_text?.trim()
      );
    },
    []
  );

  // Avance vers la question suivante (ou bascule en phase completed si fin
  // du parcours). La phase intermédiaire "transition" a été retirée en V1.1.9.
  const advanceTo = useCallback(
    (newIndex: number) => {
      if (!protocol) return;
      if (newIndex >= protocol.questions.length) {
        setPhase("completed");
        setCurrentIndex(newIndex);
        return;
      }
      setCurrentIndex(newIndex);
      setPhase("question");
    },
    [protocol]
  );

  const handleNext = useCallback(async () => {
    if (!interviewId || !protocol || currentIndex === null) return;
    const question = protocol.questions[currentIndex];
    if (!question) return;
    if (!isAnswerComplete(question.mode, answer)) return;

    setIsSaving(true);
    try {
      await persistAnswer(question.id, question.mode, answer);
      // Pastille "Enregistré"
      setSavedPillKey(Date.now());

      const newIndex = currentIndex + 1;
      await updateCursor(interviewId, newIndex);
      if (newIndex >= protocol.questions.length) {
        await completeInterview(interviewId);
        setCurrentIndex(newIndex);
        setPhase("completed");
        return;
      }
      advanceTo(newIndex);
    } catch {
      setError("Impossible d'enregistrer votre réponse. Réessayez.");
    } finally {
      setIsSaving(false);
    }
  }, [
    interviewId,
    protocol,
    currentIndex,
    answer,
    persistAnswer,
    advanceTo,
  ]);

  const handlePrev = useCallback(async () => {
    if (!interviewId || !protocol || currentIndex === null) return;
    if (currentIndex === 0) return;
    const question = protocol.questions[currentIndex];

    setIsSaving(true);
    try {
      if (question && hasSomethingToSave(answer)) {
        await persistAnswer(question.id, question.mode, answer);
      }
      const newIndex = currentIndex - 1;
      await updateCursor(interviewId, newIndex);
      // Pas de transition au retour en arrière (on ne casse pas le rythme)
      setCurrentIndex(newIndex);
      setPhase("question");
    } catch {
      setError("Impossible de revenir en arrière. Réessayez.");
    } finally {
      setIsSaving(false);
    }
  }, [interviewId, protocol, currentIndex, answer, persistAnswer, hasSomethingToSave]);

  const handleQuit = useCallback(async () => {
    if (!interviewId || !protocol || currentIndex === null) {
      router.push("/");
      return;
    }
    const question = protocol.questions[currentIndex];
    try {
      if (question && hasSomethingToSave(answer)) {
        await persistAnswer(question.id, question.mode, answer);
      }
    } catch {
      // best-effort : on quitte malgré l'erreur
    }
    router.push("/");
  }, [
    interviewId,
    protocol,
    currentIndex,
    answer,
    persistAnswer,
    hasSomethingToSave,
    router,
  ]);

  // Start depuis l'intro → bascule direct sur la première question.
  const handleIntroStart = useCallback(() => {
    if (!protocol || currentIndex === null) return;
    advanceTo(currentIndex);
  }, [protocol, currentIndex, advanceTo]);

  // Raccourci clavier global : Entrée valide la question si elle est complète
  // (uniquement en phase "question" et pas pendant la saisie d'un textarea).
  useEffect(() => {
    if (phase !== "question") return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Enter") return;
      const target = e.target as HTMLElement | null;
      // On évite de déclencher si l'utilisateur est en train de saisir
      // dans un textarea (il veut faire un retour à la ligne) ou si un
      // input texte est focus.
      if (
        target &&
        (target.tagName === "TEXTAREA" ||
          (target.tagName === "INPUT" && (target as HTMLInputElement).type === "text"))
      ) {
        return;
      }
      e.preventDefault();
      handleNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, handleNext]);

  // ===== Rendu =====

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
        <CheckupHeader rightLabel="Retour à l'accueil" />
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

  if (!protocol || currentIndex === null) {
    return (
      <main className="min-h-screen flex flex-col">
        <CheckupHeader rightLabel="Retour à l'accueil" />
        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="text-sm text-lugia-text-tertiary">Chargement…</div>
        </div>
      </main>
    );
  }

  const totalQuestions = protocol.questions.length;

  // Phase Intro
  if (phase === "intro") {
    return (
      <main className="min-h-screen flex flex-col">
        <CheckupHeader rightLabel="Retour à l'accueil" />
        <CheckupIntro
          totalQuestions={totalQuestions}
          onStart={handleIntroStart}
        />
      </main>
    );
  }

  // Phase Completed
  if (phase === "completed") {
    return (
      <main className="min-h-screen flex flex-col">
        <CheckupHeader rightLabel="Retour à l'accueil" />
        <div className="flex-1 max-w-[680px] w-full mx-auto px-8 py-20">
          <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#888780] mb-6">
            Check-up terminé
          </div>
          <h1 className="font-serif text-[38px] font-medium leading-[1.2] tracking-[-0.015em] text-[#111] mb-6">
            Merci pour vos réponses.
          </h1>
          <p className="text-[16px] leading-[1.65] text-[#595959] max-w-[580px] mb-10">
            {`Vos ${totalQuestions} réponses sont enregistrées. Le rapport reprend votre situation, met en regard trois angles d’analyse — parcours patient, équipe et secrétariat, outils et dossiers — et propose trois opportunités d’action concrètes. Bonne lecture.`}
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => router.push(`/resultats?interview=${interviewId}`)}
              className="bg-lugia-text text-white px-7 py-3.5 rounded-lg text-[15px] font-medium hover:opacity-90 transition"
            >
              Voir mon check-up →
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="bg-white border border-lugia-border text-[#111] px-6 py-3 rounded-lg text-[14px] font-medium hover:border-[#888780] transition"
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Phase Question
  const question = protocol.questions[currentIndex];
  const canSubmit = isAnswerComplete(question.mode, answer);
  const isLast = currentIndex + 1 >= totalQuestions;

  return (
    <main className="min-h-screen flex flex-col">
      <CheckupHeader onRight={handleQuit} />
      <div className="max-w-[680px] mx-auto w-full px-8 pt-8 pb-20">
        <div className="mb-9">
          <CheckupProgress protocol={protocol} currentIndex={currentIndex} />
        </div>

        {question.mode === "A" && (
          <ModeAWidget
            key={question.id}
            question={question}
            answer={answer}
            onChange={handleAnswerChange}
          />
        )}
        {question.mode === "B" && (
          <ModeBWidget
            key={question.id}
            question={question}
            answer={answer}
            onChange={handleAnswerChange}
          />
        )}
        {question.mode === "C" && (
          <ModeCWidget
            key={question.id}
            question={question}
            answer={answer}
            onChange={handleAnswerChange}
          />
        )}

        {/* Boutons */}
        <div className="mt-10 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0 || isSaving}
            className={`text-[13px] py-1.5 px-2 text-[#888780] hover:text-[#595959] transition-colors ${
              currentIndex === 0 ? "invisible" : ""
            }`}
          >
            ← Précédent
          </button>
          <div className="flex items-center gap-3.5">
            <span className="hidden sm:inline text-[12px] text-[#888780]">
              ⏎ pour valider
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canSubmit || isSaving}
              className="bg-lugia-text text-white px-7 py-3 rounded-lg text-[14px] font-medium hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSaving ? "…" : isLast ? "Terminer le check-up →" : "Suivant →"}
            </button>
          </div>
        </div>
      </div>

      {/* Pastille "Enregistré" — re-créée à chaque clic Suivant pour rejouer l'animation */}
      {savedPillKey !== null && (
        <div key={savedPillKey} className="lugia-saved-pill">
          Enregistré
        </div>
      )}
    </main>
  );
}

export default function CheckupPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-sm text-lugia-text-tertiary">Chargement…</div>
        </main>
      }
    >
      <CheckupContent />
    </Suspense>
  );
}
