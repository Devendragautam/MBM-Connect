import React from 'react';
import { AuthProvider } from '../features/auth/AuthContext';
import { DarkModeProvider } from '../shared/DarkModeContext';

export default function Providers({ children }) {
  return (
    <AuthProvider>
      <DarkModeProvider>
        {children}
      </DarkModeProvider>
    </AuthProvider>
  );
}
