import { rect, type GameRenderer } from '../renderer';
import type { Action, Game } from '../types';

export class Minesweeper implements Game {
  score = 0;
  status: Game['status'] = 'playing';
  private readonly mines = new Uint8Array(160);
  private readonly revealed = new Uint8Array(160);
  private readonly flags = new Uint8Array(160);
  private started = false;
  private exploded = -1;

  input(_action: Action, _pressed: boolean): void {}
  step(): void {}

  pointer(x: number, y: number, flag: boolean): void {
    if (this.status !== 'playing' || !Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x >= 320 || y >= 200) return;
    const index = Math.floor(y / 20) * 16 + Math.floor(x / 20);
    if (this.revealed[index]) return;
    if (flag) {
      this.flags[index] ^= 1;
      return;
    }
    if (this.flags[index]) return;
    if (!this.started) {
      this.started = true;
      const candidates = Array.from({ length: 160 }, (_, i) => i).filter(i => i !== index);
      for (let i = 0; i < 24; i++) {
        const pick = i + Math.floor(Math.random() * (candidates.length - i));
        [candidates[i], candidates[pick]] = [candidates[pick], candidates[i]];
        this.mines[candidates[i]] = 1;
      }
    }
    if (this.mines[index]) {
      this.exploded = index;
      this.status = 'lost';
      return;
    }
    const pending = [index];
    while (pending.length) {
      const cell = pending.pop()!;
      if (this.revealed[cell] || this.flags[cell] || this.mines[cell]) continue;
      this.revealed[cell] = 1;
      this.score++;
      if (this.neighborCount(cell) === 0) {
        this.forNeighbors(cell, neighbor => {
          if (!this.revealed[neighbor] && !this.flags[neighbor]) pending.push(neighbor);
        });
      }
    }
    if (this.score === 136) this.status = 'won';
  }

  private forNeighbors(index: number, visit: (neighbor: number) => void): void {
    const x = index % 16, y = Math.floor(index / 16);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if ((!dx && !dy) || x + dx < 0 || x + dx >= 16 || y + dy < 0 || y + dy >= 10) continue;
      visit((y + dy) * 16 + x + dx);
    }
  }

  private neighborCount(index: number): number {
    let count = 0;
    this.forNeighbors(index, neighbor => { count += this.mines[neighbor]; });
    return count;
  }

  draw(ctx: GameRenderer): void {
    const colors = ['', '#75c9f0', '#86e6a7', '#ff8f83', '#c6a7f3', '#ffd47c', '#70ded1', '#f2a8c9', '#f5e9d2'];
    rect(ctx, '#18142e', 0, 0, 320, 200);
    for (let i = 0; i < 160; i++) {
      const x = (i % 16) * 20, y = Math.floor(i / 16) * 20;
      const showMine = this.status === 'lost' && this.mines[i];
      if (this.revealed[i] || showMine) {
        rect(ctx, i === this.exploded ? '#a74855' : '#302947', x + 1, y + 1, 18, 18);
        if (showMine) {
          rect(ctx, '#171629', x + 6, y + 6, 8, 8);
          rect(ctx, '#171629', x + 8, y + 3, 4, 14);
          rect(ctx, '#171629', x + 3, y + 8, 14, 4);
          rect(ctx, '#f5cf73', x + 7, y + 7, 3, 3);
        } else {
          const count = this.neighborCount(i);
          if (count) {
            ctx.text(String(count), x + 10, y + 10, {
              color: colors[count], font: 'bold 14px monospace', align: 'center', baseline: 'middle',
            });
          }
        }
      } else {
        rect(ctx, '#655779', x + 1, y + 1, 18, 18);
        rect(ctx, '#a898ae', x + 2, y + 2, 16, 2);
        rect(ctx, '#a898ae', x + 2, y + 2, 2, 16);
        rect(ctx, '#3a304d', x + 3, y + 17, 15, 2);
        rect(ctx, '#3a304d', x + 17, y + 3, 2, 15);
        if (this.flags[i]) {
          rect(ctx, '#f5e9d2', x + 8, y + 4, 2, 11);
          rect(ctx, '#ff8883', x + 10, y + 4, 6, 3);
          rect(ctx, '#ff8883', x + 10, y + 7, 4, 3);
          rect(ctx, '#f5e9d2', x + 5, y + 15, 9, 2);
        }
      }
    }
  }
}
