const DEFAULT_API_BASE_URL = 'http://localhost:8000/api';

const rawBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  DEFAULT_API_BASE_URL;

const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

async function readResponseBody(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

function buildErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object') {
    const maybeMessage = (payload as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage;
    }
  }
  return fallback;
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers, ...restOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...restOptions,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(headers || {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = await readResponseBody(response);

  if (!response.ok) {
    const message = buildErrorMessage(payload, 'Yeu cau that bai. Vui long thu lai.');
    throw new Error(message);
  }

  return payload as T;
}

export { API_BASE_URL };
