import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from './auth.api';
import { useAuth } from './AuthContext';
import { useDarkMode } from '../../shared/DarkModeContext';

const SignupPage = () => {
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    username: '',
    avatar: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const navigate = useNavigate();
  const { login, setToken } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));
      // Preview image
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!formData.avatar) {
      setError('Avatar image is required');
      setLoading(false);
      return;
    }

    try {
      const signupFormData = new FormData();
      signupFormData.append('email', formData.email);
      signupFormData.append('password', formData.password);
      signupFormData.append('fullName', formData.fullName);
      signupFormData.append('username', formData.username);
      signupFormData.append('avatar', formData.avatar);

      const response = await authAPI.signup(signupFormData);

      if (!response || !response.data) {
        throw new Error('Invalid response received from server');
      }

      const responseData = response.data;

      if (responseData.success) {
        const { token, user } = responseData.data;
        setToken(token);
        login(user);
        navigate('/dashboard');
      } else {
        setError(responseData.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Signup failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-4 py-8 ${isDarkMode ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'}`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${isDarkMode ? 'bg-purple-600' : 'bg-purple-300'} animate-pulse-light`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${isDarkMode ? 'bg-indigo-600' : 'bg-indigo-300'} floating-element`}></div>
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Logo/Brand section */}
        <div className="text-center mb-8 animate-fadeInUp">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl mb-4 hover:shadow-3xl hover:scale-105 transition-all duration-500">
            <span className="text-2xl font-bold text-white">MB</span>
          </div>
          <h1 className={`text-4xl font-bold font-serif mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Join MBM Connect
          </h1>
          <p className={isDarkMode ? 'text-slate-400' : 'text-slate-600'}>Create your account and start connecting</p>
        </div>

        {/* Signup Card */}
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
            {/* Two Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="group">
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-secondary-700'}`}>
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border-2 transition-colors pl-11 ${
                      isDarkMode
                        ? 'bg-secondary-700 border-secondary-600 text-white focus:border-primary-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-primary-500'
                    } focus:outline-none`}
                    placeholder="John Doe"
                    required
                  />
                  <svg className="absolute left-3 top-3.5 w-5 h-5 text-secondary-400 group-focus-within:text-primary-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                  </svg>
                </div>
              </div>

              {/* Username */}
              <div className="group">
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-secondary-700'}`}>
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border-2 transition-colors pl-11 ${
                      isDarkMode
                        ? 'bg-secondary-700 border-secondary-600 text-white focus:border-primary-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-primary-500'
                    } focus:outline-none`}
                    placeholder="johndoe_25"
                    required
                  />
                  <svg className="absolute left-3 top-3.5 w-5 h-5 text-secondary-400 group-focus-within:text-primary-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a6 6 0 00-9-5.197V7a1 1 0 00-2 0v.01a6 6 0 00-6 5.999v1h14z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="group">
              <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-secondary-700'}`}>
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 rounded-lg border-2 transition-colors pl-11 ${
                    isDarkMode
                      ? 'bg-secondary-700 border-secondary-600 text-white focus:border-primary-500'
                      : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-primary-500'
                  } focus:outline-none`}
                  placeholder="you@example.com"
                  required
                />
                <svg className="absolute left-3 top-3.5 w-5 h-5 text-secondary-400 group-focus-within:text-primary-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            </div>

            {/* Password Column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Password */}
              <div className="group">
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-secondary-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border-2 transition-colors pl-11 ${
                      isDarkMode
                        ? 'bg-secondary-700 border-secondary-600 text-white focus:border-primary-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-primary-500'
                    } focus:outline-none`}
                    placeholder="••••••••"
                    required
                  />
                  <svg className="absolute left-3 top-3.5 w-5 h-5 text-secondary-400 group-focus-within:text-primary-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-secondary-400 hover:text-secondary-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781z" clipRule="evenodd" />
                        <path d="M15.171 13.576l1.473 1.473a1 1 0 001.414-1.414l-14-14a1 1 0 00-1.414 1.414l1.473 1.473A10.016 10.016 0 00.458 10C1.732 14.057 5.522 17 10 17a9.958 9.958 0 004.512-1.074l1.781 1.781a1 1 0 001.414-1.414l-1.473-1.473z" />
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

              {/* Confirm Password */}
              <div className="group">
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-gray-300' : 'text-secondary-700'}`}>
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 rounded-lg border-2 transition-colors pl-11 ${
                      isDarkMode
                        ? 'bg-secondary-700 border-secondary-600 text-white focus:border-primary-500'
                        : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-primary-500'
                    } focus:outline-none`}
                    placeholder="••••••••"
                    required
                  />
                  <svg className="absolute left-3 top-3.5 w-5 h-5 text-secondary-400 group-focus-within:text-primary-600 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Avatar Upload */}
            <div className="group animate-fadeInUp" style={{ animationDelay: '0.65s' }}>
              <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Profile Avatar
              </label>
              <label className={`relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all group-focus-within:border-purple-500 hover-scale ${
                isDarkMode 
                  ? 'border-slate-600 bg-slate-700 hover:bg-slate-600 hover:border-purple-500' 
                  : 'border-slate-300 bg-slate-100 hover:bg-slate-200 hover:border-indigo-500'
              }`}>
                {avatarPreview ? (
                  <>
                    <img src={avatarPreview} alt="Avatar preview" className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-indigo-500" />
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-indigo-600'}`}>Change image</p>
                  </>
                ) : (
                  <>
                    <svg className={`w-8 h-8 mb-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Click to upload or drag and drop</p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>PNG, JPG, GIF up to 5MB</p>
                  </>
                )}
                <input
                  type="file"
                  name="avatar"
                  onChange={handleChange}
                  accept="image/*"
                  className="hidden"
                  required
                />
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg hover:shadow-2xl hover:scale-105 font-semibold transition-all duration-300 flex items-center justify-center gap-2 animate-fadeInUp group disabled:opacity-50 disabled:cursor-not-allowed mt-8"
              style={{ animationDelay: '0.75s' }}
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                <>
                  <span>Sign Up</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6 animate-fadeInUp" style={{ animationDelay: '0.85s' }}>
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-300'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-white text-slate-600'}`}>Already have an account?</span>
              </div>
            </div>

            {/* Login Link */}
            <Link
              to="/login"
              className={`block px-6 py-3 rounded-lg font-semibold text-center transition-all duration-300 flex items-center justify-center gap-2 animate-fadeInUp hover-scale ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300'}`}
              style={{ animationDelay: '0.95s' }}
            >
              <span>Sign In</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14.5" />
              </svg>
            </Link>
          </form>
        </div>

        {/* Footer text */}
        <p className={`text-center text-sm mt-6 animate-fadeInUp ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`} style={{ animationDelay: '1.05s' }}>
          By signing up, you agree to our{' '}
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

export default SignupPage;
