import { api, escapeHtml, formatDate, toast } from './api.js';
import { icon } from './icons.js';

const state = {
  admin: null,
  view: 'dashboard',
  stats: null,
  books: [],
  users: [],
  loans: [],
  loanStatus: 'active',
  searchTimer: null,
};

const viewMeta = {
  dashboard: { label: 'Resumen', icon: 'dashboard' },
  books: { label: 'Libros', icon: 'library' },
  users: { label: 'Usuarios', icon: 'users' },
  loans: { label: 'Préstamos', icon: 'loans' },
};

function brand() {
  return `
    <span class="brand__mark" aria-hidden="true">${'<span></span>'.repeat(9)}</span>
    <span class="brand__text">
      <span class="brand__name">Biblioteca Pública Municipal</span>
      <span class="brand__place">Administración</span>
    </span>`;
}

function loginView() {
  return `
    <main class="admin-login" id="contenido">
      <section class="admin-login__form">
        <a class="brand" href="/">${brand()}</a>
        <h1>El mostrador, en orden.</h1>
        <p>Inicia sesión para administrar el catálogo, las personas usuarias y la circulación de ejemplares.</p>
        <form class="form-stack" id="login-form">
          <div class="form-field">
            <label for="login-user">Usuario</label>
            <input class="input-control" id="login-user" name="usuario" autocomplete="username" required />
          </div>
          <div class="form-field">
            <label for="login-password">Contraseña</label>
            <input class="input-control" id="login-password" name="password" type="password" autocomplete="current-password" required />
          </div>
          <p class="form-message" id="login-message" aria-live="polite"></p>
          <button class="button" type="submit">${icon('logIn')} Entrar a administración</button>
        </form>
      </section>
      <section class="admin-login__visual" aria-label="Fachada de la biblioteca">
        <img src="/assets/images/frontis.jpg" alt="Fachada de ladrillo de la Biblioteca Centro Cultural DM-10" />
        <div class="admin-login__quote"><strong>Servicio público, registro claro.</strong><span>Biblioteca Centro Cultural DM-10</span></div>
      </section>
    </main>`;
}

function shell() {
  return `
    <div class="admin-page">
      <div class="admin-shell">
        <aside class="admin-sidebar" id="admin-sidebar">
          <a class="brand" href="/">${brand()}</a>
          <nav class="admin-nav" aria-label="Administración">
            ${Object.entries(viewMeta).map(([id, item]) => `
              <button type="button" data-admin-view="${id}" ${id === state.view ? 'aria-current="page"' : ''}>${icon(item.icon)}<span>${item.label}</span></button>`).join('')}
          </nav>
          <div class="admin-sidebar__bottom">
            <div class="admin-identity"><strong>${escapeHtml(state.admin.nombre)}</strong><span>${escapeHtml(state.admin.usuario)}</span></div>
            <button class="button button--quiet button--small" id="logout-button" type="button">${icon('logOut')}<span>Cerrar sesión</span></button>
          </div>
        </aside>
        <div class="admin-main">
          <header class="admin-topbar">
            <div style="display:flex;align-items:center;gap:10px">
              <button class="button button--quiet button--icon mobile-nav-button" id="mobile-nav" type="button" aria-label="Abrir navegación">${icon('menu')}</button>
              <h1 id="admin-view-title">${viewMeta[state.view].label}</h1>
            </div>
            <div class="admin-topbar__actions"><a class="button button--quiet button--small" href="/">Ver catálogo</a></div>
          </header>
          <main class="admin-content" id="admin-content"></main>
        </div>
      </div>
      <div class="sheet-backdrop" id="admin-sheet" hidden>
        <aside class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
          <header class="sheet__header"><h2 id="sheet-title">Formulario</h2><button class="button button--quiet button--icon" id="close-sheet" type="button" aria-label="Cerrar">${icon('close')}</button></header>
          <div class="sheet__body" id="sheet-content"></div>
        </aside>
      </div>
    </div>`;
}

function pageHeading(title, description, action = '') {
  return `<div class="admin-heading"><div><h2>${title}</h2><p>${description}</p></div>${action}</div>`;
}

