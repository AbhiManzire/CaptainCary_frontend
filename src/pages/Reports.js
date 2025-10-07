import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import FixedSidebar from '../components/FixedSidebar';
import { useSidebar } from '../contexts/SidebarContext';
import '../components/PageLayout.css';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  FileText, 
  Download,
  Calendar,
  MapPin,
  Ship,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Filter,
  X,
  Anchor,
  Waves,
  Compass,
  Zap
} from 'lucide-react';

const ReportsContent = () => {
  const { user, userType, logout } = useAuth();
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    console.log('useEffect triggered for period:', selectedPeriod);
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log('Fetching analytics data for period:', selectedPeriod);
      console.log('User authenticated:', !!user);
      console.log('User type:', userType);
      const response = await api.get(`/admin/analytics/overview?period=${selectedPeriod}`);
      console.log('Analytics response:', response.data);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
    } finally {
      setLoading(false);
    }
  };


  const handleExportReport = async (format = 'csv') => {
    try {
      const response = await api.get(`/admin/export/crew?format=${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `crew-report-${selectedPeriod}.${format === 'excel' ? 'xlsx' : 'csv'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const formatNumber = (num) => {
    return num ? num.toLocaleString() : '0';
  };

  const getPeriodLabel = (period) => {
    const labels = {
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 90 Days',
      '1y': 'Last Year'
    };
    return labels[period] || 'Last 30 Days';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-primary-600 mr-2" />
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              </div>
              <div className="flex items-center space-x-4">
                <select
                  value={selectedPeriod}
                  onChange={(e) => {
                    console.log('Period changed to:', e.target.value);
                    setSelectedPeriod(e.target.value);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="90d">Last 90 Days</option>
                  <option value="1y">Last Year</option>
                </select>
                <button
                  onClick={fetchAnalyticsData}
                  className="flex items-center px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </button>
                <button
                  onClick={() => handleExportReport('csv')}
                  className="flex items-center px-3 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export CSV
                </button>
                <button
                  onClick={() => handleExportReport('excel')}
                  className="flex items-center px-3 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export Excel
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 py-4 sm:py-6 lg:py-8">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
            {/* Tab Navigation */}
            <div className="mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('crew')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'crew'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Crew Analytics
                </button>
                <button
                  onClick={() => setActiveTab('documents')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'documents'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Document Status
                </button>
              </nav>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && analyticsData && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                      <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                        <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm font-medium text-gray-500">Total Crew</p>
                        <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                          {formatNumber(analyticsData.crewStats.total)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                      <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                        <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm font-medium text-gray-500">Approved</p>
                        <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                          {formatNumber(analyticsData.crewStats.approved)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                      <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                        <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm font-medium text-gray-500">Pending</p>
                        <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                          {formatNumber(analyticsData.crewStats.pending)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                      <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                        <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <p className="text-xs sm:text-sm font-medium text-gray-500">Missing Docs</p>
                        <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                          {formatNumber(analyticsData.crewStats.missingDocs)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Nationality Distribution */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Nationalities</h3>
                    <div className="space-y-3">
                      {analyticsData.nationalityStats.slice(0, 10).map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-primary-500 mr-3"></div>
                            <span className="text-sm font-medium text-gray-700">{item._id}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rank Distribution */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Ranks</h3>
                    <div className="space-y-3">
                      {analyticsData.rankStats.slice(0, 10).map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                            <span className="text-sm font-medium text-gray-700">{item._id}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Vessel Type Preferences */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vessel Type Preferences</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {analyticsData.vesselStats.map((item, index) => {
                      // Get appropriate icon based on vessel type
                      const getVesselIcon = (vesselType) => {
                        const type = vesselType?.toLowerCase() || '';
                        if (type.includes('ahts') || type.includes('tug')) return <Anchor className="h-8 w-8 text-blue-600" />;
                        if (type.includes('container') || type.includes('cargo')) return <Ship className="h-8 w-8 text-green-600" />;
                        if (type.includes('barge') || type.includes('flat')) return <Waves className="h-8 w-8 text-purple-600" />;
                        if (type.includes('tanker') || type.includes('oil')) return <Zap className="h-8 w-8 text-orange-600" />;
                        if (type.includes('cruise') || type.includes('passenger')) return <Compass className="h-8 w-8 text-pink-600" />;
                        return <Ship className="h-8 w-8 text-primary-600" />;
                      };

                      return (
                        <div key={index} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex justify-center mb-2">
                            {getVesselIcon(item._id)}
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">{item._id}</p>
                          <p className="text-lg font-bold text-primary-600">{item.count}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Crew Analytics Tab */}
            {activeTab === 'crew' && analyticsData && (
              <div className="space-y-6">
                {/* Crew Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Approved</span>
                        <span className="text-sm font-semibold text-green-600">
                          {analyticsData.crewStats.approved}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pending</span>
                        <span className="text-sm font-semibold text-yellow-600">
                          {analyticsData.crewStats.pending}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Rejected</span>
                        <span className="text-sm font-semibold text-red-600">
                          {analyticsData.crewStats.rejected}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Missing Docs</span>
                        <span className="text-sm font-semibold text-orange-600">
                          {analyticsData.crewStats.missingDocs}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Priority & Visa Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">High Priority</span>
                        <span className="text-sm font-semibold text-red-600">
                          {analyticsData.crewStats.priority}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">With Visa</span>
                        <span className="text-sm font-semibold text-blue-600">
                          {analyticsData.crewStats.withVisa}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Assignment</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Assigned to Clients</span>
                        <span className="text-sm font-semibold text-green-600">
                          {analyticsData.clientStats.assigned}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Unassigned</span>
                        <span className="text-sm font-semibold text-gray-600">
                          {analyticsData.clientStats.unassigned}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Document Status Tab */}
            {activeTab === 'documents' && analyticsData && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Document Completion Rates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(analyticsData.documentStats).map(([key, value]) => {
                      if (key === 'total') return null;
                      const docName = key.replace('Complete', '').toUpperCase();
                      const percentage = analyticsData.documentStats.total > 0 
                        ? Math.round((value / analyticsData.documentStats.total) * 100) 
                        : 0;
                      
                      return (
                        <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                          <FileText className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                          <p className="text-sm font-medium text-gray-900">{docName}</p>
                          <p className="text-lg font-bold text-primary-600">{percentage}%</p>
                          <p className="text-xs text-gray-500">{value} of {analyticsData.documentStats.total}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

const Reports = () => {
  return <ReportsContent />;
};

export default Reports;