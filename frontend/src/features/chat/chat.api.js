import apiClient from '../../services/apiClient';

/**
 * Chat API
 * 
 * Expected message structure from backend:
 * {
 *   _id: string,
 *   content: string,
 *   sender: { _id: string, name: string, avatar: string },
 *   conversationId: string,
 *   createdAt: timestamp,
 *   read: boolean
 * }
 */

export const chatAPI = {
  getConversations: async () => {
    const response = await apiClient.get('/chat');
    return response;
  },

  getMessages: async (conversationId, page = 1, limit = 20) => {
    const response = await apiClient.get(`/chat/${conversationId}`, {
      params: { page, limit },
    });
    return response;
  },

  sendMessage: async (conversationId, messageData) => {
    const response = await apiClient.post(`/chat/${conversationId}`, messageData);
    return response;
  },

  startConversation: async (userId) => {
    const response = await apiClient.post('/chat', { receiverId: userId });
    return response;
  },
};

/**
 * Helper to determine if message is from current user
 * Usage: isMessageFromMe(message, currentUser._id)
 */
export const isMessageFromMe = (message, currentUserId) => {
  const senderId = message.sender?._id || message.sender;
  return senderId === currentUserId;
};
