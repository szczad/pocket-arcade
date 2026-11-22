import { t } from '../i18n';
import type { GameRenderer } from './renderer';

export type GameId = 'snake' | 'breakout' | 'lane-dodger' | 'labyrinth' | 'frog-crossing' | 'tetris' | 'pac-man' | 'asteroids' | 'minesweeper' | 'scorched-earth';
export type Action = 'up' | 'down' | 'left' | 'right';
export type SnakeSpeed = 'slow' | 'medium' | 'fast';
export interface Game {
  input(action: Action, pressed: boolean): void;
  pointer?(x: number, y: number, flag: boolean): void;
  fire?(): void;
  step(): void;
  draw(ctx: GameRenderer): void;
  score: number;
  status: 'playing' | 'won' | 'lost';
}

type Point = { x: number; y: number };
const rect = (ctx: GameRenderer, color: string, x: number, y: number, w: number, h: number) => {
  ctx.rectangle(color, Math.round(x), Math.round(y), w, h);
};

class Snake implements Game {
  score = 0;
  status: Game['status'] = 'playing';
  private body: Point[] = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
  private direction: Point = { x: 1, y: 0 };
  private next: Point | null = null;
  private fruit: Point = this.spawnFruit()!;
  private ticks = 0;

  constructor(private readonly moveInterval: number) {}

  private spawnFruit(): Point | null {
    const free: Point[] = [];
    for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) {
      if (!this.body.some(part => part.x === x && part.y === y)) free.push({ x, y });
    }
    return free.length ? free[Math.floor(Math.random() * free.length)] : null;
  }

  input(action: Action, pressed: boolean): void {
    if (!pressed || this.next || this.status !== 'playing') return;
    const directions: Record<Action, Point> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
    const next = directions[action];
    if (next.x === -this.direction.x && next.y === -this.direction.y) return;
    if (next.x === this.direction.x && next.y === this.direction.y) return;
    this.next = next;
  }

  step(): void {
    if (this.status !== 'playing' || ++this.ticks < this.moveInterval) return;
    this.ticks = 0;
    if (this.next) this.direction = this.next;
    this.next = null;
    const head = { x: this.body[0].x + this.direction.x, y: this.body[0].y + this.direction.y };
    const eating = head.x === this.fruit.x && head.y === this.fruit.y;
    if (head.x < 0 || head.x >= 20 || head.y < 0 || head.y >= 20 || this.body.slice(0, eating ? undefined : -1).some(part => part.x === head.x && part.y === head.y)) {
      this.status = 'lost';
      return;
    }
    this.body.unshift(head);
    if (!eating) this.body.pop();
    else {
      this.score += 10;
      const fruit = this.spawnFruit();
      if (fruit) this.fruit = fruit;
      else this.status = 'won';
    }
  }

  draw(ctx: GameRenderer): void {
    rect(ctx, '#172c37', 0, 0, 240, 240);
    for (let y = 0; y < 20; y++) for (let x = 0; x < 20; x++) {
      if ((x + y) % 2 === 0) rect(ctx, '#1c3540', x * 12, y * 12, 12, 12);
    }
    rect(ctx, '#ff6f75', this.fruit.x * 12 + 2, this.fruit.y * 12 + 4, 8, 7);
    rect(ctx, '#f5c763', this.fruit.x * 12 + 6, this.fruit.y * 12 + 2, 3, 2);
    this.body.forEach((part, i) => {
      rect(ctx, i === 0 ? '#a3f4c3' : '#59cba2', part.x * 12 + 1, part.y * 12 + 1, 10, 10);
      if (i === 0) rect(ctx, '#173641', part.x * 12 + 4 + this.direction.x * 2, part.y * 12 + 4 + this.direction.y * 2, 3, 3);
    });
  }
}

class Breakout implements Game {
  score = 0;
  status: Game['status'] = 'playing';
  private paddle = 100;
  private ballX = 120;
  private ballY = 204;
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
    this.paddle = Math.max(4, Math.min(196, this.paddle + (Number(this.right) - Number(this.left)) * 3.5));
    if (this.countdown > 0) {
      this.countdown--;
      this.ballX = this.paddle + 20;
      return;
    }
    this.ballX += this.vx;
    this.ballY += this.vy;
    if (this.ballX < 8) { this.ballX = 8; this.vx = Math.abs(this.vx); }
    if (this.ballX > 232) { this.ballX = 232; this.vx = -Math.abs(this.vx); }
    if (this.ballY < 9) { this.ballY = 9; this.vy = Math.abs(this.vy); }
    if (this.vy > 0 && this.ballY + 4 >= 214 && this.ballY - this.vy + 4 <= 214 && this.ballX + 4 >= this.paddle && this.ballX - 4 <= this.paddle + 40) {
      const offset = Math.max(-1, Math.min(1, (this.ballX - (this.paddle + 20)) / 20));
      this.ballY = 210;
      this.vx = offset * 2.8;
      this.vy = -Math.sqrt(3.4 * 3.4 - this.vx * this.vx);
    }
    for (let i = 0; i < this.bricks.length; i++) {
      if (!this.bricks[i]) continue;
      const x = 12 + (i % 6) * 36;
      const y = 34 + Math.floor(i / 6) * 16;
      if (this.ballX + 4 >= x && this.ballX - 4 <= x + 32 && this.ballY + 4 >= y && this.ballY - 4 <= y + 12) {
        this.bricks[i] = false;
        this.score += 10;
        const previousX = this.ballX - this.vx;
        if (previousX + 4 <= x || previousX - 4 >= x + 32) this.vx = -this.vx;
        else this.vy = -this.vy;
        if (this.score === 240) this.status = 'won';
        break;
      }
    }
    if (this.ballY - 4 > 240) {
      this.lives--;
      if (!this.lives) this.status = 'lost';
      else {
        this.paddle = 100;
        this.ballX = 120;
        this.ballY = 204;
        this.vx = 2.1;
        this.vy = -2.7;
        this.countdown = 60;
      }
    }
  }

  draw(ctx: GameRenderer): void {
    rect(ctx, '#181b39', 0, 0, 240, 240);
    rect(ctx, '#343660', 0, 0, 240, 5);
    rect(ctx, '#343660', 0, 0, 4, 240);
    rect(ctx, '#343660', 236, 0, 4, 240);
    const colors = ['#ff7882', '#f4a867', '#f5d36b', '#78dfbd'];
    this.bricks.forEach((alive, i) => {
      if (!alive) return;
      const x = 12 + (i % 6) * 36;
      const y = 34 + Math.floor(i / 6) * 16;
      rect(ctx, colors[Math.floor(i / 6)], x, y, 32, 12);
      rect(ctx, '#ffffff55', x + 2, y + 2, 28, 2);
    });
    for (let i = 0; i < this.lives; i++) rect(ctx, '#ff7882', 12 + i * 9, 12, 6, 6);
    rect(ctx, '#a4f5d0', this.paddle, 214, 40, 7);
    rect(ctx, '#ffffff', this.ballX - 4, this.ballY - 4, 8, 8);
  }
}

