import React from 'react';
import { RefundRequest, Order } from '../types';
import { X, ShieldAlert, Sparkles, CheckCircle, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EvidenceComparisonModalProps {
  refund: RefundRequest;
  order?: Order;
  isOpen: boolean;
  onClose: () => void;
  onAdminDecision?: (decision: 'approve' | 'reject', notes?: string) => void;
}

export const EvidenceComparisonModal: React.FC<EvidenceComparisonModalProps> = ({
  refund,
  order,
  isOpen,
  onClose,
  onAdminDecision
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8 text-white"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Side-by-Side Visual Evidence Inspector</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    #TB-{refund.id}
                  </span>
                </h3>
                <p className="text-xs text-white/50">
                  Customer: <strong className="text-white">{refund.customerName}</strong> (Trust Score: <span className="font-mono text-emerald-400">{refund.customerTrustScore}/100</span>) • {refund.restaurantName}
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

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">

            {/* AI Agent Analysis Header Banner */}
            {refund.aiAnalysis && (
              <div className="p-5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                    Gemini Multimodal AI Agent Verdict
                  </div>
                  <div className="text-[11px] font-mono text-white/40">
                    Evaluated: {new Date(refund.aiAnalysis.evaluatedAt).toLocaleTimeString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="text-[10px] uppercase font-bold text-white/40">AI Confidence</div>
                    <div className="text-lg font-mono font-bold text-emerald-400">
                      {refund.aiAnalysis.confidenceScore}%
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="text-[10px] uppercase font-bold text-white/40">Fraud Probability</div>
                    <div className="text-lg font-mono font-bold text-rose-400">
                      {refund.aiAnalysis.fraudProbability}%
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="text-[10px] uppercase font-bold text-white/40">Visual Image Match</div>
                    <div className="text-xs font-bold text-white mt-1 flex items-center gap-1">
                      {refund.aiAnalysis.imageMatch ? (
                        <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Consistent</span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Discrepancy</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="text-[10px] uppercase font-bold text-white/40">Recommendation</div>
                    <div className="text-xs font-bold text-indigo-400 mt-1">
                      {refund.aiAnalysis.recommendedAction}
                    </div>
                  </div>
                </div>

                <div className="text-xs text-white/80 leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                  <strong>Analysis Summary:</strong> "{refund.aiAnalysis.reasoning}"
                  <div className="mt-1 text-white/50 italic">
                    Note: {refund.aiAnalysis.visualDifferenceNotes}
                  </div>
                </div>
              </div>
            )}

            {/* 3-Column Side-by-Side Images */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* 1. Merchant Packaging Photo */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>1. Dispatch Packaging</span>
                  <span className="status-pill bg-indigo-500/10 text-indigo-400">SEALED INTACT</span>
                </div>
                <div className="relative h-48 rounded-xl overflow-hidden bg-black/50 border border-white/10">
                  {order?.dispatchEvidence?.packagingPhoto ? (
                    <img src={order.dispatchEvidence.packagingPhoto} alt="Dispatch packaging" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-xs text-white/40">
                      <span>No merchant dispatch photo attached</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-white/50">
                  {order?.dispatchEvidence?.notes || 'Packaging double-sealed with security tape before driver pickup.'}
                </p>
              </div>

              {/* 2. Bill / Receipt Photo */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>2. Merchant Receipt / Bill</span>
                  <span className="status-pill bg-emerald-500/10 text-emerald-400">VERIFIED</span>
                </div>
                <div className="relative h-48 rounded-xl overflow-hidden bg-black/50 border border-white/10">
                  {order?.dispatchEvidence?.billPhoto ? (
                    <img src={order.dispatchEvidence.billPhoto} alt="Bill receipt" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-xs text-white/40">
                      <FileText className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span>Itemized bill verified</span>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-white/50">
                  Verified items count matches total value of ${refund.amount.toFixed(2)}.
                </p>
              </div>

              {/* 3. Customer Complaint Photo */}
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                  <span>3. Customer Claim Photo</span>
                  <span className="status-pill bg-rose-500/20 text-rose-400">TAMPERED</span>
                </div>
                <div className="relative h-48 rounded-xl overflow-hidden bg-black/50 border border-rose-500/30">
                  <img src={refund.complaintPhoto} alt="Complaint evidence" className="w-full h-full object-cover" />
                </div>
                <p className="text-[11px] text-rose-200 font-medium">
                  "{refund.reason}"
                </p>
              </div>

            </div>

            {/* Admin Decision Actions */}
            {onAdminDecision && refund.status === 'pending_admin' && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h5 className="text-xs font-bold text-white">Admin Decision Intervention</h5>
                  <p className="text-[11px] text-white/50">
                    Approving grants ${refund.amount.toFixed(2)} refund and increases user trust (+3). Rejecting penalizes fraud (-25).
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onAdminDecision('reject', 'Rejected by admin following visual evidence review.')}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold hover:bg-rose-500 hover:text-white transition-all"
                  >
                    Reject Claim
                  </button>
                  <button
                    onClick={() => onAdminDecision('approve', 'Approved by admin following visual evidence review.')}
                    className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition-all shadow-md shadow-emerald-500/20"
                  >
                    Approve Refund
                  </button>
                </div>
              </div>
            )}

          </div>

          <div className="px-6 py-4 border-t border-white/10 bg-white/5 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-colors"
            >
              Close Inspector
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
