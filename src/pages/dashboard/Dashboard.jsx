import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";
import useUserRole from "../../hooks/useUserRole";
import SideBar from "./shared/SideBar";
import TopBar from './shared/TopBar';
import Loading from "../../components/common/Loading";
import { NotificationProvider } from "../../context/NotificationContext";

const CombinedDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user, loading: authLoading, logOut } = useAuth();
  const navigate = useNavigate();
  const { userInfo, loading: roleLoading, error, refetch } = useUserRole();

  const shellUserInfo = userInfo || {
    uid: user?.uid || "",
    email: user?.email || "",
    name: user?.displayName || "User",
    photoURL: user?.photoURL || "",
    role: "user",
  };

  if (authLoading) {
    return <Loading />;
  }

  if (error || !userInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h2>
          <p className="text-gray-600 mb-4">We could not load your account details right now.</p>
          <button 
            onClick={refetch}
            className="app-btn-primary mr-2"
          >
            Retry
          </button>
          <button 
            onClick={() => navigate('/')}
            className="app-btn-secondary"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/signin');
    return null;
  }

  const handleSidebarToggle = () => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches) {
      setMobileSidebarOpen((prev) => !prev);
      return;
    }

    setSidebarOpen((prev) => !prev);
  };

  const handleMobileSidebarClose = () => {
    setMobileSidebarOpen(false);
  };

  return (
    <NotificationProvider>
    <div className="min-h-screen bg-slate-50">
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar backdrop"
          onClick={handleMobileSidebarClose}
          className="fixed inset-0 z-30 bg-slate-950/35 backdrop-blur-[1px] lg:hidden"
        />
      )}
      <SideBar 
        sidebarOpen={sidebarOpen} 
        mobileSidebarOpen={mobileSidebarOpen}
        onMobileNavigate={handleMobileSidebarClose}
        userInfo={shellUserInfo} 
        user={user}
        logOut={logOut}
      />
      
      {/* Main content area with dynamic margin based on sidebar width */}
      <div 
        className={`flex min-h-screen flex-col overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "lg:pl-64" : "lg:pl-20"
        }`}
      >
        <TopBar 
          sidebarOpen={sidebarOpen}
          onSidebarToggle={handleSidebarToggle}
          userInfo={shellUserInfo}
          user={user}
        />
        
        <main className="flex-1 overflow-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6">
          {roleLoading ? (
            <div className="space-y-4">
              <div className="app-surface p-6 animate-pulse">
                <div className="h-8 w-48 rounded bg-gray-200 mb-3" />
                <div className="h-4 w-80 rounded bg-gray-200" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="app-surface p-5 animate-pulse">
                    <div className="h-4 w-24 rounded bg-gray-200 mb-4" />
                    <div className="h-8 w-20 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
              <div className="app-surface p-6 animate-pulse min-h-[320px]">
                <div className="h-4 w-36 rounded bg-gray-200 mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-12 rounded bg-gray-200" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
    </NotificationProvider>
  );
};

export default CombinedDashboard;