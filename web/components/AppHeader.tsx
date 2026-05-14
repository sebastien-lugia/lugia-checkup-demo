"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { logout } from "@/lib/api";
import { clearSession, getSessionEmail } from "@/lib/auth";

/**
 * Bandeau discret en haut à droite des pages protégées.
 * Affiche l'email de la session courante et un bouton de déconnexion.
 * Best-effort sur l'appel `/auth/logout` (on déconnecte localement même
 * si le backend est injoignable).
 */
export function AppHeader() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setEmail(getSessionEmail());
  }, []);

  async function handleLogout() {
    if (typeof window !== "undefined" && !window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      return;
    }
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // best effort : on déconnecte localement quand même
    } finally {
      clearSession();
      router.push("/login");
    }
  }

  if (!email) return null;

  return (
    <div className="absolute top-4 right-6 flex items-center gap-2 text-xs">
      <Link
        href="/compte"
        className="text-lugia-text-tertiary truncate max-w-[180px] hover:text-lugia-text-secondary"
        title="Gérer mon compte"
      >
        {email}
      </Link>
      <span className="text-lugia-text-tertiary">·</span>
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="text-lugia-text-secondary hover:text-lugia-text underline underline-offset-2 disabled:opacity-50"
      >
        {isLoggingOut ? "Déconnexion…" : "Se déconnecter"}
      </button>
    </div>
  );
}
