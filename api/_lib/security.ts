import type { VercelRequest, VercelResponse } from '@vercel/node';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

declare global {
  // eslint-disable-next-line no-var
  var __bbRateLimitStore: Map<string, RateLimitEntry> | undefined;
}

const getRateLimitStore = () => {
  if (!globalThis.__bbRateLimitStore) {
    globalThis.__bbRateLimitStore = new Map<string, RateLimitEntry>();
  }
  return globalThis.__bbRateLimitStore;
};

export const getClientIp = (request: VercelRequest): string => {
  const forwardedFor = request.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0]!.trim();
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0]!.trim();
  }

  return request.socket.remoteAddress || 'unknown';
};

export const assertRateLimit = (
  key: string,
  { windowMs, max }: { windowMs: number; max: number }
) => {
  const now = Date.now();
  const store = getRateLimitStore();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (entry.count >= max) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }

  store.set(key, { ...entry, count: entry.count + 1 });
};

export const setNoStore = (response: VercelResponse) => {
  response.setHeader('Cache-Control', 'no-store');
};

export const logApiEvent = (event: string, payload: Record<string, unknown>) => {
  console.info(JSON.stringify({ level: 'info', event, ...payload }));
};
