import React, { useState } from 'react';
import { X, Moon, Sun, Volume2, VolumeX, Sparkles, Image, CornerDownLeft, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { ThemeSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  settings: ThemeSettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<ThemeSettings>) => void;
  onLogout?: () => void;
  onDeleteAccount?: () => void;
  currentUser?: {
    name: string;
    email?: string;
    avatar: string;
  };
}

const WALLPAPERS: { id: ThemeSettings['wallpaper']; name: string; class: string }[] = [
  { id: 'default', name: 'Clean Neutral', class: 'bg-zinc-50 dark:bg-zinc-950' },
  { id: 'doodles', name: 'Chat Doodles', class: 'bg-indigo-50/50 dark:bg-zinc-900' },
  { id: 'sunset', name: 'Warm Sunset', class: 'bg-gradient-to-br from-amber-50/50 to-rose-50/50 dark:from-zinc-950 dark:to-zinc-900' },
  { id: 'gradient', name: 'Cool Gradient', class: 'bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-zinc-950 dark:to-slate-900' },
  { id: 'minimal', name: 'Pure Minimal', class: 'bg-white dark:bg-black' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
  onLogout,
  onDeleteAccount,
  currentUser,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-md overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">
            Messenjoy Preferences
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Active User Account Info */}
          {currentUser && (
            <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200/80 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
                />
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {currentUser.name}
                  </h4>
                  {currentUser.email && (
                    <p className="text-xs text-zinc-500">{currentUser.email}</p>
                  )}
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                   className="px-3 py-1.5 bg-zinc-200/70 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
               )}
              </div>

              {/* Delete Account button & inline confirmation */}
              {onDeleteAccount && (
                <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800">
                  {!showConfirmDelete ? (
                    <button
                      onClick={() => setShowConfirmDelete(true)}
                      className="w-full py-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete My Account</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-red-100/80 dark:bg-red-950/80 border border-red-300 dark:border-red-800 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-xs font-bold">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>Permanently Delete Account?</span>
                      </div>
                      <p className="text-[11px] text-red-600 dark:text-red-300 leading-snug">
                        This will delete your user profile and remove your data from Firestore.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => setShowConfirmDelete(false)}
                          className="flex-1 py-1.5 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            onClose();
                            onDeleteAccount();
                          }}
                          className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {/* Theme Mode */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Appearance Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onUpdateSettings({ mode: 'light' })}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  settings.mode === 'light'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ mode: 'dark' })}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  settings.mode === 'dark'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Dark</span>
              </button>
            </div>
          </div>

          {/* Wallpaper Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Image className="w-4 h-4 text-blue-500" />
              <span>Chat Wallpaper</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {WALLPAPERS.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => onUpdateSettings({ wallpaper: wp.id })}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    settings.wallpaper === wp.id
                      ? 'border-blue-600 ring-2 ring-blue-500/20 font-semibold text-blue-600 dark:text-blue-400'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                  }`}
                >
                  <div className={`w-full h-8 rounded-lg mb-1.5 border border-black/5 ${wp.class}`} />
                  <span className="text-xs truncate block">{wp.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            {/* Audio Effects */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-blue-500" />
                ) : (
                  <VolumeX className="w-5 h-5 text-zinc-400" />
                )}
                <div>
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Sound Effects
                  </h4>
                  <p className="text-xs text-zinc-500">Audio chimes for sent & received messages</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Smart Replies */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <div>
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    AI Smart Replies
                  </h4>
                  <p className="text-xs text-zinc-500">Suggest quick contextual response pills</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.smartRepliesEnabled}
                onChange={(e) => onUpdateSettings({ smartRepliesEnabled: e.target.checked })}
                className="w-5 h-5 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Enter to send */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CornerDownLeft className="w-5 h-5 text-emerald-500" />
                <div>
                  <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Press Enter to Send
                  </h4>
                  <p className="text-xs text-zinc-500">Use Shift+Enter for line breaks</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.enterToSend}
                onChange={(e) => onUpdateSettings({ enterToSend: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
