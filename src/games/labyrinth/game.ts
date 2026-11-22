import { rect, type GameRenderer } from '../renderer';
import type { Action, Game } from '../types';

export class Labyrinth implements Game {
  score = 0;
  status: Game['status'] = 'playing';
  private readonly rows: number;
  private readonly columns: number;
  // Each bit represents an open passage: up, right, down, left.
  private readonly passages: number[];
  private readonly held: Action[] = [];
  private x = 0;
  private y = 0;
  private moves = 0;
  private repeatTicks = 0;

  constructor(size: number) {
    this.rows = Number.isFinite(size) ? Math.max(5, Math.min(50, Math.floor(size))) : 10;
    this.columns = Math.round(this.rows * 1.6);
    this.passages = Array(this.rows * this.columns).fill(0);
    const visited = new Uint8Array(this.passages.length);
    const stack = [0];
    visited[0] = 1;
    const directions = [
      { dx: 0, dy: -1, bit: 1, opposite: 4 },
      { dx: 1, dy: 0, bit: 2, opposite: 8 },
      { dx: 0, dy: 1, bit: 4, opposite: 1 },
      { dx: -1, dy: 0, bit: 8, opposite: 2 },
    ];
    while (stack.length) {
      const current = stack[stack.length - 1];
      const x = current % this.columns;
      const y = Math.floor(current / this.columns);
      const choices = directions.filter(({ dx, dy }) => {
        const nx = x + dx, ny = y + dy;
        return nx >= 0 && nx < this.columns && ny >= 0 && ny < this.rows && !visited[ny * this.columns + nx];
      });
      if (!choices.length) { stack.pop(); continue; }
      const direction = choices[Math.floor(Math.random() * choices.length)];
      const next = (y + direction.dy) * this.columns + x + direction.dx;
      this.passages[current] |= direction.bit;
      this.passages[next] |= direction.opposite;
      visited[next] = 1;
      stack.push(next);
    }
  }

  input(action: Action, pressed: boolean): void {
    const index = this.held.indexOf(action);
    if (!pressed) {
      if (index !== -1) this.held.splice(index, 1);
      return;
    }
    if (index !== -1 || this.status !== 'playing') return;
    this.held.push(action);
    this.move(action);
    this.repeatTicks = 8;
  }

  private move(action: Action): void {
    const direction = {
      up: { dx: 0, dy: -1, bit: 1 },
      right: { dx: 1, dy: 0, bit: 2 },
      down: { dx: 0, dy: 1, bit: 4 },
      left: { dx: -1, dy: 0, bit: 8 },
    }[action];
    if (!(this.passages[this.y * this.columns + this.x] & direction.bit)) return;
    this.x += direction.dx;
    this.y += direction.dy;
    this.moves++;
    if (this.x === this.columns - 1 && this.y === this.rows - 1) {
      this.score = Math.max(1, 1000 - this.moves);
      this.status = 'won';
    }
  }

  step(): void {
    if (this.status !== 'playing' || !this.held.length) return;
    if (--this.repeatTicks <= 0) {
      this.move(this.held[this.held.length - 1]);
      this.repeatTicks = 8;
    }
  }

  draw(ctx: GameRenderer): void {
    rect(ctx, '#18142e', 0, 0, 320, 200);
    const cell = Math.min(312 / this.columns, 192 / this.rows);
    const leftEdge = (n: number) => Math.round((320 - this.columns * cell) / 2 + n * cell);
    const topEdge = (n: number) => Math.round((200 - this.rows * cell) / 2 + n * cell);
    const wall = this.rows <= 20 ? 2 : 1;
    for (let y = 0; y < this.rows; y++) for (let x = 0; x < this.columns; x++) {
      const left = leftEdge(x), top = topEdge(y), right = leftEdge(x + 1), bottom = topEdge(y + 1);
      rect(ctx, (x + y) % 2 ? '#302947' : '#382e4d', left, top, right - left, bottom - top);
      const passages = this.passages[y * this.columns + x];
      if (!(passages & 1)) ctx.rectangle('#a96e82', left, top, right - left + wall, wall);
      if (!(passages & 8)) ctx.rectangle('#a96e82', left, top, wall, bottom - top + wall);
      if (x === this.columns - 1) ctx.rectangle('#a96e82', right, top, wall, bottom - top + wall);
      if (y === this.rows - 1) ctx.rectangle('#a96e82', left, bottom, right - left + wall, wall);
      if (this.rows <= 20 && !(passages & 1)) {
        rect(ctx, '#e5a292', left + wall, top, Math.max(1, Math.floor((right - left) / 3)), 1);
      }
    }
    const sprite = (x: number, y: number, pixels: string[], colors: Record<string, string>) => {
      const left = leftEdge(x) + wall, top = topEdge(y) + wall;
      const width = leftEdge(x + 1) - left, height = topEdge(y + 1) - top;
      for (let row = 0; row < pixels.length; row++) for (let col = 0; col < pixels[row].length; col++) {
        const color = colors[pixels[row][col]];
        if (!color) continue;
        const x1 = Math.round(left + col * width / 5), x2 = Math.round(left + (col + 1) * width / 5);
        const y1 = Math.round(top + row * height / 5), y2 = Math.round(top + (row + 1) * height / 5);
        if (x2 > x1 && y2 > y1) rect(ctx, color, x1, y1, x2 - x1, y2 - y1);
      }
    };
    sprite(this.columns - 1, this.rows - 1, ['.ggg.', 'gyyyg', 'gy.yg', 'gyyyg', '.ggg.'], { g: '#b98054', y: '#ffe18b' });
    sprite(this.x, this.y, ['.mmm.', 'mmmmm', 'me.em', 'mmmmm', '.m.m.'], { m: '#a9edb9', e: '#243f39' });
  }
}
