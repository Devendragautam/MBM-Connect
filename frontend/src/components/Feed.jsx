import { useState, useEffect, useCallback } from 'react';
import { useDarkMode } from '../context/DarkModeContext';
import { useAuth } from '../context/AuthContext';
import { axiosInstance } from '../services/apiClient';
import CreatePost from './CreatePost';
import PostCard from './PostCard';

export default function Feed() {
  const { isDarkMode } = useDarkMode();
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from following feed first (requires auth), fallback to all posts
      try {
        const response = await axiosInstance.get(
          `/posts/feed/following?page=${pageNum}&limit=10`
        );

        if (response.data.success) {
          if (pageNum === 1) {
            setPosts(response.data.data.posts);
          } else {
            setPosts((prev) => [...prev, ...response.data.data.posts]);
          }
          setHasMore(pageNum < response.data.data.totalPages);
          return;
        }
      } catch (err) {
        // Fall back to all posts if following feed fails
        console.log('Fetching all posts instead...');
      }

      // Fallback: fetch all posts
      const response = await axiosInstance.get(
        `/posts/feed/all?page=${pageNum}&limit=10`
      );

      if (response.data.success) {
        if (pageNum === 1) {
          setPosts(response.data.data.posts);
        } else {
          setPosts((prev) => [...prev, ...response.data.data.posts]);
        }
        setHasMore(pageNum < response.data.data.totalPages);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading posts');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPosts(nextPage);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Create Post Section - Only show if user is logged in */}
        {user && (
          <div className="mb-6">
            <CreatePost onPostCreated={handlePostCreated} />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded text-red-600">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && posts.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin mb-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
              <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
                Loading posts...
              </p>
            </div>
          </div>
        )}

        {/* Posts List */}
        {posts.length > 0 && (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onPostDeleted={handlePostDeleted}
                currentUserId={user?._id}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center py-6">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50 transition"
                >
                  {loading ? 'Loading...' : 'Load More Posts'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <p className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No posts yet
            </p>
            <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
              {user ? 'Be the first to create a post!' : 'Log in to see posts from your followers'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
