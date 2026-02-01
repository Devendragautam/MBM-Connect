import apiClient from '../../services/apiClient';

export const authAPI = {
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response;
  },

  signup: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    return response;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response;
  },

  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh-token');
    return response;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me');
    return response;
  },

  updateProfile: async (userId, userData) => {
    const response = await apiClient.put(`/user/${userId}/profile`, userData);
    return response;
  },
};
