import type { CoverPattern } from '../cover-renderer';

const rock = (x: number, y: number, r: number): string => `<g transform="translate(${x} ${y})"><rect x="${-r + 3}" y="${-r}" width="${r * 2 - 6}" height="${r * 2}" fill="#60677b"/><rect x="${-r}" y="${-r + 4}" width="${r * 2}" height="${r * 2 - 8}" fill="#89909a"/><rect x="${-r + 4}" y="${-r + 3}" width="${r * 2 - 9}" height="3" fill="#b4b7b0"/><rect x="${-r + 6}" y="-3" width="6" height="4" fill="#60677b"/><rect x="2" y="${r - 7}" width="4" height="3" fill="#717987"/></g>`;
export const cover: CoverPattern = { artwork: `
  <rect width="320" height="200" fill="#10182e"/>
  ${Array.from({ length: 32 }, (_, i) => `<rect x="${(i * 79 + 13) % 320}" y="${(i * 113 + 19) % 200}" width="${i % 5 === 0 ? 2 : 1}" height="2" fill="${i % 5 === 0 ? '#f5cf73' : '#52637a'}"/>`).join('')}
  ${rock(53, 42, 18)}${rock(267, 55, 18)}${rock(74, 160, 13)}${rock(252, 153, 18)}${rock(205, 27, 8)}
  <path d="M158 90h4v4h2v8h3v5h-14v-5h3v-8h2z" fill="#86e6c4"/><path d="M153 105h4v4h-4zm10 0h4v4h-4z" fill="#398f86"/><rect x="158" y="97" width="4" height="4" fill="#203844"/>
  <path d="M157 107h6v6h-6z" fill="#ff7d80"/><path d="M159 108h2v7h-2z" fill="#f5cf73"/><path d="M158 68h4v4h-4zm0-18h4v4h-4z" fill="#ffe39a"/>` };
