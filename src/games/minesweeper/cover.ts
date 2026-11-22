import { tileGrid, type CoverPattern } from '../cover-renderer';

const revealed: Record<string, true> = Object.fromEntries(['4,2', '5,2', '6,2', '7,2', '8,2', '4,3', '5,3', '6,3', '7,3', '8,3', '9,3', '3,4', '4,4', '5,4', '6,4', '7,4', '8,4', '9,4', '3,5', '4,5', '5,5', '6,5', '7,5', '8,5', '9,5', '4,6', '5,6', '6,6', '7,6', '8,6'].map(key => [key, true]));
const numbers: Record<string, [string, string]> = {
  '4,2': ['1', '#75c9f0'], '5,2': ['1', '#75c9f0'], '7,2': ['1', '#75c9f0'], '8,2': ['2', '#86e6a7'],
  '4,3': ['1', '#75c9f0'], '8,3': ['1', '#75c9f0'], '9,3': ['2', '#86e6a7'], '3,4': ['1', '#75c9f0'],
  '9,4': ['1', '#75c9f0'], '3,5': ['1', '#75c9f0'], '9,5': ['1', '#75c9f0'], '4,6': ['1', '#75c9f0'], '5,6': ['1', '#75c9f0'], '8,6': ['1', '#75c9f0'],
};
export const cover: CoverPattern = { artwork: `
  <rect width="320" height="200" fill="#18142e"/>
  ${tileGrid(16, 10, (col, row) => {
    const x = col * 20, y = row * 20, key = `${col},${row}`;
    if (revealed[key]) {
      const number = numbers[key];
      return `<rect x="${x + 1}" y="${y + 1}" width="18" height="18" fill="#302947"/>${number ? `<text x="${x + 10}" y="${y + 15}" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="${number[1]}">${number[0]}</text>` : ''}`;
    }
    const flag = key === '6,1' || key === '10,4' || key === '6,7';
    return `<g transform="translate(${x} ${y})"><rect x="1" y="1" width="18" height="18" fill="#655779"/><path d="M2 18V2h16v2H4v14z" fill="#a898ae"/><path d="M3 17h14V3h2v16H3z" fill="#3a304d"/>${flag ? '<path d="M8 4h2v11h4v2H5v-2h3z" fill="#f5e9d2"/><path d="M10 4h6v3h-2v3h-4z" fill="#ff8883"/>' : ''}</g>`;
  })}` };
