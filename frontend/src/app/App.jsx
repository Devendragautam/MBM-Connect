import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Navbar from '../shared/components/Navbar';
import Providers from './providers';
import AppRoutes from './routes';

// Styles
import '../styles/index.css';

function App() {
  return (
    <Router>
      <Providers>
        <Navbar />
        <AppRoutes />
      </Providers>
    </Router>
  );
}

export default App;
