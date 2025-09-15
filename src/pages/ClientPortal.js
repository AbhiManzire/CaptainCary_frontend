import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Ship, LogOut } from 'lucide-react';

const ClientPortal = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Ship className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.companyName}</span>
              <button
                onClick={logout}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Client Portal</h2>
          <p className="text-gray-600 mb-6">
            This page will contain the client portal interface for viewing approved crew members and making requests.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800">
              <strong>Coming Soon:</strong> Full client portal with crew browsing, filtering, 
              shortlisting, and request submission features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPortal;
