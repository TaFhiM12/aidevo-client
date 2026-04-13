import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Building,
  MapPin,
  Users,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  X,
  ExternalLink,
  Mail,
  Shield,
  Heart,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router";
import useAuth from "../../../hooks/useAuth";
import useUserRole from "../../../hooks/useUserRole";
import API from "../../../utils/api";
import useInfiniteScrollSlice from "../../../hooks/useInfiniteScrollSlice";

const MotionDiv = motion.div;

const MyOrganization = () => {
  const { user } = useAuth();
  const { userInfo } = useUserRole();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const {
    data: organizations = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['my-organizations', user?.email],
    enabled: Boolean(user?.email && userInfo),
    queryFn: async () => {
      const studentMongoId = userInfo?.studentId || userInfo?._id;

      if (!studentMongoId) {
        return [];
      }

      const orgResponse = await API.get(
        `/students/${studentMongoId}/organizations`
      );

      return Array.isArray(orgResponse?.data) ? orgResponse.data : [];
    },
    staleTime: 1000 * 60 * 3,
  });

  const filteredOrganizations = useMemo(() => organizations.filter((org) => {
    const orgInfo = org?.organizationInfo || {};
    const orgName = org?.organizationName || "";
    const orgEmail = org?.organizationEmail || "";

    const matchesSearch =
      orgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orgEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (orgInfo.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (orgInfo.campus || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      selectedType === "all" || orgInfo.type === selectedType;

    return matchesSearch && matchesType;
  }), [organizations, searchTerm, selectedType]);

  const {
    visibleItems: visibleOrganizations,
    hasMore,
    loadMoreRef,
  } = useInfiniteScrollSlice(filteredOrganizations, {
    pageSize: 6,
    resetDeps: [searchTerm, selectedType, filteredOrganizations.length],
  });

  const organizationTypes = useMemo(() => [
    "all",
    ...new Set(
      organizations.map((org) => org?.organizationInfo?.type).filter(Boolean)
    ),
  ], [organizations]);

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      Club: "from-purple-500 to-pink-500",
      "Social Service": "from-red-500 to-rose-500",
      Association: "from-blue-500 to-cyan-500",
      NGO: "from-green-500 to-emerald-500",
      Department: "from-indigo-500 to-purple-500",
      Community: "from-orange-500 to-red-500",
      Society: "from-teal-500 to-cyan-500",
    };

    return colors[type] || "from-gray-500 to-gray-700";
  };

  const getTypeIcon = (type) => {
    const icons = {
      Club: "🏆",
      "Social Service": "❤️",
      Association: "🤝",
      NGO: "🌱",
      Department: "🎓",
      Community: "🏘️",
      Society: "👥",
    };

    return icons[type] || "🏢";
  };

  const OrganizationCard = ({ org }) => {
    if (!org) return null;

    const type = org?.organizationInfo?.type || "Organization";
    const campus = org?.organizationInfo?.campus || "Unknown Campus";
    const orgName = org?.organizationName || "Organization";
    const orgPhoto = org?.organizationPhoto || "";
    const orgEmail = org?.organizationEmail || "";
    const orgId = org?.organizationId;

    return (
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5 }}
        className="app-surface overflow-hidden group transition-all duration-300 hover:shadow-md flex flex-col h-full min-h-[520px]"
      >
        <div className="relative h-48 overflow-hidden">
          {orgPhoto ? (
            <img
              src={orgPhoto}
              alt={orgName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${getTypeColor(type)} flex items-center justify-center`}
            >
              <span className="text-4xl">{getTypeIcon(type)}</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-4 left-4">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getTypeColor(type)} shadow-lg`}
            >
              {type}
            </span>
          </div>

          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg ${
                org.status === "active"
                  ? "bg-green-500 text-white"
                  : "bg-gray-500 text-white"
              }`}
            >
              {org.status}
            </span>
          </div>

          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-gray-700 backdrop-blur-sm flex items-center gap-1">
              <Users className="w-3 h-3" />
              {org.role || "member"}
            </span>
          </div>

          {org?.organizationInfo?.verified && (
            <div className="absolute bottom-4 right-4">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-500 text-white backdrop-blur-sm flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Verified
              </span>
            </div>
          )}
        </div>

        <div className="p-6 flex flex-col flex-1">
          <h3 className="font-bold text-gray-900 text-xl leading-tight mb-2 min-h-[56px] group-hover:text-blue-500 transition-colors">
            {orgName}
          </h3>

          <div className="space-y-3 text-sm text-gray-500 mb-4 min-h-[110px]">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{campus}</span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>Member since {formatDate(org.joinedAt)}</span>
            </div>

            {orgEmail && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{orgEmail}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700">
              {type}
            </span>
            <span
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                org.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {org.status}
            </span>
          </div>

          <div className="pt-4 border-t border-gray-100 mt-auto">
            {orgId ? (
              <Link
                to={`/organizations/${orgId}`}
                className="app-btn-primary text-sm w-full"
              >
                View Organization
                <ExternalLink className="w-4 h-4" />
              </Link>
            ) : (
              <span className="inline-flex items-center justify-center gap-2 px-4 py-2 w-full bg-gray-200 text-gray-500 rounded-lg font-semibold text-sm">
                Organization Unavailable
              </span>
            )}
          </div>
        </div>
      </MotionDiv>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="app-surface p-6">
                  <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {String(error || "Failed to load organizations")}
          </div>
        )}

        <MotionDiv
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="app-surface backdrop-blur-sm p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search organizations..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all duration-300 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="app-btn-primary px-6 py-4"
            >
              <Filter className="w-5 h-5" />
              Filters
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <MotionDiv
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Organization Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300"
                    >
                      {organizationTypes.map((type) => (
                        <option key={type} value={type}>
                          {type === "all" ? "All Types" : type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedType("all");
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  </div>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence>
        </MotionDiv>

        <MotionDiv
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing{" "}
              <span className="font-bold text-gray-900">
                {filteredOrganizations.length}
              </span>{" "}
              of {organizations.length} organizations
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>

          {filteredOrganizations.length === 0 ? (
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white/50 rounded-2xl border-2 border-dashed border-gray-200"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Building className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {organizations.length === 0
                  ? "No organizations found"
                  : "No matching organizations"}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm
                  ? `No organizations match "${searchTerm}". Try different keywords or clear filters.`
                  : "You are not a member of any organizations yet."}
              </p>
              <Link
                to="/organization"
                className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors"
              >
                <Heart className="w-4 h-4" />
                Browse Organizations
              </Link>
            </MotionDiv>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {visibleOrganizations.map((org, index) => (
                  <MotionDiv
                    key={org._id || org.organizationId || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <OrganizationCard org={org} />
                  </MotionDiv>
                ))}
              </AnimatePresence>
            </div>
          )}

          {hasMore && filteredOrganizations.length > 0 && (
            <div ref={loadMoreRef} className="py-6 text-center text-sm text-gray-500">
              Loading more organizations...
            </div>
          )}
        </MotionDiv>
      </div>
    </div>
  );
};

export default MyOrganization;