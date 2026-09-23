import { api, escapeHtml, safeImageUrl } from './api.js';
import { icon } from './icons.js';

const state = {
  books: [],
  genres: [],
  query: '',
  genre: '',
  total: 0,
  loading: true,
  error: '',
  suggestionTimer: null,
  suggestions: [],
  suggestionIndex: -1,
  lastFocus: null,
  brickLastFocus: null,
};

function brand() {
  return `
    <span class="brand__mark" aria-hidden="true">${'<span></span>'.repeat(9)}</span>
    <span class="brand__text">
      <span class="brand__name">Biblioteca Pública Municipal</span>
      <span class="brand__place">Santa Cruz de la Sierra</span>
    </span>`;
}

function cover(book, className = '') {
  const source = safeImageUrl(book.imagen_url);
  if (source) return `<img class="${className}" src="${escapeHtml(source)}" alt="Portada de ${escapeHtml(book.titulo)}" />`;
  return `
    <div class="cover-placeholder ${className}" role="img" aria-label="Portada no disponible para ${escapeHtml(book.titulo)}">
      <div>
        <span class="cover-placeholder__mark" aria-hidden="true"><span></span><span></span><span></span></span>
        <strong>Portada no disponible</strong>
      </div>
    </div>`;
}

function featureBook({ id = '', title, author, image, available, className }) {
  return `
    <button class="brick-book ${className}" type="button" data-hero-book-id="${id}" data-featured-query="${escapeHtml(title)}" aria-label="Abrir ${escapeHtml(title)}">
      <span class="brick-book__inner">
        ${image ? `<img src="${image}" alt="Portada de ${escapeHtml(title)}" />` : `<span class="brick-book__fallback">Portada no disponible</span>`}
        <span class="brick-book__copy">
          <strong>${escapeHtml(title)}</strong>
          <small>${escapeHtml(author)}</small>
          <span class="availability">${available}</span>
        </span>
      </span>
    </button>`;
}

