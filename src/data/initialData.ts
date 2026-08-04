import { Contact, Message } from '../types';
import { UserAccount } from '../utils/auth';

export const AI_CONTACTS: Contact[] = [
  {
    id: 'ai_gemini',
    name: 'Gemini Assistant',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
    avatarBg: 'from-blue-600 to-indigo-600',
    status: 'online',
    customStatus: '✨ Always here to help',
    bio: 'Your smart AI companion powered by Gemini. Ask me anything, generate ideas, summaries, or draft messages!',
    isAI: true,
    aiSystemPrompt: 'You are Gemini Assistant in a messenger app. Be warm, concise, helpful, friendly, and structure responses with clear formatting when appropriate.',
    unreadCount: 1,
    lastMessage: 'Hello! I am ready to assist you with research, ideas, or quick replies.',
    lastMessageTime: '10:42 AM',
    isPinned: true,
    email: 'gemini.bot@ai.studio',
  },
  {
    id: 'ai_translator',
    name: 'Polyglot Tutor',
    avatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=200&q=80',
    avatarBg: 'from-emerald-600 to-teal-600',
    status: 'online',
    customStatus: '🌍 Multilingual Coach',
    bio: 'I can translate any message, practice foreign languages with you, or correct grammar.',
    isAI: true,
    aiSystemPrompt: 'You are Polyglot Tutor. Help the user learn languages, translate text, and practice conversation naturally with fun corrections.',
    unreadCount: 0,
    lastMessage: 'Hola! ¿Cómo estás hoy? Ready to practice Spanish or French?',
    lastMessageTime: 'Yesterday',
    isPinned: false,
    email: 'polyglot@ai.studio',
  },
];

export function accountToContact(acc: UserAccount): Contact {
  return {
    id: acc.id,
    name: acc.name,
    avatar: acc.avatar,
    status: acc.status || 'online',
    customStatus: acc.customStatus || 'Available',
    bio: acc.bio || '',
    unreadCount: 0,
    lastMessage: 'No messages yet',
    lastMessageTime: '',
    email: acc.email,
    phoneNumber: acc.phoneNumber,
  };
}

export const INITIAL_MESSAGES: Record<string, Message[]> = {
  ai_gemini: [
    {
      id: 'm_gemini_1',
      chatId: 'ai_gemini',
      senderId: 'ai_gemini',
      senderName: 'Gemini Assistant',
      senderAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&q=80',
      text: 'Hello! 👋 I am your built-in AI assistant. You can ask me to draft messages, summarize discussions, answer questions, or generate smart ideas right here inside Messenger.',
      timestamp: '10:40 AM',
      isUser: false,
      status: 'read',
    },
  ],
  ai_translator: [
    {
      id: 'm_trans_1',
      chatId: 'ai_translator',
      senderId: 'ai_translator',
      senderName: 'Polyglot Tutor',
      senderAvatar: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=200&q=80',
      text: 'Hola! I am your Polyglot Tutor. What language would you like to practice today?',
      timestamp: '09:00 AM',
      isUser: false,
      status: 'read',
    },
  ],
};
