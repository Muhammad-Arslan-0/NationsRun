import { CountryData } from '../data/countries';

const SPRITE_SIZE = 64;

/**
 * Pre-loads country flag SVGs and bakes each into a 64x64 circular offscreen canvas
 * with subtle inner shading and crisp rim outline for zero-allocation 60fps rendering.
 */
export class FlagCache {
  private sprites = new Map<string, HTMLCanvasElement>();
  private loadingPromise: Promise<void> | null = null;

  public getSprite(code: string): HTMLCanvasElement | undefined {
    return this.sprites.get(code);
  }

  public preloadAll(
    countries: readonly CountryData[],
    onProgress?: (loaded: number, total: number) => void,
  ): Promise<void> {
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = (async () => {
      const total = countries.length;
      let loaded = 0;

      // Load in batches of 24 to avoid saturating browser connection pool
      const batchSize = 24;
      for (let i = 0; i < total; i += batchSize) {
        const batch = countries.slice(i, i + batchSize);
        await Promise.all(
          batch.map(async (country) => {
            const sprite = await this.loadAndBakeSprite(country);
            this.sprites.set(country.code, sprite);
            loaded++;
            onProgress?.(loaded, total);
          }),
        );
      }
    })();

    return this.loadingPromise;
  }

  private loadAndBakeSprite(country: CountryData): Promise<HTMLCanvasElement> {
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        resolve(this.bakeCircularSprite(country, img));
      };
      img.onerror = () => {
        resolve(this.bakeCircularSprite(country, null));
      };
      img.src = `./flags/${country.code}.svg`;
    });
  }

  private bakeCircularSprite(
    country: CountryData,
    img: HTMLImageElement | null,
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = SPRITE_SIZE;
    canvas.height = SPRITE_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    const half = SPRITE_SIZE / 2;
    const r = half - 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(half, half, r, 0, Math.PI * 2);
    ctx.clip();

    if (img && img.naturalWidth > 0) {
      ctx.drawImage(img, 2, 2, SPRITE_SIZE - 4, SPRITE_SIZE - 4);
    } else {
      // Clean fallback rendering if SVG fails
      ctx.fillStyle = country.color;
      ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 20px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(country.code.toUpperCase(), half, half + 1);
    }

    // Subtle spherical glass/rim shading for depth
    const grad = ctx.createRadialGradient(
      half - r * 0.3,
      half - r * 0.3,
      r * 0.1,
      half,
      half,
      r,
    );
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    grad.addColorStop(0.55, 'rgba(255, 255, 255, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.36)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE);

    ctx.restore();

    // Crisp outer rim so overlapping flags stay distinct
    ctx.beginPath();
    ctx.arc(half, half, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();

    return canvas;
  }
}
