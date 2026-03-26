"use client";

import { useState, useMemo } from "react";
import { Anecdote } from "@/lib/types";
import { getAnecdotes } from "@/lib/storage";

interface Props {
  onBack: () => void;
  onOpenDetail: (a: Anecdote) => void;
}

const DAY_NAMES = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"];
const MONTH_NAMES = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December",
];

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });
}

export default function CalendarView({ onBack, onOpenDetail }: Props) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const all = useMemo(() => getAnecdotes(), []);

  // Build a map of date -> anecdotes
  const dateMap = useMemo(() => {
    const map: Record<string, Anecdote[]> = {};
    all.forEach(a => {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    });
    return map;
  }, [all]);

  // Calendar grid
  const firstDay = new Date(year, month, 1);
  let startDow = firstDay.getDay() - 1; // Monday=0
  if (startDow < 0) startDow = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  }

  function dateStr(day: number): string {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  const selectedAnecdotes = selectedDate ? (dateMap[selectedDate] || []) : [];

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

      <h1 style={{ marginBottom: 28 }}>Kalender</h1>

      {/* Month navigation */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button className="btn btn-icon" onClick={prevMonth} style={{ width: 38, height: 38 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h2 style={{ fontSize: "1.1rem" }}>{MONTH_NAMES[month]} {year}</h2>
        <button className="btn btn-icon" onClick={nextMonth} style={{ width: 38, height: 38 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="9 6 15 12 9 18"/>
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
        {DAY_NAMES.map(d => (
          <div key={d} style={{
            textAlign: "center", fontSize: "0.75rem", fontWeight: 700,
            color: "var(--text-dim)", textTransform: "uppercase", padding: "6px 0",
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 24 }}>
        {cells.map((day, i) => {
          if (day === null) return <div key={`e${i}`} />;
          const ds = dateStr(day);
          const hasAnecdotes = !!dateMap[ds];
          const count = dateMap[ds]?.length || 0;
          const isToday = ds === today.toISOString().split("T")[0];
          const isSelected = ds === selectedDate;

          return (
            <button
              key={ds}
              onClick={() => setSelectedDate(isSelected ? null : ds)}
              style={{
                aspectRatio: "1",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 2,
                borderRadius: "var(--radius-xs)",
                border: isToday ? "1.5px solid var(--accent)" : "1px solid transparent",
                background: isSelected ? "var(--accent-light)" : hasAnecdotes ? "var(--bg-card)" : "transparent",
                cursor: hasAnecdotes ? "pointer" : "default",
                fontFamily: "inherit",
                color: isSelected ? "var(--accent)" : "var(--text)",
                fontSize: "0.9rem",
                fontWeight: isToday || isSelected ? 700 : 400,
                transition: "all 0.2s",
                padding: 0,
              }}
            >
              {day}
              {hasAnecdotes && (
                <div style={{ display: "flex", gap: 2 }}>
                  {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                    <div key={j} style={{
                      width: 5, height: 5, borderRadius: "50%",
                      background: "var(--accent)",
                    }} />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected date anecdotes */}
      {selectedDate && (
        <div className="animate-in">
          <h3 style={{
            fontSize: "0.82rem", fontWeight: 700, color: "var(--text-muted)",
            textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12,
          }}>
            {formatDate(selectedDate)}
          </h3>
          {selectedAnecdotes.length === 0 ? (
            <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>Geen anekdotes op deze dag</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {selectedAnecdotes.map(a => (
                <div key={a.id} className="anecdote-card" onClick={() => onOpenDetail(a)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    {a.mood && <span style={{ fontSize: "1.1rem" }}>{a.mood}</span>}
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 600 }}>{a.subject}</h3>
                  </div>
                  <p className="anecdote-text">{a.story}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
