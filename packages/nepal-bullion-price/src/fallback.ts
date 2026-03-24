import type { Provider } from './types.js';

export interface ProviderResult<T> {
  data: T;
  source: string;
}

export async function tryProviders<T>(
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
