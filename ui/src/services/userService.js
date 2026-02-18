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
