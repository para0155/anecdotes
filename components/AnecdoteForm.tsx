"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Anecdote } from "@/lib/types";

interface Props {
  initial?: Anecdote | null;
  onSave: (data: Omit<Anecdote, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
}

export default function AnecdoteForm({ initial, onSave, onCancel }: Props) {
  const [subject, setSubject] = useState(initial?.subject || "");
  const [story, setStory] = useState(initial?.story || "");
  const [date, setDate] = useState(initial?.date || new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(initial?.time || "");
  const [location, setLocation] = useState(initial?.location || "");
  const [people, setPeople] = useState<string[]>(initial?.people || []);
  const [tags, setTags] = useState<string[]>(initial?.tags || []);
  const [personInput, setPersonInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const personRef = useRef<HTMLInputElement>(null);
  const tagRef = useRef<HTMLInputElement>(null);

  function handlePersonKey(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && personInput.trim()) {
      e.preventDefault();
      const val = personInput.trim().replace(/,$/, "");
      if (val && !people.includes(val)) {
        setPeople([...people, val]);
      }
      setPersonInput("");
    }
  }

  function handleTagKey(e: KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const val = tagInput.trim().replace(/,$/, "");
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
      }
      setTagInput("");
    }
  }

  function handleSubmit() {
    if (!subject.trim() || !story.trim()) return;
    // Add any remaining input
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
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>{initial ? "Bewerken" : "Nieuwe anekdote"}</h2>
        <button className="back-btn" onClick={onCancel}>Annuleer</button>
      </div>

      <div className="form-group">
        <label className="form-label">Onderwerp *</label>
        <input
          className="input"
          placeholder="Waar gaat het over?"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          autoFocus
        />
      </div>

      <div className="form-group">
        <label className="form-label">Het verhaal *</label>
        <textarea
          id="story-input"
          className="input"
          placeholder="Vertel je anekdote..."
          value={story}
          onChange={e => setStory(e.target.value)}
          onInput={e => setStory((e.target as HTMLTextAreaElement).value)}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Datum</label>
          <input
            className="input"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Tijd (optioneel)</label>
          <input
            className="input"
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Locatie (optioneel)</label>
        <input
          className="input"
          placeholder="Waar gebeurde het?"
          value={location}
          onChange={e => setLocation(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">Personen (Enter of komma om toe te voegen)</label>
        <div className="tags-input" onClick={() => personRef.current?.focus()}>
          {people.map((p, i) => (
            <span key={i} className="tag">
              {p}
              <button onClick={() => setPeople(people.filter((_, j) => j !== i))}>x</button>
            </span>
          ))}
          <input
            ref={personRef}
            placeholder={people.length === 0 ? "Wie waren erbij?" : ""}
            value={personInput}
            onChange={e => setPersonInput(e.target.value)}
            onKeyDown={handlePersonKey}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Tags (Enter of komma om toe te voegen)</label>
        <div className="tags-input" onClick={() => tagRef.current?.focus()}>
          {tags.map((t, i) => (
            <span key={i} className="tag">
              {t}
              <button onClick={() => setTags(tags.filter((_, j) => j !== i))}>x</button>
            </span>
          ))}
          <input
            ref={tagRef}
            placeholder={tags.length === 0 ? "bijv. grappig, vakantie, werk" : ""}
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKey}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button className="btn" style={{ flex: 1 }} onClick={onCancel}>Annuleer</button>
        <button
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={handleSubmit}
          disabled={!subject.trim() || !story.trim()}
        >
          {initial ? "Opslaan" : "Toevoegen"}
        </button>
      </div>
    </div>
  );
}
