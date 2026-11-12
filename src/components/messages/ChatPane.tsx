import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message, Traveller } from '../../types';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { ShieldCheck, Send, ShieldAlert, Compass, ArrowRight, Bot } from 'lucide-react';

interface ChatPaneProps {
  conversation: Conversation;
  messages: Message[];
  currentUser: Traveller;
  onSendMessage: (receiverId: string, content: string, tripId?: string) => Promise<void>;
  onOpenReport?: (user: Traveller) => void;
}

export const ChatPane: React.FC<ChatPaneProps> = ({
  conversation,
  messages,
  currentUser,
  onSendMessage,
  onOpenReport,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const otherParticipant = conversation.participants?.find(p => p.id !== currentUser.id) || {
    id: 'unknown',
    name: 'Travel Companion',
    avatar: '',
    safetyStatus: { idVerified: false },
    homeCity: 'India',
  } as Traveller;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSending) return;

    const content = inputText.trim();
    setInputText('');
    setIsSending(true);

    try {
      await onSendMessage(otherParticipant.id, content, conversation.tripId);
    } catch (err) {
      console.error('Failed to send:', err);
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Top Header */}
      <div className="px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            src={otherParticipant.avatar}
            name={otherParticipant.name}
            size="md"
            isVerified={otherParticipant.safetyStatus?.idVerified}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {otherParticipant.name}
              </h3>
              {otherParticipant.safetyStatus?.idVerified && (
                <span title="Identity Verified">
                  <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              {otherParticipant.homeCity} • Active travel partner
            </p>
          </div>
        </div>

        {/* Safety & Report Actions */}
        <div className="flex items-center gap-2">
          {onOpenReport && (
            <Button
              variant="outline"
              size="sm"
              className="text-slate-600 hover:text-red-600 text-xs px-2.5 py-1"
              onClick={() => onOpenReport(otherParticipant)}
            >
              Report User
            </Button>
          )}
        </div>
      </div>

      {/* Safety Notice & Simulated Badge */}
      <div className="px-5 py-2.5 bg-teal-50/70 border-b border-teal-100/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-teal-900">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-teal-700 shrink-0" />
          <span>Keep coordination inside RideAlong. Never share financial credentials or OTPs.</span>
        </div>
        <div className="flex items-center gap-1 text-teal-700 font-semibold bg-white/80 px-2 py-0.5 rounded-md border border-teal-200/50 self-start sm:self-auto">
          <Bot className="w-3 h-3" />
          <span>Demo Simulated Messaging Enabled</span>
        </div>
      </div>

      {/* Linked Journey summary if available */}
      {conversation.trip && (
        <div className="px-5 py-2 bg-slate-100/60 border-b border-slate-200/50 flex items-center gap-2 text-xs text-slate-700">
          <Compass className="w-3.5 h-3.5 text-teal-600 shrink-0" />
          <span className="font-semibold">Linked Journey:</span>
          <span>{conversation.trip.origin}</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span>{conversation.trip.destination}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500">{conversation.trip.date}</span>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
            <ShieldCheck className="w-10 h-10 text-teal-500/50" />
            <p className="text-sm font-semibold text-slate-700">Safe Channel Initialized</p>
            <p className="text-xs max-w-xs">
              Say hello and begin coordinating your schedule, travel pickup points, and expectations.
            </p>
          </div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderId === currentUser.id;
            const isSimulated = msg.content.startsWith('[Simulated Reply]');

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-[#0F766E] text-white rounded-br-xs'
                      : isSimulated
                      ? 'bg-emerald-50/90 text-emerald-950 border border-emerald-200 rounded-bl-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  {isSimulated && (
                    <span className="block text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                      🤖 Companion Auto-Simulated Reply
                    </span>
                  )}
                  <p>{msg.content.replace('[Simulated Reply] ', '')}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">
                  {formatMessageTime(msg.timestamp)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Send Input Area */}
      <form onSubmit={handleSend} className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          placeholder={`Message ${otherParticipant.name}...`}
          className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
          disabled={isSending}
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSending}
          disabled={!inputText.trim() || isSending}
          leftIcon={<Send className="w-4 h-4" />}
        >
          Send
        </Button>
      </form>
    </div>
  );
};
