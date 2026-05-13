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
};

function CheckupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewIdParam = searchParams.get("interview");
  const interviewId = interviewIdParam ? parseInt(interviewIdParam, 10) : null;

  const [protocol, setProtocol] = useState<Protocol | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [answer, setAnswer] = useState<AnswerState>(EMPTY_ANSWER);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Chargement initial du protocole et de l'état de l'interview
  useEffect(() => {
    if (!interviewId) {
      setError("Aucune session active. Retournez à l'accueil.");
      return;
    }
    (async () => {
      try {
        const [protocolData, interview] = await Promise.all([
          getProtocol(),
          getInterview(interviewId),
        ]);
        setProtocol(protocolData);
        setCurrentIndex(interview.current_question_index);
      } catch (e) {
        setError(
          "Impossible de charger l'interview. Vérifiez que l'API est accessible."
        );
      }
    })();
  }, [interviewId]);

  // Préremplissage de la réponse à chaque changement de question
  useEffect(() => {
    if (!interviewId || !protocol || currentIndex === null) return;
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
          });
        } else {
          setAnswer(EMPTY_ANSWER);
        }
      } catch {
        setAnswer(EMPTY_ANSWER);
      }
    })();
  }, [interviewId, protocol, currentIndex]);

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

  const handleNext = useCallback(async () => {
    if (
      !interviewId ||
      !protocol ||
      currentIndex === null
    )
      return;
    const question = protocol.questions[currentIndex];
    if (!question) return;
    if (!isAnswerComplete(question.mode, answer)) return;

    setIsSaving(true);
    try {
      await persistAnswer(question.id, question.mode, answer);
      const newIndex = currentIndex + 1;
      await updateCursor(interviewId, newIndex);
      if (newIndex >= protocol.questions.length) {
        await completeInterview(interviewId);
        router.push(`/resultats?interview=${interviewId}`);
        return;
      }
      setCurrentIndex(newIndex);
    } catch (e) {
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
    router,
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
      setCurrentIndex(newIndex);
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
      // best effort, on quitte malgré l'erreur
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

  // États d'erreur ou de chargement
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

  if (!protocol || currentIndex === null) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="text-sm text-lugia-text-tertiary">Chargement...</div>
      </main>
    );
  }

  const totalQuestions = protocol.questions.length;
  const isCompleted = currentIndex >= totalQuestions;

  // Écran de fin "Merci"
  if (isCompleted) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-2xl w-full">
          <div className="text-sm font-medium mb-1">Lugia</div>
          <div className="text-xs uppercase tracking-wider text-lugia-text-tertiary mb-8">
            Check-up préventif
          </div>
          <h1 className="font-serif text-[28px] font-medium mb-6">Merci.</h1>
          <p className="text-base text-lugia-text-secondary leading-relaxed mb-8">
            Vos {totalQuestions} réponses sont enregistrées. La page de
            résultats vous propose une première lecture de votre cabinet.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/resultats?interview=${interviewId}`)}
              className="bg-lugia-text text-white px-6 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition"
            >
              Voir les résultats
            </button>
            <button
              onClick={() => router.push("/")}
              className="bg-lugia-bg-card border border-lugia-border text-lugia-text px-6 py-3 rounded-lg font-medium text-sm hover:border-lugia-text-tertiary transition"
            >
              Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </main>
    );
  }

  const question = protocol.questions[currentIndex];
  const facetLabel = protocol.facet_labels[question.facet] || question.facet;
  const progressPct = (currentIndex / totalQuestions) * 100;
  const isLast = currentIndex + 1 >= totalQuestions;
  const canSubmit = isAnswerComplete(question.mode, answer);

  return (
    <main className="min-h-screen px-6 py-12">
      <div className="max-w-2xl mx-auto">
        <div className="text-sm font-medium mb-1">Lugia</div>
        <div className="text-xs uppercase tracking-wider text-lugia-text-tertiary mb-4">
          Check-up préventif
        </div>

        {/* Progress bar */}
        <div className="h-[3px] bg-lugia-bg-soft rounded-full overflow-hidden mb-2">
          <div
            className="h-full bg-lugia-text transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="text-xs text-lugia-text-tertiary mb-4">
          Question {currentIndex + 1} sur {totalQuestions}
        </div>

        {/* Facet pill */}
        <div className="inline-block text-xs font-medium uppercase tracking-wider text-lugia-accent bg-lugia-accent-soft px-3 py-1 rounded-full mb-6">
          {facetLabel}
        </div>

        {/* Mode-specific widget */}
        {question.mode === "A" && (
          <ModeAWidget
            question={question}
            answer={answer}
            onChange={handleAnswerChange}
          />
        )}
        {question.mode === "B" && (
          <ModeBWidget
            question={question}
            answer={answer}
            onChange={handleAnswerChange}
          />
        )}
        {question.mode === "C" && (
          <ModeCWidget
            question={question}
            answer={answer}
            onChange={handleAnswerChange}
          />
        )}

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 mt-8">
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              disabled={isSaving}
              className="bg-lugia-bg-card border border-lugia-border text-lugia-text px-5 py-2.5 rounded-lg text-sm font-medium hover:border-lugia-text-tertiary transition disabled:opacity-50"
            >
              ← Précédent
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canSubmit || isSaving}
            className="bg-lugia-text text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "..." : isLast ? "Terminer le check-up" : "Suivant"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={handleQuit}
            className="text-sm text-lugia-text-tertiary hover:text-lugia-text-secondary underline underline-offset-2"
          >
            Quitter et reprendre plus tard
          </button>
        </div>
      </div>
    </main>
  );
}

export default function CheckupPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-sm text-lugia-text-tertiary">Chargement...</div>
        </main>
      }
    >
      <CheckupContent />
    </Suspense>
  );
}
