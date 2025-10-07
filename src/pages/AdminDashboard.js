import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import FixedSidebar from '../components/FixedSidebar';
import { useSidebar } from '../contexts/SidebarContext';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';

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
  Ship,
  X,
  Settings,
  User,
  Shield,
  RefreshCw,
  Home,
  Menu,
  Bell,
  Search,
  Filter,
  Download,
  Printer,
  Tag,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Calendar,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const AdminDashboardContent = () => {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium'
  });
  const lineChartData = [
    { name: 'Monday', thisWeek: 0.8, lastWeek: 0.6 },
    { name: 'Tuesday', thisWeek: 0.9, lastWeek: 0.7 },
    { name: 'Wednesday', thisWeek: 0.7, lastWeek: 0.8 },
    { name: 'Thursday', thisWeek: 0.9, lastWeek: 0.5 },
    { name: 'Friday', thisWeek: 1.0, lastWeek: 0.9 },
    { name: 'Saturday', thisWeek: 0.6, lastWeek: 0.4 },
    { name: 'Sunday', thisWeek: 0.5, lastWeek: 0.3 }
  ];
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSidebarItem, setActiveSidebarItem] = useState('dashboard');
  
  // Screening data states
  const [screeningData, setScreeningData] = useState({
    recentSubmissions: [],
    statusDistribution: {},
    countryDistribution: {},
    monthlyTrends: []
  });
  const [screeningLoading, setScreeningLoading] = useState(false);

  useEffect(() => {
    if (user) {
      console.log('User authenticated:', user);
      console.log('User type:', userType);
      fetchDashboardData();
      fetchReminders();
    } else {
      console.log('No user authenticated');
    }
  }, [user]); // Remove userType from dependencies to prevent infinite loop

  useEffect(() => {
    if (activeTab === 'screening') {
      fetchScreeningData();
    }
  }, [activeTab]);

  // Handle URL parameters for tabs
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get('tab');
    console.log('URL changed, tab parameter:', tab);
    if (tab && ['overview', 'recent-crew', 'urgent-crew', 'screening', 'reminders', 'pending-requests'].includes(tab)) {
      console.log('Setting active tab to:', tab);
      setActiveTab(tab);
    } else if (!tab) {
      console.log('No tab parameter, setting to overview');
      setActiveTab('overview');
    }
  }, [location.search]);



  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      console.log('Dashboard data received:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        console.error('Authentication failed - please login again');
        // Don't redirect automatically, let the user handle it
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchScreeningData = async () => {
    try {
      setScreeningLoading(true);
      const response = await api.get('/admin/screening-analytics');
      setScreeningData(response.data);
    } catch (error) {
      console.error('Error fetching screening data:', error);
    } finally {
      setScreeningLoading(false);
    }
  };

  const fetchReminders = async () => {
    try {
      const response = await api.get('/admin/reminders?status=pending');
      setReminders(response.data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      if (error.response?.status === 401) {
        console.error('Authentication failed - please login again');
      }
    }
  };

  const handleCreateReminder = async () => {
    try {
      await api.post('/admin/reminders', reminderForm);
      setShowReminderModal(false);
      setReminderForm({ title: '', description: '', dueDate: '', priority: 'medium' });
      fetchReminders();
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  const handleCompleteReminder = async (reminderId) => {
    try {
      await api.patch(`/admin/reminders/${reminderId}/status`, { status: 'completed' });
      fetchReminders();
    } catch (error) {
      console.error('Error completing reminder:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleRefreshData = () => {
    console.log('Refreshing dashboard data...');
    fetchDashboardData();
    fetchReminders();
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
  // Filter urgent crew (next 7 days) from actual data
  const urgentCrew = dashboardData?.urgentCrew || [];
  
  console.log('Extracted data:', {
    stats,
    recentCrew,
    pendingRequests,
    urgentCrew,
    reminders
  });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <FixedSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        logout={logout}
        reminders={reminders}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
      {/* Header */}
      <header className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Ship className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Captain Cary Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              
              {/* Refresh Button */}
              <button
                onClick={handleRefreshData}
                className="flex items-center text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </button>
              
              
            </div>
          </div>
        </div>
      </header>

        <div className="flex-1 py-4 sm:py-6 lg:py-8">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Total Crew</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stats.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stats.pending || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                  <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Approved</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stats.approved || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                </div>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500">Missing Docs</p>
                <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stats.missingDocs || 0}</p>
              </div>
            </div>
          </div>
        </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => navigate('/admin/crew')}
                  className="flex items-center p-6 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 group"
                >
                  <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                    <FileText className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="text-left ml-4">
                    <p className="font-medium text-gray-900 group-hover:text-primary-700">Manage Crew</p>
                    <p className="text-sm text-gray-600">View and manage crew profiles</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/admin/clients')}
                  className="flex items-center p-6 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 group"
                >
                  <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                    <Building className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="text-left ml-4">
                    <p className="font-medium text-gray-900 group-hover:text-primary-700">Manage Clients</p>
                    <p className="text-sm text-gray-600">View and manage client accounts</p>
                  </div>
                </button>

                <button
                  onClick={() => navigate('/admin/requests')}
                  className="flex items-center p-6 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 group"
                >
                  <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                    <MessageSquare className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="text-left ml-4">
                    <p className="font-medium text-gray-900 group-hover:text-primary-700">Client Requests</p>
                    <p className="text-sm text-gray-600">Review and respond to requests</p>
                  </div>
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'recent-crew' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Crew Submissions</h3>
            </div>
            <div className="p-6">
              {recentCrew.length > 0 ? (
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2 border border-gray-100 rounded-lg p-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No recent submissions</p>
                  <p className="text-gray-400 text-sm">Crew members will appear here once they submit their applications</p>
                </div>
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
        )}

        {/* Urgent Crew Section - Always Visible */}
        {/* <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Urgent Crew (Next 7 Days)
            </h3>
          </div>
          <div className="p-6">
            {urgentCrew.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {urgentCrew.map((crew, index) => {
                  const daysUntilAvailable = Math.ceil((new Date(crew.availabilityDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200 shadow-sm hover:shadow-md transition-all duration-200">
                      <div className="flex items-center flex-1">
                        <div className="flex-shrink-0">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-lg">
                              {crew.fullName.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="font-semibold text-gray-900 text-lg">{crew.fullName}</p>
                          <p className="text-sm text-gray-600 font-medium">{crew.rank} • {crew.nationality}</p>
                          <p className="text-xs text-red-600 font-medium">
                            Available: {new Date(crew.availabilityDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 flex-shrink-0">
                        {crew.priority && (
                          <span className="px-3 py-1 text-xs rounded-full bg-red-200 text-red-800 font-bold border border-red-300">
                            Priority
                          </span>
                        )}
                        <div className="text-right">
                          <span className="text-lg font-bold text-red-600">
                            {daysUntilAvailable} days
                          </span>
                          <p className="text-xs text-red-500">remaining</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No urgent crew availableaaaaaaaaaa</p>
                <p className="text-gray-400 text-sm">Crew members available within the next 7 days will appear here</p>
              </div>
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
        </div> */}

        {activeTab === 'reminders' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Internal Reminders</h3>
              <button
                onClick={() => setShowReminderModal(true)}
                className="text-primary-600 hover:text-primary-500 text-sm font-medium"
              >
                + Add Reminder
              </button>
            </div>
            <div className="p-6">
              {reminders.length > 0 ? (
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2 border border-gray-100 rounded-lg p-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {reminders.map((reminder) => (
                    <div key={reminder._id} className={`p-3 rounded-lg border ${
                      reminder.priority === 'urgent' ? 'border-red-200 bg-red-50' :
                      reminder.priority === 'high' ? 'border-orange-200 bg-orange-50' :
                      'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{reminder.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{reminder.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Due: {new Date(reminder.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCompleteReminder(reminder._id)}
                          className="ml-2 text-green-600 hover:text-green-800 text-xs"
                        >
                          ✓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No pending reminders</p>
                  <p className="text-gray-400 text-sm">Create reminders to track important tasks and deadlines</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200">
              <button
                onClick={() => navigate('/admin/reminders')}
                className="text-primary-600 hover:text-primary-500 font-medium"
              >
                View all reminders →
              </button>
            </div>
          </div>
        )}

        {activeTab === 'client-requests' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Pending Client Requests</h3>
            </div>
            <div className="p-6">
              {pendingRequests.length > 0 ? (
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2 border border-gray-100 rounded-lg p-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No pending requests</p>
                  <p className="text-gray-400 text-sm">Client requests will appear here once they are submitted</p>
                </div>
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
        )}

        {activeTab === 'urgent-crew' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                Urgent Crew (Next 7 Days)
              </h3>
            </div>
            <div className="p-6">
              {urgentCrew.length > 0 ? (
                <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {urgentCrew.map((crew, index) => {
                    const daysUntilAvailable = Math.ceil((new Date(crew.availabilityDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center flex-1">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-lg">
                                {crew.fullName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 flex-1">
                            <p className="font-semibold text-gray-900 text-lg">{crew.fullName}</p>
                            <p className="text-sm text-gray-600 font-medium">{crew.rank} • {crew.nationality}</p>
                            <p className="text-xs text-red-600 font-medium">
                              Available: {new Date(crew.availabilityDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 flex-shrink-0">
                          {crew.priority && (
                            <span className="px-3 py-1 text-xs rounded-full bg-red-200 text-red-800 font-bold border border-red-300">
                              Priority
                            </span>
                          )}
                          <div className="text-right">
                            <span className="text-lg font-bold text-red-600">
                              {daysUntilAvailable} days
                            </span>
                            <p className="text-xs text-red-500">remaining</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No urgent crew available</p>
                  <p className="text-gray-400 text-sm">Crew members available within the next 7 days will appear here</p>
                </div>
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
        )}

        {activeTab === 'screening' && (
          <div className="space-y-6">
            {/* Screening Overview Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Total Screenings</p>
                    <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                      {Object.values(screeningData.statusDistribution || {}).reduce((sum, count) => sum + count, 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Approved</p>
                    <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                      {screeningData.statusDistribution?.approved || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                      {screeningData.statusDistribution?.pending || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                      <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-4">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">Rejected</p>
                    <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                      {screeningData.statusDistribution?.rejected || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* System Overview Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h5 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h5>
              {screeningLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row items-center gap-6">
                  {/* Donut Chart */}
                  <div className="w-full lg:w-1/2">
                    <div className="relative w-full h-80 flex items-center justify-center">
                      <svg className="w-full h-full max-w-sm transform -rotate-90" viewBox="0 0 100 100">
                        {(() => {
                          // Sample data for the donut chart
                          const systemData = [
                            { label: 'Approved', value: 45, color: '#10B981' },
                            { label: 'Pending', value: 25, color: '#F59E0B' },
                            { label: 'Rejected', value: 15, color: '#EF4444' },
                            { label: 'Missing Docs', value: 10, color: '#8B5CF6' },
                            { label: 'Priority', value: 5, color: '#000000' }
                          ];
                          
                          let cumulativePercentage = 0;
                          
                          return systemData.map(({ label, value, color }) => {
                            const percentage = value;
                            const startAngle = (cumulativePercentage / 100) * 360;
                            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
                            
                            const radius = 35;
                            const innerRadius = 20;
                            const centerX = 50;
                            const centerY = 50;
                            
                            const startAngleRad = (startAngle * Math.PI) / 180;
                            const endAngleRad = (endAngle * Math.PI) / 180;
                            
                            // Outer arc
                            const x1 = centerX + radius * Math.cos(startAngleRad);
                            const y1 = centerY + radius * Math.sin(startAngleRad);
                            const x2 = centerX + radius * Math.cos(endAngleRad);
                            const y2 = centerY + radius * Math.sin(endAngleRad);
                            
                            // Inner arc
                            const x3 = centerX + innerRadius * Math.cos(endAngleRad);
                            const y3 = centerY + innerRadius * Math.sin(endAngleRad);
                            const x4 = centerX + innerRadius * Math.cos(startAngleRad);
                            const y4 = centerY + innerRadius * Math.sin(startAngleRad);
                            
                            const largeArcFlag = percentage > 50 ? 1 : 0;
                            
                            const pathData = [
                              `M ${x1} ${y1}`,
                              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                              `L ${x3} ${y3}`,
                              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                              'Z'
                            ].join(' ');
                            
                            cumulativePercentage += percentage;
                            
                            return (
                              <path
                                key={label}
                                d={pathData}
                                fill={color}
                                stroke="white"
                                strokeWidth="1"
                              />
                            );
                          });
                        })()}
                      </svg>
                      
                      {/* Center Text */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">100</div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="w-full lg:w-1/2">
                    <div className="space-y-3">
                      {[
                        { label: 'Approved', value: 45, color: '#10B981' },
                        { label: 'Pending', value: 25, color: '#F59E0B' },
                        { label: 'Rejected', value: 15, color: '#EF4444' },
                        { label: 'Missing Docs', value: 10, color: '#8B5CF6' },
                        { label: 'Priority', value: 5, color: '#000000' }
                      ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3" 
                            style={{ backgroundColor: color }}
                          ></div>
                          <span className="text-sm font-medium text-gray-700">{label}</span>
                          <span className="ml-auto text-sm font-semibold text-gray-900">{value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

           

            {/* Weekly Crew Registration Comparison Section */}
            {/* <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h5 className="text-lg font-semibold text-gray-900 mb-4">Weekly Crew Registration Comparison</h5>
              {screeningLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="h-80">
                  <div className="w-full h-full">
                    <svg className="w-full h-full" viewBox="0 0 800 200">
                      <defs>
                        <pattern id="grid" width="80" height="20" patternUnits="userSpaceOnUse">
                          <path d="M 80 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                      
                      {[0, 0.25, 0.5, 0.75, 1].map((value, index) => (
                        <text
                          key={index}
                          x="20"
                          y={180 - (value * 160)}
                          className="text-xs fill-gray-500"
                        >
                          {value}
                        </text>
                      ))}
                      
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, index) => (
                        <text
                          key={index}
                          x={120 + (index * 80)}
                          y="195"
                          className="text-xs fill-gray-500"
                        >
                          {day}
                        </text>
                      ))}
                      
                      <polyline
                        points="120,40 200,20 280,60 360,30 440,10 520,80 600,100"
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="3"
                      />
                      
                      <polyline
                        points="120,80 200,60 280,50 360,100 440,30 520,120 600,140"
                        fill="none"
                        stroke="#8B5CF6"
                        strokeWidth="3"
                      />
                      
                      {[
                        { x: 120, y: 40 },
                        { x: 200, y: 20 },
                        { x: 280, y: 60 },
                        { x: 360, y: 30 },
                        { x: 440, y: 10 },
                        { x: 520, y: 80 },
                        { x: 600, y: 100 }
                      ].map((point, index) => (
                        <circle
                          key={`this-week-crew-${index}`}
                          cx={point.x}
                          cy={point.y}
                          r="4"
                          fill="#10B981"
                        />
                      ))}
                      
                      {[
                        { x: 120, y: 80 },
                        { x: 200, y: 60 },
                        { x: 280, y: 50 },
                        { x: 360, y: 100 },
                        { x: 440, y: 30 },
                        { x: 520, y: 120 },
                        { x: 600, y: 140 }
                      ].map((point, index) => (
                        <circle
                          key={`last-week-crew-${index}`}
                          cx={point.x}
                          cy={point.y}
                          r="4"
                          fill="#8B5CF6"
                        />
                      ))}
                    </svg>
                  </div>
                  
                  <div className="flex justify-center space-x-6 mt-4">
                    <div className="flex items-center">
                      <div className="w-4 h-0.5 bg-green-500 mr-2"></div>
                      <span className="text-sm text-gray-600">This Week Crew Registrations</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-0.5 bg-purple-500 mr-2"></div>
                      <span className="text-sm text-gray-600">Last Week Crew Registrations</span>
                    </div>
                  </div>
                </div>
              )}
            </div> */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h5 className="text-lg font-semibold text-gray-900 mb-4">Weekly Crew Registration Comparison</h5>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 1]} />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="thisWeek" 
                            stroke="#10B981" 
                            strokeWidth={3}
                            name="This Week Payments"
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="lastWeek" 
                            stroke="#8B5CF6" 
                            strokeWidth={3}
                            name="Last Week Payments"
                            dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
 {/* Screening Status Distribution Section */}
 <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h5 className="text-lg font-semibold text-gray-900 mb-4">Screening Status Distribution</h5>
              {screeningLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="h-64">
                  {/* Pie Chart Visualization */}
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative w-48 h-48">
                      {/* Pie Chart Circle */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        {(() => {
                          const statusData = Object.entries(screeningData.statusDistribution || {});
                          const total = statusData.reduce((sum, [, count]) => sum + count, 0);
                          let cumulativePercentage = 0;
                          
                          const statusColors = {
                            'approved': '#10B981',    // Green
                            'pending': '#F59E0B',     // Yellow
                            'rejected': '#EF4444',   // Red
                            'under_review': '#3B82F6', // Blue
                            'on_hold': '#8B5CF6'      // Purple
                          };
                          
                          return statusData.map(([status, count]) => {
                            const percentage = (count / total) * 100;
                            const startAngle = (cumulativePercentage / 100) * 360;
                            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
                            
                            const radius = 40;
                            const centerX = 50;
                            const centerY = 50;
                            
                            const startAngleRad = (startAngle * Math.PI) / 180;
                            const endAngleRad = (endAngle * Math.PI) / 180;
                            
                            const x1 = centerX + radius * Math.cos(startAngleRad);
                            const y1 = centerY + radius * Math.sin(startAngleRad);
                            const x2 = centerX + radius * Math.cos(endAngleRad);
                            const y2 = centerY + radius * Math.sin(endAngleRad);
                            
                            const largeArcFlag = percentage > 50 ? 1 : 0;
                            
                            const pathData = [
                              `M ${centerX} ${centerY}`,
                              `L ${x1} ${y1}`,
                              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                              'Z'
                            ].join(' ');
                            
                            cumulativePercentage += percentage;
                            
                            return (
                              <path
                                key={status}
                                d={pathData}
                                fill={statusColors[status] || '#6B7280'}
                                stroke="white"
                                strokeWidth="0.5"
                              />
                            );
                          });
                        })()}
                      </svg>
                      
                      {/* Center Text */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">
                            {Object.values(screeningData.statusDistribution || {}).reduce((sum, count) => sum + count, 0)}
                          </div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {Object.entries(screeningData.statusDistribution || {}).map(([status, count]) => {
                      const statusColors = {
                        'approved': '#10B981',    // Green
                        'pending': '#F59E0B',     // Yellow
                        'rejected': '#EF4444',   // Red
                        'under_review': '#3B82F6', // Blue
                        'on_hold': '#8B5CF6'      // Purple
                      };
                      const total = Object.values(screeningData.statusDistribution || {}).reduce((sum, count) => sum + count, 0);
                      const percentage = ((count / total) * 100).toFixed(1);
                      
                      return (
                        <div key={status} className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: statusColors[status] || '#6B7280' }}
                            ></div>
                            <span className="capitalize text-gray-600">{status.replace('_', ' ')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">{count}</span>
                            <span className="text-gray-500 text-xs">({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Internal Reminder</h3>
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={reminderForm.title}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter reminder title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={reminderForm.description}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows="3"
                    placeholder="Enter reminder description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="datetime-local"
                    value={reminderForm.dueDate}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={reminderForm.priority}
                    onChange={(e) => setReminderForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowReminderModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateReminder}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Create Reminder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  return <AdminDashboardContent />;
};

export default AdminDashboard;
  