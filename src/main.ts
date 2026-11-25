import './style.css';
import { FlagCache } from './assets/flagCache';
import { SoundEngine } from './audio/SoundEngine';
import { COUNTRIES } from './data/countries';
import { HudController } from './game/HudController';
import { RaceStateMachine } from './game/RaceStateMachine';
import { CanvasRenderer } from './render/CanvasRenderer';

async function bootstrap(): Promise<void> {
  const canvas = document.getElementById('race-canvas') as HTMLCanvasElement;
  const stageEl = document.getElementById('canvas-stage') as HTMLElement;
  const bootEl = document.getElementById('boot-screen') as HTMLElement;
  const bootProgressEl = document.getElementById('boot-progress') as HTMLElement;

  const flagCache = new FlagCache();
  await flagCache.preloadAll(COUNTRIES, (loaded, total) => {
    const pct = Math.round((loaded / total) * 100);
    bootProgressEl.textContent = `Loading ${loaded} / ${total} country flags (${pct}%)`;
  });

  bootEl.classList.add('is-hidden');

  const renderer = new CanvasRenderer(canvas, flagCache);
  const sound = new SoundEngine();
  const machine = new RaceStateMachine(renderer, sound);
  new HudController(machine, sound);

  const handleResize = () => {
    const rect = stageEl.getBoundingClientRect();
    renderer.resize(rect.width, rect.height);
  };

  window.addEventListener('resize', handleResize);
  handleResize();

  // Unlock Web Audio on first user interaction anywhere
  const unlockOnce = () => {
    sound.unlock();
    window.removeEventListener('pointerdown', unlockOnce);
    window.removeEventListener('keydown', unlockOnce);
  };
  window.addEventListener('pointerdown', unlockOnce);
  window.addEventListener('keydown', unlockOnce);

  machine.start();
}

bootstrap();
