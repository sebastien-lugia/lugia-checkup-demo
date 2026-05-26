"use client";

import { useEffect, useState } from "react";

import type { V3Theme } from "./tokens";

const THEME_KEY = "v3-charte-theme";

/**
 * Hook centralisé de gestion du thème V3-charte (day / night).
 *
 * SSR-stable : retourne toujours `"night"` au premier render (serveur et
 * client initial), pour éviter tout hydration mismatch React. Après le
 * `useEffect` initial, lit la préférence persistée dans `localStorage` et
 * bascule sur la valeur utilisateur si différente. Persiste automatiquement
 * les changements ultérieurs.
 *
 * Avant ce hook : chaque page lisait `localStorage` dans le lazy initializer
 * de `useState`, ce qui produisait un mismatch React (SSR rendait "night",
 * le client recalculait "day" à l'hydration → tree diff sur les styles).
 */
export function useTheme(): [
  V3Theme,
  React.Dispatch<React.SetStateAction<V3Theme>>,
] {
  // Toujours "night" en SSR + premier render client → pas de mismatch
  const [theme, setTheme] = useState<V3Theme>("night");
  const [mounted, setMounted] = useState(false);

  // Lit la préférence après mount (post-hydration)
  useEffect(() => {
    setMounted(true);
    try {
      const saved = window.localStorage.getItem(THEME_KEY);
      if (saved === "day" || saved === "night") {
        setTheme(saved as V3Theme);
      }
    } catch {
      /* localStorage indisponible (private mode strict) — défaut night */
    }
  }, []);

  // Persiste les changements (uniquement après mount, pour ne pas écraser
  // la préférence pendant le SSR où theme est forcé à "night")
  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* fail silent */
    }
  }, [theme, mounted]);

  return [theme, setTheme];
}
