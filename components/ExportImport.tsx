"use client";

import { useRef, useState } from "react";
import { exportAnecdotes, importAnecdotes } from "@/lib/storage";

interface Props {
  onImported: () => void;
}

export default function ExportImport({ onImported }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  function handleExport() {
    const json = exportAnecdotes();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `anekdotes-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Export gedownload!");
    setTimeout(() => setMessage(""), 3000);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const count = importAnecdotes(reader.result as string);
        setMessage(`${count} nieuwe anekdote${count !== 1 ? "s" : ""} geimporteerd!`);
        onImported();
      } catch {
        setMessage("Fout bij importeren. Controleer het bestand.");
      }
      setTimeout(() => setMessage(""), 4000);
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn btn-sm" onClick={handleExport}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Exporteer
        </button>
        <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Importeer
        </button>
        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
      </div>
      {message && (
        <span style={{ fontSize: "0.85rem", color: "var(--success)" }}>{message}</span>
      )}
    </div>
  );
}
