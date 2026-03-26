import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AllPrices } from 'nepal-bullion-price';

const QUERY_KEY = ['bullion-prices'] as const;

async function fetchPrices(): Promise<AllPrices> {
  const res = await fetch('/api/prices');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

interface UseBullionPricesReturn {
  data: AllPrices | null;
  isLoading: boolean;
  isFetching: boolean;
  error: string | null;
  lastFetched: Date | null;
  refresh: () => void;
}

export function useBullionPrices(): UseBullionPricesReturn {
  const queryClient = useQueryClient();

  const { data, isLoading, isFetching, error, dataUpdatedAt } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchPrices,
  });

  const lastFetched = dataUpdatedAt > 0 ? new Date(dataUpdatedAt) : null;

  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    [queryClient],
  );

  return {
    data: data ?? null,
    isLoading,
    isFetching,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch prices') : null,
    lastFetched,
    refresh,
  };
}
