import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCheck,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState('');
  const [selectedConversationUser, setSelectedConversationUser] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/messages');
      const list = res.data.messages || [];
      setMessages(list);
      if (list.length > 0 && !selectedConversationUser) {
        setSelectedConversationUser(list[0].senderUserId === user?.id ? list[0].receiverUserId : list[0].senderUserId);
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversationUser || !newContent.trim()) return;

    setSending(true);
    try {
      await api.post('/messages', {
        receiverUserId: selectedConversationUser,
        content: newContent.trim(),
      });
      setNewContent('');
      fetchMessages();
    } catch (err) {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  // Group messages by contact
  const contactsMap = new Map<string, { userId: string; name: string; role: string; lastMsg: any }>();
  for (const m of messages) {
    const contactId = m.isSender ? m.receiverUserId : m.senderUserId;
    if (!contactsMap.has(contactId)) {
      contactsMap.set(contactId, {
        userId: contactId,
        name: m.otherUserName,
        role: m.otherUserRole,
        lastMsg: m,
      });
    }
  }

  const contacts = Array.from(contactsMap.values());
  const conversationMessages = messages.filter(
    (m) =>
      (m.senderUserId === selectedConversationUser && m.receiverUserId === user?.id) ||
      (m.senderUserId === user?.id && m.receiverUserId === selectedConversationUser)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
          <MessageSquare className="w-4 h-4" />
          <span>Direct Messaging & Mentorship Communication</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Messages & Mentorship Notes
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Communicate directly with faculty mentors, alumni advisors, and campus recruiters.
        </p>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading messages...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden min-h-[550px]">
          {/* Left: Contacts List */}
          <div className="lg:col-span-4 border-r border-slate-200 p-4 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2">
              Conversations ({contacts.length})
            </h2>

            {contacts.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No active conversations. Reach out to mentors via the Alumni Directory or Faculty pages!
              </div>
            ) : (
              <div className="space-y-1">
                {contacts.map((c) => {
                  const isSelected = c.userId === selectedConversationUser;
                  return (
                    <button
                      key={c.userId}
                      onClick={() => setSelectedConversationUser(c.userId)}
                      className={`w-full text-left p-3 rounded-xl transition-colors flex items-start gap-3 ${
                        isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-blue-700 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-2xs">
                        {c.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs truncate">{c.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(c.lastMsg.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium capitalize">{c.role}</div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.lastMsg.content}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: Message Thread & Composer */}
          <div className="lg:col-span-8 flex flex-col justify-between p-6 space-y-4">
            {selectedConversationUser ? (
              <>
                {/* Active Chat Header */}
                <div className="pb-3 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                    {contactsMap.get(selectedConversationUser)?.name.slice(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {contactsMap.get(selectedConversationUser)?.name}
                    </h3>
                    <div className="text-xs text-slate-500 capitalize">
                      {contactsMap.get(selectedConversationUser)?.role}
                    </div>
                  </div>
                </div>

                {/* Message Bubble Feed */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[360px]">
                  {conversationMessages.map((m) => {
                    const isMe = m.senderUserId === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                            isMe
                              ? 'bg-blue-700 text-white rounded-br-none shadow-2xs'
                              : 'bg-slate-100 text-slate-800 rounded-bl-none'
                          }`}
                        >
                          {m.content}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 px-1">
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Composer Form */}
                <form onSubmit={handleSendMessage} className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Type your message or mentorship inquiry..."
                    className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newContent.trim()}
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-2xs flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>Send</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                <MessageSquare className="w-10 h-10 text-slate-300 mb-2" />
                <span>Select a conversation from the left to start messaging.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
