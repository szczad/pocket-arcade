export type Language = 'en' | 'pl';
const key = 'pocket-arcade.language';
let language: Language = 'en';
try { if (localStorage.getItem(key) === 'pl') language = 'pl'; } catch { /* Language remains available for this session. */ }
document.documentElement.lang = language;
const listeners = new Set<() => void>();
export function getLanguage(): Language { return language; }
export function t(en: string, pl: string): string { return language === 'pl' ? pl : en; }
export function setLanguage(value: Language): void {
  if (value === language) return;
  language = value;
  document.documentElement.lang = value;
  try { localStorage.setItem(key, value); } catch { /* Storage is optional. */ }
  for (const listener of listeners) listener();
}
export function onLanguageChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
