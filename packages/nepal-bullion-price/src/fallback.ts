import type { Provider, ProviderResult } from './types.js';

export async function fetchWithFallback<T>(
  providers: Provider<T>[],
): Promise<ProviderResult<T> | null> {
  for (const provider of providers) {
    try {
      const data = await provider.fetch();
      return { data, source: provider.name };
    } catch {
      // Provider failed, try next
    }
  }
  return null;
}
