import React, { useRef, useEffect, useState } from 'react';
import {
  Phone,
  Video,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Send,
  X,
  Pin,
  Sparkles,
  Palette,
  Image as ImageIcon,
  FileText,
  StopCircle,
  ArrowLeft,
  Volume2,
} from 'lucide-react';
import { SmileyMessageLogo } from './SmileyMessageLogo';
import { motion, AnimatePresence } from 'motion/react';
import { Contact, Message, ThemeSettings } from '../types';
import { MessageItem } from './MessageItem';

interface ChatWindowProps {
  contact: Contact | null;
  messages: Message[];
  replyingTo: Message | null;
  smartReplies: string[];
  settings: ThemeSettings;
  isTyping: boolean;
  onSendMessage: (text: string, attachments?: any[], voiceNoteUrl?: string, voiceDuration?: number) => void;
  onStartCall: (type: 'audio' | 'video') => void;
  onToggleContactInfo: () => void;
  onCancelReply: () => void;
  onReplyToMessage: (msg: Message) => void;
  onReactToMessage: (msgId: string, emoji: string) => void;
  onPinMessage: (msgId: string) => void;
  onStarMessage: (msgId: string) => void;
  onDeleteMessage: (msgId: string) => void;
  onViewMedia: (url: string) => void;
  onOpenDrawingModal: () => void;
  onBackToSidebar?: () => void;
  onTyping?: (isTyping: boolean) => void;
}

const EMOJI_LIST = ['😀', '😂', '😍', '👍', '🔥', '🎉', '❤️', '🙌', '🚀', '💯', '✨', '😎', '🙏', '👀', '💡'];

