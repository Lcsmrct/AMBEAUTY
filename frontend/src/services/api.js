import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
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

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  getMe: () => api.get('/api/auth/me'),
  updateProfile: (profileData) => api.put('/api/auth/profile', profileData),
};

// Booking API calls
export const bookingAPI = {
  create: (bookingData) => api.post('/api/bookings', bookingData),
  getMyBookings: () => api.get('/api/bookings/me'),
  getAllBookings: () => api.get('/api/bookings'),
  updateStatus: (bookingId, status) => api.put(`/api/bookings/${bookingId}`, { status }),
};

// Media API calls
export const mediaAPI = {
  upload: (formData) => api.post('/api/media/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: () => api.get('/api/media'),
};

// Time Slots API calls
export const timeSlotsAPI = {
  create: (slotData) => api.post('/api/time-slots', slotData),
  getAll: (params = {}) => api.get('/api/time-slots', { params }),
  getAvailable: (params = {}) => api.get('/api/time-slots/available', { params }),
  update: (slotId, updateData) => api.put(`/api/time-slots/${slotId}`, updateData),
  delete: (slotId) => api.delete(`/api/time-slots/${slotId}`),
};

// Reviews API calls
export const reviewsAPI = {
  create: (reviewData) => api.post('/api/reviews', reviewData),
  getApproved: () => api.get('/api/reviews'),
  getStats: () => api.get('/api/reviews/stats'),
  getPending: () => api.get('/api/reviews/pending'),
  updateStatus: (reviewId, status) => api.put(`/api/reviews/${reviewId}`, { status }),
  getEligibleBookings: () => api.get('/api/reviews/my-eligible-bookings'),
};

export default api;