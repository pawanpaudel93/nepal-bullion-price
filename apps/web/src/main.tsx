import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LocaleProvider } from './i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 60_000, // 1 minute
      refetchInterval: 5 * 60_000, // 5 minutes
      retry: 2,
    },
  },
});

// localStorage may be unavailable in private browsing or restricted environments
const CACHE_VERSION = 4; // bump when AllPrices schema changes (v4: ISO history dates, nullable tajabi)
let persister: ReturnType<typeof createSyncStoragePersister> | undefined;
try {
  persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: `bullion-cache-v${CACHE_VERSION}`,
  });
} catch {
  persister = undefined;
}

const app = <App />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <LocaleProvider>
        {persister ? (
          <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
            {app}
          </PersistQueryClientProvider>
        ) : (
          <QueryClientProvider client={queryClient}>
            {app}
          </QueryClientProvider>
        )}
      </LocaleProvider>
    </ErrorBoundary>
  </StrictMode>,
);