export const ChatWindow: React.FC<ChatWindowProps> = ({
  contact,
  messages,
  replyingTo,
  smartReplies,
  settings,
  isTyping,
  onSendMessage,
  onStartCall,
  onToggleContactInfo,
  onCancelReply,
  onReplyToMessage,
  onReactToMessage,
  onPinMessage,
  onStarMessage,
  onDeleteMessage,
  onViewMedia,
  onOpenDrawingModal,
  onBackToSidebar,
  onTyping,
}) => {
  const [inputText, setInputText] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const timerRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);

    if (onTyping) {
      if (val.trim().length > 0) {
        onTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          onTyping(false);
        }, 1500);
      } else {
        onTyping(false);
      }
    }
  };

  // Auto scroll to bottom when messages update or typing indicator shows
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Voice recording timer
  useEffect(() => {
    if (isRecordingVoice) {
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecordingVoice]);

  if (!contact) {
    return (
      <div className="flex-1 h-full bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-8 text-center select-none">
        <div className="w-20 h-20 rounded-3xl bg-blue-500/10 dark:bg-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 shadow-lg shadow-blue-500/10 border border-blue-500/20">
          <SmileyMessageLogo className="w-10 h-10 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">Welcome to Messenjoy</h2>
        <p className="text-sm text-zinc-500 max-w-xs mt-1">
          Select a chat or start a new conversation with friends or AI companions.
        </p>
      </div>
    );
  }

  const pinnedMessage = messages.find((m) => m.isPinned);

  const handleSend = () => {
    if (!inputText.trim()) return;
    if (onTyping) onTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    onSendMessage(inputText.trim());
    setInputText('');
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && settings.enterToSend) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStopAndSendVoiceNote = () => {
    setIsRecordingVoice(false);
    const duration = Math.max(1, recordingSeconds);
    // Send simulated voice note url
    onSendMessage('', [], 'voice_note_simulated', duration);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const isImg = file.type.startsWith('image/');
      onSendMessage(
        isImg ? '' : `Shared file: ${file.name}`,
        [
          {
            id: 'file_' + Date.now(),
            type: isImg ? 'image' : 'file',
            url: isImg ? result : '',
            name: file.name,
            size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          },
        ]
      );
    };
    reader.readAsDataURL(file);
    setShowAttachMenu(false);
  };

  return (
    <div className="flex-1 h-full bg-white dark:bg-zinc-900 flex flex-col min-w-0 select-none overflow-hidden relative">
      {/* Top Header */}
      <div className="px-4 py-3 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button for mobile */}
          {onBackToSidebar && (
            <button
              onClick={onBackToSidebar}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 sm:hidden"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div
            onClick={onToggleContactInfo}
            className="flex items-center gap-3 cursor-pointer group min-w-0"
          >
            <div className="relative flex-shrink-0">
              <img
                src={contact.avatar}
                alt={contact.name}
                className={`w-10 h-10 rounded-full object-cover transition-all ${
                  isTyping
                    ? 'ring-2 ring-blue-500 dark:ring-blue-400 animate-pulse scale-105'
                    : 'ring-2 ring-blue-500/20 group-hover:scale-105'
                }`}
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-zinc-900 ${
                  isTyping
                    ? 'bg-blue-500 animate-ping'
                    : contact.status === 'online'
                    ? 'bg-emerald-500'
                    : contact.status === 'away'
                    ? 'bg-amber-500'
                    : 'bg-zinc-400'
                }`}
              />
            </div>

            <div className="min-w-0">
              <h2 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
                <span>{contact.name}</span>
                {contact.isAI && <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
              </h2>
              {isTyping ? (
                <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 font-semibold animate-pulse">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <span>typing...</span>
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                  {contact.customStatus || (contact.status === 'online' ? 'Active now' : 'Offline')}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300">
          <button
            onClick={() => onStartCall('audio')}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-blue-600 dark:text-blue-400"
            title="Start Audio Call"
          >
            <Phone className="w-5 h-5" />
          </button>

          <button
            onClick={() => onStartCall('video')}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-purple-600 dark:text-purple-400"
            title="Start Video Call"
          >
            <Video className="w-5 h-5" />
          </button>

          <button
            onClick={onToggleContactInfo}
            className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Contact Info"
          >
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pinned Message Banner */}
      {pinnedMessage && (
        <div className="px-4 py-2 bg-blue-50/90 dark:bg-blue-950/50 border-b border-blue-100 dark:border-blue-900/50 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200 z-10">
          <div className="flex items-center gap-2 truncate">
            <Pin className="w-3.5 h-3.5 text-blue-600 fill-blue-600 flex-shrink-0" />
            <span className="font-semibold">{pinnedMessage.senderName}:</span>
            <span className="truncate opacity-90">{pinnedMessage.text}</span>
          </div>
        </div>
      )}

      {/* Messages Feed Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-zinc-50/50 dark:bg-zinc-950/50">
        {messages.map((msg) => (
          <MessageItem
            key={msg.id}
            message={msg}
            isGroup={contact.isGroup}
            onReply={onReplyToMessage}
            onReact={onReactToMessage}
            onPin={onPinMessage}
            onStar={onStarMessage}
            onDelete={onDeleteMessage}
            onViewMedia={onViewMedia}
          />
        ))}

        {/* Typing indicator bubble */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 py-2 px-3.5 bg-white dark:bg-zinc-800/90 rounded-2xl w-fit border border-zinc-200/80 dark:border-zinc-700/80 shadow-xs my-2"
            >
              <div className="relative flex items-center justify-center">
                <span className="absolute w-5 h-5 rounded-full bg-blue-500/30 animate-ping" />
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-5 h-5 rounded-full object-cover relative z-10 ring-1 ring-blue-500/40"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {contact.name} is typing
                </span>
                <div className="flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* AI Smart Reply Suggestions Strip */}
      {settings.smartRepliesEnabled && smartReplies.length > 0 && !isTyping && (
        <div className="px-4 py-2 bg-zinc-100/80 dark:bg-zinc-900/80 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1 flex-shrink-0">
            <Sparkles className="w-3 h-3 fill-amber-500" /> Smart Reply:
          </span>
          {smartReplies.map((phrase, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(phrase)}
              className="px-3 py-1 bg-white dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950 border border-zinc-200 dark:border-zinc-700 rounded-full text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex-shrink-0 shadow-2xs active:scale-95"
            >
              {phrase}
            </button>
          ))}
        </div>
      )}

      {/* Replying-To Bar */}
      {replyingTo && (
        <div className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
          <div className="truncate min-w-0">
            <span className="font-semibold text-blue-600 dark:text-blue-400 block">
              Replying to {replyingTo.senderName}
            </span>
            <span className="truncate block opacity-80">{replyingTo.text}</span>
          </div>
          <button onClick={onCancelReply} className="p-1 hover:text-red-500 text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Message Input Controls */}
      <div className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200/80 dark:border-zinc-800/80 relative">
        {/* Active Participant Typing Pulse Indicator Banner */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: 5 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 5 }}
              className="mb-2 px-3 py-1.5 bg-blue-50/90 dark:bg-blue-950/60 border border-blue-200/70 dark:border-blue-800/60 rounded-xl flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600 dark:bg-blue-400"></span>
                </span>
                <span className="font-medium text-[11px]">
                  <strong className="font-semibold">{contact.name}</strong> is typing...
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Attachment Menu Popup */}
        <AnimatePresence>
          {showAttachMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-16 left-4 z-30 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-2xl p-2 flex flex-col gap-1 w-48 text-xs font-medium"
            >
              <button
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
              >
                <ImageIcon className="w-4 h-4 text-blue-500" />
                <span>Upload Image</span>
              </button>

              <button
                onClick={onOpenDrawingModal}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
              >
                <Palette className="w-4 h-4 text-purple-500" />
                <span>Draw Sketch</span>
              </button>

              <button
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 transition-colors"
              >
                <FileText className="w-4 h-4 text-amber-500" />
                <span>Document File</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Emoji Picker Popup */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-16 left-12 z-30 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-2xl p-3 grid grid-cols-5 gap-2 w-52"
            >
              {EMOJI_LIST.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    setInputText((prev) => prev + emoji);
                  }}
                  className="p-1.5 text-lg hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Voice Recording Overlay Mode */}
        {isRecordingVoice ? (
          <div className="flex items-center justify-between p-2 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
              <span className="font-semibold text-xs font-mono">
                Recording... 0:0{recordingSeconds}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsRecordingVoice(false)}
                className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 text-zinc-600 dark:text-zinc-400 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleStopAndSendVoiceNote}
                className="px-3 py-1.5 bg-red-600 text-white rounded-xl text-xs font-medium flex items-center gap-1 shadow-sm"
              >
                <StopCircle className="w-4 h-4" /> Send Voice Note
              </button>
            </div>
          </div>
        ) : (
          /* Standard Text Input Bar */
          <div className="flex items-end gap-2">
            <button
              onClick={() => setShowAttachMenu(!showAttachMenu)}
              className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              title="Attach File or Drawing"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl p-1.5 border border-zinc-200/80 dark:border-zinc-700/80 flex items-end gap-2">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-amber-500 transition-colors mb-0.5"
                title="Emoji"
              >
                <Smile className="w-5 h-5" />
              </button>

              <textarea
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${contact.name}...`}
                rows={1}
                className="flex-1 bg-transparent border-0 focus:outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 resize-none max-h-24 py-1"
              />

              <button
                onClick={() => setIsRecordingVoice(true)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-500 transition-colors mb-0.5"
                title="Record Voice Note"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-md shadow-blue-500/20 transition-all active:scale-95 flex-shrink-0"
              title="Send Message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
