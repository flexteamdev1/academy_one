import apiClient from './apiClient';

const toServiceError = (error, fallback) => {
  const message = error?.response?.data?.message || fallback;
  const wrapped = new Error(message);
  wrapped.response = error?.response;
  throw wrapped;
};

export const getLinkedStudents = async () => {
  try {
    const response = await apiClient.get('/students/me');
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to fetch user-linked students');
  }
};
export const getStudentById = async (id) => {
  try {
    const response = await apiClient.get(`/students/${id}`);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to fetch student details');
  }
};

export const updateMyStudent = async (id, payload) => {
  try {
    const formData = new FormData();
    Object.entries(payload || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (value instanceof File) {
        formData.append(key, value);
        return;
      }
      if (typeof value === 'object') {
        formData.append(key, JSON.stringify(value));
        return;
      }
      formData.append(key, value);
    });
    const response = await apiClient.put(`/students/me/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to update student profile');
  }
};
