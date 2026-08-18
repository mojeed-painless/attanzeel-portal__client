import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

if (!API_BASE_URL && import.meta.env.PROD) {
  throw new Error(
    'Missing VITE_API_BASE_URL in production. Set the backend API URL in your deployment environment.'
  );
}

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: import.meta.env.VITE_API_TIMEOUT || 30000,
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
 * @returns {Promise} - Returns { token, role, user } or throws error with special codes
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
    const errorData = error.response?.data;
    throw {
      message: errorData?.message || 'Login failed. Please try again.',
      ...errorData,
    };
  }
};

/**
 * Register a new user without affecting the current admin session
 * @param {Object} userData - Registration payload
 */
export const register = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    const errorData = error.response?.data;
    throw {
      message: errorData?.message || 'Registration failed. Please try again.',
      ...errorData,
    };
  }
};

/**
 * Verify email with verification code
 * @param {string} email - User's email
 * @param {string} verificationCode - The verification code (6 digits)
 * @returns {Promise} - Returns success message and user data
 */
export const verifyEmail = async (email, verificationCode) => {
  try {
    const response = await apiClient.post('/auth/verify-email', {
      email,
      verificationCode,
    });
    return response.data;
  } catch (error) {
    const errorData = error.response?.data;
    throw {
      message: errorData?.message || 'Email verification failed. Please try again.',
      ...errorData,
    };
  }
};

/**
 * Resend verification code to email
 * @param {string} email - User's email
 * @returns {Promise} - Returns success message
 */
export const resendVerificationCode = async (email) => {
  try {
    const response = await apiClient.post('/auth/resend-verification', {
      email,
    });
    return response.data;
  } catch (error) {
    const errorData = error.response?.data;
    throw {
      message: errorData?.message || 'Failed to resend verification code. Please try again.',
      ...errorData,
    };
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
// keep single default export at end of file
/**
 * Get user profile from backend
 * @returns {Promise} - Returns user profile data
 */
export const getProfile = async () => {
  try {
    const response = await apiClient.get('/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch profile';
  }
};

/**
 * Update user profile
 * @param {Object} profileData - Profile fields to update
 * @returns {Promise} - Returns updated user data
 */
export const updateProfile = async (profileData) => {
  try {
    const response = await apiClient.put('/profile', profileData);
    
    // Update localStorage with new user data
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update profile';
  }
};

export default apiClient;
