import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { 
  Ship, 
  LogOut, 
  Users,
  Heart,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react';

const ClientDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    shortlistedCount: 0,
    requestsCount: 0,
    approvedRequestsCount: 0,
    recentRequests: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      const response = await api.get('/client/dashboard');
      console.log('Dashboard API response:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'asap': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Ship className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.companyName}</span>
              <button
                onClick={() => navigate('/client/portal')}
                className="text-gray-600 hover:text-gray-900"
              >
                Browse Crew
              </button>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.contactPerson}!
          </h2>
          <p className="text-gray-600">
            Here's an overview of your crew management activities.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Available Crew</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.availableCrewCount || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Shortlisted</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.shortlistedCount || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.requestsCount || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData.approvedRequestsCount || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/client/portal')}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-primary-600 mr-3" />
                  <span className="text-gray-900">Browse Available Crew</span>
                </div>
                <Eye className="h-4 w-4 text-gray-400" />
              </button>
              
              <button
                onClick={() => navigate('/client/portal')}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <Heart className="h-5 w-5 text-red-600 mr-3" />
                  <span className="text-gray-900">View Shortlisted Crew</span>
                </div>
                <Eye className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Company:</span>
                <span className="text-gray-900 font-medium">{user?.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contact:</span>
                <span className="text-gray-900 font-medium">{user?.contactPerson}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="text-gray-900 font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Industry:</span>
                <span className="text-gray-900 font-medium">{user?.industry}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Requests</h3>
          </div>
          <div className="p-6">
            {dashboardData.recentRequests && dashboardData.recentRequests.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          {request.crew?.fullName}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {request.crew?.rank}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        {request.urgency !== 'normal' && (
                          <span className={`px-2 py-1 text-xs rounded-full ${getUrgencyColor(request.urgency)}`}>
                            {request.urgency.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {request.requestType} - {request.message?.substring(0, 100)}
                        {request.message?.length > 100 && '...'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {formatDate(request.requestedAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {request.status === 'pending' && (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      {request.status === 'approved' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {request.status === 'rejected' && (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No requests yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Start browsing crew to make your first request
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
