"use client";

/**
 * /tarifs — page tarifaire publique Lugia.
 *
 * Trois paliers visibles : Socle, Pro (avec tarification progressive par
 * utilisateur additionnel), Max (forfaitaire). Soupape ETI sur devis.
 * Section dédiée aux trois niveaux d'engagement réglementaire — argument
 * clé de différenciation vs concurrents AI-first qui promettent l'IA
 * mais pas la conformité.
 *
 * Le mot « assurance » est volontairement évité (réservé aux produits
 * assurantiels avec courtier partenaire — phase 2). On parle d'engagement
 * de conformité, défendable juridiquement.
 *
 * Disponibilité :
 *  - Socle, Pro mono-utilisateur : disponible
 *  - Pro multi-utilisateurs (+49 €/user) : T4 2026
 *  - Max : S1 2027 (liste d'attente sur le formulaire de contact)
 */

import { useEffect } from "react";
import Link from "next/link";

import { paletteFor, fonts } from "@/lib/v3/tokens";
import { useTheme } from "@/lib/v3/useTheme";
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

export default function TarifsPage() {
  const [theme, setTheme] = useTheme();
  useEffect(() => {
    const original = document.body.style.background;
    document.body.style.background = paletteFor(theme).paper;
    return () => { document.body.style.background = original; };
  }, [theme]);

  const palette = paletteFor(theme);

  // Styles communs réutilisables
  const eyebrowStyle: React.CSSProperties = {
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: palette.navy400,
    fontStyle: "normal",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: fonts.sans,
    fontSize: 26,
    fontWeight: 500,
    color: palette.navy,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
    marginBottom: 12,
    marginTop: 48,
  };

  const bodyStyle: React.CSSProperties = {
    fontFamily: fonts.serif,
    fontSize: 15,
    lineHeight: 1.65,
    color: palette.navy600 ?? palette.navy,
  };

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

      <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 24px" }}>
        {/* Header marque */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <LugiaMark color={palette.navy} size={28} />
          <span style={eyebrowStyle}>Lugia &amp; Co</span>
        </div>

        {/* Bouton retour discret */}
        <Link
          href="/"
          style={{
            display: "inline-block",
            fontFamily: fonts.mono,
            fontSize: 11,
            letterSpacing: "0.10em",
            color: palette.navy400,
            textDecoration: "none",
            marginBottom: 32,
          }}
        >
          ← Retour
        </Link>

        {/* ========== HERO ========== */}
        <section style={{ marginBottom: 56 }}>
          <p style={{ ...eyebrowStyle, marginBottom: 16 }}>Tarifs · Lugia</p>
          <h1
            style={{
              fontFamily: fonts.serif,
              fontSize: 44,
              fontWeight: 500,
              color: palette.navy,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              marginBottom: 18,
            }}
          >
            Trois paliers,<br />
            une promesse tenue.
          </h1>
          <p style={{ ...bodyStyle, fontSize: 17, maxWidth: 640 }}>
            Du libéral solo à la structure établie, Lugia s'ajuste à votre cabinet — et vous couvre sur la conformité, à mesure que vous montez en gamme.
          </p>
        </section>

        {/* ========== TROIS PALIERS ========== */}
        <section style={{ marginBottom: 64 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
              marginTop: 8,
            }}
          >
            {/* ─── SOCLE ─── */}
            <article
              style={{
                border: `1pt solid ${palette.navy200 ?? "rgba(26,35,51,0.18)"}`,
                borderRadius: 4,
                padding: "28px 22px 26px",
                background: palette.ivoryLight ?? palette.paper,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <p style={eyebrowStyle}>Socle</p>
              <p
                style={{
                  fontFamily: fonts.serif,
                  fontSize: 32,
                  fontWeight: 500,
                  color: palette.navy,
                  letterSpacing: "-0.02em",
                  margin: "14px 0 4px",
                  lineHeight: 1,
                }}
              >
                49&nbsp;€<span style={{ fontSize: 14, fontWeight: 400, color: palette.navy400 }}>/mois</span>
              </p>
              <p style={{ fontFamily: fonts.sans, fontSize: 13, color: palette.navy400, marginBottom: 20 }}>
                Médecin libéral solo
              </p>

              <p style={{ ...bodyStyle, fontSize: 14, marginBottom: 16, color: palette.navy }}>
                Tout ce qu'il faut pour rendre votre cabinet lisible et tenir vos obligations réglementaires de base.
              </p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px", flex: 1 }}>
                {[
                  "Diagnostic complet 9 axes",
                  "2 chantiers par mois",
                  "Registre RGPD à jour",
                  "Notice patient conforme 2026",
                  "Schéma vivant de votre cabinet",
                  "Support standard sous 24 h",
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      ...bodyStyle,
                      fontSize: 13.5,
                      paddingLeft: 14,
                      textIndent: -14,
                      marginBottom: 6,
                    }}
                  >
                    — {item}
                  </li>
                ))}
              </ul>

              <p style={{ fontFamily: fonts.mono, fontSize: 10, color: palette.navy400, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Disponible
              </p>
            </article>

            {/* ─── PRO ─── */}
            <article
              style={{
                border: `1.5pt solid ${palette.navy}`,
                borderRadius: 4,
                padding: "28px 22px 26px",
                background: palette.ivoryLight ?? palette.paper,
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -12,
                  left: 22,
                  background: palette.navy,
                  color: palette.ivory,
                  fontFamily: fonts.mono,
                  fontSize: 9.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  borderRadius: 2,
                }}
              >
                Le plus choisi
              </div>

              <p style={eyebrowStyle}>Pro</p>
              <p
                style={{
                  fontFamily: fonts.serif,
                  fontSize: 32,
                  fontWeight: 500,
                  color: palette.navy,
                  letterSpacing: "-0.02em",
                  margin: "14px 0 4px",
                  lineHeight: 1,
                }}
              >
                149&nbsp;€<span style={{ fontSize: 14, fontWeight: 400, color: palette.navy400 }}>/mois</span>
              </p>
              <p style={{ fontFamily: fonts.sans, fontSize: 13, color: palette.navy400, marginBottom: 6 }}>
                Libéral installé · cabinet de groupe jusqu'à 5 utilisateurs
              </p>
              <p style={{ fontFamily: fonts.mono, fontSize: 11, color: palette.navy400, marginBottom: 20, letterSpacing: "0.02em" }}>
                + 49 €/mois par utilisateur additionnel
              </p>

              <p style={{ ...bodyStyle, fontSize: 14, marginBottom: 16, color: palette.navy }}>
                La conformité se maintient toute seule. Vous ne revenez plus dessus.
              </p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px", flex: 1 }}>
                {[
                  "Tout le Socle",
                  "Chantiers illimités",
                  "Mise à jour conformité automatique",
                  "Traçabilité auditable activée",
                  "Aide à la rédaction des courriers",
                  "Support prioritaire sous 2 minutes",
                  "Vue partagée pour vos collaborateurs",
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      ...bodyStyle,
                      fontSize: 13.5,
                      paddingLeft: 14,
                      textIndent: -14,
                      marginBottom: 6,
                    }}
                  >
                    — {item}
                  </li>
                ))}
              </ul>

              <p style={{ fontFamily: fonts.mono, fontSize: 10, color: palette.navy400, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Disponible · Multi-utilisateurs T4 2026
              </p>
            </article>

            {/* ─── MAX ─── */}
            <article
              style={{
                border: `1pt solid ${palette.navy200 ?? "rgba(26,35,51,0.18)"}`,
                borderRadius: 4,
                padding: "28px 22px 26px",
                background: palette.ivoryLight ?? palette.paper,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <p style={eyebrowStyle}>Max</p>
              <p
                style={{
                  fontFamily: fonts.serif,
                  fontSize: 32,
                  fontWeight: 500,
                  color: palette.navy,
                  letterSpacing: "-0.02em",
                  margin: "14px 0 4px",
                  lineHeight: 1,
                }}
              >
                499&nbsp;€<span style={{ fontSize: 14, fontWeight: 400, color: palette.navy400 }}>/mois</span>
              </p>
              <p style={{ fontFamily: fonts.sans, fontSize: 13, color: palette.navy400, marginBottom: 20 }}>
                Structure 6 à 15 utilisateurs · MSP, cabinet groupe, PME
              </p>

              <p style={{ ...bodyStyle, fontSize: 14, marginBottom: 16, color: palette.navy }}>
                Le collectif riche. Un opérateur Lugia mobilisable quand vos chantiers en valent la peine.
              </p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px", flex: 1 }}>
                {[
                  "Tout le Pro pour tous vos utilisateurs",
                  "Matrice d'accès collective",
                  "Reporting structuré pour vos institutions (ARS, ordre)",
                  "Connecteur DPI principal (Weda · HelloDoc · Crossway)",
                  "4 h par an d'opérateur Lugia & Co sur le terrain",
                  "Accompagnement en cas de contrôle",
                  "Point trimestriel avec un référent dédié",
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      ...bodyStyle,
                      fontSize: 13.5,
                      paddingLeft: 14,
                      textIndent: -14,
                      marginBottom: 6,
                    }}
                  >
                    — {item}
                  </li>
                ))}
              </ul>

              <p style={{ fontFamily: fonts.mono, fontSize: 10, color: "#7A6030", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Liste d'attente · Lancement S1 2027
              </p>
            </article>
          </div>
        </section>

        {/* ========== ENGAGEMENT RÉGLEMENTAIRE ========== */}
        <section style={{ marginBottom: 64 }}>
          <p style={{ ...eyebrowStyle, marginBottom: 10 }}>Engagement de conformité</p>
          <h2 style={sectionTitleStyle}>Trois niveaux de couverture réglementaire</h2>
          <p style={{ ...bodyStyle, maxWidth: 640, marginBottom: 28 }}>
            Lugia ne se contente pas de produire vos livrables réglementaires. Sur le Pro et le Max, nous nous engageons à les maintenir à jour, automatiquement, à chaque évolution. Vous n'avez plus à y revenir.
          </p>

          <div
            style={{
              border: `0.5pt solid ${palette.navy200 ?? "rgba(26,35,51,0.18)"}`,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {/* En-tête */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
                background: "rgba(26,35,51,0.04)",
                padding: "12px 16px",
                borderBottom: `0.5pt solid ${palette.navy200 ?? "rgba(26,35,51,0.18)"}`,
              }}
            >
              <span style={{ ...eyebrowStyle, fontSize: 10 }}>Engagement</span>
              <span style={{ ...eyebrowStyle, fontSize: 10, textAlign: "center" }}>Socle</span>
              <span style={{ ...eyebrowStyle, fontSize: 10, textAlign: "center" }}>Pro</span>
              <span style={{ ...eyebrowStyle, fontSize: 10, textAlign: "center" }}>Max</span>
            </div>

            {/* Lignes */}
            {[
              {
                label: "Livrables réglementaires produits (registre RGPD, notice patient)",
                socle: "Oui",
                pro: "Oui",
                max: "Oui",
              },
              {
                label: "Mise à jour automatique aux nouvelles obligations",
                socle: "À la demande",
                pro: "Automatique",
                max: "Automatique",
              },
              {
                label: "Traçabilité auditable (logs, versions, signatures)",
                socle: "—",
                pro: "Oui",
                max: "Oui",
              },
              {
                label: "Accompagnement opérateur en cas de contrôle",
                socle: "—",
                pro: "—",
                max: "4 h sous 48 h",
              },
              {
                label: "Clauses contractuelles renforcées",
                socle: "Standard",
                pro: "Standard",
                max: "Renforcées",
              },
              {
                label: "Reporting institutionnel (ARS, ordre, CPTS)",
                socle: "—",
                pro: "—",
                max: "Inclus",
              },
            ].map((row, i) => (
              <div
                key={row.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.6fr 1fr 1fr 1fr",
                  padding: "12px 16px",
                  borderBottom: i < 5 ? `0.5pt solid ${palette.navy200 ?? "rgba(26,35,51,0.10)"}` : "none",
                  alignItems: "center",
                }}
              >
                <span style={{ ...bodyStyle, fontSize: 13.5, lineHeight: 1.5 }}>{row.label}</span>
                <span style={{ fontFamily: fonts.serif, fontSize: 13, color: row.socle === "—" ? palette.navy400 : palette.navy, textAlign: "center" }}>
                  {row.socle}
                </span>
                <span style={{ fontFamily: fonts.serif, fontSize: 13, color: row.pro === "—" ? palette.navy400 : palette.navy, textAlign: "center", fontWeight: row.pro !== "—" && row.pro !== "Standard" ? 600 : 400 }}>
                  {row.pro}
                </span>
                <span style={{ fontFamily: fonts.serif, fontSize: 13, color: row.max === "—" ? palette.navy400 : palette.navy, textAlign: "center", fontWeight: row.max !== "—" && row.max !== "Standard" ? 600 : 400 }}>
                  {row.max}
                </span>
              </div>
            ))}
          </div>

          <p style={{ ...bodyStyle, fontSize: 12.5, color: palette.navy400, marginTop: 16, maxWidth: 720 }}>
            Lugia n'est pas un assureur. Les engagements ci-dessus sont contractuels (engagement de mise à jour et d'accompagnement), pas assurantiels au sens du Code des assurances. Pour les structures qui souhaitent une vraie couverture assurance contrôle, un produit dédié est en préparation avec un courtier partenaire (disponibilité prévue 2027).
          </p>
        </section>

        {/* ========== AU-DELÀ : ETI ========== */}
        <section style={{ marginBottom: 64 }}>
          <p style={{ ...eyebrowStyle, marginBottom: 10 }}>Au-delà</p>
          <h2 style={sectionTitleStyle}>Structures plus grandes — sur devis</h2>
          <p style={{ ...bodyStyle, maxWidth: 640, marginBottom: 16 }}>
            Pour les structures de plus de 15 utilisateurs, les multi-sites, les PME et ETI, Lugia propose un accompagnement sur mesure — packagé sur la base de Max, augmenté de l'interopérabilité spécifique, du success management dédié et, à terme, d'une couverture assurance contrôle via courtier partenaire.
          </p>
          <p style={{ ...bodyStyle, fontSize: 14, color: palette.navy400 }}>
            <Link href="mailto:[email protected]" style={{ color: palette.navy, textDecoration: "underline", textUnderlineOffset: 4 }}>
              [email protected]
            </Link>
            {" "}— réponse sous 48 h ouvrées.
          </p>
        </section>

        {/* ========== CTA FINAL ========== */}
        <section
          style={{
            borderTop: `0.5pt solid ${palette.navy200 ?? "rgba(26,35,51,0.18)"}`,
            paddingTop: 40,
            marginTop: 24,
          }}
        >
          <p style={{ ...eyebrowStyle, marginBottom: 10 }}>Pour commencer</p>
          <h2 style={{ ...sectionTitleStyle, marginTop: 0 }}>Faites votre audit gratuit.</h2>
          <p style={{ ...bodyStyle, maxWidth: 540, marginBottom: 24 }}>
            Trente minutes. Aucune donnée patient demandée. Vous repartez avec un PDF, un chantier prioritaire, un plan en quatre étapes. Vous restez maître de la suite.
          </p>

          <Link
            href="/checkup"
            style={{
              display: "inline-block",
              fontFamily: fonts.sans,
              fontSize: 14,
              fontWeight: 500,
              color: palette.navy,
              textDecoration: "underline",
              textUnderlineOffset: 6,
              textDecorationThickness: 1,
            }}
          >
            Voir où en est votre cabinet — diagnostic.lugia.fr
          </Link>
        </section>

        {/* Espace bas */}
        <div style={{ height: 32 }}></div>
      </div>
    </main>
  );
}
