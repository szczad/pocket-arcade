export interface TilePattern {
  id: string;
  width: number;
  height: number;
  artwork: string;
}

export interface CoverPattern {
  /** Static SVG fragments from the local game modules, not player input. */
  artwork: string;
  patterns?: readonly TilePattern[];
}

export function tileGrid(columns: number, rows: number, tile: (x: number, y: number) => string): string {
  let artwork = '';
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) artwork += tile(x, y);
  }
  return artwork;
}

export function renderCover({ artwork, patterns }: CoverPattern): string {
  const tiles = patterns?.map(({ id, width, height, artwork }) =>
    `<pattern id="${id}" width="${width}" height="${height}" patternUnits="userSpaceOnUse">${artwork}</pattern>`,
  ).join('');
  return `<svg viewBox="0 0 320 200" aria-hidden="true" shape-rendering="crispEdges">${tiles ? `<defs>${tiles}</defs>` : ''}${artwork}</svg>`;
}
