interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class Cache<T> {
  private store = new Map<string, CacheEntry<T>>();

  constructor(private ttlMs: number) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) return undefined;
    return entry.value;
  }

  getStale(key: string): T | undefined {
    return this.store.get(key)?.value;
  }

  set(key: string, value: T, ttlOverride?: number): void {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + (ttlOverride ?? this.ttlMs),
    });
  }
}
