import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { 
  Ship, 
  LogOut, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Check, 
  X, 
  AlertTriangle,
  Tag,
  Calendar,
  MapPin,
  Phone,
  Mail,
  FileText,
  Users,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Plus,
  MoreVertical,
  Printer
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

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending Review', color: 'yellow' },
  { value: 'approved', label: 'Approved', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'missing_docs', label: 'Missing Docs', color: 'orange' }
];

const CrewManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [crews, setCrews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showCVReuploadModal, setShowCVReuploadModal] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [showClientAssignmentModal, setShowClientAssignmentModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    rank: '',
    nationality: '',
    submissionDateFrom: '',
    submissionDateTo: '',
    vesselExperience: '',
    sortBy: 'submittedAt',
    sortOrder: 'desc'
  });
  
  // Status update form
  const [statusForm, setStatusForm] = useState({
    status: '',
    priority: false,
    approvedForClients: false,
    tags: [],
    internalComments: '',
    adminNotes: ''
  });

  useEffect(() => {
    fetchCrews();
    fetchClients();
  }, [currentPage, filters]);

  const fetchCrews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        ...filters
      });
      
      const response = await api.get(`/crew?${params}`);
      setCrews(response.data.crews);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching crews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/admin/clients');
      setClients(response.data.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]); // Set empty array on error
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleStatusUpdate = async () => {
    try {
      await api.patch(`/crew/${selectedCrew._id}/status`, statusForm);
      setShowStatusModal(false);
      setShowDetailModal(false);
      fetchCrews();
      // Reset form
      setStatusForm({
        status: '',
        priority: false,
        approvedForClients: false,
        tags: [],
        internalComments: '',
        adminNotes: ''
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleViewDetails = async (crewId) => {
    try {
      const response = await api.get(`/crew/${crewId}`);
      setSelectedCrew(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching crew details:', error);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/admin/export/crew?${params}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'crew-data.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleDownloadCV = async (crewId) => {
    try {
      const response = await api.get(`/crew/${crewId}/cv`, {
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

  const handleDownloadRawCV = async (crewId) => {
    try {
      const response = await api.get(`/crew/${crewId}/cv/raw`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', selectedCrew.documents.cv.name);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading raw CV:', error);
    }
  };

  const handleCVFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCvFile(file);
    }
  };

  const handleCVReupload = async () => {
    if (!cvFile) {
      alert('Please select a file to upload');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('cv', cvFile);

      await api.post(`/crew/${selectedCrew._id}/cv/reupload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setShowCVReuploadModal(false);
      setCvFile(null);
      fetchCrews(); // Refresh the crew list
      alert('CV reuploaded successfully');
    } catch (error) {
      console.error('Error reuploading CV:', error);
      alert('Error reuploading CV');
    }
  };

  const handleAssignToClient = async () => {
    if (!selectedClientId) {
      alert('Please select a client');
      return;
    }

    try {
      await api.post(`/admin/crew/${selectedCrew._id}/assign-client`, {
        clientId: selectedClientId
      });

      setShowClientAssignmentModal(false);
      setSelectedClientId('');
      fetchCrews(); // Refresh the crew list
      alert('Crew assigned to client shortlist successfully');
    } catch (error) {
      console.error('Error assigning crew to client:', error);
      alert('Error assigning crew to client');
    }
  };

  const handlePrintProfile = () => {
    if (!selectedCrew) return;
    
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Crew Profile - ${selectedCrew.fullName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
          .section { margin-bottom: 20px; }
          .section h3 { background-color: #f0f0f0; padding: 8px; margin: 0 0 10px 0; }
          .info-row { display: flex; margin-bottom: 5px; }
          .label { font-weight: bold; width: 150px; }
          .value { flex: 1; }
          .documents { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
          .doc-item { border: 1px solid #ccc; padding: 10px; text-align: center; }
          .doc-available { background-color: #d4edda; }
          .doc-missing { background-color: #f8d7da; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Captain Cary - Crew Profile</h1>
          <h2>${selectedCrew.fullName}</h2>
        </div>
        
        <div class="section">
          <h3>Personal Information</h3>
          <div class="info-row"><span class="label">Full Name:</span><span class="value">${selectedCrew.fullName}</span></div>
          <div class="info-row"><span class="label">Email:</span><span class="value">${selectedCrew.email}</span></div>
          <div class="info-row"><span class="label">Phone:</span><span class="value">${selectedCrew.phone}</span></div>
          <div class="info-row"><span class="label">Rank:</span><span class="value">${selectedCrew.rank}</span></div>
          <div class="info-row"><span class="label">Nationality:</span><span class="value">${selectedCrew.nationality}</span></div>
          <div class="info-row"><span class="label">Current Location:</span><span class="value">${selectedCrew.currentLocation}</span></div>
          <div class="info-row"><span class="label">Date of Birth:</span><span class="value">${new Date(selectedCrew.dateOfBirth).toLocaleDateString()}</span></div>
          <div class="info-row"><span class="label">Availability Date:</span><span class="value">${new Date(selectedCrew.availabilityDate).toLocaleDateString()}</span></div>
        </div>
        
        <div class="section">
          <h3>Professional Information</h3>
          <div class="info-row"><span class="label">Preferred Vessel Type:</span><span class="value">${selectedCrew.preferredVesselType || 'Not specified'}</span></div>
          <div class="info-row"><span class="label">Status:</span><span class="value">${selectedCrew.status}</span></div>
          ${selectedCrew.priority ? '<div class="info-row"><span class="label">Priority:</span><span class="value">High Priority</span></div>' : ''}
          ${selectedCrew.seaTimeSummary ? `<div class="info-row"><span class="label">Experience:</span><span class="value">${selectedCrew.seaTimeSummary}</span></div>` : ''}
          ${selectedCrew.additionalNotes ? `<div class="info-row"><span class="label">Additional Notes:</span><span class="value">${selectedCrew.additionalNotes}</span></div>` : ''}
        </div>
        
        <div class="section">
          <h3>Documents Status</h3>
          <div class="documents">
            ${Object.entries(selectedCrew.documents || {}).map(([docType, doc]) => `
              <div class="doc-item ${doc ? 'doc-available' : 'doc-missing'}">
                <strong>${docType.toUpperCase()}</strong><br>
                ${doc ? `✅ ${doc.name}` : '❌ Missing'}
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="section">
          <h3>Admin Notes</h3>
          ${selectedCrew.internalComments ? `<div class="info-row"><span class="label">Internal Comments:</span><span class="value">${selectedCrew.internalComments}</span></div>` : ''}
          ${selectedCrew.adminNotes ? `<div class="info-row"><span class="label">Admin Notes:</span><span class="value">${selectedCrew.adminNotes}</span></div>` : ''}
        </div>
        
        <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
          Printed on ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const getStatusBadge = (status) => {
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status);
    if (!statusConfig) return null;
    
    const colorClasses = {
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800'
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
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Ship className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Crew Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.fullName}</span>
              <button
                onClick={() => navigate('/admin/dashboard')}
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
                <p className="text-sm font-medium text-gray-500">Total Crew</p>
                <p className="text-2xl font-semibold text-gray-900">{total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {crews.filter(c => c.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <Check className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {crews.filter(c => c.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <X className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Missing Docs</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {crews.filter(c => c.status === 'missing_docs').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6">
            {/* Top Row - Search and Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-4">
              {/* Search */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full hover:border-gray-400 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={fetchCrews}
                  className="flex items-center px-4 py-2.5 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2.5 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Bottom Row - Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative min-w-[140px]">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-700 appearance-none cursor-pointer hover:border-gray-400 transition-colors duration-200"
                >
                  <option value="">All Status</option>
                  {STATUS_OPTIONS.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative min-w-[160px]">
                <select
                  value={filters.rank}
                  onChange={(e) => handleFilterChange('rank', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-700 appearance-none cursor-pointer hover:border-gray-400 transition-colors duration-200"
                >
                  <option value="">All Ranks</option>
                  {RANKS.map(rank => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="min-w-[140px]">
                <input
                  type="text"
                  placeholder="Nationality"
                  value={filters.nationality}
                  onChange={(e) => handleFilterChange('nationality', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-400 transition-colors duration-200"
                />
              </div>

              <div className="relative min-w-[160px]">
                <select
                  value={filters.vesselExperience}
                  onChange={(e) => handleFilterChange('vesselExperience', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-700 appearance-none cursor-pointer hover:border-gray-400 transition-colors duration-200"
                >
                  <option value="">All Vessel Types</option>
                  <option value="Tanker">Tanker</option>
                  <option value="AHTS">AHTS</option>
                  <option value="Yacht">Yacht</option>
                  <option value="Barge">Barge</option>
                  <option value="Container">Container</option>
                  <option value="Bulk Carrier">Bulk Carrier</option>
                  <option value="Offshore">Offshore</option>
                  <option value="Other">Other</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Submission Date From</label>
              <input
                type="date"
                value={filters.submissionDateFrom}
                onChange={(e) => handleFilterChange('submissionDateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Submission Date To</label>
              <input
                type="date"
                value={filters.submissionDateTo}
                onChange={(e) => handleFilterChange('submissionDateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({
                  search: '',
                  status: '',
                  rank: '',
                  nationality: '',
                  submissionDateFrom: '',
                  submissionDateTo: '',
                  vesselExperience: '',
                  sortBy: 'submittedAt',
                  sortOrder: 'desc'
                })}
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>

        {/* Crew Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div 
            className="overflow-x-auto max-h-[350px] overflow-y-auto border border-gray-200 rounded-lg"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#6B7280 #F3F4F6'
            }}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crew Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nationality
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : crews.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No crew members found
                    </td>
                  </tr>
                ) : (
                  crews.map((crew) => (
                    <tr key={crew._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-600">
                                {crew.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{crew.fullName}</div>
                            <div className="text-sm text-gray-500">{crew.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{crew.rank}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{crew.nationality}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(crew.availabilityDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(crew.status)}
                        {crew.priority && (
                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            Priority
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(crew.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewDetails(crew._id)}
                            className="text-primary-600 hover:text-primary-900"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCrew(crew);
                              setStatusForm({
                                status: crew.status,
                                priority: crew.priority || false,
                                approvedForClients: crew.approvedForClients || false,
                                tags: crew.tags || [],
                                internalComments: crew.internalComments || '',
                                adminNotes: crew.adminNotes || ''
                              });
                              setShowStatusModal(true);
                            }}
                            className="text-gray-600 hover:text-gray-900"
                            title="Update Status"
                          >
                            <Edit className="h-4 w-4" />
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

      {/* Crew Detail Modal */}
      {showDetailModal && selectedCrew && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-0 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white flex flex-col max-h-[90vh]">
            {/* Modal Header - Fixed */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white rounded-t-md">
              <h3 className="text-lg font-medium text-gray-900">Crew Details</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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
                      <span className="font-medium text-gray-700 w-32">Email:</span>
                      <span className="text-gray-900">{selectedCrew.email}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Phone:</span>
                      <span className="text-gray-900">{selectedCrew.phone}</span>
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
                      <span className="font-medium text-gray-700 w-32">DOB:</span>
                      <span className="text-gray-900">{formatDate(selectedCrew.dateOfBirth)}</span>
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
                      {getStatusBadge(selectedCrew.status)}
                    </div>
                    {selectedCrew.priority && (
                      <div className="flex">
                        <span className="font-medium text-gray-700 w-32">Priority:</span>
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">High Priority</span>
                      </div>
                    )}
                    <div className="flex">
                      <span className="font-medium text-gray-700 w-32">Tags:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedCrew.tags && selectedCrew.tags.length > 0 ? selectedCrew.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {tag}
                          </span>
                        )) : (
                          <span className="text-gray-500 text-sm">No tags</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {selectedCrew.seaTimeSummary && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-700 mb-2">Sea Time Summary:</h5>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedCrew.seaTimeSummary}</p>
                    </div>
                  )}
                  
                  {selectedCrew.additionalNotes && (
                    <div className="mt-4">
                      <h5 className="font-medium text-gray-700 mb-2">Additional Notes:</h5>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedCrew.additionalNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents Section */}
              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-3">Documents</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(selectedCrew.documents || {}).map(([docType, doc]) => (
                    <div key={docType} className={`border rounded-lg p-3 ${doc ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 capitalize">{docType}</p>
                            {doc ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <X className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          {doc ? (
                            <p className="text-xs text-gray-500">{doc.name}</p>
                          ) : (
                            <p className="text-xs text-red-500">Missing</p>
                          )}
                        </div>
                        {doc && docType === 'cv' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDownloadCV(selectedCrew._id)}
                              className="text-primary-600 hover:text-primary-800"
                              title="Download CV (Word)"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownloadRawCV(selectedCrew._id)}
                              className="text-green-600 hover:text-green-800"
                              title="Download Raw CV"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setShowCVReuploadModal(true)}
                              className="text-orange-600 hover:text-orange-800"
                              title="Reupload CV"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        ) : doc ? (
                          <a
                            href={`http://localhost:5000${doc.url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-800"
                          >
                            <FileText className="h-4 w-4" />
                          </a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Comments */}
              {(selectedCrew.internalComments || selectedCrew.adminNotes) && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Admin Notes</h4>
                  <div className="space-y-3">
                    {selectedCrew.internalComments && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-1">Internal Comments:</h5>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedCrew.internalComments}</p>
                      </div>
                    )}
                    {selectedCrew.adminNotes && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-1">Admin Notes:</h5>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedCrew.adminNotes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
            
            {/* Modal Footer - Fixed at Bottom */}
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-md">
              <button
                onClick={handlePrintProfile}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center transition-colors duration-200"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print Profile
              </button>
              <button
                onClick={() => setShowClientAssignmentModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center transition-colors duration-200"
              >
                <Users className="h-4 w-4 mr-2" />
                Assign to Client
              </button>
              <button
                onClick={() => {
                  setStatusForm({
                    status: selectedCrew.status,
                    priority: selectedCrew.priority || false,
                    tags: selectedCrew.tags || [],
                    internalComments: selectedCrew.internalComments || '',
                    adminNotes: selectedCrew.adminNotes || ''
                  });
                  setShowStatusModal(true);
                }}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                Update Status
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedCrew && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Update Status</h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={statusForm.status}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="priority"
                    checked={statusForm.priority}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, priority: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="priority" className="ml-2 block text-sm text-gray-900">
                    Mark as Priority
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="approvedForClients"
                    checked={statusForm.approvedForClients}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, approvedForClients: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="approvedForClients" className="ml-2 block text-sm text-gray-900">
                    Approve for Client View
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={statusForm.tags.join(', ')}
                    onChange={(e) => setStatusForm(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                    }))}
                    placeholder="e.g., Yacht, Urgent, Experienced"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Internal Comments</label>
                  <textarea
                    value={statusForm.internalComments}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, internalComments: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Internal notes for admin team..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                  <textarea
                    value={statusForm.adminNotes}
                    onChange={(e) => setStatusForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Notes visible to crew member..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CV Reupload Modal */}
      {showCVReuploadModal && selectedCrew && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Reupload CV</h3>
                <button
                  onClick={() => setShowCVReuploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">Reuploading CV for: <strong>{selectedCrew.fullName}</strong></p>
                <p className="text-sm text-gray-600">Current CV: <strong>{selectedCrew.documents.cv?.name}</strong></p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select New CV File</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCVFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  {cvFile && (
                    <p className="text-sm text-green-600 mt-1">Selected: {cvFile.name}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCVReuploadModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCVReupload}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Reupload CV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Assignment Modal */}
      {showClientAssignmentModal && selectedCrew && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Assign to Client Shortlist</h3>
                <button
                  onClick={() => setShowClientAssignmentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">Assigning: <strong>{selectedCrew.fullName}</strong></p>
                <p className="text-sm text-gray-600">Rank: <strong>{selectedCrew.rank}</strong></p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Choose a client...</option>
                    {clients && clients.length > 0 ? clients.map(client => (
                      <option key={client._id} value={client._id}>
                        {client.companyName} - {client.contactPerson}
                      </option>
                    )) : (
                      <option value="" disabled>No clients available</option>
                    )}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowClientAssignmentModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignToClient}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Assign to Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrewManagement;
