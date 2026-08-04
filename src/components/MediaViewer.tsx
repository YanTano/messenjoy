import React from 'react';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MediaViewerProps {
  url: string | null;
  title?: string;
  onClose: () => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({ url, title, onClose }) => {
  if (!url) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
        onClick={onClose}
      >
        <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
          <a
            href={url}
            download={title || 'image.png'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl flex flex-col items-center"
        >
          <img
            src={url}
            alt={title || 'Media preview'}
            className="max-w-full max-h-[75vh] object-contain select-none"
          />
          {title && (
            <div className="w-full p-3 bg-zinc-900/80 text-zinc-300 text-sm text-center border-t border-white/5 truncate">
              {title}
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
