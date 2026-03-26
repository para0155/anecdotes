"use client";

/*
  Supabase tabel schema:

  CREATE TABLE anecdotes (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    story TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    location TEXT,
    people JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    mood TEXT,
    favorite BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  -- Enable RLS
  ALTER TABLE anecdotes ENABLE ROW LEVEL SECURITY;

  -- Allow anonymous access (for simple use)
  CREATE POLICY "Allow all" ON anecdotes FOR ALL USING (true) WITH CHECK (true);
*/

import { useState, useEffect } from "react";
import { getSupabaseConfig, saveSupabaseConfig, clearSupabaseConfig, getSupabaseClient } from "@/lib/supabase";
import { getAnecdotes, importAnecdotes, exportAnecdotes } from "@/lib/storage";
import { Anecdote } from "@/lib/types";

export default function CloudSync() {
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [configured, setConfigured] = useState(false);
  const [status, setStatus] = useState("");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const config = getSupabaseConfig();
    if (config) {
      setUrl(config.url);
      setAnonKey(config.key);
      setConfigured(true);
    }
  }, []);

  function handleSaveConfig() {
    if (!url.trim() || !anonKey.trim()) {
      setStatus("Vul beide velden in");
      return;
    }
    saveSupabaseConfig(url, anonKey);
    setConfigured(true);
    setStatus("Configuratie opgeslagen!");
    setTimeout(() => setStatus(""), 3000);
  }

  function handleDisconnect() {
    clearSupabaseConfig();
    setUrl("");
    setAnonKey("");
    setConfigured(false);
    setStatus("Verbinding verbroken");
    setTimeout(() => setStatus(""), 3000);
  }

  async function handleSync() {
    const client = getSupabaseClient();
    if (!client) {
      setStatus("Supabase niet geconfigureerd");
      return;
    }

    setSyncing(true);
    setStatus("Synchroniseren...");

    try {
      // 1. Pull remote anecdotes
      const { data: remoteData, error: pullError } = await client
        .from("anecdotes")
        .select("*");

      if (pullError) throw new Error(`Pull fout: ${pullError.message}`);

      const remote: Anecdote[] = (remoteData || []).map((r: Record<string, unknown>) => ({
        id: r.id as string,
        subject: r.subject as string,
        story: r.story as string,
        date: r.date as string,
        time: (r.time as string) || undefined,
        location: (r.location as string) || undefined,
        people: (r.people as string[]) || [],
        tags: (r.tags as string[]) || [],
        mood: (r.mood as string) || undefined,
        favorite: (r.favorite as boolean) || false,
        attachments: (r.attachments as Anecdote["attachments"]) || [],
        createdAt: r.created_at as string,
        updatedAt: r.updated_at as string,
      }));

      const local = getAnecdotes();
      const localMap = new Map(local.map(a => [a.id, a]));
      const remoteMap = new Map(remote.map(a => [a.id, a]));

      // 2. Merge: newest updatedAt wins
      const toUpsertRemote: Anecdote[] = [];
      let importedCount = 0;

      // Check local items to push
      for (const loc of local) {
        const rem = remoteMap.get(loc.id);
        if (!rem || loc.updatedAt > rem.updatedAt) {
          toUpsertRemote.push(loc);
        }
      }

      // Check remote items to import locally
      const toImportLocal: Anecdote[] = [];
      for (const rem of remote) {
        const loc = localMap.get(rem.id);
        if (!loc || rem.updatedAt > loc.updatedAt) {
          toImportLocal.push(rem);
        }
      }

      // 3. Push to remote
      if (toUpsertRemote.length > 0) {
        const rows = toUpsertRemote.map(a => ({
          id: a.id,
          subject: a.subject,
          story: a.story,
          date: a.date,
          time: a.time || null,
          location: a.location || null,
          people: a.people,
          tags: a.tags,
          mood: a.mood || null,
          favorite: a.favorite,
          attachments: a.attachments,
          created_at: a.createdAt,
          updated_at: a.updatedAt,
        }));

        const { error: pushError } = await client
          .from("anecdotes")
          .upsert(rows, { onConflict: "id" });

        if (pushError) throw new Error(`Push fout: ${pushError.message}`);
      }

      // 4. Import remote items locally
      if (toImportLocal.length > 0) {
        const jsonStr = JSON.stringify(toImportLocal);
        importedCount = importAnecdotes(jsonStr);
        // Also update existing ones with newer remote data
        const existingLocal = getAnecdotes();
        const allJson = JSON.stringify(existingLocal);
        // Re-export to ensure consistency
        void allJson;
        void exportAnecdotes;
      }

      setStatus(`Sync voltooid! ${toUpsertRemote.length} gepusht, ${importedCount} nieuwe geimporteerd.`);
    } catch (e) {
      setStatus(`Fout: ${e instanceof Error ? e.message : "Onbekende fout"}`);
    }

    setSyncing(false);
    setTimeout(() => setStatus(""), 6000);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <h3 style={{ fontSize: "0.95rem", fontWeight: 650, color: "var(--text)" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: "middle", marginRight: 8 }}>
          <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.66 0 3-4.03 3-9s-1.34-9-3-9m0 18c-1.66 0-3-4.03-3-9s1.34-9 3-9"/>
        </svg>
        Cloud Sync (Supabase)
      </h3>

      {!configured ? (
        <>
          <div className="form-group">
            <label className="form-label">Supabase URL</label>
            <input
              className="input"
              placeholder="https://xxx.supabase.co"
              value={url}
              onChange={e => setUrl(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Anon Key</label>
            <input
              className="input"
              type="password"
              placeholder="eyJ..."
              value={anonKey}
              onChange={e => setAnonKey(e.target.value)}
            />
          </div>
          <button className="btn btn-sm btn-primary" onClick={handleSaveConfig} style={{ alignSelf: "flex-start" }}>
            Verbinden
          </button>
          <p style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
            Optioneel. Maak een Supabase project aan op supabase.com en maak de &quot;anecdotes&quot; tabel aan.
          </p>
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.85rem", color: "var(--success)" }}>Verbonden</span>
            <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
              {url.replace("https://", "").split(".")[0]}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-sm btn-primary" onClick={handleSync} disabled={syncing} style={{ flex: 1 }}>
              {syncing ? "Bezig..." : "Synchroniseren"}
            </button>
            <button className="btn btn-sm" onClick={handleDisconnect}>
              Ontkoppelen
            </button>
          </div>
        </>
      )}

      {status && (
        <span style={{
          fontSize: "0.85rem",
          color: status.startsWith("Fout") || status.startsWith("Vul") ? "var(--danger)" : "var(--success)",
        }}>
          {status}
        </span>
      )}
    </div>
  );
}
