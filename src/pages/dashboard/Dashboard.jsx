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
  const { user, loading: authLoading, logOut } = useAuth();
  const navigate = useNavigate();
  const { userInfo, loading: roleLoading, error, refetch } = useUserRole();

  const isLoading = authLoading || roleLoading;

  if (isLoading) {
    return <Loading/>
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

  return (
    <NotificationProvider>
    <div className="flex h-screen bg-gray-50">
      <SideBar 
        sidebarOpen={sidebarOpen} 
        userInfo={userInfo} 
        user={user}
        logOut={logOut}
      />
      
      {/* Main content area with dynamic margin based on sidebar width */}
      <div 
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        <TopBar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          userInfo={userInfo}
          user={user}
        />
        
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
    </NotificationProvider>
  );
};

export default CombinedDashboard;