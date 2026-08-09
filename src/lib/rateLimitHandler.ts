import { useCallback } from 'react';
import { useToast } from '@/components/ToastProvider';

export function useRateLimitHandler() {
  const { showToast } = useToast();

  const handleRateLimit = useCallback(
    (error: unknown, retryAction?: () => Promise<void>) => {
      const isRateLimit = error instanceof Response && error.status === 429;
      const isRateLimitError = error && typeof error === 'object' && 'status' in error && error.status === 429;

      if (isRateLimit || isRateLimitError) {
        showToast({
          type: 'warning',
          title: 'Too many requests',
          message: 'Please wait a moment before trying again.',
          duration: 8000,
          action: retryAction
            ? {
                label: 'Retry',
                onClick: async () => {
                  try {
                    await retryAction();
                  } catch (e) {
                    // Error will be handled by the calling code
                  }
                },
              }
            : undefined,
        });
        return true;
      }
      return false;
    },
    [showToast]
  );

  return { handleRateLimit };
}

export function withRateLimitRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: { maxRetries?: number; baseDelay?: number }
): T {
  const maxRetries = options?.maxRetries ?? 3;
  const baseDelay = options?.baseDelay ?? 1000;

  const wrappedFn = async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    let lastError: unknown;
    const maxRetriesNum = maxRetries;
    const baseDelayNum = baseDelay;

    for (let attempt = 0; attempt <= maxRetriesNum; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        lastError = error;

        const isRateLimit = error instanceof Response && error.status === 429;
        const isRateLimitError = error && typeof error === 'object' && 'status' in error && error.status === 429;

        if (!isRateLimit && !isRateLimitError) {
          throw error;
        }

        if (attempt === maxRetriesNum) {
          throw error;
        }

        // Exponential backoff with jitter
        const delay = baseDelayNum * Math.pow(2, attempt) + Math.random() * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError;
  };

  return wrappedFn as T;
}