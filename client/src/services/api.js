const BACKEND_URL = 'http://localhost:5000/api';

async function apiFetch(endpoint, options = {}) {
  const url = `${BACKEND_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options,
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`[Credify API] ${endpoint} failed — using demo mode.`);
    throw err;
  }
}

export default apiFetch;
