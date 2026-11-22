import { rect, type GameRenderer } from '../renderer';
import type { Action, Game } from '../types';

export class Breakout implements Game {
  score = 0;
  status: Game['status'] = 'playing';
  private paddle = 140;
  private ballX = 160;
  private ballY = 164;
  private vx = 2.1;
  private vy = -2.7;
  private lives = 3;
  private countdown = 45;
  private left = false;
  private right = false;
  private bricks = Array.from({ length: 24 }, () => true);

  input(action: Action, pressed: boolean): void {
    if (action === 'left') this.left = pressed;
    if (action === 'right') this.right = pressed;
  }

  step(): void {
    if (this.status !== 'playing') return;
    this.paddle = Math.max(4, Math.min(276, this.paddle + (Number(this.right) - Number(this.left)) * 3.5));
    if (this.countdown > 0) {
      this.countdown--;
      this.ballX = this.paddle + 20;
      return;
    }
    this.ballX += this.vx;
    this.ballY += this.vy;
    if (this.ballX < 8) { this.ballX = 8; this.vx = Math.abs(this.vx); }
    if (this.ballX > 312) { this.ballX = 312; this.vx = -Math.abs(this.vx); }
    if (this.ballY < 9) { this.ballY = 9; this.vy = Math.abs(this.vy); }
    if (this.vy > 0 && this.ballY + 4 >= 174 && this.ballY - this.vy + 4 <= 174 && this.ballX + 4 >= this.paddle && this.ballX - 4 <= this.paddle + 40) {
      const offset = Math.max(-1, Math.min(1, (this.ballX - (this.paddle + 20)) / 20));
      this.ballY = 170;
      this.vx = offset * 2.8;
      this.vy = -Math.sqrt(3.4 * 3.4 - this.vx * this.vx);
    }
    for (let i = 0; i < this.bricks.length; i++) {
      if (!this.bricks[i]) continue;
      const x = 13 + (i % 6) * 49;
      const y = 34 + Math.floor(i / 6) * 16;
      if (this.ballX + 4 >= x && this.ballX - 4 <= x + 45 && this.ballY + 4 >= y && this.ballY - 4 <= y + 12) {
        this.bricks[i] = false;
        this.score += 10;
        const previousX = this.ballX - this.vx;
        if (previousX + 4 <= x || previousX - 4 >= x + 45) this.vx = -this.vx;
        else this.vy = -this.vy;
        if (this.score === 240) this.status = 'won';
        break;
      }
    }
    if (this.ballY - 4 > 200) {
      this.lives--;
      if (!this.lives) this.status = 'lost';
      else {
        this.paddle = 140;
        this.ballX = 160;
        this.ballY = 164;
        this.vx = 2.1;
        this.vy = -2.7;
        this.countdown = 60;
      }
    }
  }

  draw(ctx: GameRenderer): void {
    rect(ctx, '#181b39', 0, 0, 320, 200);
    rect(ctx, '#343660', 0, 0, 320, 5);
    rect(ctx, '#343660', 0, 0, 4, 200);
    rect(ctx, '#343660', 316, 0, 4, 200);
    const colors = ['#ff7882', '#f4a867', '#f5d36b', '#78dfbd'];
    this.bricks.forEach((alive, i) => {
      if (!alive) return;
      const x = 13 + (i % 6) * 49;
      const y = 34 + Math.floor(i / 6) * 16;
      rect(ctx, colors[Math.floor(i / 6)], x, y, 45, 12);
      rect(ctx, '#ffffff55', x + 2, y + 2, 41, 2);
    });
    for (let i = 0; i < this.lives; i++) rect(ctx, '#ff7882', 12 + i * 9, 12, 6, 6);
    rect(ctx, '#a4f5d0', this.paddle, 174, 40, 7);
    rect(ctx, '#ffffff', this.ballX - 4, this.ballY - 4, 8, 8);
  }
}
