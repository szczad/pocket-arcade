import { t } from '../../i18n';
import { rect, type GameRenderer } from '../renderer';
import type { Action, Game, Point } from '../types';

const TETROMINOES: { cells: Point[]; size: number; color: string }[] = [
  { cells: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }], size: 4, color: '#68d6df' },
  { cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], size: 4, color: '#f5d06b' },
  { cells: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], size: 3, color: '#bd91df' },
  { cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], size: 3, color: '#86d990' },
  { cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], size: 3, color: '#f08083' },
  { cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], size: 3, color: '#829fe7' },
  { cells: [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], size: 3, color: '#efa76e' },
];

export class Tetris implements Game {
  score = 0;
  status: Game['status'] = 'playing';
  private board: (string | null)[][] = Array.from({ length: 20 }, () => Array<string | null>(10).fill(null));
  private held = new Set<Action>();
  private bag: number[] = [];
  private kind = 0;
  private cells: Point[] = [];
  private x = 3;
  private y = 0;
  private ticks = 0;
  private horizontalTicks = 0;

  constructor() {
    this.refillBag();
    this.spawn();
  }

  private refillBag(): void {
    this.bag = TETROMINOES.map((_, i) => i);
    for (let i = this.bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
    }
  }

  private spawn(): void {
    this.kind = this.bag.pop()!;
    if (this.bag.length === 0) this.refillBag();
    this.cells = TETROMINOES[this.kind].cells.map(cell => ({ ...cell }));
    this.x = 3;
    this.y = 0;
    if (!this.fits(this.cells, this.x, this.y)) this.status = 'lost';
  }

  private fits(cells: Point[], x: number, y: number): boolean {
    return cells.every(cell => {
      const col = x + cell.x, row = y + cell.y;
      return col >= 0 && col < 10 && row < 20 && (row < 0 || !this.board[row][col]);
    });
  }

  private move(dx: number, dy: number): boolean {
    if (!this.fits(this.cells, this.x + dx, this.y + dy)) return false;
    this.x += dx;
    this.y += dy;
    return true;
  }

  private rotate(): void {
    if (this.kind === 1) return;
    const size = TETROMINOES[this.kind].size;
    const rotated = this.cells.map(cell => ({ x: size - 1 - cell.y, y: cell.x }));
    for (const kick of [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 2, y: 0 }, { x: 0, y: -1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: 0, y: -2 }]) {
      if (this.fits(rotated, this.x + kick.x, this.y + kick.y)) {
        this.cells = rotated;
        this.x += kick.x;
        this.y += kick.y;
        return;
      }
    }
  }

  input(action: Action, pressed: boolean): void {
    if (!pressed) { this.held.delete(action); return; }
    if (this.held.has(action)) return;
    this.held.add(action);
    if (this.status !== 'playing') return;
    if (action === 'up') this.rotate();
    if (action === 'left' || action === 'right') {
      this.move(action === 'left' ? -1 : 1, 0);
      this.horizontalTicks = 0;
    }
  }

  private lock(): void {
    if (this.cells.some(cell => this.y + cell.y < 0)) {
      this.status = 'lost';
      return;
    }
    for (const cell of this.cells) this.board[this.y + cell.y][this.x + cell.x] = TETROMINOES[this.kind].color;
    for (let row = 19; row >= 0; row--) {
      if (this.board[row].every(Boolean)) {
        this.board.splice(row, 1);
        this.board.unshift(Array<string | null>(10).fill(null));
        this.score += 100;
        row++;
      }
    }
    this.spawn();
  }

  step(): void {
    if (this.status !== 'playing') return;
    const left = this.held.has('left'), right = this.held.has('right');
    if (left !== right && ++this.horizontalTicks >= 12 && (this.horizontalTicks - 12) % 4 === 0) {
      this.move(left ? -1 : 1, 0);
    }
    if (++this.ticks >= (this.held.has('down') ? 3 : 30)) {
      this.ticks = 0;
      if (!this.move(0, 1)) this.lock();
    }
  }

  draw(ctx: GameRenderer): void {
    rect(ctx, '#171e34', 0, 0, 320, 200);
    rect(ctx, '#36455c', 91, 7, 96, 186);
    rect(ctx, '#86e6c4', 93, 8, 92, 184);
    rect(ctx, '#10192b', 94, 10, 90, 180);
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 10; col++) {
        rect(ctx, '#1c2940', 94 + col * 9, 10 + row * 9, 8, 8);
        const color = this.board[row][col];
        if (color) this.block(ctx, 94 + col * 9, 10 + row * 9, color);
      }
    }
    for (const cell of this.cells) {
      const row = this.y + cell.y;
      if (row >= 0) this.block(ctx, 94 + (this.x + cell.x) * 9, 10 + row * 9, TETROMINOES[this.kind].color);
    }
    ctx.text('SCORE', 208, 35, { color: '#86e6c4', font: 'bold 10px monospace', align: 'left', baseline: 'top' });
    ctx.text(String(this.score), 208, 51, { color: '#f5cf73', font: 'bold 12px monospace', align: 'left', baseline: 'top' });
    ctx.text('LINES', 208, 82, { color: '#86e6c4', font: 'bold 10px monospace', align: 'left', baseline: 'top' });
    ctx.text(String(this.score / 100), 208, 98, { color: '#f5cf73', font: 'bold 12px monospace', align: 'left', baseline: 'top' });
    ctx.text(t('NEXT'), 208, 128, { color: '#86e6c4', font: 'bold 10px monospace', align: 'left', baseline: 'top' });
    rect(ctx, '#36455c', 208, 143, 54, 36);
    rect(ctx, '#10192b', 209, 144, 52, 34);
    const next = TETROMINOES[this.bag[this.bag.length - 1]];
    for (const { x, y } of next.cells) this.block(ctx, 217 + x * 9, 152 + y * 9, next.color);
  }

  private block(ctx: GameRenderer, x: number, y: number, color: string): void {
    rect(ctx, color, x, y, 8, 8);
    rect(ctx, '#eef6db', x + 1, y + 1, 5, 1);
    rect(ctx, '#34465a', x + 1, y + 6, 6, 1);
  }
}
