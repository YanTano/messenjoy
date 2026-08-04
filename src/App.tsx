import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageSquare, Bell } from 'lucide-react';
import {
  Contact,
  Message,
  CallState,
  ThemeSettings,
  ChatFilter,
} from './types';
import {
  UserAccount,
  getCurrentSessionUser,
  getRegisteredAccounts,
  logoutUser,
} from './utils/auth';
import { syncEngine, SyncMessagePayload } from './utils/syncChannel';
import { AI_CONTACTS, accountToContact, INITIAL_MESSAGES } from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { CallModal } from './components/CallModal';
import { MediaViewer } from './components/MediaViewer';
import { DrawingCanvasModal } from './components/DrawingCanvasModal';
import { ContactInfoModal } from './components/ContactInfoModal';
import { NewChatModal } from './components/NewChatModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { sounds } from './utils/audio';

// Helper to compute a shared conversation key for 1-on-1 user chats
function getConversationKey(currentUserId: string | undefined, contactId: string): string {
  if (!currentUserId || !contactId) return contactId;
  if (contactId.startsWith('ai_') || contactId.startsWith('group_')) {
    return contactId;
  }
  const ids = [currentUserId, contactId].sort();
  return `conv_${ids[0]}_${ids[1]}`;
}

export default function App() {
  // Current logged in account session
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getCurrentSessionUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(!currentUser);

  // Incoming notification state
  const [incomingNotification, setIncomingNotification] = useState<{
    id: string;
    senderName: string;
    senderAvatar: string;
    text: string;
    contactId: string;
  } | null>(null);

  // Messages map initialization
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem('messenger_messages_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* fallback */
      }
    }
    return INITIAL_MESSAGES;
  });

  // Helper to load contacts dynamically from AI bots + registered users & resolve last messages from messagesMap
  const getCombinedContacts = (
    user: UserAccount | null,
    msgsMap: Record<string, Message[]>
  ): Contact[] => {
    const savedContactsStr = localStorage.getItem('messenger_contacts_v2');
    let savedContactsMap: Record<string, Contact> = {};
    if (savedContactsStr) {
      try {
        const parsed = JSON.parse(savedContactsStr);
        if (Array.isArray(parsed)) {
          parsed.forEach((c: Contact) => {
            savedContactsMap[c.id] = c;
          });
        }
      } catch (e) {
        /* fallback */
      }
    }

    const registeredAccounts = getRegisteredAccounts();
    const otherUserContacts = registeredAccounts
      .filter((acc) => !user || acc.id !== user.id)
      .map((acc) => {
        const base = accountToContact(acc);
        const saved = savedContactsMap[acc.id];
        return saved ? { ...base, ...saved, name: acc.name, avatar: acc.avatar } : base;
      });

    const aiContacts = AI_CONTACTS.map((ai) => {
      const saved = savedContactsMap[ai.id];
      return saved ? { ...ai, ...saved } : ai;
    });

    const allContacts = [...aiContacts, ...otherUserContacts];

    // Resolve latest messages for each contact dynamically from msgsMap
    return allContacts.map((c) => {
      const convKey = getConversationKey(user?.id, c.id);
      const primaryMsgs = msgsMap[convKey] || [];
      const secondaryMsgs = convKey !== c.id ? msgsMap[c.id] || [] : [];

      const msgMap = new Map<string, Message>();
      [...secondaryMsgs, ...primaryMsgs].forEach((m) => msgMap.set(m.id, m));
      const allMsgs = Array.from(msgMap.values());

      if (allMsgs.length > 0) {
        const lastMsg = allMsgs[allMsgs.length - 1];
        const preview =
          lastMsg.text ||
          (lastMsg.voiceNoteUrl ? '🎙️ Voice note' : 'Sent an attachment');
        return {
          ...c,
          lastMessage: preview,
          lastMessageTime: lastMsg.timestamp,
        };
      }

      return c;
    });
  };

  const [contacts, setContacts] = useState<Contact[]>(() =>
    getCombinedContacts(currentUser, messagesMap)
  );

  const [activeContactId, setActiveContactId] = useState<string | null>('ai_gemini');
  const [activeFilter, setActiveFilter] = useState<ChatFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Settings
  const [settings, setSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('messenger_settings_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* fallback */
      }
    }
    return {
      mode: 'light',
      wallpaper: 'default',
      soundEnabled: true,
      smartRepliesEnabled: true,
      enterToSend: true,
    };
  });

  // Call State
  const [callState, setCallState] = useState<CallState>({
    active: false,
    type: null,
    contact: null,
    duration: 0,
    isMuted: false,
    isCameraOff: false,
    isScreenSharing: false,
  });

  // UI Modals state
  const [isContactInfoOpen, setIsContactInfoOpen] = useState(false);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDrawingModalOpen, setIsDrawingModalOpen] = useState(false);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | null>(null);

  // Conversational state
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [typingMap, setTypingMap] = useState<Record<string, boolean>>({});

  // Mobile navigation state
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);

  const callTimerRef = useRef<any>(null);

  // Sync contacts whenever currentUser or messagesMap changes
  useEffect(() => {
    setContacts(getCombinedContacts(currentUser, messagesMap));
  }, [currentUser, messagesMap]);

  // Save state to localStorage whenever contacts, messages, settings change
  useEffect(() => {
    localStorage.setItem('messenger_contacts_v2', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('messenger_messages_v2', JSON.stringify(messagesMap));
  }, [messagesMap]);

  useEffect(() => {
    localStorage.setItem('messenger_settings_v2', JSON.stringify(settings));
    sounds.setEnabled(settings.soundEnabled);

    if (settings.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  // Multi-tab LocalStorage listener
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'messenger_messages_v2' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setMessagesMap((prev) => ({ ...prev, ...parsed }));
        } catch (err) {}
      } else if (e.key === 'messenger_contacts_v2' && e.newValue) {
        setContacts(getCombinedContacts(currentUser, messagesMap));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [currentUser]);

  // Real-time Sync Engine Listener across tabs/windows
  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((payload: SyncMessagePayload) => {
      if (!currentUser) return;

      if (payload.type === 'NEW_MESSAGE' && payload.message) {
        const { senderId, recipientId, message } = payload;

        // If this message was sent to ME or sent by ME in another tab
        if (recipientId === currentUser.id || senderId === currentUser.id) {
          const otherId = senderId === currentUser.id ? recipientId! : senderId!;
          const convKey = getConversationKey(currentUser.id, otherId);

          const incomingMsg: Message = {
            ...message,
            isUser: message.senderId === currentUser.id,
          };

          setMessagesMap((prev) => {
            const currentMsgs = prev[convKey] || prev[otherId] || [];
            if (currentMsgs.some((m) => m.id === incomingMsg.id)) return prev;
            const updated = [...currentMsgs, incomingMsg];
            return {
              ...prev,
              [convKey]: updated,
              [otherId]: updated,
            };
          });

          // Update contacts & unread count if received from someone else
          if (recipientId === currentUser.id && senderId) {
            setContacts((prev) => {
              const exists = prev.some((c) => c.id === senderId);
              if (!exists) {
                const regAccounts = getRegisteredAccounts();
                const foundAcc = regAccounts.find((a) => a.id === senderId);
                const newContact: Contact = foundAcc
                  ? accountToContact(foundAcc)
                  : {
                      id: senderId,
                      name: message.senderName || 'User',
                      avatar:
                        message.senderAvatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
                      status: 'online',
                      lastMessage: incomingMsg.text || 'Sent an attachment',
                      lastMessageTime: incomingMsg.timestamp,
                      unreadCount: activeContactId === senderId ? 0 : 1,
                    };
                return [
                  {
                    ...newContact,
                    lastMessage: incomingMsg.text || 'Sent an attachment',
                    lastMessageTime: incomingMsg.timestamp,
                    unreadCount: activeContactId === senderId ? 0 : 1,
                  },
                  ...prev,
                ];
              }

              return prev.map((c) => {
                if (c.id === senderId) {
                  const isViewing = activeContactId === senderId;
                  return {
                    ...c,
                    lastMessage: incomingMsg.text || 'Sent an attachment',
                    lastMessageTime: incomingMsg.timestamp,
                    unreadCount: isViewing ? 0 : (c.unreadCount || 0) + 1,
                  };
                }
                return c;
              });
            });

            // Show incoming notification banner
            const senderAcc = getRegisteredAccounts().find((a) => a.id === senderId);
            setIncomingNotification({
              id: incomingMsg.id,
              senderName: message.senderName || senderAcc?.name || 'User',
              senderAvatar:
                message.senderAvatar ||
                senderAcc?.avatar ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
              text: incomingMsg.text || 'Sent an attachment',
              contactId: senderId,
            });

            sounds.playReceived();
          }
        }
      } else if (payload.type === 'TYPING' && payload.senderId) {
        if (payload.recipientId === currentUser.id) {
          const isTypingVal = !!payload.isTyping;
          setTypingMap((prev) => ({ ...prev, [payload.senderId!]: isTypingVal }));
        }
      } else if (payload.type === 'USER_REGISTERED') {
        // Refresh contact list with newly registered users
        setContacts(getCombinedContacts(currentUser, messagesMap));
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser, activeContactId, messagesMap]);

  // Auto dismiss incoming toast notification
  useEffect(() => {
    if (incomingNotification) {
      const timer = setTimeout(() => {
        setIncomingNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [incomingNotification]);

  // Call Duration Timer
  useEffect(() => {
    if (callState.active) {
      callTimerRef.current = setInterval(() => {
        setCallState((prev) => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    }
    return () => {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
    };
  }, [callState.active]);

  const activeContact = contacts.find((c) => c.id === activeContactId) || null;

  // Active Messages resolution
  const getActiveMessages = (): Message[] => {
    if (!activeContactId) return [];
    const convKey = getConversationKey(currentUser?.id, activeContactId);

    const primary = messagesMap[convKey] || [];
    const secondary = convKey !== activeContactId ? messagesMap[activeContactId] || [] : [];

    const map = new Map<string, Message>();
    [...secondary, ...primary].forEach((m) => {
      map.set(m.id, {
        ...m,
        isUser: currentUser ? m.senderId === currentUser.id : m.isUser,
      });
    });

    return Array.from(map.values());
  };

  const activeMessages = getActiveMessages();

  // Helper to generate contextual smart replies locally for instant zero-latency feedback
  const getContextualFallbackReplies = (text: string): string[] => {
    const lower = (text || '').toLowerCase();
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return ['Hey there!', 'Hello! How are you?', 'Hi! Great to connect.'];
    }
    if (lower.includes('how are you') || lower.includes('how is it going') || lower.includes('how are u')) {
      return ["I'm doing well, thanks!", "All good here!", "Doing great, how about you?"];
    }
    if (lower.includes('meet') || lower.includes('call') || lower.includes('time') || lower.includes('zoom')) {
      return ['Sounds good, what time?', 'Send me an invite!', 'I am free now!'];
    }
    if (lower.includes('thanks') || lower.includes('thank you') || lower.includes('thx')) {
      return ['You are welcome!', 'Anytime!', 'No problem at all!'];
    }
    if (lower.includes('?') || lower.includes('what') || lower.includes('where') || lower.includes('when')) {
      return ['Let me check and get back to you.', 'Sure, I can help with that!', 'Sounds good!'];
    }
    return ['Sounds good!', 'Got it, thanks!', 'Let us keep in touch!'];
  };

  // Fetch AI Smart Reply suggestions when active message list changes
  useEffect(() => {
    if (!activeContactId || !settings.smartRepliesEnabled) {
      setSmartReplies([]);
      return;
    }

    const msgs = getActiveMessages();
    if (msgs.length === 0) {
      setSmartReplies(['Hello!', 'How are you?', 'Nice to meet you!']);
      return;
    }

    const lastMsg = msgs[msgs.length - 1];
    if (!lastMsg.isUser) {
      fetchSmartReplies(lastMsg.text, lastMsg.senderName);
    } else {
      setSmartReplies([]);
    }
  }, [activeContactId, messagesMap, settings.smartRepliesEnabled]);

  const fetchSmartReplies = async (lastText: string, senderName: string) => {
    const defaultReplies = getContextualFallbackReplies(lastText);
    setSmartReplies(defaultReplies);

    try {
      const res = await fetch('/api/ai/smart-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastMessageText: lastText, senderName }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.suggestions) && data.suggestions.length > 0) {
          setSmartReplies(data.suggestions);
        }
      }
    } catch (e) {
      // Fallback already set above
    }
  };

  // Handle Select Contact
  const handleSelectContact = (id: string) => {
    setActiveContactId(id);
    setReplyingTo(null);
    setShowMobileSidebar(false);

    // Clear unread count
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
    );
  };

  // Typing event handler
  const handleUserTyping = (isTyping: boolean) => {
    if (!activeContactId || !currentUser) return;
    const contact = contacts.find((c) => c.id === activeContactId);
    if (contact && !contact.isAI) {
      syncEngine.broadcast({
        type: 'TYPING',
        senderId: currentUser.id,
        recipientId: activeContactId,
        isTyping,
      });
    }
  };

  // Send Message Logic
  const handleSendMessage = async (
    text: string,
    attachments?: any[],
    voiceNoteUrl?: string,
    voiceDuration?: number
  ) => {
    if (!activeContactId || !currentUser) return;

    const timeString = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMsg: Message = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      chatId: activeContactId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text,
      timestamp: timeString,
      isUser: true,
      status: 'sent',
      replyToText: replyingTo ? replyingTo.text : undefined,
      replyToSender: replyingTo ? replyingTo.senderName : undefined,
      attachments,
      voiceNoteUrl,
      voiceNoteDuration: voiceDuration,
    };

    sounds.playSent();
    setReplyingTo(null);

    const convKey = getConversationKey(currentUser.id, activeContactId);

    // Append user message
    setMessagesMap((prev) => {
      const currentConv = prev[convKey] || prev[activeContactId] || [];
      const updated = [...currentConv, newMsg];
      return {
        ...prev,
        [activeContactId]: updated,
        [convKey]: updated,
      };
    });

    // Update contact's last message
    setContacts((prev) =>
      prev.map((c) =>
        c.id === activeContactId
          ? {
              ...c,
              lastMessage: text || (voiceNoteUrl ? '🎙️ Voice note' : 'Sent an attachment'),
              lastMessageTime: timeString,
            }
          : c
      )
    );

    const contact = contacts.find((c) => c.id === activeContactId);
    if (!contact) return;

    // AI Response Handling
    if (contact.isAI) {
      setTypingMap((prev) => ({ ...prev, [activeContactId]: true }));

      try {
        const history = getActiveMessages().map((m) => ({
          isUser: m.isUser,
          text: m.text,
        }));

        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history,
            systemPrompt: contact.aiSystemPrompt,
            botName: contact.name,
          }),
        });

        const data = await res.json();
        const replyText = data.replyText || "I'm sorry, I couldn't generate a response.";

        const aiMsg: Message = {
          id: 'msg_ai_' + Date.now(),
          chatId: activeContactId,
          senderId: contact.id,
          senderName: contact.name,
          senderAvatar: contact.avatar,
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
          isUser: false,
          status: 'read',
        };

        sounds.playReceived();

        setMessagesMap((prev) => {
          const currentMsgs = prev[activeContactId] || [];
          return {
            ...prev,
            [activeContactId]: [...currentMsgs, aiMsg],
          };
        });

        setContacts((prev) =>
          prev.map((c) =>
            c.id === activeContactId
              ? { ...c, lastMessage: replyText, lastMessageTime: aiMsg.timestamp }
              : c
          )
        );
      } catch (err) {
        console.error('AI chat error:', err);
      } finally {
        setTypingMap((prev) => ({ ...prev, [activeContactId]: false }));
      }
    } else {
      // Real Account Message Broadcast
      syncEngine.broadcast({
        type: 'NEW_MESSAGE',
        senderId: currentUser.id,
        recipientId: activeContactId,
        chatId: activeContactId,
        message: newMsg,
      });
    }
  };

  // Reactions, Pinning, Starring, Deleting
  const handleReactToMessage = (msgId: string, emoji: string) => {
    if (!activeContactId || !currentUser) return;
    const convKey = getConversationKey(currentUser.id, activeContactId);

    setMessagesMap((prev) => {
      const msgs = prev[convKey] || prev[activeContactId] || [];
      const updated = msgs.map((m) => {
        if (m.id !== msgId) return m;
        const currentReactions = m.reactions || [];
        const existing = currentReactions.find((r) => r.emoji === emoji);

        let newReactions;
        if (existing) {
          if (existing.userReacted) {
            newReactions = currentReactions
              .map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1, userReacted: false } : r))
              .filter((r) => r.count > 0);
          } else {
            newReactions = currentReactions.map((r) =>
              r.emoji === emoji ? { ...r, count: r.count + 1, userReacted: true } : r
            );
          }
        } else {
          newReactions = [
            ...currentReactions,
            { emoji, count: 1, users: [currentUser.name], userReacted: true },
          ];
        }

        return { ...m, reactions: newReactions };
      });
      return { ...prev, [activeContactId]: updated, [convKey]: updated };
    });
  };

  const handlePinMessage = (msgId: string) => {
    if (!activeContactId || !currentUser) return;
    const convKey = getConversationKey(currentUser.id, activeContactId);

    setMessagesMap((prev) => {
      const msgs = prev[convKey] || prev[activeContactId] || [];
      const updated = msgs.map((m) =>
        m.id === msgId ? { ...m, isPinned: !m.isPinned } : m
      );
      return { ...prev, [activeContactId]: updated, [convKey]: updated };
    });
  };

  const handleStarMessage = (msgId: string) => {
    if (!activeContactId || !currentUser) return;
    const convKey = getConversationKey(currentUser.id, activeContactId);

    setMessagesMap((prev) => {
      const msgs = prev[convKey] || prev[activeContactId] || [];
      const updated = msgs.map((m) =>
        m.id === msgId ? { ...m, isStarred: !m.isStarred } : m
      );
      return { ...prev, [activeContactId]: updated, [convKey]: updated };
    });
  };

  const handleDeleteMessage = (msgId: string) => {
    if (!activeContactId || !currentUser) return;
    const convKey = getConversationKey(currentUser.id, activeContactId);

    setMessagesMap((prev) => {
      const msgs = prev[convKey] || prev[activeContactId] || [];
      const updated = msgs.filter((m) => m.id !== msgId);
      return { ...prev, [activeContactId]: updated, [convKey]: updated };
    });
  };

  // Calls
  const handleStartCall = (type: 'audio' | 'video') => {
    if (!activeContact) return;
    sounds.playRing();
    setCallState({
      active: true,
      type,
      contact: activeContact,
      duration: 0,
      isMuted: false,
      isCameraOff: false,
      isScreenSharing: false,
    });
  };

  const handleEndCall = () => {
    setCallState((prev) => ({
      ...prev,
      active: false,
      type: null,
      contact: null,
    }));
  };

  // New Chat Creation
  const handleCreateGroup = (groupName: string, selectedContactIds: string[]) => {
    const newGroup: Contact = {
      id: 'group_' + Date.now(),
      name: groupName,
      avatar:
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=200&q=80',
      avatarBg: 'from-blue-600 to-indigo-600',
      status: 'online',
      customStatus: `${selectedContactIds.length + 1} members`,
      bio: 'Custom group chat',
      isGroup: true,
      groupMemberIds: [currentUser?.id || 'user_me', ...selectedContactIds],
      unreadCount: 0,
      lastMessage: 'Group created',
      lastMessageTime: 'Just now',
    };

    setContacts((prev) => [newGroup, ...prev]);
    setActiveContactId(newGroup.id);
  };

  const handleCreateAIBot = (botName: string, systemPrompt: string) => {
    const newBot: Contact = {
      id: 'ai_' + Date.now(),
      name: botName,
      avatar:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
      avatarBg: 'from-amber-500 to-orange-600',
      status: 'online',
      customStatus: '✨ Custom AI Companion',
      bio: systemPrompt,
      isAI: true,
      aiSystemPrompt: systemPrompt,
      unreadCount: 0,
      lastMessage: `Hello! I am ${botName}. How can I help you today?`,
      lastMessageTime: 'Just now',
    };

    setContacts((prev) => [newBot, ...prev]);
    setActiveContactId(newBot.id);
  };

  // Auth Success & Logout Handlers
  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    syncEngine.broadcast({ type: 'USER_REGISTERED', senderId: user.id });
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setIsAuthModalOpen(true);
  };

  // Default display current user
  const displayUser = currentUser || {
    name: 'Guest',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    status: 'offline' as const,
    customStatus: 'Not signed in',
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-100 dark:bg-zinc-950 font-sans antialiased text-zinc-900 dark:text-zinc-100">
      {/* Sidebar Navigation */}
      <div
        className={`${
          showMobileSidebar ? 'flex' : 'hidden'
        } sm:flex w-full sm:w-80 md:w-96 h-full flex-shrink-0 z-20`}
      >
        <Sidebar
          contacts={contacts}
          activeContactId={activeContactId}
          activeFilter={activeFilter}
          searchQuery={searchQuery}
          typingMap={typingMap}
          onSelectContact={handleSelectContact}
          onFilterChange={setActiveFilter}
          onSearchChange={setSearchQuery}
          onOpenNewChat={() => setIsNewChatOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={handleLogout}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          currentUser={displayUser}
        />
      </div>

      {/* Primary Chat Window Pane */}
      <div
        className={`${
          !showMobileSidebar ? 'flex' : 'hidden'
        } sm:flex flex-1 h-full overflow-hidden relative z-10`}
      >
        <ChatWindow
          contact={activeContact}
          messages={activeMessages}
          replyingTo={replyingTo}
          smartReplies={smartReplies}
          settings={settings}
          isTyping={activeContactId ? !!typingMap[activeContactId] : false}
          onSendMessage={handleSendMessage}
          onStartCall={handleStartCall}
          onToggleContactInfo={() => setIsContactInfoOpen(true)}
          onCancelReply={() => setReplyingTo(null)}
          onReplyToMessage={(msg) => setReplyingTo(msg)}
          onReactToMessage={handleReactToMessage}
          onPinMessage={handlePinMessage}
          onStarMessage={handleStarMessage}
          onDeleteMessage={handleDeleteMessage}
          onViewMedia={(url) => setMediaPreviewUrl(url)}
          onOpenDrawingModal={() => setIsDrawingModalOpen(true)}
          onBackToSidebar={() => setShowMobileSidebar(true)}
          onTyping={handleUserTyping}
        />
      </div>

      {/* Auth Modal (Login / Create Account) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          if (currentUser) setIsAuthModalOpen(false);
        }}
        onSuccess={handleAuthSuccess}
      />

      {/* Call Screen Modal */}
      <CallModal callState={callState} onEndCall={handleEndCall} />

      {/* Contact Info Sidebar Modal */}
      <ContactInfoModal
        isOpen={isContactInfoOpen}
        contact={activeContact}
        messages={activeMessages}
        onClose={() => setIsContactInfoOpen(false)}
        onStartCall={handleStartCall}
        onViewMedia={(url) => setMediaPreviewUrl(url)}
      />

      {/* New Conversation / AI Bot Modal */}
      <NewChatModal
        isOpen={isNewChatOpen}
        contacts={contacts}
        onClose={() => setIsNewChatOpen(false)}
        onSelectContact={handleSelectContact}
        onCreateGroup={handleCreateGroup}
        onCreateAIBot={handleCreateAIBot}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={(newSettings) =>
          setSettings((prev) => ({ ...prev, ...newSettings }))
        }
        onLogout={handleLogout}
        currentUser={currentUser || undefined}
      />

      {/* Sketching Canvas Modal */}
      <DrawingCanvasModal
        isOpen={isDrawingModalOpen}
        onClose={() => setIsDrawingModalOpen(false)}
        onSendDrawing={(url) => {
          handleSendMessage('', [
            {
              id: 'att_drawing_' + Date.now(),
              type: 'drawing',
              url,
              name: 'sketch_drawing.png',
            },
          ]);
        }}
      />

      {/* Fullscreen Media Viewer */}
      <MediaViewer
        url={mediaPreviewUrl}
        onClose={() => setMediaPreviewUrl(null)}
      />

      {/* Floating Incoming Message Toast Banner */}
      <AnimatePresence>
        {incomingNotification && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed top-4 right-4 sm:right-6 z-50 max-w-sm w-full bg-white dark:bg-zinc-900 border border-blue-500/30 dark:border-blue-500/40 shadow-2xl rounded-2xl p-3.5 flex items-start gap-3 backdrop-blur-xl"
          >
            <div className="relative flex-shrink-0">
              <img
                src={incomingNotification.senderAvatar}
                alt={incomingNotification.senderName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/40"
              />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-blue-600 rounded-full flex items-center justify-center text-white text-[8px] animate-pulse">
                <Bell className="w-2 h-2" />
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                  {incomingNotification.senderName}
                </h4>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/80 px-1.5 py-0.5 rounded-full flex-shrink-0">
                  New message
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 truncate mt-0.5">
                {incomingNotification.text}
              </p>
              <button
                onClick={() => {
                  handleSelectContact(incomingNotification.contactId);
                  setIncomingNotification(null);
                }}
                className="mt-2 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-2 flex items-center gap-1"
              >
                <span>Open Chat &rarr;</span>
              </button>
            </div>

            <button
              onClick={() => setIncomingNotification(null)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
