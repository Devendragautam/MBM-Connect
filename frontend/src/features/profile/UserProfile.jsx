import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { userAPI } from './user.api';

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeTab, setActiveTab] = useState('posts');

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUserProfile(userId);
      setProfile(response.data.data);
      setEditForm(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append(type, file);

      const response = await userAPI.updateProfile(userId, formData);
      setProfile(response.data.data);
      setEditForm(response.data.data);
    } catch (err) {
      setError('Error uploading image');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await userAPI.updateProfile(userId, editForm);
      setProfile(response.data.data);
      setIsEditing(false);
    } catch (err) {
      setError('Error updating profile');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-dark-900">
      <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen bg-dark-900">
      <div className="text-red-500 text-xl font-semibold bg-red-500/10 px-6 py-4 rounded-xl border border-red-500/20">
        Error: {error}
      </div>
    </div>
  );

  if (!profile) return null;

  const isOwnProfile = currentUser?._id === profile._id;

  return (
    <div className="min-h-screen bg-dark-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Profile Header Card */}
        <div className="glass-panel overflow-hidden relative group">
          {/* Cover Image */}
          <div className="h-64 md:h-80 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-900/90 z-10 transition-opacity duration-300 group-hover:to-dark-900/70"></div>
            {profile.coverImage ? (
              <img
                src={profile.coverImage}
                alt="Cover"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-primary-900 via-dark-800 to-secondary-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}></div>
              </div>
            )}

            {isOwnProfile && (
              <button
                onClick={() => coverInputRef.current?.click()}
                className="absolute top-4 right-4 z-20 bg-dark-900/60 hover:bg-dark-800 text-white p-2 rounded-lg backdrop-blur-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 border border-white/10"
              >
                📷 Edit Cover
              </button>
            )}
          </div>

          <div className="px-8 pb-8 relative z-20">
            <div className="flex flex-col md:flex-row items-end -mt-20 mb-6 gap-6">
              {/* Avatar */}
              <div className="relative group/avatar">
                <div className="w-40 h-40 md:w-48 md:h-48 rounded-3xl p-1 bg-dark-900 shadow-2xl relative z-10 overflow-hidden">
                  <img
                    src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.fullName}&background=6366f1&color=fff`}
                    alt={profile.fullName}
                    className="w-full h-full rounded-2xl object-cover border-4 border-dark-800"
                  />
                  {isOwnProfile && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-300 rounded-3xl cursor-pointer"
                      onClick={() => avatarInputRef.current?.click()}>
                      <span className="text-white text-3xl">📷</span>
                    </div>
                  )}
                </div>
                {/* Online Status Indicator */}
                <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 border-4 border-dark-900 rounded-full z-20 animate-pulse"></div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 mb-2 text-center md:text-left">
                {isEditing ? (
                  <div className="space-y-4 animate-fade-in">
                    <input
                      type="text"
                      value={editForm.fullName || ''}
                      onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                      className="input-field text-2xl font-bold bg-dark-800/50"
                      placeholder="Full Name"
                    />
                    <input
                      type="text"
                      value={editForm.headline || ''}
                      onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                      className="input-field text-lg bg-dark-800/50"
                      placeholder="Headline"
                    />
                  </div>
                ) : (
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">{profile.fullName}</h1>
                    <p className="text-xl text-primary-400 font-medium mb-2">{profile.headline || 'No headline yet'}</p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start text-dark-300">
                      <span className="flex items-center gap-1">📍 {profile.location || 'Location not set'}</span>
                      <span className="flex items-center gap-1">💼 {profile.role || 'Member'}</span>
                      <span className="flex items-center gap-1">📅 Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-4">
                {isOwnProfile ? (
                  isEditing ? (
                    <>
                      <button
                        onClick={handleUpdateProfile}
                        className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700 border-green-500/30"
                      >
                        ✅ Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-6 py-3 rounded-lg bg-dark-700 hover:bg-dark-600 text-white font-semibold transition-all border border-dark-600"
                      >
                        ❌ Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-primary flex items-center gap-2"
                    >
                      ✏️ Edit Profile
                    </button>
                  )
                ) : (
                  <button className="btn-primary flex items-center gap-2">
                    👋 Connect
                  </button>
                )}
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex gap-8 border-b border-dark-700 overflow-x-auto">
              {['posts', 'about', 'connections', 'media'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-lg font-medium capitalize transition-all duration-300 relative ${activeTab === tab
                    ? 'text-primary-400'
                    : 'text-dark-400 hover:text-white'
                    }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-t-full shadow-[0_-2px_10px_rgba(99,102,241,0.5)]"></div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'about' && (
              <div className="glass-panel p-8 animate-fade-in">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">📝</span> About
                </h3>
                {isEditing ? (
                  <textarea
                    value={editForm.bio || ''}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="input-field min-h-[150px] bg-dark-800/50"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-dark-200 leading-relaxed text-lg">
                    {profile.bio || 'No bio added yet. Click edit to tell your story!'}
                  </p>
                )}

                <div className="mt-8 pt-8 border-t border-dark-700">
                  <h4 className="font-bold text-white mb-4">Skills & Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Node.js', 'UI Design', 'System Architecture', 'Leadership'].map((skill, i) => (
                      <span key={i} className="px-3 py-1 rounded-full bg-dark-800 text-primary-300 text-sm border border-primary-500/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div className="text-center py-12 glass-panel border-dashed border-2 border-dark-700 bg-transparent">
                <div className="text-5xl mb-4 opacity-50">📭</div>
                <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
                <p className="text-dark-400">Share your thoughts with the community!</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="glass-panel p-6">
              <h3 className="text-lg font-bold text-white mb-6">Profile Stats</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 text-dark-300 group-hover:text-white transition-colors">
                    <span className="p-2 rounded-lg bg-dark-800 text-xl">👀</span>
                    Profile Views
                  </div>
                  <span className="font-bold text-white">1,234</span>
                </div>
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 text-dark-300 group-hover:text-white transition-colors">
                    <span className="p-2 rounded-lg bg-dark-800 text-xl">🕸️</span>
                    Connections
                  </div>
                  <span className="font-bold text-white">500+</span>
                </div>
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3 text-dark-300 group-hover:text-white transition-colors">
                    <span className="p-2 rounded-lg bg-dark-800 text-xl">⭐</span>
                    Reputation
                  </div>
                  <span className="font-bold text-primary-400">High</span>
                </div>
              </div>
            </div>

            {/* Experience Placeholder */}
            <div className="glass-panel p-6">
              <h3 className="text-lg font-bold text-white mb-4">Experience</h3>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-lg bg-dark-800 flex items-center justify-center text-2xl border border-dark-700">
                      🏢
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Senior Developer</h4>
                      <p className="text-xs text-dark-400">Tech Corp • 2020 - Present</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Inputs */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={(e) => handleImageUpload(e, 'avatar')}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={coverInputRef}
        onChange={(e) => handleImageUpload(e, 'coverImage')}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}
