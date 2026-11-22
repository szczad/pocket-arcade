import polish from '../localization/pl.po';

export type Language = 'en' | 'pl';
const key = 'pocket-arcade.language';
let language: Language = 'en';
try { if (localStorage.getItem(key) === 'pl') language = 'pl'; } catch { /* Language remains available for this session. */ }
document.documentElement.lang = language;
const listeners = new Set<() => void>();
export function getLanguage(): Language { return language; }
export function t(msgid: string, values?: Record<string, string | number>): string {
  const separator = msgid.indexOf('\u0004');
  const english = separator < 0 ? msgid : msgid.slice(separator + 1);
  const translated = (language === 'pl' ? polish[msgid] : undefined) || english;
  if (!values) return translated;
  return translated.replace(/\{([a-zA-Z_][\w]*)\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? String(values[key]) : match);
}
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
