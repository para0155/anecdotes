"use client";

import { useState, useEffect } from "react";
import { exportAnecdotes, importAnecdotes } from "@/lib/storage";

interface Props {
  onImported: () => void;
}

const GIST_TOKEN_KEY = "anecdotes_gist_token";
const GIST_ID_KEY = "anecdotes_gist_id";

export default function GistBackup({ onImported }: Props) {
  const [token, setToken] = useState("");
  const [gistId, setGistId] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem(GIST_TOKEN_KEY) || "");
    setGistId(localStorage.getItem(GIST_ID_KEY) || "");
  }, []);

  function saveSettings() {
    localStorage.setItem(GIST_TOKEN_KEY, token.trim());
    localStorage.setItem(GIST_ID_KEY, gistId.trim());
    setStatus("Instellingen opgeslagen!");
    setTimeout(() => setStatus(""), 3000);
  }

  async function handleBackup() {
    if (!token.trim()) {
      setStatus("Voer eerst een GitHub token in");
      return;
    }
    setLoading(true);
    setStatus("");

    try {
      const json = exportAnecdotes();
      const filename = "anekdotes-backup.json";
      const savedGistId = localStorage.getItem(GIST_ID_KEY);

      if (savedGistId) {
        // Update existing gist
        const res = await fetch(`https://api.github.com/gists/${savedGistId}`, {
          method: "PATCH",
          headers: {
            Authorization: `token ${token.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            description: `Anekdotes backup - ${new Date().toLocaleString("nl-NL")}`,
            files: { [filename]: { content: json } },
          }),
        });

        if (res.status === 404) {
          // Gist deleted, create new
          localStorage.removeItem(GIST_ID_KEY);
          setGistId("");
          await createNewGist(json, filename);
        } else if (!res.ok) {
          throw new Error(`GitHub API fout: ${res.status}`);
        } else {
          setStatus("Backup bijgewerkt!");
        }
      } else {
        await createNewGist(json, filename);
      }
    } catch (e) {
      setStatus(`Fout: ${e instanceof Error ? e.message : "Onbekende fout"}`);
    }
    setLoading(false);
    setTimeout(() => setStatus(""), 5000);
  }

  async function createNewGist(json: string, filename: string) {
    const res = await fetch("https://api.github.com/gists", {
      method: "POST",
      headers: {
        Authorization: `token ${token.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: `Anekdotes backup - ${new Date().toLocaleString("nl-NL")}`,
        public: false,
        files: { [filename]: { content: json } },
      }),
    });

    if (!res.ok) throw new Error(`GitHub API fout: ${res.status}`);
    const data = await res.json();
    localStorage.setItem(GIST_ID_KEY, data.id);
    setGistId(data.id);
    setStatus("Backup aangemaakt!");
  }

  async function handleRestore() {
    const savedGistId = gistId.trim() || localStorage.getItem(GIST_ID_KEY);
    if (!token.trim()) {
      setStatus("Voer eerst een GitHub token in");
      return;
    }
    if (!savedGistId) {
      setStatus("Geen Gist ID bekend. Maak eerst een backup.");
      return;
    }
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch(`https://api.github.com/gists/${savedGistId}`, {
        headers: { Authorization: `token ${token.trim()}` },
      });

      if (!res.ok) throw new Error(`GitHub API fout: ${res.status}`);
      const data = await res.json();
      const file = data.files["anekdotes-backup.json"];
      if (!file) throw new Error("Backup bestand niet gevonden in Gist");

      const content = file.truncated
        ? await fetch(file.raw_url).then(r => r.text())
        : file.content;

      const count = importAnecdotes(content);
      setStatus(`${count} nieuwe anekdote${count !== 1 ? "s" : ""} hersteld!`);
      onImported();
    } catch (e) {
      setStatus(`Fout: ${e instanceof Error ? e.message : "Onbekende fout"}`);
    }
    setLoading(false);
    setTimeout(() => setStatus(""), 5000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h3 style={{ fontSize: "0.95rem", fontWeight: 650, color: "var(--text)" }}>
        GitHub Gist Backup
      </h3>

      <div className="form-group">
        <label className="form-label">GitHub Token</label>
        <input
          className="input"
          type="password"
          placeholder="ghp_..."
          value={token}
          onChange={e => setToken(e.target.value)}
        />
        <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
          Maak een token aan op github.com/settings/tokens met &quot;gist&quot; scope
        </span>
      </div>

      <div className="form-group">
        <label className="form-label">Gist ID (automatisch ingevuld)</label>
        <input
          className="input"
          placeholder="Wordt automatisch aangemaakt"
          value={gistId}
          onChange={e => setGistId(e.target.value)}
        />
      </div>

      <button className="btn btn-sm" onClick={saveSettings} disabled={loading}>
        Instellingen opslaan
      </button>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          className="btn btn-sm btn-primary"
          onClick={handleBackup}
          disabled={loading || !token.trim()}
          style={{ flex: 1 }}
        >
          {loading ? "Bezig..." : "Backup maken"}
        </button>
        <button
          className="btn btn-sm"
          onClick={handleRestore}
          disabled={loading || !token.trim()}
          style={{ flex: 1 }}
        >
          {loading ? "Bezig..." : "Herstellen"}
        </button>
      </div>

      {status && (
        <span style={{
          fontSize: "0.85rem",
          color: status.startsWith("Fout") ? "var(--danger)" : "var(--success)",
        }}>
          {status}
        </span>
      )}
    </div>
  );
}
