'use strict';
/**
 * Retry logic for API calls
 */

function isRetryableStatus(status) {
  return status === 429 || (status >= 500 && status < 600);
}

async function withRetry(fn, { retries = 2, delayMs = 100 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = error.response && error.response.status;
      if (!isRetryableStatus(status) || attempt === retries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
  throw lastError;
}

module.exports = { isRetryableStatus, withRetry };
