import apiClient from './apiClient';

const toServiceError = (error, fallback) => {
  const message = error?.response?.data?.message || fallback;
  const wrapped = new Error(message);
  wrapped.response = error?.response;
  throw wrapped;
};

export const getAttendance = async (params = {}) => {
  try {
    const response = await apiClient.get('/attendance', { params });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to fetch attendance');
  }
};

export const upsertAttendance = async (payload) => {
  try {
    const response = await apiClient.post('/attendance', payload);
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to save attendance');
  }
};

export const getAttendanceSummary = async (params = {}) => {
  try {
    const response = await apiClient.get('/attendance/summary', { params });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to fetch attendance summary');
  }
};

export const getAttendanceHistory = async (params = {}) => {
  try {
    const response = await apiClient.get('/attendance/history', { params });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to fetch attendance history');
  }
};

export const getMyAttendance = async (params = {}) => {
  try {
    const response = await apiClient.get('/attendance/my-attendance', { params });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to fetch personal attendance');
  }
};
