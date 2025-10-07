import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { UrgentCrewProvider } from './contexts/UrgentCrewContext';

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
import AdminRequests from './pages/AdminRequests';
import RemindersManagement from './pages/RemindersManagement';
import Reports from './pages/Reports';
import AdminManagement from './pages/AdminManagement';
import Settings from './pages/Settings';

// Admin Routes Component
const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/crew" element={<CrewManagement />} />
      <Route path="/clients" element={<ClientManagement />} />
      <Route path="/requests" element={<AdminRequests />} />
      <Route path="/reminders" element={<RemindersManagement />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/admin-management" element={<AdminManagement />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" />} />
    </Routes>
  );
};

// Client Routes Component
const ClientRoutes = () => {
  return (
    <Routes>
      <Route path="/portal" element={<ClientPortal />} />
      <Route path="/dashboard" element={<ClientDashboard />} />
      <Route path="/requests" element={<ClientRequests />} />
      <Route path="*" element={<Navigate to="/client/portal" />} />
    </Routes>
  );
};

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
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
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
              path="/admin/*" 
              element={
                <ProtectedRoute userType="admin">
                  <SidebarProvider type="admin">
                    <UrgentCrewProvider>
                      <AdminRoutes />
                    </UrgentCrewProvider>
                  </SidebarProvider>
                </ProtectedRoute>
              } 
            />
            
            {/* Client Routes */}
            <Route 
              path="/client/*" 
              element={
                <ProtectedRoute userType="client">
                  <SidebarProvider type="client">
                    <ClientRoutes />
                  </SidebarProvider>
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
