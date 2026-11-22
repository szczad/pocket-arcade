const svg = (content: string): string =>
  `<svg viewBox="0 0 320 200" aria-hidden="true" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;

const tetrisBlocks: [number, number, string][] = [
  [3, 4, '#bd91df'], [2, 5, '#bd91df'], [3, 5, '#bd91df'], [4, 5, '#bd91df'],
  [0, 19, '#68d6df'], [1, 19, '#68d6df'], [2, 19, '#68d6df'], [3, 19, '#68d6df'],
  [4, 18, '#f5d06b'], [5, 18, '#f5d06b'], [4, 19, '#f5d06b'], [5, 19, '#f5d06b'],
  [6, 19, '#829fe7'], [7, 19, '#829fe7'], [8, 19, '#829fe7'], [6, 18, '#829fe7'],
  [9, 18, '#efa76e'], [7, 17, '#efa76e'], [8, 17, '#efa76e'], [9, 17, '#efa76e'],
  [0, 18, '#86d990'], [1, 18, '#86d990'], [1, 17, '#86d990'], [2, 17, '#86d990'],
];
const tetris = svg(`
  <rect width="320" height="200" fill="#171e34"/>
  <rect x="91" y="7" width="96" height="186" fill="#36455c"/>
  <rect x="93" y="8" width="92" height="184" fill="#86e6c4"/>
  <rect x="94" y="10" width="90" height="180" fill="#10192b"/>
  ${Array.from({ length: 200 }, (_, i) => `<rect x="${94 + i % 10 * 9}" y="${10 + Math.floor(i / 10) * 9}" width="8" height="8" fill="#1c2940"/>`).join('')}
  ${tetrisBlocks.map(([col, row, color]) => {
    const x = 94 + col * 9, y = 10 + row * 9;
    return `<rect x="${x}" y="${y}" width="8" height="8" fill="${color}"/><path d="M${x + 1} ${y + 1}h5" stroke="#eef6db"/><path d="M${x + 1} ${y + 6}h6" stroke="#34465a"/>`;
  }).join('')}
  <g font-family="monospace" font-weight="bold"><text x="208" y="43" font-size="10" fill="#86e6c4">SCORE</text><text x="208" y="61" font-size="12" fill="#f5cf73">400</text><text x="208" y="90" font-size="10" fill="#86e6c4">LINES</text><text x="208" y="108" font-size="12" fill="#f5cf73">4</text></g>`);

const pacHalf = [
  '################', '#...............', '#.####.###.###..', '#.####.###.###..',
  '#...............', '#.####.#.#####..', '#......#....##..', '#.####.####.....',
  '#......#....###.', '#.####.#....#...', '#.####.#....#...', '#......#....####',
  '#.####.####.....', '#...............', '#.####.###.###..', '#...##..........',
  '#...##.###.###..', '#......#........', '#...............', '################',
];
const pacMan = svg(`
  <rect width="320" height="200" fill="#090d25"/>
  ${pacHalf.map((row, y) => Array.from({ length: 32 }, (_, x) => {
    const px = x * 10, py = y * 10;
    if (row[Math.min(x, 31 - x)] === '#') return `<rect x="${px}" y="${py}" width="10" height="10" fill="#293b9b"/><path d="M${px + 1} ${py + 1}h8" stroke="#465dcc"/><path d="M${px + 1} ${py + 8}h8" stroke="#1a286f"/>`;
    const power = (x === 1 || x === 30) && (y === 1 || y === 16);
    return `<rect x="${px + (power ? 3 : 4)}" y="${py + (power ? 3 : 4)}" width="${power ? 4 : 2}" height="${power ? 4 : 2}" fill="#f9dca5"/>`;
  }).join('')).join('')}
  ${[[140, 90, '#ff6078'], [150, 90, '#ff9bd1'], [170, 90, '#69dfe9']].map(([x, y, color]) => `<g transform="translate(${x} ${y})"><path d="M2 1h6v2h1v6H1V3h1z" fill="${color}"/><path d="M2 3h2v2H2zm4 0h2v2H6z" fill="#fff"/><path d="M3 4h1v1H3zm4 0h1v1H7z" fill="#202650"/></g>`).join('')}
  <path d="M152 151h6v1h1v6h-1v1h-6v-1h-1v-2h3v-2h-3v-2h1z" fill="#ffdc47"/>`);

const rock = (x: number, y: number, r: number): string => `<g transform="translate(${x} ${y})"><rect x="${-r + 3}" y="${-r}" width="${r * 2 - 6}" height="${r * 2}" fill="#60677b"/><rect x="${-r}" y="${-r + 4}" width="${r * 2}" height="${r * 2 - 8}" fill="#89909a"/><rect x="${-r + 4}" y="${-r + 3}" width="${r * 2 - 9}" height="3" fill="#b4b7b0"/><rect x="${-r + 6}" y="-3" width="6" height="4" fill="#60677b"/><rect x="2" y="${r - 7}" width="4" height="3" fill="#717987"/></g>`;
const asteroids = svg(`
  <rect width="320" height="200" fill="#10182e"/>
  ${Array.from({ length: 32 }, (_, i) => `<rect x="${(i * 79 + 13) % 320}" y="${(i * 113 + 19) % 200}" width="${i % 5 === 0 ? 2 : 1}" height="2" fill="${i % 5 === 0 ? '#f5cf73' : '#52637a'}"/>`).join('')}
  ${rock(53, 42, 18)}${rock(267, 55, 18)}${rock(74, 160, 13)}${rock(252, 153, 18)}${rock(205, 27, 8)}
  <path d="M158 90h4v4h2v8h3v5h-14v-5h3v-8h2z" fill="#86e6c4"/><path d="M153 105h4v4h-4zm10 0h4v4h-4z" fill="#398f86"/><rect x="158" y="97" width="4" height="4" fill="#203844"/>
  <path d="M157 107h6v6h-6z" fill="#ff7d80"/><path d="M159 108h2v7h-2z" fill="#f5cf73"/><path d="M158 68h4v4h-4zm0-18h4v4h-4z" fill="#ffe39a"/>`);

const revealed: Record<string, true> = Object.fromEntries(['4,2', '5,2', '6,2', '7,2', '8,2', '4,3', '5,3', '6,3', '7,3', '8,3', '9,3', '3,4', '4,4', '5,4', '6,4', '7,4', '8,4', '9,4', '3,5', '4,5', '5,5', '6,5', '7,5', '8,5', '9,5', '4,6', '5,6', '6,6', '7,6', '8,6'].map(key => [key, true]));
const numbers: Record<string, [string, string]> = {
  '4,2': ['1', '#75c9f0'], '5,2': ['1', '#75c9f0'], '7,2': ['1', '#75c9f0'], '8,2': ['2', '#86e6a7'],
  '4,3': ['1', '#75c9f0'], '8,3': ['1', '#75c9f0'], '9,3': ['2', '#86e6a7'], '3,4': ['1', '#75c9f0'],
  '9,4': ['1', '#75c9f0'], '3,5': ['1', '#75c9f0'], '9,5': ['1', '#75c9f0'], '4,6': ['1', '#75c9f0'], '5,6': ['1', '#75c9f0'], '8,6': ['1', '#75c9f0'],
};
const minesweeper = svg(`
  <rect width="320" height="200" fill="#18142e"/>
  ${Array.from({ length: 160 }, (_, i) => {
    const col = i % 16, row = Math.floor(i / 16), x = col * 20, y = row * 20, key = `${col},${row}`;
    if (revealed[key]) {
      const number = numbers[key];
      return `<rect x="${x + 1}" y="${y + 1}" width="18" height="18" fill="#302947"/>${number ? `<text x="${x + 10}" y="${y + 15}" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="14" fill="${number[1]}">${number[0]}</text>` : ''}`;
    }
    const flag = key === '6,1' || key === '10,4' || key === '6,7';
    return `<g transform="translate(${x} ${y})"><rect x="1" y="1" width="18" height="18" fill="#655779"/><path d="M2 18V2h16v2H4v14z" fill="#a898ae"/><path d="M3 17h14V3h2v16H3z" fill="#3a304d"/>${flag ? '<path d="M8 4h2v11h4v2H5v-2h3z" fill="#f5e9d2"/><path d="M10 4h6v3h-2v3h-4z" fill="#ff8883"/>' : ''}</g>`;
  }).join('')}`);

const scorchedEarth = svg(`
  <rect width="320" height="200" fill="#171b38"/><rect y="86" width="320" height="30" fill="#283353"/>
  <path d="M15 97h32v3H15zm210-8h48v3h-48z" fill="#36415b"/>
  <path d="M0 156h20v-3h20v-6h20v-3h20v2h20v7h20v8h20v5h20v-3h20v-8h20v-10h20v-5h20v2h20v6h20v6h20v3h20v43H0z" fill="#547a61"/>
  <path d="M0 168h20v-3h20v-6h20v-3h20v2h20v7h20v8h20v5h20v-3h20v-8h20v-10h20v-5h20v2h20v6h20v6h20v3h20v31H0z" fill="#405c50"/>
  <path d="M0 156h20v-3h20v-6h20v-3h20v2h20v7h20v8h20v5h20v-3h20v-8h20v-10h20v-5h20v2h20v6h20v6h20v3h20" fill="none" stroke="#a0b879" stroke-width="2"/>
  <g fill="#86e6c4"><path d="M64 137h12v6H64zm3-3h6v3h-6z"/><path d="M70 138l7-7" fill="none" stroke="#86e6c4" stroke-width="3"/></g><rect x="63" y="142" width="14" height="4" fill="#202737"/>
  <g fill="#ff8883"><path d="M244 135h12v6h-12zm3-3h6v3h-6z"/><path d="M250 136l-7-7" fill="none" stroke="#ff8883" stroke-width="3"/></g><rect x="243" y="140" width="14" height="4" fill="#202737"/>
  <path d="M91 112h4v4h-4zm23-20h4v4h-4zm24-12h4v4h-4zm25-3h4v4h-4z" fill="#ffe39a"/>
  <g font-family="monospace" font-size="9" font-weight="bold"><text x="8" y="16" fill="#86e6c4">YOU 100</text><text x="312" y="16" text-anchor="end" fill="#ff8883">CPU 100</text><text x="160" y="16" text-anchor="middle" fill="#f5e9d2">WIND &gt; 2</text><text x="160" y="33" text-anchor="middle" fill="#f5e9d2">ANGLE 45  POWER 65</text><text x="160" y="47" text-anchor="middle" fill="#f5e9d2">YOUR TURN</text></g>`);

export const classicCovers: Record<'tetris' | 'pac-man' | 'asteroids' | 'minesweeper' | 'scorched-earth', string> = {
  tetris,
  'pac-man': pacMan,
  asteroids,
  minesweeper,
  'scorched-earth': scorchedEarth,
};
