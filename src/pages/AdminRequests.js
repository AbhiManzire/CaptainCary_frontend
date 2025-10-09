import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import FixedSidebar from '../components/FixedSidebar';
import { useSidebar } from '../contexts/SidebarContext';
import '../components/PageLayout.css';
import { 
  Ship, 
  LogOut, 
  Search, 
  Eye, 
  Check, 
  X, 
  MessageSquare,
  Building,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Filter,
  Clock,
  AlertCircle,
  Edit,
  Send
} from 'lucide-react';

const AdminRequests = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    requestType: '',
    urgency: ''
  });
  
  // Response form
  const [responseForm, setResponseForm] = useState({
    adminResponse: '',
    status: 'pending'
  });

  const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'completed', label: 'Completed', color: 'blue' }
  ];

  useEffect(() => {
    console.log('AdminRequests useEffect triggered:', { currentPage, filters, user });
    fetchRequests();
  }, [currentPage, filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!user) {
        console.error('No user authenticated');
        setLoading(false);
        return;
      }
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        ...filters
      });
      
      console.log('Fetching admin requests with params:', params.toString());
      console.log('User context:', { userType: user.userType, user: user?.email });
      
      // Use admin endpoint
      const endpoint = '/admin/requests';
      console.log('API endpoint:', endpoint);
      
      const response = await api.get(`${endpoint}?${params}`);
      console.log('Admin requests response:', response.data);
      console.log('Response structure:', {
        hasRequests: !!response.data.requests,
        requestsLength: response.data.requests?.length,
        total: response.data.total,
        totalPages: response.data.totalPages
      });
      
      console.log('Setting admin requests data:', {
        requestsCount: response.data.requests?.length,
        firstRequest: response.data.requests?.[0],
        clientData: response.data.requests?.[0]?.client
      });
      
      setRequests(response.data.requests || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching admin requests:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      
      // Set empty requests array on error
      setRequests([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleViewDetails = async (requestId) => {
    try {
      const response = await api.get(`/admin/requests/${requestId}`);
      setSelectedRequest(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };

  const handleRespond = (request) => {
    setSelectedRequest(request);
    setResponseForm({
      adminResponse: '',
      status: request.status
    });
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    try {
      await api.patch(`/admin/requests/${selectedRequest._id}/respond`, responseForm);
      setShowResponseModal(false);
      setShowDetailModal(false);
      fetchRequests();
    } catch (error) {
      console.error('Error responding to request:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status);
    if (!statusConfig) return null;
    
    const colorClasses = {
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      blue: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[statusConfig.color]}`}>
        {statusConfig.label}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    const urgencyClasses = {
      normal: 'bg-gray-100 text-gray-800',
      urgent: 'bg-orange-100 text-orange-800',
      asap: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${urgencyClasses[urgency] || urgencyClasses.normal}`}>
        {urgency?.toUpperCase() || 'NORMAL'}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <FixedSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        logout={logout}
        notifications={[]}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <Ship className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Admin Requests</h1>
            </div>
          </div>
        </header>

        <div className="flex-1 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Requests</p>
                    <p className="text-2xl font-semibold text-gray-900">{total}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {requests.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Check className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Approved</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {requests.filter(r => r.status === 'approved').length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <X className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Rejected</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {requests.filter(r => r.status === 'rejected').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  {/* Search */}
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search requests..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
                      />
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap gap-4">
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Status</option>
                      {STATUS_OPTIONS.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>

                    <select
                      value={filters.requestType}
                      onChange={(e) => handleFilterChange('requestType', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Types</option>
                      <option value="Interview Request">Interview Request</option>
                      <option value="Booking Request">Booking Request</option>
                      <option value="Hold Candidate">Hold Candidate</option>
                      <option value="More Information">More Information</option>
                    </select>

                    <select
                      value={filters.urgency}
                      onChange={(e) => handleFilterChange('urgency', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Urgency</option>
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="asap">ASAP</option>
                    </select>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={fetchRequests}
                      className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Client Requests</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Crew Member
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Urgency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3  text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No requests found</p>
                        </td>
                      </tr>
                    ) : (
                      requests.slice(0, 3).map((request) => (
                        <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Building className="h-5 w-5 text-blue-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{request.client?.companyName || 'N/A'}</div>
                                <div className="text-sm text-gray-500">{request.client?.contactPerson || 'N/A'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{request.crew?.fullName || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{request.crew?.rank || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{request.requestType || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(request.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getUrgencyBadge(request.urgency)}
                          </td>
                          <td className="px-3 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(request.requestedAt)}</div>
                          </td>
                          <td className="px-6 py-4 mr-10 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleViewDetails(request._id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </button>
                              <button
                                onClick={() => handleRespond(request)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Respond
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            )}

            {/* Quick Actions & Info - Table Bottom */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions & Info</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Request Stats */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Request Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Requests:</span>
                      <span className="font-medium">{total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pending:</span>
                      <span className="font-medium text-yellow-600">{requests.filter(r => r.status === 'pending').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Approved:</span>
                      <span className="font-medium text-green-600">{requests.filter(r => r.status === 'approved').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rejected:</span>
                      <span className="font-medium text-red-600">{requests.filter(r => r.status === 'rejected').length}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Filters */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Filters</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleFilterChange('status', 'pending')}
                      className="w-full text-left px-3 py-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
                    >
                      Show Pending Only
                    </button>
                    <button
                      onClick={() => handleFilterChange('status', 'approved')}
                      className="w-full text-left px-3 py-2 text-sm bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      Show Approved Only
                    </button>
                    <button
                      onClick={() => setFilters({
                        search: '',
                        status: '',
                        requestType: '',
                        urgency: ''
                      })}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>

                {/* Recent Requests */}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Requests</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {requests.slice(0, 5).map((request) => (
                      <div key={request._id} className="text-xs text-gray-600 border-b border-gray-200 pb-2">
                        <div className="font-medium text-gray-900">{request.client?.companyName || 'N/A'}</div>
                        <div className="text-gray-500">{request.crew?.fullName} • {formatDate(request.requestedAt)}</div>
                        <div className="flex items-center mt-1">
                          {getStatusBadge(request.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Request Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-2xl rounded-xl bg-white max-h-[90vh] overflow-y-auto">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Request Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Client Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Client Information</h4>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Company:</span>
                      <span className="text-gray-900">{selectedRequest.client?.companyName || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Contact:</span>
                      <span className="text-gray-900">{selectedRequest.client?.contactPerson || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Email:</span>
                      <span className="text-gray-900">{selectedRequest.client?.email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Crew Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Crew Information</h4>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Name:</span>
                      <span className="text-gray-900">{selectedRequest.crew?.fullName || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Rank:</span>
                      <span className="text-gray-900">{selectedRequest.crew?.rank || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Nationality:</span>
                      <span className="text-gray-900">{selectedRequest.crew?.nationality || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Request Details */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Request Details</h4>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Type:</span>
                      <span className="text-gray-900">{selectedRequest.requestType || 'N/A'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Status:</span>
                      <span className="text-gray-900">{getStatusBadge(selectedRequest.status)}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Urgency:</span>
                      <span className="text-gray-900">{getUrgencyBadge(selectedRequest.urgency)}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Date:</span>
                      <span className="text-gray-900">{formatDate(selectedRequest.requestedAt)}</span>
                    </div>
                    {selectedRequest.message && (
                      <div>
                        <span className="font-medium text-gray-700 block mb-2">Message:</span>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded">{selectedRequest.message}</p>
                      </div>
                    )}
                    {selectedRequest.adminResponse && (
                      <div>
                        <span className="font-medium text-gray-700 block mb-2">Admin Response:</span>
                        <p className="text-gray-900 bg-blue-50 p-3 rounded">{selectedRequest.adminResponse}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => handleRespond(selectedRequest)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Edit className="h-4 w-4 inline mr-2" />
                  Respond
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto p-5 border w-full max-w-md shadow-2xl rounded-xl bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Respond to Request</h3>
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={responseForm.status}
                    onChange={(e) => setResponseForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Response</label>
                  <textarea
                    value={responseForm.adminResponse}
                    onChange={(e) => setResponseForm(prev => ({ ...prev, adminResponse: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter your response..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitResponse}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Send className="h-4 w-4 inline mr-2" />
                  Send Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequests;
