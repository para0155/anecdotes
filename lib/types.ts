export interface Anecdote {
  id: string;
  subject: string;
  story: string;
  date: string; // when it happened (YYYY-MM-DD)
  time?: string; // optional time (HH:mm)
  location?: string;
  people: string[];
  tags: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
