import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-lg p-10 mb-10">
          <h1 className="text-5xl font-bold text-blue-600 text-center mb-4">
            🎉 Welcome to MBM Connect
          </h1>
          <p className="text-lg text-gray-700 text-center mb-8">
            A modern platform for marketplace, stories, and community connections
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg text-center border-2 border-blue-200">
              <div className="text-5xl mb-4">🛒</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-2">Marketplace</h3>
              <p className="text-gray-700">Buy and sell items, connect with sellers</p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-lg text-center border-2 border-yellow-200">
              <div className="text-5xl mb-4">📖</div>
              <h3 className="text-2xl font-bold text-yellow-900 mb-2">Stories</h3>
              <p className="text-gray-700">Share and read community stories</p>
            </div>

            <div className="bg-blue-100 p-6 rounded-lg text-center border-2 border-blue-300">
              <div className="text-5xl mb-4">💬</div>
              <h3 className="text-2xl font-bold text-blue-900 mb-2">Messaging</h3>
              <p className="text-gray-700">Chat with community members</p>
            </div>
          </div>
        </div>

        {/* CTA Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Authentication</h3>
            <p className="text-gray-600 text-sm mb-4">Secure signup and login</p>
            <div className="flex gap-2">
              <Link 
                to="/login" 
                className="flex-1 bg-blue-600 text-white py-2 rounded text-center text-sm font-semibold hover:bg-blue-700"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="flex-1 bg-green-600 text-white py-2 rounded text-center text-sm font-semibold hover:bg-green-700"
              >
                Signup
              </Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Dashboard</h3>
            <p className="text-gray-600 text-sm mb-4">Protected & private area</p>
            <Link 
              to="/dashboard" 
              className="block bg-purple-600 text-white py-2 rounded text-center text-sm font-semibold hover:bg-purple-700"
            >
              Go to Dashboard
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Marketplace</h3>
            <p className="text-gray-600 text-sm mb-4">Browse & post listings</p>
            <Link 
              to="/market" 
              className="block bg-red-600 text-white py-2 rounded text-center text-sm font-semibold hover:bg-red-700"
            >
              Browse Market
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-blue-100 p-6 rounded-lg mb-10">
          <h3 className="text-2xl font-bold text-blue-900 text-center mb-4">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">7</p>
              <p className="text-sm text-blue-900">Pages</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">∞</p>
              <p className="text-sm text-blue-900">Features</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-600">100%</p>
              <p className="text-sm text-blue-900">Functional</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 p-6 rounded-lg border-2 border-green-300 text-center">
          <p className="text-green-800 text-base font-semibold">
            ✅ Frontend is fully functional and ready for backend integration!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
