import { Anecdote } from './types';

const STORAGE_KEY = 'anecdotes_data';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getAnecdotes(): Anecdote[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Anecdote[];
  } catch {
    return [];
  }
}

function saveAll(anecdotes: Anecdote[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(anecdotes));
}

export function addAnecdote(data: Omit<Anecdote, 'id' | 'createdAt' | 'updatedAt'>): Anecdote {
  const now = new Date().toISOString();
  const anecdote: Anecdote = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
  const all = getAnecdotes();
  all.unshift(anecdote);
  saveAll(all);
  return anecdote;
}

export function updateAnecdote(id: string, data: Partial<Omit<Anecdote, 'id' | 'createdAt'>>): Anecdote | null {
  const all = getAnecdotes();
  const idx = all.findIndex(a => a.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...data, updatedAt: new Date().toISOString() };
  saveAll(all);
  return all[idx];
}

export function deleteAnecdote(id: string): boolean {
  const all = getAnecdotes();
  const filtered = all.filter(a => a.id !== id);
  if (filtered.length === all.length) return false;
  saveAll(filtered);
  return true;
}

export function searchAnecdotes(query: string): Anecdote[] {
  const all = getAnecdotes();
  if (!query.trim()) return all;
  const q = query.toLowerCase();
  return all.filter(a =>
    a.subject.toLowerCase().includes(q) ||
    a.story.toLowerCase().includes(q) ||
    a.location?.toLowerCase().includes(q) ||
    a.people.some(p => p.toLowerCase().includes(q)) ||
    a.tags.some(t => t.toLowerCase().includes(q))
  );
}

export function exportAnecdotes(): string {
  return JSON.stringify(getAnecdotes(), null, 2);
}

export function importAnecdotes(json: string): number {
  const data = JSON.parse(json) as Anecdote[];
  if (!Array.isArray(data)) throw new Error('Ongeldig formaat');
  const existing = getAnecdotes();
  const existingIds = new Set(existing.map(a => a.id));
  const newOnes = data.filter(a => !existingIds.has(a.id));
  saveAll([...newOnes, ...existing]);
  return newOnes.length;
}
