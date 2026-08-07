import mongoose, { Schema, Document } from 'mongoose';

export interface ITrustScoreLog extends Document {
  id: string;
  userId: string;
  userName: string;
  previousScore: number;
  newScore: number;
  delta: number;
  reason: string;
  event: string;
  timestamp: Date;
}

const TrustScoreSchema = new Schema<ITrustScoreLog>({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  previousScore: { type: Number, required: true },
  newScore: { type: Number, required: true },
  delta: { type: Number, required: true },
  reason: { type: String, required: true },
  event: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export const TrustScoreModel = mongoose.models.TrustScore || mongoose.model<ITrustScoreLog>('TrustScore', TrustScoreSchema);
