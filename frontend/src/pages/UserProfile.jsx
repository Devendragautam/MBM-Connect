import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import apiClient from '../services/apiClient';

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/user/${userId}`);
      setProfile(response.data.data || response.data);
      
      // Check if current user is following this user
      if (currentUser?._id !== userId && response.data.data?.followers?.includes(currentUser?._id)) {
        setIsFollowing(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const endpoint = isFollowing ? `/api/user/${userId}/unfollow` : `/api/user/${userId}/follow`;
      await apiClient.post(endpoint);
      setIsFollowing(!isFollowing);
      // Refresh profile to update follower count
      fetchProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating follow status');
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      const response = await apiClient.put(`/api/user/${userId}/profile`, editData);
      setProfile(response.data.data || response.data);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-secondary-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent mx-auto mb-4"></div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-secondary-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
          >
            Go Back
          </button>
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
    <div className={`min-h-screen ${isDarkMode ? 'bg-secondary-900' : 'bg-gray-50'} transition-colors duration-300`}>
      {/* Cover Image */}
      <div className={`h-64 ${isDarkMode ? 'bg-gradient-dark' : 'bg-gradient-primary'} relative`}>
        {isOwnProfile && isEditing && (
          <button className="absolute top-4 right-4 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
            📷 Change Cover
          </button>
        )}
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className={`${isDarkMode ? 'bg-secondary-800' : 'bg-white'} rounded-lg shadow-lg -mt-20 relative z-10 p-6 md:p-8`}>
          <div className="flex flex-col md:flex-row md:items-end md:gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0 mb-4 md:mb-0">
              <img
                src={profile.avatar || 'https://via.placeholder.com/200'}
                alt={profile.fullName}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-primary-500 object-cover shadow-lg"
              />
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className={`text-3xl md:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {profile.fullName}
                  </h1>
                  <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    @{profile.username}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {!isOwnProfile && (
                    <button
                      onClick={handleFollowToggle}
                      className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                        isFollowing
                          ? `${isDarkMode ? 'bg-secondary-700 text-white border-2 border-primary-500' : 'bg-gray-200 text-gray-900'}`
                          : 'bg-gradient-primary text-white hover:shadow-lg'
                      }`}
                    >
                      {isFollowing ? '✓ Following' : '+ Follow'}
                    </button>
                  )}
                  {isOwnProfile && !isEditing && (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditData(profile);
                      }}
                      className="px-6 py-2 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 transition-all"
                    >
                      Edit Profile
                    </button>
                  )}
                  {isEditing && (
                    <>
                      <button
                        onClick={handleSaveProfile}
                        className="px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-all"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className={`px-6 py-2 ${isDarkMode ? 'bg-secondary-700' : 'bg-gray-300'} text-white rounded-lg font-semibold hover:opacity-80 transition-all`}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-secondary-700">
            <div className="text-center">
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile.postsCount || 0}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Posts</p>
            </div>
            <div className="text-center cursor-pointer hover:opacity-80">
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile.followers?.length || 0}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Followers</p>
            </div>
            <div className="text-center cursor-pointer hover:opacity-80">
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {profile.following?.length || 0}
              </p>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Following</p>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className={`${isDarkMode ? 'bg-secondary-800' : 'bg-white'} rounded-lg shadow-lg mt-6 p-6 md:p-8`}>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={editData.fullName || ''}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDarkMode
                      ? 'bg-secondary-700 border-secondary-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } focus:outline-none focus:border-primary-500`}
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
                  } focus:outline-none focus:border-primary-500 resize-none`}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Website
                </label>
                <input
                  type="text"
                  name="website"
                  value={editData.website || ''}
                  onChange={handleEditChange}
                  className={`w-full px-4 py-2 rounded-lg border-2 ${
                    isDarkMode
                      ? 'bg-secondary-700 border-secondary-600 text-white'
                      : 'bg-gray-50 border-gray-300 text-gray-900'
                  } focus:outline-none focus:border-primary-500`}
                  placeholder="https://example.com"
                />
              </div>
            </div>
          ) : (
            <div>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Bio</h2>
              <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                {profile.bio || 'No bio added yet'}
              </p>
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:text-primary-600 font-medium break-all"
                >
                  🔗 {profile.website}
                </a>
              )}
            </div>
          )}
        </div>

        {/* Posts Grid Section */}
        <div className={`${isDarkMode ? 'bg-secondary-800' : 'bg-white'} rounded-lg shadow-lg mt-6 p-6 md:p-8`}>
          <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Posts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Placeholder for posts */}
            <div className={`aspect-square rounded-lg ${isDarkMode ? 'bg-secondary-700' : 'bg-gray-100'} flex items-center justify-center`}>
              <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No posts yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
