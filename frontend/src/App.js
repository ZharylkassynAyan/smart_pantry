import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Pantry from './pages/Pantry';
import Profile from './pages/Profile';
import AIAssistant from './pages/AIAssistant';

// Protects routes that require login
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

// Redirects logged-in users away from auth pages
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" /> : children;
};

const AppLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ paddingTop: '72px', minHeight: '100vh' }}>
      <div className="container" style={{ padding: '32px 20px' }}>
        {children}
      </div>
    </main>
  </>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route
          path="/dashboard"
          element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>}
        />
        <Route
          path="/pantry"
          element={<PrivateRoute><AppLayout><Pantry /></AppLayout></PrivateRoute>}
        />
        <Route
          path="/ai"
          element={<PrivateRoute><AppLayout><AIAssistant /></AppLayout></PrivateRoute>}
        />
        <Route
          path="/profile"
          element={<PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>}
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
