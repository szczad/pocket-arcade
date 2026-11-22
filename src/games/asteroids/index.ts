import { t } from '../../i18n';
import type { GameDefinition } from '../types';
import { cover } from './cover';
import { Asteroids } from './game';

export const game = {
  id: 'asteroids',
  name: "Asteroids",
  description: "Pilot your ship through an asteroid field.",
  instructions: "Turn left or right, thrust with up, and fire with down. Destroy asteroids to score.",
  color: 'mint',
  cover,
  achievements: [{ name: () => t('Asteroid Breaker'), description: () => t('Score 100 points in Asteroids.'), goal: 100, icon: 'A' }],
  create: () => new Asteroids(),
} satisfies GameDefinition;
