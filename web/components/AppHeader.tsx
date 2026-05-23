"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { logout } from "@/lib/api";
import { clearSession, getSessionEmail } from "@/lib/auth";

/**
 * V1.1.6 : Nav complète full-width avec logo Lugia à gauche, email +
 * déconnexion à droite, bordure basse fine. Remplace l'ancien
 * positionnement absolute.
 *
 * Affichée sur les pages protégées (checkup, resultats, compte).
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

  return (
    <nav className="w-full border-b border-[#e5e5e5] bg-lugia-bg">
      <div className="max-w-[1180px] mx-auto px-8 py-4 flex items-center justify-between gap-4 lugia-nav-inner">
        <Link href="/" className="text-base font-semibold text-lugia-text">
          Lugia
        </Link>

        {/* Liens vers les 3 pages "à propos" — visibles quel que soit l'auth */}
        <div className="flex items-center gap-6 text-[12px]">
          <Link
            href="/le-checkup"
            className="text-[#555] hover:text-[#111] uppercase tracking-[0.08em] font-mono whitespace-nowrap"
          >
            Le check-up
          </Link>
          <Link
            href="/notre-accompagnement"
            className="text-[#555] hover:text-[#111] uppercase tracking-[0.08em] font-mono whitespace-nowrap"
          >
            Notre accompagnement
          </Link>
          <Link
            href="/lugia"
            className="text-[#555] hover:text-[#111] uppercase tracking-[0.08em] font-mono whitespace-nowrap"
          >
            À propos de Lugia &amp; Co
          </Link>
        </div>

        {email ? (
          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/compte"
              className="text-[#555] hover:text-[#111] whitespace-nowrap"
            >
              Mon compte
            </Link>
            <span className="text-[#999] truncate max-w-[180px]" title={email}>
              {email}
            </span>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-[#555] hover:text-[#111] underline underline-offset-2 disabled:opacity-50 whitespace-nowrap"
            >
              {isLoggingOut ? "Déconnexion…" : "Se déconnecter"}
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
