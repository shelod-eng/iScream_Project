export const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim();

export function apiEnabled() {
  return !!API_URL;
}

export async function apiFetch(path: string, init?: RequestInit) {
  if (!API_URL) throw new Error('API_URL not set');
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json();
}