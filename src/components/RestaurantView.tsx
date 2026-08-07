import React, { useState } from 'react';
import { Order, RefundRequest, Restaurant } from '../types';
import { SAMPLE_DISPATCH_PHOTOS } from '../mockData';
import { Store, Upload, CheckCircle2, Clock, ShieldAlert, Zap, Camera, FileText, ArrowRight, X } from 'lucide-react';
import { motion } from 'motion/react';

interface RestaurantViewProps {
  restaurant: Restaurant;
  orders: Order[];
  refunds: RefundRequest[];
  onUploadDispatchEvidence: (orderId: string, evidence: { packagingPhoto: string; billPhoto: string; notes?: string }) => void;
  onCreateFlashDeal: (orderId: string, discountPercentage: number) => void;
  onUpdateOrderStatus: (orderId: string, status: string) => void;
  onInspectRefund: (refund: RefundRequest) => void;
}

export const RestaurantView: React.FC<RestaurantViewProps> = ({
  restaurant,
  orders,
  refunds,
  onUploadDispatchEvidence,
  onCreateFlashDeal,
  onUpdateOrderStatus,
  onInspectRefund
}) => {
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<Order | null>(null);
  const [packagingPhoto, setPackagingPhoto] = useState<string>(SAMPLE_DISPATCH_PHOTOS.sealedBag);
  const [billPhoto, setBillPhoto] = useState<string>(SAMPLE_DISPATCH_PHOTOS.neatReceipt);
  const [dispatchNotes, setDispatchNotes] = useState('Sealed tamper-proof packaging with verified receipt attached.');
  const [discountPct, setDiscountPct] = useState(60);

  const restaurantOrders = orders.filter(o => o.restaurantId === restaurant.id || true); // Default to all for demo
  const restaurantRefunds = refunds.filter(r => r.restaurantId === restaurant.id || true);

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForDispatch) return;
    onUploadDispatchEvidence(selectedOrderForDispatch.id, {
      packagingPhoto,
      billPhoto,
      notes: dispatchNotes
    });
    setSelectedOrderForDispatch(null);
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Restaurant Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img src={restaurant.image} alt={restaurant.name} className="w-16 h-16 rounded-2xl object-cover border border-slate-700" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold">{restaurant.name}</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">
                Merchant Portal
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{restaurant.address} • Merchant Trust Score: <strong className="text-emerald-400">{restaurant.trustScore}%</strong></p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">Active Kitchen Orders</div>
            <div className="text-2xl font-black text-emerald-400">
              {restaurantOrders.filter(o => o.status !== 'delivered').length}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Management Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Kitchen Live Dispatch Queue
          </h3>
          <span className="text-xs text-slate-400">Upload packaging & bill evidence before dispatch to lock AI fraud immunity.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurantOrders.map((ord) => (
            <div
              key={ord.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">#{ord.id}</span>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{ord.customerName} (Trust: {ord.customerTrustScore}/100)</div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    ord.status === 'dispatched' || ord.status === 'delivered'
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                  }`}>
                    {ord.status}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1 text-xs">
                  {ord.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between text-slate-700 dark:text-slate-300">
                      <span>{i.quantity}x {i.menuItem.name}</span>
                      <span className="font-semibold">${(i.menuItem.price * i.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between font-extrabold text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-800">
                    <span>Total Amount</span>
                    <span className="text-emerald-600 dark:text-emerald-400">${ord.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Dispatch Evidence Badge */}
                {ord.dispatchEvidence ? (
                  <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                    <div>
                      <strong className="block text-[11px] uppercase tracking-wider">Dispatch Evidence Uploaded</strong>
                      <span className="text-[10px] opacity-80">{new Date(ord.dispatchEvidence.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Evidence pending prior to dispatch</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-2">
                {!ord.dispatchEvidence && ord.status !== 'delivered' && (
                  <button
                    onClick={() => {
                      setSelectedOrderForDispatch(ord);
                      setPackagingPhoto(SAMPLE_DISPATCH_PHOTOS.sealedBag);
                      setBillPhoto(SAMPLE_DISPATCH_PHOTOS.neatReceipt);
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Dispatch Photo & Bill
                  </button>
                )}

                {ord.dispatchEvidence && ord.status === 'dispatched' && (
                  <button
                    onClick={() => onUpdateOrderStatus(ord.id, 'delivered')}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all"
                  >
                    Mark Delivered
                  </button>
                )}

                {/* Canceled or leftover order -> List on Flash Deals */}
                {(ord.status === 'placed' || ord.status === 'preparing') && (
                  <button
                    onClick={() => onCreateFlashDeal(ord.id, discountPct)}
                    className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/30 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    List in Flash Deals (Cancel / Reroute)
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* Dispatch Evidence Upload Modal */}
      {selectedOrderForDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-500" />
                Upload Dispatch Evidence for #{selectedOrderForDispatch.id}
              </h3>
              <button
                onClick={() => setSelectedOrderForDispatch(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-5">
              
              {/* 1. Packaging Photo */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  1. Packaging Photo (Tamper-proof Seal)
                </label>
                <div className="flex items-center gap-4">
                  <img src={packagingPhoto} alt="Packaging sample" className="w-24 h-24 rounded-2xl object-cover border border-slate-300 dark:border-slate-700" />
                  <div className="space-y-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setPackagingPhoto(SAMPLE_DISPATCH_PHOTOS.intactBox)}
                      className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200"
                    >
                      Use Box Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPackagingPhoto(SAMPLE_DISPATCH_PHOTOS.sealedBag)}
                      className="ml-2 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200"
                    >
                      Use Sealed Bag
                    </button>
                    <p className="text-[11px] text-slate-400">Guarantees proof of sealed food prior to driver pickup.</p>
                  </div>
                </div>
              </div>

              {/* 2. Bill Photo */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  2. Bill / Itemized Receipt Photo
                </label>
                <div className="flex items-center gap-4">
                  <img src={billPhoto} alt="Bill sample" className="w-24 h-24 rounded-2xl object-cover border border-slate-300 dark:border-slate-700" />
                  <div className="space-y-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setBillPhoto(SAMPLE_DISPATCH_PHOTOS.neatReceipt)}
                      className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200"
                    >
                      Use Receipt Photo
                    </button>
                    <p className="text-[11px] text-slate-400">Gemini AI agent reads bill line-items automatically.</p>
                  </div>
                </div>
              </div>

              {/* Dispatch Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Dispatch Notes
                </label>
                <input
                  type="text"
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForDispatch(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20"
                >
                  Confirm & Lock Evidence
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Merchant Refund Dispute Logs */}
      {restaurantRefunds.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Refund Claims & AI Verdicts
          </h3>

          <div className="space-y-3">
            {restaurantRefunds.map((ref) => (
              <div
                key={ref.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">Refund #{ref.id}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">• Order #{ref.orderId}</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">"{ref.reason}"</p>
                  <div className="text-[11px] text-slate-400">
                    Status: <strong className="text-slate-700 dark:text-slate-200 uppercase">{ref.status}</strong> • Amount: ${ref.amount.toFixed(2)}
                  </div>
                </div>

                <button
                  onClick={() => onInspectRefund(ref)}
                  className="px-4 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/30 shrink-0"
                >
                  Inspect Evidence
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
