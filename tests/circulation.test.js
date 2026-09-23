import { describe, expect, it, vi } from 'vitest';
import { createLoan, returnLoan } from '../src/services/circulation.js';

function fakePool(resolver) {
  const log = [];
  const client = {
    query: vi.fn(async (sql, values) => {
      const operation = String(sql).trim();
      log.push(operation.split(/\s+/)[0].toUpperCase());
      if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(operation)) return { rows: [] };
      return resolver(operation, values);
    }),
    release: vi.fn(),
  };
  return {
    log,
    client,
    pool: { connect: vi.fn(async () => client) },
  };
}

describe('circulación transaccional', () => {
  it('crea el préstamo, usa siete días por defecto y actualiza caché después del commit', async () => {
    const { pool, log } = fakePool((sql, values) => {
      if (sql.startsWith('SELECT id, activo FROM usuarios')) return { rows: [{ id: 4, activo: true }] };
      if (sql.startsWith('SELECT id, activo, disponible FROM libros')) {
        return { rows: [{ id: 9, activo: true, disponible: 2 }] };
      }
      if (sql.startsWith('INSERT INTO prestamos')) {
        expect(values.slice(0, 4)).toEqual([4, 9, '2026-09-22', '2026-09-29']);
        return { rows: [{ id: 31, usuario_id: 4, libro_id: 9, fecha_limite: values[3] }] };
      }
      if (sql.startsWith('UPDATE libros SET disponible=disponible-1')) return { rows: [{ disponible: 1 }] };
      throw new Error(`Consulta inesperada: ${sql}`);
    });
    const cache = {
      updateAvailability: vi.fn(() => expect(log.at(-1)).toBe('COMMIT')),
    };

    const loan = await createLoan({
      pool,
      cache,
      adminId: 2,
      input: { usuario_id: 4, libro_id: 9, fecha_prestamo: '2026-09-22' },
    });

    expect(loan).toMatchObject({ id: 31, fecha_limite: '2026-09-29' });
    expect(log).toEqual(['BEGIN', 'SELECT', 'SELECT', 'INSERT', 'UPDATE', 'COMMIT']);
    expect(cache.updateAvailability).toHaveBeenCalledWith(9, 1);
  });

  it('hace rollback sin tocar caché cuando no hay disponibilidad', async () => {
    const { pool, log } = fakePool((sql) => {
      if (sql.startsWith('SELECT id, activo FROM usuarios')) return { rows: [{ id: 4, activo: true }] };
      if (sql.startsWith('SELECT id, activo, disponible FROM libros')) {
        return { rows: [{ id: 9, activo: true, disponible: 0 }] };
      }
      throw new Error(`Consulta inesperada: ${sql}`);
    });
    const cache = { updateAvailability: vi.fn() };

    await expect(createLoan({
      pool,
      cache,
      adminId: 2,
      input: { usuario_id: 4, libro_id: 9, fecha_prestamo: '2026-09-22' },
    })).rejects.toMatchObject({ code: 'SIN_DISPONIBILIDAD', status: 409 });

    expect(log).toEqual(['BEGIN', 'SELECT', 'SELECT', 'ROLLBACK']);
    expect(cache.updateAvailability).not.toHaveBeenCalled();
  });

  it('impide una segunda devolución y revierte la transacción', async () => {
    const { pool, log } = fakePool((sql) => {
      if (sql.startsWith('SELECT * FROM prestamos')) {
        return { rows: [{ id: 31, libro_id: 9, fecha_prestamo: '2026-09-20', fecha_devolucion: '2026-09-21' }] };
      }
      throw new Error(`Consulta inesperada: ${sql}`);
    });
    const cache = { updateAvailability: vi.fn() };

    await expect(returnLoan({
      pool,
      cache,
      adminId: 2,
      loanId: 31,
      input: {},
    })).rejects.toMatchObject({ code: 'PRESTAMO_YA_DEVUELTO', status: 409 });

    expect(log).toEqual(['BEGIN', 'SELECT', 'ROLLBACK']);
    expect(cache.updateAvailability).not.toHaveBeenCalled();
  });

  it('registra la devolución y actualiza caché únicamente después del commit', async () => {
    const { pool, log } = fakePool((sql, values) => {
      if (sql.startsWith('SELECT * FROM prestamos')) {
        return { rows: [{ id: 31, libro_id: 9, fecha_prestamo: '2026-09-20', fecha_devolucion: null }] };
      }
      if (sql.startsWith('UPDATE prestamos SET')) {
        return { rows: [{ id: 31, libro_id: 9, fecha_devolucion: values[1] }] };
      }
      if (sql.startsWith('UPDATE libros SET disponible=disponible+1')) return { rows: [{ disponible: 2 }] };
      throw new Error(`Consulta inesperada: ${sql}`);
    });
    const cache = {
      updateAvailability: vi.fn(() => expect(log.at(-1)).toBe('COMMIT')),
    };

    const loan = await returnLoan({
      pool,
      cache,
      adminId: 2,
      loanId: 31,
      input: { fecha_devolucion: '2026-09-22' },
    });

    expect(loan).toMatchObject({ id: 31, fecha_devolucion: '2026-09-22' });
    expect(log).toEqual(['BEGIN', 'SELECT', 'UPDATE', 'UPDATE', 'COMMIT']);
    expect(cache.updateAvailability).toHaveBeenCalledWith(9, 2);
  });
});
