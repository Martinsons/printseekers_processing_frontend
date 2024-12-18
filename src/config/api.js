// API base URL configuration
export const API_BASE_URL = 'https://web-production-33796.up.railway.app'

// API endpoints
export const API_ENDPOINTS = {
  PROCESS_FEDEX_BILL: '/api/process/fedex-bill',
  COMPARE_SHIPPING_COSTS: '/api/compare-shipping-costs',
  DOWNLOAD: (filename) => `/api/download/${encodeURIComponent(filename)}`,
  CLEANUP_FILES: '/api/files/cleanup'
}

// Helper function to construct full API URLs
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`

// API request configuration
export const createApiRequest = async (endpoint, options = {}) => {
  const url = getApiUrl(endpoint);
  
  const defaultOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  // Don't set Content-Type for FormData (file uploads)
  if (options.body instanceof FormData) {
    delete defaultOptions.headers['Content-Type'];
  }

  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.detail || 'API request failed');
    } catch (e) {
      throw new Error(`API request failed with status ${response.status}`);
    }
  }
  
  return response.json();
}