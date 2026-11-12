import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Conversation, Message, ConnectionRequest } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface MessagesContextType {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: Message[];
  requests: ConnectionRequest[];
  isLoading: boolean;
  setActiveConversation: (conv: Conversation | null) => void;
  sendMessage: (receiverId: string, content: string, tripId?: string) => Promise<void>;
  sendRequest: (receiverId: string, tripId?: string, note?: string) => Promise<{ success: boolean; error?: string }>;
  acceptRequest: (requestId: string) => Promise<boolean>;
  declineRequest: (requestId: string) => Promise<boolean>;
  withdrawRequest: (requestId: string) => Promise<boolean>;
  refreshAll: () => Promise<void>;
  unreadCount: number;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshAll = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const [convList, reqList] = await Promise.all([
        api.getConversations(currentUser.id),
        api.getRequests(currentUser.id),
      ]);
      setConversations(convList);
      setRequests(reqList);

      // If there is an active conversation, update messages
      if (activeConversation) {
        const msgs = await api.getMessages(activeConversation.id);
        setMessages(msgs);
      }
    } catch (err) {
      console.error('Failed to load messages or requests:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, activeConversation?.id]);

  useEffect(() => {
    refreshAll();
  }, [currentUser?.id]);

  // Load messages when activeConversation changes
  useEffect(() => {
    async function loadMessages() {
      if (activeConversation) {
        const msgs = await api.getMessages(activeConversation.id);
        setMessages(msgs);
      } else {
        setMessages([]);
      }
    }
    loadMessages();
  }, [activeConversation?.id]);

  const sendMessage = async (receiverId: string, content: string, tripId?: string) => {
    if (!currentUser || !activeConversation) return;

    // Send user message
    const newMsg = await api.sendMessage({
      conversationId: activeConversation.id,
      senderId: currentUser.id,
      receiverId,
      content,
      tripId,
    });

    setMessages(prev => [...prev, newMsg]);

    // Simulated contextual reply from companion after 1.4s
    setTimeout(async () => {
      const simulatedReplies = [
        "Got it! That sounds great. Looking forward to synchronizing our arrival at the station.",
        "Understood. I have verified my travel details and shared my live itinerary with my trusted contact.",
        "Sounds like a plan! Let's meet at the designated public pickup area before boarding.",
        "Perfect. Safe and coordinated travel is top priority for me as well.",
      ];
      const randomReply = simulatedReplies[Math.floor(Math.random() * simulatedReplies.length)];

      const replyMsg = await api.sendMessage({
        conversationId: activeConversation.id,
        senderId: receiverId,
        receiverId: currentUser.id,
        content: `[Simulated Reply] ${randomReply}`,
        tripId,
      });

      setMessages(prev => [...prev, replyMsg]);
      refreshAll();
    }, 1400);
  };

  const sendRequest = async (receiverId: string, tripId?: string, note?: string) => {
    if (!currentUser) return { success: false, error: 'Must be logged in to send requests' };

    // Prevent duplicate requests
    const existing = requests.find(
      r =>
        r.senderId === currentUser.id &&
        r.receiverId === receiverId &&
        r.status === 'pending'
    );
    if (existing) {
      return { success: false, error: 'A pending connection request already exists with this traveller.' };
    }

    try {
      await api.sendRequest({
        senderId: currentUser.id,
        receiverId,
        tripId,
        note: note || `Hi! I would like to connect as travel companions on RideAlong.`,
      });
      await refreshAll();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to send request' };
    }
  };

  const acceptRequest = async (requestId: string) => {
    const success = await api.acceptRequest(requestId);
    if (success) {
      await refreshAll();
    }
    return success;
  };

  const declineRequest = async (requestId: string) => {
    const success = await api.declineRequest(requestId);
    if (success) {
      await refreshAll();
    }
    return success;
  };

  const withdrawRequest = async (requestId: string) => {
    const success = await api.withdrawRequest(requestId);
    if (success) {
      await refreshAll();
    }
    return success;
  };

  const unreadCount = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <MessagesContext.Provider
      value={{
        conversations,
        activeConversation,
        messages,
        requests,
        isLoading,
        setActiveConversation,
        sendMessage,
        sendRequest,
        acceptRequest,
        declineRequest,
        withdrawRequest,
        refreshAll,
        unreadCount,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
};
