import { achievementIcons } from './achievements';
import { ArcadeAudio } from './audio';
import type { RegisteredGame, GameId } from './games';
import { GameEngine } from './games/engine';
import type { Action, Game, GameSpeed } from './games/types';
import { t } from './i18n';

const stepMs = 1000 / 60;
const speedScale = { slow: 2 / 3, medium: 1, fast: 2 };
const keyActions: Readonly<Partial<Record<string, Action>>> = {
  ArrowUp: 'up', w: 'up', ArrowDown: 'down', s: 'down', ArrowLeft: 'left', a: 'left', ArrowRight: 'right', d: 'right',
};
const defaultHint = 'Use arrow keys or WASD.<br>On touch, use the buttons below.';

type Run = { game: Game; engine: GameEngine; scale: number };
export type GameScreen = { kind: 'game'; definition: RegisteredGame; number: string; run: Run };

type GameViewServices = {
  current(): GameScreen | undefined;
  settingsOpen(): boolean;
  options: { readonly speed: GameSpeed; optionsFor(game: RegisteredGame): Readonly<Record<string, string>> };
  onRecord(id: GameId, score: number): void;
  best(id: GameId): number | undefined;
  audio: ArcadeAudio;
};

export function createGameView(root: HTMLElement, { current, settingsOpen, options, onRecord, best, audio }: GameViewServices) {
  const $ = <T extends HTMLElement>(selector: string) => root.querySelector<T>(selector)!;
  const canvas = $<HTMLCanvasElement>('canvas');
  const dpad = $('.dpad');
  const buttons = dpad.querySelectorAll<HTMLButtonElement>('button');
  const start = $<HTMLButtonElement>('#start'), pauseButton = $<HTMLButtonElement>('#pause');
  const flagButton = $<HTMLButtonElement>('#flag'), fireButton = $<HTMLButtonElement>('#fire');
  const expandButton = $<HTMLButtonElement>('#expand');
  const boardMessage = $('#board-message'), scoreNode = $('#score');
  const pane = $('.achievement-pane');
  let mode: 'ready' | 'playing' | 'paused' | 'ended' = 'ready';
  let frame = 0, last: number | undefined, accumulator = 0, previousScore = 0;
  let flagMode = false;
  let boardPress: { id: number; x: number; y: number; flag: boolean } | undefined;
  const held = new Set<Action>();

  function showFlagMode(): void {
    flagButton.textContent = t(flagMode ? 'Flag mode: on' : 'Flag mode: off');
    flagButton.setAttribute('aria-pressed', String(flagMode));
  }

  function renderAchievements(): void {
    pane.replaceChildren();
    const definition = current()?.definition;
    pane.hidden = !definition?.achievements?.length;
    if (!definition?.achievements?.length) return;
    const title = document.createElement('p');
    title.className = 'eyebrow';
    title.textContent = t('ACHIEVEMENTS');
    pane.append(title, achievementIcons(definition.achievements, best(definition.id)));
  }

  function renderText(): void {
    const screen = current();
    renderAchievements();
    if (screen) {
      $('#game-number').textContent = screen.number;
      $('#game-title').textContent = t(screen.definition.name);
      $('#instructions').textContent = t(screen.definition.instructions);
      if (screen.definition.hint) $('.game-side .hint').textContent = t(screen.definition.hint);
      else $('.game-side .hint').innerHTML = t(defaultHint);
    }
    const won = screen?.run.game.status === 'won';
    $('#message-label').textContent = t(mode === 'paused' ? 'TAKE A BREATHER' : mode === 'ended' ? (won ? 'WELL PLAYED' : 'GAME OVER') : 'READY, PLAYER?');
    $('#message-title').textContent = t(mode === 'paused' ? 'Paused.' : mode === 'ended' ? (won ? 'You won!' : 'Nice run.') : "Let's play.");
    start.firstChild!.textContent = t(mode === 'paused' ? 'RESUME ' : mode === 'ended' ? 'PLAY AGAIN ' : 'START GAME ');
    pauseButton.textContent = t(mode === 'paused' ? 'Resume' : 'Pause');
  }

  function renderExpandButton(): void {
    expandButton.textContent = t(expandButton.getAttribute('aria-pressed') === 'true' ? 'Smaller board' : 'Expand board');
  }

  function localize(): void {
    $('.back').textContent = t('←   BACK TO ARCADE');
    $('.game-title-row .eyebrow').firstChild!.textContent = t('NOW PLAYING ');
    $('.score-box .micro').textContent = t('SCORE');
    canvas.setAttribute('aria-label', t('Game board'));
    $('#replay').textContent = t('New game');
    fireButton.textContent = t('Fire');
    $('.game-side > .eyebrow').textContent = t('HOW TO PLAY');
    dpad.setAttribute('aria-label', t('Directional controls'));
    const actionLabels = { up: 'Up', down: 'Down', left: 'Left', right: 'Right' };
    for (const button of buttons) button.setAttribute('aria-label', t(actionLabels[button.dataset.action as Action]));
    $('.side-foot').innerHTML = t('TAKE YOUR TIME.<br>THE HIGH SCORE CAN WAIT.');
    showFlagMode();
    renderExpandButton();
    renderText();
  }

  function release(): void {
    const game = current()?.run.game;
    for (const action of held) game?.input(action, false);
    held.clear();
    for (const button of buttons) button.classList.remove('pressed');
    boardPress = undefined;
  }

  function stop(): void {
    cancelAnimationFrame(frame);
    audio.stop();
    release();
    mode = 'ready';
  }

  function pause(): void {
    if (mode !== 'playing') return;
    stop();
    mode = 'paused';
    boardMessage.hidden = false;
    renderText();
  }

  function newRun(definition: RegisteredGame): Run {
    const speed = options.speed;
    const game = definition.create(speed, options.optionsFor(definition));
    return { game, engine: new GameEngine(canvas, game.resolution), scale: definition.timing?.(speed) ?? speedScale[speed] };
  }

  function showRun({ game, engine }: Run): void {
    const pointer = !!game.pointer;
    flagButton.hidden = !pointer;
    fireButton.hidden = !game.fire;
    dpad.hidden = pointer;
    canvas.classList.toggle('mine-board', pointer);
    previousScore = game.score;
    scoreNode.textContent = String(game.score);
    boardMessage.hidden = false;
    pauseButton.disabled = true;
    renderText();
    game.draw(engine.renderer);
  }

  function reset(): void {
    const screen = current();
    if (!screen) return;
    stop();
    screen.run = newRun(screen.definition);
    showRun(screen.run);
  }

  function begin(): void {
    if (!current() || mode === 'playing') return;
    if (mode === 'ended') reset();
    mode = 'playing';
    boardMessage.hidden = true;
    pauseButton.disabled = false;
    last = undefined;
    accumulator = 0;
    renderText();
    void audio.start();
    frame = requestAnimationFrame(tick);
  }

  function tick(now: number): void {
    const screen = current();
    if (mode !== 'playing' || !screen) return;
    const { game, engine, scale } = screen.run;
    accumulator += Math.min(now - (last ?? now), 250) * scale;
    last = now;
    while (accumulator >= stepMs && game.status === 'playing') {
      game.step();
      accumulator -= stepMs;
    }
    if (game.score !== previousScore) {
      previousScore = game.score;
      scoreNode.textContent = String(game.score);
      audio.cue();
    }
    game.draw(engine.renderer);
    if (game.status !== 'playing') {
      stop();
      mode = 'ended';
      audio.cue(true);
      pauseButton.disabled = true;
      boardMessage.hidden = false;
      renderText();
      onRecord(screen.definition.id, game.score);
      return;
    }
    frame = requestAnimationFrame(tick);
  }

  function setAction(action: Action, pressed: boolean): void {
    if (pressed) {
      if (held.has(action)) return;
      held.add(action);
    } else if (!held.delete(action)) return;
    current()?.run.game.input(action, pressed);
  }

  start.onclick = begin;
  pauseButton.onclick = () => mode === 'playing' ? pause() : begin();
  $('#replay').onclick = () => { reset(); begin(); };
  flagButton.onclick = () => { flagMode = !flagMode; showFlagMode(); };
  fireButton.onclick = () => { if (mode === 'playing') current()?.run.game.fire?.(); };
  expandButton.onclick = () => {
    const expanded = expandButton.getAttribute('aria-pressed') !== 'true';
    expandButton.setAttribute('aria-pressed', String(expanded));
    $('.game-layout').classList.toggle('expanded', expanded);
    renderExpandButton();
  };

  const editing = 'input, textarea, select, [contenteditable]:not([contenteditable="false"])';
  window.addEventListener('keydown', event => {
    const screen = current();
    const target = event.target instanceof Element ? event.target : null;
    if (!screen || event.defaultPrevented || settingsOpen() || target?.closest(editing)) return;
    const key = event.key.toLowerCase();
    const interactive = target !== start && target?.closest('button, a');
    if (mode === 'ended' && !interactive && !event.repeat && (key === 'enter' || key === ' ')) {
      event.preventDefault();
      begin();
    } else if (mode === 'playing') {
      if (!event.repeat && (key === 'p' || key === 'escape')) {
        event.preventDefault();
        pause();
      } else if (key === ' ' && !interactive && screen.run.game.fire) {
        event.preventDefault();
        if (!event.repeat) screen.run.game.fire();
      } else {
        const action = keyActions[event.key] ?? keyActions[key];
        if (!action) return;
        event.preventDefault();
        setAction(action, true);
      }
    }
  });
  window.addEventListener('keyup', event => {
    const action = keyActions[event.key] ?? keyActions[event.key.toLowerCase()];
    if (action) setAction(action, false);
  });
  for (const button of buttons) {
    const action = button.dataset.action as Action;
    const end = () => { setAction(action, false); button.classList.remove('pressed'); };
    button.addEventListener('pointerdown', event => {
      if (mode !== 'playing') return;
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      setAction(action, true);
      button.classList.add('pressed');
    });
    button.addEventListener('pointerup', end);
    button.addEventListener('pointercancel', end);
    button.addEventListener('lostpointercapture', end);
  }
  canvas.addEventListener('contextmenu', event => { if (current()?.run.game.pointer) event.preventDefault(); });
  canvas.addEventListener('pointerdown', event => {
    if (!current()?.run.game.pointer || mode !== 'playing' || (event.button !== 0 && event.button !== 2)) return;
    event.preventDefault();
    boardPress = { id: event.pointerId, x: event.clientX, y: event.clientY, flag: event.button === 2 || flagMode };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointerup', event => {
    const press = boardPress, run = current()?.run;
    boardPress = undefined;
    if (!run || !press || press.id !== event.pointerId || mode !== 'playing' ||
      Math.hypot(event.clientX - press.x, event.clientY - press.y) > 10) return;
    const point = run.engine.pointerPosition(event.clientX, event.clientY);
    if (point) run.game.pointer?.(point.x, point.y, press.flag);
  });
  canvas.addEventListener('pointercancel', () => { boardPress = undefined; });
  window.addEventListener('blur', pause);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

  return {
    newScreen(definition: RegisteredGame, number: string): GameScreen {
      return { kind: 'game', definition, number, run: newRun(definition) };
    },
    enter(screen: GameScreen): void {
      flagMode = false;
      showFlagMode();
      showRun(screen.run);
    },
    refreshOptions(): void { if (mode === 'ready') reset(); },
    stop, pause, localize, renderAchievements,
    get playing() { return mode === 'playing'; },
  };
}
