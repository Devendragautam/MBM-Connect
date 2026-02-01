import apiClient from '../../services/apiClient';

export const marketAPI = {
  getListings: (params) => apiClient.get('/market', { params }),
  createListing: (data) => apiClient.post('/market', data),
  deleteListing: (id) => apiClient.delete(`/market/${id}`),
};