"use client";

/**
 * V1.1.9 : écran d'intro affiché avant la première question.
 *
 * Apparu une seule fois au démarrage d'une session — si le médecin revient
 * sur son interview après une interruption (currentIndex > 0 ou au moins
 * une réponse déjà enregistrée), on saute l'intro et on l'amène directement
 * sur sa question en cours.
 *
 * L'intro pose la promesse temporelle (~30 min), les 3 garde-fous (pas de
 * données patient, pas de diagnostic médical, reprise possible), et un
 * bouton "Commencer le check-up".
 */
export function CheckupIntro({
  totalQuestions,
  onStart,
}: {
  totalQuestions: number;
  onStart: () => void;
}) {
  return (
    <main className="max-w-[680px] mx-auto px-8 py-20">
      <div className="text-[11px] uppercase tracking-[0.16em] font-semibold text-[#888780] mb-6">
        Check-up préventif
      </div>
      <h1 className="font-serif text-[38px] font-medium leading-[1.15] tracking-[-0.015em] text-[#111] mb-5">
        Première lecture de votre cabinet,
        <br />
        en environ 30 minutes.
      </h1>
      <p className="text-[17px] leading-[1.6] text-[#595959] max-w-[580px] mb-10">
        {`Vous allez répondre à ${totalQuestions} questions sur le fonctionnement de votre cabinet. Pas de bonne ou de mauvaise réponse — on cherche à voir ensemble ce qui tient bien, ce qui pèse, et ce qui mérite un coup d’œil.`}
      </p>

      <div className="bg-[#f5f4ef] border-l-[3px] border-[#e5e5e5] rounded-r px-7 py-6 mb-10">
        <div className="text-[11px] uppercase tracking-[0.12em] font-semibold text-[#595959] mb-3">
          Avant de commencer
        </div>
        <ul className="list-none p-0 m-0 space-y-1.5">
          <li className="text-[14px] leading-[1.55] text-[#595959] pl-5 relative before:content-['—'] before:absolute before:left-0 before:text-[#888780]">
            Aucune donnée patient identifiable ne vous sera demandée.
          </li>
          <li className="text-[14px] leading-[1.55] text-[#595959] pl-5 relative before:content-['—'] before:absolute before:left-0 before:text-[#888780]">
            Le check-up porte sur votre organisation, pas sur votre clinique.
          </li>
          <li className="text-[14px] leading-[1.55] text-[#595959] pl-5 relative before:content-['—'] before:absolute before:left-0 before:text-[#888780]">
            Vous pouvez interrompre et reprendre plus tard à tout moment.
          </li>
        </ul>
      </div>

      <div className="flex items-center gap-5 flex-wrap">
        <button
          type="button"
          onClick={onStart}
          className="bg-lugia-text text-white px-7 py-3.5 rounded-lg text-[15px] font-medium hover:opacity-90 transition-opacity"
        >
          Commencer le check-up →
        </button>
        <span className="text-[13px] text-[#888780]">
          Durée estimée : ~30 min
        </span>
      </div>
    </main>
  );
}
