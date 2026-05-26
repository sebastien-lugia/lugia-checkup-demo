"use client";

/**
 * V3-brand — écrans du parcours.
 *
 * Quatre écrans dans ce fichier : IntroV3, ProfilStep1V3, ProfilStep2V3,
 * EnergyV3. Regroupés ici parce qu'ils partagent la même structure
 * `shell + eyebrow + h1 + body + cta` — un fichier par écran serait du
 * boilerplate inutile à ce stade.
 *
 * Tous les composants acceptent `theme: V3Theme` et propagent à ChipsFieldV3
 * et aux atomes V3. Aucun italique nulle part.
 *
 * V3-brand-T-V3-5.
 */

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { fonts, paletteFor, type V3Theme } from "@/lib/v3/tokens";
import { ChipsFieldV3, type V3Field } from "./ChipsFieldV3";
import { BlocBadge, Em } from "./atoms";

/* ───────────────────────────────────────────────────────────
 * Shell partagé — wrapper qui pose la grille typo et le padding.
 * ─────────────────────────────────────────────────────────── */

function Shell({
  children,
  theme,
  paddingTop = 88,
  paddingBottom = 96,
}: {
  children: React.ReactNode;
  theme: V3Theme;
  /** Surchargeable selon l'écran (intro a sa propre topbar). */
  paddingTop?: number;
  paddingBottom?: number;
}) {
  const palette = paletteFor(theme);
  return (
    <main
      style={{
        background: palette.paper,
        color: palette.navy,
        minHeight: "100vh",
        paddingTop,
        paddingBottom,
        transition: "background 350ms ease-out, color 350ms ease-out",
      }}
    >
      <div
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "0 24px",
        }}
      >
        {children}
      </div>
    </main>
  );
}

function Eyebrow({
  children,
  theme,
  axis,
}: {
  children: React.ReactNode;
  theme: V3Theme;
  /** Couleur d'axe optionnelle (A/B/C) — pour les eyebrows de bloc. */
  axis?: "A" | "B" | "C";
}) {
  const palette = paletteFor(theme);
  const color = axis ? palette.axes[axis] : palette.navy400;
  return (
    <p
      style={{
        fontFamily: fonts.mono,
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color,
        margin: "0 0 24px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontStyle: "normal",
      }}
    >
      <span
        style={{
          display: "inline-block",
          width: 20,
          height: 1,
          background: color,
        }}
        aria-hidden="true"
      />
      {children}
    </p>
  );
}

function Title({
  children,
  theme,
  size = "lg",
}: {
  children: React.ReactNode;
  theme: V3Theme;
  size?: "lg" | "md";
}) {
  const palette = paletteFor(theme);
  const style: CSSProperties =
    size === "lg"
      ? {
          fontFamily: fonts.serif,
          fontSize: "clamp(32px, 5.5vw, 56px)",
          fontWeight: 400,
          lineHeight: 1.06,
          letterSpacing: "-0.025em",
          margin: "0 0 20px",
          color: palette.navy,
          fontStyle: "normal",
        }
      : {
          fontFamily: fonts.serif,
          fontSize: "clamp(28px, 4vw, 32px)",
          fontWeight: 400,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          margin: "0 0 16px",
          color: palette.navy,
          fontStyle: "normal",
        };
  return <h1 style={style}>{children}</h1>;
}

function Body({ children, theme }: { children: React.ReactNode; theme: V3Theme }) {
  const palette = paletteFor(theme);
  return (
    <p
      style={{
        fontFamily: fonts.sans,
        fontSize: 15,
        lineHeight: 1.75,
        color: palette.navy600,
        maxWidth: 540,
        // Bug fix 2026-05-23 : 40 → 60. CalibProgress est sticky avec
        // marginTop -46 + background paper qui remontait sur les 6 derniers
        // pixels du Body et coupait les descendantes (g, j, p) du sous-titre
        // sur les pages profil_step1 / profil_step2.
        margin: "0 0 60px",
        fontStyle: "normal",
      }}
    >
      {children}
    </p>
  );
}


function BackButtonV3({ onBack, theme }: { onBack: () => void; theme: V3Theme }) {
  const palette = paletteFor(theme);
  return (
    <button
      type="button"
      onClick={onBack}
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
        fontStyle: "normal",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.color = palette.navy)}
      onMouseLeave={(e) => (e.currentTarget.style.color = palette.navy400)}
    >
      ← Précédent
    </button>
  );
}

