import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingTop: '40px', paddingBottom: '40px' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '40px', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold', color: '#2563eb', marginBottom: '16px', textAlign: 'center' }}>
            🎉 Welcome to MBM Connect
          </h1>
          <p style={{ fontSize: '18px', color: '#4b5563', textAlign: 'center', marginBottom: '32px' }}>
            A modern platform for marketplace, stories, and community connections
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '24px', borderRadius: '8px', textAlign: 'center', border: '2px solid #dbeafe' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🛒</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1e40af', marginBottom: '8px' }}>Marketplace</h3>
              <p style={{ color: '#4b5563', fontSize: '14px' }}>Buy and sell items, connect with sellers</p>
            </div>

            <div style={{ backgroundColor: '#fef3c7', padding: '24px', borderRadius: '8px', textAlign: 'center', border: '2px solid #fde68a' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📖</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#92400e', marginBottom: '8px' }}>Stories</h3>
              <p style={{ color: '#4b5563', fontSize: '14px' }}>Share and read community stories</p>
            </div>

            <div style={{ backgroundColor: '#dbeafe', padding: '24px', borderRadius: '8px', textAlign: 'center', border: '2px solid #bfdbfe' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>💬</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0c4a6e', marginBottom: '8px' }}>Messaging</h3>
              <p style={{ color: '#4b5563', fontSize: '14px' }}>Chat with community members</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '40px' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Authentication</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Secure signup and login</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/login" style={{ flex: 1, backgroundColor: '#2563eb', color: 'white', padding: '8px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Login</Link>
              <Link to="/signup" style={{ flex: 1, backgroundColor: '#10b981', color: 'white', padding: '8px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Signup</Link>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Dashboard</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Protected & private area</p>
            <Link to="/dashboard" style={{ display: 'block', backgroundColor: '#8b5cf6', color: 'white', padding: '8px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Go to Dashboard</Link>
          </div>

          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>Marketplace</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Browse & post listings</p>
            <Link to="/market" style={{ display: 'block', backgroundColor: '#ef4444', color: 'white', padding: '8px', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>Browse Market</Link>
          </div>
        </div>

        <div style={{ backgroundColor: '#dbeafe', padding: '24px', borderRadius: '8px', marginTop: '40px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0c4a6e', marginBottom: '8px' }}>Quick Stats</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px', marginTop: '16px' }}>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb' }}>7</p>
              <p style={{ fontSize: '12px', color: '#0c4a6e' }}>Pages</p>
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>∞</p>
              <p style={{ fontSize: '12px', color: '#0c4a6e' }}>Features</p>
            </div>
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>100%</p>
              <p style={{ fontSize: '12px', color: '#0c4a6e' }}>Functional</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '40px', padding: '24px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '2px solid #bbf7d0', textAlign: 'center' }}>
          <p style={{ color: '#166534', fontSize: '14px', fontWeight: '600' }}>
            ✅ Frontend is fully functional and ready for backend integration!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
