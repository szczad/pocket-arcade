import { createAccount, type AccountSnapshot, type Theme } from './account';
import { createPicker } from './arcade-picker';
import { arcadeShell } from './arcade-shell';
import { ArcadeAudio } from './audio';
import { createGameOptions } from './game-options';
import { createGameView, type GameScreen } from './game-view';
import { gameNumber, games } from './games';
import { getLanguage, onLanguageChange, setLanguage, t } from './i18n';
import { setupLegal } from './legal';

type Screen = { kind: 'picker' } | { kind: 'account' } | GameScreen;
const audioKey = 'pocket-arcade:audio';

export function mountArcade(app: HTMLElement): void {
  app.innerHTML = arcadeShell;
  const $ = <T extends HTMLElement>(selector: string) => app.querySelector<T>(selector)!;
  const pickerRoot = $('#picker'), gameRoot = $('#game-view'), accountRoot = $('.account-section');
  const picker = createPicker(pickerRoot);
  const settings = $<HTMLDialogElement>('#settings');
  const music = $<HTMLInputElement>('#music'), effects = $<HTMLInputElement>('#effects');
  const theme = $<HTMLSelectElement>('#theme'), language = $<HTMLSelectElement>('#language');
  const login = $<HTMLButtonElement>('#login');
  const settingsButtons = app.querySelectorAll<HTMLButtonElement>('.settings-open');
  const audio = new ArcadeAudio();
  const screens: Screen[] = [{ kind: 'picker' }];
  const currentGame = () => {
    const top = screens[screens.length - 1];
    return top.kind === 'game' ? top : undefined;
  };
  let snapshot: AccountSnapshot | undefined;
  let storageAvailable = true;
  let returnFocus: HTMLElement | undefined;

  const options = createGameOptions($('#game-options'), () => gameView.refreshOptions());
  const gameView = createGameView(gameRoot, {
    current: currentGame, settingsOpen: () => settings.open, options, audio,
    onRecord: (id, score) => account.record(id, score), best: id => snapshot?.bests[id],
  });
  const account = createAccount($('#account'), state => {
    snapshot = state;
    document.documentElement.dataset.theme = state.theme;
    theme.value = state.theme;
    renderAccountText();
    gameView.renderAchievements();
  });

  function renderAccountText(): void {
    picker.updateBests(snapshot?.bests ?? {});
    $('#storage-note').textContent = snapshot?.sessionOnly || !storageAvailable
      ? t('Device storage unavailable; guest data and preferences last for this session only.') : '';
    login.textContent = t(snapshot?.signedIn ? 'Account ↗' : 'Account / Log in ↗');
  }

  try {
    const saved = localStorage.getItem(audioKey);
    if (saved) {
      const preferences = JSON.parse(saved);
      music.checked = preferences.music !== false;
      effects.checked = preferences.effects !== false;
    }
  } catch { storageAvailable = false; }
  audio.music = music.checked;
  audio.effects = effects.checked;

  function saveAudio(): void {
    try { localStorage.setItem(audioKey, JSON.stringify({ music: music.checked, effects: effects.checked })); }
    catch { storageAvailable = false; renderAccountText(); }
  }

  music.onchange = () => {
    audio.music = music.checked;
    if (!music.checked) audio.stopMusic();
    else if (gameView.playing) void audio.start();
    saveAudio();
  };
  effects.onchange = () => {
    audio.effects = effects.checked;
    if (!effects.checked) audio.stopEffects();
    saveAudio();
  };
  theme.onchange = () => account.setTheme(theme.value as Theme);
  language.onchange = () => setLanguage(language.value === 'pl' ? 'pl' : 'en');
  login.onclick = () => { location.hash = '#account'; };
  for (const button of settingsButtons) button.onclick = () => {
    returnFocus = button;
    gameView.pause();
    options.render(currentGame()?.definition);
    settings.showModal();
  };
  settings.addEventListener('close', () => returnFocus?.focus());

  function localize(): void {
    $('.brand').setAttribute('aria-label', t('Pocket Arcade home'));
    accountRoot.setAttribute('aria-label', t('Player account'));
    for (const button of settingsButtons) {
      button.setAttribute('aria-label', t('Open settings'));
      button.title = t('Settings');
    }
    $('footer > span:nth-child(2)').textContent = t('SMALL GAMES. BIG JOY.');
    $('.dialog-head .eyebrow').textContent = t('MAKE IT YOURS');
    $('.dialog-head h2').textContent = t('Settings');
    $('.dialog-head button').setAttribute('aria-label', t('Close settings'));
    $('.dialog-close').firstChild!.textContent = t('DONE ');
    for (const [control, title, detail] of [
      [music, 'Music', 'A little soundtrack for your game'],
      [effects, 'Sound effects', 'Sounds for points and game over'],
      [theme, 'Theme', 'Pick your cabinet colors'],
      [language, 'Language', 'Choose your language'],
    ] as const) {
      const label = control.closest('label')!;
      label.querySelector('strong')!.textContent = t(title);
      label.querySelector('small')!.textContent = t(detail);
    }
    for (const [index, name] of ['Midnight', 'Amber', 'Mint'].entries()) theme.options[index].textContent = t(name);
    language.value = getLanguage();
    language.setAttribute('aria-label', t('Language'));
    picker.localize();
    gameView.localize();
    options.render(currentGame()?.definition);
    renderAccountText();
  }

  function navigate(): void {
    // Browser history owns the route. Replace anything above the picker, discarding abandoned runs.
    gameView.stop();
    screens.length = 1;
    const hash = location.hash;
    if (hash === '#account') {
      screens.push({ kind: 'account' });
    } else if (hash.startsWith('#game/')) {
      const index = games.findIndex(game => game.id === hash.slice(6));
      if (index !== -1) screens.push(gameView.newScreen(games[index], gameNumber(index)));
    }
    const screen = screens[screens.length - 1];
    pickerRoot.hidden = screen.kind !== 'picker';
    gameRoot.hidden = screen.kind !== 'game';
    accountRoot.hidden = screen.kind !== 'account';
    if (screen.kind === 'game') gameView.enter(screen);
    if (settings.open) options.render(currentGame()?.definition);
    window.scrollTo(0, 0);
  }

  onLanguageChange(localize);
  setupLegal(gameView.pause);
  window.addEventListener('hashchange', navigate);
  localize();
  navigate();
}
