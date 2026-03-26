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
import ThemeToggle from "@/components/ThemeToggle";
import GistBackup from "@/components/GistBackup";
import SwipeableCard from "@/components/SwipeableCard";

type View = "list" | "detail" | "stats" | "settings";

const emptyFilters: Filters = {
  search: "", person: "", location: "", tag: "",
  dateFrom: "", dateTo: "", favoritesOnly: false,
};

const MONTH_NAMES = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December",
];

function getMonthYearLabel(dateStr: string): string {
  const [y, m] = dateStr.split("-");
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`;
}

function groupByMonth(anecdotes: Anecdote[]): { label: string; items: Anecdote[] }[] {
  const groups: { label: string; items: Anecdote[] }[] = [];
  let currentLabel = "";

  for (const a of anecdotes) {
    const label = getMonthYearLabel(a.date);
    if (label !== currentLabel) {
      groups.push({ label, items: [] });
      currentLabel = label;
    }
    groups[groups.length - 1].items.push(a);
  }

  return groups;
}

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
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

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

  // Settings view
  if (view === "settings") {
    return (
      <div className="page-gradient">
        <div className="container">
          <div className="animate-in">
            <div className="detail-header">
              <button className="back-btn" onClick={() => setView("list")}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                Terug
              </button>
            </div>
            <h1 style={{ marginBottom: 28 }}>Instellingen</h1>

            <div className="card" style={{ marginBottom: 16 }}>
              <GistBackup onImported={refresh} />
            </div>

            <div className="card">
              <h3 style={{ fontSize: "0.95rem", fontWeight: 650, color: "var(--text)", marginBottom: 14 }}>
                Exporteren / Importeren
              </h3>
              <ExportImport onImported={refresh} />
            </div>
          </div>
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

  // Empty state = Hero welcome
  if (totalCount === 0) {
    return (
      <div className="page-gradient">
        {/* Animated background orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className="hero-container">
          {/* Logo */}
          <div className="hero-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#heroGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <defs>
                <linearGradient id="heroGrad" x1="0" y1="0" x2="24" y2="24">
                  <stop offset="0%" stopColor="#8b6cff" />
                  <stop offset="100%" stopColor="#6cb4ff" />
                </linearGradient>
              </defs>
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>

          <h1 className="hero-title">Anekdotes</h1>
          <p className="hero-subtitle">
            Bewaar de verhalen van je leven.<br />
            Elk moment, elke herinnering, voor altijd.
          </p>

          {/* Action cards */}
          <div className="hero-actions">
            <button className="hero-card" onClick={() => { setEditing(null); setPrefillStory(""); setShowForm(true); }}>
              <div className="hero-card-icon" style={{ background: "var(--accent-light)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </div>
              <div className="hero-card-text">
                <strong>Schrijf een anekdote</strong>
                <span>Voeg je eerste verhaal toe</span>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>

            <button className="hero-card" onClick={() => setShowVoice(true)}>
              <div className="hero-card-icon" style={{ background: "var(--success-light)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" y1="19" x2="12" y2="23"/>
                  <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
              </div>
              <div className="hero-card-text">
                <strong>Spreek het in</strong>
                <span>Gebruik je stem om te vertellen</span>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          {/* Feature highlights */}
          <div className="hero-features">
            <div className="hero-feature">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <circle cx="12" cy="10" r="3"/><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              </svg>
              <span>Locaties</span>
            </div>
            <div className="hero-feature">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Personen</span>
            </div>
            <div className="hero-feature">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>Foto&apos;s</span>
            </div>
            <div className="hero-feature">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>Favorieten</span>
            </div>
          </div>
        </div>

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
    );
  }

  // Group anecdotes by month for date-grouping view
  const canGroupByDate = sort === "newest" || sort === "oldest";
  const groups = canGroupByDate ? groupByMonth(anecdotes) : null;

  // Main list view (has anecdotes)
  return (
    <div className="page-gradient">
      {/* Subtle background orbs */}
      <div className="orb orb-1" style={{ opacity: 0.3 }} />
      <div className="orb orb-2" style={{ opacity: 0.2 }} />

      <div className="container">
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: "2rem" }}>Anekdotes</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: 6 }}>
              {totalCount} verhaal{totalCount !== 1 ? "en" : ""}
              {anecdotes.length !== totalCount && (
                <span style={{ color: "var(--accent)" }}> &middot; {anecdotes.length} getoond</span>
              )}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <ThemeToggle />
            <button
              className="mic-btn"
              onClick={() => setShowVoice(true)}
              title="Inspreek modus"
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
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                </svg>
              </button>
              {showMenu && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setShowMenu(false)} />
                  <div className="dropdown-menu">
                    <button className="dropdown-item" onClick={() => { setView("stats"); setShowMenu(false); }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                        <line x1="6" y1="20" x2="6" y2="14"/>
                      </svg>
                      Statistieken
                    </button>
                    <button className="dropdown-item" onClick={() => { setView("settings"); setShowMenu(false); }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                      </svg>
                      Instellingen
                    </button>
                    <div className="dropdown-divider" />
                    <div style={{ padding: "6px 8px" }} onClick={() => setShowMenu(false)}>
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
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <h2>Geen resultaten</h2>
            <p style={{ marginTop: 8 }}>Probeer andere zoektermen of filters</p>
          </div>
        ) : groups ? (
          /* Date-grouped view */
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {groups.map(group => (
              <div key={group.label}>
                <div className="month-header">
                  {group.label}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {group.items.map(a => (
                    isTouchDevice ? (
                      <SwipeableCard key={a.id} onDelete={() => handleDelete(a.id)}>
                        <AnecdoteCard anecdote={a} onClick={() => openDetail(a)} />
                      </SwipeableCard>
                    ) : (
                      <AnecdoteCard key={a.id} anecdote={a} onClick={() => openDetail(a)} />
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Flat list view (non-date sorts) */
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {anecdotes.map(a => (
              isTouchDevice ? (
                <SwipeableCard key={a.id} onDelete={() => handleDelete(a.id)}>
                  <AnecdoteCard anecdote={a} onClick={() => openDetail(a)} />
                </SwipeableCard>
              ) : (
                <AnecdoteCard key={a.id} anecdote={a} onClick={() => openDetail(a)} />
              )
            ))}
          </div>
        )}

        {/* FAB */}
        <button className="fab" onClick={() => { setEditing(null); setPrefillStory(""); setShowForm(true); }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
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
