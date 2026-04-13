import React from "react";
import Links from "../common/Links";
import { NavLink } from "react-router";
import { LogIn, LogOut, Menu, X, User, Settings, UserCheck } from "lucide-react";
import { useState } from "react";
import Logo from "../common/Logo";
import useAuth from "../../hooks/useAuth";
import toast from 'react-hot-toast';
import useUserRole from "../../hooks/useUserRole";

const ACCESS_USER_INFO_KEY = "aidevo_user_info";

const readCachedUserInfo = () => {
  try {
    const raw = localStorage.getItem(ACCESS_USER_INFO_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logOut } = useAuth();
  const { userInfo } = useUserRole();
  const cachedUserInfo = readCachedUserInfo();
  const avatarUrl = user?.photoURL || userInfo?.photoURL || cachedUserInfo?.photoURL || '/default-avatar.png';
  const displayName =
    user?.displayName ||
    userInfo?.organizationName ||
    userInfo?.name ||
    cachedUserInfo?.organizationName ||
    cachedUserInfo?.name ||
    'User';

  const handleSignOut = () => {
    const loadingToast = toast.loading(
      <div className="flex items-center gap-2">
        <LogOut className="w-4 h-4" />
        <span>Signing out...</span>
      </div>,
      { duration: Infinity }
    );

    logOut()
      .then(() => {
        toast.success(
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            <div>
              <p className="font-semibold">Signed out successfully</p>
              <p className="text-sm">Hope to see you again soon!</p>
            </div>
          </div>,
          { 
            id: loadingToast,
            duration: 3000 
          }
        );
        
        // Close mobile menu if open
        setIsOpen(false);
      })
      .catch((error) => {
        console.error("Error signing out:", error);
        toast.error(
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <div>
              <p className="font-semibold">Sign out failed</p>
              <p className="text-sm">Please try again</p>
            </div>
          </div>,
          { 
            id: loadingToast,
            duration: 4000 
          }
        );
      });
  };

  const handleSignInNavigation = () => {
    toast.loading("Redirecting to sign in...", { duration: 1000 });
    setIsOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      toast.success("Menu opened", { 
        duration: 1500,
        icon: '📱'
      });
    }
  };

  const handleLogoClick = () => {
    if (isOpen) {
      setIsOpen(false);
    }
    toast.success("Welcome to Aidevo!", { 
      duration: 2000,
      icon: '🎓'
    });
  };

  const handleNavLinkClick = (linkName) => {
    setIsOpen(false);
    toast.success(`Navigating to ${linkName}`, { 
      duration: 1500 
    });
  };

  const handleUserProfileClick = () => {
    toast.success(
      <div className="flex items-center gap-2">
        <User className="w-4 h-4" />
        <span>Viewing your profile</span>
      </div>,
      { duration: 2000 }
    );
  };

  // Enhanced mobile menu close with toast
  const handleMobileMenuClose = () => {
    setIsOpen(false);
    toast.success("Menu closed", { 
      duration: 1000,
      icon: '👋'
    });
  };

  // console.log(userInfo)

  return (
    <nav className="bg-white top-0 z-50 ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and mobile menu button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleMobileMenuToggle}
              className="md:hidden p-2 rounded-lg hover:bg-blue-50 transition-colors group"
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X size={20} className="text-blue-500 group-hover:text-blue-600" />
              ) : (
                <Menu size={20} className="text-gray-600 group-hover:text-blue-500" />
              )}
            </button>
            <div onClick={handleLogoClick} className="cursor-pointer">
              <Logo />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <Links onLinkClick={handleNavLinkClick} />
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            {!user ? (
              <>
                {/* Desktop Sign In */}
                <NavLink
                  to="/signin"
                  onClick={handleSignInNavigation}
                  className="hidden md:flex items-center gap-2 bg-gradient-to-r from-[#4bbeff] to-[#3aa8e6] hover:from-[#3aa8e6] hover:to-[#2b93d1] text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 group"
                >
                  <LogIn size={16} className="group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Sign In</span>
                </NavLink>

                {/* Mobile Sign In */}
                <NavLink
                  to="/signin"
                  onClick={handleSignInNavigation}
                  className="md:hidden flex items-center gap-2 bg-gradient-to-r from-[#4bbeff] to-[#3aa8e6] text-white px-3 py-2 rounded-lg shadow-md transition-colors"
                >
                  <LogIn size={16} />
                  <span>Sign In</span>
                </NavLink>
              </>
            ) : (
              <>
                {/* User Info and Sign Out - Desktop */}
                <div className="hidden md:flex items-center gap-4">
                  <button
                    onClick={handleUserProfileClick}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors group cursor-pointer"
                  >
                    <img
                      src={avatarUrl}
                      alt="User Avatar"
                      className="w-8 h-8 rounded-full object-cover border-2 border-blue-400 group-hover:border-blue-500"
                    />
                    <span className="text-gray-700 font-medium max-w-32 truncate">
                      {displayName}
                    </span>
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#4bbeff] to-[#3aa8e6] hover:from-[#3aa8e6] hover:to-[#2b93d1] text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 group"
                  >
                    <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>

                {/* Mobile User Actions */}
                <div className="md:hidden flex items-center gap-2">
                  <button
                    onClick={handleUserProfileClick}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold overflow-hidden"
                    aria-label="User profile"
                  >
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="User Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-[#4bbeff] to-[#3aa8e6] rounded-full flex items-center justify-center">
                        {displayName ? displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#4bbeff] to-[#3aa8e6] text-white px-3 py-2 rounded-lg shadow-md transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-gray-200 pt-4 pb-4 bg-white/95 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4 px-2">
              <h3 className="text-lg font-semibold text-gray-700">Navigation</h3>
              <button
                onClick={handleMobileMenuClose}
                className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
            <Links onLinkClick={handleNavLinkClick} />
            
            {/* Mobile User Info */}
            {user && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-2 py-3 bg-blue-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden">
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="User Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-r from-[#4bbeff] to-[#3aa8e6] rounded-full flex items-center justify-center text-white font-semibold">
                        {displayName ? displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-blue-600 font-medium capitalize">
                      {userInfo?.role || 'user'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;