function PrimaryCta({
  label,
  onClick,
  disabled,
  theme,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  theme: V3Theme;
}) {
  const palette = paletteFor(theme);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: palette.navy,
        color: palette.paper,
        border: "none",
        padding: "13px 28px",
        fontFamily: fonts.sans,
        fontSize: 14,
        fontWeight: 500,
        letterSpacing: "0.02em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "opacity 200ms ease-out",
        fontStyle: "normal",
      }}
    >
      {label}
    </button>
  );
}



function ProfilSub({ children, theme }: { children: React.ReactNode; theme: V3Theme }) {
  const palette = paletteFor(theme);
  return (
    <p
      style={{
        fontFamily: fonts.mono,
        fontSize: 11,
        color: palette.navy400,
        margin: "0 0 32px",
        letterSpacing: "0.04em",
        lineHeight: 1.55,
        fontStyle: "normal",
        maxWidth: 540,
      }}
    >
      {children}
    </p>
  );
}

function CalibProgress({
  done,
  total,
  theme,
}: {
  done: number;
  total: number;
  theme: V3Theme;
}) {
  const palette = paletteFor(theme);
  const pct = Math.round((done / total) * 100);
  return (
    <div
      style={{
        // Sticky avec backdrop qui s'etend sous le Topbar :
        // marginTop -46 fait remonter le box, paddingTop 60 (= 46 Topbar + 14
        // respiration) repose le contenu sous le Topbar. Net : 0 effet layout,
        // mais le fond paper couvre entierement la zone derriere le Topbar
        // (z=50 < 200 du Topbar). Plus de bande visible entre les deux barres.
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: palette.paper,
        transition: "background 350ms ease-out",
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginTop: -46,
        marginBottom: 20,
        paddingTop: 46,
        paddingBottom: 14,
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          flex: 1,
          height: 2,
          background: palette.lineStrong,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: palette.navy,
            transition: "width 350ms ease-out",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: fonts.mono,
          fontSize: 11,
          letterSpacing: "0.08em",
          color: palette.navy400,
          fontStyle: "normal",
          minWidth: 42,
          textAlign: "right",
        }}
      >
        {done} / {total}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
 * IntroV3 — écran d'accueil du parcours.
 *
 * Mise en page reprise du modèle cible `lugia-survey-model.html` :
 * eyebrow « Diagnostic organisationnel », titre serif sur 3 lignes (avec
 * un mot en argent), body, axes-chips, 4 « promises » en grille 2×2
 * (Adaptatif / Métier / Croisé / Opérationnel) chacune avec sa SVG icon,
 * CTA primaire. Le titre est celui demandé par Sébastien (« Où en est
 * votre cabinet aujourd'hui ? »).
 * ═══════════════════════════════════════════════════════════ */

const INTRO_PROMISES: Array<{
  tag: string;
  body: string;
  icon: React.ReactNode;
}> = [
  {
    tag: "Adaptatif",
    body: "Questions calibrées sur votre cabinet",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <line x1="1" y1="5" x2="15" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="5" cy="5" r="2" stroke="currentColor" strokeWidth="1.2" fill="transparent" />
        <line x1="1" y1="11" x2="15" y2="11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="11" cy="11" r="2" stroke="currentColor" strokeWidth="1.2" fill="transparent" />
      </svg>
    ),
  },
  {
    tag: "Métier",
    body: "Reformulations en langage praticien",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <rect x="6" y="1" width="4" height="14" rx="1" stroke="currentColor" strokeWidth="1.2" />
        <rect x="1" y="6" width="14" height="4" rx="1" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    tag: "Croisé",
    body: "Signaux croisés entre les 3 axes",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="2.5" r="1.8" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="2.5" cy="13" r="1.8" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="13.5" cy="13" r="1.8" stroke="currentColor" strokeWidth="1.2" />
        <line x1="8" y1="4.3" x2="2.5" y2="11.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="8" y1="4.3" x2="13.5" y2="11.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="4.3" y1="13" x2="11.7" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    tag: "Opérationnel",
    body: "Plan d'action en 4 étapes",
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <line x1="6" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="6" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="6" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M2 3.5l1.2 1.2L5 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 7.5l1.2 1.2L5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="3" cy="12" r=".8" fill="currentColor" />
      </svg>
    ),
  },
];

export function IntroV3({
  theme = "night",
  onStart,
}: {
  theme?: V3Theme;
  onStart: () => void;
}) {
  const palette = paletteFor(theme);
  return (
    <Shell theme={theme} paddingTop={40} paddingBottom={24}>
      {/* Brand mark + wordmark gauche (page accueil uniquement) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: 14,
          marginBottom: 32,
        }}
      >
        <svg
          width="32"
          height="27"
          viewBox="0 0 261 220"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{ color: palette.navy }}
        >
          <path
            d="M4.89203 214.075C19.1426 199.271 37.0201 179.22 46.4715 167.44C52.3767 160.08 53.9276 158.048 60.2051 149.445C83.8782 117.005 103.023 82.0726 116.337 47.0247C120.033 37.2956 125.447 19.4831 127.971 8.75085L130.028 0L130.837 4.08933C133.48 17.4491 140.016 38.487 146.67 55.0528C163.069 95.8803 187.169 135.548 219.704 175.261C225.982 182.924 246.366 205.454 255.269 214.57C258.398 217.775 260.639 220.212 260.248 219.985C255.879 217.457 223.652 192.442 216.188 185.785C215.774 185.416 212.671 182.712 209.291 179.777C205.912 176.841 201.537 172.997 199.57 171.235C197.603 169.472 194.441 166.644 192.543 164.95C186.414 159.478 169.288 142.646 157.141 130.155C137.343 109.796 135.386 107.893 132.853 106.533C128.294 104.086 127.792 104.46 107.082 125.742C90.6617 142.615 78.1358 154.929 69.6629 162.527C66.1685 165.66 62.4203 169.04 61.3336 170.037C45.4767 184.585 27.0938 199.743 8.44852 213.643C-2.01646 221.445 -2.22738 221.471 4.89203 214.075Z"
            fill="currentColor"
          />
        </svg>
        <span
          style={{
            fontFamily: fonts.mono,
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: palette.navy,
            fontStyle: "normal",
          }}
        >
          Lugia &amp; Co
        </span>
      </div>

      <div>
        <Eyebrow theme={theme}>Diagnostic organisationnel</Eyebrow>

        {/* Titre sur 3 lignes — mot en argent au milieu pour faire respirer.
            Reprend le pattern du modèle cible : Comment fonctionne / vraiment /
            votre cabinet — adapté au titre demandé par Sébastien. */}
        <h1
          style={{
            fontFamily: fonts.serif,
            fontSize: "clamp(28px, 4.5vw, 48px)",
            fontWeight: 400,
            lineHeight: 1.08,
            letterSpacing: "-0.025em",
            margin: "0 0 24px",
            color: palette.navy,
            fontStyle: "normal",
          }}
        >
          Où en est
          <br />
          <Em theme={theme}>votre cabinet</Em>
          <br />
          aujourd&apos;hui&nbsp;?
        </h1>

        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 15,
            lineHeight: 1.75,
            color: palette.navy600,
            maxWidth: 540,
            margin: "0 0 0",
            fontStyle: "normal",
          }}
        >
          25 minutes. 18 questions adaptées à votre profil.
          <br />
          Une analyse qui se construit en temps réel — pour vous donner une
          lecture claire de là où agir en premier.
        </p>

        {/* Phrase d'introduction aux 3 axes (charte A-intro-fix v2) */}
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 15,
            lineHeight: 1.75,
            color: palette.navy600,
            maxWidth: 540,
            margin: "0 0 8px",
            fontStyle: "normal",
          }}
        >
          Ce questionnaire démo couvre trois axes de votre cabinet.
        </p>

        {/* Footnote dans la meme police que la phrase, taille reduite */}
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 12,
            lineHeight: 1.5,
            color: palette.navy400,
            maxWidth: 540,
            margin: "0 0 16px",
            fontStyle: "normal",
          }}
        >
          Version payante étendue à 9 axes.
        </p>

        {/* 3 axes — eyebrow ↳ BLOC X / 3 + BlocBadge + titre (charte C2-C4) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 20,
            marginBottom: 32,
          }}
        >
          {(["A", "B", "C"] as const).map((axis, i) => {
            const labels = {
              A: "Parcours patient.",
              B: "Équipe & secrétariat.",
              C: "Outils & dossiers.",
            };
            return (
              <div
                key={axis}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                <BlocBadge id={axis} theme={theme} size="md" />
                <span
                  style={{
                    fontFamily: fonts.sans,
                    fontSize: 15,
                    fontWeight: 500,
                    lineHeight: 1.25,
                    letterSpacing: "-0.01em",
                    color: palette.navy,
                    fontStyle: "normal",
                  }}
                >
                  {labels[axis]}
                </span>
              </div>
            );
          })}
        </div>

        {/* IA Lugia : apres la presentation des axes */}
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 15,
            lineHeight: 1.6,
            color: palette.navy600,
            maxWidth: 540,
            margin: "0 0 0",
            fontStyle: "normal",
          }}
        >
          À la fin du diagnostic, notre assistant spécialisé Lugia &amp; Co vous accompagne
          sur le chantier choisi pour bâtir un plan en 4 étapes.
        </p>

        {/* Phrase d'intro aux 4 promises */}
        <p
          style={{
            fontFamily: fonts.sans,
            fontSize: 15,
            lineHeight: 1.6,
            color: palette.navy600,
            maxWidth: 540,
            margin: "0 0 16px",
            fontStyle: "normal",
          }}
        >
          Quatre principes structurent la démarche.
        </p>

        {/* Quatre « promises » en grille 2×2 — descriptifs du quoi-attendre */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 36,
          }}
        >
          {INTRO_PROMISES.map((p) => (
            <div
              key={p.tag}
              style={{
                padding: "12px 14px",
                background: theme === "day" ? palette.ivoryLight : palette.ivory,
                border: `1px solid ${palette.line}`,
                fontSize: 13,
                color: palette.navy600,
                lineHeight: 1.5,
                display: "flex",
                flexDirection: "column",
                gap: 6,
                fontStyle: "normal",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <strong
                  style={{
                    fontSize: 10,
                    fontFamily: fonts.mono,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                    color: palette.navy,
                  }}
                >
                  {p.tag}
                </strong>
                <span style={{ color: palette.navy400, flexShrink: 0 }}>
                  {p.icon}
                </span>
              </div>
              {p.body}
            </div>
          ))}
        </div>

        {/* Ligne confidentialité — icône bouclier + texte mono small */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            color: palette.navy400,
            marginBottom: 14,
            fontStyle: "normal",
          }}
        >
          <svg
            width="15"
            height="17"
            viewBox="0 0 14 16"
            fill="none"
            aria-hidden="true"
            style={{ flexShrink: 0 }}
          >
            <path
              d="M7 1 L1 3 V8 c0 3.5 2.5 6.5 6 7 c3.5 -0.5 6 -3.5 6 -7 V3 L7 1z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M4.5 8 L6.3 9.8 L9.5 6.6"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span
            style={{
              fontFamily: fonts.sans,
              fontSize: 13,
              lineHeight: 1.6,
              fontStyle: "normal",
            }}
          >
            Vos réponses sont traitées confidentiellement et ne sont jamais revendues.
          </span>
        </div>

        <div>
          <PrimaryCta label="Commencer le diagnostic →" onClick={onStart} theme={theme} />
        </div>
      </div>
    </Shell>
  );
}

