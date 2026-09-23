import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { createPool } from '../src/db.js';

const username = process.env.ADMIN_USERNAME?.trim();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || 'Administrador de biblioteca';

if (!username || !password) {
  console.error('Define ADMIN_USERNAME y ADMIN_PASSWORD antes de ejecutar este comando.');
  process.exit(1);
}
if (password.length < 12) {
  console.error('ADMIN_PASSWORD debe tener al menos 12 caracteres.');
  process.exit(1);
}

const pool = createPool();
try {
  const { rows: existingAdmins } = await pool.query(
    `SELECT usuario, (SELECT COUNT(*)::int FROM administradores) AS total
     FROM administradores
     WHERE LOWER(BTRIM(usuario)) = LOWER(BTRIM($1))`,
    [username],
  );
  const { rows: countRows } = existingAdmins.length
    ? { rows: [{ total: existingAdmins[0].total }] }
    : await pool.query('SELECT COUNT(*)::int AS total FROM administradores');
  if (!existingAdmins.length && countRows[0].total >= 2) {
    throw new Error('La aplicación admite como máximo dos administradores.');
  }

  const hash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    `INSERT INTO administradores (usuario, nombre, password_hash)
     VALUES ($1,$2,$3)
     ON CONFLICT (LOWER(BTRIM(usuario)))
     DO UPDATE SET nombre=EXCLUDED.nombre, password_hash=EXCLUDED.password_hash, activo=TRUE
     RETURNING id, usuario, nombre`,
    [username, name, hash],
  );
  console.log(`Administrador listo: ${rows[0].usuario} (${rows[0].nombre}).`);
} finally {
  await pool.end();
}
