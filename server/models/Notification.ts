import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  id: string;
  type: 'RED_FLAG' | 'SUSPICIOUS_REFUND' | 'EMPLOYEE_RISK' | 'HIGH_TRUST_REFUND';
  title: string;
  message: string;
  targetId: string; // userId, orderId, or employeeId
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetId: { type: String, required: true },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export const NotificationModel = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
