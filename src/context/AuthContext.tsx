import React, { createContext, useContext, useState, useEffect } from 'react';
import { Traveller } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  currentUser: Traveller | null;
  demoUsers: Traveller[];
  isLoading: boolean;
  login: (email?: string, password?: string, demoUserId?: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: { name: string; email: string; password: string; homeCity: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  switchDemoUser: (demoUserId: string) => Promise<void>;
  updateProfile: (updates: Partial<Traveller>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<Traveller | null>(null);
  const [demoUsers, setDemoUsers] = useState<Traveller[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const demos = await api.getDemoUsers();
        setDemoUsers(demos);

        // Check local storage for existing session or default to Ananya Sharma (Demo 1)
        const stored = localStorage.getItem('ridealong_current_user');
        if (stored) {
          try {
            setCurrentUser(JSON.parse(stored));
          } catch {
            if (demos.length > 0) setCurrentUser(demos[0]);
          }
        } else if (demos.length > 0) {
          setCurrentUser(demos[0]);
          localStorage.setItem('ridealong_current_user', JSON.stringify(demos[0]));
        }
      } catch (err) {
        console.error('Failed to init auth:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email?: string, password?: string, demoUserId?: string) => {
    try {
      const res = await api.login(email, password, demoUserId);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem('ridealong_current_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, error: 'Login failed. Please verify credentials.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const signup = async (data: { name: string; email: string; password: string; homeCity: string }) => {
    try {
      const res = await api.signup(data);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        localStorage.setItem('ridealong_current_user', JSON.stringify(res.user));
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ridealong_current_user');
  };

  const switchDemoUser = async (demoUserId: string) => {
    const res = await api.login(undefined, undefined, demoUserId);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      localStorage.setItem('ridealong_current_user', JSON.stringify(res.user));
    }
  };

  const updateProfile = async (updates: Partial<Traveller>) => {
    if (!currentUser) return;
    const updated = await api.updateUser(currentUser.id, updates);
    setCurrentUser(updated);
    localStorage.setItem('ridealong_current_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        demoUsers,
        isLoading,
        login,
        signup,
        logout,
        switchDemoUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
