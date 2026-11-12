import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TrustedContact, BlockedUser } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface SafetyContextType {
  trustedContacts: TrustedContact[];
  blockedUsers: BlockedUser[];
  isLoading: boolean;
  addTrustedContact: (data: Omit<TrustedContact, 'id' | 'addedAt'>) => Promise<TrustedContact>;
  deleteTrustedContact: (id: string) => Promise<boolean>;
  reportUser: (reportedUserId: string, reason: string, details: string) => Promise<{ success: boolean; message: string }>;
  blockUser: (blockedUserId: string) => Promise<boolean>;
  unblockUser: (blockedUserId: string) => Promise<boolean>;
  isBlocked: (userId: string) => boolean;
  refreshSafety: () => Promise<void>;
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export const SafetyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshSafety = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const [contacts, blocked] = await Promise.all([
        api.getTrustedContacts(currentUser.id),
        api.getBlockedUsers(currentUser.id),
      ]);
      setTrustedContacts(contacts);
      setBlockedUsers(blocked);
    } catch (err) {
      console.error('Failed to load safety data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    refreshSafety();
  }, [currentUser?.id]);

  const addTrustedContact = async (data: Omit<TrustedContact, 'id' | 'addedAt'>) => {
    const created = await api.addTrustedContact(data);
    await refreshSafety();
    return created;
  };

  const deleteTrustedContact = async (id: string) => {
    const success = await api.deleteTrustedContact(id);
    if (success) {
      await refreshSafety();
    }
    return success;
  };

  const reportUser = async (reportedUserId: string, reason: string, details: string) => {
    if (!currentUser) throw new Error('Not logged in');
    return await api.reportUser({
      reporterId: currentUser.id,
      reportedUserId,
      reason,
      details,
    });
  };

  const blockUser = async (blockedUserId: string) => {
    if (!currentUser) throw new Error('Not logged in');
    const success = await api.blockUser(currentUser.id, blockedUserId);
    if (success) {
      await refreshSafety();
    }
    return success;
  };

  const unblockUser = async (blockedUserId: string) => {
    if (!currentUser) throw new Error('Not logged in');
    const success = await api.unblockUser(currentUser.id, blockedUserId);
    if (success) {
      await refreshSafety();
    }
    return success;
  };

  const isBlocked = (userId: string) => {
    return blockedUsers.some(b => b.blockedUserId === userId);
  };

  return (
    <SafetyContext.Provider
      value={{
        trustedContacts,
        blockedUsers,
        isLoading,
        addTrustedContact,
        deleteTrustedContact,
        reportUser,
        blockUser,
        unblockUser,
        isBlocked,
        refreshSafety,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
};

export const useSafety = () => {
  const context = useContext(SafetyContext);
  if (!context) {
    throw new Error('useSafety must be used within a SafetyProvider');
  }
  return context;
};
