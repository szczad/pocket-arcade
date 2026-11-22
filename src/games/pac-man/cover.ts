import { tileGrid, type CoverPattern } from '../cover-renderer';
import { PAC_MAZE } from './maze';

export const cover: CoverPattern = { artwork: `
  <rect width="320" height="200" fill="#090d25"/>
  ${tileGrid(32, PAC_MAZE.length, (x, y) => {
    const px = x * 10, py = y * 10;
    if (PAC_MAZE[y][Math.min(x, 31 - x)] === '#') return `<rect x="${px}" y="${py}" width="10" height="10" fill="#293b9b"/><path d="M${px + 1} ${py + 1}h8" stroke="#465dcc"/><path d="M${px + 1} ${py + 8}h8" stroke="#1a286f"/>`;
    const power = (x === 1 || x === 30) && (y === 1 || y === 16);
    return `<rect x="${px + (power ? 3 : 4)}" y="${py + (power ? 3 : 4)}" width="${power ? 4 : 2}" height="${power ? 4 : 2}" fill="#f9dca5"/>`;
  })}
  ${[[140, 90, '#ff6078'], [150, 90, '#ff9bd1'], [170, 90, '#69dfe9']].map(([x, y, color]) => `<g transform="translate(${x} ${y})"><path d="M2 1h6v2h1v6H1V3h1z" fill="${color}"/><path d="M2 3h2v2H2zm4 0h2v2H6z" fill="#fff"/><path d="M3 4h1v1H3zm4 0h1v1H7z" fill="#202650"/></g>`).join('')}
  <path d="M152 151h6v1h1v6h-1v1h-6v-1h-1v-2h3v-2h-3v-2h1z" fill="#ffdc47"/>` };
