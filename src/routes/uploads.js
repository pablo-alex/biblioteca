import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { requireAdmin } from '../middleware/auth.js';
import { AppError } from '../middleware/errors.js';

const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024, files: 1 },
  fileFilter(req, file, callback) {
    if (!allowedTypes.has(file.mimetype)) {
      return callback(new AppError(400, 'IMAGEN_INVALIDA', 'Usa una imagen JPG, PNG, WebP o AVIF.'));
    }
    return callback(null, true);
  },
});

function uploadBuffer(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => error ? reject(error) : resolve(result));
    stream.end(buffer);
  });
}

export function uploadsRouter(config) {
  const router = Router();
  router.use(requireAdmin);

  router.post('/cover', upload.single('cover'), async (req, res) => {
    if (!config.cloudinary.cloudName || !config.cloudinary.apiKey || !config.cloudinary.apiSecret) {
      throw new AppError(503, 'CLOUDINARY_NO_CONFIGURADO', 'Configura Cloudinary para cargar portadas.');
    }
    if (!req.file) throw new AppError(400, 'PORTADA_REQUERIDA', 'Selecciona una imagen para cargar.');

    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
      secure: true,
    });
    const result = await uploadBuffer(req.file.buffer, {
      folder: config.cloudinary.folder,
      resource_type: 'image',
      unique_filename: true,
      overwrite: false,
    });
    res.status(201).json({ imagen_url: result.secure_url, imagen_public_id: result.public_id });
  });

  return router;
}
