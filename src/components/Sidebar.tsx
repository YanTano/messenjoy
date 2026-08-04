import React, { useState } from 'react';
import {
  MessageSquare,
  Users,
  Sparkles,
  Settings,
  Search,
  Plus,
  Pin,
  Bot,
  UserCheck,
  CheckCheck,
  LogOut,
  UserPlus,
} from 'lucide-react';
import { SmileyMessageLogo } from './SmileyMessageLogo';
import { Contact, ChatFilter, UserStatus } from '../types';

interface SidebarProps {
  contacts: Contact[];
  activeContactId: string | null;
  activeFilter: ChatFilter;
  searchQuery: string;
  typingMap?: Record<string, boolean>;
  onSelectContact: (id: string) => void;
  onFilterChange: (filter: ChatFilter) => void;
  onSearchChange: (query: string) => void;
  onOpenNewChat: () => void;
  onOpenSettings: () => void;
  onLogout?: () => void;
  onOpenAuthModal?: () => void;
  currentUser: {
    name: string;
    avatar: string;
    status: UserStatus;
    customStatus?: string;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  contacts,
  activeContactId,
  activeFilter,
  searchQuery,
  typingMap = {},
  onSelectContact,
  onFilterChange,
  onSearchChange,
  onOpenNewChat,
  onOpenSettings,
  onLogout,
  onOpenAuthModal,
  currentUser,
}) => {
  const [currentNav, setCurrentNav] = useState<'chats' | 'ai' | 'groups'>('chats');

  // Filter contacts based on filter pill & search query
  const filteredContacts = contacts.filter((c) => {
    // Nav tab filter
    if (currentNav === 'ai' && !c.isAI) return false;
    if (currentNav === 'groups' && !c.isGroup) return false;

    // Filter pill filter
    if (activeFilter === 'unread' && c.unreadCount === 0) return false;
    if (activeFilter === 'direct' && (c.isGroup || c.isAI)) return false;
    if (activeFilter === 'groups' && !c.isGroup) return false;
    if (activeFilter === 'ai' && !c.isAI) return false;

    // Text search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = c.name.toLowerCase().includes(q);
      const msgMatch = c.lastMessage?.toLowerCase().includes(q);
      return nameMatch || msgMatch;
    }

    return true;
  });

  const pinnedContacts = filteredContacts.filter((c) => c.isPinned);
  const otherContacts = filteredContacts.filter((c) => !c.isPinned);

  return (
    <div className="w-full sm:w-80 md:w-96 h-full bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-800/80 flex flex-col select-none flex-shrink-0">
      {/* Top Brand & Navigation Header */}
      <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <SmileyMessageLogo className="w-5.5 h-5.5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-base text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
              Messenjoy
            </h1>
            <span className="text-[11px] text-zinc-500 font-medium">Real-time & AI</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onOpenNewChat}
            className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors"
            title="New Conversation"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Primary Category Switcher Tabs */}
      <div className="flex items-center px-3 pt-3 bg-white dark:bg-zinc-900 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <button
          onClick={() => setCurrentNav('chats')}
          className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            currentNav === 'chats'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chats</span>
        </button>

        <button
          onClick={() => setCurrentNav('groups')}
          className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            currentNav === 'groups'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Groups</span>
        </button>

        <button
          onClick={() => setCurrentNav('ai')}
          className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            currentNav === 'ai'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>AI Bots</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-950">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search chats, contacts, messages..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 shadow-2xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-1 scrollbar-none">
          {(['all', 'unread', 'direct', 'groups', 'ai'] as ChatFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => onFilterChange(f)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium capitalize transition-colors flex-shrink-0 ${
                activeFilter === f
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold'
                  : 'bg-zinc-200/70 dark:bg-zinc-800/70 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Contact Feed List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-1 py-1">
        {/* Pinned Contacts */}
        {pinnedContacts.length > 0 && (
          <div className="mb-2">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 mb-1 block flex items-center gap-1">
              <Pin className="w-3 h-3 text-blue-500" /> Pinned
            </span>
            {pinnedContacts.map((contact) => renderContactRow(contact))}
          </div>
        )}

        {/* Other Contacts */}
        {otherContacts.length > 0 ? (
          <div>
            {pinnedContacts.length > 0 && (
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 mb-1 block">
                All Conversations
              </span>
            )}
            {otherContacts.map((contact) => renderContactRow(contact))}
          </div>
        ) : (
          filteredContacts.length === 0 && (
            <div className="p-8 text-center text-zinc-400 text-xs">
              No conversations found.
            </div>
          )
        )}
      </div>

      {/* Bottom Current User Profile Strip */}
      <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex-shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500/30"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white dark:border-zinc-900" />
          </div>
          <div className="min-w-0">
            <h4 className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 truncate">
              {currentUser.name}
            </h4>
            <p className="text-[10px] text-zinc-500 truncate">
              {currentUser.customStatus || 'Online'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {onOpenAuthModal && (
            <button
              onClick={onOpenAuthModal}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Switch or Register Account"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  function renderContactRow(contact: Contact) {
    const isActive = activeContactId === contact.id;
    const isContactTyping = !!typingMap[contact.id];

    return (
      <div
        key={contact.id}
        onClick={() => onSelectContact(contact.id)}
        className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
          isActive
            ? 'bg-blue-600 text-white shadow-sm'
            : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 text-zinc-900 dark:text-zinc-100'
        }`}
      >
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={contact.avatar}
            alt={contact.name}
            className={`w-11 h-11 rounded-full object-cover transition-all ${
              isActive ? 'ring-2 ring-white/40' : ''
            } ${isContactTyping ? 'animate-pulse ring-2 ring-blue-400' : ''}`}
          />
          {contact.status && (
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 ${
                isActive ? 'border-blue-600' : 'border-white dark:border-zinc-950'
              } ${
                isContactTyping
                  ? 'bg-blue-500 animate-ping'
                  : contact.status === 'online'
                  ? 'bg-emerald-500'
                  : contact.status === 'away'
                  ? 'bg-amber-500'
                  : 'bg-zinc-400'
              }`}
            />
          )}
        </div>

        {/* Text Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h3
              className={`font-semibold text-xs truncate flex items-center gap-1 ${
                isActive ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'
              }`}
            >
              <span>{contact.name}</span>
              {contact.isAI && <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" />}
            </h3>
            {contact.lastMessageTime && (
              <span
                className={`text-[10px] ${
                  isActive ? 'text-blue-100' : 'text-zinc-400'
                }`}
              >
                {contact.lastMessageTime}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            {isContactTyping ? (
              <p
                className={`text-xs font-medium truncate flex items-center gap-1.5 animate-pulse ${
                  isActive ? 'text-blue-100 font-bold' : 'text-blue-600 dark:text-blue-400 font-semibold'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce inline-block" />
                <span>typing...</span>
              </p>
            ) : (
              <p
                className={`text-xs truncate max-w-[180px] ${
                  isActive ? 'text-blue-100' : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                {contact.lastMessage || contact.customStatus || 'No messages yet'}
              </p>
            )}

            {/* Unread badge */}
            {contact.unreadCount > 0 && !isContactTyping && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-600 text-white shadow-xs'
                }`}
              >
                {contact.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
};
