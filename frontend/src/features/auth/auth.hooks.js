import { useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import apiClient from '../../services/apiClient';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const useLogin = () => {
  const { login } = useAuth();
  return login;
};

export const useLogout = () => {
  const { logout } = useAuth();
  return logout;
};

export const useUser = () => {
  const { user } = useAuth();
  return user;
};

export const useIsAuthenticated = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
};

export const useAuthInit = () => {
  const { setUser, logout } = useAuth();

  useEffect(() => {
    const init = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        setUser(res.data.data);
      } catch {
        logout();
      }
    };
    init();
  }, [setUser, logout]);
};
