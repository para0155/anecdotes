"use client";

import { useState, useEffect, useCallback } from "react";
import { Anecdote } from "@/lib/types";
import { getAnecdotes, searchAnecdotes, deleteAnecdote, addAnecdote, updateAnecdote } from "@/lib/storage";
import AnecdoteForm from "@/components/AnecdoteForm";
import AnecdoteCard from "@/components/AnecdoteCard";
import AnecdoteDetail from "@/components/AnecdoteDetail";
import VoiceRecorder from "@/components/VoiceRecorder";

export default function Home() {
  const [anecdotes, setAnecdotes] = useState<Anecdote[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Anecdote | null>(null);
  const [viewing, setViewing] = useState<Anecdote | null>(null);
  const [showVoice, setShowVoice] = useState(false);

  const refresh = useCallback(() => {
    setAnecdotes(search ? searchAnecdotes(search) : getAnecdotes());
  }, [search]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleSave(data: Omit<Anecdote, "id" | "createdAt" | "updatedAt">) {
    if (editing) {
      updateAnecdote(editing.id, data);
    } else {
      addAnecdote(data);
    }
    setShowForm(false);
    setEditing(null);
    refresh();
  }

  function handleDelete(id: string) {
    deleteAnecdote(id);
    setViewing(null);
    refresh();
  }

  function handleVoiceComplete(text: string) {
    setShowVoice(false);
    setEditing(null);
    setShowForm(true);
    // Pre-fill the story with voice text - we pass it via a temp state
    setTimeout(() => {
      const el = document.getElementById("story-input") as HTMLTextAreaElement;
      if (el) {
        el.value = text;
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }, 100);
  }

  // Detail view
  if (viewing) {
    return (
      <div className="page-gradient">
        <div className="container">
          <AnecdoteDetail
            anecdote={viewing}
            onBack={() => setViewing(null)}
            onEdit={() => {
              setEditing(viewing);
              setViewing(null);
              setShowForm(true);
            }}
            onDelete={() => handleDelete(viewing.id)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-gradient">
      <div className="container">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1>Anekdotes</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 4 }}>
              {anecdotes.length} verhaal{anecdotes.length !== 1 ? "en" : ""}
            </p>
          </div>
          <button
            className="mic-btn"
            onClick={() => setShowVoice(true)}
            title="Inspreek modus"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="search-bar" style={{ marginBottom: 20 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="input"
            type="text"
            placeholder="Zoek op onderwerp, persoon, locatie..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* List */}
        {anecdotes.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <h2>Nog geen anekdotes</h2>
            <p style={{ marginTop: 8 }}>
              {search ? "Geen resultaten gevonden" : "Tik op + om je eerste verhaal toe te voegen"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {anecdotes.map(a => (
              <AnecdoteCard key={a.id} anecdote={a} onClick={() => setViewing(a)} />
            ))}
          </div>
        )}

        {/* FAB */}
        <button className="fab" onClick={() => { setEditing(null); setShowForm(true); }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>

        {/* Form Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); setEditing(null); } }}>
            <div className="modal-content">
              <AnecdoteForm
                initial={editing}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditing(null); }}
              />
            </div>
          </div>
        )}

        {/* Voice Modal */}
        {showVoice && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowVoice(false); }}>
            <div className="modal-content">
              <VoiceRecorder
                onComplete={handleVoiceComplete}
                onCancel={() => setShowVoice(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
