import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import CrewRegistration from './pages/CrewRegistration';
import AdminLogin from './pages/AdminLogin';
import ClientLogin from './pages/ClientLogin';
import AdminDashboard from './pages/AdminDashboard';
import ClientPortal from './pages/ClientPortal';
import ClientDashboard from './pages/ClientDashboard';
import CrewManagement from './pages/CrewManagement';
import ClientManagement from './pages/ClientManagement';
import ClientRequests from './pages/ClientRequests';
import RemindersManagement from './pages/RemindersManagement';

// Protected Route Component
const ProtectedRoute = ({ children, userType }) => {
  const { user, userType: currentUserType, loading } = useAuth();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    // Redirect to appropriate login based on userType
    if (userType === 'client') {
      return <Navigate to="/client/login" />;
    }
    return <Navigate to="/admin/login" />;
  }
  
  if (userType && currentUserType !== userType) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<CrewRegistration />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/client/login" element={<ClientLogin />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute userType="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/crew" 
              element={
                <ProtectedRoute userType="admin">
                  <CrewManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/clients" 
              element={
                <ProtectedRoute userType="admin">
                  <ClientManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/requests" 
              element={
                <ProtectedRoute userType="admin">
                  <ClientRequests />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/reminders" 
              element={
                <ProtectedRoute userType="admin">
                  <RemindersManagement />
                </ProtectedRoute>
              } 
            />
            
            {/* Client Routes */}
          <Route 
            path="/client/portal" 
            element={
              <ProtectedRoute userType="client">
                <ClientPortal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/client/dashboard" 
            element={
              <ProtectedRoute userType="client">
                <ClientDashboard />
              </ProtectedRoute>
            } 
          />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
