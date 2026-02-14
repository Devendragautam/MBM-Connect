import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { chatAPI, isMessageFromMe } from './chat.api';
import {
  connectSocket,
  disconnectSocket,
  chatSocket,
  onNewMessage,
  onMessageDeleted,
  onTyping,
  onStopTyping,
  onUserOnline,
  onUserOffline,
  emitTyping,
  emitStopTyping,
} from './chat.socket';
import { Loader, ErrorBox, Button } from '../../shared/ui';
import { useAuth } from '../auth/AuthContext';
import { useDarkMode } from '../../shared/DarkModeContext';


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ChatPage crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-800 m-4 rounded border border-red-300">
          <h2 className="text-lg font-bold mb-2">Chat Page Crashed</h2>
          <p className="font-mono text-sm whitespace-pre-wrap">{this.state.error?.toString()}</p>
          <button
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ChatPageContent = () => {
  const { user, loading: authLoading } = useAuth();
  const { isDarkMode } = useDarkMode();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isConnected, setIsConnected] = useState(chatSocket.connected);
  const [isTyping, setIsTyping] = useState(false); // Other user is typing
  const [onlineUsers, setOnlineUsers] = useState(new Set()); // Track online users
  const messagesEndRef = useRef(null); // For auto-scroll
  const typingTimeoutRef = useRef(null); // For debounce

  if (authLoading) {
    console.log('[ChatPage] Waiting for auth loading...');
    return <Loader text="Loading session..." />;
  }

  // Memoize fetchConversations
  const fetchConversations = useCallback(async () => {
    console.log('[ChatPage] Fetching conversations...');
    try {
      setLoading(true);
      const response = await chatAPI.getConversations();
      console.log('[ChatPage] Conversations response:', response.data);
      if (response.data.success) {
        const loadedConversations = response.data.data || [];
        setConversations(loadedConversations);

        // Priority 1: Select conversation passed via navigation state
        if (location.state?.conversationId) {
          const target = loadedConversations.find(c => c._id === location.state.conversationId);
          if (target) {
            setSelectedConversation(target);
          } else {
            if (loadedConversations.length > 0) setSelectedConversation(loadedConversations[0]);
          }
        }
        // Priority 2: Default to first conversation
        else if (loadedConversations.length > 0) {
          setSelectedConversation(loadedConversations[0]);
        }
      } else {
        const errorMsg = response.data.message || 'Failed to load conversations';
        setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    } catch (err) {
      setError('Failed to load conversations');
      console.error('[ChatPage] Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [location.state]);

  // Memoize fetchMessages
  const fetchMessages = useCallback(async (conversationId) => {
    console.log('[ChatPage] Fetching messages for:', conversationId);
    try {
      const response = await chatAPI.getMessages(conversationId);
      if (response.data.success) {
        setMessages(response.data.data || []);
      }
    } catch (err) {
      console.error('[ChatPage] Failed to load messages:', err);
    }
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation, fetchMessages]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      connectSocket(token);
      if (user?._id) {
        chatSocket.emit("join_room", user._id);
      }
    }

    const handleNewMessage = (newMessage) => {
      // Update messages if conversation is open
      if (selectedConversation?._id === newMessage.conversationId) {
        setMessages((prev) => {
          if (prev.some(m => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
      }

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === newMessage.conversationId
            ? {
              ...conv,
              lastMessage: newMessage.text || "Sent a message",
            }
            : conv
        )
      );
    };

    const handleMessageDeleted = (deletedMessageId) => {
      setMessages((prev) => prev.filter((m) => m._id !== deletedMessageId));
    };

    const handleTypingStart = ({ conversationId }) => {
      if (selectedConversation?._id === conversationId) {
        setIsTyping(true);
      }
    };

    const handleTypingStop = ({ conversationId }) => {
      if (selectedConversation?._id === conversationId) {
        setIsTyping(false);
      }
    };

    const handleUserOnline = (userId) => {
      setOnlineUsers(prev => new Set(prev).add(userId));
    };

    const handleUserOffline = (userId) => {
      setOnlineUsers(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    };

    onNewMessage(handleNewMessage);
    onMessageDeleted(handleMessageDeleted);
    onTyping(handleTypingStart);
    onStopTyping(handleTypingStop);
    onUserOnline(handleUserOnline);
    onUserOffline(handleUserOffline);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    chatSocket.on('connect', onConnect);
    chatSocket.on('disconnect', onDisconnect);

    return () => {
      chatSocket.off("message:new", handleNewMessage);
      chatSocket.off("message:deleted", handleMessageDeleted);
      chatSocket.off("typing:start", handleTypingStart);
      chatSocket.off("typing:stop", handleTypingStop);
      chatSocket.off("user:online", handleUserOnline);
      chatSocket.off("user:offline", handleUserOffline);
      chatSocket.off('connect', onConnect);
      chatSocket.off('disconnect', onDisconnect);
    };
  }, [user, selectedConversation]);

  // Memoize send message handler
  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!user || !messageText.trim() || !selectedConversation) return;

    try {
      // Clear typing
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      const receiver = selectedConversation.members?.find(p => p._id !== user._id);

      chatSocket.emit("typing:stop", {
        conversationId: selectedConversation._id,
        senderId: user._id,
        receiverId: receiver?._id
      });

      const response = await chatAPI.sendMessage(selectedConversation._id, {
        text: messageText,
      });
      if (response.data.success) {
        const newMessage = response.data.data;
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
        setMessageText('');
        // Update conversation list with new last message
        setConversations((prev) => prev.map((conv) =>
          conv._id === selectedConversation._id
            ? { ...conv, lastMessage: messageText }
            : conv
        ));
      } else {
        const errorMsg = response.data.message || 'Failed to send message';
        setError(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    }
  }, [messageText, selectedConversation, user]);

  // Memoize delete message handler
  const handleDeleteMessage = useCallback(async (messageId) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await chatAPI.deleteMessage(messageId);
      // Optimistic update
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  }, []);

  // Memoize conversation selection handler
  const handleSelectConversation = useCallback((conversation) => {
    setSelectedConversation(conversation);
  }, []);

  // Memoize dismiss error handler
  const handleDismissError = useCallback(() => {
    setError('');
  }, []);

  // Memoize conversation list rendering
  const conversationsList = useMemo(() => {
    if (loading) {
      return <Loader text="Loading conversations..." size="sm" />;
    }

    if (conversations.length > 0) {
      return conversations.map((conversation) => (
        <div
          key={conversation._id}
          onClick={() => handleSelectConversation(conversation)}
          className={`p-4 border-b cursor-pointer transition ${isDarkMode ? 'border-secondary-700 hover:bg-secondary-700' : 'border-gray-200 hover:bg-gray-50'} ${selectedConversation?._id === conversation._id ? (isDarkMode ? 'bg-secondary-700' : 'bg-blue-50') : ''
            }`}
        >
          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {conversation.members
              ?.filter(p => p._id !== user?._id)
              .map((p) => p.fullName || p.username || p.email)
              .join(', ') || 'Unknown User'}
          </h3>
          <p className={`text-sm truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {typeof conversation.lastMessage === 'string'
              ? conversation.lastMessage
              : (conversation.lastMessage?.text || conversation.lastMessage?.content || 'No messages yet')}
          </p>
        </div>
      ));
    }

    return (
      <p className={`p-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        No conversations
      </p>
    );
  }, [conversations, selectedConversation, handleSelectConversation, loading, isDarkMode]);

  // Memoize messages list rendering
  const messagesList = useMemo(() => {
    if (messages.length > 0) {
      return messages.map((message) => {
        const isMine = isMessageFromMe(message, user?._id);
        return (
          <div
            key={message._id}
            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg relative group ${isMine
                ? 'bg-blue-600 text-white'
                : (isDarkMode ? 'bg-secondary-700 text-white' : 'bg-gray-300 text-gray-800')
                }`}
            >
              <p>{message.text}</p>
              <div className="flex justify-between items-center mt-1 gap-2">
                <span
                  className={`text-xs ${isMine ? 'text-blue-100' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')
                    }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString()}
                </span>

                {isMine && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMessage(message._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-xs bg-red-500 hover:bg-red-600 text-white px-1.5 rounded transition-opacity"
                    title="Delete message"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      });
    }

    return (
      <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        No messages yet. Start the conversation!
      </p>
    );
  }, [messages, user, isDarkMode, handleDeleteMessage]); // Added handleDeleteMessage to deps

  console.log('[ChatPage] Rendering UI. loading:', loading, 'conversations:', conversations.length);

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-secondary-900' : 'bg-gray-100'}`}>
      {/* Conversations List */}
      <div className={`w-80 border-r overflow-y-auto ${isDarkMode ? 'bg-secondary-800 border-secondary-700' : 'bg-white border-gray-300'}`}>
        <div className={`p-4 border-b ${isDarkMode ? 'border-secondary-700' : 'border-gray-300'}`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Messages</h2>
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{isConnected ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
        {conversationsList}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className={`border-b p-4 ${isDarkMode ? 'bg-secondary-800 border-secondary-700' : 'bg-white border-gray-300'}`}>
              <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                {selectedConversation.members
                  ?.filter(p => p._id !== user?._id)
                  .map((p) => p.fullName || p.username || p.email)
                  .join(', ') || 'Unknown User'}
              </h2>
              {/* Online Status Header */}
              {selectedConversation.members?.some(p => p._id !== user?._id && onlineUsers.has(p._id)) && (
                <span className="text-xs text-green-500 font-medium ml-2">Online</span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {error && (
                <ErrorBox
                  message="Chat Error"
                  errors={[error]}
                  onDismiss={handleDismissError}
                  variant="error"
                />
              )}
              {messagesList}
              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-secondary-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                    <span className="text-xs italic">Typing...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className={`border-t p-4 ${isDarkMode ? 'bg-secondary-800 border-secondary-700' : 'bg-white border-gray-300'}`}>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => {
                    setMessageText(e.target.value);

                    // Handle Typing
                    if (selectedConversation && user) {
                      const receiver = selectedConversation.members?.find(p => p._id !== user._id);
                      if (receiver) {
                        chatSocket.emit("typing:start", {
                          conversationId: selectedConversation._id,
                          senderId: user._id,
                          receiverId: receiver._id
                        });

                        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                        typingTimeoutRef.current = setTimeout(() => {
                          chatSocket.emit("typing:stop", {
                            conversationId: selectedConversation._id,
                            senderId: user._id,
                            receiverId: receiver._id
                          });
                        }, 2000);
                      }
                    }
                  }}
                  placeholder="Type a message..."
                  className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-secondary-700 border-secondary-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'}`}
                />
                <Button
                  type="submit"
                  variant="primary"
                  disabled={!messageText.trim()}
                >
                  Send
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1">
            <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Select a conversation to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrap with ErrorBoundary
const ChatPage = () => {
  return (
    <ErrorBoundary>
      <ChatPageContent />
    </ErrorBoundary>
  );
};

export default ChatPage;
