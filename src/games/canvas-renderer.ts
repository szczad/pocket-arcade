import type { GameRenderer, TextStyle } from './renderer';

export class CanvasRenderer implements GameRenderer {
  private readonly context: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D is unavailable');
    this.context = context;
  }

  rectangle(color: string, x: number, y: number, width: number, height: number): void {
    this.context.fillStyle = color;
    this.context.fillRect(x, y, width, height);
  }

  line(color: string, width: number, x1: number, y1: number, x2: number, y2: number): void {
    const ctx = this.context;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  text(value: string, x: number, y: number, style: TextStyle): void {
    const ctx = this.context;
    ctx.fillStyle = style.color;
    ctx.font = style.font;
    ctx.textAlign = style.align;
    ctx.textBaseline = style.baseline;
    ctx.fillText(value, x, y);
  }

  transformed(x: number, y: number, angle: number, draw: () => void): void {
    const ctx = this.context;
    ctx.save();
    try {
      ctx.translate(x, y);
      if (angle) ctx.rotate(angle);
      draw();
    } finally {
      ctx.restore();
    }
  }
}