/* ═══════════════════════════════════════════════════════════
 * ProfilStep1V3 — 5 chips factuels.
 * ═══════════════════════════════════════════════════════════ */


/**
 * Test de complétude d'un champ (gère mono et multi).
 * Mono : truthy string. Multi : array non-vide.
 */
function isFieldFilled(field: V3Field, value: string | string[] | undefined): boolean {
  if (field.multi) {
    return Array.isArray(value) && value.length > 0;
  }
  return typeof value === "string" && value.length > 0;
}

/** Champs factuels (cf interview_protocol_v2.json). */
export const PROFIL_STEP1_FIELDS: V3Field[] = [
  {
    id: "cabinet_type",
    label: "Type de cabinet",
    hint: "Configuration actuelle du cabinet",
    wrapAfter: 2,
    options: [
      { id: "solo", label: "Cabinet individuel" },
      { id: "msp", label: "Maison de santé pluripro" },
      { id: "groupe_liberal", label: "Cabinet de groupe" },
      { id: "centre_sante", label: "Centre de santé" },
    ],
  },
  {
    id: "volume",
    label: "Volume hebdomadaire d'actes",
    hint: "Consultations par semaine en moyenne",
    options: [
      { id: "lt_80", label: "Moins de 80 actes" },
      { id: "80_120", label: "80 à 120 actes" },
      { id: "gt_120", label: "Plus de 120 actes" },
    ],
  },
  {
    id: "paramedical_team",
    label: "Équipe paramédicale sur place",
    hint: "Professionnels qui partagent les locaux",
    options: [
      { id: "non", label: "Non" },
      { id: "infirmiere", label: "Infirmière(s)" },
      { id: "plusieurs", label: "Plusieurs paramédicaux" },
      { id: "msp_complete", label: "MSP complète" },
    ],
  },
  {
    id: "secretariat",
    label: "Secrétariat",
    hint: "Comment l'accueil téléphonique est-il assuré ?",
    options: [
      { id: "seul", label: "Géré seul" },
      { id: "interne", label: "Interne (employé du cabinet)" },
      { id: "externe", label: "Externe (plateforme téléphonique)" },
      { id: "mixte", label: "Mixte (interne + externe)" },
    ],
  },
  {
    id: "logiciel_metier",
    label: "Logiciels métier que vous utilisez",
    hint: "Sélectionnez tous ceux que vous utilisez vraiment — ajoutez les autres au besoin",
    multi: true,
    allowFreeAdd: true,
    options: [
      { id: "medidoc", label: "Médidoc" },
      { id: "crossway", label: "Crossway" },
      { id: "cegedim", label: "Cegedim" },
      { id: "doctolib_pro", label: "Doctolib Pro" },
      { id: "maiia", label: "Maiia" },
      { id: "medistory", label: "MédiStory" },
      { id: "hellodoc", label: "HelloDoc" },
    ],
  },
  {
    id: "rdv_canal",
    label: "Comment vos patients prennent-ils RDV ?",
    hint: "Tous les canaux par lesquels passent les patients",
    multi: true,
    allowFreeAdd: true,
    options: [
      { id: "doctolib", label: "Doctolib" },
      { id: "maiia", label: "Maiia" },
      { id: "plateforme_cabinet", label: "Plateforme du cabinet" },
      { id: "mixte", label: "Mixte" },
      { id: "tel_secretariat", label: "Téléphone via secrétariat" },
      { id: "tel_direct", label: "Téléphone direct" },
    ],
  },
];

