import apiClient from './apiClient';

const toServiceError = (error, fallback) => {
  const message = error?.response?.data?.message || fallback;
  const wrapped = new Error(message);
  wrapped.response = error?.response;
  throw wrapped;
};

export const listAdmins = async (params = {}) => {
  try {
    const response = await apiClient.get('/admins', { params });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to fetch admins');
  }
};

export const createAdmin = async (payload) => {
  try {
    const response = await apiClient.post('/admins', payload);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to create admin');
  }
};

export const updateAdmin = async (id, payload) => {
  try {
    const response = await apiClient.put(`/admins/${id}`, payload);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to update admin');
  }
};

export const deleteAdmin = async (id) => {
  try {
    const response = await apiClient.delete(`/admins/${id}`);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to delete admin');
  }
};
