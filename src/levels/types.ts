import { CountryData } from '../data/countries';
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

/**
 * Spawns marbles in a staggered grid inside [cx - width/2, cx + width/2] starting at startY.
 * Ensures zero initial overlap.
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
  // Shuffle starting grid order every round for fair, unpredictable starts
  const shuffled = [...countries];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const cols = Math.max(1, Math.floor(boxWidth / colSpacing));
  const totalWidth = (cols - 1) * colSpacing;
  const leftX = cx - totalWidth / 2;

  for (let i = 0; i < shuffled.length; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const stagger = (row % 2) * (colSpacing * 0.45);
    const x = leftX + col * colSpacing + stagger - (row % 2) * (colSpacing * 0.22);
    const y = startY + row * rowSpacing;
    world.spawnMarble(shuffled[i], x, y);
  }
}
