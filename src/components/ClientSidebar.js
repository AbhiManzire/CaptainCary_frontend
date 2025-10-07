import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { 
  Home, 
  Users, 
  Search, 
  FileText, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  Menu,
  Ship,
  Eye,
  Download,
  Filter,
  Calendar,
  MessageSquare
} from 'lucide-react';

const ClientSidebar = ({ sidebarOpen, setSidebarOpen, user, logout, notifications = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Stable sidebar toggle handler
  const handleSidebarToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSidebarOpen(prev => !prev);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/client/dashboard' },
    { id: 'portal', label: 'Browse Crew', icon: Users, path: '/client/portal' },
    { id: 'requests', label: 'My Requests', icon: FileText, path: '/client/requests' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Stable navigation handler
  const handleNavigation = (path, e) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate without changing sidebar state
    navigate(path);
  };

  return (
    <div 
      id="client-sidebar-unique"
      className={`client-sidebar-stable ${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col h-screen`}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: 1000 }}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center">
              <img 
                src="/logo-main1.png" 
                alt="CFM Logo" 
                className="h-8 w-auto"
              />
              <div className="ml-3">
                <h2 className="text-lg font-bold text-gray-900">Client Portal</h2>
                <p className="text-xs text-gray-500">CFM Services</p>
              </div>
            </div>
          )}
          <button
            onClick={handleSidebarToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={(e) => handleNavigation(item.path, e)}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                isActive(item.path)
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              style={{ 
                transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out, border-color 0.2s ease-in-out',
                outline: 'none'
              }}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="ml-3 font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
          {sidebarOpen && (
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.companyName || 'Client'}</p>
              <p className="text-xs text-gray-500">Client Account</p>
            </div>
          )}
          <button
            onClick={logout}
            className="ml-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            title="Logout"
          >
            <LogOut className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientSidebar;
