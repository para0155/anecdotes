"use client";

import { useState, useEffect } from "react";
import { Anecdote } from "@/lib/types";
import { getAnecdotes } from "@/lib/storage";

interface MemoryItem {
  anecdote: Anecdote;
  label: string;
}

function getMemories(): MemoryItem[] {
  const all = getAnecdotes();
  if (all.length === 0) return [];

  const today = new Date();
  const todayMD = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const todayStr = today.toISOString().split("T")[0];
  const memories: MemoryItem[] = [];

  // "Op deze dag" in previous years
  for (const a of all) {
    const md = a.date.slice(5); // MM-DD
    const year = parseInt(a.date.slice(0, 4));
    const currentYear = today.getFullYear();
    if (md === todayMD && year < currentYear) {
      const yearsAgo = currentYear - year;
      memories.push({
        anecdote: a,
        label: `Op deze dag, ${yearsAgo} jaar geleden`,
      });
    }
  }

  // X dagen geleden (7, 30, 90, 365)
  const milestones = [7, 30, 90, 365];
  for (const days of milestones) {
    const target = new Date(today);
    target.setDate(target.getDate() - days);
    const targetStr = target.toISOString().split("T")[0];
    for (const a of all) {
      if (a.date === targetStr && a.date !== todayStr) {
        const alreadyAdded = memories.some(m => m.anecdote.id === a.id);
        if (!alreadyAdded) {
          memories.push({
            anecdote: a,
            label: `${days} dagen geleden`,
          });
        }
      }
    }
  }

  return memories;
}

interface Props {
  onOpenDetail: (a: Anecdote) => void;
}

export default function Memories({ onOpenDetail }: Props) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [fadeOut, setFadeOut] = useState<string | null>(null);

  useEffect(() => {
    setMemories(getMemories());
  }, []);

  function dismiss(id: string) {
    setFadeOut(id);
    setTimeout(() => {
      setDismissed(prev => new Set(prev).add(id));
      setFadeOut(null);
    }, 300);
  }

  const visible = memories.filter(m => !dismissed.has(m.anecdote.id));
  if (visible.length === 0) return null;

  return (
    <div style={{ marginBottom: 20 }}>
      {visible.map(({ anecdote, label }) => (
        <div
          key={anecdote.id}
          className="memory-card"
          style={{
            opacity: fadeOut === anecdote.id ? 0 : 1,
            transform: fadeOut === anecdote.id ? "translateY(-10px) scale(0.95)" : "none",
            transition: "all 0.3s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: "1.3rem" }}>&#x1F4AD;</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {label}
              </span>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); dismiss(anecdote.id); }}
              style={{
                background: "none", border: "none", color: "var(--text-dim)",
                cursor: "pointer", padding: 4, fontSize: "1.1rem", lineHeight: 1,
              }}
              title="Sluiten"
            >
              &times;
            </button>
          </div>
          <div
            onClick={() => onOpenDetail(anecdote)}
            style={{ cursor: "pointer" }}
          >
            <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: 4 }}>
              {anecdote.mood && <span style={{ marginRight: 6 }}>{anecdote.mood}</span>}
              {anecdote.subject}
            </h3>
            <p style={{
              color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.5,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {anecdote.story}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
