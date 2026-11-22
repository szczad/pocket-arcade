import { t } from '../../i18n';
import { rect, type GameRenderer } from '../renderer';
import type { Action, Game } from '../types';

type TankShell = { x: number; y: number; vx: number; vy: number; age: number };

export class ScorchedEarth implements Game {
  score = 0;
  status: Game['status'] = 'playing';
  private readonly held = new Set<Action>();
  private readonly terrain = new Float64Array(320);
  private readonly tanks = [
    { x: 70, health: 100 },
    { x: 250, health: 100 },
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
    for (let x = 0; x < 320; x++) {
      this.terrain[x] = Math.round(151 + 12 * Math.sin(x / 34 + phase) + 5 * Math.sin(x / 13 + phase));
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
  private ground(x: number): number { return this.terrain[Math.max(0, Math.min(319, Math.floor(x)))]; }
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
    if (shell.x < 0 || shell.x >= 320 || shell.y >= 200 || shell.age > 600) return true;
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
    for (let column = Math.max(0, Math.floor(x - 18)); column <= Math.min(319, Math.ceil(x + 18)); column++) {
      const dx = column - x;
      const depth = Math.sqrt(Math.max(0, 18 * 18 - dx * dx));
      if (y + depth > this.terrain[column] && y - depth <= this.terrain[column]) {
        this.terrain[column] = Math.min(195, y + depth);
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
        if (x >= 0 && x < 320 && y >= 0 && y < 200) this.explode(x, y);
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
    this.angle = Math.max(10, Math.min(85, this.angle + (this.held.has('left') ? 0.5 : 0) - (this.held.has('right') ? 0.5 : 0)));
    this.power = Math.max(25, Math.min(100, this.power + (this.held.has('up') ? 0.5 : 0) - (this.held.has('down') ? 0.5 : 0)));
  }

  draw(ctx: GameRenderer): void {
    rect(ctx, '#171b38', 0, 0, 320, 200);
    rect(ctx, '#283353', 0, 86, 320, 30);
    rect(ctx, '#36415b', 15, 97, 32, 3);
    rect(ctx, '#36415b', 225, 89, 48, 3);
    for (let x = 0; x < 320; x++) {
      const y = this.terrain[x];
      rect(ctx, '#547a61', x, y, 1, 200 - y);
      rect(ctx, '#a0b879', x, y, 1, 2);
      rect(ctx, '#405c50', x, y + 12, 1, Math.max(0, 188 - y));
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
    label(`CPU ${this.tanks[1].health}`, 312, 8, '#ff8883', 'right');
    label(`${t("WIND")} ${this.wind > 0 ? '>' : this.wind < 0 ? '<' : '-'} ${Math.abs(this.wind)}`, 160, 8, '#f5e9d2', 'center');
    label(`${t("ANGLE")} ${Math.round(this.angle)}  ${t("POWER")} ${Math.round(this.power)}`, 160, 25, '#f5e9d2', 'center');
    label(this.turn === 'player' ? t("YOUR TURN") : t("CPU TURN"), 160, 39, '#f5e9d2', 'center');
  }
}
