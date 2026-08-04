export type UserStatus = 'online' | 'offline' | 'away' | 'busy';

export interface Attachment {
  id: string;
  type: 'image' | 'audio' | 'file' | 'drawing';
  url: string;
  name: string;
  size?: string;
  mimeType?: string;
}

export interface Reaction {
  emoji: string;
  count: number;
  users: string[]; // user names or IDs
  userReacted?: boolean;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string; // ISO or formatted
  isUser: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyToId?: string;
  replyToText?: string;
  replyToSender?: string;
  attachments?: Attachment[];
  reactions?: Reaction[];
  isEdited?: boolean;
  isPinned?: boolean;
  isStarred?: boolean;
  voiceNoteUrl?: string;
  voiceNoteDuration?: number;
}

export interface Contact {
  id: string;
  name: string;
  avatar?: string;
  avatarBg?: string;
  status: UserStatus;
  customStatus?: string;
  bio?: string;
  isAI?: boolean;
  aiSystemPrompt?: string;
  isGroup?: boolean;
  groupMemberIds?: string[];
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  isPinned?: boolean;
  phoneNumber?: string;
  email?: string;
}

export type ChatFilter = 'all' | 'unread' | 'direct' | 'groups' | 'ai';

export interface CallState {
  active: boolean;
  type: 'audio' | 'video' | null;
  contact: Contact | null;
  duration: number;
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
  isIncoming?: boolean;
}

export interface ThemeSettings {
  mode: 'light' | 'dark';
  wallpaper: 'default' | 'doodles' | 'sunset' | 'gradient' | 'minimal';
  soundEnabled: boolean;
  smartRepliesEnabled: boolean;
  enterToSend: boolean;
}
