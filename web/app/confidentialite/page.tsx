"use client";

/**
 * /confidentialite — Politique de confidentialité, charte V3 Lugia.
 *
 * 11 sections RGPD. Contenu juridique préservé bit-à-bit depuis V1.x ;
 * seul l'unique `<em>` (charte interdit l'italique) est remplacé par
 * `<strong>` pour maintenir l'emphase sur "localStorage".
 */

import { useState, useEffect } from "react";
import Link from "next/link";

import { paletteFor, fonts, type V3Theme } from "@/lib/v3/tokens";
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

export default function ConfidentialitePage() {
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
        {/* Marque */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <LugiaMark color={palette.navy} size={28} />
          <span style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: palette.navy, fontStyle: "normal" }}>
            Lugia &amp; Co
          </span>
        </div>

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
            background: "transparent", border: "none", padding: 0, cursor: "pointer",
            fontFamily: fonts.mono, fontSize: 11, color: palette.navy400,
            letterSpacing: "0.08em", textTransform: "uppercase",
            transition: "color 180ms ease-out", marginBottom: 48, fontStyle: "normal",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = palette.navy)}
          onMouseLeave={(e) => (e.currentTarget.style.color = palette.navy400)}
        >
          ← Retour
        </button>

        <p
          style={{
            fontFamily: fonts.mono, fontSize: 10, letterSpacing: "0.18em",
            textTransform: "uppercase", color: palette.navy400,
            margin: "0 0 24px", display: "flex", alignItems: "center", gap: 10, fontStyle: "normal",
          }}
        >
          <span aria-hidden="true" style={{ display: "inline-block", width: 20, height: 1, background: palette.navy400, flexShrink: 0 }} />
          <span style={{ flexShrink: 0 }}>Données personnelles</span>
          <span aria-hidden="true" style={{ flex: 1, height: 1, background: palette.navy400, opacity: 0.4 }} />
        </p>

        <h1
          style={{
            fontFamily: fonts.serif, fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em",
            margin: "0 0 8px", color: palette.navy, fontStyle: "normal",
          }}
        >
          Politique de confidentialité.
        </h1>
        <p
          style={{
            fontFamily: fonts.mono, fontSize: 10, letterSpacing: "0.08em",
            color: palette.navy400, margin: "0 0 36px", fontStyle: "normal",
          }}
        >
          En vigueur au 13 mai 2026.
        </p>

        <p style={{ ...pStyle(palette), margin: "0 0 56px" }}>
          Cette page décrit les données personnelles que Lugia collecte lorsque vous utilisez le check-up préventif disponible sur <strong style={s(palette)}>diagnostic.lugia.fr</strong>, les raisons de cette collecte, et les droits que vous pouvez exercer.
        </p>

        <Section eyebrow="1. Responsable du traitement" theme={theme}>
          <p style={pStyle(palette)}>
            Sébastien Boncoeur, particulier exploitant le projet Lugia. Contact : <a href="mailto:sebastien@lugia.fr" style={linkStyle(palette)}>sebastien@lugia.fr</a>.
          </p>
        </Section>

        <Section eyebrow="2. Données collectées" theme={theme}>
          <p style={pStyle(palette)}>Lugia collecte les données suivantes, et uniquement celles-ci :</p>
          <ul style={ulStyle}>
            <ListItem palette={palette}>Votre <strong style={s(palette)}>adresse email professionnelle</strong>, saisie au moment de la demande d&apos;un lien d&apos;accès.</ListItem>
            <ListItem palette={palette}>Vos <strong style={s(palette)}>réponses au questionnaire</strong> : choix dans les listes proposées et textes que vous saisissez librement.</ListItem>
            <ListItem palette={palette}>Des <strong style={s(palette)}>métadonnées techniques</strong> de votre session : dates de création et de mise à jour des interviews, statut, progression dans le questionnaire, jetons de session techniques.</ListItem>
          </ul>
          <p style={{ ...pStyle(palette), marginTop: 14 }}>
            Lugia <strong style={s(palette)}>ne collecte aucune donnée patient</strong> identifiable. Le questionnaire ne porte que sur le système de travail du cabinet et ne demande aucune information clinique. Lugia vous demande explicitement de ne pas saisir d&apos;élément identifiant dans les zones de texte libre.
          </p>
        </Section>

        <Section eyebrow="3. Finalités du traitement" theme={theme}>
          <p style={pStyle(palette)}>Vos données sont utilisées pour :</p>
          <ul style={ulStyle}>
            <ListItem palette={palette}>vous identifier de manière simple via un lien d&apos;accès envoyé par email, sans mot de passe ;</ListItem>
            <ListItem palette={palette}>générer le rapport personnalisé de votre cabinet à partir de vos réponses ;</ListItem>
            <ListItem palette={palette}>vous permettre d&apos;interrompre et reprendre votre check-up à tout moment ;</ListItem>
            <ListItem palette={palette}>améliorer le contenu et la pertinence du check-up sur la base de retours anonymisés.</ListItem>
          </ul>
        </Section>

        <Section eyebrow="4. Base légale" theme={theme}>
          <p style={pStyle(palette)}>
            Le traitement repose sur votre <strong style={s(palette)}>consentement</strong> (article 6.1.a du RGPD), donné au moment où vous saisissez votre adresse email pour démarrer le check-up. Ce consentement peut être retiré à tout moment via la suppression de votre compte.
          </p>
        </Section>

        <Section eyebrow="5. Destinataires des données" theme={theme}>
          <p style={pStyle(palette)}>Vos données sont accessibles à l&apos;éditeur du site et à ses sous-traitants techniques, qui agissent strictement selon ses instructions :</p>
          <ul style={ulStyle}>
            <ListItem palette={palette}><strong style={s(palette)}>Vercel Inc.</strong> (États-Unis) — hébergement du site web.</ListItem>
            <ListItem palette={palette}><strong style={s(palette)}>Render Services Inc.</strong> (États-Unis) — hébergement de l&apos;API et de la base de données. Les données sont stockées en région Europe (Francfort).</ListItem>
            <ListItem palette={palette}><strong style={s(palette)}>Resend Inc.</strong> (États-Unis) — envoi des emails de lien d&apos;accès. Envois opérés depuis l&apos;Irlande.</ListItem>
          </ul>
          <p style={{ ...pStyle(palette), marginTop: 12 }}>
            Aucune donnée n&apos;est cédée, louée ou vendue à des tiers à des fins commerciales ou publicitaires.
          </p>
        </Section>

        <Section eyebrow="6. Transferts hors Union européenne" theme={theme}>
          <p style={pStyle(palette)}>
            Vercel, Render et Resend sont des sociétés américaines. Bien que les données stockées et envoyées le soient depuis des régions européennes (Francfort, Irlande), un transfert vers les États-Unis peut intervenir pour les besoins d&apos;exploitation. Ces transferts sont encadrés par les clauses contractuelles types de la Commission européenne, et par le cadre Data Privacy Framework auquel adhèrent ces fournisseurs.
          </p>
        </Section>

        <Section eyebrow="7. Durées de conservation" theme={theme}>
          <ul style={ulStyle}>
            <ListItem palette={palette}><strong style={s(palette)}>Liens d&apos;accès magiques</strong> : 30 minutes après émission, jamais réutilisables après usage.</ListItem>
            <ListItem palette={palette}><strong style={s(palette)}>Sessions actives</strong> : 30 jours après connexion, automatiquement expirées au-delà.</ListItem>
            <ListItem palette={palette}><strong style={s(palette)}>Réponses au questionnaire et email</strong> : conservés tant que votre compte est actif. Supprimables à tout moment via la page <Link href="/compte" style={linkStyle(palette)}>Mon compte</Link>.</ListItem>
          </ul>
        </Section>

        <Section eyebrow="8. Vos droits" theme={theme}>
          <p style={pStyle(palette)}>Conformément aux articles 15 à 22 du RGPD, vous disposez à tout moment des droits suivants sur vos données :</p>
          <ul style={ulStyle}>
            <ListItem palette={palette}><strong style={s(palette)}>Droit d&apos;accès</strong> — connaître les données qui vous concernent.</ListItem>
            <ListItem palette={palette}><strong style={s(palette)}>Droit de rectification</strong> — faire corriger une donnée inexacte.</ListItem>
            <ListItem palette={palette}><strong style={s(palette)}>Droit à l&apos;effacement</strong> — supprimer l&apos;ensemble de vos données. Vous pouvez le faire vous-même depuis la page <Link href="/compte" style={linkStyle(palette)}>Mon compte</Link>.</ListItem>
            <ListItem palette={palette}><strong style={s(palette)}>Droit d&apos;opposition</strong> — vous opposer au traitement de vos données pour motif légitime.</ListItem>
            <ListItem palette={palette}><strong style={s(palette)}>Droit à la portabilité</strong> — récupérer vos données dans un format structuré. Sur simple demande par email.</ListItem>
            <ListItem palette={palette}><strong style={s(palette)}>Droit d&apos;introduire une réclamation auprès de la CNIL</strong> — Commission nationale de l&apos;informatique et des libertés, <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={linkStyle(palette)}>www.cnil.fr</a>.</ListItem>
          </ul>
          <p style={{ ...pStyle(palette), marginTop: 14 }}>
            Pour exercer ces droits, écrivez à <a href="mailto:sebastien@lugia.fr" style={linkStyle(palette)}>sebastien@lugia.fr</a>. Une réponse vous sera apportée dans un délai d&apos;un mois.
          </p>
        </Section>

        <Section eyebrow="9. Cookies et stockage local" theme={theme}>
          <p style={pStyle(palette)}>
            Lugia <strong style={s(palette)}>n&apos;utilise pas de cookies tiers</strong> (analytics, publicité, suivi cross-site). Pour maintenir votre session entre deux pages, votre navigateur stocke localement un jeton technique dans son <strong style={s(palette)}>localStorage</strong>. Ce jeton est strictement nécessaire au fonctionnement du site et est automatiquement supprimé lors de la déconnexion ou de la suppression de votre compte.
          </p>
        </Section>

        <Section eyebrow="10. Sécurité" theme={theme}>
          <p style={pStyle(palette)}>
            Toutes les communications entre votre navigateur et nos services sont chiffrées (HTTPS). L&apos;authentification est sans mot de passe (lien magique à usage unique), ce qui élimine le risque de fuite de mots de passe. Les sessions sont opaques et de durée limitée.
          </p>
        </Section>

        <Section eyebrow="11. Modifications de cette politique" theme={theme}>
          <p style={pStyle(palette)}>
            Cette politique peut évoluer au fil de la maturation du produit. La date de mise à jour figure en tête de page. Pour les changements substantiels, une notification par email vous sera adressée si vous disposez d&apos;un compte actif.
          </p>
        </Section>

        <p
          style={{
            fontFamily: fonts.mono, fontSize: 10, letterSpacing: "0.06em",
            color: palette.navy400, opacity: 0.7, margin: "48px 0 0", fontStyle: "normal",
          }}
        >
          Pour toute question relative à cette politique, contactez <a href="mailto:sebastien@lugia.fr" style={{ ...linkStyle(palette), color: palette.navy400 }}>sebastien@lugia.fr</a>.
        </p>
      </div>
    </main>
  );
}

