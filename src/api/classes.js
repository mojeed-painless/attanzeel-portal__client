import axios from 'axios';

const API_URL = 'http://localhost:5000/api/classes';

/**
 * Get subjects for a specific class and department
 */
export const getClassSubjects = async (className, department) => {
  try {
    // URL encode the parameters to handle spaces and special characters
    const encodedClass = encodeURIComponent(className);
    const encodedDept = encodeURIComponent(department);
    
    const response = await axios.get(
      `${API_URL}/subjects/${encodedClass}/${encodedDept}`
    );
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
