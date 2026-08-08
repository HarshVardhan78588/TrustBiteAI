import mongoose, { Schema, Document } from 'mongoose';

export interface IRestaurant extends Document {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
  deliveryTime: string;
  cuisine: string[];
  image: string;
  address: string;
  trustScore: number;
  menu: any[];
}

const RestaurantSchema = new Schema<IRestaurant>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 1240 },
  deliveryTime: { type: String, default: '15-20 min' },
  cuisine: [String],
  image: { type: String, required: true },
  address: { type: String, required: true },
  trustScore: { type: Number, default: 98 },
  menu: Schema.Types.Mixed
});

export const RestaurantModel = mongoose.models.Restaurant || mongoose.model<IRestaurant>('Restaurant', RestaurantSchema, 'restaurants');
