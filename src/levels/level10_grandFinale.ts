import { LevelDefinition, spawnMarblesGrid } from './types';

export const level10GrandFinale: LevelDefinition = {
  id: 10,
  name: 'Grand Finale',
  subtitle: 'High-stakes multi-tier championship course',
  worldWidth: 1200,
  worldHeight: 4500,
  finishY: 4320,
  timeoutMs: 90000,
  build(world, builder, countries) {
    const W = 1200;
    const H = 4500;
    builder.addBoundaryWalls(W, H);

    // Tier 1: Grand Arena Drop & Twin Spinners
    spawnMarblesGrid(world, countries, 600, 60, 940);
    builder.addDome(600, 400, 80, 180, 360, 8);
    builder.addSpinnerCross(340, 640, 240, 28, 1.35, '#7C3AED');
    builder.addSpinnerCross(860, 640, 240, 28, -1.35, '#00D2FF');

    // Tier 2: Dramatic Funnel into Bumper Cluster
    builder.addRamp(200, 960, 420, 24);
    builder.addRamp(1000, 960, 420, -24);

    builder.addBumper(440, 1260, 44, '#FF5722');
    builder.addBumper(760, 1260, 44, '#FF5722');
    builder.addBumper(600, 1460, 50, '#7C3AED');
    builder.addBumper(280, 1620, 40, '#00D2FF');
    builder.addBumper(920, 1620, 40, '#00D2FF');

    // Tier 3: Sweeping Pendulums & Seesaw
    builder.addPendulum(380, 1840, 250, 42, 46, 2.4, 0, '#00D2FF');
    builder.addPendulum(820, 1840, 250, 42, 46, 2.4, Math.PI, '#FF5722');
    builder.addSeesaw(600, 2280, 520, 28, 25, '#7C3AED');

    // Tier 4: Plinko + Moving Gates
    builder.addPlinkoGrid(600, 2560, 10, 5, 96, 86, 12, 0.8);
    builder.addMovingGate(360, 3140, 220, 28, 180, 0, 2.6, 0, '#FF5722');
    builder.addMovingGate(840, 3140, 220, 28, 180, 0, 2.6, Math.PI, '#00D2FF');

    // Tier 5: Final Championship Funnel & Bumper Sprint
    builder.addRamp(240, 3480, 460, 22);
    builder.addRamp(960, 3480, 460, -22);
    builder.addBumper(470, 3840, 42, '#7C3AED');
    builder.addBumper(730, 3840, 42, '#7C3AED');
    builder.addPin(600, 4040, 18, 0.85, '#FFD166');

    builder.addFinishLine(600, 4320, 1080);
  },
};
