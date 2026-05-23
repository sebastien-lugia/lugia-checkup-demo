"use client";

/**
 * /legal — Mentions légales, charte V3 Lugia (2026-05-22).
 *
 * Page statique. Contenu juridique préservé bit-à-bit depuis la version
 * V1.x ; seule la couche visuelle change (palette navy/ivoire, Lora+Onest+
 * IBM Plex Mono, theme toggle persistant).
 */

import { useState, useEffect } from "react";
import Link from "next/link";

import { paletteFor, fonts, type V3Theme } from "@/lib/v3/tokens";
import { ThemeToggleV3 } from "@/components/v3/ThemeToggleV3";

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

export default function LegalPage() {
  const [theme, setTheme] = useState<V3Theme>(() => {
    if (typeof window === "undefined") return "night";
    try {
      const saved = window.localStorage.getItem("v3-charte-theme");
      if (saved === "day" || saved === "night") return saved;
    } catch { /* */ }
    return "night";
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem("v3-charte-theme", theme); } catch { /* */ }
  }, [theme]);
  useEffect(() => {
    const original = document.body.style.background;
    document.body.style.background = paletteFor(theme).paper;
    return () => { document.body.style.background = original; };
  }, [theme]);

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
        {/* Marque */}
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

        {/* Bouton retour */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              window.history.back();
            } else if (typeof window !== "undefined") {
              window.location.href = "/";
            }
          }}
          style={{
            background: "transparent",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontFamily: fonts.mono,
            fontSize: 11,
            color: palette.navy400,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            transition: "color 180ms ease-out",
            marginBottom: 48,
            fontStyle: "normal",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = palette.navy)}
          onMouseLeave={(e) => (e.currentTarget.style.color = palette.navy400)}
        >
          ← Retour
        </button>

        {/* Eyebrow */}
        <p
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: palette.navy400,
            margin: "0 0 24px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontStyle: "normal",
          }}
        >
          <span
            aria-hidden="true"
            style={{ display: "inline-block", width: 20, height: 1, background: palette.navy400, flexShrink: 0 }}
          />
          <span style={{ flexShrink: 0 }}>Informations légales</span>
          <span
            aria-hidden="true"
            style={{ flex: 1, height: 1, background: palette.navy400, opacity: 0.4 }}
          />
        </p>

        <h1
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: "0 0 56px",
            color: palette.navy,
            fontStyle: "normal",
          }}
        >
          Mentions légales.
        </h1>

        <Section eyebrow="Éditeur" theme={theme}>
          <p style={pStyle(palette)}>Sébastien Boncoeur, particulier.</p>
          <p style={pStyle(palette)}>France.</p>
          <p style={pStyle(palette)}>
            Contact : <a href="mailto:sebastien@lugia.fr" style={linkStyle(palette)}>sebastien@lugia.fr</a>
          </p>
        </Section>

        <Section eyebrow="Directeur de la publication" theme={theme}>
          <p style={pStyle(palette)}>Sébastien Boncoeur.</p>
        </Section>

        <Section eyebrow="Hébergement" theme={theme}>
          <p style={pStyle(palette)}>
            Le site <strong style={{ color: palette.navy, fontWeight: 500 }}>diagnostic.lugia.fr</strong> est hébergé par différents prestataires pour ses composants techniques :
          </p>
          <ul style={{ paddingLeft: 0, margin: "0 0 0", listStyle: "none", display: "flex", flexDirection: "column", gap: 14 }}>
            <ListItem palette={palette}>
              <strong style={{ color: palette.navy, fontWeight: 500 }}>Front-end web</strong> — Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
            </ListItem>
            <ListItem palette={palette}>
              <strong style={{ color: palette.navy, fontWeight: 500 }}>Back-end et base de données</strong> — Render Services Inc., 525 Brannan Street, San Francisco, CA 94107, États-Unis. Données stockées en région Europe (Francfort).
            </ListItem>
            <ListItem palette={palette}>
              <strong style={{ color: palette.navy, fontWeight: 500 }}>Service d&apos;envoi d&apos;email</strong> — Resend Inc., 2261 Market Street #5039, San Francisco, CA 94114, États-Unis. Envois opérés depuis la région Europe (Irlande).
            </ListItem>
            <ListItem palette={palette}>
              <strong style={{ color: palette.navy, fontWeight: 500 }}>Nom de domaine</strong> — OVH SAS, 2 rue Kellermann, 59100 Roubaix, France.
            </ListItem>
          </ul>
        </Section>

        <Section eyebrow="Propriété intellectuelle" theme={theme}>
          <p style={pStyle(palette)}>
            L&apos;ensemble du contenu présent sur ce site (textes, méthode, questionnaire, structure d&apos;analyse, design) est protégé par le droit d&apos;auteur. Toute reproduction, représentation ou diffusion, totale ou partielle, sans autorisation écrite est interdite.
          </p>
        </Section>

        <Section eyebrow="Données personnelles" theme={theme}>
          <p style={pStyle(palette)}>
            Le traitement des données personnelles est décrit en détail dans la <Link href="/confidentialite" style={linkStyle(palette)}>politique de confidentialité</Link>.
          </p>
        </Section>

        <Section eyebrow="Loi applicable" theme={theme}>
          <p style={pStyle(palette)}>
            Le présent site est soumis à la loi française. Tout litige relèvera de la compétence des tribunaux français.
          </p>
        </Section>

        <p
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            letterSpacing: "0.06em",
            color: palette.navy400,
            opacity: 0.7,
            margin: "48px 0 0",
            fontStyle: "normal",
          }}
        >
          Dernière mise à jour : 13 mai 2026.
        </p>
      </div>
    </main>
  );
}

function Section({
  eyebrow,
  theme,
  children,
}: {
  eyebrow: string;
  theme: V3Theme;
  children: React.ReactNode;
}) {
  const palette = paletteFor(theme);
  return (
    <section style={{ margin: "0 0 48px" }}>
      <p
        style={{
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: palette.navy400,
          margin: "0 0 18px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontStyle: "normal",
        }}
      >
        <span style={{ flexShrink: 0 }}>{eyebrow}</span>
        <span
          aria-hidden="true"
          style={{ flex: 1, height: 1, background: palette.navy400, opacity: 0.4 }}
        />
      </p>
      {children}
    </section>
  );
}

function pStyle(palette: ReturnType<typeof paletteFor>): React.CSSProperties {
  return {
    fontFamily: fonts.serif,
    fontSize: 15,
    lineHeight: 1.65,
    color: palette.navy,
    opacity: 0.78,
    margin: "0 0 14px",
    maxWidth: 620,
    fontStyle: "normal",
  };
}

function linkStyle(palette: ReturnType<typeof paletteFor>): React.CSSProperties {
  return {
    color: palette.navy,
    textDecoration: "underline",
    textUnderlineOffset: 2,
  };
}

function ListItem({
  palette,
  children,
}: {
  palette: ReturnType<typeof paletteFor>;
  children: React.ReactNode;
}) {
  return (
    <li
      style={{
        fontFamily: fonts.serif,
        fontSize: 15,
        lineHeight: 1.6,
        color: palette.navy,
        opacity: 0.78,
        paddingLeft: 16,
        position: "relative",
        maxWidth: 620,
        fontStyle: "normal",
      }}
    >
      <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, color: palette.argent }}>·</span>
      {children}
    </li>
  );
}
