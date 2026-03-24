import { describe, it, expect } from 'vitest';
import { tryProviders } from '../fallback.js';
import type { Provider } from '../types.js';

describe('tryProviders', () => {
  it('returns first successful provider result', async () => {
    const providers: Provider<number>[] = [
      { name: 'first', fetch: async () => 42 },
      { name: 'second', fetch: async () => 99 },
    ];
    const result = await tryProviders(providers);
    expect(result).toEqual({ data: 42, source: 'first' });
  });

  it('skips failed providers and returns next success', async () => {
    const providers: Provider<number>[] = [
      { name: 'fail', fetch: async () => { throw new Error('down'); } },
      { name: 'ok', fetch: async () => 42 },
    ];
    const result = await tryProviders(providers);
    expect(result).toEqual({ data: 42, source: 'ok' });
  });

  it('returns null when all providers fail', async () => {
    const providers: Provider<number>[] = [
      { name: 'a', fetch: async () => { throw new Error('a'); } },
      { name: 'b', fetch: async () => { throw new Error('b'); } },
    ];
    const result = await tryProviders(providers);
    expect(result).toBeNull();
  });
});
