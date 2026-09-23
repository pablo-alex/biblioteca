import { Router } from 'express';
import { AppError } from '../middleware/errors.js';

export function publicRouter(cache) {
  const router = Router();

  router.get('/catalog', (req, res) => {
    const limit = Math.min(Math.max(Number(req.query.limit) || 24, 1), 60);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    res.json(cache.search({
      query: String(req.query.query || ''),
      genre: String(req.query.genre || ''),
      limit,
      offset,
    }));
  });

  router.get('/catalog/suggestions', (req, res) => {
    res.json({ items: cache.suggestions(String(req.query.q || '')) });
  });

  router.get('/catalog/genres', (req, res) => {
    res.json({ items: cache.genres() });
  });

  router.get('/catalog/:id', (req, res, next) => {
    const book = cache.get(req.params.id);
    if (!book) return next(new AppError(404, 'LIBRO_NO_ENCONTRADO', 'Libro no encontrado.'));
    return res.json(book);
  });

  return router;
}
