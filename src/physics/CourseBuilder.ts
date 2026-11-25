import Matter from 'matter-js';
import { BodyVisualMeta, PhysicsWorld } from './PhysicsWorld';

const DEG2RAD = Math.PI / 180;

export class CourseBuilder {
  constructor(private readonly world: PhysicsWorld) {}

  public addBoundaryWalls(width: number, height: number, wallThickness = 40): void {
    const halfT = wallThickness / 2;
    // Left & Right outer walls
    this.addWall(halfT, height / 2, wallThickness, height + 200, 0, {
      kind: 'wall',
      color: '#1E222D',
      accent: '#2D3343',
    });
    this.addWall(width - halfT, height / 2, wallThickness, height + 200, 0, {
      kind: 'wall',
      color: '#1E222D',
      accent: '#2D3343',
    });
    // Top cap
    this.addWall(width / 2, -60, width, 40, 0, {
      kind: 'wall',
      color: '#1E222D',
    });
    // Bottom floor below finish line
    this.addWall(width / 2, height - halfT, width, wallThickness, 0, {
      kind: 'wall',
      color: '#1E222D',
      accent: '#7C3AED',
    });
  }

  public addWall(
    x: number,
    y: number,
    w: number,
    h: number,
    angleDeg = 0,
    meta: Partial<BodyVisualMeta> = {},
  ): Matter.Body {
    const safeW = Math.max(w, 28);
    const safeH = Math.max(h, 28);
    const useRounded = meta.rounded ?? false;
    const chamferRadius = useRounded ? Math.min(safeW, safeH) * 0.45 : 0;

    const body = Matter.Bodies.rectangle(x, y, safeW, safeH, {
      isStatic: true,
      angle: angleDeg * DEG2RAD,
      friction: 0.0005,
      frictionStatic: 0,
      restitution: 0.4,
      slop: 0.01,
      ...(chamferRadius > 0 ? { chamfer: { radius: chamferRadius } } : {}),
    });
    return this.world.addStaticBody(body, {
      kind: 'wall',
      color: '#252936',
      accent: '#3B4257',
      width: safeW,
      height: safeH,
      rounded: useRounded,
      ...meta,
    });
  }

  public addRamp(
    x: number,
    y: number,
    length: number,
    angleDeg: number,
    thickness = 28,
    color = '#252936',
    accent = '#7C3AED',
  ): Matter.Body {
    return this.addWall(x, y, length, thickness, angleDeg, {
      kind: 'wall',
      color,
      accent,
      rounded: true,
    });
  }

  public addPin(x: number, y: number, radius = 12, restitution = 0.72, color = '#00D2FF'): Matter.Body {
    const body = Matter.Bodies.circle(x, y, radius, {
      isStatic: true,
      restitution,
      friction: 0.01,
    });
    return this.world.addStaticBody(body, {
      kind: 'pin',
      radius,
      color,
    });
  }

  public addPlinkoGrid(
    centerX: number,
    startY: number,
    cols: number,
    rows: number,
    spacingX: number,
    spacingY: number,
    pinRadius = 11,
    restitution = 0.75,
  ): void {
    for (let r = 0; r < rows; r++) {
      const isOdd = r % 2 === 1;
      const rowCols = isOdd ? cols - 1 : cols;
      const rowWidth = (rowCols - 1) * spacingX;
      const startX = centerX - rowWidth / 2;
      const y = startY + r * spacingY;
      for (let c = 0; c < rowCols; c++) {
        this.addPin(startX + c * spacingX, y, pinRadius, restitution);
      }
    }
  }

  public addBumper(x: number, y: number, radius = 34, color = '#FF5722'): Matter.Body {
    const body = Matter.Bodies.circle(x, y, radius, {
      isStatic: true,
      label: 'bumper',
      restitution: 1.0,
      friction: 0,
    });
    return this.world.addStaticBody(body, {
      kind: 'bumper',
      radius,
      color,
      accent: '#FFD166',
    });
  }

