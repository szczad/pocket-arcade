import { t } from '../../i18n';
import type { GameDefinition } from '../types';
import { cover } from './cover';
import { Tetris } from './game';

export const game = {
  id: 'tetris',
  name: "Tetris",
  description: "Stack blocks and clear complete lines.",
  instructions: "Move blocks left and right, rotate with up, and soft drop with down. Fill lines to clear them.",
  color: 'coral',
  cover,
  achievements: [
    { name: () => t('Line Builder'), description: () => t('Score 100 points in Tetris.'), goal: 100, icon: '100' },
    { name: () => t('Block Stacker'), description: () => t('Score 500 points in Tetris.'), goal: 500, icon: '500' },
    { name: () => t('Line Master'), description: () => t('Score 5000 points in Tetris.'), goal: 5000, icon: '5000' },
    { name: () => t('Block Expert'), description: () => t('Score 20000 points in Tetris.'), goal: 20000, icon: '20k' },
    { name: () => t('Tetris Legend'), description: () => t('Score 100000 points in Tetris.'), goal: 100000, icon: '100k' },
  ],
  create: () => new Tetris(),
} satisfies GameDefinition;
