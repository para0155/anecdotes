"use client";

import { useState, useEffect, useCallback } from "react";

const PIN_HASH_KEY = "anecdotes_pin_hash";
const UNLOCK_SESSION_KEY = "anecdotes_unlocked";

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + "anecdotes_salt_2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export function isPinSet(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(PIN_HASH_KEY);
}

export function isUnlocked(): boolean {
  if (typeof window === "undefined") return true;
  if (!isPinSet()) return true;
  return sessionStorage.getItem(UNLOCK_SESSION_KEY) === "true";
}

export function lockApp() {
  sessionStorage.removeItem(UNLOCK_SESSION_KEY);
}

interface Props {
  onUnlock: () => void;
}

export default function LockScreen({ onUnlock }: Props) {
  const [digits, setDigits] = useState<string[]>(["", "", "", ""]);
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkPin = useCallback(async (pin: string) => {
    setChecking(true);
    const hashed = await hashPin(pin);
    const stored = localStorage.getItem(PIN_HASH_KEY);
    if (hashed === stored) {
      sessionStorage.setItem(UNLOCK_SESSION_KEY, "true");
      onUnlock();
    } else {
      setError(true);
      setTimeout(() => {
        setDigits(["", "", "", ""]);
        setError(false);
      }, 600);
    }
    setChecking(false);
  }, [onUnlock]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (checking) return;
      if (e.key >= "0" && e.key <= "9") {
        setDigits(prev => {
          const next = [...prev];
          const emptyIdx = next.findIndex(d => d === "");
          if (emptyIdx !== -1) {
            next[emptyIdx] = e.key;
            if (emptyIdx === 3) {
              const pin = next.join("");
              setTimeout(() => checkPin(pin), 100);
            }
          }
          return next;
        });
      } else if (e.key === "Backspace") {
        setDigits(prev => {
          const next = [...prev];
          const lastFilledIdx = next.map((d, i) => d !== "" ? i : -1).filter(i => i !== -1).pop();
          if (lastFilledIdx !== undefined && lastFilledIdx >= 0) {
            next[lastFilledIdx] = "";
          }
          return next;
        });
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [checking, checkPin]);

  function handleDigitClick(num: string) {
    if (checking) return;
    setDigits(prev => {
      const next = [...prev];
      const emptyIdx = next.findIndex(d => d === "");
      if (emptyIdx !== -1) {
        next[emptyIdx] = num;
        if (emptyIdx === 3) {
          const pin = next.join("");
          setTimeout(() => checkPin(pin), 100);
        }
      }
      return next;
    });
  }

  function handleBackspace() {
    if (checking) return;
    setDigits(prev => {
      const next = [...prev];
      const lastFilledIdx = next.map((d, i) => d !== "" ? i : -1).filter(i => i !== -1).pop();
      if (lastFilledIdx !== undefined && lastFilledIdx >= 0) {
        next[lastFilledIdx] = "";
      }
      return next;
    });
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "var(--bg)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      gap: 32,
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <h2 style={{ color: "var(--text)", fontWeight: 700, fontSize: "1.3rem" }}>Anekdotes vergrendeld</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 6 }}>Voer je PIN in om te ontgrendelen</p>
      </div>

      {/* PIN dots */}
      <div style={{
        display: "flex", gap: 16,
        animation: error ? "shake 0.5s ease-in-out" : undefined,
      }}>
        {digits.map((d, i) => (
          <div key={i} style={{
            width: 52, height: 52,
            borderRadius: "50%",
            border: `2px solid ${error ? "var(--danger)" : d ? "var(--accent)" : "var(--border-light)"}`,
            background: d ? (error ? "var(--danger)" : "var(--accent)") : "var(--bg-input)",
            transition: "all 0.2s ease",
            transform: d ? "scale(1.05)" : "scale(1)",
            boxShadow: d ? (error ? "0 0 20px rgba(255,92,92,0.3)" : "0 0 20px var(--accent-glow)") : "none",
          }} />
        ))}
      </div>

      {/* Number pad */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
        maxWidth: 280,
      }}>
        {["1","2","3","4","5","6","7","8","9","","0","back"].map((key) => {
          if (key === "") return <div key="empty" />;
          if (key === "back") return (
            <button key="back" onClick={handleBackspace} style={{
              width: 72, height: 56, borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "var(--bg-card)", color: "var(--text)",
              cursor: "pointer", fontSize: "1.1rem",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "inherit", transition: "all 0.15s",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
                <line x1="18" y1="9" x2="12" y2="15"/>
                <line x1="12" y1="9" x2="18" y2="15"/>
              </svg>
            </button>
          );
          return (
            <button key={key} onClick={() => handleDigitClick(key)} style={{
              width: 72, height: 56, borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "var(--bg-card)", color: "var(--text)",
              cursor: "pointer", fontSize: "1.3rem", fontWeight: 600,
              fontFamily: "inherit", transition: "all 0.15s",
            }}>
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Export hash function for PinSetup
export { hashPin, PIN_HASH_KEY, UNLOCK_SESSION_KEY };
