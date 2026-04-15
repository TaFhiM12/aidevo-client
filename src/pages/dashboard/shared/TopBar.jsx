import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Bell, Search, Command, Loader2 } from "lucide-react";
import { useNotifications } from "../../../context/NotificationContext";
import useDashboardOverview from "../../../hooks/useDashboardOverview";

const TopBar = ({ onSidebarToggle, userInfo, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openNotifications, setOpenNotifications] = useState(false);
  const [isSearchRevealOpen, setIsSearchRevealOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const searchContainerRef = useRef(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { data: dashboardData } = useDashboardOverview(user?.uid);

  const recentNotifications = useMemo(
    () => notifications.slice(0, 8),
    [notifications]
  );

  const formatNotificationTime = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const roleBasedPages = useMemo(() => {
    const role = userInfo?.role || "user";
    const common = [
      {
        id: "page-dashboard",
        type: "Page",
        title: "Dashboard Overview",
        subtitle: "Performance snapshot and quick insights",
        path: "/dashboard",
        keywords: ["dashboard", "overview", "home"],
      },
    ];

    const studentPages = [
      {
        id: "page-student-orgs",
        type: "Page",
        title: "My Organizations",
        subtitle: "Organizations you joined",
        path: "/dashboard/my-organizations",
        keywords: ["organizations", "clubs", "communities"],
      },
      {
        id: "page-student-apps",
        type: "Page",
        title: "My Applications",
        subtitle: "Track application statuses",
        path: "/dashboard/my-applications",
        keywords: ["applications", "status", "apply"],
      },
      {
        id: "page-student-events",
        type: "Page",
        title: "My Events",
        subtitle: "Assigned and completed event timeline",
        path: "/dashboard/my-events",
        keywords: ["events", "assigned", "schedule"],
      },
      {
        id: "page-student-chat",
        type: "Page",
        title: "Messages",
        subtitle: "Direct communication",
        path: "/dashboard/my-chat",
        keywords: ["chat", "message", "conversation"],
      },
      {
        id: "page-student-discover",
        type: "Page",
        title: "Recommendations",
        subtitle: "Personalized event suggestions",
        path: "/dashboard/my-recommendations",
        keywords: ["recommend", "discover", "trending"],
      },
    ];

    const organizationPages = [
      {
        id: "page-org-events",
        type: "Page",
        title: "Organization Events",
        subtitle: "Manage and track events",
        path: "/dashboard/org-events",
        keywords: ["events", "manage", "schedule"],
      },
      {
        id: "page-org-create",
        type: "Page",
        title: "Create Event",
        subtitle: "Launch a new event",
        path: "/dashboard/org-create-event",
        keywords: ["create", "event", "publish"],
      },
      {
        id: "page-org-members",
        type: "Page",
        title: "Members",
        subtitle: "Member directory and activities",
        path: "/dashboard/org-members",
        keywords: ["members", "team", "directory"],
      },
      {
        id: "page-org-recruitment",
        type: "Page",
        title: "Recruitment",
        subtitle: "Open or close recruitment and update details",
        path: "/dashboard/org-recruitment",
        keywords: ["recruitment", "hiring", "applications"],
      },
      {
        id: "page-org-chat",
        type: "Page",
        title: "Organization Chat",
        subtitle: "Communicate with students and team",
        path: "/dashboard/org-chat",
        keywords: ["chat", "messages", "communication"],
      },
    ];

    const adminPages = [
      {
        id: "page-admin-orgs",
        type: "Page",
        title: "Organizations Management",
        subtitle: "Manage all organizations",
        path: "/dashboard/admin-organizations",
        keywords: ["organizations", "admin", "management"],
      },
      {
        id: "page-admin-users",
        type: "Page",
        title: "User Management",
        subtitle: "Manage users and roles",
        path: "/dashboard/admin-users",
        keywords: ["users", "admin", "roles"],
      },
      {
        id: "page-admin-analytics",
        type: "Page",
        title: "Admin Analytics",
        subtitle: "System-wide metrics",
        path: "/dashboard/admin-analytics",
        keywords: ["analytics", "insights", "admin"],
      },
    ];

    if (role === "student") return [...common, ...studentPages];
    if (role === "organization") return [...common, ...organizationPages];
    if (role === "super-admin") return [...common, ...adminPages];
    return common;
  }, [userInfo?.role]);

  const scoreResult = (item, query) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return 1;

    const title = (item.title || "").toLowerCase();
    const subtitle = (item.subtitle || "").toLowerCase();
    const keywords = (item.keywords || []).join(" ").toLowerCase();

    let score = 0;
    if (title.startsWith(normalized)) score += 6;
    if (title.includes(normalized)) score += 4;
    if (subtitle.includes(normalized)) score += 2;
    if (keywords.includes(normalized)) score += 2;
    return score;
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchTerm("");
    setSearchResults([]);
    setSelectedResultIndex(0);
  };

  const handleSelectResult = useCallback(async (item) => {
    if (!item) return;

    if (item.action === "mark-all-read") {
      await markAllAsRead();
      closeSearch();
      return;
    }

    if (item.path) {
      navigate(item.path);
      closeSearch();
    }
  }, [markAllAsRead, navigate]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const isCommandPalette = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";

      if (isCommandPalette) {
        event.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      if (!isSearchOpen) return;

      if (event.key === "Escape") {
        closeSearch();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedResultIndex((prev) => Math.min(prev + 1, Math.max(searchResults.length - 1, 0)));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedResultIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === "Enter") {
        event.preventDefault();
        handleSelectResult(searchResults[selectedResultIndex]);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleSelectResult, isSearchOpen, selectedResultIndex, searchResults]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const handleOutsideClick = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        closeSearch();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;

    const timer = setTimeout(async () => {
      const query = searchTerm.trim();

      let candidates = [...roleBasedPages];

      if (!query) {
        const top = candidates.slice(0, 8);
        setSearchResults(top);
        setSelectedResultIndex(0);
        return;
      }

      setSearchLoading(true);

      try {
        const dynamicResults = [];
        const overview = dashboardData?.overview || {};

        if (userInfo?.role === "student") {
          (overview.recentApplications || []).forEach((item, index) => {
            dynamicResults.push({
              id: `search-app-${index}`,
              type: "Application",
              title: item.organizationName || "Application",
              subtitle: `Status: ${item.status || "pending"}`,
              path: "/dashboard/my-applications",
              keywords: [item.status || "", "application", "organization"],
            });
          });

          (overview.upcomingRecommendations || []).forEach((event) => {
            dynamicResults.push({
              id: `search-event-${String(event._id)}`,
              type: "Event",
              title: event.title || "Recommended Event",
              subtitle: event.organization || "Recommended for you",
              path: "/dashboard/my-recommendations",
              keywords: ["event", "recommendation", event.organization || ""],
            });
          });
        }

        if (userInfo?.role === "organization") {
          (overview.upcomingEvents || []).forEach((event) => {
            dynamicResults.push({
              id: `search-org-event-${String(event._id)}`,
              type: "Event",
              title: event.title || "Upcoming Event",
              subtitle: event.location || "Upcoming",
              path: "/dashboard/org-events",
              keywords: ["event", "upcoming", event.location || ""],
            });
          });

          (overview.recentApplications || []).forEach((item, index) => {
            dynamicResults.push({
              id: `search-org-app-${index}`,
              type: "Application",
              title: item.fullName || item.studentEmail || "Applicant",
              subtitle: `Status: ${item.status || "pending"}`,
              path: "/dashboard/org-recruitment",
              keywords: ["applicant", "application", item.status || ""],
            });
          });
        }

        const notificationCandidates = notifications.slice(0, 6).map((item) => ({
          id: `search-notif-${String(item._id)}`,
          type: "Notification",
          title: item.title || "Notification",
          subtitle: item.message || "",
          path: "/dashboard",
          keywords: ["notification", item.type || ""],
        }));

        candidates = [
          ...candidates,
          ...dynamicResults,
          ...notificationCandidates,
          {
            id: "search-mark-read",
            type: "Action",
            title: "Mark all notifications as read",
            subtitle: "Quick action",
            action: "mark-all-read",
            keywords: ["notifications", "read", "action"],
          },
        ];
      } catch {
        // Keep static results when dynamic fetch fails.
      } finally {
        const ranked = candidates
          .map((item) => ({ item, score: scoreResult(item, query) }))
          .filter(({ score }) => score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)
          .map(({ item }) => item);

        setSearchResults(ranked);
        setSelectedResultIndex(0);
        setSearchLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [isSearchOpen, searchTerm, roleBasedPages, userInfo?.role, notifications, dashboardData]);
  
  const getPageMeta = () => {
    const path = location.pathname.split("/").pop();
    const role = userInfo?.role || "user";
    const displayName = getUserDisplayName();
    const organizationName = userInfo?.organizationName || userInfo?.organization?.name || "your organization";

    const dashboardSubtitleByRole = {
      student: `Welcome back, ${displayName}. You are on track, here is your live progress snapshot.`,
      organization: `Welcome back, ${displayName}. Monitor execution, growth, and outcomes from one command center.`,
      admin: `Welcome back, ${displayName}. Maintain strategic oversight across system performance and governance.`,
      "super-admin": `Welcome back, ${displayName}. Maintain strategic oversight across system performance and governance.`,
      user: `Welcome back, ${displayName}. Here is your live performance command center.`,
    };
    
    const pageMeta = {
      // Shared
      dashboard: {
        title: "Dashboard Overview",
        subtitle: dashboardSubtitleByRole[role] || dashboardSubtitleByRole.user,
      },

      // Organization Routes
      "org-create-event": {
        title: "Create Event",
        subtitle: "Design and launch high-impact programs with structured operational control.",
      },
      "org-profile": {
        title: `${userInfo?.organizationName || "Organization"} Profile`,
        subtitle: "Curate your institutional identity and public positioning with strategic clarity.",
      },
      "org-events": {
        title: "Events",
        subtitle: "Supervise your full event portfolio with real-time status and delivery visibility.",
      },
      "org-members": {
        title: "Members",
        subtitle: `Oversee verified member records for ${organizationName} with confidence and control.`,
      },
      "org-applications": {
        title: "Recruitment",
        subtitle: "Evaluate applicant pipelines and optimize intake quality with operational discipline.",
      },
      "org-recruitment": {
        title: "Recruitment",
        subtitle: "Control recruitment exposure, application flow, and acceptance decisions from one panel.",
      },
      "org-chat": {
        title: "Communication",
        subtitle: "Coordinate member and student communication streams in a unified workspace.",
      },
      "org-analytics": {
        title: "Analytics",
        subtitle: "Analyze conversion, participation, and growth indicators with executive-level visibility.",
      },
      "org-payments": {
        title: "Payments",
        subtitle: "Track registrations, receipts, and payout flow with audit-ready financial transparency.",
      },
      "org-settings": {
        title: "Settings",
        subtitle: "Configure governance, operations, and communication policies for reliable execution.",
      },
      
      // Student Routes
      "my-organizations": {
        title: "My Organizations",
        subtitle: "Stay connected with your communities and keep up with what matters most.",
      },
      "my-applications": {
        title: "My Applications",
        subtitle: "Follow each application step and see updates as soon as they happen.",
      },
      "my-events": {
        title: "My Events",
        subtitle: "Keep your event schedule organized and never miss important milestones.",
      },
      "my-chat": {
        title: "My Chats",
        subtitle: "Chat with organizations quickly and keep every conversation in one place.",
      },
      "my-recommendations": {
        title: "Recommended Events",
        subtitle: "Discover personalized opportunities selected around your interests and activity.",
      },
      "student-profile": {
        title: `${user?.displayName || "Student"}'s Profile`,
        subtitle: "Keep your profile polished so opportunities can find you faster.",
      },
      "student-settings": {
        title: "Settings",
        subtitle: "Control your notifications, privacy, and engagement preferences with ease.",
      },
      
      // Admin Routes
      "admin-organizations": {
        title: "Organizations Management",
        subtitle: "Direct organizational governance, compliance, and quality at platform scale.",
      },
      "admin-users": {
        title: "User Management",
        subtitle: "Administer access policy, role architecture, and user lifecycle controls with precision.",
      },
      "admin-analytics": {
        title: "Analytics Dashboard",
        subtitle: "Review system health, risk signals, and strategic growth indicators across the platform.",
      },
      "admin-reports": {
        title: "Reports",
        subtitle: "Generate governance-grade reports for operational review and strategic planning.",
      },
      "admin-profile": {
        title: `${user?.displayName || "Admin"} Profile`,
        subtitle: "Manage administrator identity, security posture, and control preferences.",
      },
      "admin-settings": {
        title: "Admin Settings",
        subtitle: "Configure global platform policy, operational guardrails, and administrative defaults.",
      },
    };

    if (pageMeta[path]) return pageMeta[path];

    const fallbackTitle = path
      .replace(/^(org-|my-|student-|admin-)/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    return {
      title: fallbackTitle || "Dashboard",
      subtitle: "Operational workspace for focused execution and real-time visibility.",
    };
  };

  const getUserDisplayName = () => {
    if (userInfo?.role === 'organization') {
      return user?.displayName || userInfo?.organizationName || userInfo?.name || 'Organization';
    } else if (userInfo?.role === 'admin' || userInfo?.role === 'student') {
      return user?.displayName || userInfo?.name || 'User';
    } else {
      return userInfo?.name || 'User';
    }
  };

  const getUserRole = () => {
    return userInfo?.role || 'user';
  };
  const avatarUrl = user?.photoURL || userInfo?.photoURL || '/default-avatar.png';
  const pageMeta = getPageMeta();

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-white/96 shadow-[0_8px_28px_rgba(15,23,42,0.04)] supports-[backdrop-filter]:bg-white/82 supports-[backdrop-filter]:backdrop-blur-2xl md:shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onSidebarToggle}
            className="rounded-2xl border border-transparent p-2.5 text-slate-600 transition-all duration-200 hover:border-slate-200 hover:bg-white/80 hover:text-slate-900"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              {pageMeta.title}
            </h1>
            <p className="hidden text-xs text-slate-500 sm:block">{pageMeta.subtitle}</p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {/* Search */}
          <div
            className="relative hidden md:flex items-center gap-2"
            onMouseEnter={() => setIsSearchRevealOpen(true)}
            onMouseLeave={() => setIsSearchRevealOpen(false)}
          >
            {!isSearchRevealOpen ? (
              <button
                className="rounded-2xl border border-transparent p-2.5 text-slate-600 transition-all duration-200 hover:border-slate-200 hover:bg-white/80 hover:text-slate-900"
                aria-label="Open search"
              >
                <Search className="h-5 w-5" />
              </button>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex w-72 items-center justify-between rounded-2xl border border-slate-200/80 bg-white/85 py-2.5 pl-10 pr-3 text-left text-sm text-slate-500 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-white"
                >
                  <span>Search pages, events,</span>
                  <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                    <Command className="h-3 w-3" />
                    K
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setOpenNotifications((prev) => !prev)}
              className="relative rounded-2xl border border-transparent p-2.5 text-slate-600 transition-all duration-200 hover:border-slate-200 hover:bg-white/80 hover:text-slate-900"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-red-500 px-1 text-xs text-white shadow-sm shadow-rose-200">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {openNotifications && (
              <div className="absolute right-0 z-50 mt-2 w-96 overflow-hidden rounded-3xl border border-white/70 bg-white/96 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-2xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <h3 className="font-semibold text-slate-900">Notifications</h3>
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-sky-600 hover:text-sky-700"
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {recentNotifications.length === 0 && (
                    <p className="px-4 py-6 text-center text-sm text-slate-500">
                      No notifications yet.
                    </p>
                  )}

                  {recentNotifications.map((item) => (
                    <button
                      key={String(item._id)}
                      onClick={() => {
                        if (!item.read) {
                          markAsRead(String(item._id));
                        }
                      }}
                      className={`w-full border-b border-slate-50 px-4 py-3 text-left transition-colors ${
                        item.read ? "bg-white" : "bg-sky-50/80"
                      } hover:bg-slate-50/80`}
                    >
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-600">{item.message}</p>
                      <p className="mt-2 text-[11px] text-slate-400">
                        {formatNotificationTime(item.createdAt)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-2 shadow-sm">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-slate-900">{getUserDisplayName()}</p>
              <p className="text-xs text-slate-500 capitalize">{getUserRole()}</p>
            </div>
            <img
              src={avatarUrl}
              alt="Profile"
              className="h-9 w-9 rounded-2xl object-cover ring-2 ring-white shadow-sm"
            />
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-slate-950/35 px-4 pt-24 backdrop-blur-[2px]">
          <div
            ref={searchContainerRef}
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/70 bg-white/96 shadow-[0_24px_80px_rgba(15,23,42,0.22)] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                autoFocus
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search anything in dashboard..."
                className="w-full bg-transparent text-sm outline-none"
              />
              {searchLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate-500">
                  No matches found. Try broader keywords.
                </p>
              ) : (
                searchResults.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className={`w-full border-b border-slate-50 px-4 py-3 text-left transition-colors ${
                      selectedResultIndex === index ? "bg-sky-50/80" : "hover:bg-slate-50/80"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{item.title}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{item.subtitle}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
                        {item.type}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="flex items-center justify-between bg-slate-50 px-4 py-2 text-[11px] text-slate-500">
              <span>Use ↑ ↓ to navigate and Enter to open</span>
              <span>Esc to close</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default TopBar;