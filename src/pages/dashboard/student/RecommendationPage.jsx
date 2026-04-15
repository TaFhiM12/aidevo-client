import React, { useState } from "react";
import { RefreshCw, AlertCircle, Filter } from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import useUserRole from "../../../hooks/useUserRole";
import Loading from "../../../components/common/Loading";
import EventRecommendationsSection from "../../../components/events/EventRecommendationsSection";
import TrendingEventsSection from "../../../components/events/TrendingEventsSection";

const RecommendationPage = () => {
  const { user } = useAuth();
  const { userInfo, loading, error } = useUserRole();
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeView, setActiveView] = useState("all");

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50/40 px-4 py-2 pb-10">
      <div key={refreshKey} className="max-w-7xl mx-auto">
        <div className="app-surface p-4 mb-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
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

            <button
              type="button"
              onClick={() => setRefreshKey((prev) => prev + 1)}
              className="app-btn-primary ml-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          <div className="mt-3 rounded-2xl border border-slate-200 bg-white/70 p-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-slate-500">
                <Filter className="w-4 h-4" />
                <span>View</span>
              </div>
              {[
                { value: "all", label: "All" },
                { value: "recommended", label: "Recommended" },
                { value: "trending", label: "Trending" },
              ].map((option) => {
                const isActive = activeView === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setActiveView(option.value)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {(activeView === "all" || activeView === "recommended") && (
          <EventRecommendationsSection
            key={`recommended-${refreshKey}`}
            studentId={studentIdentifier}
            requesterUid={user.uid}
            title=""
            limit={6}
          />
        )}

        {(activeView === "all" || activeView === "trending") && (
          <TrendingEventsSection
            key={`trending-${refreshKey}`}
            interests={interests}
            title=""
            limit={6}
          />
        )}
      </div>
    </div>
  );
};

export default RecommendationPage;
