import 'dotenv/config';

function required(name, value) {
  if (!value) throw new Error(`Falta la variable de entorno ${name}.`);
  return value;
}

export function getConfig({ requireDatabase = true } = {}) {
  const production = process.env.NODE_ENV === 'production';
  return {
    production,
    port: Number(process.env.PORT || 3000),
    databaseUrl: requireDatabase
      ? required('DATABASE_URL', process.env.DATABASE_URL)
      : process.env.DATABASE_URL,
    sessionSecret: required('SESSION_SECRET', process.env.SESSION_SECRET),
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      folder: process.env.CLOUDINARY_FOLDER || 'biblioteca',
    },
  };
}
