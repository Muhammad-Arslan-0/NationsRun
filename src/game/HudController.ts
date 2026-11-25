import { SoundEngine } from '../audio/SoundEngine';
import { HudSnapshot, RacePreset, RaceStateMachine, StandingEntry } from './RaceStateMachine';

export class HudController {
  private readonly levelBadgeEl = document.getElementById('hud-level-badge')!;
  private readonly levelNameEl = document.getElementById('hud-level-name')!;
  private readonly statusPillEl = document.getElementById('hud-status-pill')!;
  private readonly timerEl = document.getElementById('hud-timer')!;
  private readonly counterEl = document.getElementById('hud-counter')!;
  private readonly timingTowerEl = document.getElementById('timing-tower')!;
  private readonly btnTowerToggle = document.getElementById('btn-tower-toggle') as HTMLButtonElement;
  private readonly standingsListEl = document.getElementById('standings-list')!;
  private readonly standingsCollapsedEl = document.getElementById('standings-collapsed')!;
  private readonly standingsTitleEl = document.getElementById('standings-title')!;
  private towerCollapsed = false;

  private readonly overlayEl = document.getElementById('transition-overlay')!;
  private readonly overlayTagEl = document.getElementById('overlay-tag')!;
  private readonly overlayTitleEl = document.getElementById('overlay-title')!;
  private readonly overlaySubEl = document.getElementById('overlay-sub')!;
  private readonly overlayPodiumEl = document.getElementById('overlay-podium')!;
  private readonly overlayBarEl = document.getElementById('overlay-bar-fill')!;

  private readonly btnPause = document.getElementById('btn-pause') as HTMLButtonElement;
  private readonly btnSpeed = document.getElementById('btn-speed') as HTMLButtonElement;
  private readonly btnMute = document.getElementById('btn-mute') as HTMLButtonElement;
  private readonly selectPreset = document.getElementById('select-preset') as HTMLSelectElement;
  private readonly btnRestart = document.getElementById('btn-restart') as HTMLButtonElement;

  constructor(
    private readonly machine: RaceStateMachine,
    private readonly sound: SoundEngine,
  ) {
    this.towerCollapsed = window.matchMedia('(max-width: 820px)').matches;
    this.applyTowerCollapsedState();
    this.bindControls();
    this.machine.setHudListener((snap) => this.render(snap));
  }

  private applyTowerCollapsedState(): void {
    this.timingTowerEl.classList.toggle('is-collapsed', this.towerCollapsed);
    this.btnTowerToggle.textContent = this.towerCollapsed ? '+' : '−';
    this.btnTowerToggle.setAttribute('aria-expanded', String(!this.towerCollapsed));
    this.standingsCollapsedEl.setAttribute('aria-hidden', String(!this.towerCollapsed));
  }

  private bindControls(): void {
    this.btnPause.addEventListener('click', () => {
      this.sound.unlock();
      this.machine.togglePause();
    });
    this.btnSpeed.addEventListener('click', () => {
      this.sound.unlock();
      this.machine.toggleSpeed();
    });
    this.btnMute.addEventListener('click', () => {
      const muted = this.sound.toggleMute();
      this.btnMute.textContent = muted ? 'Muted' : 'Sound';
      this.btnMute.classList.toggle('is-muted', muted);
    });
    this.selectPreset.addEventListener('change', () => {
      this.sound.unlock();
      this.machine.setPreset(this.selectPreset.value as RacePreset);
    });
    this.btnRestart.addEventListener('click', () => {
      this.sound.unlock();
      this.machine.restartRun();
    });
    this.btnTowerToggle.addEventListener('click', () => {
      this.towerCollapsed = !this.towerCollapsed;
      this.applyTowerCollapsedState();
    });
  }

