import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import './index.css';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

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
const CACHE_VERSION = 2; // bump when AllPrices schema changes
let persister: ReturnType<typeof createSyncStoragePersister> | undefined;
try {
  persister = createSyncStoragePersister({
    storage: window.localStorage,
    key: `bullion-cache-v${CACHE_VERSION}`,
  });
} catch {
  persister = undefined;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {persister ? (
        <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
          <App />
        </PersistQueryClientProvider>
      ) : (
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      )}
    </ErrorBoundary>
  </StrictMode>,
);
