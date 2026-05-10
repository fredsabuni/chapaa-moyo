import { useState, useEffect, useCallback, useRef } from 'react';
import type { ListResponse } from './types';

// ─── Single resource ──────────────────────────────────────────────────────────

export interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useQuery<T>(
  fetcher: () => Promise<T>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps: any[] = [],
): QueryState<T> {
  const [data, setData]       = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Keep fetcher ref stable so the callback below doesn't need it as a dep
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // Stale-request guard: ignore results from superseded calls
  const counterRef = useRef(0);

  const run = useCallback(() => {
    const id = ++counterRef.current;
    setLoading(true);
    setError(null);
    fetcherRef.current()
      .then(result => { if (id === counterRef.current) setData(result); })
      .catch(e    => { if (id === counterRef.current) setError(e instanceof Error ? e.message : 'Unknown error'); })
      .finally(() => { if (id === counterRef.current) setLoading(false); });
  // deps are intentional — callers control re-fetch triggers
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(run, [run]);

  return { data, loading, error, refresh: run };
}

// ─── Paginated list ───────────────────────────────────────────────────────────

export interface ListQueryState<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: () => void;
}

export function useListQuery<T>(
  fetcher: (page: number) => Promise<ListResponse<T>>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deps: any[] = [],
): ListQueryState<T> {
  const [items, setItems]     = useState<T[]>([]);
  const [page, setPage]       = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const counterRef = useRef(0);

  const loadPage = useCallback((p: number) => {
    const id = ++counterRef.current;
    setLoading(true);
    setError(null);
    fetcherRef.current(p)
      .then(result => {
        if (id !== counterRef.current) return;
        setItems(prev => p === 1 ? result.items : [...prev, ...result.items]);
        setHasMore(result.meta.has_more);
        setTotal(result.meta.total);
        setPage(p);
      })
      .catch(e => { if (id === counterRef.current) setError(e instanceof Error ? e.message : 'Unknown error'); })
      .finally(() => { if (id === counterRef.current) setLoading(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { loadPage(1); }, [loadPage]);

  return {
    items, total, hasMore, loading, error,
    loadMore: () => loadPage(page + 1),
    refresh:  () => loadPage(1),
  };
}

// ─── Mutation helper ──────────────────────────────────────────────────────────

export interface MutationState<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
  mutate: (...args: never[]) => Promise<T | null>;
  reset: () => void;
}

export function useMutation<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
): {
  loading: boolean;
  error: string | null;
  data: TResult | null;
  mutate: (...args: TArgs) => Promise<TResult | null>;
  reset: () => void;
} {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [data, setData]       = useState<TResult | null>(null);

  const fnRef = useRef(fn);
  fnRef.current = fn;

  const mutate = useCallback(async (...args: TArgs): Promise<TResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await fnRef.current(...args);
      setData(result);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return { loading, error, data, mutate, reset };
}
