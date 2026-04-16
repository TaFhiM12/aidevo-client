import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Search,
  Filter,
  Heart,
  Share2,
  Building,
  ChevronDown,
  X,
  ArrowRight,
  Star,
} from "lucide-react";
import { Link, useSearchParams } from "react-router";
import API from '../../utils/api';
import useAuth from '../../hooks/useAuth';
import { useUserContext } from '../../context/UserContext';
import EventRecommendationsSection from '../../components/events/EventRecommendationsSection';
import TrendingEventsSection from '../../components/events/TrendingEventsSection';
import PaginationControls from '../../components/common/PaginationControls';

const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedOrganization, setSelectedOrganization] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(() => {
    const parsedPage = Number.parseInt(searchParams.get("page") || "1", 10);
    return Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  });

  const ITEMS_PER_PAGE = 9;

  const { user } = useAuth();
  const { globalUserInfo } = useUserContext();
  const isStudentUser = String(globalUserInfo?.role || "").toLowerCase() === "student";
  const recommendationStudentId = isStudentUser
    ? globalUserInfo?.uid || globalUserInfo?._id || globalUserInfo?.studentId
    : null;

  const formatOptionLabel = (value, allLabel, replacer = null) => {
    const text = String(value || "").trim();
    if (!text || text === "all") {
      return allLabel;
    }

    const normalized = replacer ? text.replace(replacer.from, replacer.to) : text;
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  const normalizeInterests = (value) => {
    if (Array.isArray(value)) {
      return value.map((interest) => String(interest).trim()).filter(Boolean).join(", ");
    }

    return String(value || "")
      .split(",")
      .map((interest) => interest.trim())
      .filter(Boolean)
      .join(", ");
  };

  const {
    data: events = [],
    isLoading: loading,
  } = useQuery({
    queryKey: ["public-events"],
    queryFn: async () => {
      const response = await API.get("/events");
      if (!response?.success) {
        return [];
      }
      return Array.isArray(response.data) ? response.data : [];
    },
    staleTime: 1000 * 60 * 3,
  });

  const upcomingEventsCount = useMemo(
    () => events.filter((event) => new Date(event?.startAt).getTime() > Date.now()).length,
    [events]
  );
  const activeCategoryCount = useMemo(
    () =>
      new Set(
        events
          .map((event) => String(event.category || "").trim())
          .filter(Boolean)
      ).size,
    [events]
  );
  const activeOrganizationCount = useMemo(
    () =>
      new Set(
        events
          .map((event) => String(event.organization || "").trim())
          .filter(Boolean)
      ).size,
    [events]
  );

  // Get unique values for filters
  const categories = useMemo(
    () => [
      "all",
      ...new Set(
        events
          .map((event) => String(event.category || "").trim())
          .filter(Boolean)
      ),
    ],
    [events]
  );
  const organizations = useMemo(
    () => [
      "all",
      ...new Set(
        events
          .map((event) => String(event.organization || "").trim())
          .filter(Boolean)
      ),
    ],
    [events]
  );
  const types = useMemo(
    () => [
      "all",
      ...new Set(
        events
          .map((event) => String(event.type || "").trim())
          .filter(Boolean)
      ),
    ],
    [events]
  );

  const categoryCounts = useMemo(() => {
    const counts = { all: events.length };
    events.forEach((event) => {
      const key = String(event.category || "").trim();
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [events]);

  const typeCounts = useMemo(() => {
    const counts = { all: events.length };
    events.forEach((event) => {
      const key = String(event.type || "").trim();
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [events]);

  const quickCategoryOptions = useMemo(() => {
    const dynamic = Object.entries(categoryCounts)
      .filter(([key]) => key !== "all")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key]) => key);
    return ["all", ...dynamic];
  }, [categoryCounts]);

  const quickTypeOptions = useMemo(() => {
    const dynamic = Object.entries(typeCounts)
      .filter(([key]) => key !== "all")
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([key]) => key);
    return ["all", ...dynamic];
  }, [typeCounts]);

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.shortDesc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organization?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || event.category === selectedCategory;
    const matchesOrganization =
      selectedOrganization === "all" ||
      event.organization === selectedOrganization;
    const matchesType = selectedType === "all" || event.type === selectedType;

    return (
      matchesSearch && matchesCategory && matchesOrganization && matchesType
    );
  });

  // Sort events
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const parseDeadline = (event) => {
      const deadline = event?.registrationDeadline || event?.paymentDeadline || event?.startAt;
      const ts = deadline ? new Date(deadline).getTime() : Number.MAX_SAFE_INTEGER;
      return Number.isFinite(ts) ? ts : Number.MAX_SAFE_INTEGER;
    };

    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "date-asc":
        return new Date(a.startAt) - new Date(b.startAt);
      case "date-desc":
        return new Date(b.startAt) - new Date(a.startAt);
      case "deadline-first":
        return parseDeadline(a) - parseDeadline(b);
      default:
        return 0;
    }
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedOrganization, selectedType, sortBy]);

  useEffect(() => {
    const parsedPage = Number.parseInt(searchParams.get("page") || "1", 10);
    const pageFromUrl = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
    setCurrentPage((prevPage) => (prevPage === pageFromUrl ? prevPage : pageFromUrl));
  }, [searchParams]);

  const totalPages = Math.max(1, Math.ceil(sortedEvents.length / ITEMS_PER_PAGE));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const currentQueryPage = searchParams.get("page");
    const targetQueryPage = currentPage > 1 ? String(currentPage) : null;

    if ((currentQueryPage || null) === targetQueryPage) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    if (targetQueryPage) {
      nextParams.set("page", targetQueryPage);
    } else {
      nextParams.delete("page");
    }
    setSearchParams(nextParams, { replace: true });
  }, [currentPage, searchParams, setSearchParams]);

  const currentPageSafe = Math.min(currentPage, totalPages);

  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPageSafe - 1) * ITEMS_PER_PAGE;
    return sortedEvents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPageSafe, sortedEvents]);

  const showingStart = sortedEvents.length === 0 ? 0 : (currentPageSafe - 1) * ITEMS_PER_PAGE + 1;
  const showingEnd = Math.min(currentPageSafe * ITEMS_PER_PAGE, sortedEvents.length);

  const getNextDeadline = (event) => {
    return event?.registrationDeadline || event?.paymentDeadline || null;
  };

  const isClosingSoon = (event) => {
    const deadline = getNextDeadline(event);
    if (!deadline) return false;
    const diff = new Date(deadline).getTime() - Date.now();
    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  };

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
      academic: "from-blue-500 to-cyan-500",
      cultural: "from-purple-500 to-pink-500",
      sports: "from-green-500 to-emerald-500",
      social: "from-orange-500 to-red-500",
      religious: "from-indigo-500 to-purple-500",
      charity: "from-rose-500 to-red-500",
      workshop: "from-amber-500 to-orange-500",
      seminar: "from-teal-500 to-cyan-500",
      competition: "from-violet-500 to-purple-500",
      "blood-donation": "from-red-500 to-rose-500",
    };
    return colors[category] || "from-gray-500 to-gray-700";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      academic: "📚",
      cultural: "🎭",
      sports: "⚽",
      social: "🎉",
      religious: "🕌",
      charity: "🤝",
      workshop: "🔧",
      seminar: "💡",
      competition: "🏆",
      "blood-donation": "💉",
    };
    return icons[category] || "🎯";
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedOrganization("all");
    setSelectedType("all");
  };

  const EventCard = ({ event }) => (
    <motion.div
      whileHover={{ y: -5 }}
      className="app-surface overflow-hidden group cursor-pointer transition-shadow duration-200 hover:shadow-md flex flex-col h-full min-h-[540px]"
    >
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        {event.cover ? (
          <img
            src={event.cover}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${getCategoryColor(
              event.category
            )} flex items-center justify-center`}
          >
            <span className="text-4xl">{getCategoryIcon(event.category)}</span>
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${getCategoryColor(
              event.category
            )} shadow-lg backdrop-blur-sm`}
          >
            {event.category.replace("-", " ")}
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

        {/* Organization */}
        <div className="absolute bottom-4 left-4">
          <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/90 text-gray-700 backdrop-blur-sm flex items-center gap-1">
            <Building className="w-3 h-3" />
            {event.organization}
          </span>
        </div>
      </div>

      {/* Event Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="mb-3 flex-1">
          <h3 className="text-xl font-semibold text-slate-900 leading-tight line-clamp-2 mb-2 min-h-[56px] group-hover:text-[#4bbeff] transition-colors">
            {event.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 min-h-[44px]">
            {event.shortDesc}
          </p>
        </div>

        {/* Event Details */}
        <div className="space-y-2 text-sm text-gray-500 mb-4 min-h-[76px]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.startAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>
              {formatTime(event.startAt)} - {formatTime(event.endAt)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="capitalize">
              {event.type} • {event.location}
            </span>
          </div>
          {getNextDeadline(event) && (
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 ${isClosingSoon(event) ? 'text-amber-600' : ''}`} />
              <span className={isClosingSoon(event) ? 'text-amber-700 font-medium' : ''}>
                Registration closes: {formatDate(getNextDeadline(event))}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {event.tags && (
          <div className="flex flex-wrap gap-1 mb-4 min-h-[34px] content-start">
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
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200 rounded-lg hover:bg-red-50">
              <Heart className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors duration-200 rounded-lg hover:bg-blue-50">
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          <Link
            to={`/events/${event._id}`}
            className="app-btn-primary text-sm font-semibold tracking-tight px-4 py-2"
          >
            View Details
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="app-surface p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-sky-700 uppercase tracking-wide mb-2">
                Event Directory
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
                Discover high-impact campus events and opportunities
              </h1>
              <p className="text-slate-600 text-base md:text-lg max-w-3xl">
                Explore upcoming events, workshops, and activities curated across organizations and communities.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 md:gap-3 min-w-[280px]">
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-center">
                <p className="text-lg font-bold text-slate-900">{upcomingEventsCount}</p>
                <p className="text-xs text-slate-600">Upcoming</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-center">
                <p className="text-lg font-bold text-slate-900">{activeCategoryCount}</p>
                <p className="text-xs text-slate-600">Categories</p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-center">
                <p className="text-lg font-bold text-slate-900">{activeOrganizationCount}</p>
                <p className="text-xs text-slate-600">Organizations</p>
              </div>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6 animate-pulse">
              <div className="h-11 rounded-xl bg-gray-200 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-10 rounded-lg bg-gray-200" />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-xl mb-4" />
                  <div className="h-6 bg-gray-200 rounded mb-3" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>

        {/* Personalized Recommendations - Only for logged-in students */}
        {user && recommendationStudentId && (
          <>
            <EventRecommendationsSection
              studentId={recommendationStudentId}
              requesterUid={user.uid}
              title="Recommended For You"
              limit={6}
            />
            <div className="my-12 border-t border-gray-200"></div>
          </>
        )}

        {/* Trending Events Section */}
        <TrendingEventsSection
          interests={normalizeInterests(globalUserInfo?.interests)}
          title="Trending Now"
          limit={6}
        />

        <div className="my-12 border-t border-gray-200"></div>

        {/* Browse All Events Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse All Events</h2>
        </motion.div>

        {/* Search and Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="app-surface p-6 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events, organizations, or topics..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4bbeff]/30 focus:bg-white transition-all duration-300 text-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="app-btn-primary text-sm md:text-base font-semibold tracking-tight px-6 py-4"
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

          <div className="space-y-3 mb-4">
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-2">
              <div className="flex items-center gap-2 flex-wrap">
                {quickCategoryOptions.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setSelectedCategory(category)}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <span>
                        {formatOptionLabel(category, "All Categories", {
                          from: /-/g,
                          to: " ",
                        })}
                      </span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-xs ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-white text-slate-600"
                        }`}
                      >
                        {categoryCounts[category] || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white/70 p-2">
              <div className="flex items-center gap-2 flex-wrap">
                {quickTypeOptions.map((type) => {
                  const isActive = selectedType === type;
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(type)}
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <span>{formatOptionLabel(type, "All Types")}</span>
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-xs ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-white text-slate-600"
                        }`}
                      >
                        {typeCounts[type] || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Filters Info */}
          {(searchTerm ||
            selectedCategory !== "all" ||
            selectedOrganization !== "all" ||
            selectedType !== "all") && (
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg mb-4">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <span>Active filters:</span>
                {searchTerm && (
                  <span className="px-2 py-1 bg-blue-100 rounded">
                    Search: "{searchTerm}"
                  </span>
                )}
                {selectedCategory !== "all" && (
                  <span className="px-2 py-1 bg-blue-100 rounded">
                    Category: {selectedCategory}
                  </span>
                )}
                {selectedOrganization !== "all" && (
                  <span className="px-2 py-1 bg-blue-100 rounded">
                    Org: {selectedOrganization}
                  </span>
                )}
                {selectedType !== "all" && (
                  <span className="px-2 py-1 bg-blue-100 rounded">
                    Type: {selectedType}
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <X className="w-4 h-4" />
                Clear All
              </button>
            </div>
          )}

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4bbeff]/30 transition-all duration-300"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {formatOptionLabel(cat, "All Categories", {
                            from: /-/g,
                            to: " ",
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Organization Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Organization
                    </label>
                    <select
                      value={selectedOrganization}
                      onChange={(e) => setSelectedOrganization(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4bbeff]/30 transition-all duration-300"
                    >
                      {organizations.map((org) => (
                        <option key={org} value={org}>
                          {org === "all" ? "All Organizations" : org}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Event Type
                    </label>
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4bbeff]/30 transition-all duration-300"
                    >
                      {types.map((type) => (
                        <option key={type} value={type}>
                          {formatOptionLabel(type, "All Types")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4bbeff]/30 transition-all duration-300"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="date-asc">Date (Soonest)</option>
                      <option value="date-desc">Date (Latest)</option>
                      <option value="deadline-first">Deadline First</option>
                    </select>
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
                {showingStart}-{showingEnd}
              </span>{" "}
              of {sortedEvents.length} events
              {searchTerm && ` for "${searchTerm}"`}
            </p>

            {/* View Options */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>{events.length} total events in database</span>
            </div>
          </div>

          {/* Events Grid */}
          {sortedEvents.length === 0 ? (
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
                  : "No events match your current filters."}
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-[#4bbeff] text-white text-sm md:text-base font-semibold tracking-tight rounded-lg hover:bg-blue-500 transition-colors"
              >
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedEvents.map((event) => (
                <div key={event._id}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}

          {sortedEvents.length > 0 && (
            <PaginationControls
              className="mt-8"
              currentPage={currentPageSafe}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default Events;
