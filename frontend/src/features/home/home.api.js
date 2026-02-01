import apiClient from '../../services/apiClient';

export const homeAPI = {
  getDashboardData: () => apiClient.get('/home'),
};