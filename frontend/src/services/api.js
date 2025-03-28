import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Response cache for GET requests
const responseCache = new Map();

// Cache configuration
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes in milliseconds
const CACHE_MAX_SIZE = 10000; // Maximum number of cached responses

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

// Helper function to generate consistent cache key
const getCacheKey = (config) => {
    return `${config.url}${config.params ? JSON.stringify(config.params) : ''}`;
};

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling auth errors and caching GET responses
api.interceptors.response.use(
    (response) => {
        // Store successful GET responses in cache
        if (response.config.method?.toLowerCase() === 'get') {
            const cacheKey = getCacheKey(response.config);
            
            // Limit cache size
            if (responseCache.size >= CACHE_MAX_SIZE) {
                const oldestKey = Array.from(responseCache.keys())[0];
                responseCache.delete(oldestKey);
            }
            
            responseCache.set(cacheKey, {
                data: response.data,
                timestamp: Date.now()
            });
        }
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // If the error is 401 and it's not a profile request (to prevent loops)
        if (error.response?.status === 401 && 
            !originalRequest._retry && 
            !originalRequest.url.endsWith('/auth/profile')) {
            
            originalRequest._retry = true;
            
            try {
                // Only try to refresh if we have a token
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No token available');
                }
                
                // Try to get a fresh profile
                const response = await getProfile();
                // If successful, update stored user data
                localStorage.setItem('user', JSON.stringify(response.data));
                // Retry the original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refreshing fails, clear auth data
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                // Only redirect if we're not already on the login page
                if (!window.location.pathname.includes('/login')) {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        
        // For GET requests that fail (including rate limits), use cached data if available
        if (originalRequest?.method?.toLowerCase() === 'get') {
            const cacheKey = getCacheKey(originalRequest);
            const cachedResponse = responseCache.get(cacheKey);
            
            // Check specifically for rate limit errors (429)
            const isRateLimitError = error.response?.status === 429;
            
            // Only use cache if it exists and is not too old
            const isCacheValid = cachedResponse && 
                (Date.now() - cachedResponse.timestamp < CACHE_MAX_AGE);
            
            if (isCacheValid) {
                // Log different messages depending on error type
                if (isRateLimitError) {
                    console.warn(`Rate limit exceeded for ${originalRequest.url}. Using cached data.`);
                } else {
                    console.warn(`Using cached data for failed request to ${originalRequest.url}`);
                }
                
                // Return a successful response with cached data
                return {
                    ...error.response,
                    data: cachedResponse.data,
                    status: 200,
                    statusText: isRateLimitError ? 'OK (Rate limited, using cached data)' : 'OK (Using cached data)',
                    fromCache: true,
                    rateLimited: isRateLimitError,
                    config: originalRequest
                };
            }
            
            // If we hit a rate limit but don't have cache, log this for debugging
            if (isRateLimitError) {
                console.error(`Rate limit exceeded for ${originalRequest.url} but no valid cache available`);
            }
        }
        
        return Promise.reject(error);
    }
);

// Clean up stale cache entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of responseCache.entries()) {
        if (now - value.timestamp > CACHE_MAX_AGE) {
            responseCache.delete(key);
        }
    }
}, 10 * 60 * 1000); // Run cleanup every 10 minutes

// Public APIs (no auth required)
export const getPublicBranches = () => api.get('/branches/public');
export const getPublicBranchMenu = (branchId) => api.get(`/branches/${branchId}/menu/public`);
export const registerCustomer = (customerData) => api.post('/auth/register/customer', customerData);

// Auth APIs
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getProfile = () => api.get('/auth/profile');
export const updateProfile = (userData) => api.put('/auth/profile', userData);
export const updatePassword = (passwordData) => api.put('/auth/password', passwordData);

// Customer APIs
export const getCustomerAddresses = () => api.get('/customers/addresses');
export const addAddress = (addressData) => api.post('/customers/addresses', addressData);
export const updateAddress = (id, addressData) => api.put(`/customers/addresses/${id}`, addressData);
export const deleteAddress = (id) => api.delete(`/customers/addresses/${id}`);

// Order APIs
export const createOrder = (orderData) => api.post('/orders', orderData);
export const getOrders = (params) => api.get('/orders', { params });
export const getCustomerActiveOrders = () => api.get('/orders/customer/active');
export const getCustomerOrderHistory = (page = 1, limit = 10) => 
    api.get('/orders/customer/history', { params: { page, limit } });
export const getOrderById = (id) => api.get(`/orders/${id}`);
export const cancelOrder = (id) => api.put(`/orders/${id}/cancel`);
export const assignOrderToRider = (orderId, riderId) => api.put(`/orders/${orderId}/assign-rider`, { rider_id: riderId });
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });

// Menu Management APIs
export const createMenuItem = (data) => api.post('/menu', data);
export const getAllMenuItems = () => api.get('/menu');
export const updateMenuItem = (id, data) => api.put(`/menu/${id}`, data);
export const deleteMenuItem = (id) => api.delete(`/menu/${id}`);
export const assignMenuItemToBranch = (data) => api.post('/menu/branch-assignment', data);

// Branch Management APIs
export const createBranch = async (data) => {
    return api.post('/branches', data);
};

export const getAllBranches = async () => {
    return api.get('/branches');
};

export const updateBranch = async (id, data) => {
    return api.put(`/branches/${id}`, data);
};

export const deleteBranch = async (id) => {
    return api.delete(`/branches/${id}`);
};

export const getBranchMenu = async (id) => {
    return api.get(`/branches/${id}/menu`);
};

export const updateBranchMenuItem = async (branchId, menuItemId, data) => {
    return api.put(`/branches/${branchId}/menu/${menuItemId}`, data);
};

export const getBranchSettings = (id) => api.get(`/branches/${id}/settings`);
export const updateBranchSettings = (id, data) => api.put(`/branches/${id}/settings`, data);

// Rider Management APIs
export const createRider = (data) => api.post('/riders', data);
export const getBranchRiders = (branchId) => api.get(`/riders/branch/${branchId}`);
export const updateRider = (id, data) => api.put(`/riders/${id}`, data);
export const getRiderDetails = (userId) => api.get(`/riders/${userId}`);
export const getRiderOrders = (riderId) => api.get(`/riders/${riderId}/orders`);
export const updateDeliveryStatus = (orderId, assignmentId, status) => 
    api.put(`/riders/orders/${orderId}/status`, { assignmentId, status });
export const updateRiderLocation = (location) => api.post('/riders/location', location);
export const getDeliveryLocation = (assignmentId) => api.get(`/riders/delivery/${assignmentId}/location`);
export const getRiderStatus = (riderId) => api.get(`/riders/${riderId}`);

export default api;