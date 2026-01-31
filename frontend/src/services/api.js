import apiClient from './apiClient';

// Auth services
export const authAPI = {
  signup: (data) => apiClient.post('/api/auth/register', data),
  login: (data) => apiClient.post('/api/auth/login', data),
  logout: () => apiClient.post('/api/auth/logout'),
  getCurrentUser: () => apiClient.get('/api/auth/me'),
};

// User services
export const userAPI = {
  getProfile: (userId) => apiClient.get(`/api/user/${userId}`),
  updateProfile: (userId, data) => apiClient.put(`/api/user/${userId}`, data),
  getUserPosts: (userId) => apiClient.get(`/api/user/${userId}/posts`),
};

// Market services
export const marketAPI = {
  getListings: (params) => apiClient.get('/api/market', { params }),
  getListingDetail: (id) => apiClient.get(`/api/market/${id}`),
  createListing: (data) => apiClient.post('/api/market', data),
  updateListing: (id, data) => apiClient.put(`/api/market/${id}`, data),
  deleteListing: (id) => apiClient.delete(`/api/market/${id}`),
};

// Stories services
export const storiesAPI = {
  getStories: (params) => apiClient.get('/api/stories', { params }),
  getStoryDetail: (id) => apiClient.get(`/api/stories/${id}`),
  createStory: (data) => apiClient.post('/api/stories', data),
  deleteStory: (id) => apiClient.delete(`/api/stories/${id}`),
  likeStory: (id) => apiClient.post(`/api/stories/${id}/like`),
  commentStory: (id, data) => apiClient.post(`/api/stories/${id}/comment`, data),
};

// Chat services
export const chatAPI = {
  getConversations: () => apiClient.get('/api/chat'),
  createConversation: (receiverId) => apiClient.post('/api/chat', { receiverId }),
  getMessages: (conversationId) => apiClient.get(`/api/chat/${conversationId}`),
  sendMessage: (conversationId, data) => apiClient.post(`/api/chat/${conversationId}`, data),
};

// Home/Feed services
export const homeAPI = {
  getFeed: (params) => apiClient.get('/api/home', { params }),
};
