/**
 * Compresses a captured photo before it ever touches localStorage — raw phone
 * photos (3-8MB) would blow the ~5-10MB per-origin quota after a couple of
 * stops. Resolves null on any failure so callers can treat it identically to
 * an explicit skip rather than blocking progress.
 */
export async function compressPhotoToDataUrl(
  file: File,
  maxDimensionPx = 1024,
  quality = 0.72,
): Promise<string | null> {
  try {
    const bitmap = await decodeImage(file);
    const scale = Math.min(1, maxDimensionPx / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // JPEG has no alpha channel — without this, transparent source pixels
    // (e.g. a gallery-picked PNG instead of a live camera shot) would encode
    // as black instead of compositing onto a neutral background.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    if ('close' in bitmap) bitmap.close();

    return canvas.toDataURL('image/jpeg', quality);
  } catch {
    return null;
  }
}

async function decodeImage(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if ('createImageBitmap' in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      // fall through to the <img> fallback below
    }
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to decode image'));
    };
    img.src = url;
  });
}
