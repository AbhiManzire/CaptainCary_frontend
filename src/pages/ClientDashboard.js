import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import ClientSidebar from '../components/ClientSidebar';
import { useSidebar } from '../contexts/SidebarContext';
import '../components/PageLayout.css';
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

const ClientDashboardContent = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [dashboardData, setDashboardData] = useState({
    shortlistedCount: 0,
    requestsCount: 0,
    approvedRequestsCount: 0,
    recentRequests: []
  });
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

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
      {/* Sidebar */}
      <ClientSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        logout={logout}
        notifications={notifications}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <Ship className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Client Dashboard</h1>
            </div>
          </div>
        </header>

        <div className="flex-1 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Welcome Section */}
            <div className="mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">
                      Welcome back, {user?.contactPerson}! 👋
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Here's an overview of your crew management activities.
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Available Crew</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {dashboardData.availableCrewCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Heart className="h-6 w-6 text-pink-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Shortlisted</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {dashboardData.shortlistedCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Requests</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {dashboardData.requestsCount || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-purple-600" />
                    </div>
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
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => navigate('/client/portal')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 group"
                >
                  <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                    <Users className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="text-left ml-3">
                    <p className="font-medium text-gray-900 group-hover:text-primary-700">Browse Available Crew</p>
                    <p className="text-sm text-gray-600">Find qualified crew members</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/client/portal')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 group"
                >
                  <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                    <Heart className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="text-left ml-3">
                    <p className="font-medium text-gray-900 group-hover:text-primary-700">View Shortlisted Crew</p>
                    <p className="text-sm text-gray-600">Your saved crew members</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Requests */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Requests</h3>
              </div>
              <div className="p-6">
                {dashboardData.recentRequests && dashboardData.recentRequests.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto space-y-4 pr-2 border border-gray-100 rounded-lg p-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {dashboardData.recentRequests.map((request) => (
                      <div key={request._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{request.crew?.fullName}</p>
                          <p className="text-sm text-gray-600">{request.crew?.rank} • {request.requestType}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {request.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(request.requestedAt)}
                          </span>
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
      </div>
    </div>
  );
};

const ClientDashboard = () => {
  return <ClientDashboardContent />;
};

export default ClientDashboard;