import { SoundEngine } from '../audio/SoundEngine';
import { COUNTRIES, CountryData } from '../data/countries';
import { MEGA_COURSE, MEGA_ZONES } from '../levels';
import { ZoneMarker } from '../levels/types';
import { CourseBuilder } from '../physics/CourseBuilder';
import { MarbleBody } from '../physics/MarbleBody';
import { FIXED_DT_MS, PhysicsWorld } from '../physics/PhysicsWorld';
import { Camera } from '../render/Camera';
import { CanvasRenderer } from '../render/CanvasRenderer';

export type RacePhase = 'LOADING' | 'RACE_INTRO' | 'RACING' | 'WINNER';
export type RacePreset = 'all' | 'quick48';

export interface StandingEntry {
  country: CountryData;
  isWinner: boolean;
  rank: number;
  finishTimeMs: number;
  progressY: number;
}

export interface HudSnapshot {
  phase: RacePhase;
  currentZone: ZoneMarker;
  totalZones: number;
  paused: boolean;
  speedMultiplier: 1 | 2;
  preset: RacePreset;
  raceTimeMs: number;
  phaseRemainingMs: number;
  phaseDurationMs: number;
  totalParticipants: number;
  topStandings: StandingEntry[];
  winnerPodium: StandingEntry[];
}

const INTRO_DURATION_MS = 1800;
const WINNER_DURATION_MS = 6500;

export class RaceStateMachine {
  public readonly world: PhysicsWorld;
  public readonly camera: Camera;
  private readonly builder: CourseBuilder;

  private phase: RacePhase = 'LOADING';
  private paused = false;
  private speedMultiplier: 1 | 2 = 1;
  private preset: RacePreset = 'all';

  private activeRoster: CountryData[] = [...COUNTRIES];
  private winner: MarbleBody | null = null;
  private frozenTopStandings: StandingEntry[] = [];

  private phaseTimerMs = 0;
  private phaseDurationMs = INTRO_DURATION_MS;
  private raceTimeMs = 0;

  private accumulatorMs = 0;
  private lastRafMs = 0;
  private rafId: number | null = null;

  private onHudUpdate?: (snapshot: HudSnapshot) => void;
  private lastHudPushMs = 0;

  constructor(
    private readonly renderer: CanvasRenderer,
    private readonly sound: SoundEngine,
  ) {
    this.world = new PhysicsWorld();
    this.builder = new CourseBuilder(this.world);
    this.camera = new Camera();

    this.world.setCallbacks({
      onFinish: (marble) => this.handleMarbleFinish(marble),
      onBumperHit: (bumper) => {
        this.sound.playBumper();
        this.renderer.spawnBurst(bumper.position.x, bumper.position.y, '#FF5722', 8);
      },
      onMarbleClack: (speed) => {
        this.sound.playClack(speed * 0.1);
      },
    });
  }

  public setHudListener(fn: (snapshot: HudSnapshot) => void): void {
    this.onHudUpdate = fn;
  }

