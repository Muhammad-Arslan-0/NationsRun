import { LevelDefinition, spawnMarblesGrid } from './types';

export const level07DualMixer: LevelDefinition = {
  id: 7,
  name: 'Dual-Chamber Mixer',
  subtitle: 'Two upper spinning chambers merging into a central drop shaft',
  worldWidth: 1200,
  worldHeight: 3700,
  finishY: 3520,
  timeoutMs: 80000,
  build(world, builder, countries) {
    const W = 1200;
    const H = 3700;
    builder.addBoundaryWalls(W, H);

    // Split spawn into left and right upper chambers
    const half = Math.ceil(countries.length / 2);
    spawnMarblesGrid(world, countries.slice(0, half), 330, 60, 420);
    spawnMarblesGrid(world, countries.slice(half), 870, 60, 420);

    // Center divider between chambers
    builder.addWall(600, 280, 32, 460, 0);

    // Left and Right spinning mixer drums
    builder.addSpinnerDrum(330, 660, 210, 14, [3, 4, 10, 11], 0.95, 28, '#00D2FF');
    builder.addSpinnerCross(330, 660, 180, 26, -1.25, '#7C3AED');

    builder.addSpinnerDrum(870, 660, 210, 14, [3, 4, 10, 11], -0.95, 28, '#FF5722');
    builder.addSpinnerCross(870, 660, 180, 26, 1.25, '#7C3AED');

    // Funnel both chambers into the central drop shaft
    builder.addRamp(240, 1060, 460, 26);
    builder.addRamp(960, 1060, 460, -26);

    // Central drop shaft walls (wide 460px shaft)
    builder.addWall(330, 1980, 32, 1400, 0);
    builder.addWall(870, 1980, 32, 1400, 0);

    // Obstacle tiers inside central shaft
    builder.addSpinnerCross(600, 1420, 280, 28, 1.4, '#00D2FF');
    builder.addPin(480, 1720, 16, 0.8, '#FF5722');
    builder.addPin(720, 1720, 16, 0.8, '#FF5722');
    builder.addBumper(600, 1920, 42, '#7C3AED');

    builder.addMovingGate(600, 2220, 180, 28, 120, 0, 2.4, 0, '#00D2FF');
    builder.addPlinkoGrid(600, 2460, 5, 4, 84, 84, 12, 0.78);

    // Exit flare to finish
    builder.addRamp(220, 3020, 380, 22);
    builder.addRamp(980, 3020, 380, -22);
    builder.addFinishLine(600, 3520, 1080);
  },
};
