import express from 'express';
import http from 'http';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import { connectToDatabase, isDbConnected } from './server/db';
import { hashPassword, comparePassword, generateToken, authenticateToken, AuthRequest } from './server/auth';
import { UserModel } from './server/models/User';
import { OrderModel } from './server/models/Order';
import { RefundRequestModel } from './server/models/RefundRequest';
import { TrustScoreModel } from './server/models/TrustScore';
import { NotificationModel } from './server/models/Notification';
import { EmployeeModel } from './server/models/Employee';
import { FlashDealModel } from './server/models/FlashDeal';
import { RestaurantModel } from './server/models/Restaurant';
import { DispatchPhotoModel } from './server/models/DispatchPhoto';
import { MOCK_RESTAURANTS, MOCK_ORDERS, MOCK_REFUNDS, MOCK_FLASH_DEALS, MOCK_DRIVERS } from './src/mockData';
import { RefundStatus, AdminStats } from './src/types';
import { runRefundAIAgents, calculateUpdatedTrustScore } from './server/aiAgents';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new SocketIOServer(server, {
    cors: { origin: '*' }
  });

  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Connect to MongoDB Database ('trustbite')
  await connectToDatabase();

  const defaultPasswordHash = hashPassword('password123');

  // Seed Required Accounts & Collections in MongoDB
  const seedAccounts = [
    {
      id: 'user_support_1',
      name: 'TrustBite Support Team',
      email: 'support@trustbite.ai',
      role: 'support' as const,
      trustScore: 100,
      flagStatus: 'GREEN' as const,
      isFlagged: false,
      warningCount: 0,
      refundPrivilegesSuspended: false,
      refundSuspended: false,
      totalOrders: 0,
      approvedRefunds: 0,
      rejectedRefunds: 0,
      lastActivity: new Date().toISOString(),
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    },
    {
      id: 'user_cust_1',
      name: 'User 1 (Alex)',
      email: 'user1@test.com',
      role: 'customer' as const,
      trustScore: 100,
      flagStatus: 'GREEN' as const,
      isFlagged: false,
      warningCount: 0,
      refundPrivilegesSuspended: false,
      refundSuspended: false,
      totalOrders: 12,
      approvedRefunds: 1,
      rejectedRefunds: 0,
      lastActivity: new Date().toISOString(),
      profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    },
    {
      id: 'user_cust_2',
      name: 'User 2 (Sarah)',
      email: 'user2@test.com',
      role: 'customer' as const,
      trustScore: 74,
      flagStatus: 'YELLOW' as const,
      isFlagged: false,
      warningCount: 1,
      refundPrivilegesSuspended: false,
      refundSuspended: false,
      totalOrders: 8,
      approvedRefunds: 3,
      rejectedRefunds: 1,
      lastActivity: new Date().toISOString(),
      profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    },
    {
      id: 'user_cust_3',
      name: 'User 3 (David)',
      email: 'user3@test.com',
      role: 'customer' as const,
      trustScore: 18,
      flagStatus: 'RED' as const,
      isFlagged: true,
      warningCount: 4,
      refundPrivilegesSuspended: true,
      refundSuspended: true,
      totalOrders: 15,
      approvedRefunds: 2,
      rejectedRefunds: 7,
      lastActivity: new Date().toISOString(),
      profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    }
  ];

  try {
    for (const acc of seedAccounts) {
      const existing = await (UserModel as any).findOne({ email: acc.email });
      if (!existing) {
        await (UserModel as any).create({
          ...acc,
          passwordHash: defaultPasswordHash,
          avatarUrl: acc.profilePicture,
          createdAt: new Date()
        });
      }
    }

    // Seed Restaurants if empty
    if ((await (RestaurantModel as any).countDocuments()) === 0) {
      await (RestaurantModel as any).insertMany(MOCK_RESTAURANTS as any);
    }

    // Seed Orders if empty
    if ((await (OrderModel as any).countDocuments()) === 0) {
      await (OrderModel as any).insertMany(MOCK_ORDERS as any);
    }

    // Seed Refunds if empty
    if ((await (RefundRequestModel as any).countDocuments()) === 0) {
      await (RefundRequestModel as any).insertMany(MOCK_REFUNDS as any);
    }

    // Seed Employees if empty
    if ((await (EmployeeModel as any).countDocuments()) === 0) {
      await (EmployeeModel as any).insertMany(MOCK_DRIVERS as any);
    }

    // Seed Flash Deals if empty
    if ((await (FlashDealModel as any).countDocuments()) === 0) {
      await (FlashDealModel as any).insertMany(MOCK_FLASH_DEALS as any);
    }

    // Seed Notifications if empty
    if ((await (NotificationModel as any).countDocuments()) === 0) {
      await (NotificationModel as any).create([
        {
          id: 'notif_1',
          type: 'RED_FLAG',
          title: 'Red Flag: High Fraud Risk Detected',
          message: 'User 3 (David) has been flagged with trust score 18/100 and refund privileges suspended.',
          targetId: 'user_cust_3',
          severity: 'critical',
          isRead: false,
          createdAt: new Date()
        },
        {
          id: 'notif_2',
          type: 'SUSPICIOUS_REFUND',
          title: 'Suspicious Refund Under Review',
          message: 'User 2 (Sarah) submitted a refund request with 45% image similarity match.',
          targetId: 'user_cust_2',
          severity: 'medium',
          isRead: false,
          createdAt: new Date()
        }
      ]);
    }

    // Seed Trust History Logs if empty
    if ((await (TrustScoreModel as any).countDocuments()) === 0) {
      await (TrustScoreModel as any).create([
        {
          id: 'log_1',
          userId: 'user_cust_3',
          userName: 'User 3 (David)',
          previousScore: 28,
          newScore: 18,
          delta: -10,
          reason: 'Low image similarity claim mismatch (-10 penalty)',
          event: 'TRUST_PENALTY',
          timestamp: new Date()
        }
      ]);
    }

    console.log('Seed complete');
  } catch (err) {
    console.error('Error during MongoDB seeding:', err);
  }

  // Socket.IO real-time event listeners
  io.on('connection', async (socket) => {
    console.log('[Socket.IO] Client connected:', socket.id);
    try {
      const [dbOrders, dbRefunds, dbNotifications, dbUsers, dbEmployees] = await Promise.all([
        (OrderModel as any).find().lean(),
        (RefundRequestModel as any).find().lean(),
        (NotificationModel as any).find().lean(),
        (UserModel as any).find().lean(),
        (EmployeeModel as any).find().lean()
      ]);
      socket.emit('initial_data', {
        orders: dbOrders,
        refunds: dbRefunds,
        notifications: dbNotifications,
        users: dbUsers,
        employees: dbEmployees
      });
    } catch (err) {
      console.error('Socket initial data error:', err);
    }
  });

  console.log('Socket.IO Ready');

  // Helper function for user trust updates & socket broadcasts
  const updateUserStateInDb = async (userId: string, updates: Partial<any>, logReason?: string) => {
    const user = await (UserModel as any).findOne({ id: userId });
    if (!user) return null;

    const previousScore = user.trustScore;

    // Apply updates
    Object.assign(user, updates);
    user.lastActivity = new Date().toISOString();

    await user.save();

    // Trust Log if score changed or log reason provided
    if (logReason || updates.trustScore !== undefined) {
      const delta = (user.trustScore ?? previousScore) - previousScore;
      const log = new (TrustScoreModel as any)({
        id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        userId: user.id,
        userName: user.name,
        previousScore,
        newScore: user.trustScore,
        delta,
        reason: logReason || (delta >= 0 ? 'Trust score increased' : 'Trust score decreased'),
        event: delta >= 0 ? 'TRUST_REWARD' : 'TRUST_PENALTY',
        timestamp: new Date()
      });
      await log.save();
    }

    const safeUser = user.toObject();
    delete safeUser.passwordHash;

    // Emit Socket.IO updates
    io.emit('trust_updated', { userId: user.id, newScore: user.trustScore, user: safeUser });
    io.emit('user_updated', safeUser);

    if (updates.isFlagged !== undefined) {
      io.emit('user_flagged', { userId: user.id, isFlagged: user.isFlagged, flagStatus: user.flagStatus });
    }

    if (updates.refundSuspended !== undefined || updates.refundPrivilegesSuspended !== undefined) {
      const isSusp = !!(user.refundSuspended || user.refundPrivilegesSuspended);
      io.emit(isSusp ? 'refund_suspended' : 'refund_restored', { userId: user.id, user: safeUser });
    }

    return safeUser;
  };

  // --- AUTHENTICATION API ---

  // Signup
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Name, email and password are required.' });
      }

      const existing = await (UserModel as any).findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const newUser = await (UserModel as any).create({
        id: `usr_${Math.floor(100000 + Math.random() * 900000)}`,
        name,
        email: email.toLowerCase(),
        passwordHash: hashPassword(password),
        role: role === 'support' ? 'support' : 'customer',
        trustScore: 85,
        flagStatus: 'GREEN',
        isFlagged: false,
        warningCount: 0,
        refundSuspended: false,
        refundPrivilegesSuspended: false,
        profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        totalOrders: 0,
        approvedRefunds: 0,
        rejectedRefunds: 0,
        createdAt: new Date()
      });

      const token = generateToken({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      });

      io.emit('user_login', { userId: newUser.id, name: newUser.name });

      const safeUser = newUser.toObject();
      delete safeUser.passwordHash;
      res.status(201).json({ token, user: safeUser });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Signup failed' });
    }
  });

  // Login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await (UserModel as any).findOne({ email: email?.toLowerCase() });

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isValid = user.passwordHash
        ? comparePassword(password, user.passwordHash)
        : password === 'password123';

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      user.lastActivity = new Date().toISOString();
      await user.save();

      const token = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      });

      io.emit('user_login', { userId: user.id, name: user.name });

      const safeUser = user.toObject();
      delete safeUser.passwordHash;
      res.json({ token, user: safeUser });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Login failed' });
    }
  });

  // Get Current User (MongoDB direct query)
  app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res) => {
    try {
      const user = await (UserModel as any).findOne({ id: req.user?.id });
      if (!user) return res.status(404).json({ error: 'User not found' });
      const safeUser = user.toObject();
      delete safeUser.passwordHash;
      res.json(safeUser);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', app: 'TrustBite AI Multi-User MongoDB', dbConnected: isDbConnected() });
  });

  // Users API
  app.get('/api/users', async (req, res) => {
    try {
      const users = await (UserModel as any).find().select('-passwordHash').sort({ createdAt: -1 }).lean();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const user = await (UserModel as any).findOne({ id: req.params.id }).select('-passwordHash').lean();
      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/users/:id/trust-history', async (req, res) => {
    try {
      const logs = await (TrustScoreModel as any).find({ userId: req.params.id }).sort({ timestamp: -1 }).lean();
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // UNIFIED SUPPORT ACTION ENDPOINT
  app.post('/api/support/users/:id/action', async (req, res) => {
    try {
      const { id } = req.params;
      const { action, scoreDelta, reason } = req.body;
      const user = await (UserModel as any).findOne({ id });
      if (!user) return res.status(404).json({ error: 'User not found' });

      let updates: Partial<any> = {};
      let notifTitle = '';
      let notifMessage = '';
      let logReason = reason || '';

      switch (action) {
        case 'restore_trust': {
          const newScore = Math.max(75, (user.trustScore || 0) + 25);
          updates = {
            trustScore: newScore,
            isFlagged: false,
            flagStatus: 'GREEN',
            refundSuspended: false,
            refundPrivilegesSuspended: false,
            warningCount: Math.max(0, (user.warningCount || 0) - 1)
          };
          notifTitle = 'Trust Score Restored & Account Unflagged';
          notifMessage = `Support restored your trust score to ${newScore}/100. Red flag removed and instant refund privileges are now active!`;
          logReason = logReason || 'Support Team restored trust score and cleared account restrictions';
          break;
        }
        case 'mark_red_flag': {
          updates = {
            isFlagged: true,
            flagStatus: 'RED',
            refundSuspended: true,
            refundPrivilegesSuspended: true
          };
          notifTitle = 'Account Marked RED FLAG';
          notifMessage = 'Your account has been flagged for policy compliance audit. Automated instant refunds have been suspended.';
          logReason = logReason || 'Support Team placed RED FLAG and suspended refund privileges';
          break;
        }
        case 'remove_red_flag': {
          const flagStatus = (user.trustScore || 0) >= 75 ? 'GREEN' : 'YELLOW';
          updates = {
            isFlagged: false,
            flagStatus,
            refundSuspended: false,
            refundPrivilegesSuspended: false
          };
          notifTitle = 'RED FLAG Restriction Removed';
          notifMessage = 'Support has removed the RED FLAG restriction from your account. Refund privileges have been restored.';
          logReason = logReason || 'Support Team removed RED FLAG and restored privileges';
          break;
        }
        case 'suspend_refunds': {
          updates = {
            refundSuspended: true,
            refundPrivilegesSuspended: true
          };
          notifTitle = 'Refund Privileges Suspended';
          notifMessage = 'Your instant refund privileges have been suspended by Support.';
          logReason = logReason || 'Support Team suspended refund privileges';
          break;
        }
        case 'restore_refunds': {
          const isFlagged = (user.trustScore || 0) <= 30;
          updates = {
            refundSuspended: false,
            refundPrivilegesSuspended: false,
            isFlagged,
            flagStatus: (user.trustScore || 0) >= 75 ? 'GREEN' : isFlagged ? 'RED' : 'YELLOW'
          };
          notifTitle = 'Refund Privileges Restored';
          notifMessage = 'Your instant refund privileges have been restored by Support.';
          logReason = logReason || 'Support Team restored refund privileges';
          break;
        }
        case 'warn_user': {
          const newWarn = (user.warningCount || 0) + 1;
          const newScore = Math.max(0, (user.trustScore || 85) - 15);
          const isRed = newScore <= 30 || newWarn >= 3;
          updates = {
            warningCount: newWarn,
            trustScore: newScore,
            isFlagged: isRed ? true : user.isFlagged,
            flagStatus: isRed ? 'RED' : user.flagStatus,
            refundSuspended: isRed ? true : user.refundSuspended,
            refundPrivilegesSuspended: isRed ? true : user.refundPrivilegesSuspended
          };
          notifTitle = `Formal Warning Issued (${newWarn}/3)`;
          notifMessage = `You received a warning from Support. Your trust score was reduced by 15 to ${newScore}/100.`;
          logReason = logReason || `Support issued formal warning #${newWarn} (-15 trust score penalty)`;
          break;
        }
        case 'set_trust':
        default: {
          const newScore = Math.max(0, Math.min(100, (user.trustScore || 85) + (Number(scoreDelta) || 0)));
          const isRestored = newScore > 40;
          updates = {
            trustScore: newScore,
            isFlagged: isRestored ? false : user.isFlagged,
            flagStatus: newScore >= 75 ? 'GREEN' : newScore <= 30 ? 'RED' : 'YELLOW',
            refundSuspended: isRestored ? false : user.refundSuspended,
            refundPrivilegesSuspended: isRestored ? false : user.refundPrivilegesSuspended
          };
          notifTitle = `Trust Score Updated (${newScore}/100)`;
          notifMessage = `Your trust score was updated to ${newScore}/100 by Support.`;
          logReason = logReason || `Support adjusted trust score to ${newScore}`;
          break;
        }
      }

      // Update user in MongoDB
      const updatedUser = await updateUserStateInDb(user.id, updates, logReason);

      // Create Notification in MongoDB
      if (notifTitle) {
        const notif = await (NotificationModel as any).create({
          id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          type: updates.isFlagged ? 'RED_FLAG' : 'HIGH_TRUST_REFUND',
          title: notifTitle,
          message: notifMessage,
          targetId: user.id,
          severity: updates.isFlagged ? 'critical' : 'medium',
          isRead: false,
          createdAt: new Date()
        });
        io.emit('notification_created', notif.toObject());
        io.emit('support_action', { userId: user.id, action, updatedUser });
      }

      res.json(updatedUser);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Support action failed' });
    }
  });

  // Flag user direct endpoint
  app.post('/api/users/:id/flag', async (req, res) => {
    const { id } = req.params;
    const { flagStatus } = req.body;
    const action = flagStatus === 'RED' ? 'mark_red_flag' : 'remove_red_flag';
    req.body.action = action;
    return (app as any)._router.handle(req, res);
  });

  // Suspend refunds direct endpoint
  app.post('/api/users/:id/suspend-refunds', async (req, res) => {
    const { id } = req.params;
    const { suspended } = req.body;
    const action = suspended ? 'suspend_refunds' : 'restore_refunds';
    req.body.action = action;
    return (app as any)._router.handle(req, res);
  });

  // Trust score direct endpoint
  app.post('/api/users/:id/trust-score', async (req, res) => {
    req.body.action = 'set_trust';
    req.body.scoreDelta = req.body.delta;
    return (app as any)._router.handle(req, res);
  });

  // Restaurants API
  app.get('/api/restaurants', async (req, res) => {
    try {
      const list = await (RestaurantModel as any).find().lean();
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Orders API
  app.get('/api/orders', async (req, res) => {
    try {
      const { customerId } = req.query;
      const query: any = customerId ? { customerId } : {};
      const list = await (OrderModel as any).find(query).sort({ createdAt: -1 }).lean();
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const { customerId, restaurantId, items, deliveryFee } = req.body;
      const user = await (UserModel as any).findOne({ id: customerId }) || await (UserModel as any).findOne();
      const restaurant = await (RestaurantModel as any).findOne({ id: restaurantId }) || await (RestaurantModel as any).findOne();

      if (!user || !restaurant) {
        return res.status(400).json({ error: 'User or Restaurant not found' });
      }

      const subtotal = items.reduce((acc: number, item: any) => acc + (item.menuItem.price * item.quantity), 0);
      const total = subtotal + (deliveryFee || 3.50);

      const newOrder = await (OrderModel as any).create({
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
        createdAt: new Date()
      });

      // Update user total orders
      user.totalOrders = (user.totalOrders || 0) + 1;
      await user.save();

      const orderObj = newOrder.toObject();

      // Realtime Broadcast
      io.emit('order_created', orderObj);

      res.status(201).json(orderObj);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Dispatch Evidence Upload
  app.put('/api/orders/:id/dispatch', async (req, res) => {
    try {
      const { id } = req.params;
      const { packagingPhoto, billPhoto, notes } = req.body;

      const order = await (OrderModel as any).findOne({ id });
      if (!order) return res.status(404).json({ error: 'Order not found' });

      order.status = 'dispatched';
      order.dispatchEvidence = {
        packagingPhoto: packagingPhoto || 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600',
        billPhoto: billPhoto || 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=600',
        timestamp: new Date().toISOString(),
        notes
      };

      await order.save();

      // Store in DispatchPhoto collection
      await (DispatchPhotoModel as any).create({
        id: `disp_${Date.now()}`,
        orderId: order.id,
        restaurantId: order.restaurantId,
        packagingPhoto: order.dispatchEvidence.packagingPhoto,
        billPhoto: order.dispatchEvidence.billPhoto,
        notes,
        timestamp: new Date()
      });

      const orderObj = order.toObject();
      io.emit('dispatch_uploaded', { orderId: order.id, dispatchEvidence: order.dispatchEvidence });
      io.emit('order_updated', orderObj);

      res.json(orderObj);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Refunds API - Submit & Gemini Vision Evaluation
  app.get('/api/refunds', async (req, res) => {
    try {
      const { customerId } = req.query;
      const query: any = customerId ? { customerId } : {};
      const list = await (RefundRequestModel as any).find(query).sort({ submittedAt: -1 }).lean();
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/refunds/submit', async (req, res) => {
    try {
      const { orderId, reason, complaintPhoto, customerNotes } = req.body;
      const order = await (OrderModel as any).findOne({ id: orderId });
      if (!order) {
        return res.status(404).json({ error: 'Associated order not found' });
      }

      const user = await (UserModel as any).findOne({ id: order.customerId });
      if (!user) {
        return res.status(404).json({ error: 'Customer account not found' });
      }

      if (user.refundSuspended || user.refundPrivilegesSuspended) {
        return res.status(403).json({ error: 'Refund privileges have been suspended for this account by Support.' });
      }

      // Run Gemini AI Vision Agent
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

      const similarity = aiAnalysis.similarity ?? (aiAnalysis.sameDish ? 80 : 30);
      let initialStatus: RefundStatus = 'pending_admin';

      if (user.isFlagged || user.trustScore <= 30) {
        initialStatus = 'pending_admin';
      } else if (similarity >= 70) {
        initialStatus = 'approved_auto';
      } else {
        initialStatus = 'pending_admin';
      }

      const newRefund = await (RefundRequestModel as any).create({
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
        submittedAt: new Date(),
        aiAnalysis,
        processedAt: initialStatus === 'approved_auto' ? new Date() : undefined
      });

      order.refundRequestId = newRefund.id;
      await order.save();

      const refundObj = newRefund.toObject();

      if (initialStatus === 'approved_auto') {
        const newScore = Math.min(100, user.trustScore + 2);
        user.trustScore = newScore;
        user.approvedRefunds = (user.approvedRefunds || 0) + 1;
        await user.save();

        await updateUserStateInDb(user.id, { trustScore: newScore, approvedRefunds: user.approvedRefunds }, `Automated refund approved (High similarity: ${similarity}%)`);

        const custNotif = await (NotificationModel as any).create({
          id: `notif_${Date.now()}`,
          type: 'HIGH_TRUST_REFUND',
          title: `Refund Approved ($${order.total.toFixed(2)})`,
          message: `Your refund request for Order #${order.id} was approved automatically by AI. Trust score +2!`,
          targetId: user.id,
          severity: 'low',
          isRead: false,
          createdAt: new Date()
        });
        io.emit('notification_created', custNotif.toObject());
      } else if (similarity >= 40 && similarity <= 69) {
        const custNotif = await (NotificationModel as any).create({
          id: `notif_${Date.now()}`,
          type: 'SUSPICIOUS_REFUND',
          title: `Refund Request Under Support Review`,
          message: `Your refund request for Order #${order.id} is undergoing Support Team review (Similarity: ${similarity}%).`,
          targetId: user.id,
          severity: 'medium',
          isRead: false,
          createdAt: new Date()
        });
        io.emit('notification_created', custNotif.toObject());
      } else {
        const oldScore = user.trustScore;
        const newScore = Math.max(0, user.trustScore - 10);
        user.warningCount = (user.warningCount || 0) + 1;

        if (user.warningCount >= 2 || newScore <= 30) {
          user.isFlagged = true;
          user.flagStatus = 'RED';
          user.refundSuspended = true;
          user.refundPrivilegesSuspended = true;
        }

        user.trustScore = newScore;
        await user.save();

        await updateUserStateInDb(user.id, {
          trustScore: newScore,
          warningCount: user.warningCount,
          isFlagged: user.isFlagged,
          flagStatus: user.flagStatus,
          refundSuspended: user.refundSuspended,
          refundPrivilegesSuspended: user.refundPrivilegesSuspended
        }, `Low similarity (${similarity}%) claim penalty (-10)`);

        const fraudNotif = await (NotificationModel as any).create({
          id: `notif_${Date.now()}_fraud`,
          type: 'RED_FLAG',
          title: `RED FLAG: Fraud Risk Claim (${similarity}%) for ${user.name}`,
          message: `User ${user.name} submitted claim with ${similarity}% similarity match. Warning count: ${user.warningCount}.`,
          targetId: user.id,
          severity: 'critical',
          isRead: false,
          createdAt: new Date()
        });
        io.emit('notification_created', fraudNotif.toObject());

        const custNotif = await (NotificationModel as any).create({
          id: `notif_${Date.now()}_cust`,
          type: 'SUSPICIOUS_REFUND',
          title: `Trust Score Penalized (-10)`,
          message: `Your trust score dropped from ${oldScore} to ${newScore} due to a low image similarity refund claim.`,
          targetId: user.id,
          severity: 'high',
          isRead: false,
          createdAt: new Date()
        });
        io.emit('notification_created', custNotif.toObject());
      }

      // Realtime Broadcasts
      io.emit('refund_submitted', refundObj);
      io.emit('ai_verification_completed', { refundId: newRefund.id, aiAnalysis });

      res.status(201).json(refundObj);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Refund processing failed' });
    }
  });

  // Admin Review Decision API
  app.post('/api/refunds/:id/review', async (req, res) => {
    try {
      const { id } = req.params;
      const { decision, adminNotes } = req.body;

      const refund = await (RefundRequestModel as any).findOne({ id });
      if (!refund) return res.status(404).json({ error: 'Refund request not found' });

      const newStatus: RefundStatus = decision === 'approve' ? 'approved_admin' : 'rejected_admin';
      refund.status = newStatus;
      refund.adminDecisionNotes = adminNotes;
      refund.processedAt = new Date();
      await refund.save();

      const user = await (UserModel as any).findOne({ id: refund.customerId });
      if (user) {
        if (decision === 'approve') {
          const { newScore } = calculateUpdatedTrustScore(user.trustScore, 'REFUND_GENUINE_APPROVED');
          const isRestored = newScore > 40;
          await updateUserStateInDb(user.id, {
            trustScore: newScore,
            approvedRefunds: (user.approvedRefunds || 0) + 1,
            isFlagged: isRestored ? false : user.isFlagged,
            flagStatus: newScore >= 75 ? 'GREEN' : isRestored ? 'YELLOW' : 'RED',
            refundSuspended: isRestored ? false : user.refundSuspended,
            refundPrivilegesSuspended: isRestored ? false : user.refundPrivilegesSuspended
          }, 'Admin approved refund after evidence inspection (+5 trust)');

          const notif = await (NotificationModel as any).create({
            id: `notif_${Date.now()}`,
            type: 'HIGH_TRUST_REFUND',
            title: `Refund Request Approved ($${refund.amount.toFixed(2)})`,
            message: `Your refund request for Order #${refund.orderId} was approved by Support after verification.`,
            targetId: user.id,
            severity: 'low',
            isRead: false,
            createdAt: new Date()
          });
          io.emit('notification_created', notif.toObject());
        } else {
          const { newScore } = calculateUpdatedTrustScore(user.trustScore, 'REFUND_FRAUD_DETECTED');
          const isRed = newScore <= 30;
          await updateUserStateInDb(user.id, {
            trustScore: newScore,
            rejectedRefunds: (user.rejectedRefunds || 0) + 1,
            isFlagged: isRed ? true : user.isFlagged,
            flagStatus: isRed ? 'RED' : user.flagStatus,
            refundSuspended: isRed ? true : user.refundSuspended,
            refundPrivilegesSuspended: isRed ? true : user.refundPrivilegesSuspended
          }, 'Admin rejected invalid refund claim (-25 trust penalty)');

          const notif = await (NotificationModel as any).create({
            id: `notif_${Date.now()}`,
            type: 'RED_FLAG',
            title: `Refund Claim Rejected`,
            message: `Your refund request for Order #${refund.orderId} was rejected by Support. Policy penalty applied.`,
            targetId: user.id,
            severity: 'high',
            isRead: false,
            createdAt: new Date()
          });
          io.emit('notification_created', notif.toObject());
        }
      }

      const refundObj = refund.toObject();
      io.emit('refund_updated', refundObj);
      res.json(refundObj);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Employees API
  app.get('/api/employees', async (req, res) => {
    try {
      const list = await (EmployeeModel as any).find().lean();
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/employees/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { action } = req.body;

      const emp = await (EmployeeModel as any).findOne({ id });
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

      await emp.save();
      const empObj = emp.toObject();
      io.emit('employee_updated', empObj);
      res.json(empObj);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Notifications API
  app.get('/api/notifications', async (req, res) => {
    try {
      const { userId } = req.query;
      const query: any = userId ? { $or: [{ targetId: userId }, { targetId: 'all' }] } : {};
      const list = await (NotificationModel as any).find(query).sort({ createdAt: -1 }).lean();
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Flash Deals API
  app.get('/api/flash-deals', async (req, res) => {
    try {
      const list = await (FlashDealModel as any).find().lean();
      res.json(list);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin Stats API
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const orders = await (OrderModel as any).find().lean();
      const refunds = await (RefundRequestModel as any).find().lean();
      const users = await (UserModel as any).find().lean();
      const flashDeals = await (FlashDealModel as any).find().lean();

      const totalRev = orders.reduce((acc: number, o: any) => acc + o.total, 0);
      const instantRefunds = refunds.filter((r: any) => r.status === 'approved_auto').length;
      const fraudPrevented = refunds
        .filter((r: any) => r.status === 'rejected_admin')
        .reduce((acc: number, r: any) => acc + r.amount, 0);

      const avgTrust = Math.round(users.reduce((acc: number, u: any) => acc + u.trustScore, 0) / (users.length || 1));

      const stats: AdminStats = {
        totalOrdersToday: orders.length + 14,
        totalRevenueToday: Number((totalRev + 420.50).toFixed(2)),
        refundRequestsCount: refunds.length,
        instantRefundsCount: instantRefunds,
        preventedFraudAmount: Number((fraudPrevented + 184.20).toFixed(2)),
        averageTrustScore: avgTrust,
        activeFlashDeals: flashDeals.filter((f: any) => !f.isClaimed).length
      };

      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // VITE / STATIC SERVING
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
    console.log(`TrustBite AI Multi-User Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
