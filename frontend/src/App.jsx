import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import IntroScreen from './pages/IntroScreen';
import LandingPage from './pages/LandingPage';
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
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Authentication Flow Links */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Private Dashboard Link */}
        <Route path="/dashboard" element={
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
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;