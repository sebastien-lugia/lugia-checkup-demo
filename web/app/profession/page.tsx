"use client";

/**
 * /profession — choix de la profession (entre home et check-up V3).
 *
 * Trois cartes : médecin généraliste (active), avocat et kiné (grisées,
 * libellées « bientôt »). Le message implicite : Lugia est un moteur
 * d'organisation générique, qui démarre par la médecine de ville et
 * s'étendra à d'autres métiers libéraux. Charte V3 (palette/fonts/jour-nuit).
 *
 * Flux : / → /profession → (médecin généraliste cliqué) → check-up V3.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { paletteFor, fonts, type V3Theme } from "@/lib/v3/tokens";
import { useTheme } from "@/lib/v3/useTheme";
import { ThemeToggleV3 } from "@/components/v3/ThemeToggleV3";
import { createInterviewV3 } from "@/lib/api";
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

type Profession = {
  id: string;
  label: string;
  subtitle: string;
  available: boolean;
};

const PROFESSIONS: Profession[] = [
  {
    id: "medecin_generaliste",
    label: "Médecin généraliste libéral",
    subtitle: "Cabinet solo, en groupe ou MSP",
    available: true,
  },
  { id: "avocat", label: "Avocat", subtitle: "Cabinet d'avocats", available: false },
  { id: "kine", label: "Kinésithérapeute", subtitle: "Cabinet de kiné", available: false },
];

export default function ProfessionPage() {
  const router = useRouter();
  const isAuthReady = useRequireAuth();
  const [theme, setTheme] = useTheme();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const original = document.body.style.background;
    document.body.style.background = paletteFor(theme).paper;
    return () => { document.body.style.background = original; };
  }, [theme]);

  async function handleSelect(p: Profession) {
    if (!p.available || isStarting) return;
    setIsStarting(true);
    setError(null);
    try {
      const { id } = await createInterviewV3();
      router.push(`/checkup/v3-charte?interview=${id}&fresh=1`);
    } catch {
      setError("Impossible de démarrer le check-up. Réessayez dans un instant.");
      setIsStarting(false);
    }
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
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
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

        {/* Retour discret */}
        <button
          type="button"
          onClick={() => router.push("/")}
          style={{
            background: "transparent",
            border: "none",
            color: palette.argentDeep,
            padding: "0 0 32px 0",
            fontFamily: fonts.mono,
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontStyle: "normal",
          }}
        >
          ← Retour
        </button>

        {/* Eyebrow */}
        <p
          style={{
            fontFamily: fonts.mono,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: palette.argentDeep,
            margin: "0 0 14px 0",
            fontStyle: "normal",
          }}
        >
          Étape 1 sur 2
        </p>

        {/* Titre */}
        <h1
          style={{
            fontFamily: fonts.serif,
            fontWeight: 400,
            fontSize: "clamp(32px, 5vw, 44px)",
            lineHeight: 1.15,
            color: palette.navy,
            margin: "0 0 16px 0",
            fontStyle: "normal",
          }}
        >
          Quel est votre métier&nbsp;?
        </h1>

        {/* Sous-titre */}
        <p
          style={{
            fontFamily: fonts.serif,
            fontSize: 16,
            lineHeight: 1.6,
            color: palette.navy,
            opacity: 0.8,
            margin: "0 0 36px 0",
            maxWidth: 560,
            fontStyle: "normal",
          }}
        >
          Lugia commence par les médecins généralistes libéraux. D&apos;autres
          professions arriveront, avec la même approche système.
        </p>

        {/* Liste des cartes profession */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {PROFESSIONS.map((p) => {
            const enabled = p.available && !isStarting;
            return (
              <button
                key={p.id}
                type="button"
                disabled={!enabled}
                onClick={() => handleSelect(p)}
                style={{
                  textAlign: "left",
                  background: p.available
                    ? (theme === "day" ? palette.ivoryLight : palette.ivory)
                    : "transparent",
                  border: `1px solid ${p.available ? palette.lineStrong : palette.line}`,
                  padding: "20px 22px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  cursor: enabled ? "pointer" : "not-allowed",
                  opacity: p.available ? 1 : 0.55,
                  transition: "border-color 200ms ease-out, transform 180ms ease-out",
                  fontStyle: "normal",
                }}
                onMouseEnter={(e) => {
                  if (!enabled) return;
                  e.currentTarget.style.borderColor = palette.navy;
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = p.available ? palette.lineStrong : palette.line;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                  <span
                    style={{
                      fontFamily: fonts.serif,
                      fontSize: 18,
                      fontWeight: 600,
                      color: palette.navy,
                      fontStyle: "normal",
                    }}
                  >
                    {p.label}
                  </span>
                  <span
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 13,
                      color: palette.argentDeep,
                      fontStyle: "normal",
                    }}
                  >
                    {p.subtitle}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: p.available ? palette.navy : palette.argentDeep,
                    padding: "5px 10px",
                    border: `1px solid ${p.available ? palette.navy : palette.line}`,
                    fontStyle: "normal",
                  }}
                >
                  {p.available ? (isStarting ? "Démarrage…" : "Choisir") : "Bientôt"}
                </span>
              </button>
            );
          })}
        </div>

        {error && (
          <p style={{ fontFamily: fonts.sans, fontSize: 13, color: "#7A3320", marginTop: 16 }}>
            {error}
          </p>
        )}

        {/* Note de bas */}
        <p
          style={{
            marginTop: 48,
            fontFamily: fonts.sans,
            fontSize: 13,
            color: palette.argentDeep,
            lineHeight: 1.5,
            fontStyle: "normal",
          }}
        >
          Vous travaillez dans une autre profession libérale et le check-up
          vous intéresserait&nbsp;?{" "}
          <a href="mailto:[email protected]" style={{ color: palette.navy, textDecoration: "underline" }}>
            Écrivez-nous
          </a>
          .
        </p>
      </div>
    </main>
  );
}