  private formatTime(ms: number): string {
    const totalSec = ms / 1000;
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${tenths}`;
  }

  private render(snap: HudSnapshot): void {
    this.levelBadgeEl.textContent = `Z${String(snap.currentZone.id).padStart(2, '0')}/${snap.totalZones}`;
    this.levelNameEl.textContent = snap.currentZone.name;
    this.timerEl.textContent = this.formatTime(snap.raceTimeMs);
    this.counterEl.textContent = `${snap.totalParticipants} NATIONS`;

    const statusLabel = snap.paused
      ? 'PAUSED'
      : snap.phase === 'RACING'
        ? 'LIVE'
        : snap.phase === 'RACE_INTRO'
          ? 'GRID'
          : 'WINNER';

    this.statusPillEl.textContent = statusLabel;
    this.statusPillEl.dataset.state = snap.paused ? 'paused' : snap.phase.toLowerCase();

    this.btnPause.textContent = snap.paused ? 'Resume' : 'Pause';
    this.btnSpeed.textContent = `${snap.speedMultiplier}x`;
    this.btnSpeed.classList.toggle('is-active', snap.speedMultiplier === 2);

    this.standingsTitleEl.textContent = snap.phase === 'WINNER' ? 'NATIONSRUN · RESULTS' : 'NATIONSRUN · LIVE';
    this.renderStandings(snap.topStandings);

    if (snap.phase === 'RACE_INTRO' || snap.phase === 'WINNER') {
      this.overlayEl.classList.add('is-visible');
      const pct = Math.max(0, Math.min(100, (snap.phaseRemainingMs / snap.phaseDurationMs) * 100));
      this.overlayBarEl.style.width = `${pct}%`;

      if (snap.phase === 'RACE_INTRO') {
        this.overlayTagEl.textContent = '10-ZONE MEGA COURSE · ONE WINNER';
        this.overlayTitleEl.textContent = 'NationsRun';
        this.overlaySubEl.textContent = `Launching ${snap.totalParticipants} nations...`;
        this.overlayPodiumEl.innerHTML = '';
      } else {
        const champ = snap.winnerPodium[0];
        this.overlayTagEl.textContent = 'OFFICIAL WINNER';
        this.overlayTitleEl.textContent = champ ? `${champ.country.name} Wins!` : 'Race Complete';
        this.overlaySubEl.textContent = `Restarting in ${(snap.phaseRemainingMs / 1000).toFixed(1)}s`;
        this.renderPodium(snap.winnerPodium);
      }
    } else {
      this.overlayEl.classList.remove('is-visible');
    }
  }

  private renderStandings(entries: StandingEntry[]): void {
    const html = entries
      .map((entry, idx) => {
        const rank = idx + 1;
        const metric = entry.isWinner
          ? `${(entry.finishTimeMs / 1000).toFixed(2)}s`
          : `${Math.round(entry.progressY * 100)}%`;

        const statusClass = entry.isWinner ? 'is-finished' : '';
        return `
          <div class="standing-row ${statusClass}">
            <span class="standing-rank">${rank}</span>
            <img class="standing-flag" src="./flags/${entry.country.code}.svg" alt="${entry.country.code}" loading="lazy" />
            <span class="standing-name">${entry.country.name}</span>
            <span class="standing-metric">${metric}</span>
          </div>
        `;
      })
      .join('');
    this.standingsListEl.innerHTML = html;

    // Update collapsed top-3 flags row
    this.standingsCollapsedEl.innerHTML = entries
      .slice(0, 3)
      .map(
        (entry, idx) =>
          `<img class="collapsed-flag rank-${idx + 1}" src="./flags/${entry.country.code}.svg" alt="${entry.country.name}" title="#${idx + 1} ${entry.country.name}" />`,
      )
      .join('');
  }

  private renderPodium(podium: StandingEntry[]): void {
    this.overlayPodiumEl.innerHTML = podium
      .map((entry, i) => {
        const label = i === 0 ? 'WINNER' : `P${i + 1}`;
        const val = entry.isWinner
          ? `${(entry.finishTimeMs / 1000).toFixed(2)}s`
          : `${Math.round(entry.progressY * 100)}%`;
        return `
          <div class="podium-card rank-${i + 1}">
            <img class="podium-flag" src="./flags/${entry.country.code}.svg" alt="${entry.country.code}" />
            <div class="podium-meta">
              <div class="podium-medal">${label}</div>
              <div class="podium-name">${entry.country.name}</div>
              <div class="podium-val">${val}</div>
            </div>
          </div>
        `;
      })
      .join('');
  }
}
