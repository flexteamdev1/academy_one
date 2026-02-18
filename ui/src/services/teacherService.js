import apiClient from './apiClient';

const toServiceError = (error, fallback) => {
  const message = error?.response?.data?.message || fallback;
  const wrapped = new Error(message);
  wrapped.response = error?.response;
  throw wrapped;
};

export const listTeachers = async (params = {}) => {
  try {
    const response = await apiClient.get('/teachers', { params });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to load teachers');
  }
};

export const getTeacherStats = async () => {
  try {
    const response = await apiClient.get('/teachers/stats');
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to load teacher stats');
  }
};

export const createTeacher = async (payload) => {
  try {
    const response = await apiClient.post('/teachers', payload);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Unable to create teacher');
  }
};

export const updateTeacher = async (id, payload) => {
  try {
    const response = await apiClient.put(`/teachers/${id}`, payload);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Unable to update teacher');
  }
};

export const deleteTeacher = async (id) => {
  try {
    const response = await apiClient.delete(`/teachers/${id}`);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Unable to delete teacher');
  }
};
