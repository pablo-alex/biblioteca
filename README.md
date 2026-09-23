# Biblioteca Pública Municipal

Aplicación web de catálogo público y gestión interna para una biblioteca física. Un único proceso Express sirve la API y, cuando esté listo, el frontend del mismo origen. PostgreSQL es la fuente de verdad y el catálogo público se consulta desde una caché en memoria.

## Requisitos

- Node.js 20 o superior
- PostgreSQL (el destino inicial es Neon)
- Una cuenta de Cloudinary para cargar portadas

## Puesta en marcha

1. Copia `.env.example` como `.env` y completa las variables.
2. Ejecuta `database/schema.sql` en Neon.
3. Instala dependencias con `npm install`.
4. Crea o actualiza el administrador inicial con `npm run admin:create`.
5. Carga los libros de `seed/libros.json` con `npm run seed`.
6. Inicia el servidor con `npm run dev`.

El endpoint `GET /api/health` confirma el arranque y el estado de la caché.

## Comandos

- `npm run dev`: servidor con reinicio automático de Node.
- `npm start`: servidor de producción.
- `npm test`: pruebas de reglas de negocio y caché.
- `npm run admin:create`: crea o rota las credenciales del administrador configurado.
- `npm run seed`: valida el JSON, carga portadas existentes en Cloudinary e inserta los libros. Una portada faltante no impide insertar su libro.

## API inicial

- Público: `/api/catalog`, `/api/catalog/suggestions`, `/api/catalog/genres`, `/api/catalog/:id`.
- Sesión: `/api/admin/login`, `/api/admin/session`, `/api/admin/logout`.
- Administración protegida: `/api/admin/dashboard`, `/api/admin/books`, `/api/admin/users`, `/api/admin/loans`.

Los préstamos y devoluciones bloquean las filas implicadas dentro de una transacción. La caché solo cambia después del commit y únicamente para el libro afectado.
