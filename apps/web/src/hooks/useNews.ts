import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { NewsData } from 'nepal-bullion-price';

const QUERY_KEY = ['news'] as const;

async function fetchNews(lang?: string): Promise<NewsData> {
  const url = lang ? `/api/news?lang=${lang}` : '/api/news';
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

interface UseNewsReturn {
  data: NewsData | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useNews(lang?: string, enabled = true): UseNewsReturn {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: [...QUERY_KEY, lang],
    queryFn: () => fetchNews(lang),
    enabled,
    staleTime: 10 * 60_000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    [queryClient],
  );

  return {
    data: data ?? null,
    isLoading,
    error: error ? (error instanceof Error ? error.message : 'Failed to fetch news') : null,
    refresh,
  };
}
