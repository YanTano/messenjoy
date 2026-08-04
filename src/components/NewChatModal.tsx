import React, { useState } from 'react';
import { X, UserPlus, Users, Sparkles, Check, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { Contact } from '../types';

interface NewChatModalProps {
  isOpen: boolean;
  contacts: Contact[];
  onClose: () => void;
  onSelectContact: (contactId: string) => void;
  onCreateGroup: (groupName: string, selectedContactIds: string[]) => void;
  onCreateAIBot: (botName: string, systemPrompt: string) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  contacts,
  onClose,
  onSelectContact,
  onCreateGroup,
  onCreateAIBot,
}) => {
  const [activeTab, setActiveTab] = useState<'dm' | 'group' | 'ai'>('dm');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Group creation state
  const [groupName, setGroupName] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);

  // AI creation state
  const [aiBotName, setAiBotName] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');

  if (!isOpen) return null;

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelectForGroup = (id: string) => {
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter((item) => item !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  const handleGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedContactIds.length === 0) return;
    onCreateGroup(groupName.trim(), selectedContactIds);
    onClose();
  };

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiBotName.trim()) return;
    onCreateAIBot(
      aiBotName.trim(),
      aiPrompt.trim() || `You are ${aiBotName.trim()}, a helpful companion in Messenger.`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">New Conversation</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 p-1">
          <button
            onClick={() => setActiveTab('dm')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'dm'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Direct</span>
          </button>

          <button
            onClick={() => setActiveTab('group')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'group'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>New Group</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'ai'
                ? 'bg-white dark:bg-zinc-800 text-amber-500 shadow-2xs'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Bot</span>
          </button>
        </div>

        {/* Tab 1: Direct Message List */}
        {activeTab === 'dm' && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div className="space-y-1 mt-2">
              {filteredContacts.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectContact(c.id);
                    onClose();
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors"
                >
                  <img src={c.avatar} alt={c.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">{c.name}</h4>
                    <p className="text-xs text-zinc-500 truncate">{c.bio || c.customStatus || 'Available'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Create Group */}
        {activeTab === 'group' && (
          <form onSubmit={handleGroupSubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                Group Name
              </label>
              <input
                type="text"
                placeholder="e.g. Weekend Warriors 🚀"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                Select Members ({selectedContactIds.length})
              </label>
              <div className="space-y-1 max-h-48 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-xl p-2">
                {contacts
                  .filter((c) => !c.isGroup)
                  .map((c) => {
                    const isSelected = selectedContactIds.includes(c.id);
                    return (
                      <div
                        key={c.id}
                        onClick={() => toggleSelectForGroup(c.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover" />
                          <span className="text-sm font-medium">{c.name}</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-zinc-300 dark:border-zinc-700'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <button
              type="submit"
              disabled={!groupName.trim() || selectedContactIds.length === 0}
              className="mt-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
            >
              Create Group Chat
            </button>
          </form>
        )}

        {/* Tab 3: Create Custom AI Bot */}
        {activeTab === 'ai' && (
          <form onSubmit={handleAISubmit} className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                AI Companion Name
              </label>
              <input
                type="text"
                placeholder="e.g. Fitness Coach, Recipe Chef, Code Reviewer"
                value={aiBotName}
                onChange={(e) => setAiBotName(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">
                Custom System Persona (Prompt)
              </label>
              <textarea
                placeholder="e.g. You are an expert personal trainer. Give concise, encouraging workout tips and nutrition guidance."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-zinc-900 dark:text-zinc-100 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!aiBotName.trim()}
              className="mt-2 w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch AI Assistant</span>
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
