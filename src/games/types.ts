import type { Achievement } from '../achievements';
import type { CoverPattern } from './cover-renderer';
import type { Resolution } from './engine';
import type { GameRenderer } from './renderer';

export type Point = { x: number; y: number };
export type Action = 'up' | 'down' | 'left' | 'right';
export type GameSpeed = 'slow' | 'medium' | 'fast';

export interface Game {
  readonly resolution?: Readonly<Resolution>;
  input(action: Action, pressed: boolean): void;
  pointer?(x: number, y: number, flag: boolean): void;
  fire?(): void;
  step(): void;
  draw(renderer: GameRenderer): void;
  score: number;
  status: 'playing' | 'won' | 'lost';
}

type OptionBase = { id: string; label: string; defaultValue: string };
export type GameOption = OptionBase & (
  | { kind: 'select'; choices: readonly { value: string; label: string | (() => string) }[] }
  | { kind: 'number'; min: number; max: number; detail: string; ariaLabel?: string; when?: { id: string; value: string } }
);

export interface GameDefinition {
  id: string;
  name: string;
  accountName?: string;
  description: string;
  instructions: string;
  color: 'mint' | 'coral' | 'gold';
  cover: CoverPattern;
  hint?: string;
  achievements?: readonly Achievement[];
  options?: readonly GameOption[];
  speed?: false;
  timing?(speed: GameSpeed): number;
  create(speed: GameSpeed, options: Readonly<Record<string, string>>): Game;
}
