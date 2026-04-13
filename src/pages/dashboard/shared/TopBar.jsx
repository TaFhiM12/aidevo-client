import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Bell, Search, Command, Loader2 } from "lucide-react";
import { useNotifications } from "../../../context/NotificationContext";
import useDashboardOverview from "../../../hooks/useDashboardOverview";

const TopBar = ({ sidebarOpen, setSidebarOpen, userInfo, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openNotifications, setOpenNotifications] = useState(false);
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
        id: "page-org-apps",
        type: "Page",
        title: "Applications",
        subtitle: "Review incoming applicants",
        path: "/dashboard/org-applications",
        keywords: ["applications", "review", "applicants"],
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

  const handleSelectResult = async (item) => {
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
  };

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
  }, [isSearchOpen, selectedResultIndex, searchResults]);

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
              path: "/dashboard/org-applications",
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
      } catch (error) {
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
  
  const getPageName = () => {
    const path = location.pathname.split("/").pop();
    
    // Map route paths to display names for all user types
    const pageNames = {
      // Organization Routes
      'org-create-event': 'Create Event',
      'org-profile': `${userInfo?.organizationName || 'Organization'} Profile`,
      'org-events': 'Events',
      'org-members': 'Members',
      'org-applications': 'Applications',
      'org-chat': 'Communication',
      'org-analytics': 'Analytics',
      'org-payments': 'Payments',
      'org-settings': 'Settings',
      
      // Student Routes
      'my-organizations': 'My Organizations',
      'my-applications': 'My Applications',
      'my-events': 'My Events',
      'my-chat': 'My Chats',
      'my-recommendations': 'Recommended Events',
      'student-profile': `${user?.displayName || 'Student'}'s Profile`,
      'student-settings': 'Settings',
      
      // Admin Routes
      'admin-organizations': 'Organizations Management',
      'admin-users': 'User Management',
      'admin-analytics': 'Analytics Dashboard',
      'admin-reports': 'Reports',
      'admin-profile': `${user?.displayName || 'Admin'} Profile`,
      'admin-settings': 'Admin Settings'
    };

    // Return the mapped name or fallback to the original logic
    return pageNames[path] || path
      .replace(/^(org-|my-|student-|admin-)/, '') // Remove all prefixes
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
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

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-[17.5px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg
              className="w-5 h-5"
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
          <h1 className="text-xl font-semibold text-gray-900">
            {getPageName()}
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <button
              onClick={() => setIsSearchOpen(true)}
              className="pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors w-64 text-left text-sm text-gray-500 flex items-center justify-between"
            >
              <span>Search pages, events, applications...</span>
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <Command className="w-3 h-3" />
                K
              </span>
            </button>
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setOpenNotifications((prev) => !prev)}
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {openNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-sky-600 hover:text-sky-700 font-medium"
                  >
                    Mark all as read
                  </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {recentNotifications.length === 0 && (
                    <p className="px-4 py-6 text-sm text-gray-500 text-center">
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
                      className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                        item.read ? "bg-white" : "bg-sky-50"
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.message}</p>
                      <p className="text-[11px] text-gray-400 mt-2">
                        {formatNotificationTime(item.createdAt)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {getUserDisplayName()}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {getUserRole()}
              </p>
            </div>
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-8 h-8 rounded-lg object-cover"
            />
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-[1px] z-[60] flex items-start justify-center pt-24 px-4">
          <div
            ref={searchContainerRef}
            className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                autoFocus
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search anything in dashboard..."
                className="w-full text-sm outline-none"
              />
              {searchLoading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
            </div>

            <div className="max-h-[420px] overflow-y-auto">
              {searchResults.length === 0 ? (
                <p className="px-4 py-6 text-sm text-gray-500 text-center">
                  No matches found. Try broader keywords.
                </p>
              ) : (
                searchResults.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectResult(item)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-50 transition-colors ${
                      selectedResultIndex === index ? "bg-sky-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
                      </div>
                      <span className="text-[11px] px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {item.type}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="px-4 py-2 bg-gray-50 text-[11px] text-gray-500 flex items-center justify-between">
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