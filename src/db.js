import pg from 'pg';
import { getConfig } from './config.js';

const { Pool } = pg;

export function createPool() {
  const config = getConfig();
  return new Pool({
    connectionString: config.databaseUrl,
    ssl: config.production ? { rejectUnauthorized: false } : undefined,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });
}

export async function withTransaction(pool, work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
