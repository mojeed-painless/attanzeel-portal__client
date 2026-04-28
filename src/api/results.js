import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Get results for a specific academic year
export const getResultsByYear = async (academicYear) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/results/${encodeURIComponent(academicYear)}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching results:', error);
        throw error;
    }
};

// Get results for a specific academic year and term
export const getResultsByYearAndTerm = async (academicYear, termName) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/results/${encodeURIComponent(academicYear)}/${encodeURIComponent(termName)}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching results:', error);
        throw error;
    }
};

// Get results for a specific academic year, term, and class
export const getResultsByYearTermClass = async (academicYear, termName, className) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/results/${encodeURIComponent(academicYear)}/${encodeURIComponent(termName)}/${encodeURIComponent(className)}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching results:', error);
        throw error;
    }
};

// Save or update results
export const saveResults = async (resultsData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/results`, resultsData, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error saving results:', error);
        throw error;
    }
};

// Update student scores
export const updateStudentScores = async (academicYear, termName, className, studentId, scores) => {
    try {
        const payload = {
            scores: scores?.scores || scores || {},
        };

        if (typeof scores?.comments === 'string') {
            payload.comments = scores.comments;
        }

        const response = await axios.put(`${API_BASE_URL}/api/results/${encodeURIComponent(academicYear)}/${encodeURIComponent(termName)}/${encodeURIComponent(className)}/${encodeURIComponent(studentId)}`, payload, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error updating scores:', error);
        throw error;
    }
};

// Submit for approval
export const submitForApproval = async (academicYear, termName, className) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/results/${encodeURIComponent(academicYear)}/${encodeURIComponent(termName)}/${encodeURIComponent(className)}/submit-approval`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting for approval:', error);
        throw error;
    }
};

// Approve results
export const approveResults = async (academicYear, termName, className) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/results/${encodeURIComponent(academicYear)}/${encodeURIComponent(termName)}/${encodeURIComponent(className)}/approve`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error approving results:', error);
        throw error;
    }
};

// Reject results
export const rejectResults = async (academicYear, termName, className) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/results/${encodeURIComponent(academicYear)}/${encodeURIComponent(termName)}/${encodeURIComponent(className)}/reject`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error rejecting results:', error);
        throw error;
    }
};

// Get approval status
export const getApprovalStatus = async (academicYear, termName, className) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/results/${encodeURIComponent(academicYear)}/${encodeURIComponent(termName)}/${encodeURIComponent(className)}/status`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching approval status:', error);
        throw error;
    }
};