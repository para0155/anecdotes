"use client";

import { useState } from "react";
import { Anecdote } from "@/lib/types";
import { getAnecdotes } from "@/lib/storage";

interface Props {
  onBack: () => void;
  onOpenDetail: (a: Anecdote) => void;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

export default function PeopleView({ onBack, onOpenDetail }: Props) {
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);

  const all = getAnecdotes();
  const peopleCounts: Record<string, number> = {};
  all.forEach(a => a.people.forEach(p => {
    peopleCounts[p] = (peopleCounts[p] || 0) + 1;
  }));

  const sortedPeople = Object.entries(peopleCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  if (selectedPerson) {
    const personAnecdotes = all.filter(a => a.people.includes(selectedPerson));
    return (
      <div className="animate-in">
        <div className="detail-header">
          <button className="back-btn" onClick={() => setSelectedPerson(null)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Terug
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            background: "var(--accent-gradient)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem", fontWeight: 700, color: "white",
            flexShrink: 0,
          }}>
            {selectedPerson.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem" }}>{selectedPerson}</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 2 }}>
              {personAnecdotes.length} anekdote{personAnecdotes.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {personAnecdotes.map(a => (
            <div key={a.id} className="anecdote-card" onClick={() => onOpenDetail(a)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {a.mood && <span style={{ fontSize: "1.2rem" }}>{a.mood}</span>}
                  <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>{a.subject}</h3>
                </div>
                <span style={{ fontSize: "0.8rem", color: "var(--text-dim)", whiteSpace: "nowrap", marginLeft: 12 }}>
                  {formatDate(a.date)}
                </span>
              </div>
              <p className="anecdote-text">{a.story}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

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

      <h1 style={{ marginBottom: 28 }}>Personen</h1>

      {sortedPeople.length === 0 ? (
        <div className="empty-state">
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <h2>Geen personen</h2>
          <p style={{ marginTop: 8 }}>Voeg personen toe aan je anekdotes</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sortedPeople.map(({ name, count }) => (
            <button
              key={name}
              onClick={() => setSelectedPerson(name)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 18px",
                background: "var(--bg-card)", backdropFilter: "blur(20px)",
                border: "1px solid var(--border)", borderRadius: "var(--radius)",
                cursor: "pointer", transition: "all 0.25s",
                textAlign: "left", fontFamily: "inherit", color: "var(--text)",
                width: "100%",
              }}
              className="anecdote-card"
            >
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: "var(--accent-gradient)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.1rem", fontWeight: 700, color: "white",
                flexShrink: 0,
              }}>
                {name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{name}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>
                  {count} anekdote{count !== 1 ? "s" : ""}
                </div>
              </div>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
