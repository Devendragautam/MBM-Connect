import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { homeAPI, marketAPI, storiesAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [feeds, setFeeds] = useState([]);
  const [listings, setListings] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [feedRes, marketRes, storiesRes] = await Promise.all([
        homeAPI.getFeed({ limit: 5 }),
        marketAPI.getListings({ limit: 5 }),
        storiesAPI.getStories({ limit: 5 }),
      ]);

      setFeeds(feedRes.data.data || []);
      setListings(marketRes.data.data || []);
      setStories(storiesRes.data.data || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome, {user?.fullName || user?.email}!
          </h1>
          <p className="text-gray-600">Here's what's new on MBM Connect</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">
              Total Listings
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {listings.length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">
              Stories
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {stories.length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-semibold mb-2">
              Recent Feed
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {feeds.length}
            </p>
          </div>
        </div>

        {/* Listings Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Latest Listings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.length > 0 ? (
              listings.map((listing) => (
                <div
                  key={listing._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition"
                >
                  {listing.image && (
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {listing.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {listing.description?.substring(0, 100)}...
                    </p>
                    <p className="text-blue-600 font-bold text-lg">
                      ${listing.price}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 col-span-3 text-center">
                No listings available
              </p>
            )}
          </div>
        </div>

        {/* Stories Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Recent Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.length > 0 ? (
              stories.map((story) => (
                <div
                  key={story._id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition p-4"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {story.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {story.content?.substring(0, 100)}...
                  </p>
                  <span className="text-xs text-gray-500">
                    By {story.author?.fullName || 'Anonymous'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-600 col-span-3 text-center">
                No stories available
              </p>
            )}
          </div>
        </div>

        {/* Feed Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Home Feed
          </h2>
          <div className="space-y-4">
            {feeds.length > 0 ? (
              feeds.map((post) => (
                <div
                  key={post._id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {post.author?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-semibold text-gray-800">
                        {post.author?.fullName || 'Anonymous'}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700">{post.content}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-center">
                No posts in your feed
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
