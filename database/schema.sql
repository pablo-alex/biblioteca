BEGIN;

CREATE TABLE IF NOT EXISTS administradores (
  id BIGSERIAL PRIMARY KEY,
  usuario TEXT NOT NULL,
  nombre TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT administradores_usuario_no_vacio CHECK (BTRIM(usuario) <> ''),
  CONSTRAINT administradores_nombre_no_vacio CHECK (BTRIM(nombre) <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS administradores_usuario_unique
  ON administradores (LOWER(BTRIM(usuario)));

CREATE TABLE IF NOT EXISTS libros (
  id BIGSERIAL PRIMARY KEY,
  isbn TEXT,
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  generos TEXT[] NOT NULL DEFAULT '{}',
  anio_publicacion INTEGER,
  editorial TEXT,
  sinopsis TEXT,
  idioma TEXT,
  paginas INTEGER,
  imagen_url TEXT,
  imagen_public_id TEXT,
  cantidad INTEGER NOT NULL DEFAULT 1,
  disponible INTEGER NOT NULL DEFAULT 1,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT libros_titulo_no_vacio CHECK (BTRIM(titulo) <> ''),
  CONSTRAINT libros_autor_no_vacio CHECK (BTRIM(autor) <> ''),
  CONSTRAINT libros_isbn_no_vacio CHECK (isbn IS NULL OR BTRIM(isbn) <> ''),
  CONSTRAINT libros_anio_valido CHECK (anio_publicacion IS NULL OR anio_publicacion BETWEEN 0 AND 2200),
  CONSTRAINT libros_paginas_validas CHECK (paginas IS NULL OR paginas > 0),
  CONSTRAINT libros_cantidad_valida CHECK (cantidad > 0),
  CONSTRAINT libros_disponible_valido CHECK (disponible >= 0 AND disponible <= cantidad)
);

CREATE UNIQUE INDEX IF NOT EXISTS libros_isbn_unique
  ON libros (BTRIM(isbn)) WHERE isbn IS NOT NULL;
CREATE INDEX IF NOT EXISTS libros_activo_idx ON libros (activo);
CREATE INDEX IF NOT EXISTS libros_titulo_idx ON libros (LOWER(titulo));
CREATE INDEX IF NOT EXISTS libros_autor_idx ON libros (LOWER(autor));
CREATE INDEX IF NOT EXISTS libros_generos_idx ON libros USING GIN (generos);

CREATE TABLE IF NOT EXISTS usuarios (
  id BIGSERIAL PRIMARY KEY,
  nombre_completo TEXT NOT NULL,
  telefono TEXT,
  ci TEXT NOT NULL,
  direccion TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT usuarios_nombre_no_vacio CHECK (BTRIM(nombre_completo) <> ''),
  CONSTRAINT usuarios_ci_no_vacio CHECK (BTRIM(ci) <> '')
);

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_ci_unique
  ON usuarios (LOWER(BTRIM(ci)));
CREATE INDEX IF NOT EXISTS usuarios_activo_idx ON usuarios (activo);
CREATE INDEX IF NOT EXISTS usuarios_nombre_idx ON usuarios (LOWER(nombre_completo));

CREATE TABLE IF NOT EXISTS prestamos (
  id BIGSERIAL PRIMARY KEY,
  usuario_id BIGINT NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  libro_id BIGINT NOT NULL REFERENCES libros(id) ON DELETE RESTRICT,
  fecha_prestamo DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_limite DATE NOT NULL,
  fecha_devolucion DATE,
  detalles TEXT,
  admin_prestamo_id BIGINT NOT NULL REFERENCES administradores(id) ON DELETE RESTRICT,
  admin_devolucion_id BIGINT REFERENCES administradores(id) ON DELETE RESTRICT,
  fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT prestamos_fecha_limite_valida CHECK (fecha_limite >= fecha_prestamo),
  CONSTRAINT prestamos_devolucion_valida CHECK (
    (fecha_devolucion IS NULL AND admin_devolucion_id IS NULL)
    OR
    (fecha_devolucion IS NOT NULL AND admin_devolucion_id IS NOT NULL AND fecha_devolucion >= fecha_prestamo)
  )
);

CREATE INDEX IF NOT EXISTS prestamos_usuario_idx ON prestamos (usuario_id, fecha_prestamo DESC);
CREATE INDEX IF NOT EXISTS prestamos_libro_idx ON prestamos (libro_id, fecha_prestamo DESC);
CREATE INDEX IF NOT EXISTS prestamos_activos_idx
  ON prestamos (fecha_limite, id) WHERE fecha_devolucion IS NULL;

COMMIT;
