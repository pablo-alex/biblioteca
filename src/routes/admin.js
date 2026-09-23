import { Router } from 'express';
import { z } from 'zod';
import { withTransaction } from '../db.js';
import {
  availableAfterQuantityChange,
  bookInputSchema,
  bookPatchSchema,
  loanInputSchema,
  nullableText,
  returnInputSchema,
  userInputSchema,
  userPatchSchema,
} from '../domain.js';
import { requireAdmin } from '../middleware/auth.js';
import { AppError } from '../middleware/errors.js';
import { createLoan, returnLoan } from '../services/circulation.js';

const activeSchema = z.object({ activo: z.boolean() });

function idFrom(value, entity = 'registro') {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'ID_INVALIDO', `El identificador del ${entity} no es válido.`);
  }
  return id;
}

function cleanBook(book) {
  return {
    ...book,
    isbn: nullableText(book.isbn),
    editorial: nullableText(book.editorial),
    sinopsis: nullableText(book.sinopsis),
    idioma: nullableText(book.idioma),
    imagen_url: nullableText(book.imagen_url),
    imagen_public_id: nullableText(book.imagen_public_id),
    generos: [...new Set((book.generos || []).map((genre) => genre.trim()).filter(Boolean))],
  };
}

function cleanUser(user) {
  return {
    ...user,
    telefono: nullableText(user.telefono),
    direccion: nullableText(user.direccion),
  };
}

