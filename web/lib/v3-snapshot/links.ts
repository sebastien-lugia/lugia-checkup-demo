/**
 * V3-brand — liens externes (Calendly, contact, ...).
 *
 * Centralise les URLs externes utilisées par l'app. Chacune peut être
 * surchargée par une variable d'environnement Next (préfixée
 * `NEXT_PUBLIC_*` pour être disponible côté client).
 *
 * V3-brand-T-V3-13.
 */

/**
 * URL Calendly utilisée pour les boutons « Prendre rendez-vous » et
 * « En parler avec Lugia ». Surchargeable via `NEXT_PUBLIC_LUGIA_CALENDLY_URL`
 * dans `.env.local` ou les variables d'environnement de prod.
 *
 * Placeholder : `https://calendly.com/lugia-and-co/diagnostic` — à remplacer
 * par l'URL réelle dès qu'elle est créée côté Lugia.
 */
export const LUGIA_CALENDLY_URL =
  process.env.NEXT_PUBLIC_LUGIA_CALENDLY_URL ||
  "https://calendly.com/lugia-and-co/diagnostic";

/**
 * Email de contact Lugia — pour les liens `mailto:` (fallback si Calendly KO).
 */
export const LUGIA_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_LUGIA_CONTACT_EMAIL || "sebastien@lugia.fr";

/**
 * Ouvre l'URL Calendly dans un nouvel onglet. Pas de widget embed —
 * évite l'ajout d'un script externe et reste compatible mobile.
 *
 * Optionnellement, transmet un contexte de chantier (`chantier_id`) en
 * paramètre `utm_content` pour que côté Calendly on sache d'où vient
 * la prise de rendez-vous.
 */
export function openCalendly(opts?: { chantierId?: string; firstname?: string }) {
  if (typeof window === "undefined") return;
  const url = new URL(LUGIA_CALENDLY_URL);
  url.searchParams.set("utm_source", "v3-brand");
  if (opts?.chantierId) {
    url.searchParams.set("utm_content", opts.chantierId);
  }
  if (opts?.firstname) {
    // Calendly remplit le prénom si on passe `name` en query string
    url.searchParams.set("name", opts.firstname);
  }
  window.open(url.toString(), "_blank", "noopener,noreferrer");
}
