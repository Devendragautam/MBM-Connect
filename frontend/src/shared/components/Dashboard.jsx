import React, { useEffect, useState } from 'react';
import { useAuth } from '../../features/auth/AuthContext';
import { feedAPI } from '../../features/feed/feed.api';
import { marketAPI } from '../../features/market/market.api';
import { storiesAPI } from '../../features/stories/stories.api';
import { Loader, ErrorBox } from '../ui';

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
    <div className="min-h-screen py-16 relative overflow-hidden bg-dark-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-screen filter blur-3xl opacity-20 bg-primary-600 animate-pulse-light"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-screen filter blur-3xl opacity-20 bg-secondary-600 floating-element-slow"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Welcome Section */}
        <div className="mb-12 animate-fadeInUp">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 bg-clip-text text-transparent">
            Welcome, {user?.fullName || user?.email}!
          </h1>
          <p className="text-dark-400">Here's what's happening on MBM Connect today</p>
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
          <div className="glass-panel p-8 flex items-center justify-between animate-fadeInUp hover-scale-md" style={{ animationDelay: '0.1s' }}>
            <div>
              <p className="text-sm font-semibold mb-1 text-dark-400">
                Total Listings
              </p>
              <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {listings.length}
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center text-2xl border border-cyan-500/30">
              🛍️
            </div>
          </div>

          {/* Stories Count */}
          <div className="glass-panel p-8 flex items-center justify-between animate-fadeInUp hover-scale-md" style={{ animationDelay: '0.2s' }}>
            <div>
              <p className="text-sm font-semibold mb-1 text-dark-400">
                Stories
              </p>
              <p className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {stories.length}
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center text-2xl border border-emerald-500/30">
              📖
            </div>
          </div>

          {/* Feed Posts */}
          <div className="glass-panel p-8 flex items-center justify-between animate-fadeInUp hover-scale-md" style={{ animationDelay: '0.3s' }}>
            <div>
              <p className="text-sm font-semibold mb-1 text-dark-400">
                Feed Posts
              </p>
              <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {feeds.length}
              </p>
            </div>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center text-2xl border border-purple-500/30">
              📰
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 animate-fadeInUp text-white">
            Latest Listings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.length > 0 ? (
              listings.map((listing, index) => (
                <div
                  key={listing._id}
                  className="card group animate-fadeInUp hover:shadow-glow-md"
                  style={{ animationDelay: `${0.1 + index * 0.1}s` }}
                >
                  {listing.image && (
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent opacity-60"></div>
                    </div>
                  )}
                  <div className="p-6 relative">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2 text-white group-hover:text-primary-400 transition-colors">
                      {listing.title}
                    </h3>
                    <p className="text-sm mb-4 line-clamp-2 text-dark-300">
                      {listing.description?.substring(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-xl text-primary-400">
                        ${listing.price}
                      </p>
                      <button className="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-white rounded-lg transition-all border border-dark-700 group-hover:border-primary-500/50">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center py-8 text-dark-400">
                No listings available
              </p>
            )}
          </div>
        </div>

        {/* Stories Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 animate-fadeInUp text-white" style={{ animationDelay: '0.2s' }}>
            Recent Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.length > 0 ? (
              stories.map((story, index) => (
                <div
                  key={story._id}
                  className="glass-panel p-6 animate-fadeInUp hover-scale-md"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <h3 className="text-lg font-bold mb-3 line-clamp-2 text-white">
                    {story.title}
                  </h3>
                  <p className="text-sm mb-4 line-clamp-3 text-dark-300">
                    {story.content?.substring(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-dark-700">
                    <span className="text-xs text-dark-400">
                      By {story.author?.fullName || 'Anonymous'}
                    </span>
                    <button className="text-primary-400 hover:text-primary-300 text-sm font-medium">
                      Read →
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center py-8 text-dark-400">
                No stories available
              </p>
            )}
          </div>
        </div>

        {/* Feed Section */}
        <div>
          <h2 className="text-3xl font-bold mb-6 animate-fadeInUp text-white" style={{ animationDelay: '0.4s' }}>
            Home Feed
          </h2>
          <div className="space-y-4">
            {feeds.length > 0 ? (
              feeds.map((post, index) => (
                <div
                  key={post._id}
                  className="glass-panel p-6 animate-fadeInUp hover:shadow-glow-sm"
                  style={{ animationDelay: `${0.5 + index * 0.08}s` }}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-lg shadow-lg">
                      {post.author?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">
                        {post.author?.fullName || 'Anonymous'}
                      </h4>
                      <p className="text-sm text-dark-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="leading-relaxed text-dark-200">
                    {post.content}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-dark-400">
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
