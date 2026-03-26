"use client";

import { useState, useEffect } from "react";

const LAST_REMINDER_KEY = "anecdotes_last_reminder";
const REMINDER_ENABLED_KEY = "anecdotes_reminder_enabled";
const REMINDER_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

function shouldShowReminder(): boolean {
  if (typeof window === "undefined") return false;
  const enabled = localStorage.getItem(REMINDER_ENABLED_KEY);
  if (enabled !== "true") return false;
  const last = localStorage.getItem(LAST_REMINDER_KEY);
  if (!last) return true;
  return Date.now() - parseInt(last) > REMINDER_INTERVAL;
}

export function DailyReminderBanner({ onDismiss }: { onDismiss: () => void }) {
  function handleDismiss() {
    localStorage.setItem(LAST_REMINDER_KEY, Date.now().toString());
    onDismiss();
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(139, 108, 255, 0.12) 0%, rgba(108, 140, 255, 0.08) 100%)",
      border: "1px solid rgba(139, 108, 255, 0.25)",
      borderRadius: "var(--radius)",
      padding: "14px 18px",
      marginBottom: 16,
      display: "flex",
      alignItems: "center",
      gap: 12,
      animation: "fadeIn 0.4s ease-out",
    }}>
      <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>&#x1F4DD;</span>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text)" }}>
          Tijd voor een nieuwe anekdote!
        </p>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: 2 }}>
          Wat heb je vandaag meegemaakt dat je wilt onthouden?
        </p>
      </div>
      <button
        onClick={handleDismiss}
        style={{
          background: "none", border: "none",
          color: "var(--text-dim)", cursor: "pointer",
          padding: 4, fontSize: "1.1rem", lineHeight: 1,
          fontFamily: "inherit",
        }}
      >
        &times;
      </button>
    </div>
  );
}

export function DailyReminderSettings() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(localStorage.getItem(REMINDER_ENABLED_KEY) === "true");
  }, []);

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(REMINDER_ENABLED_KEY, next ? "true" : "false");

    if (next && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <h3 style={{ fontSize: "0.95rem", fontWeight: 650, color: "var(--text)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: "middle", marginRight: 8 }}>
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        Dagelijkse herinnering
      </h3>
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={toggle}
        />
        <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
          Herinner me om anekdotes te schrijven
        </span>
      </label>
      <p style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
        Je krijgt een herinnering wanneer je de app opent en het meer dan 24 uur geleden is.
      </p>
    </div>
  );
}

export function useDailyReminder() {
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    if (shouldShowReminder()) {
      setShowReminder(true);
    }
  }, []);

  return { showReminder, dismissReminder: () => setShowReminder(false) };
}
