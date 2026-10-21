/**
 * VERITAS AI — API Service Client
 * Handles HTTP requests to the Flask backend with automatic retry and error reporting.
 */

const API_BASE = '/api';

/**
 * Perform a fetch request with timeout and standardized JSON response parsing.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json().catch(() => null);

    if (!res.ok) {
      const errorMessage = data?.error || `API Error (${res.status}): ${res.statusText}`;
      const err = new Error(errorMessage);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      const connErr = new Error('Cannot connect to VERITAS AI Flask API server. Please ensure the backend is running on http://127.0.0.1:5000.');
      connErr.isNetworkError = true;
      throw connErr;
    }
    throw error;
  }
}

export const api = {
  /**
   * Health check to verify backend & model status
   */
  async checkHealth() {
    return request('/health');
  },

  /**
   * Submit news text or headline for real ML classification
   */
  async predict(text, title = '') {
    return request('/predict', {
      method: 'POST',
      body: JSON.stringify({ text, title }),
    });
  },

  /**
   * Fetch paginated prediction history with optional search and filter
   */
  async getHistory({ limit = 20, offset = 0, filter = null, q = null } = {}) {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit);
    if (offset) params.set('offset', offset);
    if (filter && filter !== 'all') params.set('filter', filter);
    if (q && q.trim()) params.set('q', q.trim());

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request(`/history${queryString}`);
  },

  /**
   * Fetch a single prediction record by id
   */
  async getPredictionById(id) {
    return request(`/history/${id}`);
  },

  /**
   * Fetch aggregated analytics for dashboard charts
   */
  async getAnalytics() {
    return request('/analytics');
  },

  /**
   * Fetch model metrics (accuracy, precision, recall, confusion matrix)
   */
  async getModelMetrics() {
    return request('/model-metrics');
  },

  /**
   * Clear local prediction history (admin / test helper)
   */
  async clearHistory() {
    return request('/clear-history', {
      method: 'POST',
    });
  },
};
