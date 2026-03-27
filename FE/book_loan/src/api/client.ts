const DEFAULT_API_BASE_URL = 'http://localhost:8000/api';

const rawBaseUrl =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  DEFAULT_API_BASE_URL;

const API_BASE_URL = rawBaseUrl.replace(/\/$/, '');

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  void path;
  void options;
  throw new Error(
    'Frontend API fetching is disabled for handoff. Use mock API modules or restore HTTP calls later.'
  );
}

export { API_BASE_URL };
