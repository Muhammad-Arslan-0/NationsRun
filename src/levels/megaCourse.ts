import { LevelDefinition, ZoneMarker, spawnMarblesGrid } from './types';

export const MEGA_ZONES: readonly ZoneMarker[] = [
  { id: 1, name: 'The Spinner Drop', subtitle: 'Rotating drum release & dome bumps', startY: 0 },
  { id: 2, name: 'Twin Funnel & Plinko', subtitle: 'Converging funnels into staggered pins', startY: 2150 },
  { id: 3, name: 'Seesaw & Tilted Bridges', subtitle: 'Dynamic seesaws & alternating bridges', startY: 4200 },
  { id: 4, name: 'Pinball Bumper Gauntlet', subtitle: 'High-restitution bumper clusters', startY: 6300 },
  { id: 5, name: 'Moving Gates & Chicanes', subtitle: 'Oscillating gates & zig-zag ledges', startY: 8400 },
  { id: 6, name: 'Pendulum & Drop Slats', subtitle: 'Sweeping pendulums above stepped slats', startY: 10500 },
  { id: 7, name: 'Dual-Chamber Mixer', subtitle: 'Twin spinners merging into central shaft', startY: 12650 },
  { id: 8, name: 'Narrow Canyon & Bumpers', subtitle: 'Tighter zig-zag chutes & overtake bumpers', startY: 14900 },
  { id: 9, name: 'Multi-Stage Gauntlet', subtitle: 'Spinner release into Plinko & moving gates', startY: 17100 },
  { id: 10, name: 'Grand Finale', subtitle: 'Final championship drop to the finish line', startY: 19300 },
];

