"use client";

import { useState } from "react";
import { Filters, SortOption } from "@/lib/types";
import { getUniquePeople, getUniqueLocations, getUniqueTags } from "@/lib/storage";

interface Props {
  filters: Filters;
  sort: SortOption;
  onFiltersChange: (f: Filters) => void;
  onSortChange: (s: SortOption) => void;
}

export default function FilterBar({ filters, sort, onFiltersChange, onSortChange }: Props) {
  const [expanded, setExpanded] = useState(false);
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

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: expanded ? 10 : 0 }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="input"
            type="text"
            placeholder="Zoek in je verhalen..."
            value={filters.search}
            onChange={e => update({ search: e.target.value })}
          />
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
