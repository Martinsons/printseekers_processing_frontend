// API base URL - use relative URLs in development
const isDev = import.meta.env.DEV;
const API_BASE_URL = isDev ? '' : 'https://web-production-33796.up.railway.app';

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
  
  // Default options
  const defaultOptions = {
    mode: 'cors',
    headers: {}
  };

  // If it's not a FormData request, add Content-Type header
  if (!(options.body instanceof FormData)) {
    defaultOptions.headers['Content-Type'] = 'application/json';
  }

  // Merge options
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    // Make the request
    const response = await fetch(url, fetchOptions);

    // Handle non-OK responses
    if (!response.ok) {
      // Try to get error details from response
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || `Request failed with status ${response.status}`;
      } catch {
        errorMessage = `Request failed with status ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    // Check if response is empty
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { status: 'success' };
    }

    // Parse JSON response
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// File upload helper
export const uploadFedExBill = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest(API_ENDPOINTS.PROCESS_FEDEX_BILL, {
    method: 'POST',
    body: formData
  });
};