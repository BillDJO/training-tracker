const BASE = import.meta.env.VITE_API_URL || '';

/**
 * Make a JSON request to the backend.
 * @param {string} path  e.g. '/api/exercises'
 * @param {RequestInit} opts  fetch options
 */
export async function api(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API ${res.status}: ${txt}`);
  }
  return res.json();
}
