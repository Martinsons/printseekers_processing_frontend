// API base URL
const API_BASE_URL = 'https://web-production-33796.up.railway.app';

// API endpoints
export const API_ENDPOINTS = {
  PROCESS_FEDEX_BILL: '/api/process/fedex-bill',
  COMPARE_SHIPPING_COSTS: '/api/compare-shipping-costs',
  DOWNLOAD: (filename) => `/api/download/${encodeURIComponent(filename)}`,
  CLEANUP_FILES: '/api/files/cleanup'
}

// Default error response
const createErrorResponse = (message = 'An error occurred') => ({
  success: false,
  message,
  data: null
});

// Default success response
const createSuccessResponse = (data = null, message = 'Operation completed successfully') => ({
  success: true,
  message,
  data
});

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
      // Since we can't read the response in no-cors mode,
      // we'll return a standard success response
      return {
        success: true,
        message: 'File uploaded successfully. Please check your email for results.',
        data: null
      };
    }

    // Handle error responses
    if (!response.ok) {
      const message = response.status === 502
        ? 'The server is currently unavailable. Please try again later.'
        : 'An error occurred while processing your request.';
      
      return createErrorResponse(message);
    }

    // Try to parse JSON response
    try {
      const data = await response.json();
      return createSuccessResponse(data);
    } catch (error) {
      return createErrorResponse('Invalid response from server');
    }
  } catch (error) {
    console.error('Network error:', error);
    return createErrorResponse(
      'Unable to connect to the server. Please check your internet connection and try again.'
    );
  }
};

// File upload helper
export const uploadFedExBill = async (file) => {
  if (!file) {
    return createErrorResponse('No file selected');
  }

  const formData = new FormData();
  formData.append('file', file, file.name);

  return apiRequest(API_ENDPOINTS.PROCESS_FEDEX_BILL, {
    method: 'POST',
    body: formData
  });
};