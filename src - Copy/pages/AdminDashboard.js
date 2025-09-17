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
  Ship,
  X,
  Settings,
  ChevronDown,
  User,
  Shield,
  RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
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
  const [showAdminTabs, setShowAdminTabs] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      console.log('User authenticated:', user);
      console.log('User type:', userType);
      fetchDashboardData();
      fetchReminders();
    } else {
      console.log('No user authenticated');
    }
  }, [user, userType]);

  // Close admin tabs dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAdminTabs && !event.target.closest('.admin-tabs-dropdown')) {
        setShowAdminTabs(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAdminTabs]);

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
  const urgentCrew = dashboardData?.urgentCrew || [];
  
  console.log('Extracted data:', {
    stats,
    recentCrew,
    pendingRequests,
    urgentCrew,
    reminders
  });

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
              
              {/* Refresh Button */}
              <button
                onClick={handleRefreshData}
                className="flex items-center text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </button>
              
              {/* Admin Tabs Dropdown */}
              <div className="relative admin-tabs-dropdown">
                <button
                  onClick={() => setShowAdminTabs(!showAdminTabs)}
                  className="flex items-center text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                  <ChevronDown className="h-4 w-4 ml-1" />
                </button>
                
                {showAdminTabs && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setActiveTab('overview');
                          setShowAdminTabs(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${
                          activeTab === 'overview' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Overview
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('recent-crew');
                          setShowAdminTabs(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${
                          activeTab === 'recent-crew' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Recent Crew Submissions
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('urgent-crew');
                          setShowAdminTabs(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${
                          activeTab === 'urgent-crew' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Urgent Crew (Next 7 Days)
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('reminders');
                          setShowAdminTabs(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${
                          activeTab === 'reminders' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Internal Reminders
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('client-requests');
                          setShowAdminTabs(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${
                          activeTab === 'client-requests' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Pending Client Requests
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
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
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Crew</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Review</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.approved || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Missing Docs</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.missingDocs || 0}</p>
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
                <div className="max-h-96 overflow-y-auto space-y-4 pr-2 border border-gray-100 rounded-lg p-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {urgentCrew.map((crew, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="font-medium text-gray-900">{crew.fullName}</p>
                        <p className="text-sm text-gray-600">{crew.rank} • {crew.nationality}</p>
                        <p className="text-xs text-red-600">
                          Available: {new Date(crew.availabilityDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {crew.priority && (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            Priority
                          </span>
                        )}
                        <span className="text-xs text-red-500">
                          {Math.ceil((new Date(crew.availabilityDate) - new Date()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    </div>
                  ))}
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
  );
};

export default AdminDashboard;
