"use client";

import { Stats } from "@/lib/storage";

interface Props {
  stats: Stats;
  onBack: () => void;
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split("-");
  const months = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
  return `${months[parseInt(m) - 1]} ${y}`;
}

export default function StatsView({ stats, onBack }: Props) {
  const maxMonthCount = Math.max(...stats.byMonth.map(m => m.count), 1);

  return (
    <div>
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Terug
        </button>
      </div>

      <h1 style={{ marginBottom: 24 }}>Statistieken</h1>

      {/* Quick stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--accent)" }}>{stats.total}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Anekdotes</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#f59e0b" }}>{stats.favorites}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Favorieten</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#3b82f6" }}>{stats.withPhotos}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Met foto&apos;s</div>
        </div>
        <div className="card" style={{ textAlign: "center" }}>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: "#eab308" }}>{stats.withAudio}</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Met audio</div>
        </div>
      </div>

      {/* Timeline chart */}
      {stats.byMonth.length > 0 && (
        <div className="detail-section">
          <h3>Per maand</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {stats.byMonth.map(m => (
              <div key={m.month} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", width: 70, textAlign: "right", flexShrink: 0 }}>
                  {formatMonth(m.month)}
                </span>
                <div style={{ flex: 1, height: 24, background: "var(--bg-input)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    width: `${(m.count / maxMonthCount) * 100}%`,
                    height: "100%",
                    background: "var(--accent)",
                    borderRadius: 4,
                    minWidth: 24,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.75rem", fontWeight: 600, color: "white",
                  }}>
                    {m.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top people */}
      {stats.topPeople.length > 0 && (
        <div className="detail-section">
          <h3>Meest genoemde personen</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {stats.topPeople.map((p, i) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-dim)", width: 20 }}>{i + 1}.</span>
                <span className="pill">{p.name}</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "auto" }}>
                  {p.count}x
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top locations */}
      {stats.topLocations.length > 0 && (
        <div className="detail-section">
          <h3>Meest genoemde locaties</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {stats.topLocations.map((l, i) => (
              <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-dim)", width: 20 }}>{i + 1}.</span>
                <span className="pill" style={{ background: "var(--success-light)", color: "var(--success)" }}>{l.name}</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "auto" }}>{l.count}x</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top tags */}
      {stats.topTags.length > 0 && (
        <div className="detail-section">
          <h3>Meest gebruikte tags</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {stats.topTags.map(t => (
              <span key={t.name} className="pill">
                {t.name} <span style={{ opacity: 0.6 }}>({t.count})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Date range */}
      {stats.oldestDate && (
        <div className="detail-section">
          <h3>Periode</h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Van {new Date(stats.oldestDate + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
            {" "}tot {new Date(stats.newestDate + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
      )}
    </div>
  );
}
