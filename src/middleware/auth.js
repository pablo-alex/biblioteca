import { AppError } from './errors.js';

export function requireAdmin(req, res, next) {
  if (!req.session?.admin) {
    return next(new AppError(401, 'SESION_REQUERIDA', 'Inicia sesión para continuar.'));
  }
  return next();
}
