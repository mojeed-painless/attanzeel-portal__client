/**
 * Utility function to handle API requests with retry logic for rate limiting
 * @param {Function} apiCall - The API call function to execute
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} baseDelay - Base delay in milliseconds (default: 1000)
 * @returns {Promise} - The API response
 */
export const withRetry = async (apiCall, maxRetries = 3, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;

      // If it's not a 429 error or we've exhausted retries, throw the error
      if (error.response?.status !== 429 || attempt === maxRetries) {
        throw error;
      }

      // Calculate exponential backoff delay with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.warn(`Rate limited (429). Retrying in ${Math.round(delay)}ms... (attempt ${attempt + 1}/${maxRetries + 1})`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Wrapper for axios requests with automatic retry on 429 errors
 * @param {Function} requestFn - Function that returns an axios request promise
 * @param {number} maxRetries - Maximum number of retry attempts
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - The axios response
 */
export const retryableRequest = (requestFn, maxRetries = 3, baseDelay = 1000) => {
  return withRetry(requestFn, maxRetries, baseDelay);
};