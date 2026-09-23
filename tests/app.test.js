import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';

function testApp() {
  const pool = { query: async () => ({ rows: [] }) };
  const cache = {
    ready: true,
    search: () => ({ total: 1, items: [{ id: 1, titulo: 'El Principito' }] }),
    suggestions: () => [],
    genres: () => ['Ficción'],
    get: () => null,
  };
  return createApp({
    pool,
    cache,
    config: { production: false, sessionSecret: 'test-secret-with-enough-length' },
  });
}

describe('aplicación HTTP', () => {
  it('informa el estado de la caché', async () => {
    const response = await request(testApp()).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true, catalogReady: true });
  });

  it('sirve el catálogo público sin autenticación', async () => {
    const response = await request(testApp()).get('/api/catalog');
    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
  });

  it('protege la administración', async () => {
    const response = await request(testApp()).get('/api/admin/dashboard');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('SESION_REQUERIDA');
  });

  it('protege también la carga de portadas', async () => {
    const response = await request(testApp()).post('/api/admin/uploads/cover');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('SESION_REQUERIDA');
  });
});
