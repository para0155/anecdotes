"use client";

import { Anecdote } from "@/lib/types";
import { getTagColor } from "@/lib/tagColors";

interface Props {
  anecdote: Anecdote;
  onClick: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

export default function AnecdoteCard({ anecdote, onClick }: Props) {
  const photoCount = anecdote.attachments?.filter(a => a.type === "image").length || 0;
  const audioCount = anecdote.attachments?.filter(a => a.type === "audio").length || 0;

  return (
    <div className="anecdote-card" onClick={onClick}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {anecdote.mood && <span style={{ fontSize: "1.2rem" }}>{anecdote.mood}</span>}
          <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>{anecdote.subject}</h3>
          {anecdote.favorite && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          )}
        </div>
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
        {photoCount > 0 && (
          <span className="pill" style={{ background: "rgba(59,130,246,0.15)", color: "#3b82f6" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            {photoCount}
          </span>
        )}
        {audioCount > 0 && (
          <span className="pill" style={{ background: "rgba(234,179,8,0.15)", color: "#eab308" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18V5l12-2v13"/>
              <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
            </svg>
            {audioCount}
          </span>
        )}
        {anecdote.tags.slice(0, 3).map((t) => {
          const tc = getTagColor(t);
          return (
            <span key={t} className="pill" style={{ background: tc.bg, color: tc.color }}>
              {t}
            </span>
          );
        })}
        {anecdote.tags.length > 3 && (
          <span className="pill">+{anecdote.tags.length - 3}</span>
        )}
      </div>

      <p className="anecdote-text">{anecdote.story}</p>
    </div>
  );
}
