import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { userAPI } from './user.api';
import { chatAPI } from '../chat/chat.api';
import { useAuth } from '../auth/AuthContext';
import { resolveImageUrl } from '../../shared/utils/imageUrl';

export default function ConnectPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { user: me } = useAuth();

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

  const startChat = async (otherId) => {
    try {
      const response = await chatAPI.startConversation(otherId);
      if (response.data.success) {
        const conversation = response.data.data;
        navigate('/chat', { state: { conversationId: conversation._id } });
      }
    } catch (error) {
      console.error("Failed to start chat:", error);
      setError("Failed to start chat session");
    }
  };

  const startVideoCall = async (otherId) => {
    try {
      const response = await chatAPI.startConversation(otherId);
      if (response.data.success) {
        const conversation = response.data.data;
        navigate('/chat', {
          state: {
            conversationId: conversation._id,
            startVideoCall: true
          }
        });
      }
    } catch (error) {
      console.error("Failed to start video call:", error);
      setError("Failed to initiate video call");
    }
  };

  if (loading) return <div className="p-8 text-dark-400">Loading members...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fade-in text-white min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-bold font-serif mb-2">
          <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">Connect</span>
          <span className="ml-3 text-2xl font-medium text-dark-400">— Members</span>
        </h1>
        <p className="text-dark-300 max-w-2xl">Find and connect with fellow MBM members. Use chat for messages or start a video call.</p>
      </header>

      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center glass-panel p-4 rounded-xl">
        <div className="sm:col-span-2 relative">
          <input
            placeholder="Search by name, email or user id..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-dark-800/50 border border-dark-600 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none placeholder-dark-500 pl-11"
            aria-label="Search members"
          />
          <svg className="w-5 h-5 absolute left-3 top-3.5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div className="flex gap-3 justify-end">
          <Link to="/feed" className="px-4 py-3 rounded-lg border border-dark-600 text-dark-300 hover:text-white hover:bg-dark-700 transition-colors font-medium">Back to Feed</Link>
          <button onClick={() => setQuery('')} className="px-4 py-3 rounded-lg bg-dark-700 hover:bg-dark-600 text-white font-medium border border-dark-600 transition-colors">Clear</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.filter(u => u._id !== me?._id).map((u) => (
          <div key={u._id} className="glass-panel p-6 hover-scale-md group">
            <Link to={`/profile/${u._id}`} className="flex items-center gap-4 mb-4" aria-label={`View profile of ${u.fullName || u.username}`}>
              <div className="relative">
                <img src={resolveImageUrl(u.avatar) || '/placeholder-avatar.png'} alt={u.fullName || u.username} className="w-16 h-16 rounded-full object-cover border-2 border-dark-600 group-hover:border-primary-500 transition-colors" />
                <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-dark-800"></div>
              </div>
              <div>
                <div className="font-bold text-lg text-white group-hover:text-primary-400 transition-colors">{u.fullName || u.username}</div>
                <div className="text-sm text-dark-400"> Member</div>
              </div>
            </Link>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => startChat(u._id)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary-600/20 text-primary-400 hover:bg-primary-600/30 border border-primary-500/30 transition-all"
                aria-label={`Chat with ${u.fullName || u.username}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Chat
              </button>
              <button
                onClick={() => startVideoCall(u._id)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-dark-700 text-dark-300 hover:bg-dark-600 hover:text-white border border-dark-600 transition-all"
                aria-label={`Start video call with ${u.fullName || u.username}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Video
              </button>
            </div>
            <Link to={`/profile/${u._id}`} className="block mt-3 text-center text-sm text-dark-500 hover:text-primary-400 transition-colors">View Profile</Link>
          </div>
        ))}
      </div>

      {filtered.filter(u => u._id !== me?._id).length === 0 && (
        <div className="mt-12 p-8 text-center glass-panel rounded-xl border-dashed border-2 border-dark-700">
          <div className="text-4xl mb-3">🔍</div>
          <div className="text-dark-400 text-lg">No members match your search criteria.</div>
          <button onClick={() => setQuery('')} className="mt-4 text-primary-400 hover:text-primary-300 font-medium">Clear search filters</button>
        </div>
      )}
    </div>
  );
}
