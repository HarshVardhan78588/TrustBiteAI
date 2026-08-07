import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'support' | 'admin';
  trustScore: number;
  flagStatus: 'GREEN' | 'YELLOW' | 'RED';
  profilePicture: string;
  totalOrders: number;
  approvedRefunds: number;
  rejectedRefunds: number;
  address?: string;
  refundPrivilegesSuspended?: boolean;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['customer', 'support', 'admin'], default: 'customer' },
  trustScore: { type: Number, default: 85, min: 0, max: 100 },
  flagStatus: { type: String, enum: ['GREEN', 'YELLOW', 'RED'], default: 'GREEN' },
  profilePicture: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  totalOrders: { type: Number, default: 0 },
  approvedRefunds: { type: Number, default: 0 },
  rejectedRefunds: { type: Number, default: 0 },
  address: { type: String, default: '122 Tech Park, Suite 402, San Francisco, CA' },
  refundPrivilegesSuspended: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
