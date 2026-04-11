import axios from 'axios';

const API_URL = 'http://localhost:5000/api/settings';

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
