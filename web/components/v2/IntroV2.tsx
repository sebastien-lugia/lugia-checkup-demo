"use client";

/**
 * V2.0 — Écran d'intro du parcours V2.
 *
 * Inspiré directement de V3/V4/V6 — il manquait dans la première version
 * V2.0. Rôle stratégique : mettre en confiance avant l'engagement de 25
 * min. Le médecin voit où il va, sait combien de temps il en a pour,
 * comprend la nature du diagnostic.
 *
 * Cf spec V2 §2.5.
 */

export function IntroV2({ onStart }: { onStart: () => void }) {
  return (
    <main className="max-w-[820px] mx-auto px-8 py-16">
      <div className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#1a56a0] mb-8">
        Diagnostic organisationnel
      </div>
      <h1 className="font-serif text-[44px] sm:text-[56px] md:text-[64px] font-medium leading-[1.05] tracking-[-0.02em] text-[#111] mb-7">
        Comment fonctionne <em className="italic text-[#1a56a0] not-italic font-medium">vraiment</em> votre cabinet ?
      </h1>
      <p className="text-[19px] leading-[1.55] text-[#595959] max-w-[680px] mb-10">
        25 minutes. 18 questions adaptées à votre profil. Une analyse qui
        se construit en temps réel — pas un formulaire muet qui promet un
        résultat à la fin.
      </p>

      <div className="flex flex-wrap gap-2 mb-12">
        <AxisChip label="Parcours patient" color="#2e7d4f" bg="#e8f1ec" />
        <AxisChip label="Équipe & secrétariat" color="#a85d2b" bg="#f6ece2" />
        <AxisChip label="Outils & dossiers" color="#1a56a0" bg="#e6edf6" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-14">
        <PromiseCard
          title="Adaptatif"
          body="Questions calibrées selon votre type de cabinet, votre logiciel et votre territoire."
        />
        <PromiseCard
          title="Terrain"
          body="Reformulations en langage praticien, pas consultant. Reflets immédiats à chaque réponse."
        />
        <PromiseCard
          title="Croisé"
          body="Détection de signaux entre les 3 axes organisationnels — ce que les scores isolés ne montrent pas."
        />
        <PromiseCard
          title="Actionnable"
          body="Plan d'action en 4 étapes pour le chantier que vous choisirez d'engager en priorité."
        />
      </div>

      <button
        onClick={onStart}
        className="bg-[#1f1f1f] hover:bg-[#2c2c2c] text-white font-medium text-[15px] tracking-[0.02em] rounded-full px-7 py-3.5 transition-colors"
      >
        Commencer →
      </button>
    </main>
  );
}

function AxisChip({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span
      className="inline-flex items-center text-[12px] font-medium px-3 py-1.5 rounded-full border"
      style={{ color, backgroundColor: bg, borderColor: color + "40" }}
    >
      {label}
    </span>
  );
}

function PromiseCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-[#e8e3d3] bg-white/40 rounded-lg p-6">
      <div className="font-serif text-[20px] font-medium text-[#111] mb-2">{title}</div>
      <p className="text-[14px] leading-[1.55] text-[#595959] m-0">{body}</p>
    </div>
  );
}
