import { CourseBuilder } from '../physics/CourseBuilder';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { LevelDefinition, ZoneMarker, spawnMarblesGrid } from './types';

interface ZoneTemplate {
  name: string;
  subtitle: string;
  build: (builder: CourseBuilder, baseY: number, flipX: boolean) => void;
}

function mirrorX(x: number, flip: boolean): number {
  return flip ? 1200 - x : x;
}

function mirrorDeg(deg: number, flip: boolean): number {
  return flip ? -deg : deg;
}

function jitter(amount: number): number {
  return (Math.random() - 0.5) * 2 * amount;
}

const ZONE_TEMPLATES: readonly ZoneTemplate[] = [
  {
    name: 'The Spinner Drop',
    subtitle: 'Rotating drum release & dome bumps',
    build(builder, baseY, flip) {
      const dir = flip ? -1 : 1;
      const speed = (0.8 + Math.random() * 0.25) * dir;
      builder.addSpinnerDrum(600, baseY + 260, 245, 16, [3, 4, 11, 12], speed, 30, '#7C3AED');
      builder.addSpinnerCross(600, baseY + 260, 205, 28, -speed * 1.25, '#00D2FF');

      builder.addRamp(230, baseY + 660, 440, 20);
      builder.addRamp(970, baseY + 660, 440, -20);
      builder.addDome(600 + jitter(25), baseY + 920, 105, 180, 360, 10);
      builder.addRamp(mirrorX(270, flip), baseY + 1120, 520, mirrorDeg(17, flip));
      builder.addRamp(mirrorX(930, flip), baseY + 1360, 520, mirrorDeg(-17, flip));
      builder.addDome(340 + jitter(20), baseY + 1620, 75, 180, 360, 8);
      builder.addDome(860 + jitter(20), baseY + 1620, 75, 180, 360, 8);
    },
  },
  {
    name: 'Twin Funnel & Plinko',
    subtitle: 'Converging funnels into staggered pins',
    build(builder, baseY) {
      builder.addDome(600 + jitter(20), baseY + 160, 70, 180, 360, 7);
      builder.addRamp(150, baseY + 340, 280, 30);
      builder.addRamp(485, baseY + 340, 240, -30);
      builder.addRamp(715, baseY + 340, 240, 30);
      builder.addRamp(1050, baseY + 340, 280, -30);

      builder.addPlinkoGrid(600, baseY + 580, 10, 6, 104, 90, 12, 0.78);
      builder.addRamp(210, baseY + 1240, 460, 24);
      builder.addRamp(990, baseY + 1240, 460, -24);
      builder.addPlinkoGrid(600, baseY + 1500, 9, 5, 104, 88, 11, 0.8);
    },
  },
  {
    name: 'Seesaw & Tilted Bridges',
    subtitle: 'Dynamic seesaws & alternating bridges',
    build(builder, baseY, flip) {
      builder.addSeesaw(600 + jitter(30), baseY + 220, 480, 28, 25, '#7C3AED');
      builder.addRamp(mirrorX(240, flip), baseY + 500, 440, mirrorDeg(17, flip));
      builder.addRamp(mirrorX(960, flip), baseY + 500, 440, mirrorDeg(-17, flip));

      builder.addSeesaw(340, baseY + 820, 380, 28, 26, '#00D2FF');
      builder.addSeesaw(860, baseY + 820, 380, 28, 26, '#00D2FF');

      builder.addRamp(mirrorX(290, flip), baseY + 1160, 540, mirrorDeg(16, flip));
      builder.addRamp(mirrorX(910, flip), baseY + 1420, 540, mirrorDeg(-16, flip));
      builder.addSeesaw(600 + jitter(30), baseY + 1760, 520, 28, 24, '#7C3AED');
    },
  },
  {
    name: 'Pinball Bumper Gauntlet',
    subtitle: 'High-restitution bumper clusters',
    build(builder, baseY) {
      builder.addBumper(400 + jitter(30), baseY + 200, 42, '#FF5722');
      builder.addBumper(800 + jitter(30), baseY + 200, 42, '#FF5722');
      builder.addBumper(600 + jitter(35), baseY + 420, 48, '#7C3AED');
      builder.addBumper(280 + jitter(25), baseY + 600, 38, '#00D2FF');
      builder.addBumper(920 + jitter(25), baseY + 600, 38, '#00D2FF');

      builder.addDome(140, baseY + 920, 145, -60, 60, 8);
      builder.addDome(1060, baseY + 920, 145, 120, 240, 8);
      builder.addBumper(600 + jitter(25), baseY + 940, 44, '#FF5722');

      builder.addWall(360, baseY + 1340, 30, 320, 0);
      builder.addWall(840, baseY + 1340, 30, 320, 0);
      builder.addPin(360, baseY + 1170, 18, 0.85, '#00D2FF');
      builder.addPin(840, baseY + 1170, 18, 0.85, '#00D2FF');

      builder.addBumper(240 + jitter(25), baseY + 1740, 40, '#7C3AED');
      builder.addBumper(600 + jitter(35), baseY + 1720, 46, '#FF5722');
      builder.addBumper(960 + jitter(25), baseY + 1740, 40, '#7C3AED');
    },
  },
  {
    name: 'Moving Gates & Chicanes',
    subtitle: 'Oscillating gates & zig-zag ledges',
    build(builder, baseY, flip) {
      const p1 = Math.random() * Math.PI * 2;
      const p2 = Math.random() * Math.PI * 2;
      builder.addMovingGate(600, baseY + 180, 280, 30, 310, 0, 2.1, p1, '#FF5722');
      builder.addRamp(mirrorX(290, flip), baseY + 460, 540, mirrorDeg(16, flip));
      builder.addMovingGate(mirrorX(780, flip), baseY + 620, 200, 28, 160, 0, 2.4, p2, '#00D2FF');

      builder.addRamp(mirrorX(910, flip), baseY + 880, 540, mirrorDeg(-16, flip));
      builder.addMovingGate(mirrorX(420, flip), baseY + 1040, 200, 28, 160, 0, 2.4, p2 + 1.4, '#7C3AED');

      builder.addRamp(mirrorX(290, flip), baseY + 1320, 540, mirrorDeg(16, flip));
      builder.addMovingGate(600, baseY + 1560, 260, 30, 320, 0, 2.7, p1 + 0.7, '#FF5722');
      builder.addRamp(mirrorX(910, flip), baseY + 1820, 540, mirrorDeg(-16, flip));
    },
  },
  {
    name: 'Pendulum & Drop Slats',
    subtitle: 'Sweeping pendulums above stepped slats',
    build(builder, baseY, flip) {
      const p = Math.random() * Math.PI * 2;
      builder.addPendulum(600, baseY + 120, 250, 44, 48, 2.2, p, '#00D2FF');

      builder.addRamp(155, baseY + 520, 260, 15);
      builder.addRamp(600, baseY + 520, 260, mirrorDeg(-15, flip));
      builder.addRamp(1045, baseY + 520, 260, -15);

      builder.addPendulum(360, baseY + 740, 240, 40, 44, 2.5, p, '#FF5722');
      builder.addPendulum(840, baseY + 740, 240, 40, 44, 2.5, p + Math.PI, '#7C3AED');

      builder.addRamp(330, baseY + 1180, 340, 16);
      builder.addRamp(870, baseY + 1180, 340, -16);

      builder.addDome(600 + jitter(25), baseY + 1480, 85, 180, 360, 8);
      builder.addPendulum(600, baseY + 1620, 250, 46, 52, 2.3, p + 1.1, '#00D2FF');
    },
  },
  {
    name: 'Dual-Chamber Mixer',
    subtitle: 'Twin spinners merging into central shaft',
    build(builder, baseY, flip) {
      const dir = flip ? -1 : 1;
      builder.addDome(600, baseY + 120, 70, 180, 360, 7);
      builder.addWall(600, baseY + 340, 32, 340, 0);

      builder.addSpinnerDrum(330, baseY + 600, 200, 14, [3, 4, 10, 11], 0.95 * dir, 28, '#00D2FF');
      builder.addSpinnerCross(330, baseY + 600, 170, 26, -1.25 * dir, '#7C3AED');

      builder.addSpinnerDrum(870, baseY + 600, 200, 14, [3, 4, 10, 11], -0.95 * dir, 28, '#FF5722');
      builder.addSpinnerCross(870, baseY + 600, 170, 26, 1.25 * dir, '#7C3AED');

      builder.addRamp(240, baseY + 980, 460, 26);
      builder.addRamp(960, baseY + 980, 460, -26);

      builder.addWall(330, baseY + 1520, 32, 720, 0);
      builder.addWall(870, baseY + 1520, 32, 720, 0);
      builder.addSpinnerCross(600, baseY + 1320, 280, 28, 1.4 * dir, '#00D2FF');
      builder.addBumper(600, baseY + 1640, 42, '#7C3AED');
      builder.addMovingGate(600, baseY + 1860, 180, 28, 120, 0, 2.4, Math.random() * Math.PI, '#00D2FF');
    },
  },
  {
    name: 'Narrow Canyon & Bumpers',
    subtitle: 'Tighter zig-zag chutes & overtake bumpers',
    build(builder, baseY, flip) {
      builder.addRamp(mirrorX(340, flip), baseY + 200, 640, mirrorDeg(16, flip));
      builder.addBumper(mirrorX(880, flip), baseY + 160, 38, '#FF5722');

      builder.addRamp(mirrorX(860, flip), baseY + 500, 640, mirrorDeg(-16, flip));
      builder.addBumper(mirrorX(320, flip), baseY + 460, 38, '#00D2FF');

      builder.addRamp(mirrorX(340, flip), baseY + 800, 640, mirrorDeg(16, flip));
      builder.addBumper(mirrorX(880, flip), baseY + 760, 38, '#7C3AED');

      builder.addBumper(430 + jitter(20), baseY + 1140, 42, '#00D2FF');
      builder.addBumper(770 + jitter(20), baseY + 1140, 42, '#00D2FF');
      builder.addBumper(600 + jitter(25), baseY + 1340, 46, '#FF5722');

      builder.addRamp(mirrorX(860, flip), baseY + 1640, 640, mirrorDeg(-16, flip));
      builder.addRamp(mirrorX(340, flip), baseY + 1920, 640, mirrorDeg(16, flip));
    },
  },
  {
    name: 'Multi-Stage Gauntlet',
    subtitle: 'Spinner release into Plinko & moving gates',
    build(builder, baseY, flip) {
      const dir = flip ? -1 : 1;
      builder.addRamp(240, baseY + 160, 460, 24);
      builder.addRamp(960, baseY + 160, 460, -24);
      builder.addSpinnerDrum(600, baseY + 520, 230, 16, [3, 4, 11, 12], 0.95 * dir, 28, '#7C3AED');
      builder.addSpinnerCross(600, baseY + 520, 190, 26, -1.2 * dir, '#00D2FF');

      builder.addPlinkoGrid(600, baseY + 960, 10, 5, 104, 90, 12, 0.78);
      builder.addMovingGate(600, baseY + 1540, 260, 28, 300, 0, 2.5, Math.random() * Math.PI, '#FF5722');
      builder.addSeesaw(360, baseY + 1840, 360, 28, 25, '#00D2FF');
      builder.addSeesaw(840, baseY + 1840, 360, 28, 25, '#00D2FF');
    },
  },
];

