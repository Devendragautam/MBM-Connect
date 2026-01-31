import React, { useEffect, useState } from 'react';
import { storiesAPI } from '../services/api';

const StoriesPage = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await storiesAPI.getStories();
      setStories(response.data.data || []);
    } catch (err) {
      setError('Failed to load stories');
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
      await storiesAPI.createStory(formData);
      setFormData({ title: '', content: '' });
      setShowCreateForm(false);
      fetchStories();
    } catch (err) {
      setError('Failed to create story');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Stories</h1>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {showCreateForm ? 'Cancel' : 'Write Story'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {showCreateForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <h2 className="text-2xl font-bold mb-4">Write a New Story</h2>
            <form onSubmit={handleCreateStory} className="space-y-4">
              <input
                type="text"
                name="title"
                placeholder="Story Title"
                value={formData.title}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <textarea
                name="content"
                placeholder="Write your story..."
                value={formData.content}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="8"
                required
              ></textarea>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Publish Story
              </button>
            </form>
          </div>
        )}

        {/* Stories List */}
        {loading ? (
          <div className="text-center text-gray-600">Loading stories...</div>
        ) : (
          <div className="space-y-6">
            {stories.length > 0 ? (
              stories.map((story) => (
                <div
                  key={story._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-6"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {story.author?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-800">
                        {story.author?.fullName || 'Anonymous'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {new Date(story.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {story.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {story.content}
                  </p>

                  <button className="text-blue-600 hover:text-blue-800 font-semibold">
                    Read More
                  </button>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center">No stories yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoriesPage;
