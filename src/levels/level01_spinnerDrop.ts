import { LevelDefinition, spawnMarblesGrid } from './types';

export const level01SpinnerDrop: LevelDefinition = {
  id: 1,
  name: 'The Spinner Drop',
  subtitle: 'Rotating drum release into staggered ramps & dome bumps',
  worldWidth: 1200,
  worldHeight: 3300,
  finishY: 3120,
  timeoutMs: 75000,
  build(world, builder, countries) {
    const W = 1200;
    const H = 3300;
    builder.addBoundaryWalls(W, H);

    // Spawn funnel above rotating drum
    builder.addRamp(240, 320, 460, 26);
    builder.addRamp(960, 320, 460, -26);
    spawnMarblesGrid(world, countries, 600, 70, 820);

    // Rotating circular drum with 2 opposite exit chutes
    builder.addSpinnerDrum(600, 680, 260, 16, [3, 4, 11, 12], 0.85, 30, '#7C3AED');
    // Inner agitator cross inside drum
    builder.addSpinnerCross(600, 680, 220, 28, -1.1, '#00D2FF');

    // Catch ramps below drum
    builder.addRamp(230, 1080, 440, 20);
    builder.addRamp(970, 1080, 440, -20);

    // Staggered angled ramps + semi-circular dome bumps
    builder.addDome(600, 1340, 110, 180, 360, 10);
    builder.addRamp(300, 1520, 520, 17);
    builder.addRamp(900, 1740, 520, -17);

    // Twin semi-circular bumps
    builder.addDome(340, 1980, 85, 180, 360, 8);
    builder.addDome(860, 1980, 85, 180, 360, 8);
    builder.addPin(600, 1960, 18, 0.8, '#FF5722');

    // Lower zig-zag ramps
    builder.addRamp(290, 2240, 540, 16);
    builder.addRamp(910, 2480, 540, -16);
    builder.addRamp(310, 2740, 520, 15);

    // Final funnel to finish
    builder.addRamp(870, 2940, 460, -22);
    builder.addFinishLine(600, 3120, 1080);
  },
};
