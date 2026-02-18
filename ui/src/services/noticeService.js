import apiClient from './apiClient';

const toServiceError = (error, fallback) => {
  const message = error?.response?.data?.message || fallback;
  const wrapped = new Error(message);
  wrapped.response = error?.response;
  throw wrapped;
};

export const listNotices = async (params = {}) => {
  try {
    const response = await apiClient.get('/notices', { params });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to load notices');
  }
};

export const createNotice = async (payload) => {
  try {
    const response = await apiClient.post('/notices', payload);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Unable to create notice');
  }
};
