import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  FileText,
  Building,
  MessageSquare,
  LogOut,
  Ship
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = dashboardData?.crewStats || {};
  const recentCrew = dashboardData?.recentCrew || [];
  const pendingRequests = dashboardData?.pendingRequests || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Ship className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Captain Cary Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.fullName}</span>
              <button
                onClick={handleLogout}
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
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Crew</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approved || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Missing Docs</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.missingDocs || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Crew Submissions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Crew Submissions</h3>
            </div>
            <div className="p-6">
              {recentCrew.length > 0 ? (
                <div className="space-y-4">
                  {recentCrew.map((crew, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{crew.fullName}</p>
                        <p className="text-sm text-gray-600">{crew.rank} • {crew.nationality}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          crew.status === 'approved' ? 'bg-green-100 text-green-800' :
                          crew.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          crew.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {crew.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(crew.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent submissions</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => navigate('/admin/crew')}
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                View all crew →
              </button>
            </div>
          </div>

          {/* Pending Client Requests */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Pending Client Requests</h3>
            </div>
            <div className="p-6">
              {pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((request, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{request.crew.fullName}</p>
                        <p className="text-sm text-gray-600">
                          {request.client.companyName} • {request.requestType}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                          {request.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(request.requestedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No pending requests</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => navigate('/admin/requests')}
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                View all requests →
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/admin/crew')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-6 w-6 text-primary-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Manage Crew</p>
                <p className="text-sm text-gray-600">View and manage crew profiles</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/clients')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Building className="h-6 w-6 text-primary-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Manage Clients</p>
                <p className="text-sm text-gray-600">View and manage client accounts</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/admin/requests')}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <MessageSquare className="h-6 w-6 text-primary-600 mr-3" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Client Requests</p>
                <p className="text-sm text-gray-600">Review and respond to requests</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
