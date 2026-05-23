"use client";

// Désactive le prerender statique de Next : la page dépend de useSearchParams
// (interview_id, step, view), de l'auth user et du profil cabinet — pas
// d'intérêt à pré-générer une page vide.
export const dynamic = "force-dynamic";

/**
 * V3-brand — orchestration interactive complète du parcours.
 *
 * State machine V3 branchée sur tous les composants livrés (T-V3-1 à T-V3-8).
 * Parcours bout-en-bout :
 *   intro → profil_step1 → profil_step2 → energy → bloc_A → transition_A →
 *   bloc_B → transition_B → bloc_C → transition_C → resultats → [module]
 *
 * State local React, pas de backend pour l'instant (T-V3-11 le branchera).
 * Scoring calculé localement depuis les options du `protocol_data.ts`.
 *
 * V3-brand-T-V3-10.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { paletteFor, type V3Theme, levelOf, LEVELS } from "@/lib/v3/tokens";
import { type V3Step, nextStep, prevStep, resumeStep } from "@/lib/v3/state";
import { getBloc, filterQuestionsByRouting } from "@/lib/v3/protocol_data";
import type { Answer, UserProfile, V2Scores } from "@/lib/api";
import {
  createInterviewV3,
  getMyProfile,
  patchMyProfileV2,
  listAnswers,
  saveAnswer,
  downloadChantierPdf,
  completeInterview,
} from "@/lib/api";

import { Topbar } from "@/components/v3/Topbar";
import { ThemeToggleV3 } from "@/components/v3/ThemeToggleV3";
import { IntroHeaderShortcuts } from "@/components/v3/IntroHeaderShortcuts";
import {
  ENERGY_FIELD,
  IntroV3,
  ProfilStep1V3,
  ProfilStep2V3,
  EnergyV3,
} from "@/components/v3/screens";
import { BlocV3, BlockTransitionV3 } from "@/components/v3/screens_blocs";
import { RadarLiveV3 } from "@/components/v3/RadarLiveV3";
import { ResultatsV3, type V3Opp } from "@/components/v3/ResultatsV3";
import { ModuleV3 } from "@/components/v3/ModuleV3";
import { ChatChantierModal } from "@/components/v3/ChatChantierModal";
import { getModule } from "@/lib/v3/modules_data";
import { pickSignal, buildPhraseChoc, type MotivationId, type StatusId, type EnergyId } from "@/lib/v3/signals_data";
import { type VolumeId } from "@/lib/v3/opps_catalog";
import { getAxisDetail } from "@/lib/v3/axis_details_data";
import {
  pickOppsFromScores,
  getOpp,
} from "@/lib/v3/opps_catalog";
import { ListChantiersV3 } from "@/components/v3/ListChantiersV3";
import { TypingDots } from "@/components/v3/atoms";
import { openCalendly } from "@/lib/v3/links";

/* ───────────────────────────────────────────────────────────
 * Helpers scoring local
 *
 * On calcule des scores numériques par axe (0-100) depuis les options
 * du protocol_data. Pour Topbar / progressIndex (qui consomment V2Scores),
 * on construit un V2Scores avec A/B/C=null mais completeness rempli — ça
 * suffit pour la logique de progression.
 * ─────────────────────────────────────────────────────────── */

type LocalScores = {
  A: number; B: number; C: number;
  completeness: { A: number; B: number; C: number };
};

function buildLocalScores(
  answers: Record<string, string>,
  cabinetType?: string,
  secretariat?: string,
  paramedicalTeam?: string,
): LocalScores {
  const blocks: Array<"A" | "B" | "C"> = ["A", "B", "C"];
  const out = { A: 0, B: 0, C: 0, completeness: { A: 0, B: 0, C: 0 } } as LocalScores;
  for (const blockId of blocks) {
    const bloc = getBloc(blockId);
    // Routing : on ne compte que les questions effectivement présentées au
    // médecin (cf filterQuestionsByRouting). Sans ce filtre, completeness ne
    // pourrait jamais atteindre 1 pour les profils filtrés (solo / non-solo),
    // ce qui casserait la barre Topbar, le radar live, et les transitions.
    const visible = filterQuestionsByRouting(
      bloc.questions,
      cabinetType,
      secretariat,
      paramedicalTeam,
    );
    const answered = visible.filter((q) => answers[q.id]);
    out.completeness[blockId] = visible.length === 0 ? 0 : answered.length / visible.length;
    if (answered.length === 0) continue;
    const sumScore = answered.reduce((sum, q) => {
      const opt = q.options.find((o) => o.id === answers[q.id]);
      return sum + (opt?.score ?? 0);
    }, 0);
    const avg = sumScore / answered.length; // 1..4
    out[blockId] = Math.round(((avg - 1) / 3) * 100); // 0..100
  }
  return out;
}

