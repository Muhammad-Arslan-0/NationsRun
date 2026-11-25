import { LevelDefinition, spawnMarblesGrid } from './types';

export const level08NarrowCanyon: LevelDefinition = {
  id: 8,
  name: 'Narrow Canyon & Bumpers',
  subtitle: 'Tighter zig-zag chutes with high-restitution overtake bumpers',
  worldWidth: 1200,
  worldHeight: 3800,
  finishY: 3620,
  timeoutMs: 85000,
  build(world, builder, countries) {
    const W = 1200;
    const H = 3800;
    builder.addBoundaryWalls(W, H);

    spawnMarblesGrid(world, countries, 600, 60, 880);
    builder.addRamp(220, 400, 440, 22);
    builder.addRamp(980, 400, 440, -22);

    // Canyon zig-zag 1 (always >= 90px gap at turns)
    builder.addRamp(390, 680, 660, 15);
    builder.addBumper(880, 640, 38, '#FF5722');

    builder.addRamp(810, 980, 660, -15);
    builder.addBumper(320, 940, 38, '#00D2FF');

    builder.addRamp(390, 1280, 660, 15);
    builder.addBumper(880, 1240, 38, '#7C3AED');

    builder.addRamp(810, 1580, 660, -15);
    builder.addBumper(320, 1540, 38, '#FF5722');

    // Mid-canyon bumper arena for dramatic overtakes
    builder.addBumper(430, 1920, 42, '#00D2FF');
    builder.addBumper(770, 1920, 42, '#00D2FF');
    builder.addBumper(600, 2120, 46, '#FF5722');

    // Canyon zig-zag 2
    builder.addRamp(390, 2440, 660, 16);
    builder.addBumper(880, 2400, 36, '#7C3AED');

    builder.addRamp(810, 2760, 660, -16);
    builder.addBumper(320, 2720, 36, '#00D2FF');

    builder.addRamp(390, 3080, 660, 16);
    builder.addBumper(880, 3040, 38, '#FF5722');

    builder.addFinishLine(600, 3620, 1080);
  },
};
