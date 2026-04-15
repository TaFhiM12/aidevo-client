import React from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Clock,
  CheckCircle,
  Users,
  Sparkles,
  Calendar,
  FileText,
  ArrowRight,
  Building2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router";
import useAuth from "../../../hooks/useAuth";
import useUserRole from "../../../hooks/useUserRole";
import useDashboardOverview from "../../../hooks/useDashboardOverview";
import Loading from "../../../components/common/Loading";

const StatCard = ({ title, value, icon: Icon, tone }) => {
  const tones = {
    blue: "from-blue-500 to-cyan-500",
    green: "from-green-500 to-emerald-500",
    orange: "from-orange-500 to-amber-500",
    purple: "from-purple-500 to-indigo-500",
    rose: "from-rose-500 to-pink-500",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="app-surface p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600 font-medium">{title}</p>
        <div className={`p-2 rounded-xl bg-gradient-to-r ${tones[tone] || tones.blue}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </motion.div>
  );
};

const DashboardHome = () => {
  const { user } = useAuth();
  const { userInfo, loading: roleLoading } = useUserRole();
  const {
    data: dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useDashboardOverview(user?.uid);

  const formatDate = (value) => {
    if (!value) return "N/A";
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (roleLoading || dashboardLoading) {
      return (
        <div className="space-y-6">
          <div className="app-surface p-6 animate-pulse">
            <div className="h-8 w-56 rounded bg-gray-200 mb-3" />
            <div className="h-4 w-80 rounded bg-gray-200" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="app-surface p-5 animate-pulse">
                <div className="h-4 w-28 rounded bg-gray-200 mb-4" />
                <div className="h-8 w-20 rounded bg-gray-200" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {[1, 2].map((item) => (
              <div key={item} className="app-surface p-5 animate-pulse min-h-[280px]">
                <div className="h-4 w-40 rounded bg-gray-200 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((row) => (
                    <div key={row} className="h-12 rounded bg-gray-200" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
  }

  const role = dashboard?.role || userInfo?.role;
  const roleLabel = role === "organization" ? "Organization" : role === "student" ? "Student" : "User";
  const stats = dashboard?.stats || {};
  const overview = dashboard?.overview || {};
  const attendanceAnalytics = overview?.attendanceAnalytics || {};

  return (
    <div className="space-y-6">
      {dashboardError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
          {String(dashboardError || "Failed to load dashboard data")}
        </div>
      )}

      {role === "student" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <StatCard title="Total Applications" value={stats.totalApplications || 0} icon={FileText} tone="blue" />
            <StatCard title="Pending" value={stats.pendingApplications || 0} icon={Clock} tone="orange" />
            <StatCard title="Approved" value={stats.approvedApplications || 0} icon={CheckCircle} tone="green" />
            <StatCard title="Joined Orgs" value={stats.joinedOrganizations || 0} icon={Users} tone="purple" />
            <StatCard title="Recommended" value={stats.recommendedEvents || 0} icon={Sparkles} tone="rose" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="app-surface p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title-md text-gray-900">Recent Applications</h2>
                <Link to="/dashboard/my-applications" className="text-sm text-sky-600 hover:text-sky-700 inline-flex items-center gap-1">
                  View all <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {(overview.recentApplications || []).length === 0 && (
                  <p className="text-sm text-gray-500">No applications yet.</p>
                )}
                {(overview.recentApplications || []).map((item, idx) => (
                  <div key={`${item.organizationName}-${idx}`} className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.organizationName || "Organization"}</p>
                      <p className="text-xs text-gray-500">{formatDate(item.appliedAt)}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">{item.status || "pending"}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="app-surface p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title-md text-gray-900">Upcoming Recommended Events</h2>
                <Link to="/dashboard/my-recommendations" className="text-sm text-sky-600 hover:text-sky-700 inline-flex items-center gap-1">
                  Explore <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {(overview.upcomingRecommendations || []).length === 0 && (
                  <p className="text-sm text-gray-500">No upcoming recommended events yet.</p>
                )}
                {(overview.upcomingRecommendations || []).map((event) => (
                  <div key={event._id} className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                      <p className="text-xs text-gray-500">{event.organization} • {formatDate(event.startAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {role === "organization" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <StatCard title="Published Events" value={stats.totalEvents || 0} icon={Calendar} tone="blue" />
            <StatCard title="Total Applications" value={stats.totalApplications || 0} icon={FileText} tone="purple" />
            <StatCard title="Pending Review" value={stats.pendingApplications || 0} icon={Clock} tone="orange" />
            <StatCard title="Approved Applicants" value={stats.approvedApplications || 0} icon={CheckCircle} tone="green" />
            <StatCard title="Active Members" value={stats.activeMembers || 0} icon={Briefcase} tone="rose" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Avg Participants / Event"
              value={attendanceAnalytics.averageParticipantsPerEvent ?? 0}
              icon={Users}
              tone="blue"
            />
            <StatCard
              title="Per-Event Conversion"
              value={`${attendanceAnalytics.perEventConversionRate ?? 0}%`}
              icon={TrendingUp}
              tone="green"
            />
            <StatCard
              title="No-Show Risk"
              value={`${attendanceAnalytics.noShowRisk?.level || "low"} (${attendanceAnalytics.noShowRisk?.score ?? 0}%)`}
              icon={AlertTriangle}
              tone="orange"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="app-surface p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title-md text-gray-900">Incoming Applications</h2>
                <Link to="/dashboard/org-applications" className="text-sm text-sky-600 hover:text-sky-700 inline-flex items-center gap-1">
                  Review <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {(overview.recentApplications || []).length === 0 && (
                  <p className="text-sm text-gray-500">No applications received yet.</p>
                )}
                {(overview.recentApplications || []).map((item, idx) => (
                  <div key={`${item.studentEmail}-${idx}`} className="flex items-center justify-between border border-gray-100 rounded-xl px-3 py-2">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{item.fullName || item.studentEmail || "Applicant"}</p>
                      <p className="text-xs text-gray-500">{formatDate(item.appliedAt)}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">{item.status || "pending"}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="app-surface p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="section-title-md text-gray-900">Next Events & Team</h2>
                <Link to="/dashboard/org-events" className="text-sm text-sky-600 hover:text-sky-700 inline-flex items-center gap-1">
                  Manage <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Upcoming Events</h3>
                <div className="space-y-2">
                  {(overview.upcomingEvents || []).length === 0 && (
                    <p className="text-sm text-gray-500">No upcoming events scheduled.</p>
                  )}
                  {(overview.upcomingEvents || []).map((event) => (
                    <div key={event._id} className="border border-gray-100 rounded-xl px-3 py-2">
                      <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                      <p className="text-xs text-gray-500">{formatDate(event.startAt)} • {event.location || "TBA"}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Recent Members</h3>
                <div className="space-y-2">
                  {(overview.recentMembers || []).length === 0 && (
                    <p className="text-sm text-gray-500">No members joined recently.</p>
                  )}
                  {(overview.recentMembers || []).map((member, idx) => (
                    <div key={`${member.studentName}-${idx}`} className="border border-gray-100 rounded-xl px-3 py-2 flex items-center justify-between">
                      <p className="font-medium text-gray-900 text-sm flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-sky-500" />
                        {member.studentName || "Member"}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(member.joinedAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
