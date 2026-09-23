import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { v2 as cloudinary } from 'cloudinary';
import { createPool } from '../src/db.js';
import { nullableText, seedBookSchema } from '../src/domain.js';
import { resolveSeedCover } from '../src/seed-utils.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const seedPath = path.join(projectRoot, 'seed', 'libros.json');
const imagesDirectory = path.join(projectRoot, 'seed', 'imagenes');
const cloudinaryReady = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME
  && process.env.CLOUDINARY_API_KEY
  && process.env.CLOUDINARY_API_SECRET,
);

if (cloudinaryReady) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

async function uploadCover(book, coverPath) {
  if (!coverPath || !cloudinaryReady) return { imagen_url: null, imagen_public_id: null };
  const result = await cloudinary.uploader.upload(coverPath, {
    folder: process.env.CLOUDINARY_FOLDER || 'biblioteca',
    resource_type: 'image',
    use_filename: true,
    unique_filename: true,
  });
  return { imagen_url: result.secure_url, imagen_public_id: result.public_id };
}

const raw = JSON.parse(await fs.readFile(seedPath, 'utf8'));
if (!Array.isArray(raw)) throw new Error('seed/libros.json debe contener un arreglo.');

const pool = createPool();
let inserted = 0;
let failed = 0;

try {
  for (const [index, item] of raw.entries()) {
    const parsed = seedBookSchema.safeParse(item);
    if (!parsed.success) {
      failed += 1;
      console.error(`Registro ${index + 1} inválido:`, parsed.error.issues);
      continue;
    }

    const book = parsed.data;
    const coverPath = resolveSeedCover(imagesDirectory, book.imagen);
    if (book.imagen && !coverPath) {
      console.warn(`Sin portada local para "${book.titulo}": ${book.imagen}. Se insertará sin imagen.`);
    } else if (coverPath && !cloudinaryReady) {
      console.warn(`Cloudinary no está configurado. "${book.titulo}" se insertará sin imagen.`);
    }

    try {
      const image = await uploadCover(book, coverPath);
      await pool.query(
        `INSERT INTO libros
          (isbn, titulo, autor, generos, anio_publicacion, editorial, sinopsis,
           idioma, paginas, imagen_url, imagen_public_id, cantidad, disponible)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$12)`,
        [
          nullableText(book.isbn), book.titulo, book.autor, book.generos,
          book.anio_publicacion, nullableText(book.editorial), nullableText(book.sinopsis),
          nullableText(book.idioma), book.paginas, image.imagen_url,
          image.imagen_public_id, book.cantidad,
        ],
      );
      inserted += 1;
      console.log(`Insertado: ${book.titulo}`);
    } catch (error) {
      failed += 1;
      console.error(`No se pudo insertar "${book.titulo}": ${error.message}`);
    }
  }
} finally {
  await pool.end();
}

console.log(`Seed finalizado: ${inserted} insertados, ${failed} con error.`);
if (failed) process.exitCode = 1;
