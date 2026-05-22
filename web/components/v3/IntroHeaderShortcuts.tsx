"use client";

/**
 * V3-charte — IntroHeaderShortcuts.
 *
 * Barre de raccourcis fixée en haut à droite, EMPILÉE au-dessus du
 * ThemeToggleV3 (qui reste géré par page.tsx en fixed top-right).
 *
 * Visible uniquement sur la page d'accueil V3-charte (`step === "intro"`).
 * Contient : lien Présentation Lugia, Mon compte, email, Se déconnecter.
 *
 * Charte A-intro-fix #11.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { logout } from "@/lib/api";
import { clearSession, getSessionEmail } from "@/lib/auth";
import { fonts, paletteFor, type V3Theme } from "@/lib/v3/tokens";

export function IntroHeaderShortcuts({ theme = "night" }: { theme?: V3Theme }) {
  const palette = paletteFor(theme);
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    setEmail(getSessionEmail());
  }, []);

  async function handleLogout() {
    if (
      typeof window !== "undefined" &&
      !window.confirm("Voulez-vous vraiment vous déconnecter ?")
    ) {
      return;
    }
    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // best effort — déconnexion locale quand même
    } finally {
      clearSession();
      router.push("/login");
    }
  }

  const linkStyle: React.CSSProperties = {
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.10em",
    textTransform: "uppercase",
    color: palette.navy400,
    textDecoration: "none",
    fontStyle: "normal",
    transition: "color 180ms ease-out",
  };

  const onHoverIn = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.color = palette.navy;
  };
  const onHoverOut = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.color = palette.navy400;
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 14,
        right: 28,
        zIndex: 250, // au-dessus du Topbar (z=200) pour visibilité partout
        display: "flex",
        alignItems: "center",
        gap: 18,
      }}
    >
      <Link
        href="/compte"
        style={linkStyle}
        onMouseEnter={onHoverIn}
        onMouseLeave={onHoverOut}
      >
        Mon compte
      </Link>

      {email && (
        <>
          <span
            style={{
              ...linkStyle,
              color: palette.navy400,
              opacity: 0.65,
              textTransform: "lowercase",
              maxWidth: 220,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={email}
          >
            {email}
          </span>
        </>
      )}

      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        style={{
          ...linkStyle,
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: isLoggingOut ? "default" : "pointer",
          opacity: isLoggingOut ? 0.5 : 1,
        }}
        onMouseEnter={(e) => !isLoggingOut && onHoverIn(e)}
        onMouseLeave={(e) => !isLoggingOut && onHoverOut(e)}
      >
        {isLoggingOut ? "Déconnexion…" : "Se déconnecter"}
      </button>
    </div>
  );
}
