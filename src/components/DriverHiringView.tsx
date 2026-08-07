import React, { useState } from 'react';
import { DriverApplication } from '../types';
import { Bike, ShieldCheck, Sparkles, CheckCircle2, ArrowRight, Upload, AlertCircle, FileText } from 'lucide-react';
import { motion } from 'motion/react';

interface DriverHiringViewProps {
  drivers: DriverApplication[];
  onApplyDriver: (payload: any) => Promise<DriverApplication>;
}

export const DriverHiringView: React.FC<DriverHiringViewProps> = ({
  drivers,
  onApplyDriver
}) => {
  const [driverName, setDriverName] = useState('Marcus Vance');
  const [email, setEmail] = useState('marcus.v@example.com');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [licenseNumber, setLicenseNumber] = useState('DL-993821-NY');
  const [vehicleType, setVehicleType] = useState('Electric Scooter');
  const [vehiclePlate, setVehiclePlate] = useState('NY-EV-481');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedDriver, setSubmittedDriver] = useState<DriverApplication | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await onApplyDriver({
        driverName,
        email,
        phone,
        licenseNumber,
        licensePhoto: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400',
        idPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        vehicleType,
        vehiclePlate
      });
      setSubmittedDriver(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-2xl space-y-3 relative overflow-hidden border border-slate-800">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-400 font-bold text-xs border border-teal-500/30">
            <Bike className="w-3.5 h-3.5" />
            AI-Powered Driver Onboarding
          </div>
          <h1 className="text-3xl font-black">
            Join the TrustBite AI Delivery Fleet
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Instant Gemini AI document verification. Get approved in under 2 minutes without physical office visits.
          </p>
        </div>
      </div>

      {/* Driver Onboarding Form or Result */}
      {!submittedDriver ? (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Driver Candidate Profile & License Upload
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Driving License Number</label>
              <input
                type="text"
                required
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Vehicle Type</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="Electric Scooter">Electric Scooter</option>
                <option value="Bicycle">Bicycle / e-Bike</option>
                <option value="Motorcycle">Motorcycle</option>
                <option value="Car / EV">Car / Electric Vehicle</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 dark:text-slate-400 mb-1">Vehicle License Plate</label>
              <input
                type="text"
                required
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-700 dark:text-teal-300 flex items-center gap-3">
            <Sparkles className="w-5 h-5 shrink-0" />
            <span>Driver License Photo & Identity Document will be analyzed in real time by Gemini Driver Verification Agent.</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-teal-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Running Gemini Document Verification...</span>
            ) : (
              <>
                <span>Submit Application for AI Verification</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>
      ) : (
        /* Result */
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-500 mx-auto flex items-center justify-center animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              AI Verification Passed ({submittedDriver.aiVerification?.completenessScore}% Completeness)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your license ({submittedDriver.licenseNumber}) and identity document passed all Gemini AI security rules.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border text-xs text-slate-700 dark:text-slate-300 text-left space-y-2">
            <div className="font-bold text-slate-900 dark:text-white">AI Agent Rationale:</div>
            <p>{submittedDriver.aiVerification?.reasoning}</p>
          </div>

          <button
            onClick={() => setSubmittedDriver(null)}
            className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs"
          >
            Apply Another Driver
          </button>
        </div>
      )}

    </div>
  );
};
