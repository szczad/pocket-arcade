import { rect, type GameRenderer } from '../renderer';
import type { Action, Game } from '../types';

export class LaneDodger implements Game {
  score = 0;
  status: Game['status'] = 'playing';
  private lane = 1;
  private held = new Set<Action>();
  private vehicles: { lane: number; y: number }[] = [];
  private spawnTicks = 0;
  private distance = 0;

  input(action: Action, pressed: boolean): void {
    if (!pressed) { this.held.delete(action); return; }
    if (this.held.has(action)) return;
    this.held.add(action);
    if (this.status !== 'playing') return;
    if (action === 'left') this.lane = Math.max(0, this.lane - 1);
    if (action === 'right') this.lane = Math.min(2, this.lane + 1);
  }

  step(): void {
    if (this.status !== 'playing') return;
    if (this.spawnTicks-- <= 0) {
      this.vehicles.push({ lane: Math.floor(Math.random() * 3), y: -30 });
      this.spawnTicks = 59;
    }
    const speed = Math.min(2, 1 + Math.floor(this.score / 5) * 0.1) * 2;
    this.distance += speed;
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      const vehicle = this.vehicles[i];
      vehicle.y += speed;
      if (vehicle.lane === this.lane && vehicle.y + 32 > 150 && vehicle.y < 182) {
        this.status = 'lost';
        return;
      }
      if (vehicle.y > 200) {
        this.vehicles.splice(i, 1);
        this.score++;
      }
    }
  }

  draw(ctx: GameRenderer): void {
    rect(ctx, '#203844', 0, 0, 320, 200);
    rect(ctx, '#343a54', 70, 0, 180, 200);
    rect(ctx, '#f5cf73', 72, 0, 4, 200);
    rect(ctx, '#f5cf73', 244, 0, 4, 200);
    for (const x of [130, 190]) for (let y = -30 + this.distance % 40; y < 200; y += 40) rect(ctx, '#aab7b9', x - 2, y, 4, 20);
    for (const vehicle of this.vehicles) this.car(ctx, vehicle.lane, vehicle.y, '#ff7d80', '#833f58');
    this.car(ctx, this.lane, 150, '#86e6c4', '#398f86');
  }

  private car(ctx: GameRenderer, lane: number, y: number, color: string, shade: string): void {
    const x = 87 + lane * 60;
    rect(ctx, '#151d31', x - 3, y + 5, 32, 6);
    rect(ctx, '#151d31', x - 3, y + 21, 32, 6);
    rect(ctx, color, x, y, 26, 32);
    rect(ctx, shade, x + 4, y + 7, 18, 9);
    rect(ctx, '#f8e4a2', x + 3, y + 1, 5, 3);
    rect(ctx, '#f8e4a2', x + 18, y + 1, 5, 3);
  }
}
