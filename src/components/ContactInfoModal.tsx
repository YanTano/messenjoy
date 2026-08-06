import React, { useState } from 'react';
import {
  X,
  Phone,
  Video,
  Bell,
  BellOff,
  Mail,
  UserCheck,
  Sparkles,
  Image as ImageIcon,
  FileText,
  Lock,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Contact, Message } from '../types';

interface ContactInfoModalProps {
  contact: Contact | null;
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
  onStartCall: (type: 'audio' | 'video') => void;
  onViewMedia: (url: string) => void;
  onDeleteContact?: (contactId: string) => void;
}

export const ContactInfoModal: React.FC<ContactInfoModalProps> = ({
  contact,
  messages = [],
  isOpen,
  onClose,
  onStartCall,
  onViewMedia,
  onDeleteContact,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  if (!isOpen || !contact) return null;

  const safeMessages = messages || [];

  // Extract shared images & files from conversation messages
  const mediaItems = safeMessages.flatMap((m) =>
    (m?.attachments || []).filter((a) => a.type === 'image' || a.type === 'drawing')
  );

  const fileItems = safeMessages.flatMap((m) =>
    (m?.attachments || []).filter((a) => a.type === 'file')
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs flex justify-end">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-sm h-full bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-y-auto"
        >
          {/* Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-10">
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              {contact.isGroup ? 'Group Information' : 'Contact Profile'}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contact Details Header */}
          <div className="p-6 flex flex-col items-center text-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30">
            <div className="relative">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500/20 shadow-lg"
              />
              <span
                className={`absolute bottom-1 right-1 w-5 h-5 rounded-full border-2 border-white dark:border-zinc-900 ${
                  contact.status === 'online'
                    ? 'bg-emerald-500'
                    : contact.status === 'away'
                    ? 'bg-amber-500'
                    : 'bg-zinc-400'
                }`}
              />
            </div>

            <h3 className="mt-3 text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <span>{contact.name}</span>
              {contact.isAI && (
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
              )}
            </h3>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {contact.customStatus || (contact.status === 'online' ? 'Online' : 'Offline')}
            </p>

            {/* Quick Actions */}
            <div className="flex items-center gap-4 mt-5">
              <button
                onClick={() => onStartCall('audio')}
                className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex flex-col items-center gap-1 text-xs font-medium"
              >
                <Phone className="w-5 h-5" />
                <span>Audio</span>
              </button>

              <button
                onClick={() => onStartCall('video')}
                className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors flex flex-col items-center gap-1 text-xs font-medium"
              >
                <Video className="w-5 h-5" />
                <span>Video</span>
              </button>
            </div>
          </div>

          {/* Profile Details List */}
          <div className="p-5 space-y-5 border-b border-zinc-200 dark:border-zinc-800">
            {contact.bio && (
              <div>
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">
                  About
                </span>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {contact.bio}
                </p>
              </div>
            )}

            {contact.email && (
              <div className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                <Mail className="w-4 h-4 text-zinc-400" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Lock className="w-4 h-4 text-emerald-500" />
              <span>End-to-end encrypted chat</span>
            </div>
          </div>

          {/* Shared Media Section */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <span>Shared Media ({mediaItems.length})</span>
              </span>
            </div>

            {mediaItems.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {mediaItems.slice(0, 6).map((att) => (
                  <div
                    key={att.id}
                    onClick={() => onViewMedia(att.url)}
                    className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-zinc-200 dark:border-zinc-800"
                  >
                    <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic">No shared photos yet.</p>
            )}
          </div>

          {/* Shared Files Section */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Shared Documents ({fileItems.length})</span>
            </span>

            {fileItems.length > 0 ? (
              <div className="space-y-2">
                {fileItems.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/50 text-xs text-zinc-700 dark:text-zinc-300"
                  >
                    <FileText className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="truncate flex-1 font-medium">{att.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-400 italic">No shared documents yet.</p>
            )}
          </div>
          
          {/* Delete Contact Section */}
          {!contact.isAI && onDeleteContact && (
            <div className="p-5">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Contact / User</span>
                </button>
              ) : (
                <div className="p-3.5 bg-red-100/80 dark:bg-red-950/80 border border-red-300 dark:border-red-800 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-xs font-bold">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>Delete {contact.name}?</span>
                  </div>
                  <p className="text-[11px] text-red-600 dark:text-red-300 leading-snug">
                    This will remove this user and delete their user profile/messages from Firestore.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-1.5 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onDeleteContact(contact.id);
                      }}
                      className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