function shell() {
  return `
    <div class="public-page">
      <div class="institution-bar">
        <div class="institution-bar__inner">
          <p>Gobierno Autónomo Municipal de Santa Cruz de la Sierra</p>
          <p>El préstamo se registra presencialmente en recepción</p>
        </div>
      </div>
      <header class="site-header">
        <div class="site-header__inner">
          <a class="brand" href="/" aria-label="Inicio de Biblioteca Pública Municipal">${brand()}</a>
          <nav class="site-nav" aria-label="Navegación principal">
            <a href="#catalogo">Catálogo</a>
            <a href="#visita">Cómo prestar</a>
            <a class="admin-link" href="/admin">${icon('logIn')}<span>Administración</span></a>
          </nav>
        </div>
      </header>

      <main id="contenido">
        <section class="hero" aria-labelledby="hero-title">
          <div class="hero__copy">
            <h1 id="hero-title">Tu próxima lectura <em>está aquí.</em></h1>
            <p class="hero__intro">Explora el catálogo de la Biblioteca Pública Municipal y revisa cuántos ejemplares están disponibles. <strong>Para llevar un libro, visítanos en recepción.</strong></p>
            <form class="catalog-search" id="hero-search" role="search">
              <div class="search-box">
                ${icon('search', 'icon icon--lg')}
                <label class="sr-only" for="catalog-query">Buscar por título o autor</label>
                <input id="catalog-query" name="query" type="search" role="combobox" autocomplete="off" placeholder="Busca por título o autor" aria-controls="search-suggestions" aria-autocomplete="list" aria-expanded="false" />
                <button class="button" type="submit">Buscar ${icon('arrowRight')}</button>
              </div>
              <div class="suggestions" id="search-suggestions" role="listbox" hidden></div>
              <p class="hero__hint" id="hero-search-status" aria-live="polite">Escribe al menos dos letras para ver sugerencias.</p>
            </form>
          </div>
          <div class="brick-index" id="brick-index" aria-label="Selección del catálogo">
            <div class="brick-index__label"><span>Índice de lectura</span><span>Disponibilidad actual</span></div>
            <div class="brick-grid" id="brick-grid" aria-hidden="false">
              ${Array.from({ length: 14 }, () => '<span class="brick-hole" aria-hidden="true"></span>').join('')}
              ${featureBook({ title: 'Cien años de soledad', author: 'Gabriel García Márquez', image: '/assets/images/cien-anos-de-soledad.jpg', available: '3 ejemplares', className: 'brick-book--one' })}
              ${featureBook({ title: 'El Principito', author: 'Antoine de Saint-Exupéry', image: '/assets/images/el-principito.jpg', available: 'Disponible', className: 'brick-book--two' })}
              ${featureBook({ title: '1984', author: 'George Orwell', image: '', available: '2 ejemplares', className: 'brick-book--three' })}
            </div>
            <section class="brick-detail" id="brick-detail" role="dialog" aria-modal="false" aria-labelledby="brick-detail-title" hidden></section>
          </div>
        </section>

        <section class="catalog-section" id="catalogo" aria-labelledby="catalog-title">
          <div class="section-heading">
            <h2 id="catalog-title">Un catálogo para recorrer sin prisa.</h2>
            <p>Abre cualquier ficha para conocer la edición, sus géneros y la disponibilidad física antes de acercarte a la biblioteca.</p>
          </div>
          <div class="catalog-tools">
            <div class="field-inline">
              ${icon('filter')}
              <label for="genre-filter">Género</label>
              <select class="select-control" id="genre-filter"><option value="">Todos los géneros</option></select>
            </div>
            <button class="button button--quiet button--small" id="clear-filters" type="button" hidden>Limpiar filtros</button>
            <span class="catalog-count" id="catalog-count" aria-live="polite"></span>
          </div>
          <div class="book-grid" id="book-grid" aria-busy="true"></div>
        </section>

        <section class="visit-band" id="visita" aria-labelledby="visit-title">
          <div class="visit-band__inner">
            <h2 id="visit-title">Encuentra aquí. Llévalo en recepción.</h2>
            <p>Este sitio permite consultar el catálogo y la disponibilidad. Los préstamos y devoluciones se realizan personalmente en la Biblioteca Pública Municipal.</p>
            <a class="button" href="#catalogo">${icon('bookOpen')} Explorar libros</a>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <div class="site-footer__inner">
          <p>Biblioteca Pública Municipal · Santa Cruz de la Sierra</p>
          <p><a href="/admin">Acceso administrativo</a></p>
        </div>
      </footer>

      <div class="dialog-backdrop" id="book-dialog" role="presentation" hidden>
        <section class="dialog-panel" role="dialog" aria-modal="true" aria-labelledby="book-dialog-title">
          <button class="button button--icon dialog-close" id="dialog-close" type="button" aria-label="Cerrar detalle">${icon('close')}</button>
          <div id="book-dialog-content"></div>
        </section>
      </div>
    </div>`;
}

function renderBook(book) {
  const available = Number(book.disponible) > 0;
  const genres = (book.generos || []).slice(0, 2).join(' · ') || 'Sin género indicado';
  return `
    <button class="book-card" type="button" data-book-id="${book.id}" aria-label="Ver detalles de ${escapeHtml(book.titulo)}">
      <span class="book-card__visual">
        ${cover(book)}
        <span class="book-card__status ${available ? '' : 'book-card__status--none'}">${available ? `${book.disponible} disponible${Number(book.disponible) === 1 ? '' : 's'}` : 'No disponible'}</span>
      </span>
      <span class="book-card__body">
        <span class="book-card__genres">${escapeHtml(genres)}</span>
        <h3>${escapeHtml(book.titulo)}</h3>
        <p>${escapeHtml(book.autor)}</p>
        <span class="book-card__open">Abrir ficha ${icon('arrowRight', 'icon icon--sm')}</span>
      </span>
    </button>`;
}

