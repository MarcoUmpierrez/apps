/**
 * Stitches the photos collected across the hunt into one downloadable
 * keepsake image, drawn on an offscreen canvas — no zip/image library needed.
 */
export async function buildCollage(photoDataUrls: string[], title: string): Promise<string | null> {
  if (photoDataUrls.length === 0) return null;

  try {
    const images = await Promise.all(photoDataUrls.map(loadImage));

    const columns = Math.ceil(Math.sqrt(images.length));
    const rows = Math.ceil(images.length / columns);
    const cellWidth = 360;
    const cellHeight = 270;
    const padding = 16;
    const titleHeight = 72;

    const canvas = document.createElement('canvas');
    canvas.width = columns * cellWidth + padding * (columns + 1);
    canvas.height = titleHeight + rows * cellHeight + padding * (rows + 1);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#f3e6cc';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#5c3d1f';
    ctx.font = 'bold 32px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, canvas.width / 2, titleHeight / 2 + 12);

    images.forEach((img, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = padding + col * (cellWidth + padding);
      const y = titleHeight + padding + row * (cellHeight + padding);
      drawPolaroid(ctx, img, x, y, cellWidth, cellHeight);
    });

    return canvas.toDataURL('image/jpeg', 0.85);
  } catch {
    return null;
  }
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.click();
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load photo'));
    img.src = dataUrl;
  });
}

function drawPolaroid(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  const scale = Math.max(width / img.width, height / img.height);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (img.width - sourceWidth) / 2;
  const sourceY = (img.height - sourceHeight) / 2;

  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x, y, width, height);
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  ctx.drawImage(img, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  ctx.restore();
}
