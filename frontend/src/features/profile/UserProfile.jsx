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
    <div className={`min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'} transition-colors duration-300`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${isDarkMode ? 'bg-indigo-600' : 'bg-indigo-300'} animate-pulse-light`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${isDarkMode ? 'bg-purple-600' : 'bg-purple-300'} floating-element-slow`}></div>
      </div>

      {/* Cover Image */}
      <div className="relative h-64 md:h-96 w-full overflow-hidden group animate-fadeInDown transition-all duration-300">
        {coverPreview || profile.coverImage ? (
          <img 
            src={coverPreview || resolveImageUrl(profile.coverImage) || '/placeholder-cover.jpg'} 
            alt="Cover" 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-r transition-all duration-300 ${isDarkMode ? 'from-indigo-900 via-purple-900 to-pink-900' : 'from-indigo-400 via-purple-400 to-pink-400'}`}></div>
        )}
        <div className="absolute inset-0 bg-black/30 transition-opacity duration-300"></div>
        
        {(isOwnProfile && isEditing) || (!!currentUser && !isEditingImage) ? (
          <>
            <button 
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-6 right-6 bg-black/60 hover:bg-black/80 text-white px-6 py-3 rounded-xl backdrop-blur-md transition-all flex items-center gap-2 z-20 font-semibold shadow-2xl hover:shadow-3xl hover:scale-105"
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-28 z-10">
        <div className={`rounded-3xl shadow-2xl backdrop-blur-xl p-8 md:p-12 border animate-slideUp transition-all duration-500 hover:shadow-3xl ${isDarkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/95 border-slate-200'}`}>
          {error && (
            <ErrorBox message={error} onDismiss={() => setError(null)} variant="error" />
          )}

          {isEditingImage ? (
            <div className={`rounded-2xl p-6 mb-6 ${isDarkMode ? 'bg-slate-900/70 border-slate-700' : 'bg-white/95 border-slate-200'} border`}>
              <h3 className="text-lg font-semibold mb-4">Confirm Image Upload</h3>
              <div className="flex items-center gap-6">
                {editingImageType === 'avatar' && avatarPreview && (
                  <img src={avatarPreview} alt="Avatar preview" className="w-36 h-36 rounded-2xl object-cover" />
                )}
                {editingImageType === 'cover' && coverPreview && (
                  <img src={coverPreview} alt="Cover preview" className="w-60 h-36 rounded-2xl object-cover" />
                )}
                <div className="flex-1">
                  <p className="mb-4">You're about to update the user's {editingImageType} image.</p>
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        await handleSaveProfile();
                        setIsEditingImage(false);
                        setEditingImageType(null);
                      }}
                      className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg"
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
                      className={`px-6 py-2 rounded-lg ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-slate-100'}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          
          {/* Profile Header Section */}
          <div className="flex flex-col md:flex-row gap-8 mb-8 animate-fadeInUp" style={{animationDelay: '0.15s'}}>
            {/* Avatar */}
            <div className="flex flex-col items-center md:items-start">
              <div className={`relative -mt-32 md:-mt-40 w-40 h-40 md:w-48 md:h-48 rounded-3xl border-4 border-indigo-500 shadow-2xl overflow-hidden flex-shrink-0 transition-all duration-500 hover:shadow-3xl hover:border-purple-500 hover:scale-105 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                {avatarPreview || profile.avatar ? (
                  <img 
                    src={avatarPreview || resolveImageUrl(profile.avatar) || '/placeholder-avatar.png'} 
                    alt={profile.username} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center text-7xl ${isDarkMode ? 'bg-gradient-to-br from-slate-700 to-slate-800' : 'bg-gradient-to-br from-slate-100 to-slate-200'}`}>
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
                      className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold opacity-0 hover:opacity-100 transition-opacity"
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

              {isOwnProfile && isEditing && (
                <div className="mt-3">
                  <button
                    onClick={() => avatarInputRef.current?.click()}
                    className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                  >
                    📸 Change Image
                  </button>
                </div>
              )}
            </div>

            {/* Profile Info */}

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.fullName || ''}
                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                    className={`text-4xl font-bold font-serif w-full rounded-xl px-4 py-3 transition-all ${isDarkMode ? 'bg-slate-700/50 border-slate-600 text-white focus:ring-indigo-500' : 'bg-slate-100 border-slate-300 text-slate-900 focus:ring-indigo-500'} border focus:outline-none focus:ring-2`}
                    placeholder="Full Name"
                  />
                  <input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className={`text-lg w-full rounded-xl px-4 py-3 transition-all ${isDarkMode ? 'bg-slate-700/50 border-slate-600 text-slate-300 focus:ring-purple-500' : 'bg-slate-100 border-slate-300 text-slate-600 focus:ring-purple-500'} border focus:outline-none focus:ring-2`}
                    placeholder="Email"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-4xl md:text-5xl font-bold font-serif mb-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {profile.fullName || profile.username}
                  </h1>
                  <p className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    @{profile.username}
                  </p>
                  <p className={`text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    📧 {profile.email}
                  </p>
                  {profile.joinDate && (
                    <p className={`text-sm mt-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>
                      📅 Joined {new Date(profile.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 flex-wrap justify-center md:justify-end md:ml-auto md:flex-col animate-fadeInUp" style={{animationDelay: '0.25s'}}>
              {isOwnProfile ? (
                <>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-white font-semibold rounded-xl shadow-lg"
                    >
                      ✏️ Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-3 flex-col">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-2xl hover:scale-105 transition-all duration-300 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving ? '⏳ Saving...' : '💾 Save'}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setAvatarPreview(null);
                          setCoverPreview(null);
                        }}
                        className={`px-8 py-3 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'} font-semibold rounded-xl transition-all shadow-lg`}
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
                  className={`px-8 py-3 font-semibold rounded-xl transition-all duration-300 shadow-lg hover:scale-105 ${isFollowing ? `${isDarkMode ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-200 text-slate-900 hover:bg-slate-300'}` : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:shadow-2xl'}`}
                >
                  {isLoadingFollow ? '⏳' : (isFollowing ? '✓ Following' : '➕ Follow')}
                </button>
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className={`flex flex-wrap justify-center md:justify-start gap-8 py-6 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} animate-fadeInUp`} style={{animationDelay: '0.35s'}}>
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {posts.length}
              </p>
              <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Posts</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {profile.followers?.length || 0}
              </p>
              <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Followers</p>
            </div>
          </div>
          
          {/* Tabs */}
          <div className={`flex gap-8 mt-10 border-b animate-fadeInUp transition-all duration-300 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`} style={{animationDelay: '0.45s'}}>
            {['posts', 'about'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-semibold transition-all duration-300 relative ${
                  activeTab === tab
                    ? 'text-indigo-600'
                    : (isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700')
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-t-full shadow-[0_-2px_10px_rgba(99,102,241,0.5)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8 pb-12">
          {activeTab === 'about' && (
            <div className={`rounded-3xl shadow-2xl backdrop-blur-xl p-8 md:p-10 border animate-fadeInUp ${isDarkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white/95 border-slate-200'}`} style={{animationDelay: '0.25s'}}>
              {isEditing ? (
                <div className="space-y-6 max-w-3xl">
                  <h3 className="text-2xl font-bold font-serif bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">Edit Your Profile</h3>
                  
                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Bio
                    </label>
                    <textarea
                      value={editForm.bio || ''}
                      onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                      rows="4"
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                        isDarkMode
                          ? 'bg-slate-700/50 border-slate-600 text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                          : 'bg-slate-100 border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                      } focus:outline-none resize-none`}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Location
                    </label>
                    <input
                      type="text"
                      value={editForm.location || ''}
                      onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                        isDarkMode
                          ? 'bg-slate-700/50 border-slate-600 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                          : 'bg-slate-100 border-slate-300 text-slate-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                      } focus:outline-none`}
                      placeholder="Where are you from?"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Website
                    </label>
                    <input
                      type="url"
                      value={editForm.website || ''}
                      onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                      className={`w-full px-4 py-3 rounded-xl border-2 transition-all ${
                        isDarkMode
                          ? 'bg-slate-700/50 border-slate-600 text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20'
                          : 'bg-slate-100 border-slate-300 text-slate-900 focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20'
                      } focus:outline-none`}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  {profile.bio && (
                    <div className="animate-fadeInUp" style={{animationDelay: '0.35s'}}>
                      <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>📝 Bio</h3>
                      <p className={`text-base leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {profile.bio}
                      </p>
                    </div>
                  )}
                  
                  {profile.location && (
                    <div className="animate-fadeInUp" style={{animationDelay: '0.45s'}}>
                      <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>📍 Location</h3>
                      <p className={`text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {profile.location}
                      </p>
                    </div>
                  )}
                  
                  {profile.website && (
                    <div className="animate-fadeInUp" style={{animationDelay: '0.55s'}}>
                      <h3 className={`text-lg font-bold mb-3 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>🔗 Website</h3>
                      <a
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 font-semibold break-all flex items-center gap-2 hover:underline transition-colors duration-300"
                      >
                        🔗 {profile.website}
                      </a>
                    </div>
                  )}

                  {!profile.bio && !profile.location && !profile.website && (
                    <div className="text-center py-12">
                      <p className={`text-lg ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
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
                  <div key={post._id} className="animate-fadeInUp" style={{animationDelay: `${0.2 + index * 0.08}s`}}>
                    <PostCard 
                      post={post} 
                      onPostDeleted={handlePostDeleted}
                      currentUserId={currentUser?._id}
                    />
                  </div>
                ))
              ) : (
                <div className={`text-center py-16 rounded-3xl border-2 border-dashed transition-all duration-300 hover:scale-102 ${isDarkMode ? 'border-slate-700 bg-slate-800/50 hover:bg-slate-700/50' : 'border-slate-300 bg-slate-100/50 hover:bg-slate-200/50'}`}>
                  <div className="text-6xl mb-4">📝</div>
                  <p className={`text-xl font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    No posts yet
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
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