function renderHeroBook(book, index) {
  const classes = ['brick-book--one', 'brick-book--two', 'brick-book--three'];
  const image = safeImageUrl(book.imagen_url);
  const available = Number(book.disponible) > 0
    ? `${book.disponible} ${Number(book.disponible) === 1 ? 'ejemplar' : 'ejemplares'}`
    : 'No disponible';
  return `
    <button class="brick-book ${classes[index]} ${index === 0 && state.query ? 'is-match' : ''}" type="button" data-hero-book-id="${book.id}" aria-label="Abrir ${escapeHtml(book.titulo)}">
      <span class="brick-book__inner">
        ${image ? `<img src="${escapeHtml(image)}" alt="Portada de ${escapeHtml(book.titulo)}" />` : '<span class="brick-book__fallback">Portada no disponible</span>'}
        <span class="brick-book__copy"><strong>${escapeHtml(book.titulo)}</strong><small>${escapeHtml(book.autor)}</small><span class="availability ${available === 'No disponible' ? 'availability--none' : ''}">${available}</span></span>
      </span>
    </button>`;
}

function bindHeroBooks() {
  document.querySelectorAll('[data-hero-book-id]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.heroBookId) openBrickDetail(button.dataset.heroBookId, button);
    });
  });
}

function updateHeroIndex(books) {
  const grid = document.querySelector('#brick-grid');
  if (!grid) return;
  grid.classList.add('is-reordering');
  window.setTimeout(() => {
    const holes = Array.from({ length: 14 }, () => '<span class="brick-hole" aria-hidden="true"></span>').join('');
    grid.innerHTML = books.length
      ? `${holes}${books.slice(0, 3).map(renderHeroBook).join('')}`
      : `${holes}<div class="brick-empty"><strong>Ningún vano coincide todavía.</strong><span>Prueba con otro título o autor.</span></div>`;
    grid.classList.remove('is-reordering');
    bindHeroBooks();
  }, 170);
}

function brickDetailContent(book) {
  const image = safeImageUrl(book.imagen_url);
  return `
    <button class="button button--icon brick-detail__close" type="button" aria-label="Volver al índice">${icon('close')}</button>
    <div class="brick-detail__cover">${image ? `<img src="${escapeHtml(image)}" alt="Portada de ${escapeHtml(book.titulo)}" />` : '<span>Portada no disponible</span>'}</div>
    <div class="brick-detail__copy">
      <h2 id="brick-detail-title">${escapeHtml(book.titulo)}</h2>
      <p class="brick-detail__author">${escapeHtml(book.autor)}</p>
      <p class="brick-detail__availability">${Number(book.disponible) > 0 ? `<strong>${book.disponible} de ${book.cantidad}</strong> disponibles` : '<strong>Sin ejemplares disponibles</strong>'}</p>
      <p>${escapeHtml(book.sinopsis || 'Este título todavía no tiene una sinopsis registrada.')}</p>
      <button class="button button--quiet button--small" type="button" data-full-detail="${book.id}">Ver ficha completa ${icon('arrowRight', 'icon icon--sm')}</button>
    </div>`;
}

async function openBrickDetail(id, trigger) {
  const detailPanel = document.querySelector('#brick-detail');
  const grid = document.querySelector('#brick-grid');
  state.brickLastFocus = trigger;
  detailPanel.innerHTML = loadingTemplateForBrick();
  detailPanel.hidden = false;
  grid.inert = true;
  grid.setAttribute('aria-hidden', 'true');
  document.querySelector('#brick-index').classList.add('is-detailing');
  try {
    const book = state.books.find((item) => String(item.id) === String(id)) || await api(`/api/catalog/${id}`);
    detailPanel.innerHTML = brickDetailContent(book);
    detailPanel.querySelector('.brick-detail__close').addEventListener('click', closeBrickDetail);
    detailPanel.querySelector('[data-full-detail]').addEventListener('click', () => {
      closeBrickDetail(false);
      openBook(book.id, trigger);
    });
    detailPanel.querySelector('.brick-detail__close').focus();
  } catch (error) {
    detailPanel.innerHTML = `<button class="button button--icon brick-detail__close" type="button" aria-label="Volver al índice">${icon('close')}</button><div class="state-copy"><h3>No pudimos abrir esta ficha</h3><p>${escapeHtml(error.message)}</p></div>`;
    detailPanel.querySelector('.brick-detail__close').addEventListener('click', closeBrickDetail);
  }
}

