export class ApiError extends Error {
  constructor(message, { status = 0, code = 'ERROR', details = [] } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
    ...options,
    body: options.body && !(options.body instanceof FormData) && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body,
  });

  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.error?.message || 'No pudimos completar la operación.', {
      status: response.status,
      code: data.error?.code,
      details: data.error?.details,
    });
  }
  return data;
}

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function safeImageUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:'].includes(url.protocol) && (url.origin === window.location.origin || /^https:\/\//.test(value))
      ? url.href
      : '';
  } catch {
    return '';
  }
}

export function formatDate(value) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${String(value).slice(0, 10)}T00:00:00Z`));
}

export function toast(message, tone = 'success') {
  const region = document.querySelector('#toast-region');
  const item = document.createElement('div');
  item.className = `toast toast--${tone}`;
  item.textContent = message;
  region.append(item);
  setTimeout(() => item.classList.add('toast--visible'), 20);
  setTimeout(() => {
    item.classList.remove('toast--visible');
    setTimeout(() => item.remove(), 250);
  }, 3500);
}
