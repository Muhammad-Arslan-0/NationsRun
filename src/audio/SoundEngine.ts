/**
 * Lightweight procedural Web Audio synthesizer for subtle marble clacks,
 * bumper dings, and level finish chimes. Zero external audio assets required.
 */
export class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private lastClackMs = 0;
  private lastBumperMs = 0;

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    if (!this.muted) {
      this.unlock();
    }
    return this.muted;
  }

  public unlock(): void {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playClack(intensity = 0.5): void {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = performance.now();
    if (now - this.lastClackMs < 45) return;
    this.lastClackMs = now;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(680 + Math.random() * 260, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.035);

    const vol = Math.min(0.06, 0.02 + intensity * 0.01);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  public playBumper(): void {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const now = performance.now();
    if (now - this.lastBumperMs < 60) return;
    this.lastBumperMs = now;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520 + Math.random() * 140, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.08);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.095);
  }

  public playFinish(isFirst: boolean): void {
    if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
    const t = this.ctx.currentTime;
    const freqs = isFirst ? [523.25, 659.25, 783.99, 1046.5] : [659.25, 880];

    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      const start = t + idx * 0.055;
      osc.frequency.setValueAtTime(f, start);
      gain.gain.setValueAtTime(isFirst ? 0.09 : 0.04, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.19);
    });
  }
}
