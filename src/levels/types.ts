import { CountryData, PRIORITY_COUNTRY_CODES } from '../data/countries';
import { CourseBuilder } from '../physics/CourseBuilder';
import { PhysicsWorld } from '../physics/PhysicsWorld';

export interface ZoneMarker {
  id: number;
  name: string;
  subtitle: string;
  startY: number;
}

export interface LevelDefinition {
  id: number;
  name: string;
  subtitle: string;
  worldWidth: number;
  worldHeight: number;
  finishY: number;
  timeoutMs: number;
  zones?: readonly ZoneMarker[];
  build: (world: PhysicsWorld, builder: CourseBuilder, countries: readonly CountryData[]) => void;
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Spawns marbles in a staggered grid inside [cx - width/2, cx + width/2] starting at startY.
 * Famous/priority nations are shuffled into the front (bottom) rows closest to the exit funnel,
 * and all remaining nations are shuffled behind them.
 */
export function spawnMarblesGrid(
  world: PhysicsWorld,
  countries: readonly CountryData[],
  cx: number,
  startY: number,
  boxWidth: number,
  rowSpacing = 40,
  colSpacing = 40,
): void {
  const priority: CountryData[] = [];
  const others: CountryData[] = [];
  for (const c of countries) {
    if (PRIORITY_COUNTRY_CODES.has(c.code)) {
      priority.push(c);
    } else {
      others.push(c);
    }
  }

  shuffleInPlace(priority);
  shuffleInPlace(others);
  // Larger indices have larger Y (closest to the exit funnel), so priority nations drop first
  const ordered = [...others, ...priority];

  const cols = Math.max(1, Math.floor(boxWidth / colSpacing));
  const totalWidth = (cols - 1) * colSpacing;
  const leftX = cx - totalWidth / 2;

  for (let i = 0; i < ordered.length; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const stagger = (row % 2) * (colSpacing * 0.45);
    const x = leftX + col * colSpacing + stagger - (row % 2) * (colSpacing * 0.22);
    const y = startY + row * rowSpacing;
    world.spawnMarble(ordered[i], x, y);
  }
}
