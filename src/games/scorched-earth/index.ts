import type { GameDefinition } from '../types';
import { cover } from './cover';
import { ScorchedEarth } from './game';

export const game = {
  id: 'scorched-earth',
  name: "game-picker\u0004Scorched Earth",
  description: "Aim, fire and outlast the enemy tank.",
  instructions: "Duel the computer. Left and right adjust angle; up and down adjust power. Account for the wind and hit the enemy tank.",
  color: 'gold',
  cover,
  accountName: 'Scorched Earth',
  hint: "Use arrow keys or WASD to aim. Press Space or Fire to shoot; touch controls are below.",
  options: [{
    id: 'difficulty',
    label: 'Difficulty',
    kind: 'select',
    defaultValue: 'medium',
    choices: [
      { value: 'easy', label: 'Easy' },
      { value: 'medium', label: 'difficulty\u0004Medium' },
      { value: 'hard', label: 'Hard' },
    ],
  }],
  create(_speed, options) {
    const difficulty = options.difficulty;
    return new ScorchedEarth(difficulty === 'easy' || difficulty === 'hard' ? difficulty : 'medium');
  },
} satisfies GameDefinition;
