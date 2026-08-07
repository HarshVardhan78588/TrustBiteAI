import { User, Restaurant, Order, RefundRequest, FlashDeal, DriverApplication, AdminStats } from '../types';

export const API = {
  async getUsers(): Promise<User[]> {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async getCurrentUser(): Promise<User> {
    const res = await fetch('/api/users/current');
    if (!res.ok) throw new Error('Failed to fetch current user');
    return res.json();
  },

  async getRestaurants(): Promise<Restaurant[]> {
    const res = await fetch('/api/restaurants');
    if (!res.ok) throw new Error('Failed to fetch restaurants');
    return res.json();
  },

  async getOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async createOrder(payload: {
    customerId: string;
    restaurantId: string;
    items: { menuItem: any; quantity: number }[];
    deliveryFee: number;
    address?: string;
  }): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  async dispatchOrder(orderId: string, evidence: { packagingPhoto: string; billPhoto: string; notes?: string }): Promise<Order> {
    const res = await fetch(`/api/orders/${orderId}/dispatch`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(evidence)
    });
    if (!res.ok) throw new Error('Failed to upload dispatch evidence');
    return res.json();
  },

  async updateOrderStatus(orderId: string, status: string): Promise<Order> {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async getRefunds(): Promise<RefundRequest[]> {
    const res = await fetch('/api/refunds');
    if (!res.ok) throw new Error('Failed to fetch refunds');
    return res.json();
  },

  async submitRefund(payload: {
    orderId: string;
    reason: string;
    complaintPhoto: string;
    customerNotes?: string;
  }): Promise<RefundRequest> {
    const res = await fetch('/api/refunds/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Refund submission failed' }));
      throw new Error(err.error || 'Refund submission failed');
    }
    return res.json();
  },

  async reviewRefund(refundId: string, decision: 'approve' | 'reject', adminNotes?: string): Promise<RefundRequest> {
    const res = await fetch(`/api/refunds/${refundId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision, adminNotes })
    });
    if (!res.ok) throw new Error('Failed to review refund');
    return res.json();
  },

  async getFlashDeals(): Promise<FlashDeal[]> {
    const res = await fetch('/api/flash-deals');
    if (!res.ok) throw new Error('Failed to fetch flash deals');
    return res.json();
  },

  async createFlashDeal(orderId: string, discountPercentage: number): Promise<FlashDeal> {
    const res = await fetch('/api/flash-deals/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, discountPercentage })
    });
    if (!res.ok) throw new Error('Failed to create flash deal');
    return res.json();
  },

  async claimFlashDeal(flashDealId: string, userId: string): Promise<FlashDeal> {
    const res = await fetch('/api/flash-deals/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flashDealId, userId })
    });
    if (!res.ok) throw new Error('Failed to claim flash deal');
    return res.json();
  },

  async getDrivers(): Promise<DriverApplication[]> {
    const res = await fetch('/api/drivers');
    if (!res.ok) throw new Error('Failed to fetch drivers');
    return res.json();
  },

  async applyDriver(payload: any): Promise<DriverApplication> {
    const res = await fetch('/api/drivers/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to apply for driver');
    return res.json();
  },

  async approveDriver(driverId: string): Promise<DriverApplication> {
    const res = await fetch(`/api/drivers/${driverId}/approve`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to approve driver');
    return res.json();
  },

  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch('/api/admin/stats');
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  async updateTrustScore(userId: string, delta: number, reason: string): Promise<{ newScore: number }> {
    const res = await fetch(`/api/users/${userId}/trust-score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta, reason })
    });
    if (!res.ok) throw new Error('Failed to update trust score');
    return res.json();
  }
};