  public start(): void {
    this.resetCourse();
    this.lastRafMs = performance.now();
    const tick = (now: number) => {
      this.rafId = requestAnimationFrame(tick);
      this.loop(now);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  public stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public togglePause(): boolean {
    this.paused = !this.paused;
    this.pushHud();
    return this.paused;
  }

  public toggleSpeed(): 1 | 2 {
    this.speedMultiplier = this.speedMultiplier === 1 ? 2 : 1;
    this.pushHud();
    return this.speedMultiplier;
  }

  public setPreset(preset: RacePreset): void {
    this.preset = preset;
    this.resetCourse();
  }

  public restartRun(): void {
    this.resetCourse();
  }

  private resetCourse(): void {
    if (this.preset === 'quick48') {
      const step = COUNTRIES.length / 48;
      this.activeRoster = Array.from({ length: 48 }, (_, i) => COUNTRIES[Math.floor(i * step)]);
    } else {
      this.activeRoster = [...COUNTRIES];
    }

    this.world.reset(MEGA_COURSE.worldWidth, MEGA_COURSE.worldHeight);
    this.renderer.clearParticles();
    this.winner = null;
    this.frozenTopStandings = [];
    this.raceTimeMs = 0;

    MEGA_COURSE.build(this.world, this.builder, this.activeRoster);

    this.camera.reset(
      MEGA_COURSE.worldWidth,
      this.renderer.getViewportWidth(),
      this.renderer.getViewportHeight(),
    );

    this.phase = 'RACE_INTRO';
    this.phaseTimerMs = 0;
    this.phaseDurationMs = INTRO_DURATION_MS;
    this.pushHud();
  }

  private handleMarbleFinish(marble: MarbleBody): void {
    if (this.phase !== 'RACING' || this.winner !== null) return;

    // Single Winner Rule: first marble across the finish line wins immediately!
    this.winner = marble;
    marble.rank = 1;
    this.sound.playFinish(true);
    this.renderer.spawnBurst(marble.body.position.x, marble.body.position.y, '#FB923C', 24);

    // Snapshot final standings with the single winner locked at #1
    this.frozenTopStandings = this.computeTopStandings();

    this.phase = 'WINNER';
    this.phaseTimerMs = 0;
    this.phaseDurationMs = WINNER_DURATION_MS;
    this.pushHud();
  }

  private loop(nowMs: number): void {
    const rawDt = Math.min(50, Math.max(0, nowMs - this.lastRafMs));
    this.lastRafMs = nowMs;

    const scaledDt = this.paused ? 0 : rawDt * this.speedMultiplier;
    if (!this.paused) {
      this.updateState(scaledDt);
    }

    const leader = this.winner ?? this.findCurrentLeader();
    this.camera.update(
      this.world.marbles,
      MEGA_COURSE.worldWidth,
      MEGA_COURSE.worldHeight,
      this.renderer.getViewportWidth(),
      this.renderer.getViewportHeight(),
      rawDt / 1000,
    );

    this.renderer.render(
      this.world,
      this.camera,
      leader ? leader.body.id : null,
      MEGA_ZONES,
      rawDt / 1000,
    );

    if (nowMs - this.lastHudPushMs >= 100) {
      this.lastHudPushMs = nowMs;
      this.pushHud();
    }
  }

  private updateState(dtMs: number): void {
    if (this.phase === 'RACE_INTRO') {
      this.phaseTimerMs += dtMs;
      if (this.phaseTimerMs >= this.phaseDurationMs) {
        this.phase = 'RACING';
        this.phaseTimerMs = 0;
        this.raceTimeMs = 0;
        this.pushHud();
      }
      return;
    }

    if (this.phase === 'RACING') {
      this.accumulatorMs += dtMs;
      while (this.accumulatorMs >= FIXED_DT_MS) {
        this.world.step(true);
        this.raceTimeMs += FIXED_DT_MS;
        this.accumulatorMs -= FIXED_DT_MS;
        if (this.winner !== null) break;
      }

      // Safety timeout fallback: crown leading marble if course ever times out
      if (this.winner === null && this.raceTimeMs >= MEGA_COURSE.timeoutMs) {
        const leader = this.findCurrentLeader();
        if (leader) {
          leader.finished = true;
          leader.finishTimeMs = this.raceTimeMs;
          this.handleMarbleFinish(leader);
        } else {
          this.resetCourse();
        }
      }
      return;
    }

    if (this.phase === 'WINNER') {
      this.phaseTimerMs += dtMs;
      if (this.phaseTimerMs >= this.phaseDurationMs) {
        this.resetCourse();
      }
    }
  }

  private findCurrentLeader(): MarbleBody | null {
    let best: MarbleBody | null = null;
    let bestY = -Infinity;
    for (let i = 0; i < this.world.marbles.length; i++) {
      const m = this.world.marbles[i];
      if (!m.eliminated && m.body.position.y > bestY) {
        bestY = m.body.position.y;
        best = m;
      }
    }
    return best;
  }

  private getCurrentZone(): ZoneMarker {
    const leader = this.winner ?? this.findCurrentLeader();
    const y = leader ? leader.body.position.y : 0;
    let active = MEGA_ZONES[0];
    for (let i = 0; i < MEGA_ZONES.length; i++) {
      if (y >= MEGA_ZONES[i].startY) {
        active = MEGA_ZONES[i];
      }
    }
    return active;
  }

  private computeTopStandings(): StandingEntry[] {
    const sorted = [...this.world.marbles].sort((a, b) => {
      if (a === this.winner) return -1;
      if (b === this.winner) return 1;
      return b.body.position.y - a.body.position.y;
    });

    return sorted.slice(0, 10).map((m, idx) => ({
      country: m.country,
      isWinner: m === this.winner,
      rank: idx + 1,
      finishTimeMs: m.finishTimeMs,
      progressY: Math.max(0, Math.min(1, m.body.position.y / MEGA_COURSE.finishY)),
    }));
  }

  private buildSnapshot(): HudSnapshot {
    const topStandings =
      this.phase === 'WINNER' && this.frozenTopStandings.length > 0
        ? this.frozenTopStandings
        : this.computeTopStandings();

    return {
      phase: this.phase,
      currentZone: this.getCurrentZone(),
      totalZones: MEGA_ZONES.length,
      paused: this.paused,
      speedMultiplier: this.speedMultiplier,
      preset: this.preset,
      raceTimeMs: this.raceTimeMs,
      phaseRemainingMs: Math.max(0, this.phaseDurationMs - this.phaseTimerMs),
      phaseDurationMs: this.phaseDurationMs,
      totalParticipants: this.world.marbles.length,
      topStandings,
      winnerPodium: topStandings.slice(0, 3),
    };
  }

  private pushHud(): void {
    this.onHudUpdate?.(this.buildSnapshot());
  }
}
