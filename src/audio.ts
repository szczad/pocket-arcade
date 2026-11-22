export class ArcadeAudio {
  private context: AudioContext | null = null;
  private musicNodes = new Set<OscillatorNode>();
  private effectNodes = new Set<OscillatorNode>();
  private timer: number | undefined;
  private beat = 0;
  private generation = 0;
  music = true;
  effects = true;

  async start(): Promise<void> {
    try {
      this.context ??= new AudioContext();
      const generation = ++this.generation;
      await this.context.resume();
      if (generation !== this.generation) return;
      this.stopMusic();
      if (this.music) {
        this.beat = 0;
        this.playBeat();
        this.timer = window.setInterval(() => this.playBeat(), 210);
      }
    } catch { /* Audio is optional. */ }
  }
  private tone(frequency: number, duration: number, type: OscillatorType, volume: number, nodes: Set<OscillatorNode>): void {
    const ctx = this.context;
    if (!ctx || ctx.state !== 'running') return;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    oscillator.connect(gain).connect(ctx.destination);
    nodes.add(oscillator);
    oscillator.onended = () => { nodes.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  }
  private playBeat(): void {
    const notes = [330, 392, 494, 392, 440, 523, 494, 392, 330, 392, 494, 587, 523, 440, 392, 294];
    this.tone(notes[this.beat % notes.length], .17, 'square', .025, this.musicNodes);
    if (this.beat % 2 === 0) this.tone([165, 131, 147, 123][Math.floor(this.beat / 4) % 4], .3, 'triangle', .045, this.musicNodes);
    this.beat++;
  }
  cue(end = false): void {
    if (!this.effects) return;
    this.tone(end ? 196 : 660, end ? .3 : .1, 'square', .045, this.effectNodes);
  }
  private stopNodes(nodes: Set<OscillatorNode>): void {
    for (const node of nodes) { try { node.stop(); } catch { /* already stopped */ } }
    nodes.clear();
  }
  stopMusic(): void { window.clearInterval(this.timer); this.timer = undefined; this.stopNodes(this.musicNodes); }
  stopEffects(): void { this.stopNodes(this.effectNodes); }
  stop(): void { this.generation++; this.stopMusic(); this.stopEffects(); }
}
