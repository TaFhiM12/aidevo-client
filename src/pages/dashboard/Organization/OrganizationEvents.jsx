import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import {
  Calendar,
  MapPin,
  Clock,
  Users,
  UserMinus,
  Building,
  Trash2,
  Eye,
  Search,
  Filter,
  ChevronDown,
  X,
  Star,
  CheckCircle2,
} from "lucide-react";
import useUserRole from "../../../hooks/useUserRole";
import AssociationEventDetails from "./shared/AssociationEventDetails";
import ClubEventDetails from "./shared/ClubEventDetails";
import SocialServiceEventDetails from "./shared/SocialServiceEventDetails";
import API from "../../../utils/api";
import useInfiniteScrollSlice from "../../../hooks/useInfiniteScrollSlice";

const OrganizationEvents = () => {
  const { userInfo } = useUserRole();
  const queryClient = useQueryClient();
  const email = userInfo?.email;
  const type = userInfo?.type;
  // const organizationName = userInfo?.organization?.name || userInfo?.name;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusUpdatingMap, setStatusUpdatingMap] = useState({});
  const [participantsModalEvent, setParticipantsModalEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState("");
  const [removingParticipantMap, setRemovingParticipantMap] = useState({});

  const {
    data: queriedEvents,
    isLoading,
  } = useQuery({
    queryKey: ["organization-events", email],
    enabled: Boolean(email),
    queryFn: async () => {
      const response = await API.get("/events");
      const allEvents = Array.isArray(response?.data) ? response.data : [];
      return allEvents.filter((event) => event.organizationEmail === email);
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
  });

  const events = queriedEvents ?? [];
  const loading = isLoading;

const handleDeleteEvent = async (eventId) => {
  const eventTitle =
    events.find((event) => event._id === eventId)?.title || "this event";

  const isConfirmed = window.confirm(
    `Delete \"${eventTitle}\"? This action cannot be undone.`
  );
  if (!isConfirmed) return;

  const deleteToast = toast.loading("Deleting event...");

  try {
    const response = await API.delete(`/events/${eventId}`);

    if (response.success) {
      queryClient.setQueryData(["organization-events", email], (currentEvents) => {
        const nextEvents = Array.isArray(currentEvents) ? currentEvents : [];
        return nextEvents.filter((event) => event._id !== eventId);
      });

      toast.success("Event deleted successfully!", {
        id: deleteToast,
        duration: 3000,
      });
    } else {
      throw new Error(response.message || "Failed to delete event");
    }
  } catch (error) {
    console.error("Error deleting event:", error);

    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      "Failed to delete event. Please try again.";

    toast.error(errorMessage, {
      id: deleteToast,
      duration: 4000,
    });
  }
};

const handleStatusUpdate = async (eventId, status) => {
  const loadingToast = toast.loading("Updating event status...");
  try {
    setStatusUpdatingMap((prev) => ({ ...prev, [eventId]: true }));
    const response = await API.patch(`/events/${eventId}/status`, { status });

    if (!response.success) {
      throw new Error(response.message || "Failed to update event status");
    }

    queryClient.setQueryData(["organization-events", email], (currentEvents) => {
      const nextEvents = Array.isArray(currentEvents) ? currentEvents : [];
      return nextEvents.map((event) =>
        event._id === eventId ? { ...event, status } : event
      );
    });

    toast.success("Event status updated", { id: loadingToast });
  } catch (error) {
    console.error("Error updating event status:", error);
    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        "Could not update event status",
      { id: loadingToast }
    );
  } finally {
    setStatusUpdatingMap((prev) => ({ ...prev, [eventId]: false }));
  }
};

const handleViewParticipants = async (event) => {
  try {
    setParticipantsModalEvent(event);
    setParticipantsLoading(true);
    setParticipantsError("");
    const response = await API.get(`/events/${event._id}/participants`);
    const participantList = Array.isArray(response?.data?.participants)
      ? response.data.participants
      : [];
    setParticipants(participantList);
  } catch (error) {
    setParticipants([]);
    setParticipantsError(
      typeof error === "string" ? error : "Failed to load participants"
    );
  } finally {
    setParticipantsLoading(false);
  }
};

const handleRemoveParticipant = async (participantId) => {
  if (!participantsModalEvent?._id) return;

  try {
    setRemovingParticipantMap((prev) => ({ ...prev, [participantId]: true }));
    await API.delete(
      `/events/${participantsModalEvent._id}/participants/${participantId}`
    );
    setParticipants((prev) => prev.filter((item) => item._id !== participantId));
    toast.success("Participant removed");
  } catch (error) {
    toast.error(
      typeof error === "string" ? error : "Could not remove participant"
    );
  } finally {
    setRemovingParticipantMap((prev) => ({ ...prev, [participantId]: false }));
  }
};

  const handleViewDetails = (event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  // Filter events
  const filteredEvents = useMemo(() => events.filter((event) => {
    const matchesSearch =
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.shortDesc?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || event.status === selectedStatus;

    return matchesSearch && matchesStatus;
  }), [events, searchTerm, selectedStatus]);

  const {
    visibleItems: visibleEvents,
    hasMore,
    loadMoreRef,
  } = useInfiniteScrollSlice(filteredEvents, {
    pageSize: 9,
    resetDeps: [searchTerm, selectedStatus, filteredEvents.length],
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  const getCategoryColor = (category) => {
    const colors = {
      professional: "from-blue-500 to-cyan-500",
      competition: "from-purple-500 to-pink-500",
      "blood-donation": "from-red-500 to-rose-500",
      workshop: "from-amber-500 to-orange-500",
      seminar: "from-teal-500 to-cyan-500",
    };
    return colors[category] || "from-gray-500 to-gray-700";
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
      draft: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const EventCard = ({ event }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="app-surface overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-md flex flex-col h-full min-h-[560px]"
    >
      {/* Event Image - Fixed Height */}
      <div className="relative h-48 overflow-hidden flex-shrink-0">
        {event.cover ? (
          <img
            src={event.cover}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${getCategoryColor(
              event.category,
            )} flex items-center justify-center`}
          >
            <Building className="w-12 h-12 text-white" />
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Status Badge */}
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}
          >
            {event.status}
          </span>
        </div>

        {/* Upcoming Badge */}
        {isUpcoming(event.startAt) && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-green-500 text-white shadow-lg backdrop-blur-sm flex items-center gap-1">
              <Star className="w-3 h-3" />
              Upcoming
            </span>
          </div>
        )}

        {/* Capacity */}
        {event.maxCapacity && (
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-gray-700 backdrop-blur-sm flex items-center gap-1">
              <Users className="w-3 h-3" />
              {event.maxCapacity} spots
            </span>
          </div>
        )}
      </div>

      {/* Event Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Title and Description Section */}
        <div className="flex-1 mb-4">
          <h3 className="font-bold text-gray-900 text-xl leading-tight line-clamp-2 mb-3 group-hover:text-blue-500 transition-colors min-h-[56px]">
            {event.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 min-h-[60px]">
            {event.shortDesc}
          </p>
        </div>

        {/* Event Details */}
        <div className="space-y-2 text-sm text-gray-500 mb-4 min-h-[76px]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">{formatDate(event.startAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 flex-shrink-0" />
            <span className="truncate">
              {formatTime(event.startAt)} - {formatTime(event.endAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="truncate capitalize">
              {event.type} • {event.location}
            </span>
          </div>
        </div>

        {/* Tags */}
        {event.tags && (
          <div className="flex flex-wrap gap-1 mb-4 min-h-[36px] content-start">
            {(Array.isArray(event.tags) ? event.tags : event.tags.split(","))
              .slice(0, 3)
              .map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium"
                >
                  #{tag.trim()}
                </span>
              ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-end justify-between gap-3 pt-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewDetails(event)}
              className="app-btn-primary text-sm px-4 py-2"
            >
              <Eye className="w-4 h-4" />
              Details
            </button>
            <button
              onClick={() => handleViewParticipants(event)}
              className="app-btn-secondary text-sm px-4 py-2"
            >
              <Users className="w-4 h-4" />
              Participants
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={event.status || "active"}
              onChange={(e) => handleStatusUpdate(event._id, e.target.value)}
              disabled={Boolean(statusUpdatingMap[event._id])}
              className="h-9 text-xs px-2 border border-gray-200 rounded-lg bg-white text-gray-700"
            >
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="draft">Draft</option>
            </select>
            <button
              onClick={() => handleDeleteEvent(event._id)}
              className="h-9 w-9 inline-flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors duration-200 rounded-lg hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            {statusUpdatingMap[event._id] && (
              <CheckCircle2 className="w-4 h-4 text-sky-500 animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );

  if (loading && events.length === 0) {
    return (
      <div className="space-y-6">
        <div className="app-surface p-6 animate-pulse">
          <div className="h-8 w-56 rounded bg-gray-200 mb-3" />
          <div className="h-4 w-80 rounded bg-gray-200" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="app-surface p-5 animate-pulse min-h-[420px]">
              <div className="h-44 rounded-xl bg-gray-200 mb-5" />
              <div className="h-6 w-3/4 rounded bg-gray-200 mb-3" />
              <div className="h-4 w-full rounded bg-gray-200 mb-2" />
              <div className="h-4 w-2/3 rounded bg-gray-200 mb-4" />
              <div className="h-10 w-full rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 px-4 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}

        {/* Search and Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="app-surface backdrop-blur-sm p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your events..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all duration-300 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Toggle */}
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

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedStatus("all");
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Events Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Results Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-600">
              Showing{" "}
              <span className="font-bold text-gray-900">
                {filteredEvents.length}
              </span>{" "}
              of {events.length} events
              {searchTerm && ` for "${searchTerm}"`}
            </p>
          </div>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 bg-white/50 rounded-2xl border-2 border-dashed border-gray-200"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No events found
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm
                  ? `No events match "${searchTerm}". Try different keywords or clear filters.`
                  : "You haven't created any events yet."}
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {visibleEvents.map((event, index) => (
                  <motion.div
                    key={event._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="h-full"
                  >
                    <EventCard event={event} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {hasMore && filteredEvents.length > 0 && (
            <div ref={loadMoreRef} className="py-6 text-center text-sm text-gray-500">
              Loading more events...
            </div>
          )}
        </motion.div>

        {/* Details Modal */}
        <AnimatePresence>
          {showDetailsModal && selectedEvent && (
            <EventDetailsModal
              event={selectedEvent}
              onClose={() => setShowDetailsModal(false)}
              organizationType={type}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {participantsModalEvent && (
            <ParticipantsModal
              event={participantsModalEvent}
              participants={participants}
              loading={participantsLoading}
              error={participantsError}
              removingParticipantMap={removingParticipantMap}
              onRemoveParticipant={handleRemoveParticipant}
              onClose={() => {
                setParticipantsModalEvent(null);
                setParticipants([]);
                setParticipantsError("");
                setParticipantsLoading(false);
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Event Details Modal Component
const EventDetailsModal = ({ event, onClose, organizationType }) => {
  const renderEventDetails = () => {
    switch (organizationType) {
      case "Association":
        return <AssociationEventDetails event={event} />;
      case "Club":
        return <ClubEventDetails event={event} />;
      case "Social Service":
        return <SocialServiceEventDetails event={event} />;
      default:
        return <DefaultEventDetails event={event} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Event Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto">
            {renderEventDetails()}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Default Event Details (Fallback)
const DefaultEventDetails = ({ event }) => (
  <div className="p-6 space-y-6">
    {/* Basic Information */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Basic Information
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">Title</label>
            <p className="text-gray-900">{event.title}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Description
            </label>
            <p className="text-gray-900">{event.shortDesc}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Category
            </label>
            <p className="text-gray-900 capitalize">{event.category}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Event Details
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">
              {new Date(event.startAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">
              {new Date(event.startAt).toLocaleTimeString()} -{" "}
              {new Date(event.endAt).toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-gray-900">
              Capacity: {event.maxCapacity || "Unlimited"}
            </span>
          </div>
        </div>
      </div>
    </div>

    {/* Additional Information */}
    {event.longDesc && (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Detailed Description
        </h3>
        <p className="text-gray-700 leading-relaxed">{event.longDesc}</p>
      </div>
    )}

    {/* Contact Information */}
    {(event.contactName || event.contactEmail || event.contactPhone) && (
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {event.contactName && (
            <div>
              <label className="text-sm font-medium text-gray-500">
                Contact Person
              </label>
              <p className="text-gray-900">{event.contactName}</p>
            </div>
          )}
          {event.contactEmail && (
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{event.contactEmail}</p>
            </div>
          )}
          {event.contactPhone && (
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <p className="text-gray-900">{event.contactPhone}</p>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);

const ParticipantsModal = ({
  event,
  participants,
  loading,
  error,
  removingParticipantMap,
  onRemoveParticipant,
  onClose,
}) => {
  const formatJoinedAt = (value) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const escapeCsvValue = (value) => {
    const stringValue = String(value ?? "");
    if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
      return `"${stringValue.replace(/\"/g, '""')}"`;
    }
    return stringValue;
  };

  const exportParticipantsCsv = () => {
    if (!participants.length) {
      toast.error("No participants to export");
      return;
    }

    const headers = [
      "Event",
      "Student Name",
      "Student Email",
      "Department",
      "Joined At",
    ];

    const rows = participants.map((participant) => [
      event?.title || "",
      participant.studentName || "",
      participant.studentEmail || "",
      participant.studentDepartment || "",
      formatJoinedAt(participant.joinedAt),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsvValue(cell)).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(event?.title || "event-participants")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-participants.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Event Participants</h3>
            <p className="text-sm text-gray-600 mt-1">{event?.title}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportParticipantsCsv}
              className="h-9 px-3 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium"
            >
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[68vh]">
          {loading ? (
            <div className="text-sm text-gray-600">Loading participants...</div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
              {error}
            </div>
          ) : participants.length === 0 ? (
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 text-center text-slate-600">
              No participants yet.
            </div>
          ) : (
            <div className="space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant._id}
                  className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">
                      {participant.studentName || "Unnamed Student"}
                    </p>
                    <p className="text-sm text-slate-600 truncate">
                      {participant.studentEmail || "No email"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Joined: {formatJoinedAt(participant.joinedAt)}
                    </p>
                  </div>

                  <button
                    onClick={() => onRemoveParticipant(participant._id)}
                    disabled={Boolean(removingParticipantMap[participant._id])}
                    className="h-9 px-3 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm font-medium inline-flex items-center gap-1 disabled:opacity-50"
                  >
                    <UserMinus className="w-4 h-4" />
                    {removingParticipantMap[participant._id]
                      ? "Removing..."
                      : "Remove"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OrganizationEvents;
