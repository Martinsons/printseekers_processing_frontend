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
    mode: 'cors',
    headers: options.body instanceof FormData 
      ? {} // No headers for FormData
      : {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorMessage = `Request failed with status ${response.status}`;
      throw new Error(errorMessage);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return { status: 'success' };
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}