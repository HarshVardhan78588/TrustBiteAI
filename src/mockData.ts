import { Restaurant, Order, RefundRequest, FlashDeal, DriverApplication, User } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'user_cust_1',
    name: 'User 1 (Alex)',
    email: 'user1@test.com',
    role: 'customer',
    trustScore: 92,
    flagStatus: 'GREEN',
    isFlagged: false,
    warningCount: 0,
    approvedRefunds: 1,
    rejectedRefunds: 0,
    totalOrders: 12,
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    address: '452 Park Avenue, Apt 4B, New York',
    createdAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'user_cust_2',
    name: 'User 2 (Sarah)',
    email: 'user2@test.com',
    role: 'customer',
    trustScore: 74,
    flagStatus: 'YELLOW',
    isFlagged: false,
    warningCount: 1,
    approvedRefunds: 3,
    rejectedRefunds: 1,
    totalOrders: 8,
    profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    address: '88 Broadway Street, Suite 12, New York',
    createdAt: '2026-02-01T10:30:00.000Z'
  },
  {
    id: 'user_cust_3',
    name: 'User 3 (David)',
    email: 'user3@test.com',
    role: 'customer',
    trustScore: 18,
    flagStatus: 'RED',
    isFlagged: true,
    warningCount: 4,
    approvedRefunds: 2,
    rejectedRefunds: 7,
    totalOrders: 15,
    profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    address: '102 Greenwich Ave, New York',
    createdAt: '2026-03-10T14:20:00.000Z'
  },
  {
    id: 'user_support_1',
    name: 'TrustBite Support Team',
    email: 'support@trustbite.ai',
    role: 'support',
    trustScore: 100,
    flagStatus: 'GREEN',
    isFlagged: false,
    warningCount: 0,
    approvedRefunds: 0,
    rejectedRefunds: 0,
    totalOrders: 0,
    profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    address: 'TrustBite HQ, Support Desk 4',
    createdAt: '2026-01-01T00:00:00.000Z'
  }
];

export const MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest_1',
    name: 'Artisan Pizza & Trattoria',
    rating: 4.9,
    reviewsCount: 1240,
    deliveryTime: '20-30 min',
    cuisine: ['Italian', 'Wood-fired Pizza', 'Pasta'],
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
    address: '742 Evergreen Terrace, Downtown',
    trustScore: 96,
    menu: [
      {
        id: 'm1',
        name: 'Truffle & Burrata Woodfired Pizza',
        description: 'Fresh black truffle paste, creamy burrata, mozzarella, wild mushrooms & extra virgin olive oil.',
        price: 24.99,
        category: 'Pizzas',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
        isPopular: true
      },
      {
        id: 'm2',
        name: 'Spicy Rigatoni Alla Vodka',
        description: 'Handmade rigatoni, calabrian chili vodka cream sauce, aged parmesan & basil.',
        price: 18.50,
        category: 'Pastas',
        image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281288?w=400',
        isPopular: true
      },
      {
        id: 'm3',
        name: 'Classic Tiramisu Cup',
        description: 'House espresso soaked ladyfingers, whipped mascarpone, cocoa powder.',
        price: 8.99,
        category: 'Desserts',
        image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400'
      }
    ]
  },
  {
    id: 'rest_2',
    name: 'Noodle & Spice Asian Kitchen',
    rating: 4.8,
    reviewsCount: 890,
    deliveryTime: '15-25 min',
    cuisine: ['Ramen', 'Japanese', 'Gyoza'],
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600',
    address: '109 West 14th St, Midtown',
    trustScore: 94,
    menu: [
      {
        id: 'm4',
        name: 'Tonkotsu Black Garlic Ramen',
        description: 'Rich pork broth, black garlic oil, chashu pork belly, ajitama egg, bamboo shoots.',
        price: 19.99,
        category: 'Ramen',
        image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400',
        isPopular: true
      },
      {
        id: 'm5',
        name: 'Pan-Seared Wagyu Gyoza (6pcs)',
        description: 'Crispy bottom dumplings filled with minced Wagyu beef and scallions.',
        price: 12.50,
        category: 'Appetizers',
        image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400'
      }
    ]
  },
  {
    id: 'rest_3',
    name: 'Green & Gold Superfood Bowls',
    rating: 4.7,
    reviewsCount: 560,
    deliveryTime: '10-20 min',
    cuisine: ['Healthy', 'Salads', 'Smoothies'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
    address: '350 Hudson St, SoHo',
    trustScore: 98,
    menu: [
      {
        id: 'm6',
        name: 'Avocado Wild Salmon Grain Bowl',
        description: 'Seared wild salmon, quinoa, avocado, edamame, citrus tahini dressing.',
        price: 21.00,
        category: 'Bowls',
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
        isPopular: true
      }
    ]
  }
];

