export type GameId = 'snake' | 'breakout' | 'lane-dodger' | 'labyrinth';
export type Action = 'up' | 'down' | 'left' | 'right';
export type SnakeSpeed = 'slow' | 'medium' | 'fast';
export interface Game {
  input(action: Action, pressed: boolean): void;
  step(): void;
  draw(ctx: CanvasRenderingContext2D): void;
  score: number;
  status: 'playing' | 'won' | 'lost';
}

type Point = { x: number; y: number };
const rect = (ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
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

  draw(ctx: CanvasRenderingContext2D): void {
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
    if (this.ballX < 4) { this.ballX = 4; this.vx = Math.abs(this.vx); }
    if (this.ballX > 236) { this.ballX = 236; this.vx = -Math.abs(this.vx); }
    if (this.ballY < 4) { this.ballY = 4; this.vy = Math.abs(this.vy); }
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

  draw(ctx: CanvasRenderingContext2D): void {
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

  draw(ctx: CanvasRenderingContext2D): void {
    rect(ctx, '#203844', 0, 0, 240, 240);
    rect(ctx, '#343a54', 30, 0, 180, 240);
    rect(ctx, '#f5cf73', 32, 0, 4, 240);
    rect(ctx, '#f5cf73', 204, 0, 4, 240);
    for (const x of [90, 150]) for (let y = -30 + this.distance % 40; y < 240; y += 40) rect(ctx, '#aab7b9', x - 2, y, 4, 20);
    for (const vehicle of this.vehicles) this.car(ctx, vehicle.lane, vehicle.y, '#ff7d80', '#833f58');
    this.car(ctx, this.lane, 190, '#86e6c4', '#398f86');
  }

  private car(ctx: CanvasRenderingContext2D, lane: number, y: number, color: string, shade: string): void {
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

  draw(ctx: CanvasRenderingContext2D): void {
    rect(ctx, '#172c37', 0, 0, 240, 240);
    const cell = 236 / this.size;
    const edge = (n: number) => Math.round(2 + n * cell);
    ctx.fillStyle = '#f5cf73';
    ctx.fillRect(edge(this.size - 1) + 1, edge(this.size - 1) + 1,
      Math.max(1, edge(this.size) - edge(this.size - 1) - 2),
      Math.max(1, edge(this.size) - edge(this.size - 1) - 2));
    ctx.fillStyle = '#a8b8bc';
    for (let y = 0; y < this.size; y++) for (let x = 0; x < this.size; x++) {
      const passages = this.passages[y * this.size + x];
      const left = edge(x), top = edge(y), right = edge(x + 1), bottom = edge(y + 1);
      if (!(passages & 1)) ctx.fillRect(left, top, right - left + 1, 1);
      if (!(passages & 8)) ctx.fillRect(left, top, 1, bottom - top + 1);
      if (x === this.size - 1) ctx.fillRect(right, top, 1, bottom - top + 1);
      if (y === this.size - 1) ctx.fillRect(left, bottom, right - left + 1, 1);
    }
    const left = edge(this.x), top = edge(this.y);
    ctx.fillStyle = '#86e6c4';
    ctx.fillRect(left + 1, top + 1, Math.max(1, edge(this.x + 1) - left - 2),
      Math.max(1, edge(this.y + 1) - top - 2));
  }
}

export function createGame(id: GameId, snakeSpeed: SnakeSpeed = 'medium', mazeSize = 10): Game {
  switch (id) {
    case 'snake': return new Snake({ slow: 16, medium: 8, fast: 4 }[snakeSpeed]);
    case 'breakout': return new Breakout();
    case 'lane-dodger': return new LaneDodger();
    case 'labyrinth': return new Labyrinth(mazeSize);
  }
}
