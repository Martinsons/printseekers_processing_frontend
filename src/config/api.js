// API base URL configuration
const API_BASE_URL = 'https://web-production-33796.up.railway.app';

// API endpoints
export const API_ENDPOINTS = {
  PROCESS_FEDEX_BILL: '/api/process/fedex-bill',
  COMPARE_SHIPPING_COSTS: '/api/compare-shipping-costs',
  DOWNLOAD: (filename) => `/api/download/${encodeURIComponent(filename)}`,
  CLEANUP_FILES: '/api/files/cleanup'
}

// Helper function for API calls
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    mode: 'cors',
    headers: {
      'Accept': 'application/json',
      ...options.headers,
    },
  };

  // For file uploads, don't set Content-Type header
  if (!(options.body instanceof FormData)) {
    defaultOptions.headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url, { ...defaultOptions, ...options });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Specific API functions
export const uploadFedExBill = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest(API_ENDPOINTS.PROCESS_FEDEX_BILL, {
    method: 'POST',
    body: formData
  });
};