export function ProfilStep1V3({
  theme = "night",
  onSubmit,
  onBack,
  initial = {},
  onDraftChange,
}: {
  theme?: V3Theme;
  onSubmit: (draft: Record<string, string | string[]>) => void;
  onBack?: () => void;
  initial?: Record<string, string | string[]>;
  /** Callback appelé à chaque modification du draft — pour persister en parent
      sans devoir cliquer sur "Étape suivante". */
  onDraftChange?: (draft: Record<string, string | string[]>) => void;
}) {
  const [draft, setDraft] = useState<Record<string, string | string[]>>(initial);

  // Sync live du draft vers le parent (extras) — permet de préserver
  // l'état lors de la navigation Précédent/Suivant.
  useEffect(() => {
    onDraftChange?.(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);
  const palette = paletteFor(theme);
  const isComplete = PROFIL_STEP1_FIELDS.every((f) => isFieldFilled(f, draft[f.id]));

  return (
    <Shell theme={theme}>
      <Eyebrow theme={theme}>Profil · étape 1 sur 2</Eyebrow>
      <Title theme={theme} size="md">
        Quelques repères sur <Em theme={theme}>votre cabinet</Em>.
      </Title>
      <Body theme={theme}>
        Cinq éléments factuels. Aucune réponse n&apos;est jugée — on cherche juste à
        cadrer le terrain pour la suite.
      </Body>

      <CalibProgress
        done={PROFIL_STEP1_FIELDS.filter((f) => isFieldFilled(f, draft[f.id])).length}
        total={PROFIL_STEP1_FIELDS.length}
        theme={theme}
      />

      {PROFIL_STEP1_FIELDS.map((field) => (
        <ChipsFieldV3
          key={field.id}
          field={field}
          theme={theme}
          value={draft[field.id] ?? null}
          onChange={(next) =>
            setDraft((d) => {
              const updated: Record<string, string | string[]> = { ...d, [field.id]: next };

              // Auto-link 0 : secretariat (interne/externe/mixte) → rdv_canal += tel_secretariat
              if (field.id === "secretariat" && typeof next === "string" && next !== "seul") {
                const rdv = updated.rdv_canal;
                const current = Array.isArray(rdv) ? rdv : [];
                if (!current.includes("tel_secretariat")) {
                  updated.rdv_canal = [...current, "tel_secretariat"];
                }
              }

              // Auto-link 1 : logiciel_metier → rdv_canal (Q4 → Q5)
              if (field.id === "logiciel_metier" && Array.isArray(next)) {
                const AUTO_LINKS: Record<string, string> = {
                  doctolib_pro: "doctolib",
                  maiia: "maiia",
                };
                const rdv = updated.rdv_canal;
                let current = Array.isArray(rdv) ? [...rdv] : [];
                for (const opt of next) {
                  const target = AUTO_LINKS[opt as string];
                  if (target && !current.includes(target)) {
                    current = [...current, target];
                  }
                }
                if (current.length !== (Array.isArray(rdv) ? rdv.length : 0)) {
                  updated.rdv_canal = current;
                }
              }

              return updated;
            })
          }
        />
      ))}

      <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        {onBack ? (
          <BackButtonV3 onBack={onBack} theme={theme} />
        ) : (
          <span aria-hidden="true" />
        )}
        <PrimaryCta
          label="Étape suivante →"
          onClick={() => onSubmit(draft)}
          disabled={!isComplete}
          theme={theme}
        />
      </div>
    </Shell>
  );
}

/* ═══════════════════════════════════════════════════════════
 * ProfilStep2V3 — 4 chips réflexifs.
 * ═══════════════════════════════════════════════════════════ */

export const PROFIL_STEP2_FIELDS: V3Field[] = [
  {
    id: "status",
    label: "Depuis combien de temps exercez-vous ici ?",
    hint: "À ce poste précisément, pas la durée totale d'exercice",
    options: [
      { id: "recent", label: "Récent (moins de 3 ans)" },
      { id: "installe", label: "Installé (3 à 15 ans)" },
      { id: "senior", label: "Senior (plus de 15 ans)" },
    ],
  },
  {
    id: "territoire",
    label: "Comment décririez-vous votre territoire ?",
    hint: "Densité médicale autour du cabinet",
    options: [
      { id: "urbain_dense", label: "Urbain dense" },
      { id: "periurbain", label: "Périurbain" },
      { id: "rural", label: "Rural / semi-rural" },
      { id: "zone_sous_dotee", label: "Zone sous-dotée" },
    ],
  },
  {
    id: "horizon",
    label: "Horizon 3 ans",
    hint: "Plusieurs réponses possibles si vous avez plusieurs objectifs",
    multi: true,
    options: [
      { id: "reconduire", label: "Reconduire à l'identique" },
      { id: "renforcer_equipe", label: "Renforcer l'équipe" },
      { id: "demenager_agrandir", label: "Déménager / agrandir" },
      { id: "preparer_transmission", label: "Préparer la transmission" },
      { id: "incertain", label: "Encore incertain" },
    ],
  },
  {
    id: "motivation",
    label: "Pourquoi ce check-up ?",
    hint: "Toutes les raisons qui comptent pour vous",
    multi: true,
    options: [
      { id: "charge", label: "Réduire ma charge actuelle" },
      { id: "evenement", label: "Anticiper un événement à venir" },
      { id: "risque", label: "Sécuriser un risque identifié" },
      { id: "curiosite", label: "Curiosité" },
    ],
  },
];

export function ProfilStep2V3({
  theme = "night",
  onSubmit,
  onBack,
  initial = {},
  onDraftChange,
}: {
  theme?: V3Theme;
  onSubmit: (draft: Record<string, string | string[]>) => void;
  onBack?: () => void;
  initial?: Record<string, string | string[]>;
  /** Callback appelé à chaque modification du draft — pour persister en parent
      sans devoir cliquer sur "Étape suivante". */
  onDraftChange?: (draft: Record<string, string | string[]>) => void;
}) {
  const [draft, setDraft] = useState<Record<string, string | string[]>>(initial);

  // Sync live du draft vers le parent (extras).
  useEffect(() => {
    onDraftChange?.(draft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);
  const palette = paletteFor(theme);
  const isComplete = PROFIL_STEP2_FIELDS.every((f) => isFieldFilled(f, draft[f.id]));

  return (
    <Shell theme={theme}>
      <Eyebrow theme={theme}>Profil · étape 2 sur 2</Eyebrow>
      <Title theme={theme} size="md">
        Et <Em theme={theme}>vous</Em>, dans tout ça&nbsp;?
      </Title>
      <Body theme={theme}>
        Quatre questions qui éclairent la suite — où vous en êtes, où vous regardez,
        ce qui vous a fait commencer ce check-up.
      </Body>

      <CalibProgress
        done={PROFIL_STEP2_FIELDS.filter((f) => isFieldFilled(f, draft[f.id])).length}
        total={PROFIL_STEP2_FIELDS.length}
        theme={theme}
      />

      {PROFIL_STEP2_FIELDS.map((field) => (
        <ChipsFieldV3
          key={field.id}
          field={field}
          theme={theme}
          value={draft[field.id] ?? null}
          onChange={(next) => setDraft((d) => ({ ...d, [field.id]: next }))}
        />
      ))}

      <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        {onBack ? (
          <BackButtonV3 onBack={onBack} theme={theme} />
        ) : (
          <span aria-hidden="true" />
        )}
        <PrimaryCta
          label="Étape suivante →"
          onClick={() => onSubmit(draft)}
          disabled={!isComplete}
          theme={theme}
        />
      </div>
    </Shell>
  );
}

/* ═══════════════════════════════════════════════════════════
 * EnergyV3 — question d'ancrage (non scorée).
 * ═══════════════════════════════════════════════════════════ */

export const ENERGY_FIELD: V3Field = {
  id: "energy",
  label: "En fin de semaine ordinaire, à quel niveau d'énergie repartez-vous ?",
  options: [
    { id: "energy_a", label: "Bien — je tiens le rythme, c'est soutenable." },
    { id: "energy_b", label: "Tendu, mais ça passe — quelques semaines sont plus dures." },
    { id: "energy_c", label: "Souvent vidé — je récupère sur le week-end." },
    { id: "energy_d", label: "Au bord — je ne sais pas combien de temps je peux tenir." },
  ],
};

export function EnergyV3({
  theme = "night",
  onSubmit,
  onBack,
  initial = null,
}: {
  theme?: V3Theme;
  onSubmit: (id: string) => void;
  onBack?: () => void;
  initial?: string | null;
}) {
  const [value, setValue] = useState<string | null>(initial);
  const palette = paletteFor(theme);

  return (
    <Shell theme={theme}>
      <Eyebrow theme={theme}>Un dernier repère avant les questions</Eyebrow>
      <Title theme={theme} size="md">
        On part de <Em theme={theme}>là où vous en êtes</Em>.
      </Title>
      <Body theme={theme}>
        Cette question n&apos;entre pas dans le score. Elle nous aide juste à formuler
        les retours de manière utile — un cabinet sous tension n&apos;attend pas la
        même chose qu&apos;un cabinet posé.
      </Body>

      {/* Options en pile verticale plutôt qu'en chips horizontales — les libellés
         sont des phrases entières, le format chip serait trop large. */}
      <div
        role="radiogroup"
        aria-label={ENERGY_FIELD.label}
        style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}
      >
        {ENERGY_FIELD.options.map((opt) => {
          const selected = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setValue(opt.id)}
              style={{
                textAlign: "left",
                fontFamily: fonts.serif,
                fontSize: 18,
                lineHeight: 1.45,
                padding: "16px 20px",
                border: `1px solid ${selected ? palette.navy : palette.lineStrong}`,
                background: selected ? palette.ivory : "transparent",
                color: palette.navy,
                cursor: "pointer",
                transition:
                  "background 180ms ease-out, border-color 180ms ease-out",
                fontStyle: "normal",
              }}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
        {onBack ? (
          <BackButtonV3 onBack={onBack} theme={theme} />
        ) : (
          <span aria-hidden="true" />
        )}
        <PrimaryCta
          label="Commencer les questions →"
          onClick={() => value && onSubmit(value)}
          disabled={!value}
          theme={theme}
        />
      </div>
    </Shell>
  );
}
