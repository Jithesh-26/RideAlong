import React from 'react';
import { Conversation, Traveller } from '../../types';
import { Avatar } from '../common/Avatar';
import { ShieldCheck } from 'lucide-react';

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId: string;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  currentUserId,
  isActive,
  onClick,
}) => {
  // Find other participant
  const otherParticipant = conversation.participants?.find(p => p.id !== currentUserId) || {
    id: 'unknown',
    name: 'Travel Companion',
    avatar: '',
    safetyStatus: { idVerified: false },
  } as Traveller;

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-3.5 rounded-2xl transition flex items-center gap-3.5 ${
        isActive
          ? 'bg-teal-50 border border-teal-200/90 shadow-xs'
          : 'hover:bg-slate-50 border border-transparent'
      }`}
    >
      <Avatar
        src={otherParticipant.avatar}
        name={otherParticipant.name}
        size="md"
        isVerified={otherParticipant.safetyStatus?.idVerified}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-bold text-slate-900 truncate">
              {otherParticipant.name}
            </span>
            {otherParticipant.safetyStatus?.idVerified && (
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            )}
          </div>
          <span className="text-[10px] text-slate-400 shrink-0">
            {formatTime(conversation.lastMessageTime)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-slate-500 truncate">{conversation.lastMessage}</p>
          {conversation.unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold shrink-0">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
