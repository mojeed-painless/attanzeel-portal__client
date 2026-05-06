import axios from 'axios';
import { retryableRequest } from '../utils/apiRetry';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:5000' : '');

if (!API_BASE_URL && import.meta.env.PROD) {
  throw new Error(
    'Missing VITE_API_BASE_URL in production. Set the backend API URL in your deployment environment.'
  );
}

const API_URL = `${API_BASE_URL}/api/students`;

/**
 * Get all students
 */
export const getAllStudents = async () => {
  try {
    const response = await retryableRequest(() => axios.get(API_URL));
    return response.data;
  } catch (error) {
    console.error('Error fetching all students:', error);
    throw error;
  }
};

/**
 * Get students by class
 */
export const getStudentsByClass = async (className) => {
  try {
    const encodedClass = encodeURIComponent(className);
    const response = await retryableRequest(() => axios.get(`${API_URL}/class/${encodedClass}`));
    return response.data;
  } catch (error) {
    console.error('Error fetching students by class:', error);
    throw error;
  }
};

/**
 * Get next available student username
 */
export const getNextStudentUsername = async () => {
  try {
    const response = await retryableRequest(() => axios.get(`${API_URL}/next-username`));
    return response.data;
  } catch (error) {
    console.error('Error fetching next student username:', error);
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
    const response = await retryableRequest(() =>
      axios.get(`${API_URL}/class/${encodedClass}/department/${encodedDepartment}`)
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching students by class and department:', error);
    throw error;
  }
};

/**
 * Get student by ID
 */
export const getStudentById = async (studentId) => {
  try {
    const response = await retryableRequest(() => axios.get(`${API_URL}/${studentId}`));
    return response.data;
  } catch (error) {
    console.error('Error fetching student details:', error);
    throw error;
  }
};

/**
 * Update student approval status
 */
export const updateStudentApproval = async (studentId, isApproved) => {
  try {
    const response = await retryableRequest(() =>
      axios.patch(`${API_URL}/${studentId}/approval`, { isApproved })
    );
    return response.data;
  } catch (error) {
    console.error('Error updating student approval:', error);
    throw error;
  }
};

/**
 * Delete a student
 */
export const deleteStudent = async (studentId) => {
  try {
    const response = await retryableRequest(() => axios.delete(`${API_URL}/${studentId}`));
    return response.data;
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};