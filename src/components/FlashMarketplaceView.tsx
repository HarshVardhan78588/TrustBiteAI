import React, { useState, useEffect } from 'react';
import { FlashDeal, User } from '../types';
import { Zap, Clock, MapPin, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface FlashMarketplaceViewProps {
  flashDeals: FlashDeal[];
  currentUser: User | null;
  onClaimDeal: (dealId: string) => Promise<void>;
}

export const FlashMarketplaceView: React.FC<FlashMarketplaceViewProps> = ({
  flashDeals,
  currentUser,
  onClaimDeal
}) => {
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const handleClaim = async (id: string) => {
    setClaimingId(id);
    try {
      await onClaimDeal(id);
    } catch (err) {
      console.error(err);
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 shadow-2xl space-y-3 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/20 text-slate-950 font-extrabold text-xs uppercase tracking-wider backdrop-blur-md mb-2">
            <Zap className="w-3.5 h-3.5 fill-current" />
            Zero Food Waste Marketplace
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Flash Surplus Deals. <br />Up to 70% Off Prepared Meals.
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">
            When a customer cancels an order after preparation, our AI agent automatically lists the fresh meal at ultra-low prices. Claim in 1 click and get instant priority delivery!
          </p>
        </div>

        <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20 hidden md:block">
          <Zap className="w-64 h-64 text-white fill-current" />
        </div>
      </div>

      {/* Deals Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Available Surplus Meals Nearby
          </h3>
          <span className="text-xs text-amber-500 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Auto-Expiring Soon
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {flashDeals.map((deal) => {
            const isClaimed = deal.isClaimed;
            return (
              <motion.div
                key={deal.id}
                whileHover={{ y: -4 }}
                className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border overflow-hidden shadow-sm flex flex-col justify-between space-y-4 relative ${
                  isClaimed
                    ? 'border-slate-200 dark:border-slate-800 opacity-60'
                    : 'border-amber-500/40 dark:border-amber-500/30 ring-1 ring-amber-500/20'
                }`}
              >
                {/* Image & Discount Badge */}
                <div className="flex gap-4">
                  <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                    <img src={deal.image} alt={deal.itemsSummary} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] uppercase shadow-md">
                      {deal.discountPercentage}% OFF
                    </div>
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-current" /> {deal.restaurantName}
                    </div>
                    <h4 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1">
                      {deal.itemsSummary}
                    </h4>

                    <div className="flex items-center gap-2 pt-1 text-xs">
                      <span className="text-slate-400 line-through">${deal.originalPrice.toFixed(2)}</span>
                      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                        ${deal.discountedPrice.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-500" /> {deal.distanceKm} km away
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" /> Expiring soon
                      </span>
                    </div>
                  </div>
                </div>

                {/* Claim Button */}
                <div className="pt-2">
                  {isClaimed ? (
                    <div className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Claimed by Nearby User
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaim(deal.id)}
                      disabled={claimingId === deal.id}
                      className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      {claimingId === deal.id ? (
                        <span>Rerouting Delivery Partner...</span>
                      ) : (
                        <>
                          <span>Claim Flash Deal for ${deal.discountedPrice.toFixed(2)}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
