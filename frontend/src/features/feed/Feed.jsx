import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useDarkMode } from '../../shared/DarkModeContext';
import { useAuth } from '../auth/AuthContext';
import { feedAPI } from './feed.api';
import { Loader, ErrorBox } from '../../shared/ui';
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

  // Infinite Scroll Observer
  const observer = useRef();
  const lastPostElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Memoize fetchPosts with proper dependencies
  const fetchPosts = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch from following feed first (requires auth), fallback to all posts
      try {
      const response = await feedAPI.getFollowingFeed(pageNum, 10);

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
    const response = await feedAPI.getAllPosts(pageNum, 10);

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

  useEffect(() => {
    if (page > 1) {
      fetchPosts(page);
    }
  }, [page, fetchPosts]);

  // Memoize handlers
  const handlePostCreated = useCallback((newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  }, []);

  const handlePostDeleted = useCallback((postId) => {
    setPosts((prev) => prev.filter((p) => p._id !== postId));
  }, []);

  const handleDismissError = useCallback(() => {
    setError(null);
  }, []);

  // Memoize posts rendering
  const postsContent = useMemo(() => {
    if (loading && posts.length === 0) {
      return <Loader text="Loading posts..." />;
    }

    if (posts.length > 0) {
      return (
        <div className="space-y-6">
          {posts.map((post, index) => {
            if (posts.length === index + 1) {
              return (
                <div ref={lastPostElementRef} key={post._id} className="animate-fadeInUp" style={{ animationDelay: `${0.1 + index * 0.08}s` }}>
                  <PostCard post={post} onPostDeleted={handlePostDeleted} currentUserId={user?._id} />
                </div>
              );
            } else {
              return (
                <div key={post._id} className="animate-fadeInUp" style={{ animationDelay: `${0.1 + index * 0.08}s` }}>
                  <PostCard post={post} onPostDeleted={handlePostDeleted} currentUserId={user?._id} />
                </div>
              );
            }
          })}

          {loading && (
            <div className="py-4 animate-fadeInUp">
              <Loader text="Loading more..." />
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="text-center py-16 animate-fadeInUp">
        <div className="text-6xl mb-4">📝</div>
        <p className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          No posts yet
        </p>
        <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>
          {user ? 'Be the first to create a post!' : 'Log in to see posts from your followers'}
        </p>
      </div>
    );
  }, [posts, loading, hasMore, handlePostDeleted, user, isDarkMode, lastPostElementRef]);

  const bgClass = isDarkMode 
    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'
    : 'bg-gradient-to-br from-slate-50 via-white to-blue-50';

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${isDarkMode ? 'bg-indigo-600' : 'bg-indigo-300'} animate-pulse-light`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${isDarkMode ? 'bg-purple-600' : 'bg-purple-300'} floating-element-slow`}></div>
      </div>

      <div className="max-w-3xl mx-auto py-12 px-4 relative z-10">
        {user && (
          <div className="mb-8 animate-fadeInUp">
            <CreatePost onPostCreated={handlePostCreated} />
          </div>
        )}

        {error && (
          <div className="mb-6 animate-slideDown">
            <ErrorBox 
              message="Error loading posts" 
              errors={[error]}
              onDismiss={handleDismissError}
            />
          </div>
        )}

        {postsContent}
      </div>
    </div>
  );
}
