import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useDarkMode();

  const features = [
    {
      icon: '🛍️',
      title: 'Marketplace',
      description: 'Buy and sell items in our vibrant marketplace. Post listings, browse products, and connect with sellers.',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: '📖',
      title: 'Stories',
      description: 'Share your experiences and read stories from the community. Connect through shared narratives.',
      color: 'from-purple-400 to-purple-600'
    },
    {
      icon: '💬',
      title: 'Messaging',
      description: 'Chat with other members, negotiate deals, and build relationships within our community.',
      color: 'from-pink-400 to-pink-600'
    },
    {
      icon: '👥',
      title: 'Community',
      description: 'Join a thriving community of like-minded individuals. Network and grow together.',
      color: 'from-green-400 to-green-600'
    },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode
        ? 'bg-gradient-to-b from-secondary-900 via-secondary-800 to-secondary-900'
        : 'bg-gradient-to-b from-primary-50 via-white to-secondary-50'
    }`}>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className={`absolute -top-40 -right-40 w-96 h-96 ${isDarkMode ? 'bg-primary-900' : 'bg-primary-200'} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-light`}></div>
          <div className={`absolute -bottom-40 -left-40 w-96 h-96 ${isDarkMode ? 'bg-blue-900' : 'bg-blue-200'} rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-light`}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-instagram rounded-2xl shadow-lg-light mb-6">
              <span className="text-3xl font-display font-bold text-white">MB</span>
            </div>

            <h1 className={`text-5xl sm:text-6xl font-display font-bold mb-6 ${
              isDarkMode ? 'text-white' : 'text-secondary-900'
            }`}>
              Welcome to <span className="bg-gradient-instagram bg-clip-text text-transparent">MBM Connect</span>
            </h1>

            <p className={`text-xl mb-8 max-w-2xl mx-auto ${
              isDarkMode ? 'text-gray-400' : 'text-secondary-600'
            }`}>
              Your all-in-one community platform for marketplace, stories, and meaningful connections. Join thousands of members building relationships and business opportunities together.
            </p>

            {!isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link
                  to="/login"
                  className={`px-8 py-3 font-semibold rounded-xl shadow-lg-light hover:shadow-xl-light hover:scale-105 transition-all border-2 border-primary-200 ${
                    isDarkMode
                      ? 'bg-secondary-800 text-primary-400 hover:bg-secondary-700'
                      : 'bg-white text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-8 py-3 bg-gradient-primary text-white font-semibold rounded-xl shadow-lg-light hover:shadow-xl-light hover:scale-105 transition-all"
                >
                  Get Started Free
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Link
                  to="/dashboard"
                  className="px-8 py-3 bg-gradient-primary text-white font-semibold rounded-xl shadow-lg-light hover:shadow-xl-light hover:scale-105 transition-all"
                >
                  Go to Dashboard
                </Link>
                <Link
                  to="/market"
                  className={`px-8 py-3 font-semibold rounded-xl shadow-lg-light hover:shadow-xl-light hover:scale-105 transition-all border-2 border-primary-200 ${
                    isDarkMode
                      ? 'bg-secondary-800 text-primary-400 hover:bg-secondary-700'
                      : 'bg-white text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  Browse Marketplace
                </Link>
              </div>
            )}

            {/* Stats */}
            <div className={`grid grid-cols-3 gap-8 mt-16 py-12 border-t border-b ${
              isDarkMode ? 'border-secondary-700' : 'border-secondary-200'
            }`}>
              <div>
                <div className="text-3xl font-bold text-primary-600">10K+</div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-secondary-600'}`}>Active Members</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600">5K+</div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-secondary-600'}`}>Listings</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600">1M+</div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-secondary-600'}`}>Messages Daily</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`py-20 sm:py-32 ${isDarkMode ? 'bg-secondary-800/50' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl sm:text-4xl font-display font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-secondary-900'}`}>
              Why Choose MBM Connect?
            </h2>
            <p className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-secondary-600'}`}>
              Everything you need in one powerful platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`group rounded-lg p-6 hover:shadow-lg transition-all duration-300 ${
                  isDarkMode
                    ? 'bg-secondary-700 hover:bg-secondary-600'
                    : 'bg-white hover:shadow-lg-light'
                }`}
              >
                <div className="mb-4">
                  <div className="text-5xl group-hover:scale-110 transition-transform">{feature.icon}</div>
                </div>
                <h3 className={`text-xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-secondary-900'}`}>
                  {feature.title}
                </h3>
                <p className={isDarkMode ? 'text-gray-300' : 'text-secondary-600'}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-32 bg-gradient-to-r from-primary-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Get started in just 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Create Account', desc: 'Sign up with your email and create your profile' },
              { num: '2', title: 'Connect', desc: 'Browse and connect with community members' },
              { num: '3', title: 'Grow', desc: 'Buy, sell, share, and grow your network' },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-primary text-white font-bold text-lg shadow-lg-light">
                      {step.num}
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-bold text-secondary-900">{step.title}</h3>
                    <p className="mt-2 text-secondary-600">{step.desc}</p>
                  </div>
                </div>
                {idx < 2 && <div className="hidden md:block absolute top-12 left-24 w-32 h-1 bg-gradient-to-r from-primary-400 to-transparent"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 sm:py-32 bg-gradient-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold font-display text-white mb-6">Ready to Connect?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of members and start your journey today. It's free and takes less than a minute.
            </p>
            <Link
              to="/signup"
              className="inline-block px-8 py-4 bg-white text-primary-600 font-bold rounded-xl hover:shadow-xl-light hover:scale-105 transition-all text-lg"
            >
              Get Started Now
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-secondary-900 text-secondary-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">MB</span>
                </div>
                <span className="font-bold text-white">MBM Connect</span>
              </div>
              <p className="text-sm">Your all-in-one community platform for connections and growth.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Marketplace</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Stories</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Messaging</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-secondary-700 pt-8 text-center text-sm">
            <p>&copy; 2025 MBM Connect. All rights reserved. Built with ❤️</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
