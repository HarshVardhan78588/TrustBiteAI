import React, { useEffect, useState } from 'react';
import { User, RefundRequest, TrustScoreLog } from '../types';
import { ShieldCheck, ShieldAlert, Award, Clock, ArrowDownRight, ArrowUpRight, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { fetchTrustScoreLogs } from '../services/apiService';

interface CustomerProfileViewProps {
  user: User;
  userRefunds: RefundRequest[];
}

export const CustomerProfileView: React.FC<CustomerProfileViewProps> = ({ user, userRefunds }) => {
  const [logs, setLogs] = useState<TrustScoreLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (user.id) {
      setLoadingLogs(true);
      fetchTrustScoreLogs(user.id)
        .then(data => setLogs(data))
        .catch(err => console.error('Failed to fetch trust logs', err))
        .finally(() => setLoadingLogs(false));
    }
  }, [user.id]);

  const approvedCount = userRefunds.filter(r => r.status.includes('approved')).length;
  const rejectedCount = userRefunds.filter(r => r.status.includes('rejected')).length;

  const trustLevelBadge = user.trustScore >= 75
    ? { label: 'High Trust (Instant Refunds Enabled)', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
    : user.trustScore >= 50
    ? { label: 'Standard Trust (Admin Verification)', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
    : { label: 'At Risk (Refund Privileges Under Review)', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Profile Header */}
      <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${trustLevelBadge.color}`}>
                {user.flagStatus} FLAG
              </span>
            </div>
            <p className="text-xs text-white/50">{user.email} • Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
            <div className="mt-2">
              <span className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold border ${trustLevelBadge.color}`}>
                {trustLevelBadge.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center min-w-[120px]">
            <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Trust Score</div>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-0.5">{user.trustScore} / 100</div>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center min-w-[120px]">
            <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Total Orders</div>
            <div className="text-2xl font-mono font-bold text-white mt-0.5">{user.totalOrders || 0}</div>
          </div>
        </div>
      </div>

      {/* Refunds Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Approved Refunds</div>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">{approvedCount}</div>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400/50" />
        </div>

        <div className="p-5 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Rejected Refunds</div>
            <div className="text-2xl font-mono font-bold text-rose-400 mt-1">{rejectedCount}</div>
          </div>
          <XCircle className="w-8 h-8 text-rose-400/50" />
        </div>

        <div className="p-5 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Flag Status</div>
            <div className={`text-xl font-bold mt-1 ${user.flagStatus === 'GREEN' ? 'text-emerald-400' : user.flagStatus === 'YELLOW' ? 'text-amber-400' : 'text-rose-400'}`}>
              {user.flagStatus === 'GREEN' ? 'CLEAN RECORD' : user.flagStatus === 'YELLOW' ? 'WARNING ISSUED' : 'RED FLAGGED'}
            </div>
          </div>
          <AlertTriangle className="w-8 h-8 text-amber-400/50" />
        </div>
      </div>

      {/* Trust Score Timeline */}
      <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" /> Trust Score Timeline & Telemetry History
          </h3>
          <span className="text-xs text-white/40">Audit trail of automated & manual adjustments</span>
        </div>

        {loadingLogs ? (
          <div className="text-center py-6 text-xs text-white/40">Loading trust logs...</div>
        ) : logs.length === 0 ? (
          <div className="p-6 text-center text-xs text-white/40 bg-white/5 rounded-xl">
            No trust score changes logged yet. Initial trust score set to 85/100.
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${log.delta >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {log.delta >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{log.reason}</div>
                    <div className="text-[11px] text-white/40">{new Date(log.timestamp).toLocaleString()} • Event: {log.event}</div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className={`text-sm font-bold ${log.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {log.delta >= 0 ? `+${log.delta}` : log.delta} pts
                  </div>
                  <div className="text-[10px] text-white/40">{log.previousScore} &rarr; {log.newScore}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
