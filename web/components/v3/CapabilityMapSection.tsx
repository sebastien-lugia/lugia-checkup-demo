"use client";

/**
 * CapabilityMapSection — bloc de restitution à insérer dans ResultatsV3.
 * Récupère le substrat (capability map + carte vivante) dérivé des chantiers
 * explorés via l'agent LLM, et l'affiche. À insérer p.ex. :
 *     {interviewId && <CapabilityMapSection interviewId={interviewId} />}
 */
import { useEffect, useState } from "react";

import { getSubstrat, type Substrat } from "@/lib/api";
import { CapabilityMapV3 } from "@/components/v3/CapabilityMapV3";
import { CarteVivanteV3 } from "@/components/v3/CarteVivanteV3";

const MODULE_LABEL: Record<string, string> = {
  urgences: "Urgences du jour", chroniques: "Suivi des chroniques", delegation: "Délégation",
  comm: "Communication", logiciel: "Logiciel métier", admin: "Charge administrative", pilotage: "Pilotage",
};
const kicker: React.CSSProperties = {
  fontFamily: "IBM Plex Mono,monospace", fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase",
  color: "rgba(244,239,229,0.46)", paddingBottom: 12, borderBottom: "1px solid rgba(244,239,229,0.10)",
  marginBottom: 22, display: "block",
};

export function CapabilityMapSection({ interviewId }: { interviewId: number }) {
  const [sub, setSub] = useState<Substrat | null>(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    getSubstrat(interviewId).then(setSub).catch(() => setErr(true));
  }, [interviewId]);

  if (err || !sub || !sub.chantiers.length) return null; // rien tant qu'aucun chantier n'a été exploré

  return (
    <section style={{ marginTop: 54 }}>
      <span style={kicker}>Votre carte de capacité — empreinte des chantiers explorés</span>
      <CapabilityMapV3 footprint={sub.footprint_global} />

      {sub.chantiers.map((c) => (
        <div key={c.module_id} style={{ marginTop: 32 }}>
          <span style={kicker}>Carte vivante — {MODULE_LABEL[c.module_id] || c.module_id}</span>
          {c.graphe && <CarteVivanteV3 graph={c.graphe as never} />}
        </div>
      ))}
    </section>
  );
}
