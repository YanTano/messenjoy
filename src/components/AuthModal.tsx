import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserPlus,
  LogIn,
  Sparkles,
  Check,
  AlertCircle,
  Users,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { SmileyMessageLogo } from './SmileyMessageLogo';
import {
  UserAccount,
  PRESET_AVATARS,
  SEED_ACCOUNTS,
  getRegisteredAccounts,
  loginUser,
  registerUser,
} from '../utils/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeMode, setActiveMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regBio, setRegBio] = useState('');
  const [regStatus, setRegStatus] = useState('💬 Ready to chat!');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Error & state messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const registeredUsers = getRegisteredAccounts();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!loginEmail.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }
    const res = loginUser(loginEmail, loginPassword);
    if (res.success && res.user) {
      onSuccess(res.user);
    } else {
      setErrorMsg(res.error || 'Login failed.');
    }
  };

  const handleQuickLogin = (account: UserAccount) => {
    setErrorMsg(null);
    const res = loginUser(account.email, account.password);
    if (res.success && res.user) {
      onSuccess(res.user);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!regName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    const avatarUrl = customAvatarUrl.trim() || selectedAvatar;

    const res = registerUser({
      name: regName,
      email: regEmail,
      password: regPassword || 'password123',
      avatar: avatarUrl,
      bio: regBio,
      customStatus: regStatus,
    });

    if (res.success && res.user) {
      onSuccess(res.user);
    } else {
      setErrorMsg(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 w-full max-w-lg overflow-hidden my-auto flex flex-col max-h-[92vh]"
      >
        {/* Top Header / Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white text-center relative overflow-hidden flex-shrink-0">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-lg border border-white/30">
              <SmileyMessageLogo className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Messenjoy</h2>
          </div>
        </div>

        {/* Navigation Tabs (Login / Register) */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 p-1.5 gap-1 flex-shrink-0">
          <button
            onClick={() => {
              setActiveMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeMode === 'login'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => {
              setActiveMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeMode === 'register'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900/60 rounded-xl text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeMode === 'login' && (
            <div className="space-y-5">
              {/* Quick Account Switcher Section */}
              {registeredUsers.length > 0 && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                      Saved Accounts on this Device
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {registeredUsers.map((acc) => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => handleQuickLogin(acc)}
                          className="flex items-center gap-3 p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-2xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 transition-all text-left group"
                        >
                          <img
                            src={acc.avatar}
                            alt={acc.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-700 group-hover:ring-blue-500"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {acc.name}
                            </h4>
                            <p className="text-[10px] text-zinc-500 truncate">{acc.email}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
                    <span className="flex-shrink mx-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      or sign in with password
                    </span>
                    <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
                  </div>
                </>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. alex@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log In to Account</span>
                </button>
              </form>
            </div>
          )}

          {activeMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jordan Miller"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  placeholder="e.g. jordan@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              {/* Profile Avatar Selection */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Choose Profile Picture
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {PRESET_AVATARS.map((url, idx) => {
                    const isSelected = selectedAvatar === url && !customAvatarUrl;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(url);
                          setCustomAvatarUrl('');
                        }}
                        className={`relative rounded-full aspect-square overflow-hidden border-2 transition-all ${
                          isSelected
                            ? 'border-blue-600 scale-105 ring-2 ring-blue-500/40'
                            : 'border-transparent opacity-80 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt="Avatar option" className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center text-white">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="url"
                  placeholder="Or paste image URL (https://...)"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Custom Status & Bio
                </label>
                <input
                  type="text"
                  placeholder="e.g. 🎨 Designing awesome stuff"
                  value={regStatus}
                  onChange={(e) => setRegStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 mb-2"
                />
                <textarea
                  placeholder="Tell other users a bit about yourself..."
                  value={regBio}
                  onChange={(e) => setRegBio(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-100 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create & Register Account</span>
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
