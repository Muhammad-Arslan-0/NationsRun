import { LevelDefinition, spawnMarblesGrid } from './types';

export const level09MultiStageGauntlet: LevelDefinition = {
  id: 9,
  name: 'Multi-Stage Gauntlet',
  subtitle: 'Spinner release -> Plinko field -> Moving gates -> Sprint finish',
  worldWidth: 1200,
  worldHeight: 4100,
  finishY: 3920,
  timeoutMs: 85000,
  build(world, builder, countries) {
    const W = 1200;
    const H = 4100;
    builder.addBoundaryWalls(W, H);

    // Stage 1: Spinner Release
    spawnMarblesGrid(world, countries, 600, 60, 820);
    builder.addRamp(240, 360, 460, 24);
    builder.addRamp(960, 360, 460, -24);
    builder.addSpinnerDrum(600, 720, 240, 16, [3, 4, 11, 12], 0.95, 28, '#7C3AED');
    builder.addSpinnerCross(600, 720, 200, 26, -1.2, '#00D2FF');

    // Stage 2: Plinko Field
    builder.addRamp(200, 1100, 360, 20);
    builder.addRamp(1000, 1100, 360, -20);
    builder.addPlinkoGrid(600, 1300, 11, 6, 92, 86, 12, 0.78);

    // Stage 3: Moving Gates & Seesaw
    builder.addMovingGate(600, 1980, 260, 28, 300, 0, 2.4, 0, '#FF5722');
    builder.addSeesaw(360, 2260, 360, 28, 25, '#00D2FF');
    builder.addSeesaw(840, 2260, 360, 28, 25, '#00D2FF');
    builder.addMovingGate(600, 2540, 240, 28, 280, 0, 2.7, Math.PI, '#7C3AED');

    // Stage 4: Long High-Speed Finish Run with Bumpers
    builder.addRamp(210, 2860, 380, 24);
    builder.addRamp(990, 2860, 380, -24);

    builder.addBumper(420, 3180, 40, '#FF5722');
    builder.addBumper(780, 3180, 40, '#FF5722');
    builder.addPin(600, 3380, 16, 0.8, '#00D2FF');
    builder.addBumper(340, 3540, 38, '#7C3AED');
    builder.addBumper(860, 3540, 38, '#7C3AED');

    builder.addFinishLine(600, 3920, 1080);
  },
};
