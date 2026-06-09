"use client";

/**
 * /tarifs — page tarifaire publique Lugia (v2 — Pro progressif + Option Max).
 *
 * Structure tarifaire :
 *  - Socle 49 €/mois (libéral solo, 1 utilisateur)
 *  - Pro 149 €/mois + 49 €/utilisateur additionnel (jusqu'à 15 utilisateurs)
 *  - Option Max +200 €/mois (ajoutable à Pro, transformation profonde)
 *  - Au-delà sur devis (16+ utilisateurs, ETI, multi-sites)
 *
 * Le mot « assurance » est volontairement évité (réservé aux produits
 * assurantiels avec courtier partenaire — phase 2). On parle d'engagement
 * de conformité, défendable juridiquement.
 *
 * Disponibilité :
 *  - Socle, Pro mono-utilisateur : disponibles
 *  - Pro multi-utilisateurs (+49 €/user) : T4 2026
 *  - Option Max : S1 2027 (liste d'attente)
 *
 * L'engagement opérateur dans Option Max est de 8 h fixes par an, les heures
 * additionnelles sont facturées au tarif normal (~75 €/h) — décision D-051.
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
    color: palette.navy600,
  };

  const inclusItem = (item: string) => (
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
  );

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

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 24px" }}>
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
            Une structure simple,<br />
            qui grandit avec vous.
          </h1>
          <p style={{ ...bodyStyle, fontSize: 17, maxWidth: 660 }}>
            Trois paliers calibrés pour le libéral seul, le cabinet de groupe, la structure établie. Une option Max ajoutable à tout moment pour aller plus loin — peu importe votre taille.
          </p>
        </section>

        {/* ========== TROIS PALIERS DE BASE ========== */}
        <section style={{ marginBottom: 32 }}>
          <p style={{ ...eyebrowStyle, marginBottom: 4 }}>Paliers de base</p>
          <p style={{ ...bodyStyle, fontSize: 14, color: palette.navy400, marginBottom: 24 }}>
            Le palier qui correspond à votre cabinet aujourd&apos;hui. Vous pouvez ajouter l&apos;Option Max à n&apos;importe quel moment.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {/* ─── SOCLE ─── */}
            <article
              style={{
                border: `1pt solid ${palette.navy200}`,
                borderRadius: 4,
                padding: "28px 22px 26px",
                background: palette.ivoryLight,
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
                Libéral solo (1 utilisateur)
              </p>

              <p style={{ ...bodyStyle, fontSize: 14, marginBottom: 16, color: palette.navy }}>
                Pour rendre votre cabinet lisible et tenir vos obligations réglementaires de base.
              </p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px", flex: 1 }}>
                {[
                  "Diagnostic complet 9 axes",
                  "2 chantiers par mois",
                  "Registre RGPD à jour",
                  "Notice patient conforme 2026",
                  "Schéma vivant de votre cabinet",
                  "Support standard sous 24 h",
                ].map(inclusItem)}
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
                background: palette.ivoryLight,
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
              <p style={{ fontFamily: fonts.sans, fontSize: 13, color: palette.navy400, marginBottom: 4 }}>
                Libéral installé · cabinet de groupe
              </p>
              <p style={{ fontFamily: fonts.mono, fontSize: 11, color: palette.navy, marginBottom: 20, letterSpacing: "0.02em", fontWeight: 500, lineHeight: 1.5 }}>
                + 49 €/siège Acteur additionnel<br />+ 19 €/siège Lecture (secrétaire, assistant)
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
                  "Vue partagée pour tous vos utilisateurs",
                  "Matrice d'accès collective (à partir de 2 utilisateurs)",
                ].map(inclusItem)}
              </ul>

              <p style={{ fontFamily: fonts.mono, fontSize: 10, color: palette.navy400, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Disponible · Multi-utilisateurs T4 2026
              </p>
            </article>

            {/* ─── OPTION MAX ─── */}
            <article
              style={{
                border: `1pt solid rgba(122,96,48,0.45)`,
                borderRadius: 4,
                padding: "28px 22px 26px",
                background: "rgba(122,96,48,0.05)",
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
                  background: "#7A6030",
                  color: "#FBFAF6",
                  fontFamily: fonts.mono,
                  fontSize: 9.5,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "4px 10px",
                  borderRadius: 2,
                }}
              >
                Option · à ajouter à Pro
              </div>

              <p style={{ ...eyebrowStyle, color: "#7A6030" }}>Max — la transformation</p>
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
                + 200&nbsp;€<span style={{ fontSize: 14, fontWeight: 400, color: palette.navy400 }}>/mois</span>
              </p>
              <p style={{ fontFamily: fonts.sans, fontSize: 13, color: palette.navy400, marginBottom: 20 }}>
                Pour aller plus loin, quelle que soit votre taille
              </p>

              <p style={{ ...bodyStyle, fontSize: 14, marginBottom: 16, color: palette.navy }}>
                Un opérateur Lugia mobilisable toute l&apos;année. Un audit terrain annuel. Une vraie démarche de transformation.
              </p>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 18px", flex: 1 }}>
                {[
                  "Audit terrain annuel sur site (1 journée d'opérateur)",
                  "8 h d'opérateur Lugia & Co mobilisables dans l'année",
                  "Audit RGPD externe annuel par DPO partenaire",
                  "Tous les modules add-on inclus (Ordonnances, Synthèse, Reporting, Transmission)",
                  "Success manager dédié + hotline conformité sous 4 h",
                  "Accompagnement opérateur en cas de contrôle (sous 48 h)",
                  "Accès au Cercle Lugia (événements + communauté pairs)",
                  "Préparation à la transmission de cabinet",
                  "Label « Cabinet Lugia certifié »",
                ].map(inclusItem)}
              </ul>

              <p style={{ fontFamily: fonts.mono, fontSize: 10, color: "#7A6030", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Liste d&apos;attente · Lancement S1 2027
              </p>
            </article>
          </div>

          {/* Note sur les heures opérateur */}
          <p style={{ ...bodyStyle, fontSize: 12.5, color: palette.navy400, marginTop: 20, maxWidth: 720 }}>
            Note sur l&apos;Option Max — les 8 h d&apos;opérateur incluses sont mobilisables de façon flexible dans l&apos;année (1 h ici, 4 h là). Au-delà des 8 h consommées, les heures supplémentaires sont facturées au tarif standard Lugia &amp; Co (75 €/h hors site, 600 €/jour sur site). Vous restez maître de votre rythme.
          </p>
        </section>

        {/* ========== COMPOSER VOTRE OFFRE — EXEMPLES ========== */}
        <section style={{ marginBottom: 64, marginTop: 56 }}>
          <p style={{ ...eyebrowStyle, marginBottom: 10 }}>Composer votre offre</p>
          <h2 style={sectionTitleStyle}>Quelques exemples concrets</h2>
          <p style={{ ...bodyStyle, maxWidth: 660, marginBottom: 28 }}>
            La logique est simple : vous prenez le palier de base qui correspond à votre cabinet, et vous ajoutez l&apos;Option Max à n&apos;importe quel moment si vous voulez la démarche de transformation.
          </p>

          <div
            style={{
              border: `0.5pt solid ${palette.navy200}`,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {/* En-tête */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2.2fr 1fr 1fr 1fr",
                background: "rgba(26,35,51,0.04)",
                padding: "12px 16px",
                borderBottom: `0.5pt solid ${palette.navy200}`,
              }}
            >
              <span style={{ ...eyebrowStyle, fontSize: 10 }}>Votre situation</span>
              <span style={{ ...eyebrowStyle, fontSize: 10, textAlign: "right" }}>Palier</span>
              <span style={{ ...eyebrowStyle, fontSize: 10, textAlign: "right" }}>+ Option Max</span>
              <span style={{ ...eyebrowStyle, fontSize: 10, textAlign: "right" }}>Total / mois</span>
            </div>

            {[
              { who: "Médecin libéral solo, démarrage", pro: "Socle", proPrice: "49 €", max: "—", total: "49 €", emphasize: false },
              { who: "Médecin libéral installé seul", pro: "Pro", proPrice: "149 €", max: "—", total: "149 €", emphasize: false },
              { who: "Médecin installé + secrétaire (1 acteur + 1 lecture)", pro: "Pro + Lecture", proPrice: "168 €", max: "—", total: "168 €", emphasize: false },
              { who: "Médecin seul ambitieux + secrétaire", pro: "Pro + Lecture + Max", proPrice: "168 €", max: "+ 200 €", total: "368 €", emphasize: true },
              { who: "Cabinet de groupe (3 praticiens + 1 secrétaire)", pro: "Pro × 3 + Lecture", proPrice: "266 €", max: "—", total: "266 €", emphasize: false },
              { who: "Cabinet de groupe (5 praticiens + 1 secrétaire)", pro: "Pro × 5 + Lecture", proPrice: "364 €", max: "—", total: "364 €", emphasize: false },
              { who: "MSP 8 utilisateurs (6 médecins + 2 secrétaires)", pro: "6 Acteur + 2 Lecture + Max", proPrice: "432 €", max: "+ 200 €", total: "632 €", emphasize: true },
              { who: "PME services B2B 12 utilisateurs (8 acteurs + 4 lecture)", pro: "8 Acteur + 4 Lecture + Max", proPrice: "568 €", max: "+ 200 €", total: "768 €", emphasize: true },
              { who: "Cabinet expert-comptable 15 utilisateurs (12 acteurs + 3 lecture)", pro: "12 Acteur + 3 Lecture", proPrice: "745 €", max: "—", total: "745 €", emphasize: false },
            ].map((row, i, arr) => (
              <div
                key={row.who}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2.2fr 1fr 1fr 1fr",
                  padding: "12px 16px",
                  borderBottom: i < arr.length - 1 ? `0.5pt solid ${palette.navy200}` : "none",
                  alignItems: "center",
                  background: row.emphasize ? "rgba(122,96,48,0.03)" : "transparent",
                }}
              >
                <span style={{ ...bodyStyle, fontSize: 13.5, lineHeight: 1.45 }}>{row.who}</span>
                <span style={{ fontFamily: fonts.serif, fontSize: 13, color: palette.navy, textAlign: "right" }}>
                  {row.proPrice}
                </span>
                <span style={{ fontFamily: fonts.serif, fontSize: 13, color: row.max === "—" ? palette.navy400 : "#7A6030", textAlign: "right", fontWeight: row.max === "—" ? 400 : 600 }}>
                  {row.max}
                </span>
                <span style={{ fontFamily: fonts.serif, fontSize: 14, color: palette.navy, textAlign: "right", fontWeight: 600 }}>
                  {row.total}
                </span>
              </div>
            ))}
          </div>

          <p style={{ ...bodyStyle, fontSize: 12.5, color: palette.navy400, marginTop: 16, maxWidth: 660 }}>
            <strong style={{ color: palette.navy }}>Deux types de sièges sur Pro.</strong> Le siège <strong style={{ color: palette.navy }}>Acteur</strong> (49 €/mois) est pour les personnes qui créent, valident, signent — médecin, juriste associé, expert-comptable. Le siège <strong style={{ color: palette.navy }}>Lecture</strong> (19 €/mois) est pour celles qui consultent et agissent sur du contenu validé — secrétaire, assistant, interne. Les places Lecture ne peuvent pas excéder le nombre de places Acteur ; Acteurs et Lectures comptent dans la limite de 15 utilisateurs. Au-delà de 15, c&apos;est l&apos;offre <strong style={{ color: palette.navy }}>Au-delà</strong> sur devis.
          </p>
        </section>

        {/* ========== ENGAGEMENT RÉGLEMENTAIRE ========== */}
        <section style={{ marginBottom: 64 }}>
          <p style={{ ...eyebrowStyle, marginBottom: 10 }}>Engagement de conformité</p>
          <h2 style={sectionTitleStyle}>Trois niveaux de couverture réglementaire</h2>
          <p style={{ ...bodyStyle, maxWidth: 660, marginBottom: 28 }}>
            Lugia ne se contente pas de produire vos livrables réglementaires. À partir de Pro, nous nous engageons à les maintenir à jour automatiquement, à chaque évolution. Vous n&apos;avez plus à y revenir.
          </p>

          <div
            style={{
              border: `0.5pt solid ${palette.navy200}`,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {/* En-tête */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.8fr 1fr 1fr 1fr",
                background: "rgba(26,35,51,0.04)",
                padding: "12px 16px",
                borderBottom: `0.5pt solid ${palette.navy200}`,
              }}
            >
              <span style={{ ...eyebrowStyle, fontSize: 10 }}>Engagement</span>
              <span style={{ ...eyebrowStyle, fontSize: 10, textAlign: "center" }}>Socle</span>
              <span style={{ ...eyebrowStyle, fontSize: 10, textAlign: "center" }}>Pro</span>
              <span style={{ ...eyebrowStyle, fontSize: 10, textAlign: "center" }}>Pro + Max</span>
            </div>

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
                label: "Audit conformité externe annuel par DPO partenaire",
                socle: "—",
                pro: "—",
                max: "Inclus",
              },
              {
                label: "Accompagnement opérateur en cas de contrôle",
                socle: "—",
                pro: "—",
                max: "4 h sous 48 h",
              },
              {
                label: "Reporting institutionnel (ARS, ordre, CPTS)",
                socle: "—",
                pro: "—",
                max: "Inclus",
              },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.8fr 1fr 1fr 1fr",
                  padding: "12px 16px",
                  borderBottom: i < arr.length - 1 ? `0.5pt solid ${palette.navy200}` : "none",
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
                <span style={{ fontFamily: fonts.serif, fontSize: 13, color: row.max === "—" ? palette.navy400 : "#7A6030", textAlign: "center", fontWeight: row.max !== "—" && row.max !== "Standard" ? 600 : 400 }}>
                  {row.max}
                </span>
              </div>
            ))}
          </div>

          <p style={{ ...bodyStyle, fontSize: 12.5, color: palette.navy400, marginTop: 16, maxWidth: 720 }}>
            Lugia n&apos;est pas un assureur. Les engagements ci-dessus sont contractuels (engagement de mise à jour et d&apos;accompagnement), pas assurantiels au sens du Code des assurances. Pour les structures qui souhaitent une vraie couverture assurance contrôle, un produit dédié est en préparation avec un courtier partenaire (disponibilité prévue 2027).
          </p>
        </section>

        {/* ========== AU-DELÀ : ETI ========== */}
        <section style={{ marginBottom: 64 }}>
          <p style={{ ...eyebrowStyle, marginBottom: 10 }}>Au-delà</p>
          <h2 style={sectionTitleStyle}>Structures plus grandes — sur devis</h2>
          <p style={{ ...bodyStyle, maxWidth: 660, marginBottom: 16 }}>
            Pour les structures de plus de 15 utilisateurs, les multi-sites, les PME et ETI, Lugia propose un accompagnement sur mesure — packagé sur la base de Pro + Option Max, augmenté de l&apos;interopérabilité spécifique, du success management dédié et, à terme, d&apos;une couverture assurance contrôle via courtier partenaire.
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
            borderTop: `0.5pt solid ${palette.navy200}`,
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
