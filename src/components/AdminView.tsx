import React, { useState } from 'react';
import { AdminStats, RefundRequest, DriverApplication, User, NotificationItem, Employee } from '../types';
import { ShieldAlert, TrendingUp, DollarSign, Sparkles, CheckCircle2, XCircle, Search, Bike, UserCheck, ShieldCheck, ArrowUpRight, BarChart3, AlertTriangle, Bell, UserX, Flag, Radio } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { EmployeeTrustView } from './EmployeeTrustView';
import { toggleUserFlag, toggleRefundPrivileges, performSupportAction } from '../services/apiService';

interface AdminViewProps {
  stats: AdminStats | null;
  refunds: RefundRequest[];
  drivers: DriverApplication[];
  users: User[];
  notifications: NotificationItem[];
  employees: Employee[];
  onInspectRefund: (refund: RefundRequest) => void;
  onAdminRefundDecision: (refundId: string, decision: 'approve' | 'reject', notes?: string) => void;
  onApproveDriver: (driverId: string) => void;
  onUpdateTrustScore: (userId: string, delta: number, reason: string) => void;
  onRefreshData: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  stats,
  refunds,
  drivers,
  users,
  notifications,
  employees,
  onInspectRefund,
  onAdminRefundDecision,
  onApproveDriver,
  onUpdateTrustScore,
  onRefreshData
}) => {
  const [userSearch, setUserSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'refunds' | 'users' | 'employees'>('overview');

  const pendingRefunds = refunds.filter(r => r.status === 'pending_admin');
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));
  const redFlaggedUsers = users.filter(u => u.flagStatus === 'RED' || u.trustScore < 50);

  // Recharts Data
  const chartData = [
    { name: 'Mon', revenue: 1420, fraudPrevented: 320 },
    { name: 'Tue', revenue: 1890, fraudPrevented: 480 },
    { name: 'Wed', revenue: 2300, fraudPrevented: 610 },
    { name: 'Thu', revenue: 2100, fraudPrevented: 540 },
    { name: 'Fri', revenue: 2890, fraudPrevented: 890 },
    { name: 'Sat', revenue: 3400, fraudPrevented: 1120 },
    { name: 'Sun', revenue: 3100, fraudPrevented: 980 }
  ];

  const pieData = [
    { name: 'High Trust (>75)', value: users.filter(u => u.trustScore >= 75).length || 2, color: '#10b981' },
    { name: 'Moderate (50-74)', value: users.filter(u => u.trustScore >= 50 && u.trustScore < 75).length || 1, color: '#f59e0b' },
    { name: 'Low Trust (<50)', value: users.filter(u => u.trustScore < 50).length || 1, color: '#f43f5e' }
  ];

  const handleRestoreTrust = async (userId: string) => {
    try {
      await performSupportAction(userId, 'restore_trust');
      onRefreshData();
    } catch (err) {
      console.error('Failed to restore trust', err);
    }
  };

  const handleToggleFlag = async (userId: string, isFlaggedOrRed: boolean) => {
    try {
      await performSupportAction(userId, isFlaggedOrRed ? 'remove_red_flag' : 'mark_red_flag');
      onRefreshData();
    } catch (err) {
      console.error('Failed to update flag', err);
    }
  };

  const handleToggleSuspend = async (userId: string, isSuspended: boolean) => {
    try {
      await performSupportAction(userId, isSuspended ? 'restore_refunds' : 'suspend_refunds');
      onRefreshData();
    } catch (err) {
      console.error('Failed to update refund privileges', err);
    }
  };

  const handleWarnUser = async (userId: string) => {
    try {
      await performSupportAction(userId, 'warn_user');
      onRefreshData();
    } catch (err) {
      console.error('Failed to warn user', err);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0a0a0a] text-white border border-white/10 shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">TrustBite Support & Fraud Dashboard</h2>
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" /> Socket.IO Real-Time Active
            </span>
          </div>
          <p className="text-xs text-white/50">
            Laptop 4 Command Center • Multi-user real-time refund verification, fraud prevention & employee trust.
          </p>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/5 border border-white/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('refunds')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
              activeTab === 'refunds' ? 'bg-indigo-600 text-white shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            Refund Queue
            {pendingRefunds.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.2 bg-rose-500 text-white text-[10px] rounded-full font-bold">
                {pendingRefunds.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'users' ? 'bg-indigo-600 text-white shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'employees' ? 'bg-indigo-600 text-white shadow' : 'text-white/60 hover:text-white'
            }`}
          >
            Employee Trust ({employees.length})
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="glass p-5 rounded-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/40">
            <span>Today's Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-light text-white font-mono">
            ${stats?.totalRevenueToday.toFixed(2) || '2,840.50'}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" /> +18.4% vs yesterday
          </div>
        </div>

        <div className="glass p-5 rounded-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/40">
            <span>Prevented Fraud Loss</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-light text-white font-mono">
            ${stats?.preventedFraudAmount.toFixed(2) || '420.00'}
          </div>
          <div className="text-[11px] text-rose-400 font-medium">
            +12% intercepted fake claims
          </div>
        </div>

        <div className="glass p-5 rounded-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/40">
            <span>Instant AI Refunds</span>
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-light text-white font-mono">
            {stats?.instantRefundsCount || 2} <span className="text-xs text-white/40 font-normal">claims</span>
          </div>
          <div className="text-[11px] text-indigo-400 font-medium">
            0 human touches required
          </div>
        </div>

        <div className="glass p-5 rounded-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/40">
            <span>Red Flagged Accounts</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-light text-white font-mono">
            {redFlaggedUsers.length} <span className="text-xs text-white/40 font-normal">users</span>
          </div>
          <div className="text-[11px] text-amber-400 font-medium">
            Refund privilege restriction active
          </div>
        </div>

      </div>

      {/* Realtime Notifications & Fraud Alerts Banner */}
      {notifications.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
          <div className="flex items-center justify-between text-rose-400 font-bold text-xs uppercase tracking-wider">
            <span className="flex items-center gap-2"><Bell className="w-4 h-4" /> Live Fraud & Telemetry Alert Feed ({notifications.length})</span>
            <span className="text-[10px] text-white/40">Real-time Socket.IO Stream</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {notifications.slice(0, 4).map((notif) => (
              <div key={notif.id} className="p-3.5 rounded-xl bg-black/40 border border-rose-500/20 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-rose-300">
                  <span>{notif.title}</span>
                  <span className="text-[10px] text-white/40">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-white/70">{notif.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT */}

      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-xl bg-[#0a0a0a] border border-white/10 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <h3 className="font-semibold text-sm text-white">Revenue vs Fraud Prevention Telemetry</h3>
                  <p className="text-xs text-white/40">Weekly trend of revenue vs prevented invalid refund claims</p>
                </div>
                <BarChart3 className="w-5 h-5 text-white/30" />
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#666666" fontSize={11} tickLine={false} />
                    <YAxis stroke="#666666" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333333', color: '#ffffff' }} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} name="Revenue ($)" />
                    <Area type="monotone" dataKey="fraudPrevented" stroke="#f43f5e" fillOpacity={1} fill="url(#colorFraud)" strokeWidth={2} name="Prevented Fraud ($)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-[#0a0a0a] border border-white/10 space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-sm text-white border-b border-white/5 pb-3">User Trust Score Split</h3>
                <p className="text-xs text-white/40 pt-1">Automated instant refund eligibility tiers</p>
              </div>

              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={4}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#333333', color: '#ffffff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 text-xs">
                {pieData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-white/60">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </span>
                    <strong className="text-white font-mono">{d.value} Users</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LIVE CUSTOMER WATCHLIST */}
          <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" /> LIVE CUSTOMER WATCHLIST (MongoDB Live Sync)
                </h3>
                <p className="text-xs text-white/40">Real-time monitoring of customer trust scores, warning counts, and refund privileges</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {users.length} Active Customers
              </span>
            </div>

            <div className="divide-y divide-white/5 text-xs">
              {users.map((u) => (
                <div key={u.id} className="py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <img src={u.profilePicture || u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0 mt-1" />
                    <div className="space-y-1">
                      <div className="font-bold text-white flex flex-wrap items-center gap-2">
                        <span>{u.name}</span>
                        <span className="text-white/40 font-normal">({u.email})</span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border ${
                          u.flagStatus === 'GREEN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : u.flagStatus === 'YELLOW' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {u.flagStatus} FLAG
                        </span>
                        {(u as any).refundPrivilegesSuspended && (
                          <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            REFUNDS SUSPENDED
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-white/50">
                        <span>Trust Score: <strong className={u.trustScore >= 75 ? 'text-emerald-400' : u.trustScore >= 50 ? 'text-amber-400' : 'text-rose-400'}>{u.trustScore}/100</strong></span>
                        <span>• Warnings: <strong className="text-amber-300 font-mono">{u.warningCount || 0}</strong></span>
                        <span>• Approved Refunds: <strong className="text-emerald-400 font-mono">{u.approvedRefunds || 0}</strong></span>
                        <span>• Rejected Refunds: <strong className="text-rose-400 font-mono">{u.rejectedRefunds || 0}</strong></span>
                        <span>• Last Activity: <strong className="text-white/70">{u.lastActivity ? new Date(u.lastActivity).toLocaleTimeString() : 'Active now'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end lg:self-center">
                    <button
                      onClick={() => handleRestoreTrust(u.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold text-xs transition-all flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" /> Restore Trust
                    </button>

                    <button
                      onClick={() => handleToggleFlag(u.id, !!(u.isFlagged || u.flagStatus === 'RED'))}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs border transition-all flex items-center gap-1 ${
                        u.isFlagged || u.flagStatus === 'RED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" />
                      {u.isFlagged || u.flagStatus === 'RED' ? 'Remove Red Flag' : 'Mark Red Flag'}
                    </button>

                    <button
                      onClick={() => handleToggleSuspend(u.id, !!((u as any).refundPrivilegesSuspended || (u as any).refundSuspended))}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-bold text-xs transition-all flex items-center gap-1"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      {(u as any).refundPrivilegesSuspended || (u as any).refundSuspended ? 'Restore Refunds' : 'Suspend Refunds'}
                    </button>

                    <button
                      onClick={() => handleWarnUser(u.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 font-bold text-xs transition-all flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Warn User
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === 'refunds' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">
                Pending Admin Review Queue ({pendingRefunds.length})
              </h3>
              <p className="text-xs text-white/40">Side-by-side evidence inspection and Gemini similarity scoring.</p>
            </div>
          </div>

          {pendingRefunds.length === 0 ? (
            <div className="p-8 rounded-2xl glass text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-white text-sm">Review Queue Clear!</h4>
              <p className="text-xs text-white/50">All recent refund claims have been automatically resolved or processed by AI agents.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRefunds.map((ref) => (
                <div
                  key={ref.id}
                  className="p-5 rounded-2xl bg-[#0a0a0a] border border-amber-500/30 space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-indigo-400 font-bold">#TB-{ref.id}</span>
                        <span className="text-xs text-white/60">• Order #{ref.orderId} (${ref.amount.toFixed(2)})</span>
                      </div>
                      <p className="text-xs text-white/70">
                        Customer: <strong className="text-white">{ref.customerName}</strong> (Trust Score: <span className="text-amber-400 font-mono font-bold">{ref.customerTrustScore}/100</span>)
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onInspectRefund(ref)}
                        className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold text-xs border border-indigo-500/30 transition-all flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Evidence Inspector Modal
                      </button>
                    </div>
                  </div>

                  {ref.aiAnalysis && (
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-amber-400">
                        <span>Gemini Fraud Risk: {ref.aiAnalysis.fraudProbability}%</span>
                        <span>AI Confidence: {ref.aiAnalysis.confidenceScore}%</span>
                      </div>
                      <p className="text-white/70 leading-relaxed">"{ref.aiAnalysis.reasoning}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => onAdminRefundDecision(ref.id, 'reject', 'Admin rejected claim due to evidence discrepancy.')}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all border border-rose-500/20 flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" /> Reject & Penalize (-25)
                    </button>
                    <button
                      onClick={() => onAdminRefundDecision(ref.id, 'approve', 'Admin approved refund following evidence inspection.')}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve Refund (+3)
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> User Directory & Trust Point Editing
              </h3>
              <p className="text-xs text-white/40">Search customers and adjust trust scores.</p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Filter user..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 text-xs text-white border border-white/10 outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="divide-y divide-white/5 text-xs">
            {filteredUsers.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={u.profilePicture || u.avatarUrl || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-white/10" />
                  <div>
                    <div className="font-bold text-white">{u.name} ({u.role})</div>
                    <div className="text-[11px] text-white/40">{u.email} • Total Orders: {u.totalOrders || 0}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[10px] text-white/40 uppercase font-bold">Trust Score</div>
                    <div className={`font-mono font-bold text-sm ${u.trustScore >= 75 ? 'text-emerald-400' : u.trustScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {u.trustScore} / 100
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateTrustScore(u.id, 10, 'Admin manual bonus reward')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[11px] border border-emerald-500/20"
                    >
                      +10 Bonus
                    </button>
                    <button
                      onClick={() => onUpdateTrustScore(u.id, -15, 'Admin manual penalty')}
                      className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-[11px] border border-rose-500/20"
                    >
                      -15 Penalty
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'employees' && (
        <EmployeeTrustView employees={employees} onEmployeeUpdated={onRefreshData} />
      )}

    </div>
  );
};
