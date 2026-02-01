import apiClient from '../../services/apiClient';

export const feedAPI = {
  getAllPosts: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/posts/feed/all', { params: { page, limit } });
    return response;
  },

  getFollowingFeed: async (page = 1, limit = 10) => {
    const response = await apiClient.get('/posts/feed/following', { params: { page, limit } });
    return response;
  },

  getPostById: async (postId) => {
    const response = await apiClient.get(`/posts/${postId}`);
    return response;
  },

  getUserPosts: async (userId, page = 1, limit = 10) => {
    const response = await apiClient.get(`/posts/user/${userId}`, { params: { page, limit } });
    return response;
  },

  createPost: async (postData) => {
    const response = await apiClient.post('/posts/create', postData);
    return response;
  },

  updatePost: async (postId, postData) => {
    const response = await apiClient.put(`/posts/${postId}`, postData);
    return response;
  },

  deletePost: async (postId) => {
    const response = await apiClient.delete(`/posts/${postId}`);
    return response;
  },

  likePost: async (postId) => {
    const response = await apiClient.post(`/posts/${postId}/like`);
    return response;
  },

  addComment: async (postId, commentData) => {
    const response = await apiClient.post(`/posts/${postId}/comment`, commentData);
    return response;
  },

  deleteComment: async (postId, commentId) => {
    const response = await apiClient.delete(`/posts/${postId}/comment/${commentId}`);
    return response;
  },
};
