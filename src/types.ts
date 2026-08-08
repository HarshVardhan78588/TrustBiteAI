export type UserRole = 'customer' | 'support' | 'admin' | 'driver';
export type FlagStatus = 'GREEN' | 'YELLOW' | 'RED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  trustScore: number;
  flagStatus: FlagStatus;
  isFlagged?: boolean;
  warningCount?: number;
  lastActivity?: string;
  profilePicture: string;
  avatarUrl?: string;
  totalOrders: number;
  approvedRefunds: number;
  rejectedRefunds: number;
  address?: string;
  refundPrivilegesSuspended?: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TrustScoreLog {
  id: string;
  userId: string;
  userName: string;
  previousScore: number;
  newScore: number;
  delta: number;
  reason: string;
  event: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  type: 'RED_FLAG' | 'SUSPICIOUS_REFUND' | 'EMPLOYEE_RISK' | 'HIGH_TRUST_REFUND';
  title: string;
  message: string;
  targetId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'delivery_partner' | 'support_agent';
  vehicleType: string;
  vehiclePlate: string;
  trustScore: number;
  totalDeliveries: number;
  rating: number;
  negativeRatingsCount: number;
  status: 'active' | 'warned' | 'suspended';
  flagStatus: FlagStatus;
  photo: string;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isPopular?: boolean;
  isVeg?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  deliveryTime: string;
  cuisine: string[];
  image: string;
  address: string;
  trustScore: number;
  menu: MenuItem[];
}

export type OrderStatus = 'placed' | 'preparing' | 'dispatched' | 'delivered' | 'canceled' | 'flash_listed';

export interface DispatchEvidence {
  packagingPhoto: string;
  billPhoto: string;
  timestamp: string;
  notes?: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerTrustScore: number;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  dispatchEvidence?: DispatchEvidence;
  refundRequestId?: string;
  isFlashDeal?: boolean;
}

export type RefundStatus = 'pending_ai' | 'approved_auto' | 'pending_admin' | 'approved_admin' | 'rejected_admin';

export interface AIAgentAnalysis {
  confidenceScore: number; // 0-100
  fraudProbability: number; // 0-100
  sameDish?: boolean;
  similarity?: number; // 0-100
  imageMatch: boolean;
  itemDiscrepancyDetected: boolean;
  receiptValid: boolean;
  visualDifferenceNotes: string;
  reasoning: string;
  recommendedAction: 'INSTANT_REFUND' | 'ADMIN_REVIEW' | 'REJECT';
  evaluatedAt: string;
}

export interface RefundRequest {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerTrustScore: number;
  restaurantId: string;
  restaurantName: string;
  reason: string;
  complaintPhoto: string;
  customerNotes?: string;
  status: RefundStatus;
  amount: number;
  submittedAt: string;
  aiAnalysis?: AIAgentAnalysis;
  adminDecisionNotes?: string;
  processedAt?: string;
}

export interface FlashDeal {
  id: string;
  orderId: string;
  restaurantId: string;
  restaurantName: string;
  itemsSummary: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  expiresAt: string;
  claimedBy?: string;
  isClaimed: boolean;
  distanceKm: number;
  image: string;
}

export interface DriverApplication {
  id: string;
  driverName: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licensePhoto: string;
  idPhoto: string;
  vehicleType: string;
  vehiclePlate: string;
  status: 'pending' | 'verified_ai' | 'approved' | 'rejected';
  aiVerification?: {
    licenseValid: boolean;
    idMatchesName: boolean;
    completenessScore: number;
    flags: string[];
    reasoning: string;
  };
  submittedAt: string;
}

export interface AdminStats {
  totalOrdersToday: number;
  totalRevenueToday: number;
  refundRequestsCount: number;
  instantRefundsCount: number;
  preventedFraudAmount: number;
  averageTrustScore: number;
  activeFlashDeals: number;
}
