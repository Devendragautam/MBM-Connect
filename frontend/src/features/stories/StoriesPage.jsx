import React, { useEffect, useState } from 'react';
import { storiesAPI } from './stories.api';
import { Loader, ErrorBox, Button, Input } from '../../shared/ui';
import { useAuth } from '../auth/AuthContext';

const StoriesPage = () => {
  const { user } = useAuth();
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
    <div className="min-h-screen pt-20 pb-12 transition-colors duration-300 bg-dark-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-20 bg-primary-600 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-20 bg-secondary-600 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="flex justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold font-display text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Stories</h1>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            {showCreateForm ? 'Cancel' : 'Write Story'}
          </Button>
        </div>

        {error && (
          <div className="mb-8 animate-slide-up">
            <ErrorBox
              message={error}
              onDismiss={() => setError('')}
              variant="error"
            />
          </div>
        )}

        {showCreateForm && (
          <div className="glass-panel p-6 mb-8 animate-fade-in border-l-4 border-l-primary-500 bg-dark-800/60 border-white/5">
            <h2 className="text-2xl font-bold mb-6 text-white">Write a New Story</h2>
            <form onSubmit={handleCreateStory} className="space-y-6">
              <Input
                type="text"
                name="title"
                placeholder="Story Title"
                value={formData.title}
                onChange={handleFormChange}
                required
                className="input-field text-xl font-bold"
              />
              <textarea
                name="content"
                placeholder="Share your story..."
                value={formData.content}
                onChange={handleFormChange}
                className="input-field min-h-[200px] resize-none"
                rows="8"
                required
              ></textarea>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="btn-primary px-8"
                >
                  Publish Story
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Stories List */}
        {loading ? (
          <Loader text="Loading stories..." />
        ) : (
          <div className="space-y-8">
            {stories.length > 0 ? (
              stories.map((story) => (
                <div
                  key={story._id}
                  className="glass-panel p-8 animate-slide-up transition-all hover:scale-[1.01] bg-dark-800/40 border border-white/5"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 p-[2px]">
                        <div className="w-full h-full rounded-full flex items-center justify-center font-bold text-xl bg-dark-900 border-2 border-dark-900 text-white">
                          {story.author?.fullName?.charAt(0) || 'U'}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-bold text-lg text-white">
                          {story.author?.fullName || 'Anonymous'}
                        </h4>
                        <p className="text-sm text-dark-400">
                          {new Date(story.createdAt).toLocaleDateString(undefined, {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    {user?._id === story.author?._id && (
                      <button
                        onClick={() => handleDeleteStory(story._id)}
                        className="text-dark-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-white/10"
                        title="Delete Story"
                      >
                        🗑️
                      </button>
                    )}
                  </div>

                  <h3 className="text-3xl font-bold mb-4 font-display text-white">
                    {story.title}
                  </h3>

                  <div className="prose max-w-none mb-6 prose-invert text-dark-300">
                    <p className="leading-relaxed whitespace-pre-wrap text-lg">
                      {expandedStories[story._id] ? story.content : `${story.content.substring(0, 300)}${story.content.length > 300 ? '...' : ''}`}
                    </p>
                  </div>

                  {story.content.length > 300 && (
                    <button
                      onClick={() => toggleExpand(story._id)}
                      className="text-primary-400 hover:text-primary-300 font-semibold mb-6 flex items-center gap-1"
                    >
                      {expandedStories[story._id] ? 'Read Less ↑' : 'Read More ↓'}
                    </button>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                    <button
                      onClick={() => handleLike(story._id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${story.likes?.includes(user?._id)
                        ? 'bg-red-500/10 text-red-500'
                        : 'hover:bg-white/10 text-dark-400'
                        }`}
                    >
                      <span className="text-xl">{story.likes?.includes(user?._id) ? '❤️' : '🤍'}</span>
                      <span className="font-semibold">{story.likes?.length || 0}</span>
                    </button>

                    <button
                      onClick={() => toggleComments(story._id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 text-dark-400 transition-all"
                    >
                      <span className="text-xl">💬</span>
                      <span className="font-semibold">{story.comments?.length || 0}</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {activeComments[story._id] && (
                    <div className="mt-6 pt-6 border-t border-white/10 animate-fade-in">
                      <div className="space-y-4 max-h-80 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                        {story.comments?.length > 0 ? (
                          story.comments.map((comment, idx) => (
                            <div key={comment._id || idx} className="flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-xs font-bold flex-shrink-0 text-white">
                                {comment.user?.fullName?.charAt(0) || 'U'}
                              </div>
                              <div className="p-3 rounded-2xl rounded-tl-none bg-dark-800/50">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-bold text-white">
                                    {comment.user?.fullName || 'User'}
                                  </span>
                                  <span className="text-xs opacity-50 text-dark-400">
                                    {comment.createdAt && new Date(comment.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-dark-300">{comment.text}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-center opacity-50 text-sm py-4 text-dark-400">No comments yet. Be the first to share your thoughts!</p>
                        )}
                      </div>

                      <form onSubmit={(e) => handleCommentSubmit(e, story._id)} className="relative">
                        <input
                          type="text"
                          value={commentText[story._id] || ''}
                          onChange={(e) => setCommentText(prev => ({ ...prev, [story._id]: e.target.value }))}
                          placeholder="Write a thoughtful comment..."
                          className="w-full px-4 py-3 rounded-lg bg-dark-800/80 border border-dark-600 text-white focus:border-primary-500 focus:outline-none placeholder-dark-500 pr-24 transition-all"
                        />
                        <button
                          type="submit"
                          disabled={!commentText[story._id]?.trim()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-semibold hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors shadow-lg"
                        >
                          Post
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="glass-panel text-center py-20 opacity-70 border border-white/5">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-2xl font-bold mb-2 text-white">No stories yet</h3>
                <p className="text-lg text-dark-300">Share your journey with the community!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoriesPage;
