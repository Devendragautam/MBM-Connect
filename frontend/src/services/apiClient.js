import axios from 'axios';
import { navigate } from '../shared/utils/navigation';

const envUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const baseURL = envUrl ? (envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`) : '/api';

const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const originalRequest = err.config;
    // Prevent redirect loop/refresh on login 401s
    if (
      err.response?.status === 401 && 
      !originalRequest?.url?.includes('/auth/login') &&
      !window.location.pathname.includes('/login')
    ) {
      navigate.toLogin();
    }
    return Promise.reject(err);
  }
);

export default apiClient;
