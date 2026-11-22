import type { CoverPattern } from '../cover-renderer';

export const cover = {
  patterns: [{
    id: 'arcade-river-ripples', width: 40, height: 2,
    artwork: '<rect x="8" width="18" height="2" fill="#8bd5d0"/>',
  }],
  artwork: `
    <rect width="320" height="200" fill="#343a54"/><path d="M0 0h320v23H0zm0 177h320v23H0z" fill="#477b55"/><rect y="22" width="320" height="45" fill="#326b91"/>
    <path d="M0 38h320v2H0zm0 22h320v2H0z" fill="url(#arcade-river-ripples)"/>
    <path d="M15 26h72v16H15zm120 0h72v16h-72zm120 0h72v16h-72zM-50 48h72v16h-72zm120 0h72v16H70zm120 0h72v16h-72zm120 0h72v16h-72z" fill="#67452f"/><path d="M18 28h66v4H18zm120 0h66v4h-66zm120 0h62v4h-62zM0 50h19v4H0zm73 0h66v4H73zm120 0h66v4h-66z" fill="#bb8854"/>
    <path d="M0 89h320M0 111h320M0 133h320M0 155h320" stroke="#a4a5a2" stroke-dasharray="12 12"/>
    <path d="M24 72h60v15H24zm120 0h60v15h-60zm120 0h60v15h-60z" fill="#ff827d"/><path d="M35 75h35v7H35zm120 0h35v7h-35zm120 0h35v7h-35z" fill="#b7e0df"/>
    <path d="M60 94h60v15H60zm120 0h60v15h-60z" fill="#f5cc6d"/><path d="M71 97h35v7H71zm120 0h35v7h-35z" fill="#b7e0df"/>
    <path d="M16 116h60v15H16zm120 0h60v15h-60zm120 0h60v15h-60z" fill="#8dbfe7"/><path d="M27 119h35v7H27zm120 0h35v7h-35zm120 0h35v7h-35z" fill="#b7e0df"/>
    <path d="M82 138h40v15H82zm120 0h40v15h-40z" fill="#ff827d"/><path d="M93 141h15v7H93zm120 0h15v7h-15z" fill="#b7e0df"/>
    <path d="M28 160h40v15H28zm240 0h40v15h-40z" fill="#f5cc6d"/><path d="M39 163h15v7H39zm240 0h15v7h-15z" fill="#b7e0df"/>
    <path d="M4 183h7v3H4zm24 0h7v3h-7zm24 0h7v3h-7zm24 0h7v3h-7zm24 0h7v3h-7zm24 0h7v3h-7zm72 0h7v3h-7zm24 0h7v3h-7zm24 0h7v3h-7zm24 0h7v3h-7zm24 0h7v3h-7z" fill="#78b76b"/>
    <path d="M152 184h16v10h-16z" fill="#347d53"/><path d="M154 182h12v12h-12z" fill="#9be783"/><path d="M153 180h5v5h-5zm10 0h5v5h-5z" fill="#b8f59c"/><path d="M154 181h2v2h-2zm10 0h2v2h-2z" fill="#203b35"/>
  `,
} satisfies CoverPattern;
