"use client";

/**
 * POC WebLLM (Livraison 1 du chantier "qwen dans le navigateur").
 *
 * Page de debug isolée pour valider que :
 *   1. @mlc-ai/web-llm charge correctement dans Next 16 / Turbopack
 *   2. Le modèle Qwen2.5-3B-Instruct-q4f32_1-MLC peut être téléchargé
 *      et initialisé via WebGPU sur Mac M-series
 *   3. La latence d'inférence est acceptable (target : <3 s sur Mac M2)
 *   4. Le runtime suit raisonnablement les instructions structurées
 *      qu'on lui passera plus tard dans la mécanique 4 phases
 *
 * Accès : http://localhost:3000/debug/webllm-test
 * Ne sera pas linké depuis l'UI publique — c'est un outil interne.
 *
 * Une fois validé, on attaquera la Livraison 2 (intégration dans
 * ChatChantierModal).
 */

import { useRef, useState } from "react";

// On importe dynamiquement le runtime à l'usage (et pas en top-level)
// pour éviter que Next/Turbopack tente de bundler le wasm côté serveur.
type MLCEngine = {
  chat: {
    completions: {
      create: (params: {
        messages: { role: string; content: string }[];
        temperature?: number;
        max_tokens?: number;
      }) => Promise<{ choices: { message: { content?: string } }[] }>;
    };
  };
};

const MODEL_ID = "Qwen2.5-3B-Instruct-q4f32_1-MLC";

export default function WebLLMTestPage() {
  const [status, setStatus] = useState("Pas chargé.");
  const [progress, setProgress] = useState(0);
  const [reply, setReply] = useState("");
  const [latency, setLatency] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInferring, setIsInferring] = useState(false);
  const [prompt, setPrompt] = useState(
    "Je suis médecin généraliste libéral, mon secrétariat est saturé. Donne-moi une phrase de creusement et 3 suggestions courtes."
  );
  const engineRef = useRef<MLCEngine | null>(null);

  async function loadModel() {
    if (engineRef.current || isLoading) return;
    setIsLoading(true);
    setStatus("Chargement du runtime…");
    try {
      // Vérif WebGPU avant tout
      if (typeof navigator === "undefined" || !("gpu" in navigator)) {
        throw new Error(
          "WebGPU indisponible dans ce navigateur. Essayez Chrome récent (ou Edge) sur Mac/Windows."
        );
      }

      // Import dynamique côté client uniquement
      const webllm = await import("@mlc-ai/web-llm");

      const engine = await webllm.CreateMLCEngine(MODEL_ID, {
        initProgressCallback: (report: { progress?: number; text?: string }) => {
          if (typeof report.progress === "number") {
            setProgress(Math.round(report.progress * 100));
          }
          if (report.text) setStatus(report.text);
        },
      });

      engineRef.current = engine as unknown as MLCEngine;
      setStatus("Prêt. Le modèle tourne dans votre navigateur.");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus(`Erreur de chargement : ${message}`);
      console.error("[webllm-test] loadModel error:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function runInference() {
    if (!engineRef.current || isInferring) return;
    setIsInferring(true);
    setReply("…");
    setLatency(null);
    const t0 = performance.now();
    try {
      const res = await engineRef.current.chat.completions.create({
        messages: [
          {
            role: "system",
            content:
              "Tu es un expert en organisation des cabinets de médecine libérale. Réponds en français, en 2-3 phrases maximum.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
        max_tokens: 400,
      });
      const text = res.choices[0]?.message?.content ?? "(réponse vide)";
      setReply(text);
      setLatency(Math.round(performance.now() - t0));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setReply(`Erreur : ${message}`);
      console.error("[webllm-test] runInference error:", err);
    } finally {
      setIsInferring(false);
    }
  }

  return (
    <main
      style={{
        padding: 40,
        maxWidth: 800,
        margin: "0 auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "#1a2333",
      }}
    >
      <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>WebLLM Test</h1>
      <p style={{ fontSize: 13, color: "#666", margin: "0 0 24px" }}>
        Modèle : <code>{MODEL_ID}</code> · WebGPU requis · première utilisation =
        téléchargement ~2 GB (cache navigateur ensuite)
      </p>

      <section
        style={{
          padding: 16,
          background: "#f4f4f6",
          marginBottom: 24,
          border: "1px solid #ddd",
        }}
      >
        <div style={{ fontSize: 12, color: "#444", marginBottom: 6 }}>
          État :
        </div>
        <div style={{ fontSize: 14, fontFamily: "monospace" }}>{status}</div>
        {progress > 0 && progress < 100 && (
          <div
            style={{
              marginTop: 8,
              height: 6,
              background: "#ddd",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#1a56a0",
                transition: "width 120ms ease-out",
              }}
            />
          </div>
        )}
      </section>

      <section style={{ marginBottom: 24 }}>
        <button
          onClick={loadModel}
          disabled={isLoading || !!engineRef.current}
          style={{
            padding: "10px 18px",
            fontSize: 14,
            cursor: isLoading || !!engineRef.current ? "not-allowed" : "pointer",
            background: "#1a2333",
            color: "white",
            border: "none",
            borderRadius: 4,
            opacity: isLoading || !!engineRef.current ? 0.5 : 1,
          }}
        >
          {engineRef.current
            ? "Modèle chargé"
            : isLoading
            ? "Chargement…"
            : "1. Charger le modèle"}
        </button>
      </section>

      <section style={{ marginBottom: 24 }}>
        <label
          style={{ display: "block", fontSize: 12, color: "#444", marginBottom: 6 }}
        >
          Prompt utilisateur :
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            padding: 10,
            fontSize: 14,
            fontFamily: "system-ui, sans-serif",
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        />
        <button
          onClick={runInference}
          disabled={!engineRef.current || isInferring}
          style={{
            marginTop: 10,
            padding: "10px 18px",
            fontSize: 14,
            cursor:
              !engineRef.current || isInferring ? "not-allowed" : "pointer",
            background: "#1a56a0",
            color: "white",
            border: "none",
            borderRadius: 4,
            opacity: !engineRef.current || isInferring ? 0.5 : 1,
          }}
        >
          {isInferring ? "Génération…" : "2. Tester l'inférence"}
        </button>
      </section>

      <section
        style={{
          padding: 16,
          background: "#fafafa",
          border: "1px solid #ddd",
          borderRadius: 4,
          minHeight: 80,
          whiteSpace: "pre-wrap",
          fontSize: 14,
          lineHeight: 1.55,
        }}
      >
        <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
          Réponse {latency !== null && `(${latency} ms)`}
        </div>
        {reply || (
          <span style={{ color: "#999" }}>
            (charge le modèle puis clique « Tester » — la première inférence
            après le chargement peut prendre quelques secondes, les suivantes
            seront plus rapides)
          </span>
        )}
      </section>

      <section
        style={{
          marginTop: 32,
          padding: 16,
          background: "#fffae8",
          border: "1px solid #e0d8a8",
          borderRadius: 4,
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        <strong>Notes de test</strong>
        <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
          <li>
            Le téléchargement de ~2 GB peut prendre 1-5 min selon ta bande
            passante. Le fichier est ensuite cached par le navigateur (Cache API
            + IndexedDB).
          </li>
          <li>
            Si tu vois « WebGPU indisponible » → essaye Chrome récent. Sur
            Safari, WebGPU n&apos;est dispo qu&apos;en Tech Preview.
          </li>
          <li>
            Vérifie dans l&apos;onglet Network du devtool que le wasm + les
            shards du modèle se téléchargent.
          </li>
        </ul>
      </section>
    </main>
  );
}
