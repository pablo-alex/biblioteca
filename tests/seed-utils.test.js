import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { resolveSeedCover } from '../src/seed-utils.js';

const temporaryDirectories = [];

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe('resolveSeedCover', () => {
  it('devuelve null cuando falta una portada sin interrumpir el seed', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'biblioteca-seed-'));
    temporaryDirectories.push(directory);
    expect(resolveSeedCover(directory, 'inexistente.jpg')).toBeNull();
  });

  it('acepta únicamente archivos dentro del directorio de imágenes', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'biblioteca-seed-'));
    temporaryDirectories.push(directory);
    const cover = path.join(directory, 'portada.jpg');
    fs.writeFileSync(cover, 'fake');
    expect(resolveSeedCover(directory, 'portada.jpg')).toBe(cover);
    expect(resolveSeedCover(directory, '../secreto.txt')).toBeNull();
  });
});
