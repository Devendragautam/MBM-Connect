import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../features/auth/ProtectedRoute';

// Lazy load pages
const HomePage = lazy(() => import('../shared/components/HomePage'));
const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const SignupPage = lazy(() => import('../features/auth/SignupPage'));
const FeedPage = lazy(() => import('../features/feed/FeedPage'));
const ChatPage = lazy(() => import('../features/chat/ChatPage'));
const ConnectPage = lazy(() => import('../features/user/ConnectPage'));
const MarketPage = lazy(() => import('../features/market/MarketPage'));
const StoriesPage = lazy(() => import('../features/stories/StoriesPage'));
const UserProfile = lazy(() => import('../features/profile/UserProfile'));
const Dashboard = lazy(() => import('../shared/components/Dashboard'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/connect" element={<ConnectPage />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/stories" element={<StoriesPage />} />
          <Route path="/profile/:userId" element={<UserProfile />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
