import { MarbleBody } from '../physics/MarbleBody';

export class Camera {
  public x = 600;
  public y = 400;
  public zoom = 1;

  private targetX = 600;
  private targetY = 400;
  private targetZoom = 1;

  public reset(worldWidth: number, viewportWidth: number, viewportHeight: number): void {
    this.x = worldWidth * 0.5;
    this.y = 320;
    this.targetX = this.x;
    this.targetY = this.y;
    this.zoom = this.computeBaseZoom(worldWidth, viewportWidth, viewportHeight);
    this.targetZoom = this.zoom;
  }

  private computeBaseZoom(worldWidth: number, viewportWidth: number, _viewportHeight: number): number {
    const fitW = (viewportWidth * 0.96) / worldWidth;
    // On narrow mobile screens, keep zoom >= 0.76 so flags & barriers stay large and readable
    // while horizontal camera panning follows the action.
    const minZoom = viewportWidth < 760 ? 0.76 : 0.45;
    return Math.max(minZoom, Math.min(1.15, fitW));
  }

  public update(
    marbles: readonly MarbleBody[],
    worldWidth: number,
    worldHeight: number,
    viewportWidth: number,
    viewportHeight: number,
    dtSec: number,
  ): void {
    const baseZoom = this.computeBaseZoom(worldWidth, viewportWidth, viewportHeight);
    this.targetZoom = baseZoom;

    // Find leading active pack (top 12% or up to 16 active marbles by Y)
    let sumY = 0;
    let sumX = 0;
    let count = 0;
    let maxY = -Infinity;
    let leaderX = worldWidth * 0.5;

    // Single pass: find maxY of active marbles first (zero allocations)
    for (let i = 0; i < marbles.length; i++) {
      const m = marbles[i];
      if (!m.finished && !m.eliminated) {
        const py = m.body.position.y;
        if (py > maxY) {
          maxY = py;
          leaderX = m.body.position.x;
        }
      }
    }

    if (maxY > -Infinity) {
      // Average marbles within 320px of the leader
      const bandTop = maxY - 320;
      for (let i = 0; i < marbles.length; i++) {
        const m = marbles[i];
        if (!m.finished && !m.eliminated) {
          const py = m.body.position.y;
          if (py >= bandTop) {
            sumX += m.body.position.x;
            sumY += py;
            count++;
          }
        }
      }
    }

    if (count > 0) {
      const packY = sumY / count;
      const packX = sumX / count;
      const focusX = viewportWidth < 760 ? packX * 0.35 + leaderX * 0.65 : packX * 0.5 + leaderX * 0.5;
      // Bias slightly ahead of pack so upcoming obstacles are clearly visible
      this.targetY = packY + 110;
      // Subtle horizontal pan only if viewport is narrower than world at zoom
      const visibleW = viewportWidth / this.zoom;
      if (visibleW < worldWidth - 20) {
        const halfVis = visibleW * 0.5;
        this.targetX = Math.max(halfVis, Math.min(worldWidth - halfVis, focusX));
      } else {
        this.targetX = worldWidth * 0.5;
      }
    } else {
      // All finished: frame the finish line
      this.targetX = worldWidth * 0.5;
      this.targetY = worldHeight - 280;
    }

    // Clamp vertical camera within world bounds
    const halfVisH = (viewportHeight * 0.5) / this.zoom;
    const minCamY = Math.min(worldHeight * 0.5, halfVisH - 40);
    const maxCamY = Math.max(minCamY, worldHeight - halfVisH + 40);
    this.targetY = Math.max(minCamY, Math.min(maxCamY, this.targetY));

    const smooth = 1 - Math.exp(-5.5 * dtSec);
    this.x += (this.targetX - this.x) * smooth;
    this.y += (this.targetY - this.y) * smooth;
    this.zoom += (this.targetZoom - this.zoom) * smooth;
  }
}
