import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { setAccessToken, registerLogoutCallback } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessTokenState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSimulatedEmail, setLastSimulatedEmail] = useState(null);

  // Update in-memory token and state
  const updateTokens = (token, userData) => {
    setAccessToken(token);
    setAccessTokenState(token);
    if (userData) {
      setUser(userData);
    }
  };

  const clearAuth = useCallback(() => {
    setAccessToken(null);
    setAccessTokenState(null);
    setUser(null);
  }, []);

  // Register logout callback for 401 refresh failure
  useEffect(() => {
    registerLogoutCallback(clearAuth);
  }, [clearAuth]);

  // Initial session restoration attempt on app mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.post('/auth/refresh');
        if (res.data?.accessToken && res.data?.user) {
          updateTokens(res.data.accessToken, res.data.user);
        }
      } catch (err) {
        // No active or valid session, proceed unauthenticated
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [clearAuth]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.accessToken && res.data?.user) {
      updateTokens(res.data.accessToken, res.data.user);
    }
    return res.data;
  };

  const signup = async (name, email, password) => {
    const res = await api.post('/auth/signup', { name, email, password });
    if (res.data?.accessToken && res.data?.user) {
      updateTokens(res.data.accessToken, res.data.user);
    }
    if (res.data?.simulatedVerification) {
      setLastSimulatedEmail(res.data.simulatedVerification);
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      clearAuth();
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to refresh user profile:', err);
    }
  };

  const verifyEmail = async (token) => {
    const res = await api.get(`/auth/verify-email/${token}`);
    if (res.data?.user) {
      setUser(res.data.user);
    }
    return res.data;
  };

  const value = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isEmailVerified: user?.isEmailVerified ?? false,
    lastSimulatedEmail,
    login,
    signup,
    logout,
    refreshUser,
    verifyEmail,
    setLastSimulatedEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
