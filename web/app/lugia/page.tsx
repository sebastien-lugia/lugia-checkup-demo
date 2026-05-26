"use client";

/**
 * /lugia — À propos de Lugia & Co, ton médecin-centric.
 *
 * Cette page explique qui est Lugia spécifiquement pour les médecins
 * généralistes libéraux : la mission, le positionnement vs autres acteurs,
 * la méthode, et les engagements. Pour la vision élargie (toutes entreprises),
 * voir /notre-accompagnement.
 */

import { useState, useEffect } from "react";
import Link from "next/link";

import { paletteFor, fonts, type V3Theme } from "@/lib/v3/tokens";
import { useTheme } from "@/lib/v3/useTheme";
import { ThemeToggleV3 } from "@/components/v3/ThemeToggleV3";

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

export default function LugiaPage() {
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
          <span style={{ flexShrink: 0 }}>À propos</span>
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
            margin: "0 0 28px",
            color: palette.navy,
            fontStyle: "normal",
          }}
        >
          À propos de Lugia &amp; Co.
        </h1>

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
          Nous sommes convaincus que les entreprises qui tiennent dans la durée
          sont celles dont l&apos;organisation aligne, chaque jour, les moyens
          et les objectifs.
        </p>

        <Section eyebrow="Notre mission" theme={theme}>
          <p style={pStyle(palette)}>
            Aider les entreprises de toute taille et de tout secteur à révolutionner
            leurs processus pour atteindre leurs objectifs. Dans un contexte de
            ruptures technologiques et humaines, les organisations font face à un
            défi de réorganisation structurelle. Y répondre demande une transformation
            intentionnelle — pas subie.
          </p>
        </Section>

        <Section eyebrow="Notre approche" theme={theme}>
          <p style={pStyle(palette)}>
            Nous accompagnons nos clients avec un plan progressif et des
            transformations processus par processus. Sur site pour mener les
            chantiers, en ligne pour caractériser le fonctionnement quotidien
            et mesurer les avancées.
          </p>
          <p style={pStyle(palette)}>
            Nous valorisons l&apos;autonomie de nos clients. Notre valeur ajoutée
            porte sur des actions de terrain déjà cadrées et planifiées — souvent
            avant même la contractualisation.
          </p>
        </Section>

        <Section eyebrow="Notre différenciation" theme={theme}>
          <PrinciplesList theme={theme} principles={[
            {
              title: "Face au consulting traditionnel",
              body: "Proximité constante avec le terrain. Expérience des profils opérationnels de notre collectif — pas du conseil à distance, mais du faire ensemble.",
            },
            {
              title: "Face aux logiciels SaaS",
              body: "Portabilité de notre solution sur votre système informatique. La sécurité de vos données reste sous votre contrôle.",
            },
            {
              title: "La technologie au service du métier",
              body: "Nous ne vendons pas la technologie pour elle-même mais pour la valeur qu'elle apporte. Pour que le temps accordé au métier reprenne ses droits.",
            },
          ]} />
        </Section>

        <Section eyebrow="À qui s'adresse Lugia" theme={theme}>
          <p style={pStyle(palette)}>
            Cette démarche s&apos;adresse à vous si vous reconnaissez l&apos;une
            de ces situations :
          </p>
          <PrinciplesList theme={theme} principles={[
            {
              title: "Vous connaissez vos problèmes",
              body: "Mais vous n'avez pas le temps de les résoudre.",
            },
            {
              title: "Vous doutez",
              body: "Vous ne savez pas par quoi commencer.",
            },
            {
              title: "Vous voulez accélérer votre dynamique",
              body: "Sans brûler les étapes.",
            },
            {
              title: "Vous voulez intégrer une innovation",
              body: "Mais la compétence n'est pas encore dans la maison.",
            },
          ]} />
          <p style={{ ...pStyle(palette), marginTop: 20 }}>
            C&apos;est exactement pour ces situations que nous avons construit Lugia.
          </p>
        </Section>

        <Section eyebrow="Le check-up médecine générale" theme={theme}>
          <p style={pStyle(palette)}>
            Notre premier outil de diagnostic concret est conçu pour les médecins
            généralistes libéraux. Quinze minutes de questions structurées,
            un état des lieux clair de l&apos;organisation du cabinet, et sept
            chantiers actionnables. Voir <Link href="/le-checkup" style={{ color: palette.navy, textDecoration: "underline" }}>le check-up préventif</Link>.
          </p>
        </Section>

        <Section eyebrow="Et après" theme={theme}>
          <p style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(18px, 1.9vw, 22px)",
            fontWeight: 400,
            lineHeight: 1.5,
            color: palette.navy,
            margin: "0",
            maxWidth: 620,
            paddingLeft: 18,
            borderLeft: `2px solid ${palette.argent}`,
            fontStyle: "normal",
          }}>
            Et si prendre de la hauteur sur votre organisation, c’était le
            premier pas vers une transformation où vous reprenez le contrôle ?
          </p>
        </Section>

        <Section eyebrow="Nos engagements" theme={theme}>
          <PrinciplesList theme={theme} principles={[
            {
              title: "Pas de stockage de données identifiables",
              body: "Les diagnostics portent sur l'organisation, jamais sur les personnes. Cette ligne est absolue.",
            },
            {
              title: "Pas de notation individuelle",
              body: "Nos analyses portent sur le système de travail. Aucun individu n'est noté.",
            },
            {
              title: "Respect de l'autonomie",
              body: "Chaque chantier proposé peut être mené sans nous. Lugia est une option d'accompagnement, jamais une dépendance imposée.",
            },
            {
              title: "Transparence des estimations",
              body: "Les gains affichés sont des estimations argumentées, sources et hypothèses explicites — pas des promesses commerciales.",
            },
          ]} />
        </Section>

        <Section eyebrow="Comment nous contacter" theme={theme}>
          <p style={pStyle(palette)}>
            Par email à <a href="mailto:sebastien@lugia.fr" style={{ color: palette.navy, textDecoration: "underline" }}>sebastien@lugia.fr</a>, ou en prenant un rendez-vous de 30 minutes
            via <a href="https://calendly.com/sebastien-lugia/30min" target="_blank" rel="noopener noreferrer" style={{ color: palette.navy, textDecoration: "underline" }}>Calendly</a> pour discuter de votre organisation.
          </p>
        </Section>

        {/* CTA — démarrer le check-up */}
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
            Démarrer le check-up →
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
            12 à 15 minutes. Accès par lien magique sur email professionnel.
          </p>
        </div>
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

function pStyle(palette: ReturnType<typeof paletteFor>): React.CSSProperties {
  return {
    fontFamily: fonts.serif,
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
          style={{ paddingLeft: 16, borderLeft: `1px solid ${palette.lineStrong}` }}
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
