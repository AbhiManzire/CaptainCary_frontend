import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import NotificationService from '../services/notificationService';
import FixedSidebar from '../components/FixedSidebar';
import { useSidebar } from '../contexts/SidebarContext';
import '../components/PageLayout.css';
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
  { value: 'approved', label: 'Approved for Client View', color: 'green' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
  { value: 'missing_docs', label: 'Missing Documents', color: 'orange' },
  { value: 'priority', label: 'Priority / Urgent', color: 'red' }
];

const PRIORITY_TAGS = [
  'Yacht', 'Barge', 'AHTS', 'Tanker', 'Urgent', 'Fast-track', 'High Priority', 'Offshore'
];

const CrewManagementContent = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [crews, setCrews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApiCallInProgress, setIsApiCallInProgress] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [maxRetries] = useState(3);
  const [connectionStatus, setConnectionStatus] = useState('connected'); // 'connected', 'disconnected', 'retrying'
  const fetchCrewsRef = useRef(false);
  const [selectedCrew, setSelectedCrew] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showCVReuploadModal, setShowCVReuploadModal] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [showClientAssignmentModal, setShowClientAssignmentModal] = useState(false);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showCVFormatModal, setShowCVFormatModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [showBulkTagsModal, setShowBulkTagsModal] = useState(false);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);
  const [selectedCrewIds, setSelectedCrewIds] = useState([]);
  const [bulkOperation, setBulkOperation] = useState('');
  const [bulkStatusForm, setBulkStatusForm] = useState({
    status: '',
    priority: false,
    tags: [],
    internalComments: '',
    adminNotes: ''
  });
  const [bulkTagsForm, setBulkTagsForm] = useState({
    tags: []
  });
  const [bulkAssignForm, setBulkAssignForm] = useState({
    clientId: ''
  });
  const [cvFormatOptions, setCvFormatOptions] = useState({
    template: 'cfm-branded',
    includeLogo: true,
    addWatermark: true,
    includeContactInfo: true,
    includeCompanyDetails: true
  });
  const [cvTemplates, setCvTemplates] = useState([
    { 
      id: 'cfm-branded', 
      name: 'CFM Branded Template', 
      description: 'Professional template with Captain Cary branding, watermarks, and company details',
      features: ['Company branding', 'Watermark protection', 'Professional layout', 'Contact information'],
      color: '#3B82F6',
      category: 'professional'
    },
    { 
      id: 'minimal', 
      name: 'Minimal Template', 
      description: 'Clean and simple design without branding',
      features: ['Clean layout', 'No branding', 'Simple format', 'Easy to read'],
      color: '#6B7280',
      category: 'simple'
    },
    { 
      id: 'modern', 
      name: 'Modern Template', 
      description: 'Contemporary design with colors and modern styling',
      features: ['Modern styling', 'Color accents', 'Professional look', 'Contemporary layout'],
      color: '#10B981',
      category: 'modern'
    },
    { 
      id: 'executive', 
      name: 'Executive Template', 
      description: 'High-level executive format with premium styling',
      features: ['Executive layout', 'Premium styling', 'Professional headers', 'Detailed sections'],
      color: '#8B5CF6',
      category: 'executive'
    },
    { 
      id: 'technical', 
      name: 'Technical Template', 
      description: 'Technical format optimized for engineering and technical roles',
      features: ['Technical sections', 'Skills matrix', 'Project details', 'Certifications'],
      color: '#F59E0B',
      category: 'technical'
    }
  ]);
  
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
    visaAvailability: '',
    priority: '',
    tags: '',
    hasVisa: '',
    assignedClients: '',
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

  const fetchCrews = useCallback(async () => {
    // Prevent multiple simultaneous API calls
    if (fetchCrewsRef.current) {
      console.log('⏳ API call already in progress, skipping...');
      return;
    }

    try {
      fetchCrewsRef.current = true;
      setIsApiCallInProgress(true);
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        ...filters
      });
      
      console.log('🔍 Fetching crews...');
      const response = await api.get(`/admin/crew?${params}`, {
        timeout: 15000 // 15 seconds timeout for crew data
      });
      console.log('📊 API Response:', response.data);
      console.log('👥 Crews array:', response.data.crews);
      console.log('📈 Crews count:', response.data.crews?.length);
      
      setCrews(response.data.crews || []);
      setTotalPages(response.data.totalPages || 1);
      setTotal(response.data.total || 0);
      setConnectionStatus('connected');
      setRetryCount(0); // Reset retry count on success
      
      console.log('✅ State updated successfully');
    } catch (error) {
      console.error('❌ Error fetching crews:', error);
      
      // Retry logic for network errors
      if (retryCount < maxRetries && (error.code === 'ECONNABORTED' || error.message.includes('timeout'))) {
        console.log(`🔄 Retrying API call (${retryCount + 1}/${maxRetries})...`);
        setConnectionStatus('retrying');
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          fetchCrews();
        }, 2000 * (retryCount + 1)); // Exponential backoff
        return;
      }
      
      // Set connection status and empty state on error
      setConnectionStatus('disconnected');
      setCrews([]);
      setTotalPages(1);
      setTotal(0);
      setRetryCount(0); // Reset retry count
    } finally {
      setLoading(false);
      setIsApiCallInProgress(false);
      fetchCrewsRef.current = false;
    }
  }, [currentPage, limit, filters]);

  const fetchClients = useCallback(async () => {
    try {
      const response = await api.get('/admin/clients', {
        timeout: 10000 // 10 seconds timeout for clients
      });
      setClients(response.data.clients || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setClients([]); // Set empty array on error
    }
  }, []);

  useEffect(() => {
    console.log('🚀 CrewManagement mounted, fetching crews...');
    fetchCrews();
    fetchClients();
  }, []); // Only run on mount

  // Trigger fetchCrews when filters change (except search)
  useEffect(() => {
    if (filters.search === undefined) return; // Skip initial render
    
    const timeoutId = setTimeout(() => {
      fetchCrews();
    }, 300); // 300ms delay for filter changes

    return () => clearTimeout(timeoutId);
  }, [filters.status, filters.rank, filters.nationality, filters.vesselExperience, filters.submissionDateFrom, filters.submissionDateTo]);

  // Debounced search to prevent too many API calls
  useEffect(() => {
    if (filters.search === undefined) return; // Skip initial render
    
    const timeoutId = setTimeout(() => {
      fetchCrews();
    }, 500); // 500ms delay for search

    return () => clearTimeout(timeoutId);
  }, [filters.search]);

  // Trigger fetchCrews when pagination changes
  useEffect(() => {
    if (currentPage === 1) return; // Skip initial render
    fetchCrews();
  }, [currentPage]);

  // Debug crews state changes (commented out to prevent performance issues)
  // useEffect(() => {
  //   console.log('🔄 Crews state changed:', crews.length, crews);
  // }, [crews]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleStatusUpdate = async () => {
    try {
      await api.patch(`/admin/crew/${selectedCrew._id}/status`, statusForm, {
        timeout: 10000 // 10 seconds timeout
      });
      
      // Send notification to crew about status update
      try {
        await NotificationService.notifyCrewStatusUpdate(
          selectedCrew,
          statusForm.status,
          statusForm.adminNotes
        );
      } catch (notificationError) {
        console.error('Status notification failed:', notificationError);
        // Don't fail the status update if notification fails
      }

      setShowStatusModal(false);
      setShowDetailModal(false);
      // Restore sidebar when modal closes
      setSidebarOpen(true);
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
      const response = await api.get(`/crew/${crewId}`, {
        timeout: 10000 // 10 seconds timeout
      });
      setSelectedCrew(response.data);
      setShowDetailModal(true);
      // Hide sidebar when modal opens
      setSidebarOpen(false);
    } catch (error) {
      console.error('Error fetching crew details:', error);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/admin/export/crew?${params}`, {
        responseType: 'blob',
        timeout: 20000 // 20 seconds timeout for export
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

  const handleCVFormat = async () => {
    try {
      const response = await api.post(`/crew/${selectedCrew._id}/format-cv`, cvFormatOptions);
      // Download formatted CV
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedCrew.fullName}-CFM-Formatted-CV.docx`;
      link.click();
      window.URL.revokeObjectURL(url);
      setShowCVFormatModal(false);
      // Restore sidebar when modal closes
      setSidebarOpen(true);
    } catch (error) {
      console.error('Error formatting CV:', error);
    }
  };

  const handlePriorityUpdate = async () => {
    try {
      await api.patch(`/crew/${selectedCrew._id}/priority`, {
        isPriority: true,
        priorityTags: statusForm.tags,
        priorityReason: statusForm.internalComments
      });
      setShowPriorityModal(false);
      fetchCrews();
    } catch (error) {
      console.error('Error updating priority:', error);
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
      // Restore sidebar when modal closes
      setSidebarOpen(true);
      fetchCrews(); // Refresh the crew list
      alert('CV reuploaded successfully');
    } catch (error) {
      console.error('Error reuploading CV:', error);
      alert('Error reuploading CV');
    }
  };

  const handleDownloadFormattedCV = async (crewId) => {
    try {
      const response = await api.post(`/crew/${crewId}/cv/format`, {
        template: cvFormatOptions.template,
        includeLogo: cvFormatOptions.includeLogo,
        addWatermark: cvFormatOptions.addWatermark,
        includeContactInfo: cvFormatOptions.includeContactInfo,
        includeCompanyDetails: cvFormatOptions.includeCompanyDetails
      }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Formatted_CV_${selectedCrew.fullName.replace(/\s+/g, '_')}_${cvFormatOptions.template}.rtf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading formatted CV:', error);
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
      // Restore sidebar when modal closes
      setSidebarOpen(true);
      fetchCrews(); // Refresh the crew list
      alert('Crew assigned to client shortlist successfully');
    } catch (error) {
      console.error('Error assigning crew to client:', error);
      alert('Error assigning crew to client');
    }
  };

  const handleRemoveFromClient = async (clientId) => {
    if (!window.confirm('Are you sure you want to remove this crew member from the client shortlist?')) {
      return;
    }

    try {
      await api.delete(`/admin/crew/${selectedCrew._id}/remove-client/${clientId}`);
      fetchCrews(); // Refresh the crew list
      alert('Crew removed from client shortlist successfully');
    } catch (error) {
      console.error('Error removing crew from client:', error);
      alert('Error removing crew from client');
    }
  };

  // Bulk operation handlers
  const handleBulkOperation = (operation) => {
    if (selectedCrewIds.length === 0) {
      alert('Please select crew members first');
      return;
    }
    
    setBulkOperation(operation);
    
    switch (operation) {
      case 'status':
        setShowBulkStatusModal(true);
        break;
      case 'tags':
        setShowBulkTagsModal(true);
        break;
      case 'assign':
        setShowBulkAssignModal(true);
        break;
      default:
        setShowBulkModal(true);
    }
  };

  const handleBulkStatusUpdate = async () => {
    try {
      const response = await api.patch('/admin/crew/bulk-status', {
        crewIds: selectedCrewIds,
        ...bulkStatusForm
      });
      
      alert(`Bulk status update completed: ${response.data.summary.successful} successful, ${response.data.summary.failed} failed`);
      setShowBulkStatusModal(false);
      setSelectedCrewIds([]);
      fetchCrews();
    } catch (error) {
      console.error('Bulk status update error:', error);
      alert('Error updating crew status');
    }
  };

  const handleBulkTagsUpdate = async () => {
    try {
      const response = await api.patch('/admin/crew/bulk-tags', {
        crewIds: selectedCrewIds,
        tags: bulkTagsForm.tags
      });
      
      alert(`Bulk tag assignment completed: ${response.data.summary.successful} successful, ${response.data.summary.failed} failed`);
      setShowBulkTagsModal(false);
      setSelectedCrewIds([]);
      fetchCrews();
    } catch (error) {
      console.error('Bulk tags update error:', error);
      alert('Error updating crew tags');
    }
  };

  const handleBulkClientAssign = async () => {
    try {
      const response = await api.post('/admin/crew/bulk-assign-client', {
        crewIds: selectedCrewIds,
        clientId: bulkAssignForm.clientId
      });
      
      alert(`Bulk assignment completed: ${response.data.summary.successful} successful, ${response.data.summary.failed} failed`);
      setShowBulkAssignModal(false);
      setSelectedCrewIds([]);
      fetchCrews();
    } catch (error) {
      console.error('Bulk assignment error:', error);
      alert('Error assigning crew to client');
    }
  };

  const handleBulkExport = async (format = 'csv') => {
    try {
      const response = await api.post('/admin/crew/bulk-export', {
        crewIds: selectedCrewIds,
        format
      }, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `crew-data.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setSelectedCrewIds([]);
    } catch (error) {
      console.error('Bulk export error:', error);
      alert('Error exporting crew data');
    }
  };

  const handleCrewSelection = (crewId, isSelected) => {
    if (isSelected) {
      setSelectedCrewIds(prev => [...prev, crewId]);
    } else {
      setSelectedCrewIds(prev => prev.filter(id => id !== crewId));
    }
  };

  const handleSelectAll = () => {
    if (selectedCrewIds.length === crews.length) {
      setSelectedCrewIds([]);
    } else {
      setSelectedCrewIds(crews.map(crew => crew._id));
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
    <div className="min-h-screen bg-gray-50 flex page-layout-stable">
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
            <div className="flex items-center py-6">
              <div className="flex items-center">
                <Ship className="h-8 w-8 text-primary-600 mr-2" />
                <h1 className="text-2xl font-bold text-gray-900">Crew Management</h1>
              </div>
              {/* <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connecteda' ? 'bg-green-500' :
                    connectionStatus === 'retrying' ? 'bg-yellow-500 animate-pulse' :
                    'bg-red-500'
                  }`}></div>
                  <span className="text-xs text-gray-500">
                    {connectionStatus === 'connected' ? 'Connected' :
                     connectionStatus === 'retrying' ? 'Retrying...' :
                     'Disconnected'}
                  </span>
                </div>
                
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </button>
              </div> */}
            </div>
          </div>
        </header>

        <div className="flex-1 py-4 sm:py-6 lg:py-8">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Crew</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {crews.filter(c => c.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <Check className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Approved</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {crews.filter(c => c.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                <X className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Missing Docs</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full hover:border-gray-400 transition-colors duration-200"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={fetchCrews}
                  disabled={isApiCallInProgress}
                  className={`flex items-center px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm ${
                    isApiCallInProgress ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${isApiCallInProgress ? 'animate-spin' : ''}`} />
                  {isApiCallInProgress ? 'Refreshing...' : 'Refresh'}
                </button>
                <button
                  onClick={handleExport}
                  className="flex items-center px-3 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </button>
              </div>
            </div>

            {/* Bulk Operations */}
            {selectedCrewIds.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-blue-800">
                      {selectedCrewIds.length} crew member{selectedCrewIds.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleBulkOperation('status')}
                      className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Update Status
                    </button>
                    <button
                      onClick={() => handleBulkOperation('tags')}
                      className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      <Tag className="h-4 w-4 mr-1" />
                      Assign Tags
                    </button>
                    <button
                      onClick={() => handleBulkOperation('assign')}
                      className="flex items-center px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    >
                      <Users className="h-4 w-4 mr-1" />
                      Assign to Client
                    </button>
                    <button
                      onClick={() => handleBulkExport('csv')}
                      className="flex items-center px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export CSV
                    </button>
                    <button
                      onClick={() => handleBulkExport('excel')}
                      className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export Excel
                    </button>
                    <button
                      onClick={() => setSelectedCrewIds([])}
                      className="flex items-center px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Clear Selection
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Row - Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative min-w-[120px]">
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-700 appearance-none cursor-pointer hover:border-gray-400 transition-colors duration-200 text-sm"
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

              <div className="relative min-w-[130px]">
                <select
                  value={filters.rank}
                  onChange={(e) => handleFilterChange('rank', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-700 appearance-none cursor-pointer hover:border-gray-400 transition-colors duration-200 text-sm"
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

              <div className="min-w-[120px]">
                <input
                  type="text"
                  placeholder="Nationality"
                  value={filters.nationality}
                  onChange={(e) => handleFilterChange('nationality', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-400 transition-colors duration-200 text-sm"
                />
              </div>

              <div className="relative min-w-[130px]">
                <select
                  value={filters.vesselExperience}
                  onChange={(e) => handleFilterChange('vesselExperience', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white text-gray-700 appearance-none cursor-pointer hover:border-gray-400 transition-colors duration-200 text-sm"
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Advanced Filters</h3>
            <button
              onClick={() => setFilters({
                search: '',
                status: '',
                rank: '',
                nationality: '',
                submissionDateFrom: '',
                submissionDateTo: '',
                vesselExperience: '',
                visaAvailability: '',
                priority: '',
                tags: '',
                hasVisa: '',
                assignedClients: '',
                sortBy: 'submittedAt',
                sortOrder: 'desc'
              })}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Clear All Filters
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Date Range Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Submission Date From</label>
              <input
                type="date"
                value={filters.submissionDateFrom}
                onChange={(e) => handleFilterChange('submissionDateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Submission Date To</label>
              <input
                type="date"
                value={filters.submissionDateTo}
                onChange={(e) => handleFilterChange('submissionDateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            
            {/* Visa and Priority Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visa Status</label>
              <select
                value={filters.visaAvailability}
                onChange={(e) => handleFilterChange('visaAvailability', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">All Visa Status</option>
                <option value="yes">Has Visa</option>
                <option value="no">No Visa</option>
                <option value="expired">Visa Expired</option>
                <option value="valid">Visa Valid</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority Level</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">All Priority</option>
                <option value="true">High Priority</option>
                <option value="false">Normal Priority</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            {/* Tags and Client Assignment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <select
                value={filters.tags}
                onChange={(e) => handleFilterChange('tags', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">All Tags</option>
                {PRIORITY_TAGS.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
                <option value="untagged">Untagged</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Client Assignment</label>
              <select
                value={filters.assignedClients}
                onChange={(e) => handleFilterChange('assignedClients', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">All Assignments</option>
                <option value="assigned">Assigned to Clients</option>
                <option value="unassigned">Not Assigned</option>
                <option value="multiple">Multiple Clients</option>
              </select>
            </div>
            
            {/* Experience and Availability */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Experience Level</label>
              <select
                value={filters.vesselExperience}
                onChange={(e) => handleFilterChange('vesselExperience', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">All Experience</option>
                <option value="junior">Junior (0-2 years)</option>
                <option value="mid">Mid-level (3-5 years)</option>
                <option value="senior">Senior (5+ years)</option>
                <option value="expert">Expert (10+ years)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <select
                value={filters.hasVisa}
                onChange={(e) => handleFilterChange('hasVisa', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">All Availability</option>
                <option value="immediate">Immediate (0-7 days)</option>
                <option value="short">Short term (1-4 weeks)</option>
                <option value="medium">Medium term (1-3 months)</option>
                <option value="long">Long term (3+ months)</option>
              </select>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {Object.values(filters).some(value => value !== '' && value !== 'submittedAt' && value !== 'desc') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              <button
                onClick={() => setFilters({
                  search: '',
                  status: '',
                  rank: '',
                  nationality: '',
                  submissionDateFrom: '',
                  submissionDateTo: '',
                  vesselExperience: '',
                  visaAvailability: '',
                  priority: '',
                  tags: '',
                    hasVisa: '',
                    assignedClients: '',
                  sortBy: 'submittedAt',
                  sortOrder: 'desc'
                })}
                  className="text-xs text-red-600 hover:text-red-800"
              >
                  Clear All
              </button>
            </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {Object.entries(filters).map(([key, value]) => {
                  if (value && value !== '' && key !== 'sortBy' && key !== 'sortOrder') {
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                      >
                        {key}: {value}
                        <button
                          onClick={() => handleFilterChange(key, '')}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    );
                  }
                  return null;
                })}
          </div>
            </div>
          )}
        </div>

        {/* Crew Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div 
            className="overflow-x-auto max-h-[600px] overflow-y-auto border border-gray-200 rounded-lg"
            style={{
              scrollbarWidth: 'thin',
              scrollbarColor: '#6B7280 #F3F4F6'
            }}
          >
            <table className="min-w-full divide-y divide-gray-200" style={{ minWidth: '1200px' }}>
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    <input
                      type="checkbox"
                      checked={selectedCrewIds.length === crews.length && crews.length > 0}
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </th>
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
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
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
                      No crew members found (Debug: crews.length = {crews.length})
                    </td>
                  </tr>
                ) : (
                  crews.map((crew) => (
                    <tr key={crew._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedCrewIds.includes(crew._id)}
                            onChange={(e) => handleCrewSelection(crew._id, e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-600">
                                  {crew.fullName ? crew.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'CR'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{crew.fullName || 'Unknown'}</div>
                              <div className="text-sm text-gray-500">{crew.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{crew.rank || 'Unknown'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{crew.nationality || 'Unknown'}</div>
                        </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(crew.availabilityDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col space-y-1">
                        {getStatusBadge(crew.status)}
                        {crew.priority && (
                              <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            Priority
                          </span>
                        )}
                            {crew.clientShortlists && crew.clientShortlists.length > 0 && (
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                {crew.clientShortlists.length} Client{crew.clientShortlists.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(crew.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium w-32">
                        <div className="flex justify-end space-x-3 pr-4">
                          <button
                            onClick={() => handleViewDetails(crew._id)}
                            className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50 transition-colors"
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
                            className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100 transition-colors"
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

        {/* Quick Actions & Info - Bottom Section */}
        <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions & Info</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Quick Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Crew:</span>
                      <span className="font-medium">{total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pending:</span>
                      <span className="font-medium text-yellow-600">{crews.filter(c => c.status === 'pending').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Approved:</span>
                      <span className="font-medium text-green-600">{crews.filter(c => c.status === 'approved').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Missing Docs:</span>
                      <span className="font-medium text-red-600">{crews.filter(c => c.status === 'missing_docs').length}</span>
                    </div>
                  </div>
              </div>

              {/* Quick Filters */}
              <div className="bg-gray-50 rounded-lg p-4">
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
                      onClick={() => handleFilterChange('status', 'missing_docs')}
                      className="w-full text-left px-3 py-2 text-sm bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Show Missing Docs
                    </button>
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
                      className="w-full text-left px-3 py-2 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Submissions</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {crews.slice(0, 5).map((crew) => (
                      <div key={crew._id} className="text-xs text-gray-600 border-b border-gray-200 pb-2">
                        <div className="font-medium text-gray-900">{crew.fullName}</div>
                        <div className="text-gray-500">{crew.rank} • {formatDate(crew.submittedAt)}</div>
                        <div className="flex items-center mt-1">
                          {getStatusBadge(crew.status)}
                          {crew.priority && (
                            <span className="ml-2 px-1 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                              Priority
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <button
                      onClick={handleExport}
                      className="w-full flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export Data
                    </button>
                    <button
                      onClick={fetchCrews}
                      disabled={isApiCallInProgress}
                      className={`w-full flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors ${
                        isApiCallInProgress ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isApiCallInProgress ? 'animate-spin' : ''}`} />
                      {isApiCallInProgress ? 'Refreshing...' : 'Refresh Data'}
                    </button>
                  </div>
              </div>
            </div>
          </div>
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
                            <button
                              onClick={() => setShowCVFormatModal(true)}
                              className="text-purple-600 hover:text-purple-800"
                              title="Format CV"
                            >
                              <FileText className="h-4 w-4" />
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
                onClick={() => {
                  setShowDetailModal(false);
                  // Restore sidebar when modal closes
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
                  onClick={() => {
                    setShowStatusModal(false);
                    // Restore sidebar when modal closes
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

      {/* CV Reupload Modal */}
      {showCVReuploadModal && selectedCrew && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Reupload CV</h3>
                <button
                  onClick={() => {
                    setShowCVReuploadModal(false);
                    // Restore sidebar when modal closes
                    setSidebarOpen(true);
                  }}
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
                  onClick={() => {
                    setShowCVReuploadModal(false);
                    // Restore sidebar when modal closes
                    setSidebarOpen(true);
                  }}
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

      {/* CV Formatting Modal */}
      {showCVFormatModal && selectedCrew && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-0 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Format CV</h3>
                <button
                  onClick={() => {
                    setShowCVFormatModal(false);
                    // Restore sidebar when modal closes
                    setSidebarOpen(true);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Formatting CV for:</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900">{selectedCrew.fullName}</p>
                  <p className="text-sm text-gray-600">{selectedCrew.rank} • {selectedCrew.nationality}</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Template Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Choose Template</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cvTemplates.map(template => (
                      <div
                        key={template.id}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          cvFormatOptions.template === template.id
                            ? 'border-primary-500 bg-primary-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => setCvFormatOptions(prev => ({ ...prev, template: template.id }))}
                      >
                        <div className="flex items-start">
                          <input
                            type="radio"
                            name="template"
                            value={template.id}
                            checked={cvFormatOptions.template === template.id}
                            onChange={() => setCvFormatOptions(prev => ({ ...prev, template: template.id }))}
                            className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: template.color }}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                              {template.features.map((feature, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                  {feature}
                                </span>
                              ))}
                            </div>
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                template.category === 'professional' ? 'bg-blue-100 text-blue-800' :
                                template.category === 'simple' ? 'bg-gray-100 text-gray-800' :
                                template.category === 'modern' ? 'bg-green-100 text-green-800' :
                                template.category === 'executive' ? 'bg-purple-100 text-purple-800' :
                                'bg-orange-100 text-orange-800'
                              }`}>
                                {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Formatting Options */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Formatting Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="includeLogo"
                          checked={cvFormatOptions.includeLogo}
                          onChange={(e) => setCvFormatOptions(prev => ({ ...prev, includeLogo: e.target.checked }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="includeLogo" className="ml-2 block text-sm text-gray-700">
                          Include Captain Cary Logo
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="addWatermark"
                          checked={cvFormatOptions.addWatermark}
                          onChange={(e) => setCvFormatOptions(prev => ({ ...prev, addWatermark: e.target.checked }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="addWatermark" className="ml-2 block text-sm text-gray-700">
                          Add Confidential Watermark
                        </label>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="includeContactInfo"
                          checked={cvFormatOptions.includeContactInfo}
                          onChange={(e) => setCvFormatOptions(prev => ({ ...prev, includeContactInfo: e.target.checked }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="includeContactInfo" className="ml-2 block text-sm text-gray-700">
                          Include Contact Information
                        </label>
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="includeCompanyDetails"
                          checked={cvFormatOptions.includeCompanyDetails}
                          onChange={(e) => setCvFormatOptions(prev => ({ ...prev, includeCompanyDetails: e.target.checked }))}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="includeCompanyDetails" className="ml-2 block text-sm text-gray-700">
                          Include Company Details
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCVFormatModal(false);
                    // Restore sidebar when modal closes
                    setSidebarOpen(true);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDownloadFormattedCV(selectedCrew._id)}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Formatted CV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Assignment Modal */}
      {showClientAssignmentModal && selectedCrew && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-0 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Assign to Client Shortlist</h3>
                <button
                  onClick={() => {
                    setShowClientAssignmentModal(false);
                    // Restore sidebar when modal closes
                    setSidebarOpen(true);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Assigning crew member:</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                      <span className="text-sm font-medium text-primary-600">
                        {selectedCrew.fullName ? selectedCrew.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'CR'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedCrew.fullName}</p>
                      <p className="text-sm text-gray-600">{selectedCrew.rank} • {selectedCrew.nationality}</p>
                      <p className="text-xs text-gray-500">Available: {formatDate(selectedCrew.availabilityDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Current Assignments */}
                {selectedCrew.clientShortlists && selectedCrew.clientShortlists.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Currently Assigned To:</h4>
                    <div className="space-y-2">
                      {selectedCrew.clientShortlists.map((client, index) => (
                        <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{client.companyName}</p>
                            <p className="text-xs text-gray-600">{client.contactPerson}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveFromClient(client._id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* New Assignment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Assign to New Client</label>
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
                  
                  {selectedClientId && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        This crew member will be added to the selected client's shortlist for future opportunities.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowClientAssignmentModal(false);
                    // Restore sidebar when modal closes
                    setSidebarOpen(true);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignToClient}
                  disabled={!selectedClientId}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Assign to Client
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Status Update Modal */}
      {showBulkStatusModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Bulk Status Update</h3>
                <button
                  onClick={() => setShowBulkStatusModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={bulkStatusForm.status}
                    onChange={(e) => setBulkStatusForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select status</option>
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
                    id="bulkPriority"
                    checked={bulkStatusForm.priority}
                    onChange={(e) => setBulkStatusForm(prev => ({ ...prev, priority: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="bulkPriority" className="ml-2 block text-sm text-gray-900">
                    Mark as Priority
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={bulkStatusForm.tags.join(', ')}
                    onChange={(e) => setBulkStatusForm(prev => ({ 
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
                    value={bulkStatusForm.internalComments}
                    onChange={(e) => setBulkStatusForm(prev => ({ ...prev, internalComments: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Internal notes for admin team..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes</label>
                  <textarea
                    value={bulkStatusForm.adminNotes}
                    onChange={(e) => setBulkStatusForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Notes visible to crew members..."
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowBulkStatusModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkStatusUpdate}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Update {selectedCrewIds.length} Crew Members
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Tags Modal */}
      {showBulkTagsModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Bulk Tag Assignment</h3>
                <button
                  onClick={() => setShowBulkTagsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={bulkTagsForm.tags.join(', ')}
                    onChange={(e) => setBulkTagsForm(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag) 
                    }))}
                    placeholder="e.g., Yacht, Urgent, Experienced"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowBulkTagsModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkTagsUpdate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Assign Tags to {selectedCrewIds.length} Crew Members
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Client Assignment Modal */}
      {showBulkAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Bulk Client Assignment</h3>
                <button
                  onClick={() => setShowBulkAssignModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Client</label>
                  <select
                    value={bulkAssignForm.clientId}
                    onChange={(e) => setBulkAssignForm(prev => ({ ...prev, clientId: e.target.value }))}
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
                  onClick={() => setShowBulkAssignModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBulkClientAssign}
                  disabled={!bulkAssignForm.clientId}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Assign {selectedCrewIds.length} Crew Members
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

const CrewManagement = () => {
  return <CrewManagementContent />;
};

export default CrewManagement;
