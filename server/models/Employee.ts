import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'delivery_partner' | 'support_agent';
  vehicleType: string;
  vehiclePlate: string;
  trustScore: number;
  totalDeliveries: number;
  rating: number; // 1-5
  negativeRatingsCount: number;
  status: 'active' | 'warned' | 'suspended';
  flagStatus: 'GREEN' | 'YELLOW' | 'RED';
  photo: string;
  createdAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  role: { type: String, default: 'delivery_partner' },
  vehicleType: { type: String, default: 'E-Bike' },
  vehiclePlate: { type: String, default: 'EV-8820' },
  trustScore: { type: Number, default: 92 },
  totalDeliveries: { type: Number, default: 142 },
  rating: { type: Number, default: 4.8 },
  negativeRatingsCount: { type: Number, default: 1 },
  status: { type: String, enum: ['active', 'warned', 'suspended'], default: 'active' },
  flagStatus: { type: String, enum: ['GREEN', 'YELLOW', 'RED'], default: 'GREEN' },
  photo: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  createdAt: { type: Date, default: Date.now }
});

export const EmployeeModel = mongoose.models.Employee || mongoose.model<IEmployee>('Employee', EmployeeSchema);