class LaneDodger implements Game {
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
      if (vehicle.lane === this.lane && vehicle.y + 26 > 190 && vehicle.y < 222) {
        this.status = 'lost';
        return;
      }
      if (vehicle.y > 240) {
        this.vehicles.splice(i, 1);
        this.score++;
      }
    }
  }

  draw(ctx: GameRenderer): void {
    rect(ctx, '#203844', 0, 0, 240, 240);
    rect(ctx, '#343a54', 30, 0, 180, 240);
    rect(ctx, '#f5cf73', 32, 0, 4, 240);
    rect(ctx, '#f5cf73', 204, 0, 4, 240);
    for (const x of [90, 150]) for (let y = -30 + this.distance % 40; y < 240; y += 40) rect(ctx, '#aab7b9', x - 2, y, 4, 20);
    for (const vehicle of this.vehicles) this.car(ctx, vehicle.lane, vehicle.y, '#ff7d80', '#833f58');
    this.car(ctx, this.lane, 190, '#86e6c4', '#398f86');
  }

  private car(ctx: GameRenderer, lane: number, y: number, color: string, shade: string): void {
    const x = 47 + lane * 60;
    rect(ctx, '#151d31', x - 3, y + 5, 32, 6);
    rect(ctx, '#151d31', x - 3, y + 21, 32, 6);
    rect(ctx, color, x, y, 26, 32);
    rect(ctx, shade, x + 4, y + 7, 18, 9);
    rect(ctx, '#f8e4a2', x + 3, y + 1, 5, 3);
    rect(ctx, '#f8e4a2', x + 18, y + 1, 5, 3);
  }
}

class Labyrinth implements Game {
  score = 0;
  status: Game['status'] = 'playing';
  private readonly size: number;
  // Each bit represents an open passage: up, right, down, left.
  private readonly passages: number[];
  private readonly held: Action[] = [];
  private x = 0;
  private y = 0;
  private moves = 0;
  private repeatTicks = 0;