  public addDome(
    cx: number,
    cy: number,
    radius: number,
    startDeg = 180,
    endDeg = 360,
    segments = 10,
    thickness = 28,
    color = '#21252F',
  ): void {
    const smoothSegs = Math.max(segments, 18);
    const step = (endDeg - startDeg) / smoothSegs;
    const segLen = 2 * radius * Math.sin((Math.abs(step) * DEG2RAD) / 2) + 8;
    for (let i = 0; i < smoothSegs; i++) {
      const midDeg = startDeg + (i + 0.5) * step;
      const rad = midDeg * DEG2RAD;
      const px = cx + Math.cos(rad) * radius;
      const py = cy + Math.sin(rad) * radius;
      this.addWall(px, py, segLen, thickness, midDeg + 90, {
        kind: 'wall',
        color,
        hidden: true,
      });
    }

    const sRad = Math.min(startDeg, endDeg) * DEG2RAD;
    const eRad = Math.max(startDeg, endDeg) * DEG2RAD;
    this.world.addCurveVisual({
      cx,
      cy,
      radius,
      thickness,
      startRad: sRad,
      endRad: eRad,
      color,
    });
  }

  /**
   * Rotating circular drum with exit gaps, rendered as smooth continuous arcs.
   */
  public addSpinnerDrum(
    cx: number,
    cy: number,
    radius: number,
    segments: number,
    openGapIndices: number[],
    angularSpeedRad: number,
    thickness = 28,
    color = '#252836',
  ): void {
    const gapSet = new Set(openGapIndices);
    const step = (Math.PI * 2) / segments;
    const segLen = 2 * radius * Math.sin(step / 2) + 10;
    const bodies: { body: Matter.Body; baseAngle: number }[] = [];

    for (let i = 0; i < segments; i++) {
      if (gapSet.has(i)) continue;
      const baseAngle = i * step;
      const px = cx + Math.cos(baseAngle) * radius;
      const py = cy + Math.sin(baseAngle) * radius;
      const b = this.addWall(px, py, segLen, thickness, (baseAngle * 180) / Math.PI + 90, {
        kind: 'spinner',
        color,
        hidden: true,
      });
      bodies.push({ body: b, baseAngle });
    }

    // Group contiguous non-gap segments into smooth continuous arcs
    let runStart: number | null = null;
    for (let i = 0; i <= segments; i++) {
      const isOpen = i === segments || gapSet.has(i);
      if (!isOpen && runStart === null) {
        runStart = i;
      } else if (isOpen && runStart !== null) {
        this.world.addCurveVisual({
          cx,
          cy,
          radius,
          thickness,
          startRad: (runStart - 0.5) * step,
          endRad: (i - 0.5) * step,
          color: '#252836',
          getRotation: () => (this.world.elapsedMs / 1000) * angularSpeedRad,
        });
        runStart = null;
      }
    }

    this.world.addUpdater((elapsedMs) => {
      const rot = (elapsedMs / 1000) * angularSpeedRad;
      for (let i = 0; i < bodies.length; i++) {
        const item = bodies[i];
        const a = item.baseAngle + rot;
        Matter.Body.setPosition(item.body, {
          x: cx + Math.cos(a) * radius,
          y: cy + Math.sin(a) * radius,
        });
        Matter.Body.setAngle(item.body, a + Math.PI / 2);
      }
    });
  }

  /**
   * Rotating cross/paddle wheel at (cx, cy).
   */
  public addSpinnerCross(
    cx: number,
    cy: number,
    armLength: number,
    armThickness: number,
    angularSpeedRad: number,
    color = '#7C3AED',
  ): void {
    const b1 = this.addWall(cx, cy, armLength, armThickness, 0, {
      kind: 'spinner',
      color: '#2E2648',
      accent: color,
      rounded: true,
    });
    const b2 = this.addWall(cx, cy, armLength, armThickness, 90, {
      kind: 'spinner',
      color: '#2E2648',
      accent: color,
      rounded: true,
    });

    this.world.addUpdater((elapsedMs) => {
      const rot = (elapsedMs / 1000) * angularSpeedRad;
      Matter.Body.setAngle(b1, rot);
      Matter.Body.setAngle(b2, rot + Math.PI / 2);
    });
  }

