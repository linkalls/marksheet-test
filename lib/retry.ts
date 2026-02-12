import { logger } from './logger';

export interface RetryOptions {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: any) => void;
}

/**
 * Execute a function with exponential backoff retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
    onRetry,
  } = options;

  let lastError: any;
  let delayMs = initialDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on certain errors
      if (isNonRetryableError(error)) {
        logger.debug(`Non-retryable error encountered: ${error.message}`);
        throw error;
      }

      // If we've exhausted retries, throw
      if (attempt === maxRetries) {
        logger.debug(`Max retries (${maxRetries}) reached`);
        break;
      }

      // Calculate delay with exponential backoff
      const currentDelay = Math.min(delayMs, maxDelayMs);
      logger.debug(
        `Retry attempt ${attempt + 1}/${maxRetries} after ${currentDelay}ms. Error: ${error.message}`
      );

      // Call retry callback if provided
      if (onRetry) {
        onRetry(attempt + 1, error);
      }

      // Wait before retrying
      await sleep(currentDelay);

      // Increase delay for next iteration
      delayMs *= backoffMultiplier;
    }
  }

  throw lastError;
}

/**
 * Determine if an error should not be retried
 */
function isNonRetryableError(error: any): boolean {
  // Don't retry on authentication errors
  if (error?.status === 401 || error?.status === 403) {
    return true;
  }

  // Don't retry on validation errors
  if (error?.status === 400 || error?.status === 422) {
    return true;
  }

  // Don't retry on not found errors
  if (error?.status === 404) {
    return true;
  }

  // Don't retry if API key is missing or invalid
  if (
    error?.message?.includes('API Key not configured') ||
    error?.message?.includes('Invalid API Key')
  ) {
    return true;
  }

  // Don't retry if file is too large
  if (error?.message?.includes('file size') || error?.message?.includes('too large')) {
    return true;
  }

  // Retry on network errors, rate limits, and server errors
  return false;
}

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Execute a function with timeout
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ]);
}

/**
 * Combine retry and timeout
 */
export async function withRetryAndTimeout<T>(
  fn: () => Promise<T>,
  retryOptions: RetryOptions = {},
  timeoutMs: number = 60000
): Promise<T> {
  return withRetry(
    () => withTimeout(fn, timeoutMs, `Operation timed out after ${timeoutMs}ms`),
    retryOptions
  );
}