export function adminRouter(pool, cache) {
  const router = Router();
  router.use(requireAdmin);

  router.get('/dashboard', async (req, res) => {
    const { rows: [stats] } = await pool.query(`
      SELECT
        (SELECT COUNT(*)::int FROM libros WHERE activo = TRUE) AS total_titulos,
        (SELECT COALESCE(SUM(cantidad), 0)::int FROM libros WHERE activo = TRUE) AS total_ejemplares,
        (SELECT COALESCE(SUM(disponible), 0)::int FROM libros WHERE activo = TRUE) AS disponibles,
        (SELECT COALESCE(SUM(cantidad - disponible), 0)::int FROM libros WHERE activo = TRUE) AS prestados,
        (SELECT COUNT(*)::int FROM usuarios) AS usuarios_registrados,
        (SELECT COUNT(*)::int FROM prestamos WHERE fecha_devolucion IS NULL) AS prestamos_activos,
        (SELECT COUNT(*)::int FROM prestamos WHERE fecha_devolucion IS NULL AND fecha_limite < CURRENT_DATE) AS vencidos
    `);
    res.json(stats);
  });

  router.get('/books', async (req, res) => {
    const query = String(req.query.query || '').trim();
    const active = req.query.active;
    const values = [`%${query}%`];
    const clauses = ['(titulo ILIKE $1 OR autor ILIKE $1 OR COALESCE(isbn, \'\') ILIKE $1)'];
    if (active === 'true' || active === 'false') {
      values.push(active === 'true');
      clauses.push(`activo = $${values.length}`);
    }
    const { rows } = await pool.query(
      `SELECT * FROM libros WHERE ${clauses.join(' AND ')} ORDER BY titulo, autor LIMIT 100`,
      values,
    );
    res.json({ items: rows });
  });

  router.post('/books', async (req, res) => {
    const book = cleanBook(bookInputSchema.parse(req.body));
    const { rows } = await pool.query(
      `INSERT INTO libros
        (isbn, titulo, autor, generos, anio_publicacion, editorial, sinopsis,
         idioma, paginas, imagen_url, imagen_public_id, cantidad, disponible, activo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$12,$13)
       RETURNING *`,
      [
        book.isbn, book.titulo, book.autor, book.generos, book.anio_publicacion,
        book.editorial, book.sinopsis, book.idioma, book.paginas, book.imagen_url,
        book.imagen_public_id, book.cantidad, book.activo,
      ],
    );
    await cache.load();
    res.status(201).json(rows[0]);
  });

  router.patch('/books/:id', async (req, res) => {
    const id = idFrom(req.params.id, 'libro');
    const patch = bookPatchSchema.parse(req.body);
    const updated = await withTransaction(pool, async (client) => {
      const { rows } = await client.query('SELECT * FROM libros WHERE id = $1 FOR UPDATE', [id]);
      const current = rows[0];
      if (!current) throw new AppError(404, 'LIBRO_NO_ENCONTRADO', 'Libro no encontrado.');

      const next = cleanBook({ ...current, ...patch });
      try {
        next.disponible = patch.cantidad === undefined
          ? current.disponible
          : availableAfterQuantityChange(current, next.cantidad);
      } catch (error) {
        throw new AppError(409, 'CANTIDAD_MENOR_A_PRESTADOS', error.message);
      }

      const { rows: changed } = await client.query(
        `UPDATE libros SET
           isbn=$2, titulo=$3, autor=$4, generos=$5, anio_publicacion=$6,
           editorial=$7, sinopsis=$8, idioma=$9, paginas=$10, imagen_url=$11,
           imagen_public_id=$12, cantidad=$13, disponible=$14, activo=$15,
           fecha_actualizacion=NOW()
         WHERE id=$1 RETURNING *`,
        [
          id, next.isbn, next.titulo, next.autor, next.generos, next.anio_publicacion,
          next.editorial, next.sinopsis, next.idioma, next.paginas, next.imagen_url,
          next.imagen_public_id, next.cantidad, next.disponible, next.activo,
        ],
      );
      return changed[0];
    });
    await cache.load();
    res.json(updated);
  });

  router.patch('/books/:id/active', async (req, res) => {
    const id = idFrom(req.params.id, 'libro');
    const { activo } = activeSchema.parse(req.body);
    const { rows } = await pool.query(
      'UPDATE libros SET activo=$2, fecha_actualizacion=NOW() WHERE id=$1 RETURNING *',
      [id, activo],
    );
    if (!rows[0]) throw new AppError(404, 'LIBRO_NO_ENCONTRADO', 'Libro no encontrado.');
    await cache.load();
    res.json(rows[0]);
  });

  router.get('/users', async (req, res) => {
    const query = String(req.query.query || '').trim();
    const onlyActive = req.query.active === 'true';
    const { rows } = await pool.query(
      `SELECT * FROM usuarios
       WHERE (nombre_completo ILIKE $1 OR ci ILIKE $1)
         AND ($2::boolean = FALSE OR activo = TRUE)
       ORDER BY nombre_completo LIMIT 100`,
      [`%${query}%`, onlyActive],
    );
    res.json({ items: rows });
  });

  router.post('/users', async (req, res) => {
    const user = cleanUser(userInputSchema.parse(req.body));
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nombre_completo, telefono, ci, direccion, activo)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [user.nombre_completo, user.telefono, user.ci, user.direccion, user.activo],
    );
    res.status(201).json(rows[0]);
  });

  router.patch('/users/:id', async (req, res) => {
    const id = idFrom(req.params.id, 'usuario');
    const patch = userPatchSchema.parse(req.body);
    const { rows: currentRows } = await pool.query('SELECT * FROM usuarios WHERE id=$1', [id]);
    if (!currentRows[0]) throw new AppError(404, 'USUARIO_NO_ENCONTRADO', 'Usuario no encontrado.');
    const user = cleanUser({ ...currentRows[0], ...patch });
    const { rows } = await pool.query(
      `UPDATE usuarios SET nombre_completo=$2, telefono=$3, ci=$4, direccion=$5,
         activo=$6, fecha_actualizacion=NOW() WHERE id=$1 RETURNING *`,
      [id, user.nombre_completo, user.telefono, user.ci, user.direccion, user.activo],
    );
    res.json(rows[0]);
  });

  router.patch('/users/:id/active', async (req, res) => {
    const id = idFrom(req.params.id, 'usuario');
    const { activo } = activeSchema.parse(req.body);
    const { rows } = await pool.query(
      'UPDATE usuarios SET activo=$2, fecha_actualizacion=NOW() WHERE id=$1 RETURNING *',
      [id, activo],
    );
    if (!rows[0]) throw new AppError(404, 'USUARIO_NO_ENCONTRADO', 'Usuario no encontrado.');
    res.json(rows[0]);
  });

  router.get('/users/:id/history', async (req, res) => {
    const id = idFrom(req.params.id, 'usuario');
    const { rows } = await pool.query(
      `SELECT p.*, l.titulo, l.autor,
         CASE
           WHEN p.fecha_devolucion IS NOT NULL THEN 'devuelto'
           WHEN p.fecha_limite < CURRENT_DATE THEN 'vencido'
           ELSE 'activo'
         END AS estado
       FROM prestamos p
       JOIN libros l ON l.id = p.libro_id
       WHERE p.usuario_id=$1
       ORDER BY p.fecha_prestamo DESC, p.id DESC`,
      [id],
    );
    res.json({ items: rows });
  });

  router.get('/loans', async (req, res) => {
    const status = String(req.query.status || 'all');
    const clauses = [];
    if (status === 'active') clauses.push('p.fecha_devolucion IS NULL');
    if (status === 'overdue') clauses.push('p.fecha_devolucion IS NULL AND p.fecha_limite < CURRENT_DATE');
    if (status === 'returned') clauses.push('p.fecha_devolucion IS NOT NULL');
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await pool.query(`
      SELECT p.*, u.nombre_completo, u.ci, l.titulo, l.autor,
        CASE
          WHEN p.fecha_devolucion IS NOT NULL THEN 'devuelto'
          WHEN p.fecha_limite < CURRENT_DATE THEN 'vencido'
          ELSE 'activo'
        END AS estado
      FROM prestamos p
      JOIN usuarios u ON u.id = p.usuario_id
      JOIN libros l ON l.id = p.libro_id
      ${where}
      ORDER BY (p.fecha_devolucion IS NULL) DESC, p.fecha_limite, p.id DESC
      LIMIT 250
    `);
    res.json({ items: rows });
  });

  router.post('/loans', async (req, res) => {
    const input = loanInputSchema.parse(req.body);
    const loan = await createLoan({
      pool,
      cache,
      adminId: req.session.admin.id,
      input,
    });
    res.status(201).json(loan);
  });

  router.post('/loans/:id/return', async (req, res) => {
    const id = idFrom(req.params.id, 'préstamo');
    const input = returnInputSchema.parse(req.body || {});
    const loan = await returnLoan({
      pool,
      cache,
      adminId: req.session.admin.id,
      loanId: id,
      input,
    });
    res.json(loan);
  });

  return router;
}
