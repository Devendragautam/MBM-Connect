import apiClient from '../../services/apiClient';

export const userAPI = {
  // Get user profile by ID
  getUserProfile: async (userId) => {
    try {
      const response = await apiClient.get(`/user/${userId}`);
      return response;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (userId, formData) => {
    try {
      const response = await apiClient.put(`/user/${userId}/profile`, formData);
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  // Get user's posts
  getUserPosts: async (userId, page = 1, limit = 10) => {
    try {
      const response = await apiClient.get(`/user/${userId}/posts`, {
        params: { page, limit },
      });
      return response;
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  },

  // Follow user
  followUser: async (userId) => {
    try {
      const response = await apiClient.post(`/user/${userId}/follow`);
      return response;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  },

  // Unfollow user
  unfollowUser: async (userId) => {
    try {
      const response = await apiClient.post(`/user/${userId}/unfollow`);
      return response;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  },
};