function dashboardTemplate() {
  if (!state.stats) return loadingTemplate('Preparando el resumen');
  const s = state.stats;
  return `
    ${pageHeading('La biblioteca, hoy.', 'Una lectura directa del catálogo y la circulación actual.')}
    <section class="stats-ledger" aria-label="Estadísticas generales">
      <div class="stat"><span>Títulos activos</span><strong>${s.total_titulos}</strong></div>
      <div class="stat"><span>Ejemplares físicos</span><strong>${s.total_ejemplares}</strong></div>
      <div class="stat"><span>Disponibles</span><strong>${s.disponibles}</strong></div>
      <div class="stat"><span>Prestados</span><strong>${s.prestados}</strong></div>
      <div class="stat"><span>Usuarios</span><strong>${s.usuarios_registrados}</strong></div>
      <div class="stat ${Number(s.vencidos) ? 'stat--alert' : ''}"><span>Préstamos vencidos</span><strong>${s.vencidos}</strong></div>
    </section>
    <div class="admin-grid">
      <section class="admin-section">
        <header class="admin-section__header"><h3>Requieren atención</h3><button class="button button--quiet button--small" data-admin-view="loans" type="button">Ver préstamos</button></header>
        ${state.loans.length ? `<ul class="overdue-list">${state.loans.slice(0, 6).map((loan) => `
          <li class="overdue-item"><div><strong>${escapeHtml(loan.titulo)}</strong><span>${escapeHtml(loan.nombre_completo)} · CI ${escapeHtml(loan.ci)}</span></div><time datetime="${loan.fecha_limite}">Venció ${formatDate(loan.fecha_limite)}</time></li>`).join('')}</ul>` : '<div class="empty-state" style="min-height:230px"><div class="state-copy"><h3>Sin préstamos vencidos</h3><p>Todo está al día.</p></div></div>'}
      </section>
      <section class="admin-section">
        <header class="admin-section__header"><h3>Acciones frecuentes</h3></header>
        <div class="quick-actions">
          <button class="quick-action" type="button" data-open-loan><span class="quick-action__icon">${icon('loans')}</span><span><strong>Registrar préstamo</strong><small>Selecciona usuario y libro</small></span>${icon('chevronRight')}</button>
          <button class="quick-action" type="button" data-new-user><span class="quick-action__icon">${icon('users')}</span><span><strong>Nuevo usuario</strong><small>Registra su nombre y CI</small></span>${icon('chevronRight')}</button>
          <button class="quick-action" type="button" data-new-book><span class="quick-action__icon">${icon('library')}</span><span><strong>Nuevo libro</strong><small>Añade un título al catálogo</small></span>${icon('chevronRight')}</button>
        </div>
      </section>
    </div>`;
}

function loadingTemplate(label = 'Cargando') {
  return `<div class="loading-state"><div class="state-copy"><div class="loading-bricks" aria-hidden="true"><span></span><span></span><span></span></div><h3>${label}</h3></div></div>`;
}

function booksTemplate() {
  return `
    ${pageHeading('Índice de libros.', 'Crea, corrige o desactiva títulos sin perder su historial.', `<button class="button" data-new-book type="button">${icon('plus')} Nuevo libro</button>`)}
    <div class="data-toolbar">
      <div class="input-wrap">${icon('search')}<label class="sr-only" for="book-admin-search">Buscar libros</label><input class="input-control" id="book-admin-search" type="search" placeholder="Título, autor o ISBN" /></div>
      <select class="select-control" id="book-active-filter" style="width:auto"><option value="">Activos e inactivos</option><option value="true">Solo activos</option><option value="false">Solo inactivos</option></select>
    </div>
    <div class="data-table-wrap"><table class="data-table"><thead><tr><th>Libro</th><th>Géneros</th><th>Ejemplares</th><th>Estado</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody id="books-table">${bookRows()}</tbody></table></div>`;
}

function bookRows() {
  if (!state.books.length) return '<tr><td colspan="5"><div class="empty-state" style="min-height:220px"><div class="state-copy"><h3>No hay libros para mostrar</h3><p>Ajusta la búsqueda o registra un título.</p></div></div></td></tr>';
  return state.books.map((book) => `
    <tr>
      <td class="cell-primary"><strong>${escapeHtml(book.titulo)}</strong><span>${escapeHtml(book.autor)}${book.isbn ? ` · ${escapeHtml(book.isbn)}` : ''}</span></td>
      <td>${escapeHtml((book.generos || []).join(', ') || '—')}</td>
      <td><strong>${book.disponible}</strong> de ${book.cantidad}</td>
      <td><span class="status ${book.activo ? '' : 'status--inactive'}">${book.activo ? 'Activo' : 'Inactivo'}</span></td>
      <td><div class="table-actions"><button class="button button--quiet button--small" type="button" data-edit-book="${book.id}">${icon('edit', 'icon icon--sm')} Editar</button><button class="button button--quiet button--small" type="button" data-toggle-book="${book.id}" data-next-active="${!book.activo}">${book.activo ? 'Desactivar' : 'Reactivar'}</button></div></td>
    </tr>`).join('');
}

