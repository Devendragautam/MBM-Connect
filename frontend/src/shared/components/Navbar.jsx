import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { useDarkMode } from '../DarkModeContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();

  React.useEffect(() => {
    console.log('[Navbar] auth user changed', user);
  }, [user]);

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

  return (
    <nav className="border-b border-dark-700/50 sticky top-0 z-50 glass-effect bg-dark-900/80 backdrop-blur-md shadow-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group animate-fadeInUp">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md group-hover:scale-105 transition-all duration-300">
              <span className="text-lg font-bold text-white">MB</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold bg-gradient-to-r from-primary-500 via-primary-400 to-secondary-400 bg-clip-text text-transparent leading-none">MBM</span>
              <span className="text-xl font-bold text-white leading-none">CONNECT</span>
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
                      className="px-4 py-2 rounded-lg text-slate-300 font-medium transition-all duration-300 hover:bg-dark-800 hover:text-primary-400 flex items-center gap-1 group animate-fadeInUp hover-scale"
                      style={{ animationDelay: `${0.05 + index * 0.08}s` }}
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform duration-300">{link.icon}</span>
                      <span className="hidden lg:inline">{link.name}</span>
                    </Link>
                  ))}
                </div>

                {/* User Menu */}
                <div className="flex items-center gap-4 border-l border-dark-700 pl-6 ml-6">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-white">{user?.fullName}</p>
                  </div>
                  {user?.avatar && (
                    <Link to={`/profile/${user._id}`} className="group flex-shrink-0 leading-none">
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover aspect-square border-2 border-primary-500 cursor-pointer group-hover:scale-110 group-hover:shadow-glow-sm transition-all duration-300"
                      />
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-700 text-white rounded-lg hover:shadow-lg hover:scale-105 font-semibold transition-all duration-300 border border-white/10"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-primary-400 hover:text-primary-300 font-semibold transition-colors hover-scale"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white rounded-lg font-semibold hover:shadow-glow-md hover:scale-105 transition-all duration-300 border border-white/10"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg transition-all duration-300 hover:bg-dark-800 text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-dark-700/50 bg-dark-900/95 backdrop-blur-xl pb-4 animate-slideDown shadow-lg">
            {isAuthenticated ? (
              <>
                <div className="py-4 space-y-1">
                  {navLinks.map((link, index) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-3 rounded-lg transition-all duration-300 font-medium animate-slideUp text-slate-300 hover:bg-dark-800 hover:text-primary-400"
                      style={{ animationDelay: `${0.05 + index * 0.08}s` }}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.name}
                    </Link>
                  ))}
                  <Link
                    to={`/profile/${user._id}`}
                    onClick={() => setIsOpen(false)}
                    className="block px-4 py-3 rounded-lg transition-all duration-300 font-medium animate-slideUp text-slate-300 hover:bg-dark-800 hover:text-primary-400"
                  >
                    <span className="mr-2">👤</span>
                    My Profile
                  </Link>
                </div>

                <div className="border-t border-dark-700 pt-4 px-4">
                  <div className="flex items-center gap-3 mb-4">
                    {user?.avatar && (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover aspect-square border-2 border-primary-500 flex-shrink-0"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-sm text-white">{user?.fullName}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-pink-700 text-white rounded-lg hover:shadow-lg font-semibold transition-all border border-white/10"
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
                  className="block px-4 py-3 rounded-lg font-semibold transition-all duration-300 animate-slideUp text-primary-400 hover:bg-dark-800"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-500 text-white rounded-lg font-semibold text-center animate-slideUp border border-white/10"
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