function loadingTemplateForBrick() {
  return `<div class="loading-bricks" aria-label="Abriendo ficha"><span></span><span></span><span></span></div>`;
}

function closeBrickDetail(restoreFocus = true) {
  const detailPanel = document.querySelector('#brick-detail');
  const grid = document.querySelector('#brick-grid');
  detailPanel.hidden = true;
  grid.inert = false;
  grid.setAttribute('aria-hidden', 'false');
  document.querySelector('#brick-index').classList.remove('is-detailing');
  if (restoreFocus) state.brickLastFocus?.focus?.();
}

function renderCatalog() {
  const grid = document.querySelector('#book-grid');
  const count = document.querySelector('#catalog-count');
  grid.setAttribute('aria-busy', String(state.loading));
  count.textContent = state.loading ? 'Consultando catálogo…' : `${state.total} ${state.total === 1 ? 'título encontrado' : 'títulos encontrados'}`;

  if (state.loading) {
    grid.innerHTML = `<div class="loading-state"><div class="state-copy"><div class="loading-bricks" aria-hidden="true"><span></span><span></span><span></span></div><h3>Abriendo el catálogo</h3><p>Estamos ordenando los títulos y su disponibilidad.</p></div></div>`;
    return;
  }
  if (state.error) {
    grid.innerHTML = `<div class="error-state"><div class="state-copy">${icon('warning', 'icon icon--lg')}<h3>No pudimos abrir el catálogo</h3><p>${escapeHtml(state.error)}</p><button class="button button--quiet" id="retry-catalog" type="button">${icon('refresh')} Intentar otra vez</button></div></div>`;
    document.querySelector('#retry-catalog')?.addEventListener('click', loadCatalog);
    return;
  }
  if (!state.books.length) {
    grid.innerHTML = `<div class="empty-state"><div class="state-copy">${icon('bookOpen', 'icon icon--lg')}<h3>No encontramos títulos con esos criterios</h3><p>Prueba con otra palabra o muestra todos los géneros.</p><button class="button button--quiet" id="empty-clear" type="button">Ver todo el catálogo</button></div></div>`;
    document.querySelector('#empty-clear')?.addEventListener('click', clearFilters);
    return;
  }
  grid.innerHTML = state.books.map(renderBook).join('');
  grid.querySelectorAll('[data-book-id]').forEach((button) => {
    button.addEventListener('click', () => openBook(button.dataset.bookId, button));
  });
}

async function loadCatalog() {
  state.loading = true;
  state.error = '';
  renderCatalog();
  const params = new URLSearchParams({ limit: '60' });
  if (state.query) params.set('query', state.query);
  if (state.genre) params.set('genre', state.genre);
  try {
    const result = await api(`/api/catalog?${params}`);
    state.books = result.items;
    state.total = result.total;
    updateHeroIndex(state.books);
  } catch (error) {
    state.books = [];
    state.total = 0;
    state.error = error.message;
  } finally {
    state.loading = false;
    renderCatalog();
    const status = document.querySelector('#hero-search-status');
    if (status && state.query) {
      status.textContent = state.total
        ? `${state.total} ${state.total === 1 ? 'coincidencia ascendió' : 'coincidencias reorganizaron'} el índice. Abre una ficha en la fachada o recorre el catálogo.`
        : 'No hubo coincidencias; prueba con otra palabra.';
    }
  }
}

async function loadGenres() {
  try {
    const result = await api('/api/catalog/genres');
    state.genres = result.items;
    document.querySelector('#genre-filter').innerHTML = [
      '<option value="">Todos los géneros</option>',
      ...state.genres.map((genre) => `<option value="${escapeHtml(genre)}">${escapeHtml(genre)}</option>`),
    ].join('');
  } catch {
    // The catalog remains usable without the optional genre list.
  }
}

