import { useState, useRef } from 'react';
import { useDarkMode } from '../../shared/DarkModeContext';
import { feedAPI } from './feed.api';

export default function CreatePost({ onPostCreated }) {
  const { isDarkMode } = useDarkMode();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Please write something for your post');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      const response = await feedAPI.createPost(formData);

      if (response.data.success) {
        setContent('');
        setImage(null);
        setPreview(null);
        if (onPostCreated) {
          onPostCreated(response.data.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating post');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    fileInputRef.current.value = '';
  };

  return (
    <div className="glass-panel p-6 mb-8 animate-fade-in border-t-4 border-indigo-500/50">
      {/* Header */}
      <h3 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
        <span className="text-2xl animate-bounce">✨</span> Create a Post
      </h3>

      {/* Error Message */}
      {error && (
        <div className="mb-4 animate-slide-up">
          <ErrorBox message={error} variant="error" />
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Content Textarea */}
        <div className="relative group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            maxLength={1000}
            rows={3}
            className="input-field min-h-[120px] resize-none"
          />
          <div className={`absolute bottom-3 right-3 text-xs font-medium transition-colors duration-300 ${content.length > 900 ? 'text-red-500' : isDarkMode ? 'text-slate-400' : 'text-slate-500'
            }`}>
            {content.length} / 1000
          </div>
        </div>

        {/* Image Preview */}
        {preview && (
          <div className="relative rounded-2xl overflow-hidden border border-white/20 shadow-lg group animate-scaleIn">
            <img
              src={preview}
              alt="preview"
              className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button
                type="button"
                onClick={removeImage}
                className="bg-red-500/80 hover:bg-red-600 text-white rounded-full p-3 backdrop-blur-sm transform transition-transform hover:scale-110 shadow-lg"
              >
                <span className="sr-only">Remove</span>
                🗑️
              </button>
            </div>
          </div>
        )}

        {/* Image Upload Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="glass-button flex items-center gap-2 text-violet-500 hover:text-violet-600 hover:px-5 transition-all"
          >
            <span>📷</span>
            <span className="hidden sm:inline">Add Image</span>
          </button>

          <div className="flex-1"></div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary min-w-[120px] flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)]"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Posting...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Post</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
