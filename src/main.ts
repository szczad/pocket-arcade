import './styles.css';
import { createGame, type Action, type Game, type GameId, type SnakeSpeed } from './games';
import { createAccount, type Theme } from './account';
import { ArcadeAudio } from './audio';
import { getLanguage, onLanguageChange, setLanguage, t } from './i18n';

const app = document.querySelector<HTMLDivElement>('#app')!;
const games: { id: GameId; number: string; name: string; description: string; color: string; art: string }[] = [
  { id: 'snake', number: '01', name: 'Snake', description: 'Gather fruit. Grow longer. Stay sharp.', color: 'mint', art: `<svg viewBox="0 0 300 180" aria-hidden="true" shape-rendering="crispEdges"><rect width="300" height="180" fill="#243f39"/><path d="M0 30h300M0 90h300M0 150h300M30 0v180M90 0v180M150 0v180M210 0v180M270 0v180" stroke="#315249" stroke-width="2"/><path d="M28 28h75v15H43v39H28zm152 0h92v15h-77v39h-15zM28 113h15v25h65v15H28zm222-22h22v62h-83v-15h61z" fill="#6b966d"/><path d="M83 113h30V83h30V53h30" fill="none" stroke="#a9edb9" stroke-width="22"/><rect x="161" y="43" width="26" height="22" fill="#c5ffce"/><rect x="179" y="47" width="4" height="4" fill="#243f39"/><rect x="217" y="99" width="15" height="15" fill="#ff826f"/><rect x="222" y="94" width="5" height="5" fill="#e5ce78"/></svg>` },
  { id: 'breakout', number: '02', name: 'Breakout', description: 'Clear the wall, one brick at a time.', color: 'coral', art: `<svg viewBox="0 0 300 180" aria-hidden="true" shape-rendering="crispEdges"><rect width="300" height="180" fill="#433347"/><path d="M27 29h36v12H27zm41 0h36v12H68zm41 0h36v12h-36zm41 0h36v12h-36zm41 0h36v12h-36zm41 0h36v12h-36z" fill="#ff857b"/><path d="M27 46h36v12H27zm41 0h36v12H68zm41 0h36v12h-36zm41 0h36v12h-36zm41 0h36v12h-36zm41 0h36v12h-36z" fill="#efb07e"/><path d="M27 63h36v12H27zm41 0h36v12H68zm41 0h36v12h-36zm82 0h36v12h-36zm41 0h36v12h-36z" fill="#e8d07d"/><path d="M27 80h36v12H27zm41 0h36v12H68zm123 0h36v12h-36zm41 0h36v12h-36z" fill="#a6d5ab"/><rect x="145" y="105" width="10" height="10" fill="#fff4cf"/><path d="M137 122h8v8h-8zm-9 10h6v6h-6z" fill="#957786"/><rect x="104" y="148" width="78" height="10" fill="#b9f2c3"/><rect x="114" y="158" width="58" height="4" fill="#699680"/></svg>` },
  { id: 'lane-dodger', number: '03', name: 'Lane Dodger', description: 'Pick a lane and keep the road clear.', color: 'gold', art: `<svg viewBox="0 0 300 180" aria-hidden="true" shape-rendering="crispEdges"><rect width="300" height="180" fill="#354044"/><path d="M48 0h204v180H48z" fill="#272d3c"/><path d="M48 0h7v180h-7zm197 0h7v180h-7z" fill="#e8ca7d"/><path d="M113 0h4v25h-4zm0 42h4v25h-4zm0 42h4v25h-4zm0 42h4v25h-4zm0 42h4v12h-4zm70-168h4v25h-4zm0 42h4v25h-4zm0 42h4v25h-4zm0 42h4v25h-4zm0 42h4v12h-4z" fill="#8b8990"/><path d="M81 28h20v8h6v26h-6v7H81v-7h-6V36h6z" fill="#ff8b78"/><path d="M84 39h14v10H84z" fill="#f9d5a7"/><path d="M199 74h20v8h6v26h-6v7h-20v-7h-6V82h6z" fill="#e9c774"/><path d="M202 85h14v10h-14z" fill="#fff0c1"/><path d="M140 122h20v8h6v26h-6v7h-20v-7h-6v-26h6z" fill="#b8edbd"/><path d="M143 133h14v10h-14z" fill="#e5ffe2"/></svg>` }
];
games.push({ id: 'labyrinth', number: '04', name: 'Labyrinth', description: 'Find your way through the maze.', color: 'mint', art: `<svg viewBox="0 0 300 180" aria-hidden="true" shape-rendering="crispEdges"><rect width="300" height="180" fill="#243f39"/><path d="M25 25h250v130H25z M50 50h175v25H75v55h175v-30H100 M250 50v25 M50 105v25 M150 100v30" fill="none" stroke="#a9edb9" stroke-width="9"/><rect x="37" y="37" width="10" height="10" fill="#ff826f"/><rect x="258" y="138" width="10" height="10" fill="#f2d785"/></svg>` });
games.push({ id: 'frog-crossing', number: '05', name: 'Frog Crossing', description: 'Hop across traffic to the river.', color: 'gold', art: `<svg viewBox="0 0 300 180" aria-hidden="true" shape-rendering="crispEdges"><rect width="300" height="180" fill="#344856"/><path d="M0 0h300v38H0z" fill="#518a9a"/><path d="M0 38h300v20H0zM0 158h300v22H0z" fill="#65966e"/><path d="M0 58h300v100H0z" fill="#303047"/><path d="M0 108h300" stroke="#d4c68a" stroke-width="3" stroke-dasharray="18 15"/><path d="M35 74h56v17H35zm147 51h63v17h-63z" fill="#ff927e"/><path d="M42 70h30v8H42zm147 51h34v8h-34z" fill="#f0c795"/><path d="M136 140h28v18h-28zm-5-5h10v10h-10zm28 0h10v10h-10z" fill="#a9edb9"/><path d="M135 137h4v4h-4zm26 0h4v4h-4z" fill="#243f39"/></svg>` });
games.push({ id: 'tetris', number: '06', name: 'Tetris', description: 'Stack blocks and clear complete lines.', color: 'coral', art: `<svg viewBox="0 0 300 180" aria-hidden="true" shape-rendering="crispEdges"><rect width="300" height="180" fill="#25233b"/><path d="M70 18h160v145H70z" fill="#191a30" stroke="#71657e" stroke-width="4"/><g fill="#a9edb9"><path d="M84 138h22v22H84zm24 0h22v22h-22zm24 0h22v22h-22zm0-24h22v22h-22z"/></g><g fill="#ff9784"><path d="M156 138h22v22h-22zm24 0h22v22h-22zm0-24h22v22h-22zm0-24h22v22h-22z"/></g><g fill="#f2d785"><path d="M120 40h22v22h-22zm24 0h22v22h-22zm24 0h22v22h-22zm-24 24h22v22h-22z"/></g></svg>` });
games.find(game => game.id === 'frog-crossing')!.description = 'Cross the road and ride logs to the far bank.';
games.push({ id: 'pac-man', number: '07', name: 'Pac-Man', description: 'Eat the dots and dodge the ghosts.', color: 'gold', art: `<svg viewBox="0 0 300 180" aria-hidden="true" shape-rendering="crispEdges"><rect width="300" height="180" fill="#15172f"/><path d="M20 20h260v140H20z M45 48h60v24H45z M195 48h60v24h-60z M45 108h65v23H45z M190 108h65v23h-65z M128 32h44v25h-44z M128 123h44v25h-44z" fill="none" stroke="#6e8de5" stroke-width="7"/><path d="M74 89h7m22 0h7m22 0h7m22 0h7m22 0h7m22 0h7" stroke="#f8dca4" stroke-width="6"/><path d="M52 80h20v5h7v6H65l14 9h-7v5H52v-5h-6V85h6z" fill="#f2d785"/><path d="M220 81h21v5h5v20h-7v-5h-6v5h-6v-5h-7v5h-5V86h5z" fill="#ff9784"/><path d="M222 88h5v5h-5zm12 0h5v5h-5z" fill="#fff"/></svg>` });
games.push({ id: 'asteroids', number: '08', name: 'Asteroids', description: 'Pilot your ship through an asteroid field.', color: 'mint', art: `<svg viewBox="0 0 300 180" aria-hidden="true" shape-rendering="crispEdges"><rect width="300" height="180" fill="#17192f"/><path d="M25 30h4v4h-4zm200 10h4v4h-4zM70 140h4v4h-4zm200-30h4v4h-4z" fill="#f6e5bd"/><path d="M64 50h24l12 12v18L87 92H60L49 76V62zM211 100h24l12 12v18l-13 12h-27l-11-16v-14z" fill="#9b8f9a"/><path d="M62 57h14v5H62zm151 52h13v5h-13z" fill="#d6c1b1"/><path d="M151 63l22 54-22-10-22 10z" fill="#b9efc6"/><path d="M147 109h8v16h-8z" fill="#ff9a78"/></svg>` });
app.innerHTML = `<div class="shell"><header class="topbar"><a class="brand" href="#" aria-label="Pocket Arcade home"><span class="brand-mark" aria-hidden="true">✦</span><span>POCKET<span class="brand-small">ARCADE</span></span></a><div class="header-actions"><button class="text-button" id="login">Log in <span aria-hidden="true">↗</span></button><button class="icon-button settings-open" aria-label="Open settings" title="Settings">⚙</button></div></header><main><section id="picker"><div class="hero"><div><p class="eyebrow"><span class="status-dot"></span> YOUR LITTLE CORNER OF PLAY</p><h1>Pocket Arcade<span class="period">.</span></h1><p class="intro">A little play goes a long way.<br>Pick a cartridge and beat your best.</p></div><div class="hero-stamp" aria-hidden="true"><span>INSERT</span><strong>COIN</strong><span>JUST KIDDING ✳</span></div></div><div class="section-heading"><div><p class="eyebrow">THE COLLECTION <span class="subtle">/ 03 GAMES</span></p><h2>Choose your game</h2></div><span class="section-note">GOOD GAMES, NO QUARTERS.</span></div><div class="cards">${games.map(g => `<article class="card ${g.color}"><div class="art">${g.art}<span class="art-index">${g.number} / 03</span></div><div class="card-body"><div class="card-title"><h3>${g.name}</h3><span aria-hidden="true">✳</span></div><p>${g.description}</p><div class="card-bottom"><div><span class="micro">PERSONAL BEST</span><strong class="best" data-best="${g.id}">Not played</strong></div><a class="play" href="#game/${g.id}" aria-label="Play ${g.name}">PLAY <span aria-hidden="true">↗</span></a></div></div></article>`).join('')}</div><div class="bottom-line"><span>MADE FOR A LITTLE BREAK.</span><span>★ &nbsp; PLAY AT YOUR OWN PACE</span></div></section><section id="game-view" hidden><div class="game-heading"><a class="back" href="#">← &nbsp; BACK TO ARCADE</a><button class="icon-button settings-open" aria-label="Open settings" title="Settings">⚙</button></div><div class="game-layout"><div class="game-main"><div class="game-title-row"><div><p class="eyebrow">NOW PLAYING <span class="subtle">/ <span id="game-number"></span></span></p><h2 id="game-title"></h2></div><div class="score-box"><span class="micro">SCORE</span><strong id="score">0</strong></div></div><div class="board-wrap"><canvas width="240" height="240" aria-label="Game board"></canvas><div id="board-message" class="board-message"><span id="message-label">READY, PLAYER?</span><strong id="message-title">Let's play.</strong><button id="start" class="primary">START GAME <span>→</span></button></div></div><div class="game-actions"><button id="pause" class="secondary" disabled>Pause</button><button id="replay" class="secondary">Replay</button></div></div><aside class="game-side"><p class="eyebrow">HOW TO PLAY</p><p id="instructions"></p><p class="hint">Use arrow keys or WASD.<br>On touch, use the buttons below.</p><div class="dpad" aria-label="Directional controls"><button data-action="up" aria-label="Up">▲</button><button data-action="left" aria-label="Left">◀</button><button data-action="down" aria-label="Down">▼</button><button data-action="right" aria-label="Right">▶</button></div><p class="side-foot">TAKE YOUR TIME.<br>THE HIGH SCORE CAN WAIT.</p></aside></div></section><section class="account-section" aria-label="Player account"><div id="account"></div></section></main><footer><span>POCKET ARCADE <span class="period">✳</span></span><span>SMALL GAMES. BIG JOY.</span></footer></div><dialog id="settings"><form method="dialog"><div class="dialog-head"><div><p class="eyebrow">MAKE IT YOURS</p><h2>Settings</h2></div><button class="icon-button" value="close" aria-label="Close settings">×</button></div><label class="setting-row"><span><strong>Music</strong><small>A little soundtrack for your game</small></span><input id="music" type="checkbox" checked></label><label class="setting-row"><span><strong>Sound effects</strong><small>Sounds for points and game over</small></span><input id="effects" type="checkbox" checked></label><label class="setting-row"><span><strong>Theme</strong><small>Pick your cabinet colors</small></span><select id="theme"><option value="midnight">Midnight</option><option value="amber">Amber</option><option value="mint">Mint</option></select></label><p id="storage-note" class="hint"></p><button class="primary dialog-close" value="close">DONE <span>→</span></button></form></dialog>`;
const $ = <T extends Element>(selector: string) => app.querySelector<T>(selector)!;
$<HTMLElement>('.section-heading .subtle').textContent = '/ 08 GAMES';
document.querySelectorAll<HTMLElement>('.art-index').forEach((node, index) => { node.textContent = `${games[index].number} / 08`; });
const picker = $<HTMLElement>('#picker'), gameView = $<HTMLElement>('#game-view');
const canvas = $<HTMLCanvasElement>('canvas'), ctx = canvas.getContext('2d')!;
const settings = $<HTMLDialogElement>('#settings'), audio = new ArcadeAudio();
const music = $<HTMLInputElement>('#music'), effects = $<HTMLInputElement>('#effects'), theme = $<HTMLSelectElement>('#theme');
const start = $<HTMLButtonElement>('#start'), pauseButton = $<HTMLButtonElement>('#pause');
const boardMessage = $<HTMLElement>('#board-message');
const speedLabel = document.createElement('label');
speedLabel.className = 'setting-row';
speedLabel.innerHTML = '<span><strong>Game speed</strong><small>Applies to the next run</small></span><select aria-label="Game speed"><option value="slow">Slow</option><option value="medium" selected>Medium</option><option value="fast">Fast</option></select>';
$<HTMLElement>('#storage-note').before(speedLabel);
const mazeLabel = document.createElement('label');
mazeLabel.className = 'setting-row';
mazeLabel.innerHTML = '<span><strong>Maze size</strong><small>Applies to the next run</small></span><select aria-label="Maze size"><option value="10">10×10</option><option value="20">20×20</option><option value="30">30×30</option><option value="custom">Custom</option></select>';
speedLabel.before(mazeLabel);
const mazeSelect = mazeLabel.querySelector<HTMLSelectElement>('select')!;
const customLabel = document.createElement('label');
customLabel.className = 'setting-row';
customLabel.innerHTML = '<span><strong>Custom size</strong><small>Square maze, 5–50 cells per side</small></span><input aria-label="Custom maze size" type="number" min="5" max="50" value="15">';
mazeLabel.after(customLabel);
const customSize = customLabel.querySelector<HTMLInputElement>('input')!;
const updateMazeOptions = () => { customLabel.hidden = gameId !== 'labyrinth' || mazeSelect.value !== 'custom'; if (gameId === 'labyrinth' && mode === 'ready') resetGame(); };
mazeSelect.addEventListener('change', updateMazeOptions);
customSize.addEventListener('change', () => { customSize.value = String(Math.max(5, Math.min(50, Math.round(Number(customSize.value) || 5)))); updateMazeOptions(); });
const lanesLabel = document.createElement('label');
lanesLabel.className = 'setting-row';
lanesLabel.innerHTML = '<span><strong>Road lanes</strong><small>Applies to the next run</small></span><select aria-label="Road lanes"><option value="3">3 lanes</option><option value="5" selected>5 lanes</option><option value="7">7 lanes</option><option value="10">10 lanes</option><option value="custom">Custom</option></select>';
speedLabel.before(lanesLabel);
const lanesSelect = lanesLabel.querySelector<HTMLSelectElement>('select')!;
const lanesCustomLabel = document.createElement('label');
lanesCustomLabel.className = 'setting-row';
lanesCustomLabel.innerHTML = '<span><strong>Custom lanes</strong><small>1–15 road lanes</small></span><input aria-label="Custom road lanes" type="number" min="1" max="15" value="6">';
lanesLabel.after(lanesCustomLabel);
const lanesCustom = lanesCustomLabel.querySelector<HTMLInputElement>('input')!;
const updateLanes = () => { lanesCustomLabel.hidden = gameId !== 'frog-crossing' || lanesSelect.value !== 'custom'; if (gameId === 'frog-crossing' && mode === 'ready') resetGame(); };
lanesSelect.addEventListener('change', updateLanes);
lanesCustom.addEventListener('change', () => { lanesCustom.value = String(Math.max(1, Math.min(15, Math.round(Number(lanesCustom.value) || 1)))); updateLanes(); });
const speedSelect = speedLabel.querySelector<HTMLSelectElement>('select')!;
const languageLabel = document.createElement('label');
languageLabel.className = 'setting-row';
languageLabel.innerHTML = '<span><strong></strong><small></small></span><select aria-label="Language"><option value="en">English</option><option value="pl">Polski</option></select>';
theme.closest('.setting-row')!.after(languageLabel);
const languageSelect = languageLabel.querySelector<HTMLSelectElement>('select')!;
languageSelect.value = getLanguage();
languageSelect.onchange = () => setLanguage(languageSelect.value as 'en' | 'pl');
speedSelect.addEventListener('change', () => { if (gameId && mode === 'ready') resetGame(); });
let storageAvailable = true;
try { const value = localStorage.getItem('pocket-arcade:audio'); if (value) { const saved = JSON.parse(value); music.checked = saved.music !== false; effects.checked = saved.effects !== false; } } catch { storageAvailable = false; }
audio.music = music.checked; audio.effects = effects.checked;
const saveAudio = () => { try { localStorage.setItem('pocket-arcade:audio', JSON.stringify({music: music.checked, effects: effects.checked})); } catch { storageAvailable = false; refreshAccountText(); } };
let refreshAccountText = () => {};
const account = createAccount($<HTMLElement>('#account'), state => {
  document.documentElement.dataset.theme = state.theme;
  theme.value = state.theme;
  refreshAccountText = () => {
    for (const g of games) $<HTMLElement>(`[data-best="${g.id}"]`).textContent = state.bests[g.id] === undefined ? t('Not played', 'Jeszcze nie grano') : String(state.bests[g.id]);
    $('#storage-note').textContent = state.sessionOnly || !storageAvailable ? t('Device storage unavailable; guest data and preferences last for this session only.', 'Pamięć urządzenia jest niedostępna; dane gościa i ustawienia zostaną zachowane tylko podczas tej sesji.') : '';
    $<HTMLButtonElement>('#login').textContent = state.signedIn ? t('Player ↓', 'Gracz ↓') : t('Log in ↗', 'Zaloguj się ↗');
  };
  refreshAccountText();
});
$<HTMLButtonElement>('#login').onclick = () => { account.openLogin(); $('#account').scrollIntoView({behavior: 'smooth', block: 'start'}); };
music.onchange = () => { audio.music = music.checked; if (!music.checked) audio.stopMusic(); else if (mode === 'playing') void audio.start(); saveAudio(); };
effects.onchange = () => { audio.effects = effects.checked; if (!effects.checked) audio.stopEffects(); saveAudio(); };
theme.onchange = () => account.setTheme(theme.value as Theme);
let returnFocus: HTMLElement | null = null;
document.querySelectorAll<HTMLButtonElement>('.settings-open').forEach(button => button.onclick = () => { returnFocus = button; pauseGame(); speedLabel.hidden = !gameId; mazeLabel.hidden = gameId !== 'labyrinth'; customLabel.hidden = gameId !== 'labyrinth' || mazeSelect.value !== 'custom'; lanesLabel.hidden = gameId !== 'frog-crossing'; lanesCustomLabel.hidden = gameId !== 'frog-crossing' || lanesSelect.value !== 'custom'; settings.showModal(); });
settings.addEventListener('close', () => returnFocus?.focus());
let game: Game | null = null, gameId: GameId | null = null;
let mode: 'ready' | 'playing' | 'paused' | 'ended' = 'ready';
let frame = 0, last = 0, accumulator = 0, previousScore = 0;
let simulationScale = 1;
const held = new Set<Action>();
function release(): void { for (const action of held) game?.input(action, false); held.clear(); document.querySelectorAll('.dpad button').forEach(b => b.classList.remove('pressed')); }
function pauseGame(): void { if (mode !== 'playing') return; mode = 'paused'; cancelAnimationFrame(frame); audio.stop(); release(); boardMessage.hidden = false; renderGameText(); }
function begin(): void { if (!game || mode === 'playing') return; if (mode === 'ended') resetGame(); mode = 'playing'; boardMessage.hidden = true; pauseButton.disabled = false; renderGameText(); last = 0; accumulator = 0; void audio.start(); frame = requestAnimationFrame(tick); }
function resetGame(): void { if (!gameId) return; cancelAnimationFrame(frame); audio.stop(); release(); const speed = speedSelect.value as SnakeSpeed; const mazeSize = mazeSelect.value === 'custom' ? Math.max(5, Math.min(50, Math.round(Number(customSize.value) || 5))) : Number(mazeSelect.value); const lanes = lanesSelect.value === 'custom' ? Math.max(1, Math.min(15, Math.round(Number(lanesCustom.value) || 1))) : Number(lanesSelect.value); game = createGame(gameId, speed, mazeSize, lanes); simulationScale = gameId === 'snake' ? 1 : { slow: 2 / 3, medium: 1, fast: 2 }[speed]; previousScore = 0; mode = 'ready'; $('#score').textContent = '0'; boardMessage.hidden = false; pauseButton.disabled = true; renderGameText(); game.draw(ctx); }
function tick(now: number): void { if (mode !== 'playing' || !game) return; if (!last) last = now; accumulator += Math.min(now - last, 250) * simulationScale; last = now; while (accumulator >= 1000 / 60 && game.status === 'playing') { game.step(); accumulator -= 1000 / 60; } if (game.score !== previousScore) { previousScore = game.score; $('#score').textContent = String(game.score); audio.cue(); } game.draw(ctx); if (game.status !== 'playing') { mode = 'ended'; release(); audio.stop(); audio.cue(true); pauseButton.disabled = true; boardMessage.hidden = false; renderGameText(); if (gameId) account.record(gameId, game.score); return; } frame = requestAnimationFrame(tick); }
start.onclick = begin;
pauseButton.onclick = () => mode === 'playing' ? pauseGame() : begin();
$<HTMLButtonElement>('#replay').onclick = () => { resetGame(); begin(); };
function navigate(): void { cancelAnimationFrame(frame); audio.stop(); release(); const id = location.hash.slice(6) as GameId; const selected = location.hash.startsWith('#game/') ? games.find(g => g.id === id) : undefined; gameId = selected?.id ?? null; picker.hidden = !!selected; gameView.hidden = !selected; if (selected) { $('#game-number').textContent = selected.number; resetGame(); } else { game = null; mode = 'ready'; } renderGameText(); window.scrollTo(0, 0); }
window.addEventListener('hashchange', navigate);
const keyActions: Record<string, Action> = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
function keyAction(event: KeyboardEvent): Action | undefined { return keyActions[event.key] ?? keyActions[event.key.toLowerCase()]; }
window.addEventListener('keydown', event => { const target = event.target as HTMLElement; if (mode !== 'ended' || settings.open || event.repeat || (event.key !== 'Enter' && event.key !== ' ') || (target !== start && target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"])'))) return; event.preventDefault(); begin(); });
window.addEventListener('keydown', event => { const target = event.target as HTMLElement; if (mode !== 'playing' || settings.open || /INPUT|TEXTAREA|SELECT/.test(target.tagName) || target.isContentEditable) return; const action = keyAction(event); if (!action) return; event.preventDefault(); if (!held.has(action)) { held.add(action); game?.input(action, true); } });
window.addEventListener('keyup', event => { const action = keyAction(event); if (action && held.has(action)) { held.delete(action); game?.input(action, false); } });
document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => { const action = button.dataset.action as Action; const end = () => { if (held.delete(action)) game?.input(action, false); button.classList.remove('pressed'); }; button.addEventListener('pointerdown', event => { if (mode !== 'playing') return; event.preventDefault(); button.setPointerCapture(event.pointerId); if (!held.has(action)) { held.add(action); game?.input(action, true); } button.classList.add('pressed'); }); button.addEventListener('pointerup', end); button.addEventListener('pointercancel', end); button.addEventListener('lostpointercapture', end); });
window.addEventListener('blur', () => { pauseGame(); release(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { pauseGame(); release(); } });
const gameCopy: Record<GameId, { name: string; description: string; instructions: string }> = {
  snake: { name: 'Wąż', description: 'Zbieraj owoce. Rośnij. Zachowaj czujność.', instructions: 'Zbieraj owoce, aby rosnąć. Unikaj ścian i własnego ogona.' },
  breakout: { name: 'Breakout', description: 'Rozbij mur, cegła po cegle.', instructions: 'Poruszaj paletką, aby odbijać piłkę i rozbić wszystkie cegły.' },
  'lane-dodger': { name: 'Unikaj pojazdów', description: 'Wybierz pas i omijaj pojazdy.', instructions: 'Zmieniaj pasy, aby unikać pojazdów. Za każdy ominięty samochód zdobywasz punkt.' },
  labyrinth: { name: 'Labirynt', description: 'Znajdź drogę przez labirynt.', instructions: 'Znajdź złote wyjście. Mniej ruchów oznacza więcej punktów.' },
  'frog-crossing': { name: 'Przeprawa żaby', description: 'Przejdź przez drogę i przepłyń rzekę na kłodach.', instructions: 'Unikaj pojazdów, wskakuj na kłody i dotrzyj na drugi brzeg.' },
  tetris: { name: 'Tetris', description: 'Układaj klocki i usuwaj pełne linie.', instructions: 'Przesuwaj klocki w lewo i prawo, obracaj w górę i przyspieszaj w dół. Wypełniaj linie.' },
  'pac-man': { name: 'Pac-Man', description: 'Zbieraj kropki i unikaj duchów.', instructions: 'Zbierz wszystkie kropki i unikaj duchów. Duże kropki pozwalają je zjadać przez chwilę.' },
  asteroids: { name: 'Asteroidy', description: 'Pilotuj statek przez pole asteroid.', instructions: 'Skręcaj w lewo i w prawo, przyspieszaj w górę i strzelaj w dół. Niszczenie asteroid daje punkty.' },
};
function gameName(id: GameId): string {
  return t(games.find(g => g.id === id)!.name, gameCopy[id].name);
}
function renderGameText(): void {
  if (gameId) {
    $('#game-title').textContent = gameName(gameId);
    const instructions: Record<GameId, string> = {
      snake: 'Collect fruit to grow. Avoid the walls and your own tail.',
      breakout: 'Move the paddle to keep the ball in play and clear every brick.',
      'lane-dodger': 'Change lanes to avoid traffic. Every car you pass earns a point.',
      labyrinth: 'Find the gold exit. Fewer moves earn a higher score.',
      'frog-crossing': 'Avoid traffic, hop onto logs, and reach the far bank.',
      tetris: 'Move blocks left and right, rotate with up, and soft drop with down. Fill lines to clear them.',
      'pac-man': 'Collect every dot and avoid ghosts. Power pellets let you eat ghosts briefly.',
      asteroids: 'Turn left or right, thrust with up, and fire with down. Destroy asteroids to score.',
    };
    $('#instructions').textContent = t(instructions[gameId], gameCopy[gameId].instructions);
  }
  const won = game?.status === 'won';
  $('#message-label').textContent = mode === 'paused' ? t('TAKE A BREATHER', 'CHWILA PRZERWY') : mode === 'ended' ? (won ? t('WELL PLAYED', 'DOBRA GRA') : t('GAME OVER', 'KONIEC GRY')) : t('READY, PLAYER?', 'GOTOWY DO GRY?');
  $('#message-title').textContent = mode === 'paused' ? t('Paused.', 'Pauza.') : mode === 'ended' ? (won ? t('You won!', 'Wygrana!') : t('Nice run.', 'Dobra gra.')) : t("Let's play.", 'Zagrajmy.');
  start.firstChild!.textContent = mode === 'paused' ? t('RESUME ', 'WZNÓW ') : mode === 'ended' ? t('PLAY AGAIN ', 'ZAGRAJ PONOWNIE ') : t('START GAME ', 'ROZPOCZNIJ GRĘ ');
  pauseButton.textContent = mode === 'paused' ? t('Resume', 'Wznów') : t('Pause', 'Pauza');
}
function renderLanguage(): void {
  languageSelect.value = getLanguage();
  const text = (selector: string, en: string, pl: string) => { $(selector).textContent = t(en, pl); };
  const attr = (selector: string, attribute: string, en: string, pl: string) => { $(selector).setAttribute(attribute, t(en, pl)); };
  attr('.brand', 'aria-label', 'Pocket Arcade home', 'Pocket Arcade — strona główna');
  document.querySelectorAll('.settings-open').forEach(button => { button.setAttribute('aria-label', t('Open settings', 'Otwórz ustawienia')); button.setAttribute('title', t('Settings', 'Ustawienia')); });
  $<HTMLElement>('.hero .eyebrow').lastChild!.textContent = t(' YOUR LITTLE CORNER OF PLAY', ' TWÓJ MAŁY ZAKĄTEK GRY');
  $('.intro').innerHTML = t('A little play goes a long way.<br>Pick a cartridge and beat your best.', 'Odrobina zabawy wiele zmienia.<br>Wybierz grę i pobij swój rekord.');
  const stamp = document.querySelectorAll('.hero-stamp span');
  stamp[0].textContent = t('INSERT', 'WRZUĆ'); stamp[1].textContent = t('JUST KIDDING ✳', 'ŻARTUJEMY ✳');
  text('.hero-stamp strong', 'COIN', 'MONETĘ');
  $<HTMLElement>('.section-heading .eyebrow').firstChild!.textContent = t('THE COLLECTION ', 'KOLEKCJA ');
  text('.section-heading .subtle', '/ 08 GAMES', '/ 08 GIER');
  text('.section-heading h2', 'Choose your game', 'Wybierz grę');
  text('.section-note', 'GOOD GAMES, NO QUARTERS.', 'DOBRE GRY, BEZ MONET.');
  document.querySelectorAll<HTMLElement>('.card').forEach((card, index) => {
    const g = games[index], name = gameName(g.id);
    card.querySelector('h3')!.textContent = name;
    card.querySelector('.card-body > p')!.textContent = t(g.description, gameCopy[g.id].description);
    card.querySelector('.micro')!.textContent = t('PERSONAL BEST', 'REKORD OSOBISTY');
    const play = card.querySelector('.play')!;
    play.setAttribute('aria-label', t(`Play ${name}`, `Zagraj: ${name}`));
    play.firstChild!.textContent = t('PLAY ', 'GRAJ ');
  });
  const bottom = document.querySelectorAll('.bottom-line span');
  bottom[0].textContent = t('MADE FOR A LITTLE BREAK.', 'STWORZONE NA MAŁĄ PRZERWĘ.');
  bottom[1].textContent = t('★  PLAY AT YOUR OWN PACE', '★  GRAJ WE WŁASNYM TEMPIE');
  text('.back', '←   BACK TO ARCADE', '←   WRÓĆ DO ARCADE');
  $<HTMLElement>('.game-title-row .eyebrow').firstChild!.textContent = t('NOW PLAYING ', 'TERAZ GRASZ ');
  text('.score-box .micro', 'SCORE', 'WYNIK');
  attr('canvas', 'aria-label', 'Game board', 'Plansza gry');
  text('#replay', 'Replay', 'Zagraj ponownie');
  text('.game-side > .eyebrow', 'HOW TO PLAY', 'JAK GRAĆ');
  $('.game-side .hint').innerHTML = t('Use arrow keys or WASD.<br>On touch, use the buttons below.', 'Użyj strzałek lub klawiszy WASD.<br>Na ekranie dotykowym użyj przycisków poniżej.');
  attr('.dpad', 'aria-label', 'Directional controls', 'Sterowanie kierunkowe');
  for (const [action, en, pl] of [['up', 'Up', 'Góra'], ['down', 'Down', 'Dół'], ['left', 'Left', 'Lewo'], ['right', 'Right', 'Prawo']]) attr(`[data-action="${action}"]`, 'aria-label', en, pl);
  $('.side-foot').innerHTML = t('TAKE YOUR TIME.<br>THE HIGH SCORE CAN WAIT.', 'GRAJ BEZ POŚPIECHU.<br>REKORD MOŻE POCZEKAĆ.');
  attr('.account-section', 'aria-label', 'Player account', 'Konto gracza');
  text('footer > span:last-child', 'SMALL GAMES. BIG JOY.', 'MAŁE GRY. WIELKA RADOŚĆ.');
  text('.dialog-head .eyebrow', 'MAKE IT YOURS', 'DOPASUJ DO SIEBIE');
  text('.dialog-head h2', 'Settings', 'Ustawienia');
  attr('.dialog-head button', 'aria-label', 'Close settings', 'Zamknij ustawienia');
  const setting = (label: Element, title: [string, string], detail: [string, string]) => {
    label.querySelector('strong')!.textContent = t(...title);
    label.querySelector('small')!.textContent = t(...detail);
  };
  setting(music.closest('label')!, ['Music', 'Muzyka'], ['A little soundtrack for your game', 'Muzyka towarzysząca grze']);
  setting(effects.closest('label')!, ['Sound effects', 'Efekty dźwiękowe'], ['Sounds for points and game over', 'Dźwięki punktów i końca gry']);
  setting(theme.closest('label')!, ['Theme', 'Motyw'], ['Pick your cabinet colors', 'Wybierz kolory automatu']);
  for (const [value, en, pl] of [['midnight', 'Midnight', 'Północ'], ['amber', 'Amber', 'Bursztyn'], ['mint', 'Mint', 'Mięta']]) theme.querySelector(`option[value="${value}"]`)!.textContent = t(en, pl);
  setting(languageLabel, ['Language', 'Język'], ['Choose your language', 'Wybierz język']);
  languageSelect.setAttribute('aria-label', t('Language', 'Język'));
  setting(speedLabel, ['Game speed', 'Prędkość gry'], ['Applies to the next run', 'Dotyczy następnej rozgrywki']);
  speedSelect.setAttribute('aria-label', t('Game speed', 'Prędkość gry'));
  for (const [value, en, pl] of [['slow', 'Slow', 'Wolno'], ['medium', 'Medium', 'Średnio'], ['fast', 'Fast', 'Szybko']]) speedSelect.querySelector(`option[value="${value}"]`)!.textContent = t(en, pl);
  setting(mazeLabel, ['Maze size', 'Rozmiar labiryntu'], ['Applies to the next run', 'Dotyczy następnej rozgrywki']);
  mazeSelect.setAttribute('aria-label', t('Maze size', 'Rozmiar labiryntu'));
  mazeSelect.querySelector('option[value="custom"]')!.textContent = t('Custom', 'Własny');
  setting(customLabel, ['Custom size', 'Własny rozmiar'], ['Square maze, 5–50 cells per side', 'Kwadratowy labirynt, 5–50 pól na bok']);
  customSize.setAttribute('aria-label', t('Custom maze size', 'Własny rozmiar labiryntu'));
  setting(lanesLabel, ['Road lanes', 'Pasy ruchu'], ['Applies to the next run', 'Dotyczy następnej rozgrywki']);
  lanesSelect.setAttribute('aria-label', t('Road lanes', 'Pasy ruchu'));
  for (const value of ['3', '5', '7', '10']) lanesSelect.querySelector(`option[value="${value}"]`)!.textContent = t(`${value} lanes`, `${value} ${value === '5' || value === '7' || value === '10' ? 'pasów' : 'pasy'}`);
  lanesSelect.querySelector('option[value="custom"]')!.textContent = t('Custom', 'Własna liczba');
  setting(lanesCustomLabel, ['Custom lanes', 'Własna liczba pasów'], ['1–15 road lanes', '1–15 pasów ruchu']);
  lanesCustom.setAttribute('aria-label', t('Custom road lanes', 'Własna liczba pasów ruchu'));
  $<HTMLElement>('.dialog-close').firstChild!.textContent = t('DONE ', 'GOTOWE ');
  refreshAccountText();
  renderGameText();
}
onLanguageChange(renderLanguage);
renderLanguage();
navigate();
