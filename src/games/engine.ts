import { CanvasRenderer } from './canvas-renderer';

export interface Resolution {
  width: number;
  height: number;
}

/** Owns the logical pixel address space and its display surface. */
export class GameEngine {
  readonly renderer: CanvasRenderer;
  readonly resolution: Readonly<Resolution>;

  constructor(private readonly canvas: HTMLCanvasElement, resolution: Resolution = { width: 320, height: 200 }) {
    this.resolution = Object.freeze({ ...resolution });
    canvas.width = resolution.width;
    canvas.height = resolution.height;
    this.renderer = new CanvasRenderer(canvas);
  }

  pointerPosition(clientX: number, clientY: number): { x: number; y: number } | null {
    const bounds = this.canvas.getBoundingClientRect();
    const x = (clientX - bounds.left) * this.resolution.width / bounds.width;
    const y = (clientY - bounds.top) * this.resolution.height / bounds.height;
    return x >= 0 && x < this.resolution.width && y >= 0 && y < this.resolution.height ? { x, y } : null;
  }
}