/** Construit un V2Scores minimal (A/B/C null) avec juste completeness — suffisant
 *  pour la Topbar et progressIndex qui ne lisent que completeness côté lib/v3/state. */
function buildV2ScoresShim(local: LocalScores): V2Scores {
  return {
    A: null,
    B: null,
    C: null,
    global_score: null,
    completeness: local.completeness,
  };
}

/* ───────────────────────────────────────────────────────────
 * Phrase de motivation depuis le profil
 * ─────────────────────────────────────────────────────────── */

function buildMotivPhrase(
  motivation: string | string[] | null,
  status: string | null
): string {
  const motivLabels: Record<string, string> = {
    charge: "pour réduire votre charge actuelle",
    evenement: "pour anticiper un événement à venir",
    risque: "pour sécuriser un risque identifié",
    curiosite: "par curiosité, pour voir où en est l'organisation",
  };
  const statusLabels: Record<string, string> = {
    recent: "à un moment où poser de bonnes bases compte particulièrement.",
    installe: "à un moment où le cabinet a son rythme — c'est le bon moment pour le clarifier.",
    senior: "avec une vue d'ensemble qui mérite d'être outillée.",
  };
  const firstMotiv = Array.isArray(motivation) ? motivation[0] : motivation;
  const motiv = firstMotiv ? motivLabels[firstMotiv] : "pour faire un point sur l'organisation";
  const tail = status && statusLabels[status] ? ", " + statusLabels[status] : ".";
  return `Vous avez démarré ce check-up ${motiv}${tail}`;
}

/* ───────────────────────────────────────────────────────────
 * Opportunités dérivées des scores
 * ─────────────────────────────────────────────────────────── */

/**
 * Reprend les chantiers filtrés depuis opps_catalog et marque la 1ère comme
 * recommandée. Le catalogue brut est dans `lib/v3/opps_catalog.ts`.
 */
function pickOpps(localScores: LocalScores, max: number = 4): V3Opp[] {
  return pickOppsFromScores({ A: localScores.A, B: localScores.B, C: localScores.C }, max).map(
    (o, i) => ({
      id: o.id,
      axis: o.axis,
      title: o.title,
      desc: o.desc,
      effort: o.effort,
      delai: o.delai,
      gainTime: o.gainTime,
      gainEuros: o.gainEuros,
      recommended: i === 0,
    })
  );
}

/* ───────────────────────────────────────────────────────────
 * Composant racine — page V3-brand interactive
 * ─────────────────────────────────────────────────────────── */

