import type { GameDefinition } from '../types';
import { cover } from './cover';
import { Minesweeper } from './game';

export const game = {
  id: 'minesweeper',
  name: "Minesweeper",
  description: "Clear the field without setting off a mine.",
  instructions: "Reveal every safe square. Numbers count neighboring mines.",
  color: 'coral',
  cover,
  hint: "Click or tap to reveal. Right-click or enable flag mode to mark mines.",
  speed: false,
  create: () => new Minesweeper(),
} satisfies GameDefinition;
