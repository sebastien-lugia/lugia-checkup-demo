"use client";

/**
 * V2.0 — Parcours complet du check-up V2.0 (cf D-029, D-030).
 *
 * Machine à états (cf web/lib/v2/state.ts) :
 *   intro → profil_step1 → profil_step2 → energy
 *         → bloc_A → transition_A
 *         → bloc_B → transition_B
 *         → bloc_C → resultats
 *
 * Backend consumé :
 *   - GET  /protocol?version=v2.0          (au démarrage)
 *   - GET  /me/profile                      (lecture profil)
 *   - PATCH /me/profile                     (étape 1 / étape 2)
 *   - POST /interviews {protocol_version:'v2.0'} (création interview)
 *   - PUT  /interviews/{iid}/answers/{qid}  (chaque réponse)
 *   - GET  /interviews/{iid}/scores         (après chaque bloc — radar)
 *   - POST /interviews/{iid}/complete       (fin de parcours)
 *   - GET  /interviews/{iid}/report         (page résultats)
 */

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  completeInterview,
  createInterviewV2,
  getMyProfile,
  getProtocolV2,
  getScoresV2,
  getVisibleQuestions,
  listAnswers,
  patchMyProfileV2,
  saveAnswer,
  type Answer,
  type ProtocolV2,
  type UserProfile,
  type UserProfilePatch,
  type V2Scores,
} from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import {
  isBlockComplete,
  isEnergyAnswered,
  isProfileStep1Complete,
  isProfileStep2Complete,
  resumeStep,
  stepChapter,
  type V2Step,
} from "@/lib/v2/state";

import { AppHeader } from "@/components/AppHeader";
import { IntroV2 } from "@/components/v2/IntroV2";
import { ProfilStep1 } from "@/components/v2/ProfilStep1";
import { ProfilStep2 } from "@/components/v2/ProfilStep2";
import { Energie } from "@/components/v2/Energie";
import { BlocQuestion } from "@/components/v2/BlocQuestion";
import { BlockTransition } from "@/components/v2/BlockTransition";
import { RadarAside, RadarTopbar } from "@/components/v2/RadarAside";

type StoredAnswers = Record<string, Answer>;