function usersTemplate() {
  return `
    ${pageHeading('Personas usuarias.', 'Registros internos para préstamos presenciales e historial.', `<button class="button" data-new-user type="button">${icon('plus')} Nuevo usuario</button>`)}
    <div class="data-toolbar">
      <div class="input-wrap">${icon('search')}<label class="sr-only" for="user-admin-search">Buscar usuarios</label><input class="input-control" id="user-admin-search" type="search" placeholder="Nombre o CI" /></div>
      <select class="select-control" id="user-active-filter" style="width:auto"><option value="">Activos e inactivos</option><option value="true">Solo activos</option></select>
    </div>
    <div class="data-table-wrap"><table class="data-table"><thead><tr><th>Usuario</th><th>Contacto</th><th>Estado</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody id="users-table">${userRows()}</tbody></table></div>`;
}

function userRows() {
  if (!state.users.length) return '<tr><td colspan="4"><div class="empty-state" style="min-height:220px"><div class="state-copy"><h3>No hay usuarios para mostrar</h3><p>Ajusta la búsqueda o crea un registro.</p></div></div></td></tr>';
  return state.users.map((user) => `
    <tr>
      <td class="cell-primary"><strong>${escapeHtml(user.nombre_completo)}</strong><span>CI ${escapeHtml(user.ci)}</span></td>
      <td>${escapeHtml(user.telefono || 'Sin teléfono')}<br><small>${escapeHtml(user.direccion || 'Sin dirección')}</small></td>
      <td><span class="status ${user.activo ? '' : 'status--inactive'}">${user.activo ? 'Activo' : 'Inactivo'}</span></td>
      <td><div class="table-actions"><button class="button button--quiet button--small" type="button" data-user-history="${user.id}">Historial</button><button class="button button--quiet button--small" type="button" data-edit-user="${user.id}">${icon('edit', 'icon icon--sm')} Editar</button><button class="button button--quiet button--small" type="button" data-toggle-user="${user.id}" data-next-active="${!user.activo}">${user.activo ? 'Desactivar' : 'Reactivar'}</button></div></td>
    </tr>`).join('');
}

function loansTemplate() {
  const labels = { active: 'Activos', overdue: 'Vencidos', returned: 'Devueltos', all: 'Historial completo' };
  return `
    ${pageHeading('Circulación.', 'Registra préstamos y devoluciones manteniendo la disponibilidad sincronizada.', `<button class="button" data-open-loan type="button">${icon('plus')} Registrar préstamo</button>`)}
    <div class="data-toolbar" role="group" aria-label="Filtrar préstamos">
      ${Object.entries(labels).map(([id, label]) => `<button class="button ${state.loanStatus === id ? '' : 'button--quiet'} button--small" data-loan-filter="${id}" type="button">${label}</button>`).join('')}
    </div>
    <div class="data-table-wrap"><table class="data-table"><thead><tr><th>Libro</th><th>Usuario</th><th>Préstamo</th><th>Límite</th><th>Estado</th><th><span class="sr-only">Acciones</span></th></tr></thead><tbody>${loanRows()}</tbody></table></div>`;
}

function loanRows() {
  if (!state.loans.length) return '<tr><td colspan="6"><div class="empty-state" style="min-height:220px"><div class="state-copy"><h3>No hay préstamos en esta vista</h3><p>Cambia el filtro o registra un préstamo.</p></div></div></td></tr>';
  return state.loans.map((loan) => {
    const statusClass = loan.estado === 'vencido' ? 'status--overdue' : loan.estado === 'devuelto' ? 'status--returned' : '';
    const statusLabel = loan.estado === 'vencido' ? 'Vencido' : loan.estado === 'devuelto' ? 'Devuelto' : 'Activo';
    return `<tr>
      <td class="cell-primary"><strong>${escapeHtml(loan.titulo)}</strong><span>${escapeHtml(loan.autor)}</span></td>
      <td class="cell-primary"><strong>${escapeHtml(loan.nombre_completo)}</strong><span>CI ${escapeHtml(loan.ci)}</span></td>
      <td>${formatDate(loan.fecha_prestamo)}</td><td>${formatDate(loan.fecha_limite)}</td>
      <td><span class="status ${statusClass}">${statusLabel}</span></td>
      <td><div class="table-actions">${loan.estado !== 'devuelto' ? `<button class="button button--brick button--small" type="button" data-return-loan="${loan.id}">${icon('return', 'icon icon--sm')} Registrar devolución</button>` : ''}</div></td>
    </tr>`;
  }).join('');
}

