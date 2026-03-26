"use client";

import { useState, useEffect } from "react";
import { getAnecdotes } from "@/lib/storage";

interface InsightsData {
  content: string;
  timestamp: number;
}

const CACHE_KEY = "anecdotes_insights";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24h

function getCachedInsights(): InsightsData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as InsightsData;
    if (Date.now() - data.timestamp > CACHE_DURATION) return null;
    return data;
  } catch { return null; }
}

function cacheInsights(content: string) {
  const data: InsightsData = { content, timestamp: Date.now() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
}

interface Props {
  onBack: () => void;
}

export default function InsightsView({ onBack }: Props) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const cached = getCachedInsights();
    if (cached) {
      setContent(cached.content);
    } else {
      fetchInsights();
    }
  }, []);

  async function fetchInsights() {
    setLoading(true);
    setError("");
    try {
      const all = getAnecdotes();
      if (all.length === 0) {
        setContent("Nog geen anekdotes om te analyseren. Voeg eerst wat verhalen toe!");
        setLoading(false);
        return;
      }

      const summary = all.map(a => ({
        subject: a.subject,
        date: a.date,
        location: a.location || "",
        people: a.people,
        tags: a.tags,
        mood: a.mood || "",
        story: a.story.slice(0, 200),
      }));

      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anecdotes: summary }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fout bij ophalen inzichten");
      }

      const data = await res.json();
      setContent(data.insights);
      cacheInsights(data.insights);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Onbekende fout");
    }
    setLoading(false);
  }

  function handleRefresh() {
    localStorage.removeItem(CACHE_KEY);
    fetchInsights();
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
        <button className="btn btn-sm" style={{ marginLeft: "auto" }} onClick={handleRefresh} disabled={loading}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Vernieuw
        </button>
      </div>

      <h1 style={{ marginBottom: 8 }}>AI Inzichten</h1>
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: 24 }}>
        Analyse van je verhalen met behulp van AI
      </p>

      {loading ? (
        <div style={{
          padding: "60px 24px", textAlign: "center",
          background: "var(--bg-card)", borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
        }}>
          <div className="recording-pulse" style={{ fontSize: "2.5rem", marginBottom: 16 }}>&#x1F9E0;</div>
          <p style={{ color: "var(--text-secondary)", fontWeight: 500 }}>AI analyseert je verhalen...</p>
          <p style={{ color: "var(--text-dim)", fontSize: "0.85rem", marginTop: 8 }}>Dit kan even duren</p>
        </div>
      ) : error ? (
        <div className="error-box" style={{ marginBottom: 16 }}>
          {error}
        </div>
      ) : content ? (
        <div className="card" style={{ lineHeight: 1.8 }}>
          <div className="markdown-story" style={{ whiteSpace: "pre-wrap" }}>
            {content.split("\n").map((line, i) => {
              if (line.startsWith("## ")) {
                return <h2 key={i} style={{ marginTop: i > 0 ? 20 : 0, marginBottom: 10, fontSize: "1.15rem", fontWeight: 700, color: "var(--accent)" }}>{line.replace("## ", "")}</h2>;
              }
              if (line.startsWith("### ")) {
                return <h3 key={i} style={{ marginTop: 16, marginBottom: 8, fontSize: "1rem", fontWeight: 650, color: "var(--text)" }}>{line.replace("### ", "")}</h3>;
              }
              if (line.startsWith("- ") || line.startsWith("* ")) {
                return <div key={i} style={{ paddingLeft: 16, position: "relative", marginBottom: 4 }}><span style={{ position: "absolute", left: 4, color: "var(--accent)" }}>&bull;</span>{line.slice(2)}</div>;
              }
              if (line.trim() === "") {
                return <div key={i} style={{ height: 8 }} />;
              }
              return <p key={i} style={{ marginBottom: 6, color: "var(--text-secondary)" }}>{line}</p>;
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
