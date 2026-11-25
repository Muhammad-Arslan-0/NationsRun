import { LevelDefinition, spawnMarblesGrid } from './types';

export const level02TwinFunnelPlinko: LevelDefinition = {
  id: 2,
  name: 'Twin Funnel & Plinko Drops',
  subtitle: 'Converging upper funnels into staggered Plinko pin grids',
  worldWidth: 1200,
  worldHeight: 3500,
  finishY: 3320,
  timeoutMs: 75000,
  build(world, builder, countries) {
    const W = 1200;
    const H = 3500;
    builder.addBoundaryWalls(W, H);

    // Split spawn into left and right funnels
    spawnMarblesGrid(world, countries, 600, 60, 960);
    builder.addDome(600, 340, 70, 180, 360, 7);

    // Left funnel
    builder.addRamp(170, 520, 320, 32);
    builder.addRamp(470, 520, 260, -32);
    // Right funnel
    builder.addRamp(730, 520, 260, 32);
    builder.addRamp(1030, 520, 320, -32);

    // Upper Plinko grid
    builder.addPlinkoGrid(600, 760, 11, 7, 94, 86, 12, 0.78);

    // Middle converging funnel
    builder.addRamp(210, 1520, 480, 24);
    builder.addRamp(990, 1520, 480, -24);

    // Second dense Plinko grid
    builder.addPlinkoGrid(600, 1780, 12, 8, 86, 84, 11, 0.8);

    // Lower catch chutes (3 lanes)
    builder.addWall(400, 2720, 30, 360, 0, { color: '#252936', accent: '#7C3AED' });
    builder.addWall(800, 2720, 30, 360, 0, { color: '#252936', accent: '#7C3AED' });
    builder.addPin(400, 2530, 18, 0.75, '#FF5722');
    builder.addPin(800, 2530, 18, 0.75, '#FF5722');

    // Final angled deflectors to finish
    builder.addRamp(180, 3060, 320, 22);
    builder.addRamp(1020, 3060, 320, -22);
    builder.addFinishLine(600, 3320, 1080);
  },
};
