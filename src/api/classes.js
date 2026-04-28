import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

if (!API_BASE_URL && import.meta.env.PROD) {
  throw new Error(
    'Missing VITE_API_BASE_URL in production. Set the backend API URL in your deployment environment.'
  );
}

const API_URL = `${API_BASE_URL}/api/classes`;

/**
 * Get subjects for a specific class and department
 */
export const getClassSubjects = async (className, department) => {
  try {
    // URL encode the class name and optionally the department
    const encodedClass = encodeURIComponent(className);
    const url = department
      ? `${API_URL}/subjects/${encodedClass}/${encodeURIComponent(department)}`
      : `${API_URL}/subjects/${encodedClass}`;

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching class subjects:', error);
    throw error;
  }
};

/**
 * Get all classes
 */
export const getAllClasses = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching classes:', error);
    throw error;
  }
};
