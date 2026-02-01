import { io } from 'socket.io-client';

/**
 * Initialize socket with autoConnect: false
 * Connect manually when user is authenticated
 */
export const chatSocket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
});

// Connection handlers
chatSocket.on('connect', () => {
  console.log('Chat socket connected:', chatSocket.id);
});

chatSocket.on('disconnect', () => {
  console.log('Chat socket disconnected');
});

chatSocket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

/**
 * Connect socket with authentication
 * Call this after user is authenticated
 */
export const connectSocket = (token) => {
  if (chatSocket.connected) return chatSocket;
  
  chatSocket.auth = { token };
  chatSocket.connect();
  return chatSocket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
  if (chatSocket.connected) {
    chatSocket.disconnect();
  }
};

/**
 * Real-time message listeners and emitters
 */
export const onNewMessage = (callback) => {
  chatSocket.on('message:new', callback);
};

export const onMessageUpdated = (callback) => {
  chatSocket.on('message:updated', callback);
};

export const onMessageDeleted = (callback) => {
  chatSocket.on('message:deleted', callback);
};

export const emitMessage = (conversationId, messageData) => {
  chatSocket.emit('message:send', { conversationId, ...messageData });
};

/**
 * Typing indicators
 */
export const onTyping = (callback) => {
  chatSocket.on('typing:start', callback);
};

export const onStopTyping = (callback) => {
  chatSocket.on('typing:stop', callback);
};

export const emitTyping = (conversationId, userId) => {
  chatSocket.emit('typing:start', { conversationId, userId });
};

export const emitStopTyping = (conversationId, userId) => {
  chatSocket.emit('typing:stop', { conversationId, userId });
};

/**
 * Read receipts
 */
export const onMessageRead = (callback) => {
  chatSocket.on('message:read', callback);
};

export const emitMessageRead = (conversationId, messageId) => {
  chatSocket.emit('message:read', { conversationId, messageId });
};

export const onReadReceipt = (callback) => {
  chatSocket.on('read:receipt', callback);
};

/**
 * Conversation events
 */
export const onUserOnline = (callback) => {
  chatSocket.on('user:online', callback);
};

export const onUserOffline = (callback) => {
  chatSocket.on('user:offline', callback);
};
