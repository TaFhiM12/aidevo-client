import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import {
  Calendar,
  Clock,
  Search,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  Wallet,
  Activity,
  BarChart3,
} from "lucide-react";
import useAuth from "../../../hooks/useAuth";
import API from "../../../utils/api";
import useInfiniteScrollSlice from "../../../hooks/useInfiniteScrollSlice";

const MyEnrolledEvents = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['student-enrolled-events', user?.uid],
    enabled: Boolean(user?.uid),
    queryFn: async () => {
      const [participationsRes, paymentRes] = await Promise.all([
        API.get(`/events/student/${user.uid}/participations`),
        API.get(`/payments/student/${user.uid}`),
      ]);

      const participations = Array.isArray(participationsRes?.data)
        ? participationsRes.data
        : [];
      const paymentList = Array.isArray(paymentRes?.data) ? paymentRes.data : [];

      const mapped = participations.map((participation) => ({
        key: participation._id,
        participationId: participation._id,
        joinedAt: participation.joinedAt,
        organizationName: participation.organizationName || "",
        event: {
          _id: String(participation.eventId || ""),
          title: participation.eventTitle || "Untitled Event",
          startAt: participation.eventStartAt,
          endAt: participation.eventEndAt,
          location: participation.eventLocation || "TBA",
          fee: Number(participation.eventFee || 0),
          cover: participation.eventCover || "",
        },
      }));

      return {
        items: mapped,
        payments: paymentList,
      };
    },
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 20,
    refetchOnWindowFocus: false,
  });

  const items = data?.items || [];
  const payments = data?.payments || [];

  const getEventPhase = (event) => {
    const now = Date.now();
    const start = event?.startAt ? new Date(event.startAt).getTime() : null;
    const end = event?.endAt ? new Date(event.endAt).getTime() : null;

    if (start && now < start) return "upcoming";
    if (start && end && now >= start && now <= end) return "ongoing";
    if (end && now > end) return "completed";
    return "upcoming";
  };

  const classified = useMemo(() => {
    const enriched = items.map((item) => ({
      ...item,
      phase: getEventPhase(item.event),
    }));

    return {
      upcoming: enriched.filter((item) => item.phase === "upcoming"),
      ongoing: enriched.filter((item) => item.phase === "ongoing"),
      completed: enriched.filter((item) => item.phase === "completed"),
    };
  }, [items]);

  const listByTab = {
    upcoming: classified.upcoming,
    ongoing: classified.ongoing,
    completed: classified.completed,
  };

  const filteredList = (listByTab[activeTab] || []).filter((item) => {
    const hay = `${item.event?.title || ""} ${item.organizationName || ""} ${item.event?.location || ""}`.toLowerCase();
    return hay.includes(searchTerm.toLowerCase());
  });

  const {
    visibleItems: visibleEvents,
    hasMore,
    loadMoreRef,
  } = useInfiniteScrollSlice(filteredList, {
    pageSize: 9,
    resetDeps: [activeTab, searchTerm, filteredList.length],
  });

  const paymentByEventId = useMemo(() => {
    const map = new Map();
    payments.forEach((payment) => {
      map.set(String(payment.eventId), payment);
    });
    return map;
  }, [payments]);

  const engagement = useMemo(() => {
    const upcomingCount = classified.upcoming.length;
    const ongoingCount = classified.ongoing.length;
    const completedCount = classified.completed.length;
    const paidEvents = items.filter(
      (item) => Number(item.event?.fee || 0) > 0 && paymentByEventId.has(String(item.event?._id))
    ).length;

    const completionRate = upcomingCount + ongoingCount + completedCount > 0
      ? ((completedCount / (upcomingCount + ongoingCount + completedCount)) * 100).toFixed(1)
      : "0.0";

    return {
      upcomingCount,
      ongoingCount,
      completedCount,
      paidEvents,
      completionRate,
    };
  }, [classified, items, paymentByEventId]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "TBA";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const phaseBadge = (phase) => {
    if (phase === "upcoming") return "bg-blue-100 text-blue-700";
    if (phase === "ongoing") return "bg-emerald-100 text-emerald-700";
    return "bg-gray-200 text-gray-700";
  };

  const tabs = [
    {
      id: "upcoming",
      label: "Upcoming",
      count: classified.upcoming.length,
      icon: Calendar,
    },
    {
      id: "ongoing",
      label: "Ongoing",
      count: classified.ongoing.length,
      icon: LoaderCircle,
    },
    {
      id: "completed",
      label: "Completed",
      count: classified.completed.length,
      icon: CheckCircle2,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="app-surface p-6 animate-pulse">
          <div className="h-8 w-36 rounded bg-gray-200 mb-3" />
          <div className="h-4 w-72 rounded bg-gray-200 mb-4" />
          <div className="h-11 rounded-xl bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="app-surface p-4 animate-pulse">
              <div className="h-4 w-16 rounded bg-gray-200 mb-3" />
              <div className="h-6 w-10 rounded bg-gray-200 mb-2" />
              <div className="h-4 w-24 rounded bg-gray-200" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="app-surface rounded-xl px-4 py-3 animate-pulse">
              <div className="h-3 w-20 rounded bg-gray-200 mb-2" />
              <div className="h-6 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((item) => (
            <div key={item} className="app-surface animate-pulse overflow-hidden">
              <div className="h-40 w-full bg-gray-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-2/3 rounded bg-gray-200" />
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-8 w-28 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-sky-50/40 pb-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="app-surface p-6">
          <h1 className="text-2xl font-bold text-slate-900">My Events</h1>
          <p className="text-slate-600 mt-1">
            Real attendance records from events you joined.
          </p>

          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search events, organizations, or locations"
              className="w-full rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {String(error || "Failed to load your events.")}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`app-surface px-4 py-3 text-left transition ${
                  activeTab === tab.id
                    ? "border-sky-300 bg-sky-50"
                    : "hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className="w-4 h-4 text-slate-600" />
                  <span className="text-lg font-semibold text-slate-900">{tab.count}</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{tab.label}</p>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div className="app-surface rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Upcoming</p>
            <p className="text-xl font-bold text-slate-900 flex items-center gap-1">
              <Activity className="w-4 h-4 text-sky-600" />
              {engagement.upcomingCount}
            </p>
          </div>
          <div className="app-surface rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Ongoing</p>
            <p className="text-xl font-bold text-slate-900">{engagement.ongoingCount}</p>
          </div>
          <div className="app-surface rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Completion Rate</p>
            <p className="text-xl font-bold text-slate-900 flex items-center gap-1">
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              {engagement.completionRate}%
            </p>
          </div>
          <div className="app-surface rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500">Paid Event Access</p>
            <p className="text-xl font-bold text-slate-900 flex items-center gap-1">
              <Wallet className="w-4 h-4 text-violet-600" />
              {engagement.paidEvents}
            </p>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="app-surface p-8 text-center text-slate-600">
            No events found in this section.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {visibleEvents.map((item) => (
              <div key={item.key} className="app-surface overflow-hidden">
                {item.event?.cover ? (
                  <img
                    src={item.event.cover}
                    alt={item.event.title}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="h-40 w-full bg-gradient-to-r from-sky-500 to-cyan-500" />
                )}

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 leading-snug">
                      {item.event?.title || "Untitled Event"}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${phaseBadge(item.phase)}`}>
                      {item.phase}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {item.organizationName || "Organization"}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {formatDateTime(item.event?.startAt)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {formatDateTime(item.event?.endAt)}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {item.event?.location || "Location TBA"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Joined on {formatDateTime(item.joinedAt)}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    {Number(item.event?.fee || 0) > 0 ? (
                      <span className={`text-xs px-2 py-1 rounded-full ${paymentByEventId.has(String(item.event?._id)) ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {paymentByEventId.has(String(item.event?._id))
                          ? "Payment Confirmed"
                          : `Payment Required (BDT ${item.event?.fee})`}
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-1 rounded-full bg-sky-100 text-sky-700">
                        Free Event
                      </span>
                    )}

                    <Link
                      to={`/events/${item.event?._id}`}
                      className="app-btn-secondary px-3 py-1.5 text-xs"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {hasMore && filteredList.length > 0 && (
          <div ref={loadMoreRef} className="py-6 text-center text-sm text-slate-500">
            Loading more events...
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEnrolledEvents;
