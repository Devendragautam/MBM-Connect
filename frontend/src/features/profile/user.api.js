import apiClient from '../../services/apiClient';

export const userAPI = {
  getUserProfile: (userId) => apiClient.get(`/user/${userId}`),
  updateProfile: (userId, data) => apiClient.put(`/user/${userId}/profile`, data),
  followUser: (userId) => apiClient.post(`/user/${userId}/follow`),
  unfollowUser: (userId) => apiClient.post(`/user/${userId}/unfollow`),
};