const ZONE_SLOT_HEIGHT = 2100;
const FIRST_ZONE_Y = 500;
const FINALE_Y = FIRST_ZONE_Y + ZONE_TEMPLATES.length * ZONE_SLOT_HEIGHT; // 19400

const activeZones: ZoneMarker[] = [
  ...ZONE_TEMPLATES.map((t, i) => ({
    id: i + 1,
    name: t.name,
    subtitle: t.subtitle,
    startY: i === 0 ? 0 : FIRST_ZONE_Y + i * ZONE_SLOT_HEIGHT,
  })),
  {
    id: 10,
    name: 'Grand Finale',
    subtitle: 'Final championship drop to the finish line',
    startY: FINALE_Y,
  },
];

function shuffle<T>(items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const MEGA_ZONES: readonly ZoneMarker[] = activeZones;

export const MEGA_COURSE: LevelDefinition = {
  id: 1,
  name: 'NationsRun Mega-Course',
  subtitle: 'All 10 zones randomized every round — first to finish wins',
  worldWidth: 1200,
  worldHeight: FINALE_Y + 2300,
  finishY: FINALE_Y + 2080,
  timeoutMs: 210000,
  zones: activeZones,
  build(world: PhysicsWorld, builder: CourseBuilder, countries) {
    const W = 1200;
    const H = FINALE_Y + 2300;
    builder.addBoundaryWalls(W, H);

    // Spawn chamber & entry funnel
    spawnMarblesGrid(world, countries, 600, 48, 960, 39, 39);
    builder.addRamp(240, 420, 460, 26);
    builder.addRamp(960, 420, 460, -26);

    // Shuffle Zones 1..9 every single round + randomly mirror & vary obstacles
    const order = shuffle(ZONE_TEMPLATES);
    activeZones.length = 0;

    for (let i = 0; i < order.length; i++) {
      const tpl = order[i];
      const baseY = FIRST_ZONE_Y + i * ZONE_SLOT_HEIGHT;
      const flip = Math.random() < 0.5;

      activeZones.push({
        id: i + 1,
        name: tpl.name,
        subtitle: tpl.subtitle,
        startY: i === 0 ? 0 : baseY,
      });

      tpl.build(builder, baseY, flip);
    }

    // Zone 10: Grand Finale (with per-round phase & bumper jitter)
    activeZones.push({
      id: 10,
      name: 'Grand Finale',
      subtitle: 'Final championship drop to the finish line',
      startY: FINALE_Y,
    });

    const p = Math.random() * Math.PI * 2;
    builder.addBumper(440 + jitter(25), FINALE_Y + 240, 44, '#FF5722');
    builder.addBumper(760 + jitter(25), FINALE_Y + 240, 44, '#FF5722');
    builder.addBumper(600 + jitter(30), FINALE_Y + 440, 50, '#7C3AED');
    builder.addBumper(280 + jitter(25), FINALE_Y + 600, 40, '#00D2FF');
    builder.addBumper(920 + jitter(25), FINALE_Y + 600, 40, '#00D2FF');

    builder.addPendulum(380, FINALE_Y + 800, 240, 42, 46, 2.4, p, '#00D2FF');
    builder.addPendulum(820, FINALE_Y + 800, 240, 42, 46, 2.4, p + Math.PI, '#FF5722');

    builder.addRamp(240, FINALE_Y + 1300, 460, 22);
    builder.addRamp(960, FINALE_Y + 1300, 460, -22);
    builder.addBumper(470 + jitter(25), FINALE_Y + 1620, 42, '#7C3AED');
    builder.addBumper(730 + jitter(25), FINALE_Y + 1620, 42, '#7C3AED');
    builder.addPin(600 + jitter(20), FINALE_Y + 1820, 18, 0.85, '#FFD166');

    builder.addFinishLine(600, FINALE_Y + 2080, 1080);
  },
};
