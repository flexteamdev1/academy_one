import apiClient from './apiClient';

const toServiceError = (error, fallback) => {
  const message = error?.response?.data?.message || fallback;
  const wrapped = new Error(message);
  wrapped.response = error?.response;
  throw wrapped;
};

export const listStudents = async (params = {}) => {
  try {
    const response = await apiClient.get('/students', { params });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to fetch students');
  }
};

export const getStudentStats = async () => {
  try {
    const response = await apiClient.get('/students/stats');
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to fetch student stats');
  }
};

const buildStudentFormData = (payload) => {
  const formData = new FormData();

  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    formData.append(key, value);
  });

  return formData;
};

export const createStudent = async (payload) => {
  try {
    const response = await apiClient.post('/students', buildStudentFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to create student');
  }
};

export const updateStudent = async (id, payload) => {
  try {
    const response = await apiClient.put(`/students/${id}`, buildStudentFormData(payload), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to update student');
  }
};

export const deleteStudent = async (id) => {
  try {
    const response = await apiClient.delete(`/students/${id}`);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to delete student');
  }
};