function renderCurrent() {
  const content = document.querySelector('#admin-content');
  document.querySelector('#admin-view-title').textContent = viewMeta[state.view].label;
  document.querySelectorAll('[data-admin-view]').forEach((button) => button.setAttribute('aria-current', button.dataset.adminView === state.view ? 'page' : 'false'));
  if (state.view === 'dashboard') content.innerHTML = dashboardTemplate();
  if (state.view === 'books') content.innerHTML = booksTemplate();
  if (state.view === 'users') content.innerHTML = usersTemplate();
  if (state.view === 'loans') content.innerHTML = loansTemplate();
  bindViewEvents();
}

async function loadDashboard() {
  state.stats = null;
  state.loans = [];
  renderCurrent();
  try {
    const [stats, overdue] = await Promise.all([api('/api/admin/dashboard'), api('/api/admin/loans?status=overdue')]);
    state.stats = stats;
    state.loans = overdue.items;
    renderCurrent();
  } catch (error) { showContentError(error); }
}

async function loadBooks(query = '', active = '') {
  try {
    const params = new URLSearchParams({ query });
    if (active) params.set('active', active);
    state.books = (await api(`/api/admin/books?${params}`)).items;
    if (state.view === 'books') {
      const body = document.querySelector('#books-table');
      if (body) { body.innerHTML = bookRows(); bindTableEvents(); }
    }
  } catch (error) { showContentError(error); }
}

async function loadUsers(query = '', active = '') {
  try {
    const params = new URLSearchParams({ query });
    if (active) params.set('active', active);
    state.users = (await api(`/api/admin/users?${params}`)).items;
    if (state.view === 'users') {
      const body = document.querySelector('#users-table');
      if (body) { body.innerHTML = userRows(); bindTableEvents(); }
    }
  } catch (error) { showContentError(error); }
}

async function loadLoans() {
  try {
    state.loans = (await api(`/api/admin/loans?status=${state.loanStatus}`)).items;
    if (state.view === 'loans') renderCurrent();
  } catch (error) { showContentError(error); }
}

function showContentError(error) {
  document.querySelector('#admin-content').innerHTML = `<div class="error-state"><div class="state-copy">${icon('warning', 'icon icon--lg')}<h3>No pudimos cargar esta sección</h3><p>${escapeHtml(error.message)}</p></div></div>`;
}

async function goToView(view) {
  state.view = view;
  document.querySelector('#admin-sidebar')?.classList.remove('is-open');
  renderCurrent();
  if (view === 'dashboard') await loadDashboard();
  if (view === 'books') await loadBooks();
  if (view === 'users') await loadUsers();
  if (view === 'loans') await loadLoans();
}

function openSheet(title, html) {
  document.querySelector('#sheet-title').textContent = title;
  document.querySelector('#sheet-content').innerHTML = html;
  document.querySelector('#admin-sheet').hidden = false;
  document.body.classList.add('dialog-open');
  document.querySelector('#close-sheet').focus();
}

function closeSheet() {
  document.querySelector('#admin-sheet').hidden = true;
  document.body.classList.remove('dialog-open');
}

