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

  const textClass = isDarkMode ? 'text-white' : 'text-slate-900';
  const textMuted = isDarkMode ? 'text-slate-300' : 'text-slate-600';
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
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300">
      <style>{fadeInUp}</style>

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className={`absolute top-[10%] left-[10%] w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-30 ${isDarkMode ? 'bg-indigo-600' : 'bg-indigo-300'} animate-subtleFloat`}></div>
        <div className={`absolute bottom-[20%] right-[10%] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 ${isDarkMode ? 'bg-purple-600' : 'bg-purple-300'} animate-subtleFloat`} style={{ animationDelay: '2s' }}></div>
        <div className={`absolute top-[40%] right-[30%] w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 ${isDarkMode ? 'bg-pink-600' : 'bg-pink-300'} animate-subtleFloat`} style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 py-32 md:py-40">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-slideInLeft" style={{ animationDelay: '0.15s' }}>
              <div>
                <div className="inline-block mb-4 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md border border-white/10 shadow-lg ${isDarkMode ? 'bg-white/10 text-indigo-300' : 'bg-white/40 text-indigo-700'}`}>
                    ✨ The Professional Community Platform
                  </span>
                </div>
                <h1 className={`text-6xl md:text-7xl font-bold leading-tight tracking-tight ${textClass} animate-slideInLeft`} style={{ animationDelay: '0.4s' }}>
                  Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">Purpose</span>
                </h1>
              </div>
              <p className={`text-xl leading-relaxed animate-fadeInUp ${textMuted}`} style={{ animationDelay: '0.5s' }}>
                A curated professional network designed for meaningful business relationships, secure transactions, and community growth.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-fadeInUp" style={{ animationDelay: '0.6s' }}>
                {!isAuthenticated ? (
                  <>
                    <Link to="/signup" className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-500 text-white bg-gradient-to-r ${accentColor} hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-105 transform text-center border border-white/20`}>
                      Start Free Today
                    </Link>
                    <Link to="/login" className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-500 glass-button text-center backdrop-blur-xl ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-white/40'}`}>
                      Sign In
                    </Link>
                  </>
                ) : (
                  <Link to="/dashboard" className={`px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-500 text-white bg-gradient-to-r ${accentColor} hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:scale-105 text-center transform border border-white/20`}>
                    Go to Dashboard
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-6 pt-4 text-sm animate-fadeInUp" style={{ animationDelay: '0.7s' }}>
                <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 bg-gradient-to-br from-blue-400 to-blue-600 animate-subtleFloat shadow-lg" style={{ animationDelay: '0s' }}></div>
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 bg-gradient-to-br from-purple-400 to-purple-600 animate-subtleFloat shadow-lg" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 bg-gradient-to-br from-pink-400 to-pink-600 animate-subtleFloat shadow-lg" style={{ animationDelay: '0.4s' }}></div>
                  <div className={`w-10 h-10 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center font-bold text-xs ${isDarkMode ? 'bg-slate-700 text-white' : 'bg-white text-slate-700'} shadow-lg`}>+10k</div>
                </div>
                <p className={textMuted}>Trusted by 10,000+ professionals</p>
              </div>
            </div>

            <div className="relative animate-slideInRight perspective-[1000px]" style={{ animationDelay: '0.2s' }}>
              <div className={`glass-panel p-8 transform transition-all duration-500 hover:rotate-y-12 hover:rotate-x-12 hover:scale-105 group relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <div className="space-y-8 relative z-10">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-start gap-4 animate-slideUp group/item" style={{ animationDelay: `${0.5 + i * 0.15}s` }}>
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 transition-all duration-500 ${isDarkMode ? 'bg-white/5' : 'bg-indigo-50'} group-hover/item:scale-110 group-hover/item:bg-gradient-to-br from-indigo-500/20 to-purple-500/20 shadow-inner`} style={{ animationDelay: `${i * 0.1}s` }}>
                        <span className="group-hover/item:animate-bounce">{f.icon}</span>
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg ${textClass} mb-1`}>{f.title}</h3>
                        <p className={`text-sm ${textMuted}`}>{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className={`text-4xl font-bold text-center mb-12 ${textClass} animate-fadeInUp font-display`} style={{ animationDelay: '0.1s' }}>Trusted by Industry Leaders</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className={`glass-panel text-center p-8 transition-all duration-500 tilt-hover animate-slideUp cursor-pointer group`} style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
                  <div className={`text-6xl mb-6 transition-transform duration-500 inline-block transform group-hover:scale-125 group-hover:rotate-12`} style={{ animationDelay: `${i * 0.15}s` }}>{stat.icon}</div>
                  <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">{stat.value}</div>
                  <p className={`text-lg font-medium ${textMuted}`}>{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Props Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <h2 className={`text-4xl font-bold text-center mb-16 ${textClass} animate-fadeInUp font-display`} style={{ animationDelay: '0.1s' }}>Why Choose MBM Connect?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Verified Members', desc: 'Every member undergoes thorough verification process', icon: '🛡️' },
              { title: 'Secure Transactions', desc: 'End-to-end encryption for all communications', icon: '🔒' },
              { title: '24/7 Support', desc: 'Dedicated support team always available', icon: '🎧' },
            ].map((item, i) => (
              <div key={i} className={`glass-panel p-8 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] hover:-translate-y-2 animate-slideUp cursor-pointer group border-t-4 ${isDarkMode ? 'border-t-indigo-500' : 'border-t-indigo-400'}`} style={{ animationDelay: `${0.2 + i * 0.12}s` }}>
                <div className="text-4xl mb-4 transform transition-transform group-hover:scale-110 inline-block">{item.icon}</div>
                <h3 className={`text-2xl font-bold mb-3 ${textClass} group-hover:text-indigo-500 transition-colors duration-300`}>{item.title}</h3>
                <p className={`leading-relaxed ${textMuted}`}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 backdrop-blur-md"></div>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-subtleFloat"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-subtleFloat" style={{ animationDelay: '1.5s' }}></div>
          </div>

          <div className="max-w-4xl mx-auto px-6 text-center text-white space-y-8 relative z-10 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-5xl font-bold font-display leading-tight">Join the Professional Community</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto font-light leading-relaxed">
              Take the first step towards meaningful business connections and unlimited growth opportunities.
            </p>
            {!isAuthenticated && (
              <Link to="/signup" className="inline-block px-12 py-5 mt-6 rounded-2xl bg-white text-indigo-600 font-bold text-lg hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-105 transition-all duration-500 transform">
                Get Started Free
              </Link>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t py-16 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900/50 border-white/5' : 'bg-white/50 border-white/20'} backdrop-blur-lg`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h4 className={`font-bold text-lg mb-6 ${textClass}`}>Platform</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className={`${textMuted} hover:text-indigo-500 transition-colors`}>Features</a></li>
                <li><a href="#" className={`${textMuted} hover:text-indigo-500 transition-colors`}>Security</a></li>
                <li><a href="#" className={`${textMuted} hover:text-indigo-500 transition-colors`}>Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-bold text-lg mb-6 ${textClass}`}>Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className={`${textMuted} hover:text-indigo-500 transition-colors`}>About</a></li>
                <li><a href="#" className={`${textMuted} hover:text-indigo-500 transition-colors`}>Blog</a></li>
                <li><a href="#" className={`${textMuted} hover:text-indigo-500 transition-colors`}>Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className={`font-bold text-lg mb-6 ${textClass}`}>Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className={`${textMuted} hover:text-indigo-500 transition-colors`}>Privacy</a></li>
                <li><a href="#" className={`${textMuted} hover:text-indigo-500 transition-colors`}>Terms</a></li>
                <li><a href="#" className={`${textMuted} hover:text-indigo-500 transition-colors`}>Cookies</a></li>
              </ul>
            </div>
            <div className="text-right">
              <div className="font-bold text-2xl mb-4 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent inline-block">MBM Connect</div>
              <p className={`text-sm ${textMuted}`}>Building trust, one connection at a time.</p>
            </div>
          </div>
          <div className={`border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'} pt-8 text-center text-sm ${textMuted}`}>
            <p>&copy; 2025 MBM Connect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
