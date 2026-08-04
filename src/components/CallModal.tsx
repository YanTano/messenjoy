import React, { useEffect, useRef, useState } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Volume2,
  VolumeX,
  MessageSquare,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { CallState } from '../types';

interface CallModalProps {
  callState: CallState;
  onEndCall: () => void;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
}

export const CallModal: React.FC<CallModalProps> = ({
  callState,
  onEndCall,
  onToggleMute,
  onToggleCamera,
  onToggleScreenShare,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [speakerOn, setSpeakerOn] = useState(true);

  // Request real user camera if video is on and not camera-off
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    if (callState.active && callState.type === 'video' && !callState.isCameraOff) {
      navigator.mediaDevices
        ?.getUserMedia({ video: true, audio: false })
        .then((s) => {
          activeStream = s;
          setStream(s);
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch((err) => {
          console.warn('Camera access error:', err);
        });
    } else {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
        setStream(null);
      }
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [callState.active, callState.type, callState.isCameraOff]);

  if (!callState.active || !callState.contact) return null;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/95 backdrop-blur-xl flex flex-col items-center justify-between p-6 select-none overflow-hidden">
      {/* Top Header */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10 text-white">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
          <span className="text-sm font-medium tracking-wide uppercase text-zinc-400">
            {callState.type === 'video' ? 'HD Video Call' : 'Encrypted Voice Call'}
          </span>
        </div>
        <div className="text-xl font-mono font-semibold text-zinc-200 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
          {formatTimer(callState.duration)}
        </div>
      </div>

      {/* Main Video / Participant Stage */}
      <div className="w-full max-w-4xl flex-1 my-6 relative rounded-3xl overflow-hidden bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl">
        {callState.type === 'video' ? (
          <div className="w-full h-full relative flex items-center justify-center bg-zinc-950">
            {/* Main Remote Contact View */}
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              <img
                src={callState.contact.avatar}
                alt={callState.contact.name}
                className="w-32 h-32 rounded-full object-cover shadow-2xl ring-4 ring-blue-500/30 animate-pulse"
              />
              <h2 className="mt-4 text-2xl font-bold text-white">{callState.contact.name}</h2>
              <p className="text-sm text-zinc-400 mt-1">
                {callState.isScreenSharing ? 'Sharing Screen...' : 'Connected'}
              </p>
            </div>

            {/* Local Video Picture-in-Picture */}
            <div className="absolute bottom-6 right-6 w-40 h-56 rounded-2xl overflow-hidden bg-zinc-800 border-2 border-zinc-700 shadow-2xl">
              {!callState.isCameraOff && stream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 text-zinc-400 p-2 text-center">
                  <VideoOff className="w-8 h-8 mb-2 text-zinc-500" />
                  <span className="text-xs font-medium">Camera Off</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Audio Call Visualizer */
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"
              />
              <img
                src={callState.contact.avatar}
                alt={callState.contact.name}
                className="w-36 h-36 rounded-full object-cover shadow-2xl border-4 border-blue-500 relative z-10"
              />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-white">{callState.contact.name}</h2>
            <p className="text-zinc-400 mt-2 font-medium">Voice Call in progress...</p>
          </div>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="w-full max-w-xl bg-zinc-900/80 backdrop-blur-xl p-4 rounded-2xl border border-zinc-800 flex items-center justify-around z-10 shadow-2xl">
        <button
          onClick={onToggleMute}
          className={`p-4 rounded-full transition-all ${
            callState.isMuted
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
          }`}
          title={callState.isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {callState.isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        <button
          onClick={onToggleCamera}
          className={`p-4 rounded-full transition-all ${
            callState.isCameraOff
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
              : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
          }`}
          title={callState.isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
        >
          {callState.isCameraOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
        </button>

        <button
          onClick={onToggleScreenShare}
          className={`p-4 rounded-full transition-all ${
            callState.isScreenSharing
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
          }`}
          title="Share Screen"
        >
          <Monitor className="w-6 h-6" />
        </button>

        <button
          onClick={() => setSpeakerOn(!speakerOn)}
          className={`p-4 rounded-full transition-all ${
            !speakerOn ? 'bg-zinc-700 text-zinc-400' : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
          }`}
          title="Speaker Toggle"
        >
          {speakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
        </button>

        <button
          onClick={onEndCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/40 transition-transform active:scale-95"
          title="End Call"
        >
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