function bookForm(book = {}) {
  return `<form class="form-grid" id="book-form" data-id="${book.id || ''}">
    <div class="form-field form-field--full"><label for="book-title">Título *</label><input class="input-control" id="book-title" name="titulo" value="${escapeHtml(book.titulo || '')}" required maxlength="300" /></div>
    <div class="form-field form-field--full"><label for="book-author">Autor *</label><input class="input-control" id="book-author" name="autor" value="${escapeHtml(book.autor || '')}" required maxlength="250" /></div>
    <div class="form-field"><label for="book-isbn">ISBN</label><input class="input-control" id="book-isbn" name="isbn" value="${escapeHtml(book.isbn || '')}" /></div>
    <div class="form-field"><label for="book-quantity">Cantidad total *</label><input class="input-control" id="book-quantity" name="cantidad" type="number" min="1" value="${book.cantidad || 1}" required /></div>
    <div class="form-field form-field--full"><label for="book-genres">Géneros</label><input class="input-control" id="book-genres" name="generos" value="${escapeHtml((book.generos || []).join(', '))}" placeholder="Ficción, Literatura infantil" /><small>Sepáralos con comas.</small></div>
    <div class="form-field"><label for="book-year">Año</label><input class="input-control" id="book-year" name="anio_publicacion" type="number" min="0" max="2200" value="${book.anio_publicacion || ''}" /></div>
    <div class="form-field"><label for="book-pages">Páginas</label><input class="input-control" id="book-pages" name="paginas" type="number" min="1" value="${book.paginas || ''}" /></div>
    <div class="form-field"><label for="book-publisher">Editorial</label><input class="input-control" id="book-publisher" name="editorial" value="${escapeHtml(book.editorial || '')}" /></div>
    <div class="form-field"><label for="book-language">Idioma</label><input class="input-control" id="book-language" name="idioma" value="${escapeHtml(book.idioma || '')}" /></div>
    <div class="form-field form-field--full"><label for="book-cover">Cargar portada</label><input class="input-control file-control" id="book-cover" name="cover" type="file" accept="image/jpeg,image/png,image/webp,image/avif" /><small>JPG, PNG, WebP o AVIF; máximo 6 MB. La imagen se guardará en Cloudinary.</small></div>
    <div class="form-field form-field--full"><label for="book-image">URL actual o externa</label><input class="input-control" id="book-image" name="imagen_url" type="url" value="${escapeHtml(book.imagen_url || '')}" placeholder="https://…" /><small>Vacía este campo para retirar la portada de la ficha.</small></div>
    <div class="form-field form-field--full"><label for="book-synopsis">Sinopsis</label><textarea class="textarea-control" id="book-synopsis" name="sinopsis">${escapeHtml(book.sinopsis || '')}</textarea></div>
    <p class="form-message form-field--full" id="book-form-message" aria-live="polite"></p>
    <div class="form-actions"><button class="button button--quiet" type="button" data-cancel-sheet>Cancelar</button><button class="button" type="submit">Guardar libro</button></div>
  </form>`;
}

function userForm(user = {}) {
  return `<form class="form-grid" id="user-form" data-id="${user.id || ''}">
    <div class="form-field form-field--full"><label for="user-name">Nombre completo *</label><input class="input-control" id="user-name" name="nombre_completo" value="${escapeHtml(user.nombre_completo || '')}" required /></div>
    <div class="form-field"><label for="user-ci">CI *</label><input class="input-control" id="user-ci" name="ci" value="${escapeHtml(user.ci || '')}" required /></div>
    <div class="form-field"><label for="user-phone">Teléfono</label><input class="input-control" id="user-phone" name="telefono" value="${escapeHtml(user.telefono || '')}" /></div>
    <div class="form-field form-field--full"><label for="user-address">Dirección</label><input class="input-control" id="user-address" name="direccion" value="${escapeHtml(user.direccion || '')}" /></div>
    <p class="form-message form-field--full" id="user-form-message" aria-live="polite"></p>
    <div class="form-actions"><button class="button button--quiet" type="button" data-cancel-sheet>Cancelar</button><button class="button" type="submit">Guardar usuario</button></div>
  </form>`;
}

function loanForm() {
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  return `<form class="form-grid" id="loan-form">
    <div class="form-field form-field--full entity-picker"><label for="loan-user-search">Buscar usuario por nombre o CI *</label><input class="input-control" id="loan-user-search" autocomplete="off" placeholder="Empieza a escribir…" /><input type="hidden" name="usuario_id" id="loan-user-id" /><div class="suggestions" id="loan-user-results" hidden></div></div>
    <div class="form-field form-field--full entity-picker"><label for="loan-book-search">Buscar libro por título o autor *</label><input class="input-control" id="loan-book-search" autocomplete="off" placeholder="Solo libros activos" /><input type="hidden" name="libro_id" id="loan-book-id" /><div class="suggestions" id="loan-book-results" hidden></div></div>
    <div class="form-field"><label for="loan-date">Fecha de préstamo</label><input class="input-control" id="loan-date" name="fecha_prestamo" type="date" value="${today}" required /></div>
    <div class="form-field"><label for="loan-due">Fecha límite</label><input class="input-control" id="loan-due" name="fecha_limite" type="date" value="${due}" required /></div>
    <div class="form-field form-field--full"><label for="loan-details">Detalles</label><textarea class="textarea-control" id="loan-details" name="detalles" placeholder="Observaciones opcionales sobre el ejemplar o la transacción"></textarea></div>
    <p class="form-message form-field--full" id="loan-form-message" aria-live="polite"></p>
    <div class="form-actions"><button class="button button--quiet" type="button" data-cancel-sheet>Cancelar</button><button class="button" type="submit">Registrar préstamo</button></div>
  </form>`;
}

function formObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function emptyToNull(value) { return value === '' ? null : value; }

function bindSheetBase() {
  document.querySelector('[data-cancel-sheet]')?.addEventListener('click', closeSheet);
}

function openBookForm(book = {}) {
  openSheet(book.id ? 'Editar libro' : 'Nuevo libro', bookForm(book));
  bindSheetBase();
  document.querySelector('#book-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = formObject(form);
    const payload = {
      titulo: data.titulo,
      autor: data.autor,
      isbn: emptyToNull(data.isbn),
      cantidad: Number(data.cantidad),
      generos: data.generos.split(',').map((item) => item.trim()).filter(Boolean),
      anio_publicacion: data.anio_publicacion ? Number(data.anio_publicacion) : null,
      paginas: data.paginas ? Number(data.paginas) : null,
      editorial: emptyToNull(data.editorial),
      idioma: emptyToNull(data.idioma),
      imagen_url: emptyToNull(data.imagen_url),
      imagen_public_id: data.imagen_url ? (book.imagen_public_id || null) : null,
      sinopsis: emptyToNull(data.sinopsis),
    };
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      const file = form.querySelector('#book-cover').files[0];
      if (file) {
        button.textContent = 'Cargando portada…';
        const uploadData = new FormData();
        uploadData.append('cover', file);
        const uploaded = await api('/api/admin/uploads/cover', { method: 'POST', body: uploadData });
        payload.imagen_url = uploaded.imagen_url;
        payload.imagen_public_id = uploaded.imagen_public_id;
      }
      button.textContent = 'Guardando…';
      await api(book.id ? `/api/admin/books/${book.id}` : '/api/admin/books', { method: book.id ? 'PATCH' : 'POST', body: payload });
      toast(book.id ? 'Libro actualizado.' : 'Libro agregado al catálogo.');
      closeSheet();
      await loadBooks();
    } catch (error) {
      document.querySelector('#book-form-message').textContent = error.message;
    } finally { button.disabled = false; button.textContent = 'Guardar libro'; }
  });
}

function openUserForm(user = {}) {
  openSheet(user.id ? 'Editar usuario' : 'Nuevo usuario', userForm(user));
  bindSheetBase();
  document.querySelector('#user-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = formObject(form);
    const payload = { nombre_completo: data.nombre_completo, ci: data.ci, telefono: emptyToNull(data.telefono), direccion: emptyToNull(data.direccion) };
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      await api(user.id ? `/api/admin/users/${user.id}` : '/api/admin/users', { method: user.id ? 'PATCH' : 'POST', body: payload });
      toast(user.id ? 'Usuario actualizado.' : 'Usuario registrado.');
      closeSheet();
      await loadUsers();
    } catch (error) {
      document.querySelector('#user-form-message').textContent = error.message;
    } finally { button.disabled = false; }
  });
}

function bindPicker({ inputId, hiddenId, resultsId, endpoint, render, onSelect }) {
  const input = document.querySelector(inputId);
  const hidden = document.querySelector(hiddenId);
  const results = document.querySelector(resultsId);
  input.addEventListener('input', () => {
    hidden.value = '';
    clearTimeout(state.searchTimer);
    state.searchTimer = setTimeout(async () => {
      if (input.value.trim().length < 2) { results.hidden = true; return; }
      try {
        const items = (await api(`${endpoint}${encodeURIComponent(input.value.trim())}`)).items;
        results.innerHTML = items.slice(0, 8).map(render).join('');
        results.hidden = !items.length;
        results.querySelectorAll('[data-picker-id]').forEach((button) => button.addEventListener('click', () => {
          hidden.value = button.dataset.pickerId;
          input.value = button.dataset.pickerLabel;
          results.hidden = true;
          onSelect?.(button);
        }));
      } catch { results.hidden = true; }
    }, 180);
  });
}

