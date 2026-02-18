import apiClient from './apiClient';

const toServiceError = (error, fallback) => {
  const message = error?.response?.data?.message || fallback;
  const wrapped = new Error(message);
  wrapped.response = error?.response;
  throw wrapped;
};

export const listClasses = async (params = {}) => {
  try {
    const response = await apiClient.get('/classes', { params });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to fetch classes');
  }
};

export const getClassStats = async () => {
  try {
    const response = await apiClient.get('/classes/stats');
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to fetch class stats');
  }
};

export const getClassMeta = async () => {
  try {
    const response = await apiClient.get('/classes/meta');
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to fetch class metadata');
  }
};

export const createClass = async (payload) => {
  try {
    const response = await apiClient.post('/classes', payload);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to create class');
  }
};

export const updateClass = async (id, payload) => {
  try {
    const response = await apiClient.put(`/classes/${id}`, payload);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to update class');
  }
};

export const deleteClass = async (id) => {
  try {
    const response = await apiClient.delete(`/classes/${id}`);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to delete class');
  }
};
