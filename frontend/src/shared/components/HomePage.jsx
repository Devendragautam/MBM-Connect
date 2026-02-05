import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { useDarkMode } from '../DarkModeContext';

const fadeInUp = `
  @keyframes fadeInUp {
    0% { 
      opacity: 0; 
      transform: translateY(30px);
    }
    100% { 
      opacity: 1; 
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  @keyframes slideInLeft {
    0% { 
      opacity: 0; 
      transform: translateX(-40px);
    }
    100% { 
      opacity: 1; 
      transform: translateX(0);
    }
  }
  
  @keyframes slideInRight {
    0% { 
      opacity: 0; 
      transform: translateX(40px);
    }
    100% { 
      opacity: 1; 
      transform: translateX(0);
    }
  }
  
  @keyframes subtleFloat {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-5px); }
  }
  
  @keyframes scaleIn {
    0% { 
      opacity: 0;
      transform: scale(0.95);
    }
    100% { 
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideUp {
    0% { 
      opacity: 0;
      transform: translateY(40px);
    }
    100% { 
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes shimmer {
    0% { background-position: -1000px 0; }
    100% { background-position: 1000px 0; }
  }

  .animate-fadeInUp { 
    animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
  }
  
  .animate-fadeIn { 
    animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
  }
  
  .animate-slideInLeft { 
    animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
  }
  
  .animate-slideInRight { 
    animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
  }
  
  .animate-subtleFloat { 
    animation: subtleFloat 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  .animate-scaleIn { 
    animation: scaleIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
  }

  .animate-slideUp { 
    animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .group:hover .group-icon {
    animation: subtleFloat 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useDarkMode();

  const bgClass = isDarkMode 
    ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800' 
    : 'bg-gradient-to-br from-slate-50 via-white to-blue-50';
  const textClass = isDarkMode ? 'text-white' : 'text-slate-900';
  const cardBg = isDarkMode 
    ? 'bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50' 
    : 'bg-gradient-to-br from-white to-slate-50 border border-slate-200';
  const accentColor = 'from-indigo-600 via-purple-600 to-pink-600';

  const stats = [
    { label: 'Active Members', value: '10K+', icon: '👥' },
    { label: 'Daily Transactions', value: '5K+', icon: '📊' },
    { label: 'Trust Score', value: '98%', icon: '✓' },
  ];

  const features = [
    { icon: '🔐', title: 'Enterprise Security', desc: 'Bank-level encryption and data protection' },
    { icon: '⚡', title: 'Instant Verification', desc: 'Real-time member authentication' },
    { icon: '🌍', title: 'Global Network', desc: 'Connect with professionals worldwide' },
  ];

  return (
    <div className={`min-h-screen ${bgClass}`}>
      <style>{fadeInUp}</style>
      {/* Hero Section */}
      <main>
        <section className="max-w-7xl mx-auto px-6 py-32 md:py-40">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-slideInLeft" style={{ animationDelay: '0.15s' }}>
              <div>
                <div className="inline-block mb-4 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-500 hover:scale-105 ${isDarkMode ? 'bg-purple-900/40 text-purple-300' : 'bg-indigo-100 text-indigo-700'}`}>
                    ✨ The Professional Community Platform
                  </span>
                </div>
                <h1 className={`text-6xl md:text-7xl font-bold leading-tight tracking-tight ${textClass} animate-slideInLeft`} style={{ animationDelay: '0.4s' }}>
                  Connect with Purpose
                </h1>
              </div>
              <p className={`text-xl leading-relaxed animate-fadeInUp ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`} style={{ animationDelay: '0.5s' }}>
                A curated professional network designed for meaningful business relationships, secure transactions, and community growth.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                {!isAuthenticated ? (
                  <>
                    <Link to="/signup" className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-500 text-white bg-gradient-to-r ${accentColor} hover:shadow-2xl hover:scale-105 transform text-center`}>
                      Start Free Today
                    </Link>
                    <Link to="/login" className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-500 ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-900'} text-center hover:scale-105 transform`}>
                      Sign In
                    </Link>
                  </>
                ) : (
                  <Link to="/dashboard" className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-500 text-white bg-gradient-to-r ${accentColor} hover:shadow-2xl hover:scale-105 text-center transform`}>
                    Go to Dashboard
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-6 pt-4 text-sm animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 animate-subtleFloat" style={{ animationDelay: '0s' }}></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 animate-subtleFloat" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 animate-subtleFloat" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-slate-600'}>Trusted by 10,000+ professionals</p>
              </div>
            </div>

            <div className="relative animate-slideInRight" style={{ animationDelay: '0.2s' }}>
              <div className={`rounded-3xl p-8 ${cardBg} shadow-2xl border transition-all duration-500 hover:shadow-3xl hover:scale-105 group`}>
                <div className="space-y-6">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-start gap-4 animate-slideUp" style={{ animationDelay: `${0.5 + i * 0.15}s` }}>
                      <div className={`text-3xl flex-shrink-0 transition-transform duration-500 group-icon ${i % 2 === 0 ? 'group-hover:animate-subtleFloat' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>{f.icon}</div>
                      <div>
                        <h3 className={`font-semibold text-base ${textClass}`}>{f.title}</h3>
                        <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className={`py-20 ${isDarkMode ? 'bg-slate-800/30' : 'bg-gradient-to-r from-slate-100 to-blue-50'}`}>
          <div className="max-w-7xl mx-auto px-6">
            <h2 className={`text-3xl font-bold text-center mb-12 ${textClass} animate-fadeInUp`} style={{ animationDelay: '0.1s' }}>Trusted by Industry Leaders</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className={`text-center p-8 rounded-2xl ${cardBg} transition-all duration-500 hover:scale-105 hover:shadow-lg animate-slideUp cursor-pointer`} style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
                  <div className={`text-5xl mb-4 transition-transform duration-500 inline-block ${i % 2 === 0 ? 'group-hover:animate-subtleFloat' : ''}`} style={{ animationDelay: `${i * 0.15}s` }}>{stat.icon}</div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{stat.value}</div>
                  <p className={`mt-3 font-medium ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Props Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <h2 className={`text-3xl font-bold text-center mb-12 ${textClass} animate-fadeInUp`} style={{ animationDelay: '0.1s' }}>Why Choose MBM Connect?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Verified Members', desc: 'Every member undergoes thorough verification process' },
              { title: 'Secure Transactions', desc: 'End-to-end encryption for all communications' },
              { title: '24/7 Support', desc: 'Dedicated support team always available' },
            ].map((item, i) => (
              <div key={i} className={`p-8 rounded-2xl ${cardBg} transition-all duration-500 hover:shadow-lg hover:scale-105 animate-slideUp cursor-pointer group`} style={{ animationDelay: `${0.2 + i * 0.12}s` }}>
                <h3 className={`text-xl font-semibold mb-3 ${textClass} group-hover:text-indigo-600 transition-colors duration-300`}>{item.title}</h3>
                <p className={isDarkMode ? 'text-gray-400' : 'text-slate-600'}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className={`py-20 bg-gradient-to-r ${accentColor} relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl animate-subtleFloat"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-subtleFloat" style={{ animationDelay: '1.5s' }}></div>
          </div>
          <div className="max-w-6xl mx-auto px-6 text-center text-white space-y-6 relative z-10 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-4xl font-bold">Join the Professional Community</h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Take the first step towards meaningful business connections and unlimited growth opportunities.
            </p>
            {!isAuthenticated && (
              <Link to="/signup" className="inline-block px-10 py-4 mt-4 rounded-lg bg-white text-indigo-600 font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-500 transform">
                Get Started Free
              </Link>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'} border-t py-12`}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition`}>Features</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition`}>Security</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition`}>Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition`}>About</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition`}>Blog</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition`}>Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition`}>Privacy</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition`}>Terms</a></li>
                <li><a href="#" className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'} transition`}>Cookies</a></li>
              </ul>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg mb-2">MBM Connect</div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>Building trust, one connection at a time.</p>
            </div>
          </div>
          <div className={`border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-300'} pt-8 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
            <p>&copy; 2025 MBM Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
