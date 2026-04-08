import { getStoredToken } from '../auth/storage';

const DEFAULT_API_BASE_URL = 'http://localhost:8000/api';
const GET_CACHE_TTL_MS = 15_000;

const rawBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || DEFAULT_API_BASE_URL;

const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

type CacheEntry = {
  expiresAt: number;
  promise?: Promise<unknown>;
  value?: unknown;
};

const responseCache = new Map<string, CacheEntry>();

function buildRequestUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function invalidateResponseCache() {
  responseCache.clear();
}

async function performRequest<T>(url: string, options: ApiOptions, headers: Headers) {
  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload && 'message' in payload
        ? String(payload.message)
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return payload as T;
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = getStoredToken();
  const method = (options.method || 'GET').toUpperCase();
  const url = buildRequestUrl(path);

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (method === 'GET' && !options.signal) {
    const cacheKey = `${token ?? 'guest'}:${url}`;
    const cached = responseCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      if (cached.promise) {
        return cached.promise as Promise<T>;
      }

      if ('value' in cached) {
        return cached.value as T;
      }
    }

    const promise = performRequest<T>(url, options, headers)
      .then((payload) => {
        responseCache.set(cacheKey, {
          expiresAt: Date.now() + GET_CACHE_TTL_MS,
          value: payload,
        });

        return payload;
      })
      .catch((error) => {
        responseCache.delete(cacheKey);
        throw error;
      });

    responseCache.set(cacheKey, {
      expiresAt: Date.now() + GET_CACHE_TTL_MS,
      promise,
    });

    return promise;
  }

  const payload = await performRequest<T>(url, options, headers);
  invalidateResponseCache();
  return payload;
}

export { API_BASE_URL };
