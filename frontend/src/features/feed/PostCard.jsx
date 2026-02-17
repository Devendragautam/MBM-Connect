import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../shared/DarkModeContext';
import { feedAPI } from './feed.api';

export default function PostCard({ post, onPostDeleted, currentUserId }) {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Robust check for liked state (handling ObjectId vs String)
    const isLiked = post.likes?.some(id =>
      (typeof id === 'object' ? id._id : id).toString() === currentUserId?.toString()
    );
    setLiked(!!isLiked);
    setLikeCount(post.likes?.length || 0);
    setComments(post.comments || []);
  }, [post, currentUserId]);

  const authorId = post.author?._id || post.author;
  const isOwner = authorId === currentUserId;
  const createdAt = new Date(post.createdAt).toLocaleDateString();

  const handleLike = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      const response = await feedAPI.likePost(post._id);

      if (response.data.success) {
        // Use backend response for truth if available, otherwise toggle
        // The backend toggleLike returns { post: populatedPost, isLiked: boolean }
        // based on post.controller.js inspection
        const { isLiked, post: updatedPost } = response.data.data;

        if (updatedPost) {
          setLiked(isLiked);
          setLikeCount(updatedPost.likes.length);
        } else {
          // Fallback manual toggle if structure differs
          setLiked((prev) => !prev);
          setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
        }
      }
    } catch (err) {
      console.error('Error liking post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    try {
      setLoading(true);
      const response = await feedAPI.addComment(post._id, { text: commentText });

      if (response.data.success) {
        // Backend returns populatedPost in data.data
        const updatedPost = response.data.data;
        setComments(updatedPost.comments || []);
        setCommentText('');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setLoading(true);
      const response = await feedAPI.deleteComment(post._id, commentId);

      if (response.data.success) {
        // Backend returns populatedPost in data.data
        const updatedPost = response.data.data;
        setComments(updatedPost.comments || []);
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await feedAPI.deletePost(post._id);

      if (response.data.success && onPostDeleted) {
        onPostDeleted(post._id);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  return (
    <div className="glass-panel tilt-hover mb-8 transform transition-all duration-300 hover:z-10 relative">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/10">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate(`/profile/${post.author._id}`)}>
          <div className="relative">
            <img
              src={post.author?.avatar || 'https://via.placeholder.com/40'}
              alt={post.author?.username}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30 group-hover:ring-violet-500 transition-all duration-300"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500/20 to-fuchsia-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <div>
            <p className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'} group-hover:text-violet-500 transition-colors`}>
              {post.author?.fullName}
            </p>
            <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              @{post.author?.username} • <span className="opacity-70">{createdAt}</span>
            </p>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all duration-200"
            title="Delete Post"
          >
            🗑️
          </button>
        )}
      </div>

      {/* Content */}
      <div className={`p-6 ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>
        <p className="mb-4 leading-relaxed text-base whitespace-pre-wrap">{post.content}</p>

        {post.image && (
          <div className="rounded-2xl overflow-hidden shadow-lg border border-white/10">
            <img
              src={post.image}
              alt="post"
              className="w-full h-auto max-h-[500px] object-cover hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="px-6 py-3 border-y border-white/10 flex justify-between text-sm font-medium text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5 hover:text-violet-500 transition-colors cursor-pointer">
          <span className="text-lg">❤️</span> {likeCount} Likes
        </span>
        <span className="flex items-center gap-1.5 hover:text-violet-500 transition-colors cursor-pointer">
          <span className="text-lg">💬</span> {comments.length} Comments
        </span>
      </div>

      {/* Actions */}
      <div className="flex p-2">
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium transition-all duration-300 ${liked
            ? 'text-red-500 bg-red-500/10'
            : 'text-slate-600 dark:text-slate-400 hover:bg-white/10'
            }`}
        >
          <span className={`text-xl transition-transform duration-300 ${liked ? 'scale-110' : ''}`}>
            {liked ? '❤️' : '🤍'}
          </span>
          Like
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-white/10 transition-all duration-300"
        >
          <span className="text-xl">💬</span> Comment
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="p-4 border-t border-white/10 bg-black/5 dark:bg-black/20 backdrop-blur-sm">
          {/* Comments List */}
          <div className="space-y-4 mb-4 max-h-80 overflow-y-auto custom-scrollbar px-2">
            {comments.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-4">No comments yet. Be the first!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="flex gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-400 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {comment.user?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="glass-panel p-3 rounded-tl-none relative group">
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {comment.user?.username}
                        </span>
                        {comment.user?._id === currentUserId && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-red-400 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {comment.text}
                      </p>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 ml-1">
                      {comment.createdAt && new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <form onSubmit={handleAddComment} className="relative">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="input-field pr-12 text-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !commentText.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50 disabled:hover:bg-violet-500 transition-colors shadow-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
