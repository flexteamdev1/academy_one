import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  try {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
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

export default apiClient;
