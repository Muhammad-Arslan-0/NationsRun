import Matter from 'matter-js';
import { CountryData } from '../data/countries';
import { MarbleBody, MARBLE_RADIUS } from './MarbleBody';

export const FIXED_DT_MS = 1000 / 60;
const SUB_STEPS = 3;
const SUB_STEP_MS = FIXED_DT_MS / SUB_STEPS;
const MAX_MARBLE_SPEED = 11.5;

export interface BodyVisualMeta {
  kind: 'wall' | 'spinner' | 'bumper' | 'gate' | 'pendulum' | 'seesaw' | 'pin' | 'finish' | 'chamber';
  color?: string;
  accent?: string;
  radius?: number;
  width?: number;
  height?: number;
  hitFlashUntil?: number;
}

export type DynamicUpdater = (elapsedMs: number, dtMs: number) => void;

export interface PhysicsCallbacks {
  onFinish?: (marble: MarbleBody) => void;
  onBumperHit?: (bumperBody: Matter.Body, marble: MarbleBody, speed: number) => void;
  onMarbleClack?: (speed: number) => void;
}

export class PhysicsWorld {
  public readonly engine: Matter.Engine;
  public readonly marbles: MarbleBody[] = [];
  public readonly marbleByBodyId = new Map<number, MarbleBody>();
  public readonly visualMeta = new Map<number, BodyVisualMeta>();
  private readonly updaters: DynamicUpdater[] = [];
  private callbacks: PhysicsCallbacks = {};
  public elapsedMs = 0;
  public worldWidth = 1200;
  public worldHeight = 3600;

  constructor(callbacks: PhysicsCallbacks = {}) {
    this.callbacks = callbacks;
    this.engine = Matter.Engine.create({
      positionIterations: 10,
      velocityIterations: 8,
      constraintIterations: 4,
    });
    this.engine.gravity.x = 0;
    this.engine.gravity.y = 0.68;
    this.engine.gravity.scale = 0.001;

    this.bindCollisions();
  }

  public setCallbacks(callbacks: PhysicsCallbacks): void {
    this.callbacks = callbacks;
  }

  public reset(worldWidth: number, worldHeight: number): void {
    Matter.Composite.clear(this.engine.world, false);
    this.marbles.length = 0;
    this.marbleByBodyId.clear();
    this.visualMeta.clear();
    this.updaters.length = 0;
    this.elapsedMs = 0;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
  }

  public addStaticBody(body: Matter.Body, meta: BodyVisualMeta): Matter.Body {
    this.visualMeta.set(body.id, meta);
    Matter.Composite.add(this.engine.world, body);
    return body;
  }

  public addConstraint(constraint: Matter.Constraint): Matter.Constraint {
    Matter.Composite.add(this.engine.world, constraint);
    return constraint;
  }

  public addUpdater(fn: DynamicUpdater): void {
    this.updaters.push(fn);
  }

  public spawnMarble(country: CountryData, x: number, y: number): MarbleBody {
    const body = Matter.Bodies.circle(x, y, MARBLE_RADIUS, {
      label: 'marble',
      restitution: 0.52,
      friction: 0.0005,
      frictionStatic: 0,
      frictionAir: 0.0008,
      density: 0.0022,
      slop: 0.01,
    });
    // Slight initial random angular velocity for visual liveliness
    Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.08);

    const marble = new MarbleBody(country, body);
    this.marbles.push(marble);
    this.marbleByBodyId.set(body.id, marble);
    Matter.Composite.add(this.engine.world, body);
    return marble;
  }

  public step(raceActive: boolean): void {
    this.elapsedMs += FIXED_DT_MS;

    for (let i = 0; i < this.updaters.length; i++) {
      this.updaters[i](this.elapsedMs, FIXED_DT_MS);
    }

    for (let s = 0; s < SUB_STEPS; s++) {
      Matter.Engine.update(this.engine, SUB_STEP_MS);
      this.clampMarbleVelocities();
    }

    // Update trails and anti-stuck checks once per frame
    for (let i = 0; i < this.marbles.length; i++) {
      const m = this.marbles[i];
      if (!m.finished && !m.eliminated) {
        m.recordTrail();
        if (raceActive) {
          m.checkStuck(this.elapsedMs, this.worldWidth, this.worldHeight);
        }
      }
    }
  }

  private clampMarbleVelocities(): void {
    const maxSq = MAX_MARBLE_SPEED * MAX_MARBLE_SPEED;
    for (let i = 0; i < this.marbles.length; i++) {
      const body = this.marbles[i].body;
      const vx = body.velocity.x;
      const vy = body.velocity.y;
      const speedSq = vx * vx + vy * vy;
      if (speedSq > maxSq) {
        const scale = MAX_MARBLE_SPEED / Math.sqrt(speedSq);
        Matter.Body.setVelocity(body, { x: vx * scale, y: vy * scale });
      }
    }
  }

  private bindCollisions(): void {
    Matter.Events.on(this.engine, 'collisionStart', (event) => {
      const pairs = event.pairs;
      for (let i = 0; i < pairs.length; i++) {
        const { bodyA, bodyB } = pairs[i];
        const mA = this.marbleByBodyId.get(bodyA.id);
        const mB = this.marbleByBodyId.get(bodyB.id);

        if (mA && mB) {
          const dvx = bodyA.velocity.x - bodyB.velocity.x;
          const dvy = bodyA.velocity.y - bodyB.velocity.y;
          const relSpeed = Math.hypot(dvx, dvy);
          if (relSpeed > 3.5) {
            this.callbacks.onMarbleClack?.(relSpeed);
          }
          continue;
        }

        const marble = mA ?? mB;
        const other = mA ? bodyB : bodyA;
        if (!marble) continue;

        if (other.label === 'finish' && !marble.finished && !marble.eliminated) {
          marble.finished = true;
          marble.finishTimeMs = this.elapsedMs;
          this.callbacks.onFinish?.(marble);
        } else if (other.label === 'bumper') {
          const meta = this.visualMeta.get(other.id);
          if (meta) {
            meta.hitFlashUntil = this.elapsedMs + 140;
          }
          // Extra pinball kick away from bumper center
          const dx = marble.body.position.x - other.position.x;
          const dy = marble.body.position.y - other.position.y;
          const dist = Math.hypot(dx, dy) || 1;
          const kick = 7.2;
          Matter.Body.setVelocity(marble.body, {
            x: (dx / dist) * kick + (Math.random() - 0.5) * 1.5,
            y: (dy / dist) * kick - 1.5,
          });
          this.callbacks.onBumperHit?.(other, marble, kick);
        }
      }
    });
  }
}
