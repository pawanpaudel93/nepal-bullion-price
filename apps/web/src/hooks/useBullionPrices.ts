import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { AllPrices } from 'nepal-bullion-price';

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
    queryKey: ['bullion-prices'],
    queryFn: fetchPrices,
  });

  return {
    data: data ?? null,
    isLoading,
    isFetching,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch prices') : null,
    lastFetched: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    refresh: () => queryClient.invalidateQueries({ queryKey: ['bullion-prices'] }),
  };
}
