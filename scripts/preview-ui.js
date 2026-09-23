import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.UI_PREVIEW_PORT || 4173);

const books = [
  { id: 1, isbn: '978-0060883287', titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', generos: ['Realismo mágico', 'Ficción'], anio_publicacion: 1967, editorial: 'Harper Perennial', sinopsis: 'La historia de varias generaciones de la familia Buendía en el pueblo ficticio de Macondo.', idioma: 'Español', paginas: 417, imagen_url: '/assets/images/cien-anos-de-soledad.jpg', cantidad: 3, disponible: 2, activo: true },
  { id: 2, isbn: null, titulo: 'El Principito', autor: 'Antoine de Saint-Exupéry', generos: ['Literatura infantil', 'Ficción'], anio_publicacion: 1943, editorial: null, sinopsis: 'Un encuentro poético entre un aviador y un pequeño viajero que observa el mundo con preguntas esenciales.', idioma: 'Español', paginas: 96, imagen_url: '/assets/images/el-principito.jpg', cantidad: 2, disponible: 1, activo: true },
  { id: 3, isbn: '978-0451524935', titulo: '1984', autor: 'George Orwell', generos: ['Distopía', 'Ciencia ficción'], anio_publicacion: 1949, editorial: 'Signet Classics', sinopsis: 'Una sociedad totalitaria donde el Estado controla la información y el pensamiento.', idioma: 'Español', paginas: 328, imagen_url: null, cantidad: 2, disponible: 0, activo: true },
  { id: 4, isbn: null, titulo: 'La casa de los espíritus', autor: 'Isabel Allende', generos: ['Ficción', 'Realismo mágico'], anio_publicacion: 1982, editorial: 'Plaza & Janés', sinopsis: 'Una saga familiar atravesada por la memoria, el amor y los cambios políticos.', idioma: 'Español', paginas: 454, imagen_url: null, cantidad: 1, disponible: 1, activo: true },
  { id: 5, isbn: null, titulo: 'Ficciones', autor: 'Jorge Luis Borges', generos: ['Cuento', 'Ficción'], anio_publicacion: 1944, editorial: 'Sur', sinopsis: 'Relatos donde bibliotecas, espejos y laberintos ponen en duda la realidad.', idioma: 'Español', paginas: 224, imagen_url: null, cantidad: 2, disponible: 2, activo: true },
  { id: 6, isbn: null, titulo: 'Pedro Páramo', autor: 'Juan Rulfo', generos: ['Novela', 'Realismo mágico'], anio_publicacion: 1955, editorial: 'Fondo de Cultura Económica', sinopsis: 'Un viaje a Comala entre voces, recuerdos y silencios.', idioma: 'Español', paginas: 136, imagen_url: null, cantidad: 1, disponible: 1, activo: true },
  { id: 7, isbn: null, titulo: 'El túnel', autor: 'Ernesto Sabato', generos: ['Novela', 'Psicológica'], anio_publicacion: 1948, editorial: 'Sur', sinopsis: 'La confesión obsesiva de un pintor aislado.', idioma: 'Español', paginas: 160, imagen_url: null, cantidad: 1, disponible: 1, activo: false }
];
const users = [
  { id: 1, nombre_completo: 'María Fernanda Rojas', ci: '8969130-F', telefono: '700 12345', direccion: 'Barrio Equipetrol', activo: true },
  { id: 2, nombre_completo: 'Luis Alberto Méndez', ci: '6044218', telefono: null, direccion: 'Villa Primero de Mayo', activo: true },
  { id: 3, nombre_completo: 'Ana Paula Suárez', ci: '7720431', telefono: '750 23456', direccion: null, activo: false }
];
const loans = [
  { id: 1, libro_id: 1, usuario_id: 1, titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez', nombre_completo: 'María Fernanda Rojas', ci: '8969130-F', fecha_prestamo: '2026-09-10', fecha_limite: '2026-09-17', fecha_devolucion: null, estado: 'vencido' },
  { id: 2, libro_id: 2, usuario_id: 2, titulo: 'El Principito', autor: 'Antoine de Saint-Exupéry', nombre_completo: 'Luis Alberto Méndez', ci: '6044218', fecha_prestamo: '2026-09-18', fecha_limite: '2026-09-25', fecha_devolucion: null, estado: 'activo' },
  { id: 3, libro_id: 5, usuario_id: 1, titulo: 'Ficciones', autor: 'Jorge Luis Borges', nombre_completo: 'María Fernanda Rojas', ci: '8969130-F', fecha_prestamo: '2026-08-01', fecha_limite: '2026-08-08', fecha_devolucion: '2026-08-07', estado: 'devuelto' }
];

const app = express();
app.use(express.json());
app.get('/api/catalog/genres', (req, res) => res.json({ items: [...new Set(books.filter((book) => book.activo).flatMap((book) => book.generos))].sort() }));
app.get('/api/catalog/suggestions', (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  res.json({ items: books.filter((book) => book.activo && `${book.titulo} ${book.autor}`.toLowerCase().includes(q)).slice(0, 6) });
});
app.get('/api/catalog/:id', (req, res) => {
  const book = books.find((item) => String(item.id) === req.params.id && item.activo);
  book ? res.json(book) : res.status(404).json({ error: { message: 'Libro no encontrado.' } });
});
app.get('/api/catalog', (req, res) => {
  const q = String(req.query.query || '').toLowerCase();
  const genre = String(req.query.genre || '').toLowerCase();
  const items = books.filter((book) => book.activo && (!q || `${book.titulo} ${book.autor}`.toLowerCase().includes(q)) && (!genre || book.generos.some((item) => item.toLowerCase() === genre)));
  res.json({ total: items.length, items });
});
app.get('/api/admin/session', (req, res) => res.json({ admin: { id: 1, usuario: 'administrador', nombre: 'María Gutiérrez' } }));
app.get('/api/admin/dashboard', (req, res) => res.json({ total_titulos: 6, total_ejemplares: 11, disponibles: 8, prestados: 3, usuarios_registrados: 3, prestamos_activos: 2, vencidos: 1 }));
app.get('/api/admin/books', (req, res) => {
  const q = String(req.query.query || '').toLowerCase();
  const active = req.query.active;
  res.json({ items: books.filter((book) => (!q || `${book.titulo} ${book.autor} ${book.isbn || ''}`.toLowerCase().includes(q)) && (active === undefined || active === '' || String(book.activo) === active)) });
});
app.get('/api/admin/users', (req, res) => {
  const q = String(req.query.query || '').toLowerCase();
  res.json({ items: users.filter((user) => (!q || `${user.nombre_completo} ${user.ci}`.toLowerCase().includes(q)) && (req.query.active !== 'true' || user.activo)) });
});
app.get('/api/admin/users/:id/history', (req, res) => res.json({ items: loans.filter((loan) => String(loan.usuario_id) === req.params.id) }));
app.get('/api/admin/loans', (req, res) => {
  const status = req.query.status || 'all';
  res.json({ items: loans.filter((loan) => status === 'all' || loan.estado === status || (status === 'active' && loan.estado !== 'devuelto') || (status === 'overdue' && loan.estado === 'vencido') || (status === 'returned' && loan.estado === 'devuelto')) });
});
app.use(express.static(path.join(root, 'public')));
app.get('/{*splat}', (req, res) => res.sendFile(path.join(root, 'public', 'index.html')));
app.listen(port, () => console.log(`UI preview: http://127.0.0.1:${port}`));
