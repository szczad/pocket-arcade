export interface TextStyle {
  color: string;
  font: string;
  align: 'left' | 'center' | 'right';
  baseline: 'top' | 'middle';
}

/** Logical game drawing operations, independent of the display backend. */
export interface GameRenderer {
  rectangle(color: string, x: number, y: number, width: number, height: number): void;
  line(color: string, width: number, x1: number, y1: number, x2: number, y2: number): void;
  text(value: string, x: number, y: number, style: TextStyle): void;
  transformed(x: number, y: number, angle: number, draw: () => void): void;
}
