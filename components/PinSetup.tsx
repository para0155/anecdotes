"use client";

import { useState, useEffect } from "react";
import { hashPin, PIN_HASH_KEY, UNLOCK_SESSION_KEY } from "./LockScreen";

export default function PinSetup() {
  const [hasPin, setHasPin] = useState(false);
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [step, setStep] = useState<"idle" | "set" | "confirm">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setHasPin(!!localStorage.getItem(PIN_HASH_KEY));
  }, []);

  async function handleSetPin() {
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setMessage("PIN moet 4 cijfers zijn");
      return;
    }
    if (step === "set") {
      setStep("confirm");
      setMessage("");
      return;
    }
    if (newPin !== confirmPin) {
      setMessage("PINs komen niet overeen. Probeer opnieuw.");
      setConfirmPin("");
      setStep("set");
      return;
    }
    const hashed = await hashPin(newPin);
    localStorage.setItem(PIN_HASH_KEY, hashed);
    sessionStorage.setItem(UNLOCK_SESSION_KEY, "true");
    setHasPin(true);
    setStep("idle");
    setNewPin("");
    setConfirmPin("");
    setMessage("PIN ingesteld!");
    setTimeout(() => setMessage(""), 3000);
  }

  function handleRemovePin() {
    localStorage.removeItem(PIN_HASH_KEY);
    sessionStorage.removeItem(UNLOCK_SESSION_KEY);
    setHasPin(false);
    setMessage("PIN verwijderd!");
    setTimeout(() => setMessage(""), 3000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 style={{ fontSize: "0.95rem", fontWeight: 650, color: "var(--text)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: "middle", marginRight: 8 }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        PIN vergrendeling
      </h3>

      {hasPin && step === "idle" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "0.85rem", color: "var(--success)" }}>PIN is actief</span>
          <button className="btn btn-sm btn-danger" onClick={handleRemovePin}>
            PIN verwijderen
          </button>
        </div>
      )}

      {!hasPin && step === "idle" && (
        <button className="btn btn-sm btn-primary" onClick={() => setStep("set")} style={{ alignSelf: "flex-start" }}>
          PIN instellen
        </button>
      )}

      {step === "set" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label className="form-label">Kies een 4-cijferige PIN</label>
          <input
            className="input"
            type="password"
            inputMode="numeric"
            maxLength={4}
            pattern="[0-9]{4}"
            placeholder="Bijv. 1234"
            value={newPin}
            onChange={e => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            autoFocus
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-sm" onClick={() => { setStep("idle"); setNewPin(""); }}>Annuleer</button>
            <button className="btn btn-sm btn-primary" onClick={handleSetPin} disabled={newPin.length !== 4}>Volgende</button>
          </div>
        </div>
      )}

      {step === "confirm" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label className="form-label">Bevestig je PIN</label>
          <input
            className="input"
            type="password"
            inputMode="numeric"
            maxLength={4}
            pattern="[0-9]{4}"
            placeholder="Voer PIN opnieuw in"
            value={confirmPin}
            onChange={e => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            autoFocus
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-sm" onClick={() => { setStep("idle"); setNewPin(""); setConfirmPin(""); }}>Annuleer</button>
            <button className="btn btn-sm btn-primary" onClick={handleSetPin} disabled={confirmPin.length !== 4}>Bevestigen</button>
          </div>
        </div>
      )}

      {message && (
        <span style={{ fontSize: "0.85rem", color: message.includes("niet") || message.includes("moet") ? "var(--danger)" : "var(--success)" }}>
          {message}
        </span>
      )}

      <p style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
        De app wordt vergrendeld wanneer je het tabblad sluit of de browser herstart.
      </p>
    </div>
  );
}
