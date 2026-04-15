import { Link, NavLink } from "react-router";
import {
  Users,
  Calendar,
  MessageCircle,
  Home,
  User,
  Settings,
  LogOut,
  Bookmark,
  Sparkles,
  Building,
  Shield,
  BarChart3,
  CreditCard,
  UserPlus,
  Plus,
} from "lucide-react";
import Logo from "../../../components/common/Logo";
import toast from "react-hot-toast";

const SideBar = ({ sidebarOpen, userInfo, user, logOut }) => {
  const role = userInfo?.role || "user";

  const getNavItems = () => {
    const commonItems = [{ name: "Dashboard", icon: Home, path: "/dashboard" }];

    const studentItems = [
      { name: "Organizations", icon: Users, path: "/dashboard/my-organizations" },
      { name: "Applications", icon: Bookmark, path: "/dashboard/my-applications" },
      { name: "Events", icon: Calendar, path: "/dashboard/my-events" },
      { name: "Messages", icon: MessageCircle, path: "/dashboard/my-chat" },
      { name: "Recommended", icon: Sparkles, path: "/dashboard/my-recommendations" },
      { name: "Profile", icon: User, path: "/dashboard/student-profile" },
      { name: "Settings", icon: Settings, path: "/dashboard/student-settings" },
    ];

    const organizationItems = [
      { name: "Events", icon: Calendar, path: "/dashboard/org-events" },
      { name: "New Event", icon: Plus, path: "/dashboard/org-create-event" },
      { name: "Members", icon: Users, path: "/dashboard/org-members" },
      { name: "Recruitment", icon: UserPlus, path: "/dashboard/org-recruitment" },
      { name: "Chat", icon: MessageCircle, path: "/dashboard/org-chat" },
      { name: "Analytics", icon: BarChart3, path: "/dashboard/org-analytics" },
      { name: "Payments", icon: CreditCard, path: "/dashboard/org-payments" },
      { name: "Profile", icon: User, path: "/dashboard/org-profile" },
      { name: "Settings", icon: Settings, path: "/dashboard/org-settings" },
    ];

    const superAdminItems = [
      { name: "Organizations", icon: Building, path: "/dashboard/admin-organizations" },
      { name: "Users", icon: Users, path: "/dashboard/admin-users" },
      { name: "Analytics", icon: BarChart3, path: "/dashboard/admin-analytics" },
      { name: "Reports", icon: Shield, path: "/dashboard/admin-reports" },
      { name: "Profile", icon: User, path: "/dashboard/admin-profile" },
      { name: "Settings", icon: Settings, path: "/dashboard/admin-settings" },
    ];

    switch (role) {
      case "student":
        return [...commonItems, ...studentItems];
      case "organization":
        return [...commonItems, ...organizationItems];
      case "super-admin":
        return [...commonItems, ...superAdminItems];
      default:
        return commonItems;
    }
  };

  const navItems = getNavItems();

  const handleSignOut = () => {
    const loadingToast = toast.loading("Securely signing you out...");

    logOut()
      .then(() => {
        toast.success("Successfully signed out!", {
          id: loadingToast,
          duration: 3000,
        });
      })
      .catch((error) => {
        console.error("Error signing out:", error);

        let errorMessage = "Sign out failed. Please try again.";
        if (error.code === "auth/network-request-failed") {
          errorMessage = "Network error. Check your connection.";
        }

        toast.error(errorMessage, {
          id: loadingToast,
          duration: 4000,
        });
      });
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/70 bg-white/96 shadow-[0_12px_36px_rgba(15,23,42,0.08)] transition-all duration-300 supports-[backdrop-filter]:bg-white/82 supports-[backdrop-filter]:backdrop-blur-2xl md:shadow-[0_18px_48px_rgba(15,23,42,0.1)] ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
    >
      <div className="flex-shrink-0 border-b border-slate-200/70 px-4 py-4">
        {sidebarOpen ? (
          <div className="flex items-center">
            <Logo />
          </div>
        ) : (
          <Link to="/">
            <div className="flex justify-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 shadow-sm shadow-sky-200/70">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
          </Link>
        )}
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `group flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "border border-sky-200/80 bg-gradient-to-r from-sky-50 to-blue-50 text-sky-800 shadow-sm shadow-sky-100/70"
                    : "border border-transparent text-slate-600 hover:border-slate-200 hover:bg-white/80 hover:text-slate-900"
                }`
              }
            >
              <Icon className="h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-105" />
              {sidebarOpen && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex-shrink-0 border-t border-slate-200/70 p-4">
        <button
          onClick={handleSignOut}
          className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-sm text-slate-600 transition-all duration-200 hover:border-slate-200 hover:bg-white/80 hover:text-slate-900 ${
            !sidebarOpen && "justify-center"
          }`}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default SideBar;