  constructor(size: number) {
    this.size = Number.isFinite(size) ? Math.max(5, Math.min(50, Math.floor(size))) : 10;
    this.passages = Array(this.size * this.size).fill(0);
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
      const x = current % this.size;
      const y = Math.floor(current / this.size);
      const choices = directions.filter(({ dx, dy }) => {
        const nx = x + dx, ny = y + dy;
        return nx >= 0 && nx < this.size && ny >= 0 && ny < this.size && !visited[ny * this.size + nx];
      });
      if (!choices.length) { stack.pop(); continue; }
      const direction = choices[Math.floor(Math.random() * choices.length)];
      const next = (y + direction.dy) * this.size + x + direction.dx;
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
    if (!(this.passages[this.y * this.size + this.x] & direction.bit)) return;
    this.x += direction.dx;
    this.y += direction.dy;
    this.moves++;
    if (this.x === this.size - 1 && this.y === this.size - 1) {
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
    rect(ctx, '#18142e', 0, 0, 240, 240);
    const cell = 232 / this.size;
    const edge = (n: number) => Math.round(4 + n * cell);
    const wall = this.size <= 20 ? 3 : 1;
    for (let y = 0; y < this.size; y++) for (let x = 0; x < this.size; x++) {
      const left = edge(x), top = edge(y), right = edge(x + 1), bottom = edge(y + 1);
      rect(ctx, (x + y) % 2 ? '#302947' : '#382e4d', left, top, right - left, bottom - top);
      const passages = this.passages[y * this.size + x];
      if (!(passages & 1)) ctx.rectangle('#a96e82', left, top, right - left + wall, wall);
      if (!(passages & 8)) ctx.rectangle('#a96e82', left, top, wall, bottom - top + wall);
      if (x === this.size - 1) ctx.rectangle('#a96e82', right, top, wall, bottom - top + wall);
      if (y === this.size - 1) ctx.rectangle('#a96e82', left, bottom, right - left + wall, wall);
      if (this.size <= 20 && !(passages & 1)) {
        rect(ctx, '#e5a292', left + wall, top, Math.max(1, Math.floor((right - left) / 3)), 1);
      }
    }
    const sprite = (x: number, y: number, pixels: string[], colors: Record<string, string>) => {
      const left = edge(x) + wall, top = edge(y) + wall;
      const width = edge(x + 1) - left, height = edge(y + 1) - top;
      for (let row = 0; row < pixels.length; row++) for (let col = 0; col < pixels[row].length; col++) {
        const color = colors[pixels[row][col]];
        if (!color) continue;
        const x1 = Math.round(left + col * width / 5), x2 = Math.round(left + (col + 1) * width / 5);
        const y1 = Math.round(top + row * height / 5), y2 = Math.round(top + (row + 1) * height / 5);
        if (x2 > x1 && y2 > y1) rect(ctx, color, x1, y1, x2 - x1, y2 - y1);
      }
    };
    sprite(this.size - 1, this.size - 1, ['.ggg.', 'gyyyg', 'gy.yg', 'gyyyg', '.ggg.'], { g: '#b98054', y: '#ffe18b' });
    sprite(this.x, this.y, ['.mmm.', 'mmmmm', 'me.em', 'mmmmm', '.m.m.'], { m: '#a9edb9', e: '#243f39' });
  }
}

class FrogCrossing implements Game {
  score = 0;
  status: Game['status'] = 'playing';
  private readonly lanes: number;
  private readonly traffic: { x: number; speed: number; color: string; period: number; length: number; obstacle: 'none' | 'sewer' | 'stopped'; obstacleX: number }[];
  private readonly held = new Set<Action>();
  private x = 120;
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
    if (action === 'right') this.x = Math.min(232, this.x + 16);
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
      if (this.x < 0 || this.x > 240) { this.status = 'lost'; return; }
    }
    this.checkCollision();
  }

  draw(ctx: GameRenderer): void {
    const height = 240 / (this.lanes + 4);
    rect(ctx, '#343a54', 0, 0, 240, 240);
    rect(ctx, '#477b55', 0, 0, 240, Math.ceil(height));
    rect(ctx, '#326b91', 0, height, 240, Math.ceil(height * 2));
    for (let row = 0; row < 2; row++) {
      const top = height * (row + 1);
      for (let x = 8; x < 240; x += 40) rect(ctx, '#8bd5d0', x, top + height * .72, 18, Math.max(1, height * .1));
      for (let x = this.logs[row].x - 120; x < 240; x += 120) {
        rect(ctx, '#67452f', x, top + height * .16, 72, Math.max(2, height * .7));
        rect(ctx, '#bb8854', x + 3, top + height * .25, 66, Math.max(1, height * .18));
        rect(ctx, '#e0b47a', x + 8, top + height * .48, 30, Math.max(1, height * .08));
      }
    }
    rect(ctx, '#477b55', 0, height * (this.lanes + 3), 240, Math.ceil(height));
    for (let x = 4; x < 240; x += 24) {
      rect(ctx, '#78b76b', x, height * (this.lanes + 3) + height * 0.25, 7, Math.max(1, height * 0.12));
    }
    for (let i = 0; i < this.lanes; i++) {
      const top = height * (i + 3);
      if (i > 0) for (let x = 0; x < 240; x += 24) rect(ctx, '#a4a5a2', x, top, 12, 1);
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
      for (let x = lane.x - lane.period; x < 240; x += lane.period) {
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

const TETROMINOES: { cells: Point[]; size: number; color: string }[] = [
  { cells: [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }], size: 4, color: '#68d6df' },
  { cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], size: 4, color: '#f5d06b' },
  { cells: [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], size: 3, color: '#bd91df' },
  { cells: [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }], size: 3, color: '#86d990' },
  { cells: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }], size: 3, color: '#f08083' },
  { cells: [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], size: 3, color: '#829fe7' },
  { cells: [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }], size: 3, color: '#efa76e' },
];

class Tetris implements Game {
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

  constructor() { this.spawn(); }

  private spawn(): void {
    if (this.bag.length === 0) {
      this.bag = TETROMINOES.map((_, i) => i);
      for (let i = this.bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.bag[i], this.bag[j]] = [this.bag[j], this.bag[i]];
      }
    }
    this.kind = this.bag.pop()!;
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
    rect(ctx, '#171e34', 0, 0, 240, 240);
    // A lit cabinet surrounds the ten-column well.
    rect(ctx, '#36455c', 62, 6, 116, 228);
    rect(ctx, '#86e6c4', 64, 8, 112, 224);
    rect(ctx, '#10192b', 65, 9, 110, 220);
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 10; col++) {
        rect(ctx, '#1c2940', 65 + col * 11, 9 + row * 11, 10, 10);
        const color = this.board[row][col];
        if (color) this.block(ctx, col, row, color);
      }
    }
    for (const cell of this.cells) {
      if (this.y + cell.y >= 0) this.block(ctx, this.x + cell.x, this.y + cell.y, TETROMINOES[this.kind].color);
    }
    for (let y = 22; y < 220; y += 24) {
      rect(ctx, '#4b6275', 51, y, 5, 5);
      rect(ctx, '#4b6275', 184, y, 5, 5);
    }
    rect(ctx, '#f5cf73', 20, 196, 22, 4);
    rect(ctx, '#f08083', 198, 196, 22, 4);
  }

  private block(ctx: GameRenderer, col: number, row: number, color: string): void {
    const x = 65 + col * 11, y = 9 + row * 11;
    rect(ctx, color, x, y, 10, 10);
    rect(ctx, '#eef6db', x + 1, y + 1, 7, 1);
    rect(ctx, '#34465a', x + 1, y + 8, 8, 1);
  }
}

