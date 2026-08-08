import mongoose, { Schema, Document } from 'mongoose';

export interface IDispatchPhoto extends Document {
  id: string;
  orderId: string;
  restaurantId: string;
  packagingPhoto: string;
  billPhoto: string;
  notes?: string;
  timestamp: Date;
}

const DispatchPhotoSchema = new Schema<IDispatchPhoto>({
  id: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  restaurantId: { type: String, required: true },
  packagingPhoto: { type: String, required: true },
  billPhoto: { type: String, required: true },
  notes: String,
  timestamp: { type: Date, default: Date.now }
});

export const DispatchPhotoModel = mongoose.models.DispatchPhoto || mongoose.model<IDispatchPhoto>('DispatchPhoto', DispatchPhotoSchema, 'dispatchphotos');
