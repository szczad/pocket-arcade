import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';

import { achievements } from './achievements';
import { onLanguageChange, t } from './i18n';
import type { GameId } from './games';
export type Theme = 'midnight' | 'amber' | 'mint';
export type Bests = Partial<Record<GameId, number>>;
export interface AccountSnapshot {
  theme: Theme;
  bests: Bests;
  sessionOnly: boolean;
  signedIn: boolean;
}

const games: { id: GameId; name: () => string }[] = [
  { id: 'snake', name: () => t('Snake', 'Wąż') },
  { id: 'breakout', name: () => t('Breakout', 'Breakout') },
  { id: 'lane-dodger', name: () => t('Lane Dodger', 'Unik na drodze') },
  { id: 'labyrinth', name: () => t('Labyrinth', 'Labirynt') },
  { id: 'frog-crossing', name: () => t('Frog Crossing', 'Żabia przeprawa') },
  { id: 'tetris', name: () => t('Tetris', 'Tetris') },
  { id: 'pac-man', name: () => t('Pac-Man', 'Pac-Man') },
  { id: 'asteroids', name: () => t('Asteroids', 'Asteroidy') },
];
const storageKey = 'pocket-arcade.guest.v1';
const isTheme = (value: unknown): value is Theme => value === 'midnight' || value === 'amber' || value === 'mint';
const isScore = (value: unknown): value is number => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

interface GuestData { theme: Theme; bests: Bests }

