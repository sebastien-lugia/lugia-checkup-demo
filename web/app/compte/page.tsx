"use client";

/**
 * /compte — Mon compte, charte V3 Lugia (2026-05-22).
 *
 * 4 vues conditionnelles :
 *  - loading (auth pas prête)
 *  - deleted (après suppression réussie)
 *  - onboarding (?from=onboarding, post-magic-link, demande du prénom)
 *  - default (compte connecté : prénom, email, suppression)
 *
 * Logique métier préservée : useRequireAuth, getMyProfile,
 * updateMyProfile, deleteAccount, clearSession. Seule la couche visuelle
 * change. Le danger-zone rouge est remplacé par signalWarn ambre charte
 * (cohérent avec RiskBadge "crit" du diagnostic).
 */

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { deleteAccount, getMyProfile, updateMyProfile } from "@/lib/api";
import {
  clearSession,
  getSessionEmail,
  useRequireAuth,
} from "@/lib/auth";
import { paletteFor, fonts, type V3Theme } from "@/lib/v3/tokens";
import { ThemeToggleV3 } from "@/components/v3/ThemeToggleV3";

const CONFIRM_KEYWORD = "SUPPRIMER";

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

function ComptePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOnboarding = searchParams.get("from") === "onboarding";
  const isAuthReady = useRequireAuth();

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

  const [email, setEmail] = useState<string | null>(null);
  const [firstname, setFirstname] = useState("");
  const [firstnameStatus, setFirstnameStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [confirmInput, setConfirmInput] = useState("");
  const [status, setStatus] = useState<"idle" | "deleting" | "deleted" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthReady) return;
    setEmail(getSessionEmail());
    (async () => {
      try {
        const profile = await getMyProfile();
        setFirstname(profile.firstname || "");
      } catch { /* */ }
    })();
  }, [isAuthReady]);

  async function handleSaveFirstname() {
    setFirstnameStatus("saving");
    try {
      const trimmed = firstname.trim();
      await updateMyProfile(trimmed || null);
      if (isOnboarding) { router.replace("/"); return; }
      setFirstnameStatus("saved");
      setTimeout(() => setFirstnameStatus("idle"), 1800);
    } catch {
      setFirstnameStatus("error");
    }
  }

  async function handleDelete() {
    if (confirmInput.trim().toUpperCase() !== CONFIRM_KEYWORD) {
      setErrorMsg(`Pour confirmer, tapez exactement ${CONFIRM_KEYWORD} dans le champ ci-dessus.`);
      setStatus("error");
      return;
    }
    setStatus("deleting");
    setErrorMsg(null);
    try {
      await deleteAccount();
      clearSession();
      setStatus("deleted");
    } catch {
      setErrorMsg("La suppression a échoué. Réessayez ou contactez sebastien@lugia.fr.");
      setStatus("error");
    }
  }

  if (!isAuthReady) {
    return (
      <Shell theme={theme} setTheme={setTheme}>
        <p style={{ fontFamily: fonts.mono, fontSize: 11, color: palette.navy400, letterSpacing: "0.08em", fontStyle: "normal" }}>
          Chargement…
        </p>
      </Shell>
    );
  }

  if (status === "deleted") {
    return (
      <Shell theme={theme} setTheme={setTheme}>
        <BrandHeader palette={palette} />
        <Eyebrow theme={theme}>Compte supprimé</Eyebrow>
        <H1 palette={palette}>Compte supprimé.</H1>
        <p style={pStyle(palette)}>
          Toutes les données associées à <strong style={s(palette)}>{email}</strong> ont été définitivement effacées de nos bases : réponses, scores, chantiers, jetons d&apos;authentification et sessions.
        </p>
        <p style={{ ...pStyle(palette), fontSize: 14, opacity: 0.65 }}>
          Vous pouvez reprendre un nouveau check-up à tout moment en saisissant à nouveau votre email.
        </p>
        <PrimaryButton palette={palette} onClick={() => router.push("/login")}>
          Retour à l&apos;accueil →
        </PrimaryButton>
      </Shell>
    );
  }

  if (isOnboarding) {
    return (
      <Shell theme={theme} setTheme={setTheme}>
        <BrandHeader palette={palette} />
        <Eyebrow theme={theme}>Première connexion</Eyebrow>
        <H1 palette={palette}>Bienvenue.</H1>
        <p style={pStyle(palette)}>
          Comment voulez-vous être appelé&middot;e ? Ce prénom sera affiché en en-tête de votre rapport personnel. Vous pourrez le modifier à tout moment depuis votre compte.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, marginTop: 24 }}>
          <input
            type="text"
            value={firstname}
            onChange={(e) => { setFirstname(e.target.value); if (firstnameStatus !== "idle") setFirstnameStatus("idle"); }}
            placeholder="Prénom"
            maxLength={60}
            autoFocus
            style={inputStyle(palette, theme)}
          />
          <PrimaryButton palette={palette} onClick={handleSaveFirstname} disabled={firstnameStatus === "saving"}>
            {firstnameStatus === "saving" ? "Enregistrement…" : "Continuer →"}
          </PrimaryButton>
        </div>
        {firstnameStatus === "error" && (
          <p style={{ ...pStyle(palette), color: palette.signalWarn.default, fontSize: 13, marginTop: 8 }}>
            Erreur, réessayez.
          </p>
        )}

        <button
          onClick={() => router.replace("/")}
          style={ghostLink(palette)}
        >
          Passer cette étape
        </button>
      </Shell>
    );
  }

  return (
    <Shell theme={theme} setTheme={setTheme}>
      <BrandHeader palette={palette} />

      <button
        type="button"
        onClick={() => router.push("/")}
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

      <Eyebrow theme={theme}>Mon compte</Eyebrow>
      <H1 palette={palette}>Mon compte.</H1>

      {/* Engagement Lugia — filet argent comme l'encart "Avec Lugia" */}
      <section
        style={{
          margin: "0 0 48px",
          padding: "18px 22px",
          background: theme === "day" ? palette.ivoryLight : palette.ivory,
          borderTop: `1px solid ${palette.line}`,
          borderRight: `1px solid ${palette.line}`,
          borderBottom: `1px solid ${palette.line}`,
          borderLeft: `2px solid ${palette.argent}`,
        }}
      >
        <p
          style={{
            fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.18em",
            textTransform: "uppercase", color: palette.argentDeep,
            margin: "0 0 10px", fontStyle: "normal",
          }}
        >
          Notre engagement
        </p>
        <p style={{ ...pStyle(palette), fontSize: 14, marginBottom: 10 }}>
          Lugia est conçu pour respecter le secret médical et votre indépendance professionnelle. Concrètement :
        </p>
        <ul style={{ paddingLeft: 0, margin: "0 0 10px", listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          <ListItem palette={palette}>aucune donnée identifiable de vos patients n&apos;est saisie pendant le check-up ;</ListItem>
          <ListItem palette={palette}>vos réponses ne sont jamais partagées avec un tiers, ni utilisées pour de la publicité ;</ListItem>
          <ListItem palette={palette}>vous gardez le contrôle complet : modifier votre prénom, consulter vos données, ou tout effacer définitivement.</ListItem>
        </ul>
        <p style={{ ...pStyle(palette), fontSize: 13, opacity: 0.65, margin: 0 }}>
          Pour les détails techniques (finalités, durée de conservation, sous-traitants), voir la <a href="/confidentialite" style={linkStyle(palette)}>politique de confidentialité</a>.
        </p>
      </section>

      <Section eyebrow="Prénom" theme={theme}>
        <p style={{ ...pStyle(palette), fontSize: 13, marginBottom: 14 }}>
          Affiché en en-tête de votre rapport personnel. Optionnel.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <input
            type="text"
            value={firstname}
            onChange={(e) => { setFirstname(e.target.value); if (firstnameStatus !== "idle") setFirstnameStatus("idle"); }}
            placeholder="Prénom"
            maxLength={60}
            style={inputStyle(palette, theme)}
          />
          <PrimaryButton palette={palette} onClick={handleSaveFirstname} disabled={firstnameStatus === "saving"}>
            {firstnameStatus === "saving" ? "Enregistrement…" : "Enregistrer"}
          </PrimaryButton>
          {firstnameStatus === "saved" && (
            <span style={{ fontFamily: fonts.mono, fontSize: 11, color: palette.argentDeep, letterSpacing: "0.08em" }}>
              ✓ Enregistré
            </span>
          )}
          {firstnameStatus === "error" && (
            <span style={{ fontFamily: fonts.mono, fontSize: 11, color: palette.signalWarn.default, letterSpacing: "0.08em" }}>
              Erreur, réessayez
            </span>
          )}
        </div>
      </Section>

      <Section eyebrow="Email de connexion" theme={theme}>
        <p style={{ ...pStyle(palette), fontSize: 16 }}>
          {email}
        </p>
      </Section>

      <Section eyebrow="Vos données chez Lugia" theme={theme}>
        <p style={pStyle(palette)}>Lugia conserve uniquement les informations suivantes :</p>
        <ul style={{ paddingLeft: 0, margin: "0 0 14px", listStyle: "none", display: "flex", flexDirection: "column", gap: 6 }}>
          <ListItem palette={palette}>votre adresse email,</ListItem>
          <ListItem palette={palette}>vos réponses au questionnaire,</ListItem>
          <ListItem palette={palette}>les scores et chantiers calculés à partir de vos réponses,</ListItem>
          <ListItem palette={palette}>les jetons techniques d&apos;authentification (expiration automatique).</ListItem>
        </ul>
        <p style={{ ...pStyle(palette), fontSize: 13, opacity: 0.7 }}>
          Pour le détail des finalités et de la durée de conservation, consultez la <a href="/confidentialite" style={linkStyle(palette)}>politique de confidentialité</a>.
        </p>
      </Section>

      {/* Danger zone — filet signalWarn ambre */}
      <section
        style={{
          margin: "8px 0 32px",
          padding: "20px 22px",
          background: palette.signalWarn.surface,
          borderTop: `1px solid ${palette.signalWarn.border}`,
          borderRight: `1px solid ${palette.signalWarn.border}`,
          borderBottom: `1px solid ${palette.signalWarn.border}`,
          borderLeft: `2px solid ${palette.signalWarn.default}`,
        }}
      >
        <p
          style={{
            fontFamily: fonts.mono, fontSize: 9, letterSpacing: "0.18em",
            textTransform: "uppercase", color: palette.signalWarn.default,
            margin: "0 0 12px", fontStyle: "normal",
          }}
        >
          Action irréversible
        </p>
        <h2
          style={{
            fontFamily: fonts.serif, fontSize: 17, fontWeight: 500,
            color: palette.signalWarn.default, margin: "0 0 10px", fontStyle: "normal",
          }}
        >
          Supprimer mon compte et toutes mes données
        </h2>
        <p style={{ ...pStyle(palette), color: palette.signalWarn.default, fontSize: 13.5, opacity: 1, maxWidth: "none" }}>
          Cette action est <strong style={{ color: palette.signalWarn.default, fontWeight: 500 }}>définitive et irréversible</strong>. Toutes vos réponses au check-up, les scores et chantiers associés, vos jetons d&apos;accès et sessions seront supprimés sans possibilité de récupération.
        </p>
        <p style={{ ...pStyle(palette), color: palette.signalWarn.default, fontSize: 13.5, opacity: 0.85, maxWidth: "none" }}>
          <strong style={{ color: palette.signalWarn.default, fontWeight: 500 }}>À noter</strong> : vous perdrez tout point de comparaison pour un futur check-up. Pour simplement recommencer le questionnaire, pas besoin de supprimer le compte.
        </p>
        <p style={{ ...pStyle(palette), color: palette.signalWarn.default, fontSize: 13.5, opacity: 0.85, maxWidth: "none", marginBottom: 12 }}>
          Pour confirmer, tapez{" "}
          <code style={{
            fontFamily: fonts.mono, fontSize: 12, fontWeight: 600,
            background: palette.paper, color: palette.signalWarn.default,
            border: `1px solid ${palette.signalWarn.border}`,
            padding: "2px 8px",
          }}>
            {CONFIRM_KEYWORD}
          </code>{" "}
          dans le champ ci-dessous.
        </p>
        <input
          type="text"
          value={confirmInput}
          onChange={(e) => {
            setConfirmInput(e.target.value);
            if (status === "error") { setStatus("idle"); setErrorMsg(null); }
          }}
          placeholder={CONFIRM_KEYWORD}
          disabled={status === "deleting"}
          style={{
            width: "100%", marginTop: 4, marginBottom: 14,
            padding: "10px 14px",
            background: palette.paper,
            borderTop: `1px solid ${palette.signalWarn.border}`,
            borderRight: `1px solid ${palette.signalWarn.border}`,
            borderBottom: `1px solid ${palette.signalWarn.border}`,
            borderLeft: `1px solid ${palette.signalWarn.border}`,
            fontFamily: fonts.sans, fontSize: 15, color: palette.signalWarn.default,
            outline: "none", fontStyle: "normal",
            opacity: status === "deleting" ? 0.5 : 1,
          }}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <button
            onClick={handleDelete}
            disabled={status === "deleting" || confirmInput.trim().toUpperCase() !== CONFIRM_KEYWORD}
            style={{
              background: palette.signalWarn.default, color: palette.paper,
              border: "none", padding: "12px 24px",
              fontFamily: fonts.sans, fontSize: 14, fontWeight: 500,
              letterSpacing: "0.02em",
              cursor: (status === "deleting" || confirmInput.trim().toUpperCase() !== CONFIRM_KEYWORD) ? "not-allowed" : "pointer",
              opacity: (status === "deleting" || confirmInput.trim().toUpperCase() !== CONFIRM_KEYWORD) ? 0.5 : 1,
              transition: "opacity 200ms ease-out", fontStyle: "normal",
            }}
          >
            {status === "deleting" ? "Suppression…" : "Supprimer définitivement"}
          </button>
          <button
            onClick={() => router.push("/")}
            disabled={status === "deleting"}
            style={{
              background: palette.paper, color: palette.signalWarn.default,
              borderTop: `1px solid ${palette.signalWarn.border}`,
              borderRight: `1px solid ${palette.signalWarn.border}`,
              borderBottom: `1px solid ${palette.signalWarn.border}`,
              borderLeft: `1px solid ${palette.signalWarn.border}`,
              padding: "11px 23px",
              fontFamily: fonts.sans, fontSize: 14, fontWeight: 500,
              letterSpacing: "0.02em",
              cursor: status === "deleting" ? "not-allowed" : "pointer",
              opacity: status === "deleting" ? 0.5 : 1,
              transition: "opacity 200ms ease-out", fontStyle: "normal",
            }}
          >
            Annuler
          </button>
        </div>
        {errorMsg && (
          <div style={{
            marginTop: 14, padding: "10px 14px",
            background: palette.paper,
            borderTop: `1px solid ${palette.signalWarn.border}`,
            borderRight: `1px solid ${palette.signalWarn.border}`,
            borderBottom: `1px solid ${palette.signalWarn.border}`,
            borderLeft: `1px solid ${palette.signalWarn.border}`,
            fontFamily: fonts.sans, fontSize: 13, lineHeight: 1.5,
            color: palette.signalWarn.default, fontStyle: "normal",
          }}>
            {errorMsg}
          </div>
        )}
      </section>
    </Shell>
  );
}

function Shell({
  theme, setTheme, children,
}: {
  theme: V3Theme;
  setTheme: React.Dispatch<React.SetStateAction<V3Theme>>;
  children: React.ReactNode;
}) {
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
        {children}
      </div>
    </main>
  );
}