type PacGhost = {
  position: Point;
  home: Point;
  direction: Action;
  color: string;
  respawn: number;
};

const PAC_DIRECTIONS: Record<Action, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const PAC_ACTIONS: Action[] = ['up', 'left', 'down', 'right'];
const PAC_OPPOSITE: Record<Action, Action> = {
  up: 'down', down: 'up', left: 'right', right: 'left',
};

class PacMan implements Game {
  score = 0;
  status: Game['status'] = 'playing';
  private readonly size = 15;
  // Every odd row connects to its neighbors through multiple vertical corridors.
  private readonly pellets = Array.from({ length: this.size }, (_, y) =>
    Array.from({ length: this.size }, (_, x) => {
      if (this.wall(x, y) || (x === 7 && y === 11)) return 0;
      return (x === 1 || x === 13) && (y === 1 || y === 13) ? 2 : 1;
    }),
  );
  private remaining = this.pellets.reduce((total, row) => total + row.filter(Boolean).length, 0);
  private player: Point = { x: 7, y: 11 };
  private direction: Action = 'left';
  private requested: Action = 'left';
  private ticks = 0;
  private power = 0;
  private ghosts: PacGhost[] = [
    { position: { x: 7, y: 7 }, home: { x: 7, y: 7 }, direction: 'left', color: '#ff6078', respawn: 0 },
    { position: { x: 5, y: 7 }, home: { x: 5, y: 7 }, direction: 'up', color: '#ff9bd1', respawn: 0 },
    { position: { x: 9, y: 7 }, home: { x: 9, y: 7 }, direction: 'down', color: '#69dfe9', respawn: 0 },
  ];

  private wall(x: number, y: number): boolean {
    return x <= 0 || y <= 0 || x >= this.size - 1 || y >= this.size - 1
      || (x % 2 === 0 && y % 2 === 0)
      || ((y === 4 || y === 10) && (x === 3 || x === 7 || x === 11));
  }

  private next(position: Point, direction: Action): Point {
    const delta = PAC_DIRECTIONS[direction];
    return { x: position.x + delta.x, y: position.y + delta.y };
  }

  input(action: Action, pressed: boolean): void {
    if (pressed) this.requested = action;
  }

  private collide(): void {
    for (const ghost of this.ghosts) {
      if (ghost.respawn || ghost.position.x !== this.player.x || ghost.position.y !== this.player.y) continue;
      if (this.power > 0) {
        this.score += 200;
        ghost.position = { ...ghost.home };
        ghost.respawn = 90;
      } else {
        this.status = 'lost';
        return;
      }
    }
  }

  step(): void {
    if (this.status !== 'playing') return;
    this.ticks++;
    if (this.power > 0) this.power--;
    for (const ghost of this.ghosts) {
      if (ghost.respawn > 0) ghost.respawn--;
    }
    this.collide();
    if (this.status !== 'playing') return;

    if (this.ticks % 8 === 0) {
      const turn = this.next(this.player, this.requested);
      if (!this.wall(turn.x, turn.y)) this.direction = this.requested;
      const next = this.next(this.player, this.direction);
      if (!this.wall(next.x, next.y)) this.player = next;
      const pellet = this.pellets[this.player.y][this.player.x];
      if (pellet) {
        this.pellets[this.player.y][this.player.x] = 0;
        this.remaining--;
        this.score += pellet === 2 ? 50 : 10;
        if (pellet === 2) this.power = 360;
      }
      this.collide();
      if (this.status !== 'playing') return;
      if (this.remaining === 0) {
        this.status = 'won';
        return;
      }
    }

    if (this.ticks % 10 === 0) {
      for (const ghost of this.ghosts) {
        if (ghost.respawn) continue;
        const available = PAC_ACTIONS.filter(action => {
          const next = this.next(ghost.position, action);
          return !this.wall(next.x, next.y);
        });
        const forward = available.filter(action => action !== PAC_OPPOSITE[ghost.direction]);
        const options = forward.length ? forward : available;
        options.sort((a, b) => {
          const first = this.next(ghost.position, a);
          const second = this.next(ghost.position, b);
          const distance = (point: Point) => Math.abs(point.x - this.player.x) + Math.abs(point.y - this.player.y);
          return (distance(first) - distance(second)) * (this.power > 0 ? -1 : 1);
        });
        ghost.direction = options[0];
        ghost.position = this.next(ghost.position, ghost.direction);
        this.collide();
        if (this.status !== 'playing') return;
      }
    }
  }

