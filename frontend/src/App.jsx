import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './index.css';

// A high-order wrapper component to protect our private route paths
const ProtectedRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/register" />;
};

function AppContent() {
  const { token } = useContext(AuthContext);

  return (
    <Router>
      <Routes>
        {/* If logged in, visiting /register redirects to dashboard automatically */}
        <Route path="/register" element={token ? <Navigate to="/" /> : <Register />} />
        
        {/* Core Private Dashboard Hub Route */}
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