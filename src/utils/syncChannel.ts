import { Message, Contact } from '../types';

export type SyncEventType =
  | 'NEW_MESSAGE'
  | 'TYPING'
  | 'USER_REGISTERED'
  | 'MESSAGES_UPDATED'
  | 'CLEAR_UNREAD';

export interface SyncMessagePayload {
  type: SyncEventType;
  senderId?: string;
  recipientId?: string;
  chatId?: string;
  message?: Message;
  isTyping?: boolean;
  contact?: Contact;
  timestamp?: number;
}

const CHANNEL_NAME = 'messenger_cross_tab_sync_v2';

class SyncEngine {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(payload: SyncMessagePayload) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (event) => {
          this.notifyListeners(event.data);
        };
      } catch (e) {
        console.error('BroadcastChannel initialization failed', e);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'messenger_sync_event' && e.newValue) {
          try {
            const payload = JSON.parse(e.newValue);
            this.notifyListeners(payload);
          } catch (err) {
            /* ignore */
          }
        }
      });
    }
  }

  public subscribe(listener: (payload: SyncMessagePayload) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public broadcast(payload: SyncMessagePayload) {
    const fullPayload = { ...payload, timestamp: Date.now() };

    // Broadcast via BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(fullPayload);
      } catch (e) {
        console.error('Error posting BroadcastChannel message', e);
      }
    }

    // Fallback/additional via localStorage storage event
    try {
      localStorage.setItem('messenger_sync_event', JSON.stringify(fullPayload));
    } catch (e) {
      /* ignore */
    }
  }

  private notifyListeners(payload: SyncMessagePayload) {
    this.listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (e) {
        console.error('Error in sync listener', e);
      }
    });
  }
}

export const syncEngine = new SyncEngine();
