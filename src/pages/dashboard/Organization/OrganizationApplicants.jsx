import React, { useMemo, useState } from "react";
import {
  Search,
  Filter,
  User,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Trash2,
  Download,
  Users,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useAuth from "../../../hooks/useAuth";
import useUserRole from "../../../hooks/useUserRole";
import API from "../../../utils/api";
import useInfiniteScrollSlice from "../../../hooks/useInfiniteScrollSlice";

const OrganizationApplicants = ({ embedded = false, showStats = !embedded }) => {
  const { user } = useAuth();
  const { userInfo, loading: roleLoading } = useUserRole();
  const organizationMongoId = userInfo?.organizationId || userInfo?._id;
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const statusOptions = [
    { value: "all", label: "All Applications", color: "gray", icon: Users },
    { value: "pending", label: "Pending", color: "yellow", icon: Clock },
    { value: "approved", label: "Approved", color: "green", icon: CheckCircle },
    { value: "rejected", label: "Rejected", color: "red", icon: XCircle },
  ];

  const {
    data: applications = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["organization-applications", organizationMongoId],
    enabled: Boolean(user && organizationMongoId),
    queryFn: async () => {
      const response = await API.get(
        `/organizations/by-id/${organizationMongoId}/applications`
      );

      return Array.isArray(response?.data) ? response.data : [];
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
  });

  const filteredApplications = useMemo(() => {
    let filtered = applications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (app) =>
          app.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.studentInfo?.studentId?.includes(searchTerm) ||
          app.studentInfo?.department
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          app.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((app) => app.status === selectedStatus);
    }

    return filtered;
  }, [applications, searchTerm, selectedStatus]);

  const {
    visibleItems: visibleApplications,
    hasMore,
    loadMoreRef,
  } = useInfiniteScrollSlice(filteredApplications, {
    pageSize: 20,
    resetDeps: [searchTerm, selectedStatus, filteredApplications.length],
  });

  const updateApplicationStatus = async (applicationId, status, notes) => {
    try {
      const payload = { status };
      if (typeof notes === "string") {
        payload.notes = notes;
      }

      const res = await API.patch(
        `/applications/${applicationId}/status`,
        payload
      );

      if (res.success) {
        await refetch();
        return;
      }

      throw new Error(res.message || "Failed to update status");
    } catch (error) {
      console.error("Error updating application status:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update application";
      toast.error(message);
      throw error;
    }
  };

  const deleteApplication = async (applicationId) => {
  if (!window.confirm("Are you sure you want to delete this application?")) {
    return;
  }

  try {
    const res = await API.delete(`/applications/${applicationId}`);

    if (res.success) {
      refetch();
    } else {
      throw new Error(res.message || "Failed to delete");
    }
  } catch (error) {
    console.error("Error deleting application:", error);
    alert(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to delete application"
    );
  }
};

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return Clock;
      case "approved":
        return CheckCircle;
      case "rejected":
        return XCircle;
      default:
        return Users;
    }
  };

  if (roleLoading) {
    return (
      <div className="space-y-6">
        <div className="app-surface p-6 animate-pulse">
          <div className="h-8 w-48 rounded bg-gray-200 mb-3" />
          <div className="h-4 w-80 rounded bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="app-surface p-6 animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-gray-200 mx-auto mb-3" />
              <div className="h-8 w-16 rounded bg-gray-200 mx-auto mb-2" />
              <div className="h-4 w-24 rounded bg-gray-200 mx-auto" />
            </div>
          ))}
        </div>
        <div className="app-surface p-6 animate-pulse min-h-[300px]">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((row) => (
              <div key={row} className="h-12 rounded bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="app-surface p-6 animate-pulse">
          <div className="h-8 w-48 rounded bg-gray-200 mb-3" />
          <div className="h-4 w-80 rounded bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="app-surface p-6 animate-pulse">
              <div className="h-12 w-12 rounded-xl bg-gray-200 mx-auto mb-3" />
              <div className="h-8 w-16 rounded bg-gray-200 mx-auto mb-2" />
              <div className="h-4 w-24 rounded bg-gray-200 mx-auto" />
            </div>
          ))}
        </div>
        <div className="app-surface p-6 animate-pulse min-h-[300px]">
          <div className="space-y-3">
            {[1, 2, 3, 4].map((row) => (
              <div key={row} className="h-12 rounded bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? "" : "min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-4 px-3"}>
      <div className={embedded ? "space-y-6" : "max-w-7xl mx-auto"}>
        {/* Header */}
        {!embedded && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-4">
              Applications
            </h1>
            <p className="text-gray-600 text-lg">
              Manage student applications for your organization
            </p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">{String(error || "Failed to load applications. Please try again.")}</span>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            {statusOptions.map((status) => {
              const Icon = status.icon;
              const count = applications.filter((app) =>
                status.value === "all" ? true : app.status === status.value
              ).length;

              return (
                <div
                  key={status.value}
                  className="app-surface p-6 text-center"
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
        )}

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
                placeholder="Search applicants..."
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

        {/* Applications Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="app-surface overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Academic Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {visibleApplications.map((application, index) => {
                    const StatusIcon = getStatusIcon(application.status);

                    const studentName =
                      application.fullName || application.studentName;
                    const studentEmail =
                      application.email || application.studentEmail;
                    const studentId =
                      application.studentInfo?.studentId ||
                      application.studentId;
                    const department =
                      application.studentInfo?.department ||
                      application.department;
                    const notePreview =
                      typeof application.notes === "string"
                        ? application.notes.trim()
                        : "";

                    return (
                      <motion.tr
                        key={application._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={
                                application.studentPhoto ||
                                `https://ui-avatars.com/api/?name=${studentName}&background=4bbeff&color=fff`
                              }
                              alt={studentName}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div>
                              <div className="font-medium text-gray-900">
                                {studentName}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {studentEmail}
                              </div>
                              {application.phone && (
                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {application.phone}
                                </div>
                              )}
                              {notePreview && (
                                <div
                                  className="text-xs text-slate-500 mt-1 max-w-[260px] truncate"
                                  title={notePreview}
                                >
                                  Note: {notePreview}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {studentId && (
                              <div className="flex items-center gap-1 mb-1">
                                <GraduationCap className="w-3 h-3 text-gray-400" />
                                ID: {studentId}
                              </div>
                            )}
                            {department && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                {department}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(application.appliedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              application.status
                            )}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            {application.status.charAt(0).toUpperCase() +
                              application.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedApplication(application);
                                setShowDetailsModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>

                            {application.status === "pending" && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    updateApplicationStatus(
                                      application._id,
                                      "approved"
                                    )
                                  }
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    updateApplicationStatus(
                                      application._id,
                                      "rejected"
                                    )
                                  }
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </motion.button>
                              </>
                            )}

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => deleteApplication(application._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {hasMore && filteredApplications.length > 0 && (
            <div ref={loadMoreRef} className="py-4 text-center text-sm text-gray-500">
              Loading more applications...
            </div>
          )}

          {/* Empty State */}
          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No applications found
              </h3>
              <p className="text-gray-500">
                {applications.length === 0
                  ? "You haven't received any applications yet."
                  : "Try adjusting your search criteria or filters."}
              </p>
            </div>
          )}
        </motion.div>
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
            onStatusUpdate={updateApplicationStatus}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Application Details Modal Component
const ApplicationDetailsModal = ({ application, onClose, onStatusUpdate }) => {
  const [notes, setNotes] = useState(application.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [noteSavedAt, setNoteSavedAt] = useState(
    application.notesUpdatedAt ||
      (application.notes ? application.updatedAt : null)
  );

  const handleStatusUpdate = (status) => {
    onStatusUpdate(application._id, status, notes);
    onClose();
  };

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      await onStatusUpdate(application._id, application.status, notes);
      setNoteSavedAt(new Date().toISOString());
      toast.success("Notes saved");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save notes"
      );
    } finally {
      setSavingNotes(false);
    }
  };

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Application Details
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {application.fullName || application.studentName} •{" "}
              {application.email || application.studentEmail}
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
            {/* Applicant Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <p className="text-gray-900">
                      {application.fullName ||
                        application.studentName ||
                        "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="text-gray-900">
                      {application.email ||
                        application.studentEmail ||
                        "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <p className="text-gray-900">
                      {application.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Academic Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Student ID
                    </label>
                    <p className="text-gray-900">
                      {application.studentInfo?.studentId ||
                        application.studentId ||
                        "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Department
                    </label>
                    <p className="text-gray-900">
                      {application.studentInfo?.department ||
                        application.department ||
                        "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Session
                    </label>
                    <p className="text-gray-900">
                      {application.studentInfo?.session ||
                        application.session ||
                        "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Current Year
                    </label>
                    <p className="text-gray-900">
                      {application.currentYear || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills and Experience */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Skills & Experience
              </h3>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Skills
                </label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                  {application.skills || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Experience
                </label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                  {application.experience || "Not provided"}
                </p>
              </div>
            </div>

            {/* Motivation and Expectations */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Motivation & Expectations
              </h3>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Motivation
                </label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                  {application.motivation || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Expectations
                </label>
                <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                  {application.expectations || "Not provided"}
                </p>
              </div>
            </div>

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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                >
                  <Download className="w-4 h-4" />
                  Download Resume
                </a>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Notes
              </h3>
              {noteSavedAt && (
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(noteSavedAt).toLocaleString()}
                </p>
              )}
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this application..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
          >
            Close
          </button>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="px-6 py-3 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingNotes ? "Saving..." : "Save Notes"}
            </button>

            {application.status === "pending" && (
              <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStatusUpdate("rejected")}
                className="px-6 py-3 text-red-700 bg-white border border-red-300 rounded-xl hover:bg-red-50 transition-all duration-200 font-medium flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStatusUpdate("approved")}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrganizationApplicants;