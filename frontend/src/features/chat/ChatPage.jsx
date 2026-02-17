import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { chatAPI, isMessageFromMe } from './chat.api';
import VideoCall from './VideoCall';
import { Video, Send } from 'lucide-react';
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
  subscribeToCall,
  emitTyping,
  emitStopTyping,
} from './chat.socket';
import { Loader, ErrorBox } from '../../shared/ui';
import { useAuth } from '../auth/AuthContext';


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
        <div className="p-4 bg-red-900/20 text-red-500 m-4 rounded border border-red-900/50">
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

  // Video Call State
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [incomingCallData, setIncomingCallData] = useState(null);

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
            // Check if video call was requested
            if (location.state.startVideoCall) {
              setIsVideoCallActive(true);
            }
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

    // Video Call Handler
    const handleIncomingCall = (data) => {
      setIncomingCallData(data);
      setIsVideoCallActive(true);
    };

    onNewMessage(handleNewMessage);
    onMessageDeleted(handleMessageDeleted);
    onTyping(handleTypingStart);
    onStopTyping(handleTypingStop);
    onUserOnline(handleUserOnline);
    onUserOffline(handleUserOffline);
    subscribeToCall(handleIncomingCall);

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
      chatSocket.off("call:user", handleIncomingCall);
      chatSocket.off('connect', onConnect);
      chatSocket.off('disconnect', onDisconnect);
    };
  }, [user, selectedConversation]);

  const handleEndCall = useCallback(() => {
    setIsVideoCallActive(false);
    setIncomingCallData(null);
  }, []);

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
          className={`p-4 border-b cursor-pointer transition-all duration-200 border-white/5 hover:bg-white/5 ${selectedConversation?._id === conversation._id ? 'bg-primary-900/40 backdrop-blur-md border-l-4 border-l-primary-500' : 'border-l-4 border-l-transparent'
            }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold shadow-md">
              {conversation.members
                ?.filter(p => p._id !== user?._id)[0]?.fullName?.charAt(0) || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold truncate text-white">
                {conversation.members
                  ?.filter(p => p._id !== user?._id)
                  .map((p) => p.fullName || p.username || p.email)
                  .join(', ') || 'Unknown User'}
              </h3>
              <p className="text-sm truncate text-dark-400">
                {typeof conversation.lastMessage === 'string'
                  ? conversation.lastMessage
                  : (conversation.lastMessage?.text || conversation.lastMessage?.content || 'No messages yet')}
              </p>
            </div>
          </div>
        </div>
      ));
    }

    return (
      <div className={`p-8 text-center opacity-60 flex flex-col items-center justify-center h-full`}>
        <div className="text-4xl mb-2">📭</div>
        <p className="text-dark-400">No conversations</p>
      </div>
    );
  }, [conversations, selectedConversation, handleSelectConversation, loading, user]);

  // Memoize messages list rendering
  const messagesList = useMemo(() => {
    if (messages.length > 0) {
      return messages.map((message) => {
        const isMine = isMessageFromMe(message, user?._id);
        return (
          <div
            key={message._id}
            className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-slide-up`}
          >
            <div
              className={`max-w-[75%] px-5 py-3 rounded-2xl relative group shadow-sm backdrop-blur-sm border ${isMine
                ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-tr-none border-primary-500/20'
                : 'bg-dark-800/80 text-white rounded-tl-none border-white/10'
                }`}
            >
              <p className="leading-relaxed">{message.text}</p>
              <div className="flex justify-between items-center mt-1 gap-4">
                <span
                  className={`text-[10px] ${isMine ? 'text-blue-100/70' : 'text-dark-400'
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
                    className="opacity-0 group-hover:opacity-100 text-[10px] bg-red-500/80 hover:bg-red-600 text-white px-1.5 rounded transition-all transform hover:scale-110"
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
      <div className="flex flex-col items-center justify-center p-8 opacity-60 mt-20">
        <div className="text-5xl mb-4">👋</div>
        <p className="text-center text-lg font-medium text-dark-400">
          No messages yet. Start the conversation!
        </p>
      </div>
    );
  }, [messages, user, handleDeleteMessage]);

  console.log('[ChatPage] Rendering UI. loading:', loading, 'conversations:', conversations.length);

  return (
    <div className="min-h-screen pt-20 pb-4 px-4 flex flex-col h-screen transition-colors duration-300 bg-dark-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full mix-blend-screen filter blur-3xl opacity-20 bg-primary-600 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-20 bg-secondary-600 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="flex-1 flex overflow-hidden rounded-3xl shadow-2xl backdrop-blur-xl border border-white/10 relative z-10 glass-panel p-0 max-w-7xl mx-auto w-full">
        {/* Conversations List */}
        <div className="w-80 border-r flex flex-col border-white/10 bg-dark-900/50">
          <div className="p-4 border-b border-white/10">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold font-display text-white">Messages</h2>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/5">
                <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-glow-sm' : 'bg-red-500'}`}></span>
                <span className="text-xs font-medium text-dark-300">{isConnected ? 'Online' : 'Offline'}</span>
              </div>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {conversationsList}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-dark-900/30 relative">

          {/* Video Call Overlay */}
          {isVideoCallActive && (
            <div className="absolute inset-0 z-50 bg-dark-900/95 flex flex-col backdrop-blur-md">
              <VideoCall
                currentUser={user}
                activeConversation={selectedConversation}
                socketId={chatSocket.id}
                incomingCallData={incomingCallData}
                onCallEnded={handleEndCall}
              />
              <button
                onClick={handleEndCall}
                className="absolute top-4 right-4 bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium transition-colors border border-red-500/50"
              >
                Close Call Overlay
              </button>
            </div>
          )}

          {selectedConversation ? (
            <>
              {/* Header */}
              <div className="p-4 border-b backdrop-blur-md z-10 flex justify-between items-center bg-dark-900/50 border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {selectedConversation.members
                      ?.filter(p => p._id !== user?._id)[0]?.fullName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold leading-tight text-white">
                      {selectedConversation.members
                        ?.filter(p => p._id !== user?._id)
                        .map((p) => p.fullName || p.username || p.email)
                        .join(', ') || 'Unknown User'}
                    </h2>
                    {selectedConversation.members?.some(p => p._id !== user?._id && onlineUsers.has(p._id)) && (
                      <span className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active Now
                      </span>
                    )}
                  </div>
                </div>

                {/* Video Call Button */}
                <button
                  onClick={() => setIsVideoCallActive(true)}
                  className="p-3 bg-primary-600/20 hover:bg-primary-600/40 text-primary-200 rounded-full transition-colors flex items-center justify-center border border-primary-500/30"
                  title="Start Video Call"
                >
                  <Video size={20} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
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
                    <div className="px-4 py-2 rounded-2xl rounded-tl-none bg-dark-800/60 text-dark-300 backdrop-blur-sm shadow-sm border border-white/5">
                      <span className="text-xs italic flex gap-1">
                        <span className="animate-bounce">●</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
                      </span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 backdrop-blur-md border-t bg-dark-900/50 border-white/10">
                <form onSubmit={handleSendMessage} className="flex gap-3 relative">
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value);
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
                    className="w-full px-6 py-3 rounded-full bg-dark-800/80 border border-dark-600 text-white focus:border-primary-500 focus:outline-none placeholder-dark-500 pr-24 transition-all"
                  />
                  <button
                    type="submit"
                    className={`absolute right-2 top-1.5 bottom-1.5 rounded-full w-10 h-10 flex items-center justify-center transition-all duration-200 ${!messageText.trim()
                      ? 'bg-dark-700 text-dark-400 cursor-not-allowed'
                      : 'bg-gradient-to-tr from-primary-600 to-secondary-600 text-white shadow-lg hover:shadow-primary-500/30 hover:scale-105 active:scale-95'
                      }`}
                    disabled={!messageText.trim()}
                  >
                    <Send size={18} className={messageText.trim() ? "ml-0.5" : ""} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 opacity-60">
              <div className="text-6xl mb-4 p-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">💬</div>
              <p className="text-xl font-medium text-dark-400">
                Select a conversation to start chatting
              </p>
            </div>
          )}
        </div>
      </div>
    </div >
  );
};

const ChatPage = () => {
  return (
    <ErrorBoundary>
      <ChatPageContent />
    </ErrorBoundary>
  );
};

export default ChatPage;
