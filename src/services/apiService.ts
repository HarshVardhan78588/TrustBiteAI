import { User, Order, RefundRequest, FlashDeal, DriverApplication, AdminStats, NotificationItem, Employee, TrustScoreLog } from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('trustbite_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

// Authentication
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function signupUser(name: string, email: string, password: string, role: 'customer' | 'support' = 'customer') {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  return data;
}

export async function getCurrentUser() {
  const token = localStorage.getItem('trustbite_token');
  if (!token) return null;
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) return null;
  return res.json();
}

// Orders
export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/orders`, { headers: getAuthHeaders() });
  return res.json();
}

export async function createOrder(orderData: any): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData)
  });
  return res.json();
}

// Refunds
export async function fetchRefunds(): Promise<RefundRequest[]> {
  const res = await fetch(`${API_BASE}/refunds`, { headers: getAuthHeaders() });
  return res.json();
}

export async function submitRefund(refundData: any): Promise<RefundRequest> {
  const res = await fetch(`${API_BASE}/refunds/submit`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(refundData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Refund submission failed');
  return data;
}

export async function reviewRefund(refundId: string, decision: 'approve' | 'reject', adminNotes: string): Promise<RefundRequest> {
  const res = await fetch(`${API_BASE}/refunds/${refundId}/review`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ decision, adminNotes })
  });
  return res.json();
}

// User Trust & Controls
export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE}/users`, { headers: getAuthHeaders() });
  return res.json();
}

export async function updateTrustScore(userId: string, delta: number, reason: string) {
  const res = await fetch(`${API_BASE}/users/${userId}/trust-score`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ delta, reason })
  });
  return res.json();
}

export async function toggleUserFlag(userId: string, flagStatus: 'GREEN' | 'YELLOW' | 'RED') {
  const res = await fetch(`${API_BASE}/users/${userId}/flag`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ flagStatus })
  });
  return res.json();
}

export async function toggleRefundPrivileges(userId: string, suspended: boolean) {
  const res = await fetch(`${API_BASE}/users/${userId}/suspend-refunds`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ suspended })
  });
  return res.json();
}

export async function fetchTrustScoreLogs(userId: string): Promise<TrustScoreLog[]> {
  const res = await fetch(`${API_BASE}/users/${userId}/trust-history`, { headers: getAuthHeaders() });
  return res.json();
}

// Employees
export async function fetchEmployees(): Promise<Employee[]> {
  const res = await fetch(`${API_BASE}/employees`, { headers: getAuthHeaders() });
  return res.json();
}

export async function updateEmployeeStatus(employeeId: string, action: 'warn' | 'suspend' | 'restore') {
  const res = await fetch(`${API_BASE}/employees/${employeeId}/status`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action })
  });
  return res.json();
}

// Notifications
export async function fetchNotifications(): Promise<NotificationItem[]> {
  const res = await fetch(`${API_BASE}/notifications`, { headers: getAuthHeaders() });
  return res.json();
}

// Flash Deals
export async function fetchFlashDeals(): Promise<FlashDeal[]> {
  const res = await fetch(`${API_BASE}/flash-deals`, { headers: getAuthHeaders() });
  return res.json();
}

// Admin Stats
export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/admin/stats`, { headers: getAuthHeaders() });
  return res.json();
}
