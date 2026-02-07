import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { useDarkMode } from '../DarkModeContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  React.useEffect(() => {
    console.log('[Navbar] auth user changed', user);
  }, [user]);
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const navLinks = [
    { name: 'Feed', path: '/feed', icon: '📰' },
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Connect', path: '/connect', icon: '🔗' },
    { name: 'Market', path: '/market', icon: '🛍️' },
    { name: 'Stories', path: '/stories', icon: '📖' },
    { name: 'Chat', path: '/chat', icon: '💬' },
  ];

  const bgClass = isDarkMode 
    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800'
    : 'bg-gradient-to-br from-white via-slate-50 to-blue-50';

  return (
    <nav className={`${bgClass} border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 backdrop-blur-xl bg-opacity-95 shadow-2xl transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group animate-fadeInUp">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-3xl group-hover:scale-105 transition-all duration-300">
              <span className="text-lg font-bold text-white">MB</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-none">MBM</span>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-none">CONNECT</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-1">
                  {navLinks.map((link, index) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 font-medium transition-all duration-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-purple-400 flex items-center gap-1 group animate-fadeInUp hover-scale`}
                      style={{ animationDelay: `${0.05 + index * 0.08}s` }}
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform duration-300">{link.icon}</span>
                      <span className="hidden lg:inline">{link.name}</span>
                    </Link>
                  ))}
                </div>

                {/* User Menu */}
                <div className={`flex items-center gap-4 border-l ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} pl-6 ml-6`}>
                  <div className="text-right hidden sm:block">
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.fullName}</p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{user?.email}</p>
                  </div>
                  {user?.avatar && (
                    <Link to={`/profile/${user._id}`} className="group">
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500 dark:border-purple-500 cursor-pointer group-hover:scale-110 group-hover:shadow-lg transition-all duration-300"
                      />
                    </Link>
                  )}
                  
                  {/* Dark Mode Toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className={`p-2 rounded-lg font-semibold transition-all duration-300 hover-scale ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                  >
                    {isDarkMode ? '☀️' : '🌙'}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:shadow-2xl hover:scale-105 font-semibold transition-all duration-300"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className={`p-2 rounded-lg font-semibold transition-all duration-300 hover-scale ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
                
                <Link
                  to="/login"
                  className="px-4 py-2 text-indigo-600 dark:text-purple-400 hover:text-indigo-700 dark:hover:text-purple-300 font-semibold transition-colors hover-scale"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg font-semibold transition-all duration-300 hover-scale ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'hover:bg-slate-800 text-white' : 'hover:bg-slate-100 text-slate-900'}`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className={`md:hidden border-t ${isDarkMode ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-white/50'} pb-4 animate-slideDown`}>
            {isAuthenticated ? (
              <>
                <div className="py-4 space-y-1">
                  {navLinks.map((link, index) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 rounded-lg transition-all duration-300 font-medium animate-slideUp ${isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-purple-400' : 'text-slate-700 hover:bg-slate-100 hover:text-indigo-600'}`}
                      style={{ animationDelay: `${0.05 + index * 0.08}s` }}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.name}
                    </Link>
                  ))}
                  <Link
                    to={`/profile/${user._id}`}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-lg transition-all duration-300 font-medium animate-slideUp ${isDarkMode ? 'text-slate-300 hover:bg-slate-800 hover:text-purple-400' : 'text-slate-700 hover:bg-slate-100 hover:text-indigo-600'}`}
                  >
                    <span className="mr-2">👤</span>
                    My Profile
                  </Link>
                </div>

                <div className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} pt-4 px-4`}>
                  <div className="flex items-center gap-3 mb-4">
                    {user?.avatar && (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-indigo-500"
                      />
                    )}
                    <div>
                      <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{user?.fullName}</p>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:shadow-lg font-semibold transition-all"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="py-4 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 rounded-lg font-semibold transition-all duration-300 animate-slideUp ${isDarkMode ? 'text-purple-400 hover:bg-slate-800' : 'text-indigo-600 hover:bg-slate-100'}`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg font-semibold text-center animate-slideUp"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
