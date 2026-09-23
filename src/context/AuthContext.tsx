import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { api, setApiActiveUser } from '../services/api';

interface AuthContextType {
  currentUser: User | null;
  usersList: User[];
  role: UserRole;
  switchRole: (role: UserRole, userId?: string) => Promise<void>;
  hasPermission: (perm: string) => boolean;
  isRealtimeConnected: boolean;
  refreshTrigger: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    async function init() {
      try {
        const users = await api.getUsers();
        setUsersList(users);
        const fawaz = users.find((u) => u.email === 'fawaz@octaproperties.com') || users[0];
        if (fawaz) {
          setCurrentUser(fawaz);
          setApiActiveUser(fawaz.id);
        }
      } catch (e) {
        console.error('Failed to load initial user data:', e);
      }
    }
    init();
  }, []);

  // Subscribe to Realtime Server-Sent Events (SSE)
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/realtime/stream');

      es.onopen = () => {
        setIsRealtimeConnected(true);
      };

      es.onmessage = (_e) => {
        // Heartbeat or general event
        setIsRealtimeConnected(true);
      };

      const handleAnyUpdate = () => {
        setRefreshTrigger((prev) => prev + 1);
      };

      es.addEventListener('unit_updated', handleAnyUpdate);
      es.addEventListener('lead_updated', handleAnyUpdate);
      es.addEventListener('appointment_updated', handleAnyUpdate);
      es.addEventListener('payment_updated', handleAnyUpdate);
      es.addEventListener('message_created', handleAnyUpdate);

      es.onerror = () => {
        setIsRealtimeConnected(false);
      };
    } catch (err) {
      console.warn('SSE connection error:', err);
    }

    return () => {
      es?.close();
    };
  }, []);

  const switchRole = async (targetRole: UserRole, userId?: string) => {
    try {
      const res = await api.switchRole(targetRole, userId);
      if (res.success && res.user) {
        setCurrentUser(res.user);
        setApiActiveUser(res.user.id);
      }
    } catch (e) {
      console.error('Role switch error:', e);
    }
  };

  const hasPermission = (perm: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'ADMIN' || currentUser.role === 'MANAGEMENT') return true;
    if (currentUser.permissions?.includes('*')) return true;
    return currentUser.permissions?.includes(perm) || false;
  };

  const role: UserRole = currentUser?.role || 'MANAGEMENT';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        usersList,
        role,
        switchRole,
        hasPermission,
        isRealtimeConnected,
        refreshTrigger,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
