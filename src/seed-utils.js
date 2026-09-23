import fs from 'node:fs';
import path from 'node:path';

export function resolveSeedCover(imagesDirectory, imageName) {
  if (!imageName) return null;
  const safeName = path.basename(imageName);
  const candidate = path.resolve(imagesDirectory, safeName);
  const root = `${path.resolve(imagesDirectory)}${path.sep}`;
  if (!candidate.startsWith(root) || !fs.existsSync(candidate)) return null;
  return candidate;
}