function BrandHeader({ palette }: { palette: ReturnType<typeof paletteFor> }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
      <LugiaMark color={palette.navy} size={28} />
      <span style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: palette.navy, fontStyle: "normal" }}>
        Lugia &amp; Co
      </span>
    </div>
  );
}

function Eyebrow({ theme, children }: { theme: V3Theme; children: React.ReactNode }) {
  const palette = paletteFor(theme);
  return (
    <p
      style={{
        fontFamily: fonts.mono, fontSize: 10, letterSpacing: "0.18em",
        textTransform: "uppercase", color: palette.navy400,
        margin: "0 0 24px", display: "flex", alignItems: "center", gap: 10, fontStyle: "normal",
      }}
    >
      <span aria-hidden="true" style={{ display: "inline-block", width: 20, height: 1, background: palette.navy400, flexShrink: 0 }} />
      <span style={{ flexShrink: 0 }}>{children}</span>
      <span aria-hidden="true" style={{ flex: 1, height: 1, background: palette.navy400, opacity: 0.4 }} />
    </p>
  );
}

function H1({ palette, children }: { palette: ReturnType<typeof paletteFor>; children: React.ReactNode }) {
  return (
    <h1
      style={{
        fontFamily: fonts.serif, fontSize: "clamp(32px, 4vw, 48px)",
        fontWeight: 400, lineHeight: 1.1, letterSpacing: "-0.02em",
        margin: "0 0 28px", color: palette.navy, fontStyle: "normal",
      }}
    >
      {children}
    </h1>
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
          margin: "0 0 14px", display: "flex", alignItems: "center", gap: 16, fontStyle: "normal",
        }}
      >
        <span style={{ flexShrink: 0 }}>{eyebrow}</span>
        <span aria-hidden="true" style={{ flex: 1, height: 1, background: palette.navy400, opacity: 0.4 }} />
      </p>
      {children}
    </section>
  );
}

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

