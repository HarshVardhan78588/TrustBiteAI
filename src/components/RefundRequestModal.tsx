import React, { useState } from 'react';
import { Order, RefundRequest } from '../types';
import { SAMPLE_COMPLAINT_PHOTOS } from '../mockData';
import { X, ShieldAlert, Sparkles, AlertCircle, CheckCircle2, ArrowRight, Loader2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RefundRequestModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSubmitRefund: (payload: { orderId: string; reason: string; complaintPhoto: string; customerNotes?: string }) => Promise<RefundRequest>;
}

export const RefundRequestModal: React.FC<RefundRequestModalProps> = ({
  order,
  isOpen,
  onClose,
  onSubmitRefund
}) => {
  const [reason, setReason] = useState('Spilled soup and damaged packaging during transit');
  const [customerNotes, setCustomerNotes] = useState('Packaging arrived soaked and torn.');
  const [selectedPhoto, setSelectedPhoto] = useState<string>(SAMPLE_COMPLAINT_PHOTOS.spilledSoup);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [resultRefund, setResultRefund] = useState<RefundRequest | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSelectedPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setErrorMsg('');
    try {
      const finalPhoto = customPhotoUrl.trim() || selectedPhoto;
      const res = await onSubmitRefund({
        orderId: order.id,
        reason,
        complaintPhoto: finalPhoto,
        customerNotes
      });
      setResultRefund(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Refund submission error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8 text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  AI Trust-Verified Refund Engine
                </h3>
                <p className="text-xs text-white/50">
                  Order #{order.id} • {order.restaurantName} • ${order.total.toFixed(2)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/40 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!resultRefund ? (
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* User Trust Banner */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Your Trust Level</div>
                  <div className="text-base font-mono font-bold text-emerald-400 flex items-center gap-2">
                    <span>{order.customerTrustScore} / 100</span>
                    {order.customerTrustScore >= 75 && (
                      <span className="status-pill bg-emerald-500/10 text-emerald-400">
                        INSTANT REFUND ELIGIBLE
                      </span>
                    )}
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>

              {/* Complaint Reason */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
                  Select Complaint Reason
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    'Spilled soup and damaged packaging during transit',
                    'Wrong food item delivered in box',
                    'Missing item from order list',
                    'Food delivered cold or inedible'
                  ].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setReason(r);
                        if (r.includes('Spilled')) setSelectedPhoto(SAMPLE_COMPLAINT_PHOTOS.spilledSoup);
                        else if (r.includes('Wrong')) setSelectedPhoto(SAMPLE_COMPLAINT_PHOTOS.wrongPizza);
                        else setSelectedPhoto(SAMPLE_COMPLAINT_PHOTOS.missingItem);
                      }}
                      className={`p-3 text-left rounded-xl text-xs border transition-all ${
                        reason === r
                          ? 'border-indigo-500 bg-indigo-500/10 text-white font-semibold'
                          : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Complaint Photo Picker */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
                  Attach Complaint Evidence Photo
                </label>
                
                {/* Preset sample buttons for fast hackathon demo */}
                <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                  <span className="text-[11px] text-white/40 font-mono whitespace-nowrap">PRESETS:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(SAMPLE_COMPLAINT_PHOTOS.spilledSoup)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 text-white/80 text-[11px] hover:bg-white/20 whitespace-nowrap"
                  >
                    🍲 Spilled Soup
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPhoto(SAMPLE_COMPLAINT_PHOTOS.wrongPizza)}
                    className="px-2.5 py-1 rounded-lg bg-white/10 text-white/80 text-[11px] hover:bg-white/20 whitespace-nowrap"
                  >
                    🍕 Wrong Item Delivered
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden border border-white/10 bg-black/50 flex flex-col items-center justify-center p-2">
                    {selectedPhoto ? (
                      <img src={selectedPhoto} alt="Evidence" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="w-8 h-8 text-white/30 mx-auto mb-1" />
                        <span className="text-[11px] text-white/40">No image chosen</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors">
                      <ImageIcon className="w-4 h-4" />
                      Upload From Device
                      <input type="file" accept="image/*" onChange={handleCustomImageUpload} className="hidden" />
                    </label>
                    <p className="text-[11px] text-white/40">
                      Gemini Agent compares this complaint photo directly against the merchant dispatch packaging photo & receipt.
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder="Provide context regarding the issue..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-xs focus:border-indigo-500 outline-none"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white/50 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Evaluating with Gemini AI...
                    </>
                  ) : (
                    <>
                      Submit & Run AI Verification
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          ) : (
            /* AI Agent Result Display */
            <div className="p-6 space-y-6">
              
              <div className="text-center py-4 space-y-2">
                {resultRefund.status === 'approved_auto' ? (
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center animate-bounce border border-emerald-500/30">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center border border-amber-500/30">
                    <ShieldAlert className="w-8 h-8" />
                  </div>
                )}

                <h4 className="text-lg font-bold text-white">
                  {resultRefund.status === 'approved_auto'
                    ? 'Instant Refund Approved!'
                    : 'Escalated to Admin Review Queue'}
                </h4>
                
                <p className="text-xs text-white/60 max-w-md mx-auto">
                  {resultRefund.status === 'approved_auto'
                    ? `Verified user trust score (${resultRefund.customerTrustScore}/100) and consistent evidence. $${resultRefund.amount.toFixed(2)} refunded instantly.`
                    : `Logged for inspection. Our Fraud Agent flagged this case for manual inspector sign-off.`}
                </p>
              </div>

              {/* AI Metrics Grid */}
              {resultRefund.aiAnalysis && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
                    <span className="font-semibold text-white/80 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      Gemini Agent Evaluation
                    </span>
                    <span className="font-mono text-white/40">
                      {new Date(resultRefund.aiAnalysis.evaluatedAt).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                      <div className="text-[10px] text-white/40 uppercase font-bold">Confidence Score</div>
                      <div className="text-base font-mono font-bold text-emerald-400">
                        {resultRefund.aiAnalysis.confidenceScore}%
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10">
                      <div className="text-[10px] text-white/40 uppercase font-bold">Fraud Risk</div>
                      <div className="text-base font-mono font-bold text-amber-400">
                        {resultRefund.aiAnalysis.fraudProbability}%
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-white/40 uppercase font-bold">Recommended Action</div>
                      <div className="text-xs font-bold text-indigo-400 mt-1">
                        {resultRefund.aiAnalysis.recommendedAction}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-white/70 leading-relaxed pt-1">
                    <strong className="text-white">AI Reasoning:</strong>{' '}
                    "{resultRefund.aiAnalysis.reasoning}"
                  </div>
                </div>
              )}

              <div className="pt-2 text-right">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-white/90 transition-opacity"
                >
                  Done
                </button>
              </div>

            </div>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
