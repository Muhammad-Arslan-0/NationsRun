import { LevelDefinition, spawnMarblesGrid } from './types';

export const level05MovingGates: LevelDefinition = {
  id: 5,
  name: 'Moving Gates & Chicanes',
  subtitle: 'Oscillating sliding gates & alternating zig-zag ledges',
  worldWidth: 1200,
  worldHeight: 3600,
  finishY: 3420,
  timeoutMs: 80000,
  build(world, builder, countries) {
    const W = 1200;
    const H = 3600;
    builder.addBoundaryWalls(W, H);

    spawnMarblesGrid(world, countries, 600, 60, 880);
    builder.addRamp(220, 400, 440, 22);
    builder.addRamp(980, 400, 440, -22);

    // Tier 1: Wide oscillating gate
    builder.addMovingGate(600, 720, 280, 30, 310, 0, 2.1, 0, '#FF5722');

    // Chicane 1
    builder.addRamp(320, 1020, 560, 16);
    builder.addMovingGate(780, 1180, 200, 28, 160, 0, 2.4, 1.2, '#00D2FF');

    // Chicane 2
    builder.addRamp(880, 1440, 560, -16);
    builder.addMovingGate(420, 1600, 200, 28, 160, 0, 2.4, 2.5, '#7C3AED');

    // Chicane 3
    builder.addRamp(320, 1880, 560, 16);
    builder.addMovingGate(600, 2120, 260, 30, 320, 0, 2.7, 0.5, '#FF5722');

    // Chicane 4
    builder.addRamp(880, 2400, 560, -16);
    builder.addRamp(320, 2720, 560, 16);

    // Twin counter-moving gates before finish
    builder.addMovingGate(380, 3020, 220, 28, 170, 0, 2.5, 0, '#00D2FF');
    builder.addMovingGate(820, 3020, 220, 28, 170, 0, 2.5, Math.PI, '#7C3AED');

    builder.addFinishLine(600, 3420, 1080);
  },
};
