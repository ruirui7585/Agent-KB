import sharp from 'sharp';

export async function compressImage(inputBuffer, maxWidth = 1024, quality = 80) {
  const metadata = await sharp(inputBuffer).metadata();

  let pipeline = sharp(inputBuffer).jpeg({ quality, mozjpeg: true });

  if (metadata.width > maxWidth) {
    pipeline = pipeline.resize(maxWidth, null, { fit: 'inside', withoutEnlargement: true });
  }

  const output = await pipeline.toBuffer();
  return { buffer: output, width: Math.min(metadata.width, maxWidth), format: 'jpeg' };
}

export function bufferToBase64(buffer) {
  return buffer.toString('base64');
}