  draw(ctx: GameRenderer): void {
    rect(ctx, '#090d25', 0, 0, 240, 240);
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        const px = x * 16;
        const py = y * 16;
        if (this.wall(x, y)) {
          rect(ctx, '#293b9b', px, py, 16, 16);
          rect(ctx, '#465dcc', px + 2, py + 2, 12, 2);
          rect(ctx, '#1a286f', px + 2, py + 12, 12, 2);
        } else if (this.pellets[y][x] === 2) {
          rect(ctx, '#fff0b5', px + 5, py + 5, 6, 6);
        } else if (this.pellets[y][x] === 1) {
          rect(ctx, '#f9dca5', px + 7, py + 7, 2, 2);
        }
      }
    }
    for (const ghost of this.ghosts) {
      if (ghost.respawn) continue;
      const x = ghost.position.x * 16;
      const y = ghost.position.y * 16;
      const color = this.power > 0
        ? (this.power <= 120 && Math.floor(this.power / 15) % 2 === 0 ? '#f6e5bd' : '#626de0')
        : ghost.color;
      rect(ctx, color, x + 4, y + 2, 8, 2);
      rect(ctx, color, x + 2, y + 4, 12, 8);
      rect(ctx, color, x + 2, y + 12, 4, 2);
      rect(ctx, color, x + 8, y + 12, 4, 2);
      rect(ctx, '#ffffff', x + 4, y + 6, 3, 3);
      rect(ctx, '#ffffff', x + 9, y + 6, 3, 3);
      rect(ctx, '#202650', x + 5, y + 7, 2, 2);
      rect(ctx, '#202650', x + 10, y + 7, 2, 2);
    }
    const x = this.player.x * 16;
    const y = this.player.y * 16;
    rect(ctx, '#ffdc47', x + 4, y + 2, 8, 12);
    rect(ctx, '#ffdc47', x + 2, y + 4, 12, 8);
    if (Math.floor(this.ticks / 8) % 2 === 0) {
      const mouth = PAC_DIRECTIONS[this.direction];
      rect(ctx, '#090d25', x + 7 + mouth.x * 4, y + 7 + mouth.y * 4, mouth.x ? 5 : 2, mouth.y ? 5 : 2);
    }
  }
}

type SpaceRock = { x: number; y: number; vx: number; vy: number; size: number; shape: number };
type SpaceBullet = { x: number; y: number; vx: number; vy: number; life: number };

class Asteroids implements Game {
  score = 0;
  status: Game['status'] = 'playing';
  private held = new Set<Action>();
  private ship = { x: 120, y: 120, vx: 0, vy: 0, angle: -Math.PI / 2 };
  private rocks: SpaceRock[] = [];
  private bullets: SpaceBullet[] = [];
  private wave = 0;
  private shotCooldown = 0;
  private ticks = 0;

  constructor() { this.nextWave(); }

  input(action: Action, pressed: boolean): void {
    if (pressed) this.held.add(action);
    else this.held.delete(action);
  }

  private wrap(value: number): number { return (value + 240) % 240; }

  private distanceSquared(ax: number, ay: number, bx: number, by: number): number {
    const dx = Math.abs(ax - bx);
    const dy = Math.abs(ay - by);
    return Math.min(dx, 240 - dx) ** 2 + Math.min(dy, 240 - dy) ** 2;
  }

  private nextWave(): void {
    this.wave++;
    const count = Math.min(3 + this.wave, 10);
    for (let i = 0; i < count; i++) {
      // Spawn across the opposite half of the field, safely away from the ship.
      const direction = Math.random() * Math.PI * 2;
      const travel = Math.random() * Math.PI * 2;
      const speed = 0.45 + Math.random() * 0.35 + Math.min(this.wave - 1, 10) * 0.025;
      this.rocks.push({
        x: this.wrap(this.ship.x + Math.cos(direction) * 110),
        y: this.wrap(this.ship.y + Math.sin(direction) * 110),
        vx: Math.cos(travel) * speed, vy: Math.sin(travel) * speed,
        size: 3, shape: Math.floor(Math.random() * 3),
      });
    }
  }