async function loadSuggestions(value) {
  const suggestions = document.querySelector('#search-suggestions');
  const input = document.querySelector('#catalog-query');
  if (value.trim().length < 2) {
    suggestions.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    state.suggestions = [];
    state.suggestionIndex = -1;
    return;
  }
  try {
    const result = await api(`/api/catalog/suggestions?q=${encodeURIComponent(value.trim())}`);
    state.suggestions = result.items;
    state.suggestionIndex = -1;
    if (!result.items.length) {
      suggestions.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      return;
    }
    suggestions.innerHTML = result.items.map((book, index) => {
      const image = safeImageUrl(book.imagen_url);
      return `
        <button class="suggestion" id="search-option-${index}" type="button" role="option" aria-selected="false" data-suggestion-index="${index}" data-suggestion-id="${book.id}">
          ${image ? `<img src="${escapeHtml(image)}" alt="" />` : '<span class="suggestion__cover" aria-hidden="true"></span>'}
          <span><strong>${escapeHtml(book.titulo)}</strong><small>${escapeHtml(book.autor)}</small></span>
          <span class="suggestion__availability">${book.disponible > 0 ? 'Disponible' : 'Sin ejemplares'}</span>
        </button>`;
    }).join('');
    suggestions.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    suggestions.querySelectorAll('[data-suggestion-id]').forEach((button) => {
      button.addEventListener('click', () => {
        suggestions.hidden = true;
        input.setAttribute('aria-expanded', 'false');
        openBrickDetail(button.dataset.suggestionId, input);
      });
      button.addEventListener('pointerenter', () => setActiveSuggestion(Number(button.dataset.suggestionIndex)));
    });
  } catch {
    suggestions.hidden = true;
    input.setAttribute('aria-expanded', 'false');
  }
}

function setActiveSuggestion(index) {
  const options = [...document.querySelectorAll('#search-suggestions [role="option"]')];
  if (!options.length) return;
  state.suggestionIndex = (index + options.length) % options.length;
  options.forEach((option, optionIndex) => option.setAttribute('aria-selected', String(optionIndex === state.suggestionIndex)));
  const active = options[state.suggestionIndex];
  document.querySelector('#catalog-query').setAttribute('aria-activedescendant', active.id);
  active.scrollIntoView({ block: 'nearest' });
}

function detail(book) {
  const available = Number(book.disponible) > 0;
  return `
    <article class="book-detail">
      <div class="book-detail__cover">${cover(book)}</div>
      <div class="book-detail__content">
        <h2 id="book-dialog-title">${escapeHtml(book.titulo)}</h2>
        <p class="book-detail__author">${escapeHtml(book.autor)}</p>
        <p class="detail-availability">${available ? `<strong>${book.disponible} de ${book.cantidad}</strong> ejemplares disponibles` : `<strong>Sin ejemplares disponibles</strong> de ${book.cantidad} en total`}</p>
        ${(book.generos || []).length ? `<ul class="detail-genres">${book.generos.map((genre) => `<li class="tag">${escapeHtml(genre)}</li>`).join('')}</ul>` : ''}
        <p class="detail-synopsis">${escapeHtml(book.sinopsis || 'Este título todavía no tiene una sinopsis registrada.')}</p>
        <dl class="detail-list">
          <div><dt>ISBN</dt><dd>${escapeHtml(book.isbn || 'No registrado')}</dd></div>
          <div><dt>Año</dt><dd>${escapeHtml(book.anio_publicacion || 'No registrado')}</dd></div>
          <div><dt>Editorial</dt><dd>${escapeHtml(book.editorial || 'No registrada')}</dd></div>
          <div><dt>Idioma</dt><dd>${escapeHtml(book.idioma || 'No registrado')}</dd></div>
          <div><dt>Páginas</dt><dd>${escapeHtml(book.paginas || 'No registradas')}</dd></div>
          <div><dt>Préstamo</dt><dd>Presencial en recepción</dd></div>
        </dl>
      </div>
    </article>`;
}

