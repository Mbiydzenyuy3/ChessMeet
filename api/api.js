import axios from 'axios';

// Configure axios instance for API calls
const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making API request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API response status: ${response.status}`);
    return response;
  },
  (error) => {
    console.error('API response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
