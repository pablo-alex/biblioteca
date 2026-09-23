import { CatalogCache } from './cache/catalog-cache.js';
import { createApp } from './app.js';
import { getConfig } from './config.js';
import { createPool } from './db.js';

const config = getConfig();
const pool = createPool();
const cache = new CatalogCache(pool);

try {
  const count = await cache.load();
  const app = createApp({ pool, cache, config });
  const server = app.listen(config.port, () => {
    console.log(`Biblioteca disponible en http://localhost:${config.port} (${count} libros en caché).`);
  });

  const shutdown = (signal) => {
    console.log(`${signal}: cerrando servidor.`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
} catch (error) {
  console.error('No se pudo iniciar la aplicación.', error);
  await pool.end();
  process.exit(1);
}
