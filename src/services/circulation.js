import { withTransaction } from '../db.js';
import { addDays, isoToday, nullableText } from '../domain.js';
import { AppError } from '../middleware/errors.js';

export async function createLoan({ pool, cache, adminId, input }) {
  const loanDate = input.fecha_prestamo || isoToday();
  const dueDate = input.fecha_limite || addDays(loanDate, 7);
  if (dueDate < loanDate) {
    throw new AppError(400, 'FECHA_LIMITE_INVALIDA', 'La fecha límite no puede ser anterior al préstamo.');
  }

  const result = await withTransaction(pool, async (client) => {
    const { rows: users } = await client.query(
      'SELECT id, activo FROM usuarios WHERE id=$1 FOR UPDATE',
      [input.usuario_id],
    );
    if (!users[0]) throw new AppError(404, 'USUARIO_NO_ENCONTRADO', 'Usuario no encontrado.');
    if (!users[0].activo) {
      throw new AppError(409, 'USUARIO_INACTIVO', 'El usuario está inactivo. Reactívalo antes de prestar.');
    }

    const { rows: books } = await client.query(
      'SELECT id, activo, disponible FROM libros WHERE id=$1 FOR UPDATE',
      [input.libro_id],
    );
    if (!books[0]) throw new AppError(404, 'LIBRO_NO_ENCONTRADO', 'Libro no encontrado.');
    if (!books[0].activo) {
      throw new AppError(409, 'LIBRO_INACTIVO', 'El libro está inactivo y no puede prestarse.');
    }
    if (books[0].disponible <= 0) {
      throw new AppError(409, 'SIN_DISPONIBILIDAD', 'No quedan ejemplares disponibles.');
    }

    const { rows: loans } = await client.query(
      `INSERT INTO prestamos
         (usuario_id, libro_id, fecha_prestamo, fecha_limite, detalles, admin_prestamo_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [
        input.usuario_id,
        input.libro_id,
        loanDate,
        dueDate,
        nullableText(input.detalles),
        adminId,
      ],
    );
    const { rows: updatedBooks } = await client.query(
      `UPDATE libros SET disponible=disponible-1, fecha_actualizacion=NOW()
       WHERE id=$1 RETURNING disponible`,
      [input.libro_id],
    );
    return { loan: loans[0], disponible: updatedBooks[0].disponible };
  });

  cache.updateAvailability(input.libro_id, result.disponible);
  return result.loan;
}

export async function returnLoan({ pool, cache, adminId, loanId, input }) {
  const returnDate = input.fecha_devolucion || isoToday();
  const result = await withTransaction(pool, async (client) => {
    const { rows } = await client.query('SELECT * FROM prestamos WHERE id=$1 FOR UPDATE', [loanId]);
    const loan = rows[0];
    if (!loan) throw new AppError(404, 'PRESTAMO_NO_ENCONTRADO', 'Préstamo no encontrado.');
    if (loan.fecha_devolucion) {
      throw new AppError(409, 'PRESTAMO_YA_DEVUELTO', 'Este préstamo ya fue devuelto.');
    }
    if (returnDate < String(loan.fecha_prestamo).slice(0, 10)) {
      throw new AppError(400, 'FECHA_DEVOLUCION_INVALIDA', 'La devolución no puede ser anterior al préstamo.');
    }

    const { rows: returned } = await client.query(
      `UPDATE prestamos SET fecha_devolucion=$2, admin_devolucion_id=$3,
         fecha_actualizacion=NOW() WHERE id=$1 RETURNING *`,
      [loanId, returnDate, adminId],
    );
    const { rows: updatedBooks } = await client.query(
      `UPDATE libros SET disponible=disponible+1, fecha_actualizacion=NOW()
       WHERE id=$1 RETURNING disponible`,
      [loan.libro_id],
    );
    return {
      loan: returned[0],
      bookId: loan.libro_id,
      disponible: updatedBooks[0].disponible,
    };
  });

  cache.updateAvailability(result.bookId, result.disponible);
  return result.loan;
}
