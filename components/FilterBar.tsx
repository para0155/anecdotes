"use client";

import { useState, useRef, useEffect } from "react";
import { Filters, SortOption } from "@/lib/types";
import { getUniquePeople, getUniqueLocations, getUniqueTags } from "@/lib/storage";

interface Props {
  filters: Filters;
  sort: SortOption;
  onFiltersChange: (f: Filters) => void;
  onSortChange: (s: SortOption) => void;
}

interface Suggestion {
  type: "person" | "location" | "tag";
  label: string;
  value: string;
}

const TYPE_LABELS: Record<Suggestion["type"], string> = {
  person: "Persoon",
  location: "Locatie",
  tag: "Tag",
};

const TYPE_COLORS: Record<Suggestion["type"], { bg: string; color: string }> = {
  person: { bg: "var(--accent-light)", color: "var(--accent)" },
  location: { bg: "var(--success-light)", color: "var(--success)" },
  tag: { bg: "var(--info-light)", color: "var(--info)" },
};

export default function FilterBar({ filters, sort, onFiltersChange, onSortChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const people = getUniquePeople();
  const locations = getUniqueLocations();
  const tags = getUniqueTags();

  const activeFilterCount = [
    filters.person, filters.location, filters.tag,
    filters.dateFrom, filters.dateTo, filters.favoritesOnly,
  ].filter(Boolean).length;

  function update(patch: Partial<Filters>) {
    onFiltersChange({ ...filters, ...patch });
  }

  function clearAll() {
    onFiltersChange({
      search: filters.search,
      person: "", location: "", tag: "",
      dateFrom: "", dateTo: "",
      favoritesOnly: false,
    });
  }

  function handleSearchChange(value: string) {
    update({ search: value });
    if (value.length >= 1) {
      const q = value.toLowerCase();
      const results: Suggestion[] = [];

      for (const p of people) {
        if (p.toLowerCase().includes(q)) {
          results.push({ type: "person", label: p, value: p });
        }
      }
      for (const l of locations) {
        if (l.toLowerCase().includes(q)) {
          results.push({ type: "location", label: l, value: l });
        }
      }
      for (const t of tags) {
        if (t.toLowerCase().includes(q)) {
          results.push({ type: "tag", label: t, value: t });
        }
      }

      setSuggestions(results.slice(0, 8));
      setShowSuggestions(results.length > 0);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  }

  function selectSuggestion(s: Suggestion) {
    if (s.type === "person") {
      update({ person: s.value, search: "" });
    } else if (s.type === "location") {
      update({ location: s.value, search: "" });
    } else {
      update({ tag: s.value, search: "" });
    }
    setShowSuggestions(false);
    setSuggestions([]);
  }

  // Close suggestions on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: expanded ? 10 : 0 }}>
        <div className="search-bar" style={{ flex: 1, position: "relative" }} ref={searchRef}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="input"
            type="text"
            placeholder="Zoek in je verhalen..."
            value={filters.search}
            onChange={e => handleSearchChange(e.target.value)}
            onFocus={() => {
              if (filters.search.length >= 1 && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />
          {/* Search suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0, right: 0,
              background: "var(--bg-card-solid)",
              border: "1px solid var(--border-light)",
              borderRadius: "var(--radius-sm)",
              boxShadow: "var(--shadow-md)",
              zIndex: 60,
              overflow: "hidden",
              animation: "scaleIn 0.15s ease-out",
            }}>
              {suggestions.map((s, i) => (
                <button
                  key={`${s.type}-${s.value}-${i}`}
                  onClick={() => selectSuggestion(s)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", width: "100%",
                    background: "none", border: "none", borderBottom: i < suggestions.length - 1 ? "1px solid var(--border)" : "none",
                    cursor: "pointer", fontFamily: "inherit",
                    color: "var(--text)", fontSize: "0.9rem",
                    textAlign: "left", transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <span style={{
                    fontSize: "0.7rem", fontWeight: 700,
                    padding: "2px 8px", borderRadius: 10,
                    background: TYPE_COLORS[s.type].bg,
                    color: TYPE_COLORS[s.type].color,
                    textTransform: "uppercase", letterSpacing: "0.04em",
                    flexShrink: 0,
                  }}>
                    {TYPE_LABELS[s.type]}
                  </span>
                  <span style={{ fontWeight: 500 }}>{s.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          className="btn btn-icon"
          onClick={() => setExpanded(!expanded)}
          style={{
            position: "relative",
            borderColor: activeFilterCount > 0 ? "rgba(139,108,255,0.3)" : undefined,
            background: activeFilterCount > 0 ? "var(--accent-light)" : undefined,
            color: activeFilterCount > 0 ? "var(--accent)" : "var(--text-secondary)",
            width: 44, height: 44,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
          </svg>
          {activeFilterCount > 0 && <span className="filter-badge">{activeFilterCount}</span>}
        </button>
      </div>

      {expanded && (
        <div className="card animate-in" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", letterSpacing: "0.02em" }}>
              Filters
            </span>
            {activeFilterCount > 0 && (
              <button className="back-btn" onClick={clearAll} style={{ fontSize: "0.82rem" }}>Wis alles</button>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Persoon</label>
              <select className="input" value={filters.person} onChange={e => update({ person: e.target.value })}>
                <option value="">Iedereen</option>
                {people.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Locatie</label>
              <select className="input" value={filters.location} onChange={e => update({ location: e.target.value })}>
                <option value="">Overal</option>
                {locations.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tag</label>
              <select className="input" value={filters.tag} onChange={e => update({ tag: e.target.value })}>
                <option value="">Alle tags</option>
                {tags.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Sorteer</label>
              <select className="input" value={sort} onChange={e => onSortChange(e.target.value as SortOption)}>
                <option value="newest">Nieuwste eerst</option>
                <option value="oldest">Oudste eerst</option>
                <option value="recent-edit">Laatst bewerkt</option>
                <option value="alpha">Alfabetisch</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Datum van</label>
              <input className="input" type="date" value={filters.dateFrom} onChange={e => update({ dateFrom: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Datum tot</label>
              <input className="input" type="date" value={filters.dateTo} onChange={e => update({ dateTo: e.target.value })} />
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "4px 0" }}>
            <input
              type="checkbox"
              checked={filters.favoritesOnly}
              onChange={e => update({ favoritesOnly: e.target.checked })}
            />
            <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>Alleen favorieten</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </label>
        </div>
      )}
    </div>
  );
}
