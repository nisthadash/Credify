const BACKEND_URL = 'http://localhost:5000/api';

async function apiFetch(endpoint, options = {}) {
  const url = `${BACKEND_URL}${endpoint}`;
  
  // Inject Authorization token if stored in session
  const organizerSession = sessionStorage.getItem('credify_organizer');
  let token = null;
  if (organizerSession) {
    try {
      const session = JSON.parse(organizerSession);
      token = session.token;
    } catch {}
  }

  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, {
      credentials: 'include', // Ensure cookies are sent
      headers,
      ...options,
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn(`[Credify API] ${endpoint} failed.`);
    throw err;
  }
}

export default apiFetch;
