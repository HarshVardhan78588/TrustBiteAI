import React, { useState, useEffect } from 'react';
import { UserRole, User, Restaurant, Order, RefundRequest, FlashDeal, DriverApplication, AdminStats, MenuItem, NotificationItem, Employee } from './types';
import { Header } from './components/Header';
import { CustomerView } from './components/CustomerView';
import { RestaurantView } from './components/RestaurantView';
import { AdminView } from './components/AdminView';
import { FlashMarketplaceView } from './components/FlashMarketplaceView';
import { DriverHiringView } from './components/DriverHiringView';
import { CustomerProfileView } from './components/CustomerProfileView';
import { LoginModal } from './components/LoginModal';
import { RefundRequestModal } from './components/RefundRequestModal';
import { EvidenceComparisonModal } from './components/EvidenceComparisonModal';
import { ShoppingBag, X, Plus, Minus, ArrowRight, Loader2 } from 'lucide-react';
import { getSocket } from './services/socketService';
import {
  getCurrentUser,
  fetchOrders,
  fetchRefunds,
  fetchUsers,
  fetchEmployees,
  fetchNotifications,
  fetchAdminStats,
  fetchFlashDeals,
  createOrder,
  submitRefund,
  reviewRefund,
  updateTrustScore
} from './services/apiService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [activeTab, setActiveTab] = useState<string>('home');

  // Modals & Authentication
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [drivers, setDrivers] = useState<DriverApplication[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cart State
  const [cart, setCart] = useState<{ menuItem: MenuItem; restaurantId: string; restaurantName: string; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Modal State
  const [activeRefundModalOrder, setActiveRefundModalOrder] = useState<Order | null>(null);
  const [activeEvidenceModalRefund, setActiveEvidenceModalRefund] = useState<RefundRequest | null>(null);

  // Load all data from full-stack Express API
  const loadAllData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
        if (user.role === 'support' || user.role === 'admin') {
          setCurrentRole('support');
          setActiveTab('admin_dash');
        }
      } else {
        // If no user authenticated, open login modal
        setIsAuthModalOpen(true);
      }

      const [oList, refList, uList, empList, notifList, stList, fList] = await Promise.all([
        fetchOrders(),
        fetchRefunds(),
        fetchUsers(),
        fetchEmployees(),
        fetchNotifications(),
        fetchAdminStats(),
        fetchFlashDeals()
      ]);

      setOrders(oList || []);
      setRefunds(refList || []);
      setUsers(uList || []);
      setEmployees(empList || []);
      setNotifications(notifList || []);
      setStats(stList);
      setFlashDeals(fList || []);

      // Fetch sample restaurants from backend
      const resRest = await fetch('/api/restaurants');
      if (resRest.ok) {
        const restData = await resRest.json();
        setRestaurants(restData);
      }
    } catch (err) {
      console.error('Error fetching backend state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    // Socket.IO Real-Time Listener Integration
    const socket = getSocket();

    socket.on('initial_data', (data) => {
      if (data.orders) setOrders(data.orders);
      if (data.refunds) setRefunds(data.refunds);
      if (data.notifications) setNotifications(data.notifications);
      if (data.users) setUsers(data.users);
      if (data.employees) setEmployees(data.employees);
    });

    socket.on('order_created', (newOrder: Order) => {
      setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
      fetchAdminStats().then(setStats);
    });

    socket.on('order_updated', (updatedOrder: Order) => {
      setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    });

    socket.on('refund_submitted', (newRefund: RefundRequest) => {
      setRefunds(prev => [newRefund, ...prev.filter(r => r.id !== newRefund.id)]);
      fetchAdminStats().then(setStats);
    });

    socket.on('refund_updated', (updatedRefund: RefundRequest) => {
      setRefunds(prev => prev.map(r => r.id === updatedRefund.id ? updatedRefund : r));
      fetchAdminStats().then(setStats);
    });

    socket.on('trust_updated', ({ userId, newScore, user }: any) => {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, trustScore: newScore, ...user } : u));
      if (currentUser && currentUser.id === userId) {
        setCurrentUser(prev => prev ? { ...prev, trustScore: newScore, ...user } : null);
      }
      fetchAdminStats().then(setStats);
    });

    socket.on('notification_created', (newNotif: NotificationItem) => {
      setNotifications(prev => [newNotif, ...prev]);
    });

    socket.on('employee_updated', (updatedEmp: Employee) => {
      setEmployees(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
    });

    return () => {
      socket.off('initial_data');
      socket.off('order_created');
      socket.off('order_updated');
      socket.off('refund_submitted');
      socket.off('refund_updated');
      socket.off('trust_updated');
      socket.off('notification_created');
      socket.off('employee_updated');
    };
  }, []);

  const handleAuthSuccess = (user: User, token: string) => {
    setCurrentUser(user);
    if (user.role === 'support' || user.role === 'admin') {
      setCurrentRole('support');
      setActiveTab('admin_dash');
    } else {
      setCurrentRole('customer');
      setActiveTab('home');
    }
    loadAllData();
  };

  const handleLogout = () => {
    localStorage.removeItem('trustbite_token');
    setCurrentUser(null);
    setIsAuthModalOpen(true);
  };

  // Cart operations
  const handleAddToCart = (item: MenuItem, restaurant: Restaurant) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItem.id === item.id);
      if (existing) {
        return prev.map((i) => i.menuItem.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { menuItem: item, restaurantId: restaurant.id, restaurantName: restaurant.name, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev.map((i) => {
        if (i.menuItem.id === itemId) {
          const newQty = i.quantity + delta;
          return newQty > 0 ? { ...i, quantity: newQty } : null;
        }
        return i;
      }).filter(Boolean) as any;
    });
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || !currentUser || !restaurants[0]) return;
    try {
      const firstCartItem = cart[0];
      await createOrder({
        customerId: currentUser.id,
        restaurantId: firstCartItem.restaurantId,
        items: cart.map(c => ({ menuItem: c.menuItem, quantity: c.quantity })),
        deliveryFee: 3.50,
        address: currentUser.address
      });

      setCart([]);
      setIsCartOpen(false);
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  // Submit Refund
  const handleSubmitRefund = async (payload: { orderId: string; reason: string; complaintPhoto: string; customerNotes?: string }) => {
    const refundRes = await submitRefund(payload);
    return refundRes;
  };

  // Review Refund (Admin)
  const handleAdminRefundDecision = async (refundId: string, decision: 'approve' | 'reject', notes?: string) => {
    try {
      await reviewRefund(refundId, decision, notes || '');
      setActiveEvidenceModalRefund(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Update Trust Score (Admin manual)
  const handleUpdateTrustScore = async (userId: string, delta: number, reason: string) => {
    try {
      await updateTrustScore(userId, delta, reason);
    } catch (err) {
      console.error(err);
    }
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.menuItem.price * item.quantity), 0);
  const grandTotal = cart.length > 0 ? cartTotal + 3.50 : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-xs font-bold tracking-wider uppercase text-white/50">Booting TrustBite Multi-Laptop Mesh...</p>
      </div>
    );
  }

  const isSupportUser = currentUser?.role === 'support' || currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Header */}
      <Header
        currentRole={currentRole}
        onSelectRole={(r) => {
          if (isSupportUser && r === 'customer') return; // Enforce Support Routing
          setCurrentRole(r);
          if (r === 'customer') setActiveTab('home');
          else if (r === 'restaurant') setActiveTab('restaurant_dash');
          else if (r === 'support' || r === 'admin') setActiveTab('admin_dash');
          else if (r === 'driver') setActiveTab('driver_hiring');
        }}
        currentUser={currentUser}
        cartItemCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (isSupportUser && tab !== 'admin_dash') return; // Enforce Support Routing
          setActiveTab(tab);
        }}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* SUPPORT ROUTING ENFORCEMENT */}
        {isSupportUser ? (
          <AdminView
            stats={stats}
            refunds={refunds}
            drivers={drivers}
            users={users}
            notifications={notifications}
            employees={employees}
            onInspectRefund={(ref) => setActiveEvidenceModalRefund(ref)}
            onAdminRefundDecision={handleAdminRefundDecision}
            onApproveDriver={() => loadAllData()}
            onUpdateTrustScore={handleUpdateTrustScore}
            onRefreshData={loadAllData}
          />
        ) : (
          <>
            {/* Customer Store View */}
            {activeTab === 'home' && (
              <CustomerView
                restaurants={restaurants}
                currentUser={currentUser || users[0]}
                orders={orders.filter(o => currentUser ? o.customerId === currentUser.id : true)}
                refunds={refunds.filter(r => currentUser ? r.customerId === currentUser.id : true)}
                cart={cart}
                onAddToCart={handleAddToCart}
                onUpdateCartQty={handleUpdateCartQty}
                onPlaceOrder={() => setIsCartOpen(true)}
                onRequestRefund={(ord) => setActiveRefundModalOrder(ord)}
                onOpenFlashDeals={() => setActiveTab('flash')}
              />
            )}

            {/* Customer Profile View */}
            {activeTab === 'profile' && currentUser && (
              <CustomerProfileView
                user={currentUser}
                userRefunds={refunds.filter(r => r.customerId === currentUser.id)}
              />
            )}

            {/* Flash Deals View */}
            {activeTab === 'flash' && (
              <FlashMarketplaceView
                flashDeals={flashDeals}
                currentUser={currentUser}
                onClaimDeal={() => loadAllData()}
              />
            )}

            {/* Restaurant View Simulation */}
            {activeTab === 'restaurant_dash' && (
              <RestaurantView
                restaurant={restaurants[0] || { name: 'Artisan Pizza', id: 'rest_1' }}
                orders={orders}
                refunds={refunds}
                onUploadDispatchEvidence={() => loadAllData()}
                onCreateFlashDeal={() => loadAllData()}
                onUpdateOrderStatus={() => loadAllData()}
                onInspectRefund={(ref) => setActiveEvidenceModalRefund(ref)}
              />
            )}

            {/* Driver Hiring View */}
            {activeTab === 'driver_hiring' && (
              <DriverHiringView
                drivers={drivers}
                onApplyDriver={() => loadAllData()}
              />
            )}
          </>
        )}

      </main>

      {/* Cart Drawer */}
      {isCartOpen && !isSupportUser && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#0a0a0a] text-white h-full border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-indigo-400" />
                  Your Food Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
                </h3>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/40"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center text-white/40 space-y-2">
                  <ShoppingBag className="w-12 h-12 mx-auto opacity-30" />
                  <p className="text-xs">Your cart is empty. Browse restaurants to add dishes!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.menuItem.id} className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5 flex-1">
                        <div className="font-bold text-white">{item.menuItem.name}</div>
                        <div className="text-[11px] text-white/40">${item.menuItem.price.toFixed(2)} each</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateCartQty(item.menuItem.id, -1)}
                          className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-bold text-white px-1">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateCartQty(item.menuItem.id, 1)}
                          className="p-1 rounded-lg bg-white/10 text-white hover:bg-white/20"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="pt-4 border-t border-white/10 space-y-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-white/60">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>Delivery Fee</span>
                    <span>$3.50</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-white pt-2 border-t border-white/10">
                    <span>Total</span>
                    <span className="text-emerald-400">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  Place Order & Reserve Food <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Auth Modal */}
      <LoginModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Customer Refund Modal */}
      {activeRefundModalOrder && (
        <RefundRequestModal
          order={activeRefundModalOrder}
          isOpen={!!activeRefundModalOrder}
          onClose={() => setActiveRefundModalOrder(null)}
          onSubmitRefund={handleSubmitRefund}
        />
      )}

      {/* Evidence Comparison Modal */}
      {activeEvidenceModalRefund && (
        <EvidenceComparisonModal
          refund={activeEvidenceModalRefund}
          order={orders.find(o => o.id === activeEvidenceModalRefund.orderId)}
          isOpen={!!activeEvidenceModalRefund}
          onClose={() => setActiveEvidenceModalRefund(null)}
          onAdminDecision={(dec, notes) => handleAdminRefundDecision(activeEvidenceModalRefund.id, dec, notes)}
        />
      )}

    </div>
  );
}
