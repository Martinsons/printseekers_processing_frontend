// API base URL
const API_BASE_URL = 'https://web-production-33796.up.railway.app';

// API endpoints
export const API_ENDPOINTS = {
  PROCESS_FEDEX_BILL: '/api/process/fedex-bill',
  COMPARE_SHIPPING_COSTS: '/api/compare-shipping-costs',
  DOWNLOAD: (filename) => `/api/download/${encodeURIComponent(filename)}`,
  CLEANUP_FILES: '/api/files/cleanup'
}

/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// Helper function for API calls
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Default options
  const defaultOptions = {
    mode: 'no-cors',
    credentials: 'omit',
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
    
    // Handle opaque response from no-cors mode
    if (response.type === 'opaque') {
      return { 
        success: true,
        message: 'File uploaded successfully. Please check your email for results.'
      };
    }

    // Handle error responses
    if (!response.ok) {
      let errorMessage = 'An error occurred while processing your request.';
      
      if (response.status === 502) {
        errorMessage = 'The server is currently unavailable. Please try again later.';
      }
      
      throw new ApiError(errorMessage, response.status);
    }

    const data = await response.json();
    return {
      success: true,
      data,
      message: 'Request completed successfully'
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle network errors or other failures
    throw new ApiError(
      'Unable to connect to the server. Please check your internet connection and try again.',
      'NETWORK_ERROR'
    );
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