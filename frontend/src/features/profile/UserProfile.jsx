import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useDarkMode } from '../../shared/DarkModeContext';
import { userAPI } from '../user/user.api';
import { resolveImageUrl } from '../../shared/utils/imageUrl';
import { feedAPI } from '../feed/feed.api';
import { Loader, Button, Input, ErrorBox } from '../../shared/ui';
import PostCard from '../feed/PostCard';

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoadingFollow, setIsLoadingFollow] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editingImageType, setEditingImageType] = useState(null); // 'avatar' or 'cover'
  const [activeTab, setActiveTab] = useState('posts');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    fetchPosts();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUserProfile(userId);
      if (response.data.success) {
        setProfile(response.data.data);
        setEditForm(response.data.data);
        // Check if current user is following this user
        if (currentUser?._id && currentUser?._id !== userId) {
          const followers = response.data.data?.followers || [];
          const following = followers.some(f => {
            if (!f) return false;
            // follower may be populated as object {_id, username} or just id string
            if (typeof f === 'string') return f === currentUser._id;
            return f._id?.toString() === currentUser._id?.toString();
          });
          setIsFollowing(!!following);
        }
      } else {
        setError(response.data.message || 'Failed to load profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await feedAPI.getUserPosts(userId);
      if (response.data.success) {
        // backend may return posts as an array (data) or as { posts: [...] }
        const data = response.data.data;
        if (Array.isArray(data)) {
          setPosts(data);
        } else if (Array.isArray(data?.posts)) {
          setPosts(data.posts);
        } else {
          setPosts([]);
        }
      }
    } catch (err) {
      console.error('Error fetching user posts:', err);
    }
  };

  const handleFollow = async () => {
    try {
      setIsLoadingFollow(true);
      let response;
      if (isFollowing) {
        response = await userAPI.unfollowUser(userId);
      } else {
        response = await userAPI.followUser(userId);
      }

      if (response.data.success) {
        setIsFollowing(!isFollowing);
        fetchProfile();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating follow status');
    } finally {
      setIsLoadingFollow(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      // If a logged-in user (not necessarily owner) selected an image, show confirm UI
      if (currentUser && !isOwnProfile) {
        setEditingImageType('avatar');
        setIsEditingImage(true);
      }
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
      if (currentUser && !isOwnProfile) {
        setEditingImageType('cover');
        setIsEditingImage(true);
      }
    }
  };

  const handleSaveProfile = async () => {
    // Prevent accidental updates to other users from the client
    // Allow non-owners to upload avatar/cover images only
    if (!isOwnProfile && !(avatarFile || coverFile)) {
      setError('You can only update your own profile');
      return;
    }
    try {
      setIsSaving(true);
      const formData = new FormData();

      // Add all editable fields
      if (editForm.fullName !== profile.fullName) formData.append('fullName', editForm.fullName);
      if (editForm.email !== profile.email) formData.append('email', editForm.email);
      if (editForm.bio !== profile.bio) formData.append('bio', editForm.bio);
      if (editForm.location !== profile.location) formData.append('location', editForm.location);
      if (editForm.website !== profile.website) formData.append('website', editForm.website);

      // Add files if changed
      if (avatarFile) formData.append('avatar', avatarFile);
      if (coverFile) formData.append('coverImage', coverFile);

      const response = await userAPI.updateProfile(userId, formData);

      if (response.data.success) {
        setProfile(response.data.data);
        setEditForm(response.data.data);
        setIsEditing(false);
        setAvatarFile(null);
        setAvatarPreview(null);
        setCoverFile(null);
        setCoverPreview(null);
        updateUser(response.data.data);
      } else {
        setError(response.data.message || 'Failed to save profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving profile');
      console.error('Error saving profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'}`}>
        <Loader />
      </div>
    );
  }

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  // Errors are displayed inline so the rest of the profile UI stays accessible

  if (error && !profile) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 p-4 ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'}`}>
        <ErrorBox message={error} onDismiss={() => setError(null)} variant="error" />
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'}`}>
        <p className={`text-lg ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Profile not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === userId;

  return (
    <div className="min-h-screen pt-20 transition-colors duration-300">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${isDarkMode ? 'bg-indigo-600' : 'bg-indigo-300'} animate-pulse`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${isDarkMode ? 'bg-purple-600' : 'bg-purple-300'} animate-pulse`} style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Cover Image */}
      <div className="relative h-64 md:h-96 w-full overflow-hidden group animate-fade-in z-10">
        {coverPreview || profile.coverImage ? (
          <img
            src={coverPreview || resolveImageUrl(profile.coverImage) || '/placeholder-cover.jpg'}
            alt="Cover"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-r transition-all duration-300 ${isDarkMode ? 'from-indigo-900/50 via-purple-900/50 to-pink-900/50' : 'from-indigo-400/50 via-purple-400/50 to-pink-400/50'} backdrop-blur-sm`}></div>
        )}
        <div className="absolute inset-0 bg-black/20 transition-opacity duration-300 group-hover:bg-black/30"></div>

        {(isOwnProfile && isEditing) || (!!currentUser && !isEditingImage) ? (
          <>
            <button
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-6 right-6 glass-button flex items-center gap-2 z-20"
            >
              <span>📷 Change Cover</span>
            </button>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverChange}
              className="hidden"
            />
          </>
        ) : null}
      </div>

      {/* Profile Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-32 z-20 pb-12">
        <div className="glass-panel p-8 md:p-12 animate-slide-up">
          {error && (
            <ErrorBox message={error} onDismiss={() => setError(null)} variant="error" />
          )}

          {isEditingImage ? (
            <div className={`rounded-2xl p-6 mb-6 border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white/50 border-white/20'}`}>
              <h3 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Confirm Image Upload</h3>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {editingImageType === 'avatar' && avatarPreview && (
                  <img src={avatarPreview} alt="Avatar preview" className="w-32 h-32 rounded-full object-cover ring-4 ring-white/20" />
                )}
                {editingImageType === 'cover' && coverPreview && (
                  <img src={coverPreview} alt="Cover preview" className="w-60 h-32 rounded-xl object-cover ring-2 ring-white/20" />
                )}
                <div className="flex-1 text-center sm:text-left">
                  <p className={`mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>You're about to update the user's {editingImageType} image.</p>
                  <div className="flex gap-3 justify-center sm:justify-start">
                    <button
                      onClick={async () => {
                        await handleSaveProfile();
                        setIsEditingImage(false);
                        setEditingImageType(null);
                      }}
                      className="btn-primary py-2 px-6"
                    >
                      Upload
                    </button>
                    <button
                      onClick={() => {
                        // cancel
                        if (editingImageType === 'avatar') {
                          setAvatarFile(null);
                          setAvatarPreview(null);
                        } else {
                          setCoverFile(null);
                          setCoverPreview(null);
                        }
                        setIsEditingImage(false);
                        setEditingImageType(null);
                      }}
                      className="glass-button text-slate-500 hover:text-slate-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Profile Header Section */}
          <div className="flex flex-col md:flex-row gap-8 mb-8">
            {/* Avatar */}
            <div className="flex flex-col items-center md:items-start group">
              <div className="relative -mt-40 w-40 h-40 md:w-48 md:h-48 rounded-3xl p-1 glass-panel flex-shrink-0 transition-transform duration-500 hover:scale-105">
                <div className="w-full h-full rounded-2xl overflow-hidden relative">
                  {avatarPreview || profile.avatar ? (
                    <img
                      src={avatarPreview || resolveImageUrl(profile.avatar) || '/placeholder-avatar.png'}
                      alt={profile.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-7xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      👤
                    </div>
                  )}
                  {((isOwnProfile && isEditing) || (!!currentUser && !isEditingImage)) && (
                    <>
                      <button
                        onClick={() => {
                          setEditingImageType('avatar');
                          avatarInputRef.current?.click();
                        }}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                      >
                        📷
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </>
                  )}
                </div>
              </div>

              {isOwnProfile && isEditing && (
                <div className="mt-4">
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className="glass-button text-xs py-1.5 px-3"
                  >
                    📸 Change Image
                  </button>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left pt-2">
              {isEditing ? (
                <div className="space-y-4 max-w-md">
                  <input
                    type="text"
                    value={editForm.fullName || ''}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="input-field text-2xl font-bold"
                    placeholder="Full Name"
                  />
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="input-field"
                    placeholder="Email"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold font-display mb-2 text-gradient-gold inline-block">
                    {profile.fullName || profile.username}
                  </h1>
                  <p className={`text-lg font-medium mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    @{profile.username}
                  </p>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm opacity-80 mb-4">
                    <span className="flex items-center gap-1">📧 {profile.email}</span>
                    {profile.joinDate && (
                      <span className="flex items-center gap-1">
                        📅 Joined {new Date(profile.joinDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap justify-center md:justify-end md:ml-auto md:flex-col min-w-[200px]">
              {isOwnProfile ? (
                <>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-primary"
                    >
                      ✏️ Edit Profile
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3 w-full">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="btn-primary bg-emerald-500 hover:bg-emerald-600"
                      >
                        {isSaving ? '⏳ Saving...' : '💾 Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setAvatarPreview(null);
                          setCoverPreview(null);
                        }}
                        className="glass-button text-center"
                      >
                        ✕ Cancel
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={isLoadingFollow}
                  className={`btn-primary ${isFollowing ? 'bg-slate-600 border-slate-500' : ''}`}
                >
                  {isLoadingFollow ? '⏳' : (isFollowing ? '✓ Following' : '➕ Follow')}
                </button>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="flex justify-center md:justify-start gap-12 py-6 border-t border-white/10">
            <div className="text-center group cursor-pointer hover:scale-110 transition-transform">
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-violet-400 to-fuchsia-600">
                {posts.length}
              </p>
              <p className={`text-sm font-semibold tracking-wide uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Posts</p>
            </div>
            <div className="text-center group cursor-pointer hover:scale-110 transition-transform">
              <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-pink-600">
                {profile.followers?.length || 0}
              </p>
              <p className={`text-sm font-semibold tracking-wide uppercase ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Followers</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-8 mt-4 border-b border-white/10">
            {['posts', 'about'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-semibold transition-all duration-300 relative ${activeTab === tab
                  ? 'text-violet-500'
                  : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-t-full shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          {activeTab === 'about' && (
            <div className="glass-panel p-8 md:p-10 animate-fade-in">
              {isEditing ? (
                <div className="space-y-6 max-w-2xl">
                  <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Edit Details</h3>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio || ''}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      rows="4"
                      className="input-field resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={editForm.location || ''}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      className="input-field"
                      placeholder="Where are you from?"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Website
                    </label>
                    <input
                      type="url"
                      value={editForm.website || ''}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      className="input-field"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {profile.bio && (
                    <div>
                      <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        <span>📝</span> Bio
                      </h3>
                      <p className={`text-base leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {profile.bio}
                      </p>
                    </div>
                  )}

                  {profile.location && (
                    <div>
                      <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        <span>📍</span> Location
                      </h3>
                      <p className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {profile.location}
                      </p>
                    </div>
                  )}

                  {profile.website && (
                    <div>
                      <h3 className={`text-lg font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                        <span>🔗</span> Website
                      </h3>
                      <a
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-violet-500 hover:text-violet-400 font-medium break-all hover:underline transition-colors"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}

                  {!profile.bio && !profile.location && !profile.website && (
                    <div className="text-center py-12 border border-dashed border-white/20 rounded-2xl">
                      <p className={`text-lg ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        No additional information added yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="space-y-6">
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <div key={post._id} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                    <PostCard
                      post={post}
                      onPostDeleted={handlePostDeleted}
                      currentUserId={currentUser?._id}
                    />
                  </div>
                ))
              ) : (
                <div className={`glass-panel text-center py-16 border-dashed border-2 ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}>
                  <div className="text-6xl mb-4 opacity-50">📝</div>
                  <p className="text-xl font-semibold opacity-80 mb-2">
                    No posts yet
                  </p>
                  <p className="text-sm opacity-60">
                    Start creating posts to share with your followers!
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
