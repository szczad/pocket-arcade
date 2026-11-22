import { t } from '../../i18n';
import type { GameDefinition } from '../types';
import { cover } from './cover';
import { LaneDodger } from './game';

export const game = {
  id: 'lane-dodger',
  name: 'game-picker\u0004Lane Dodger',
  accountName: 'Lane Dodger',
  description: 'Pick a lane and keep the road clear.',
  instructions: 'Change lanes to avoid traffic. Every car you pass earns a point.',
  color: 'gold',
  cover,
  achievements: [
    { name: () => t('Clear Road'), description: () => t('Pass 10 vehicles.'), goal: 10, icon: '10' },
    { name: () => t('Road Regular'), description: () => t('Pass 50 vehicles.'), goal: 50, icon: '50' },
    { name: () => t('Highway Driver'), description: () => t('Pass 100 vehicles.'), goal: 100, icon: '100' },
    { name: () => t('Traffic Expert'), description: () => t('Pass 200 vehicles.'), goal: 200, icon: '200' },
    { name: () => t('Road Veteran'), description: () => t('Pass 500 vehicles.'), goal: 500, icon: '500' },
    { name: () => t('Road Legend'), description: () => t('Pass 1000 vehicles.'), goal: 1000, icon: '1000' },
  ],
  create: () => new LaneDodger(),
} satisfies GameDefinition;
