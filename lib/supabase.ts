import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL_KEY = "anecdotes_supabase_url";
const SUPABASE_KEY_KEY = "anecdotes_supabase_key";

export function getSupabaseConfig(): { url: string; key: string } | null {
  if (typeof window === "undefined") return null;
  const url = localStorage.getItem(SUPABASE_URL_KEY);
  const key = localStorage.getItem(SUPABASE_KEY_KEY);
  if (!url || !key) return null;
  return { url, key };
}

export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem(SUPABASE_URL_KEY, url.trim());
  localStorage.setItem(SUPABASE_KEY_KEY, key.trim());
}

export function clearSupabaseConfig() {
  localStorage.removeItem(SUPABASE_URL_KEY);
  localStorage.removeItem(SUPABASE_KEY_KEY);
}

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) return null;
  try {
    return createClient(config.url, config.key);
  } catch {
    return null;
  }
}
