import Matter from 'matter-js';
import { FlagCache } from '../assets/flagCache';
import { ZoneMarker } from '../levels/types';
import { MARBLE_RADIUS, MarbleBody, TRAIL_LENGTH } from '../physics/MarbleBody';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { Camera } from './Camera';

const MAX_PARTICLES = 120;

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D;
  private dpr = 1;
  private viewW = 800;
  private viewH = 600;

  // Pre-allocated particle pool (zero per-frame allocations)
  private readonly pActive = new Uint8Array(MAX_PARTICLES);
  private readonly pX = new Float32Array(MAX_PARTICLES);
  private readonly pY = new Float32Array(MAX_PARTICLES);
  private readonly pVx = new Float32Array(MAX_PARTICLES);
  private readonly pVy = new Float32Array(MAX_PARTICLES);
  private readonly pLife = new Float32Array(MAX_PARTICLES);
  private readonly pMaxLife = new Float32Array(MAX_PARTICLES);
  private readonly pColor: string[] = new Array(MAX_PARTICLES).fill('#00D2FF');
  private pCursor = 0;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly flagCache: FlagCache,
  ) {
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('Could not initialize 2D canvas context');
    }
    this.ctx = context;
  }

  public resize(width: number, height: number): void {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.viewW = Math.max(1, width);
    this.viewH = Math.max(1, height);
    this.canvas.width = Math.floor(this.viewW * this.dpr);
    this.canvas.height = Math.floor(this.viewH * this.dpr);
  }

  public getViewportWidth(): number {
    return this.viewW;
  }

  public getViewportHeight(): number {
    return this.viewH;
  }

  public spawnBurst(x: number, y: number, color: string, count = 10): void {
    for (let i = 0; i < count; i++) {
      const idx = this.pCursor;
      this.pCursor = (this.pCursor + 1) % MAX_PARTICLES;
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const speed = 1.8 + Math.random() * 4.2;
      this.pActive[idx] = 1;
      this.pX[idx] = x;
      this.pY[idx] = y;
      this.pVx[idx] = Math.cos(angle) * speed;
      this.pVy[idx] = Math.sin(angle) * speed;
      this.pLife[idx] = 0.45;
      this.pMaxLife[idx] = 0.45;
      this.pColor[idx] = color;
    }
  }

  public clearParticles(): void {
    this.pActive.fill(0);
  }

  public render(
    world: PhysicsWorld,
    camera: Camera,
    leaderBodyId: number | null,
    zones: readonly ZoneMarker[],
    dtSec: number,
  ): void {
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Matte studio background
    ctx.fillStyle = '#0B0C10';
    ctx.fillRect(0, 0, this.viewW, this.viewH);

    // Apply camera transform
    ctx.save();
    ctx.translate(this.viewW * 0.5, this.viewH * 0.5);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    const halfVisH = (this.viewH * 0.5) / camera.zoom;
    const viewTop = camera.y - halfVisH - 220;
    const viewBottom = camera.y + halfVisH + 220;

    // Subtle architectural elevation markers & zone dividers
    this.drawCourseBackdrop(ctx, world.worldWidth, world.worldHeight, viewTop, viewBottom, zones);

    // Draw course bodies (viewport Y-culled for locked 60fps across 21,600px)
    const bodies = Matter.Composite.allBodies(world.engine.world);
    const nowMs = world.elapsedMs;

    for (let i = 0; i < bodies.length; i++) {
      const body = bodies[i];
      if (body.label === 'marble') continue;
      if (body.bounds.max.y < viewTop || body.bounds.min.y > viewBottom) continue;
      const meta = world.visualMeta.get(body.id);
      if (!meta) continue;

      if (meta.kind === 'finish') {
        this.drawFinishLine(ctx, body.position.x, body.position.y, meta.width ?? 1000, meta.height ?? 44);
      } else if (meta.kind === 'bumper') {
        const flashing = (meta.hitFlashUntil ?? 0) > nowMs;
        this.drawBumper(ctx, body.position.x, body.position.y, meta.radius ?? 36, meta.color ?? '#FF5722', flashing);
      } else if (meta.kind === 'pin') {
        this.drawPin(ctx, body.position.x, body.position.y, meta.radius ?? 11);
      } else if (meta.kind === 'pendulum') {
        this.drawPendulumBob(ctx, body.position.x, body.position.y, meta.radius ?? 42, meta.accent ?? '#00D2FF');
      } else {
        this.drawStructuralBody(ctx, body, meta.kind, meta.accent);
      }
    }

    // Subtle motion trails
    this.drawTrails(ctx, world.marbles);

    // Marbles
    const diameter = MARBLE_RADIUS * 2;
    for (let i = 0; i < world.marbles.length; i++) {
      const m = world.marbles[i];
      if (m.eliminated) continue;
      const pos = m.body.position;
      const sprite = this.flagCache.getSprite(m.country.code);

      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(m.body.angle);

      if (sprite) {
        ctx.drawImage(sprite, -MARBLE_RADIUS, -MARBLE_RADIUS, diameter, diameter);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, MARBLE_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = m.country.color;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();

      // Clean leader ring
      if (m.body.id === leaderBodyId && !m.finished) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, MARBLE_RADIUS + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#FF5722';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    this.updateAndDrawParticles(ctx, dtSec);
    ctx.restore();
  }

  private drawCourseBackdrop(
    ctx: CanvasRenderingContext2D,
    worldWidth: number,
    worldHeight: number,
    viewTop: number,
    viewBottom: number,
    zones: readonly ZoneMarker[],
  ): void {
    // Course interior matte surface
    ctx.fillStyle = '#111318';
    ctx.fillRect(0, 0, worldWidth, worldHeight);

    const startY = Math.max(0, Math.floor(viewTop / 200) * 200);
    const endY = Math.min(worldHeight, viewBottom);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let y = startY; y <= endY; y += 200) {
      ctx.moveTo(40, y);
      ctx.lineTo(worldWidth - 40, y);
    }
    ctx.stroke();

    // Zone divider lines & labels
    for (let i = 0; i < zones.length; i++) {
      const z = zones[i];
      if (z.startY < viewTop || z.startY > viewBottom || z.startY === 0) continue;

      ctx.strokeStyle = 'rgba(255, 87, 34, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(44, z.startY);
      ctx.lineTo(worldWidth - 44, z.startY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = 'rgba(255, 87, 34, 0.78)';
      ctx.font = '700 12px ui-monospace, Consolas, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`ZONE ${String(z.id).padStart(2, '0')} — ${z.name.toUpperCase()}`, 54, z.startY - 6);
    }
  }

  private drawStructuralBody(
    ctx: CanvasRenderingContext2D,
    body: Matter.Body,
    kind: string,
    accent?: string,
  ): void {
    const verts = body.vertices;
    if (verts.length === 0) return;

    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    for (let i = 1; i < verts.length; i++) {
      ctx.lineTo(verts[i].x, verts[i].y);
    }
    ctx.closePath();

    if (kind === 'spinner') {
      ctx.fillStyle = '#252834';
    } else if (kind === 'gate') {
      ctx.fillStyle = '#2D2121';
    } else if (kind === 'seesaw') {
      ctx.fillStyle = '#262936';
    } else {
      ctx.fillStyle = '#222630';
    }
    ctx.fill();

    // Clean tactile edge rather than neon outline
    ctx.strokeStyle = kind === 'gate' ? (accent ?? '#FF5722') : '#383E4E';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  private drawPin(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#2C313D';
    ctx.fill();
    ctx.strokeStyle = '#6B7280';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, r * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#D1D5DB';
    ctx.fill();
  }

  private drawBumper(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    color: string,
    flashing: boolean,
  ): void {
    ctx.beginPath();
    ctx.arc(x, y, r + (flashing ? 3 : 0), 0, Math.PI * 2);
    ctx.fillStyle = flashing ? '#FDE68A' : '#1E2028';
    ctx.fill();
    ctx.strokeStyle = flashing ? '#FFFFFF' : color;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, r * 0.48, 0, Math.PI * 2);
    ctx.fillStyle = flashing ? '#FFFFFF' : '#2D313D';
    ctx.fill();
  }

  private drawPendulumBob(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    accent: string,
  ): void {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = '#1E222B';
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, r * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = '#9CA3AF';
    ctx.fill();
  }

  private drawFinishLine(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    w: number,
    h: number,
  ): void {
    const left = cx - w / 2;
    const top = cy - h / 2;

    // Authentic black & white checkered racing strip
    const cell = 20;
    const cols = Math.floor(w / cell);
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < cols; c++) {
        ctx.fillStyle = (r + c) % 2 === 0 ? '#E5E7EB' : '#181A20';
        ctx.fillRect(left + c * cell, top + r * 8, cell, 8);
      }
    }

    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(left, top + 16, w, h - 16);

    ctx.fillStyle = '#9CA3AF';
    ctx.font = '700 12px ui-monospace, Consolas, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FINISH', cx, cy + 8);
  }

  private drawTrails(ctx: CanvasRenderingContext2D, marbles: readonly MarbleBody[]): void {
    ctx.lineCap = 'round';
    for (let i = 0; i < marbles.length; i++) {
      const m = marbles[i];
      if (m.finished || m.eliminated || m.trailCount < 2) continue;
      const speedSq = m.body.velocity.x ** 2 + m.body.velocity.y ** 2;
      if (speedSq < 42) continue;

      ctx.beginPath();
      const startIdx = (m.trailHead - m.trailCount + TRAIL_LENGTH) % TRAIL_LENGTH;
      ctx.moveTo(m.trailX[startIdx], m.trailY[startIdx]);
      for (let t = 1; t < m.trailCount; t++) {
        const idx = (startIdx + t) % TRAIL_LENGTH;
        ctx.lineTo(m.trailX[idx], m.trailY[idx]);
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.lineWidth = 4;
      ctx.stroke();
    }
  }

  private updateAndDrawParticles(ctx: CanvasRenderingContext2D, dtSec: number): void {
    const stepScale = dtSec * 60;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      if (!this.pActive[i]) continue;
      this.pLife[i] -= dtSec;
      if (this.pLife[i] <= 0) {
        this.pActive[i] = 0;
        continue;
      }
      this.pX[i] += this.pVx[i] * stepScale;
      this.pY[i] += this.pVy[i] * stepScale;

      const alpha = Math.max(0, this.pLife[i] / this.pMaxLife[i]);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = this.pColor[i];
      ctx.beginPath();
      ctx.arc(this.pX[i], this.pY[i], 3 * alpha + 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
}
