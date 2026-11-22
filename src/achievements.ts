import type { GameId } from './games';
import { t } from './i18n';

export interface Achievement {
  name: () => string;
  description: () => string;
  goal: number;
  icon: string;
}

export const achievements: Partial<Record<GameId, Achievement[]>> = {
  snake: [{ name: () => t('Orchard Keeper', 'Strażnik sadu'), description: () => t('Score 50 points in Snake.', 'Zdobądź 50 punktów w Wężu.'), goal: 50, icon: 'S' }],
  breakout: [{ name: () => t('Wall Breaker', 'Pogromca murów'), description: () => t('Score 120 points in Breakout.', 'Zdobądź 120 punktów w Breakout.'), goal: 120, icon: 'B' }],
  'lane-dodger': [
    { name: () => t('Clear Road', 'Wolna droga'), description: () => t('Pass 10 vehicles.', 'Miń 10 pojazdów.'), goal: 10, icon: '10' },
    { name: () => t('Road Regular', 'Stały bywalec drogi'), description: () => t('Pass 50 vehicles.', 'Miń 50 pojazdów.'), goal: 50, icon: '50' },
    { name: () => t('Highway Driver', 'Kierowca szosy'), description: () => t('Pass 100 vehicles.', 'Miń 100 pojazdów.'), goal: 100, icon: '100' },
    { name: () => t('Traffic Expert', 'Ekspert ruchu'), description: () => t('Pass 200 vehicles.', 'Miń 200 pojazdów.'), goal: 200, icon: '200' },
    { name: () => t('Road Veteran', 'Weteran szosy'), description: () => t('Pass 500 vehicles.', 'Miń 500 pojazdów.'), goal: 500, icon: '500' },
    { name: () => t('Road Legend', 'Legenda szosy'), description: () => t('Pass 1000 vehicles.', 'Miń 1000 pojazdów.'), goal: 1000, icon: '1000' },
  ],
  labyrinth: [{ name: () => t('Maze Explorer', 'Odkrywca labiryntu'), description: () => t('Score 1 point in Labyrinth.', 'Zdobądź 1 punkt w Labiryncie.'), goal: 1, icon: 'L' }],
  'frog-crossing': [{ name: () => t('River Bound', 'Przez rzekę'), description: () => t('Score 1 point in Frog Crossing.', 'Zdobądź 1 punkt w Żabiej przeprawie.'), goal: 1, icon: 'F' }],
  tetris: [
    { name: () => t('Line Builder', 'Budowniczy linii'), description: () => t('Score 100 points in Tetris.', 'Zdobądź 100 punktów w Tetrisie.'), goal: 100, icon: '100' },
    { name: () => t('Block Stacker', 'Układacz klocków'), description: () => t('Score 500 points in Tetris.', 'Zdobądź 500 punktów w Tetrisie.'), goal: 500, icon: '500' },
    { name: () => t('Line Master', 'Mistrz linii'), description: () => t('Score 5000 points in Tetris.', 'Zdobądź 5000 punktów w Tetrisie.'), goal: 5000, icon: '5000' },
    { name: () => t('Block Expert', 'Ekspert klocków'), description: () => t('Score 20000 points in Tetris.', 'Zdobądź 20000 punktów w Tetrisie.'), goal: 20000, icon: '20k' },
    { name: () => t('Tetris Legend', 'Legenda Tetrisa'), description: () => t('Score 100000 points in Tetris.', 'Zdobądź 100000 punktów w Tetrisie.'), goal: 100000, icon: '100k' },
  ],
  'pac-man': [{ name: () => t('Maze Muncher', 'Pożeracz labiryntu'), description: () => t('Score 100 points in Pac-Man.', 'Zdobądź 100 punktów w Pac-Manie.'), goal: 100, icon: 'P' }],
  asteroids: [{ name: () => t('Asteroid Breaker', 'Pogromca asteroid'), description: () => t('Score 100 points in Asteroids.', 'Zdobądź 100 punktów w Asteroidach.'), goal: 100, icon: 'A' }],
};
