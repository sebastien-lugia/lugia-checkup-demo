"use client";

import Link from "next/link";

/**
 * V1.1.9 : bandeau minimal pour le mode questionnaire.
 *
 * Contrairement à <AppHeader/>, ce composant ne montre ni l'email connecté
 * ni le menu compte/déconnexion. Le médecin est en pleine concentration sur
 * son check-up — on ne le distrait avec rien d'autre que le strict nécessaire
 * pour quitter et reprendre plus tard.
 *
 * Le logo Lugia ramène à l'accueil. Le lien à droite (par défaut "Quitter et
 * reprendre plus tard") déclenche la sauvegarde de la réponse en cours puis
 * la navigation vers /. Sur l'écran d'intro et l'écran final, on bascule sur
 * "Retour à l'accueil" pour signifier qu'aucune réponse n'est en jeu.
 */
export function CheckupHeader({
  rightLabel = "Quitter et reprendre plus tard",
  onRight,
}: {
  rightLabel?: string;
  onRight?: () => void;
}) {
  return (
    <nav className="w-full border-b border-[#e5e5e5] bg-lugia-bg">
      <div className="max-w-[680px] mx-auto px-8 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-base font-semibold text-lugia-text"
        >
          <span
            aria-hidden="true"
            className="inline-block w-[18px] h-[18px] rounded-full bg-lugia-text"
          />
          Lugia
        </Link>
        {onRight ? (
          <button
            type="button"
            onClick={onRight}
            className="text-[13px] text-[#888780] hover:text-[#595959] transition-colors"
          >
            {rightLabel}
          </button>
        ) : (
          <Link
            href="/"
            className="text-[13px] text-[#888780] hover:text-[#595959] transition-colors"
          >
            {rightLabel}
          </Link>
        )}
      </div>
    </nav>
  );
}
