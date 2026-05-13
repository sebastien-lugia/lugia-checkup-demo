import Link from "next/link";

export const metadata = {
  title: "Mentions légales — Lugia",
};

export default function MentionsLegalesPage() {
  return (
    <main className="min-h-screen px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="text-sm text-lugia-text-secondary hover:text-lugia-text underline underline-offset-2 mb-6 inline-block"
          >
            ← Retour à l&apos;accueil
          </Link>
          <div className="text-sm font-medium mb-1">Lugia</div>
          <div className="text-xs uppercase tracking-wider text-lugia-text-tertiary mb-10">
            Le check-up préventif de votre cabinet
          </div>

          <h1 className="font-serif text-[28px] font-medium leading-snug mb-8">
            Mentions légales
          </h1>

          <section className="mb-8">
            <h2 className="text-sm uppercase tracking-wider font-medium text-lugia-text-secondary mb-3">
              Éditeur
            </h2>
            <p className="text-base text-lugia-text-secondary leading-relaxed mb-2">
              Sébastien Boncoeur, particulier.
            </p>
            <p className="text-base text-lugia-text-secondary leading-relaxed mb-2">
              France.
            </p>
            <p className="text-base text-lugia-text-secondary leading-relaxed">
              Contact :{" "}
              <a
                href="mailto:sebastien@lugia.fr"
                className="text-lugia-accent underline underline-offset-2 hover:opacity-80"
              >
                sebastien@lugia.fr
              </a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-sm uppercase tracking-wider font-medium text-lugia-text-secondary mb-3">
              Directeur de la publication
            </h2>
            <p className="text-base text-lugia-text-secondary leading-relaxed">
              Sébastien Boncoeur.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-sm uppercase tracking-wider font-medium text-lugia-text-secondary mb-3">
              Hébergement
            </h2>
            <p className="text-base text-lugia-text-secondary leading-relaxed mb-3">
              Le site <strong>diagnostic.lugia.fr</strong> est hébergé par
              différents prestataires pour ses composants techniques :
            </p>
            <ul className="text-base text-lugia-text-secondary leading-relaxed space-y-2 pl-5 list-disc">
              <li>
                <strong>Front-end web</strong> — Vercel Inc., 440 N Barranca
                Ave #4133, Covina, CA 91723, États-Unis.
              </li>
              <li>
                <strong>Back-end et base de données</strong> — Render Services
                Inc., 525 Brannan Street, San Francisco, CA 94107, États-Unis.
                Données stockées en région Europe (Francfort).
              </li>
              <li>
                <strong>Service d&apos;envoi d&apos;email</strong> — Resend
                Inc., 2261 Market Street #5039, San Francisco, CA 94114,
                États-Unis. Envois opérés depuis la région Europe (Irlande).
              </li>
              <li>
                <strong>Nom de domaine</strong> — OVH SAS, 2 rue Kellermann,
                59100 Roubaix, France.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-sm uppercase tracking-wider font-medium text-lugia-text-secondary mb-3">
              Propriété intellectuelle
            </h2>
            <p className="text-base text-lugia-text-secondary leading-relaxed">
              L&apos;ensemble du contenu présent sur ce site (textes, méthode,
              questionnaire, structure d&apos;analyse, design) est protégé par
              le droit d&apos;auteur. Toute reproduction, représentation ou
              diffusion, totale ou partielle, sans autorisation écrite est
              interdite.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-sm uppercase tracking-wider font-medium text-lugia-text-secondary mb-3">
              Données personnelles
            </h2>
            <p className="text-base text-lugia-text-secondary leading-relaxed">
              Le traitement des données personnelles est décrit en détail dans
              la{" "}
              <Link
                href="/confidentialite"
                className="text-lugia-accent underline underline-offset-2 hover:opacity-80"
              >
                politique de confidentialité
              </Link>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-sm uppercase tracking-wider font-medium text-lugia-text-secondary mb-3">
              Loi applicable
            </h2>
            <p className="text-base text-lugia-text-secondary leading-relaxed">
              Le présent site est soumis à la loi française. Tout litige
              relèvera de la compétence des tribunaux français.
            </p>
          </section>

          <p className="text-xs text-lugia-text-tertiary mt-10 mb-8">
            Dernière mise à jour : 13 mai 2026.
          </p>

          <Link
            href="/"
            className="inline-block bg-lugia-bg-card border border-lugia-border text-lugia-text px-5 py-2.5 rounded-lg text-sm font-medium hover:border-lugia-text-tertiary transition"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
  );
}
