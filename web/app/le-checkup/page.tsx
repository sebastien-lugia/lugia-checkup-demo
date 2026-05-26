"use client";

/**
 * /presentation — page d'introduction au produit Lugia (charte V3, 2026-05-22).
 *
 * Accessible avant login : permet à un médecin de comprendre le positionnement,
 * l'approche, les 3 axes et le rythme avant de s'engager dans le parcours.
 *
 * Structure :
 *  - Header (brand mark + theme toggle)
 *  - Hero (eyebrow + title Lora + lede)
 *  - Constat
 *  - Approche (4 principes)
 *  - 3 axes avec BlocBadges
 *  - Rythme & garanties
 *  - CTA démarrer
 */

import { useState, useEffect } from "react";
import Link from "next/link";

import { paletteFor, fonts, type V3Theme } from "@/lib/v3/tokens";
import { useTheme } from "@/lib/v3/useTheme";
import { ThemeToggleV3 } from "@/components/v3/ThemeToggleV3";
import { BlocBadge } from "@/components/v3/atoms";

function LugiaMark({ color = "currentColor", size = 24 }: { color?: string; size?: number }) {
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

export default function PresentationPage() {
  const [theme, setTheme] = useTheme();
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

        {/* Bouton retour discret sous la marque */}
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
          <span style={{ flexShrink: 0 }}>Méthode</span>
          <span
            aria-hidden="true"
            style={{ flex: 1, height: 1, background: palette.navy400, opacity: 0.4 }}
          />
        </p>

        {/* Title */}
        <h1
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: "0 0 28px",
            color: palette.navy,
            fontStyle: "normal",
          }}
        >
          Le check-up préventif.
        </h1>

        {/* Lede */}
        <p
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(16px, 1.8vw, 19px)",
            fontWeight: 400,
            lineHeight: 1.6,
            color: palette.navy,
            opacity: 0.8,
            margin: "0 0 72px",
            maxWidth: 620,
            fontStyle: "normal",
          }}
        >
          Lugia analyse l&apos;organisation de votre cabinet — pas votre pratique
          médicale, pas vos patients. Le résultat : un état des lieux clair et
          quelques chantiers concrets pour respirer.
        </p>

        {/* Section : Le constat */}
        <Section eyebrow="Le constat" theme={theme}>
          <p style={pStyle(palette, fonts)}>
            La médecine générale libérale tient sur l&apos;engagement personnel.
            L&apos;administratif, le secrétariat, les outils numériques, la
            coordination d&apos;équipe — autant de couches qui s&apos;accumulent et qui
            finissent par peser sur ce qui devrait rester central : la consultation
            elle-même.
          </p>
          <p style={pStyle(palette, fonts)}>
            La plupart des cabinets le ressentent sans avoir le temps de poser un
            diagnostic structuré. Lugia est conçu pour ça — une heure ne suffit pas
            à traiter, mais quinze minutes suffisent à voir clairement où en est
            l&apos;organisation.
          </p>
        </Section>

        {/* Section : L'approche */}
        <Section eyebrow="L'approche" theme={theme}>
          <PrinciplesList
            theme={theme}
            principles={[
              {
                title: "Le système, pas l'individu",
                body:
                  "Le check-up porte sur le système de travail. Aucune notation individuelle, aucune évaluation de votre pratique médicale.",
              },
              {
                title: "Déclaratif, pas terrain",
                body:
                  "On part de votre ressenti et de vos repères. Aucun audit, aucune visite — vous restez seul maître de ce que vous partagez.",
              },
              {
                title: "Aucune donnée patient",
                body:
                  "Le check-up ne demande jamais d’information patient identifiable. Vos réponses portent uniquement sur l’organisation.",
              },
              {
                title: "L'autonomie d'abord",
                body:
                  "Chaque chantier est rédigé pour pouvoir être mené seul. Lugia peut accompagner si vous le souhaitez, c'est une option.",
              },
            ]}
          />
        </Section>

        {/* Section : 3 axes */}
        <Section eyebrow="Trois axes structurent l'analyse" theme={theme}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 8 }}>
            <AxisRow
              theme={theme}
              id="A"
              title="Parcours patient"
              body="De la prise de rendez-vous au suivi des chroniques — comment le patient circule dans votre cabinet."
            />
            <AxisRow
              theme={theme}
              id="B"
              title="Équipe & secrétariat"
              body="Rôles formalisés, transmissions, gestion des absences, charge administrative répartie."
            />
            <AxisRow
              theme={theme}
              id="C"
              title="Outils & dossiers"
              body="Logiciel médical, dossiers structurés, outils numériques de santé, conformité."
            />
          </div>
        </Section>

        {/* Section : Rythme */}
        <Section eyebrow="Le rythme" theme={theme}>
          <p style={pStyle(palette, fonts)}>
            18 questions structurées en 3 blocs. Comptez 12 à 15 minutes — moins si
            vous connaissez bien votre cabinet, un peu plus si vous prenez le temps de
            relire les nuances.
          </p>
          <p style={pStyle(palette, fonts)}>
            Vous pouvez interrompre et reprendre quand vous voulez. À la fin, un
            diagnostic personnalisé sur 3 axes et 7 chantiers triés par effet de levier.
          </p>
        </Section>

        {/* CTA */}
        <div style={{ marginTop: 64, paddingTop: 32, borderTop: `1px solid ${palette.line}`, display: "flex", flexDirection: "column", gap: 16 }}>
          <Link
            href="/login"
            style={{
              alignSelf: "flex-start",
              background: palette.navy,
              color: palette.paper,
              border: "none",
              padding: "14px 30px",
              fontFamily: fonts.sans,
              fontSize: 14,
              fontWeight: 500,
              letterSpacing: "0.02em",
              textDecoration: "none",
              transition: "opacity 200ms ease-out",
              fontStyle: "normal",
            }}
          >
            Démarrer mon check-up →
          </Link>
          <p
            style={{
              fontFamily: fonts.mono,
              fontSize: 10,
              letterSpacing: "0.06em",
              color: palette.navy400,
              margin: 0,
              opacity: 0.75,
              fontStyle: "normal",
            }}
          >
            Accès par lien magique envoyé sur votre email professionnel.
            Aucun mot de passe à retenir.
          </p>
        </div>
      </div>
    </main>
  );
}

