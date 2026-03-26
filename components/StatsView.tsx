"use client";

import { Stats } from "@/lib/storage";
import { getTagColor } from "@/lib/tagColors";

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
    <div className="animate-in">
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Terug
        </button>
      </div>

      <h1 style={{ marginBottom: 28 }}>Statistieken</h1>

      {/* Quick stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "var(--accent)" }}>{stats.total}</div>
          <div className="stat-label">Anekdotes</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "var(--warning)" }}>{stats.favorites}</div>
          <div className="stat-label">Favorieten</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "var(--info)" }}>{stats.withPhotos}</div>
          <div className="stat-label">Met foto&apos;s</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: "var(--success)" }}>{stats.withAudio}</div>
          <div className="stat-label">Met audio</div>
        </div>
      </div>

      {/* Timeline chart */}
      {stats.byMonth.length > 0 && (
        <div className="detail-section">
          <h3>Per maand</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {stats.byMonth.map(m => (
              <div key={m.month} className="bar-row">
                <span className="bar-label">{formatMonth(m.month)}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(m.count / maxMonthCount) * 100}%` }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {stats.topPeople.map((p, i) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontSize: "0.8rem", fontWeight: 700, color: i < 3 ? "var(--accent)" : "var(--text-dim)",
                  width: 22, textAlign: "center",
                }}>
                  {i + 1}
                </span>
                <span className="pill" style={{ fontSize: "0.85rem" }}>{p.name}</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "auto", fontWeight: 600 }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {stats.topLocations.map((l, i) => (
              <div key={l.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  fontSize: "0.8rem", fontWeight: 700, color: i < 3 ? "var(--success)" : "var(--text-dim)",
                  width: 22, textAlign: "center",
                }}>
                  {i + 1}
                </span>
                <span className="pill" style={{ background: "var(--success-light)", color: "var(--success)", fontSize: "0.85rem" }}>{l.name}</span>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "auto", fontWeight: 600 }}>{l.count}x</span>
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
            {stats.topTags.map(t => {
              const tc = getTagColor(t.name);
              return (
                <span key={t.name} className="pill" style={{ fontSize: "0.85rem", padding: "6px 14px", background: tc.bg, color: tc.color }}>
                  {t.name} <span style={{ opacity: 0.5, marginLeft: 2 }}>{t.count}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Date range */}
      {stats.oldestDate && (
        <div className="detail-section" style={{ textAlign: "center", marginTop: 32, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            Verhalen van{" "}
            <strong style={{ color: "var(--text-secondary)" }}>
              {new Date(stats.oldestDate + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
            </strong>
            {" "}tot{" "}
            <strong style={{ color: "var(--text-secondary)" }}>
              {new Date(stats.newestDate + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" })}
            </strong>
          </p>
        </div>
      )}
    </div>
  );
}
