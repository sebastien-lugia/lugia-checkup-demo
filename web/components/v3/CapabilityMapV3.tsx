"use client";

/**
 * CapabilityMapV3 — empreinte du substrat sur les 10 axes de la carte de capacité.
 * Charte Lugia V3 (ciel sombre). Alimenté par le `footprint` dérivé côté backend
 * (src/placement.py). Un axe s'allume s'il porte des objets ; sinon il est en retrait.
 */
import type { FootprintAxe } from "@/lib/api";

const AXES: Array<[string, string, string]> = [
  ["coeur_metier", "Activité clinique", "🩺"],
  ["parcours_client", "Parcours patient", "🧭"],
  ["processus_admin", "Gestion administrative", "⚙️"],
  ["equipe_rh", "Équipe & secrétariat", "👥"],
  ["outils_data_infra", "Outils, Données & Infra", "🖥️"],
  ["finance", "Finance", "💶"],
  ["conformite", "Conformité, Sécurité & Éthique", "🛡️"],
  ["strategie", "Stratégie & Environnement", "🎯"],
  ["developpement_commercial", "Développement & patientèle", "📣"],
  ["rd_innovation", "Innovation de pratique", "🔬"],
];
const ETAT_COULEUR: Record<string, string> = {
  OPTIMAL: "#F4EFE5", FONCTIONNEL: "#C9C9CC", EN_TRANSFORMATION: "#9FB4C9",
  INACTIF: "rgba(244,239,229,0.46)", DEGRADE: "#C4B870", NON_DOCUMENTE: "rgba(244,239,229,0.32)",
  A_RISQUE: "#C4A055", BLOQUE: "#C46850", REFERENCE: "rgba(244,239,229,0.32)",
};

export function CapabilityMapV3({ footprint }: { footprint: Record<string, FootprintAxe> }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 14 }}>
      {AXES.map(([code, label, icon]) => {
        const f = footprint[code];
        const lit = f && (f.objets?.length || f.references_in?.length);
        if (!lit) {
          return (
            <div key={code} style={card(true)}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ fontFamily: "Lora,serif", fontSize: 17, color: "#F4EFE5" }}>{label}</span>
              <span style={tag()}>hors périmètre</span>
            </div>
          );
        }
        const couleur = ETAT_COULEUR[f.etat] || "#C9C9CC";
        return (
          <div key={code} style={card(false)}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ fontFamily: "Lora,serif", fontSize: 18, color: "#F4EFE5", flex: 1 }}>{label}</span>
              {f.sante != null && (
                <span style={{ fontFamily: "Lora,serif", fontSize: 18, color: couleur }}>{f.sante}%</span>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {f.objets.map((o) => (
                <span key={o.id} style={chip(false)}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: ETAT_COULEUR[o.etat] || "#C9C9CC", display: "inline-block" }} />
                  {o.label}
                </span>
              ))}
              {f.references_in.map((r, i) => (
                <span key={`r${i}`} style={chip(true)}>{r.label} · référencé</span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const card = (dark: boolean): React.CSSProperties => ({
  background: "rgba(244,239,229,0.025)", border: "1px solid rgba(244,239,229,0.10)",
  borderRadius: 14, padding: "18px 20px", opacity: dark ? 0.4 : 1,
  display: dark ? "flex" : "block", alignItems: "center", gap: 10,
});
const tag = (): React.CSSProperties => ({
  fontFamily: "IBM Plex Mono,monospace", fontSize: 8.5, letterSpacing: "0.12em", textTransform: "uppercase",
  color: "rgba(244,239,229,0.46)", border: "1px solid rgba(244,239,229,0.18)", borderRadius: 100, padding: "2px 9px",
});
const chip = (ref: boolean): React.CSSProperties => ({
  fontFamily: "Onest,sans-serif", fontSize: 12, color: ref ? "rgba(244,239,229,0.46)" : "rgba(244,239,229,0.64)",
  border: `1px ${ref ? "dashed" : "solid"} rgba(244,239,229,0.18)`, borderRadius: 100, padding: "3px 11px",
  display: "inline-flex", alignItems: "center", gap: 7,
});
