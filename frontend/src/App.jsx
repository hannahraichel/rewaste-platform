import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './index.css';
import Login from './pages/Login';
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