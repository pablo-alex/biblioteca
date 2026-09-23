import { renderCatalogApp } from './catalog.js';
import { renderAdminApp } from './admin.js';

const root = document.querySelector('#app');

if (window.location.pathname.startsWith('/admin')) {
  document.title = 'Administración · Biblioteca Pública Municipal';
  renderAdminApp(root);
} else {
  renderCatalogApp(root);
}