  step(): void {
    if (this.status !== 'playing') return;
    this.ticks++;
    const ship = this.ship;
    if (this.held.has('left')) ship.angle -= 0.065;
    if (this.held.has('right')) ship.angle += 0.065;
    if (this.held.has('up')) {
      ship.vx += Math.cos(ship.angle) * 0.075;
      ship.vy += Math.sin(ship.angle) * 0.075;
    }
    ship.vx *= 0.993;
    ship.vy *= 0.993;
    const speed = Math.hypot(ship.vx, ship.vy);
    if (speed > 3) { ship.vx *= 3 / speed; ship.vy *= 3 / speed; }
    ship.x = this.wrap(ship.x + ship.vx);
    ship.y = this.wrap(ship.y + ship.vy);

    if (this.shotCooldown > 0) this.shotCooldown--;
    if (this.held.has('down') && this.shotCooldown === 0) {
      const dx = Math.cos(ship.angle), dy = Math.sin(ship.angle);
      this.bullets.push({ x: this.wrap(ship.x + dx * 9), y: this.wrap(ship.y + dy * 9),
        vx: ship.vx + dx * 4, vy: ship.vy + dy * 4, life: 55 });
      this.shotCooldown = 12;
    }
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.x = this.wrap(bullet.x + bullet.vx);
      bullet.y = this.wrap(bullet.y + bullet.vy);
      if (--bullet.life <= 0) this.bullets.splice(i, 1);
    }
    for (const rock of this.rocks) {
      rock.x = this.wrap(rock.x + rock.vx);
      rock.y = this.wrap(rock.y + rock.vy);
    }
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      for (let j = this.rocks.length - 1; j >= 0; j--) {
        const rock = this.rocks[j];
        const radius = rock.size * 5 + 3;
        if (this.distanceSquared(bullet.x, bullet.y, rock.x, rock.y) > radius * radius) continue;
        this.bullets.splice(i, 1);
        this.rocks.splice(j, 1);
        this.score += rock.size === 3 ? 20 : rock.size === 2 ? 50 : 100;
        if (rock.size > 1) {
          const angle = Math.atan2(rock.vy, rock.vx);
          const childSpeed = Math.hypot(rock.vx, rock.vy) + 0.35;
          for (const offset of [-0.8, 0.8]) {
            this.rocks.push({ x: rock.x, y: rock.y, vx: Math.cos(angle + offset) * childSpeed,
              vy: Math.sin(angle + offset) * childSpeed, size: rock.size - 1,
              shape: Math.floor(Math.random() * 3) });
          }
        }
        break;
      }
    }
    for (const rock of this.rocks) {
      const radius = rock.size * 5 + 6;
      if (this.distanceSquared(ship.x, ship.y, rock.x, rock.y) < radius * radius) {
        this.status = 'lost';
        return;
      }
    }
    if (this.rocks.length === 0) this.nextWave();
  }

  draw(ctx: GameRenderer): void {
    rect(ctx, '#10182e', 0, 0, 240, 240);
    for (let i = 0; i < 32; i++) {
      const x = (i * 79 + 13) % 240, y = (i * 113 + 19) % 240;
      rect(ctx, i % 5 === 0 ? '#f5cf73' : '#52637a', x, y, i % 5 === 0 ? 2 : 1, 2);
    }
    for (const rock of this.rocks) {
      const r = rock.size * 5 + 3;
      this.drawWrapped(ctx, rock.x, rock.y, () => {
        rect(ctx, '#60677b', -r + 3, -r, r * 2 - 6, r * 2);
        rect(ctx, '#89909a', -r, -r + 4, r * 2, r * 2 - 8);
        rect(ctx, '#b4b7b0', -r + 4, -r + 3, r * 2 - 9, 3);
        rect(ctx, '#60677b', -r + 4 + rock.shape * 2, -3, Math.max(3, rock.size * 2), 4);
        rect(ctx, '#717987', 2, r - 7, 4, 3);
      });
    }
    for (const bullet of this.bullets) {
      this.drawWrapped(ctx, bullet.x, bullet.y, () => rect(ctx, '#ffe39a', -2, -2, 4, 4));
    }
    this.drawWrapped(ctx, this.ship.x, this.ship.y, () => {
      if (this.held.has('up') && this.ticks % 8 < 5) {
        rect(ctx, '#ff7d80', -3, 7, 6, 6);
        rect(ctx, '#f5cf73', -1, 8, 2, 7);
      }
      rect(ctx, '#86e6c4', -2, -10, 4, 4);
      rect(ctx, '#86e6c4', -4, -6, 8, 8);
      rect(ctx, '#86e6c4', -7, 2, 14, 5);
      rect(ctx, '#398f86', -7, 5, 4, 4);
      rect(ctx, '#398f86', 3, 5, 4, 4);
      rect(ctx, '#203844', -2, -3, 4, 4);
    }, this.ship.angle + Math.PI / 2);
  }

  private drawWrapped(ctx: GameRenderer, x: number, y: number, draw: () => void, angle = 0): void {
    for (const dx of [-240, 0, 240]) for (const dy of [-240, 0, 240]) {
      if (x + dx < -20 || x + dx > 260 || y + dy < -20 || y + dy > 260) continue;
      ctx.transformed(Math.round(x + dx), Math.round(y + dy), angle, draw);
    }
  }
}

class Minesweeper implements Game {
  score = 0;
  status: Game['status'] = 'playing';
  private readonly mines = new Uint8Array(100);
  private readonly revealed = new Uint8Array(100);
  private readonly flags = new Uint8Array(100);
  private started = false;
  private exploded = -1;

  input(_action: Action, _pressed: boolean): void {}
  step(): void {}

