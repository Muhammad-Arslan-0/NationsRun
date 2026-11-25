import Matter from 'matter-js';
import { CountryData } from '../data/countries';

export const MARBLE_RADIUS = 18;
export const TRAIL_LENGTH = 8;

const STUCK_CHECK_INTERVAL_MS = 2500;
const MIN_DISPLACEMENT_PX = 14;

export class MarbleBody {
  public readonly country: CountryData;
  public readonly body: Matter.Body;

  public finished = false;
  public eliminated = false;
  public finishTimeMs = 0;
  public rank = 0;

  // Anti-stuck state
  private lastCheckX: number;
  private lastCheckY: number;
  private lastCheckTimeMs = 0;
  private nudgeCount = 0;

  // Zero-allocation circular ring buffer for motion trail
  public readonly trailX = new Float32Array(TRAIL_LENGTH);
  public readonly trailY = new Float32Array(TRAIL_LENGTH);
  public trailHead = 0;
  public trailCount = 0;

  constructor(country: CountryData, body: Matter.Body) {
    this.country = country;
    this.body = body;
    this.lastCheckX = body.position.x;
    this.lastCheckY = body.position.y;
  }

  public recordTrail(): void {
    this.trailX[this.trailHead] = this.body.position.x;
    this.trailY[this.trailHead] = this.body.position.y;
    this.trailHead = (this.trailHead + 1) % TRAIL_LENGTH;
    if (this.trailCount < TRAIL_LENGTH) {
      this.trailCount++;
    }
  }

  public checkStuck(elapsedMs: number, worldWidth: number, worldHeight: number): void {
    const pos = this.body.position;

    // Out-of-bounds safeguard
    if (
      Number.isNaN(pos.x) ||
      Number.isNaN(pos.y) ||
      pos.x < -80 ||
      pos.x > worldWidth + 80 ||
      pos.y < -250 ||
      pos.y > worldHeight + 120
    ) {
      Matter.Body.setPosition(this.body, {
        x: worldWidth * 0.5 + (Math.random() - 0.5) * 120,
        y: Math.min(Math.max(220, pos.y - 120), worldHeight - 400),
      });
      Matter.Body.setVelocity(this.body, { x: 0, y: 2 });
      this.lastCheckX = this.body.position.x;
      this.lastCheckY = this.body.position.y;
      this.lastCheckTimeMs = elapsedMs;
      this.nudgeCount = 0;
      return;
    }

    if (elapsedMs - this.lastCheckTimeMs < STUCK_CHECK_INTERVAL_MS) {
      return;
    }

    const dx = pos.x - this.lastCheckX;
    const dy = pos.y - this.lastCheckY;
    const distSq = dx * dx + dy * dy;

    this.lastCheckX = pos.x;
    this.lastCheckY = pos.y;
    this.lastCheckTimeMs = elapsedMs;

    if (distSq < MIN_DISPLACEMENT_PX * MIN_DISPLACEMENT_PX) {
      this.nudgeCount++;
      if (this.nudgeCount <= 2) {
        // Gentle upward/lateral unstick impulse
        Matter.Body.setVelocity(this.body, {
          x: (Math.random() - 0.5) * 9,
          y: -5.5 - Math.random() * 3,
        });
      } else {
        // Re-drop slightly toward center channel so it rejoins the race cleanly
        const targetX = pos.x + (worldWidth * 0.5 - pos.x) * 0.35 + (Math.random() - 0.5) * 50;
        Matter.Body.setPosition(this.body, {
          x: Math.max(80, Math.min(worldWidth - 80, targetX)),
          y: Math.min(pos.y + 42, worldHeight - 250),
        });
        Matter.Body.setVelocity(this.body, { x: (Math.random() - 0.5) * 3, y: 4 });
        this.nudgeCount = 0;
      }
    } else {
      this.nudgeCount = 0;
    }
  }
}
