import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';

import { achievements, achievementIcons } from './achievements';
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
  { id: 'snake', name: () => t('Snake') },
  { id: 'breakout', name: () => t('Breakout') },
  { id: 'lane-dodger', name: () => t('Lane Dodger') },
  { id: 'labyrinth', name: () => t('Labyrinth') },
  { id: 'frog-crossing', name: () => t('Frog Crossing') },
  { id: 'tetris', name: () => t('Tetris') },
  { id: 'pac-man', name: () => t('Pac-Man') },
  { id: 'asteroids', name: () => t('Asteroids') },
  { id: 'minesweeper', name: () => t('Minesweeper') },
  { id: 'scorched-earth', name: () => t('Scorched Earth') },
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

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
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
    const back = element('a', t('← Back to arcade'));
    back.href = '#';
    back.className = 'account-back';
    container.append(back);
    const heading = element('h1', t('Account'));
    container.append(heading);
    if (!client) {
      container.append(element('p', t('Accounts are unavailable. You can still play as a guest.')));
    } else if (!session) {
      container.append(element('p', t('Play as a guest or log in to keep your records across devices.')));
      if (!loginOpen) container.append(button(t('Log in'), () => { loginOpen = true; error = ''; notice = ''; update(); }));
      else {
        container.append(button(busy ? t('Please wait…') : t('Continue with Google'), () => { void signInWithGoogle(); }, busy));
        container.append(button(t('Cancel'), () => { loginOpen = false; error = ''; notice = ''; update(); }, busy));
      }
    } else {
      container.append(element('p', t('Signed in as {player}', { player: session.user.email || t('player') })));
      if (loading) container.append(element('p', t('Loading account records…')));
      if (loadFailed && !loading) container.append(button(t('Retry loading records'), () => { error = ''; void retrySaves(); }));
    }
    const stats = element('section');
    stats.className = 'account-stats';
    stats.append(element('h2', t('Records & achievements')));
    for (const game of games) {
      const score = bests[game.id];
      const pending = pendingBests[game.id] !== undefined ? t(' (not saved)') : '';
      const result = score === undefined ? t('Not played') : score;
      const row = element('section');
      row.className = 'account-game';
      row.append(element('h3', game.name()), element('p', `${t('Personal best')}: ${result}${pending}`));
      const items = achievements[game.id];
      if (items?.length) row.append(achievementIcons(items, score));
      stats.append(row);
    }
    container.append(stats);
    container.append(button(t('Reset stats'), () => { void resetStats(); }, busy || loading || importBusy || scoreSaving.size > 0));
    if (session) {
      if (pendingTheme !== null) container.append(element('p', t('Theme change not saved.')));
      if (pendingTheme !== null || games.some(({ id }) => pendingBests[id] !== undefined)) {
        container.append(button(t('Retry saving'), () => { error = ''; void retrySaves(); }, busy));
      }
      if (!importOpen && games.some(({ id }) => guest.bests[id] !== undefined)) {
        container.append(button(t('Import device records'), () => { offerImport(); update(); }, busy));
      }
      if (importOpen) {
        const section = element('section');
        section.append(element('h3', t('Import device records?')));
        section.append(element('p', t('Only higher scores count. Successfully imported device records will be removed from this device. Your theme will not be imported.')));
        const choices = element('ul');
        for (const game of games) {
          const score = importOffer[game.id];
          if (score !== undefined) {
            const accountScore = loading || loadFailed ? t('Unavailable') : bests[game.id] ?? t('Not played');
            choices.append(element('li', t('{game}: device {score}, account {accountScore}', { game: game.name(), score, accountScore })));
          }
        }
        section.append(choices, button(importBusy ? t('Merging…') : t('Merge records'), () => { void mergeRecords(); }, busy || importBusy || loading || loadFailed),
          button(t('Not now'), () => { importOpen = false; update(); }, busy || importBusy));
        container.append(section);
      }
      container.append(button(t('Delete account'), () => { void deleteAccount(); }, busy || loading || importBusy || scoreSaving.size > 0));
      container.append(button(t('Log out'), () => { void logout(); }, busy));
    }
    if (!storage) container.append(element('p', t('Device storage is unavailable; guest records and preferences are session-only.')));
    if (notice) { const message = element('p', typeof notice === 'function' ? notice() : notice); message.setAttribute('role', 'status'); container.append(message); }
    if (error) { const message = element('p', typeof error === 'function' ? error() : error); message.setAttribute('role', 'alert'); container.append(message); }
  }

  async function resetStats() {
    if (busy || loading || importBusy || scoreSaving.size) return;
    if (!window.confirm(t('Reset all personal bests and achievements? This cannot be undone.'))) return;
    error = ''; notice = '';
    if (!session) {
      guest.bests = {}; bests = {}; persistGuest();
      notice = () => t('Guest stats reset on this device.');
      update();
      return;
    }
    if (!client) return;
    const version = epoch, userId = session.user.id;
    busy = true; update();
    try {
      const { error: failure } = await client.rpc('reset_player_stats');
      if (!current(version, userId)) return;
      if (failure) throw failure;
      bests = {}; pendingBests = {};
      notice = () => t('Account stats reset.');
    } catch {
      if (current(version, userId)) error = () => t('Could not reset stats. Please try again.');
    } finally {
      if (current(version, userId)) { busy = false; update(); }
    }
  }

  async function deleteAccount() {
    if (!client || !session || busy || loading || importBusy || scoreSaving.size) return;
    if (!window.confirm(t('Delete your account, records, and preferences permanently? This cannot be undone.'))) return;
    const version = epoch, userId = session.user.id;
    busy = true; error = ''; notice = ''; update();
    let failure;
    try { ({ error: failure } = await client.rpc('delete_player_account')); }
    catch { failure = true; }
    if (!current(version, userId)) return;
    if (failure) {
      error = () => t('Could not delete account. Please try again.');
      busy = false; update(); return;
    }
    try { await client.auth.signOut({ scope: 'local' }); } catch { /* The account is already deleted. */ }
    if (current(version, userId)) applySession(null);
    notice = () => t('Account deleted.');
    if (!disposed) { busy = false; update(); }
  }
  async function signInWithGoogle() {
    if (!client || busy) return;
    busy = true; error = ''; notice = ''; update();
    try {
      const { error: failure } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}${window.location.pathname}` },
      });
      if (failure) error = () => t('Could not start Google sign-in. Please try again.');
    } catch {
      error = () => t('Could not start Google sign-in. Please try again.');
    }
    if (!disposed) { busy = false; update(); }
  }
  async function logout() {
    if (!client || busy) return;
    busy = true; error = ''; update();
    const version = epoch;
    const { error: failure } = await client.auth.signOut({ scope: 'local' });
    if (disposed) return;
    busy = false;
    if (failure && version === epoch) error = () => t('Could not log out.');
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
      error = () => t('Could not load account records. Retry loading when you are online.');
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
      if (failure) { error = () => t('Theme not saved.'); break; }
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
      if (failure || !isScore(data)) { error = () => t('Score not saved.'); break; }
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
    if (failed) error = () => t('Some records could not be imported. Please retry merging.');
    else notice = () => t('Device records merged.');
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
