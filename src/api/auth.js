import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
apiClient.interceptors.request.use(
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

/**
 * Login function - authenticates user and returns token + role
 * @param {string} username - User's username
 * @param {string} password - User's password
 * @returns {Promise} - Returns { token, role, user }
 */
export const login = async (username, password) => {
  try {
    const response = await apiClient.post('/auth/login', {
      username,
      password,
    });
    
    const { token, role, user } = response.data;
    
    // Store token and role in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Login failed. Please try again.';
  }
};

/**
 * Logout function - clears stored authentication data
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
};

/**
 * Get current user data from localStorage
 * @returns {Object} - Current user object or null
 */
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

/**
 * Get current user role
 * @returns {string} - User's role (student, staff, admin) or null
 */
export const getUserRole = () => {
  return localStorage.getItem('role');
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Check if user has a specific role
 * @param {string} requiredRole - The role to check
 * @returns {boolean}
 */
export const hasRole = (requiredRole) => {
  const role = getUserRole();
  return role === requiredRole;
};

export default apiClient;
