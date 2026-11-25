import { LevelDefinition, spawnMarblesGrid } from './types';

export const level06PendulumSlats: LevelDefinition = {
  id: 6,
  name: 'Pendulum & Drop-Through Slats',
  subtitle: 'Sweeping pendulums above stepped drop-through platforms',
  worldWidth: 1200,
  worldHeight: 3600,
  finishY: 3420,
  timeoutMs: 80000,
  build(world, builder, countries) {
    const W = 1200;
    const H = 3600;
    builder.addBoundaryWalls(W, H);

    spawnMarblesGrid(world, countries, 600, 60, 880);
    builder.addRamp(220, 400, 440, 20);
    builder.addRamp(980, 400, 440, -20);

    // Upper sweeping pendulum above stepped slats
    builder.addPendulum(600, 560, 260, 44, 48, 2.2, 0, '#00D2FF');

    // Stepped slat tier 1 (wide 110px+ drop-through gaps)
    builder.addRamp(180, 960, 260, 15);
    builder.addRamp(600, 960, 260, -15);
    builder.addRamp(1020, 960, 260, 15);

    // Twin counter-swinging pendulums
    builder.addPendulum(360, 1180, 240, 40, 44, 2.5, 0, '#FF5722');
    builder.addPendulum(840, 1180, 240, 40, 44, 2.5, Math.PI, '#7C3AED');

    // Stepped slat tier 2
    builder.addRamp(330, 1620, 340, 16);
    builder.addRamp(870, 1620, 340, -16);

    // Mid pendulum + dome splitter
    builder.addDome(600, 1940, 90, 180, 360, 8);
    builder.addPendulum(600, 2080, 280, 46, 52, 2.3, 1.1, '#00D2FF');

    // Stepped slat tier 3
    builder.addRamp(200, 2540, 300, 18);
    builder.addRamp(600, 2560, 240, 14);
    builder.addRamp(1000, 2540, 300, -18);

    // Final sweeping pendulum before finish
    builder.addPendulum(600, 2760, 260, 44, 50, 2.8, 0.5, '#FF5722');

    builder.addFinishLine(600, 3420, 1080);
  },
};
