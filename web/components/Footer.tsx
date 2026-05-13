import Link from "next/link";

/**
 * Pied de page commun à toutes les pages publiques et authentifiées.
 * Contient les liens RGPD obligatoires et le contact email.
 * Composant Server (pas de "use client") — pas d'état, juste du markup.
 */
export function Footer() {
  return (
    <footer className="border-t border-lugia-border mt-16 px-6 py-6">
      <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-lugia-text-tertiary">
        <div>© Lugia — Sébastien Boncoeur</div>
        <nav className="flex flex-wrap gap-x-4 gap-y-1">
          <Link
            href="/legal"
            className="hover:text-lugia-text-secondary underline underline-offset-2"
          >
            Mentions légales
          </Link>
          <Link
            href="/confidentialite"
            className="hover:text-lugia-text-secondary underline underline-offset-2"
          >
            Confidentialité
          </Link>
          <a
            href="mailto:sebastien@lugia.fr"
            className="hover:text-lugia-text-secondary underline underline-offset-2"
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