function inputStyle(palette: ReturnType<typeof paletteFor>, theme: V3Theme): React.CSSProperties {
  return {
    flex: 1, minWidth: 200,
    padding: "10px 14px",
    background: theme === "day" ? palette.ivoryLight : palette.ivory,
    borderTop: `1px solid ${palette.line}`,
    borderRight: `1px solid ${palette.line}`,
    borderBottom: `1px solid ${palette.line}`,
    borderLeft: `1px solid ${palette.line}`,
    fontFamily: fonts.sans, fontSize: 15, color: palette.navy,
    outline: "none", fontStyle: "normal",
  };
}

function PrimaryButton({
  palette, onClick, disabled, children,
}: {
  palette: ReturnType<typeof paletteFor>;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: palette.navy, color: palette.paper,
        border: "none", padding: "12px 24px",
        fontFamily: fonts.sans, fontSize: 14, fontWeight: 500,
        letterSpacing: "0.02em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "opacity 200ms ease-out", fontStyle: "normal",
      }}
    >
      {children}
    </button>
  );
}

function ghostLink(palette: ReturnType<typeof paletteFor>): React.CSSProperties {
  return {
    background: "transparent", border: "none", padding: 0, cursor: "pointer",
    marginTop: 18,
    fontFamily: fonts.mono, fontSize: 11, color: palette.navy400,
    letterSpacing: "0.08em", textTransform: "uppercase",
    textDecoration: "underline", textUnderlineOffset: 2, fontStyle: "normal",
  };
}

function ListItem({ palette, children }: { palette: ReturnType<typeof paletteFor>; children: React.ReactNode }) {
  return (
    <li
      style={{
        fontFamily: fonts.serif, fontSize: 14, lineHeight: 1.6,
        color: palette.navy, opacity: 0.78,
        paddingLeft: 14, position: "relative", fontStyle: "normal",
      }}
    >
      <span aria-hidden="true" style={{ position: "absolute", left: 0, top: 0, color: palette.argent }}>·</span>
      {children}
    </li>
  );
}

export default function ComptePage() {
  return (
    <Suspense
      fallback={
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, opacity: 0.5 }}>Chargement…</div>
        </main>
      }
    >
      <ComptePageContent />
    </Suspense>
  );
}
