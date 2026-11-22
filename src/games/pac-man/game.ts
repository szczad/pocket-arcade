import { rect, type GameRenderer } from '../renderer';
import type { Action, Game, Point } from '../types';
import { PAC_MAZE } from './maze';

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


export class PacMan implements Game {
  score = 0;
  status: Game['status'] = 'playing';
  private readonly columns = 32;
  private readonly rows = 20;
  // Every open cell, including the ghost house, joins the surrounding corridors.
  private readonly pellets = Array.from({ length: this.rows }, (_, y) =>
    Array.from({ length: this.columns }, (_, x) => {
      if (this.wall(x, y) || (x === 15 && y === 15)) return 0;
      return (x === 1 || x === 30) && (y === 1 || y === 16) ? 2 : 1;
    }),
  );
  private remaining = this.pellets.reduce((total, row) => total + row.filter(Boolean).length, 0);
  private player: Point = { x: 15, y: 15 };
  private direction: Action = 'left';
  private requested: Action = 'left';
  private ticks = 0;
  private power = 0;
  private ghosts: PacGhost[] = [
    { position: { x: 14, y: 9 }, home: { x: 14, y: 9 }, direction: 'up', color: '#ff6078', respawn: 0 },
    { position: { x: 15, y: 9 }, home: { x: 15, y: 9 }, direction: 'up', color: '#ff9bd1', respawn: 0 },
    { position: { x: 17, y: 9 }, home: { x: 17, y: 9 }, direction: 'up', color: '#69dfe9', respawn: 0 },
  ];

  private wall(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.columns || y >= this.rows) return true;
    return PAC_MAZE[y][Math.min(x, this.columns - 1 - x)] === '#';
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
    rect(ctx, '#090d25', 0, 0, 320, 200);
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.columns; x++) {
        const px = x * 10;
        const py = y * 10;
        if (this.wall(x, y)) {
          rect(ctx, '#293b9b', px, py, 10, 10);
          rect(ctx, '#465dcc', px + 1, py + 1, 8, 1);
          rect(ctx, '#1a286f', px + 1, py + 8, 8, 1);
        } else if (this.pellets[y][x] === 2) {
          rect(ctx, '#fff0b5', px + 3, py + 3, 4, 4);
        } else if (this.pellets[y][x] === 1) {
          rect(ctx, '#f9dca5', px + 4, py + 4, 2, 2);
        }
      }
    }
    for (const ghost of this.ghosts) {
      if (ghost.respawn) continue;
      const x = ghost.position.x * 10;
      const y = ghost.position.y * 10;
      const color = this.power > 0
        ? (this.power <= 120 && Math.floor(this.power / 15) % 2 === 0 ? '#f6e5bd' : '#626de0')
        : ghost.color;
      rect(ctx, color, x + 2, y + 1, 6, 8);
      rect(ctx, color, x + 1, y + 3, 8, 5);
      rect(ctx, '#ffffff', x + 2, y + 3, 2, 2);
      rect(ctx, '#ffffff', x + 6, y + 3, 2, 2);
      rect(ctx, '#202650', x + 3, y + 4, 1, 1);
      rect(ctx, '#202650', x + 7, y + 4, 1, 1);
    }
    const x = this.player.x * 10;
    const y = this.player.y * 10;
    rect(ctx, '#ffdc47', x + 2, y + 1, 6, 8);
    rect(ctx, '#ffdc47', x + 1, y + 2, 8, 6);
    if (Math.floor(this.ticks / 8) % 2 === 0) {
      const mouth = PAC_DIRECTIONS[this.direction];
      rect(ctx, '#090d25', x + 4 + mouth.x * 3, y + 4 + mouth.y * 3, mouth.x ? 3 : 2, mouth.y ? 3 : 2);
    }
  }
}
