/**
 * En-tête commun à toutes les pages du check-up.
 * Composant serveur (pas de "use client") — uniquement du markup.
 * Permet de positionner Lugia comme un diagnostic préventif gratuit dès l'arrivée.
 */
export function PageHeader({
  subtitle = "Le check-up préventif de votre cabinet",
  mbBottom = 10,
}: {
  subtitle?: string;
  mbBottom?: 4 | 6 | 8 | 10;
}) {
  const mbClass: Record<number, string> = {
    4: "mb-4",
    6: "mb-6",
    8: "mb-8",
    10: "mb-10",
  };
  return (
    <>
      <div className="text-xs uppercase tracking-wider text-lugia-accent mb-1">
        Diagnostic préventif gratuit
      </div>
      <div className="text-sm font-medium mb-1">Lugia</div>
      <div
        className={`text-xs uppercase tracking-wider text-lugia-text-tertiary ${mbClass[mbBottom]}`}
      >
        {subtitle}
      </div>
    </>
  );
}
