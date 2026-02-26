import apiClient from './apiClient';

const toServiceError = (error, fallback) => {
  const message = error?.response?.data?.message || fallback;
  const wrapped = new Error(message);
  wrapped.response = error?.response;
  throw wrapped;
};

export const listParents = async (params = {}, options = {}) => {
  try {
    const response = await apiClient.get('/parents', { params, signal: options.signal });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to load parents');
  }
};

export const getParentById = async (id, options = {}) => {
  try {
    const response = await apiClient.get(`/parents/${id}`, { signal: options.signal });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to load parent details');
  }
};
