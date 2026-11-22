import { game as snake } from './snake';
import { game as breakout } from './breakout';
import { game as laneDodger } from './lane-dodger';
import { game as labyrinth } from './labyrinth';
import { game as frogCrossing } from './frog-crossing';
import { game as tetris } from './tetris';
import { game as pacMan } from './pac-man';
import { game as asteroids } from './asteroids';
import { game as minesweeper } from './minesweeper';
import { game as scorchedEarth } from './scorched-earth';
import type { GameDefinition } from './types';

const catalog = [snake, breakout, laneDodger, labyrinth, frogCrossing, tetris, pacMan, asteroids, minesweeper, scorchedEarth] as const;

export type GameId = (typeof catalog)[number]['id'];
export type RegisteredGame = GameDefinition & { id: GameId };
export const games: readonly RegisteredGame[] = catalog;

export function gameNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}
