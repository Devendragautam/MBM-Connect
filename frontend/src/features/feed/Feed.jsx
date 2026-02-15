import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { feedAPI } from './feed.api';
import { Loader, ErrorBox } from '../../shared/ui';
import CreatePost from './CreatePost';
import PostCard from './PostCard';

export default function Feed() {
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
        <p className="text-2xl font-bold mb-2 text-white">
          No posts yet
        </p>
        <p className="text-dark-400">
          {user ? 'Be the first to create a post!' : 'Log in to see posts from your followers'}
        </p>
      </div>
    );
  }, [posts, loading, hasMore, handlePostDeleted, user, lastPostElementRef]);

  return (
    <div className="min-h-screen pt-24 pb-12 transition-colors duration-300 bg-dark-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-10 bg-primary-600 animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full mix-blend-screen filter blur-3xl opacity-10 bg-secondary-600 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-2xl mx-auto px-4 relative z-10 space-y-8">
        {user && (
          <div className="animate-fade-in">
            <CreatePost onPostCreated={handlePostCreated} />
          </div>
        )}

        {error && (
          <div className="animate-slide-up">
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
