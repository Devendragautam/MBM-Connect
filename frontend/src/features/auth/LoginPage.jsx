import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from './auth.api';
import { useAuth } from './AuthContext';
import { useDarkMode } from '../../shared/DarkModeContext';

const LoginPage = () => {
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, setToken } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.login(formData.email, formData.password);

      if (!response || !response.data) {
        throw new Error('Invalid response received from server');
      }

      if (response.data?.success) {
        const { token, user } = response.data.data;
        setToken(token);
        login(user);
        navigate('/dashboard');
      } else {
        setError(response.data?.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-12 ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${isDarkMode ? 'bg-indigo-600' : 'bg-indigo-300'} animate-pulse-light`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${isDarkMode ? 'bg-purple-600' : 'bg-purple-300'} floating-element-slow`}></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Brand section */}
        <div className="text-center mb-8 animate-fadeInUp">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl mb-4 hover:shadow-3xl hover:scale-105 transition-all duration-500">
            <span className="text-2xl font-bold text-white">MB</span>
          </div>
          <h1 className={`text-4xl font-bold font-serif mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Welcome Back
          </h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Sign in to your MBM Connect account</p>
        </div>

        {/* Login Card */}
        <div className={`rounded-3xl shadow-2xl backdrop-blur-xl p-8 animate-slideUp ${isDarkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-white/90 border border-slate-200'}`}>
          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 border-2 rounded-xl flex items-start gap-3 animate-slideDown ${isDarkMode ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
              <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDarkMode ? 'text-red-400' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <p className={`font-medium text-sm ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="group animate-fadeInUp" style={{ animationDelay: '0.15s' }}>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all pl-11 font-medium ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  } focus:outline-none`}
                  placeholder="you@example.com"
                  required
                />
                <svg className={`absolute left-3 top-3.5 w-5 h-5 transition-colors ${isDarkMode ? 'text-slate-400 group-focus-within:text-purple-400' : 'text-slate-500 group-focus-within:text-indigo-600'}`} fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            </div>

            {/* Password Field */}
            <div className="group animate-fadeInUp" style={{ animationDelay: '0.25s' }}>
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-all pl-11 font-medium ${
                    isDarkMode
                      ? 'bg-slate-700 border-slate-600 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
                  } focus:outline-none`}
                  placeholder="••••••••"
                  required
                />
                <svg className={`absolute left-3 top-3.5 w-5 h-5 transition-colors ${
                  isDarkMode
                    ? 'text-slate-400 group-focus-within:text-purple-400'
                    : 'text-slate-500 group-focus-within:text-indigo-600'
                }`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-3.5 transition-colors ${isDarkMode ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M15.171 13.576l1.473 1.473a1 1 0 001.414-1.414l-14-14a1 1 0 00-1.414 1.414l1.473 1.473A10.016 10.016 0 00.458 10C1.732 14.057 5.522 17 10 17a9.958 9.958 0 004.512-1.074l1.781 1.781a1 1 0 001.414-1.414l-1.473-1.473zM5.228 10a4 4 0 004.904 3.9c.693-.468 1.449-.981 2.168-1.495.726-.516 1.439-1.029 2.105-1.405a4 4 0 00-5.474-5.474l-.712.712a4.046 4.046 0 00-.87 1.284c-.304.692-.423 1.477-.195 2.394z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end animate-fadeInUp" style={{ animationDelay: '0.35s' }}>
              <Link to="/forgot-password" className={`text-sm font-medium transition-colors ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg hover:shadow-2xl hover:scale-105 font-semibold transition-all duration-300 flex items-center justify-center gap-2 animate-fadeInUp group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ animationDelay: '0.45s' }}
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6 animate-fadeInUp" style={{ animationDelay: '0.55s' }}>
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-600'}`}>Don't have an account?</span>
              </div>
            </div>

            {/* Signup Link */}
            <Link
              to="/signup"
              className={`block px-6 py-3 rounded-lg font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 animate-fadeInUp hover-scale ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300'}`}
              style={{ animationDelay: '0.65s' }}
            >
              <span>Create Account</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </Link>
          </form>
        </div>

        {/* Footer text */}
        <p className={`text-center text-sm mt-6 animate-fadeInUp ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`} style={{ animationDelay: '0.75s' }}>
          By signing in, you agree to our{' '}
          <a href="#" className={`font-medium transition-colors ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
            Terms of Service
          </a>
          {' '}and{' '}
          <a href="#" className={`font-medium transition-colors ${isDarkMode ? 'text-purple-400 hover:text-purple-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