export default function CheckupV3BrandPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [interviewId, setInterviewId] = useState<number | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [theme, setTheme] = useState<V3Theme>(() => {
    // Lit la préférence persistée (localStorage) sinon défaut "night".
    // Lazy initializer pour rester SSR-safe (typeof window check).
    if (typeof window === "undefined") return "night";
    try {
      const saved = window.localStorage.getItem("v3-charte-theme");
      if (saved === "day" || saved === "night") return saved;
    } catch {
      // localStorage indisponible (private mode strict, etc.) — défaut night.
    }
    return "night";
  });
  const [step, setStep] = useState<V3Step>("intro");
  const [profile, setProfile] = useState<UserProfile>({
    email: "demo@lugia.fr",
    firstname: "Chateau",
  });
  const [extras, setExtras] = useState<Record<string, string | string[]>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [listChantiersOpen, setListChantiersOpen] = useState(false);
  const [startedAt] = useState(() => Date.now());

  /**
   * Charte B2 — bascule auto vers Mode Jour à l'arrivée sur un écran livrable
   * (résultats, module détail, liste des chantiers). L'utilisateur peut
   * toujours rebasculer en Nuit via le ThemeToggle. La bascule se fait UNE
   * SEULE FOIS, à la transition d'entrée (pas en boucle si l'utilisateur a
   * choisi de rester en Nuit).
   */
  const isLivrable = step === "resultats" || listChantiersOpen || openModuleId !== null;
  const prevIsLivrable = useRef(isLivrable);
  const hydrationSnapped = useRef(false);
  useEffect(() => {
    // E.3 fix : on respecte le thème persisté au refresh.
    // Tant qu'on est en hydratation, on n'auto-switch pas.
    if (isHydrating) return;
    // Premier tick post-hydratation : on "snappe" prev à l'état courant
    // pour empêcher le passage intro→résultats (induit par le bootstrap)
    // d'être interprété comme une vraie navigation utilisateur.
    if (!hydrationSnapped.current) {
      hydrationSnapped.current = true;
      prevIsLivrable.current = isLivrable;
      return;
    }
    // Transition réelle en session — l'utilisateur vient d'entrer dans
    // la zone livrable (charte B2 : auto-bascule Day).
    if (isLivrable && !prevIsLivrable.current) {
      setTheme("day");
    }
    prevIsLivrable.current = isLivrable;
  }, [isLivrable, isHydrating]);

  /**
   * Synchroniser le bg du body avec le paper du theme.
   * Sinon la Footer globale (mt-16, body bg light) laisse apparaitre
   * une bande #faf9f5 sous le main V3 (navy en Nuit, paper en Jour).
   * Restauré au démontage pour ne pas polluer les autres pages.
   */
  // Persistance du thème dans localStorage — refresh préserve la préférence.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem("v3-charte-theme", theme);
    } catch {
      // localStorage indisponible — fail silent.
    }
  }, [theme]);

  useEffect(() => {
    const original = document.body.style.background;
    document.body.style.background = paletteFor(theme).paper;
    return () => {
      document.body.style.background = original;
    };
  }, [theme]);


  const palette = paletteFor(theme);

  // Scroll-top automatique à chaque changement d'étape ou de sub-mode.
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [step, openModuleId, listChantiersOpen]);

  // V3-brand-T-V3-15 — Bootstrap : récupère / crée l'interview, hydrate le state
  // depuis le backend (profil, réponses).
  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      try {
        // 1. Récupère l'interview id depuis la query string, ou en crée une.
        const idStr = searchParams?.get("interview");
        let id = idStr ? parseInt(idStr, 10) : NaN;
        if (!id || isNaN(id)) {
          const created = await createInterviewV3();
          id = created.interview_id;
          // Update URL pour les refresh suivants — pas de history push,
          // un simple replace pour conserver le ?interview=<id>
          if (typeof window !== "undefined") {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set("interview", String(id));
            window.history.replaceState({}, "", newUrl.toString());
          }
        }
        if (cancelled) return;
        setInterviewId(id);

        // 2. Charge le profil utilisateur (pour retrouver les chips déjà saisis).
        const userProfile = await getMyProfile();
        if (cancelled) return;
        setProfile((p) => ({ ...p, ...userProfile }));

        // 2b. Hydrate aussi `extras` à partir du profil : les composants
        // ProfilStep1V3/ProfilStep2V3 lisent leurs valeurs initiales depuis
        // `extras` (et non `profile`). Sans cette hydratation, l'utilisateur
        // qui refresh mi-parcours voit ses chips vides.
        //
        // Les champs multi-select (motivation, horizon) sont persistés côté
        // backend comme une string unique (premier item) — on les restaure
        // en tant que tableau singleton, le médecin pourra recompléter
        // ses sélections multiples s'il le souhaite.
        const MULTI_FIELDS = new Set(["motivation", "horizon", "logiciel_metier", "rdv_canal"]);
        const hydratedExtras: Record<string, string | string[]> = {};
        for (const [k, v] of Object.entries(userProfile)) {
          if (typeof v === "string" && v) {
            hydratedExtras[k] = MULTI_FIELDS.has(k) ? [v] : v;
          }
        }
        setExtras((e) => ({ ...e, ...hydratedExtras }));

        // 3. Charge les réponses persistées pour cette interview.
        // listAnswers retourne un tableau (Answer & { question_id, id })[].
        // On reconstruit un dict question_id → option_id pour notre state local
        // qui ne stocke que l'id de l'option sélectionnée (le label est récupéré
        // depuis le protocol_data au moment de l'affichage).
        const persisted = await listAnswers(id);
        if (cancelled) return;
        const answersMap: Record<string, string> = {};
        for (const a of persisted) {
          if (a.selected_option) {
            answersMap[a.question_id] = a.selected_option;
          }
        }
        setAnswers(answersMap);

        // 4. Reprend l'énergie si elle a été répondue
        if (answersMap.energy) {
          setExtras((e) => ({ ...e, energy: answersMap.energy }));
        }

        // 5. Déterminer le step initial.
        //    Priorité d'évaluation :
        //    - ?view=results       → résultats (compatibilité raccourci home page)
        //    - ?step=transition_X  → transition (validation completeness[X] >= 1)
        //    - ?step=resultats     → résultats
        //    - ?step=module:<id>   → résultats + ouvre le chantier détail
        //    - ?step=list_chantiers → résultats + ouvre la liste complète
        //    - sinon               → resumeStep depuis les données
        const urlStep = searchParams?.get("step");
        const urlView = searchParams?.get("view");

        // Helper : calcule resumeStep depuis les données — utilisé comme fallback.
        const computeResume = (): V3Step => {
          const answeredIds = new Set(Object.keys(answersMap));
          if (answersMap.energy) answeredIds.add("energy");
          const localScoresForResume = buildLocalScores(
            answersMap,
            typeof hydratedExtras.cabinet_type === "string" ? hydratedExtras.cabinet_type : undefined,
            typeof hydratedExtras.secretariat === "string" ? hydratedExtras.secretariat : undefined,
            typeof hydratedExtras.paramedical_team === "string" ? hydratedExtras.paramedical_team : undefined,
          );
          const scoresShimForResume = buildV2ScoresShim(localScoresForResume);
          return resumeStep({ ...userProfile }, scoresShimForResume, answeredIds);
        };

        // Helper : valide que tous les blocs sont complets (préalable à résultats).
        const allBlocsComplete = (): boolean => {
          const ls = buildLocalScores(
            answersMap,
            typeof hydratedExtras.cabinet_type === "string" ? hydratedExtras.cabinet_type : undefined,
            typeof hydratedExtras.secretariat === "string" ? hydratedExtras.secretariat : undefined,
            typeof hydratedExtras.paramedical_team === "string" ? hydratedExtras.paramedical_team : undefined,
          );
          return ls.completeness.A >= 1 && ls.completeness.B >= 1 && ls.completeness.C >= 1;
        };

        if (urlView === "results") {
          setStep("resultats");
        } else if (
          urlStep === "transition_A" ||
          urlStep === "transition_B" ||
          urlStep === "transition_C"
        ) {
          const blocLetter = urlStep.endsWith("_A") ? "A" : urlStep.endsWith("_B") ? "B" : "C";
          const ls = buildLocalScores(
            answersMap,
            typeof hydratedExtras.cabinet_type === "string" ? hydratedExtras.cabinet_type : undefined,
            typeof hydratedExtras.secretariat === "string" ? hydratedExtras.secretariat : undefined,
            typeof hydratedExtras.paramedical_team === "string" ? hydratedExtras.paramedical_team : undefined,
          );
          if (ls.completeness[blocLetter] >= 1) {
            setStep(urlStep as V3Step);
          } else {
            setStep(computeResume());
          }
        } else if (urlStep === "resultats") {
          if (allBlocsComplete()) setStep("resultats");
          else setStep(computeResume());
        } else if (urlStep && urlStep.startsWith("module:")) {
          if (allBlocsComplete()) {
            setStep("resultats");
            setOpenModuleId(urlStep.slice("module:".length));
          } else setStep(computeResume());
        } else if (urlStep === "list_chantiers") {
          if (allBlocsComplete()) {
            setStep("resultats");
            setListChantiersOpen(true);
          } else setStep(computeResume());
        } else {
          setStep(computeResume());
        }

      } catch (err) {
        // Backend KO → on continue en mode local-only (silencieux, mode démo).
        // L'utilisateur peut toujours faire le parcours, juste sans persistance.
        // eslint-disable-next-line no-console
        console.warn("[V3-brand bootstrap] backend indisponible, mode local-only :", err);
      } finally {
        if (!cancelled) setIsHydrating(false);
      }
    }
    bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // E.3 — Sync URL ↔ position : on persiste la position courante dans la
  // query string `?step=…` pour tous les états ambigus que `resumeStep` seul
  // ne saurait pas distinguer (transitions, résultats, module détail, liste
  // complète des chantiers). Les pages profil/bloc/énergie sont déductibles
  // des données via resumeStep et n'ont pas besoin de marqueur URL.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);

    // Détermine la valeur attendue de ?step= selon l'état courant.
    let want: string | null = null;
    if (openModuleId) want = `module:${openModuleId}`;
    else if (listChantiersOpen) want = "list_chantiers";
    else if (step === "resultats") want = "resultats";
    else if (step === "transition_A" || step === "transition_B" || step === "transition_C") want = step;

    const current = url.searchParams.get("step");
    if (want === null) {
      if (current !== null) {
        url.searchParams.delete("step");
        window.history.replaceState({}, "", url.toString());
      }
    } else if (current !== want) {
      url.searchParams.set("step", want);
      window.history.replaceState({}, "", url.toString());
    }
  }, [step, openModuleId, listChantiersOpen]);

  const localScores = useMemo(
    () => buildLocalScores(
      answers,
      typeof extras.cabinet_type === "string" ? extras.cabinet_type : undefined,
      typeof extras.secretariat === "string" ? extras.secretariat : undefined,
      typeof extras.paramedical_team === "string" ? extras.paramedical_team : undefined,
    ),
    [answers, extras.cabinet_type, extras.secretariat, extras.paramedical_team],
  );
  const scoresV2Shim = useMemo(() => buildV2ScoresShim(localScores), [localScores]);

  // answeredQuestionIds dérivé : énergie + ids des questions répondues
  const answeredQuestionIds = useMemo(() => {
    const s = new Set<string>(Object.keys(answers));
    if (extras.energy) s.add("energy");
    return s;
  }, [answers, extras.energy]);

  // numbers pour les transitions et le radar live
  const numScores = useMemo(
    () => ({ A: localScores.A, B: localScores.B, C: localScores.C }),
    [localScores]
  );

  // Variante avec null pour les blocs non démarrés — utilisée par le radar
  // live (point au centre quand null) et les BlockTransitionV3 (« — » quand null).
  const numScoresOrNull = useMemo(
    () => ({
      A: localScores.completeness.A > 0 ? localScores.A : null,
      B: localScores.completeness.B > 0 ? localScores.B : null,
      C: localScores.completeness.C > 0 ? localScores.C : null,
    }),
    [localScores]
  );

  // Variante stricte : on n'affiche le niveau qu'une fois le bloc 100% complété
  // (le clic sur "Continuer" valide le bloc et débloque l'affichage du niveau).
  // Utilisée par les pages de transition pour ne pas leak un niveau B partiel
  // si l'utilisateur revient en arrière depuis bloc B vers transition A.
  const numScoresIfComplete = useMemo(
    () => ({
      A: localScores.completeness.A >= 1 ? localScores.A : null,
      B: localScores.completeness.B >= 1 ? localScores.B : null,
      C: localScores.completeness.C >= 1 ? localScores.C : null,
    }),
    [localScores]
  );

  /* ─── Handlers ─── */

  const goNext = () => setStep((s) => nextStep(s));
  const goBack = () => setStep((s) => prevStep(s));

  const onIntroStart = () => setStep("profil_step1");

  const onStep1Submit = (draft: Record<string, string | string[]>) => {
    const updates: Partial<UserProfile> = {};
    const newExtras = { ...extras };
    for (const [k, v] of Object.entries(draft)) {
      if (Array.isArray(v)) {
        newExtras[k] = v;
        (updates as Record<string, string>)[k] = v[0] ?? "";
      } else {
        newExtras[k] = v;
        (updates as Record<string, string>)[k] = v;
      }
    }
    setProfile((p) => ({ ...p, ...updates }));
    setExtras(newExtras);
    setStep("profil_step2");
    // Persistance backend best-effort
    patchMyProfileV2(updates).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("[V3-brand patchMyProfile step1]", err);
    });
  };

  const onStep2Submit = (draft: Record<string, string | string[]>) => {
    const updates: Partial<UserProfile> = {};
    const newExtras = { ...extras };
    for (const [k, v] of Object.entries(draft)) {
      if (Array.isArray(v)) {
        newExtras[k] = v;
        (updates as Record<string, string>)[k] = v[0] ?? "";
      } else {
        newExtras[k] = v;
        (updates as Record<string, string>)[k] = v;
      }
    }
    setProfile((p) => ({ ...p, ...updates }));
    setExtras(newExtras);
    setStep("energy");
    patchMyProfileV2(updates).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("[V3-brand patchMyProfile step2]", err);
    });
  };

  const onEnergySubmit = (id: string) => {
    setExtras((e) => ({ ...e, energy: id }));
    setStep("bloc_A");
    if (interviewId) {
      // Énergie : question non scorée — on récupère le label depuis ENERGY_FIELD
      // pour l'envoyer au backend (utile à l'affichage côté rapport).
      const opt = ENERGY_FIELD.options.find((o) => o.id === id);
      const ans: Answer = {
        mode: "A",
        selected_option: id,
        selected_option_label: opt?.label ?? null,
        free_text: null,
        complement_text: null,
        entity_name: null,
        scored: false,
      };
      saveAnswer(interviewId, "energy", ans).catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("[V3-brand saveAnswer energy]", err);
      });
    }
  };

  const onBlocAnswer = (qid: string, optId: string) => {
    setAnswers((a) => ({ ...a, [qid]: optId }));
    if (interviewId) {
      // Reconstruit un Answer complet : mode dérivé du préfixe de qid
      // (a*/b*/c* → A/B/C), label retrouvé dans le protocol_data.
      const modeLetter = qid.charAt(0).toUpperCase() as "A" | "B" | "C";
      const blocId: "A" | "B" | "C" =
        modeLetter === "A" || modeLetter === "B" || modeLetter === "C"
          ? modeLetter
          : "A";
      const bloc = getBloc(blocId);
      const question = bloc.questions.find((q) => q.id === qid);
      const opt = question?.options.find((o) => o.id === optId);
      const ans: Answer = {
        mode: blocId,
        selected_option: optId,
        selected_option_label: opt?.label ?? null,
        free_text: null,
        complement_text: null,
        entity_name: null,
        scored: true,
      };
      // Persiste en arrière-plan (best effort — on n'attend pas)
      saveAnswer(interviewId, qid, ans).catch((err) => {
        // eslint-disable-next-line no-console
        console.warn("[V3-brand saveAnswer]", qid, err);
      });
    }
  };

  const onTransitionNext = () => {
    // De transition_X on passe naturellement au bloc suivant ou aux résultats
    setStep((s) => nextStep(s));
  };

  /* ─── État d'hydratation : 3 points argent pulsés (charte H8) ─── */
  if (isHydrating) {
    return (
      <main
        style={{
          background: palette.paper,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <TypingDots theme={theme} size={8} gap={10} />
      </main>
    );
  }

  /* ─── Mode liste des chantiers ─── */
  if (listChantiersOpen) {
    return (
      <>
        <ThemeToggleV3 theme={theme} onToggle={() => setTheme((t) => (t === "night" ? "day" : "night"))} />
        <ListChantiersV3
          theme={theme}
          onBack={() => setListChantiersOpen(false)}
          onOpenModule={(id) => {
            setListChantiersOpen(false);
            setOpenModuleId(id);
          }}
        />
      </>
    );
  }

  /* ─── Mode module ─── */
  if (openModuleId) {
    const mod = getModule(openModuleId);
    if (mod) {
      const oppData = getOpp(openModuleId);
      const axisForModule = (oppData?.axis ?? "B") as "A" | "B" | "C";
      return (
        <>
          <ThemeToggleV3 theme={theme} onToggle={() => setTheme((t) => (t === "night" ? "day" : "night"))} />
          <ModuleV3
            theme={theme}
            module={mod}
            axis={axisForModule}
            volume={
              typeof extras.volume === "string" &&
              ["lt_80", "80_120", "gt_120"].includes(extras.volume)
                ? (extras.volume as VolumeId)
                : null
            }
            onOpenChat={interviewId ? () => setChatOpen(true) : undefined}
            onBack={() => setOpenModuleId(null)}
            onLugia={() =>
              openCalendly({
                chantierId: openModuleId ?? undefined,
                firstname: profile.firstname ?? undefined,
              })
            }
            onPrint={() => window.print()}
            onDownloadPdf={
              interviewId && openModuleId
                ? () => {
                    downloadChantierPdf(interviewId, openModuleId).catch((err) => {
                      // eslint-disable-next-line no-console
                      console.warn("[H.4 downloadChantierPdf]", err);
                      alert(
                        "Le téléchargement du PDF a échoué.\nUtilisez le bouton 'Imprimer' (Ctrl+P / Cmd+P) qui exporte aussi en PDF via votre navigateur."
                      );
                    });
                  }
                : undefined
            }
          />
          {chatOpen && interviewId && openModuleId && mod && (
            <ChatChantierModal
              theme={theme}
              interviewId={interviewId}
              moduleId={openModuleId}
              moduleLabel={mod.label}
              onClose={() => setChatOpen(false)}
            />
          )}
        </>
      );
    }
  }

  /* ─── Mode résultats ─── */
  if (step === "resultats") {
    const motivPhrase = buildMotivPhrase(
      extras.motivation as string | string[] | null,
      profile.status ?? null
    );

    // Date + durée
    const completedDate = new Date().toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const durationMinutes = Math.max(1, Math.round((Date.now() - startedAt) / 60000));

    // Branchement éditorial dynamique (A.1) :
    // - pickSignal sélectionne le signal applicable (6 signaux + 1 fallback)
    //   selon les niveaux 0-3 dérivés des scores 0-100 via levelOf().
    // - Le signal porte phraseChoc, bilanForces, bilanRisques, radarAnnotations.
    // - getAxisDetail fournit summary/forces/marges par axe × niveau.
    // Cf signals_data.ts + axis_details_data.ts (T-V3-11 ré-ouvert).
    const signal = pickSignal(numScores);
    // A.1bis : composer la phrase choc avec opener motivation + status + énergie.
    // - motivations : multi-select dans extras.motivation
    // - status : profile.status (page 3 du profil — stabilité du cabinet)
    // - energy : extras.energy (réponse à l'ancrage avant les blocs)
    const motivationRaw = extras.motivation;
    const motivations: MotivationId[] = Array.isArray(motivationRaw)
      ? motivationRaw.filter((v): v is MotivationId =>
          ["charge", "evenement", "risque", "curiosite"].includes(v)
        )
      : typeof motivationRaw === "string" &&
        ["charge", "evenement", "risque", "curiosite"].includes(motivationRaw)
      ? [motivationRaw as MotivationId]
      : [];
    const statusVal = profile.status ?? null;
    const status: StatusId | null =
      statusVal && ["recent", "installe", "senior"].includes(statusVal)
        ? (statusVal as StatusId)
        : null;
    const energyRaw = typeof extras.energy === "string" ? extras.energy : null;
    const energy: EnergyId | null =
      energyRaw && ["energy_a", "energy_b", "energy_c", "energy_d"].includes(energyRaw)
        ? (energyRaw as EnergyId)
        : null;

    const { before: phraseChocBefore, after: phraseChocAfter } = buildPhraseChoc({
      signal,
      motivations,
      status,
      energy,
    });
    const bilanForces = signal.bilanForces;
    const bilanRisques = signal.bilanRisques;
    const radarAnnotations = signal.radarAnnotations;

    const axisADetailDyn = getAxisDetail("A", levelOf(numScores.A));
    const axisBDetailDyn = getAxisDetail("B", levelOf(numScores.B));
    const axisCDetailDyn = getAxisDetail("C", levelOf(numScores.C));

    const opps = pickOpps(localScores, 4);

    return (
      <>
        <IntroHeaderShortcuts theme={theme} />
        <ThemeToggleV3
          theme={theme}
          onToggle={() => setTheme((t) => (t === "night" ? "day" : "night"))}
          offsetTop={60}
        />
        <Topbar
          step={step}
          profile={profile}
          scores={scoresV2Shim}
          answeredQuestionIds={answeredQuestionIds}
          theme={theme}
          onHomeClick={() => router.push("/")}
        />
        <ResultatsV3
          theme={theme}
          onBack={() => setStep("transition_C")}
          firstname={profile.firstname ?? "Chateau"}
          completedDate={completedDate}
          durationMinutes={durationMinutes}
          motivPhrase={motivPhrase}
          phraseChocBefore={phraseChocBefore}
          phraseChocAfter={phraseChocAfter}
          bilanForces={bilanForces}
          bilanRisques={bilanRisques}
          radarScores={numScores}
          radarAnnotations={radarAnnotations}
          axisALevel={localScores.completeness.A > 0 ? LEVELS[levelOf(localScores.A)].label : "—"}
          axisADetail={axisADetailDyn}
          axisBLevel={localScores.completeness.B > 0 ? LEVELS[levelOf(localScores.B)].label : "—"}
          axisBDetail={axisBDetailDyn}
          axisCLevel={localScores.completeness.C > 0 ? LEVELS[levelOf(localScores.C)].label : "—"}
          axisCDetail={axisCDetailDyn}
          opps={opps}
          onOpenModule={(id) => {
            // __autonomie__ / __lugia__ / __list_all__ — placeholders gérés ici.
            // La discussion avec assistant Lugia (A.2) sera branchée quand
            // l'endpoint LLM/SLM sera disponible. Pour l'instant, l'alert
            // informe l'utilisateur et propose les alternatives.
            if (id.startsWith("__")) {
              alert("Action " + id + " : fonctionnalité en cours de finalisation.");
              return;
            }
            setOpenModuleId(id);
          }}
          onOpenAll={() => setListChantiersOpen(true)}
          onAutonomie={() => alert(
            "Discussion en autonomie avec l'assistant Lugia\n\n" +
            "Cette fonctionnalité arrive prochainement.\n\n" +
            "En attendant, vous pouvez :\n" +
            "  – ouvrir un chantier ci-dessus pour lire le plan d'action en 4 étapes\n" +
            "  – imprimer le plan pour l'exécuter à votre rythme\n" +
            "  – prendre 30 min avec Sébastien via le bouton voisin si vous voulez en discuter"
          )}
          onLugia={() =>
            openCalendly({ firstname: profile.firstname ?? undefined })
          }
        />
      </>
    );
  }

  /* ─── Mode parcours classique ─── */
  return (
    <>
      <IntroHeaderShortcuts theme={theme} />
      <ThemeToggleV3
        theme={theme}
        onToggle={() => setTheme((t) => (t === "night" ? "day" : "night"))}
        offsetTop={60}
      />
      {step !== "intro" && (
      <Topbar
        step={step}
        profile={profile}
        scores={scoresV2Shim}
        answeredQuestionIds={answeredQuestionIds}
        theme={theme}
        onHomeClick={() => router.push("/")}
      />
      )}

      {/* Radar live sticky desktop ≥ 1140 px — visible uniquement pendant les
         blocs A/B/C, masqué sur intro/profil/energy/transitions. */}
      {(step === "bloc_A" || step === "bloc_B" || step === "bloc_C") && (
        <RadarLiveV3 theme={theme} scores={numScoresOrNull} />
      )}

      {step === "intro" && (
        <IntroV3 theme={theme} onStart={onIntroStart} />
      )}

      {step === "profil_step1" && (
        <ProfilStep1V3
          theme={theme}
          onSubmit={onStep1Submit}
          onBack={() => setStep("intro")}
          initial={extras}
          onDraftChange={(d) => setExtras((e) => ({ ...e, ...d }))}
        />
      )}

      {step === "profil_step2" && (
        <ProfilStep2V3
          theme={theme}
          onSubmit={onStep2Submit}
          onBack={() => setStep("profil_step1")}
          initial={extras}
          onDraftChange={(d) => setExtras((e) => ({ ...e, ...d }))}
        />
      )}

      {step === "energy" && (
        <EnergyV3
          theme={theme}
          onSubmit={onEnergySubmit}
          onBack={() => setStep("profil_step2")}
          initial={(extras.energy as string) ?? null}
        />
      )}

      {step === "bloc_A" && (
        <BlocV3
          bloc={getBloc("A")}
          answers={answers}
          onAnswer={onBlocAnswer}
          onNext={() => setStep("transition_A")}
          onBack={() => setStep("energy")}
          theme={theme}
          cabinetType={typeof extras.cabinet_type === "string" ? extras.cabinet_type : undefined}
          secretariat={typeof extras.secretariat === "string" ? extras.secretariat : undefined}
          paramedicalTeam={typeof extras.paramedical_team === "string" ? extras.paramedical_team : undefined}
        />
      )}

      {step === "transition_A" && (
        <BlockTransitionV3
          closedBloc="A"
          scores={numScoresIfComplete}
          nextBlocLabel="Équipe & secrétariat"
          onContinue={onTransitionNext}
          onBack={() => setStep("bloc_A")}
          theme={theme}
        />
      )}

      {step === "bloc_B" && (
        <BlocV3
          bloc={getBloc("B")}
          answers={answers}
          onAnswer={onBlocAnswer}
          onNext={() => setStep("transition_B")}
          onBack={() => setStep("transition_A")}
          theme={theme}
          cabinetType={typeof extras.cabinet_type === "string" ? extras.cabinet_type : undefined}
          secretariat={typeof extras.secretariat === "string" ? extras.secretariat : undefined}
          paramedicalTeam={typeof extras.paramedical_team === "string" ? extras.paramedical_team : undefined}
        />
      )}

      {step === "transition_B" && (
        <BlockTransitionV3
          closedBloc="B"
          scores={numScoresIfComplete}
          nextBlocLabel="Outils & dossiers"
          onContinue={onTransitionNext}
          onBack={() => setStep("bloc_B")}
          theme={theme}
        />
      )}

      {step === "bloc_C" && (
        <BlocV3
          bloc={getBloc("C")}
          answers={answers}
          onAnswer={onBlocAnswer}
          onNext={() => setStep("transition_C")}
          onBack={() => setStep("transition_B")}
          theme={theme}
          cabinetType={typeof extras.cabinet_type === "string" ? extras.cabinet_type : undefined}
          secretariat={typeof extras.secretariat === "string" ? extras.secretariat : undefined}
          paramedicalTeam={typeof extras.paramedical_team === "string" ? extras.paramedical_team : undefined}
          isLast
        />
      )}

      {step === "transition_C" && (
        <BlockTransitionV3
          closedBloc="C"
          scores={numScoresIfComplete}
          nextBlocLabel="Votre profil et les actions à votre portée"
          onContinue={() => {
            setStep("resultats");
            // Marque la session comme completed côté backend
            if (interviewId) {
              completeInterview(interviewId).catch((err) => {
                // eslint-disable-next-line no-console
                console.warn("[V3-brand completeInterview]", err);
              });
            }
          }}
          onBack={() => setStep("bloc_C")}
          theme={theme}
          isFinal
        />
      )}
    </>
  );
}
