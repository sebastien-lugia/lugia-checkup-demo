"use client";

import { useState, type FormEvent } from "react";

import { PageHeader } from "@/components/PageHeader";
import { requestMagicLink } from "@/lib/api";

type Status = "idle" | "sending" | "sent" | "error";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@") || trimmed.length < 5) {
      setErrorMsg("Adresse email invalide.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setErrorMsg(null);
    try {
      await requestMagicLink(trimmed);
      setStatus("sent");
    } catch {
      setErrorMsg(
        "Impossible d'envoyer le lien. Réessayez dans un instant."
      );
      setStatus("error");
    }
  }

  function handleReset() {
    setStatus("idle");
    setErrorMsg(null);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <PageHeader mbBottom={10} />

        {status === "sent" ? (
          <>
            <h1 className="font-serif text-[26px] font-medium leading-snug mb-4">
              Vérifiez votre boîte mail.
            </h1>
            <p className="text-base text-lugia-text-secondary leading-relaxed mb-6">
              Si l&apos;adresse <strong>{email}</strong>{" "}est valide, vous y
              recevrez dans quelques secondes un lien d&apos;accès à votre
              check-up. Il est valable 30 minutes.
            </p>
            <p className="text-sm text-lugia-text-tertiary">
              Vous n&apos;avez pas reçu le mail ? Vérifiez aussi vos spams, ou{" "}
              <button
                onClick={handleReset}
                className="underline underline-offset-2 hover:text-lugia-text-secondary"
              >
                réessayez avec une autre adresse
              </button>
              .
            </p>
          </>
        ) : (
          <>
            <h1 className="font-serif text-[26px] font-medium leading-snug mb-3">
              Recevez votre lien d&apos;accès par email.
            </h1>
            <p className="text-base text-lugia-text-secondary leading-relaxed mb-8">
              Saisissez votre adresse professionnelle. Nous vous envoyons un
              lien pour accéder à votre check-up. Pas de mot de passe à retenir.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs uppercase tracking-wider font-medium text-lugia-text-secondary mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="[email protected]"
                  className="w-full px-4 py-3 bg-lugia-bg-card border border-lugia-border rounded-lg text-base focus:outline-none focus:border-lugia-text-tertiary"
                />
              </div>

              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full bg-lugia-text text-white px-6 py-3 rounded-lg font-medium text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "sending" ? "Envoi…" : "Recevoir mon lien d'accès"}
              </button>

              {errorMsg && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                  {errorMsg}
                </div>
              )}
            </form>

            <p className="text-xs text-lugia-text-tertiary mt-8 leading-relaxed">
              Vos réponses restent confidentielles. Aucune donnée patient
              identifiable n&apos;est collectée.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