/** Section avec eyebrow filet à droite — pattern partagé des autres écrans. */
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
    <section style={{ margin: "0 0 56px" }}>
      <p
        style={{
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: palette.navy400,
          margin: "0 0 22px",
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

function pStyle(palette: ReturnType<typeof paletteFor>, f: typeof fonts): React.CSSProperties {
  return {
    fontFamily: f.serif,
    fontSize: 15,
    lineHeight: 1.7,
    color: palette.navy,
    opacity: 0.78,
    margin: "0 0 18px",
    maxWidth: 620,
    fontStyle: "normal",
  };
}

function PrinciplesList({
  theme,
  principles,
}: {
  theme: V3Theme;
  principles: { title: string; body: string }[];
}) {
  const palette = paletteFor(theme);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {principles.map((p, i) => (
        <div
          key={i}
          style={{
            paddingLeft: 16,
            borderLeft: `1px solid ${palette.lineStrong}`,
          }}
        >
          <p
            style={{
              fontFamily: fonts.serif,
              fontSize: 16,
              fontWeight: 500,
              color: palette.navy,
              margin: "0 0 6px",
              fontStyle: "normal",
            }}
          >
            {p.title}
          </p>
          <p
            style={{
              fontFamily: fonts.sans,
              fontSize: 14,
              lineHeight: 1.6,
              color: palette.navy600,
              margin: 0,
              fontStyle: "normal",
            }}
          >
            {p.body}
          </p>
        </div>
      ))}
    </div>
  );
}

function AxisRow({
  theme,
  id,
  title,
  body,
}: {
  theme: V3Theme;
  id: "A" | "B" | "C";
  title: string;
  body: string;
}) {
  const palette = paletteFor(theme);
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
      <BlocBadge id={id} theme={theme} size="md" />
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontFamily: fonts.serif,
            fontSize: 18,
            fontWeight: 500,
            color: palette.navy,
            margin: "0 0 6px",
            fontStyle: "normal",
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 14,
            lineHeight: 1.6,
            color: palette.navy600,
            margin: 0,
            fontStyle: "normal",
          }}
        >
          {body}
        </p>
      </div>
    </div>
  );
}
