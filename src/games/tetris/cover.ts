import { tileGrid, type CoverPattern } from '../cover-renderer';

const tetrisBlocks: [number, number, string][] = [
  [3, 4, '#bd91df'], [2, 5, '#bd91df'], [3, 5, '#bd91df'], [4, 5, '#bd91df'],
  [0, 19, '#68d6df'], [1, 19, '#68d6df'], [2, 19, '#68d6df'], [3, 19, '#68d6df'],
  [4, 18, '#f5d06b'], [5, 18, '#f5d06b'], [4, 19, '#f5d06b'], [5, 19, '#f5d06b'],
  [6, 19, '#829fe7'], [7, 19, '#829fe7'], [8, 19, '#829fe7'], [6, 18, '#829fe7'],
  [9, 18, '#efa76e'], [7, 17, '#efa76e'], [8, 17, '#efa76e'], [9, 17, '#efa76e'],
  [0, 18, '#86d990'], [1, 18, '#86d990'], [1, 17, '#86d990'], [2, 17, '#86d990'],
];
export const cover: CoverPattern = { artwork: `
  <rect width="320" height="200" fill="#171e34"/>
  <rect x="91" y="7" width="96" height="186" fill="#36455c"/>
  <rect x="93" y="8" width="92" height="184" fill="#86e6c4"/>
  <rect x="94" y="10" width="90" height="180" fill="#10192b"/>
  ${tileGrid(10, 20, (x, y) => `<rect x="${94 + x * 9}" y="${10 + y * 9}" width="8" height="8" fill="#1c2940"/>`)}
  ${tetrisBlocks.map(([col, row, color]) => {
    const x = 94 + col * 9, y = 10 + row * 9;
    return `<rect x="${x}" y="${y}" width="8" height="8" fill="${color}"/><path d="M${x + 1} ${y + 1}h5" stroke="#eef6db"/><path d="M${x + 1} ${y + 6}h6" stroke="#34465a"/>`;
  }).join('')}
  <g font-family="monospace" font-weight="bold"><text x="208" y="43" font-size="10" fill="#86e6c4">SCORE</text><text x="208" y="61" font-size="12" fill="#f5cf73">400</text><text x="208" y="90" font-size="10" fill="#86e6c4">LINES</text><text x="208" y="108" font-size="12" fill="#f5cf73">4</text></g>` };
