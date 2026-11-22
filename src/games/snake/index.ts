import { t } from '../../i18n';
import type { GameDefinition } from '../types';
import { cover } from './cover';
import { Snake } from './game';

export const game = {
  id: 'snake',
  name: 'Snake',
  description: 'Gather fruit. Grow longer. Stay sharp.',
  instructions: 'Collect fruit to grow. Avoid the walls and your own tail.',
  color: 'mint',
  cover,
  achievements: [{ name: () => t('Orchard Keeper'), description: () => t('Score 50 points in Snake.'), goal: 50, icon: 'S' }],
  timing: () => 1,
  create: (speed) => new Snake({ slow: 16, medium: 8, fast: 4 }[speed]),
} satisfies GameDefinition;
