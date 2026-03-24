import { useState, useEffect, useCallback } from 'react';
import type { AllPrices } from 'nepal-bullion-price';

const POLL_INTERVAL = 5 * 60 * 1000; // 5 minutes

interface UseBullionPricesReturn {
  data: AllPrices | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: Date | null;
  refresh: () => void;
}

export function useBullionPrices(): UseBullionPricesReturn {
  const [data, setData] = useState<AllPrices | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchPrices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/prices');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const prices: AllPrices = await res.json();
      setData(prices);
      setLastFetched(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch prices');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return { data, isLoading, error, lastFetched, refresh: fetchPrices };
}
