import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Building,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Compass,
} from "lucide-react";
import { Link } from "react-router";
import { useTrendingEvents } from "../../hooks/useRecommendations";

const TrendingEventsSection = ({ interests = "", title = "Trending Events", limit = 6 }) => {
  const { trendingEvents, loading, error } = useTrendingEvents(interests, limit);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
    };
    return colors[category] || "from-gray-500 to-gray-700";
  };

  if (loading) {
    return (
      <div className="py-3">
        {title ? <h2 className="section-title-lg text-gray-900 mb-6">{title}</h2> : null}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="app-surface p-5 animate-pulse min-h-[260px]">
              <div className="h-16 w-16 rounded-xl bg-gray-200 mb-4"></div>
              <div className="h-6 w-2/3 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <section className="py-3">
        {title ? <h2 className="section-title-lg text-gray-900 mb-6">{title}</h2> : null}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700">Could not load trending events</p>
            <p className="text-sm text-red-600 mt-1">
              Try refreshing in a moment.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (trendingEvents.length === 0) {
    return (
      <section className="py-3">
        {title ? <h2 className="section-title-lg text-gray-900 mb-6">{title}</h2> : null}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 flex items-start gap-3">
          <Compass className="w-5 h-5 text-orange-600 mt-0.5" />
          <div>
            <p className="font-semibold text-orange-800">No trending events right now</p>
            <p className="text-sm text-orange-700 mt-1">
              New events will appear here as student participation grows.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="py-3"
    >
      {title ? (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="section-title-lg text-gray-900">{title}</h2>
            <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Popular
            </span>
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {trendingEvents.map((event, index) => (
            <motion.div
              key={event._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="app-surface overflow-hidden hover:shadow-md transition-all duration-300 h-full flex flex-col">
                {/* Event Image */}
                <div className="relative h-32 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                  {event.cover ? (
                    <img
                      src={event.cover}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${getCategoryColor(
                        event.organizationType
                      )} flex items-center justify-center`}
                    >
                      <span className="text-3xl">🔥</span>
                    </div>
                  )}

                  {/* Popularity Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                      Trending
                    </span>
                  </div>

                  {/* Organization Badge */}
                  <div className="absolute bottom-2 left-2">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-white/90 text-gray-700 backdrop-blur-sm flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      {event.organization?.slice(0, 15)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2 mb-2 group-hover:text-[#4bbeff] transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3 flex-grow">
                    {event.shortDesc}
                  </p>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                    {event.startAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(event.startAt)}</span>
                      </div>
                    )}
                    {event.startAt && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(event.startAt)}</span>
                      </div>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3" />
                        <span className="capitalize">{event.location}</span>
                      </div>
                    )}
                  </div>

                  {/* View Button */}
                  <Link
                    to={`/events/${event._id}`}
                    className="app-btn-secondary w-full py-2 text-sm justify-center"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default TrendingEventsSection;
