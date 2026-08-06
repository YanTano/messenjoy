import React, { useState } from 'react';
import {
  Check,
  CheckCheck,
  Clock,
  MoreHorizontal,
  Reply,
  Smile,
  Pin,
  Star,
  Copy,
  Trash2,
  Play,
  Pause,
  FileText,
  Volume2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Message } from '../types';

interface MessageItemProps {
  message: Message;
  isGroup?: boolean;
  onReply: (msg: Message) => void;
  onReact: (msgId: string, emoji: string) => void;
  onPin: (msgId: string) => void;
  onStar: (msgId: string) => void;
  onDelete: (msgId: string) => void;
  onViewMedia: (url: string) => void;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😂', '🔥', '😮', '🙏'];

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  isGroup,
  onReply,
  onReact,
  onPin,
  onStar,
  onDelete,
  onViewMedia,
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const togglePlayAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
    if (!isPlayingAudio) {
      let current = 0;
      const interval = setInterval(() => {
        current += 10;
        if (current >= 100) {
          clearInterval(interval);
          setIsPlayingAudio(false);
          setAudioProgress(0);
        } else {
          setAudioProgress(current);
        }
      }, (message.voiceNoteDuration || 3) * 100);
    }
  };

  const handleCopyText = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
    }
  };

  return (
    <div
      className={`group relative flex flex-col mb-3 ${
        message.isUser ? 'items-end' : 'items-start'
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowEmojiPicker(false);
      }}
    >
      {/* Sender name in group chat */}
      {isGroup && !message.isUser && (
        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1 ml-10">
          {message.senderName}
        </span>
      )}

      <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Recipient Avatar */}
        {!message.isUser && (
          <img
            src={message.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
            alt={message.senderName}
            className="w-8 h-8 rounded-full object-cover shadow-sm flex-shrink-0 border border-zinc-200 dark:border-zinc-800"
          />
        )}

        {/* Message Container */}
        <div className="relative">
          {/* Reply Context Bar */}
          {message.replyToText && (
            <div
              className={`text-xs px-3 py-1.5 rounded-t-xl mb-0.5 border-l-4 border-blue-500 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 truncate max-w-full`}
            >
              <span className="font-semibold text-blue-600 dark:text-blue-400 block truncate">
                Replying to {message.replyToSender || 'message'}
              </span>
              <span className="truncate block opacity-80">{message.replyToText}</span>
            </div>
          )}

          {/* Main Message Bubble */}
          <div
            className={`relative rounded-2xl px-4 py-2.5 shadow-sm text-sm transition-all ${
              message.isUser
                ? 'bg-blue-600 text-white rounded-br-xs'
                : 'bg-zinc-100 dark:bg-zinc-800/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200/60 dark:border-zinc-700/50 rounded-bl-xs'
            }`}
          >
            {/* Pinned / Starred badge */}
            {(message.isPinned || message.isStarred) && (
              <div className="flex items-center gap-1 text-[10px] opacity-75 mb-1 font-medium">
                {message.isPinned && <Pin className="w-3 h-3 fill-current" />}
                {message.isStarred && <Star className="w-3 h-3 fill-current" />}
                <span>{message.isPinned ? 'Pinned Message' : 'Starred'}</span>
              </div>
            )}

            {/* Attachments rendering */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="space-y-2 mb-2">
                {message.attachments.map((att) => {
                  if (att.type === 'image' || att.type === 'drawing') {
                    return (
                      <div
                        key={att.id}
                        onClick={() => onViewMedia(att.url)}
                        className="cursor-pointer overflow-hidden rounded-xl border border-black/10 hover:opacity-95 transition-opacity"
                      >
                        <img
                          src={att.url}
                          alt={att.name}
                          className="max-h-60 w-full object-cover rounded-xl"
                        />
                      </div>
                    );
                  }
                  return (
                    <div
                      key={att.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10"
                    >
                      <FileText className="w-6 h-6 text-blue-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-xs truncate">{att.name}</p>
                        <p className="text-[10px] opacity-70">{att.size || 'File'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Voice Note Player */}
            {message.voiceNoteUrl && (
              <div className="flex items-center gap-3 py-1 pr-2 min-w-[200px]">
                <button
                  onClick={togglePlayAudio}
                  className={`p-2.5 rounded-full transition-transform active:scale-95 ${
                    message.isUser ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'
                  }`}
                >
                  {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[11px] mb-1 opacity-80">
                    <span className="font-medium flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> Voice Note
                    </span>
                    <span>0:0{message.voiceNoteDuration || 3}</span>
                  </div>
                  <div className="w-full bg-black/20 dark:bg-white/20 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-current h-full transition-all duration-100"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Message Text */}
            {message.text && (
              <div className="whitespace-pre-wrap break-words leading-relaxed">
                {message.text}
              </div>
            )}

            {/* Timestamp & Status Ticks */}
            <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
              message.isUser ? 'text-blue-100' : 'text-zinc-500 dark:text-zinc-400'
            }`}>
              <span>{message.timestamp}</span>
              {message.isEdited && <span>(edited)</span>}
              {message.isUser && (
                <span className="ml-0.5">
                  {message.status === 'sending' && <Clock className="w-3 h-3 animate-spin" />}
                  {message.status === 'sent' && <Check className="w-3.5 h-3.5 opacity-80" />}
                  {(message.status === 'delivered' || message.status === 'read') && (
                    <CheckCheck className={`w-3.5 h-3.5 ${message.status === 'read' ? 'text-sky-200' : 'opacity-80'}`} />
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Reactions bar below bubble */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-1 ${message.isUser ? 'justify-end' : 'justify-start'}`}>
              {message.reactions.map((r) => (
                <button
                  key={r.emoji}
                  onClick={() => onReact(message.id, r.emoji)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border shadow-2xs transition-transform active:scale-95 ${
                    r.userReacted
                      ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-200 font-semibold'
                      : 'bg-zinc-100 border-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span>{r.emoji}</span>
                  <span className="text-[10px] font-bold">{r.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Action Toolbar on Hover */}
          {showActions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`absolute top-0 -translate-y-1/2 z-20 flex items-center gap-0.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg rounded-full p-1 text-zinc-600 dark:text-zinc-300 ${
                message.isUser ? 'right-0 -translate-x-4' : 'left-0 translate-x-4'
              }`}
            >
              {/* Quick Emojis */}
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors text-amber-500"
                title="React"
              >
                <Smile className="w-4 h-4" />
              </button>

              <button
                onClick={() => onReply(message)}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
                title="Reply"
              >
                <Reply className="w-4 h-4" />
              </button>

              <button
                onClick={() => onPin(message.id)}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
                title="Pin"
              >
                <Pin className="w-4 h-4" />
              </button>

              <button
                onClick={() => onStar(message.id)}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors text-amber-500"
                title="Star"
              >
                <Star className="w-4 h-4" />
              </button>

              <button
                onClick={handleCopyText}
                className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-full transition-colors"
                title="Copy text"
              >
                <Copy className="w-4 h-4" />
              </button>

                <button
                  onClick={() => onDelete(message.id)}
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-full text-red-500 transition-colors"
                  title="Delete Message"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

            </motion.div>
          )}

          {/* Floating Emoji Picker Popover */}
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`absolute top-[-40px] z-30 flex items-center gap-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-xl rounded-full p-1.5 ${
                message.isUser ? 'right-0' : 'left-0'
              }`}
            >
              {EMOJI_OPTIONS.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    onReact(message.id, e);
                    setShowEmojiPicker(false);
                  }}
                  className="hover:scale-125 transition-transform p-1 text-base"
                >
                  {e}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
