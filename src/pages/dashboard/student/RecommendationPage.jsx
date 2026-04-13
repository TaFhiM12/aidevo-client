import React, { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import useUserRole from "../../../hooks/useUserRole";
import Loading from "../../../components/common/Loading";
import EventRecommendationsSection from "../../../components/events/EventRecommendationsSection";
import TrendingEventsSection from "../../../components/events/TrendingEventsSection";

const RecommendationPage = () => {
  const { user } = useAuth();
  const { userInfo, loading, error } = useUserRole();
  const [refreshKey, setRefreshKey] = useState(0);

  const normalizeInterests = (value) => {
    if (Array.isArray(value)) {
      return value.map((interest) => String(interest).trim()).filter(Boolean);
    }

    return String(value || "")
      .split(",")
      .map((interest) => interest.trim())
      .filter(Boolean);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span>Unable to load recommendations right now.</span>
        </div>
      </div>
    );
  }

  if (!user || !userInfo || userInfo.role !== "student") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-lg w-full app-surface p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Access Required</h2>
          <p className="text-gray-600">
            Recommended events are available only for student accounts.
          </p>
        </div>
      </div>
    );
  }

  const interests = normalizeInterests(userInfo?.interests);
  const studentIdentifier = userInfo?.uid || userInfo?._id || userInfo?.studentId;

  return (
    <div className="min-h-full bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-2 md:p-4 rounded-2xl">
      <motion.div
        key={refreshKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-100 text-sky-700 text-sm font-semibold mb-3">
                <Sparkles className="w-4 h-4" />
                Recommended For You
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Recommended Events</h1>
              <p className="text-gray-600 mt-2">
                Explore relevant and trending campus opportunities based on your interests and activity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className="app-btn-primary"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span className="font-semibold text-gray-800">Interests:</span>
            {interests.length > 0 ? (
              interests.map((interest) => (
                <span
                  key={interest}
                  className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-medium"
                >
                  {interest}
                </span>
              ))
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                No interests set yet
              </span>
            )}
          </div>
        </div>

        <EventRecommendationsSection
          key={`recommended-${refreshKey}`}
          studentId={studentIdentifier}
          requesterUid={user.uid}
          title="Recommended For You"
          limit={6}
        />

        <div className="my-8 border-t border-gray-200" />

        <div className="flex items-center gap-2 text-gray-700 mb-2">
          <TrendingUp className="w-5 h-5" />
          <span className="font-semibold">Campus Momentum</span>
        </div>

        <TrendingEventsSection
          key={`trending-${refreshKey}`}
          interests={interests}
          title="Trending Events"
          limit={6}
        />
      </motion.div>
    </div>
  );
};

export default RecommendationPage;