function CheckupV2Content() {
  useRequireAuth();
  const router = useRouter();

  const [protocol, setProtocol] = useState<ProtocolV2 | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [interviewId, setInterviewId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<StoredAnswers>({});
  const [scores, setScores] = useState<V2Scores | null>(null);
  const [step, setStep] = useState<V2Step>("intro");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---- Bootstrap initial ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [proto, prof] = await Promise.all([
          getProtocolV2(),
          getMyProfile(),
        ]);
        if (cancelled) return;
        setProtocol(proto);
        setProfile(prof);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- Saisie profil étape 1 ----
  const handleProfileStep1 = useCallback(
    async (patch: UserProfilePatch) => {
      setSaving(true);
      try {
        const updated = await patchMyProfileV2(patch);
        setProfile(updated);
        setStep("profil_step2");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // ---- Saisie profil étape 2 — créé aussi l'interview V2 ----
  const handleProfileStep2 = useCallback(
    async (patch: UserProfilePatch) => {
      setSaving(true);
      try {
        const updated = await patchMyProfileV2(patch);
        setProfile(updated);
        // Crée l'interview V2.0 si pas encore fait
        if (interviewId === null) {
          const created = await createInterviewV2();
          setInterviewId(created.interview_id);
        }
        setStep("energy");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setSaving(false);
      }
    },
    [interviewId]
  );

  const handleProfileBack = useCallback(() => {
    setStep("profil_step1");
  }, []);

  // ---- Énergie (non scorée) ----
  const handleEnergy = useCallback(
    async (optionId: string, label: string) => {
      if (!interviewId) return;
      setSaving(true);
      try {
        const ans: Answer = {
          mode: "A",
          selected_option: optionId,
          selected_option_label: label,
          free_text: null,
          complement_text: null,
          entity_name: null,
          scored: false,
        };
        await saveAnswer(interviewId, "energy", ans);
        setAnswers((prev) => ({ ...prev, energy: ans }));
        setStep("bloc_A");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setSaving(false);
      }
    },
    [interviewId]
  );

  // ---- Réponse d'une question d'un bloc ----
  const handleAnswer = useCallback(
    async (questionId: string, answer: Answer) => {
      if (!interviewId) throw new Error("interviewId non initialisé");
      await saveAnswer(interviewId, questionId, answer);
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));
      // Refresh des scores en arrière-plan pour le radar
      try {
        const s = await getScoresV2(interviewId);
        setScores(s);
      } catch {
        /* radar restera figé, pas bloquant */
      }
    },
    [interviewId]
  );

  // ---- Bloc complet → transition ----
  // Note : `blockA/B/C` sont calculés plus bas, après les early returns —
  // pour ne pas évaluer `protocol.blocks.find(...)` quand `protocol` est
  // encore null (état initial avant que le bootstrap ait résolu).
  const handleBlockComplete = useCallback(
    async (block: "A" | "B" | "C") => {
      // Rafraîchit les scores avant la transition
      if (interviewId) {
        try {
          const s = await getScoresV2(interviewId);
          setScores(s);
        } catch {
          /* silencieux */
        }
      }
      if (block === "A") setStep("transition_A");
      else if (block === "B") setStep("transition_B");
      else {
        // Fin du parcours
        if (interviewId) {
          try {
            await completeInterview(interviewId);
          } catch {
            /* on continue quand même vers les résultats */
          }
          router.push(`/resultats/v2?id=${interviewId}`);
        }
      }
    },
    [interviewId, router]
  );

  // ---- Reprise éventuelle (resumeStep) ----
  const answeredIds = useMemo(() => new Set(Object.keys(answers)), [answers]);
  useEffect(() => {
    if (loading || !profile) return;
    if (step !== "intro") return; // déjà avancé
    // Si le profil est complet, on saute l'intro
    if (
      isProfileStep1Complete(profile) &&
      isProfileStep2Complete(profile) &&
      interviewId !== null
    ) {
      setStep(resumeStep(profile, scores, answeredIds));
    }
  }, [loading, profile, step, interviewId, scores, answeredIds]);

  // ---- Rendering ----

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f5]">
        <AppHeader />
        <div className="max-w-[680px] mx-auto px-8 py-20 text-[#888780]">
          Chargement…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#faf9f5]">
        <AppHeader />
        <div className="max-w-[680px] mx-auto px-8 py-20">
          <h1 className="font-serif text-[28px] text-[#a85d2b] mb-4">
            Une erreur est survenue
          </h1>
          <pre className="text-[13px] text-[#444] bg-[#fbeae0] border border-[#a85d2b] rounded p-4 overflow-auto">
            {error}
          </pre>
        </div>
      </div>
    );
  }

  if (!protocol || !profile) return null;

  // Garde-fou : si le backend a renvoyé la V1.1.9 au lieu de la V2.0
  // (typiquement parce que l'instance backend n'a pas rechargé après
  // T4a — `uvicorn --reload` est inconstant sur les imports top-level),
  // `protocol.blocks` est undefined et le rendu crash. On affiche un
  // message d'erreur explicite et actionnable plutôt qu'un TypeError.
  if (!Array.isArray((protocol as ProtocolV2).blocks)) {
    return (
      <div className="min-h-screen bg-[#faf9f5]">
        <AppHeader />
        <div className="max-w-[720px] mx-auto px-8 py-16">
          <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#a85d2b] mb-4">
            Backend désynchronisé
          </div>
          <h1 className="font-serif text-[28px] text-[#111] mb-4">
            Le backend ne sert pas le protocole V2.0
          </h1>
          <p className="text-[14px] leading-[1.6] text-[#444] mb-4">
            La réponse de <code className="bg-[#f5f4ef] px-1.5 py-0.5 rounded">GET /protocol?version=v2.0</code>{" "}
            n&apos;a pas la forme attendue (champ <code className="bg-[#f5f4ef] px-1.5 py-0.5 rounded">blocks</code> manquant).
            Le backend tourne probablement avec une version antérieure à T4a
            — <code className="bg-[#f5f4ef] px-1.5 py-0.5 rounded">uvicorn --reload</code>{" "}
            ne recharge pas toujours les imports top-level de manière fiable.
          </p>
          <p className="text-[14px] leading-[1.6] text-[#444] mb-3">
            <strong>Solution</strong> : tuez le processus uvicorn (CTRL+C dans son terminal)
            et relancez-le. Une fois redémarré, rafraîchissez cette page.
          </p>
          <pre className="text-[12px] text-[#111] bg-[#fbf9f1] border border-[#d4cfbf] rounded-md p-4 overflow-auto">
{`cd ~/Documents/Pro/lugia-mac/lugia-claude/lugia-checkup-demo
source .venv/bin/activate
uvicorn backend.main:app --reload --port 8000`}
          </pre>
        </div>
      </div>
    );
  }

  // À ce point, `protocol.blocks` est garanti — pas de risque d'évaluer
  // `.find(...)` sur undefined.
  const blockA = protocol.blocks.find((b) => b.id === "A") ?? null;
  const blockB = protocol.blocks.find((b) => b.id === "B") ?? null;
  const blockC = protocol.blocks.find((b) => b.id === "C") ?? null;

  const chapter = stepChapter(step);
  const isInBlock =
    step === "bloc_A" || step === "bloc_B" || step === "bloc_C";

  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <AppHeader />

      {/* Barre de progression chapitres */}
      {step !== "intro" && step !== "resultats" && (
        <div className="border-b border-[#e8e3d3]">
          <div className="max-w-[680px] mx-auto px-6 py-3 flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#888780]">
              {chapter.number}/{chapter.total}
            </span>
            <span className="text-[13px] text-[#444]">{chapter.label}</span>
          </div>
          {/* Mini-radar topbar — uniquement quand l'aside est masquée */}
          {isInBlock && <RadarTopbar scores={scores} />}
        </div>
      )}

      <div className={isInBlock ? "xl:flex xl:gap-8 max-w-[1080px] mx-auto" : ""}>
        <div className={isInBlock ? "flex-1" : ""}>
          {step === "intro" && (
            <IntroV2 onStart={() => setStep("profil_step1")} />
          )}
          {step === "profil_step1" && (
            <ProfilStep1
              step={protocol.profile.step1}
              profile={profile}
              onSubmit={handleProfileStep1}
              saving={saving}
            />
          )}
          {step === "profil_step2" && (
            <ProfilStep2
              step={protocol.profile.step2}
              profile={profile}
              onSubmit={handleProfileStep2}
              onBack={handleProfileBack}
              saving={saving}
            />
          )}
          {step === "energy" && (
            <Energie
              question={protocol.energy}
              initialValue={answers.energy?.selected_option}
              onSubmit={handleEnergy}
              saving={saving}
            />
          )}
          {step === "bloc_A" && blockA && (
            <main className="max-w-[680px] mx-auto px-8 py-10">
              <SectionHeader axisLabel="Parcours patient" />
              <BlocQuestion
                block={blockA}
                profile={profile}
                initialAnswers={answers}
                onAnswer={handleAnswer}
                onComplete={() => handleBlockComplete("A")}
                saving={saving}
              />
            </main>
          )}
          {step === "transition_A" && (
            <BlockTransition
              completedBlock="A"
              scores={scores}
              nextBlockLabel="Bloc 2 — Équipe & secrétariat"
              onContinue={() => setStep("bloc_B")}
            />
          )}
          {step === "bloc_B" && blockB && (
            <main className="max-w-[680px] mx-auto px-8 py-10">
              <SectionHeader axisLabel="Équipe & secrétariat" />
              <BlocQuestion
                block={blockB}
                profile={profile}
                initialAnswers={answers}
                onAnswer={handleAnswer}
                onComplete={() => handleBlockComplete("B")}
                saving={saving}
              />
            </main>
          )}
          {step === "transition_B" && (
            <BlockTransition
              completedBlock="B"
              scores={scores}
              nextBlockLabel="Bloc 3 — Outils & dossiers"
              onContinue={() => setStep("bloc_C")}
            />
          )}
          {step === "bloc_C" && blockC && (
            <main className="max-w-[680px] mx-auto px-8 py-10">
              <SectionHeader axisLabel="Outils & dossiers" />
              <BlocQuestion
                block={blockC}
                profile={profile}
                initialAnswers={answers}
                onAnswer={handleAnswer}
                onComplete={() => handleBlockComplete("C")}
                saving={saving}
              />
            </main>
          )}
        </div>

        {/* Radar aside — visible dans les blocs uniquement, ≥ 1080px */}
        {isInBlock && (
          <div className="hidden xl:block">
            <RadarAside scores={scores} />
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ axisLabel }: { axisLabel: string }) {
  return (
    <div className="mb-10">
      <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#888780] mb-3">
        Bloc en cours
      </div>
      <h1 className="font-serif text-[32px] sm:text-[40px] font-medium leading-[1.15] tracking-[-0.015em] text-[#111]">
        {axisLabel}
      </h1>
    </div>
  );
}

export default function CheckupV2Page() {
  return (
    <Suspense fallback={null}>
      <CheckupV2Content />
    </Suspense>
  );
}
