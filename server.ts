import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { connectToDatabase } from './server/db';
import { hashPassword, comparePassword, generateToken, authenticateToken, AuthRequest } from './server/auth';
import { UserModel } from './server/models/User';
import { OrderModel } from './server/models/Order';
import { RefundRequestModel } from './server/models/RefundRequest';
import { TrustScoreModel } from './server/models/TrustScore';
import { NotificationModel } from './server/models/Notification';
import { EmployeeModel } from './server/models/Employee';
import { FlashDealModel } from './server/models/FlashDeal';
import { RestaurantModel } from './server/models/Restaurant';
import { MOCK_USERS, MOCK_RESTAURANTS, MOCK_ORDERS, MOCK_REFUNDS, MOCK_FLASH_DEALS, MOCK_DRIVERS } from './src/mockData';
import { Order, RefundRequest, FlashDeal, DriverApplication, AdminStats, OrderStatus, RefundStatus, NotificationItem, Employee, TrustScoreLog } from './src/types';
import { runRefundAIAgents, runDriverVerificationAgent, calculateUpdatedTrustScore } from './server/aiAgents';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: { origin: '*' }
  });

  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Connect to DB (MongoDB Atlas or Memory Store fallback)
  await connectToDatabase();

  // In-memory fallback arrays if MongoDB is offline
  let users = [...MOCK_USERS];
  let restaurants = [...MOCK_RESTAURANTS];
  let orders: Order[] = [...MOCK_ORDERS];
  let refunds: RefundRequest[] = [...MOCK_REFUNDS];
  let flashDeals: FlashDeal[] = [...MOCK_FLASH_DEALS];
  let drivers: DriverApplication[] = [...MOCK_DRIVERS];
  let notifications: NotificationItem[] = [
    {
      id: 'notif_1',
      type: 'RED_FLAG',
      title: 'Red Flag: High Fraud Risk Detected',
      message: 'User Customer Alex (Alex Vance) attempted refund claim with 15% image similarity match.',
      targetId: 'user_1',
      severity: 'critical',
      isRead: false,
      createdAt: new Date().toISOString()
    },
    {
      id: 'notif_2',
      type: 'EMPLOYEE_RISK',
      title: 'Delivery Partner Alert',
      message: 'Driver Marcus Vance received 3 consecutive customer complaint ratings.',
      targetId: 'emp_1',
      severity: 'high',
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ];

  let trustLogs: TrustScoreLog[] = [
    {
      id: 'log_1',
      userId: 'user_1',
      userName: 'Customer Alex',
      previousScore: 95,
      newScore: 85,
      delta: -10,
      reason: 'Image evidence mismatch detected by Gemini Fraud Engine',
      event: 'REFUND_DISCREPANCY',
      timestamp: new Date().toISOString()
    }
  ];

  let employees: Employee[] = [
    {
      id: 'emp_1',
      name: 'Marcus Vance',
      email: 'marcus.v@trustbite.ai',
      phone: '+1 (555) 234-5678',
      role: 'delivery_partner',
      vehicleType: 'E-Bike Express',
      vehiclePlate: 'EV-9910',
      trustScore: 68,
      totalDeliveries: 184,
      rating: 3.9,
      negativeRatingsCount: 4,
      status: 'warned',
      flagStatus: 'YELLOW',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      createdAt: new Date().toISOString()
    },
    {
      id: 'emp_2',
      name: 'Sarah Connor',
      email: 'sarah.c@trustbite.ai',
      phone: '+1 (555) 876-5432',
      role: 'delivery_partner',
      vehicleType: 'EV Scooter',
      vehiclePlate: 'EV-2041',
      trustScore: 98,
      totalDeliveries: 312,
      rating: 4.95,
      negativeRatingsCount: 0,
      status: 'active',
      flagStatus: 'GREEN',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      createdAt: new Date().toISOString()
    }
  ];

  // Seed default Support Account in users array
  const supportPasswordHash = hashPassword('password123');
  const supportAccountIndex = users.findIndex(u => u.email === 'support@trustbite.ai');
  if (supportAccountIndex === -1) {
    users.push({
      id: 'user_support_seeded',
      name: 'TrustBite Support Team',
      email: 'support@trustbite.ai',
      role: 'support',
      trustScore: 100,
      flagStatus: 'GREEN',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      totalOrders: 0,
      approvedRefunds: 0,
      rejectedRefunds: 0,
      createdAt: new Date().toISOString()
    } as any);
  }

  // Socket.IO real-time event listeners
  io.on('connection', (socket) => {
    console.log('[Socket.IO] Client connected:', socket.id);
    socket.emit('initial_data', {
      orders,
      refunds,
      notifications,
      users,
      employees
    });
  });

  // Helper function to sync trust score and emit socket event
  const updateUserTrust = (userId: string, newScore: number, reason: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const oldScore = user.trustScore;
    const delta = newScore - oldScore;
    user.trustScore = newScore;

    // Check for Red Flag status
    if (newScore < 50 && user.flagStatus !== 'RED') {
      user.flagStatus = 'RED';
      const newNotif: NotificationItem = {
        id: `notif_${Date.now()}`,
        type: 'RED_FLAG',
        title: `RED FLAG: Customer ${user.name} Trust Dropped Below 50`,
        message: `User trust score dropped to ${newScore}/100. Refund privileges review recommended.`,
        targetId: userId,
        severity: 'critical',
        isRead: false,
        createdAt: new Date().toISOString()
      };
      notifications.unshift(newNotif);
      io.emit('notification_created', newNotif);
    }

    // Sync across orders & refunds
    orders = orders.map(o => o.customerId === userId ? { ...o, customerTrustScore: newScore } : o);
    refunds = refunds.map(r => r.customerId === userId ? { ...r, customerTrustScore: newScore } : r);

    // Add Trust Log
    const log: TrustScoreLog = {
      id: `log_${Date.now()}`,
      userId,
      userName: user.name,
      previousScore: oldScore,
      newScore,
      delta,
      reason,
      event: delta < 0 ? 'TRUST_PENALTY' : 'TRUST_REWARD',
      timestamp: new Date().toISOString()
    };
    trustLogs.unshift(log);

    // Real-time Socket Emission
    io.emit('trust_updated', { userId, newScore, user, log });
  };

  // --- AUTHENTICATION API ---

  // Signup
  app.post('/api/auth/signup', (req, res) => {
    const { name, email, password, role } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const newUser = {
      id: `usr_${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email: email.toLowerCase(),
      passwordHash: hashPassword(password),
      role: role === 'support' ? 'support' : 'customer',
      trustScore: 85,
      flagStatus: 'GREEN',
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      totalOrders: 0,
      approvedRefunds: 0,
      rejectedRefunds: 0,
      createdAt: new Date().toISOString()
    };

    users.unshift(newUser as any);

    const token = generateToken({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name
    });

    const { passwordHash: _, ...safeUser } = newUser;
    res.status(201).json({ token, user: safeUser });
  });

  // Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email.toLowerCase() === email?.toLowerCase());

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Default seeded support password check or bcrypt check
    const isValid = (user as any).passwordHash
      ? comparePassword(password, (user as any).passwordHash)
      : password === 'password123';

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    const { passwordHash: _, ...safeUser } = user as any;
    res.json({ token, user: safeUser });
  });

  // Get Current User
  app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res) => {
    const user = users.find(u => u.id === req.user?.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { passwordHash: _, ...safeUser } = user as any;
    res.json(safeUser);
  });

  // --- DOMAIN API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'TrustBite AI Multi-User' });
  });

  // Users API
  app.get('/api/users', (req, res) => {
    res.json(users);
  });

  app.get('/api/users/:id/trust-history', (req, res) => {
    const userLogs = trustLogs.filter(l => l.userId === req.params.id);
    res.json(userLogs);
  });

  app.post('/api/users/:id/flag', (req, res) => {
    const { id } = req.params;
    const { flagStatus } = req.body;
    const user = users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.flagStatus = flagStatus;
    io.emit('user_updated', user);
    res.json(user);
  });

  app.post('/api/users/:id/suspend-refunds', (req, res) => {
    const { id } = req.params;
    const { suspended } = req.body;
    const user = users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    (user as any).refundPrivilegesSuspended = suspended;
    io.emit('user_updated', user);
    res.json(user);
  });

  // Restaurants API
  app.get('/api/restaurants', (req, res) => {
    res.json(restaurants);
  });

  // Orders API
  app.get('/api/orders', (req, res) => {
    res.json(orders);
  });

  app.post('/api/orders', (req, res) => {
    const { customerId, restaurantId, items, deliveryFee, address } = req.body;
    const user = users.find(u => u.id === customerId) || users[0];
    const restaurant = restaurants.find(r => r.id === restaurantId) || restaurants[0];

    const subtotal = items.reduce((acc: number, item: any) => acc + (item.menuItem.price * item.quantity), 0);
    const total = subtotal + (deliveryFee || 3.50);

    const newOrder: Order = {
      id: `TB-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: user.id,
      customerName: user.name,
      customerTrustScore: user.trustScore,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      items,
      subtotal,
      deliveryFee: deliveryFee || 3.50,
      total,
      status: 'placed',
      createdAt: new Date().toISOString()
    };

    orders.unshift(newOrder);
    user.totalOrders = (user.totalOrders || 0) + 1;

    // Realtime Broadcast
    io.emit('order_created', newOrder);

    res.status(201).json(newOrder);
  });

  // Restaurant Dispatch Evidence Upload
  app.put('/api/orders/:id/dispatch', (req, res) => {
    const { id } = req.params;
    const { packagingPhoto, billPhoto, notes } = req.body;

    const orderIndex = orders.findIndex(o => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }

    orders[orderIndex] = {
      ...orders[orderIndex],
      status: 'dispatched',
      dispatchEvidence: {
        packagingPhoto: packagingPhoto || 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600',
        billPhoto: billPhoto || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=600',
        timestamp: new Date().toISOString(),
        notes
      }
    };

    io.emit('order_updated', orders[orderIndex]);
    res.json(orders[orderIndex]);
  });

  // Refunds API - Submit & Gemini AI Evaluation
  app.get('/api/refunds', (req, res) => {
    res.json(refunds);
  });

  app.post('/api/refunds/submit', async (req, res) => {
    try {
      const { orderId, reason, complaintPhoto, customerNotes } = req.body;
      const order = orders.find(o => o.id === orderId);
      if (!order) {
        return res.status(404).json({ error: 'Associated order not found' });
      }

      const user = users.find(u => u.id === order.customerId) || users[0];

      if ((user as any).refundPrivilegesSuspended) {
        return res.status(403).json({ error: 'Refund privileges have been suspended for this account by Support.' });
      }

      // Run Gemini AI Agents
      const aiAnalysis = await runRefundAIAgents({
        reason,
        customerNotes,
        complaintPhoto,
        dispatchPackagingPhoto: order.dispatchEvidence?.packagingPhoto,
        dispatchBillPhoto: order.dispatchEvidence?.billPhoto,
        customerTrustScore: user.trustScore,
        orderTotal: order.total,
        restaurantName: order.restaurantName
      });

      let initialStatus: RefundStatus = 'pending_ai';

      if (aiAnalysis.recommendedAction === 'INSTANT_REFUND' && user.trustScore >= 75) {
        initialStatus = 'approved_auto';
      } else {
        initialStatus = 'pending_admin';
      }

      const newRefund: RefundRequest = {
        id: `ref_${Math.floor(100 + Math.random() * 900)}`,
        orderId: order.id,
        customerId: user.id,
        customerName: user.name,
        customerTrustScore: user.trustScore,
        restaurantId: order.restaurantId,
        restaurantName: order.restaurantName,
        reason,
        complaintPhoto,
        customerNotes,
        status: initialStatus,
        amount: order.total,
        submittedAt: new Date().toISOString(),
        aiAnalysis,
        processedAt: initialStatus === 'approved_auto' ? new Date().toISOString() : undefined
      };

      refunds.unshift(newRefund);

      // Link order
      const orderIdx = orders.findIndex(o => o.id === orderId);
      if (orderIdx !== -1) {
        orders[orderIdx].refundRequestId = newRefund.id;
      }

      if (initialStatus === 'approved_auto') {
        const { newScore } = calculateUpdatedTrustScore(user.trustScore, 'REFUND_GENUINE_APPROVED');
        updateUserTrust(user.id, newScore, 'Instant AI refund approved for verified genuine claim');
        user.approvedRefunds = (user.approvedRefunds || 0) + 1;
      } else {
        // High fraud risk alert trigger
        if (aiAnalysis.fraudProbability > 60) {
          const { newScore } = calculateUpdatedTrustScore(user.trustScore, 'REFUND_FRAUD_DETECTED');
          updateUserTrust(user.id, newScore, `Fraud probability ${aiAnalysis.fraudProbability}% flagged by AI`);
          
          const alertNotif: NotificationItem = {
            id: `notif_${Date.now()}`,
            type: 'SUSPICIOUS_REFUND',
            title: `High Fraud Risk Claim Flagged (#${newRefund.id})`,
            message: `User ${user.name} submitted claim with ${aiAnalysis.fraudProbability}% fraud probability. Admin review required.`,
            targetId: newRefund.id,
            severity: 'high',
            isRead: false,
            createdAt: new Date().toISOString()
          };
          notifications.unshift(alertNotif);
          io.emit('notification_created', alertNotif);
        }
      }

      // Realtime Broadcast to Support Dashboard & Customer Laptops
      io.emit('refund_submitted', newRefund);

      res.status(201).json(newRefund);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Refund processing failed' });
    }
  });

  // Admin Review Decision API
  app.post('/api/refunds/:id/review', (req, res) => {
    const { id } = req.params;
    const { decision, adminNotes } = req.body;

    const refundIndex = refunds.findIndex(r => r.id === id);
    if (refundIndex === -1) return res.status(404).json({ error: 'Refund request not found' });

    const refund = refunds[refundIndex];
    const user = users.find(u => u.id === refund.customerId);

    let newStatus: RefundStatus = decision === 'approve' ? 'approved_admin' : 'rejected_admin';
    refunds[refundIndex] = {
      ...refund,
      status: newStatus,
      adminDecisionNotes: adminNotes,
      processedAt: new Date().toISOString()
    };

    if (user) {
      if (decision === 'approve') {
        const { newScore } = calculateUpdatedTrustScore(user.trustScore, 'REFUND_GENUINE_APPROVED');
        updateUserTrust(user.id, newScore, 'Admin approved refund after evidence inspection');
        user.approvedRefunds = (user.approvedRefunds || 0) + 1;
      } else {
        const { newScore } = calculateUpdatedTrustScore(user.trustScore, 'REFUND_FRAUD_DETECTED');
        updateUserTrust(user.id, newScore, 'Admin rejected invalid/fraudulent refund claim');
        user.rejectedRefunds = (user.rejectedRefunds || 0) + 1;
      }
    }

    io.emit('refund_updated', refunds[refundIndex]);
    res.json(refunds[refundIndex]);
  });

  // Employees API (Delivery Partners Trust System)
  app.get('/api/employees', (req, res) => {
    res.json(employees);
  });

  app.post('/api/employees/:id/status', (req, res) => {
    const { id } = req.params;
    const { action } = req.body; // 'warn' | 'suspend' | 'restore'

    const emp = employees.find(e => e.id === id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });

    if (action === 'warn') {
      emp.status = 'warned';
      emp.flagStatus = 'YELLOW';
      emp.trustScore = Math.max(0, emp.trustScore - 15);
    } else if (action === 'suspend') {
      emp.status = 'suspended';
      emp.flagStatus = 'RED';
      emp.trustScore = Math.max(0, emp.trustScore - 30);
    } else if (action === 'restore') {
      emp.status = 'active';
      emp.flagStatus = 'GREEN';
      emp.trustScore = 95;
    }

    io.emit('employee_updated', emp);
    res.json(emp);
  });

  // Notifications API
  app.get('/api/notifications', (req, res) => {
    res.json(notifications);
  });

  // Flash Marketplace API
  app.get('/api/flash-deals', (req, res) => {
    res.json(flashDeals);
  });

  // Admin Analytics Overview API
  app.get('/api/admin/stats', (req, res) => {
    const totalRev = orders.reduce((acc, o) => acc + o.total, 0);
    const instantRefunds = refunds.filter(r => r.status === 'approved_auto').length;
    const fraudPrevented = refunds
      .filter(r => r.status === 'rejected_admin')
      .reduce((acc, r) => acc + r.amount, 0);

    const avgTrust = Math.round(users.reduce((acc, u) => acc + u.trustScore, 0) / (users.length || 1));

    const stats: AdminStats = {
      totalOrdersToday: orders.length + 14,
      totalRevenueToday: Number((totalRev + 420.50).toFixed(2)),
      refundRequestsCount: refunds.length,
      instantRefundsCount: instantRefunds,
      preventedFraudAmount: Number((fraudPrevented + 184.20).toFixed(2)),
      averageTrustScore: avgTrust,
      activeFlashDeals: flashDeals.filter(f => !f.isClaimed).length
    };

    res.json(stats);
  });

  // Manual Trust Score Edit API
  app.post('/api/users/:id/trust-score', (req, res) => {
    const { id } = req.params;
    const { delta, reason } = req.body;

    const user = users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const newScore = Math.max(0, Math.min(100, user.trustScore + (Number(delta) || 0)));
    updateUserTrust(id, newScore, reason || 'Support manual adjustment');

    res.json({ userId: id, newScore, updatedUser: users.find(u => u.id === id) });
  });

  // --- VITE / STATIC SERVING ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`TrustBite AI Multi-User Full-Stack Server running on http://localhost:${PORT}`);
  });
}

startServer();
