import axios from 'axios';
import { clearStoredUserInfo, getStoredUserInfo } from '../utils/auth';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  try {
    const userInfo = getStoredUserInfo();
    const token = userInfo?.token;
    const academicYearId = String(localStorage.getItem('selectedAcademicYearId') || '').trim();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (academicYearId) {
      config.headers['X-Academic-Year-Id'] = academicYearId;
    }
  } catch (_error) {
    // ignore malformed localStorage payload
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const code = error?.response?.data?.code;
    const shouldLogout =
      status === 401 || code === 'ACCOUNT_BLOCKED' || code === 'ACCOUNT_SUSPENDED';

    if (shouldLogout) {
      clearStoredUserInfo();
      try {
        if (window.location.pathname !== '/login') {
          window.location.replace('/login');
        }
      } catch (_err) {
        // ignore navigation errors
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
