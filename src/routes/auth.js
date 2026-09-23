import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AppError } from '../middleware/errors.js';

const credentialsSchema = z.object({
  usuario: z.string().trim().min(1).max(100),
  password: z.string().min(1).max(200),
});

function regenerate(session) {
  return new Promise((resolve, reject) => session.regenerate((error) => error ? reject(error) : resolve()));
}

function destroy(session) {
  return new Promise((resolve, reject) => session.destroy((error) => error ? reject(error) : resolve()));
}

export function authRouter(pool) {
  const router = Router();

  router.post('/login', async (req, res) => {
    const { usuario, password } = credentialsSchema.parse(req.body);
    const { rows } = await pool.query(
      `SELECT id, usuario, nombre, password_hash
       FROM administradores
       WHERE LOWER(usuario) = LOWER($1) AND activo = TRUE`,
      [usuario],
    );
    const admin = rows[0];
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      throw new AppError(401, 'CREDENCIALES_INVALIDAS', 'Usuario o contraseña incorrectos.');
    }
    await regenerate(req.session);
    req.session.admin = { id: admin.id, usuario: admin.usuario, nombre: admin.nombre };
    res.json({ admin: req.session.admin });
  });

  router.get('/session', (req, res) => {
    res.json({ admin: req.session?.admin || null });
  });

  router.post('/logout', async (req, res) => {
    if (req.session) await destroy(req.session);
    res.clearCookie('biblioteca.sid');
    res.status(204).end();
  });

  return router;
}
