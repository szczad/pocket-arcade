import { t } from '../../i18n';
import type { GameDefinition } from '../types';
import { cover } from './cover';
import { FrogCrossing } from './game';

export const game = {
  id: 'frog-crossing',
  name: 'game-picker\u0004Frog Crossing',
  accountName: 'Frog Crossing',
  description: 'Cross the road and ride logs to the far bank.',
  instructions: 'Avoid traffic, hop onto logs, and reach the far bank.',
  color: 'gold',
  cover,
  achievements: [{ name: () => t('River Bound'), description: () => t('Score 1 point in Frog Crossing.'), goal: 1, icon: 'F' }],
  options: [
    {
      id: 'lanes', label: 'Road lanes', kind: 'select', defaultValue: '5',
      choices: [
        { value: '3', label: () => t('{value} lanes', { value: 3 }) },
        { value: '5', label: () => t('road-lanes-plural\u0004{value} lanes', { value: 5 }) },
        { value: '7', label: () => t('road-lanes-plural\u0004{value} lanes', { value: 7 }) },
        { value: '10', label: () => t('road-lanes-plural\u0004{value} lanes', { value: 10 }) },
        { value: 'custom', label: 'road-lanes\u0004Custom' },
      ],
    },
    {
      id: 'customLanes', label: 'Custom lanes', kind: 'number', defaultValue: '6', min: 1, max: 15,
      detail: '1–15 road lanes', ariaLabel: 'Custom road lanes',
      when: { id: 'lanes', value: 'custom' },
    },
  ],
  create: (_speed, options) => new FrogCrossing(Number(options.lanes === 'custom' ? options.customLanes : options.lanes)),
} satisfies GameDefinition;
