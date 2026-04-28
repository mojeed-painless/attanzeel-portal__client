import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '');

if (!API_BASE_URL && import.meta.env.PROD) {
  throw new Error(
    'Missing VITE_API_BASE_URL in production. Set the backend API URL in your deployment environment.'
  );
}

const API_URL = `${API_BASE_URL}/settings`;

/**
 * Get current term and session settings
 */
export const getSettings = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching settings:', error);
    throw error;
  }
};

/**
 * Update term and session settings (admin only)
 */
export const updateSettings = async (currentTerm, currentSession, token) => {
  try {
    const response = await axios.put(
      API_URL,
      { currentTerm, currentSession },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating settings:', error);
    throw error;
  }
};
