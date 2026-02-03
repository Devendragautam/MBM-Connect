import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useDarkMode } from '../../shared/DarkModeContext';
import { userAPI } from '../user/user.api';
import { feedAPI } from '../feed/feed.api';
import { Loader, Button, Input } from '../../shared/ui';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const fileInputRef = useRef(null);
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
        
        // Check if current user is following this user
        if (currentUser?._id !== userId && response.data.data?.followers?.includes(currentUser?._id)) {
          setIsFollowing(true);
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
        setPosts(response.data.data.posts || []);
      }
    } catch (err) {
      console.error('Error fetching user posts:', err);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      let response;
      if (endpoint === 'follow') {
        response = await userAPI.followUser(userId);
      } else {
        response = await userAPI.unfollowUser(userId);
      }
      
      if (response.data.success) {
        setIsFollowing(!isFollowing);
        fetchProfile();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating follow status');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    try {
      const formData = new FormData();
      if (editData.fullName) formData.append('fullName', editData.fullName);
      if (editData.bio) formData.append('bio', editData.bio);
      if (editData.website) formData.append('website', editData.website);
      if (avatarFile) formData.append('avatar', avatarFile);
      if (coverFile) formData.append('coverImage', coverFile);

      const response = await userAPI.updateProfile(userId, formData);
      if (response.data.success) {
        const updatedProfileData = response.data.data;
        setProfile(updatedProfileData);
        setIsEditing(false);
        setError(null);

        // If the updated profile is the current user's, update the auth context
        if (currentUser?._id === userId) {
          updateUser(updatedProfileData);
        }
      } else {
        setError(response.data.message || 'Error updating profile');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    }
  };

  const handlePostDeleted = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  if (loading) return <Loader text="Loading profile..." fullScreen />;

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-secondary-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-secondary-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Profile not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === userId;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-secondary-900 text-white' : 'bg-gray-50 text-gray-900'} transition-colors duration-300`}>
      {/* Cover Image */}
      <div className="relative h-60 md:h-80 w-full overflow-hidden group">
        {coverPreview || profile.coverImage ? (
          <img 
            src={coverPreview || profile.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full ${isDarkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-blue-400 to-purple-500'}`}></div>
        )}
        <div className="absolute inset-0 bg-black/20"></div>
        
        {isOwnProfile && isEditing && (
          <>
            <button 
              onClick={() => coverInputRef.current?.click()}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-all flex items-center gap-2 z-20"
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
        )}
      </div>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 z-10">
        <div className={`rounded-2xl shadow-2xl p-6 md:p-8 ${isDarkMode ? 'bg-secondary-800/95 backdrop-blur' : 'bg-white/95 backdrop-blur'}`}>
          
          {/* Header: Avatar & Info */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative -mt-20 md:-mt-24 mx-auto md:mx-0 flex-shrink-0">
              <div className={`p-1.5 rounded-full ${isDarkMode ? 'bg-secondary-800' : 'bg-white'}`}>
                <img
                  src={avatarPreview || profile.avatar || 'https://via.placeholder.com/200'}
                  alt={profile.fullName}
                  className="w-32 h-32 md:w-44 md:h-44 rounded-full object-cover border-4 border-transparent shadow-md"
                />
                {isOwnProfile && isEditing && (
                  <>
                    <div 
                      className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span className="text-white text-sm font-semibold">Change</span>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left w-full mt-2">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{profile.fullName}</h1>
                  <p className={`text-lg font-medium ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>@{profile.username}</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {!isOwnProfile && (
                    <Button
                      onClick={handleFollowToggle}
                      className={`rounded-full px-8 shadow-lg ${
                        isFollowing
                          ? 'bg-gray-500 hover:bg-gray-600'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isFollowing ? '✓ Following' : '+ Follow'}
                    </Button>
                  )}
                  {isOwnProfile && !isEditing && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(true);
                        setEditData(profile);
                        setAvatarFile(null);
                        setAvatarPreview(null);
                        setCoverFile(null);
                        setCoverPreview(null);
                        setActiveTab('about');
                      }}
                      className="rounded-full px-6 border-2 font-semibold"
                    >
                      Edit Profile
                    </Button>
                  )}
                  {isEditing && (
                    <>
                      <Button
                        onClick={handleSaveProfile}
                        className="rounded-full px-6 bg-green-600 hover:bg-green-700"
                      >
                        Save
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setIsEditing(false);
                          setAvatarPreview(null);
                          setAvatarFile(null);
                          setCoverFile(null);
                          setCoverPreview(null);
                        }}
                        className="rounded-full px-6"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Simple Stats (No Followers/Following) */}
              <div className={`flex flex-wrap justify-center md:justify-start gap-6 mt-6 text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📝</span> {profile.postsCount || posts.length || 0} Posts
                </div>
              </div>
            </div>
          </div>
          
          {/* Tabs */}
          <div className={`flex mt-10 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {['Posts', 'About'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-6 py-4 font-semibold text-sm transition-all relative ${
                  activeTab === tab.toLowerCase()
                    ? 'text-blue-500'
                    : (isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-800')
                }`}
              >
                {tab.toUpperCase()}
                {activeTab === tab.toLowerCase() && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-8 pb-12">
          {activeTab === 'about' && (
            <div className={`rounded-2xl shadow-lg p-6 md:p-8 ${isDarkMode ? 'bg-secondary-800' : 'bg-white'}`}>
              {isEditing ? (
                <div className="space-y-6 max-w-2xl">
                  <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
                  <div>
                    <Input
                      label="Full Name"
                      type="text"
                      name="fullName"
                      value={editData.fullName || ''}
                      onChange={handleEditChange}
                      className={isDarkMode ? 'bg-secondary-700 border-secondary-600 text-white' : ''}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={editData.bio || ''}
                      onChange={handleEditChange}
                      rows="4"
                      className={`w-full px-4 py-2 rounded-lg border-2 ${
                        isDarkMode
                          ? 'bg-secondary-700 border-secondary-600 text-white'
                          : 'bg-gray-50 border-gray-300 text-gray-900'
                      } focus:outline-none focus:border-blue-500 resize-none`}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div>
                    <Input
                      label="Website"
                      type="text"
                      name="website"
                      value={editData.website || ''}
                      onChange={handleEditChange}
                      className={isDarkMode ? 'bg-secondary-700 border-secondary-600 text-white' : ''}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Bio</h3>
                    <p className={`text-lg leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      {profile.bio || 'No bio added yet.'}
                    </p>
                  </div>
                  {profile.website && (
                    <div>
                      <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Website</h3>
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 font-medium break-all flex items-center gap-2"
                      >
                        🔗 {profile.website}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="grid grid-cols-1 gap-6">
              {posts.length > 0 ? (
                posts.map(post => (
                  <PostCard 
                    key={post._id} 
                    post={post} 
                    onPostDeleted={handlePostDeleted}
                    currentUserId={currentUser?._id}
                  />
                ))
              ) : (
                <div className={`text-center py-16 rounded-2xl border-2 border-dashed ${isDarkMode ? 'border-gray-700 bg-secondary-800/50' : 'border-gray-300 bg-white/50'}`}>
                  <div className="text-5xl mb-4">📝</div>
                  <p className={`text-xl font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No posts to display yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
