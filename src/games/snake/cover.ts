import type { CoverPattern } from '../cover-renderer';

export const cover = {
  patterns: [{
    id: 'arcade-snake-grid', width: 20, height: 20,
    artwork: '<rect width="20" height="20" fill="#172c37"/><path d="M0 0h10v10H0zm10 10h10v10H10z" fill="#1c3540"/>',
  }],
  artwork: `
    <rect width="320" height="200" fill="url(#arcade-snake-grid)"/>
    <path d="M71 121h8v8h-8zm10 0h8v8h-8zm10 0h8v8h-8zm10 0h8v8h-8zm10 0h8v8h-8zm10 0h8v8h-8zm10 0h8v8h-8zm10 0h8v8h-8zm0-10h8v8h-8zm0-10h8v8h-8zm0-10h8v8h-8zm0-10h8v8h-8zm10 0h8v8h-8zm10 0h8v8h-8zm10 0h8v8h-8zm10 0h8v8h-8z" fill="#59cba2"/>
    <rect x="191" y="81" width="8" height="8" fill="#a3f4c3"/><rect x="197" y="84" width="2" height="2" fill="#173641"/>
    <rect x="242" y="83" width="6" height="6" fill="#ff6f75"/><rect x="245" y="81" width="2" height="2" fill="#f5c763"/>
  `,
} satisfies CoverPattern;
