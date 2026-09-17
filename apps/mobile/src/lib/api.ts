import { Platform } from 'react-native';

export const API = process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:4000/api' : 'http://localhost:4000/api');
export const API_ORIGIN = API.replace(/\/api\/?$/, '');
export const mediaUrl = (url?: string | null) => !url ? '' : url.startsWith('http') ? url : url.startsWith('/') ? `${API_ORIGIN}${url}` : url;

export type Ad = {
  id: string;
  title: string;
  description: string;
  price: number | string;
  city?: string;
  location?: string | null;
  condition?: string;
  negotiable?: boolean;
  views?: number;
  createdAt?: string;
  status?: string;
  category?: { id: string; name: string };
  images?: { id: string; url: string; sortOrder?: number }[];
  seller?: { id: string; name: string; phone?: string; city?: string; verified?: boolean; createdAt?: string };
  attributes?: Record<string, unknown> | null;
};

export type User = { id: string; name: string; email: string; phone: string; role: string; };

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers || {});
  if (!(init.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  const token = globalThis.__MINIFY_TOKEN__;
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API}${path}`, { ...init, headers });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try { const body = await response.json(); message = Array.isArray(body.message) ? body.message.join(', ') : (body.message || body.error || message); } catch {}
    throw new Error(message);
  }
  if (response.status === 204) return null as T;
  return response.json();
}

declare global { var __MINIFY_TOKEN__: string | undefined; }
