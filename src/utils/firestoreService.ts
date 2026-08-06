import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserAccount, saveRegisteredAccounts } from './auth';
import { Message } from '../types';

/**
 * 1. Sync User Account Profile to Firestore Cloud DB
 */
export async function syncUserToFirestore(user: UserAccount) {
  if (!user || !user.id) return;
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(
      userRef,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        status: user.status || 'online',
        customStatus: user.customStatus || '',
        bio: user.bio || '',
        updatedAt: new Date().toISOString(),
        createdAt: user.createdAt || new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (e) {
    console.error('Error syncing user to Firestore:', e);
  }
}
/**
 * Delete User Account from Firestore Cloud DB
 */
export async function deleteUserFromFirestore(userId: string) {
  if (!userId) return;
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  } catch (e) {
    console.error('Error deleting user from Firestore:', e);
  }
}

/**
 * 2. Subscribe to Real-Time Users list from Firestore across all browsers/devices
 */
export function subscribeToFirestoreUsers(onUsersUpdated: (users: UserAccount[]) => void) {
  try {
    const usersCol = collection(db, 'users');
    return onSnapshot(
      usersCol,
      (snapshot) => {
        const firestoreUsers: UserAccount[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.id && data.name) {
            firestoreUsers.push({
              id: data.id,
              name: data.name,
              email: data.email || '',
              avatar: data.avatar || '',
              status: data.status || 'online',
              customStatus: data.customStatus || '',
              bio: data.bio || '',
              createdAt: data.createdAt || new Date().toISOString(),
            });
          }
        });

        // Save current active list from Firestore into local accounts
        // This ensures deleted users in Firestore are removed locally as well
        saveRegisteredAccounts(firestoreUsers);
        onUsersUpdated(firestoreUsers);

      },
      (error) => {
        console.error('Firestore users snapshot error:', error);
      }
    );
  } catch (e) {
    console.error('Error setting up Firestore users listener:', e);
    return () => {};
  }
}

/**
 * 3. Sync Message to Firestore Cloud DB
 */
export async function syncMessageToFirestore(message: Message) {
  if (!message || !message.id) return;
  try {
    const msgRef = doc(db, 'messages', message.id);
    await setDoc(
      msgRef,
      {
        id: message.id,
        chatId: message.chatId,
        senderId: message.senderId || '',
        senderName: message.senderName || '',
        senderAvatar: message.senderAvatar || '',
        text: message.text || '',
        timestamp: message.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: message.createdAt || Date.now(),
        isUser: message.isUser ?? false,
        attachments: message.attachments || [],
        voiceNoteUrl: message.voiceNoteUrl || null,
        replyToText: message.replyToText || null,
        replyToSender: message.replyToSender || null,
        reactions: message.reactions || [],
      },
      { merge: true }
    );
  } catch (e) {
    console.error('Error syncing message to Firestore:', e);
  }
}

/**
 * Delete Message from Firestore Cloud DB
 */
export async function deleteMessageFromFirestore(messageId: string) {
  if (!messageId) return;
  try {
    const msgRef = doc(db, 'messages', messageId);
    await deleteDoc(msgRef);
  } catch (e) {
    console.error('Error deleting message from Firestore:', e);
  }
}

/**
 * 4. Subscribe to Real-Time Messages from Firestore across all browsers/devices
 */
export function subscribeToFirestoreMessages(onMessagesUpdated: (messages: Message[]) => void) {
  try {
    const msgsCol = collection(db, 'messages');
    return onSnapshot(
      msgsCol,
      (snapshot) => {
        const messagesList: Message[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.id && data.chatId) {
            messagesList.push({
              id: data.id,
              chatId: data.chatId,
              senderId: data.senderId,
              senderName: data.senderName,
              senderAvatar: data.senderAvatar,
              text: data.text,
              timestamp: data.timestamp,
              createdAt: data.createdAt,
              isUser: data.isUser,
              status: data.status || 'sent',
              attachments: data.attachments,
              voiceNoteUrl: data.voiceNoteUrl,
              replyToText: data.replyToText,
              replyToSender: data.replyToSender,
              reactions: data.reactions,
            });
          }
        });
        // Always emit current snapshot (including empty array if all messages are deleted)
          onMessagesUpdated(messagesList);
      },
      (error) => {
        console.error('Firestore messages snapshot error:', error);
      }
    );
  } catch (e) {
    console.error('Error setting up Firestore messages listener:', e);
    return () => {};
  }
}

