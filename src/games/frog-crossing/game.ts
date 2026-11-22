import { rect, type GameRenderer } from '../renderer';
import type { Action, Game } from '../types';

export class FrogCrossing implements Game {
  score = 0;
  status: Game['status'] = 'playing';
  private readonly lanes: number;
  private readonly traffic: { x: number; speed: number; color: string; period: number; length: number; obstacle: 'none' | 'sewer' | 'stopped'; obstacleX: number }[];
  private readonly held = new Set<Action>();
  private x = 160;
  private readonly logs = [{ x: 15, speed: 0.45 }, { x: 70, speed: -0.55 }];
  private row: number;
  private furthest = 0;

  constructor(lanes: number) {
    this.lanes = Number.isFinite(lanes) ? Math.max(1, Math.min(15, Math.floor(lanes))) : 5;
    this.row = this.lanes + 3;
    this.traffic = Array.from({ length: this.lanes }, (_, i) => {
      const tier = Math.floor((this.lanes - 1 - i) * 4 / this.lanes);
      return {
        x: Math.random() * 120,
        speed: (i % 2 === 0 ? 1 : -1) * (0.65 + (i % 3) * 0.2),
        color: ['#ff827d', '#f5cc6d', '#8dbfe7'][i % 3],
        period: tier === 0 ? 240 : 120,
        length: tier >= 2 ? 60 : 40,
        obstacle: tier === 2 ? 'sewer' as const : tier >= 3 ? 'stopped' as const : 'none' as const,
        obstacleX: i % 2 ? 40 : 160,
      };
    });
  }

  input(action: Action, pressed: boolean): void {
    if (!pressed) { this.held.delete(action); return; }
    if (this.held.has(action)) return;
    this.held.add(action);
    if (this.status !== 'playing') return;
    if (action === 'left') this.x = Math.max(8, this.x - 16);
    if (action === 'right') this.x = Math.min(312, this.x + 16);
    if (action === 'up') this.row = Math.max(0, this.row - 1);
    if (action === 'down') this.row = Math.min(this.lanes + 3, this.row + 1);
    const progress = this.lanes + 3 - this.row;
    if (progress > this.furthest) {
      this.score += (progress - this.furthest) * 10;
      this.furthest = progress;
    }
    if (this.row === 0) {
      this.score += 100;
      this.status = 'won';
    } else {
      this.checkCollision();
    }
  }

  private checkCollision(): void {
    if (this.row > this.lanes + 2 || this.row === 0) return;
    if (this.row <= 2) {
      const log = this.logs[this.row - 1];
      const offset = ((this.x - log.x) % 120 + 120) % 120;
      if (offset >= 72) this.status = 'lost';
      return;
    }
    const lane = this.traffic[this.row - 3];
    const offset = ((this.x - lane.x) % lane.period + lane.period) % lane.period;
    const obstacleWidth = lane.obstacle === 'sewer' ? 28 : 40;
    if (offset < lane.length || offset > lane.period - 6 ||
      (lane.obstacle !== 'none' && this.x > lane.obstacleX - 6 && this.x < lane.obstacleX + obstacleWidth + 6)) this.status = 'lost';
  }

  step(): void {
    if (this.status !== 'playing') return;
    for (const lane of this.traffic) lane.x = (lane.x + lane.speed + lane.period) % lane.period;
    for (const log of this.logs) log.x = (log.x + log.speed + 120) % 120;
    if (this.row > 0 && this.row <= 2) {
      this.x += this.logs[this.row - 1].speed;
      if (this.x < 0 || this.x > 320) { this.status = 'lost'; return; }
    }
    this.checkCollision();
  }

  draw(ctx: GameRenderer): void {
    const height = 200 / (this.lanes + 4);
    rect(ctx, '#343a54', 0, 0, 320, 200);
    rect(ctx, '#477b55', 0, 0, 320, Math.ceil(height));
    rect(ctx, '#326b91', 0, height, 320, Math.ceil(height * 2));
    for (let row = 0; row < 2; row++) {
      const top = height * (row + 1);
      for (let x = 8; x < 320; x += 40) rect(ctx, '#8bd5d0', x, top + height * .72, 18, Math.max(1, height * .1));
      for (let x = this.logs[row].x - 120; x < 320; x += 120) {
        rect(ctx, '#67452f', x, top + height * .16, 72, Math.max(2, height * .7));
        rect(ctx, '#bb8854', x + 3, top + height * .25, 66, Math.max(1, height * .18));
        rect(ctx, '#e0b47a', x + 8, top + height * .48, 30, Math.max(1, height * .08));
      }
    }
    rect(ctx, '#477b55', 0, height * (this.lanes + 3), 320, Math.ceil(height));
    for (let x = 4; x < 320; x += 24) {
      rect(ctx, '#78b76b', x, height * (this.lanes + 3) + height * 0.25, 7, Math.max(1, height * 0.12));
    }
    for (let i = 0; i < this.lanes; i++) {
      const top = height * (i + 3);
      if (i > 0) for (let x = 0; x < 320; x += 24) rect(ctx, '#a4a5a2', x, top, 12, 1);
      const lane = this.traffic[i];
      if (lane.obstacle === 'sewer') {
        rect(ctx, '#eebd67', lane.obstacleX, top + height * .12, 28, Math.max(2, height * .76));
        rect(ctx, '#24283b', lane.obstacleX + 4, top + height * .25, 20, Math.max(2, height * .5));
        rect(ctx, '#eebd67', lane.obstacleX + 8, top + height * .3, 3, Math.max(1, height * .4));
        rect(ctx, '#eebd67', lane.obstacleX + 17, top + height * .3, 3, Math.max(1, height * .4));
      } else if (lane.obstacle === 'stopped') {
        rect(ctx, '#d38b67', lane.obstacleX, top + height * .2, 40, Math.max(2, height * .6));
        rect(ctx, '#d8e4cf', lane.obstacleX + 11, top + height * .3, 15, Math.max(1, height * .4));
      }
      for (let x = lane.x - lane.period; x < 320; x += lane.period) {
        const y = top + height * 0.15;
        const h = height * 0.7;
        rect(ctx, '#1c2335', x + 4, y, lane.length - 8, Math.max(2, h));
        rect(ctx, lane.color, x, y + h * 0.15, lane.length, Math.max(2, h * 0.7));
        rect(ctx, '#b7e0df', x + 11, y + h * 0.25, lane.length - 25, Math.max(1, h * 0.5));
        rect(ctx, '#ffe6a0', x + (lane.speed > 0 ? lane.length - 4 : 1), y + h * 0.3, 3, Math.max(1, h * 0.35));
      }
    }
    const size = Math.min(16, height * 0.8);
    const left = this.x - size / 2, top = (this.row + 0.5) * height - size / 2;
    rect(ctx, '#347d53', left, top + size * 0.25, size, size * 0.6);
    rect(ctx, '#9be783', left + size * 0.15, top + size * 0.15, size * 0.7, size * 0.7);
    rect(ctx, '#b8f59c', left + size * 0.05, top, size * 0.3, size * 0.3);
    rect(ctx, '#b8f59c', left + size * 0.65, top, size * 0.3, size * 0.3);
    rect(ctx, '#203b35', left + size * 0.15, top + size * 0.08, Math.max(1, size * 0.1), Math.max(1, size * 0.1));
    rect(ctx, '#203b35', left + size * 0.75, top + size * 0.08, Math.max(1, size * 0.1), Math.max(1, size * 0.1));
  }
}