function Section({ eyebrow, theme, children }: { eyebrow: string; theme: V3Theme; children: React.ReactNode }) {
  const palette = paletteFor(theme);
  return (
    <section style={{ margin: "0 0 40px" }}>
      <p
        style={{
          fontFamily: fonts.mono, fontSize: 10, letterSpacing: "0.18em",
          textTransform: "uppercase", color: palette.navy400,
          margin: "0 0 16px", display: "flex", alignItems: "center", gap: 16, fontStyle: "normal",
        }}
      >
        <span style={{ flexShrink: 0 }}>{eyebrow}</span>
        <span aria-hidden="true" style={{ flex: 1, height: 1, background: palette.navy400, opacity: 0.4 }} />
      </p>
      {children}
    </section>
  );
}

const ulStyle: React.CSSProperties = {
  paddingLeft: 0, margin: 0, listStyle: "none",
  display: "flex", flexDirection: "column", gap: 10,
};

function pStyle(palette: ReturnType<typeof paletteFor>): React.CSSProperties {
  return {
    fontFamily: fonts.serif, fontSize: 15, lineHeight: 1.65,
    color: palette.navy, opacity: 0.78,
    margin: "0 0 12px", maxWidth: 620, fontStyle: "normal",
  };
}

function s(palette: ReturnType<typeof paletteFor>): React.CSSProperties {
  return { color: palette.navy, fontWeight: 500 };
}

function linkStyle(palette: ReturnType<typeof paletteFor>): React.CSSProperties {
  return { color: palette.navy, textDecoration: "underline", textUnderlineOffset: 2 };
}

function ListItem({ palette, children }: { palette: ReturnType<typeof paletteFor>; children: React.ReactNode }) {
  return (
    <li
      style={{
        fontFamily: fonts.serif, fontSize: 15, lineHeight: 1.6,
        color: palette.navy, opacity: 0.78,
        paddingLeft: 16, position: "relative", maxWidth: 620, fontStyle: "normal",
      }}
    >
      <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, color: palette.argent }}>·</span>
      {children}
    </li>
  );
}