  public addMovingGate(
    cx: number,
    cy: number,
    w: number,
    h: number,
    rangeX: number,
    rangeY: number,
    speedRad: number,
    phase = 0,
    color = '#FF5722',
  ): Matter.Body {
    const body = this.addWall(cx, cy, w, h, 0, {
      kind: 'gate',
      color: '#322220',
      accent: color,
      rounded: true,
    });

    this.world.addUpdater((elapsedMs) => {
      const s = Math.sin((elapsedMs / 1000) * speedRad + phase);
      Matter.Body.setPosition(body, {
        x: cx + s * rangeX,
        y: cy + s * rangeY,
      });
    });

    return body;
  }

  public addPendulum(
    pivotX: number,
    pivotY: number,
    length: number,
    bobRadius: number,
    maxAngleDeg: number,
    speedRad: number,
    phase = 0,
    color = '#00D2FF',
  ): void {
    const bob = Matter.Bodies.circle(pivotX, pivotY + length, bobRadius, {
      isStatic: true,
      restitution: 0.9,
      friction: 0.01,
    });
    this.world.addStaticBody(bob, {
      kind: 'pendulum',
      radius: bobRadius,
      color: '#1C2E3D',
      accent: color,
      pivotX,
      pivotY,
    });

    // Visual-only shaft or thin static rod? Just bob + visual rod via updater!
    const maxRad = maxAngleDeg * DEG2RAD;
    this.world.addUpdater((elapsedMs) => {
      const angle = Math.sin((elapsedMs / 1000) * speedRad + phase) * maxRad;
      Matter.Body.setPosition(bob, {
        x: pivotX + Math.sin(angle) * length,
        y: pivotY + Math.cos(angle) * length,
      });
    });
  }

  public addSeesaw(
    cx: number,
    cy: number,
    length: number,
    thickness = 28,
    maxTiltDeg = 28,
    color = '#7C3AED',
  ): Matter.Body {
    const plank = Matter.Bodies.rectangle(cx, cy, length, thickness, {
      isStatic: false,
      density: 0.003,
      friction: 0.0005,
      frictionStatic: 0,
      restitution: 0.35,
      frictionAir: 0.02,
      chamfer: { radius: thickness * 0.45 },
    });
    this.world.addStaticBody(plank, {
      kind: 'seesaw',
      width: length,
      height: thickness,
      color: '#2A2540',
      accent: color,
      rounded: true,
    });

    const pivot = Matter.Constraint.create({
      pointA: { x: cx, y: cy },
      bodyB: plank,
      pointB: { x: 0, y: 0 },
      stiffness: 1,
      length: 0,
    });
    this.world.addConstraint(pivot);

    const maxTiltRad = maxTiltDeg * DEG2RAD;
    this.world.addUpdater(() => {
      // Gentle spring return & tilt limit so seesaw never flips 180 or locks flat
      if (plank.angle > maxTiltRad) {
        Matter.Body.setAngle(plank, maxTiltRad);
        Matter.Body.setAngularVelocity(plank, Math.min(0, plank.angularVelocity));
      } else if (plank.angle < -maxTiltRad) {
        Matter.Body.setAngle(plank, -maxTiltRad);
        Matter.Body.setAngularVelocity(plank, Math.max(0, plank.angularVelocity));
      }
      // Subtle restoring torque
      Matter.Body.setAngularVelocity(plank, plank.angularVelocity - plank.angle * 0.004);
    });

    return plank;
  }

  /**
   * Timed release gate at the spawn chamber that opens when the race starts.
   */
  public addReleaseGate(
    cx: number,
    cy: number,
    width: number,
    delayMs = 0,
  ): Matter.Body {
    const gate = this.addWall(cx, cy, width, 30, 0, {
      kind: 'gate',
      color: '#2A1E3D',
      accent: '#00D2FF',
    });

    let opened = false;
    this.world.addUpdater((elapsedMs) => {
      if (!opened && elapsedMs >= delayMs) {
        opened = true;
        Matter.Composite.remove(this.world.engine.world, gate);
        this.world.visualMeta.delete(gate.id);
      }
    });

    return gate;
  }

  public addFinishLine(cx: number, cy: number, width: number, height = 44): Matter.Body {
    const sensor = Matter.Bodies.rectangle(cx, cy, width, height, {
      isStatic: true,
      isSensor: true,
      label: 'finish',
    });
    return this.world.addStaticBody(sensor, {
      kind: 'finish',
      width,
      height,
      color: '#00D2FF',
      accent: '#7C3AED',
    });
  }
}
