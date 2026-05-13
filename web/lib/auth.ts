/**
 * Helpers de session côté client (V1-5c).
 *
 * Le session_token est stocké en localStorage et propagé par api.ts dans
 * le header `Authorization: Bearer`. Tous les accès à window sont gardés
 * pour être SSR-safe (Next.js exécute aussi ce code côté serveur).
 *
 * Pas de directive "use client" au niveau module : les helpers sont
 * importables depuis api.ts (côté shared) et le hook useRequireAuth
 * sera appelé depuis des composants qui ont déjà leur propre "use client".
 */

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const TOKEN_KEY = "lugia_session_token";
const EMAIL_KEY = "lugia_session_email";

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getSessionEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(EMAIL_KEY);
}

export function setSession(token: string, email: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(EMAIL_KEY, email);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(EMAIL_KEY);
}

export function hasSession(): boolean {
  return getSessionToken() !== null;
}

/**
 * Hook à utiliser en haut de chaque page protégée.
 * Redirige vers /login si l'utilisateur n'a pas de session valide.
 * Retourne `true` une fois la vérification effectuée (premier render client).
 */
export function useRequireAuth(): boolean {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!hasSession()) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  return ready;
}