function openLoanForm() {
  openSheet('Registrar préstamo', loanForm());
  bindSheetBase();
  bindPicker({
    inputId: '#loan-user-search', hiddenId: '#loan-user-id', resultsId: '#loan-user-results', endpoint: '/api/admin/users?active=true&query=',
    render: (user) => `<button class="suggestion" type="button" data-picker-id="${user.id}" data-picker-label="${escapeHtml(user.nombre_completo)} · ${escapeHtml(user.ci)}"><span class="suggestion__cover" aria-hidden="true"></span><span><strong>${escapeHtml(user.nombre_completo)}</strong><small>CI ${escapeHtml(user.ci)}</small></span></button>`,
  });
  bindPicker({
    inputId: '#loan-book-search', hiddenId: '#loan-book-id', resultsId: '#loan-book-results', endpoint: '/api/admin/books?active=true&query=',
    render: (book) => `<button class="suggestion" type="button" data-picker-id="${book.id}" data-picker-label="${escapeHtml(book.titulo)} · ${escapeHtml(book.autor)}" ${book.disponible <= 0 ? 'disabled' : ''}><span class="suggestion__cover" aria-hidden="true"></span><span><strong>${escapeHtml(book.titulo)}</strong><small>${escapeHtml(book.autor)}</small></span><span class="suggestion__availability">${book.disponible} disp.</span></button>`,
  });
  document.querySelector('#loan-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = formObject(form);
    if (!data.usuario_id || !data.libro_id) {
      document.querySelector('#loan-form-message').textContent = 'Selecciona un usuario y un libro de las sugerencias.';
      return;
    }
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    try {
      await api('/api/admin/loans', { method: 'POST', body: { usuario_id: Number(data.usuario_id), libro_id: Number(data.libro_id), fecha_prestamo: data.fecha_prestamo, fecha_limite: data.fecha_limite, detalles: emptyToNull(data.detalles) } });
      toast('Préstamo registrado y disponibilidad actualizada.');
      closeSheet();
      if (state.view === 'loans') await loadLoans();
      if (state.view === 'dashboard') await loadDashboard();
    } catch (error) { document.querySelector('#loan-form-message').textContent = error.message; }
    finally { button.disabled = false; }
  });
}

async function openHistory(userId) {
  const user = state.users.find((item) => String(item.id) === String(userId));
  openSheet(`Historial de ${user?.nombre_completo || 'usuario'}`, loadingTemplate('Consultando historial'));
  try {
    const result = await api(`/api/admin/users/${userId}/history`);
    document.querySelector('#sheet-content').innerHTML = result.items.length ? `<div class="data-table-wrap"><table class="data-table"><thead><tr><th>Libro</th><th>Préstamo</th><th>Devolución</th><th>Estado</th></tr></thead><tbody>${result.items.map((loan) => `<tr><td>${escapeHtml(loan.titulo)}</td><td>${formatDate(loan.fecha_prestamo)}</td><td>${formatDate(loan.fecha_devolucion)}</td><td><span class="status ${loan.estado === 'vencido' ? 'status--overdue' : loan.estado === 'devuelto' ? 'status--returned' : ''}">${loan.estado}</span></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty-state"><div class="state-copy"><h3>Sin préstamos registrados</h3><p>El historial aparecerá aquí.</p></div></div>';
  } catch (error) { document.querySelector('#sheet-content').innerHTML = `<p>${escapeHtml(error.message)}</p>`; }
}

