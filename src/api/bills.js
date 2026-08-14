import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

if (!API_BASE_URL && import.meta.env.PROD) {
  throw new Error('Missing VITE_API_BASE_URL in production.');
}

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: import.meta.env.VITE_API_TIMEOUT || 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export const getBills = async () => {
  try {
    const response = await apiClient.get('/bills');
    return response.data;
  } catch (error) {
    console.error('Error fetching bills:', error);
    throw error;
  }
};

export const updateBills = async (billPayload) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    const response = await apiClient.put('/bills', billPayload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating bills:', error);
    throw error;
  }
};
