"use client";

import { AGENTS } from "@/lib/agents";

export type TimelineItem = {
  agent: string;
  label: string;
  status: "running" | "done" | "error";
  summary?: string;
};

const PROVIDER_TAG: Record<string, string> = {
  gemini: "GEMINI",
  openrouter: "OPENROUTER",
  groq: "GROQ",
};

export default function AgentTimeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
        Belum ada pekerjaan berjalan. Kirim brief di chat untuk mulai.
      </p>
    );
  }

  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => {
        const agent = AGENTS[item.agent];
        const dotColor =
          item.status === "running" ? "var(--accent)" : item.status === "done" ? "var(--success)" : "var(--error)";
        return (
          <li
            key={i}
            style={{
              background: "var(--panel-raised)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "10px 12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: dotColor,
                  flexShrink: 0,
                  animation: item.status === "running" ? "pulse 1.1s ease-in-out infinite" : "none",
                }}
              />
              <strong style={{ fontSize: 13 }}>{agent?.name ?? item.agent}</strong>
              {agent && (
                <span
                  className="mono"
                  style={{ fontSize: 10, color: "var(--text-muted)", border: "1px solid var(--border)", borderRadius: 3, padding: "1px 5px" }}
                >
                  {PROVIDER_TAG[agent.provider]}
                </span>
              )}
              <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: "auto" }}>{item.status}</span>
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--text-muted)" }}>{item.label}</p>
            {item.summary && <p style={{ margin: "6px 0 0", fontSize: 13 }}>{item.summary}</p>}
          </li>
        );
      })}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
      `}</style>
    </ul>
  );
}
