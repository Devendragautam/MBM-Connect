import apiClient from '../../services/apiClient';

export const storiesAPI = {
  getStories: () => apiClient.get('/stories'),
  createStory: (data) => apiClient.post('/stories', data),
  deleteStory: (id) => apiClient.delete(`/stories/${id}`),
  likeStory: (id) => apiClient.post(`/stories/${id}/like`),
  addComment: (id, data) => apiClient.post(`/stories/${id}/comment`, data),
};