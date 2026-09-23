import { z } from 'zod';

export function normalizeSearch(value = '') {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es');
}

export function nullableText(value) {
  if (value === undefined || value === null) return null;
  const clean = String(value).trim();
  return clean || null;
}

export function isoToday(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return isoToday(date);
}

export function loanStatus(loan, today = isoToday()) {
  if (loan.fecha_devolucion) return 'devuelto';
  return loan.fecha_limite < today ? 'vencido' : 'activo';
}

export function availableAfterQuantityChange({ cantidad, disponible }, nextQuantity) {
  const loaned = cantidad - disponible;
  if (nextQuantity < loaned) {
    throw new Error(`La cantidad no puede ser menor que los ${loaned} ejemplares prestados.`);
  }
  return nextQuantity - loaned;
}

const optionalString = z.string().trim().max(500).optional().nullable();
const optionalPositiveInt = z.coerce.number().int().positive().optional().nullable();

export const bookInputSchema = z.object({
  isbn: z.string().trim().max(40).optional().nullable(),
  titulo: z.string().trim().min(1).max(300),
  autor: z.string().trim().min(1).max(250),
  generos: z.array(z.string().trim().min(1).max(80)).max(12).default([]),
  anio_publicacion: z.coerce.number().int().min(0).max(2200).optional().nullable(),
  editorial: optionalString,
  sinopsis: z.string().trim().max(10_000).optional().nullable(),
  idioma: optionalString,
  paginas: optionalPositiveInt,
  imagen_url: z.string().url().optional().nullable(),
  imagen_public_id: optionalString,
  cantidad: z.coerce.number().int().positive().default(1),
  activo: z.boolean().optional().default(true),
});

export const bookPatchSchema = bookInputSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Envía al menos un campo para actualizar.',
);

export const userInputSchema = z.object({
  nombre_completo: z.string().trim().min(1).max(250),
  telefono: optionalString,
  ci: z.string().trim().min(1).max(80),
  direccion: z.string().trim().max(500).optional().nullable(),
  activo: z.boolean().optional().default(true),
});

export const userPatchSchema = userInputSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  'Envía al menos un campo para actualizar.',
);

export const loanInputSchema = z.object({
  usuario_id: z.coerce.number().int().positive(),
  libro_id: z.coerce.number().int().positive(),
  fecha_prestamo: z.iso.date().optional(),
  fecha_limite: z.iso.date().optional(),
  detalles: z.string().trim().max(2_000).optional().nullable(),
});

export const returnInputSchema = z.object({
  fecha_devolucion: z.iso.date().optional(),
});

export const seedBookSchema = bookInputSchema
  .omit({ imagen_url: true, imagen_public_id: true, activo: true })
  .extend({
    genero: z.array(z.string().trim().min(1).max(80)).optional(),
    imagen: z.string().trim().optional().nullable(),
  })
  .transform(({ genero, generos, ...book }) => ({
    ...book,
    generos: generos.length ? generos : (genero || []),
  }));