/** Owns account state and renders its controls into a persistent element. */
export function createAccount(container: HTMLElement, onChange: (snapshot: AccountSnapshot) => void) {
  let storage: Storage | null = null;
  let guest: GuestData = { theme: 'midnight', bests: {} };
  try {
    storage = window.localStorage;
    const probe = `${storageKey}.probe`;
    storage.setItem(probe, '1');
    storage.removeItem(probe);
    const raw: unknown = JSON.parse(storage.getItem(storageKey) || 'null');
    if (raw && typeof raw === 'object') {
      const data = raw as { theme?: unknown; bests?: Record<string, unknown> };
      if (isTheme(data.theme)) guest.theme = data.theme;
      for (const game of games) {
        const score = data.bests?.[game.id];
        if (isScore(score)) guest.bests[game.id] = score;
      }
    }
  } catch { storage = null; }

  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;
  const url = env?.VITE_SUPABASE_URL;
  const key = env?.VITE_SUPABASE_PUBLISHABLE_KEY;
  let client: SupabaseClient | null = null;
  if (url && key) {
    try { client = createClient(url, key); } catch { /* Guest mode remains available. */ }
  }

  let session: Session | null = null;
  let theme: Theme = guest.theme;
  let bests: Bests = { ...guest.bests };
  let pendingTheme: Theme | null = null;
  let themeRevision = 0;
  let pendingBests: Bests = {};
  let themeSaving = false;
  const scoreSaving = new Set<GameId>();
  let epoch = 0;
  let disposed = false;
  let loginOpen = false;
  let email = '';
  let token = '';
  let codeSent = false;
  let busy = false;
  let error: string | (() => string) = '';
  let notice: string | (() => string) = '';
  let loading = false;
  let importOpen = false;
  let importBusy = false;
  let importOffer: Bests = {};

  function persistGuest() {
    if (!storage) return;
    try { storage.setItem(storageKey, JSON.stringify(guest)); }
    catch { storage = null; }
  }
  function snapshot(): AccountSnapshot {
    return { theme, bests: { ...bests }, sessionOnly: !storage, signedIn: !!session };
  }
  function update() {
    if (disposed) return;
    render();
    onChange(snapshot());
  }
  function current(version: number, userId: string) {
    return !disposed && epoch === version && session?.user.id === userId;
  }
  function element<K extends keyof HTMLElementTagNameMap>(tag: K, text?: string): HTMLElementTagNameMap[K] {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function button(text: string, action: () => void, disabled = false) {
    const node = element('button', text);
    node.type = 'button';
    node.disabled = disabled;
    node.addEventListener('click', action);
    return node;
  }
  function offerImport() {
    importOffer = { ...guest.bests };
    importOpen = games.some(({ id }) => importOffer[id] !== undefined);
  }
  function render() {
    container.replaceChildren();
    const heading = element('h2', t('Player', 'Gracz'));
    container.append(heading);
    if (!client) {
      container.append(element('p', t('Accounts are unavailable. You can still play as a guest.', 'Konta są niedostępne. Nadal możesz grać jako gość.')));
    } else if (!session) {
      container.append(element('p', t('Play as a guest or log in to keep your records across devices.', 'Graj jako gość lub zaloguj się, aby zachować rekordy na różnych urządzeniach.')));
      if (!loginOpen) container.append(button(t('Log in', 'Zaloguj się'), () => { loginOpen = true; error = ''; notice = ''; update(); }));
      else {
        const form = element('form');
        const label = element('label', t('Email address', 'Adres e-mail'));
        const input = element('input');
        input.type = 'email'; input.name = 'email'; input.autocomplete = 'email'; input.required = true;
        input.value = email; input.disabled = codeSent || busy;
        input.addEventListener('input', () => { email = input.value; });
        label.append(input); form.append(label);
        if (codeSent) {
          const codeLabel = element('label', t('Six-digit code', 'Sześciocyfrowy kod'));
          const code = element('input');
          code.type = 'text'; code.name = 'token'; code.inputMode = 'numeric'; code.autocomplete = 'one-time-code';
          code.required = true; code.pattern = '[0-9]{6}'; code.maxLength = 6; code.value = token; code.disabled = busy;
          code.addEventListener('input', () => { token = code.value; });
          codeLabel.append(code); form.append(codeLabel);
        }
        const submit = element('button', busy ? t('Please wait…', 'Proszę czekać…') : codeSent ? t('Verify code', 'Sprawdź kod') : t('Send code', 'Wyślij kod'));
        submit.type = 'submit'; submit.disabled = busy; form.append(submit);
        form.addEventListener('submit', (event) => { event.preventDefault(); void (codeSent ? verifyCode() : sendCode()); });
        if (codeSent) {
          form.append(button(t('Resend code', 'Wyślij kod ponownie'), () => { void sendCode(); }, busy));
          form.append(button(t('Change email', 'Zmień adres e-mail'), () => { codeSent = false; token = ''; error = ''; notice = ''; update(); }, busy));
        }
        form.append(button(t('Cancel', 'Anuluj'), () => { loginOpen = false; error = ''; notice = ''; update(); }, busy));
        container.append(form);
      }
    } else {
      container.append(element('p', t(`Signed in as ${session.user.email || 'player'}`, `Zalogowano jako ${session.user.email || 'gracz'}`)));
      if (loading) container.append(element('p', t('Loading account records…', 'Wczytywanie rekordów konta…')));
      if (loadFailed && !loading) container.append(button(t('Retry loading records', 'Ponów wczytywanie rekordów'), () => { error = ''; void retrySaves(); }));
      const list = element('ul');
      for (const game of games) {
        const score = bests[game.id];
        const pending = pendingBests[game.id] !== undefined ? t(' (not saved)', ' (nie zapisano)') : '';
        const result = score === undefined ? t('Not played', 'Jeszcze nie grano') : score;
        const item = element('li', `${game.name()}: ${result}${pending}`);
        const badges = element('ul');
        for (const achievement of achievements[game.id] ?? []) {
          const state = score !== undefined && score >= achievement.goal
            ? t('Earned', 'Zdobyto')
            : t(`Locked (${score ?? 0}/${achievement.goal})`, `Zablokowano (${score ?? 0}/${achievement.goal})`);
          badges.append(element('li', `${achievement.icon} ${achievement.name()}: ${achievement.description()} — ${state}`));
        }
        item.append(badges);
        list.append(item);
      }
      container.append(list);
      if (pendingTheme !== null) container.append(element('p', t('Theme change not saved.', 'Zmiana motywu nie została zapisana.')));
      if (pendingTheme !== null || games.some(({ id }) => pendingBests[id] !== undefined)) {
        container.append(button(t('Retry saving', 'Ponów zapisywanie'), () => { error = ''; void retrySaves(); }));
      }
      if (!importOpen && games.some(({ id }) => guest.bests[id] !== undefined)) {
        container.append(button(t('Import device records', 'Importuj rekordy z urządzenia'), () => { offerImport(); update(); }));
      }
      if (importOpen) {
        const section = element('section');
        section.append(element('h3', t('Import device records?', 'Importować rekordy z urządzenia?')));
        section.append(element('p', t('Only higher scores count. Successfully imported device records will be removed from this device. Your theme will not be imported.', 'Liczą się tylko wyższe wyniki. Pomyślnie zaimportowane rekordy zostaną usunięte z tego urządzenia. Motyw nie zostanie zaimportowany.')));
        const choices = element('ul');
        for (const game of games) {
          const score = importOffer[game.id];
          if (score !== undefined) {
            const accountScore = loading || loadFailed ? t('Unavailable', 'Niedostępny') : bests[game.id] ?? t('Not played', 'Jeszcze nie grano');
            choices.append(element('li', t(`${game.name()}: device ${score}, account ${accountScore}`, `${game.name()}: urządzenie ${score}, konto ${accountScore}`)));
          }
        }
        section.append(choices, button(importBusy ? t('Merging…', 'Łączenie…') : t('Merge records', 'Połącz rekordy'), () => { void mergeRecords(); }, importBusy || loading || loadFailed),
          button(t('Not now', 'Nie teraz'), () => { importOpen = false; update(); }, importBusy));
        container.append(section);
      }
      container.append(button(t('Log out', 'Wyloguj się'), () => { void logout(); }, busy));
    }
    if (!storage) container.append(element('p', t('Device storage is unavailable; guest records and preferences are session-only.', 'Pamięć urządzenia jest niedostępna; rekordy i ustawienia gościa zostaną zachowane tylko do końca sesji.')));
    if (notice) { const message = element('p', typeof notice === 'function' ? notice() : notice); message.setAttribute('role', 'status'); container.append(message); }
    if (error) { const message = element('p', typeof error === 'function' ? error() : error); message.setAttribute('role', 'alert'); container.append(message); }
  }

  async function sendCode() {
    if (!client || busy) return;
    busy = true; error = ''; notice = ''; update();
    const { error: failure } = await client.auth.signInWithOtp({ email: email.trim() });
    if (disposed) return;
    busy = false;
    if (failure) error = () => t('Could not send code. Please wait before retrying if rate limited.', 'Nie udało się wysłać kodu. Jeśli przekroczono limit prób, odczekaj przed ponowieniem.');
    else { codeSent = true; notice = () => t('Check your email for the six-digit code.', 'Sprawdź pocztę e-mail i znajdź sześciocyfrowy kod.'); }
    update();
  }
  async function verifyCode() {
    if (!client || busy) return;
    busy = true; error = ''; notice = ''; update();
    const { data, error: failure } = await client.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: 'email' });
    if (disposed) return;
    busy = false;
    if (failure || !data.session) error = () => t('Could not verify code. The code may be invalid or expired.', 'Nie udało się sprawdzić kodu. Kod może być nieprawidłowy lub wygasł.');
    else { loginOpen = false; token = ''; notice = ''; }
    update();
  }
  async function logout() {
    if (!client || busy) return;
    busy = true; error = ''; update();
    const version = epoch;
    const { error: failure } = await client.auth.signOut({ scope: 'local' });
    if (disposed) return;
    busy = false;
    if (failure && version === epoch) error = () => t('Could not log out.', 'Nie udało się wylogować.');
    update();
  }
  async function loadAccount(version: number, userId: string) {
    if (!client) return;
    const revision = themeRevision;
    const [preferences, records] = await Promise.all([
      client.from('player_preferences').select('theme').eq('user_id', userId).maybeSingle(),
      client.from('personal_bests').select('game_id, score').eq('user_id', userId),
    ]);
    if (!current(version, userId)) return;
    loading = false;
    if (preferences.error || records.error) {
      error = () => t('Could not load account records. Retry loading when you are online.', 'Nie udało się wczytać rekordów konta. Spróbuj ponownie po połączeniu z internetem.');
      loadFailed = true;
    } else {
      loadFailed = false;
      if (pendingTheme === null && revision === themeRevision) theme = isTheme(preferences.data?.theme) ? preferences.data.theme : 'midnight';
      const loaded: Bests = {};
      for (const row of records.data || []) {
        const game = games.find(({ id }) => id === row.game_id);
        if (game && isScore(row.score)) loaded[game.id] = row.score;
      }
      for (const game of games) {
        const visible = bests[game.id];
        if (visible !== undefined) loaded[game.id] = Math.max(loaded[game.id] ?? 0, visible);
      }
      bests = loaded;
    }
    update();
  }
  let loadFailed = false;
  async function saveTheme() {
    if (!client || !session || pendingTheme === null || themeSaving) return;
    const version = epoch, userId = session.user.id;
    themeSaving = true;
    while (current(version, userId) && pendingTheme !== null) {
      const value: Theme = pendingTheme;
      const { error: failure } = await client.from('player_preferences').upsert({ user_id: userId, theme: value });
      if (!current(version, userId)) return;
      if (failure) { error = () => t('Theme not saved.', 'Motyw nie został zapisany.'); break; }
      if (pendingTheme === value) pendingTheme = null;
    }
    if (current(version, userId)) { themeSaving = false; update(); }
  }
  async function saveBest(id: GameId) {
    if (!client || !session || pendingBests[id] === undefined || scoreSaving.has(id)) return;
    const version = epoch, userId = session.user.id;
    scoreSaving.add(id);
    while (current(version, userId) && pendingBests[id] !== undefined) {
      const value: number = pendingBests[id]!;
      const { data, error: failure } = await client.rpc('save_personal_best', { p_game_id: id, p_score: value });
      if (!current(version, userId)) return;
      if (failure || !isScore(data)) { error = () => t('Score not saved.', 'Wynik nie został zapisany.'); break; }
      bests[id] = Math.max(bests[id] ?? 0, data);
      if (pendingBests[id] === value) delete pendingBests[id];
    }
    if (current(version, userId)) { scoreSaving.delete(id); update(); }
  }
  async function retrySaves() {
    if (!session) return;
    if (loadFailed) { loading = true; update(); void loadAccount(epoch, session.user.id); }
    await Promise.all([saveTheme(), ...games.map(({ id }) => saveBest(id))]);
  }
  async function mergeRecords() {
    if (!client || !session || importBusy || loading || loadFailed) return;
    const version = epoch, userId = session.user.id;
    importBusy = true; error = ''; update();
    let failed = false;
    for (const game of games) {
      const score = importOffer[game.id];
      if (score === undefined) continue;
      const { data, error: failure } = await client.rpc('save_personal_best', { p_game_id: game.id, p_score: score });
      if (!current(version, userId)) return;
      if (failure || !isScore(data)) { failed = true; continue; }
      bests[game.id] = Math.max(bests[game.id] ?? 0, data);
      if (guest.bests[game.id] === score) { delete guest.bests[game.id]; persistGuest(); }
      delete importOffer[game.id];
    }
    importBusy = false;
    importOpen = games.some(({ id }) => importOffer[id] !== undefined);
    if (failed) error = () => t('Some records could not be imported. Please retry merging.', 'Nie udało się zaimportować niektórych rekordów. Ponów łączenie.');
    else notice = () => t('Device records merged.', 'Rekordy z urządzenia zostały połączone.');
    update();
  }
  function applySession(next: Session | null) {
    const oldId = session?.user.id;
    const newId = next?.user.id;
    session = next;
    if (oldId === newId) { update(); return; }
    epoch++;
    pendingTheme = null; pendingBests = {}; themeSaving = false; scoreSaving.clear();
    loading = false; loadFailed = false; importOpen = false; importBusy = false; importOffer = {};
    error = ''; notice = ''; busy = false;
    if (newId) {
      theme = 'midnight'; bests = {}; loading = true; loginOpen = false;
      offerImport();
      void loadAccount(epoch, newId);
    } else { theme = guest.theme; bests = { ...guest.bests }; }
    update();
  }
  const subscription = client?.auth.onAuthStateChange((_event, next) => {
    // Do not call Supabase APIs synchronously inside its auth callback.
    queueMicrotask(() => { if (!disposed) applySession(next); });
  }).data.subscription;
  const unsubscribeLanguage = onLanguageChange(render);
  queueMicrotask(update);

  return {
    record(id: GameId, score: number) {
      if (!isScore(score)) return;
      if (session) {
        bests[id] = Math.max(bests[id] ?? 0, score);
        pendingBests[id] = Math.max(pendingBests[id] ?? 0, score);
        update(); void saveBest(id);
      } else {
        guest.bests[id] = Math.max(guest.bests[id] ?? 0, score);
        bests = { ...guest.bests }; persistGuest(); update();
      }
    },
    setTheme(value: Theme) {
      if (!isTheme(value)) return;
      themeRevision++;
      theme = value;
      if (session) { pendingTheme = value; update(); void saveTheme(); }
      else { guest.theme = value; persistGuest(); update(); }
    },
    openLogin() { loginOpen = true; update(); container.scrollIntoView({ block: 'nearest' }); },
    destroy() { disposed = true; epoch++; subscription?.unsubscribe(); unsubscribeLanguage(); },
  };
}
