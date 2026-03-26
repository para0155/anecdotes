import { Anecdote, Filters, SortOption } from './types';
import { deleteFile } from './attachments';

const STORAGE_KEY = 'anecdotes_data';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function getAnecdotes(): Anecdote[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as Anecdote[];
    // Migrate old data without new fields
    return data.map(a => ({
      ...a,
      favorite: a.favorite ?? false,
      attachments: a.attachments ?? [],
    }));
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

export function toggleFavorite(id: string): boolean {
  const all = getAnecdotes();
  const idx = all.findIndex(a => a.id === id);
  if (idx === -1) return false;
  all[idx].favorite = !all[idx].favorite;
  all[idx].updatedAt = new Date().toISOString();
  saveAll(all);
  return all[idx].favorite;
}

export async function deleteAnecdote(id: string): Promise<boolean> {
  const all = getAnecdotes();
  const target = all.find(a => a.id === id);
  if (!target) return false;
  // Delete attachments from IndexedDB
  for (const att of target.attachments) {
    await deleteFile(att.id).catch(() => {});
  }
  const filtered = all.filter(a => a.id !== id);
  saveAll(filtered);
  return true;
}

export function filterAnecdotes(filters: Filters, sort: SortOption): Anecdote[] {
  let results = getAnecdotes();

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(a =>
      a.subject.toLowerCase().includes(q) ||
      a.story.toLowerCase().includes(q) ||
      a.location?.toLowerCase().includes(q) ||
      a.people.some(p => p.toLowerCase().includes(q)) ||
      a.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (filters.person) {
    const p = filters.person.toLowerCase();
    results = results.filter(a => a.people.some(x => x.toLowerCase().includes(p)));
  }

  if (filters.location) {
    const l = filters.location.toLowerCase();
    results = results.filter(a => a.location?.toLowerCase().includes(l));
  }

  if (filters.tag) {
    const t = filters.tag.toLowerCase();
    results = results.filter(a => a.tags.some(x => x.toLowerCase().includes(t)));
  }

  if (filters.dateFrom) {
    results = results.filter(a => a.date >= filters.dateFrom);
  }

  if (filters.dateTo) {
    results = results.filter(a => a.date <= filters.dateTo);
  }

  if (filters.favoritesOnly) {
    results = results.filter(a => a.favorite);
  }

  // Sort
  switch (sort) {
    case 'newest':
      results.sort((a, b) => b.date.localeCompare(a.date));
      break;
    case 'oldest':
      results.sort((a, b) => a.date.localeCompare(b.date));
      break;
    case 'recent-edit':
      results.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      break;
    case 'alpha':
      results.sort((a, b) => a.subject.localeCompare(b.subject));
      break;
  }

  return results;
}

// Get unique values for filter dropdowns
export function getUniquePeople(): string[] {
  const all = getAnecdotes();
  const set = new Set<string>();
  all.forEach(a => a.people.forEach(p => set.add(p)));
  return Array.from(set).sort();
}

export function getUniqueLocations(): string[] {
  const all = getAnecdotes();
  const set = new Set<string>();
  all.forEach(a => { if (a.location) set.add(a.location); });
  return Array.from(set).sort();
}

export function getUniqueTags(): string[] {
  const all = getAnecdotes();
  const set = new Set<string>();
  all.forEach(a => a.tags.forEach(t => set.add(t)));
  return Array.from(set).sort();
}

// Statistics
export interface Stats {
  total: number;
  favorites: number;
  withPhotos: number;
  withAudio: number;
  topPeople: { name: string; count: number }[];
  topLocations: { name: string; count: number }[];
  topTags: { name: string; count: number }[];
  byMonth: { month: string; count: number }[];
  oldestDate: string;
  newestDate: string;
}

export function getStats(): Stats {
  const all = getAnecdotes();
  const peopleCounts: Record<string, number> = {};
  const locationCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  const monthCounts: Record<string, number> = {};

  all.forEach(a => {
    a.people.forEach(p => { peopleCounts[p] = (peopleCounts[p] || 0) + 1; });
    if (a.location) locationCounts[a.location] = (locationCounts[a.location] || 0) + 1;
    a.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; });
    const month = a.date.slice(0, 7); // YYYY-MM
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });

  const toTop = (obj: Record<string, number>) =>
    Object.entries(obj)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

  const dates = all.map(a => a.date).sort();

  return {
    total: all.length,
    favorites: all.filter(a => a.favorite).length,
    withPhotos: all.filter(a => a.attachments.some(att => att.type === 'image')).length,
    withAudio: all.filter(a => a.attachments.some(att => att.type === 'audio')).length,
    topPeople: toTop(peopleCounts),
    topLocations: toTop(locationCounts),
    topTags: toTop(tagCounts),
    byMonth: Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    oldestDate: dates[0] || '',
    newestDate: dates[dates.length - 1] || '',
  };
}

// Export/Import
export function exportAnecdotes(): string {
  return JSON.stringify(getAnecdotes(), null, 2);
}

export function importAnecdotes(json: string): number {
  const data = JSON.parse(json) as Anecdote[];
  if (!Array.isArray(data)) throw new Error('Ongeldig formaat');
  const existing = getAnecdotes();
  const existingIds = new Set(existing.map(a => a.id));
  const newOnes = data.filter(a => !existingIds.has(a.id)).map(a => ({
    ...a,
    favorite: a.favorite ?? false,
    attachments: a.attachments ?? [],
  }));
  saveAll([...newOnes, ...existing]);
  return newOnes.length;
}
