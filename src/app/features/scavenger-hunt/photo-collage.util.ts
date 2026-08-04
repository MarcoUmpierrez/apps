/**
 * Stitches the photos collected across the hunt into one downloadable
 * keepsake image, drawn on an offscreen canvas — no zip/image library needed.
 *
 * Styled like a teen scrapbook corkboard: photos are scattered with random
 * rotation/overlap rather than aligned to a grid, and hand-drawn doodles
 * (hearts, stars, sparkles, tape) fill the gaps between them.
 */
export async function buildCollage(photoDataUrls: string[], title: string): Promise<string | null> {
  if (photoDataUrls.length === 0) return null;

  try {
    const images = await Promise.all(photoDataUrls.map(loadImage));
    await loadCollageFonts();

    const columns = Math.min(4, Math.ceil(Math.sqrt(images.length * 1.3)));
    const rows = Math.ceil(images.length / columns);
    const cell = 340;
    const margin = 70;
    const headerHeight = 150;

    const canvas = document.createElement('canvas');
    canvas.width = columns * cell + margin * 2;
    canvas.height = rows * cell + margin * 2 + headerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const layout = images.map((img, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      return {
        img,
        cx: margin + col * cell + cell / 2 + (Math.random() - 0.5) * cell * 0.3,
        cy: margin + headerHeight + row * cell + cell / 2 + (Math.random() - 0.5) * cell * 0.3,
        size: cell * (0.8 + Math.random() * 0.12),
        rotation: (Math.random() - 0.5) * 26,
      };
    });

    const titleBannerWidth = Math.min(canvas.width * 0.62, 620);
    const exclusions = [
      { x: canvas.width / 2, y: 78, radius: titleBannerWidth / 2 + 20 },
      ...layout.map((p) => ({ x: p.cx, y: p.cy, radius: p.size * 0.75 })),
    ];

    drawBoardBackground(ctx, canvas.width, canvas.height);
    scatterDoodles(ctx, canvas.width, canvas.height, exclusions);
    drawTitleBanner(ctx, canvas.width, title);

    for (const p of layout) {
      drawPolaroid(ctx, p.img, p.cx, p.cy, p.size, p.size * 0.86, p.rotation);
    }

    return canvas.toDataURL('image/jpeg', 0.9);
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

/** No-op (and safely skipped) outside a real browser, e.g. under jsdom in tests. */
async function loadCollageFonts(): Promise<void> {
  if (!document.fonts) return;
  await Promise.all([document.fonts.load('700 54px Caveat'), document.fonts.load('700 26px Caveat')]);
}

function drawBoardBackground(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#e8d5b5');
  gradient.addColorStop(1, '#dcc196');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Subtle cork speckle texture.
  for (let i = 0; i < (width * height) / 900; i++) {
    ctx.fillStyle = `rgba(92, 61, 31, ${0.03 + Math.random() * 0.05})`;
    const r = 0.6 + Math.random() * 1.4;
    ctx.beginPath();
    ctx.arc(Math.random() * width, Math.random() * height, r, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = 'rgba(92, 61, 31, 0.35)';
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, width - 10, height - 10);
}

function drawTitleBanner(ctx: CanvasRenderingContext2D, boardWidth: number, title: string): void {
  ctx.save();
  ctx.translate(boardWidth / 2, 78);
  ctx.rotate((-2 * Math.PI) / 180);

  const bannerWidth = Math.min(boardWidth * 0.62, 620);
  ctx.fillStyle = 'rgba(244, 63, 94, 0.28)';
  ctx.fillRect(-bannerWidth / 2, -34, bannerWidth, 68);

  ctx.fillStyle = '#5c3d1f';
  ctx.font = '700 52px Caveat, cursive';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, 0, 2);
  ctx.restore();
}

function drawPolaroid(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  width: number,
  height: number,
  rotationDeg: number,
): void {
  const frame = width * 0.06;
  const captionSpace = frame * 2.2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((rotationDeg * Math.PI) / 180);

  ctx.save();
  ctx.shadowColor = 'rgba(40, 25, 10, 0.4)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#fffdf8';
  ctx.fillRect(-width / 2, -height / 2, width, height + captionSpace - frame);
  ctx.restore();

  const photoW = width - frame * 2;
  const photoH = height - frame * 2;
  const photoX = -width / 2 + frame;
  const photoY = -height / 2 + frame;

  const scale = Math.max(photoW / img.width, photoH / img.height);
  const sw = photoW / scale;
  const sh = photoH / scale;
  const sx = (img.width - sw) / 2;
  const sy = (img.height - sh) / 2;
  ctx.drawImage(img, sx, sy, sw, sh, photoX, photoY, photoW, photoH);

  drawTapeOrPin(ctx, width, height);
  ctx.restore();
}

function drawTapeOrPin(ctx: CanvasRenderingContext2D, polaroidWidth: number, polaroidHeight: number): void {
  const tapeColors = ['rgba(251, 191, 36, 0.75)', 'rgba(244, 114, 182, 0.7)', 'rgba(153, 246, 228, 0.7)'];

  if (Math.random() < 0.55) {
    ctx.save();
    ctx.translate(0, -polaroidHeight / 2);
    ctx.rotate(((Math.random() - 0.5) * 30 * Math.PI) / 180);
    ctx.fillStyle = tapeColors[Math.floor(Math.random() * tapeColors.length)];
    const tapeW = polaroidWidth * 0.32;
    ctx.fillRect(-tapeW / 2, -10, tapeW, 22);
    ctx.restore();
  } else {
    ctx.save();
    ctx.translate(0, -polaroidHeight / 2 + 6);
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(-2, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const DOODLE_COLORS = ['#b45309', '#e11d48', '#0f766e', '#7c3aed', '#c2410c'];

function randomDoodleColor(): string {
  return DOODLE_COLORS[Math.floor(Math.random() * DOODLE_COLORS.length)];
}

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.08;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, size * 0.32);
  ctx.bezierCurveTo(-size * 0.6, -size * 0.18, -size * 0.22, -size * 0.62, 0, -size * 0.18);
  ctx.bezierCurveTo(size * 0.22, -size * 0.62, size * 0.6, -size * 0.18, 0, size * 0.32);
  ctx.stroke();
  ctx.restore();
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.random() * Math.PI);
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.07;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const px = Math.cos(angle) * size * 0.5;
    const py = Math.sin(angle) * size * 0.5;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.09;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -size / 2);
  ctx.lineTo(0, size / 2);
  ctx.moveTo(-size / 2, 0);
  ctx.lineTo(size / 2, 0);
  ctx.moveTo(-size * 0.32, -size * 0.32);
  ctx.lineTo(size * 0.32, size * 0.32);
  ctx.moveTo(-size * 0.32, size * 0.32);
  ctx.lineTo(size * 0.32, -size * 0.32);
  ctx.stroke();
  ctx.restore();
}

function drawSquiggle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.random() * Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.1;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-size / 2, 0);
  ctx.quadraticCurveTo(-size / 4, -size / 2, 0, 0);
  ctx.quadraticCurveTo(size / 4, size / 2, size / 2, 0);
  ctx.stroke();
  ctx.restore();
}

