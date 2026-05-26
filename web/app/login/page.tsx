"use client";

/**
 * /login — page de connexion par magic link, charte V3 Lugia (2026-05-22).
 *
 * Logique métier inchangée (POST /auth/request-link, email + token). Le
 * remodelage couvre uniquement la couche visuelle :
 *  - palette navy/ivoire selon theme
 *  - typo Lora + Onest + IBM Plex Mono
 *  - composants ThemeToggleV3 + brand mark
 *  - layout centré max-width 480px, paddingTop 88px (cohérent v3-charte)
 */

import { useState, useEffect, type FormEvent } from "react";

import { requestMagicLink } from "@/lib/api";
import { paletteFor, fonts, type V3Theme } from "@/lib/v3/tokens";
import { useTheme } from "@/lib/v3/useTheme";
import { ThemeToggleV3 } from "@/components/v3/ThemeToggleV3";

type Status = "idle" | "sending" | "sent" | "error";

/** Logo Lugia (mark navy) — copié de Topbar.tsx pour autonomie de la page. */
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

export default function LoginPage() {
  const [theme, setTheme] = useTheme();
  useEffect(() => {
    const original = document.body.style.background;
    document.body.style.background = paletteFor(theme).paper;
    return () => {
      document.body.style.background = original;
    };
  }, [theme]);

  const palette = paletteFor(theme);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@") || trimmed.length < 5) {
      setErrorMsg("Adresse email invalide.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setErrorMsg(null);
    try {
      await requestMagicLink(trimmed);
      setStatus("sent");
    } catch {
      setErrorMsg("Impossible d'envoyer le lien. Réessayez dans un instant.");
      setStatus("error");
    }
  }

  function handleReset() {
    setStatus("idle");
    setErrorMsg(null);
  }

  return (
    <main
      style={{
        background: palette.paper,
        color: palette.navy,
        minHeight: "100vh",
        paddingTop: 88,
        paddingBottom: 96,
        transition: "background 350ms ease-out, color 350ms ease-out",
      }}
    >
      <ThemeToggleV3 theme={theme} onToggle={() => setTheme((t) => (t === "night" ? "day" : "night"))} />

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "0 24px" }}>
        {/* Marque Lugia */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 48 }}>
          <LugiaMark color={palette.navy} size={28} />
          <span
            style={{
              fontFamily: fonts.mono,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: palette.navy400,
              fontStyle: "normal",
            }}
          >
            Lugia &amp; Co
          </span>
        </div>

        {/* Eyebrow petit trait à gauche */}
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
            style={{ display: "inline-block", width: 20, height: 1, background: palette.navy400 }}
          />
          {status === "sent" ? "Lien envoyé" : "Accéder au check-up"}
        </p>

        {status === "sent" ? (
          <>
            <h1
              style={{
                fontFamily: fonts.serif,
                fontSize: "clamp(28px, 3.2vw, 32px)",
                fontWeight: 400,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                margin: "0 0 24px",
                color: palette.navy,
                fontStyle: "normal",
              }}
            >
              Vérifiez votre boîte mail.
            </h1>
            <p
              style={{
                fontFamily: fonts.serif,
                fontSize: 16,
                lineHeight: 1.65,
                color: palette.navy600,
                margin: "0 0 18px",
                fontStyle: "normal",
              }}
            >
              Si l&apos;adresse{" "}
              <strong
                style={{
                  // Bug fix 2026-05-23 : palette.navy fonctionnait en theorie
                  // (#f4efe5 en night, #1A2333 en day) mais le rendu serif fin
                  // 16px etait quasi-invisible. On force des couleurs avec
                  // contraste maximum et un poids un peu plus marque.
                  color: theme === "night" ? "#ffffff" : palette.navy,
                  fontWeight: 600,
                  fontFamily: fonts.sans,
                }}
              >
                {email || "votre adresse"}
              </strong>
              {" "}est valide, vous y recevrez dans quelques secondes un lien d&apos;accès
              à votre check-up. Il est valable 30 minutes.
            </p>
            <p
              style={{
                fontFamily: fonts.sans,
                fontSize: 13,
                lineHeight: 1.6,
                color: palette.navy400,
                margin: 0,
                fontStyle: "normal",
              }}
            >
              Vous n&apos;avez pas reçu le mail ? Vérifiez aussi vos spams, ou{" "}
              <button
                onClick={handleReset}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "inherit",
                  // Meme fix que le strong de l'email : contraste fort
                  color: theme === "night" ? "#ffffff" : palette.navy,
                  fontWeight: 500,
                  textDecoration: "underline",
                  textUnderlineOffset: 2,
                }}
              >
                réessayez avec une autre adresse
              </button>
              .
            </p>
          </>
        ) : (
          <>
            <h1
              style={{
                fontFamily: fonts.serif,
                fontSize: "clamp(28px, 3.2vw, 32px)",
                fontWeight: 400,
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                margin: "0 0 16px",
                color: palette.navy,
                fontStyle: "normal",
              }}
            >
              Recevez votre lien d&apos;accès par email.
            </h1>
            <p
              style={{
                fontFamily: fonts.serif,
                fontSize: 15,
                lineHeight: 1.6,
                color: palette.navy600,
                opacity: 0.72,
                margin: "0 0 40px",
                fontStyle: "normal",
              }}
            >
              Saisissez votre adresse professionnelle. Nous vous envoyons un lien d&apos;accès
              direct au check-up. Pas de mot de passe à retenir.
            </p>

            <form onSubmit={handleSubmit}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontFamily: fonts.mono,
                  fontSize: 10,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: palette.navy400,
                  margin: "0 0 8px",
                  fontStyle: "normal",
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@cabinet.fr"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  background: theme === "day" ? palette.ivoryLight : palette.ivory,
                  borderTop: `1px solid ${palette.line}`,
                  borderRight: `1px solid ${palette.line}`,
                  borderBottom: `1px solid ${palette.line}`,
                  borderLeft: `1px solid ${palette.line}`,
                  fontFamily: fonts.sans,
                  fontSize: 15,
                  color: palette.navy,
                  outline: "none",
                  transition: "border-color 200ms ease-out",
                  fontStyle: "normal",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderTopColor = palette.navy400;
                  e.currentTarget.style.borderRightColor = palette.navy400;
                  e.currentTarget.style.borderBottomColor = palette.navy400;
                  e.currentTarget.style.borderLeftColor = palette.navy400;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderTopColor = palette.line;
                  e.currentTarget.style.borderRightColor = palette.line;
                  e.currentTarget.style.borderBottomColor = palette.line;
                  e.currentTarget.style.borderLeftColor = palette.line;
                }}
              />

              <button
                type="submit"
                disabled={status === "sending"}
                style={{
                  marginTop: 18,
                  background: palette.navy,
                  color: palette.paper,
                  border: "none",
                  padding: "13px 28px",
                  fontFamily: fonts.sans,
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  cursor: status === "sending" ? "not-allowed" : "pointer",
                  opacity: status === "sending" ? 0.4 : 1,
                  transition: "opacity 200ms ease-out",
                  fontStyle: "normal",
                }}
              >
                {status === "sending" ? "Envoi…" : "Recevoir mon lien d\u2019accès"}
              </button>

              {errorMsg && (
                <div
                  style={{
                    marginTop: 16,
                    padding: "10px 14px",
                    background: palette.signalWarn.surface,
                    borderLeft: `2px solid ${palette.signalWarn.default}`,
                    fontFamily: fonts.sans,
                    fontSize: 13,
                    color: palette.signalWarn.default,
                    lineHeight: 1.5,
                    fontStyle: "normal",
                  }}
                >
                  {errorMsg}
                </div>
              )}
            </form>

            <p
              style={{
                fontFamily: fonts.mono,
                fontSize: 10,
                letterSpacing: "0.06em",
                color: palette.navy400,
                margin: "40px 0 0",
                lineHeight: 1.7,
                opacity: 0.75,
                fontStyle: "normal",
              }}
            >
              Vos réponses restent confidentielles. Aucune donnée patient identifiable
              n&apos;est collectée. Voir <a href="/legal" style={{ color: palette.navy400, textDecoration: "underline" }}>mentions légales</a> et <a href="/confidentialite" style={{ color: palette.navy400, textDecoration: "underline" }}>politique de confidentialité</a>.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
