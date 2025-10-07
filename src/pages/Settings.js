import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import FixedSidebar from '../components/FixedSidebar';
import { useSidebar } from '../contexts/SidebarContext';
import { 
  Settings as SettingsIcon,
  Users,
  FileText,
  Download,
  Upload,
  Edit,
  Eye,
  Tag,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  Search,
  Filter,
  Printer,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  Shield,
  Bell,
  RefreshCw,
  Plus,
  MoreVertical,
  ChevronDown,
  ChevronUp
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
  { value: 'approved', label: 'Approved for Client View', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'missing_docs', label: 'Missing Documents', color: 'orange' },
  { value: 'priority', label: 'Priority / Urgent', color: 'red' }
];

const PRIORITY_TAGS = [
  'Yacht', 'Barge', 'AHTS', 'Tanker', 'Urgent', 'Fast-track', 'High Priority', 'Offshore'
];

const SettingsContent = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [crews, setCrews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showClientAssignmentModal, setShowClientAssignmentModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  
  // Status Management Data
  const [statusCounts, setStatusCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    missingDocs: 0,
    priority: 0
  });
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    rank: '',
    nationality: '',
    submissionDateFrom: '',
    submissionDateTo: '',
    vesselExperience: '',
    visaAvailability: '',
    priority: '',
    tags: ''
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

  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState({
    totalCrew: 0,
    approved: 0,
    pending: 0,
    missingDocs: 0,
    urgent: 0
  });

  useEffect(() => {
    fetchCrews();
    fetchClients();
    fetchDashboardStats();
    fetchStatusCounts();
  }, []);

  const fetchCrews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams(filters);
      const response = await api.get(`/admin/crew?${params}`);
      setCrews(response.data.crews || []);
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
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setDashboardStats(response.data.crewStats || {});
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  // Fetch status counts for Status Management
  const fetchStatusCounts = async () => {
    try {
      const response = await api.get('/admin/crew/status-counts');
      setStatusCounts(response.data);
    } catch (error) {
      console.error('Error fetching status counts:', error);
      // Fallback: calculate from crews data
      if (crews.length > 0) {
        const counts = {
          pending: crews.filter(crew => crew.status === 'pending').length,
          approved: crews.filter(crew => crew.status === 'approved').length,
          rejected: crews.filter(crew => crew.status === 'rejected').length,
          missingDocs: crews.filter(crew => crew.status === 'missing_docs').length,
          priority: crews.filter(crew => crew.priority === 'high').length
        };
        setStatusCounts(counts);
      }
    }
  };

  const handleViewDetails = async (crewId) => {
    try {
      const response = await api.get(`/crew/${crewId}`);
      setSelectedCrew(response.data);
      setShowDetailModal(true);
      setSidebarOpen(false);
    } catch (error) {
      console.error('Error fetching crew details:', error);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await api.patch(`/admin/crew/${selectedCrew._id}/status`, statusForm);
      setShowStatusModal(false);
      setShowDetailModal(false);
      setSidebarOpen(true);
      fetchCrews();
      fetchDashboardStats();
    } catch (error) {
      console.error('Error updating status:', error);
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
      fetchCrews();
      alert('Crew assigned to client shortlist successfully');
    } catch (error) {
      console.error('Error assigning crew to client:', error);
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

  const tabs = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: Users },
    { id: 'crew-management', label: 'Crew Profile Management', icon: FileText },
    { id: 'status-management', label: 'Status Management', icon: CheckCircle },
    { id: 'export-download', label: 'Export/Download', icon: Download }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <FixedSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        logout={logout}
        reminders={[]}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <SettingsIcon className="h-8 w-8 text-primary-600 mr-2" />
                <h1 className="text-2xl font-bold text-gray-900">Admin Settings & Management</h1>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 py-4 sm:py-6 lg:py-8">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${
                          activeTab === tab.id
                            ? 'border-primary-500 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                          <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm font-medium text-gray-500">Total Crew</p>
                        <p className="text-xl sm:text-2xl font-semibold text-gray-900">{dashboardStats.totalCrew || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                          <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm font-medium text-gray-500">Approved</p>
                        <p className="text-xl sm:text-2xl font-semibold text-gray-900">{dashboardStats.approved || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                          <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                        </div>
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm font-medium text-gray-500">Pending</p>
                        <p className="text-xl sm:text-2xl font-semibold text-gray-900">{dashboardStats.pending || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                          <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                        </div>
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm font-medium text-gray-500">Missing Docs</p>
                        <p className="text-xl sm:text-2xl font-semibold text-gray-900">{dashboardStats.missingDocs || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab('crew-management')}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 group"
                    >
                      <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                        <FileText className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="text-left ml-4">
                        <p className="font-medium text-gray-900 group-hover:text-primary-700">Manage Crew Profiles</p>
                        <p className="text-sm text-gray-600">View and manage all crew submissions</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('status-management')}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 group"
                    >
                      <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                        <CheckCircle className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="text-left ml-4">
                        <p className="font-medium text-gray-900 group-hover:text-primary-700">Status Management</p>
                        <p className="text-sm text-gray-600">Update crew status and approvals</p>
                      </div>
                    </button>

                    <button
                      onClick={() => setActiveTab('export-download')}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 group"
                    >
                      <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                        <Download className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="text-left ml-4">
                        <p className="font-medium text-gray-900 group-hover:text-primary-700">Export Data</p>
                        <p className="text-sm text-gray-600">Download crew data and reports</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'crew-management' && (
              <div className="space-y-6">
                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Crew Profile Management</h3>
                  
                  {/* Search and Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by name, email..."
                          value={filters.search}
                          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">All Status</option>
                        {STATUS_OPTIONS.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rank</label>
                      <select
                        value={filters.rank}
                        onChange={(e) => setFilters(prev => ({ ...prev, rank: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">All Ranks</option>
                        {RANKS.map(rank => (
                          <option key={rank} value={rank}>{rank}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                      <input
                        type="text"
                        placeholder="Nationality"
                        value={filters.nationality}
                        onChange={(e) => setFilters(prev => ({ ...prev, nationality: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={fetchCrews}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Apply Filters
                  </button>
                </div>

                {/* Crew Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Crew Member
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rank
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
                            <td colSpan="5" className="px-6 py-12 text-center">
                              <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                              </div>
                            </td>
                          </tr>
                        ) : crews.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
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
                                {getStatusBadge(crew.status)}
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
                </div>
              </div>
            )}

            {/* Status Management Tab */}
            {activeTab === 'status-management' && (
              <div className="space-y-6">
                {/* Status Overview */}
              <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-6">Crew Status Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <Clock className="h-8 w-8 text-yellow-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Pending Review</p>
                          <p className="text-2xl font-bold text-yellow-900">{statusCounts.pending}</p>
              </div>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-green-800">Approved</p>
                          <p className="text-2xl font-bold text-green-900">{statusCounts.approved}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <X className="h-8 w-8 text-red-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Rejected</p>
                          <p className="text-2xl font-bold text-red-900">{statusCounts.rejected}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertTriangle className="h-8 w-8 text-orange-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-orange-800">Missing Docs</p>
                          <p className="text-2xl font-bold text-orange-900">{statusCounts.missingDocs}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bulk Status Update */}
              <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Status Update</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Status
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                          <option value="">Choose status...</option>
                          <option value="approved">Approved for Client View</option>
                          <option value="pending">Pending Review</option>
                          <option value="rejected">Rejected</option>
                          <option value="missing_docs">Missing Documents</option>
                          <option value="priority">Priority / Urgent</option>
                        </select>
              </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Filter by Rank
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                          <option value="">All Ranks</option>
                          {RANKS.map(rank => (
                            <option key={rank} value={rank}>{rank}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                        <CheckCircle className="h-4 w-4 inline mr-2" />
                        Apply Status Update
                      </button>
                      <button className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors">
                        <RefreshCw className="h-4 w-4 inline mr-2" />
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </div>

                {/* Status Rules */}
              <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Status Rules & Guidelines</h3>
                  <div className="space-y-4">
                    <div className="border-l-4 border-yellow-400 pl-4">
                      <h4 className="font-medium text-gray-900">Pending Review</h4>
                      <p className="text-sm text-gray-600">New submissions awaiting initial review</p>
                    </div>
                    <div className="border-l-4 border-green-400 pl-4">
                      <h4 className="font-medium text-gray-900">Approved for Client View</h4>
                      <p className="text-sm text-gray-600">Crew members ready for client shortlisting</p>
                    </div>
                    <div className="border-l-4 border-red-400 pl-4">
                      <h4 className="font-medium text-gray-900">Rejected</h4>
                      <p className="text-sm text-gray-600">Crew members not meeting requirements</p>
                    </div>
                    <div className="border-l-4 border-orange-400 pl-4">
                      <h4 className="font-medium text-gray-900">Missing Documents</h4>
                      <p className="text-sm text-gray-600">Crew members with incomplete documentation</p>
                    </div>
                    <div className="border-l-4 border-purple-400 pl-4">
                      <h4 className="font-medium text-gray-900">Priority / Urgent</h4>
                      <p className="text-sm text-gray-600">High-priority crew members requiring immediate attention</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'export-download' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Export/Download</h3>
                <div className="space-y-4">
                  <button
                    onClick={handleExport}
                    className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Crew Data (CSV)
                  </button>
                  <p className="text-gray-600">Export functionality for crew data and reports.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Crew Detail Modal */}
      {showDetailModal && selectedCrew && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-0 border w-11/12 max-w-5xl shadow-lg rounded-md bg-white flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-white rounded-t-md">
              <h3 className="text-lg font-medium text-gray-900">Crew Details</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSidebarOpen(true);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
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
                  </div>
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
                              <CheckCircle className="h-4 w-4 text-green-600" />
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
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
                onClick={() => {
                  setShowDetailModal(false);
                  setSidebarOpen(true);
                }}
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
                  onClick={() => {
                    setShowStatusModal(false);
                    setSidebarOpen(true);
                  }}
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
                  onClick={() => {
                    setShowStatusModal(false);
                    setSidebarOpen(true);
                  }}
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

      {/* Client Assignment Modal */}
      {showClientAssignmentModal && selectedCrew && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Assign to Client Shortlist</h3>
                <button
                  onClick={() => {
                    setShowClientAssignmentModal(false);
                    setSidebarOpen(true);
                  }}
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
                  onClick={() => {
                    setShowClientAssignmentModal(false);
                    setSidebarOpen(true);
                  }}
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

const Settings = () => {
  return <SettingsContent />;
};

export default Settings;
