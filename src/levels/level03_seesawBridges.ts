import { LevelDefinition, spawnMarblesGrid } from './types';

export const level03SeesawBridges: LevelDefinition = {
  id: 3,
  name: 'Seesaw & Tilted Bridges',
  subtitle: 'Alternating bridges, dynamic seesaws & wide gap gates',
  worldWidth: 1200,
  worldHeight: 3500,
  finishY: 3320,
  timeoutMs: 80000,
  build(world, builder, countries) {
    const W = 1200;
    const H = 3500;
    builder.addBoundaryWalls(W, H);

    spawnMarblesGrid(world, countries, 600, 60, 860);
    builder.addRamp(220, 400, 460, 20);
    builder.addRamp(980, 400, 460, -20);

    // Tier 1: Central dynamic seesaw
    builder.addSeesaw(600, 680, 480, 28, 25, '#7C3AED');

    // Tier 2: Tilted bridges with wide center gap
    builder.addRamp(260, 960, 440, 17);
    builder.addRamp(940, 960, 440, -17);

    // Tier 3: Twin side seesaws
    builder.addSeesaw(340, 1280, 380, 28, 26, '#00D2FF');
    builder.addSeesaw(860, 1280, 380, 28, 26, '#00D2FF');

    // Tier 4: Alternating tilted bridges
    builder.addRamp(330, 1620, 560, 16);
    builder.addRamp(870, 1880, 560, -16);

    // Tier 5: Oscillating gate + central seesaw
    builder.addMovingGate(600, 2140, 240, 30, 260, 0, 1.8, 0, '#FF5722');
    builder.addSeesaw(600, 2420, 540, 28, 24, '#7C3AED');

    // Tier 6: Final alternating bridges
    builder.addRamp(280, 2740, 500, 18);
    builder.addRamp(920, 2980, 500, -18);

    builder.addFinishLine(600, 3320, 1080);
  },
};
