import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { chatAPI, isMessageFromMe } from './chat.api';
import { Loader, ErrorBox, Button } from '../../shared/ui';
import { useAuth } from '../auth/AuthContext';
import { useDarkMode } from '../../shared/DarkModeContext';

const ChatPage = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Memoize fetchConversations
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getConversations();
      if (response.data.success) {
        setConversations(response.data.data || []);
        if (response.data.data?.length > 0) {
          setSelectedConversation(response.data.data[0]);
        }
      } else {
        setError(response.data.message || 'Failed to load conversations');
      }
    } catch (err) {
      setError('Failed to load conversations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoize fetchMessages
  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const response = await chatAPI.getMessages(conversationId);
      if (response.data.success) {
        setMessages(response.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation, fetchMessages]);

  // Memoize send message handler
  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedConversation) return;

    try {
      const response = await chatAPI.sendMessage(selectedConversation._id, {
        text: messageText,
      });
      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.data]);
        setMessageText('');
        // Update conversation list with new last message
        setConversations((prev) => prev.map((conv) => 
          conv._id === selectedConversation._id 
            ? { ...conv, lastMessage: messageText } 
            : conv
        ));
      } else {
        setError(response.data.message || 'Failed to send message');
      }
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    }
  }, [messageText, selectedConversation]);

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
          className={`p-4 border-b cursor-pointer transition ${isDarkMode ? 'border-secondary-700 hover:bg-secondary-700' : 'border-gray-200 hover:bg-gray-50'} ${
            selectedConversation?._id === conversation._id ? (isDarkMode ? 'bg-secondary-700' : 'bg-blue-50') : ''
          }`}
        >
          <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            {conversation.participants
              .map((p) => p.fullName || p.email)
              .join(', ')}
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
              className={`max-w-xs px-4 py-2 rounded-lg ${
                isMine
                  ? 'bg-blue-600 text-white'
                  : (isDarkMode ? 'bg-secondary-700 text-white' : 'bg-gray-300 text-gray-800')
              }`}
            >
              <p>{message.text}</p>
              <p
                className={`text-xs mt-1 ${
                  isMine ? 'text-blue-100' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')
                }`}
              >
                {new Date(message.createdAt).toLocaleTimeString()}
              </p>
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
  }, [messages, user?._id, isDarkMode]);

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-secondary-900' : 'bg-gray-100'}`}>
      {/* Conversations List */}
      <div className={`w-80 border-r overflow-y-auto ${isDarkMode ? 'bg-secondary-800 border-secondary-700' : 'bg-white border-gray-300'}`}>
        <div className={`p-4 border-b ${isDarkMode ? 'border-secondary-700' : 'border-gray-300'}`}>
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Messages</h2>
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
                {selectedConversation.participants
                  .map((p) => p.fullName || p.email)
                  .join(', ')}
              </h2>
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
            </div>

            {/* Message Input */}
            <div className={`border-t p-4 ${isDarkMode ? 'bg-secondary-800 border-secondary-700' : 'bg-white border-gray-300'}`}>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode ? 'bg-secondary-700 border-secondary-600 text-white placeholder-gray-400' : 'bg-white border-gray-300'
                  }`}
                />
                <Button
                  type="submit"
                  variant="primary"
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

export default ChatPage;
