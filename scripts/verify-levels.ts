import fs from 'node:fs';
import path from 'node:path';
import { COUNTRIES } from '../src/data/countries';
import { MEGA_COURSE } from '../src/levels';
import { CourseBuilder } from '../src/physics/CourseBuilder';
import { MarbleBody } from '../src/physics/MarbleBody';
import { FIXED_DT_MS, PhysicsWorld } from '../src/physics/PhysicsWorld';

let hasError = false;

// 1. Verify all 195 flag SVG files exist in public/flags/
const flagsDir = path.resolve(process.cwd(), 'public/flags');
const missingFlags: string[] = [];
for (const c of COUNTRIES) {
  const filePath = path.join(flagsDir, `${c.code}.svg`);
  if (!fs.existsSync(filePath)) {
    missingFlags.push(c.code);
  }
}

console.log(`Countries count: ${COUNTRIES.length}`);
if (missingFlags.length > 0) {
  console.error(`Missing flags: ${missingFlags.join(', ')}`);
  hasError = true;
} else {
  console.log('All 195 flag SVGs verified in public/flags/');
}

// 2. Headless physics simulation of unified 10-zone MEGA_COURSE (single winner)
const world = new PhysicsWorld();
let winner: MarbleBody | null = null;
let winTimeSec = 0;

world.setCallbacks({
  onFinish: (marble) => {
    if (!winner) {
      winner = marble;
      winTimeSec = world.elapsedMs / 1000;
    }
  },
});

world.reset(MEGA_COURSE.worldWidth, MEGA_COURSE.worldHeight);
const builder = new CourseBuilder(world);
MEGA_COURSE.build(world, builder, COUNTRIES);

const maxTicks = Math.ceil(MEGA_COURSE.timeoutMs / FIXED_DT_MS);
let nanCount = 0;

for (let t = 0; t < maxTicks; t++) {
  world.step(true);
  if (winner) break;
}

for (const m of world.marbles) {
  if (Number.isNaN(m.body.position.x) || Number.isNaN(m.body.position.y)) {
    nanCount++;
  }
}

if (!winner || nanCount > 0) {
  console.error(`FAIL: winner=${winner ? winner.country.name : 'NONE'}, NaNs=${nanCount}`);
  hasError = true;
} else {
  console.log(
    `MEGA_COURSE (${MEGA_COURSE.zones.length} zones, ${MEGA_COURSE.worldHeight}px): WINNER = ${winner.country.name} @ ${winTimeSec.toFixed(1)}s, NaNs=${nanCount}`,
  );
}

if (hasError) {
  process.exit(1);
}
console.log('UNIFIED 10-ZONE MEGA-COURSE PASSED HEADLESS PHYSICS VERIFICATION!');
