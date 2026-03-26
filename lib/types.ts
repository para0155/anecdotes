export interface Attachment {
  id: string;
  type: 'image' | 'audio';
  name: string;
  mimeType: string;
  size: number; // bytes
  createdAt: string;
}

export interface Anecdote {
  id: string;
  subject: string;
  story: string;
  date: string; // when it happened (YYYY-MM-DD)
  time?: string; // optional time (HH:mm)
  location?: string;
  people: string[];
  tags: string[];
  mood?: string; // emoji or label
  favorite: boolean;
  attachments: Attachment[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type SortOption = 'newest' | 'oldest' | 'recent-edit' | 'alpha';

export interface Filters {
  search: string;
  person: string;
  location: string;
  tag: string;
  dateFrom: string;
  dateTo: string;
  favoritesOnly: boolean;
}
