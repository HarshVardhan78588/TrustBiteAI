import mongoose, { Schema, Document } from 'mongoose';

export interface IRefundRequest extends Document {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerTrustScore: number;
  restaurantId: string;
  restaurantName: string;
  reason: string;
  complaintPhoto: string;
  customerNotes?: string;
  status: 'pending_ai' | 'approved_auto' | 'pending_admin' | 'approved_admin' | 'rejected_admin';
  amount: number;
  submittedAt: Date;
  aiAnalysis?: {
    confidenceScore: number;
    fraudProbability: number;
    imageMatch: boolean;
    itemDiscrepancyDetected: boolean;
    receiptValid: boolean;
    visualDifferenceNotes: string;
    reasoning: string;
    recommendedAction: 'INSTANT_REFUND' | 'ADMIN_REVIEW' | 'REJECT';
    evaluatedAt: string;
  };
  adminDecisionNotes?: string;
  processedAt?: Date;
}

const RefundRequestSchema = new Schema<IRefundRequest>({
  id: { type: String, required: true, unique: true },
  orderId: { type: String, required: true },
  customerId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerTrustScore: { type: Number, required: true },
  restaurantId: { type: String, required: true },
  restaurantName: { type: String, required: true },
  reason: { type: String, required: true },
  complaintPhoto: { type: String, required: true },
  customerNotes: String,
  status: { type: String, required: true },
  amount: { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now },
  aiAnalysis: Schema.Types.Mixed,
  adminDecisionNotes: String,
  processedAt: Date
});

export const RefundRequestModel = mongoose.models.RefundRequest || mongoose.model<IRefundRequest>('RefundRequest', RefundRequestSchema, 'refundrequests');
