import React, { useEffect, useState } from 'react';
import { storiesAPI } from './stories.api';
import { useDarkMode } from '../../shared/DarkModeContext';
import { Loader, ErrorBox, Button, Input } from '../../shared/ui';
import { useAuth } from '../auth/AuthContext';

const StoriesPage = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [expandedStories, setExpandedStories] = useState({});
  const [commentText, setCommentText] = useState({});
  const [activeComments, setActiveComments] = useState({});

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await storiesAPI.getStories();
      if (response.data.success) {
        const storiesData = response.data.data;
        setStories(Array.isArray(storiesData) ? storiesData : (storiesData?.stories || []));
      } else {
        setError(response.data.message || 'Failed to load stories');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    try {
      const response = await storiesAPI.createStory(formData);
      if (response.data.success) {
        setFormData({ title: '', content: '' });
        setShowCreateForm(false);
        fetchStories();
      } else {
        setError(response.data.message || 'Failed to create story');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create story');
      console.error(err);
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;
    try {
      const response = await storiesAPI.deleteStory(storyId);
      if (response.data.success) {
        setStories((prev) => prev.filter((s) => s._id !== storyId));
      } else {
        setError(response.data.message || 'Failed to delete story');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete story');
    }
  };

  const toggleExpand = (storyId) => {
    setExpandedStories((prev) => ({ ...prev, [storyId]: !prev[storyId] }));
  };

  const handleLike = async (storyId) => {
    if (!user) return;

    try {
      const response = await storiesAPI.toggleLike(storyId);
      if (response.data.success) {
        setStories((prev) => prev.map((story) => {
          if (story._id === storyId) {
            const isLiked = story.likes?.includes(user._id);
            const newLikes = isLiked 
              ? story.likes.filter(id => id !== user._id)
              : [...(story.likes || []), user._id];
            return { ...story, likes: newLikes };
          }
          return story;
        }));
      }
    } catch (err) {
      console.error('Failed to like story', err);
    }
  };

  const toggleComments = (storyId) => {
    setActiveComments((prev) => ({ ...prev, [storyId]: !prev[storyId] }));
  };

  const handleCommentSubmit = async (e, storyId) => {
    e.preventDefault();
    const text = commentText[storyId];
    if (!text?.trim()) return;

    try {
      const response = await storiesAPI.addComment(storyId, { text });
      if (response.data.success) {
        const newComment = response.data.data;
        setStories((prev) => prev.map((story) => story._id === storyId ? { ...story, comments: [...(story.comments || []), newComment] } : story));
        setCommentText((prev) => ({ ...prev, [storyId]: '' }));
      }
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  return (
    <div className={`min-h-screen py-8 ${isDarkMode ? 'bg-secondary-900' : 'bg-gray-100'}`}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Stories</h1>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            variant="primary"
          >
            {showCreateForm ? 'Cancel' : 'Write Story'}
          </Button>
        </div>

        {error && (
          <ErrorBox 
            message={error} 
            onDismiss={() => setError('')} 
          />
        )}

        {showCreateForm && (
          <div className={`p-6 rounded-lg shadow mb-8 ${isDarkMode ? 'bg-secondary-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Write a New Story</h2>
            <form onSubmit={handleCreateStory} className="space-y-4">
              <Input
                type="text"
                name="title"
                placeholder="Story Title"
                value={formData.title}
                onChange={handleFormChange}
                required
                className={isDarkMode ? 'bg-secondary-700 border-secondary-600 text-white placeholder-gray-400' : ''}
              />
              <textarea
                name="content"
                placeholder="Write your story..."
                value={formData.content}
                onChange={handleFormChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-secondary-700 border-secondary-600 text-white placeholder-gray-400' : 'border-gray-300'
                }`}
                rows="8"
                required
              ></textarea>
              <Button
                type="submit"
                className="w-full"
              >
                Publish Story
              </Button>
            </form>
          </div>
        )}

        {/* Stories List */}
        {loading ? (
          <Loader text="Loading stories..." />
        ) : (
          <div className="space-y-6">
            {stories.length > 0 ? (
              stories.map((story) => (
                <div
                  key={story._id}
                  className={`rounded-lg shadow hover:shadow-lg transition p-6 ${isDarkMode ? 'bg-secondary-800' : 'bg-white'}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {story.author?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-4">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {story.author?.fullName || 'Anonymous'}
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(story.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    </div>
                    {user?._id === story.author?._id && (
                      <button
                        onClick={() => handleDeleteStory(story._id)}
                        className="text-red-500 hover:text-red-600 text-sm font-semibold"
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {story.title}
                  </h3>
                  <p className={`leading-relaxed mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {expandedStories[story._id] ? story.content : `${story.content.substring(0, 150)}${story.content.length > 150 ? '...' : ''}`}
                  </p>

                  {story.content.length > 150 && (
                    <button
                      onClick={() => toggleExpand(story._id)}
                      className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} font-semibold`}
                    >
                      {expandedStories[story._id] ? 'Show Less' : 'Read More'}
                    </button>
                  )}

                  {/* Actions */}
                  <div className={`flex items-center gap-6 mt-4 pt-4 border-t ${isDarkMode ? 'border-secondary-700' : 'border-gray-100'}`}>
                    <button 
                      onClick={() => handleLike(story._id)}
                      className={`flex items-center gap-2 ${story.likes?.includes(user?._id) ? 'text-red-500' : (isDarkMode ? 'text-gray-400' : 'text-gray-500')} hover:text-red-500 transition`}
                    >
                      <span>{story.likes?.includes(user?._id) ? '❤️' : '🤍'}</span>
                      <span>{story.likes?.length || 0} Likes</span>
                    </button>
                    <button 
                      onClick={() => toggleComments(story._id)}
                      className={`flex items-center gap-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} hover:text-blue-500 transition`}
                    >
                      <span>💬</span>
                      <span>{story.comments?.length || 0} Comments</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {activeComments[story._id] && (
                    <div className={`mt-4 p-4 rounded-lg ${isDarkMode ? 'bg-secondary-700' : 'bg-gray-50'}`}>
                      <form onSubmit={(e) => handleCommentSubmit(e, story._id)} className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={commentText[story._id] || ''}
                          onChange={(e) => setCommentText(prev => ({ ...prev, [story._id]: e.target.value }))}
                          placeholder="Write a comment..."
                          className={`flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            isDarkMode
                              ? 'bg-secondary-600 border-secondary-500 text-white placeholder-gray-400'
                              : 'bg-white border-gray-300 text-gray-900'
                          }`}
                        />
                        <button
                          type="submit"
                          disabled={!commentText[story._id]?.trim()}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          Post
                        </button>
                      </form>

                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {story.comments?.map((comment, idx) => (
                          <div key={comment._id || idx} className="flex gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {comment.user?.fullName || 'User'}
                                </span>
                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {comment.createdAt && new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>No stories yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoriesPage;
