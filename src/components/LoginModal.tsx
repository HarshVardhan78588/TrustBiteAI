import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Sparkles, User, Mail, Lock, LogIn, UserPlus, Laptop, ArrowRight } from 'lucide-react';
import { loginUser, signupUser } from '../services/apiService';
import { User as UserType } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserType, token: string) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'customer' | 'support'>('customer');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      if (isSignup) {
        if (!name.trim()) throw new Error('Full name is required');
        const res = await signupUser(name, email, password, role);
        localStorage.setItem('trustbite_token', res.token);
        onAuthSuccess(res.user, res.token);
      } else {
        const res = await loginUser(email, password);
        localStorage.setItem('trustbite_token', res.token);
        onAuthSuccess(res.user, res.token);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPresetLogin = async (presetEmail: string, presetPass: string) => {
    setErrorMsg('');
    setIsLoading(true);

    try {
      const res = await loginUser(presetEmail, presetPass);
      localStorage.setItem('trustbite_token', res.token);
      onAuthSuccess(res.user, res.token);
      onClose();
    } catch (err: any) {
      // If preset customer user not yet signed up, auto signup
      try {
        const isSupport = presetEmail.includes('support');
        const defaultName = isSupport ? 'TrustBite Support Agent' : presetEmail.split('@')[0].toUpperCase();
        const signupRes = await signupUser(defaultName, presetEmail, presetPass, isSupport ? 'support' : 'customer');
        localStorage.setItem('trustbite_token', signupRes.token);
        onAuthSuccess(signupRes.user, signupRes.token);
        onClose();
      } catch (signupErr: any) {
        setErrorMsg(signupErr.message || 'Preset authentication failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-white my-8"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/10 bg-white/5 space-y-1 text-center">
            <div className="inline-flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-2">
              <ShieldAlert className="w-4 h-4" /> Multi-Laptop Real-Time Authentication
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome to TrustBite AI</h2>
            <p className="text-xs text-white/50">
              {isSignup ? 'Create your TrustBite identity account' : 'Sign in with your email or quick hackathon preset'}
            </p>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Hackathon Preset Selector Bar */}
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-indigo-300 uppercase tracking-wider">
                <span className="flex items-center gap-1.5"><Laptop className="w-3.5 h-3.5 text-indigo-400" /> Hackathon Demo Laptop Presets:</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickPresetLogin('support@trustbite.ai', 'password123')}
                  className="p-2.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/30 text-xs font-bold text-left flex items-center justify-between transition-all"
                >
                  <div>
                    <div className="text-[10px] uppercase font-bold text-indigo-400">Laptop 4 (Support)</div>
                    <div>support@trustbite.ai</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPresetLogin('user1@test.com', 'password123')}
                  className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 text-xs text-left flex items-center justify-between transition-all"
                >
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-400">Laptop 1 (Customer 1)</div>
                    <div>user1@test.com</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/40" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPresetLogin('user2@test.com', 'password123')}
                  className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 text-xs text-left flex items-center justify-between transition-all"
                >
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-400">Laptop 2 (Customer 2)</div>
                    <div>user2@test.com</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/40" />
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickPresetLogin('user3@test.com', 'password123')}
                  className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 text-xs text-left flex items-center justify-between transition-all"
                >
                  <div>
                    <div className="text-[10px] uppercase font-bold text-amber-400">Laptop 3 (Customer 3)</div>
                    <div>user3@test.com</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-white/40" />
                </button>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-white/10 w-full" />
              <span className="bg-[#0a0a0a] px-3 text-[10px] uppercase tracking-wider text-white/40 font-bold absolute">
                Or Sign In Manually
              </span>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {isSignup && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Vance"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 text-xs text-white border border-white/10 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 text-xs text-white border border-white/10 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 text-xs text-white border border-white/10 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {isSignup && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-1.5">
                    Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        role === 'customer'
                          ? 'border-indigo-500 bg-indigo-500/20 text-white'
                          : 'border-white/10 bg-white/5 text-white/50'
                      }`}
                    >
                      Customer Role
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('support')}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                        role === 'support'
                          ? 'border-indigo-500 bg-indigo-500/20 text-white'
                          : 'border-white/10 bg-white/5 text-white/50'
                      }`}
                    >
                      Support Team Role
                    </button>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : isSignup ? (
                  <>
                    <UserPlus className="w-4 h-4" /> Create Account
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> Sign In
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setErrorMsg('');
                }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
