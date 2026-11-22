import type { CoverPattern } from '../cover-renderer';

export const cover = {
  patterns: [{
    id: 'arcade-road-dividers', width: 4, height: 40,
    artwork: '<rect width="4" height="20" fill="#aab7b9"/>',
  }],
  artwork: `
    <rect width="320" height="200" fill="#203844"/><rect x="70" width="180" height="200" fill="#343a54"/><path d="M72 0h4v200h-4zm172 0h4v200h-4z" fill="#f5cf73"/><path d="M128 0h4v200h-4zm60 0h4v200h-4z" fill="url(#arcade-road-dividers)"/>
    <g transform="translate(87 32)"><path d="M-3 5h32v6H-3zm0 16h32v6H-3z" fill="#151d31"/><rect width="26" height="32" fill="#ff7d80"/><rect x="4" y="7" width="18" height="9" fill="#833f58"/><path d="M3 1h5v3H3zm15 0h5v3h-5z" fill="#f8e4a2"/></g>
    <g transform="translate(207 94)"><path d="M-3 5h32v6H-3zm0 16h32v6H-3z" fill="#151d31"/><rect width="26" height="32" fill="#ff7d80"/><rect x="4" y="7" width="18" height="9" fill="#833f58"/><path d="M3 1h5v3H3zm15 0h5v3h-5z" fill="#f8e4a2"/></g>
    <g transform="translate(147 150)"><path d="M-3 5h32v6H-3zm0 16h32v6H-3z" fill="#151d31"/><rect width="26" height="32" fill="#86e6c4"/><rect x="4" y="7" width="18" height="9" fill="#398f86"/><path d="M3 1h5v3H3zm15 0h5v3h-5z" fill="#f8e4a2"/></g>
  `,
} satisfies CoverPattern;
