import apiClient from './apiClient';

const toServiceError = (error, fallback) => {
  const message = error?.response?.data?.message || fallback;
  const wrapped = new Error(message);
  wrapped.response = error?.response;
  throw wrapped;
};

export const loginUser = async ({ email, password, remember }) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password, remember });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Login failed');
  }
};

export const getMyProfile = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to fetch profile');
  }
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  try {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to change password');
  }
};

export const requestPasswordReset = async ({ email }) => {
  try {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to request password reset');
  }
};

export const resetPassword = async ({ token, newPassword }) => {
  try {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  } catch (error) {
    toServiceError(error, 'Failed to reset password');
  }
};
