import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const res = await api.get('/notifications/unread-count');
      if (res.data?.success) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // User might be unauthenticated
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const fetchRecentUpdates = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/notifications/recent?limit=5');
      if (res.data?.success) {
        setRecentUpdates(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch recent updates for drawer:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      await api.post('/notifications/mark-read');
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark notifications as read:', err);
    }
  }, [isAuthenticated]);

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
    fetchRecentUpdates();
    if (isAuthenticated && unreadCount > 0) {
      markAllAsRead();
    }
  }, [fetchRecentUpdates, isAuthenticated, markAllAsRead, unreadCount]);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  // Fetch unread count when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount();
      // Poll every 60s
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchUnreadCount]);

  const value = {
    unreadCount,
    recentUpdates,
    isDrawerOpen,
    isLoading,
    fetchUnreadCount,
    fetchRecentUpdates,
    markAllAsRead,
    openDrawer,
    closeDrawer,
    setIsDrawerOpen,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
