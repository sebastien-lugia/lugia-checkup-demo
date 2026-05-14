import Link from "next/link";

import { PageHeader } from "@/components/PageHeader";

export const metadata = {
  title: "Politique de confidentialité — Lugia",
};

export default function ConfidentialitePage() {
  return (
    <main className="min-h-screen px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="text-sm text-lugia-text-secondary hover:text-lugia-text underline underline-offset-2 mb-6 inline-block"
          >
            ← Retour à l&apos;accueil
          </Link>
          <PageHeader mbBottom={10} />

          <h1 className="font-serif text-[28px] font-medium leading-snug mb-3">
            Politique de confidentialité
          </h1>
          <p className="text-sm text-lugia-text-tertiary mb-10">
            En vigueur au 13 mai 2026.
          </p>

          <p className="text-base text-lugia-text-secondary leading-relaxed mb-10">
            Cette page décrit les données personnelles que Lugia collecte
            lorsque vous utilisez le check-up préventif disponible sur{" "}
            <strong>diagnostic.lugia.fr</strong>, les raisons de cette
            collecte, et les droits que vous pouvez exercer.
          </p>

          <section className="mb-8">
            <h2 className="font-serif text-[18px] font-medium mb-3">
              1. Responsable du traitement
            </h2>
            <p className="text-base text-lugia-text-secondary leading-relaxed">
              Sébastien Boncoeur, particulier exploitant le projet Lugia.
              Contact :{" "}
              <a
                href="mailto:sebastien@lugia.fr"
                className="text-lugia-accent underline underline-offset-2 hover:opacity-80"
              >
                sebastien@lugia.fr
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-[18px] font-medium mb-3">
              2. Données collectées
            </h2>
            <p className="text-base text-lugia-text-secondary leading-relaxed mb-3">
              Lugia collecte les données suivantes, et uniquement celles-ci :
            </p>
            <ul className="text-base text-lugia-text-secondary leading-relaxed space-y-2 pl-5 list-disc">
              <li>
                Votre <strong>adresse email professionnelle</strong>, saisie
                au moment de la demande d&apos;un lien d&apos;accès.
              </li>
              <li>
                Vos <strong>réponses au questionnaire</strong> : choix dans
                les listes proposées et textes que vous saisissez librement.
              </li>
              <li>
                Des <strong>métadonnées techniques</strong> de votre session :
                dates de création et de mise à jour des interviews, statut,
                progression dans le questionnaire, jetons de session
                techniques (lien magique d&apos;accès et session active).
              </li>
            </ul>
            <p className="text-base text-lugia-text-secondary leading-relaxed mt-4">
              Lugia <strong>ne collecte aucune donnée patient</strong>{" "}
              identifiable. Le questionnaire ne porte que sur le système de
              travail du cabinet et ne demande aucune information clinique.
              Lugia vous demande explicitement de ne pas saisir d&apos;élément
              identifiant dans les zones de texte libre.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-[18px] font-medium mb-3">
              3. Finalités du traitement
            </h2>
            <p className="text-base text-lugia-text-secondary leading-relaxed mb-3">
              Vos données sont utilisées pour :
            </p>
            <ul className="text-base text-lugia-text-secondary leading-relaxed space-y-2 pl-5 list-disc">
              <li>
                vous identifier de manière simple via un lien d&apos;accès
                envoyé par email, sans mot de passe ;
              </li>
              <li>
                générer le rapport personnalisé de votre cabinet à partir de
                vos réponses ;
              </li>
              <li>
                vous permettre d&apos;interrompre et reprendre votre check-up
                à tout moment ;
              </li>
              <li>
                améliorer le contenu et la pertinence du check-up sur la base
                de retours anonymisés.
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-[18px] font-medium mb-3">
              4. Base légale
            </h2>
            <p className="text-base text-lugia-text-secondary leading-relaxed">
              Le traitement repose sur votre <strong>consentement</strong>{" "}
              (article 6.1.a du RGPD), donné au moment où vous saisissez votre
              adresse email pour démarrer le check-up. Ce consentement peut
              être retiré à tout moment via la suppression de votre compte.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-[18px] font-medium mb-3">
              5. Destinataires des données
            </h2>
            <p className="text-base text-lugia-text-secondary leading-relaxed mb-3">
              Vos données sont accessibles à l&apos;éditeur du site et à ses
              sous-traitants techniques, qui agissent strictement selon ses
              instructions :
            </p>
            <ul className="text-base text-lugia-text-secondary leading-relaxed space-y-2 pl-5 list-disc">
              <li>
                <strong>Vercel Inc.</strong> (États-Unis) — hébergement du
                site web.
              </li>
              <li>
                <strong>Render Services Inc.</strong> (États-Unis) —
                hébergement de l&apos;API et de la base de données. Les
                données sont stockées en région Europe (Francfort).
              </li>
              <li>
                <strong>Resend Inc.</strong> (États-Unis) — envoi des emails
                de lien d&apos;accès. Envois opérés depuis l&apos;Irlande.
              </li>
            </ul>
            <p className="text-base text-lugia-text-secondary leading-relaxed mt-3">
              Aucune donnée n&apos;est cédée, louée ou vendue à des tiers à
              des fins commerciales ou publicitaires.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-[18px] font-medium mb-3">
              6. Transferts hors Union européenne
            </h2>
            <p className="text-base text-lugia-text-secondary leading-relaxed">
              Vercel, Render et Resend sont des sociétés américaines. Bien que
              les données stockées et envoyées le soient depuis des régions
              européennes (Francfort, Irlande), un transfert vers les
              États-Unis peut intervenir pour les besoins d&apos;exploitation.
              Ces transferts sont encadrés par les clauses contractuelles
              types de la Commission européenne, et par le cadre Data Privacy
              Framework auquel adhèrent ces fournisseurs.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-[18px] font-medium mb-3">
              7. Durées de conservation
            </h2>
            <ul className="text-base text-lugia-text-secondary leading-relaxed space-y-2 pl-5 list-disc">
              <li>
                <strong>Liens d&apos;accès magiques</strong> : 30 minutes
                après émission, jamais réutilisables après usage.
              </li>
              <li>
                <strong>Sessions actives</strong> : 30 jours après
                connexion, automatiquement expirées au-delà.
              </li>
              <li>
                <strong>Réponses au questionnaire et email</strong> :
                conservés tant que votre compte est actif. Supprimables à tout
                moment via la page{" "}
                <Link
                  href="/compte"
                  className="text-lugia-accent underline underline-offset-2 hover:opacity-80"
                >
                  Mon compte
                </Link>
                .
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-[18px] font-medium mb-3">
              8. Vos droits
            </h2>
            <p className="text-base text-lugia-text-secondary leading-relaxed mb-3">
              Conformément aux articles 15 à 22 du RGPD, vous disposez à tout
              moment des droits suivants sur vos données :
            </p>
            <ul className="text-base text-lugia-text-secondary leading-relaxed space-y-2 pl-5 list-disc">
              <li>
                <strong>Droit d&apos;accès</strong> — connaître les données
                qui vous concernent.
              </li>
              <li>
                <strong>Droit de rectification</strong> — faire corriger une
                donnée inexacte.
              </li>
              <li>
                <strong>Droit à l&apos;effacement</strong> — supprimer
                l&apos;ensemble de vos données. Vous pouvez le faire vous-même
                depuis la page{" "}
                <Link
                  href="/compte"
                  className="text-lugia-accent underline underline-offset-2 hover:opacity-80"
                >
                  Mon compte
                </Link>
                .
              </li>
              <li>
                <strong>Droit d&apos;opposition</strong> — vous opposer au
                traitement de vos données pour motif légitime.
              </li>
              <li>
                <strong>Droit à la portabilité</strong> — récupérer vos
                données dans un format structuré. Sur simple demande par
                email.
              </li>
              <li>
                <strong>
                  Droit d&apos;introduire une réclamation auprès de la CNIL
                </strong>{" "}
                — Commission nationale de l&apos;informatique et des libertés,{" "}
                <a
                  href="https://www.cnil.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lugia-accent underline underline-offset-2 hover:opacity-80"
                >
                  www.cnil.fr
                </a>
                .
              </li>
            </ul>
            <p className="text-base text-lugia-text-secondary leading-relaxed mt-4">
              Pour exercer ces droits, écrivez à{" "}
              <a
                href="mailto:sebastien@lugia.fr"
                className="text-lugia-accent underline underline-offset-2 hover:opacity-80"
              >
                sebastien@lugia.fr
              </a>
              . Une réponse vous sera apportée dans un délai d&apos;un mois.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-[18px] font-medium mb-3">
              9. Cookies et stockage local
            </h2>
            <p className="text-base text-lugia-text-secondary leading-relaxed">
              Lugia <strong>n&apos;utilise pas de cookies tiers</strong>{" "}
              (analytics, publicité, suivi cross-site). Pour maintenir votre
              session entre deux pages, votre navigateur stocke localement un
              jeton technique dans son <em>localStorage</em>. Ce jeton est
              strictement nécessaire au fonctionnement du site et est
              automatiquement supprimé lors de la déconnexion ou de la
              suppression de votre compte.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-[18px] font-medium mb-3">
              10. Sécurité
            </h2>
            <p className="text-base text-lugia-text-secondary leading-relaxed">
              Toutes les communications entre votre navigateur et nos services
              sont chiffrées (HTTPS). L&apos;authentification est sans mot de
              passe (lien magique à usage unique), ce qui élimine le risque de
              fuite de mots de passe. Les sessions sont opaques et de durée
              limitée.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="font-serif text-[18px] font-medium mb-3">
              11. Modifications de cette politique
            </h2>
            <p className="text-base text-lugia-text-secondary leading-relaxed">
              Cette politique peut évoluer au fil de la maturation du
              produit. La date de mise à jour figure en tête de page. Pour les
              changements substantiels, une notification par email vous sera
              adressée si vous disposez d&apos;un compte actif.
            </p>
          </section>

          <p className="text-xs text-lugia-text-tertiary mt-10 mb-8">
            Pour toute question relative à cette politique, contactez{" "}
            <a
              href="mailto:sebastien@lugia.fr"
              className="underline underline-offset-2 hover:text-lugia-text-secondary"
            >
              sebastien@lugia.fr
            </a>
            .
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
