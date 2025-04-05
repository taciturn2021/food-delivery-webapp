import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';

// Configure API base URL from environment variable
const BASE_URL = API_BASE_URL || 'http://193.123.90.192:8443/api'; // Hardcoded fallback URL

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Set auth token
const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Clear auth token
const clearAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

// Request queue for offline operations
let requestQueue = [];

// Handle offline requests
const addToQueue = async (request) => {
  try {
    const queue = await getQueue();
    queue.push({
      ...request,
      timestamp: Date.now()
    });
    await AsyncStorage.setItem('offline_queue', JSON.stringify(queue));
    requestQueue = queue;
    return true;
  } catch (error) {
    console.error('Error adding request to queue:', error);
    return false;
  }
};

// Get offline queue
const getQueue = async () => {
  try {
    const queueData = await AsyncStorage.getItem('offline_queue');
    return queueData ? JSON.parse(queueData) : [];
  } catch (error) {
    console.error('Error getting queue:', error);
    return [];
  }
};

// Process offline queue
const processQueue = async () => {
  try {
    const queue = await getQueue();
    if (queue.length === 0) return;
    
    await AsyncStorage.removeItem('offline_queue');
    requestQueue = [];
    
    for (const request of queue) {
      try {
        await api({
          method: request.method,
          url: request.url,
          data: request.data,
          params: request.params
        });
      } catch (error) {
        console.error('Error processing queued request:', error);
      }
    }
  } catch (error) {
    console.error('Error processing queue:', error);
  }
};

// Setup response interceptors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear stored credentials on auth error
      await AsyncStorage.removeItem('authToken');
      clearAuthToken();
    }
    return Promise.reject(error);
  }
);

// API methods
const apiService = {
  setAuthToken,
  clearAuthToken,
  processQueue,

  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),

  // Rider Profile and Settings
  updateRider: (userId, data) => {
    console.log(`Updating rider with ID: ${userId}`, data);
    return api.put(`/riders/${userId}`, data);
  },
  
  getRiderSettings: (riderId) => api.get(`/riders/${riderId}/settings`),
  updateRiderSettings: (riderId, settings) => api.put(`/riders/${riderId}/settings`, settings),
  
  getRiderStatus: (userId) => {
    console.log(`Fetching rider status for user ID: ${userId}`);
    return api.get(`/riders/${userId}`);
  },
  
  updateRiderAvailability: (userId, isAvailable) => {
    console.log(`Updating rider availability for user ID: ${userId} to: ${isAvailable ? 'active' : 'inactive'}`);
    return api.put(`/riders/${userId}/availability`, { isAvailable });
  },
  
  // Updated order endpoints
  getRiderOrders: (userId) => {
    console.log('Fetching assigned orders for rider');
    return api.get(`/riders/${userId}/orders`);
  },
  
  getOrderById: (orderId) => {
    console.log(`Fetching order details for order ID: ${orderId}`);
    return api.get(`/orders/${orderId}`);
  },
  
  getDeliveryInformation: (orderId) => {
    if (!orderId) {
      console.error('Error: No order ID provided to getDeliveryInformation');
      return Promise.reject(new Error('No order ID provided'));
    }
    console.log(`Fetching delivery information for order IDHA: ${orderId}`);
    return api.get(`/riders/delivery/${orderId}`);
  },
  
  updateRiderLocation: (location) => {
    console.log('Updating rider location:', location);
    return api.post('/riders/location', location);
  },
  
  updateOrderStatus: (orderId, status) => {
    console.log(`Updating order ${orderId} status to ${status}`);
    return api.put(`/orders/${orderId}/rider-status`, { status });
  },
  
  // Core request methods with offline support
  async get(url, config = {}) {
    try {
      return await api.get(url, config);
    } catch (error) {
      if (error.message === 'Network Error') {
        // GET requests typically aren't queued
      }
      throw error;
    }
  },

  async post(url, data = {}, config = {}) {
    try {
      return await api.post(url, data, config);
    } catch (error) {
      if (error.message === 'Network Error') {
        await addToQueue({
          method: 'post',
          url,
          data,
          params: config.params
        });
      }
      throw error;
    }
  },

  async put(url, data = {}, config = {}) {
    try {
      return await api.put(url, data, config);
    } catch (error) {
      if (error.message === 'Network Error') {
        await addToQueue({
          method: 'put',
          url,
          data,
          params: config.params
        });
      }
      throw error;
    }
  }
};

export default apiService;