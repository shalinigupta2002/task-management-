import { STORAGE_KEYS } from "../constants/storageKeys";

const MAX_RECENT = 8;

export function getRecentSearches() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.recentSearches);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addRecentSearch(query) {
  const q = query.trim();
  if (!q) return;
  const recent = getRecentSearches().filter((s) => s.toLowerCase() !== q.toLowerCase());
  recent.unshift(q);
  localStorage.setItem(STORAGE_KEYS.recentSearches, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function clearRecentSearches() {
  localStorage.removeItem(STORAGE_KEYS.recentSearches);
}

/** Highlight matching substring in text (returns JSX-friendly parts). */
export function highlightMatch(text, query) {
  if (!query?.trim() || !text) return [{ text: String(text ?? ""), match: false }];
  const str = String(text);
  const q = query.trim();
  const idx = str.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return [{ text: str, match: false }];
  return [
    { text: str.slice(0, idx), match: false },
    { text: str.slice(idx, idx + q.length), match: true },
    { text: str.slice(idx + q.length), match: false },
  ].filter((p) => p.text);
}
