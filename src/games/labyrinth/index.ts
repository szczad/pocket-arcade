import { t } from '../../i18n';
import type { GameDefinition } from '../types';
import { cover } from './cover';
import { Labyrinth } from './game';

export const game = {
  id: 'labyrinth',
  name: 'Labyrinth',
  description: 'Find your way through the maze.',
  instructions: 'Find the gold exit. Fewer moves earn a higher score.',
  color: 'mint',
  cover,
  achievements: [{ name: () => t('Maze Explorer'), description: () => t('Score 1 point in Labyrinth.'), goal: 1, icon: 'L' }],
  options: [
    {
      id: 'size', label: 'Maze size', kind: 'select', defaultValue: '10',
      choices: [
        { value: '10', label: '16×10' },
        { value: '15', label: '24×15' },
        { value: '20', label: '32×20' },
        { value: 'custom', label: 'Custom' },
      ],
    },
    {
      id: 'customSize', label: 'Custom size', kind: 'number', defaultValue: '15', min: 5, max: 50,
      detail: 'Maze height, 5–50 cells; width follows 16:10', ariaLabel: 'Custom maze size',
      when: { id: 'size', value: 'custom' },
    },
  ],
  create: (_speed, options) => new Labyrinth(Number(options.size === 'custom' ? options.customSize : options.size)),
} satisfies GameDefinition;
