// API base URL configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Common API endpoints
export const API_ENDPOINTS = {
  PROCESS_FEDEX_BILL: '/api/process/fedex-bill',
  COMPARE_SHIPPING_COSTS: '/api/compare-shipping-costs',
  DOWNLOAD: (filename) => `/api/download/${encodeURIComponent(filename)}`,
  CLEANUP_FILES: '/api/files/cleanup'
}

// Helper function to construct full API URLs
export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`

// Common fetch configuration
export const createApiRequest = (endpoint, options = {}) => {
  const url = getApiUrl(endpoint)
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
    }
  })
} 