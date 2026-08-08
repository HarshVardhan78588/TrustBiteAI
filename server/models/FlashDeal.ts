import mongoose, { Schema, Document } from 'mongoose';

export interface IFlashDeal extends Document {
  id: string;
  orderId: string;
  restaurantId: string;
  restaurantName: string;
  itemsSummary: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  expiresAt: Date;
  claimedBy?: string;
  isClaimed: boolean;
  distanceKm: number;
  image: string;
  createdAt: Date;
}

const FlashDealSchema = new Schema<IFlashDeal>({
  id: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  restaurantName: { type: String, required: true },
  itemsSummary: { type: String, required: true },
  originalPrice: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  discountPercentage: { type: Number, required: true },
  expiresAt: { type: Date, required: true },
  claimedBy: String,
  isClaimed: { type: Boolean, default: false },
  distanceKm: { type: Number, default: 0.8 },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const FlashDealModel = mongoose.models.FlashDeal || mongoose.model<IFlashDeal>('FlashDeal', FlashDealSchema, 'flashdeals');
