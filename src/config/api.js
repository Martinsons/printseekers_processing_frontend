// API base URL
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
  
  // Default options
  const defaultOptions = {
    mode: 'cors',
    headers: {}
  };

  // Merge options
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete fetchOptions.headers['Content-Type'];
  }

  try {
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        detail: `Request failed with status ${response.status}` 
      }));
      
      throw new Error(
        Array.isArray(errorData.detail) 
          ? errorData.detail[0]?.msg || 'Unknown error'
          : errorData.detail
      );
    }

    return response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// File upload helper
export const uploadFedExBill = async (file) => {
  const formData = new FormData();
  formData.append('file', file, file.name);

  return apiRequest(API_ENDPOINTS.PROCESS_FEDEX_BILL, {
    method: 'POST',
    body: formData
  });
};