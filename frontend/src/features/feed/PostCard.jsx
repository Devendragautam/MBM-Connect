import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../shared/DarkModeContext';
import { feedAPI } from './feed.api';

export default function PostCard({ post, onPostDeleted, currentUserId }) {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.likes?.includes(currentUserId));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLiked(post.likes?.includes(currentUserId));
    setLikeCount(post.likes?.length || 0);
  }, [post.likes, currentUserId]);

  const authorId = post.author?._id || post.author;
  const isOwner = authorId === currentUserId;
  const createdAt = new Date(post.createdAt).toLocaleDateString();

  const handleLike = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      const response = await feedAPI.likePost(post._id);
      
      if (response.data.success) {
        setLiked((prev) => !prev);
        setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
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
        setComments(response.data.data.comments || []);
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
        setComments(response.data.data.comments || []);
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
    <div className={`rounded-3xl border overflow-hidden shadow-2xl backdrop-blur-xl transition-all duration-300 hover:shadow-3xl ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white/90 border-slate-200'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3 cursor-pointer hover-scale" onClick={() => navigate(`/profile/${post.author._id}`)}>
          <img
            src={post.author?.avatar || 'https://via.placeholder.com/40'}
            alt={post.author?.username}
            className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500"
          />
          <div>
            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {post.author?.fullName}
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              @{post.author?.username} • {createdAt}
            </p>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/30 rounded-lg font-semibold text-sm transition-all"
          >
            Delete
          </button>
        )}
      </div>

      {/* Content */}
      <div className={`p-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-800'}`}>
        <p className="mb-4 leading-relaxed">{post.content}</p>
        
        {post.image && (
          <img
            src={post.image}
            alt="post"
            className="w-full h-80 object-cover rounded-2xl mb-4"
          />
        )}
      </div>

      {/* Stats */}
      <div className={`flex justify-between px-6 py-4 border-y text-sm font-semibold ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-700'}`}>
        <span className="hover:text-indigo-600 cursor-pointer transition-colors">{likeCount} Likes</span>
        <span className="hover:text-indigo-600 cursor-pointer transition-colors">{comments.length} Comments</span>
      </div>

      {/* Actions */}
      <div className={`flex justify-around py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center gap-2 flex-1 justify-center py-2 rounded-lg font-medium transition-all duration-300 hover-scale ${
            liked
              ? 'text-red-500'
              : isDarkMode
              ? 'text-slate-400 hover:text-red-500'
              : 'text-slate-600 hover:text-red-500'
          }`}
        >
          {liked ? '❤️' : '🤍'} Like
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 flex-1 justify-center py-2 rounded-lg font-medium transition-all duration-300 hover-scale ${
            isDarkMode
              ? 'text-slate-400 hover:text-blue-400'
              : 'text-slate-600 hover:text-blue-500'
          }`}
        >
          💬 Comment
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className={`p-6 space-y-4 animate-slideDown ${isDarkMode ? 'bg-slate-700/50' : 'bg-slate-100/50'}`}>
          {/* Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                isDarkMode
                  ? 'bg-slate-700 border border-slate-600 text-white placeholder-slate-400'
                  : 'bg-white border border-slate-300 text-slate-900 placeholder-slate-500'
              }`}
            />
            <button
              type="submit"
              disabled={loading || !commentText.trim()}
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-all"
            >
              Post
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        @{comment.user?.username}
                      </span>
                      <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {comment.createdAt && new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {comment.text}
                    </p>
                  </div>

                  {comment.user?._id === currentUserId && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      disabled={loading}
                      className="text-red-500 hover:text-red-600 text-xs font-semibold"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
