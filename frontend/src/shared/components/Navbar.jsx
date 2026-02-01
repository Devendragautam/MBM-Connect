import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { useDarkMode } from '../DarkModeContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
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
    { name: 'Market', path: '/market', icon: '🛍️' },
    { name: 'Stories', path: '/stories', icon: '📖' },
    { name: 'Chat', path: '/chat', icon: '💬' },
  ];

  return (
    <nav className="bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-700 sticky top-0 z-50 backdrop-blur-xl bg-opacity-95 shadow-md-light dark:shadow-2xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-instagram rounded-lg flex items-center justify-center shadow-md-light group-hover:shadow-lg-light transition-all">
              <span className="text-lg font-bold text-white">MB</span>
            </div>
            <span className="text-xl font-display font-bold bg-gradient-instagram bg-clip-text text-transparent hidden sm:inline">MBM Connect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-6">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors group flex items-center gap-1"
                    >
                      <span>{link.icon}</span>
                      <span className="group-hover:text-gradient">{link.name}</span>
                    </Link>
                  ))}
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-4 border-l border-secondary-200 dark:border-secondary-700 pl-6">
                  <div className="text-right">
                    <p className="text-sm font-semibold text-secondary-900 dark:text-white">{user?.fullName}</p>
                    <p className="text-xs text-secondary-500 dark:text-secondary-400">{user?.email}</p>
                  </div>
                  {user?.avatar && (
                    <Link to={`/profile/${user._id}`}>
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-primary-200 dark:border-primary-500 cursor-pointer hover:scale-110 transition-transform"
                      />
                    </Link>
                  )}
                  
                  {/* Dark Mode Toggle */}
                  <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-secondary-800 hover:bg-gray-200 dark:hover:bg-secondary-700 transition-colors ml-2"
                  >
                    {isDarkMode ? '☀️' : '🌙'}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="ml-4 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 font-semibold transition-all hover:shadow-md-light dark:hover:shadow-lg"
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
                  className="p-2 rounded-lg bg-gray-100 dark:bg-secondary-800 hover:bg-gray-200 dark:hover:bg-secondary-700 transition-colors"
                >
                  {isDarkMode ? '☀️' : '🌙'}
                </button>
                
                <Link
                  to="/login"
                  className="px-4 py-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg-light transition-all"
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
              className="p-2 rounded-lg bg-gray-100 dark:bg-secondary-800 hover:bg-gray-200 dark:hover:bg-secondary-700 transition-colors"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
            >
              <svg className="w-6 h-6 text-secondary-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-secondary-200 dark:border-secondary-700 pb-4 animate-slide-down">
            {isAuthenticated ? (
              <>
                <div className="py-4 space-y-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-secondary-800 rounded-lg transition-colors font-medium"
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.name}
                    </Link>
                  ))}
                  <Link
                    to={`/profile/${user._id}`}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-secondary-700 dark:text-secondary-300 hover:bg-primary-50 dark:hover:bg-secondary-800 rounded-lg transition-colors font-medium"
                  >
                    <span className="mr-2">👤</span>
                    My Profile
                  </Link>
                </div>

                <div className="border-t border-secondary-200 dark:border-secondary-700 pt-4 px-4">
                  <div className="flex items-center gap-3 mb-4">
                    {user?.avatar && (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-secondary-900 dark:text-white text-sm">{user?.fullName}</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 font-semibold transition-all"
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
                  className="block px-4 py-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-secondary-800 rounded-lg font-semibold transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 bg-gradient-primary text-white rounded-lg font-semibold text-center"
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
