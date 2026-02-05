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

  const bgClass = isDarkMode 
    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'
    : 'bg-gradient-to-br from-slate-50 via-white to-blue-50';

  if (loading) {
    return (
      <Loader text="Loading dashboard..." fullScreen />
    );
  }

  return (
    <div className={`min-h-screen py-16 ${bgClass}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${isDarkMode ? 'bg-indigo-600' : 'bg-indigo-300'} animate-pulse-light`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${isDarkMode ? 'bg-purple-600' : 'bg-purple-300'} floating-element-slow`}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Welcome Section */}
        <div className="mb-12 animate-fadeInUp">
          <h1 className={`text-5xl font-bold mb-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent`}>
            Welcome, {user?.fullName || user?.email}!
          </h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Here's what's happening on MBM Connect today</p>
        </div>

        {error && (
          <ErrorBox 
            message={error} 
            onDismiss={() => setError('')} 
          />
        )}

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Listings */}
          <div className={`p-8 rounded-3xl shadow-2xl backdrop-blur-xl border animate-fadeInUp hover-scale-md ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/90 border-slate-200'}`} style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Total Listings
                </p>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  {listings.length}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-2xl">
                🛍️
              </div>
            </div>
          </div>

          {/* Stories Count */}
          <div className={`p-8 rounded-3xl shadow-2xl backdrop-blur-xl border animate-fadeInUp hover-scale-md ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/90 border-slate-200'}`} style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Stories
                </p>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                  {stories.length}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-2xl">
                📖
              </div>
            </div>
          </div>

          {/* Feed Posts */}
          <div className={`p-8 rounded-3xl shadow-2xl backdrop-blur-xl border animate-fadeInUp hover-scale-md ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/90 border-slate-200'}`} style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Feed Posts
                </p>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {feeds.length}
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-2xl">
                📰
              </div>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div className="mb-12">
          <h2 className={`text-3xl font-bold mb-6 animate-fadeInUp ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Latest Listings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.length > 0 ? (
              listings.map((listing, index) => (
                <div
                  key={listing._id}
                  className={`rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl border animate-fadeInUp hover-scale-md transition-all duration-300 ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/90 border-slate-200'}`}
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  {listing.image && (
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className={`text-lg font-bold mb-2 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {listing.title}
                    </h3>
                    <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {listing.description?.substring(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xl bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                        ${listing.price}
                      </p>
                      <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className={`col-span-3 text-center py-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                No listings available
              </p>
            )}
          </div>
        </div>

        {/* Stories Section */}
        <div className="mb-12">
          <h2 className={`text-3xl font-bold mb-6 animate-fadeInUp ${isDarkMode ? 'text-white' : 'text-slate-900'}`} style={{ animationDelay: '0.2s' }}>
            Recent Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.length > 0 ? (
              stories.map((story, index) => (
                <div
                  key={story._id}
                  className={`rounded-3xl shadow-2xl backdrop-blur-xl border p-6 animate-fadeInUp hover-scale-md transition-all duration-300 ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/90 border-slate-200'}`}
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <h3 className={`text-lg font-bold mb-3 line-clamp-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {story.title}
                  </h3>
                  <p className={`text-sm mb-4 line-clamp-3 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {story.content?.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                    <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      By {story.author?.fullName || 'Anonymous'}
                    </span>
                    <button className="text-indigo-600 dark:text-purple-400 hover:text-indigo-700 dark:hover:text-purple-300 text-sm font-medium">
                      Read →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className={`col-span-3 text-center py-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                No stories available
              </p>
            )}
          </div>
        </div>

        {/* Feed Section */}
        <div>
          <h2 className={`text-3xl font-bold mb-6 animate-fadeInUp ${isDarkMode ? 'text-white' : 'text-slate-900'}`} style={{ animationDelay: '0.4s' }}>
            Home Feed
          </h2>
          <div className="space-y-4">
            {feeds.length > 0 ? (
              feeds.map((post, index) => (
                <div
                  key={post._id}
                  className={`rounded-3xl shadow-2xl backdrop-blur-xl border p-6 animate-fadeInUp transition-all duration-300 hover:shadow-3xl ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/90 border-slate-200'}`}
                  style={{ animationDelay: `${0.5 + index * 0.08}s` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-lg">
                      {post.author?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {post.author?.fullName || 'Anonymous'}
                      </h4>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className={`leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {post.content}
                  </p>
                </div>
              ))
            ) : (
              <p className={`text-center py-8 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
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
