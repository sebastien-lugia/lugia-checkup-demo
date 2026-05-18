"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { getMyProfile, verifyMagicToken } from "@/lib/api";
import { clearSession, setSession } from "@/lib/auth";

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError("Lien invalide. Aucun jeton trouvé dans l'URL.");
      return;
    }
    (async () => {
      try {
        // On purge toute session précédente avant d'en créer une nouvelle.
        clearSession();
        const { session_token, email } = await verifyMagicToken(token);
        setSession(session_token, email);
        // V1.1.7-i : si premier login (pas de prénom enregistré), proposer
        // de le saisir avant d'arriver sur l'accueil. Sinon, route directe.
        try {
          const profile = await getMyProfile();
          if (!profile.firstname || !profile.firstname.trim()) {
            router.replace("/compte?from=onboarding");
          } else {
            router.replace("/");
          }
        } catch {
          // best effort — si profile inaccessible, on n'empêche pas l'entrée
          router.replace("/");
        }
      } catch {
        setError(
          "Ce lien d'accès n'est plus valide. Il a peut-être expiré ou été déjà utilisé."
        );
      }
    })();
  }, [token, router]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          <PageHeader subtitle="Check-up préventif" mbBottom={8} />
          <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
            {error}
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-lugia-text text-white px-6 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition"
          >
            Demander un nouveau lien
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="text-center">
        <PageHeader subtitle="Check-up préventif" mbBottom={6} />
        <div className="text-sm text-lugia-text-tertiary">Connexion en cours…</div>
      </div>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="text-sm text-lugia-text-tertiary">Chargement…</div>
        </main>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
