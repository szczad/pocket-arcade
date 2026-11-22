import { t } from '../../i18n';
import type { GameDefinition } from '../types';
import { cover } from './cover';
import { Breakout } from './game';

export const game = {
  id: 'breakout',
  name: 'Breakout',
  description: 'Clear the wall, one brick at a time.',
  instructions: 'Move the paddle to keep the ball in play and clear every brick.',
  color: 'coral',
  cover,
  achievements: [{ name: () => t('Wall Breaker'), description: () => t('Score 120 points in Breakout.'), goal: 120, icon: 'B' }],
  create: () => new Breakout(),
} satisfies GameDefinition;
