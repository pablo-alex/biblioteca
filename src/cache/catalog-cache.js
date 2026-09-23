import { normalizeSearch } from '../domain.js';

export class CatalogCache {
  constructor(pool) {
    this.pool = pool;
    this.books = [];
    this.byId = new Map();
    this.ready = false;
  }

  async load() {
    const { rows } = await this.pool.query(`
      SELECT id, isbn, titulo, autor, generos, anio_publicacion, editorial,
             sinopsis, idioma, paginas, imagen_url, cantidad, disponible
      FROM libros
      WHERE activo = TRUE
      ORDER BY titulo, autor
    `);
    this.books = rows.map((book) => this.#indexBook(book));
    this.byId = new Map(this.books.map((book) => [String(book.id), book]));
    this.ready = true;
    return this.books.length;
  }

  #indexBook(book) {
    return {
      ...book,
      _search: normalizeSearch(`${book.titulo} ${book.autor}`),
      _genres: (book.generos || []).map(normalizeSearch),
    };
  }

  #publicBook(book) {
    if (!book) return null;
    const { _search, _genres, ...publicBook } = book;
    return publicBook;
  }

  search({ query = '', genre = '', limit = 24, offset = 0 } = {}) {
    const needle = normalizeSearch(query);
    const normalizedGenre = normalizeSearch(genre);
    const matches = this.books.filter((book) => {
      const queryMatches = !needle || book._search.includes(needle);
      const genreMatches = !normalizedGenre || book._genres.includes(normalizedGenre);
      return queryMatches && genreMatches;
    });
    return {
      total: matches.length,
      items: matches.slice(offset, offset + limit).map((book) => this.#publicBook(book)),
    };
  }

  suggestions(query, limit = 6) {
    const needle = normalizeSearch(query);
    if (needle.length < 2) return [];
    return this.books
      .filter((book) => book._search.includes(needle))
      .slice(0, limit)
      .map(({ id, titulo, autor, imagen_url, disponible }) => ({
        id, titulo, autor, imagen_url, disponible,
      }));
  }

  get(id) {
    return this.#publicBook(this.byId.get(String(id)));
  }

  genres() {
    return [...new Set(this.books.flatMap((book) => book.generos || []))]
      .sort((a, b) => a.localeCompare(b, 'es'));
  }

  updateAvailability(id, disponible) {
    const book = this.byId.get(String(id));
    if (book) book.disponible = disponible;
  }
}
