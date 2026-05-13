"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppHeader } from "@/components/AppHeader";
import { deleteAccount } from "@/lib/api";
import {
  clearSession,
  getSessionEmail,
  useRequireAuth,
} from "@/lib/auth";

const CONFIRM_KEYWORD = "SUPPRIMER";

export default function ComptePage() {
  const router = useRouter();
  const isAuthReady = useRequireAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [confirmInput, setConfirmInput] = useState("");
  const [status, setStatus] = useState<
    "idle" | "deleting" | "deleted" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthReady) return;
    setEmail(getSessionEmail());
  }, [isAuthReady]);

  async function handleDelete() {
    if (confirmInput.trim().toUpperCase() !== CONFIRM_KEYWORD) {
      setErrorMsg(
        `Pour confirmer, tapez exactement ${CONFIRM_KEYWORD} dans le champ ci-dessus.`
      );
      setStatus("error");
      return;
    }
    setStatus("deleting");
    setErrorMsg(null);
    try {
      await deleteAccount();
      clearSession();
      setStatus("deleted");
    } catch {
      setErrorMsg(
        "La suppression a échoué. Réessayez ou contactez sebastien@lugia.fr."
      );
      setStatus("error");
    }
  }

  if (!isAuthReady) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-lugia-text-tertiary">Chargement…</div>
      </main>
    );
  }

  if (status === "deleted") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="text-sm font-medium mb-1">Lugia</div>
          <div className="text-xs uppercase tracking-wider text-lugia-text-tertiary mb-10">
            Check-up préventif
          </div>
          <h1 className="font-serif text-[26px] font-medium leading-snug mb-4">
            Compte supprimé.
          </h1>
          <p className="text-base text-lugia-text-secondary leading-relaxed mb-6">
            Toutes les données associées à <strong>{email}</strong> ont été
            définitivement effacées de nos bases : réponses, scores,
            chantiers, jetons d&apos;authentification et sessions.
          </p>
          <p className="text-sm text-lugia-text-tertiary leading-relaxed mb-8">
            Vous pouvez reprendre un nouveau check-up à tout moment en
            saisissant à nouveau votre email.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-lugia-text text-white px-6 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12 relative">
      <AppHeader />
      <div className="max-w-2xl mx-auto">
        <div className="text-sm font-medium mb-1">Lugia</div>
        <div className="text-xs uppercase tracking-wider text-lugia-text-tertiary mb-10">
          Check-up préventif
        </div>

        <h1 className="font-serif text-[28px] font-medium leading-snug mb-8">
          Mon compte
        </h1>

        <section className="mb-10">
          <div className="text-xs uppercase tracking-wider font-medium text-lugia-text-secondary mb-2">
            Email de connexion
          </div>
          <div className="text-base">{email}</div>
        </section>

        <section className="mb-10">
          <div className="text-xs uppercase tracking-wider font-medium text-lugia-text-secondary mb-3">
            Vos données chez Lugia
          </div>
          <p className="text-base text-lugia-text-secondary leading-relaxed mb-2">
            Lugia conserve uniquement les informations suivantes :
          </p>
          <ul className="text-base text-lugia-text-secondary leading-relaxed space-y-1 pl-5 list-disc">
            <li>votre adresse email,</li>
            <li>vos réponses au questionnaire,</li>
            <li>les scores et chantiers calculés à partir de vos réponses,</li>
            <li>
              les jetons techniques d&apos;authentification (expiration
              automatique).
            </li>
          </ul>
          <p className="text-sm text-lugia-text-tertiary mt-4 leading-relaxed">
            Pour le détail des finalités et de la durée de conservation,
            consultez la{" "}
            <a
              href="/confidentialite"
              className="text-lugia-accent underline underline-offset-2 hover:opacity-80"
            >
              politique de confidentialité
            </a>
            .
          </p>
        </section>

        <section className="border border-red-200 bg-red-50 rounded-xl p-5 mb-10">
          <h2 className="text-sm font-medium text-red-700 mb-2">
            Supprimer mon compte et toutes mes données
          </h2>
          <p className="text-sm text-red-700 leading-relaxed mb-4">
            Cette action est <strong>définitive et irréversible</strong>.
            Toutes vos réponses au check-up, les scores et chantiers
            associés, vos jetons d&apos;accès et sessions seront supprimés
            sans possibilité de récupération.
          </p>
          <p className="text-sm text-red-700 leading-relaxed mb-3">
            Pour confirmer, tapez{" "}
            <code className="font-mono bg-white px-1.5 py-0.5 rounded text-red-700 border border-red-300">
              {CONFIRM_KEYWORD}
            </code>{" "}
            dans le champ ci-dessous.
          </p>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => {
              setConfirmInput(e.target.value);
              if (status === "error") {
                setStatus("idle");
                setErrorMsg(null);
              }
            }}
            placeholder={CONFIRM_KEYWORD}
            disabled={status === "deleting"}
            className="w-full px-4 py-2.5 bg-white border border-red-300 rounded-lg text-base focus:outline-none focus:border-red-500 mb-3 disabled:opacity-50"
          />
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDelete}
              disabled={
                status === "deleting" ||
                confirmInput.trim().toUpperCase() !== CONFIRM_KEYWORD
              }
              className="bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "deleting"
                ? "Suppression…"
                : "Supprimer définitivement"}
            </button>
            <button
              onClick={() => router.push("/")}
              disabled={status === "deleting"}
              className="bg-white border border-red-300 text-red-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
            >
              Annuler
            </button>
          </div>
          {errorMsg && (
            <div className="mt-4 text-sm text-red-700 bg-white border border-red-300 rounded-lg p-3">
              {errorMsg}
            </div>
          )}
        </section>

        <div>
          <button
            onClick={() => router.push("/")}
            className="text-sm text-lugia-text-secondary hover:text-lugia-text underline underline-offset-2"
          >
            ← Retour à l&apos;accueil
          </button>
        </div>
      </div>
    </main>
  );
}
