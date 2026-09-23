import compression from 'compression';
import express from 'express';
import session from 'express-session';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getConfig } from './config.js';
import { errorHandler, notFound } from './middleware/errors.js';
import { adminRouter } from './routes/admin.js';
import { authRouter } from './routes/auth.js';
import { publicRouter } from './routes/public.js';
import { uploadsRouter } from './routes/uploads.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.resolve(here, '../public');

export function createApp({ pool, cache, config = getConfig({ requireDatabase: false }) }) {
  const app = express();
  if (config.production) app.set('trust proxy', 1);

  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));
  app.use(session({
    name: 'biblioteca.sid',
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: config.production,
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    },
  }));

  app.get('/api/health', (req, res) => res.json({ ok: true, catalogReady: cache.ready }));
  app.use('/api', publicRouter(cache));
  app.use('/api/admin', authRouter(pool));
  app.use('/api/admin/uploads', uploadsRouter(config));
  app.use('/api/admin', adminRouter(pool, cache));

  app.use(express.static(publicDirectory, { extensions: ['html'] }));
  app.use('/api', notFound);
  app.get('/{*splat}', (req, res, next) => {
    res.sendFile(path.join(publicDirectory, 'index.html'), (error) => error ? next() : undefined);
  });
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
