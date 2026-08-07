import React, { useState } from 'react';
import { Restaurant, MenuItem, Order, User, RefundRequest } from '../types';
import { Search, Star, Clock, ShieldCheck, ShoppingBag, Sparkles, Plus, Minus, ArrowRight, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface CustomerViewProps {
  restaurants: Restaurant[];
  currentUser: User | null;
  orders: Order[];
  refunds: RefundRequest[];
  cart: { menuItem: MenuItem; restaurantId: string; restaurantName: string; quantity: number }[];
  onAddToCart: (item: MenuItem, restaurant: Restaurant) => void;
  onUpdateCartQty: (itemId: string, delta: number) => void;
  onPlaceOrder: () => void;
  onRequestRefund: (order: Order) => void;
  onOpenFlashDeals: () => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  restaurants,
  currentUser,
  orders,
  refunds,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onPlaceOrder,
  onRequestRefund,
  onOpenFlashDeals
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  const categories = ['All', 'Pizzas', 'Ramen', 'Bowls', 'Pastas', 'Desserts'];

  const filteredRestaurants = restaurants.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisine.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedCategory === 'All') return matchesSearch;
    return matchesSearch && r.menu.some(m => m.category.toLowerCase().includes(selectedCategory.toLowerCase()));
  });

  const cartTotal = cart.reduce((acc, item) => acc + (item.menuItem.price * item.quantity), 0);
  const deliveryFee = cart.length > 0 ? 3.50 : 0;
  const grandTotal = cartTotal + deliveryFee;

  const userOrders = orders.filter(o => o.customerId === currentUser?.id || currentUser?.role === 'customer');

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Banner with Glassmorphism */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-8 sm:p-10 shadow-2xl border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Verified Food Guarantee
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-none">
            Delicious Food, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
              Zero Refund Friction.
            </span>
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Order from top curated kitchens. High Trust Score users enjoy <strong className="text-white">Instant AI-Approved Refunds</strong> without waiting days for support ticket resolution.
          </p>

          {/* Flash Deals Callout */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenFlashDeals}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/25 transition-all active:scale-95"
            >
              <Zap className="w-4 h-4 fill-current" />
              Explore Flash Deals (Up to 70% Off)
            </button>
          </div>
        </div>

        {/* Decorative Glass Badge */}
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-80 p-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Your Trust Level</div>
              <div className="text-xs text-emerald-300 font-semibold">{currentUser?.trustScore || 80}/100 Score</div>
            </div>
          </div>
          <p className="text-[11px] text-slate-300 leading-normal">
            Verified Merchant Dispatch Evidence + Gemini Vision Agent means genuine claims get refunded in &lt;5 seconds.
          </p>
        </div>
      </section>

      {/* Active Orders & Refund Status Bar */}
      {userOrders.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Recent Orders & Live Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userOrders.slice(0, 2).map((ord) => {
              const existingRefund = refunds.find(r => r.orderId === ord.id);
              return (
                <div
                  key={ord.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">#{ord.id}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">• {ord.restaurantName}</span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      ${ord.total.toFixed(2)} • {ord.items.length} items
                    </div>
                    
                    <div className="flex items-center gap-2 pt-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        ord.status === 'delivered' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                      }`}>
                        {ord.status}
                      </span>
                      {existingRefund && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          existingRefund.status === 'approved_auto' || existingRefund.status === 'approved_admin'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}>
                          Refund: {existingRefund.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {ord.status === 'delivered' && !existingRefund && (
                    <button
                      onClick={() => onRequestRefund(ord)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all shadow-sm shrink-0"
                    >
                      Request Refund
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Search Bar & Category Chips */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pizza, ramen, sushi..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl font-medium transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Restaurant Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRestaurants.map((rest) => (
          <motion.div
            key={rest.id}
            whileHover={{ y: -4 }}
            className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col"
            onClick={() => setSelectedRestaurant(rest)}
          >
            {/* Image & Trust Badge Overlay */}
            <div className="relative h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
              <img
                src={rest.image}
                alt={rest.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                Merchant Trust: {rest.trustScore}%
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
                <span className="flex items-center gap-1 bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <strong className="text-white">{rest.rating}</strong> ({rest.reviewsCount})
                </span>
                <span className="flex items-center gap-1 bg-slate-950/60 backdrop-blur-md px-2.5 py-1 rounded-lg">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {rest.deliveryTime}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  {rest.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {rest.cuisine.join(' • ')}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <span className="text-[11px] text-slate-400">{rest.menu.length} signature dishes</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  View Menu <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Restaurant Menu Modal */}
      {selectedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="relative h-44 bg-slate-900 shrink-0">
              <img src={selectedRestaurant.image} alt={selectedRestaurant.name} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <button
                onClick={() => setSelectedRestaurant(null)}
                className="absolute top-4 right-4 p-2 bg-slate-950/60 text-white rounded-full hover:bg-slate-900 transition-colors"
              >
                ✕
              </button>

              <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                <h2 className="text-2xl font-black">{selectedRestaurant.name}</h2>
                <p className="text-xs text-slate-300">{selectedRestaurant.cuisine.join(', ')} • {selectedRestaurant.address}</p>
              </div>
            </div>

            {/* Menu List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Menu & Signature Dishes
              </h4>

              <div className="space-y-3">
                {selectedRestaurant.menu.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{item.name}</span>
                        {item.isPopular && (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.description}</p>
                      <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 pt-1">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                      <button
                        onClick={() => onAddToCart(item, selectedRestaurant)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Cart Summary Floating Bar if Items present */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4">
          <div className="p-4 rounded-2xl bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-700 text-white shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </div>
              <div>
                <div className="text-xs text-slate-400">Total Amount</div>
                <div className="text-base font-extrabold text-white">${grandTotal.toFixed(2)}</div>
              </div>
            </div>

            <button
              onClick={onPlaceOrder}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2"
            >
              Checkout Order <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
