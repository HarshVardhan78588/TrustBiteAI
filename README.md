<<<<<<< HEAD
# TrustBite AI — Multi-User AI-Verified Delivery & Fraud Prevention Engine

TrustBite AI is a real-time, multi-tenant quick-commerce application designed for live multi-laptop hackathon demonstrations and production deployment. Inspired by Blinkit & Instamart UI, TrustBite pairs rapid delivery with automated Gemini AI fraud detection, evidence dispatch verification, user trust scoring, and delivery partner compliance tracking.

---

## 🚀 Hackathon Multi-Laptop Architecture

The system is engineered to run seamlessly across **4 laptops simultaneously** communicating in real time over Socket.IO WebSockets and MongoDB Atlas:

| Device | Role | Credentials / Action | Scope & Access |
|---|---|---|---|
| **Laptop 1** | Customer A | `alex@gmail.com` / `password123` | High Trust (85/100). Storefront, cart, instant refunds. |
| **Laptop 2** | Customer B | `sarah.c@gmail.com` / `password123` | High Trust (95/100). Storefront & Flash deals marketplace. |
| **Laptop 3** | Customer C | `david.k@gmail.com` / `password123` | Risk User (45/100). Red-flagged account, manual admin review. |
| **Laptop 4** | Support Team | `support@trustbite.ai` / `password123` | Support Command Center ONLY. Real-time fraud telemetry. |

> **Role Isolation Rule**: Customer users can never view support dashboard controls. Support accounts automatically land directly on the Support Dashboard.

---

## 🗄️ MongoDB Atlas Schema & Collections

When `MONGODB_URI` is set in environment variables, the backend connects directly to MongoDB Atlas. If unconfigured, it gracefully runs using an in-memory database adapter for zero-setup local execution.

### Collections:
1. **Users**: `name`, `email`, `passwordHash`, `role` (`customer` | `support`), `trustScore`, `flagStatus` (`GREEN` | `YELLOW` | `RED`), `profilePicture`, `refundPrivilegesSuspended`, `createdAt`.
2. **Orders**: `customerId`, `restaurantId`, `items`, `subtotal`, `deliveryFee`, `total`, `status`, `dispatchEvidence` (packagingPhoto, billPhoto, timestamp, notes).
3. **RefundRequests**: `orderId`, `customerId`, `reason`, `complaintPhoto`, `status`, `amount`, `aiAnalysis` (fraudProbability, confidenceScore, visualDifferenceNotes).
4. **TrustScores**: Historical audit logs tracking every point adjustment and Gemini reasoning.
5. **Notifications**: Real-time Socket.IO alert feed for Support Team.
6. **Employees**: Delivery partner trust scores, ratings, vehicle details, complaint counts, warning/suspension statuses.
7. **FlashDeals**: Flash marketplace items for zero-waste surplus order redistribution.
8. **Restaurants**: Restaurant catalog, menu items, and dispatch evidence history.

---

## ⚡ Real-Time Socket.IO WebSockets

Whenever a user places an order, requests a refund, or gets flagged, Socket.IO broadcasts events globally across all connected laptops without requiring page refreshes:
- `order_created`: Broadcasts new orders to Support & Restaurant hubs.
- `order_updated`: Synchronizes dispatch evidence uploads.
- `refund_submitted`: Sends new claims to Gemini AI and alerts Support Dashboard instantly.
- `refund_updated`: Pushes admin decisions back to customer laptops.
- `trust_updated`: Updates trust score gauges and timeline charts in real time.
- `notification_created`: Emits high-priority red flag alerts to Laptop 4.
- `employee_updated`: Syncs delivery partner warning and suspension states.

---

## 🛠️ Deployment Instructions

### 1. Database Setup (MongoDB Atlas)
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user and whitelist IP `0.0.0.0/0`.
3. Copy your Connection String (`mongodb+srv://...`).

### 2. Backend Deployment (Railway or Render)
1. Fork / push codebase to GitHub.
2. Create a new service on [Railway.app](https://railway.app/).
3. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas URI.
   - `JWT_SECRET`: Random secure string.
   - `GEMINI_API_KEY`: Google Gemini API key.
4. Set Build Command: `npm run build`
5. Set Start Command: `npm run start`

### 3. Frontend Deployment (Vercel)
1. Connect GitHub repository to [Vercel](https://vercel.com/).
2. Framework Preset: **Vite**
3. Deploy!

---

## 📋 Git Commit Strategy & Roadmap

```bash
# Stage 1: Full-stack Express & MongoDB Architecture Setup
git commit -m "feat(server): setup express, mongodb atlas schemas, and JWT auth"

# Stage 2: Socket.IO Realtime Engine
git commit -m "feat(realtime): integrate socket.io websockets for multi-laptop sync"

# Stage 3: Multi-Laptop Role Routing & Customer Profiles
git commit -m "feat(auth): add role-based routing, customer profiles, and seeded support account"

# Stage 4: Support Command Center & Employee Trust System
git commit -m "feat(support): add live fraud telemetry, red flag controls, and delivery partner trust"

# Stage 5: Production Deployment Configs
git commit -m "docs: add deployment guidelines, .env.example, and architecture documentation"
```
=======
# TrustBiteAI
App that deals with user false claim over product and provide an analytical data to the team.
>>>>>>> 5765e2fb5eaa2e256fd7c55a0e13890d0564f8cb
