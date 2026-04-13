import React from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Building,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Link } from "react-router";
import { useEventRecommendations } from "../../hooks/useRecommendations";

/**
 * Compact Event Recommendations Widget
 * Perfect for sidebars or dashboards
 *
 * Usage:
 * <EventRecommendationsWidget studentId={studentId} limit={3} />
 */
const EventRecommendationsWidget = ({ studentId, limit = 3 }) => {
  const { recommendations, loading, error } = useEventRecommendations(studentId, limit);

  if (!studentId) return null;
  if (loading) return <div className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>;
  if (error || recommendations.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md border border-gray-100 p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-bold text-gray-900 text-sm">Recommendations</h3>
        <span className="px-2 py-0.5 bg-gradient-to-r from-[#4bbeff] to-blue-500 text-white text-xs rounded-full flex items-center gap-1">
          <Zap className="w-2.5 h-2.5" />
          Smart
        </span>
      </div>

      <div className="space-y-3">
        {recommendations.map((event) => (
          <Link
            key={event._id}
            to={`/events/${event._id}`}
            className="group block p-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <h4 className="text-xs font-semibold text-gray-900 line-clamp-1 group-hover:text-[#4bbeff]">
              {event.title}
            </h4>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{new Date(event.startAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-1 mt-1">{event.organization}</p>
          </Link>
        ))}
      </div>

      <Link
        to="/events"
        className="mt-3 w-full inline-flex items-center justify-center gap-1 px-3 py-2 bg-gradient-to-r from-[#4bbeff] to-blue-500 text-white text-xs font-semibold rounded-lg hover:shadow-md transition-all"
      >
        View All
        <ArrowRight className="w-3 h-3" />
      </Link>
    </motion.div>
  );
};

export default EventRecommendationsWidget;
