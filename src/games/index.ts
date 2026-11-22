export type GameId = 'snake' | 'breakout' | 'lane-dodger' | 'labyrinth' | 'frog-crossing' | 'tetris';
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
    rect(ctx, '#18142e', 0, 0, 240, 240);
    const cell = 232 / this.size;
    const edge = (n: number) => Math.round(4 + n * cell);
    const wall = this.size <= 20 ? 3 : 1;
    for (let y = 0; y < this.size; y++) for (let x = 0; x < this.size; x++) {
      const left = edge(x), top = edge(y), right = edge(x + 1), bottom = edge(y + 1);
      rect(ctx, (x + y) % 2 ? '#302947' : '#382e4d', left, top, right - left, bottom - top);
      const passages = this.passages[y * this.size + x];
      ctx.fillStyle = '#a96e82';
      if (!(passages & 1)) ctx.fillRect(left, top, right - left + wall, wall);
      if (!(passages & 8)) ctx.fillRect(left, top, wall, bottom - top + wall);
      if (x === this.size - 1) ctx.fillRect(right, top, wall, bottom - top + wall);
      if (y === this.size - 1) ctx.fillRect(left, bottom, right - left + wall, wall);
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

  draw(ctx: CanvasRenderingContext2D): void {
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

  draw(ctx: CanvasRenderingContext2D): void {
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

  private block(ctx: CanvasRenderingContext2D, col: number, row: number, color: string): void {
    const x = 65 + col * 11, y = 9 + row * 11;
    rect(ctx, color, x, y, 10, 10);
    rect(ctx, '#eef6db', x + 1, y + 1, 7, 1);
    rect(ctx, '#34465a', x + 1, y + 8, 8, 1);
  }
}

export function createGame(id: GameId, snakeSpeed: SnakeSpeed = 'medium', mazeSize = 10, frogLanes = 5): Game {
  switch (id) {
    case 'snake': return new Snake({ slow: 16, medium: 8, fast: 4 }[snakeSpeed]);
    case 'breakout': return new Breakout();
    case 'lane-dodger': return new LaneDodger();
    case 'labyrinth': return new Labyrinth(mazeSize);
    case 'frog-crossing': return new FrogCrossing(frogLanes);
    case 'tetris': return new Tetris();
  }
}
