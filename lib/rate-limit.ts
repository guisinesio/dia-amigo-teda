interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimiter {
  check(key: string): boolean;
  /** Remaining attempts for the key (0 when blocked). */
  remaining(key: string): number;
}

/**
 * In-memory rate limiter.
 * On serverless with multiple instances each instance tracks independently,
 * providing per-instance protection. For strict global limits, replace with
 * a shared store (e.g., Vercel KV / Redis).
 */
export function createRateLimiter(opts: {
  windowMs: number;
  max: number;
}): RateLimiter {
  const store = new Map<string, RateLimitEntry>();

  function getEntry(key: string): RateLimitEntry {
    const now = Date.now();
    const existing = store.get(key);
    if (!existing || now > existing.resetAt) {
      const entry: RateLimitEntry = { count: 0, resetAt: now + opts.windowMs };
      store.set(key, entry);
      return entry;
    }
    return existing;
  }

  return {
    check(key: string): boolean {
      const entry = getEntry(key);
      if (entry.count >= opts.max) return false;
      entry.count++;
      return true;
    },
    remaining(key: string): number {
      const existing = store.get(key);
      if (!existing || Date.now() > existing.resetAt) return opts.max;
      return Math.max(0, opts.max - existing.count);
    },
  };
}
