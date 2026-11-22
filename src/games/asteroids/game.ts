import { rect, type GameRenderer } from '../renderer';
import type { Action, Game } from '../types';

type SpaceRock = { x: number; y: number; vx: number; vy: number; size: number; shape: number };
type SpaceBullet = { x: number; y: number; vx: number; vy: number; life: number };

export class Asteroids implements Game {
  score = 0;
  status: Game['status'] = 'playing';
  private held = new Set<Action>();
  private ship = { x: 160, y: 100, vx: 0, vy: 0, angle: -Math.PI / 2 };
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

  private wrap(value: number, extent: number): number { return (value + extent) % extent; }

  private distanceSquared(ax: number, ay: number, bx: number, by: number): number {
    const dx = Math.abs(ax - bx);
    const dy = Math.abs(ay - by);
    return Math.min(dx, 320 - dx) ** 2 + Math.min(dy, 200 - dy) ** 2;
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
        x: this.wrap(this.ship.x + Math.cos(direction) * 110, 320),
        y: this.wrap(this.ship.y + Math.sin(direction) * 110, 200),
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
    ship.x = this.wrap(ship.x + ship.vx, 320);
    ship.y = this.wrap(ship.y + ship.vy, 200);

    if (this.shotCooldown > 0) this.shotCooldown--;
    if (this.held.has('down') && this.shotCooldown === 0) {
      const dx = Math.cos(ship.angle), dy = Math.sin(ship.angle);
      this.bullets.push({ x: this.wrap(ship.x + dx * 9, 320), y: this.wrap(ship.y + dy * 9, 200),
        vx: ship.vx + dx * 4, vy: ship.vy + dy * 4, life: 55 });
      this.shotCooldown = 12;
    }
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.x = this.wrap(bullet.x + bullet.vx, 320);
      bullet.y = this.wrap(bullet.y + bullet.vy, 200);
      if (--bullet.life <= 0) this.bullets.splice(i, 1);
    }
    for (const rock of this.rocks) {
      rock.x = this.wrap(rock.x + rock.vx, 320);
      rock.y = this.wrap(rock.y + rock.vy, 200);
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
    rect(ctx, '#10182e', 0, 0, 320, 200);
    for (let i = 0; i < 32; i++) {
      const x = (i * 79 + 13) % 320, y = (i * 113 + 19) % 200;
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
    for (const dx of [-320, 0, 320]) for (const dy of [-200, 0, 200]) {
      if (x + dx < -20 || x + dx > 340 || y + dy < -20 || y + dy > 220) continue;
      ctx.transformed(Math.round(x + dx), Math.round(y + dy), angle, draw);
    }
  }
}
