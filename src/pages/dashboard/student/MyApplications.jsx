import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Building2,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  AlertCircle,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../../hooks/useAuth";
import Loading from "../../../components/common/Loading";
import API from "../../../utils/api";

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const statusOptions = [
    { value: 'all', label: 'All Applications', color: 'gray', icon: Users },
    { value: 'pending', label: 'Pending', color: 'yellow', icon: Clock },
    { value: 'approved', label: 'Approved', color: 'green', icon: CheckCircle },
    { value: 'rejected', label: 'Rejected', color: 'red', icon: XCircle },
  ];

 useEffect(() => {
  if (user?.uid) {
    fetchApplications();
  }
}, [user]);

useEffect(() => {
  filterApplications();
}, [applications, searchTerm, selectedStatus]);

const fetchApplications = async () => {
  try {
    setLoading(true);
    setError("");

    if (!user?.uid) {
      setApplications([]);
      return;
    }

    const response = await API.get(`/students/${user.uid}/applications`);
    const applicationsData = Array.isArray(response.data) ? response.data : [];
    setApplications(applicationsData);
  } catch (error) {
    console.error("Error fetching applications:", error);
    setError("Failed to load applications. Please try again.");
    setApplications([]);
  } finally {
    setLoading(false);
  }
};

  const filterApplications = () => {
    let filtered = applications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.organization?.organization?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.organization?.organization?.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.organization?.organization?.campus?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter((app) => app.status === selectedStatus);
    }

    setFilteredApplications(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return Clock;
      case 'approved':
        return CheckCircle;
      case 'rejected':
        return XCircle;
      default:
        return Users;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Under Review';
      case 'approved':
        return 'Application Approved';
      case 'rejected':
        return 'Application Rejected';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Loading/>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50/40 py-2 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{error}</span>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {statusOptions.map((status) => {
            const Icon = status.icon;
            const count = applications.filter((app) =>
              status.value === 'all' ? true : app.status === status.value
            ).length;

            return (
              <div
                key={status.value}
                className="app-surface p-6 text-center hover:shadow-md transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${getStatusColor(
                    status.value
                  )} flex items-center justify-center mx-auto mb-3`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{status.label}</div>
              </div>
            );
          })}
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="app-surface p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 appearance-none"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Applications Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {filteredApplications.map((application, index) => {
              const StatusIcon = getStatusIcon(application.status);
              const organization = application.organization || {};
              const orgDetails = organization.organization || {};

              return (
                <motion.div
                  key={application._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className="app-surface overflow-hidden hover:shadow-md transition-all duration-300"
                >
                  {/* Organization Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start space-x-4">
                      <img
                        src={organization.photoURL || `https://ui-avatars.com/api/?name=${application.organizationName}&background=4bbeff&color=fff`}
                        alt={application.organizationName}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg truncate">
                          {application.organizationName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Building2 className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-blue-600 font-medium">
                            {orgDetails.type || 'Organization'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {orgDetails.campus || 'Main Campus'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div className="p-6 space-y-4">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          application.status
                        )}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {getStatusText(application.status)}
                      </span>
                    </div>

                    {/* Applied Date */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Applied:</span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(application.appliedAt)}
                      </span>
                    </div>

                    {/* Last Updated */}
                    {application.updatedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Updated:</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(application.updatedAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedApplication(application);
                        setShowDetailsModal(true);
                      }}
                      className="w-full app-btn-primary py-3"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {/* Empty State */}
        {filteredApplications.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {applications.length === 0 ? 'No applications yet' : 'No applications found'}
            </h3>
            <p className="text-gray-500 mb-6">
              {applications.length === 0 
                ? "You haven't applied to any organizations yet. Start exploring and apply to organizations that interest you!" 
                : 'Try adjusting your search criteria or filters.'
              }
            </p>
            {applications.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/organization'}
                className="app-btn-primary px-6 py-3"
              >
                Browse Organizations
              </motion.button>
            )}
          </motion.div>
        )}
      </div>

      {/* Application Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedApplication && (
          <ApplicationDetailsModal
            application={selectedApplication}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedApplication(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Application Details Modal Component
const ApplicationDetailsModal = ({ application, onClose }) => {
  const organization = application.organization || {};
  const orgDetails = organization.organization || {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="app-surface w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Application Details
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {application.organizationName} • {orgDetails.type || 'Organization'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Organization Information */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">
                Organization Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-blue-700">Organization Name</label>
                  <p className="text-blue-900">{application.organizationName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700">Type</label>
                  <p className="text-blue-900">{orgDetails.type || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700">Campus</label>
                  <p className="text-blue-900">{orgDetails.campus || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700">Contact Email</label>
                  <p className="text-blue-900">{application.organizationEmail}</p>
                </div>
              </div>
            </div>

            {/* Application Status */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Application Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <p className={`font-semibold ${
                    application.status === 'approved' ? 'text-green-600' :
                    application.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Applied Date</label>
                  <p className="text-gray-900">
                    {new Date(application.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="text-gray-900">
                    {new Date(application.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900">{application.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{application.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{application.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Current Year</label>
                  <p className="text-gray-900">{application.currentYear || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Student ID</label>
                  <p className="text-gray-900">
                    {application.studentInfo?.studentId || application.studentId || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Department</label>
                  <p className="text-gray-900">
                    {application.studentInfo?.department || application.department || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Session</label>
                  <p className="text-gray-900">
                    {application.studentInfo?.session || application.session || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* Skills and Experience */}
            {application.skills && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Skills & Expertise
                </h3>
                <p className="text-gray-900 whitespace-pre-wrap">{application.skills}</p>
              </div>
            )}

            {application.experience && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Previous Experience
                </h3>
                <p className="text-gray-900 whitespace-pre-wrap">{application.experience}</p>
              </div>
            )}

            {/* Motivation */}
            {application.motivation && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Motivation
                </h3>
                <p className="text-gray-900 whitespace-pre-wrap">{application.motivation}</p>
              </div>
            )}

            {/* Expectations */}
            {application.expectations && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Expectations
                </h3>
                <p className="text-gray-900 whitespace-pre-wrap">{application.expectations}</p>
              </div>
            )}

            {/* Resume */}
            {application.resume && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Resume
                </h3>
                <a
                  href={application.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="app-btn-secondary"
                >
                  <Eye className="w-4 h-4" />
                  View Resume
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full app-btn-secondary"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MyApplications;