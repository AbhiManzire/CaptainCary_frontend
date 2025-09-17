import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { 
  Ship, 
  LogOut, 
  Search, 
  Filter, 
  Eye, 
  Download, 
  MessageSquare,
  Heart,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Building,
  Globe,
  X
} from 'lucide-react';

const RANKS = [
  'Master / Captain', 'Chief Officer', '2nd Officer', '3rd Officer',
  'Chief Engineer', '2nd Engineer', 'ETO', 'AB (Able Seaman)',
  'OS (Ordinary Seaman)', 'Bosun', 'Motorman', 'Oiler',
  'Cook / Chief Cook', 'Messman', 'Deck Cadet', 'Engine Cadet',
  'Welder / Fitter', 'Rigger', 'Crane Operator', 'HLO / HDA',
  'Marine Electrician', 'Safety Officer', 'Yacht Skipper / Delivery Crew',
  'Project Engineer', 'Marine Surveyor', 'Others'
];

const VESSEL_TYPES = [
  'Tanker', 'AHTS', 'Yacht', 'Barge', 'Container', 'Bulk Carrier', 'Offshore', 'Other'
];

const REQUEST_TYPES = [
  'Interview Request',
  'Booking Request', 
  'Hold Candidate',
  'More Information'
];

const ClientPortal = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [crews, setCrews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [shortlistedCrew, setShortlistedCrew] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(12);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    rank: '',
    nationality: '',
    vesselType: '',
    availabilityDate: ''
  });
  
  // Request form
  const [requestForm, setRequestForm] = useState({
    requestType: '',
    message: '',
    urgency: 'normal'
  });

  useEffect(() => {
    fetchApprovedCrew();
    fetchShortlistedCrew();
    fetchRequestHistory();
  }, [currentPage, filters]);

  const fetchApprovedCrew = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        status: 'approved',
        ...filters
      });
      
      const response = await api.get(`/client/crew?${params}`);
      setCrews(response.data.crews);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching approved crew:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShortlistedCrew = async () => {
    try {
      const response = await api.get('/client/shortlisted');
      setShortlistedCrew(response.data || []);
    } catch (error) {
      console.error('Error fetching shortlisted crew:', error);
    }
  };

  const fetchRequestHistory = async () => {
    try {
      const response = await api.get('/client/requests');
      setRequestHistory(response.data || []);
    } catch (error) {
      console.error('Error fetching request history:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleViewDetails = async (crewId) => {
    try {
      const response = await api.get(`/client/crew/${crewId}`);
      setSelectedCrew(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching crew details:', error);
    }
  };

  const handleShortlist = async (crewId) => {
    try {
      await api.post('/client/shortlist', { crewId });
      fetchShortlistedCrew();
    } catch (error) {
      console.error('Error shortlisting crew:', error);
    }
  };

  const handleRequest = (crew) => {
    setSelectedCrew(crew);
    setRequestForm({
      requestType: '',
      message: '',
      urgency: 'normal'
    });
    setShowRequestModal(true);
  };

  const handleSubmitRequest = async () => {
    try {
      await api.post('/client/requests', {
        crewId: selectedCrew._id,
        requestType: requestForm.requestType,
        message: requestForm.message,
        urgency: requestForm.urgency
      });
      setShowRequestModal(false);
      fetchRequestHistory();
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const handleDownloadCV = async (crewId) => {
    try {
      const response = await api.get(`/client/crew/${crewId}/cv`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CV_${selectedCrew.fullName.replace(/\s+/g, '_')}.rtf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading CV:', error);
    }
  };

  const handleViewCertificate = async (crewId, docType) => {
    try {
      const response = await api.get(`/client/crew/${crewId}/certificate/${docType}`);
      alert(`Certificate Info:\nType: ${response.data.documentType}\nFile: ${response.data.fileName}\n\n${response.data.message}`);
    } catch (error) {
      console.error('Error viewing certificate:', error);
      alert('Error viewing certificate. Please try again.');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isShortlisted = (crewId) => {
    return shortlistedCrew.some(crew => crew._id === crewId);
  };

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
                onClick={() => navigate('/client/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                Dashboard
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
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Available Crew</p>
                <p className="text-2xl font-semibold text-gray-900">{total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Shortlisted</p>
                <p className="text-2xl font-semibold text-gray-900">{shortlistedCrew.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <MessageSquare className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Requests Sent</p>
                <p className="text-2xl font-semibold text-gray-900">{requestHistory.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {requestHistory.filter(r => r.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, rank, or nationality..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-4">
                <select
                  value={filters.rank}
                  onChange={(e) => handleFilterChange('rank', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Ranks</option>
                  {RANKS.map(rank => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Nationality"
                  value={filters.nationality}
                  onChange={(e) => handleFilterChange('nationality', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />

                <select
                  value={filters.vesselType}
                  onChange={(e) => handleFilterChange('vesselType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">All Vessel Types</option>
                  {VESSEL_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <input
                  type="date"
                  placeholder="Availability Date"
                  value={filters.availabilityDate}
                  onChange={(e) => handleFilterChange('availabilityDate', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={fetchApprovedCrew}
                  className="flex items-center px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Crew Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-3 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))
          ) : crews.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No approved crew members found</p>
            </div>
          ) : (
            crews.map((crew) => (
              <div key={crew._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-lg font-medium text-primary-600">
                          {crew.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                    </div>
                    {isShortlisted(crew._id) && (
                      <Heart className="h-5 w-5 text-red-500 fill-current" />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{crew.fullName}</h3>
                  <p className="text-sm text-gray-600 mb-1">{crew.rank}</p>
                  <p className="text-sm text-gray-600 mb-1">{crew.nationality}</p>
                  <p className="text-sm text-gray-600 mb-4">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Available: {formatDate(crew.availabilityDate)}
                  </p>
                  
                  {crew.preferredVesselType && (
                    <p className="text-sm text-gray-600 mb-4">
                      <Ship className="h-4 w-4 inline mr-1" />
                      {crew.preferredVesselType}
                    </p>
                  )}
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(crew._id)}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleShortlist(crew._id)}
                      className={`px-3 py-2 text-sm rounded-lg ${
                        isShortlisted(crew._id)
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${isShortlisted(crew._id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
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
      </div>

      {/* Crew Detail Modal */}
      {showDetailModal && selectedCrew && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Crew Profile</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Personal Information</h4>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Name:</span>
                      <span className="text-gray-900">{selectedCrew.fullName}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Rank:</span>
                      <span className="text-gray-900">{selectedCrew.rank}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Nationality:</span>
                      <span className="text-gray-900">{selectedCrew.nationality}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Location:</span>
                      <span className="text-gray-900">{selectedCrew.currentLocation}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Available:</span>
                      <span className="text-gray-900">{formatDate(selectedCrew.availabilityDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Professional Information</h4>
                  <div className="space-y-2">
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Vessel Type:</span>
                      <span className="text-gray-900">{selectedCrew.preferredVesselType || 'Not specified'}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Status:</span>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Approved</span>
                    </div>
                  </div>
                  
                  {selectedCrew.seaTimeSummary && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-700 mb-2">Experience:</h5>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedCrew.seaTimeSummary}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents Section */}
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Available Documents</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(selectedCrew.documents || {}).map(([docType, doc]) => (
                    <div key={docType} className={`border rounded-lg p-3 ${doc ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 capitalize">{docType}</p>
                            {doc ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          {doc ? (
                            <p className="text-xs text-gray-500">{doc.name}</p>
                          ) : (
                            <p className="text-xs text-red-500">Not Available</p>
                          )}
                        </div>
                        {docType === 'cv' ? (
                          <div className="text-gray-500 text-sm">
                            CV Download Not Available
                          </div>
                        ) : doc ? (
                          <button
                            onClick={() => handleViewCertificate(selectedCrew._id, docType)}
                            className="text-primary-600 hover:text-primary-800"
                            title="View Certificate (View Only)"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => handleShortlist(selectedCrew._id)}
                  className={`px-4 py-2 rounded-lg ${
                    isShortlisted(selectedCrew._id)
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Heart className={`h-4 w-4 inline mr-2 ${isShortlisted(selectedCrew._id) ? 'fill-current' : ''}`} />
                  {isShortlisted(selectedCrew._id) ? 'Remove from Shortlist' : 'Add to Shortlist'}
                </button>
                <button
                  onClick={() => handleRequest(selectedCrew)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <MessageSquare className="h-4 w-4 inline mr-2" />
                  Send Request
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

      {/* Request Modal */}
      {showRequestModal && selectedCrew && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Send Request</h3>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">Requesting for: <strong>{selectedCrew.fullName}</strong></p>
                <p className="text-sm text-gray-600">Rank: <strong>{selectedCrew.rank}</strong></p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Request Type</label>
                  <select
                    value={requestForm.requestType}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, requestType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select request type</option>
                    {REQUEST_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                  <select
                    value={requestForm.urgency}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, urgency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="asap">ASAP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={requestForm.message}
                    onChange={(e) => setRequestForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Please provide details about your request..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRequest}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPortal;
