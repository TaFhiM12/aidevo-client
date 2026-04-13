import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import useAuth from "../hooks/useAuth";
import API from "../utils/api";
import socketService from "../utils/Socket";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const response = await API.get(`/notifications/me/${user.uid}?limit=20`);
      setNotifications(response.data?.notifications || []);
      setUnreadCount(response.data?.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await API.patch(`/notifications/${notificationId}/read`, {});
      setNotifications((prev) =>
        prev.map((item) =>
          String(item._id) === String(notificationId)
            ? { ...item, read: true }
            : item
        )
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.uid) return;

    try {
      await API.patch(`/notifications/read-all/${user.uid}`, {});
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  useEffect(() => {
    if (!user?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    const socket = socketService.connect();
    socket.emit("register_user", user.uid);

    const onReceiveNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 30));
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("receive_notification", onReceiveNotification);

    return () => {
      socket.off("receive_notification", onReceiveNotification);
    };
  }, [user?.uid]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
    }),
    [notifications, unreadCount, loading]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
};
