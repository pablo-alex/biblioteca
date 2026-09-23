import { describe, expect, it } from 'vitest';
import { CatalogCache } from '../src/cache/catalog-cache.js';

const books = [
  { id: 1, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', generos: ['Realismo mágico'], disponible: 2 },
  { id: 2, titulo: 'El Principito', autor: 'Antoine de Saint-Exupéry', generos: ['Ficción'], disponible: 1 },
];

describe('CatalogCache', () => {
  it('busca y filtra sin volver a consultar la base', async () => {
    let calls = 0;
    const pool = { query: async () => { calls += 1; return { rows: books }; } };
    const cache = new CatalogCache(pool);
    await cache.load();

    expect(cache.search({ query: 'garcia' }).items[0].id).toBe(1);
    expect(cache.search({ genre: 'ficcion' }).items[0].id).toBe(2);
    expect(calls).toBe(1);
  });

  it('actualiza solo la disponibilidad afectada', async () => {
    const cache = new CatalogCache({ query: async () => ({ rows: books.map((book) => ({ ...book })) }) });
    await cache.load();
    cache.updateAvailability(1, 1);
    expect(cache.get(1).disponible).toBe(1);
    expect(cache.get(2).disponible).toBe(1);
  });

  it('no sugiere antes de dos caracteres', async () => {
    const cache = new CatalogCache({ query: async () => ({ rows: books }) });
    await cache.load();
    expect(cache.suggestions('c')).toEqual([]);
    expect(cache.suggestions('ci')).toHaveLength(2);
  });
});