export const MEGA_COURSE: LevelDefinition = {
  id: 1,
  name: 'World Championship Mega-Course',
  subtitle: 'All 10 zones in one continuous drop — first to finish wins',
  worldWidth: 1200,
  worldHeight: 21600,
  finishY: 21380,
  timeoutMs: 210000,
  zones: MEGA_ZONES,
  build(world, builder, countries) {
    const W = 1200;
    const H = 21600;
    builder.addBoundaryWalls(W, H);

    // =========================================================================
    // ZONE 1 (y: 0 -> 2150): The Spinner Drop
    // =========================================================================
    spawnMarblesGrid(world, countries, 600, 60, 840);
    builder.addRamp(240, 340, 460, 26);
    builder.addRamp(960, 340, 460, -26);

    builder.addSpinnerDrum(600, 700, 250, 16, [3, 4, 11, 12], 0.85, 30, '#7C3AED');
    builder.addSpinnerCross(600, 700, 210, 28, -1.1, '#00D2FF');

    builder.addRamp(230, 1100, 440, 20);
    builder.addRamp(970, 1100, 440, -20);
    builder.addDome(600, 1360, 105, 180, 360, 10);
    builder.addRamp(310, 1560, 520, 17);
    builder.addRamp(890, 1800, 520, -17);
    builder.addDome(340, 2020, 75, 180, 360, 8);
    builder.addDome(860, 2020, 75, 180, 360, 8);

    // =========================================================================
    // ZONE 2 (y: 2150 -> 4200): Twin Funnel & Plinko Drops
    // =========================================================================
    builder.addDome(600, 2320, 70, 180, 360, 7);
    builder.addRamp(170, 2500, 320, 30);
    builder.addRamp(470, 2500, 260, -30);
    builder.addRamp(730, 2500, 260, 30);
    builder.addRamp(1030, 2500, 320, -30);

    builder.addPlinkoGrid(600, 2740, 11, 6, 94, 86, 12, 0.78);
    builder.addRamp(210, 3400, 460, 24);
    builder.addRamp(990, 3400, 460, -24);
    builder.addPlinkoGrid(600, 3660, 10, 5, 92, 84, 11, 0.8);

    // =========================================================================
    // ZONE 3 (y: 4200 -> 6300): Seesaw & Tilted Bridges
    // =========================================================================
    builder.addSeesaw(600, 4400, 480, 28, 25, '#7C3AED');
    builder.addRamp(260, 4680, 440, 17);
    builder.addRamp(940, 4680, 440, -17);

    builder.addSeesaw(340, 5000, 380, 28, 26, '#00D2FF');
    builder.addSeesaw(860, 5000, 380, 28, 26, '#00D2FF');

    builder.addRamp(330, 5340, 560, 16);
    builder.addRamp(870, 5600, 560, -16);
    builder.addSeesaw(600, 5940, 520, 28, 24, '#7C3AED');

    // =========================================================================
    // ZONE 4 (y: 6300 -> 8400): Pinball Bumper Gauntlet
    // =========================================================================
    builder.addBumper(400, 6500, 42, '#FF5722');
    builder.addBumper(800, 6500, 42, '#FF5722');
    builder.addBumper(600, 6720, 48, '#7C3AED');
    builder.addBumper(280, 6900, 38, '#00D2FF');
    builder.addBumper(920, 6900, 38, '#00D2FF');

    builder.addDome(140, 7220, 145, -60, 60, 8);
    builder.addDome(1060, 7220, 145, 120, 240, 8);
    builder.addBumper(600, 7240, 44, '#FF5722');

    builder.addWall(360, 7640, 30, 320, 0);
    builder.addWall(840, 7640, 30, 320, 0);
    builder.addPin(360, 7470, 18, 0.85, '#00D2FF');
    builder.addPin(840, 7470, 18, 0.85, '#00D2FF');

    builder.addBumper(240, 8040, 40, '#7C3AED');
    builder.addBumper(600, 8020, 46, '#FF5722');
    builder.addBumper(960, 8040, 40, '#7C3AED');

    // =========================================================================
    // ZONE 5 (y: 8400 -> 10500): Moving Gates & Chicanes
    // =========================================================================
    builder.addMovingGate(600, 8580, 280, 30, 310, 0, 2.1, 0, '#FF5722');
    builder.addRamp(320, 8860, 560, 16);
    builder.addMovingGate(780, 9020, 200, 28, 160, 0, 2.4, 1.2, '#00D2FF');

    builder.addRamp(880, 9280, 560, -16);
    builder.addMovingGate(420, 9440, 200, 28, 160, 0, 2.4, 2.5, '#7C3AED');

    builder.addRamp(320, 9720, 560, 16);
    builder.addMovingGate(600, 9960, 260, 30, 320, 0, 2.7, 0.5, '#FF5722');
    builder.addRamp(880, 10220, 560, -16);

    // =========================================================================
    // ZONE 6 (y: 10500 -> 12650): Pendulum & Drop-Through Slats
    // =========================================================================
    builder.addPendulum(600, 10620, 250, 44, 48, 2.2, 0, '#00D2FF');

    builder.addRamp(180, 11020, 260, 15);
    builder.addRamp(600, 11020, 260, -15);
    builder.addRamp(1020, 11020, 260, 15);

    builder.addPendulum(360, 11240, 240, 40, 44, 2.5, 0, '#FF5722');
    builder.addPendulum(840, 11240, 240, 40, 44, 2.5, Math.PI, '#7C3AED');

    builder.addRamp(330, 11680, 340, 16);
    builder.addRamp(870, 11680, 340, -16);

    builder.addDome(600, 11980, 85, 180, 360, 8);
    builder.addPendulum(600, 12120, 260, 46, 52, 2.3, 1.1, '#00D2FF');

    // =========================================================================
    // ZONE 7 (y: 12650 -> 14900): Dual-Chamber Mixer
    // =========================================================================
    builder.addDome(600, 12780, 70, 180, 360, 7);
    builder.addWall(600, 13000, 32, 340, 0);

    builder.addSpinnerDrum(330, 13260, 200, 14, [3, 4, 10, 11], 0.95, 28, '#00D2FF');
    builder.addSpinnerCross(330, 13260, 170, 26, -1.25, '#7C3AED');

    builder.addSpinnerDrum(870, 13260, 200, 14, [3, 4, 10, 11], -0.95, 28, '#FF5722');
    builder.addSpinnerCross(870, 13260, 170, 26, 1.25, '#7C3AED');

    builder.addRamp(240, 13640, 460, 26);
    builder.addRamp(960, 13640, 460, -26);

    // Central drop shaft
    builder.addWall(330, 14180, 32, 760, 0);
    builder.addWall(870, 14180, 32, 760, 0);
    builder.addSpinnerCross(600, 13980, 280, 28, 1.4, '#00D2FF');
    builder.addBumper(600, 14320, 42, '#7C3AED');
    builder.addMovingGate(600, 14560, 180, 28, 120, 0, 2.4, 0, '#00D2FF');

    // =========================================================================
    // ZONE 8 (y: 14900 -> 17100): Narrow Canyon & Bumpers
    // =========================================================================
    builder.addRamp(390, 15120, 660, 16);
    builder.addBumper(880, 15080, 38, '#FF5722');

    builder.addRamp(810, 15420, 660, -16);
    builder.addBumper(320, 15380, 38, '#00D2FF');

    builder.addRamp(390, 15720, 660, 16);
    builder.addBumper(880, 15680, 38, '#7C3AED');

    builder.addBumper(430, 16060, 42, '#00D2FF');
    builder.addBumper(770, 16060, 42, '#00D2FF');
    builder.addBumper(600, 16260, 46, '#FF5722');

    builder.addRamp(810, 16560, 660, -16);
    builder.addRamp(390, 16860, 660, 16);

    // =========================================================================
    // ZONE 9 (y: 17100 -> 19300): Multi-Stage Gauntlet
    // =========================================================================
    builder.addRamp(240, 17260, 460, 24);
    builder.addRamp(960, 17260, 460, -24);
    builder.addSpinnerDrum(600, 17620, 230, 16, [3, 4, 11, 12], 0.95, 28, '#7C3AED');
    builder.addSpinnerCross(600, 17620, 190, 26, -1.2, '#00D2FF');

    builder.addPlinkoGrid(600, 18060, 11, 5, 92, 86, 12, 0.78);
    builder.addMovingGate(600, 18640, 260, 28, 300, 0, 2.5, 0, '#FF5722');
    builder.addSeesaw(360, 18940, 360, 28, 25, '#00D2FF');
    builder.addSeesaw(840, 18940, 360, 28, 25, '#00D2FF');

    // =========================================================================
    // ZONE 10 (y: 19300 -> 21600): Grand Finale & Single Finish Line
    // =========================================================================
    builder.addBumper(440, 19540, 44, '#FF5722');
    builder.addBumper(760, 19540, 44, '#FF5722');
    builder.addBumper(600, 19740, 50, '#7C3AED');
    builder.addBumper(280, 19900, 40, '#00D2FF');
    builder.addBumper(920, 19900, 40, '#00D2FF');

    builder.addPendulum(380, 20100, 240, 42, 46, 2.4, 0, '#00D2FF');
    builder.addPendulum(820, 20100, 240, 42, 46, 2.4, Math.PI, '#FF5722');

    builder.addRamp(240, 20600, 460, 22);
    builder.addRamp(960, 20600, 460, -22);
    builder.addBumper(470, 20920, 42, '#7C3AED');
    builder.addBumper(730, 20920, 42, '#7C3AED');
    builder.addPin(600, 21120, 18, 0.85, '#FFD166');

    builder.addFinishLine(600, 21380, 1080);
  },
};