function bindTableEvents() {
  document.querySelectorAll('[data-edit-book]').forEach((button) => button.addEventListener('click', () => openBookForm(state.books.find((book) => String(book.id) === button.dataset.editBook))));
  document.querySelectorAll('[data-edit-user]').forEach((button) => button.addEventListener('click', () => openUserForm(state.users.find((user) => String(user.id) === button.dataset.editUser))));
  document.querySelectorAll('[data-user-history]').forEach((button) => button.addEventListener('click', () => openHistory(button.dataset.userHistory)));
  document.querySelectorAll('[data-toggle-book]').forEach((button) => button.addEventListener('click', async () => {
    try { await api(`/api/admin/books/${button.dataset.toggleBook}/active`, { method: 'PATCH', body: { activo: button.dataset.nextActive === 'true' } }); toast('Estado del libro actualizado.'); await loadBooks(); } catch (error) { toast(error.message, 'error'); }
  }));
  document.querySelectorAll('[data-toggle-user]').forEach((button) => button.addEventListener('click', async () => {
    try { await api(`/api/admin/users/${button.dataset.toggleUser}/active`, { method: 'PATCH', body: { activo: button.dataset.nextActive === 'true' } }); toast('Estado del usuario actualizado.'); await loadUsers(); } catch (error) { toast(error.message, 'error'); }
  }));
  document.querySelectorAll('[data-return-loan]').forEach((button) => button.addEventListener('click', async () => {
    if (!window.confirm('¿Registrar la devolución de este ejemplar?')) return;
    button.disabled = true;
    try { await api(`/api/admin/loans/${button.dataset.returnLoan}/return`, { method: 'POST', body: {} }); toast('Devolución registrada y ejemplar disponible.'); await loadLoans(); } catch (error) { toast(error.message, 'error'); button.disabled = false; }
  }));
}

function bindViewEvents() {
  document.querySelectorAll('#admin-content [data-admin-view]').forEach((button) => button.addEventListener('click', () => goToView(button.dataset.adminView)));
  document.querySelectorAll('[data-new-book]').forEach((button) => button.addEventListener('click', () => openBookForm()));
  document.querySelectorAll('[data-new-user]').forEach((button) => button.addEventListener('click', () => openUserForm()));
  document.querySelectorAll('[data-open-loan]').forEach((button) => button.addEventListener('click', openLoanForm));
  document.querySelectorAll('[data-loan-filter]').forEach((button) => button.addEventListener('click', () => { state.loanStatus = button.dataset.loanFilter; loadLoans(); }));
  const bookSearch = document.querySelector('#book-admin-search');
  const bookFilter = document.querySelector('#book-active-filter');
  if (bookSearch) bookSearch.addEventListener('input', () => { clearTimeout(state.searchTimer); state.searchTimer = setTimeout(() => loadBooks(bookSearch.value, bookFilter.value), 220); });
  if (bookFilter) bookFilter.addEventListener('change', () => loadBooks(bookSearch.value, bookFilter.value));
  const userSearch = document.querySelector('#user-admin-search');
  const userFilter = document.querySelector('#user-active-filter');
  if (userSearch) userSearch.addEventListener('input', () => { clearTimeout(state.searchTimer); state.searchTimer = setTimeout(() => loadUsers(userSearch.value, userFilter.value), 220); });
  if (userFilter) userFilter.addEventListener('change', () => loadUsers(userSearch.value, userFilter.value));
  bindTableEvents();
}

function bindShellEvents(root) {
  root.querySelector('#logout-button').addEventListener('click', async () => {
    await api('/api/admin/logout', { method: 'POST' });
    state.admin = null;
    renderAdminApp(root);
  });
  root.querySelector('#mobile-nav').addEventListener('click', () => root.querySelector('#admin-sidebar').classList.toggle('is-open'));
  root.querySelectorAll('.admin-nav [data-admin-view]').forEach((button) => button.addEventListener('click', () => goToView(button.dataset.adminView)));
  root.querySelector('#close-sheet').addEventListener('click', closeSheet);
  root.querySelector('#admin-sheet').addEventListener('click', (event) => { if (event.target.id === 'admin-sheet') closeSheet(); });
  bindViewEvents();
}

async function renderShell(root) {
  root.innerHTML = shell();
  bindShellEvents(root);
  await goToView(state.view);
}

function bindLogin(root) {
  root.querySelector('#login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('button');
    const message = root.querySelector('#login-message');
    message.textContent = '';
    button.disabled = true;
    try {
      const result = await api('/api/admin/login', { method: 'POST', body: formObject(form) });
      state.admin = result.admin;
      await renderShell(root);
    } catch (error) { message.textContent = error.message; }
    finally { button.disabled = false; }
  });
}

export async function renderAdminApp(root) {
  root.innerHTML = loadingTemplate('Comprobando sesión');
  try {
    const session = await api('/api/admin/session');
    state.admin = session.admin;
  } catch { state.admin = null; }
  if (!state.admin) {
    root.innerHTML = loginView();
    bindLogin(root);
    return;
  }
  await renderShell(root);
}
