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
  const getNavItems = () => {
    const commonItems = [{ name: "Dashboard", icon: Home, path: "/dashboard" }];

    const studentItems = [
      {
        name: "Organizations",
        icon: Users,
        path: "/dashboard/my-organizations",
      },
      {
        name: "Applications",
        icon: Bookmark,
        path: "/dashboard/my-applications",
      },
      { name: "Events", icon: Calendar, path: "/dashboard/my-events" },
      { name: "Messages", icon: MessageCircle, path: "/dashboard/my-chat" },
      {
        name: "Recommended",
        icon: Sparkles,
        path: "/dashboard/my-recommendations",
      },
      { name: "Profile", icon: User, path: "/dashboard/student-profile" },
      { name: "Settings", icon: Settings, path: "/dashboard/student-settings" },
    ];

    const organizationItems = [
      { name: "Events", icon: Calendar, path: "/dashboard/org-events" },
      { name: "New Event", icon: Plus, path: "/dashboard/org-create-event" },
      { name: "Members", icon: Users, path: "/dashboard/org-members" },
      {
        name: "Applications",
        icon: UserPlus,
        path: "/dashboard/org-applications",
      },
      { name: "Chat", icon: MessageCircle, path: "/dashboard/org-chat" },
      { name: "Analytics", icon: BarChart3, path: "/dashboard/org-analytics" },
      { name: "Payments", icon: CreditCard, path: "/dashboard/org-payments" },
      { name: "Profile", icon: User, path: "/dashboard/org-profile" },
      { name: "Settings", icon: Settings, path: "/dashboard/org-settings" },
    ];

    const superAdminItems = [
      {
        name: "Organizations",
        icon: Building,
        path: "/dashboard/admin-organizations",
      },
      { name: "Users", icon: Users, path: "/dashboard/admin-users" },
      {
        name: "Analytics",
        icon: BarChart3,
        path: "/dashboard/admin-analytics",
      },
      { name: "Reports", icon: Shield, path: "/dashboard/admin-reports" },
      { name: "Profile", icon: User, path: "/dashboard/admin-profile" },
      { name: "Settings", icon: Settings, path: "/dashboard/admin-settings" },
    ];

    switch (userInfo.role) {
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

  const getRoleBadge = () => {
    switch (userInfo.role) {
      case "student":
        return "Student";
      case "organization":
        return "Organization";
      case "super-admin":
        return "Super Admin";
      default:
        return "User";
    }
  };

  const handleSignOut = () => {
  const loadingToast = toast.loading('Securely signing you out...');

  logOut()
    .then(() => {
      toast.success('Successfully signed out!', { 
        id: loadingToast,
        duration: 3000 
      });
    })
    .catch((error) => {
      console.error("Error signing out:", error);
      
      let errorMessage = "Sign out failed. Please try again.";
      if (error.code === 'auth/network-request-failed') {
        errorMessage = "Network error. Check your connection.";
      }
      
      toast.error(errorMessage, { 
        id: loadingToast,
        duration: 4000 
      });
    });
};

  return (
    <div
      className={`bg-white border-r border-gray-200 ${
        sidebarOpen ? "w-64" : "w-20"
      } transition-all duration-300 flex flex-col h-screen fixed left-0 top-0 z-40`}
    >
      {/* Logo - Fixed at top */}
<div className="flex-shrink-0">
  <div className="p-4 border-b border-gray-200">
    {sidebarOpen ? (
      <div className="flex items-center">
        <Logo/>
      </div>
    ) : (
      <Link to='/'>
      <div className="flex justify-center">
        <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
      </div>
      </Link>
    )}
  </div>
</div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/dashboard"}
              className={({ isActive }) =>
                `w-full flex cursor-pointer items-center gap-4 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                  isActive
                    ? "bg-sky-50 text-sky-700 border border-sky-200"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Sign Out - Fixed at bottom */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className={`w-full cursor-pointer flex items-center gap-3 px-3 py-3 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ${
            !sidebarOpen && "justify-center"
          }`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {sidebarOpen && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );
};

export default SideBar;