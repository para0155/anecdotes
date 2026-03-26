"use client";

import { useState, useEffect, useCallback } from "react";
import { Anecdote, Filters, SortOption } from "@/lib/types";
import { filterAnecdotes, deleteAnecdote, addAnecdote, updateAnecdote, getStats, getAnecdotes } from "@/lib/storage";
import AnecdoteForm from "@/components/AnecdoteForm";
import AnecdoteCard from "@/components/AnecdoteCard";
import AnecdoteDetail from "@/components/AnecdoteDetail";
import VoiceRecorder from "@/components/VoiceRecorder";
import FilterBar from "@/components/FilterBar";
import StatsView from "@/components/StatsView";
import ExportImport from "@/components/ExportImport";

type View = "list" | "detail" | "stats";

const emptyFilters: Filters = {
  search: "", person: "", location: "", tag: "",
  dateFrom: "", dateTo: "", favoritesOnly: false,
};

export default function Home() {
  const [anecdotes, setAnecdotes] = useState<Anecdote[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [sort, setSort] = useState<SortOption>("newest");
  const [view, setView] = useState<View>("list");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Anecdote | null>(null);
  const [viewing, setViewing] = useState<Anecdote | null>(null);
  const [showVoice, setShowVoice] = useState(false);
  const [prefillStory, setPrefillStory] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const refresh = useCallback(() => {
    setAnecdotes(filterAnecdotes(filters, sort));
    setTotalCount(getAnecdotes().length);
  }, [filters, sort]);

  useEffect(() => { refresh(); }, [refresh]);

  function handleSave(data: Omit<Anecdote, "id" | "createdAt" | "updatedAt">) {
    if (editing) {
      updateAnecdote(editing.id, data);
    } else {
      addAnecdote(data);
    }
    setShowForm(false);
    setEditing(null);
    setPrefillStory("");
    refresh();
  }

  async function handleDelete(id: string) {
    await deleteAnecdote(id);
    setViewing(null);
    setView("list");
    refresh();
  }

  function handleVoiceComplete(text: string) {
    setShowVoice(false);
    setPrefillStory(text);
    setEditing(null);
    setShowForm(true);
  }

  function openDetail(a: Anecdote) {
    setViewing(a);
    setView("detail");
  }

  function openEdit(a: Anecdote) {
    setEditing(a);
    setViewing(null);
    setView("list");
    setShowForm(true);
  }

  // Stats view
  if (view === "stats") {
    return (
      <div className="page-gradient">
        <div className="container">
          <StatsView stats={getStats()} onBack={() => setView("list")} />
        </div>
      </div>
    );
  }

  // Detail view
  if (view === "detail" && viewing) {
    return (
      <div className="page-gradient">
        <div className="container">
          <AnecdoteDetail
            anecdote={viewing}
            onBack={() => { setViewing(null); setView("list"); }}
            onEdit={() => openEdit(viewing)}
            onDelete={() => handleDelete(viewing.id)}
            onUpdate={(a) => { setViewing(a); refresh(); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="page-gradient">
      <div className="container">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div>
            <h1>Anekdotes</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 4 }}>
              {totalCount} verhaal{totalCount !== 1 ? "en" : ""}
              {anecdotes.length !== totalCount && ` (${anecdotes.length} getoond)`}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              className="mic-btn"
              onClick={() => setShowVoice(true)}
              title="Inspreek modus"
              style={{ width: 44, height: 44 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
            <div style={{ position: "relative" }}>
              <button
                className="btn btn-icon"
                onClick={() => setShowMenu(!showMenu)}
                style={{ width: 44, height: 44 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
              {showMenu && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setShowMenu(false)} />
                  <div style={{
                    position: "absolute", right: 0, top: "100%", marginTop: 4,
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)", padding: 8,
                    minWidth: 180, zIndex: 50,
                    display: "flex", flexDirection: "column", gap: 4,
                  }}>
                    <button className="btn btn-sm" style={{ justifyContent: "flex-start", border: "none" }}
                      onClick={() => { setView("stats"); setShowMenu(false); }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                        <line x1="6" y1="20" x2="6" y2="14"/>
                      </svg>
                      Statistieken
                    </button>
                    <div style={{ padding: "4px 12px" }} onClick={() => setShowMenu(false)}>
                      <ExportImport onImported={refresh} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <FilterBar
          filters={filters}
          sort={sort}
          onFiltersChange={setFilters}
          onSortChange={setSort}
        />

        {/* List */}
        {anecdotes.length === 0 ? (
          <div className="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <h2>{totalCount === 0 ? "Nog geen anekdotes" : "Geen resultaten"}</h2>
            <p style={{ marginTop: 8 }}>
              {totalCount === 0
                ? "Tik op + om je eerste verhaal toe te voegen, of gebruik de microfoon"
                : "Probeer andere zoektermen of filters"
              }
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {anecdotes.map(a => (
              <AnecdoteCard key={a.id} anecdote={a} onClick={() => openDetail(a)} />
            ))}
          </div>
        )}

        {/* FAB */}
        <button className="fab" onClick={() => { setEditing(null); setPrefillStory(""); setShowForm(true); }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </button>

        {/* Form Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setShowForm(false); setEditing(null); setPrefillStory(""); } }}>
            <div className="modal-content">
              <AnecdoteForm
                initial={editing}
                prefillStory={prefillStory}
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditing(null); setPrefillStory(""); }}
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
