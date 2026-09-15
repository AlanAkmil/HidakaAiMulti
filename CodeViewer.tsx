"use client";

import { useState } from "react";

export type CodeFile = { filename: string; content: string; language: string };

export default function CodeViewer({ files }: { files: CodeFile[] }) {
  const [active, setActive] = useState(0);
  if (files.length === 0) {
    return <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Belum ada kode yang dihasilkan.</p>;
  }
  const file = files[active];

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
        {files.map((f, i) => (
          <button
            key={f.filename + i}
            onClick={() => setActive(i)}
            className="mono"
            style={{
              fontSize: 12,
              padding: "5px 10px",
              borderRadius: 4,
              border: "1px solid var(--border)",
              background: i === active ? "var(--accent)" : "var(--panel-raised)",
              color: i === active ? "#1a0d05" : "var(--text)",
            }}
          >
            {f.filename}
          </button>
        ))}
      </div>
      <pre
        className="mono scrollbar-thin"
        style={{
          background: "#080c16",
          border: "1px solid var(--border)",
          borderRadius: 6,
          padding: 12,
          fontSize: 12,
          lineHeight: 1.5,
          maxHeight: 360,
          overflow: "auto",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {file.content}
      </pre>
    </div>
  );
}
