import React, { createContext, useContext, useState, useCallback } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [globalUserInfo, setGlobalUserInfo] = useState(null);
  const [userUpdateKey, setUserUpdateKey] = useState(0);

  // Use useCallback to prevent unnecessary re-renders
  const updateGlobalUserInfo = useCallback((updates) => {
    setGlobalUserInfo(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const refreshUserData = useCallback(() => {
    setUserUpdateKey(prev => prev + 1);
  }, []);

  const value = {
    globalUserInfo,
    updateGlobalUserInfo,
    userUpdateKey,
    refreshUserData
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};