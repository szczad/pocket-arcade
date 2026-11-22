export const arcadeCovers: Record<string, string> = {
  snake: `<svg viewBox="0 0 320 200" aria-hidden="true" shape-rendering="crispEdges">
    <defs><pattern id="arcade-snake-grid" width="20" height="20" patternUnits="userSpaceOnUse"><rect width="20" height="20" fill="#172c37"/><path d="M0 0h10v10H0zm10 10h10v10H10z" fill="#1c3540"/></pattern></defs>
    <rect width="320" height="200" fill="url(#arcade-snake-grid)"/>
    <path d="M71 121h8v8h-8zm10 0h8v8h-8zm10 0h8v8h-8zm10 0h8v8h-8zm10 0h8v8h-8zm10 0h8v8h-8zm10 0h8v8h-8zm10 0h8v8h-8zm0-10h8v8h-8zm0-10h8v8h-8zm0-10h8v8h-8zm0-10h8v8h-8zm10 0h8v8h-8zm10 0h8v8h-8zm10 0h8v8h-8zm10 0h8v8h-8z" fill="#59cba2"/>
    <rect x="191" y="81" width="8" height="8" fill="#a3f4c3"/><rect x="197" y="84" width="2" height="2" fill="#173641"/>
    <rect x="242" y="83" width="6" height="6" fill="#ff6f75"/><rect x="245" y="81" width="2" height="2" fill="#f5c763"/>
  </svg>`,
  breakout: `<svg viewBox="0 0 320 200" aria-hidden="true" shape-rendering="crispEdges">
    <rect width="320" height="200" fill="#181b39"/><path d="M0 0h320v5H0zM0 0h4v200H0zm316 0h4v200h-4z" fill="#343660"/>
    <path d="M13 34h45v12H13zm49 0h45v12H62zm49 0h45v12h-45zm49 0h45v12h-45zm49 0h45v12h-45zm49 0h45v12h-45z" fill="#ff7882"/>
    <path d="M13 50h45v12H13zm49 0h45v12H62zm49 0h45v12h-45zm49 0h45v12h-45zm49 0h45v12h-45zm49 0h45v12h-45z" fill="#f4a867"/>
    <path d="M13 66h45v12H13zm49 0h45v12H62zm49 0h45v12h-45zm98 0h45v12h-45zm49 0h45v12h-45z" fill="#f5d36b"/>
    <path d="M13 82h45v12H13zm49 0h45v12H62zm147 0h45v12h-45zm49 0h45v12h-45z" fill="#78dfbd"/>
    <path d="M15 36h41v2H15zm49 0h41v2H64zm49 0h41v2h-41zm49 0h41v2h-41zm49 0h41v2h-41zm49 0h41v2h-41zM15 52h41v2H15zm49 0h41v2H64zm49 0h41v2h-41zm49 0h41v2h-41zm49 0h41v2h-41zm49 0h41v2h-41zM15 68h41v2H15zm49 0h41v2H64zm49 0h41v2h-41zm98 0h41v2h-41zm49 0h41v2h-41zM15 84h41v2H15zm49 0h41v2H64zm147 0h41v2h-41zm49 0h41v2h-41z" fill="#fff" opacity=".33"/>
    <path d="M12 12h6v6h-6zm9 0h6v6h-6zm9 0h6v6h-6z" fill="#ff7882"/><rect x="143" y="174" width="40" height="7" fill="#a4f5d0"/><rect x="184" y="123" width="8" height="8" fill="#fff"/>
  </svg>`,
  'lane-dodger': `<svg viewBox="0 0 320 200" aria-hidden="true" shape-rendering="crispEdges">
    <rect width="320" height="200" fill="#203844"/><rect x="70" width="180" height="200" fill="#343a54"/><path d="M72 0h4v200h-4zm172 0h4v200h-4z" fill="#f5cf73"/><path d="M128 0h4v20h-4zm0 40h4v20h-4zm0 40h4v20h-4zm0 40h4v20h-4zm0 40h4v20h-4zm60-160h4v20h-4zm0 40h4v20h-4zm0 40h4v20h-4zm0 40h4v20h-4zm0 40h4v20h-4z" fill="#aab7b9"/>
    <g transform="translate(87 32)"><path d="M-3 5h32v6H-3zm0 16h32v6H-3z" fill="#151d31"/><rect width="26" height="32" fill="#ff7d80"/><rect x="4" y="7" width="18" height="9" fill="#833f58"/><path d="M3 1h5v3H3zm15 0h5v3h-5z" fill="#f8e4a2"/></g>
    <g transform="translate(207 94)"><path d="M-3 5h32v6H-3zm0 16h32v6H-3z" fill="#151d31"/><rect width="26" height="32" fill="#ff7d80"/><rect x="4" y="7" width="18" height="9" fill="#833f58"/><path d="M3 1h5v3H3zm15 0h5v3h-5z" fill="#f8e4a2"/></g>
    <g transform="translate(147 150)"><path d="M-3 5h32v6H-3zm0 16h32v6H-3z" fill="#151d31"/><rect width="26" height="32" fill="#86e6c4"/><rect x="4" y="7" width="18" height="9" fill="#398f86"/><path d="M3 1h5v3H3zm15 0h5v3h-5z" fill="#f8e4a2"/></g>
  </svg>`,
  labyrinth: `<svg viewBox="0 0 320 200" aria-hidden="true" shape-rendering="crispEdges">
    <defs><pattern id="arcade-maze-tiles" width="38" height="38" patternUnits="userSpaceOnUse"><rect width="38" height="38" fill="#382e4d"/><path d="M19 0h19v19H19zM0 19h19v19H0z" fill="#302947"/></pattern></defs>
    <rect width="320" height="200" fill="#18142e"/><rect x="8" y="5" width="304" height="190" fill="url(#arcade-maze-tiles)"/>
    <path d="M8 5h304v190H8z M84 5v19 M103 5v19 M217 5v19 M274 5v19 M8 24h19 M27 24h19 M46 24v19 M46 24h19 M84 24v19 M122 24v19 M122 24h19 M141 24h19 M160 24h19 M198 24v19 M217 24v19 M236 24v19 M236 24h19 M255 24v19 M274 24v19 M274 24h19 M27 43h19 M46 43v19 M65 43v19 M65 43h19 M84 43h19 M103 43h19 M122 43v19 M141 43v19 M141 43h19 M160 43h19 M179 43h19 M217 43v19 M236 43v19 M293 43v19 M8 62h19 M46 62v19 M84 62v19 M84 62h19 M122 62v19 M141 62h19 M160 62v19 M179 62h19 M198 62h19 M217 62v19 M236 62h19 M255 62h19 M274 62h19 M293 62h19 M27 81v19 M46 81v19 M46 81h19 M65 81h19 M103 81v19 M103 81h19 M122 81v19 M141 81v19 M160 81v19 M160 81h19 M179 81h19 M217 81v19 M236 81h19 M255 81h19 M274 81h19 M293 81v19 M27 100h19 M65 100v19 M65 100h19 M84 100h19 M103 100v19 M141 100v19 M160 100h19 M179 100v19 M198 100h19 M217 100v19 M217 100h19 M255 100v19 M255 100h19 M274 100h19 M27 119h19 M46 119h19 M84 119v19 M103 119h19 M122 119h19 M141 119v19 M160 119v19 M179 119v19 M179 119h19 M198 119v19 M217 119h19 M236 119v19 M255 119v19 M274 119v19 M274 119h19 M8 138h19 M27 138h19 M46 138h19 M65 138h19 M84 138v19 M84 138h19 M103 138h19 M122 138v19 M141 138h19 M179 138v19 M198 138v19 M198 138h19 M236 138v19 M255 138v19 M274 138v19 M274 138h19 M293 138h19 M27 157h19 M46 157h19 M65 157h19 M103 157v19 M122 157h19 M141 157v19 M141 157h19 M160 157h19 M179 157v19 M217 157v19 M217 157h19 M236 157h19 M255 157v19 M293 157v19 M27 176h19 M46 176h19 M65 176h19 M84 176h19 M103 176h19 M122 176v19 M160 176v19 M198 176h19 M236 176v19 M255 176h19 M274 176h19" fill="none" stroke="#a96e82" stroke-width="2"/>
    <path d="M13 9h9v3h3v9h-3v2h-3v-2h-3v2h-3v-2h-3v-9h3z" fill="#a9edb9"/><path d="M13 15h3v3h-3zm6 0h3v3h-3z" fill="#243f39"/>
    <path d="M292 179h9v3h3v9h-3v3h-9v-3h-3v-9h3z" fill="#b98054"/><path d="M292 182h9v3h-9zm0 3h3v3h-3zm6 0h3v3h-3zm-6 3h9v3h-9z" fill="#ffe18b"/>
  </svg>`,
  'frog-crossing': `<svg viewBox="0 0 320 200" aria-hidden="true" shape-rendering="crispEdges">
    <rect width="320" height="200" fill="#343a54"/><path d="M0 0h320v23H0zm0 177h320v23H0z" fill="#477b55"/><rect y="22" width="320" height="45" fill="#326b91"/>
    <path d="M8 38h18v2H8zm40 0h18v2H48zm40 0h18v2H88zm40 0h18v2h-18zm40 0h18v2h-18zm40 0h18v2h-18zm40 0h18v2h-18zm40 0h18v2h-18zM8 60h18v2H8zm40 0h18v2H48zm40 0h18v2H88zm40 0h18v2h-18zm40 0h18v2h-18zm40 0h18v2h-18zm40 0h18v2h-18zm40 0h18v2h-18z" fill="#8bd5d0"/>
    <path d="M15 26h72v16H15zm120 0h72v16h-72zm120 0h72v16h-72zM-50 48h72v16h-72zm120 0h72v16H70zm120 0h72v16h-72zm120 0h72v16h-72z" fill="#67452f"/><path d="M18 28h66v4H18zm120 0h66v4h-66zm120 0h62v4h-62zM0 50h19v4H0zm73 0h66v4H73zm120 0h66v4h-66z" fill="#bb8854"/>
    <path d="M0 89h320M0 111h320M0 133h320M0 155h320" stroke="#a4a5a2" stroke-dasharray="12 12"/>
    <path d="M24 72h60v15H24zm120 0h60v15h-60zm120 0h60v15h-60z" fill="#ff827d"/><path d="M35 75h35v7H35zm120 0h35v7h-35zm120 0h35v7h-35z" fill="#b7e0df"/>
    <path d="M60 94h60v15H60zm120 0h60v15h-60z" fill="#f5cc6d"/><path d="M71 97h35v7H71zm120 0h35v7h-35z" fill="#b7e0df"/>
    <path d="M16 116h60v15H16zm120 0h60v15h-60zm120 0h60v15h-60z" fill="#8dbfe7"/><path d="M27 119h35v7H27zm120 0h35v7h-35zm120 0h35v7h-35z" fill="#b7e0df"/>
    <path d="M82 138h40v15H82zm120 0h40v15h-40z" fill="#ff827d"/><path d="M93 141h15v7H93zm120 0h15v7h-15z" fill="#b7e0df"/>
    <path d="M28 160h40v15H28zm240 0h40v15h-40z" fill="#f5cc6d"/><path d="M39 163h15v7H39zm240 0h15v7h-15z" fill="#b7e0df"/>
    <path d="M4 183h7v3H4zm24 0h7v3h-7zm24 0h7v3h-7zm24 0h7v3h-7zm24 0h7v3h-7zm24 0h7v3h-7zm72 0h7v3h-7zm24 0h7v3h-7zm24 0h7v3h-7zm24 0h7v3h-7zm24 0h7v3h-7z" fill="#78b76b"/>
    <path d="M152 184h16v10h-16z" fill="#347d53"/><path d="M154 182h12v12h-12z" fill="#9be783"/><path d="M153 180h5v5h-5zm10 0h5v5h-5z" fill="#b8f59c"/><path d="M154 181h2v2h-2zm10 0h2v2h-2z" fill="#203b35"/>
  </svg>`,
};
