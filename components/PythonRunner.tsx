"use client";

import { useState } from "react";

declare global {
  interface Window {
    loadPyodide?: (opts?: any) => Promise<any>;
  }
}

let pyodideInstance: any = null;

async function ensurePyodide() {
  if (pyodideInstance) return pyodideInstance;
  if (!window.loadPyodide) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Gagal load Pyodide"));
      document.body.appendChild(script);
    });
  }
  pyodideInstance = await window.loadPyodide!();
  return pyodideInstance;
}

// Kartu ini yang setara dengan "Jalankan kode Python" di referensi screenshot —
// tapi eksekusinya di browser user (WASM), bukan di server, jadi gratis & tanpa
// perlu backend runtime khusus.
export default function PythonRunner({ code }: { code: string }) {
  const [output, setOutput] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "loading" | "running" | "done" | "error">("idle");

  async function run() {
    try {
      setStatus("loading");
      const pyodide = await ensurePyodide();
      setStatus("running");
      let captured = "";
      pyodide.setStdout({ batched: (s: string) => (captured += s + "\n") });
      await pyodide.runPythonAsync(code);
      setOutput(captured || "(tidak ada output)");
      setStatus("done");
    } catch (e: any) {
      setOutput(e.message ?? String(e));
      setStatus("error");
    }
  }

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 6, background: "var(--panel-raised)", padding: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span className="mono" style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Jalankan kode Python
        </span>
        <button
          onClick={run}
          disabled={status === "loading" || status === "running"}
          style={{
            marginLeft: "auto",
            background: "var(--accent)",
            border: "none",
            borderRadius: 4,
            padding: "4px 10px",
            fontSize: 12,
            fontWeight: 600,
            color: "#1a0d05",
          }}
        >
          {status === "loading" ? "Memuat runtime…" : status === "running" ? "Menjalankan…" : "Run"}
        </button>
      </div>
      {output && (
        <pre
          className="mono scrollbar-thin"
          style={{ marginTop: 8, fontSize: 12, whiteSpace: "pre-wrap", maxHeight: 200, overflow: "auto" }}
        >
          {output}
        </pre>
      )}
    </div>
  );
}
