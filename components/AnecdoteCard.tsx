"use client";

import { Anecdote } from "@/lib/types";

interface Props {
  anecdote: Anecdote;
  onClick: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

export default function AnecdoteCard({ anecdote, onClick }: Props) {
  return (
    <div className="anecdote-card" onClick={onClick}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>{anecdote.subject}</h3>
        <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", whiteSpace: "nowrap", marginLeft: 12 }}>
          {formatDate(anecdote.date)}
        </span>
      </div>

      <div className="anecdote-meta">
        {anecdote.location && (
          <span className="pill" style={{ background: "var(--success-light)", color: "var(--success)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {anecdote.location}
          </span>
        )}
        {anecdote.people.slice(0, 3).map((p, i) => (
          <span key={i} className="pill">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {p}
          </span>
        ))}
        {anecdote.people.length > 3 && (
          <span className="pill">+{anecdote.people.length - 3}</span>
        )}
      </div>

      <p className="anecdote-text">{anecdote.story}</p>
    </div>
  );
}