const DOODLE_SHAPES = [drawHeart, drawStar, drawSparkle, drawSquiggle];

interface ExclusionZone {
  x: number;
  y: number;
  radius: number;
}

/**
 * Sprinkles doodles of varied sizes across the whole board, skipping any spot
 * that falls inside an exclusion zone (photos, the title banner) or too close
 * to a doodle already placed, so they read as scattered rather than clumped.
 */
function scatterDoodles(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  exclusions: ExclusionZone[],
): void {
  const targetCount = Math.round((width * height) / 24000);
  const placed: { x: number; y: number; size: number }[] = [];
  const maxAttempts = targetCount * 15;

  for (let attempt = 0; placed.length < targetCount && attempt < maxAttempts; attempt++) {
    const size = 16 + Math.random() * 58;
    const x = size / 2 + Math.random() * (width - size);
    const y = size / 2 + Math.random() * (height - size);

    const insideExclusion = exclusions.some(
      (zone) => Math.hypot(x - zone.x, y - zone.y) < zone.radius + size * 0.6,
    );
    const tooCloseToDoodle = placed.some(
      (other) => Math.hypot(x - other.x, y - other.y) < (size + other.size) * 0.55,
    );
    if (insideExclusion || tooCloseToDoodle) continue;

    placed.push({ x, y, size });
    const shape = DOODLE_SHAPES[Math.floor(Math.random() * DOODLE_SHAPES.length)];
    shape(ctx, x, y, size, randomDoodleColor());
  }
}