  pointer(x: number, y: number, flag: boolean): void {
    if (this.status !== 'playing' || !Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x >= 240 || y >= 240) return;
    const index = Math.floor(y / 24) * 10 + Math.floor(x / 24);
    if (this.revealed[index]) return;
    if (flag) {
      this.flags[index] ^= 1;
      return;
    }
    if (this.flags[index]) return;
    if (!this.started) {
      this.started = true;
      const candidates = Array.from({ length: 100 }, (_, i) => i).filter(i => i !== index);
      for (let i = 0; i < 15; i++) {
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
    if (this.score === 85) this.status = 'won';
  }

  private forNeighbors(index: number, visit: (neighbor: number) => void): void {
    const x = index % 10, y = Math.floor(index / 10);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if ((!dx && !dy) || x + dx < 0 || x + dx >= 10 || y + dy < 0 || y + dy >= 10) continue;
      visit((y + dy) * 10 + x + dx);
    }
  }

  private neighborCount(index: number): number {
    let count = 0;
    this.forNeighbors(index, neighbor => { count += this.mines[neighbor]; });
    return count;
  }

  draw(ctx: GameRenderer): void {
    const colors = ['', '#75c9f0', '#86e6a7', '#ff8f83', '#c6a7f3', '#ffd47c', '#70ded1', '#f2a8c9', '#f5e9d2'];
    rect(ctx, '#18142e', 0, 0, 240, 240);
    for (let i = 0; i < 100; i++) {
      const x = (i % 10) * 24, y = Math.floor(i / 10) * 24;
      const showMine = this.status === 'lost' && this.mines[i];
      if (this.revealed[i] || showMine) {
        rect(ctx, i === this.exploded ? '#a74855' : '#302947', x + 1, y + 1, 22, 22);
        if (showMine) {
          rect(ctx, '#171629', x + 7, y + 7, 10, 10);
          rect(ctx, '#171629', x + 10, y + 4, 4, 16);
          rect(ctx, '#171629', x + 4, y + 10, 16, 4);
          rect(ctx, '#f5cf73', x + 9, y + 8, 3, 3);
        } else {
          const count = this.neighborCount(i);
          if (count) {
            ctx.text(String(count), x + 12, y + 13, {
              color: colors[count], font: 'bold 16px monospace', align: 'center', baseline: 'middle',
            });
          }
        }
      } else {
        rect(ctx, '#655779', x + 1, y + 1, 22, 22);
        rect(ctx, '#a898ae', x + 2, y + 2, 20, 3);
        rect(ctx, '#a898ae', x + 2, y + 2, 3, 20);
        rect(ctx, '#3a304d', x + 3, y + 20, 19, 2);
        rect(ctx, '#3a304d', x + 20, y + 3, 2, 19);
        if (this.flags[i]) {
          rect(ctx, '#f5e9d2', x + 10, y + 6, 2, 12);
          rect(ctx, '#ff8883', x + 12, y + 6, 6, 3);
          rect(ctx, '#ff8883', x + 12, y + 9, 4, 3);
          rect(ctx, '#f5e9d2', x + 7, y + 18, 9, 2);
        }
      }
    }
  }
}

type TankShell = { x: number; y: number; vx: number; vy: number; age: number };

class ScorchedEarth implements Game {
  score = 0;
  status: Game['status'] = 'playing';
  private readonly held = new Set<Action>();
  private readonly terrain = new Float64Array(240);
  private readonly tanks = [
    { x: 30, health: 100 },
    { x: 210, health: 100 },
  ];
  private angle = 45;
  private power = 65;
  private wind = 0;
  private turn: 'player' | 'cpu' = 'player';
  private shell: TankShell | null = null;
  private delay = 0;
  private blast: { x: number; y: number; ticks: number } | null = null;

  constructor(private readonly difficulty: 'easy' | 'medium' | 'hard') {
    const phase = Math.random() * Math.PI * 2;
    for (let x = 0; x < 240; x++) {
      this.terrain[x] = Math.round(181 + 12 * Math.sin(x / 34 + phase) + 5 * Math.sin(x / 13 + phase));
    }
    this.newWind();
  }

  input(action: Action, pressed: boolean): void {
    if (pressed) this.held.add(action);
    else this.held.delete(action);
  }

  fire(): void {
    if (this.status !== 'playing' || this.turn !== 'player' || this.shell || this.delay > 0) return;
    this.launch(0, this.angle, this.power);
  }

  private newWind(): void { this.wind = Math.round((Math.random() * 2 - 1) * 10); }
  private ground(x: number): number { return this.terrain[Math.max(0, Math.min(239, Math.floor(x)))]; }
  private tankY(index: number): number { return this.ground(this.tanks[index].x) - 5; }

  private makeShell(index: number, angle: number, power: number): TankShell {
    const radians = angle * Math.PI / 180;
    const direction = index === 0 ? 1 : -1;
    const dx = direction * Math.cos(radians);
    const dy = -Math.sin(radians);
    const speed = power * 0.055;
    return {
      x: this.tanks[index].x + dx * 9, y: this.tankY(index) + dy * 9,
      vx: dx * speed, vy: dy * speed, age: 0,
    };
  }

  private launch(index: number, angle: number, power: number): void {
    this.shell = this.makeShell(index, angle, power);
  }

  private advance(shell: TankShell): void {
    shell.x += shell.vx;
    shell.y += shell.vy;
    shell.vx += this.wind * 0.0008;
    shell.vy += 0.045;
    shell.age++;
  }

  private collision(shell: TankShell): boolean {
    if (shell.x < 0 || shell.x >= 240 || shell.y >= 240 || shell.age > 600) return true;
    if (shell.y < 0) return false;
    for (let i = 0; i < 2; i++) {
      if (shell.age > 3 && Math.abs(shell.x - this.tanks[i].x) <= 6 &&
          Math.abs(shell.y - this.tankY(i)) <= 5) return true;
    }
    return shell.y >= this.ground(shell.x);
  }

  private cpuFire(): void {
    // Search the same ballistic model used by live shells, including terrain and wind.
    const target = this.tanks[0].x;
    let best = Infinity;
    let bestAngle = 45;
    let bestPower = 65;
    for (let angle = 20; angle <= 80; angle += 5) {
      for (let power = 35; power <= 100; power += 5) {
        const shot = this.makeShell(1, angle, power);
        while (!this.collision(shot)) this.advance(shot);
        const distance = Math.hypot(shot.x - target, shot.y - this.tankY(0));
        if (distance < best) {
          best = distance;
          bestAngle = angle;
          bestPower = power;
        }
      }
    }
    const error = { easy: 16, medium: 9, hard: 4 }[this.difficulty];
    this.launch(1, Math.max(10, Math.min(85, bestAngle + (Math.random() * 2 - 1) * error)),
      Math.max(25, Math.min(100, bestPower + (Math.random() * 2 - 1) * error)));
  }

