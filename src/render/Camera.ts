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
    // Fit worldWidth cleanly into viewport with slight margin
    const fitW = (viewportWidth * 0.96) / worldWidth;
    return Math.max(0.38, Math.min(1.15, fitW));
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

    // Single pass: find maxY of active marbles first (zero allocations)
    for (let i = 0; i < marbles.length; i++) {
      const m = marbles[i];
      if (!m.finished && !m.eliminated) {
        const py = m.body.position.y;
        if (py > maxY) maxY = py;
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
      // Bias slightly ahead of pack so upcoming obstacles are clearly visible
      this.targetY = packY + 110;
      // Subtle horizontal pan only if viewport is narrower than world at zoom
      const visibleW = viewportWidth / this.zoom;
      if (visibleW < worldWidth - 20) {
        const halfVis = visibleW * 0.5;
        this.targetX = Math.max(halfVis, Math.min(worldWidth - halfVis, packX));
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
