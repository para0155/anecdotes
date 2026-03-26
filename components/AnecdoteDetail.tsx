"use client";

import { useState } from "react";
import { Anecdote } from "@/lib/types";

interface Props {
  anecdote: Anecdote;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export default function AnecdoteDetail({ anecdote, onBack, onEdit, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div>
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Terug
        </button>
      </div>

      <h1 style={{ marginBottom: 16 }}>{anecdote.subject}</h1>

      <div className="anecdote-meta" style={{ marginBottom: 24 }}>
        <span className="pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {formatDate(anecdote.date)}
          {anecdote.time && ` om ${anecdote.time}`}
        </span>
        {anecdote.location && (
          <span className="pill" style={{ background: "var(--success-light)", color: "var(--success)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {anecdote.location}
          </span>
        )}
      </div>

      {anecdote.people.length > 0 && (
        <div className="detail-section">
          <h3>Personen</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {anecdote.people.map((p, i) => (
              <span key={i} className="pill">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="detail-section">
        <h3>Verhaal</h3>
        <div className="detail-story">{anecdote.story}</div>
      </div>

      {anecdote.tags.length > 0 && (
        <div className="detail-section">
          <h3>Tags</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {anecdote.tags.map((t, i) => (
              <span key={i} className="pill">{t}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        <button className="btn" style={{ flex: 1 }} onClick={onEdit}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          Bewerken
        </button>
        {!confirmDelete ? (
          <button className="btn btn-danger" onClick={() => setConfirmDelete(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
            Verwijder
          </button>
        ) : (
          <button className="btn btn-danger" onClick={onDelete}>
            Zeker weten?
          </button>
        )}
      </div>

      <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", marginTop: 24, textAlign: "center" }}>
        Aangemaakt: {new Date(anecdote.createdAt).toLocaleString("nl-NL")}
        {anecdote.updatedAt !== anecdote.createdAt && (
          <> &middot; Laatst bewerkt: {new Date(anecdote.updatedAt).toLocaleString("nl-NL")}</>
        )}
      </p>
    </div>
  );
}