async function openBook(id, trigger) {
  const dialog = document.querySelector('#book-dialog');
  const content = document.querySelector('#book-dialog-content');
  state.lastFocus = trigger || document.activeElement;
  content.innerHTML = `<div class="loading-state"><div class="loading-bricks" aria-hidden="true"><span></span><span></span><span></span></div></div>`;
  dialog.hidden = false;
  document.body.classList.add('dialog-open');
  setPageInert(true);
  document.querySelector('#dialog-close').focus();
  try {
    const book = state.books.find((item) => String(item.id) === String(id)) || await api(`/api/catalog/${id}`);
    content.innerHTML = detail(book);
  } catch (error) {
    content.innerHTML = `<div class="error-state"><div class="state-copy"><h3>No pudimos abrir esta ficha</h3><p>${escapeHtml(error.message)}</p></div></div>`;
  }
}

function closeDialog() {
  const dialog = document.querySelector('#book-dialog');
  dialog.hidden = true;
  document.body.classList.remove('dialog-open');
  setPageInert(false);
  state.lastFocus?.focus?.();
}

function setPageInert(inert) {
  document.querySelectorAll('.public-page > :not(#book-dialog)').forEach((element) => {
    element.inert = inert;
  });
}

function trapFocus(event, container) {
  if (event.key !== 'Tab') return;
  const focusable = [...container.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hidden && element.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

function clearFilters() {
  state.query = '';
  state.genre = '';
  document.querySelector('#catalog-query').value = '';
  document.querySelector('#genre-filter').value = '';
  document.querySelector('#clear-filters').hidden = true;
  loadCatalog();
}

function bindEvents() {
  const form = document.querySelector('#hero-search');
  const input = document.querySelector('#catalog-query');
  const suggestions = document.querySelector('#search-suggestions');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    state.query = input.value.trim();
    suggestions.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    document.querySelector('#clear-filters').hidden = !(state.query || state.genre);
    document.querySelector('#hero-search-status').textContent = 'Reordenando el índice…';
    loadCatalog();
  });
  input.addEventListener('input', () => {
    clearTimeout(state.suggestionTimer);
    state.suggestionTimer = setTimeout(() => loadSuggestions(input.value), 180);
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' && !suggestions.hidden) { event.preventDefault(); setActiveSuggestion(state.suggestionIndex + 1); }
    if (event.key === 'ArrowUp' && !suggestions.hidden) { event.preventDefault(); setActiveSuggestion(state.suggestionIndex - 1); }
    if (event.key === 'Enter' && !suggestions.hidden && state.suggestionIndex >= 0) {
      event.preventDefault();
      suggestions.querySelectorAll('[role="option"]')[state.suggestionIndex]?.click();
    }
    if (event.key === 'Escape') {
      suggestions.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
    }
  });
  document.addEventListener('click', (event) => {
    if (!form.contains(event.target)) {
      suggestions.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
    }
  });

  document.querySelector('#genre-filter').addEventListener('change', (event) => {
    state.genre = event.target.value;
    document.querySelector('#clear-filters').hidden = !(state.query || state.genre);
    loadCatalog();
  });
  document.querySelector('#clear-filters').addEventListener('click', clearFilters);
  document.querySelectorAll('[data-featured-query]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.heroBookId) { openBrickDetail(button.dataset.heroBookId, button); return; }
      input.value = button.dataset.featuredQuery;
      state.query = button.dataset.featuredQuery;
      document.querySelector('#clear-filters').hidden = false;
      loadCatalog();
    });
  });

  document.querySelector('#dialog-close').addEventListener('click', closeDialog);
  document.querySelector('#book-dialog').addEventListener('click', (event) => {
    if (event.target.id === 'book-dialog') closeDialog();
  });
  document.addEventListener('keydown', (event) => {
    const dialog = document.querySelector('#book-dialog');
    const brickDetail = document.querySelector('#brick-detail');
    if (!dialog.hidden) {
      if (event.key === 'Escape') closeDialog();
      trapFocus(event, dialog);
    } else if (!brickDetail.hidden) {
      if (event.key === 'Escape') closeBrickDetail();
      trapFocus(event, brickDetail);
    }
  });
}

export async function renderCatalogApp(root) {
  root.innerHTML = shell();
  bindEvents();
  bindHeroBooks();
  renderCatalog();
  await Promise.all([loadCatalog(), loadGenres()]);
}
