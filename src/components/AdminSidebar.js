import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { 
  Home, 
  Users, 
  Building, 
  MessageSquare, 
  Bell, 
  BarChart3, 
  Settings, 
  User, 
  LogOut,
  Menu,
  
 
} from 'lucide-react';

const AdminSidebar = ({ sidebarOpen, setSidebarOpen, user, logout, reminders = [] }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Prevent automatic sidebar state changes
  const handleSidebarToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSidebarOpen(prev => !prev);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin/dashboard' },
    { id: 'crew', label: 'Crew Management', icon: Users, path: '/admin/crew' },
    { id: 'clients', label: 'Client Management', icon: Building, path: '/admin/clients' },
    { id: 'requests', label: 'Client Requests', icon: MessageSquare, path: '/admin/requests' },
    { id: 'reminders', label: 'Reminders', icon: Bell, path: '/admin/reminders', badge: reminders.filter(r => r.status === 'pending').length },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/admin/reports' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Stable navigation handler
  const handleNavigation = (path, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(path);
  };

  return (
    <div 
      id="admin-sidebar-unique"
      className={`admin-sidebar-stable ${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 flex flex-col h-screen`}
      style={{ position: 'relative', zIndex: 1000 }}
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
                <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
                <p className="text-xs text-gray-500">CFM Management</p>
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
            <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
          </div>
          {sidebarOpen && (
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.fullName || 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
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

export default AdminSidebar;
