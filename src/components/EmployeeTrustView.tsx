import React from 'react';
import { Employee } from '../types';
import { Bike, ShieldAlert, AlertTriangle, CheckCircle2, UserX, RotateCcw, Star } from 'lucide-react';
import { updateEmployeeStatus } from '../services/apiService';

interface EmployeeTrustViewProps {
  employees: Employee[];
  onEmployeeUpdated: () => void;
}

export const EmployeeTrustView: React.FC<EmployeeTrustViewProps> = ({ employees, onEmployeeUpdated }) => {

  const handleAction = async (employeeId: string, action: 'warn' | 'suspend' | 'restore') => {
    try {
      await updateEmployeeStatus(employeeId, action);
      onEmployeeUpdated();
    } catch (err) {
      console.error('Failed to update employee status', err);
    }
  };

  const atRiskEmployees = employees.filter(e => e.trustScore < 75 || e.status !== 'active');

  return (
    <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/10 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Bike className="w-5 h-5 text-teal-400" /> Delivery Partner & Employee Trust System
          </h3>
          <p className="text-xs text-white/50">
            Real-time delivery partner rating monitoring, complaint tracking, and risk management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold">
            {employees.length} Total Partners
          </span>
          <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold">
            {atRiskEmployees.length} At Risk
          </span>
        </div>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {employees.map((emp) => (
          <div
            key={emp.id}
            className={`p-5 rounded-xl border transition-all ${
              emp.status === 'suspended'
                ? 'bg-rose-500/5 border-rose-500/30'
                : emp.status === 'warned'
                ? 'bg-amber-500/5 border-amber-500/30'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/5">
              <div className="flex items-center gap-3">
                <img src={emp.photo} alt={emp.name} className="w-11 h-11 rounded-full object-cover border border-white/10" />
                <div>
                  <div className="font-bold text-sm text-white flex items-center gap-2">
                    <span>{emp.name}</span>
                    <span className={`status-pill ${
                      emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : emp.status === 'warned' ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {emp.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-white/40">
                    {emp.vehicleType} ({emp.vehiclePlate}) • Deliveries: {emp.totalDeliveries}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-white/40">Trust Score</div>
                <div className={`font-mono font-bold text-lg ${emp.trustScore >= 75 ? 'text-emerald-400' : emp.trustScore >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {emp.trustScore} / 100
                </div>
              </div>
            </div>

            <div className="py-3 flex items-center justify-between text-xs border-b border-white/5">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="font-bold">{emp.rating}</span>
                <span className="text-white/40 text-[11px]">/ 5.0</span>
              </div>
              <div className="text-white/50">
                Customer Complaints: <strong className={emp.negativeRatingsCount > 2 ? 'text-rose-400 font-bold' : 'text-white'}>{emp.negativeRatingsCount}</strong>
              </div>
            </div>

            {/* Support Actions */}
            <div className="pt-3 flex items-center justify-end gap-2 text-xs">
              {emp.status !== 'warned' && (
                <button
                  onClick={() => handleAction(emp.id, 'warn')}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-bold transition-all flex items-center gap-1"
                >
                  <AlertTriangle className="w-3.5 h-3.5" /> Warn Partner
                </button>
              )}

              {emp.status !== 'suspended' && (
                <button
                  onClick={() => handleAction(emp.id, 'suspend')}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-bold transition-all flex items-center gap-1"
                >
                  <UserX className="w-3.5 h-3.5" /> Suspend
                </button>
              )}

              {emp.status !== 'active' && (
                <button
                  onClick={() => handleAction(emp.id, 'restore')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold transition-all flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Restore Score
                </button>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
