import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import IntroScreen from './pages/IntroScreen'; // Make sure the path matches your file location
import './index.css';

// A high-order wrapper component to protect our private route paths
const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/register" />;
};

function AppContent() {
  const { token } = useContext(AuthContext);

  // Checks sessionStorage so the intro sequence doesn't repeatedly loop on every page click
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('rewaste_intro_viewed');
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem('rewaste_intro_viewed', 'true');
    setShowIntro(false);
  };

  // Render the intro screen over the top if it hasn't been completed yet this session
  if (showIntro) {
    return <IntroScreen onComplete={handleIntroComplete} />;
  }

  return (
    <Router>
      <Routes>
        {/* Public Authentication Flow Links */}
        <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
        
        {/* Private Dashboard Link */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;