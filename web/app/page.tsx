"use client";

/**
 * Page d'accueil V3 — point d'entrée unique du check-up après login.
 *
 * Charte V3 (palette/fonts/jour-nuit). N'expose qu'une voie : commencer le
 * check-up V3 (le seul actif en démo). Reprend l'interview en cours si une
 * existe. Les anciens parcours (V1.1.9 / V2.0) restent accessibles via les
 * menus et URLs directes (`/checkup`, `/checkup/v2`), pas depuis cette home.
 *
 * Flux : login → /  → /profession → /checkup/v3-charte
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { paletteFor, fonts, type V3Theme } from "@/lib/v3/tokens";
import { useTheme } from "@/lib/v3/useTheme";
import { ThemeToggleV3 } from "@/components/v3/ThemeToggleV3";
import {
  createInterviewV3,
  getActiveInterviewsByVersion,
  type ActiveInterviewsByVersion,
} from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

function LugiaMark({ color = "currentColor", size = 28 }: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={Math.round(size * (220 / 261))}
      viewBox="0 0 261 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.89203 214.075C19.1426 199.271 37.0201 179.22 46.4715 167.44C52.3767 160.08 53.9276 158.048 60.2051 149.445C83.8782 117.005 103.023 82.0726 116.337 47.0247C120.033 37.2956 125.447 19.4831 127.971 8.75085L130.028 0L130.837 4.08933C133.48 17.4491 140.016 38.487 146.67 55.0528C163.069 95.8803 187.169 135.548 219.704 175.261C225.982 182.924 246.366 205.454 255.269 214.57C258.398 217.775 260.639 220.212 260.248 219.985C255.879 217.457 223.652 192.442 216.188 185.785C215.774 185.416 212.671 182.712 209.291 179.777C205.912 176.841 201.537 172.997 199.57 171.235C197.603 169.472 194.441 166.644 192.543 164.95C186.414 159.478 169.288 142.646 157.141 130.155C137.343 109.796 109.082 125.742 90.6617 142.615 78.1358 154.929 69.6629 162.527C66.1685 165.66 62.4203 169.04 61.3336 170.037C45.4767 184.585 27.0938 199.743 8.44852 213.643C-2.01646 221.445 -2.22738 221.471 4.89203 214.075Z"
        fill={color}
      />
    </svg>
  );
}

export default function AccueilV3Page() {
  const router = useRouter();
  const isAuthReady = useRequireAuth();
  const [theme, setTheme] = useTheme();
  const [actives, setActives] = useState<ActiveInterviewsByVersion>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const original = document.body.style.background;
    document.body.style.background = paletteFor(theme).paper;
    return () => { document.body.style.background = original; };
  }, [theme]);

  useEffect(() => {
    if (!isAuthReady) return;
    (async () => {
      try {
        const a = await getActiveInterviewsByVersion();
        setActives(a);
      } catch {
        /* pas bloquant */
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isAuthReady]);

  const activeV3 = actives["v3.0"];

  function pathResumeV3(): string {
    if (!activeV3) return "/profession";
    return activeV3.status === "completed"
      ? `/checkup/v3-charte?interview=${activeV3.id}&view=results`
      : `/checkup/v3-charte?interview=${activeV3.id}`;
  }

  async function handleStart() {
    if (isStarting) return;
    // Si une interview V3 est en cours, on bascule directement dessus.
    if (activeV3) {
      router.push(pathResumeV3());
      return;
    }
    // Sinon, on passe par le choix de profession (la création de l'interview
    // se fait après ce choix, cf /profession).
    router.push("/profession");
  }

  if (!isAuthReady) return null;
  const palette = paletteFor(theme);

  return (
    <main
      style={{
        background: palette.paper,
        color: palette.navy,
        minHeight: "100vh",
        paddingTop: 40,
        paddingBottom: 96,
        transition: "background 350ms ease-out, color 350ms ease-out",
      }}
    >
      <ThemeToggleV3 theme={theme} onToggle={() => setTheme((t) => (t === "night" ? "day" : "night"))} />

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
        {/* Marque en tête */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 64 }}>
          <LugiaMark color={palette.navy} size={28} />
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: palette.navy,
              fontStyle: "normal",
            }}
          >
            Lugia &amp; Co
          </span>
        </div>

        {/* Eyebrow */}
        <p
          style={{
            fontFamily: fonts.mono,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: palette.argentDeep,
            margin: "0 0 18px 0",
            fontStyle: "normal",
          }}
        >
          Check-up préventif du cabinet
        </p>

        {/* Titre principal */}
        <h1
          style={{
            fontFamily: fonts.serif,
            fontWeight: 400,
            fontSize: "clamp(40px, 6vw, 56px)",
            lineHeight: 1.1,
            color: palette.navy,
            margin: "0 0 24px 0",
            fontStyle: "normal",
          }}
        >
          Où en est réellement votre cabinet aujourd&apos;hui&nbsp;?
        </h1>

        {/* Description */}
        <p
          style={{
            fontFamily: fonts.serif,
            fontSize: 18,
            lineHeight: 1.6,
            color: palette.navy,
            opacity: 0.85,
            margin: "0 0 40px 0",
            maxWidth: 560,
            fontStyle: "normal",
          }}
        >
          Un check-up de 20 à 30 minutes qui cartographie le système de
          travail de votre cabinet — pas votre pratique médicale, mais le
          quotidien, les outils, ce qui coince. Aucune donnée patient
          demandée.
        </p>

        {/* CTA principal + état */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 560 }}>
          <button
            type="button"
            onClick={handleStart}
            disabled={isLoading || isStarting}
            style={{
              background: palette.navy,
              color: palette.paper,
              border: "none",
              padding: "16px 28px",
              fontFamily: fonts.sans,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: "0.02em",
              cursor: isLoading || isStarting ? "not-allowed" : "pointer",
              opacity: isLoading || isStarting ? 0.6 : 1,
              transition: "box-shadow 250ms ease-out, transform 180ms ease-out",
              fontStyle: "normal",
              alignSelf: "flex-start",
            }}
            onMouseEnter={(e) => {
              if (isLoading || isStarting) return;
              e.currentTarget.style.boxShadow = `0 0 0 1px ${palette.argent}, 0 10px 28px -10px ${palette.argent}`;
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {activeV3
              ? activeV3.status === "completed"
                ? "Revoir mes résultats →"
                : "Reprendre mon check-up →"
              : "Commencer →"}
          </button>

          {activeV3 && (
            <button
              type="button"
              onClick={async () => {
                if (isStarting) return;
                setIsStarting(true);
                setError(null);
                try {
                  const { id } = await createInterviewV3();
                  router.push(`/checkup/v3-charte?interview=${id}&fresh=1`);
                } catch {
                  setError("Impossible de démarrer un nouveau check-up. Réessayez dans un instant.");
                  setIsStarting(false);
                }
              }}
              style={{
                background: "transparent",
                color: palette.navy,
                border: "none",
                padding: "8px 0",
                fontFamily: fonts.sans,
                fontSize: 13,
                cursor: "pointer",
                alignSelf: "flex-start",
                textDecoration: "underline",
                textUnderlineOffset: 4,
                fontStyle: "normal",
              }}
            >
              Commencer un nouveau check-up
            </button>
          )}

          {error && (
            <p style={{ fontFamily: fonts.sans, fontSize: 13, color: "#7A3320", margin: "8px 0 0 0" }}>
              {error}
            </p>
          )}
        </div>

        {/* Bas de page discret : compte + anciens parcours via /compte */}
        <div
          style={{
            marginTop: 80,
            paddingTop: 24,
            borderTop: `1px solid ${palette.line}`,
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            fontFamily: fonts.mono,
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: palette.argentDeep,
          }}
        >
          <Link href="/lugia" style={{ color: palette.argentDeep, textDecoration: "none" }}>À propos de Lugia</Link>
          <Link href="/notre-accompagnement" style={{ color: palette.argentDeep, textDecoration: "none" }}>Notre accompagnement</Link>
          <Link href="/compte" style={{ color: palette.argentDeep, textDecoration: "none" }}>Mon compte</Link>
        </div>
      </div>
    </main>
  );
}
