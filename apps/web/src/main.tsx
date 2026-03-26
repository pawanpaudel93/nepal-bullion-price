import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import './index.css';
import App from './App';

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

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'bullion-cache',
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <App />
    </PersistQueryClientProvider>
  </StrictMode>,
);
