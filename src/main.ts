import './styles.css';
import logoUrl from '../assets/logo/pocket-arcade-green.svg';
import { createGame, type Action, type Game, type GameId, type SnakeSpeed } from './games';
import { CanvasRenderer } from './games/canvas-renderer';
import { createAccount, type Theme } from './account';
import { ArcadeAudio } from './audio';
import { achievements, achievementIcons } from './achievements';
import { getLanguage, onLanguageChange, setLanguage, t } from './i18n';
import { setupLegal } from './legal';

const app = document.querySelector<HTMLDivElement>('#app')!;
const games: { id: GameId; number: string; name: string; description: string; color: string; art: string }[] = [
  { id: 'snake', number: '01', name: 'Snake', description: 'Gather fruit. Grow longer. Stay sharp.', color: 'mint', art: `<svg viewBox="0 0 300 180" aria-hidden="true" shape-rendering="crispEdges"><defs><pattern id="snake-tiles" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#172c37"/><path d="M0 0h12v12H0zm12 12h12v12H12z" fill="#1c3540"/></pattern></defs><rect width="300" height="180" fill="#243f39"/><rect x="74" y="14" width="152" height="152" fill="#6b966d"/><rect x="78" y="18" width="144" height="144" fill="url(#snake-tiles)"/><path d="M103 139h10v10h-10zm12 0h10v10h-10zm12 0h10v10h-10zm0-12h10v10h-10zm0-12h10v10h-10zm12 0h10v10h-10zm12 0h10v10h-10zm0-12h10v10h-10zm0-12h10v10h-10z" fill="#59cba2"/><rect x="151" y="79" width="10" height="10" fill="#a3f4c3"/><rect x="155" y="80" width="3" height="3" fill="#173641"/><rect x="176" y="58" width="8" height="7" fill="#ff6f75"/><rect x="180" y="56" width="3" height="2" fill="#f5c763"/></svg>` },
  { id: 'breakout', number: '02', name: 'Breakout', description: 'Clear the wall, one brick at a time.', color: 'coral', art: `<svg viewBox="0 0 300 180" aria-hidden="true" shape-rendering="crispEdges"><rect width="300" height="180" fill="#433347"/><path d="M27 29h36v12H27zm41 0h36v12H68zm41 0h36v12h-36zm41 0h36v12h-36zm41 0h36v12h-36zm41 0h36v12h-36z" fill="#ff857b"/><path d="M27 46h36v12H27zm41 0h36v12H68zm41 0h36v12h-36zm41 0h36v12h-36zm41 0h36v12h-36zm41 0h36v12h-36z" fill="#efb07e"/><path d="M27 63h36v12H27zm41 0h36v12H68zm41 0h36v12h-36zm82 0h36v12h-36zm41 0h36v12h-36z" fill="#e8d07d"/><path d="M27 80h36v12H27zm41 0h36v12H68zm123 0h36v12h-36zm41 0h36v12h-36z" fill="#a6d5ab"/><rect x="145" y="105" width="10" height="10" fill="#fff4cf"/><path d="M137 122h8v8h-8zm-9 10h6v6h-6z" fill="#957786"/><rect x="104" y="148" width="78" height="10" fill="#b9f2c3"/><rect x="114" y="158" width="58" height="4" fill="#699680"/></svg>` },
  { id: 'lane-dodger', number: '03', name: 'Lane Dodger', description: 'Pick a lane and keep the road clear.', color: 'gold', art: `<svg viewBox="0 0 300 180" aria-hidden="true" shape-rendering="crispEdges"><rect width="300" height="180" fill="#354044"/><path d="M48 0h204v180H48z" fill="#272d3c"/><path d="M48 0h7v180h-7zm197 0h7v180h-7z" fill="#e8ca7d"/><path d="M113 0h4v25h-4zm0 42h4v25h-4zm0 42h4v25h-4zm0 42h4v25h-4zm0 42h4v12h-4zm70-168h4v25h-4zm0 42h4v25h-4zm0 42h4v25h-4zm0 42h4v25h-4zm0 42h4v12h-4z" fill="#8b8990"/><path d="M81 28h20v8h6v26h-6v7H81v-7h-6V36h6z" fill="#ff8b78"/><path d="M84 39h14v10H84z" fill="#f9d5a7"/><path d="M199 74h20v8h6v26h-6v7h-20v-7h-6V82h6z" fill="#e9c774"/><path d="M202 85h14v10h-14z" fill="#fff0c1"/><path d="M140 122h20v8h6v26h-6v7h-20v-7h-6v-26h6z" fill="#b8edbd"/><path d="M143 133h14v10h-14z" fill="#e5ffe2"/></svg>` }
];
games.push({ id: 'labyrinth', number: '04', name: 'Labyrinth', description: 'Find your way through the maze.', color: 'mint', art: `<svg viewBox="0 0 300 180" aria-hidden="true" shape-rendering="crispEdges"><rect width="300" height="180" fill="#242039"/><rect x="76" y="16" width="148" height="148" fill="#382e4d"/><path d="M78 18h144v144H78z M96 18v18 M96 36h18 M114 36h18 M150 36h18 M186 18v18 M204 36h18 M78 54h18 M96 54h18 M132 36v18 M132 54h18 M168 36v18 M186 36v18 M186 54h18 M114 54v18 M96 72h18 M132 54v18 M168 54v18 M150 72h18 M186 54v18 M96 90h18 M132 72v18 M114 90h18 M150 72v18 M168 72v18 M168 90h18 M204 72v18 M186 90h18 M96 90v18 M114 108h18 M150 90v18 M132 108h18 M168 108h18 M186 108h18 M204 108h18 M78 126h18 M114 108v18 M96 126h18 M132 108v18 M168 108v18 M150 126h18 M204 108v18 M114 126v18 M150 126v18 M132 144h18 M150 144h18 M186 126v18 M186 144h18 M96 144v18 M186 144v18" fill="none" stroke="#d4939a" stroke-width="3"/><path d="M82 22h10v10H82z" fill="#a9edb9"/><path d="M84 24h2v2h-2zm4 0h2v2h-2z" fill="#243f39"/><path d="M208 148h10v10h-10z" fill="#f2d785"/><path d="M211 151h4v4h-4z" fill="#a87453"/></svg>` });
games.push({ id: 'frog-crossing', number: '05', name: 'Frog Crossing', description: 'Hop across traffic to the river.', color: 'gold', art: `<svg viewBox="0 0 300 180" aria-hidden="true" shape-rendering="crispEdges"><rect width="300" height="180" fill="#344856"/><path d="M0 0h300v38H0z" fill="#518a9a"/><path d="M0 38h300v20H0zM0 158h300v22H0z" fill="#65966e"/><path d="M0 58h300v100H0z" fill="#303047"/><path d="M0 108h300" stroke="#d4c68a" stroke-width="3" stroke-dasharray="18 15"/><path d="M35 74h56v17H35zm147 51h63v17h-63z" fill="#ff927e"/><path d="M42 70h30v8H42zm147 51h34v8h-34z" fill="#f0c795"/><path d="M136 140h28v18h-28zm-5-5h10v10h-10zm28 0h10v10h-10z" fill="#a9edb9"/><path d="M135 137h4v4h-4zm26 0h4v4h-4z" fill="#243f39"/></svg>` });
games.push({ id: 'tetris', number: '06', name: 'Tetris', description: 'Stack blocks and clear complete lines.', color: 'coral', art: `<svg viewBox="0 0 300 180" aria-hidden="true" shape-rendering="crispEdges"><rect width="300" height="180" fill="#25233b"/><path d="M70 18h160v145H70z" fill="#191a30" stroke="#71657e" stroke-width="4"/><g fill="#a9edb9"><path d="M84 138h22v22H84zm24 0h22v22h-22zm24 0h22v22h-22zm0-24h22v22h-22z"/></g><g fill="#ff9784"><path d="M156 138h22v22h-22zm24 0h22v22h-22zm0-24h22v22h-22zm0-24h22v22h-22z"/></g><g fill="#f2d785"><path d="M120 40h22v22h-22zm24 0h22v22h-22zm24 0h22v22h-22zm-24 24h22v22h-22z"/></g></svg>` });
games.find(game => game.id === 'frog-crossing')!.description = 'Cross the road and ride logs to the far bank.';
games.push({ id: 'pac-man', number: '07', name: 'Pac-Man', description: 'Eat the dots and dodge the ghosts.', color: 'gold', art: `<svg viewBox="0 0 300 180" aria-hidden="true" shape-rendering="crispEdges"><rect width="300" height="180" fill="#17192f"/><rect x="76" y="16" width="148" height="148" fill="#536fce"/><rect x="80" y="20" width="140" height="140" fill="#10152b"/><g fill="#536fce"><path d="M96 36h24v10H96zm36 0h36v10h-36zm48 0h24v10h-24zM96 56h24v10H96zm36 0h10v18h-10zm26 0h10v18h-10zm22 0h24v10h-24zM96 114h24v10H96zm36-8h10v18h-10zm26 0h10v18h-10zm22 8h24v10h-24zM96 134h24v10H96zm36 0h36v10h-36zm48 0h24v10h-24z"/></g><g fill="#f8dca4"><path d="M100 88h4v4h-4zm20 0h4v4h-4zm20 0h4v4h-4zm20 0h4v4h-4zm20 0h4v4h-4z"/><path d="M86 26h6v6h-6zm122 0h6v6h-6zm-122 122h6v6h-6zm122 0h6v6h-6z"/></g><path d="M89 83h8v3h3v2h-6l6 4v2h-3v3h-8v-3h-3v-8h3z" fill="#f2d785"/><path d="M197 83h8v3h3v11h-3v-2h-3v2h-3v-2h-3v2h-2V86h3z" fill="#ff7887"/><path d="M198 87h3v3h-3zm5 0h3v3h-3z" fill="#fff4d3"/></svg>` });
games.push({ id: 'asteroids', number: '08', name: 'Asteroids', description: 'Pilot your ship through an asteroid field.', color: 'mint', art: `<svg viewBox="0 0 300 180" aria-hidden="true" shape-rendering="crispEdges"><rect width="300" height="180" fill="#17192f"/><path d="M25 30h4v4h-4zm200 10h4v4h-4zM70 140h4v4h-4zm200-30h4v4h-4z" fill="#f6e5bd"/><path d="M64 50h24l12 12v18L87 92H60L49 76V62zM211 100h24l12 12v18l-13 12h-27l-11-16v-14z" fill="#9b8f9a"/><path d="M62 57h14v5H62zm151 52h13v5h-13z" fill="#d6c1b1"/><path d="M151 63l22 54-22-10-22 10z" fill="#b9efc6"/><path d="M147 109h8v16h-8z" fill="#ff9a78"/></svg>` });
games.push({ id: 'minesweeper', number: '09', name: 'Minesweeper', description: 'Clear the field without setting off a mine.', color: 'coral', art: `<svg viewBox="0 0 300 180" aria-hidden="true" shape-rendering="crispEdges"><rect width="300" height="180" fill="#25233b"/><path d="M70 18h160v144H70z" fill="#687d79" stroke="#a9edb9" stroke-width="4"/><path d="M70 54h160M70 90h160M70 126h160M110 18v144M150 18v144M190 18v144" stroke="#293b3b" stroke-width="3"/><path d="M73 57h34v30H73zm80-36h34v30h-34zm40 72h34v30h-34z" fill="#b2c8ad"/><path d="M125 118v-24h3v24zm3-24h16v11h-16z" fill="#ff9784"/><path d="M202 28h18v18h-18zM198 34h26v6h-26z" fill="#25233b"/></svg>` });
games.push({ id: 'scorched-earth', number: '10', name: 'Scorched Earth', description: 'Aim, fire and outlast the enemy tank.', color: 'gold', art: `<svg viewBox="0 0 300 180" aria-hidden="true" shape-rendering="crispEdges"><rect width="300" height="180" fill="#242039"/><path d="M0 126h30v-8h30v8h22v12h24v-10h20v-18h22V98h22v14h20v20h22v-12h25v-12h29v12h34v60H0z" fill="#805b53"/><path d="M0 126h30v-8h30v8h22v12h24v-10h20v-18h22V98h22v14h20v20h22v-12h25v-12h29v12h34" fill="none" stroke="#e5bd80" stroke-width="5"/><path d="M37 108h30v10H37zM43 102h15v7H43zM55 102l14-14 4 4-14 14z" fill="#a9edb9"/><path d="M240 98h30v10h-30zM246 92h15v7h-15zM246 92l-14-14-4 4 14 14z" fill="#ff9784"/><path d="M78 77h5v5h-5zm24-18h5v5h-5zm25-11h5v5h-5zm26-2h5v5h-5zm25 9h5v5h-5z" fill="#f2d785"/></svg>` });
app.innerHTML = `<div class="shell"><header class="topbar"><a class="brand" href="#" aria-label="Pocket Arcade home"><span class="brand-mark" aria-hidden="true">✦</span><span>POCKET<span class="brand-small">ARCADE</span></span></a><div class="header-actions"><button class="text-button" id="login">Log in <span aria-hidden="true">↗</span></button><button class="icon-button settings-open" aria-label="Open settings" title="Settings">⚙</button></div></header><main><section id="picker"><div class="hero"><div><p class="eyebrow"><span class="status-dot"></span> YOUR LITTLE CORNER OF PLAY</p><h1>Pocket Arcade<span class="period">.</span></h1><p class="intro">A little play goes a long way.<br>Pick a cartridge and beat your best.</p></div><div class="hero-stamp" aria-hidden="true"><span>INSERT</span><strong>COIN</strong><span>JUST KIDDING ✳</span></div></div><div class="section-heading"><div><p class="eyebrow">THE COLLECTION <span class="subtle">/ 03 GAMES</span></p><h2>Choose your game</h2></div><span class="section-note">GOOD GAMES, NO QUARTERS.</span></div><div class="cards">${games.map(g => `<article class="card ${g.color}"><div class="art">${g.art}<span class="art-index">${g.number} / 03</span></div><div class="card-body"><div class="card-title"><h3>${g.name}</h3><span aria-hidden="true">✳</span></div><p>${g.description}</p><div class="card-bottom"><div><span class="micro">PERSONAL BEST</span><strong class="best" data-best="${g.id}">Not played</strong></div><a class="play" href="#game/${g.id}" aria-label="Play ${g.name}">PLAY <span aria-hidden="true">↗</span></a></div></div></article>`).join('')}</div><div class="bottom-line"><span>MADE FOR A LITTLE BREAK.</span><span>★ &nbsp; PLAY AT YOUR OWN PACE</span></div></section><section id="game-view" hidden><div class="game-heading"><a class="back" href="#">← &nbsp; BACK TO ARCADE</a><button class="icon-button settings-open" aria-label="Open settings" title="Settings">⚙</button></div><div class="game-layout"><div class="game-main"><div class="game-title-row"><div><p class="eyebrow">NOW PLAYING <span class="subtle">/ <span id="game-number"></span></span></p><h2 id="game-title"></h2></div><div class="score-box"><span class="micro">SCORE</span><strong id="score">0</strong></div></div><div class="board-wrap"><canvas width="240" height="240" aria-label="Game board"></canvas><div id="board-message" class="board-message"><span id="message-label">READY, PLAYER?</span><strong id="message-title">Let's play.</strong><button id="start" class="primary">START GAME <span>→</span></button></div></div><div class="game-actions"><button id="pause" class="secondary" disabled>Pause</button><button id="replay" class="secondary">Replay</button></div></div><aside class="game-side"><p class="eyebrow">HOW TO PLAY</p><p id="instructions"></p><p class="hint">Use arrow keys or WASD.<br>On touch, use the buttons below.</p><div class="dpad" aria-label="Directional controls"><button data-action="up" aria-label="Up">▲</button><button data-action="left" aria-label="Left">◀</button><button data-action="down" aria-label="Down">▼</button><button data-action="right" aria-label="Right">▶</button></div><p class="side-foot">TAKE YOUR TIME.<br>THE HIGH SCORE CAN WAIT.</p></aside></div></section><section class="account-section" aria-label="Player account"><div id="account"></div></section></main><footer><span>POCKET ARCADE <span class="period">✳</span></span><span>SMALL GAMES. BIG JOY.</span></footer></div><dialog id="settings"><form method="dialog"><div class="dialog-head"><div><p class="eyebrow">MAKE IT YOURS</p><h2>Settings</h2></div><button class="icon-button" value="close" aria-label="Close settings">×</button></div><label class="setting-row"><span><strong>Music</strong><small>A little soundtrack for your game</small></span><input id="music" type="checkbox" checked></label><label class="setting-row"><span><strong>Sound effects</strong><small>Sounds for points and game over</small></span><input id="effects" type="checkbox" checked></label><label class="setting-row"><span><strong>Theme</strong><small>Pick your cabinet colors</small></span><select id="theme"><option value="midnight">Midnight</option><option value="amber">Amber</option><option value="mint">Mint</option></select></label><p id="storage-note" class="hint"></p><button class="primary dialog-close" value="close">DONE <span>→</span></button></form></dialog>`;
const $ = <T extends Element>(selector: string) => app.querySelector<T>(selector)!;
const brandImage = document.createElement('img');
brandImage.src = logoUrl;
brandImage.alt = '';
brandImage.className = 'brand-logo';
$<HTMLAnchorElement>('.brand').replaceChildren(brandImage);
document.querySelectorAll<HTMLElement>('.card').forEach(card => {
  const link = card.querySelector<HTMLAnchorElement>('.play')!;
  link.remove();
  link.className = 'card-link';
  link.replaceChildren();
  card.replaceWith(link);
  link.append(card);
});
$<HTMLElement>('.section-heading .subtle').textContent = `/ ${String(games.length).padStart(2, '0')} GAMES`;
document.querySelectorAll<HTMLElement>('.art-index').forEach((node, index) => { node.textContent = `${games[index].number} / ${String(games.length).padStart(2, '0')}`; });
const expandButton = document.createElement('button');
expandButton.type = 'button';
expandButton.className = 'secondary';
expandButton.setAttribute('aria-pressed', 'false');
document.querySelector('.game-actions')!.append(expandButton);
function renderExpandButton(): void {
  const expanded = expandButton.getAttribute('aria-pressed') === 'true';
  expandButton.textContent = expanded ? t("Smaller board") : t("Expand board");
}
expandButton.addEventListener('click', () => {
  const expanded = expandButton.getAttribute('aria-pressed') !== 'true';
  expandButton.setAttribute('aria-pressed', String(expanded));
  document.querySelector('.game-layout')!.classList.toggle('expanded', expanded);
  renderExpandButton();
});
const picker = $<HTMLElement>('#picker'), gameView = $<HTMLElement>('#game-view'), accountView = $<HTMLElement>('.account-section');
const canvas = $<HTMLCanvasElement>('canvas'), ctx = new CanvasRenderer(canvas);
const settings = $<HTMLDialogElement>('#settings'), audio = new ArcadeAudio();
const music = $<HTMLInputElement>('#music'), effects = $<HTMLInputElement>('#effects'), theme = $<HTMLSelectElement>('#theme');
const start = $<HTMLButtonElement>('#start'), pauseButton = $<HTMLButtonElement>('#pause');
const boardMessage = $<HTMLElement>('#board-message');
const flagButton = document.createElement('button');
flagButton.type = 'button';
flagButton.className = 'secondary';
flagButton.hidden = true;
flagButton.setAttribute('aria-pressed', 'false');
document.querySelector('.game-side .dpad')!.before(flagButton);
let flagMode = false;
function renderFlagButton(): void {
  flagButton.textContent = flagMode ? t("Flag mode: on") : t("Flag mode: off");
  flagButton.setAttribute('aria-pressed', String(flagMode));
}
flagButton.addEventListener('click', () => { flagMode = !flagMode; renderFlagButton(); });
const fireButton = document.createElement('button');
fireButton.type = 'button';
fireButton.className = 'primary artillery-fire';
fireButton.hidden = true;
document.querySelector('.game-side .dpad')!.after(fireButton);
fireButton.addEventListener('click', () => { if (mode === 'playing' && gameId === 'scorched-earth') game?.fire?.(); });
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
const difficultyLabel = document.createElement('label');
difficultyLabel.className = 'setting-row';
difficultyLabel.innerHTML = '<span><strong>Difficulty</strong><small>Applies to the next run</small></span><select aria-label="Difficulty"><option value="easy">Easy</option><option value="medium" selected>Medium</option><option value="hard">Hard</option></select>';
speedLabel.before(difficultyLabel);
const difficultySelect = difficultyLabel.querySelector<HTMLSelectElement>('select')!;
difficultySelect.addEventListener('change', () => { if (gameId === 'scorched-earth' && mode === 'ready') resetGame(); });
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
let visibleBests: Partial<Record<GameId, number>> = {};
const achievementPane = document.createElement('section');
achievementPane.className = 'achievement-pane';
document.querySelector('.game-side')!.prepend(achievementPane);
function renderAchievements(): void {
  achievementPane.replaceChildren();
  const items = gameId ? achievements[gameId] : undefined;
  achievementPane.hidden = !items?.length;
  if (!items?.length || !gameId) return;
  const title = document.createElement('p');
  title.className = 'eyebrow';
  title.textContent = t("ACHIEVEMENTS");
  achievementPane.append(title);
  achievementPane.append(achievementIcons(items, visibleBests[gameId]));
}
let refreshAccountText = () => {};
const account = createAccount($<HTMLElement>('#account'), state => {
  document.documentElement.dataset.theme = state.theme;
  visibleBests = state.bests;
  renderAchievements();
  theme.value = state.theme;
  refreshAccountText = () => {
    for (const g of games) $<HTMLElement>(`[data-best="${g.id}"]`).textContent = state.bests[g.id] === undefined ? t("Not played") : String(state.bests[g.id]);
    $('#storage-note').textContent = state.sessionOnly || !storageAvailable ? t("Device storage unavailable; guest data and preferences last for this session only.") : '';
    $<HTMLButtonElement>('#login').textContent = state.signedIn ? t("Account ↗") : t("Account / Log in ↗");
  };
  refreshAccountText();
});
$<HTMLButtonElement>('#login').onclick = () => { location.hash = '#account'; };
music.onchange = () => { audio.music = music.checked; if (!music.checked) audio.stopMusic(); else if (mode === 'playing') void audio.start(); saveAudio(); };
effects.onchange = () => { audio.effects = effects.checked; if (!effects.checked) audio.stopEffects(); saveAudio(); };
theme.onchange = () => account.setTheme(theme.value as Theme);
let returnFocus: HTMLElement | null = null;
document.querySelectorAll<HTMLButtonElement>('.settings-open').forEach(button => button.onclick = () => { returnFocus = button; pauseGame(); speedLabel.hidden = !gameId || gameId === 'minesweeper'; mazeLabel.hidden = gameId !== 'labyrinth'; customLabel.hidden = gameId !== 'labyrinth' || mazeSelect.value !== 'custom'; lanesLabel.hidden = gameId !== 'frog-crossing'; lanesCustomLabel.hidden = gameId !== 'frog-crossing' || lanesSelect.value !== 'custom'; difficultyLabel.hidden = gameId !== 'scorched-earth'; settings.showModal(); });
settings.addEventListener('close', () => returnFocus?.focus());
let game: Game | null = null, gameId: GameId | null = null;
let mode: 'ready' | 'playing' | 'paused' | 'ended' = 'ready';
let frame = 0, last = 0, accumulator = 0, previousScore = 0;
let simulationScale = 1;
const held = new Set<Action>();
function release(): void { for (const action of held) game?.input(action, false); held.clear(); document.querySelectorAll('.dpad button').forEach(b => b.classList.remove('pressed')); }
function pauseGame(): void { if (mode !== 'playing') return; mode = 'paused'; cancelAnimationFrame(frame); audio.stop(); release(); boardMessage.hidden = false; renderGameText(); }
function begin(): void { if (!game || mode === 'playing') return; if (mode === 'ended') resetGame(); mode = 'playing'; boardMessage.hidden = true; pauseButton.disabled = false; renderGameText(); last = 0; accumulator = 0; void audio.start(); frame = requestAnimationFrame(tick); }
function resetGame(): void { if (!gameId) return; cancelAnimationFrame(frame); audio.stop(); release(); const speed = speedSelect.value as SnakeSpeed; const mazeSize = mazeSelect.value === 'custom' ? Math.max(5, Math.min(50, Math.round(Number(customSize.value) || 5))) : Number(mazeSelect.value); const lanes = lanesSelect.value === 'custom' ? Math.max(1, Math.min(15, Math.round(Number(lanesCustom.value) || 1))) : Number(lanesSelect.value); game = createGame(gameId, speed, mazeSize, lanes, difficultySelect.value as 'easy' | 'medium' | 'hard'); simulationScale = gameId === 'snake' ? 1 : { slow: 2 / 3, medium: 1, fast: 2 }[speed]; previousScore = 0; mode = 'ready'; $('#score').textContent = '0'; boardMessage.hidden = false; pauseButton.disabled = true; renderGameText(); game.draw(ctx); }
function tick(now: number): void { if (mode !== 'playing' || !game) return; if (!last) last = now; accumulator += Math.min(now - last, 250) * simulationScale; last = now; while (accumulator >= 1000 / 60 && game.status === 'playing') { game.step(); accumulator -= 1000 / 60; } if (game.score !== previousScore) { previousScore = game.score; $('#score').textContent = String(game.score); audio.cue(); } game.draw(ctx); if (game.status !== 'playing') { mode = 'ended'; release(); audio.stop(); audio.cue(true); pauseButton.disabled = true; boardMessage.hidden = false; renderGameText(); if (gameId) account.record(gameId, game.score); return; } frame = requestAnimationFrame(tick); }
start.onclick = begin;
pauseButton.onclick = () => mode === 'playing' ? pauseGame() : begin();
$<HTMLButtonElement>('#replay').onclick = () => { resetGame(); begin(); };
function navigate(): void { cancelAnimationFrame(frame); audio.stop(); release(); const id = location.hash.slice(6) as GameId; const selected = location.hash.startsWith('#game/') ? games.find(g => g.id === id) : undefined; const accountPage = location.hash === '#account'; gameId = selected?.id ?? null; picker.hidden = !!selected || accountPage; gameView.hidden = !selected; accountView.hidden = !accountPage; flagMode = false; flagButton.hidden = gameId !== 'minesweeper'; fireButton.hidden = gameId !== 'scorched-earth'; $<HTMLElement>('.dpad').hidden = gameId === 'minesweeper'; canvas.classList.toggle('mine-board', gameId === 'minesweeper'); renderFlagButton(); if (selected) { $('#game-number').textContent = selected.number; resetGame(); } else { game = null; mode = 'ready'; } renderGameText(); window.scrollTo(0, 0); }
window.addEventListener('hashchange', navigate);
const keyActions: Record<string, Action> = { ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right' };
function keyAction(event: KeyboardEvent): Action | undefined { return keyActions[event.key] ?? keyActions[event.key.toLowerCase()]; }
window.addEventListener('keydown', event => { const target = event.target as HTMLElement; if (mode !== 'playing' || settings.open || event.repeat || (event.key.toLowerCase() !== 'p' && event.key !== 'Escape') || target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), #account')) return; event.preventDefault(); pauseGame(); });
window.addEventListener('keydown', event => { const target = event.target as HTMLElement; if (mode !== 'ended' || settings.open || event.repeat || (event.key !== 'Enter' && event.key !== ' ') || (target !== start && target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"])'))) return; event.preventDefault(); begin(); });
window.addEventListener('keydown', event => { const target = event.target as HTMLElement; if (event.defaultPrevented || gameId !== 'scorched-earth' || mode !== 'playing' || settings.open || event.repeat || event.key !== ' ' || (target !== start && target.closest('input, textarea, select, button, a, [contenteditable]:not([contenteditable="false"])'))) return; event.preventDefault(); game?.fire?.(); });
window.addEventListener('keydown', event => { const target = event.target as HTMLElement; if (mode !== 'playing' || settings.open || /INPUT|TEXTAREA|SELECT/.test(target.tagName) || target.isContentEditable) return; const action = keyAction(event); if (!action) return; event.preventDefault(); if (!held.has(action)) { held.add(action); game?.input(action, true); } });
window.addEventListener('keyup', event => { const action = keyAction(event); if (action && held.has(action)) { held.delete(action); game?.input(action, false); } });
document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => { const action = button.dataset.action as Action; const end = () => { if (held.delete(action)) game?.input(action, false); button.classList.remove('pressed'); }; button.addEventListener('pointerdown', event => { if (mode !== 'playing') return; event.preventDefault(); button.setPointerCapture(event.pointerId); if (!held.has(action)) { held.add(action); game?.input(action, true); } button.classList.add('pressed'); }); button.addEventListener('pointerup', end); button.addEventListener('pointercancel', end); button.addEventListener('lostpointercapture', end); });
canvas.addEventListener('contextmenu', event => { if (gameId === 'minesweeper') event.preventDefault(); });
let boardPress: { id: number; x: number; y: number; flag: boolean } | null = null;
canvas.addEventListener('pointerdown', event => {
  if (gameId !== 'minesweeper' || mode !== 'playing' || (event.button !== 0 && event.button !== 2)) return;
  event.preventDefault();
  boardPress = { id: event.pointerId, x: event.clientX, y: event.clientY, flag: event.button === 2 || flagMode };
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointerup', event => {
  const press = boardPress;
  boardPress = null;
  if (!press || press.id !== event.pointerId || mode !== 'playing' || Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10) return;
  const bounds = canvas.getBoundingClientRect();
  const x = (event.clientX - bounds.left) * canvas.width / bounds.width;
  const y = (event.clientY - bounds.top) * canvas.height / bounds.height;
  if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) game?.pointer?.(x, y, press.flag);
});
canvas.addEventListener('pointercancel', () => { boardPress = null; });
window.addEventListener('blur', () => { pauseGame(); release(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { pauseGame(); release(); } });
const gameCopy: Record<GameId, { name: string; description: string; instructions: string }> = {
  "snake": { name: "Snake", description: "Gather fruit. Grow longer. Stay sharp.", instructions: "Collect fruit to grow. Avoid the walls and your own tail." },
  "breakout": { name: "Breakout", description: "Clear the wall, one brick at a time.", instructions: "Move the paddle to keep the ball in play and clear every brick." },
  "lane-dodger": { name: "game-picker\u0004Lane Dodger", description: "Pick a lane and keep the road clear.", instructions: "Change lanes to avoid traffic. Every car you pass earns a point." },
  "labyrinth": { name: "Labyrinth", description: "Find your way through the maze.", instructions: "Find the gold exit. Fewer moves earn a higher score." },
  "frog-crossing": { name: "game-picker\u0004Frog Crossing", description: "Cross the road and ride logs to the far bank.", instructions: "Avoid traffic, hop onto logs, and reach the far bank." },
  "tetris": { name: "Tetris", description: "Stack blocks and clear complete lines.", instructions: "Move blocks left and right, rotate with up, and soft drop with down. Fill lines to clear them." },
  "pac-man": { name: "Pac-Man", description: "Eat the dots and dodge the ghosts.", instructions: "Collect every dot and avoid ghosts. Power pellets let you eat ghosts briefly." },
  "asteroids": { name: "Asteroids", description: "Pilot your ship through an asteroid field.", instructions: "Turn left or right, thrust with up, and fire with down. Destroy asteroids to score." },
  "minesweeper": { name: "Minesweeper", description: "Clear the field without setting off a mine.", instructions: "Reveal every safe square. Numbers count neighboring mines." },
  "scorched-earth": { name: "game-picker\u0004Scorched Earth", description: "Aim, fire and outlast the enemy tank.", instructions: "Duel the computer. Left and right adjust angle; up and down adjust power. Account for the wind and hit the enemy tank." },
};
function gameName(id: GameId): string {
  return t(gameCopy[id].name);
}
function renderGameText(): void {
  renderAchievements();
  if (gameId) {
    $('#game-title').textContent = gameName(gameId);
    
    $('#instructions').textContent = t(gameCopy[gameId].instructions);
  flagButton.hidden = gameId !== 'minesweeper';
  $<HTMLElement>('.game-side .hint').innerHTML = gameId === 'minesweeper'
    ? t("Click or tap to reveal. Right-click or enable flag mode to mark mines.")
    : gameId === 'scorched-earth'
      ? t("Use arrow keys or WASD to aim. Press Space or Fire to shoot; touch controls are below.")
      : t("Use arrow keys or WASD.<br>On touch, use the buttons below.");
  }
  const won = game?.status === 'won';
  $('#message-label').textContent = mode === 'paused' ? t("TAKE A BREATHER") : mode === 'ended' ? (won ? t("WELL PLAYED") : t("GAME OVER")) : t("READY, PLAYER?");
  $('#message-title').textContent = mode === 'paused' ? t("Paused.") : mode === 'ended' ? (won ? t("You won!") : t("Nice run.")) : t("Let's play.");
  start.firstChild!.textContent = mode === 'paused' ? t("RESUME ") : mode === 'ended' ? t("PLAY AGAIN ") : t("START GAME ");
  pauseButton.textContent = mode === 'paused' ? t("Resume") : t("Pause");
}
function renderLanguage(): void {
  languageSelect.value = getLanguage();
  const text = (selector: string, en: string) => { $(selector).textContent = t(en); };
  const attr = (selector: string, attribute: string, en: string) => { $(selector).setAttribute(attribute, t(en)); };
  attr('.brand', 'aria-label', "Pocket Arcade home");
  document.querySelectorAll('.settings-open').forEach(button => { button.setAttribute('aria-label', t("Open settings")); button.setAttribute('title', t("Settings")); });
  $<HTMLElement>('.hero .eyebrow').lastChild!.textContent = t(" YOUR LITTLE CORNER OF PLAY");
  $('.intro').innerHTML = t("A little play goes a long way.<br>Pick a cartridge and beat your best.");
  const stamp = document.querySelectorAll('.hero-stamp span');
  stamp[0].textContent = t("INSERT"); stamp[1].textContent = t("JUST KIDDING ✳");
  text('.hero-stamp strong', "COIN");
  $<HTMLElement>('.section-heading .eyebrow').firstChild!.textContent = t("THE COLLECTION ");
  $('.section-heading .subtle').textContent = t("/ {arg0} GAMES", { arg0: String(games.length).padStart(2, '0') });
  text('.section-heading h2', "Choose your game");
  text('.section-note', "GOOD GAMES, NO QUARTERS.");
  document.querySelectorAll<HTMLElement>('.card').forEach((card, index) => {
    const g = games[index], name = gameName(g.id);
    card.querySelector('h3')!.textContent = name;
    card.querySelector('.card-body > p')!.textContent = t(gameCopy[g.id].description);
    card.querySelector('.micro')!.textContent = t("PERSONAL BEST");
    card.closest('a')!.setAttribute('aria-label', t("Play {arg0}", { arg0: name }));
  });
  const bottom = document.querySelectorAll('.bottom-line span');
  bottom[0].textContent = t("MADE FOR A LITTLE BREAK.");
  bottom[1].textContent = t("★  PLAY AT YOUR OWN PACE");
  text('.back', "←   BACK TO ARCADE");
  $<HTMLElement>('.game-title-row .eyebrow').firstChild!.textContent = t("NOW PLAYING ");
  text('.score-box .micro', "SCORE");
  attr('canvas', 'aria-label', "Game board");
  text('#replay', "New game");
  renderFlagButton();
  fireButton.textContent = t("Fire");
  renderExpandButton();
  text('.game-side > .eyebrow', "HOW TO PLAY");
  $('.game-side .hint').innerHTML = t("Use arrow keys or WASD.<br>On touch, use the buttons below.");
  attr('.dpad', 'aria-label', "Directional controls");
  for (const [action, en] of [['up', "Up"], ['down', "Down"], ['left', "Left"], ['right', "Right"]]) attr(`[data-action="${action}"]`, 'aria-label', en);
  $('.side-foot').innerHTML = t("TAKE YOUR TIME.<br>THE HIGH SCORE CAN WAIT.");
  attr('.account-section', 'aria-label', "Player account");
  text('footer > span:nth-child(2)', "SMALL GAMES. BIG JOY.");
  text('.dialog-head .eyebrow', "MAKE IT YOURS");
  text('.dialog-head h2', "Settings");
  attr('.dialog-head button', 'aria-label', "Close settings");
  const setting = (label: Element, title: string, detail: string) => {
    label.querySelector('strong')!.textContent = t(title);
    label.querySelector('small')!.textContent = t(detail);
  };
  setting(music.closest('label')!, "Music", "A little soundtrack for your game");
  setting(effects.closest('label')!, "Sound effects", "Sounds for points and game over");
  setting(theme.closest('label')!, "Theme", "Pick your cabinet colors");
  for (const [value, en] of [['midnight', "Midnight"], ['amber', "Amber"], ['mint', "Mint"]]) theme.querySelector(`option[value="${value}"]`)!.textContent = t(en);
  setting(languageLabel, "Language", "Choose your language");
  languageSelect.setAttribute('aria-label', t("Language"));
  setting(speedLabel, "Game speed", "Applies to the next run");
  speedSelect.setAttribute('aria-label', t("Game speed"));
  for (const [value, en] of [['slow', "Slow"], ['medium', "Medium"], ['fast', "Fast"]]) speedSelect.querySelector(`option[value="${value}"]`)!.textContent = t(en);
  setting(difficultyLabel, "Difficulty", "Applies to the next run");
  difficultySelect.setAttribute('aria-label', t("Difficulty"));
  for (const [value, en] of [['easy', "Easy"], ['medium', "difficulty\u0004Medium"], ['hard', "Hard"]]) difficultySelect.querySelector(`option[value="${value}"]`)!.textContent = t(en);
  setting(mazeLabel, "Maze size", "Applies to the next run");
  mazeSelect.setAttribute('aria-label', t("Maze size"));
  mazeSelect.querySelector('option[value="custom"]')!.textContent = t("Custom");
  setting(customLabel, "Custom size", "Square maze, 5–50 cells per side");
  customSize.setAttribute('aria-label', t("Custom maze size"));
  setting(lanesLabel, "Road lanes", "Applies to the next run");
  lanesSelect.setAttribute('aria-label', t("Road lanes"));
  for (const value of ['3', '5', '7', '10']) lanesSelect.querySelector(`option[value="${value}"]`)!.textContent = t(value === '3' ? "{value} lanes" : "road-lanes-plural\u0004{value} lanes", { value });
  lanesSelect.querySelector('option[value="custom"]')!.textContent = t("road-lanes\u0004Custom");
  setting(lanesCustomLabel, "Custom lanes", "1–15 road lanes");
  lanesCustom.setAttribute('aria-label', t("Custom road lanes"));
  $<HTMLElement>('.dialog-close').firstChild!.textContent = t("DONE ");
  refreshAccountText();
  renderGameText();
}
onLanguageChange(renderLanguage);
setupLegal(pauseGame);
renderLanguage();
navigate();
