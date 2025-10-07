import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import FixedSidebar from '../components/FixedSidebar';
import { useSidebar } from '../contexts/SidebarContext';
import '../components/PageLayout.css';
import { 
  Users, 
  LogOut, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Shield,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  Filter,
  X,
  Check,
  AlertTriangle
} from 'lucide-react';

const AdminManagementContent = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [systemStats, setSystemStats] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isActive: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });
  const [editAdmin, setEditAdmin] = useState({
    name: '',
    email: '',
    role: 'admin',
    isActive: true
  });
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  useEffect(() => {
    fetchAdmins();
    fetchSystemStats();
  }, [filters, pagination.currentPage]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10,
        ...filters
      });
      
      const response = await api.get(`/admin/admins?${params}`);
      setAdmins(response.data.admins);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (error) {
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStats = async () => {
    try {
      const response = await api.get('/admin/system-stats');
      setSystemStats(response.data);
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };


  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleCreateAdmin = async () => {
    // Prevent multiple submissions
    if (isCreatingAdmin) return;
    
    // Form validation
    if (!newAdmin.name.trim()) {
      alert('Please enter admin name');
      return;
    }
    if (!newAdmin.email.trim()) {
      alert('Please enter admin email');
      return;
    }
    if (!newAdmin.password.trim()) {
      alert('Please enter admin password');
      return;
    }
    if (newAdmin.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setIsCreatingAdmin(true);
    try {
      console.log('Creating admin with data:', newAdmin);
      const response = await api.post('/admin/admins', newAdmin);
      console.log('Admin creation response:', response.data);
      setShowCreateModal(false);
      setNewAdmin({ name: '', email: '', password: '', role: 'admin' });
      fetchAdmins();
      alert('Admin created successfully');
    } catch (error) {
      console.error('Error creating admin:', error);
      
      // Show specific error messages
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        alert(`Validation Error: ${errorMessages}`);
      } else if (error.response?.status === 400) {
        alert('Bad Request: Please check your input data');
      } else if (error.response?.status === 409) {
        alert('Admin already exists with this email');
      } else if (error.response?.status === 500) {
        alert('Server Error: Please try again later');
      } else {
        alert(`Error creating admin: ${error.message}`);
      }
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleEditAdmin = async () => {
    try {
      await api.patch(`/admin/admins/${selectedAdmin._id}`, editAdmin);
      setShowEditModal(false);
      setSelectedAdmin(null);
      fetchAdmins();
      alert('Admin updated successfully');
    } catch (error) {
      console.error('Error updating admin:', error);
      alert('Error updating admin');
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await api.patch(`/admin/admins/${selectedAdmin._id}/password`, {
        newPassword: passwordForm.newPassword
      });
      setShowPasswordModal(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
      setSelectedAdmin(null);
      alert('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) {
      return;
    }

    try {
      await api.delete(`/admin/admins/${adminId}`);
      fetchAdmins();
      alert('Admin deleted successfully');
    } catch (error) {
      console.error('Error deleting admin:', error);
      alert('Error deleting admin');
    }
  };

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setEditAdmin({
      name: admin.fullName || admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (admin) => {
    setSelectedAdmin(admin);
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setShowPasswordModal(true);
  };

  const getRoleBadge = (role) => {
    const badges = {
      super_admin: 'bg-red-100 text-red-800',
      admin: 'bg-blue-100 text-blue-800',
      moderator: 'bg-green-100 text-green-800'
    };
    return badges[role] || 'bg-gray-100 text-gray-800';
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin management...</p>
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
                <Shield className="h-8 w-8 text-primary-600 mr-2" />
                <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={fetchAdmins}
                  className="flex items-center px-3 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Admin
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 py-4 sm:py-6 lg:py-8">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
            {/* System Stats */}
            {systemStats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Total Crew</p>
                      <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                        {systemStats?.crewCount?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                      <Users className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Total Clients</p>
                      <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                        {systemStats?.clientCount?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 bg-purple-100 rounded-lg">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Admins</p>
                      <p className="text-xl sm:text-2xl font-semibold text-gray-900">
                        {systemStats?.adminCount?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                  <div className="flex items-center">
                    <div className="p-2 sm:p-3 bg-orange-100 rounded-lg">
                      <Check className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">System Health</p>
                      <p className="text-xl sm:text-2xl font-semibold text-gray-900 capitalize">
                        {systemStats?.systemHealth || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 mb-4">
                  <div className="flex-1 max-w-md">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search admins..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="min-w-[120px]">
                    <select
                      value={filters.role}
                      onChange={(e) => handleFilterChange('role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Roles</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                    </select>
                  </div>

                  <div className="min-w-[120px]">
                    <select
                      value={filters.isActive}
                      onChange={(e) => handleFilterChange('isActive', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">All Status</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Admins Table */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Admin Users</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Admin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {admins && admins.length > 0 ? admins.map((admin) => (
                      <tr key={admin._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary-600">
                                  {(admin.fullName || admin.name) ? (admin.fullName || admin.name).split(' ').map(n => n[0]).join('').toUpperCase() : 'AD'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{admin.fullName || admin.name || 'Unknown'}</div>
                              <div className="text-sm text-gray-500">{admin.email || 'No email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getRoleBadge(admin.role)}`}>
                            {admin.role ? admin.role.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {admin.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openEditModal(admin)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openPasswordModal(admin)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              <Key className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAdmin(admin._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                          No admins found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.total)} of {pagination.total} results
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                      disabled={pagination.currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                      disabled={pagination.currentPage === pagination.totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Create New Admin</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter admin name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newAdmin.password}
                      onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 pr-10"
                      placeholder="Enter password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={newAdmin.role}
                    onChange={(e) => setNewAdmin(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAdmin}
                  disabled={isCreatingAdmin}
                  className={`px-4 py-2 text-white rounded-lg ${
                    isCreatingAdmin 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {isCreatingAdmin ? 'Creating...' : 'Create Admin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Edit Admin</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={editAdmin.name}
                    onChange={(e) => setEditAdmin(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editAdmin.email}
                    onChange={(e) => setEditAdmin(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={editAdmin.role}
                    onChange={(e) => setEditAdmin(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={editAdmin.isActive}
                    onChange={(e) => setEditAdmin(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditAdmin}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Update Admin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 pr-10"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminManagement = () => {
  return <AdminManagementContent />;
};

export default AdminManagement;
