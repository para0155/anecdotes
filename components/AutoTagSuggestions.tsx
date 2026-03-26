"use client";

import { useState } from "react";
import { getTagColor } from "@/lib/tagColors";

interface Suggestion {
  type: "tag" | "person" | "location" | "mood";
  value: string;
}

interface Props {
  storyText: string;
  currentTags: string[];
  currentPeople: string[];
  currentLocation: string;
  currentMood: string;
  onAcceptTag: (tag: string) => void;
  onAcceptPerson: (person: string) => void;
  onAcceptLocation: (location: string) => void;
  onAcceptMood: (mood: string) => void;
}

export default function AutoTagSuggestions({
  storyText,
  currentTags,
  currentPeople,
  currentLocation,
  currentMood,
  onAcceptTag,
  onAcceptPerson,
  onAcceptLocation,
  onAcceptMood,
}: Props) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [fetched, setFetched] = useState(false);

  async function fetchSuggestions() {
    if (storyText.length < 20) return;
    setLoading(true);
    setFetched(true);
    try {
      const res = await fetch("/api/autotag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story: storyText }),
      });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const data = await res.json();
      const newSuggestions: Suggestion[] = [];

      if (data.tags) {
        for (const t of data.tags) {
          if (!currentTags.includes(t)) {
            newSuggestions.push({ type: "tag", value: t });
          }
        }
      }
      if (data.people) {
        for (const p of data.people) {
          if (!currentPeople.includes(p)) {
            newSuggestions.push({ type: "person", value: p });
          }
        }
      }
      if (data.location && !currentLocation) {
        newSuggestions.push({ type: "location", value: data.location });
      }
      if (data.mood && !currentMood) {
        newSuggestions.push({ type: "mood", value: data.mood });
      }

      setSuggestions(newSuggestions);
    } catch {
      // Silently fail - AI tagging is optional
    }
    setLoading(false);
  }

  function handleAccept(s: Suggestion) {
    switch (s.type) {
      case "tag": onAcceptTag(s.value); break;
      case "person": onAcceptPerson(s.value); break;
      case "location": onAcceptLocation(s.value); break;
      case "mood": onAcceptMood(s.value); break;
    }
    setDismissed(prev => new Set(prev).add(`${s.type}-${s.value}`));
  }

  function handleDismiss(s: Suggestion) {
    setDismissed(prev => new Set(prev).add(`${s.type}-${s.value}`));
  }

  const typeLabels: Record<string, string> = {
    tag: "Tag",
    person: "Persoon",
    location: "Locatie",
    mood: "Stemming",
  };

  const visible = suggestions.filter(s => !dismissed.has(`${s.type}-${s.value}`));

  if (!fetched && storyText.length >= 20) {
    return (
      <button
        className="btn btn-sm"
        onClick={fetchSuggestions}
        disabled={loading}
        style={{ alignSelf: "flex-start", marginTop: 4 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
          <path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
        </svg>
        {loading ? "AI denkt na..." : "AI suggesties"}
      </button>
    );
  }

  if (loading) {
    return (
      <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", padding: "8px 0" }}>
        AI analyseert je tekst...
      </div>
    );
  }

  if (visible.length === 0) return null;

  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 6,
      padding: "8px 0",
      animation: "fadeIn 0.3s ease-out",
    }}>
      <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", width: "100%", marginBottom: 2 }}>
        AI suggesties:
      </span>
      {visible.map(s => {
        const tagColor = s.type === "tag" ? getTagColor(s.value) : null;
        return (
          <div key={`${s.type}-${s.value}`} style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "4px 10px",
            borderRadius: 16,
            background: tagColor?.bg || "var(--accent-light)",
            color: tagColor?.color || "var(--accent)",
            fontSize: "0.8rem",
            fontWeight: 550,
            cursor: "pointer",
            transition: "all 0.2s",
            animation: "scaleIn 0.2s ease-out",
          }}>
            <span style={{
              fontSize: "0.65rem", fontWeight: 700,
              opacity: 0.7, textTransform: "uppercase",
              letterSpacing: "0.03em",
            }}>
              {typeLabels[s.type]}
            </span>
            <span onClick={() => handleAccept(s)} style={{ cursor: "pointer" }}>
              {s.value}
            </span>
            <button
              onClick={() => handleDismiss(s)}
              style={{
                background: "none", border: "none",
                color: "inherit", cursor: "pointer",
                padding: 0, fontSize: "0.85rem",
                lineHeight: 1, opacity: 0.5,
                fontFamily: "inherit",
              }}
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
}
