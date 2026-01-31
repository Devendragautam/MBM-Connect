import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../context/DarkModeContext';
import { axiosInstance } from '../services/apiClient';

export default function PostCard({ post, onPostDeleted, currentUserId }) {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(post.likes?.includes(currentUserId));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState(post.comments || []);
  const [loading, setLoading] = useState(false);

  const isOwner = post.author?._id === currentUserId;
  const createdAt = new Date(post.createdAt).toLocaleDateString();

  const handleLike = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(`/posts/${post._id}/like`);
      
      if (response.data.success) {
        setLiked(!liked);
        setLikeCount(liked ? likeCount - 1 : likeCount + 1);
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
      const response = await axiosInstance.post(`/posts/${post._id}/comment`, {
        text: commentText,
      });

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
      const response = await axiosInstance.delete(
        `/posts/${post._id}/comment/${commentId}`
      );

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
      const response = await axiosInstance.delete(`/posts/${post._id}`);
      
      if (response.data.success && onPostDeleted) {
        onPostDeleted(post._id);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  };

  return (
    <div className={`rounded-lg border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${post.author._id}`)}>
          <img
            src={post.author?.avatar || 'https://via.placeholder.com/40'}
            alt={post.author?.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {post.author?.fullName}
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              @{post.author?.username} • {createdAt}
            </p>
          </div>
        </div>

        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="text-red-500 hover:text-red-600 font-semibold text-sm"
          >
            Delete
          </button>
        )}
      </div>

      {/* Content */}
      <div className={`p-4 ${isDarkMode ? 'text-slate-200' : 'text-gray-800'}`}>
        <p className="mb-3">{post.content}</p>
        
        {post.image && (
          <img
            src={post.image}
            alt="post"
            className="w-full h-80 object-cover rounded-lg mb-3"
          />
        )}
      </div>

      {/* Stats */}
      <div className={`flex justify-between px-4 py-3 border-y text-sm ${isDarkMode ? 'border-slate-700 text-slate-400' : 'border-gray-200 text-gray-600'}`}>
        <span>{likeCount} Likes</span>
        <span>{comments.length} Comments</span>
      </div>

      {/* Actions */}
      <div className={`flex justify-around py-3 border-b ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center gap-2 flex-1 justify-center py-2 rounded transition ${
            liked
              ? 'text-red-500'
              : isDarkMode
              ? 'text-slate-400 hover:text-red-500'
              : 'text-gray-600 hover:text-red-500'
          }`}
        >
          {liked ? '❤️' : '🤍'} Like
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center gap-2 flex-1 justify-center py-2 rounded transition ${
            isDarkMode
              ? 'text-slate-400 hover:text-blue-400'
              : 'text-gray-600 hover:text-blue-500'
          }`}
        >
          💬 Comment
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className={`p-4 space-y-3 ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
          {/* Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className={`flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'bg-slate-600 border-slate-500 text-white placeholder-slate-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
            <button
              type="submit"
              disabled={loading || !commentText.trim()}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
            >
              Post
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className={`p-2 rounded ${isDarkMode ? 'bg-slate-600' : 'bg-white'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      @{comment.user?.username}
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
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
