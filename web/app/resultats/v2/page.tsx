"use client";

/**
 * V2.0 — Page résultats V2.
 *
 * URL : /resultats/v2?id={interview_id}
 *
 * Charge le rapport V2 via GET /interviews/{id}/report (dispatcher backend
 * route vers V2 si protocol_version='v2.0'), puis délègue le rendu à
 * `<ResultatsV2>`.
 */

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { getReportV2, type V2Report } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";
import { AppHeader } from "@/components/AppHeader";
import { ResultatsV2 } from "@/components/v2/ResultatsV2";

function ResultatsV2Content() {
  useRequireAuth();
  const router = useRouter();
  const params = useSearchParams();
  const idStr = params.get("id");
  const [report, setReport] = useState<V2Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idStr) {
      router.replace("/");
      return;
    }
    const id = Number(idStr);
    if (!Number.isFinite(id)) {
      setError("Identifiant d'interview invalide.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const r = await getReportV2(id);
        if (cancelled) return;
        if (r.protocol_version !== "v2.0") {
          // Le rapport est V1.x — rediriger vers la page legacy.
          router.replace(`/resultats?id=${id}`);
          return;
        }
        if (!r.is_complete) {
          setError(
            "Le parcours n'est pas encore complet. Reprenez-le pour obtenir vos résultats."
          );
          return;
        }
        setReport(r);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [idStr, router]);

  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <AppHeader />
      {error && (
        <div className="max-w-[680px] mx-auto px-8 py-20">
          <h1 className="font-serif text-[28px] text-[#a85d2b] mb-4">
            Résultats indisponibles
          </h1>
          <p className="text-[14px] text-[#444]">{error}</p>
        </div>
      )}
      {!error && !report && (
        <div className="max-w-[680px] mx-auto px-8 py-20 text-[#888780]">
          Chargement de vos résultats…
        </div>
      )}
      {report && <ResultatsV2 report={report} />}
    </div>
  );
}

export default function ResultatsV2Page() {
  return (
    <Suspense fallback={null}>
      <ResultatsV2Content />
    </Suspense>
  );
}
