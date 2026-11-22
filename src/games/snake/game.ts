import { rect, type GameRenderer } from '../renderer';
import type { Action, Game, Point } from '../types';

export class Snake implements Game {
  score = 0;
  status: Game['status'] = 'playing';
  private body: Point[] = [{ x: 16, y: 10 }, { x: 15, y: 10 }, { x: 14, y: 10 }];
  private direction: Point = { x: 1, y: 0 };
  private next: Point | null = null;
  private fruit: Point = this.spawnFruit()!;
  private ticks = 0;

  constructor(private readonly moveInterval: number) {}

  private spawnFruit(): Point | null {
    const free: Point[] = [];
    for (let y = 0; y < 20; y++) for (let x = 0; x < 32; x++) {
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
    if (head.x < 0 || head.x >= 32 || head.y < 0 || head.y >= 20 || this.body.slice(0, eating ? undefined : -1).some(part => part.x === head.x && part.y === head.y)) {
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
    rect(ctx, '#172c37', 0, 0, 320, 200);
    for (let y = 0; y < 20; y++) for (let x = 0; x < 32; x++) {
      if ((x + y) % 2 === 0) rect(ctx, '#1c3540', x * 10, y * 10, 10, 10);
    }
    rect(ctx, '#ff6f75', this.fruit.x * 10 + 2, this.fruit.y * 10 + 3, 6, 6);
    rect(ctx, '#f5c763', this.fruit.x * 10 + 5, this.fruit.y * 10 + 1, 2, 2);
    this.body.forEach((part, i) => {
      rect(ctx, i === 0 ? '#a3f4c3' : '#59cba2', part.x * 10 + 1, part.y * 10 + 1, 8, 8);
      if (i === 0) rect(ctx, '#173641', part.x * 10 + 4 + this.direction.x * 2, part.y * 10 + 4 + this.direction.y * 2, 2, 2);
    });
  }
}
