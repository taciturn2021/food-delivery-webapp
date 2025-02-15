import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true
});

// Request interceptor for adding auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // Ensuring proper Bearer format
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth APIs
export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getProfile = () => api.get('/auth/profile');

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
export const assignOrderToRider = (data) => api.post('/riders/assign-order', data);
export const getRiderOrders = (riderId) => api.get(`/riders/${riderId}/orders`);
export const updateDeliveryStatus = (orderId, assignmentId, status) => 
    api.put(`/riders/orders/${orderId}/status`, { assignmentId, status });
export const updateRiderLocation = (location) => api.post('/riders/location', location);
export const getDeliveryLocation = (assignmentId) => api.get(`/riders/delivery/${assignmentId}/location`);

// Error handler
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;