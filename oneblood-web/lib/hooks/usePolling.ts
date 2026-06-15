'use client';
import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  interval?: number;
  enabled?: boolean;
}

export function usePolling(
  fn: () => void | Promise<void>,
  { interval = 30_000, enabled = true }: UsePollingOptions = {},
) {
  const savedFn = useRef(fn);
  savedFn.current = fn;

  const execute = useCallback(() => {
    void savedFn.current();
  }, []);

  useEffect(() => {
    if (!enabled) return;

    execute(); // Run immediately on mount

    const id = setInterval(execute, interval);
    return () => clearInterval(id);
  }, [enabled, interval, execute]);
}