export const SAMPLE_DISPATCH_PHOTOS = {
  intactBox: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?w=600',
  neatReceipt: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=600',
  sealedBag: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600'
};

export const SAMPLE_COMPLAINT_PHOTOS = {
  spilledSoup: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600',
  missingItem: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600',
  wrongPizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600'
};

export const MOCK_ORDERS: Order[] = [
  {
    id: 'TB-8921',
    customerId: 'user_cust_1',
    customerName: 'User 1 (Alex)',
    customerTrustScore: 92,
    restaurantId: 'rest_1',
    restaurantName: 'Artisan Pizza & Trattoria',
    items: [
      {
        menuItem: MOCK_RESTAURANTS[0].menu[0],
        quantity: 1
      },
      {
        menuItem: MOCK_RESTAURANTS[0].menu[2],
        quantity: 1
      }
    ],
    subtotal: 33.98,
    deliveryFee: 3.50,
    total: 37.48,
    status: 'delivered',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    dispatchEvidence: {
      packagingPhoto: SAMPLE_DISPATCH_PHOTOS.sealedBag,
      billPhoto: SAMPLE_DISPATCH_PHOTOS.neatReceipt,
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      notes: 'Double sealed tamper-proof bag with heated thermal wrap.'
    }
  },
  {
    id: 'TB-8924',
    customerId: 'user_cust_2',
    customerName: 'User 2 (Sarah)',
    customerTrustScore: 74,
    restaurantId: 'rest_2',
    restaurantName: 'Noodle & Spice Asian Kitchen',
    items: [
      {
        menuItem: MOCK_RESTAURANTS[1].menu[0],
        quantity: 2
      }
    ],
    subtotal: 39.98,
    deliveryFee: 2.99,
    total: 42.97,
    status: 'delivered',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    dispatchEvidence: {
      packagingPhoto: SAMPLE_DISPATCH_PHOTOS.intactBox,
      billPhoto: SAMPLE_DISPATCH_PHOTOS.neatReceipt,
      timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      notes: 'Verified ramen lids tightly secured with tape.'
    },
    refundRequestId: 'ref_102'
  },
  {
    id: 'TB-8929',
    customerId: 'user_cust_3',
    customerName: 'User 3 (David)',
    customerTrustScore: 18,
    restaurantId: 'rest_3',
    restaurantName: 'Green & Gold Superfood Bowls',
    items: [
      {
        menuItem: MOCK_RESTAURANTS[2].menu[0],
        quantity: 1
      }
    ],
    subtotal: 21.00,
    deliveryFee: 3.50,
    total: 24.50,
    status: 'delivered',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    dispatchEvidence: {
      packagingPhoto: SAMPLE_DISPATCH_PHOTOS.sealedBag,
      billPhoto: SAMPLE_DISPATCH_PHOTOS.neatReceipt,
      timestamp: new Date(Date.now() - 105 * 60 * 1000).toISOString(),
      notes: 'Dispatched in insulated cooler box.'
    },
    refundRequestId: 'ref_103'
  }
];

