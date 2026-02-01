import React, { useEffect, useState } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { feedAPI } from '../../features/feed/feed.api';
import { marketAPI } from '../../features/market/market.api';
import { storiesAPI } from '../../features/stories/stories.api';
import { useDarkMode } from '../DarkModeContext';
import { Loader, ErrorBox } from '../ui';

const Dashboard = () => {
  const { user } = useAuth();
  const { isDarkMode } = useDarkMode();
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
      
      // Fetch data independently to prevent one failure from blocking the dashboard
      const feedPromise = feedAPI.getAllPosts(1, 5).catch(err => {
        console.error('Feed fetch failed:', err);
        return null;
      });
      
      const marketPromise = marketAPI.getListings({ limit: 5 }).catch(err => {
        console.error('Market fetch failed:', err);
        return null;
      });
      
      const storiesPromise = storiesAPI.getStories({ limit: 5 }).catch(err => {
        console.error('Stories fetch failed:', err);
        return null;
      });

      const [feedRes, marketRes, storiesRes] = await Promise.all([
        feedPromise,
        marketPromise,
        storiesPromise
      ]);

      // Handle feed response structure (paginated object vs array)
      const feedData = feedRes?.data?.data;
      if (feedData) setFeeds(feedData?.posts || (Array.isArray(feedData) ? feedData : []));
      
      const marketData = marketRes?.data?.data;
      if (marketData) setListings(Array.isArray(marketData) ? marketData : (marketData?.listings || []));
      
      const storiesData = storiesRes?.data?.data;
      if (storiesData) setStories(Array.isArray(storiesData) ? storiesData : (storiesData?.stories || []));
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Loader text="Loading dashboard..." fullScreen />
    );
  }

  return (
    <div className={`min-h-screen py-8 ${isDarkMode ? 'bg-secondary-900' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Welcome, {user?.fullName || user?.email}!
          </h1>
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Here's what's new on MBM Connect</p>
        </div>

        {error && (
          <ErrorBox 
            message={error} 
            onDismiss={() => setError('')} 
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Stats Cards */}
          <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-secondary-800' : 'bg-white'}`}>
            <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Total Listings
            </h3>
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              {listings.length}
            </p>
          </div>

          <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-secondary-800' : 'bg-white'}`}>
            <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Stories
            </h3>
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
              {stories.length}
            </p>
          </div>

          <div className={`p-6 rounded-lg shadow ${isDarkMode ? 'bg-secondary-800' : 'bg-white'}`}>
            <h3 className={`text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Recent Feed
            </h3>
            <p className={`text-3xl font-bold ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {feeds.length}
            </p>
          </div>
        </div>

        {/* Listings Section */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Latest Listings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.length > 0 ? (
              listings.map((listing) => (
                <div
                  key={listing._id}
                  className={`rounded-lg shadow hover:shadow-lg transition ${isDarkMode ? 'bg-secondary-800' : 'bg-white'}`}
                >
                  {listing.image && (
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-4">
                    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                      {listing.title}
                    </h3>
                    <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {listing.description?.substring(0, 100)}...
                    </p>
                    <p className={`font-bold text-lg ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      ${listing.price}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className={`col-span-3 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No listings available
              </p>
            )}
          </div>
        </div>

        {/* Stories Section */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Recent Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.length > 0 ? (
              stories.map((story) => (
                <div
                  key={story._id}
                  className={`rounded-lg shadow hover:shadow-lg transition p-4 ${isDarkMode ? 'bg-secondary-800' : 'bg-white'}`}
                >
                  <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                    {story.title}
                  </h3>
                  <p className={`text-sm mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {story.content?.substring(0, 100)}...
                  </p>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    By {story.author?.fullName || 'Anonymous'}
                  </span>
                </div>
              ))
            ) : (
              <p className={`col-span-3 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                No stories available
              </p>
            )}
          </div>
        </div>

        {/* Feed Section */}
        <div>
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
            Home Feed
          </h2>
          <div className="space-y-4">
            {feeds.length > 0 ? (
              feeds.map((post) => (
                <div
                  key={post._id}
                  className={`rounded-lg shadow p-6 hover:shadow-lg transition ${isDarkMode ? 'bg-secondary-800' : 'bg-white'}`}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {post.author?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-4">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                        {post.author?.fullName || 'Anonymous'}
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{post.content}</p>
                </div>
              ))
            ) : (
              <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
