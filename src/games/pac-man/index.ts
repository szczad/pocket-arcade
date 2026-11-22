import { t } from '../../i18n';
import type { GameDefinition } from '../types';
import { cover } from './cover';
import { PacMan } from './game';

export const game = {
  id: 'pac-man',
  name: "Pac-Man",
  description: "Eat the dots and dodge the ghosts.",
  instructions: "Collect every dot and avoid ghosts. Power pellets let you eat ghosts briefly.",
  color: 'gold',
  cover,
  achievements: [{ name: () => t('Maze Muncher'), description: () => t('Score 100 points in Pac-Man.'), goal: 100, icon: 'P' }],
  create: () => new PacMan(),
} satisfies GameDefinition;
