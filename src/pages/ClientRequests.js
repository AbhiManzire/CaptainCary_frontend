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
  AlertCircle
} from 'lucide-react';

const ClientRequestsContent = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  
  // This is now only for client context
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFollowUpModal, setShowFollowUpModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });
  
  
  // Follow-up form
  const [followUpForm, setFollowUpForm] = useState({
    clientMessage: ''
  });

  const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'approved', label: 'Approved', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'completed', label: 'Completed', color: 'blue' }
  ];

  useEffect(() => {
    console.log('ClientRequests useEffect triggered:', { currentPage, filters, user });
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
      
      console.log('Fetching client requests with params:', params.toString());
      console.log('User context:', { user: user?.email });
      
      // Use client endpoint for client requests page
      const endpoint = '/client/requests';
      console.log('API endpoint:', endpoint);
      
      const response = await api.get(`${endpoint}?${params}`);
      console.log('Requests response:', response.data);
      console.log('Response structure:', {
        hasRequests: !!response.data.requests,
        requestsLength: response.data.requests?.length,
        total: response.data.total,
        totalPages: response.data.totalPages
      });
      
      console.log('Setting requests data:', {
        requestsCount: response.data.requests?.length,
        firstRequest: response.data.requests?.[0],
        clientData: response.data.requests?.[0]?.client
      });
      
      setRequests(response.data.requests || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching requests:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      // Ensure requests is always an array even on error
      setRequests([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    console.log('Filter changed:', key, value);
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleViewDetails = async (requestId) => {
    try {
      const response = await api.get(`/client/requests/${requestId}`);
      setSelectedRequest(response.data);
      setShowDetailModal(true);
      // Hide sidebar when modal opens
      setSidebarOpen(false);
    } catch (error) {
      console.error('Error fetching request details:', error);
    }
  };


  const handleAddFollowUp = (request) => {
    setSelectedRequest(request);
    setFollowUpForm({ clientMessage: '' });
    setShowFollowUpModal(true);
    // Hide sidebar when modal opens
    setSidebarOpen(false);
  };

  const handleSubmitFollowUp = async () => {
    try {
      await api.patch(`/client/requests/${selectedRequest._id}/follow-up`, followUpForm);
      setShowFollowUpModal(false);
      setShowDetailModal(false);
      // Restore sidebar when modal closes
      setSidebarOpen(true);
      fetchRequests();
    } catch (error) {
      console.error('Error adding follow-up:', error);
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
      <span className={`px-2 py-1 text-xs rounded-full ${colorClasses[statusConfig.color]}`}>
        {statusConfig.label}
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <ClientSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        logout={logout}
        notifications={[]}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <Ship className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">
                My Requests
              </h1>
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
                      {requests?.filter(r => r.status === 'pending').length || 0}
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
                      {requests?.filter(r => r.status === 'approved').length || 0}
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
                      {requests?.filter(r => r.status === 'rejected').length || 0}
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
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
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
                <h3 className="text-lg font-medium text-gray-900">My Requests</h3>
              </div>
              <div className="overflow-x-auto max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
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
                        Requested
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : !requests || requests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">No requests found</p>
                        <p className="text-sm text-gray-500">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  requests?.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.requestedAt ? formatDate(request.requestedAt) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetails(request._id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleAddFollowUp(request)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Add Follow-up"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
                  </tbody>
                </table>
              </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * limit + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(currentPage * limit, total)}</span> of{' '}
                    <span className="font-medium">{total}</span> results
                  </p>
                </div>
                <div>
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
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Request Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Request Details</h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    // Restore sidebar when modal closes
                    setSidebarOpen(true);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Client Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Client Information</h4>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Company:</span>
                      <span className="text-gray-900">{selectedRequest.client.companyName}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Contact:</span>
                      <span className="text-gray-900">{selectedRequest.client.contactPerson}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Email:</span>
                      <span className="text-gray-900">{selectedRequest.client.email}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Phone:</span>
                      <span className="text-gray-900">{selectedRequest.client.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Crew Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Crew Information</h4>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Name:</span>
                      <span className="text-gray-900">{selectedRequest.crew.fullName}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Rank:</span>
                      <span className="text-gray-900">{selectedRequest.crew.rank}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Nationality:</span>
                      <span className="text-gray-900">{selectedRequest.crew.nationality}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Email:</span>
                      <span className="text-gray-900">{selectedRequest.crew.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Details */}
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Request Details</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Request Type</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedRequest.requestType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <div className="mt-1">
                        {getStatusBadge(selectedRequest.status)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Requested At</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRequest.requestedAt)}</p>
                    </div>
                    {selectedRequest.respondedAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Responded At</label>
                        <p className="mt-1 text-sm text-gray-900">{formatDate(selectedRequest.respondedAt)}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedRequest.message && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Message</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedRequest.message}</p>
                    </div>
                  )}
                  
                  {selectedRequest.adminResponse && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Admin Response</label>
                      <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedRequest.adminResponse}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
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


      {/* Follow-up Modal */}
      {showFollowUpModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Add Follow-up Message</h3>
                <button
                  onClick={() => {
                    setShowFollowUpModal(false);
                    // Restore sidebar when modal closes
                    setSidebarOpen(true);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Message</label>
                  <textarea
                    value={followUpForm.clientMessage}
                    onChange={(e) => setFollowUpForm(prev => ({ ...prev, clientMessage: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Add your follow-up message or questions..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowFollowUpModal(false);
                    // Restore sidebar when modal closes
                    setSidebarOpen(true);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFollowUp}
                  disabled={!followUpForm.clientMessage.trim()}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Follow-up
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

const ClientRequests = () => {
  return <ClientRequestsContent />;
};

export default ClientRequests;
