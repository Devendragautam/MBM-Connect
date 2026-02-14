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
        <section className="max-w-7xl mx-auto px-6 py-32 md:py-48 relative">
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="inline-block mb-8 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <span className={`px-5 py-2 rounded-full text-sm font-semibold tracking-wide backdrop-blur-md border border-white/10 shadow-xl ${isDarkMode ? 'bg-white/5 text-indigo-300 ring-1 ring-white/10' : 'bg-white/60 text-indigo-700 ring-1 ring-indigo-50'}`}>
                ✨ The Professional Community Platform
              </span>
            </div>

            <h1 className={`text-6xl md:text-8xl font-black leading-tight tracking-tight mb-8 ${textClass} animate-slideUp max-w-5xl`} style={{ animationDelay: '0.3s' }}>
              Connect with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x">Purpose & Impact</span>
            </h1>

            <p className={`text-xl md:text-2xl leading-relaxed max-w-3xl mx-auto mb-12 animate-fadeInUp ${textMuted}`} style={{ animationDelay: '0.4s' }}>
              A curated professional network designed for meaningful business relationships, secure transactions, and community growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
              {!isAuthenticated ? (
                <>
                  <Link to="/signup" className={`px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 text-white bg-gradient-to-r ${accentColor} hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] hover:-translate-y-1 transform border border-white/20 shadow-xl`}>
                    Start Free Today
                  </Link>
                  <Link to="/login" className={`px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 glass-button backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:-translate-y-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                    Sign In
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className={`px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 text-white bg-gradient-to-r ${accentColor} hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] hover:-translate-y-1 transform border border-white/20 shadow-xl`}>
                  Go to Dashboard
                </Link>
              )}
            </div>

            <div className="mt-16 pt-8 border-t border-white/10 animate-fadeInUp w-full max-w-xs mx-auto" style={{ animationDelay: '0.6s' }}>
              <div className="flex flex-col items-center gap-3">
                <div className="flex -space-x-4">
                  <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-gradient-to-br from-blue-400 to-blue-600 animate-subtleFloat shadow-lg z-30" style={{ animationDelay: '0s' }}></div>
                  <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-gradient-to-br from-purple-400 to-purple-600 animate-subtleFloat shadow-lg z-20" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-gradient-to-br from-pink-400 to-pink-600 animate-subtleFloat shadow-lg z-10" style={{ animationDelay: '0.4s' }}></div>
                </div>
                <p className={`text-sm font-medium ${textMuted}`}>Trusted by <span className={isDarkMode ? "text-white" : "text-slate-900"}>10,000+</span> professionals</p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Grid */}
        <section className="py-24 relative z-10">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
              <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${textClass} font-display`}>Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">grow</span></h2>
              <p className={`text-xl max-w-2xl mx-auto ${textMuted}`}>Powerful tools to help you build your network and advance your career.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: '🚀', title: 'Fast Connections', desc: 'Instant messaging and networking tools.' },
                { icon: '🛡️', title: 'Secure Platform', desc: 'Enterprise-grade security for your data.' },
                { icon: '🌍', title: 'Global Reach', desc: 'Connect with professionals from 150+ countries.' },
                { icon: '💡', title: 'Smart Insights', desc: 'AI-powered recommendations for your growth.' },
                { icon: '🤝', title: 'Community Events', desc: 'Exclusive access to webinars and meetups.' },
                { icon: '📱', title: 'Mobile First', desc: 'Seamless experience across all devices.' }
              ].map((feature, i) => (
                <div key={i} className={`glass-panel p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border ${isDarkMode ? 'border-white/5 hover:border-violet-500/30' : 'border-white/40 hover:border-violet-500/30'} group`} style={{ animationDelay: `${0.1 * i}s` }}>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className={`text-xl font-bold mb-3 ${textClass}`}>{feature.title}</h3>
                  <p className={textMuted}>{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 relative border-y border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-12 divide-y md:divide-y-0 md:divide-x divide-white/10">
              {stats.map((stat, i) => (
                <div key={i} className="text-center py-8 md:py-0 animate-fadeInUp" style={{ animationDelay: `${0.1 * i}s` }}>
                  <div className="text-5xl md:text-6xl font-black bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent mb-2">{stat.value}</div>
                  <div className={`text-lg font-medium uppercase tracking-widest ${textMuted}`}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Props Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <h2 className={`text-3xl md:text-5xl font-bold text-center mb-16 ${textClass} font-display`}>Loved by <span className="text-violet-500">Professionals</span></h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Sarah J.", role: "Product Manager", text: "MBM Connect transformed how I network. The quality of connections is unmatched." },
                { name: "David K.", role: "Tech Lead", text: "Found my co-founder here within a week. The verification system gives real peace of mind." },
                { name: "Emily R.", role: "Freelance Designer", text: "The community support is incredible. I've landed 3 major clients in just a month." }
              ].map((t, i) => (
                <div key={i} className={`glass-panel p-8 rounded-2xl relative ${isDarkMode ? 'bg-slate-800/50' : 'bg-white/60'}`}>
                  <div className="text-violet-500 text-4xl mb-4 font-serif">"</div>
                  <p className={`text-lg mb-6 leading-relaxed ${textClass} italic`}>{t.text}</p>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"></div>
                    <div>
                      <div className={`font-bold ${textClass}`}>{t.name}</div>
                      <div className={`text-xs uppercase tracking-wide ${textMuted}`}>{t.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Props Section */}
        <section className="max-w-7xl mx-auto px-6 py-20 border-t border-white/10">
          <h2 className={`text-4xl font-bold text-center mb-16 ${textClass} animate-fadeInUp font-display`} style={{ animationDelay: '0.1s' }}>Why Choose MBM Connect?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Verified Members', desc: 'Every member undergoes thorough verification process', icon: '🛡️' },
              { title: 'Secure Transactions', desc: 'End-to-end encryption for all communications', icon: '🔒' },
              { title: '24/7 Support', desc: 'Dedicated support team always available', icon: '🎧' },
            ].map((item, i) => (
              <div key={i} className={`p-8 rounded-2xl transition-all duration-300 hover:bg-white/5 border border-transparent hover:border-white/10 group`} style={{ animationDelay: `${0.2 + i * 0.12}s` }}>
                <div className="text-4xl mb-4 transform transition-transform group-hover:scale-110 inline-block">{item.icon}</div>
                <h3 className={`text-2xl font-bold mb-3 ${textClass} group-hover:text-violet-500 transition-colors duration-300`}>{item.title}</h3>
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