export const MOCK_REFUNDS: RefundRequest[] = [
  {
    id: 'ref_102',
    orderId: 'TB-8924',
    customerId: 'user_cust_2',
    customerName: 'User 2 (Sarah)',
    customerTrustScore: 74,
    restaurantId: 'rest_2',
    restaurantName: 'Noodle & Spice Asian Kitchen',
    reason: 'Spilled soup and damaged packaging during transit',
    complaintPhoto: SAMPLE_COMPLAINT_PHOTOS.spilledSoup,
    customerNotes: 'The broth leaked all over the bag and soaked the noodles completely.',
    status: 'pending_admin',
    amount: 42.97,
    submittedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    aiAnalysis: {
      confidenceScore: 68,
      fraudProbability: 58,
      imageMatch: true,
      itemDiscrepancyDetected: false,
      receiptValid: true,
      visualDifferenceNotes: 'Complaint photo shows liquid spill on container lid. Merchant photo shows clean sealed lid.',
      reasoning: 'Visual evidence indicates spill damage. Requires support team review.',
      recommendedAction: 'ADMIN_REVIEW',
      evaluatedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString()
    }
  },
  {
    id: 'ref_103',
    orderId: 'TB-8929',
    customerId: 'user_cust_3',
    customerName: 'User 3 (David)',
    customerTrustScore: 18,
    restaurantId: 'rest_3',
    restaurantName: 'Green & Gold Superfood Bowls',
    reason: 'Claimed missing items in bowl order',
    complaintPhoto: SAMPLE_COMPLAINT_PHOTOS.missingItem,
    customerNotes: 'Avocado and salmon were missing from the grain bowl.',
    status: 'pending_admin',
    amount: 24.50,
    submittedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    aiAnalysis: {
      confidenceScore: 35,
      fraudProbability: 82,
      imageMatch: false,
      itemDiscrepancyDetected: true,
      receiptValid: true,
      visualDifferenceNotes: 'Merchant photo clearly shows complete sealed bowl. Customer trust score is 18/100 (Red Flagged).',
      reasoning: 'Low image similarity match and flagged risk profile. Instant refund disabled.',
      recommendedAction: 'ADMIN_REVIEW',
      evaluatedAt: new Date(Date.now() - 38 * 60 * 1000).toISOString()
    }
  },
  {
    id: 'ref_101',
    orderId: 'TB-8921',
    customerId: 'user_cust_1',
    customerName: 'User 1 (Alex)',
    customerTrustScore: 92,
    restaurantId: 'rest_1',
    restaurantName: 'Artisan Pizza & Trattoria',
    reason: 'Wrong item received in sealed box',
    complaintPhoto: SAMPLE_COMPLAINT_PHOTOS.wrongPizza,
    customerNotes: 'I ordered Truffle Burrata Pizza but received Pepperoni Pizza.',
    status: 'approved_auto',
    amount: 24.99,
    submittedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    aiAnalysis: {
      confidenceScore: 96,
      fraudProbability: 4,
      imageMatch: false,
      itemDiscrepancyDetected: true,
      receiptValid: true,
      visualDifferenceNotes: 'Complaint photo clearly shows cured meat toppings (pepperoni) whereas receipt specifies Truffle & Burrata. Customer holds High Trust Score (92/100).',
      reasoning: 'High visual mismatch between item delivered and receipt line item. User trust score meets instant refund threshold (>75). Approved automatically.',
      recommendedAction: 'INSTANT_REFUND',
      evaluatedAt: new Date(Date.now() - 119 * 60 * 1000).toISOString()
    },
    processedAt: new Date(Date.now() - 119 * 60 * 1000).toISOString()
  }
];

export const MOCK_FLASH_DEALS: FlashDeal[] = [
  {
    id: 'flash_1',
    orderId: 'TB-8930',
    restaurantId: 'rest_1',
    restaurantName: 'Artisan Pizza & Trattoria',
    itemsSummary: '1x Truffle Burrata Pizza + 1x Tiramisu',
    originalPrice: 33.98,
    discountedPrice: 12.99,
    discountPercentage: 62,
    expiresAt: new Date(Date.now() + 18 * 60 * 1000).toISOString(), // 18 mins remaining
    isClaimed: false,
    distanceKm: 0.8,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'
  },
  {
    id: 'flash_2',
    orderId: 'TB-8931',
    restaurantId: 'rest_2',
    restaurantName: 'Noodle & Spice Asian Kitchen',
    itemsSummary: '2x Tonkotsu Ramen + 1x Wagyu Gyoza',
    originalPrice: 52.48,
    discountedPrice: 19.50,
    discountPercentage: 63,
    expiresAt: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
    isClaimed: false,
    distanceKm: 1.2,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400'
  }
];

export const MOCK_DRIVERS: DriverApplication[] = [
  {
    id: 'drv_1',
    driverName: 'Marcus Vance',
    email: 'marcus.v@example.com',
    phone: '+1 (555) 234-5678',
    licenseNumber: 'DL-993821-NY',
    licensePhoto: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=400',
    idPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    vehicleType: 'Electric Scooter',
    vehiclePlate: 'NY-EV-481',
    status: 'verified_ai',
    aiVerification: {
      licenseValid: true,
      idMatchesName: true,
      completenessScore: 98,
      flags: [],
      reasoning: 'Driver License and Identity ID photos verified successfully. Clear face match, non-expired document, valid state plate format.'
    },
    submittedAt: new Date(Date.now() - 40 * 60 * 1000).toISOString()
  }
];
