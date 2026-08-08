import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  id: string;
  customerId: string;
  customerName: string;
  customerTrustScore: number;
  restaurantId: string;
  restaurantName: string;
  items: Array<{
    menuItem: any;
    quantity: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: 'placed' | 'preparing' | 'dispatched' | 'delivered' | 'canceled' | 'flash_listed';
  createdAt: Date;
  dispatchEvidence?: {
    packagingPhoto: string;
    billPhoto: string;
    timestamp: string;
    notes?: string;
  };
  refundRequestId?: string;
  isFlashDeal?: boolean;
}

const OrderSchema = new Schema<IOrder>({
  id: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerTrustScore: { type: Number, required: true },
  restaurantId: { type: String, required: true },
  restaurantName: { type: String, required: true },
  items: { type: Schema.Types.Mixed, required: true },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, default: 3.50 },
  total: { type: Number, required: true },
  status: { type: String, default: 'placed' },
  createdAt: { type: Date, default: Date.now },
  dispatchEvidence: {
    packagingPhoto: String,
    billPhoto: String,
    timestamp: String,
    notes: String
  },
  refundRequestId: String,
  isFlashDeal: { type: Boolean, default: false }
});

export const OrderModel = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema, 'orders');
