"use client";

import { useMemo } from "react";
import { Anecdote } from "@/lib/types";
import { getAnecdotes } from "@/lib/storage";
import { getTagColor } from "@/lib/tagColors";

interface Props {
  onBack: () => void;
  onOpenDetail: (a: Anecdote) => void;
}

const MONTH_NAMES = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December",
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

function getMonthYear(dateStr: string): string {
  const [y, m] = dateStr.split("-");
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
}

export default function TimelineView({ onBack, onOpenDetail }: Props) {
  const all = useMemo(() => getAnecdotes().sort((a, b) => b.date.localeCompare(a.date)), []);

  // Group by month
  const groups = useMemo(() => {
    const result: { label: string; items: Anecdote[] }[] = [];
    let currentLabel = "";
    for (const a of all) {
      const label = getMonthYear(a.date);
      if (label !== currentLabel) {
        result.push({ label, items: [] });
        currentLabel = label;
      }
      result[result.length - 1].items.push(a);
    }
    return result;
  }, [all]);

  return (
    <div className="animate-in">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Terug
        </button>
      </div>

      <h1 style={{ marginBottom: 8 }}>Tijdlijn</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 28 }}>
        {all.length} verhaal{all.length !== 1 ? "en" : ""} in chronologische volgorde
      </p>

      {all.length === 0 ? (
        <div className="empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="12" y1="2" x2="12" y2="22"/>
            <circle cx="12" cy="6" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="18" r="2"/>
          </svg>
          <h2>Geen anekdotes</h2>
          <p style={{ marginTop: 8 }}>Voeg anekdotes toe om je tijdlijn te vullen</p>
        </div>
      ) : (
        <div className="timeline-container">
          {groups.map((group) => (
            <div key={group.label}>
              {/* Month label */}
              <div className="timeline-month-label">{group.label}</div>

              {group.items.map((a, idx) => (
                <div
                  key={a.id}
                  className={`timeline-item ${idx % 2 === 0 ? "timeline-left" : "timeline-right"}`}
                  onClick={() => onOpenDetail(a)}
                >
                  {/* Dot on the line */}
                  <div className="timeline-dot" />
                  <div className="timeline-connector" />

                  {/* Card */}
                  <div className="timeline-card">
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      {a.mood && <span style={{ fontSize: "1.1rem" }}>{a.mood}</span>}
                      <h3 style={{ fontSize: "0.92rem", fontWeight: 600, flex: 1 }}>{a.subject}</h3>
                      {a.favorite && (
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      )}
                    </div>

                    <p style={{
                      color: "var(--text-secondary)", fontSize: "0.82rem", lineHeight: 1.5,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                      overflow: "hidden", marginBottom: 8,
                    }}>
                      {a.story}
                    </p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", fontWeight: 600 }}>
                        {formatDate(a.date)}
                      </span>
                      {a.location && (
                        <span style={{
                          fontSize: "0.72rem", color: "var(--success)",
                          background: "var(--success-light)", padding: "1px 6px",
                          borderRadius: 10,
                        }}>
                          {a.location}
                        </span>
                      )}
                      {a.tags.slice(0, 2).map(t => {
                        const tc = getTagColor(t);
                        return (
                          <span key={t} style={{
                            fontSize: "0.72rem", padding: "1px 6px",
                            borderRadius: 10, background: tc.bg, color: tc.color,
                          }}>
                            {t}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
