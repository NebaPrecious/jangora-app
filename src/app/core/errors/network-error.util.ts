import { HttpErrorResponse } from '@angular/common/http';

export const TRANSIENT_NETWORK_MESSAGE = "We couldn't connect right now. Please try again.";

export function isTransientNetworkError(error: unknown): boolean {
  if (error instanceof HttpErrorResponse) {
    return error.status === 0 || error.status === 503 || error.status === 504;
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return ['network', 'timeout', 'timeouterror', 'timed out', 'etimedout', 'temporarily unavailable', "couldn't connect"].some((text) =>
      message.includes(text),
    );
  }

  return false;
}

export function toFriendlyNetworkError(error: unknown, fallbackMessage = 'Something went wrong. Please try again.'): Error {
  if (isTransientNetworkError(error)) {
    return new Error(TRANSIENT_NETWORK_MESSAGE);
  }

  if (error instanceof HttpErrorResponse && error.status === 401) {
    return new Error('Your session expired. Please sign in again.');
  }

  return new Error(fallbackMessage);
}

export async function retryTransient<T>(operation: () => Promise<T>, maxRetries = 1): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isTransientNetworkError(error) || attempt === maxRetries) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
    }
  }

  throw lastError;
}
