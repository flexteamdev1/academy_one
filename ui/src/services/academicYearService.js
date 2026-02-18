import apiClient from './apiClient';

const toServiceError = (error, fallback) => {
  const message = error?.response?.data?.message || fallback;
  const wrapped = new Error(message);
  wrapped.response = error?.response;
  throw wrapped;
};

export const listAcademicYears = async (params = {}) => {
  try {
    const response = await apiClient.get('/academic-years', { params });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to fetch academic years');
  }
};

export const getAcademicYearStats = async () => {
  try {
    const response = await apiClient.get('/academic-years/stats');
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to fetch academic year stats');
  }
};

export const createAcademicYear = async (payload) => {
  try {
    const response = await apiClient.post('/academic-years', payload);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to create academic year');
  }
};

export const updateAcademicYear = async (id, payload) => {
  try {
    const response = await apiClient.put(`/academic-years/${id}`, payload);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to update academic year');
  }
};

export const activateAcademicYear = async (id) => {
  try {
    const response = await apiClient.patch(`/academic-years/${id}/activate`);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to activate academic year');
  }
};

export const deleteAcademicYear = async (id) => {
  try {
    const response = await apiClient.delete(`/academic-years/${id}`);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to delete academic year');
  }
};