  private explode(x: number, y: number): void {
    this.blast = { x, y, ticks: 24 };
    for (let i = 0; i < 2; i++) {
      const tank = this.tanks[i];
      const distance = Math.hypot(x - tank.x, y - this.tankY(i));
      const damage = Math.max(0, Math.round((1 - distance / 25) * 50));
      const dealt = Math.min(tank.health, damage);
      tank.health -= dealt;
      if (i === 1) this.score += dealt;
    }
    for (let column = Math.max(0, Math.floor(x - 18)); column <= Math.min(239, Math.ceil(x + 18)); column++) {
      const dx = column - x;
      const depth = Math.sqrt(Math.max(0, 18 * 18 - dx * dx));
      if (y + depth > this.terrain[column] && y - depth <= this.terrain[column]) {
        this.terrain[column] = Math.min(235, y + depth);
      }
    }
    if (this.tanks[0].health <= 0) this.status = 'lost';
    else if (this.tanks[1].health <= 0) {
      this.status = 'won';
      this.score += 100 + this.tanks[0].health;
    }
    if (this.status === 'playing') {
      this.turn = this.turn === 'player' ? 'cpu' : 'player';
      this.delay = 45;
      this.newWind();
    }
  }

  step(): void {
    if (this.blast && --this.blast.ticks <= 0) this.blast = null;
    if (this.status !== 'playing') return;
    if (this.shell) {
      this.advance(this.shell);
      if (this.collision(this.shell)) {
        const { x, y } = this.shell;
        this.shell = null;
        if (x >= 0 && x < 240 && y >= 0 && y < 240) this.explode(x, y);
        else {
          this.turn = this.turn === 'player' ? 'cpu' : 'player';
          this.delay = 45;
          this.newWind();
        }
      }
      return;
    }
    if (this.delay > 0) { this.delay--; return; }
    if (this.turn === 'cpu') { this.cpuFire(); return; }
    this.angle = Math.max(10, Math.min(85, this.angle + (this.held.has('up') ? 0.5 : 0) - (this.held.has('down') ? 0.5 : 0)));
    this.power = Math.max(25, Math.min(100, this.power + (this.held.has('right') ? 0.5 : 0) - (this.held.has('left') ? 0.5 : 0)));
  }

  draw(ctx: GameRenderer): void {
    rect(ctx, '#171b38', 0, 0, 240, 240);
    rect(ctx, '#283353', 0, 106, 240, 30);
    rect(ctx, '#36415b', 15, 117, 32, 3);
    rect(ctx, '#36415b', 145, 109, 48, 3);
    for (let x = 0; x < 240; x++) {
      const y = this.terrain[x];
      rect(ctx, '#547a61', x, y, 1, 240 - y);
      rect(ctx, '#a0b879', x, y, 1, 2);
      rect(ctx, '#405c50', x, y + 12, 1, Math.max(0, 228 - y));
    }
    for (let i = 0; i < 2; i++) {
      const tank = this.tanks[i];
      const y = this.tankY(i);
      const color = i === 0 ? '#86e6c4' : '#ff8883';
      const radians = (i === 0 ? this.angle : 45) * Math.PI / 180;
      const direction = i === 0 ? 1 : -1;
      ctx.line(color, 3, tank.x, y - 2, tank.x + direction * Math.cos(radians) * 9, y - 2 - Math.sin(radians) * 9);
      rect(ctx, '#202737', tank.x - 7, y + 1, 14, 4);
      rect(ctx, color, tank.x - 6, y - 4, 12, 6);
      rect(ctx, color, tank.x - 3, y - 7, 6, 3);
    }
    if (this.shell) rect(ctx, '#ffe39a', this.shell.x - 2, this.shell.y - 2, 4, 4);
    if (this.blast) {
      const radius = this.blast.ticks > 12 ? 13 : 8;
      rect(ctx, '#ff8883', this.blast.x - radius, this.blast.y - radius / 2, radius * 2, radius);
      rect(ctx, '#ffe39a', this.blast.x - radius / 2, this.blast.y - radius, radius, radius * 2);
    }
    const label = (value: string, x: number, y: number, color: string, align: 'left' | 'center' | 'right') =>
      ctx.text(value, x, y, { color, font: 'bold 9px monospace', align, baseline: 'top' });
    label(`${t("YOU")} ${this.tanks[0].health}`, 8, 8, '#86e6c4', 'left');
    label(`CPU ${this.tanks[1].health}`, 232, 8, '#ff8883', 'right');
    label(`${t("WIND")} ${this.wind > 0 ? '>' : this.wind < 0 ? '<' : '-'} ${Math.abs(this.wind)}`, 120, 8, '#f5e9d2', 'center');
    label(`${t("ANGLE")} ${Math.round(this.angle)}  ${t("POWER")} ${Math.round(this.power)}`, 120, 25, '#f5e9d2', 'center');
    label(this.turn === 'player' ? t("YOUR TURN") : t("CPU TURN"), 120, 39, '#f5e9d2', 'center');
  }
}

export function createGame(id: GameId, snakeSpeed: SnakeSpeed = 'medium', mazeSize = 10, frogLanes = 5, artilleryDifficulty: 'easy' | 'medium' | 'hard' = 'medium'): Game {
  switch (id) {
    case 'snake': return new Snake({ slow: 16, medium: 8, fast: 4 }[snakeSpeed]);
    case 'breakout': return new Breakout();
    case 'lane-dodger': return new LaneDodger();
    case 'labyrinth': return new Labyrinth(mazeSize);
    case 'frog-crossing': return new FrogCrossing(frogLanes);
    case 'tetris': return new Tetris();
    case 'pac-man': return new PacMan();
    case 'asteroids': return new Asteroids();
    case 'minesweeper': return new Minesweeper();
    case 'scorched-earth': return new ScorchedEarth(artilleryDifficulty);
  }
}
