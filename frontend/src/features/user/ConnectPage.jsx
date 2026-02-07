import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI } from './user.api';
import { useAuth } from '../auth/AuthContext';
import { useDarkMode } from '../../shared/DarkModeContext';
import { resolveImageUrl } from '../../shared/utils/imageUrl';

export default function ConnectPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await userAPI.getAllUsers();
        if (mounted) setUsers(res?.data?.data || []);
      } catch (err) {
        setError('Failed to load members');
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => (u.fullName || u.username || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || u._id?.includes(q));
  }, [users, query]);

  const startChat = (otherId) => {
    navigate(`/chat?userId=${otherId}`);
  };

  const startVideoCall = (otherId) => {
    const target = users.find(u => u._id === otherId);
    alert(`(placeholder) Start video call with ${target?.fullName || otherId}`);
  };

  if (loading) return <div className="p-8">Loading members...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className={`max-w-6xl mx-auto p-6 animate-fade-in ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
      <header className="mb-6">
        <h1 className="section-title">
          <span className="animated-gradient-text">Connect</span>
          <span className="ml-3 text-2xl font-medium text-slate-600">— Members</span>
        </h1>
        <p className="section-subtitle">Find and connect with fellow MBM members. Use chat for messages or start a video call.</p>
      </header>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div className="sm:col-span-2">
          <input
            placeholder="Search by name, email or user id..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="search-input"
            aria-label="Search members"
          />
        </div>
        <div className="flex gap-3 justify-end">
          <Link to="/feed" className="btn-secondary px-4 py-2">Back to Feed</Link>
          <button onClick={() => setQuery('')} className="btn-primary px-4 py-2">Clear</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.filter(u => u._id !== me?._id).map((u) => (
          <div key={u._id} className="member-card">
            <Link to={`/profile/${u._id}`} className="member-left" aria-label={`View profile of ${u.fullName || u.username}`}>
              <img src={resolveImageUrl(u.avatar) || '/placeholder-avatar.png'} alt={u.fullName || u.username} className="avatar-lg" />
              <div className="member-name">{u.fullName || u.username}</div>
            </Link>

            <div className="member-actions">
              <button
                onClick={() => startChat(u._id)}
                className="action-btn btn-chat"
                aria-label={`Chat with ${u.fullName || u.username}`}
              >
                Chat
              </button>
              <button
                onClick={() => startVideoCall(u._id)}
                className="action-btn btn-video"
                aria-label={`Start video call with ${u.fullName || u.username}`}
              >
                Video
              </button>
              <Link to={`/profile/${u._id}`} className="profile-link">Profile</Link>
            </div>
          </div>
        ))}
      </div>

      {filtered.filter(u => u._id !== me?._id).length === 0 && (
        <div className="mt-8 p-6 text-center text-slate-500">No members match your search.</div>
      )}
    </div>
  );
}
