import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

if (!API_BASE_URL && import.meta.env.PROD) {
  throw new Error(
    'Missing VITE_API_BASE_URL in production. Set the backend API URL in your deployment environment.'
  );
}

const API_URL = `${API_BASE_URL}/api/students`;

/**
 * Get students by class
 */
export const getStudentsByClass = async (className) => {
  try {
    const encodedClass = encodeURIComponent(className);
    const response = await axios.get(`${API_URL}/class/${encodedClass}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching students by class:', error);
    throw error;
  }
};

/**
 * Get students by class and department
 */
export const getStudentsByClassAndDepartment = async (className, department) => {
  try {
    const encodedClass = encodeURIComponent(className);
    const encodedDepartment = encodeURIComponent(department);
    const response = await axios.get(`${API_URL}/class/${encodedClass}/department/${encodedDepartment}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching students by class and department:', error);
    throw error;
  }
};