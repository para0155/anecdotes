"use client";

import { useState, useRef, KeyboardEvent, ChangeEvent } from "react";
import { Anecdote, Attachment } from "@/lib/types";
import { saveFile } from "@/lib/attachments";
import AttachmentPreview from "./AttachmentPreview";

interface Props {
  initial?: Anecdote | null;
  prefillStory?: string;
  onSave: (data: Omit<Anecdote, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

const MOODS = ["😄", "😢", "😠", "😱", "🤣", "🥰", "😎", "🤔", "😮", "💪"];

export default function AnecdoteForm({ initial, prefillStory, onSave, onCancel }: Props) {
  const [subject, setSubject] = useState(initial?.subject || "");
  const [story, setStory] = useState(initial?.story || prefillStory || "");
  const [date, setDate] = useState(initial?.date || new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(initial?.time || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [people, setPeople] = useState<string[]>(initial?.people || []);
  const [tags, setTags] = useState<string[]>(initial?.tags || []);
  const [mood, setMood] = useState(initial?.mood || "");
  const [favorite, setFavorite] = useState(initial?.favorite || false);
  const [attachments, setAttachments] = useState<Attachment[]>(initial?.attachments || []);
  const [personInput, setPersonInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const personRef = useRef<HTMLInputElement>(null);
  const tagRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handlePersonKey(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && personInput.trim()) {
      e.preventDefault();
      const val = personInput.trim().replace(/,$/, "");
      if (val && !people.includes(val)) setPeople([...people, val]);
      setPersonInput("");
    }
  }

  function handleTagKey(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const val = tagInput.trim().replace(/,$/, "");
      if (val && !tags.includes(val)) setTags([...tags, val]);
      setTagInput("");
    }
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    const newAttachments: Attachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const type: Attachment["type"] = file.type.startsWith("audio/") ? "audio" : "image";
      await saveFile(id, file);
      newAttachments.push({
        id,
        type,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        createdAt: new Date().toISOString(),
      });
    }
    setAttachments(prev => [...prev, ...newAttachments]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeAttachment(id: string) {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }

  function handleSubmit() {
    if (!subject.trim() || !story.trim()) return;
    const finalPeople = [...people];
    if (personInput.trim()) finalPeople.push(personInput.trim());
    const finalTags = [...tags];
    if (tagInput.trim()) finalTags.push(tagInput.trim());

    onSave({
      subject: subject.trim(),
      story: story.trim(),
      date,
      time: time || undefined,
      location: location.trim() || undefined,
      people: finalPeople,
      tags: finalTags,
      mood: mood || undefined,
      favorite,
      attachments,
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{initial ? "Bewerken" : "Nieuwe anekdote"}</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            className="btn-icon btn"
            onClick={() => setFavorite(!favorite)}
            title={favorite ? "Verwijder favoriet" : "Maak favoriet"}
            style={{ color: favorite ? "#f59e0b" : "var(--text-dim)", border: "none", background: "none" }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={favorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </button>
          <button className="back-btn" onClick={onCancel}>Annuleer</button>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Onderwerp *</label>
        <input className="input" placeholder="Waar gaat het over?" value={subject} onChange={e => setSubject(e.target.value)} autoFocus />
      </div>

      <div className="form-group">
        <label className="form-label">Het verhaal *</label>
        <textarea id="story-input" className="input" placeholder="Vertel je anekdote..." value={story} onChange={e => setStory(e.target.value)} style={{ minHeight: 150 }} />
      </div>

      {/* Mood */}
      <div className="form-group">
        <label className="form-label">Stemming (optioneel)</label>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {MOODS.map(m => (
            <button
              key={m}
              onClick={() => setMood(mood === m ? "" : m)}
              style={{
                fontSize: "1.4rem",
                width: 40, height: 40,
                borderRadius: "50%",
                border: mood === m ? "2px solid var(--accent)" : "2px solid transparent",
                background: mood === m ? "var(--accent-light)" : "var(--bg-input)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Datum</label>
          <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Tijd (optioneel)</label>
          <input className="input" type="time" value={time} onChange={e => setTime(e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Locatie (optioneel)</label>
        <input className="input" placeholder="Waar gebeurde het?" value={location} onChange={e => setLocation(e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">Personen (Enter of komma)</label>
        <div className="tags-input" onClick={() => personRef.current?.focus()}>
          {people.map((p, i) => (
            <span key={i} className="tag">
              {p}
              <button onClick={() => setPeople(people.filter((_, j) => j !== i))}>x</button>
            </span>
          ))}
          <input ref={personRef} placeholder={people.length === 0 ? "Wie waren erbij?" : ""} value={personInput} onChange={e => setPersonInput(e.target.value)} onKeyDown={handlePersonKey} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Tags (Enter of komma)</label>
        <div className="tags-input" onClick={() => tagRef.current?.focus()}>
          {tags.map((t, i) => (
            <span key={i} className="tag">
              {t}
              <button onClick={() => setTags(tags.filter((_, j) => j !== i))}>x</button>
            </span>
          ))}
          <input ref={tagRef} placeholder={tags.length === 0 ? "bijv. grappig, vakantie, werk" : ""} value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKey} />
        </div>
      </div>

      {/* Attachments */}
      <div className="form-group">
        <label className="form-label">Bijlagen (foto&apos;s &amp; audio)</label>
        {attachments.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
            {attachments.map(att => (
              <AttachmentPreview key={att.id} attachment={att} onRemove={() => removeAttachment(att.id)} />
            ))}
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*,audio/*"
          multiple
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button className="btn btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? "Uploaden..." : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
              </svg>
              Bijlage toevoegen
            </>
          )}
        </button>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button className="btn" style={{ flex: 1 }} onClick={onCancel}>Annuleer</button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={!subject.trim() || !story.trim()}>
          {initial ? "Opslaan" : "Toevoegen"}
        </button>
      </div>
    </div>
  );
}
