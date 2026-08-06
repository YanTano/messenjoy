import { UserStatus } from '../types';
import { syncUserToFirestore } from './firestoreService';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  status: UserStatus;
  customStatus?: string;
  bio?: string;
  phoneNumber?: string;
  createdAt: string;
}

export const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80', // Alex style
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80', // Taylor style
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', // Woman 1
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', // Man 1
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80', // Woman 2
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', // Man 2
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80', // Woman 3
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80', // Man 3
];

export const SEED_ACCOUNTS: UserAccount[] = [];

const STORAGE_KEY_ACCOUNTS = 'messenger_registered_accounts_v2';
const STORAGE_KEY_SESSION = 'messenger_active_session_v2';

export function getRegisteredAccounts(): UserAccount[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ACCOUNTS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((a) => a.id !== 'user_alex' && a.id !== 'user_taylor');
      }
    }
  } catch (e) {
    console.error('Error loading registered accounts', e);
  }
  return [];
}

export function saveRegisteredAccounts(accounts: UserAccount[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
  } catch (e) {
    console.error('Error saving registered accounts', e);
  }
}

export function getCurrentSessionUser(): UserAccount | null {
  try {
    const userId = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!userId || userId === 'user_alex' || userId === 'user_taylor') {
      return null;
    }
    const accounts = getRegisteredAccounts();
    const user = accounts.find((a) => a.id === userId);
    if (user) return user;
  } catch (e) {
    console.error('Error getting session user', e);
  }
  return null;
}

export function setCurrentSessionUser(userId: string | null): void {
  if (userId) {
    localStorage.setItem(STORAGE_KEY_SESSION, userId);
  } else {
    localStorage.removeItem(STORAGE_KEY_SESSION);
  }
}

export function registerUser(data: {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  bio?: string;
  customStatus?: string;
}): { success: boolean; user?: UserAccount; error?: string } {
  const accounts = getRegisteredAccounts();
  const normalizedEmail = data.email.trim().toLowerCase();

  const existing = accounts.find((a) => a.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  const newUser: UserAccount = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: data.name.trim(),
    email: normalizedEmail,
    password: data.password || 'password123',
    avatar:
      data.avatar ||
      PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
    status: 'online',
    customStatus: data.customStatus?.trim() || '👋 Hey there! I am on Messenger.',
    bio: data.bio?.trim() || 'Newly registered user.',
    createdAt: new Date().toISOString(),
  };

  const updated = [...accounts, newUser];
  saveRegisteredAccounts(updated);
  setCurrentSessionUser(newUser.id);
  syncUserToFirestore(newUser);

  return { success: true, user: newUser };
}

export function loginUser(
  email: string,
  password?: string
): { success: boolean; user?: UserAccount; error?: string } {
  const accounts = getRegisteredAccounts();
  const normalizedEmail = email.trim().toLowerCase();

  const user = accounts.find((a) => a.email.toLowerCase() === normalizedEmail);
  if (!user) {
    return { success: false, error: 'No user account found with that email.' };
  }

  if (password && user.password && user.password !== password) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  setCurrentSessionUser(user.id);
  syncUserToFirestore(user);
  return { success: true, user };
}

export function logoutUser(): void {
  setCurrentSessionUser(null);
}

export function deleteUserAccount(userId: string): void {
  const accounts = getRegisteredAccounts();
  const updated = accounts.filter((a) => a.id !== userId);
  saveRegisteredAccounts(updated);
  if (getCurrentSessionUser()?.id === userId) {
    setCurrentSessionUser(null);
  }
}
