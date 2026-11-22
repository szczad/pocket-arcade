import type { GameId } from './games';
import { t } from './i18n';

export interface Achievement {
  name: () => string;
  description: () => string;
  goal: number;
  icon: string;
}

export const achievements: Partial<Record<GameId, Achievement[]>> = {
  snake: [{ name: () => t('Orchard Keeper'), description: () => t('Score 50 points in Snake.'), goal: 50, icon: 'S' }],
  breakout: [{ name: () => t('Wall Breaker'), description: () => t('Score 120 points in Breakout.'), goal: 120, icon: 'B' }],
  'lane-dodger': [
    { name: () => t('Clear Road'), description: () => t('Pass 10 vehicles.'), goal: 10, icon: '10' },
    { name: () => t('Road Regular'), description: () => t('Pass 50 vehicles.'), goal: 50, icon: '50' },
    { name: () => t('Highway Driver'), description: () => t('Pass 100 vehicles.'), goal: 100, icon: '100' },
    { name: () => t('Traffic Expert'), description: () => t('Pass 200 vehicles.'), goal: 200, icon: '200' },
    { name: () => t('Road Veteran'), description: () => t('Pass 500 vehicles.'), goal: 500, icon: '500' },
    { name: () => t('Road Legend'), description: () => t('Pass 1000 vehicles.'), goal: 1000, icon: '1000' },
  ],
  labyrinth: [{ name: () => t('Maze Explorer'), description: () => t('Score 1 point in Labyrinth.'), goal: 1, icon: 'L' }],
  'frog-crossing': [{ name: () => t('River Bound'), description: () => t('Score 1 point in Frog Crossing.'), goal: 1, icon: 'F' }],
  tetris: [
    { name: () => t('Line Builder'), description: () => t('Score 100 points in Tetris.'), goal: 100, icon: '100' },
    { name: () => t('Block Stacker'), description: () => t('Score 500 points in Tetris.'), goal: 500, icon: '500' },
    { name: () => t('Line Master'), description: () => t('Score 5000 points in Tetris.'), goal: 5000, icon: '5000' },
    { name: () => t('Block Expert'), description: () => t('Score 20000 points in Tetris.'), goal: 20000, icon: '20k' },
    { name: () => t('Tetris Legend'), description: () => t('Score 100000 points in Tetris.'), goal: 100000, icon: '100k' },
  ],
  'pac-man': [{ name: () => t('Maze Muncher'), description: () => t('Score 100 points in Pac-Man.'), goal: 100, icon: 'P' }],
  asteroids: [{ name: () => t('Asteroid Breaker'), description: () => t('Score 100 points in Asteroids.'), goal: 100, icon: 'A' }],
};

/** The same accessible achievement badges are used in games and on the account page. */
export function achievementIcons(items: Achievement[], score: number | undefined): HTMLElement {
  const icons = document.createElement('div');
  icons.className = 'achievement-icons';
  for (const item of items) {
    const earned = (score ?? -1) >= item.goal;
    const icon = document.createElement('button');
    icon.type = 'button';
    icon.className = `achievement-icon ${earned ? 'earned' : 'locked'}`;
    icon.setAttribute('aria-label', `${item.name()}: ${item.description()} — ${earned ? t('Earned') : t('Locked')}`);
    const mark = document.createElement('span');
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = item.icon;
    const tip = document.createElement('span');
    tip.className = 'achievement-tip';
    tip.setAttribute('aria-hidden', 'true');
    const name = document.createElement('strong');
    name.textContent = item.name();
    const description = document.createElement('span');
    description.textContent = item.description();
    const state = document.createElement('small');
    state.textContent = earned ? t('EARNED') : t('LOCKED');
    tip.append(name, description, state);
    icon.append(mark, tip);
    icons.append(icon);
  }
  return icons;
}
