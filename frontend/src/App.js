import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './hooks/useToast';
import AccueilPage from './pages/AccueilPage';
import TarifsPage from './pages/TarifsPage';
import GaleriePage from './pages/GaleriePage';
import AvisPage from './pages/AvisPage';
import AuthFixed from './pages/AuthFixed';
import ClientDashboard from './pages/ClientDashboard';
import AdminDashboard from './pages/AdminDashboard';

// This component is no longer needed as we have separate pages

// Protected route component for admin
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-primary" />
      </div>
    );
  }
  
  if (!user || user.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
}

// Protected route component for authenticated users
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
}

// App Routes component
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth" element={<AuthFixed />} />
      <Route 
        path="/client" 
        element={
          <ProtectedRoute>
            <ClientDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Main App component
function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;