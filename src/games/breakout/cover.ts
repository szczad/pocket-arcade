import type { CoverPattern } from '../cover-renderer';

export const cover = {
  artwork: `
    <rect width="320" height="200" fill="#181b39"/><path d="M0 0h320v5H0zM0 0h4v200H0zm316 0h4v200h-4z" fill="#343660"/>
    <path d="M13 34h45v12H13zm49 0h45v12H62zm49 0h45v12h-45zm49 0h45v12h-45zm49 0h45v12h-45zm49 0h45v12h-45z" fill="#ff7882"/>
    <path d="M13 50h45v12H13zm49 0h45v12H62zm49 0h45v12h-45zm49 0h45v12h-45zm49 0h45v12h-45zm49 0h45v12h-45z" fill="#f4a867"/>
    <path d="M13 66h45v12H13zm49 0h45v12H62zm49 0h45v12h-45zm98 0h45v12h-45zm49 0h45v12h-45z" fill="#f5d36b"/>
    <path d="M13 82h45v12H13zm49 0h45v12H62zm147 0h45v12h-45zm49 0h45v12h-45z" fill="#78dfbd"/>
    <path d="M15 36h41v2H15zm49 0h41v2H64zm49 0h41v2h-41zm49 0h41v2h-41zm49 0h41v2h-41zm49 0h41v2h-41zM15 52h41v2H15zm49 0h41v2H64zm49 0h41v2h-41zm49 0h41v2h-41zm49 0h41v2h-41zm49 0h41v2h-41zM15 68h41v2H15zm49 0h41v2H64zm49 0h41v2h-41zm98 0h41v2h-41zm49 0h41v2h-41zM15 84h41v2H15zm49 0h41v2H64zm147 0h41v2h-41zm49 0h41v2h-41z" fill="#fff" opacity=".33"/>
    <path d="M12 12h6v6h-6zm9 0h6v6h-6zm9 0h6v6h-6z" fill="#ff7882"/><rect x="143" y="174" width="40" height="7" fill="#a4f5d0"/><rect x="184" y="123" width="8" height="8" fill="#fff"/>
  `,
} satisfies CoverPattern;
