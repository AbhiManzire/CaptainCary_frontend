import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import NotificationService from '../services/notificationService';
import ClientSidebar from '../components/ClientSidebar';
import { useSidebar } from '../contexts/SidebarContext';
import '../components/PageLayout.css';
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
  const { sidebarOpen, setSidebarOpen } = useSidebar();
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

  // Ensure sidebar state remains stable
  useEffect(() => {
    // Keep sidebar state consistent across navigation
    if (sidebarOpen === undefined) {
      setSidebarOpen(true);
    }
  }, [sidebarOpen, setSidebarOpen]);


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
      setRequestHistory(response.data?.requests || []);
    } catch (error) {
      console.error('Error fetching request history:', error);
      setRequestHistory([]);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleViewDetails = async (crewId) => {
    try {
      console.log('Fetching crew details for:', crewId);
      const response = await api.get(`/client/crew/${crewId}`);
      console.log('Crew details response:', response.data);
      console.log('Approved for clients:', response.data.approvedForClients);
      console.log('Documents available:', response.data.documents);
      
      setSelectedCrew(response.data);
      setShowDetailModal(true);
      // Hide sidebar when modal opens
      setSidebarOpen(false);
      // Close Send Request modal if it's open
      setShowRequestModal(false);
    } catch (error) {
      console.error('Error fetching crew details:', error);
      alert('Error fetching crew details: ' + (error.response?.data?.message || error.message));
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
      const response = await api.post('/client/requests', {
        crewId: selectedCrew._id,
        requestType: requestForm.requestType,
        message: requestForm.message,
        urgency: requestForm.urgency
      });

      // Send notification to admin about new client request
      try {
        await NotificationService.notifyClientRequest({
          client: user,
          crew: selectedCrew,
          requestType: requestForm.requestType,
          message: requestForm.message,
          urgency: requestForm.urgency
        });
      } catch (notificationError) {
        console.error('Request notification failed:', notificationError);
        // Don't fail the request if notification fails
      }

      setShowRequestModal(false);
      // Close View Details modal as well
      setShowDetailModal(false);
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
      console.log('Viewing certificate:', crewId, docType);
      console.log('Selected crew data:', selectedCrew);
      
      // First check if crew is approved for clients
      if (!selectedCrew || !selectedCrew.approvedForClients) {
        alert('This crew member is not approved for client view yet. Please contact admin.');
        return;
      }
      
      // For CV, use different endpoint
      const endpoint = docType === 'cv' 
        ? `/client/crew/${crewId}/cv`
        : `/client/crew/${crewId}/certificate/${docType}`;
      
      console.log('API endpoint:', endpoint);
      
      // Use the API endpoint directly for better CORS handling
      const documentUrl = `http://localhost:5000/api${endpoint}`;
      console.log('Document URL:', documentUrl);
      
      // Add authentication token to the URL for API access
      const token = localStorage.getItem('token');
      const authenticatedUrl = `${documentUrl}?token=${token}`;
      console.log('Authenticated URL:', authenticatedUrl);
      
      // Try to fetch the document as a blob first for better handling
      let finalUrl = authenticatedUrl;
      try {
        const response = await fetch(authenticatedUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
          },
          mode: 'cors'
        });
        
        console.log('Fetch response status:', response.status);
        console.log('Fetch response headers:', response.headers);
        
        if (response.ok) {
          const blob = await response.blob();
          console.log('Blob size:', blob.size);
          console.log('Blob type:', blob.type);
          
          if (blob.size > 0) {
            const blobUrl = URL.createObjectURL(blob);
            finalUrl = blobUrl;
            console.log('Using blob URL for document:', finalUrl);
          } else {
            console.log('Blob is empty, using direct URL');
          }
        } else {
          console.log('Response not OK, using direct URL');
        }
      } catch (fetchError) {
        console.log('Fetch failed, using direct URL:', fetchError);
        // Continue with authenticated URL
      }
      
      // Determine MIME type based on document type
      let mimeType = 'application/pdf'; // Default to PDF
      switch(docType) {
        case 'photo':
          mimeType = 'image/jpeg';
          break;
        case 'passport':
          mimeType = 'image/jpeg'; // Changed from image/png to image/jpeg
          break;
        default:
          mimeType = 'application/pdf';
      }
      
      // Use the direct URL
      const url = documentUrl;
      
      // Create a professional document viewer modal
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl w-[95%] h-[90%] flex flex-col overflow-hidden">
          <!-- Enhanced Header -->
          <div class="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-white bg-opacity-20 rounded-lg">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold">${docType.toUpperCase()} Document</h3>
                <p class="text-blue-100 text-sm">Professional Document Viewer</p>
              </div>
            </div>
            <button onclick="this.closest('.fixed').remove(); window.URL.revokeObjectURL('${url}')" 
                    class="text-white hover:text-red-200 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-20">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Document Viewer Controls -->
          <div class="bg-gray-100 border-b px-4 py-3 flex items-center justify-between">
            <div class="flex items-center space-x-4">
              <div class="flex items-center space-x-2">
                <button class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Previous Page">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <span class="text-sm text-gray-600 font-medium">1 / 1</span>
                <button class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Next Page">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div class="flex items-center space-x-2">
                <button class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Zoom Out">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                <span class="text-sm text-gray-700 font-medium px-2 py-1 bg-white rounded border">100%</span>
                <button class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Zoom In">
                  <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <button class="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Fit to Width">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
              <!-- Download and Print buttons removed for view-only access -->
              <div class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                👁️ View Only
              </div>
            </div>
          </div>
          
          <!-- Main Document Viewing Area -->
          <div class="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-hidden">
            <div class="bg-white rounded-2xl shadow-2xl h-full overflow-hidden border border-gray-200">
              <!-- Document Header -->
              <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3">
                    <div class="p-2 bg-blue-100 rounded-lg">
                      <svg class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h4 class="text-lg font-bold text-gray-900">${docType.toUpperCase()} Document</h4>
                      <p class="text-sm text-gray-600">Professional Document Viewer</p>
                    </div>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      ✓ Verified
                    </div>
                    <div class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      🔒 Watermarked
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Document Content Area -->
              <div class="relative h-full overflow-hidden">
                <!-- Document Frame with Enhanced Styling -->
                <div class="absolute inset-0 bg-white">
                  ${mimeType.startsWith('image/') ? 
                    `<img src="${finalUrl}" class="w-full h-full object-contain" alt="Document" style="min-height: 600px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                     <div class="w-full h-full flex items-center justify-center bg-gray-100" style="display: none;">
                       <div class="text-center">
                         <div class="text-red-500 text-6xl mb-4">⚠️</div>
                         <h3 class="text-lg font-medium text-gray-900 mb-2">Image Failed to Load</h3>
                         <p class="text-sm text-gray-600">The image could not be displayed. Please try again.</p>
                       </div>
                     </div>` :
                    `<object data="${finalUrl}" 
                            type="application/pdf" 
                            class="w-full h-full border-0" 
                            style="min-height: 600px; background: white;">
                      <embed src="${finalUrl}" type="application/pdf" class="w-full h-full" />
                      <div class="w-full h-full flex items-center justify-center bg-gray-100">
                        <div class="text-center">
                          <div class="text-yellow-500 text-6xl mb-4">📄</div>
                          <h3 class="text-lg font-medium text-gray-900 mb-2">PDF Document</h3>
                          <p class="text-sm text-gray-600 mb-4">Your browser doesn't support PDF viewing.</p>
                          <button onclick="window.open('${finalUrl}', '_blank')" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                            Open in New Tab
                          </button>
                        </div>
                      </div>
                    </object>`
                  }
                </div>
                
                <!-- Document Overlay Controls - View Only -->
                <div class="absolute top-4 right-4 flex flex-col space-y-2">
                  <button class="p-2 bg-white/90 backdrop-blur-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg shadow-lg transition-all duration-200" title="Full Screen">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                  <!-- Download button removed for view-only access -->
                  <div class="p-2 bg-blue-100/90 backdrop-blur-sm text-blue-700 rounded-lg shadow-lg">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                
                <!-- Document Loading Overlay -->
                <div class="absolute inset-0 bg-white flex items-center justify-center" id="document-loading">
                  <div class="text-center">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p class="text-gray-600 font-medium">Loading Document...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Enhanced Footer -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-gray-200 px-6 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-6">
                <div class="flex items-center space-x-2 text-sm text-gray-700">
                  <div class="p-1 bg-green-100 rounded-full">
                    <svg class="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span class="font-medium">Verified & Approved</span>
                </div>
                <div class="flex items-center space-x-2 text-sm text-gray-700">
                  <div class="p-1 bg-blue-100 rounded-full">
                    <svg class="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span class="font-medium">Watermarked</span>
                </div>
                <div class="flex items-center space-x-2 text-sm text-gray-700">
                  <div class="p-1 bg-purple-100 rounded-full">
                    <svg class="h-3 w-3 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span class="font-medium">Secure View</span>
                </div>
              </div>
              <div class="flex items-center space-x-4">
                <div class="text-sm text-gray-600">
                  <span class="font-semibold text-gray-800">Viewing Only</span>
                </div>
                <div class="h-4 w-px bg-gray-300"></div>
                <div class="text-sm text-gray-500">
                  Documents are view-only for security
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // Add interactive functionality to the document viewer
      const iframe = modal.querySelector('iframe');
      const loadingOverlay = modal.querySelector('#document-loading');
      let currentZoom = 100;
      let currentPage = 1;
      const totalPages = 1; // This would be dynamic in a real implementation
      
      // Hide loading overlay when document loads
      const objectElement = modal.querySelector('object');
      if (objectElement && loadingOverlay) {
        let loadTimeout;
        
        // For object/embed elements, we'll use a simpler approach
        setTimeout(() => {
          loadingOverlay.style.display = 'none';
        }, 2000);
        
        // Fallback timeout in case document doesn't load
        setTimeout(() => {
          if (loadingOverlay.style.display !== 'none') {
            loadingOverlay.innerHTML = `
              <div class="text-center">
                <div class="text-yellow-500 text-6xl mb-4">⏱️</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Loading Timeout</h3>
                <p class="text-sm text-gray-600 mb-4">The document is taking longer than expected to load.</p>
                <div class="space-y-2">
                  <button onclick="this.closest('.fixed').remove()" 
                          class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mr-2">
                    Close Viewer
                  </button>
                  <button onclick="window.open('${finalUrl}', '_blank')" 
                          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Open in New Tab
                  </button>
                </div>
              </div>
            `;
          }
        }, 5000);
      }
      
      // Handle image loading errors with better error handling
      const img = modal.querySelector('img');
      if (img && loadingOverlay) {
        let imageLoadTimeout;
        
        img.addEventListener('load', () => {
          clearTimeout(imageLoadTimeout);
          setTimeout(() => {
            loadingOverlay.style.display = 'none';
          }, 1000);
        });
        
        img.addEventListener('error', () => {
          clearTimeout(imageLoadTimeout);
          console.log('Image failed to load, trying alternative approach...');
          
          // Try to reload the image with different approach
          const newImg = new Image();
          newImg.crossOrigin = 'anonymous';
          newImg.onload = () => {
            img.src = newImg.src;
            setTimeout(() => {
              loadingOverlay.style.display = 'none';
            }, 1000);
          };
          newImg.onerror = () => {
            loadingOverlay.innerHTML = `
              <div class="text-center">
                <div class="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Image Failed to Load</h3>
                <p class="text-sm text-gray-600 mb-4">The image could not be displayed. Please try again or contact support.</p>
                <div class="space-y-2">
                  <button onclick="this.closest('.fixed').remove()" 
                          class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mr-2">
                    Close Viewer
                  </button>
                  <button onclick="window.open('${finalUrl}', '_blank')" 
                          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Open in New Tab
                  </button>
                </div>
              </div>
            `;
          };
          newImg.src = finalUrl;
        });
        
        // Fallback timeout for image loading
        imageLoadTimeout = setTimeout(() => {
          if (loadingOverlay.style.display !== 'none') {
            loadingOverlay.innerHTML = `
              <div class="text-center">
                <div class="text-yellow-500 text-6xl mb-4">⏱️</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Loading Timeout</h3>
                <p class="text-sm text-gray-600 mb-4">The image is taking longer than expected to load.</p>
                <div class="space-y-2">
                  <button onclick="this.closest('.fixed').remove()" 
                          class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mr-2">
                    Close Viewer
                  </button>
                  <button onclick="window.open('${finalUrl}', '_blank')" 
                          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Open in New Tab
                  </button>
                </div>
              </div>
            `;
          }
        }, 5000);
      }
      
      // Zoom functionality
      const zoomInBtn = modal.querySelector('button[title="Zoom In"]');
      const zoomOutBtn = modal.querySelector('button[title="Zoom Out"]');
      const zoomDisplay = modal.querySelector('.bg-white.rounded.border');
      
      if (zoomInBtn && zoomOutBtn && zoomDisplay) {
        zoomInBtn.addEventListener('click', () => {
          currentZoom = Math.min(currentZoom + 25, 200);
          if (objectElement) {
            objectElement.style.transform = `scale(${currentZoom / 100})`;
            objectElement.style.transformOrigin = 'top left';
          }
          zoomDisplay.textContent = `${currentZoom}%`;
        });
        
        zoomOutBtn.addEventListener('click', () => {
          currentZoom = Math.max(currentZoom - 25, 50);
          if (objectElement) {
            objectElement.style.transform = `scale(${currentZoom / 100})`;
            objectElement.style.transformOrigin = 'top left';
          }
          zoomDisplay.textContent = `${currentZoom}%`;
        });
      }
      
      // Fit to width functionality
      const fitToWidthBtn = modal.querySelector('button[title="Fit to Width"]');
      if (fitToWidthBtn) {
        fitToWidthBtn.addEventListener('click', () => {
          currentZoom = 100;
          if (objectElement) {
            objectElement.style.transform = 'scale(1)';
            objectElement.style.transformOrigin = 'top left';
          }
          zoomDisplay.textContent = '100%';
        });
      }
      
      // Print functionality
      const printBtn = modal.querySelector('button[title="Print"]');
      if (printBtn) {
        printBtn.addEventListener('click', () => {
          window.open(finalUrl, '_blank');
        });
      }
      
      // Main download functionality - DISABLED for security
      const mainDownloadBtn = modal.querySelector('.bg-gray-100 button[title="Download"]');
      if (mainDownloadBtn) {
        mainDownloadBtn.addEventListener('click', () => {
          // Show professional message about download restrictions
          const downloadModal = document.createElement('div');
          downloadModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60';
          downloadModal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4">
              <div class="text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">Download Restricted</h3>
                <p class="text-sm text-gray-600 mb-4">
                  Document downloads are restricted for security purposes. Documents are available for viewing only.
                </p>
                <div class="flex space-x-3">
                  <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    Close
                  </button>
                  <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Contact Admin
                  </button>
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(downloadModal);
          
          // Close download modal when clicking outside
          downloadModal.addEventListener('click', (e) => {
            if (e.target === downloadModal) {
              downloadModal.remove();
            }
          });
        });
      }
      
      // Full screen functionality
      const fullScreenBtn = modal.querySelector('button[title="Full Screen"]');
      if (fullScreenBtn) {
        fullScreenBtn.addEventListener('click', () => {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            modal.requestFullscreen();
          }
        });
      }
      
      // Enhanced download functionality for overlay button - DISABLED for security
      const overlayDownloadBtn = modal.querySelector('.absolute.top-4.right-4 button[title="Download"]');
      if (overlayDownloadBtn) {
        overlayDownloadBtn.addEventListener('click', () => {
          // Show professional message about download restrictions
          const downloadModal = document.createElement('div');
          downloadModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60';
          downloadModal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md mx-4">
              <div class="text-center">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">View Only Access</h3>
                <p class="text-sm text-gray-600 mb-4">
                  Documents are available for viewing only. Download access is restricted for security purposes.
                </p>
                <div class="flex space-x-3">
                  <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    Close
                  </button>
                  <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Contact Admin
                  </button>
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(downloadModal);
          
          // Close download modal when clicking outside
          downloadModal.addEventListener('click', (e) => {
            if (e.target === downloadModal) {
              downloadModal.remove();
            }
          });
        });
      }
      
      // Enhanced close functionality
      const closeBtn = modal.querySelector('button[onclick*="closest"]');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          // Clean up blob URL if it was created
          if (finalUrl && finalUrl.startsWith('blob:')) {
            URL.revokeObjectURL(finalUrl);
          }
          modal.remove();
        });
      }
      
      // Clean up when modal is closed
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          // Clean up blob URL if it was created
          if (finalUrl && finalUrl.startsWith('blob:')) {
            URL.revokeObjectURL(finalUrl);
          }
          modal.remove();
        }
      });
      
      // Add keyboard shortcuts (download shortcuts removed)
      document.addEventListener('keydown', (e) => {
        if (modal.parentNode) {
          if (e.key === 'Escape') {
            // Clean up blob URL if it was created
            if (finalUrl && finalUrl.startsWith('blob:')) {
              URL.revokeObjectURL(finalUrl);
            }
            modal.remove();
          } else if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            if (zoomInBtn) zoomInBtn.click();
          } else if (e.key === '-') {
            e.preventDefault();
            if (zoomOutBtn) zoomOutBtn.click();
          }
          // Download shortcuts (Ctrl+S, Ctrl+D) disabled for view-only access
          if (e.ctrlKey && (e.key === 's' || e.key === 'd')) {
            e.preventDefault();
            alert('Download is restricted. Documents are view-only for security purposes.');
          }
        }
      });
      
    } catch (error) {
      console.error('Error viewing certificate:', error);
      console.error('Error details:', error.response?.data);
      alert('Error viewing certificate: ' + (error.response?.data?.message || error.message));
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900">Error</h3>
              <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div class="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <svg class="h-8 w-8 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="font-medium text-red-800">Unable to Load Document</p>
                <p class="text-sm text-red-700 mt-1">Please try again or contact support if the issue persists.</p>
              </div>
            </div>
            
            <div class="mt-6 flex justify-end">
              <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
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
      {/* Sidebar */}
      <ClientSidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        logout={logout}
        notifications={[]}
        key="client-sidebar-portal"
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`} style={{ minHeight: '100vh' }}>
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-6">
              <Ship className="h-8 w-8 text-primary-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Client Portal</h1>
            </div>
          </div>
        </header>

        <div className="flex-1 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Available Crew</p>
                <p className="text-2xl font-semibold text-gray-900">{total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Shortlisted</p>
                <p className="text-2xl font-semibold text-gray-900">{shortlistedCrew.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Requests Sent</p>
                <p className="text-2xl font-semibold text-gray-900">{Array.isArray(requestHistory) ? requestHistory.length : 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Array.isArray(requestHistory) ? requestHistory.filter(r => r.status === 'approved').length : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-lg shadow mb-4">
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

        {/* Filters */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="flex flex-wrap gap-4 items-center">
              <select
                value={filters.rank}
                onChange={(e) => handleFilterChange('rank', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 min-w-[140px]"
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 min-w-[120px]"
              />

              <select
                value={filters.vesselType}
                onChange={(e) => handleFilterChange('vesselType', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 min-w-[140px]"
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
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 min-w-[160px]"
              />
            </div>
          </div>
        </div>

        {/* Crew Table */}
        <div className="mb-6">
          {/* Main Content */}
          <div className="w-full">
            {loading ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ) : crews.length === 0 ? (
              <div className="bg-white rounded-lg shadow">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No approved crew members found</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Available Crew Members</h3>
                </div>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
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
                          Nationality
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Available Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vessel Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {crews.map((crew) => (
                        <tr key={crew._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center shadow-lg mr-4">
                                <span className="text-sm font-bold text-white">
                                  {crew.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{crew.fullName}</div>
                                <div className="text-sm text-gray-500">{crew.currentLocation}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-blue-500" />
                              <span className="text-sm text-gray-900 font-medium">{crew.rank}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-2 text-green-500" />
                              <span className="text-sm text-gray-900">{crew.nationality}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                              <span className="text-sm text-gray-900">{formatDate(crew.availabilityDate)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Ship className="h-4 w-4 mr-2 text-orange-500" />
                              <span className="text-sm text-gray-900">{crew.preferredVesselType || 'Any'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {isShortlisted(crew._id) ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  <Heart className="h-3 w-3 mr-1 fill-current" />
                                  Shortlisted
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Available
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleViewDetails(crew._id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </button>
                              <button
                                onClick={() => handleShortlist(crew._id)}
                                className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-md transition-colors ${
                                  isShortlisted(crew._id)
                                    ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100'
                                    : 'border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100'
                                }`}
                              >
                                <Heart className={`h-3 w-3 mr-1 ${isShortlisted(crew._id) ? 'fill-current' : ''}`} />
                                {isShortlisted(crew._id) ? 'Remove' : 'Shortlist'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Info - Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions & Info</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Your Stats</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm text-gray-600">Available Crew:</span>
                      <span className="font-bold text-blue-600">{total}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm text-gray-600">Shortlisted:</span>
                      <span className="font-bold text-red-600">{shortlistedCrew.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm text-gray-600">Requests Sent:</span>
                      <span className="font-bold text-green-600">{Array.isArray(requestHistory) ? requestHistory.length : 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm text-gray-600">Approved:</span>
                      <span className="font-bold text-purple-600">
                        {Array.isArray(requestHistory) ? requestHistory.filter(r => r.status === 'approved').length : 0}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Quick Filters</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => handleFilterChange('rank', 'Master / Captain')}
                      className="w-full text-left px-4 py-3 text-sm bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 border border-blue-200 font-medium"
                    >
                      Show Captains Only
                    </button>
                    <button
                      onClick={() => handleFilterChange('rank', 'Chief Engineer')}
                      className="w-full text-left px-4 py-3 text-sm bg-gradient-to-r from-green-50 to-green-100 text-green-700 rounded-lg hover:from-green-100 hover:to-green-200 transition-all duration-200 border border-green-200 font-medium"
                    >
                      Show Engineers Only
                    </button>
                    <button
                      onClick={() => setFilters({
                        search: '',
                        rank: '',
                        nationality: '',
                        vesselType: '',
                        availabilityDate: ''
                      })}
                      className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-200 font-medium"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shortlisted & Recent Requests */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Shortlisted & Recent</h3>
            </div>
            <div className="p-6">
              {/* Shortlisted Crew */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Shortlisted Crew</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {shortlistedCrew.slice(0, 5).map((crew) => (
                    <div key={crew._id} className="text-xs text-gray-600 border-b border-gray-200 pb-2">
                      <div className="font-medium text-gray-900">{crew.fullName}</div>
                      <div className="text-gray-500">{crew.rank} • {formatDate(crew.availabilityDate)}</div>
                    </div>
                  ))}
                  {shortlistedCrew.length === 0 && (
                    <div className="text-xs text-gray-500">No shortlisted crew</div>
                  )}
                </div>
              </div>

              {/* Recent Requests */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Requests</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {Array.isArray(requestHistory) ? requestHistory.slice(0, 5).map((request) => (
                    <div key={request._id} className="text-xs text-gray-600 border-b border-gray-200 pb-2">
                      <div className="font-medium text-gray-900">{request.crewName}</div>
                      <div className="text-gray-500">{request.requestType} • {formatDate(request.createdAt)}</div>
                      <div className={`text-xs px-1 py-0.5 rounded ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {request.status}
                      </div>
                    </div>
                  )) : null}
                  {(!Array.isArray(requestHistory) || requestHistory.length === 0) && (
                    <div className="text-xs text-gray-500">No requests sent</div>
                  )}
                </div>
              </div>
            </div>
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
          </div>
        </div>
      </div>

      {/* Crew Detail Modal */}
      {showDetailModal && selectedCrew && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetailModal(false);
              setSidebarOpen(true);
            }
          }}
        >
          <div className="relative mx-auto  pb-5 border w-full max-w-4xl shadow-2xl rounded-xl bg-white max-h-[90vh] overflow-y-auto">
            <div className="">
              <div className="bg-gradient-to-r from-blue-300 to-blue-700 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-white text-center flex-1">Crew Profile</h3>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      // Restore sidebar when modal closes
                      setSidebarOpen(true);
                    }}
                    className="text-white hover:text-gray-200 ml-4"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-5">
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
                <div className=''>
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
              <div className="mt-6 px-5">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Available Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedCrew.documents || {}).map(([docType, doc]) => (
                    <div key={docType} className={`border-2 rounded-xl p-4 transition-all duration-200 hover:shadow-md ${doc ? 'border-green-200 bg-gradient-to-br from-green-50 to-green-100' : 'border-red-200 bg-gradient-to-br from-red-50 to-red-100'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className={`p-2 rounded-lg ${doc ? 'bg-green-200' : 'bg-red-200'}`}>
                              {doc ? (
                                <CheckCircle className="h-5 w-5 text-green-700" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-red-700" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900 capitalize">{docType.replace(/([A-Z])/g, ' $1').trim()}</p>
                              <p className="text-xs text-gray-600">
                                {doc ? 'Available' : 'Not Available'}
                              </p>
                            </div>
                          </div>
                          
                          {doc ? (
                            <div className="ml-11">
                              <p className="text-xs text-gray-600 bg-white/50 px-2 py-1 rounded-md inline-block">
                                📄 {doc.name}
                              </p>
                            </div>
                          ) : (
                            <div className="ml-11">
                              <p className="text-xs text-red-600 bg-red-100/50 px-2 py-1 rounded-md inline-block">
                                Missing Document
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end space-y-2">
                          {docType === 'cv' ? (
                            doc ? (
                              <button
                                onClick={() => handleViewCertificate(selectedCrew._id, docType)}
                                className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium"
                                title="View CV (Watermarked)"
                              >
                                <Eye className="h-3 w-3" />
                                <span>View CV</span>
                              </button>
                            ) : (
                              <div className="text-center">
                                <div className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded-md">
                                  ❌ Not Available
                                </div>
                                <p className="text-xs text-red-500 mt-1">Missing Document</p>
                              </div>
                            )
                          ) : doc ? (
                            <button
                              onClick={() => handleViewCertificate(selectedCrew._id, docType)}
                              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium"
                              title="View Document (Watermarked)"
                            >
                              <Eye className="h-3 w-3" />
                              <span>View</span>
                            </button>
                          ) : (
                            <div className="text-center">
                              <div className="text-red-500 text-xs bg-red-100 px-2 py-1 rounded-md">
                                ❌ Not Available
                              </div>
                              <p className="text-xs text-red-500 mt-1">Missing Document</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Document Access Notice */}
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <div className="p-1 bg-blue-100 rounded-full">
                      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-800">Document Access Policy</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Documents are available for viewing information only. For full document access or downloads, please contact the admin team.
                      </p>
                    </div>
                  </div>
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
                  onClick={() => {
                    setShowDetailModal(false);
                    // Restore sidebar when modal closes
                    setSidebarOpen(true);
                  }}
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto p-5 border w-full max-w-md shadow-2xl rounded-xl bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Send Request</h3>
                <button
                  onClick={() => {
                    setShowRequestModal(false);
                    // Close View Details modal as well
                    setShowDetailModal(false);
                  }}
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
                  onClick={() => {
                    setShowRequestModal(false);
                    // Close View Details modal as well
                    setShowDetailModal(false);
                  }}
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
