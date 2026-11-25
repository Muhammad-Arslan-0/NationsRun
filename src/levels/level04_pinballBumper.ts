import { LevelDefinition, spawnMarblesGrid } from './types';

export const level04PinballBumper: LevelDefinition = {
  id: 4,
  name: 'Pinball Bumper Gauntlet',
  subtitle: 'High-restitution circular bumpers & multi-lane deflectors',
  worldWidth: 1200,
  worldHeight: 3600,
  finishY: 3420,
  timeoutMs: 75000,
  build(world, builder, countries) {
    const W = 1200;
    const H = 3600;
    builder.addBoundaryWalls(W, H);

    spawnMarblesGrid(world, countries, 600, 60, 900);
    builder.addRamp(200, 420, 380, 24);
    builder.addRamp(1000, 420, 380, -24);

    // Upper bumper cluster
    builder.addBumper(400, 740, 42, '#FF5722');
    builder.addBumper(800, 740, 42, '#FF5722');
    builder.addBumper(600, 960, 48, '#7C3AED');
    builder.addBumper(280, 1120, 38, '#00D2FF');
    builder.addBumper(920, 1120, 38, '#00D2FF');

    // Curved side deflectors
    builder.addDome(140, 1460, 150, -60, 60, 8);
    builder.addDome(1060, 1460, 150, 120, 240, 8);

    // Multi-lane divider channels with bumpers at entries
    builder.addBumper(600, 1480, 44, '#FF5722');
    builder.addWall(360, 1920, 30, 380, 0);
    builder.addWall(840, 1920, 30, 380, 0);
    builder.addPin(360, 1720, 18, 0.85, '#00D2FF');
    builder.addPin(840, 1720, 18, 0.85, '#00D2FF');

    // Lower pinball field
    builder.addBumper(220, 2360, 40, '#7C3AED');
    builder.addBumper(600, 2340, 46, '#FF5722');
    builder.addBumper(980, 2360, 40, '#7C3AED');

    builder.addBumper(410, 2680, 42, '#00D2FF');
    builder.addBumper(790, 2680, 42, '#00D2FF');
    builder.addBumper(600, 2960, 48, '#FF5722');

    // Finish funnel
    builder.addRamp(190, 3180, 340, 24);
    builder.addRamp(1010, 3180, 340, -24);
    builder.addFinishLine(600, 3420, 1080);
  },
};
