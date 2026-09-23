import { describe, expect, it } from 'vitest';
import {
  addDays,
  availableAfterQuantityChange,
  loanStatus,
  normalizeSearch,
  seedBookSchema,
} from '../src/domain.js';

describe('reglas de negocio', () => {
  it('conserva la cantidad prestada al cambiar el total', () => {
    expect(availableAfterQuantityChange({ cantidad: 5, disponible: 2 }, 7)).toBe(4);
    expect(() => availableAfterQuantityChange({ cantidad: 5, disponible: 2 }, 2))
      .toThrow('3 ejemplares prestados');
  });

  it('deriva el estado del préstamo desde sus fechas', () => {
    expect(loanStatus({ fecha_limite: '2026-09-19', fecha_devolucion: null }, '2026-09-20')).toBe('vencido');
    expect(loanStatus({ fecha_limite: '2026-09-20', fecha_devolucion: null }, '2026-09-20')).toBe('activo');
    expect(loanStatus({ fecha_limite: '2026-09-10', fecha_devolucion: '2026-09-12' }, '2026-09-20')).toBe('devuelto');
  });

  it('calcula siete días sin depender de la zona horaria local', () => {
    expect(addDays('2026-12-28', 7)).toBe('2027-01-04');
  });

  it('normaliza acentos para búsqueda', () => {
    expect(normalizeSearch(' Cien AÑOS de Soledad ')).toBe('cien anos de soledad');
  });

  it('acepta el campo legado genero y usa cantidad uno por defecto', () => {
    const parsed = seedBookSchema.parse({ titulo: '1984', autor: 'George Orwell', genero: ['Distopía'] });
    expect(parsed.generos).toEqual(['Distopía']);
    expect(parsed.cantidad).toBe(1);
  });
});
