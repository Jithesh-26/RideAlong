import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessagesContext';
import { ConversationItem } from '../components/messages/ConversationItem';
import { ChatPane } from '../components/messages/ChatPane';
import { ReportUserModal } from '../components/safety/ReportUserModal';
import { Traveller } from '../types';
import { MessageSquare, UserCheck, Inbox, Check, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Avatar } from '../components/common/Avatar';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const MessagesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    conversations,
    activeConversation,
    setActiveConversation,
    messages,
    sendMessage,
    requests,
    acceptRequest,
    declineRequest,
    withdrawRequest,
  } = useMessages();

  const [activeTab, setActiveTab] = useState<'conversations' | 'requests'>('conversations');
  const [reportUserTarget, setReportUserTarget] = useState<Traveller | null>(null);

  if (!currentUser) return null;

  // Incoming and outgoing requests
  const incoming = requests.filter(r => r.receiverId === currentUser.id);
  const outgoing = requests.filter(r => r.senderId === currentUser.id);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 text-left">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Secure Communications & Requests
          </h1>
          <p className="text-xs text-slate-500">
            Encrypted travel partner messaging and reciprocal trip requests.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('conversations')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'conversations'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Chats ({conversations.length})
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'requests'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Requests</span>
            {incoming.filter(r => r.status === 'pending').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            )}
          </button>
        </div>
      </div>

      {activeTab === 'conversations' ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0">
          {/* Left: Conversations List */}
          <div className="md:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-4 overflow-y-auto space-y-2 shadow-xs">
            <h3 className="text-xs font-bold uppercase text-slate-400 px-2 tracking-wider mb-2">
              Active Threads
            </h3>

            {conversations.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-400 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No Active Conversations</p>
                <p className="text-[11px] text-slate-400">
                  Accept a connection request or send one from SafeMatch to start coordinating.
                </p>
              </div>
            ) : (
              conversations.map(conv => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  currentUserId={currentUser.id}
                  isActive={activeConversation?.id === conv.id}
                  onClick={() => setActiveConversation(conv)}
                />
              ))
            )}
          </div>

          {/* Right: Chat Window */}
          <div className="md:col-span-8 h-full min-h-[400px]">
            {activeConversation ? (
              <ChatPane
                conversation={activeConversation}
                messages={messages}
                currentUser={currentUser}
                onSendMessage={sendMessage}
                onOpenReport={u => setReportUserTarget(u)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 bg-white rounded-3xl border border-slate-200/90 text-center text-slate-400 space-y-3 shadow-xs">
                <Inbox className="w-12 h-12 text-teal-600/40" />
                <h3 className="text-base font-bold text-slate-800">Select a Conversation</h3>
                <p className="text-xs max-w-sm text-slate-500">
                  Pick a travel companion from the left sidebar to coordinate departure times, transit seats, and safety guidelines.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Requests Inbox */
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Incoming Requests */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Incoming Connection Requests ({incoming.length})
              </h3>
            </div>

            {incoming.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No incoming connection requests.</p>
            ) : (
              <div className="space-y-3">
                {incoming.map(req => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <Avatar
                        src={req.sender?.avatar}
                        name={req.sender?.name || 'User'}
                        size="md"
                        isVerified={req.sender?.safetyStatus.idVerified}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{req.sender?.name}</h4>
                          <span className="text-[10px] text-slate-400">
                            {new Date(req.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          {req.sender?.homeCity} • {req.sender?.preferences.pace} pace
                        </p>
                        <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-100 italic">
                          "{req.note}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {req.status === 'pending' ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-slate-600 hover:text-slate-900"
                            onClick={() => declineRequest(req.id)}
                          >
                            Decline
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            leftIcon={<Check className="w-3.5 h-3.5" />}
                            onClick={() => acceptRequest(req.id)}
                          >
                            Accept
                          </Button>
                        </>
                      ) : (
                        <Badge
                          variant={req.status === 'accepted' ? 'mint' : 'slate'}
                          size="md"
                          className="capitalize"
                        >
                          {req.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Requests */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Outgoing Requests Sent by You ({outgoing.length})
              </h3>
            </div>

            {outgoing.length === 0 ? (
              <p className="text-xs text-slate-400 py-4">No outgoing requests sent.</p>
            ) : (
              <div className="space-y-3">
                {outgoing.map(req => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={req.receiver?.avatar}
                        name={req.receiver?.name || 'Traveller'}
                        size="md"
                        isVerified={req.receiver?.safetyStatus.idVerified}
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{req.receiver?.name}</h4>
                        <p className="text-[11px] text-slate-500">
                          Sent on {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          req.status === 'accepted'
                            ? 'mint'
                            : req.status === 'pending'
                            ? 'amber'
                            : 'slate'
                        }
                        size="sm"
                        className="capitalize"
                      >
                        {req.status}
                      </Badge>
                      {req.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-slate-500 hover:text-red-600"
                          onClick={() => withdrawRequest(req.id)}
                        >
                          Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {reportUserTarget && (
        <ReportUserModal
          isOpen={Boolean(reportUserTarget)}
          onClose={() => setReportUserTarget(null)}
          targetUser={reportUserTarget}
        />
      )}
    </div>
  );
};
