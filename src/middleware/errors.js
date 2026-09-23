import { ZodError } from 'zod';

export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function notFound(req, res) {
  res.status(404).json({ error: { code: 'NO_ENCONTRADO', message: 'Recurso no encontrado.' } });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'DATOS_INVALIDOS',
        message: 'Revisa los datos enviados.',
        details: error.issues.map(({ path, message }) => ({ field: path.join('.'), message })),
      },
    });
  }

  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: { code: 'IMAGEN_MUY_GRANDE', message: 'La portada no puede superar 6 MB.' } });
  }

  if (error.code === '23505') {
    const duplicate = error.constraint?.includes('isbn')
      ? 'Ya existe un libro con ese ISBN.'
      : error.constraint?.includes('ci')
        ? 'Ya existe un usuario con ese CI.'
        : error.constraint?.includes('administradores_usuario')
          ? 'Ya existe un administrador con ese usuario.'
          : 'Ya existe un registro con ese valor único.';
    return res.status(409).json({ error: { code: 'DUPLICADO', message: duplicate } });
  }

  const status = error.status || 500;
  if (status >= 500) console.error(error);
  return res.status(status).json({
    error: {
      code: error.code || 'ERROR_INTERNO',
      message: status >= 500 ? 'No pudimos completar la operación.' : error.message,
    },
  });
}
