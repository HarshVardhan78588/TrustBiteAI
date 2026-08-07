import React from 'react';
import { UserRole, User } from '../types';
import { Shield, ShoppingBag, Store, LayoutDashboard, Bike, Zap, Sparkles, UserCheck, LogOut, Laptop, User as UserIcon } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
  currentUser: User | null;
  cartItemCount: number;
  onOpenCart: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onSelectRole,
  currentUser,
  cartItemCount,
  onOpenCart,
  activeTab,
  onSelectTab,
  onOpenAuthModal,
  onLogout
}) => {
  const getTrustBadgeColor = (score: number) => {
    if (score >= 75) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (score >= 50) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  };

  const isSupportUser = currentUser?.role === 'support' || currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a0a0a]/90 border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => isSupportUser ? onSelectTab('admin_dash') : onSelectTab('home')}>
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 text-white font-bold text-lg">
            T
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">
                TrustBite<span className="text-indigo-400">.AI</span>
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                Multi-User Live
              </span>
            </div>
            <p className="text-[11px] text-white/40 font-medium">Real-Time Verification & Fraud Engine</p>
          </div>
        </div>

        {/* Global Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
          {!isSupportUser ? (
            <>
              <button
                onClick={() => { onSelectRole('customer'); onSelectTab('home'); }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentRole === 'customer' && activeTab === 'home'
                    ? 'bg-white/10 text-white shadow-sm border border-white/15'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
                Customer App
              </button>

              <button
                onClick={() => { onSelectTab('flash'); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'flash'
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                Flash Market
              </button>

              <button
                onClick={() => { onSelectTab('profile'); }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'profile'
                    ? 'bg-white/10 text-white shadow-sm border border-white/15'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                My Trust Profile
              </button>

              <button
                onClick={() => { onSelectRole('restaurant'); onSelectTab('restaurant_dash'); }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  currentRole === 'restaurant'
                    ? 'bg-white/10 text-white shadow-sm border border-white/15'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-blue-400" />
                Restaurant Simulation
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-indigo-300">
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              Support Team Command Center (Role: Support)
            </div>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {/* Hackathon Preset / Account Switcher Button */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>Switch Account</span>
          </button>

          {/* User Trust Score Display */}
          {currentUser && currentUser.role === 'customer' && (
            <div
              onClick={() => onSelectTab('profile')}
              title="Click to view Trust Score breakdown"
              className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer transition-transform hover:scale-105 ${getTrustBadgeColor(currentUser.trustScore)}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trust: {currentUser.trustScore}/100</span>
            </div>
          )}

          {/* Cart Icon Button */}
          {!isSupportUser && (
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-xl bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {/* User Avatar & Logout */}
          {currentUser && (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <img
                src={currentUser.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-white/20"
              />
              <button
                onClick={onLogout}
                title="Sign out"
                className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-white/60 hover:text-rose-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
