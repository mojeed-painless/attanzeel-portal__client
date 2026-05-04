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
 * Get all staff members (admin only)
 * @returns {Promise} - Returns list of staff
 */
export const getAllStaff = async () => {
  try {
    const response = await apiClient.get('/staff');
    return response.data.staff;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch staff. Please try again.';
  }
};

/**
 * Get staff member by ID (admin only)
 * @param {string} staffId - Staff member ID
 * @returns {Promise} - Returns staff details
 */
export const getStaffById = async (staffId) => {
  try {
    const response = await apiClient.get(`/staff/${staffId}`);
    return response.data.staff;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch staff details. Please try again.';
  }
};

/**
 * Approve or disapprove a staff member (admin only)
 * @param {string} staffId - Staff member ID
 * @param {boolean} isApproved - Approval status
 * @returns {Promise} - Returns updated staff
 */
export const updateStaffApproval = async (staffId, isApproved) => {
  try {
    const response = await apiClient.patch(`/staff/${staffId}/approval`, { isApproved });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update staff approval status. Please try again.';
  }
};

/**
 * Delete a staff member (admin only)
 * @param {string} staffId - Staff member ID
 * @returns {Promise} - Returns success message
 */
export const deleteStaff = async (staffId) => {
  try {
    const response = await apiClient.delete(`/staff/${staffId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete staff. Please try again.';
  }
};
